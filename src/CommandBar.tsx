import * as React from 'react';
import {
    Toolbar,
    ToolbarButton,
    ToolbarDivider,
    Menu,
    MenuTrigger,
    MenuPopover,
    MenuList,
    MenuItem,
    FluentProvider,
    webLightTheme
} from '@fluentui/react-components';
import { ExportToCSVUtil } from './GridExport';
import { TableRowId } from '@fluentui/react-components';
import { AddIcon, RefreshIcon, DownloadIcon, MoreIcon } from './icons/CustomIcons';
import { ICustomButtonConfig } from './types';

export interface CommandBarProps {
    primaryEntityName: string;
    pcfContext: any;
    items: any[];
    selectedItems: Set<TableRowId>;
    onRefresh: () => void;
    customButtonConfig?: ICustomButtonConfig;
    onCustomButtonClick?: () => void;
}

export const CommandBar: React.FC<CommandBarProps> = ({
    primaryEntityName,
    pcfContext,
    items,
    selectedItems,
    onRefresh,
    customButtonConfig,
    onCustomButtonClick
}) => {
    const handleNewRecord = () => {
        pcfContext.navigation.openForm({
            entityName: primaryEntityName,
            useQuickCreateForm: false
        });
    };

    const handleExport = () => {
        ExportToCSVUtil(items, `${primaryEntityName}-export-${Date.now()}.csv`);
    };

    const handleCustomButtonClick = () => {
        if (onCustomButtonClick) {
            onCustomButtonClick();
        }
    };

    const getEntityDisplayName = () => {
        // Try to get the display name from metadata, fallback to entity name
        return primaryEntityName.charAt(0).toUpperCase() + primaryEntityName.slice(1);
    };

    return (
        <FluentProvider theme={webLightTheme}>
            <Toolbar
                aria-label="Dataverse Grid Commands"
                style={{
                    padding: '8px 12px',
                    borderBottom: '1px solid #e1e1e1',
                    backgroundColor: '#fafafa'
                }}
            >
                <ToolbarButton
                    appearance="primary"
                    icon={<AddIcon />}
                    onClick={handleNewRecord}
                >
                    New {getEntityDisplayName()}
                </ToolbarButton>

                {customButtonConfig && (
                    <ToolbarButton
                        icon={<AddIcon />}
                        onClick={handleCustomButtonClick}
                    >
                        {customButtonConfig.buttonText}
                    </ToolbarButton>
                )}

                <ToolbarDivider />

                <ToolbarButton
                    icon={<RefreshIcon />}
                    onClick={onRefresh}
                    title="Refresh"
                >
                    Refresh
                </ToolbarButton>

                <ToolbarButton
                    icon={<DownloadIcon />}
                    onClick={handleExport}
                    title="Export to CSV"
                >
                    Export
                </ToolbarButton>

{selectedItems.size > 0 && (
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
                                        // Handle bulk operations
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
        </FluentProvider>
    );
};