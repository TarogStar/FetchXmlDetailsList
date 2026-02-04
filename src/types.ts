import { TableColumnDefinition, TableRowId } from '@fluentui/react-components';

// Interface for FluentUI v8 style column (what we receive from JSON)
export interface ILegacyColumn {
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
export interface IColumnDataStructure {
    default?: ILegacyColumn[];
    [key: string]: any;
}

// Configuration for custom ribbon button
export interface ICustomButtonConfig {
    buttonText: string;
    functionName: string;
    customPageName: string;
    webResourceName?: string; // Web resource containing the function (e.g., "gli_projectribbon.js")
    dialogTitle?: string;
    dialogWidth?: number;
    dialogHeight?: number;
    showWhenSelectedMin?: number;
    showWhenSelectedMax?: number;
}

export interface IDynamicDetailsListProps {
    items: any[];
    columns: IColumnDataStructure | ILegacyColumn[] | TableColumnDefinition<any>[];
    fetchXml?: string;
    rootEntityName?: string;
    announcedMessage?: string;
    baseEnvironmentUrl?: string;
    context?: any;
    primaryEntityName?: string;
    isDebugMode?: boolean;
    baseD365Url?: string;
    dataItems?: any[];
    CustomButtonConfig?: string; // JSON string containing ICustomButtonConfig
    hideNewButton?: boolean;
    hideRefreshButton?: boolean;
    hideExportButton?: boolean;
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