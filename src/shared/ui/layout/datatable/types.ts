import React from 'react';

export interface TableColumn<T = Record<string, unknown>> {
    key: string;
    title: string;
    sortable?: boolean;
    width?: string;
    align?: 'left' | 'center' | 'right';
    render?: (value: unknown, item: T, index: number) => React.ReactNode;
    className?: string;
}

export interface DataTableProps<T = Record<string, unknown>> {
    data: T[];
    columns: TableColumn<T>[];
    loading?: boolean;
    error?: Error | null;

    // Glass Morphism & Theme
    variant?: 'default' | 'premium' | 'subtle' | 'strong' | 'yellow';
    glassEffect?: boolean;
    virtualization?: boolean;

    // Virtualization options
    virtualizationThreshold?: number; // Auto-enable virtualization above this row count
    rowHeight?: number; // Fixed row height for virtualization
    overscan?: number; // Number of items to render outside visible area

    // Sorting
    sortKey?: string;
    sortDirection?: 'asc' | 'desc';
    onSort?: (key: string, direction: 'asc' | 'desc') => void;

    // Search & Filters
    searchValue?: string;
    onSearchChange?: (value: string) => void;
    searchPlaceholder?: string;
    filters?: React.ReactNode;
    showFilters?: boolean;
    onToggleFilters?: () => void;

    // Row Selection
    selectedRows?: string[];
    onRowSelect?: (id: string) => void;
    onSelectAll?: (selected: boolean) => void;
    rowIdField?: string;

    // Row Actions
    onRowClick?: (item: T) => void;
    rowActions?: (item: T) => React.ReactNode;

    // Pagination
    currentPage?: number;
    totalPages?: number;
    onPageChange?: (page: number) => void;
    itemsPerPage?: number;
    itemsPerPageOptions?: number[];
    onItemsPerPageChange?: (itemsPerPage: number) => void;

    // Empty States
    emptyTitle?: string;
    emptyDescription?: string;
    emptyIcon?: React.ReactNode;
    emptyAction?: {
        label: string;
        onClick: () => void;
        variant?: 'default' | 'outline' | 'ghost';
    };

    // Styling
    className?: string;
    striped?: boolean;
    hoverable?: boolean;
    compact?: boolean;
}
