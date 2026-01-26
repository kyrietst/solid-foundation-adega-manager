/**
 * Tabela Padronizada para Relatórios
 * Migrado para usar o DataTable genérico (Fase 2.1 refatoração DRY)
 */

import React, { useMemo } from 'react';
import { DataTable } from '@/shared/ui/layout/DataTable';
import { DataTableColumn } from '@/shared/ui/layout/datatable/types';
import { FileSpreadsheet } from 'lucide-react';

// Legacy interface for backward compatibility
export interface TableColumn {
  key: string;
  label: string;
  width?: string;
  sortable?: boolean;
  render?: (value: unknown, row: unknown) => React.ReactNode;
}

interface StandardReportsTableProps<T = Record<string, unknown>> {
  data: T[];
  columns: TableColumn[];
  title?: string;
  searchFields?: (keyof T)[];
  initialSortField?: string;
  initialSortDirection?: 'asc' | 'desc';
  height?: string;
  maxRows?: number;
  showControls?: boolean;
  loading?: boolean;
  variant?: 'default' | 'premium' | 'yellow' | 'subtle' | 'strong';
  glassEffect?: boolean;
  compact?: boolean;
}

export const StandardReportsTable = <T extends Record<string, unknown>>({
  data,
  columns,
  title,
  searchFields = [],
  initialSortField = null,
  initialSortDirection = 'desc',
  height = 'h-96',
  maxRows = 100,
  showControls = false,
  loading = false,
  variant = 'premium',
  glassEffect = true,
  compact = false,
}: StandardReportsTableProps<T>) => {
  // Convert legacy TableColumn to DataTableColumn format
  const dataTableColumns: DataTableColumn<T>[] = useMemo(() => {
    return columns.map(col => ({
      id: col.key,
      label: col.label,
      accessor: col.key as keyof T,
      width: col.width,
      sortable: col.sortable,
      render: col.render ? (value: unknown, item: T) => col.render!(value, item) : undefined,
    }));
  }, [columns]);

  return (
    <DataTable<T>
      data={data}
      columns={dataTableColumns}
      loading={loading}
      searchPlaceholder={`Buscar ${title ? title.toLowerCase() : 'registros'}...`}
      searchFields={searchFields}
      defaultSortField={initialSortField || undefined}
      defaultSortDirection={initialSortDirection}
      maxRows={maxRows}
      empty={{
        title: 'Nenhum dado encontrado',
        description: title ? `Nenhum ${title.toLowerCase()} foi encontrado.` : 'Não há registros para exibir.',
        icon: FileSpreadsheet,
      }}
      caption={title ? `Tabela de ${title.toLowerCase()}` : 'Tabela de relatórios'}
      className={height}
      variant={variant}
      glassEffect={glassEffect}
      compact={compact}
    />
  );
};