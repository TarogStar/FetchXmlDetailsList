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