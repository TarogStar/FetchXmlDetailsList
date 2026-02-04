import { TableColumnDefinition } from '@fluentui/react-components';
import { GetSampleData } from './GetSampleData';
import { normalizeColumns, convertToTableColumns } from './columnUtils';
import { ILegacyColumn } from './types';

export interface DataServiceResult {
    items: any[];
    columns: TableColumnDefinition<any>[];
    primaryEntityName: string;
    announcedMessage?: string;
}

export class DataService {
    private pcfContext: any;
    private isDebugMode: boolean;

    constructor(pcfContext: any, isDebugMode: boolean = false) {
        this.pcfContext = pcfContext;
        this.isDebugMode = isDebugMode;
    }

    async fetchData(
        fetchXml: string,
        primaryEntityName: string,
        columns: any,
        renderItemColumn: (item: any, index: number | undefined, column: ILegacyColumn) => JSX.Element,
        compareValues: (a: any, b: any, column: ILegacyColumn) => number,
        dataItems?: any[]
    ): Promise<DataServiceResult> {
        // Normalize and convert columns to FluentUI v9 format
        const normalizedColumns = normalizeColumns(columns);
        const tableColumns = convertToTableColumns(normalizedColumns, renderItemColumn, compareValues);

        const isAuthoringMode = !!this.pcfContext?.mode?.isAuthoring;

        if (this.isDebugMode) {
            console.log("DataService primaryEntityName", primaryEntityName);
            console.log("DataService fetchXml", fetchXml);
            console.log("DataService columnLayout", tableColumns);
            debugger;  // eslint-disable-line no-debugger
        }

        if (isAuthoringMode) {
            const sampleData = GetSampleData();

            if (sampleData.dataItems && sampleData.dataItems.length > 0) {
                const sampleNormalizedColumns = normalizeColumns(sampleData.columns);
                const sampleTableColumns = convertToTableColumns(sampleNormalizedColumns, renderItemColumn, compareValues);

                return {
                    items: sampleData.dataItems,
                    columns: sampleTableColumns,
                    primaryEntityName: sampleData.primaryEntityName,
                    announcedMessage: "Authoring mode: using sample data."
                };
            }

            return {
                items: [],
                columns: tableColumns,
                primaryEntityName,
                announcedMessage: "Authoring mode: no sample data found."
            };
        }

        // Check we actually have a query to run, otherwise try to use sample data
        if (fetchXml && tableColumns && tableColumns.length > 0) {
            try {
                const results = await this.pcfContext.webAPI.retrieveMultipleRecords(
                    primaryEntityName,
                    "?fetchXml=" + encodeURIComponent(fetchXml)
                );

                if (results && results.entities && results.entities.length > 0) {
                    if (this.isDebugMode) {
                        console.log('webAPI.retrieveMultipleRecords : results.entities', results.entities);
                    }
                    return {
                        items: results.entities,
                        columns: tableColumns,
                        primaryEntityName,
                        announcedMessage: undefined
                    };
                } else {
                    return {
                        items: [],
                        columns: tableColumns,
                        primaryEntityName,
                        announcedMessage: "Query returned no results."
                    };
                }
            } catch (error: any) {
                if (this.isDebugMode) {
                    console.log(error);
                    debugger; // eslint-disable-line no-debugger
                }
                return {
                    items: [],
                    columns: tableColumns,
                    primaryEntityName,
                    announcedMessage: `Error fetching records. ${error.message}`
                };
            }
        }
        // If we don't have a query or any data, use sample data
        else if (!fetchXml || !dataItems || dataItems.length < 1) {
            const sampleData = GetSampleData();

            if (sampleData.dataItems && sampleData.dataItems.length > 0) {
                // Normalize and convert sample data columns
                const sampleNormalizedColumns = normalizeColumns(sampleData.columns);
                const sampleTableColumns = convertToTableColumns(sampleNormalizedColumns, renderItemColumn, compareValues);

                return {
                    items: sampleData.dataItems,
                    columns: sampleTableColumns,
                    primaryEntityName: sampleData.primaryEntityName,
                    announcedMessage: "Using sample data..."
                };
            }
        }

        return {
            items: [],
            columns: tableColumns,
            primaryEntityName,
            announcedMessage: "Cannot connect via Xrm and no sample data found."
        };
    }
}