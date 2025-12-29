import React from 'react';
import { cn } from '@/core/config/utils';
import { Button } from '@/shared/ui/primitives/button';
import { Table, TableHead, TableHeader, TableRow } from '@/shared/ui/primitives/table';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { TableColumn } from './types';

interface DataTableHeaderProps<T> {
    columns: TableColumn<T>[];
    sortKey?: string;
    sortDirection?: 'asc' | 'desc';
    onSort?: (key: string, direction: 'asc' | 'desc') => void;
    onSelectAll?: (selected: boolean) => void;
    isAllSelected?: boolean;
    hasRowActions?: boolean;
    compact?: boolean;
    tableClasses: {
        container: string;
        header: string;
        headerCell: string;
        row: string;
        cell: string;
    };
    className?: string;
}

export function DataTableHeader<T>({
    columns,
    sortKey,
    sortDirection,
    onSort,
    onSelectAll,
    isAllSelected = false,
    hasRowActions = false,
    compact = false,
    tableClasses,
    className
}: DataTableHeaderProps<T>) {

    const handleSort = (columnKey: string) => {
        if (!onSort) return;

        let direction: 'asc' | 'desc' = 'asc';
        if (sortKey === columnKey && sortDirection === 'asc') {
            direction = 'desc';
        }

        onSort(columnKey, direction);
    };

    const getSortIcon = (columnKey: string) => {
        if (sortKey !== columnKey) {
            return <ArrowUpDown className="w-3 h-3 text-gray-400" />;
        }
        return sortDirection === 'asc'
            ? <ArrowUp className="w-3 h-3 text-primary-yellow" />
            : <ArrowDown className="w-3 h-3 text-primary-yellow" />;
    };

    return (
        <div className="sticky top-0 z-10 bg-gray-800/95 backdrop-blur-sm border-b border-gray-700/50">
            <Table className={cn(tableClasses.container, className)}>
                <TableHeader className={tableClasses.header}>
                    <TableRow className="border-b border-gray-700/50">
                        {/* Select All Checkbox */}
                        {onSelectAll && (
                            <TableHead className="w-12">
                                <input
                                    type="checkbox"
                                    checked={isAllSelected}
                                    onChange={(e) => onSelectAll(e.target.checked)}
                                    className="rounded border-gray-300"
                                />
                            </TableHead>
                        )}

                        {/* Column Headers */}
                        {columns.map((column) => (
                            <TableHead
                                key={column.key}
                                className={cn(
                                    tableClasses.headerCell,
                                    column.className,
                                    column.align === 'center' && 'text-center',
                                    column.align === 'right' && 'text-right',
                                    compact && 'py-2'
                                )}
                                style={column.width ? {
                                    width: column.width,
                                    minWidth: column.width,
                                    maxWidth: column.width,
                                } : undefined}
                            >
                                {column.sortable && onSort ? (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-auto p-0 font-medium hover:bg-gray-800/60 text-gray-300 hover:text-primary-yellow transition-colors duration-200"
                                        onClick={() => handleSort(column.key)}
                                    >
                                        <span className="whitespace-pre-line text-xs">{column.title}</span>
                                        {getSortIcon(column.key)}
                                    </Button>
                                ) : (
                                    <span className="text-gray-300 font-medium whitespace-pre-line text-xs">{column.title}</span>
                                )}
                            </TableHead>
                        ))}

                        {/* Actions Column */}
                        {hasRowActions && (
                            <TableHead className="w-12">
                                <span className="sr-only">Ações</span>
                            </TableHead>
                        )}
                    </TableRow>
                </TableHeader>
            </Table>
        </div>
    );
}
