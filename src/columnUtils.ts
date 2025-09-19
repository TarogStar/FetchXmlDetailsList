import * as React from 'react';
import { TableColumnDefinition, createTableColumn } from '@fluentui/react-components';
import { ILegacyColumn } from './types';
import { FORMATTEDVALUE } from './constants';

// Helper function to normalize column data from various formats
export function normalizeColumns(columns: any): ILegacyColumn[] {
    if (!columns) return [];

    let normalizedColumns: ILegacyColumn[] = [];

    // If it has a 'default' property, use that (JSON parsed structure)
    if (columns.default && Array.isArray(columns.default)) {
        normalizedColumns = columns.default as ILegacyColumn[];
    }
    // If it's already an array, use it directly
    else if (Array.isArray(columns)) {
        normalizedColumns = columns as ILegacyColumn[];
    }
    // If it's an object with numeric keys, convert to array
    else if (typeof columns === 'object' && columns.length !== undefined) {
        const result: ILegacyColumn[] = [];
        for (let i = 0; i < columns.length; i++) {
            if (columns[i]) {
                result.push(columns[i]);
            }
        }
        normalizedColumns = result;
    }

    // Convert field names for entity linking fields to Web API format
    return normalizedColumns.map(column => {
        if (column.data?.entityLinking === true) {
            // If it doesn't already follow Web API pattern (_fieldname_value), convert it
            if (!column.fieldName.startsWith('_') || !column.fieldName.endsWith('_value')) {
                return {
                    ...column,
                    fieldName: `_${column.fieldName}_value`
                };
            }
        }
        return column;
    });
}

// Convert legacy columns to FluentUI v9 TableColumnDefinition
export function convertToTableColumns(
    legacyColumns: ILegacyColumn[],
    renderItemColumn: (item: any, index: number | undefined, column: ILegacyColumn) => JSX.Element,
    compareValues: (a: any, b: any, column: ILegacyColumn) => number
): TableColumnDefinition<any>[] {
    return legacyColumns.map((column: ILegacyColumn) =>
        createTableColumn<any>({
            columnId: column.key || column.fieldName,
            renderHeaderCell: () => React.createElement('span', {
                title: column.name,
                style: { fontWeight: 'bold' }
            }, column.name),
            renderCell: (item: any) => renderItemColumn(item, undefined, column),
            compare: (a: any, b: any) => compareValues(a, b, column),
        })
    );
}

// Enhanced sorting logic that handles dates, strings, numbers, and nulls properly
export function compareValues(a: any, b: any, column: ILegacyColumn): number {
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
    const aFormatted = a[column.key + FORMATTEDVALUE];
    const bFormatted = b[column.key + FORMATTEDVALUE];
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