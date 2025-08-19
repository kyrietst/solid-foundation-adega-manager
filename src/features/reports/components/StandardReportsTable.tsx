/**
 * Tabela Padronizada para Relatórios
 * Baseada no padrão estabelecido em MovementsTable.tsx
 */

import React, { useMemo, useState } from 'react';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from '@/shared/ui/primitives/dropdown-menu';
import { Button } from '@/shared/ui/primitives/button';
import { SearchBar21st } from '@/shared/ui/thirdparty/search-bar-21st';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

export interface TableColumn {
  key: string;
  label: string;
  width?: string;
  sortable?: boolean;
  render?: (value: any, row: any) => React.ReactNode;
}

interface StandardReportsTableProps {
  data: any[];
  columns: TableColumn[];
  title?: string;
  searchFields?: string[];
  initialSortField?: string;
  initialSortDirection?: 'asc' | 'desc';
  height?: string;
  maxRows?: number;
  showControls?: boolean;
}

type SortDirection = 'asc' | 'desc';

export const StandardReportsTable: React.FC<StandardReportsTableProps> = ({
  data,
  columns,
  title,
  searchFields = [],
  initialSortField = null,
  initialSortDirection = 'desc',
  height = 'h-96',
  maxRows = 100,
  showControls = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleColumns, setVisibleColumns] = useState<string[]>(columns.map(col => col.label));
  const [sortField, setSortField] = useState<string | null>(initialSortField);
  const [sortDirection, setSortDirection] = useState<SortDirection>(initialSortDirection);

  const filteredAndSortedData = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    let rows = term && searchFields.length > 0
      ? data.filter(row => {
          return searchFields.some(field => {
            const value = row[field];
            return value && String(value).toLowerCase().includes(term);
          });
        })
      : data;

    if (sortField) {
      rows = [...rows].sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];
        
        // Handle different data types
        let comparison = 0;
        if (aValue == null && bValue == null) comparison = 0;
        else if (aValue == null) comparison = 1;
        else if (bValue == null) comparison = -1;
        else if (typeof aValue === 'number' && typeof bValue === 'number') {
          comparison = aValue - bValue;
        } else if (aValue instanceof Date && bValue instanceof Date) {
          comparison = aValue.getTime() - bValue.getTime();
        } else {
          comparison = String(aValue).toLowerCase().localeCompare(String(bValue).toLowerCase());
        }

        return sortDirection === 'asc' ? comparison : -comparison;
      });
    }

    // Apply row limit for performance
    return rows.slice(0, maxRows);
  }, [data, searchTerm, searchFields, sortField, sortDirection, maxRows]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: string) => {
    if (sortField !== field) return <ArrowUpDown className="w-4 h-4" />;
    return sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />;
  };

  if (data.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">Nenhum dado encontrado</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-4 h-full">
      {/* Header com busca e controles */}
      {(searchFields.length > 0 || showControls) && (
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between flex-shrink-0">
          {searchFields.length > 0 && (
            <div className="w-full sm:w-80">
              <SearchBar21st 
                placeholder={`Buscar ${title ? title.toLowerCase() : 'registros'}...`} 
                value={searchTerm} 
                onChange={setSearchTerm} 
                debounceMs={300} 
                disableResizeAnimation={true}
              />
            </div>
          )}
          
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span>
              {filteredAndSortedData.length} de {data.length} registros
              {filteredAndSortedData.length >= maxRows && (
                <span className="text-yellow-400 ml-1">(limitado a {maxRows})</span>
              )}
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="bg-black/50 border-white/20 text-white hover:bg-white/10">
                  Colunas
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-black/90 border-white/10">
                {columns.map(col => (
                  <DropdownMenuCheckboxItem
                    key={col.key}
                    checked={visibleColumns.includes(col.label)}
                    onCheckedChange={() => 
                      setVisibleColumns(prev => 
                        prev.includes(col.label) 
                          ? prev.filter(c => c !== col.label) 
                          : [...prev, col.label]
                      )
                    }
                    className="text-white hover:bg-white/10"
                  >
                    {col.label}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}

      {/* Container da tabela com scroll */}
      <div className={`bg-black/40 rounded-lg border border-white/10 overflow-hidden flex-1 min-h-0 ${height}`}>
        <div className="h-full max-h-full overflow-auto scrollbar-thin scrollbar-track-gray-900 scrollbar-thumb-gray-600 hover:scrollbar-thumb-gray-500">
          <table className="w-full border-collapse min-w-full">
            <thead className="sticky top-0 z-10">
              <tr className="border-b border-white/10 bg-black/60 backdrop-blur-sm">
                {columns.map(column => 
                  visibleColumns.includes(column.label) && (
                    <th 
                      key={column.key}
                      className={`${column.width || 'w-auto'} text-left p-3 text-gray-300 font-semibold`}
                    >
                      {column.sortable !== false ? (
                        <button 
                          className="inline-flex items-center gap-2 hover:text-yellow-400 transition-colors" 
                          onClick={() => handleSort(column.key)}
                        >
                          {column.label} {getSortIcon(column.key)}
                        </button>
                      ) : (
                        column.label
                      )}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedData.map((row, index) => (
                <tr 
                  key={index} 
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  {columns.map(column => 
                    visibleColumns.includes(column.label) && (
                      <td key={column.key} className="p-3 text-white">
                        {column.render 
                          ? column.render(row[column.key], row)
                          : row[column.key] || '-'
                        }
                      </td>
                    )
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};