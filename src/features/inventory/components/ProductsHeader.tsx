/**
 * Header dos produtos com títulos e contadores
 * Sub-componente especializado para cabeçalho
 */

import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/shared/ui/primitives/button';

interface ProductsHeaderProps {
  filteredCount: number;
  totalProducts: number;
  hasActiveFilters: boolean;
  onAddProduct?: () => void;
}

export const ProductsHeader: React.FC<ProductsHeaderProps> = ({
  filteredCount,
  totalProducts,
  hasActiveFilters,
  onAddProduct,
}) => {
  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-3">
        <h2 className="text-2xl font-bold text-adega-yellow">Produtos Disponíveis</h2>
        <span className="px-3 py-1 bg-adega-gold/20 border border-adega-gold/30 rounded-full text-sm text-adega-gold font-medium">
          {hasActiveFilters ? `${filteredCount} de ${totalProducts}` : `${filteredCount}`} produtos
        </span>
      </div>
      
      {onAddProduct && (
        <Button 
          onClick={onAddProduct}
          className="bg-adega-gold hover:bg-adega-amber text-black font-semibold shadow-lg"
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Produto
        </Button>
      )}
    </div>
  );
};