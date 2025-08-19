/**
 * Componente de filtros avançados do inventory
 * Extraído do InventoryNew.tsx para separar responsabilidades
 */

import React from 'react';
import { SearchBar21st } from '@/shared/ui/thirdparty/search-bar-21st';
import { FilterToggle } from '@/shared/ui/composite/filter-toggle';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/primitives/select';
import { InventoryFiltersProps } from './types';

export const InventoryFilters: React.FC<InventoryFiltersProps> = ({
  searchTerm,
  onSearchChange,
  filters,
  onFiltersChange,
  categories,
  suppliers,
  isOpen,
  onToggle,
}) => {
  const handleFilterChange = (key: string, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value === 'all' ? undefined : value,
    });
  };

  return (
    <div className="space-y-4">
      {/* Busca Principal */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex-1 max-w-xl">
          <SearchBar21st
            value={searchTerm}
            onChange={onSearchChange}
            placeholder="Buscar por nome, categoria, código de barras ou fornecedor..."
            debounceMs={200}
            disableResizeAnimation={true}
          />
        </div>
        
        <FilterToggle
          isOpen={isOpen}
          onToggle={onToggle}
          label="Filtros Avançados"
        />
      </div>

      {/* Filtros Avançados */}
      {isOpen && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-adega-charcoal/20 rounded-lg border border-white/10">
          {/* Filtro por Categoria */}
          <div>
            <label className="block text-sm font-medium text-adega-platinum mb-2">
              Categoria
            </label>
            <Select
              value={filters.category || 'all'}
              onValueChange={(value) => handleFilterChange('category', value)}
            >
              <SelectTrigger className="bg-adega-charcoal/60 border-white/10">
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtro por Tipo de Unidade */}
          <div>
            <label className="block text-sm font-medium text-adega-platinum mb-2">
              Tipo de Unidade
            </label>
            <Select
              value={filters.unitType || 'all'}
              onValueChange={(value) => handleFilterChange('unitType', value)}
            >
              <SelectTrigger className="bg-adega-charcoal/60 border-white/10">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="un">Unidade</SelectItem>
                <SelectItem value="pct">Pacote</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filtro por Giro */}
          <div>
            <label className="block text-sm font-medium text-adega-platinum mb-2">
              Taxa de Giro
            </label>
            <Select
              value={filters.turnoverRate || 'all'}
              onValueChange={(value) => handleFilterChange('turnoverRate', value)}
            >
              <SelectTrigger className="bg-adega-charcoal/60 border-white/10">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os giros</SelectItem>
                <SelectItem value="fast">Giro Rápido</SelectItem>
                <SelectItem value="medium">Giro Médio</SelectItem>
                <SelectItem value="slow">Giro Lento</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filtro por Status de Estoque */}
          <div>
            <label className="block text-sm font-medium text-adega-platinum mb-2">
              Status do Estoque
            </label>
            <Select
              value={filters.stockStatus || 'all'}
              onValueChange={(value) => handleFilterChange('stockStatus', value)}
            >
              <SelectTrigger className="bg-adega-charcoal/60 border-white/10">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="low">Estoque Baixo</SelectItem>
                <SelectItem value="adequate">Estoque Adequado</SelectItem>
                <SelectItem value="high">Estoque Alto</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filtro por Fornecedor */}
          {suppliers.length > 0 && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-adega-platinum mb-2">
                Fornecedor
              </label>
              <Select
                value={filters.supplier || 'all'}
                onValueChange={(value) => handleFilterChange('supplier', value)}
              >
                <SelectTrigger className="bg-adega-charcoal/60 border-white/10">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os fornecedores</SelectItem>
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier} value={supplier}>
                      {supplier}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      )}
    </div>
  );
};