import * as React from 'react';
import { TableRowId } from '@fluentui/react-components';
import { IDynamicDetailsListProps, IDynamicDetailsListState, ILegacyColumn, ICustomButtonConfig } from './types';
import { DataService } from './dataService';
import { CellRenderer } from './CellRenderer';
import { DataGridWrapper } from './DataGridWrapper';
import { compareValues, normalizeColumns } from './columnUtils';
import { openCustomPage } from './utils/customPageNavigation';

export class DynamicDetailsList extends React.Component<any, IDynamicDetailsListState> {
    private _allItems: any[];
    private _pcfContext: any;
    private _primaryEntityName: string;
    private _fetchXml: string;
    private _announcedMessage?: string;
    private _isDebugMode: boolean;
    private _baseEnvironmentUrl?: string;
    private dataService: DataService;
    private _customButtonConfig?: ICustomButtonConfig;

    // Cache legacy columns for min width calculation
    private _legacyColumns: ILegacyColumn[] = [];

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

    private _renderItemColumn = (item: any, _index: number | undefined, column: ILegacyColumn): JSX.Element => {
        const cellRenderer = new CellRenderer({
            item,
            column,
            primaryEntityName: this._primaryEntityName,
            baseEnvironmentUrl: this._baseEnvironmentUrl,
            isDebugMode: this._isDebugMode,
            pcfContext: this._pcfContext,
            onCellClick: this.handleCellClick
        });

        return cellRenderer.renderItemColumn();
    }

    constructor(props: any) {
        super(props);

        this._pcfContext = props.context;
        this._primaryEntityName = props.primaryEntityName;
        this._fetchXml = props.fetchXml;
        this._allItems = props.items;
        this._isDebugMode = props.isDebugMode;
        this._baseEnvironmentUrl = props.baseD365Url;

        // Parse custom button configuration from JSON string
        if (props.CustomButtonConfig) {
            try {
                this._customButtonConfig = JSON.parse(props.CustomButtonConfig);
            } catch (error) {
                console.error('Failed to parse custom button configuration:', error);
            }
        }

        // Normalize legacy columns for later width calculation
        try {
            this._legacyColumns = normalizeColumns(props.columns);
        } catch {
            this._legacyColumns = [];
        }

        this.dataService = new DataService(this._pcfContext, this._isDebugMode);

        this.state = {
            items: this._allItems || [],
            columns: [],
            fetchXml: this._fetchXml,
            primaryEntityName: this._primaryEntityName,
            announcedMessage: undefined,
            selectedRowIds: new Set<string>(),
            focusedCellId: undefined
        };

        // Initialize data loading
        this.loadData();
    }

    private async loadData() {
        try {
            const result = await this.dataService.fetchData(
                this._fetchXml,
                this._primaryEntityName,
                this.props.columns,
                this._renderItemColumn,
                compareValues,
                this.props.dataItems
            );

            this._allItems = result.items;
            this._primaryEntityName = result.primaryEntityName;
            this._announcedMessage = result.announcedMessage;

            this.setState({
                items: result.items,
                columns: result.columns,
                primaryEntityName: result.primaryEntityName,
                announcedMessage: result.announcedMessage
            });
        } catch (error) {
            console.error('Error loading data:', error);
            this.setState({
                announcedMessage: 'Error loading data'
            });
        }
    }


    private handleRefresh = () => {
        this.loadData();
    }

    private handleCustomButtonClick = async () => {
        if (this._customButtonConfig) {
            try {
                // Use the record ID that's already passed from the main component
                const recordId = this.props.recordId;
                const selectedRowIds = Array.from(this.state.selectedRowIds || []);
                const selectedRecords = this.state.items.filter((item: any) => {
                    const rowId = item[this._primaryEntityName + "id"];
                    return rowId && selectedRowIds.includes(rowId);
                });

                const customButtonData = {
                    parentRecordId: recordId,
                    selectedRowIds,
                    selectedRecords
                };

                await openCustomPage(this._customButtonConfig, this._pcfContext, recordId, customButtonData);
            } catch (error) {
                console.error('Failed to open custom page:', error);
            }
        }
    }

    // Compute total minimum width for horizontal scrolling
    private getTotalMinWidth(): number {
        if (!this._legacyColumns || this._legacyColumns.length === 0) return 0;
        return this._legacyColumns.reduce((sum, col) => sum + (col.minWidth || 50), 0);
    }

    public render(): JSX.Element {
        return (
            <DataGridWrapper
                state={this.state}
                primaryEntityName={this._primaryEntityName}
                pcfContext={this._pcfContext}
                onSelectionChange={(selectedItems) => {
                    this.setState({
                        selectedRowIds: selectedItems
                    });
                }}
                onRefresh={this.handleRefresh}
                customButtonConfig={this._customButtonConfig}
                onCustomButtonClick={this.handleCustomButtonClick}
                minTableWidth={this.getTotalMinWidth()}
                hideNewButton={this.props.hideNewButton}
                hideRefreshButton={this.props.hideRefreshButton}
                hideExportButton={this.props.hideExportButton}
            />
        );
    }

}