import * as React from 'react';
import {
    DataGrid,
    DataGridBody,
    DataGridRow,
    DataGridHeader,
    DataGridHeaderCell,
    DataGridCell,
    FluentProvider,
    webLightTheme,
    Text,
    Link,
    Spinner,
    TableRowId
} from '@fluentui/react-components';
import { IDynamicDetailsListState, ICustomButtonConfig, ILegacyColumn } from './types';
import { CommandBar } from './CommandBar';

export interface DataGridWrapperProps {
    state: IDynamicDetailsListState;
    primaryEntityName: string;
    pcfContext: any;
    onSelectionChange: (selectedItems: Set<TableRowId>) => void;
    onRefresh: () => void;
    customButtonConfig?: ICustomButtonConfig;
    onCustomButtonClick?: () => void;
    minTableWidth?: number;
    legacyColumns?: ILegacyColumn[];
    hideNewButton?: boolean;
    hideRefreshButton?: boolean;
    hideExportButton?: boolean;
    hideBulkEditButton?: boolean;
}

export const DataGridWrapper: React.FC<DataGridWrapperProps> = ({
    state,
    primaryEntityName,
    pcfContext,
    onSelectionChange,
    onRefresh,
    customButtonConfig,
    onCustomButtonClick,
    minTableWidth,
    legacyColumns,
    hideNewButton,
    hideRefreshButton,
    hideExportButton,
    hideBulkEditButton
}) => {
    const { columns, announcedMessage } = state;
    // Filter to only items with a valid row ID to prevent undefined keys in selection
    const items = (state.items || []).filter(
        (item: any) => item?.__rowId || item?.[primaryEntityName + 'id']
    );

    if (items.length > 0 && columns && columns.length > 0) {
        return (
            <FluentProvider theme={webLightTheme} className="fluent-root">
                <div className="full-size container">
                    <CommandBar
                        primaryEntityName={primaryEntityName}
                        pcfContext={pcfContext}
                        items={items}
                        selectedItems={state.selectedRowIds}
                        onRefresh={onRefresh}
                        customButtonConfig={customButtonConfig}
                        onCustomButtonClick={onCustomButtonClick}
                        legacyColumns={legacyColumns}
                        hideNewButton={hideNewButton}
                        hideRefreshButton={hideRefreshButton}
                        hideExportButton={hideExportButton}
                        hideBulkEditButton={hideBulkEditButton}
                    />

                    <div className="gridContainer">
                        {announcedMessage && (
                            <div className="announcement-bar">
                                <Text>{announcedMessage}</Text>
                            </div>
                        )}
                        <div className="grid-scroll">
                            <DataGrid
                                items={items}
                                columns={columns}
                                sortable
                                selectionMode="multiselect"
                                getRowId={(item: any) => item.__rowId || item[primaryEntityName + 'id']}
                                selectedItems={Array.from(state.selectedRowIds)}
                                onSelectionChange={(_, data) => {
                                    onSelectionChange(new Set(Array.from(data.selectedItems)));
                                }}
                                className="dataverse-grid"
                                style={{ minWidth: minTableWidth ? `${minTableWidth}px` : undefined }}
                            >
                                <DataGridHeader>
                                    <DataGridRow>
                                        {(column: any) => (
                                            <DataGridHeaderCell key={column.columnId}>{column.renderHeaderCell()}</DataGridHeaderCell>
                                        )}
                                    </DataGridRow>
                                </DataGridHeader>
                                <DataGridBody>
                                    {({ item, rowId }: any) => (
                                        <DataGridRow
                                            key={rowId}
                                            onClick={(e: React.MouseEvent) => {
                                                if (e.detail === 2) {
                                                    e.stopPropagation();
                                                    const id = (item as any)[primaryEntityName + 'id'];
                                                    if (id) {
                                                        pcfContext.navigation.openForm({
                                                            entityName: primaryEntityName,
                                                            entityId: id
                                                        });
                                                    }
                                                }
                                            }}
                                            onKeyDown={(e: React.KeyboardEvent) => {
                                                if (e.key === 'Enter') {
                                                    const id = (item as any)[primaryEntityName + 'id'];
                                                    if (id) {
                                                        pcfContext.navigation.openForm({
                                                            entityName: primaryEntityName,
                                                            entityId: id
                                                        });
                                                    }
                                                }
                                            }}
                                        >
                                            {(column: any) => (
                                                <DataGridCell key={`${rowId}-${column.columnId}`}>
                                                    {column.renderCell(item)}
                                                </DataGridCell>
                                            )}
                                        </DataGridRow>
                                    )}
                                </DataGridBody>
                            </DataGrid>
                        </div>
                        <div className="grid-footer">
                            <Text>Rows: {items.length}</Text>
                        </div>
                    </div>
                </div>
            </FluentProvider>
        );
    }
    else if (announcedMessage) {
        return (
            <FluentProvider theme={webLightTheme} className="fluent-root">
                <div className="container" style={{ justifyContent: 'center', alignItems: 'center' }}>
                    <Text>{announcedMessage}</Text>
                </div>
            </FluentProvider>
        );
    }
    else {
        return (
            <FluentProvider theme={webLightTheme} className="fluent-root">
                <div className="container" style={{ justifyContent: 'center', alignItems: 'center' }}>
                    <Spinner label="Loading Grid" />
                </div>
            </FluentProvider>
        );
    }
};