import * as React from 'react';
import {
  DataGrid,
  DataGridBody,
  DataGridRow,
  DataGridHeader,
  DataGridHeaderCell,
  DataGridCell,
  TableCellLayout,
  TableColumnDefinition,
  createTableColumn,
  FluentProvider,
  webLightTheme,
  Text,
  Link,
  Spinner,
  TableRowId
} from '@fluentui/react-components';
import { GetSampleData } from './GetSampleData';
import { format } from 'date-fns';
import { ExportToCSVUtil } from './GridExport';


// Using FluentUI v9 theme

const _LOOKUPLOGICALNAMEATTRIBUTE = "@Microsoft.Dynamics.CRM.lookuplogicalname";
const _FORMATTEDVALUE = "@OData.Community.Display.V1.FormattedValue";

// URL Placeholder is replaced with Dynamics365 Base URL (if available)
const _BASE_ENVIRONMENT_URL_PLACEHOLDER = "[BASE_ENVIRONMENT_URL]";
// URL Placeholder is replaced with record ID
const _RECORD_ID_URL_PLACEHOLDER = "[ID]";
// USE_VALUE uses the record's text value as the absolute URL
const _USE_VALUE_URL_PLACEHOLDER = "[USE_VALUE]";

// format options are here: https://date-fns.org/v2.29.3/docs/format
const _DEFAULT_DATE_FORMAT = "yyyy-MM-dd hh:mm:ss";

// Interface for FluentUI v8 style column (what we receive from JSON)
interface ILegacyColumn {
    key: string;
    fieldName: string;
    name: string;
    minWidth?: number;
    maxWidth?: number;
    data?: {
        joinValuesFromTheseFields?: string[];
        dateFormat?: string;
        entityLinking?: boolean;
        url?: string;
        urlLinkText?: string;
    };
}

// Type for the column data structure that comes from JSON parsing
interface IColumnDataStructure {
    default?: ILegacyColumn[];
    [key: string]: any;
}

export interface IDynamicDetailsListProps {
    items: any[];
    columns: IColumnDataStructure | ILegacyColumn[] | TableColumnDefinition<any>[];
    fetchXml?: string;
    rootEntityName?: string;
    announcedMessage?: string;
    baseEnvironmentUrl?: string;
}

export interface IDynamicDetailsListState {
    columns: TableColumnDefinition<any>[];
    items: any[];
    fetchXml?: string;
    primaryEntityName?: string;
    announcedMessage?: string;
    baseEnvironmentUrl?: string;
    selectedRowIds: Set<TableRowId>;
    focusedCellId?: string;
}

export class DynamicDetailsList extends React.Component<any, IDynamicDetailsListState> {
    private _allItems: any[];
    private _columns: TableColumnDefinition<any>[];
    private _pcfContext: any;
    private _primaryEntityName: string;
    private _fetchXml: string;
    private _announcedMessage: string;
    private _isDebugMode: boolean;
    private _baseEnvironmentUrl?: string;

    // Helper function to normalize column data from various formats
    private normalizeColumns(columns: any): ILegacyColumn[] {
        if (!columns) return [];
        
        // If it has a 'default' property, use that (JSON parsed structure)
        if (columns.default && Array.isArray(columns.default)) {
            return columns.default as ILegacyColumn[];
        }
        
        // If it's already an array, use it directly
        if (Array.isArray(columns)) {
            return columns as ILegacyColumn[];
        }
        
        // If it's an object with numeric keys, convert to array
        if (typeof columns === 'object' && columns.length !== undefined) {
            const result: ILegacyColumn[] = [];
            for (let i = 0; i < columns.length; i++) {
                if (columns[i]) {
                    result.push(columns[i]);
                }
            }
            return result;
        }
        
        return [];
    }

    // Convert legacy columns to FluentUI v9 TableColumnDefinition
    private convertToTableColumns(legacyColumns: ILegacyColumn[]): TableColumnDefinition<any>[] {
        return legacyColumns.map((column: ILegacyColumn) =>
            createTableColumn<any>({
                columnId: column.key || column.fieldName,
                renderHeaderCell: () => <span title={column.name}>{column.name}</span>,
                renderCell: (item: any) => this._renderItemColumn(item, undefined, column),
                compare: (a: any, b: any) => this.compareValues(a, b, column),
            })
        );
    }

    // Enhanced sorting logic that handles dates, strings, numbers, and nulls properly
    private compareValues(a: any, b: any, column: ILegacyColumn): number {
        let aValue = a[column.fieldName];
        let bValue = b[column.fieldName];

        // Handle combined fields - use the first non-null value from joinValuesFromTheseFields
        if (column.data && column.data.joinValuesFromTheseFields) {
            aValue = null;
            bValue = null;
            
            // Find first non-null value for a
            for (const fieldName of column.data.joinValuesFromTheseFields) {
                if (a[fieldName] !== null && a[fieldName] !== undefined && a[fieldName] !== '') {
                    aValue = a[fieldName];
                    break;
                }
            }
            
            // Find first non-null value for b
            for (const fieldName of column.data.joinValuesFromTheseFields) {
                if (b[fieldName] !== null && b[fieldName] !== undefined && b[fieldName] !== '') {
                    bValue = b[fieldName];
                    break;
                }
            }
        }

        // Use formatted values if available (like _Formatted fields)
        const aFormatted = a[column.key + _FORMATTEDVALUE];
        const bFormatted = b[column.key + _FORMATTEDVALUE];
        if (aFormatted !== undefined) aValue = aFormatted;
        if (bFormatted !== undefined) bValue = bFormatted;

        // Handle nulls/undefined - put them at the top like Dataverse
        if (aValue == null && bValue == null) return 0;
        if (aValue == null) return -1;
        if (bValue == null) return 1;

        // Handle empty strings - put them at the top like nulls
        if (aValue === '' && bValue === '') return 0;
        if (aValue === '') return -1;
        if (bValue === '') return 1;

        // If this column has dateFormat, treat as dates
        if (column.data?.dateFormat) {
            const aDate = new Date(aValue);
            const bDate = new Date(bValue);
            
            // Check for invalid dates
            if (isNaN(aDate.getTime()) && isNaN(bDate.getTime())) return 0;
            if (isNaN(aDate.getTime())) return 1;
            if (isNaN(bDate.getTime())) return -1;
            
            return aDate.getTime() - bDate.getTime();
        }

        // Try to parse as numbers if they look like numbers
        const aNum = parseFloat(aValue);
        const bNum = parseFloat(bValue);
        
        if (!isNaN(aNum) && !isNaN(bNum)) {
            return aNum - bNum;
        }

        // Default to string comparison (case-insensitive)
        return aValue.toString().toLowerCase().localeCompare(bValue.toString().toLowerCase());
    }

    // Handle cell click - select row and focus cell (Dataverse behavior)
    private handleCellClick = (item: any, column: ILegacyColumn, event: React.MouseEvent) => {
        const rowId = item[this._primaryEntityName + "id"] || Math.random().toString();
        const cellId = `${rowId}-${column.key}`;
        
        // Don't change selection if clicking on a checkbox
        const target = event.target as HTMLElement;
        if ((target as HTMLInputElement).type === 'checkbox' || target.closest('input[type="checkbox"]')) {
            return;
        }

        // Select only this row (clear others) - Dataverse behavior
        const newSelection = new Set<string>([rowId]);
        this.setState({
            selectedRowIds: newSelection,
            focusedCellId: cellId
        });
    }

    constructor(props: any) {
        super(props);

        this._pcfContext = props.context;
        this._primaryEntityName = props.primaryEntityName;
        this._fetchXml = props.fetchXml;
        this._allItems = props.items;
        
        // Normalize and convert columns to FluentUI v9 format
        const normalizedColumns = this.normalizeColumns(props.columns);
        this._columns = this.convertToTableColumns(normalizedColumns);
        this._isDebugMode = props.isDebugMode;
        this._baseEnvironmentUrl = props.baseD365Url;

        // Debug mode will console log all important settings including fetchXml, column layout, set debugger breakpoint
        if (this._isDebugMode) {
            console.log("DynamicDetailsList primaryEntityName", this._primaryEntityName);
            console.log("DynamicDetailsList fetchXml", this._fetchXml);
            console.log("DynamicDetailsList columnLayout", this._columns);
            debugger;  // eslint-disable-line no-debugger
        }

        // Check we actually have a query to run, otherwise try to use sample data
        // Don't bother with Web Api if we aren't actually fetching data
        // This way we can quickly see changes in the PCF Test harness and not have to endure a full deploy cycle
        // Test harness will not have FetchXml input variable available when debugging in test harness
        if (props.fetchXml && this._columns && this._columns.length > 0) {

            // Use the standard Xrm Web Api
            this._pcfContext.webAPI.retrieveMultipleRecords(this._primaryEntityName, "?fetchXml=" + encodeURIComponent(this._fetchXml)).then(
                (results: any) => {
                    if (results && results.entities && results.entities.length > 0) {
                        this._allItems = results.entities;
                        if (this._isDebugMode) {
                            console.log('webAPI.retrieveMultipleRecords : this._allItems', this._allItems);
                        }
                        this.setState(
                            {
                                items: this._allItems,
                                columns: this._columns,
                                //announcedMessage: "Actual FetchXml Response used."
                            }
                        );
                    }
                    else {
                        this._announcedMessage = "Query returned no results.";
                        this.setState({
                            announcedMessage: this._announcedMessage
                        });
                    }
                },
                (e: any) => {
                    if (this._isDebugMode) {
                        console.log(e);
                        debugger; // eslint-disable-line no-debugger
                    }
                    this.setState({
                        announcedMessage: `Error fetching records. ${e.message}`
                    });
                });
        }
        // If we don't have a query or any data, use sample data
        else if (!props.fetchXml || !props.dataItems || props.dataItems.length < 1) {
            var sampleData = GetSampleData();

            //if (this._isDebugMode) {
            //    console.log(`Sample Data`, sampleData);
            //}

            if (sampleData.dataItems && sampleData.dataItems.length > 0) {
                this._allItems = sampleData.dataItems;
                this._primaryEntityName = sampleData.primaryEntityName;
                
                // Normalize and convert sample data columns
                const normalizedColumns = this.normalizeColumns(sampleData.columns);
                this._columns = this.convertToTableColumns(normalizedColumns);

                this._announcedMessage = "Using sample data...";
                this.setState({
                    items: this._allItems,
                    columns: this._columns,
                    fetchXml: this._fetchXml,
                    announcedMessage: this._announcedMessage
                });
            }
        }
        else {
            this._announcedMessage = "Cannot connect via Xrm and no sample data found.";
        }

        this.state = {
            items: this._allItems,
            columns: this._columns,
            fetchXml: this._fetchXml,
            announcedMessage: this._announcedMessage,
            selectedRowIds: new Set<string>(),
            focusedCellId: undefined
        };
    }


    // FluentUI DetailsList documentation:
    // https://developer.microsoft.com/en-us/fluentui#/controls/web/detailslist
    // ScrollablePane is helpful to recreate the standard Model-driven app experience
    // But seems to not play super nice with the PCF Test Harness as it can overlay the fields on the left side
    public render(): JSX.Element {
        const { columns, items, announcedMessage } = this.state;
        
        if (items && columns && columns.length > 0) {
            return (
                <FluentProvider theme={webLightTheme}>
                    <div style={{ height: '100%', width: '100%', overflow: 'auto' }}>
                        {announcedMessage && (
                            <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                                <Text>{announcedMessage}</Text>
                            </div>
                        )}
                        <DataGrid
                            items={items}
                            columns={columns}
                            sortable
                            selectionMode="multiselect"
                            getRowId={(item: any) => item[this._primaryEntityName + "id"] || Math.random().toString()}
                            selectedItems={Array.from(this.state.selectedRowIds)}
                            onSelectionChange={(e, data) => {
                                // Update our state to match the selection from checkboxes
                                this.setState({ 
                                    selectedRowIds: new Set(Array.from(data.selectedItems))
                                });
                            }}
                            className="dataverse-grid"
                        >
                            <DataGridHeader>
                                <DataGridRow>
                                    {({renderHeaderCell}: any) => <DataGridHeaderCell>{renderHeaderCell()}</DataGridHeaderCell>}
                                </DataGridRow>
                            </DataGridHeader>
                            <DataGridBody>
                                {({item, rowId}: any) => (
                                    <DataGridRow 
                                        key={rowId}
                                        onDoubleClick={() => {
                                            this._pcfContext.navigation.openForm({
                                                entityName: this._primaryEntityName,
                                                entityId: (item as any)[this._primaryEntityName + "id"]
                                            });
                                        }}
                                    >
                                        {({renderCell}: any) => <DataGridCell>{renderCell(item)}</DataGridCell>}
                                    </DataGridRow>
                                )}
                            </DataGridBody>
                        </DataGrid>
                        <div style={{ marginTop: '10px', textAlign: 'left' }}>
                            <Text>Total Records: {items.length} ...  </Text>
                            <Link onClick={() => ExportToCSVUtil(items, `export.${Date.now()}.csv`)}>[ Export dataset to CSV ]</Link>
                        </div>
                    </div>
                </FluentProvider>
            );
        }
        else if (announcedMessage) {
            return (
                <FluentProvider theme={webLightTheme}>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <Text>{announcedMessage}</Text>
                    </div>
                </FluentProvider>
            );
        }
        else {
            return (
                <FluentProvider theme={webLightTheme}>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <Spinner label="Loading Grid" />
                    </div>
                </FluentProvider>
            );
        }
    }

    private _renderItemColumn = (item: any, _index: number | undefined, column: ILegacyColumn): JSX.Element => {
        let fieldContent = item[column.fieldName];
        if (item[column.key + _FORMATTEDVALUE]) {
            fieldContent = item[column.key + _FORMATTEDVALUE];
        }
        
        const rowId = item[this._primaryEntityName + "id"] || Math.random().toString();
        const cellId = `${rowId}-${column.key}`;
        const isFocused = this.state.focusedCellId === cellId;
        
        // Support joining more than one field into one table field    
        if (column.data && column.data.joinValuesFromTheseFields) {
            let finalFieldContent = fieldContent ? fieldContent : "";
            column.data.joinValuesFromTheseFields.forEach((extraFieldName: string) => {
                let extrafieldContent = item[extraFieldName];
                let delimiter = "; "; 
                if(extrafieldContent && extrafieldContent != null) {
                    finalFieldContent = finalFieldContent != "" ? `${finalFieldContent}${delimiter}${extrafieldContent}` : extrafieldContent;
                }
            });

            return (
                <TableCellLayout 
                    title={finalFieldContent?.toString() || ''}
                    tabIndex={0}
                    onClick={(e) => {
                        this.handleCellClick(item, column, e);
                        // Add focused class to the parent cell
                        const cell = (e.target as HTMLElement).closest('.fui-DataGrid__cell');
                        if (cell) {
                            // Remove focused class from all cells
                            document.querySelectorAll('.fui-DataGrid__cell.focused-cell').forEach(el => el.classList.remove('focused-cell'));
                            // Add focused class to clicked cell
                            cell.classList.add('focused-cell');
                        }
                    }}
                >
                    {this.renderItem(finalFieldContent, item, column)}
                </TableCellLayout>
            );
        }

        return (
            <TableCellLayout 
                title={fieldContent?.toString() || ''}
                tabIndex={0}
                onClick={(e) => {
                    this.handleCellClick(item, column, e);
                    // Add focused class to the parent cell
                    const cell = (e.target as HTMLElement).closest('.fui-DataGrid__cell');
                    if (cell) {
                        // Remove focused class from all cells
                        document.querySelectorAll('.fui-DataGrid__cell.focused-cell').forEach(el => el.classList.remove('focused-cell'));
                        // Add focused class to clicked cell
                        cell.classList.add('focused-cell');
                    }
                }}
            >
                {this.renderItem(fieldContent, item, column)}
            </TableCellLayout>
        );
    }

    private renderItem = (fieldContent: any, item: any, column: ILegacyColumn): any => {
        if (item[column.key] || fieldContent) {           
            // Handle any custom Date Formats via date=fns format string
            // DateFormat string options are here: https://date-fns.org/v2.29.3/docs/format
            // i.e.  "yyyy-dd-MM hh:mm:ss"
            if (column.data && column.data.dateFormat) {
                try {
                    let dateValue = new Date(fieldContent);
                    let dateFormat = column.data.dateFormat || _DEFAULT_DATE_FORMAT;
                    return (<span>{format(dateValue, dateFormat)}</span>);
                }
                catch (ex) {
                    if (this._isDebugMode) {
                        console.log(ex);
                        debugger; // eslint-disable-line no-debugger
                    }
                    // ignore error and just render as-is
                    return (<span>{fieldContent}</span>);
                }
            }

            // URL Handling
            // Absolute URL, opens in a new tab/window
            // Use the value of the field as the URL and as the Link Text
            // "data" : { "url": "[USE_VALUE]", "urlLinkText": "[USE_VALUE]" }
            // Use the value of the field as the URL, but show customized link text
            //  "data" : { "url": "[USE_VALUE]", "urlLinkText": "Custom Link Text Here" }
            // Use the value of the field as the URL and default Link Text "External Link"
            // "data" : { "url": "[USE_VALUE]" }
            if (column.data && column.data.url == _USE_VALUE_URL_PLACEHOLDER) {
                let linkText = (column.data.urlLinkText && column.data.urlLinkText == _USE_VALUE_URL_PLACEHOLDER) ? fieldContent :
                    column.data.urlLinkText && fieldContent != "" ? column.data.urlLinkText :
                        "External Link";
                return (<Link key={item} href={fieldContent} target="_blank">{linkText}</Link>);
            }
            // URL Handling (with placeholders)
            // This is one approach to link to the Dynamics365 Legacy web interface for Contracts for instance
            // [BASED365URL] is replaced with Base Dynamics365 Url
            // [ID] is replaced with the id of an entity field
            //  "data": {  "url": "[BASED365URL]/main.aspx?etc=1010&pagetype=entityrecord&id=[ID]"  }
            else if (column.data && column.data.url && column.data.url !== "") {
                let url = column.data.url
                    .replace(_BASE_ENVIRONMENT_URL_PLACEHOLDER, this._baseEnvironmentUrl || '')
                    .replace(_RECORD_ID_URL_PLACEHOLDER, item[column.key]);
                let linkText = (column.data.urlLinkText && column.data.urlLinkText == _USE_VALUE_URL_PLACEHOLDER) ? fieldContent :
                    column.data.urlLinkText && fieldContent != "" ? column.data.urlLinkText :
                        "Link";
                return (<Link key={item} href={url} target="_blank">{linkText}</Link>);
            }
            // Support navigation to entity links
            // "data" : {"entityLinking": true}
            // Test harness will give error "Your control is trying to open a form. This is not yet supported."
            else if (item[column.key + _LOOKUPLOGICALNAMEATTRIBUTE]) {
                if (column.data && column.data.entityLinking && column.data.entityLinking == true) {
                    //let baseFieldName = column.key.replace(_LOOKUPLOGICALNAMEATTRIBUTE, "");
                    return (<Link key={item} onClick={() => this._pcfContext.navigation.openForm({ entityName: item[column.key + _LOOKUPLOGICALNAMEATTRIBUTE], entityId: item[column.key] })}>
                        {fieldContent}
                    </Link>
                    );
                }
                else {
                    return (<span>{fieldContent.toString()}</span>);
                }
            }
            // Support using FormattedValue when available
            else if (item[column.key + _FORMATTEDVALUE]) {
                return (<span>{item[column.key + _FORMATTEDVALUE].toString()}</span>);
            }
            else {
                return (<span>{fieldContent.toString()}</span>);
            }
        }
    }


}