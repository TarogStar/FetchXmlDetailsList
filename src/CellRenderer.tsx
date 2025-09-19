import * as React from 'react';
import { TableCellLayout, Link } from '@fluentui/react-components';
import { format } from 'date-fns';
import { ILegacyColumn } from './types';
import {
    LOOKUPLOGICALNAMEATTRIBUTE,
    FORMATTEDVALUE,
    BASE_ENVIRONMENT_URL_PLACEHOLDER,
    RECORD_ID_URL_PLACEHOLDER,
    USE_VALUE_URL_PLACEHOLDER,
    DEFAULT_DATE_FORMAT
} from './constants';

export interface CellRendererProps {
    item: any;
    column: ILegacyColumn;
    primaryEntityName: string;
    baseEnvironmentUrl?: string;
    isDebugMode: boolean;
    pcfContext: any;
    onCellClick: (item: any, column: ILegacyColumn, event: React.MouseEvent) => void;
}

export class CellRenderer {
    private props: CellRendererProps;

    constructor(props: CellRendererProps) {
        this.props = props;
    }

    // Handle cell click - select row and focus cell (Dataverse behavior)
    private handleCellClick = (event: React.MouseEvent) => {
        const { item, column, onCellClick } = this.props;

        // Don't change selection if clicking on a checkbox
        const target = event.target as HTMLElement;
        if ((target as HTMLInputElement).type === 'checkbox' || target.closest('input[type="checkbox"]')) {
            return;
        }

        onCellClick(item, column, event);

        // Add focused class to the parent cell
        const cell = (event.target as HTMLElement).closest('.fui-DataGrid__cell');
        if (cell) {
            // Remove focused class from all cells
            document.querySelectorAll('.fui-DataGrid__cell.focused-cell').forEach(el => el.classList.remove('focused-cell'));
            // Add focused class to clicked cell
            cell.classList.add('focused-cell');
        }
    }

    renderItemColumn(): JSX.Element {
        const { item, column } = this.props;
        let fieldContent = item[column.fieldName];

        // Check for formatted value - use the actual field name for entity linking fields
        const formattedValueKey = column.fieldName + FORMATTEDVALUE;
        if (item[formattedValueKey]) {
            fieldContent = item[formattedValueKey];
        } else if (item[column.key + FORMATTEDVALUE]) {
            fieldContent = item[column.key + FORMATTEDVALUE];
        }

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
                    onClick={this.handleCellClick}
                >
                    {this.renderItem(finalFieldContent)}
                </TableCellLayout>
            );
        }

        return (
            <TableCellLayout
                title={fieldContent?.toString() || ''}
                tabIndex={0}
                onClick={this.handleCellClick}
            >
                {this.renderItem(fieldContent)}
            </TableCellLayout>
        );
    }

    private renderItem(fieldContent: any): any {
        const { item, column, baseEnvironmentUrl, isDebugMode, pcfContext } = this.props;

        if (item[column.key] || fieldContent) {
            // Handle any custom Date Formats via date=fns format string
            // DateFormat string options are here: https://date-fns.org/v2.29.3/docs/format
            // i.e.  "yyyy-dd-MM hh:mm:ss"
            if (column.data && column.data.dateFormat) {
                try {
                    let dateValue = new Date(fieldContent);
                    let dateFormat = column.data.dateFormat || DEFAULT_DATE_FORMAT;
                    return (<span>{format(dateValue, dateFormat)}</span>);
                }
                catch (ex) {
                    if (isDebugMode) {
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
            if (column.data && column.data.url == USE_VALUE_URL_PLACEHOLDER) {
                let linkText = (column.data.urlLinkText && column.data.urlLinkText == USE_VALUE_URL_PLACEHOLDER) ? fieldContent :
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
                    .replace(BASE_ENVIRONMENT_URL_PLACEHOLDER, baseEnvironmentUrl || '')
                    .replace(RECORD_ID_URL_PLACEHOLDER, item[column.key]);
                let linkText = (column.data.urlLinkText && column.data.urlLinkText == USE_VALUE_URL_PLACEHOLDER) ? fieldContent :
                    column.data.urlLinkText && fieldContent != "" ? column.data.urlLinkText :
                        "Link";
                return (<Link key={item} href={url} target="_blank">{linkText}</Link>);
            }
            // Support navigation to entity links
            // "data" : {"entityLinking": true}
            // Test harness will give error "Your control is trying to open a form. This is not yet supported."
            else if (item[column.fieldName + LOOKUPLOGICALNAMEATTRIBUTE]) {
                if (column.data && column.data.entityLinking && column.data.entityLinking == true) {
                    return (<Link key={item} onClick={() => pcfContext.navigation.openForm({ entityName: item[column.fieldName + LOOKUPLOGICALNAMEATTRIBUTE], entityId: item[column.fieldName] })}>
                        {fieldContent}
                    </Link>
                    );
                }
                else {
                    return (<span>{fieldContent?.toString() || ''}</span>);
                }
            }
            // Support using FormattedValue when available
            else if (item[column.key + FORMATTEDVALUE]) {
                return (<span>{item[column.key + FORMATTEDVALUE]?.toString() || ''}</span>);
            }
            else {
                return (<span>{fieldContent?.toString() || ''}</span>);
            }
        }

        return null;
    }
}