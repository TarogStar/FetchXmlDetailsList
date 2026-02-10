import * as React from 'react';
import {
    Toolbar,
    ToolbarButton,
    ToolbarDivider,
    Menu,
    MenuTrigger,
    MenuPopover,
    MenuList,
    MenuItem
} from '@fluentui/react-components';
import { ExportToCSVUtil } from './GridExport';
import { TableRowId } from '@fluentui/react-components';
import { AddIcon, RefreshIcon, DownloadIcon, MoreIcon } from './icons/CustomIcons';
import { ICustomButtonConfig, ILegacyColumn } from './types';

export interface CommandBarProps {
    primaryEntityName: string;
    pcfContext: any;
    items: any[];
    selectedItems: Set<TableRowId>;
    onRefresh: () => void;
    customButtonConfig?: ICustomButtonConfig;
    onCustomButtonClick?: () => void;
    legacyColumns?: ILegacyColumn[];
    hideNewButton?: boolean;
    hideRefreshButton?: boolean;
    hideExportButton?: boolean;
    hideBulkEditButton?: boolean;
}

export const CommandBar: React.FC<CommandBarProps> = ({
    primaryEntityName,
    pcfContext,
    items,
    selectedItems,
    onRefresh,
    customButtonConfig,
    onCustomButtonClick,
    legacyColumns,
    hideNewButton,
    hideRefreshButton,
    hideExportButton,
    hideBulkEditButton
}) => {
    const [entityDisplayName, setEntityDisplayName] = React.useState<string>(() => {
        // Fallback formatting before metadata is loaded
        return primaryEntityName
            ? primaryEntityName.replace(/^.+?_/, '') // crude attempt to drop publisher prefix if present
                  .replace(/_/g, ' ') // spaces instead of underscores
                  .replace(/\b\w/g, c => c.toUpperCase())
            : '';
    });

    // Load real display name from metadata
    React.useEffect(() => {
        let cancelled = false;
        async function loadMetadata() {
            try {
                const utils = pcfContext?.utils;
                if (utils?.getEntityMetadata && primaryEntityName) {
                    const meta = await utils.getEntityMetadata(primaryEntityName, []);
                    const label = meta?.DisplayName?.UserLocalizedLabel?.Label
                        || meta?.DisplayName?.LocalizedLabels?.[0]?.Label
                        || meta?.SchemaName;
                    if (!cancelled && label) {
                        setEntityDisplayName(label);
                    }
                }
            } catch (e) {
                // Silent fallback — keep the heuristic name
                if (pcfContext?.parameters?.DebugMode?.raw === '1') {
                    // eslint-disable-next-line no-console
                    console.log('Failed to get entity metadata display name:', e);
                }
            }
        }
        loadMetadata();
        return () => { cancelled = true; };
    }, [primaryEntityName, pcfContext]);

    const handleNewRecord = () => {
        pcfContext.navigation.openForm({
            entityName: primaryEntityName,
            useQuickCreateForm: false
        });
    };

    const handleExport = () => {
        ExportToCSVUtil(items, `${primaryEntityName}-export-${Date.now()}.csv`, legacyColumns);
    };

    const handleCustomButtonClickInternal = () => {
        if (onCustomButtonClick) {
            onCustomButtonClick();
        }
    };

    const selectedCount = selectedItems.size;
    const showCustomButton = !!customButtonConfig
        && (customButtonConfig.showWhenSelectedMin === undefined || selectedCount >= customButtonConfig.showWhenSelectedMin)
        && (customButtonConfig.showWhenSelectedMax === undefined || selectedCount <= customButtonConfig.showWhenSelectedMax);

    return (
            <Toolbar
                aria-label="Dataverse Grid Commands"
                style={{
                    padding: '8px 12px',
                    borderBottom: '1px solid #e1e1e1',
                    backgroundColor: '#fafafa'
                }}
           >
                {!hideNewButton && (
                    <ToolbarButton
                        appearance="primary"
                        icon={<AddIcon />}
                        onClick={handleNewRecord}
                    >
                        New {entityDisplayName}
                    </ToolbarButton>
                )}

                {showCustomButton && customButtonConfig && (
                    <ToolbarButton
                        icon={<AddIcon />}
                        onClick={handleCustomButtonClickInternal}
                    >
                        {customButtonConfig.buttonText}
                    </ToolbarButton>
                )}

                <ToolbarDivider />

                {!hideRefreshButton && (
                    <ToolbarButton
                        icon={<RefreshIcon />}
                        onClick={onRefresh}
                        title="Refresh"
                    >
                        Refresh
                    </ToolbarButton>
                )}

                {!hideExportButton && (
                    <ToolbarButton
                        icon={<DownloadIcon />}
                        onClick={handleExport}
                        title="Export to CSV"
                    >
                        Export
                    </ToolbarButton>
                )}

                {!hideBulkEditButton && selectedItems.size > 0 && (
                    <Menu>
                        <MenuTrigger disableButtonEnhancement>
                            <ToolbarButton
                                icon={<MoreIcon />}
                                title="More commands"
                            />
                        </MenuTrigger>
                        <MenuPopover>
                            <MenuList>
                                <MenuItem
                                    onClick={() => {
                                        // Placeholder for bulk operations
                                        // eslint-disable-next-line no-console
                                        console.log('Bulk operations for:', Array.from(selectedItems));
                                    }}
                                >
                                    Bulk Edit ({selectedItems.size} selected)
                                </MenuItem>
                            </MenuList>
                        </MenuPopover>
                    </Menu>
                )}
            </Toolbar>
    );
};