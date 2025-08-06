/**
 * LoadingTable - Skeleton para tabelas de dados
 * Mostra placeholders enquanto dados estão carregando
 */

import React from 'react';
import { cn } from '@/core/config/utils';
import { Skeleton } from '@/shared/ui/composite/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/primitives/table';

export interface LoadingTableProps {
  columns: Array<{
    title: string;
    width?: string;
    align?: 'left' | 'center' | 'right';
  }>;
  rowCount?: number;
  showActions?: boolean;
  showCheckbox?: boolean;
  className?: string;
  compact?: boolean;
}

export const LoadingTable: React.FC<LoadingTableProps> = ({
  columns,
  rowCount = 5,
  showActions = false,
  showCheckbox = false,
  className,
  compact = false
}) => {
  const renderSkeletonCell = (column: any, index: number) => {
    const width = column.width || '100%';
    const baseWidth = Math.floor(Math.random() * 40) + 60; // 60-100%
    
    return (
      <TableCell
        key={index}
        className={cn(
          column.align === 'center' && 'text-center',
          column.align === 'right' && 'text-right',
          compact && 'py-2'
        )}
      >
        <Skeleton 
          className={cn(
            'h-4',
            column.align === 'center' && 'mx-auto',
            column.align === 'right' && 'ml-auto'
          )} 
          style={{ width: `${baseWidth}%` }}
        />
      </TableCell>
    );
  };

  return (
    <div className="rounded-md border">
      <Table className={className}>
        <TableHeader>
          <TableRow>
            {/* Checkbox Column */}
            {showCheckbox && (
              <TableHead className="w-12">
                <Skeleton className="h-4 w-4" />
              </TableHead>
            )}
            
            {/* Column Headers */}
            {columns.map((column, index) => (
              <TableHead
                key={index}
                className={cn(
                  column.width && `w-[${column.width}]`,
                  column.align === 'center' && 'text-center',
                  column.align === 'right' && 'text-right',
                  compact && 'py-2'
                )}
              >
                <Skeleton className="h-4 w-24" />
              </TableHead>
            ))}
            
            {/* Actions Column */}
            {showActions && (
              <TableHead className="w-12">
                <Skeleton className="h-4 w-8" />
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        
        <TableBody>
          {Array.from({ length: rowCount }).map((_, rowIndex) => (
            <TableRow key={rowIndex} className="animate-pulse">
              {/* Checkbox Cell */}
              {showCheckbox && (
                <TableCell className="w-12">
                  <Skeleton className="h-4 w-4" />
                </TableCell>
              )}
              
              {/* Data Cells */}
              {columns.map((column, colIndex) => 
                renderSkeletonCell(column, colIndex)
              )}
              
              {/* Actions Cell */}
              {showActions && (
                <TableCell className="w-12">
                  <Skeleton className="h-8 w-8 rounded" />
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};