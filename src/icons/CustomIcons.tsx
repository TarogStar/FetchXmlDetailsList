import * as React from 'react';

export interface IconProps {
    className?: string;
    style?: React.CSSProperties;
    size?: number;
}

export const AddIcon: React.FC<IconProps> = ({ className, style, size = 20 }) => (
    <svg
        className={className}
        style={style}
        width={size}
        height={size}
        viewBox="0 0 20 20"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M10.75 3.75a.75.75 0 0 0-1.5 0v5.5h-5.5a.75.75 0 0 0 0 1.5h5.5v5.5a.75.75 0 0 0 1.5 0v-5.5h5.5a.75.75 0 0 0 0-1.5h-5.5v-5.5Z" />
    </svg>
);

export const RefreshIcon: React.FC<IconProps> = ({ className, style, size = 20 }) => (
    <svg
        className={className}
        style={style}
        width={size}
        height={size}
        viewBox="0 0 20 20"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M10 3a7 7 0 0 1 6.93 6.25.75.75 0 1 0 1.49-.25A8.5 8.5 0 0 0 3.28 4.94L3 4.25V2.5a.75.75 0 0 0-1.5 0v4c0 .414.336.75.75.75h4a.75.75 0 0 0 0-1.5H4.25l.28.69A7 7 0 0 1 10 3ZM2.57 11.75a.75.75 0 1 0-1.49.25A8.5 8.5 0 0 0 16.72 15.06l.28.69V17.5a.75.75 0 0 0 1.5 0v-4a.75.75 0 0 0-.75-.75h-4a.75.75 0 0 0 0 1.5h2l-.28-.69A7 7 0 0 1 10 17a7 7 0 0 1-6.93-6.25Z" />
    </svg>
);

export const DownloadIcon: React.FC<IconProps> = ({ className, style, size = 20 }) => (
    <svg
        className={className}
        style={style}
        width={size}
        height={size}
        viewBox="0 0 20 20"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.69L6.53 8.72a.75.75 0 0 0-1.06 1.06l4 4a.75.75 0 0 0 1.06 0l4-4a.75.75 0 1 0-1.06-1.06l-2.72 2.72V2.75Z" />
        <path d="M3.5 15.25a.75.75 0 0 0 0 1.5h13a.75.75 0 0 0 0-1.5h-13Z" />
    </svg>
);

export const MoreIcon: React.FC<IconProps> = ({ className, style, size = 20 }) => (
    <svg
        className={className}
        style={style}
        width={size}
        height={size}
        viewBox="0 0 20 20"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
    >
        <circle cx="4" cy="10" r="1.5" />
        <circle cx="10" cy="10" r="1.5" />
        <circle cx="16" cy="10" r="1.5" />
    </svg>
);

export const EditIcon: React.FC<IconProps> = ({ className, style, size = 20 }) => (
    <svg
        className={className}
        style={style}
        width={size}
        height={size}
        viewBox="0 0 20 20"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M17.19 2.81a2.25 2.25 0 0 0-3.18 0L4.47 12.35a1.75 1.75 0 0 0-.46.85l-.75 3.75a.75.75 0 0 0 .88.88l3.75-.75c.32-.06.62-.22.85-.46l9.54-9.54a2.25 2.25 0 0 0 0-3.18l-.91-.9Zm-2.12 1.06a.75.75 0 0 1 1.06 0l.91.9a.75.75 0 0 1 0 1.07l-.97.96-1.97-1.97.97-.96Zm-1.91 1.91 1.97 1.97-7.6 7.59a.25.25 0 0 1-.12.07l-2.53.5.5-2.53a.25.25 0 0 1 .07-.12l7.7-7.48Z" />
    </svg>
);

export const ClipboardIcon: React.FC<IconProps> = ({ className, style, size = 20 }) => (
    <svg
        className={className}
        style={style}
        width={size}
        height={size}
        viewBox="0 0 20 20"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M8.5 2A2.5 2.5 0 0 0 6 4.5V5H5.5A2.5 2.5 0 0 0 3 7.5v9A2.5 2.5 0 0 0 5.5 19h9a2.5 2.5 0 0 0 2.5-2.5v-9A2.5 2.5 0 0 0 14.5 5H14v-.5A2.5 2.5 0 0 0 11.5 2h-3ZM7.5 4.5A1 1 0 0 1 8.5 3.5h3a1 1 0 0 1 1 1V5h-5v-.5ZM5.5 6.5h9a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1h-9a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1Z" />
    </svg>
);

export const CheckIcon: React.FC<IconProps> = ({ className, style, size = 20 }) => (
    <svg
        className={className}
        style={style}
        width={size}
        height={size}
        viewBox="0 0 20 20"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M7.03 13.47 3.53 9.97a.75.75 0 0 0-1.06 1.06l4 4a.75.75 0 0 0 1.06 0l10-10a.75.75 0 1 0-1.06-1.06L7.03 13.47Z" />
    </svg>
);

export const DeleteIcon: React.FC<IconProps> = ({ className, style, size = 20 }) => (
    <svg
        className={className}
        style={style}
        width={size}
        height={size}
        viewBox="0 0 20 20"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M8.5 2A1.5 1.5 0 0 0 7 3.5V4H3.5a.5.5 0 0 0 0 1h.65l.85 11.03A2 2 0 0 0 6.99 18h6.02a2 2 0 0 0 1.99-1.97L15.85 5h.65a.5.5 0 0 0 0-1H13v-.5A1.5 1.5 0 0 0 11.5 2h-3ZM12 4V3.5a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5V4h4Zm2.84 1H5.16l.84 11.02a1 1 0 0 0 1 .98h6.01a1 1 0 0 0 .99-.98L14.84 5Z" />
    </svg>
);

export const DocumentIcon: React.FC<IconProps> = ({ className, style, size = 20 }) => (
    <svg
        className={className}
        style={style}
        width={size}
        height={size}
        viewBox="0 0 20 20"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M5.5 2A2.5 2.5 0 0 0 3 4.5v11A2.5 2.5 0 0 0 5.5 18h9a2.5 2.5 0 0 0 2.5-2.5v-8A2.5 2.5 0 0 0 14.5 5H13V4.5A2.5 2.5 0 0 0 10.5 2h-5Zm0 1.5h5A1 1 0 0 1 11.5 4.5V5h-7V4.5a1 1 0 0 1 1-1Zm9 3h-10a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1h.5Z" />
    </svg>
);

export const CalendarIcon: React.FC<IconProps> = ({ className, style, size = 20 }) => (
    <svg
        className={className}
        style={style}
        width={size}
        height={size}
        viewBox="0 0 20 20"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M14.5 3H17a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h2.5V1.75a.75.75 0 0 1 1.5 0V3h6V1.75a.75.75 0 0 1 1.5 0V3ZM2.5 7.5v9.75c0 .14.11.25.25.25h14.5c.14 0 .25-.11.25-.25V7.5h-15ZM17.5 6V5a.5.5 0 0 0-.5-.5H3a.5.5 0 0 0-.5.5v1h15Z" />
    </svg>
);

export const InfoIcon: React.FC<IconProps> = ({ className, style, size = 20 }) => (
    <svg
        className={className}
        style={style}
        width={size}
        height={size}
        viewBox="0 0 20 20"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M10 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16Zm0 1.5a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13ZM10 9.25a.75.75 0 0 1 .75.75v3.25a.75.75 0 0 1-1.5 0V10a.75.75 0 0 1 .75-.75Zm0-3.25a1 1 0 1 1 0 2 1 1 0 0 1 0-2Z" />
    </svg>
);

export const SettingsIcon: React.FC<IconProps> = ({ className, style, size = 20 }) => (
    <svg
        className={className}
        style={style}
        width={size}
        height={size}
        viewBox="0 0 20 20"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M10.75 2.5a.75.75 0 0 0-1.5 0v1.02a6 6 0 0 0-1.5.53l-.72-.72a.75.75 0 0 0-1.06 1.06l.72.72a6 6 0 0 0-.53 1.5H4.6a.75.75 0 0 0 0 1.5h1.02a6 6 0 0 0 .53 1.5l-.72.72a.75.75 0 1 0 1.06 1.06l.72-.72a6 6 0 0 0 1.5.53v1.02a.75.75 0 0 0 1.5 0v-1.02a6 6 0 0 0 1.5-.53l.72.72a.75.75 0 0 0 1.06-1.06l-.72-.72a6 6 0 0 0 .53-1.5h1.02a.75.75 0 0 0 0-1.5h-1.02a6 6 0 0 0-.53-1.5l.72-.72a.75.75 0 0 0-1.06-1.06l-.72.72a6 6 0 0 0-1.5-.53V2.5ZM10 7a3 3 0 1 1 0 6 3 3 0 0 1 0-6Z" />
    </svg>
);

export const SendIcon: React.FC<IconProps> = ({ className, style, size = 20 }) => (
    <svg
        className={className}
        style={style}
        width={size}
        height={size}
        viewBox="0 0 20 20"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M2.72 2.05a.75.75 0 0 0-.97.97l2.47 7.42a.25.25 0 0 0 .24.17h5.29a.75.75 0 0 1 0 1.5H4.46a.25.25 0 0 0-.24.17L1.75 19.7a.75.75 0 0 0 .97.97l15.23-8.25a.75.75 0 0 0 0-1.32L2.72 2.05Z" />
    </svg>
);

// Type for icon names that can be used in button configurations
export type CustomIconType = 
    | 'Add'
    | 'Refresh' 
    | 'Download'
    | 'More'
    | 'Edit'
    | 'Clipboard'
    | 'Check'
    | 'Delete'
    | 'Document'
    | 'Calendar'
    | 'Info'
    | 'Settings'
    | 'Send';

// Helper function to get icon component by name
// Returns AddIcon (plus sign) as default for backward compatibility
export const getIconByName = (iconName?: CustomIconType): React.FC<IconProps> => {
    // If no icon specified, return Add icon for backward compatibility
    if (!iconName) {
        return AddIcon;
    }
    
    switch (iconName) {
        case 'Add':
            return AddIcon;
        case 'Refresh':
            return RefreshIcon;
        case 'Download':
            return DownloadIcon;
        case 'More':
            return MoreIcon;
        case 'Edit':
            return EditIcon;
        case 'Clipboard':
            return ClipboardIcon;
        case 'Check':
            return CheckIcon;
        case 'Delete':
            return DeleteIcon;
        case 'Document':
            return DocumentIcon;
        case 'Calendar':
            return CalendarIcon;
        case 'Info':
            return InfoIcon;
        case 'Settings':
            return SettingsIcon;
        case 'Send':
            return SendIcon;
        default:
            // Fallback for any unrecognized icon names
            return AddIcon;
    }
};