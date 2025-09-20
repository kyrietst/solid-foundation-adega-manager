/**
 * Componente de filtros de clientes
 * Extraído do CustomersNew.tsx para separar responsabilidades
 */

import React from 'react';
import { Card, CardContent } from '@/shared/ui/primitives/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/primitives/select';
import { SearchInput } from '@/shared/ui/composite/search-input';
import { FilterToggle } from '@/shared/ui/composite/filter-toggle';
import { Badge } from '@/shared/ui/primitives/badge';
import { CustomerFiltersProps } from './types';

export const CustomerFilters: React.FC<CustomerFiltersProps> = ({
  searchTerm,
  onSearchChange,
  segmentFilter,
  onSegmentFilterChange,
  uniqueSegments,
  isOpen,
  onToggle,
}) => {
  const activeFiltersCount = (segmentFilter !== 'all' ? 1 : 0);

  return (
    <div className="space-y-4">
      {/* Barra de Busca e Controles */}
      <Card className="bg-adega-charcoal/20 border-white/10">
        <CardContent className="p-4">
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="w-64">
                <SearchInput
                  value={searchTerm}
                  onChange={onSearchChange}
                  placeholder="Buscar clientes..."
                  debounceMs={150}
                />
              </div>
              
              <div className="flex items-center gap-2">
                <FilterToggle
                  isOpen={isOpen}
                  onToggle={onToggle}
                  label="Filtros"
                />
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {activeFiltersCount}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filtros Avançados */}
      {isOpen && (
        <Card className="bg-adega-charcoal/20 border-white/10">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Filtro por Segmento */}
              <div className="space-y-2">
                <label htmlFor="segment-filter" className="text-sm font-medium text-adega-platinum">
                  Segmento
                </label>
                <Select value={segmentFilter} onValueChange={onSegmentFilterChange}>
                  <SelectTrigger id="segment-filter" className="bg-adega-charcoal/30 border-white/10">
                    <SelectValue placeholder="Todos os segmentos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os segmentos</SelectItem>
                    {uniqueSegments.map((segment) => (
                      <SelectItem key={segment} value={segment}>
                        {segment}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Futuras expansões de filtros */}
              <div className="space-y-2">
                <label htmlFor="status-filter" className="text-sm font-medium text-adega-platinum/60">
                  Status (Em breve)
                </label>
                <Select disabled>
                  <SelectTrigger id="status-filter" className="bg-adega-charcoal/20 border-white/5 opacity-50">
                    <SelectValue placeholder="Todos os status" />
                  </SelectTrigger>
                </Select>
              </div>

              <div className="space-y-2">
                <label htmlFor="category-filter" className="text-sm font-medium text-adega-platinum/60">
                  Categoria Favorita (Em breve)
                </label>
                <Select disabled>
                  <SelectTrigger id="category-filter" className="bg-adega-charcoal/20 border-white/5 opacity-50">
                    <SelectValue placeholder="Todas as categorias" />
                  </SelectTrigger>
                </Select>
              </div>
            </div>

            {/* Botão para Limpar Filtros */}
            {activeFiltersCount > 0 && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <button
                  onClick={() => onSegmentFilterChange('all')}
                  className="text-sm text-adega-gold hover:text-adega-gold/80 transition-colors"
                >
                  Limpar todos os filtros ({activeFiltersCount})
                </button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};