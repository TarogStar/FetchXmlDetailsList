// Copyright (c) Microsoft Corporation.
// Borrowed from https://github.com/microsoft/FluentUIEditableDetailsList/blob/main/src/libs/editablegrid/gridexportutil.tsx
// Licensed under the MIT License.

import { ILegacyColumn } from './types';
import { FORMATTEDVALUE } from './constants';

export const ExportToCSVUtil = (exportData: any[], fileName: string, columns?: ILegacyColumn[]): void => {
    if (!exportData || !exportData.length) {
        return;
    }
    const separator = ',';

    // Build export keys from column definitions when available
    let headers: string[];
    let keyMap: { header: string; key: string }[];

    if (columns && columns.length > 0) {
        keyMap = [];
        for (const col of columns) {
            // Always include the primary field
            keyMap.push({ header: col.name, key: col.fieldName });
            // Include the OData formatted value if any row has it
            const formattedKey = col.fieldName + FORMATTEDVALUE;
            if (exportData.some(row => row[formattedKey] !== undefined)) {
                keyMap.push({ header: `${col.name} (Formatted)`, key: formattedKey });
            }
        }
        headers = keyMap.map(k => k.header);
    } else {
        // Fallback: export all keys except internal metadata
        const allKeys = Object.keys(exportData[0]).filter(
            k => !k.startsWith('@') && k !== '__rowId'
        );
        keyMap = allKeys.map(k => ({ header: k, key: k }));
        headers = allKeys;
    }

    const escapeCell = (value: any): string => {
        let cell = value === null || value === undefined ? '' : value;
        cell = cell instanceof Date
            ? cell.toLocaleString()
            : cell.toString().replace(/"/g, '""');
        if (cell.search(/("|,|\n)/g) >= 0) {
            cell = `"${cell}"`;
        }
        return cell;
    };

    const csvContent = headers.map(h => escapeCell(h)).join(separator) + '\n' +
        exportData.map(row => {
            return keyMap.map(k => escapeCell(row[k.key])).join(separator);
        }).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', fileName);
        link.style.visibility = 'hidden';
        link.dataset.interception = 'off';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}
