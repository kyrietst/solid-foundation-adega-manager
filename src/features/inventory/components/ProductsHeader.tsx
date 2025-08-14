/**
 * Header dos produtos com títulos e contadores
 * Sub-componente especializado para cabeçalho
 */

import React from 'react';
import { Plus, Package } from 'lucide-react';
import { Button } from '@/shared/ui/primitives/button';
import { cn } from '@/core/config/utils';
import { text, shadows } from '@/core/config/theme';
import { GradientText } from "@/components/ui/gradient-text";

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
    <div className="w-full">
      {/* Header padronizado seguindo exatamente o padrão da Sales Page */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="relative w-full text-center">
          <GradientText
            colors={["#FF2400", "#FFDA04", "#FF2400", "#FFDA04", "#FF2400"]}
            animationSpeed={6}
            showBorder={false}
            className="text-xl lg:text-2xl font-bold"
          >
            PRODUTOS DISPONÍVEIS
          </GradientText>
          
          {/* Efeito de sublinhado elegante */}
          <div className="w-full h-6 relative mt-2">
            {/* Gradientes do sublinhado com mais opacidade */}
            <div className="absolute inset-x-0 top-0 bg-gradient-to-r from-transparent via-[#FF2400]/80 to-transparent h-[2px] w-full blur-sm" />
            <div className="absolute inset-x-0 top-0 bg-gradient-to-r from-transparent via-[#FF2400] to-transparent h-px w-full" />
            <div className="absolute inset-x-0 top-0 bg-gradient-to-r from-transparent via-[#FFDA04]/80 to-transparent h-[3px] w-3/4 blur-sm mx-auto" />
            <div className="absolute inset-x-0 top-0 bg-gradient-to-r from-transparent via-[#FFDA04] to-transparent h-px w-3/4 mx-auto" />
          </div>
        </div>
      </div>

      {/* Controles e informações */}
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-yellow-400/20 border border-yellow-400/30">
              <Package className="h-6 w-6 text-yellow-400" />
            </div>
            <div>
              <p className={cn(text.h6, shadows.subtle, "text-sm text-gray-300")}>
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
            className="bg-gradient-to-r from-primary-yellow to-yellow-500 text-black hover:from-yellow-300 hover:to-yellow-400 font-semibold shadow-lg hover:shadow-yellow-400/30 transition-all duration-200 hover:scale-105"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Produto
          </Button>
        )}
      </div>
    </div>
  );
};