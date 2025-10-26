/**
 * Card ULTRA SIMPLIFICADO do produto para POS/Vendas
 * Apenas 2 números: Pacotes e Unidades Soltas
 * Zero complexidade, decisão simples do usuário
 */

import React from 'react';
import { Button } from '@/shared/ui/primitives/button';
import { Badge } from '@/shared/ui/primitives/badge';
import { Plus, Package, Box, AlertTriangle } from 'lucide-react';
import type { Product } from '@/types/inventory.types';
import { formatCurrency, cn } from '@/core/config/utils';
import { getGlassCardClasses, getHoverTransformClasses } from '@/core/config/theme-utils';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onOpenSelection?: (product: Product) => void;
  variant?: 'default' | 'premium' | 'success' | 'warning' | 'error';
  glassEffect?: boolean;
}

export const ProductCard = React.memo<ProductCardProps>(({
  product,
  onAddToCart,
  onOpenSelection,
  variant = 'default',
  glassEffect = true,
}) => {
  const glassClasses = glassEffect ? getGlassCardClasses(variant) : '';

  // 🏪 v3.4.2 - VENDAS SEMPRE DA LOJA 1 (requisito do cliente)
  const stockPackages = product.store1_stock_packages || 0;
  const stockUnitsLoose = product.store1_stock_units_loose || 0;

  const isOutOfStock = stockPackages === 0 && stockUnitsLoose === 0;
  const hasMultipleOptions = stockPackages > 0 && stockUnitsLoose > 0;

  // Decidir como adicionar ao carrinho - ULTRA SIMPLES
  const handleAddClick = () => {
    if (hasMultipleOptions && onOpenSelection) {
      // Se tem ambos, deixar usuário escolher
      onOpenSelection(product);
    } else {
      // Senão, adicionar direto
      onAddToCart(product);
    }
  };

  return (
    <div
      className={cn(
        "group rounded-xl border border-white/20 bg-black/70 backdrop-blur-md text-card-foreground shadow-lg overflow-hidden transition-all duration-200 hover:shadow-xl",
        getHoverTransformClasses('lift'),
        glassClasses
      )}
    >
      {/* Imagem do produto */}
      <div className="aspect-video bg-gray-700/50 relative overflow-hidden flex items-center justify-center">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <Package className="h-12 w-12 text-gray-400" />
        )}

        {/* Status badge */}
        <div className="absolute top-2 right-2">
          {isOutOfStock ? (
            <Badge className="bg-red-500/80 text-white text-xs">
              Esgotado
            </Badge>
          ) : (
            <Badge className="bg-green-500/80 text-white text-xs">
              Disponível
            </Badge>
          )}
        </div>
      </div>

      {/* Informações do produto ULTRA SIMPLIFICADAS */}
      <div className="p-4 space-y-3">
        {/* Nome */}
        <h3 className="font-semibold text-white text-sm line-clamp-2">
          {product.name}
        </h3>

        {/* Preço */}
        <div className="text-xl font-bold text-primary-yellow">
          {formatCurrency(product.price)}
        </div>

        {/* ESTOQUE ULTRA SIMPLIFICADO - APENAS 2 NÚMEROS */}
        <div className="grid grid-cols-2 gap-2">
          {/* Pacotes */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded p-2 text-center">
            <div className="flex items-center justify-center gap-1">
              <Box className="h-3 w-3 text-blue-400" />
              <span className="text-xs text-blue-400">Pacotes</span>
            </div>
            <p className="text-sm font-bold text-blue-400">{stockPackages}</p>
          </div>

          {/* Unidades Soltas */}
          <div className="bg-green-500/10 border border-green-500/20 rounded p-2 text-center">
            <div className="flex items-center justify-center gap-1">
              <Package className="h-3 w-3 text-green-400" />
              <span className="text-xs text-green-400">Unidades</span>
            </div>
            <p className="text-sm font-bold text-green-400">{stockUnitsLoose}</p>
          </div>
        </div>

        {/* Botão ULTRA SIMPLES */}
        <Button
          size="sm"
          onClick={handleAddClick}
          disabled={isOutOfStock}
          className={cn(
            'w-full text-xs',
            isOutOfStock
              ? 'bg-gray-600/30 text-gray-400 cursor-not-allowed'
              : hasMultipleOptions
              ? 'bg-orange-500 hover:bg-orange-600 text-white'
              : 'bg-primary-yellow hover:bg-yellow-400 text-black'
          )}
        >
          {isOutOfStock ? (
            <>
              <AlertTriangle className="h-3 w-3 mr-1" />
              Esgotado
            </>
          ) : hasMultipleOptions ? (
            <>
              <Plus className="h-3 w-3 mr-1" />
              Escolher
            </>
          ) : (
            <>
              <Plus className="h-3 w-3 mr-1" />
              Adicionar
            </>
          )}
        </Button>
      </div>
    </div>
  );
});