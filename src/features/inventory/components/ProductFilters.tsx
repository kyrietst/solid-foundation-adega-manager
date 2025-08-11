/**
 * Filtros de produtos
 * Sub-componente especializado para filtros e busca
 */

import React from 'react';
import { Button } from '@/shared/ui/primitives/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/primitives/select';
import { ChevronDown, Filter } from 'lucide-react';
import { SearchBar21st } from '@/shared/ui/thirdparty/search-bar-21st';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/shared/ui/primitives/collapsible';

interface ProductFiltersProps {
  // Estados
  searchTerm: string;
  selectedCategory: string;
  isFiltersOpen: boolean;
  categories: string[];
  
  // Configuração
  showSearch: boolean;
  showFilters: boolean;

  // Handlers
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onFiltersToggle: (open: boolean) => void;
}

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  searchTerm,
  selectedCategory,
  isFiltersOpen,
  categories,
  showSearch,
  showFilters,
  onSearchChange,
  onCategoryChange,
  onFiltersToggle,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
      {/* Busca */}
      {showSearch && (
        <div className="sm:w-64">
          <SearchBar21st
            value={searchTerm}
            onChange={onSearchChange}
            placeholder="Buscar produtos..."
            debounceMs={150}
          />
        </div>
      )}
      
      {/* Filtros */}
      {showFilters && (
        <Collapsible open={isFiltersOpen} onOpenChange={onFiltersToggle}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" size="sm" className="sm:hidden">
              <Filter className="h-4 w-4 mr-1" />
              Filtros
              <ChevronDown className="h-4 w-4 ml-1" />
            </Button>
          </CollapsibleTrigger>
          
          {/* Filtros desktop */}
          <div className="hidden sm:flex items-center gap-3">
            <Select value={selectedCategory} onValueChange={onCategoryChange}>
              <SelectTrigger className="w-56 h-12 bg-adega-charcoal/60 border-adega-gold/30 text-adega-platinum rounded-xl backdrop-blur-xl">
                <SelectValue placeholder="Selecionar categoria" />
              </SelectTrigger>
              <SelectContent className="bg-adega-charcoal/95 border-adega-gold/30 backdrop-blur-xl">
                <SelectItem value="all" className="text-adega-platinum hover:bg-adega-graphite/50">
                  Todas as categorias
                </SelectItem>
                {categories.map(category => (
                  <SelectItem 
                    key={category} 
                    value={category} 
                    className="text-adega-platinum hover:bg-adega-graphite/50"
                  >
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Filtros mobile */}
          <CollapsibleContent className="sm:hidden mt-4">
            <div className="space-y-3">
              <Select value={selectedCategory} onValueChange={onCategoryChange}>
                <SelectTrigger className="h-12 bg-adega-charcoal/60 border-adega-gold/30 text-adega-platinum rounded-xl backdrop-blur-xl">
                  <SelectValue placeholder="Selecionar categoria" />
                </SelectTrigger>
                <SelectContent className="bg-adega-charcoal/95 border-adega-gold/30 backdrop-blur-xl">
                  <SelectItem value="all" className="text-adega-platinum hover:bg-adega-graphite/50">
                    Todas as categorias
                  </SelectItem>
                  {categories.map(category => (
                    <SelectItem 
                      key={category} 
                      value={category} 
                      className="text-adega-platinum hover:bg-adega-graphite/50"
                    >
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
};