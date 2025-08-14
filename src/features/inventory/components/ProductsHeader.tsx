/**
 * Header dos produtos com títulos e contadores
 * Sub-componente especializado para cabeçalho
 */

import React from 'react';
import { Plus, Package } from 'lucide-react';
import { Button } from '@/shared/ui/primitives/button';
import { cn } from '@/core/config/utils';
import { text, shadows } from '@/core/config/theme';

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
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-yellow-400/20 border border-yellow-400/30">
            <Package className="h-6 w-6 text-yellow-400" />
          </div>
          <div>
            <h2 className={cn(text.h1, shadows.strong, "text-2xl font-bold")}>
              Produtos Disponíveis
            </h2>
            <p className={cn(text.h6, shadows.subtle, "text-sm opacity-75")}>
              Selecione produtos para adicionar ao carrinho
            </p>
          </div>
        </div>
        
        <div className="bg-black/50 backdrop-blur-sm border border-yellow-400/30 rounded-full px-4 py-2 shadow-lg">
          <span className={cn(text.h3, shadows.medium, "text-sm font-bold")}>
            {hasActiveFilters ? `${filteredCount} de ${totalProducts}` : `${filteredCount}`}
          </span>
          <span className={cn(text.h6, shadows.subtle, "text-xs ml-1 opacity-75")}>
            produtos
          </span>
        </div>
      </div>
      
      {onAddProduct && (
        <Button 
          onClick={onAddProduct}
          className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black hover:from-yellow-300 hover:to-yellow-400 font-semibold shadow-lg hover:shadow-yellow-400/30 transition-all duration-300 transform hover:scale-105"
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Produto
        </Button>
      )}
    </div>
  );
};