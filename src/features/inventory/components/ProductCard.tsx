/**
 * Card individual do produto
 * Sub-componente especializado para exibição de produto individual
 */

import React from 'react';
import { Button } from '@/shared/ui/primitives/button';
import { Plus } from 'lucide-react';
import type { Product } from '@/types/inventory.types';
import { formatCurrency, cn } from '@/core/config/utils';
import { getGlassCardClasses } from '@/core/config/theme-utils';
import { ProductImage } from '@/shared/ui/composite/optimized-image';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  variant?: 'default' | 'premium' | 'success' | 'warning' | 'error';
  glassEffect?: boolean;
}

export const ProductCard = React.memo<ProductCardProps>(({
  product,
  onAddToCart,
  variant = 'default',
  glassEffect = true,
}) => {
  const isOutOfStock = product.stock_quantity === 0;
  const stockColor = isOutOfStock ? 'bg-accent-red/90' : 'bg-gray-800/90';
  const glassClasses = glassEffect ? getGlassCardClasses(variant) : '';

  return (
    <div className={cn(
      'border border-primary-yellow/30 rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:border-primary-yellow/60 hover:scale-[1.02]',
      glassClasses
    )}>
      {/* Imagem do produto */}
      <div className="aspect-square bg-muted/30 relative">
        <ProductImage
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover rounded-t-lg"
          containerClassName="w-full h-full"
        />
        
        {/* Badge de estoque */}
        <div className={cn(
          'absolute bottom-2 right-2 px-2 py-1 rounded-full text-xs font-medium text-white border border-primary-yellow/20',
          stockColor
        )}>
          {isOutOfStock ? 'Sem estoque' : `${product.stock_quantity} em estoque`}
        </div>
      </div>

      {/* Informações do produto */}
      <div className="p-3">
        <h3 className="font-medium line-clamp-2 h-10 text-sm text-gray-100">
          {product.name}
        </h3>
        
        <div className="mt-2 flex items-center justify-between">
          <span className="text-lg font-bold text-primary-yellow">
            {formatCurrency(product.price)}
          </span>
          
          <Button 
            size="sm" 
            onClick={() => onAddToCart(product)}
            disabled={isOutOfStock}
            className={cn(
              isOutOfStock 
                ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                : 'bg-primary-yellow text-black hover:bg-primary-yellow/90 font-semibold'
            )}
            aria-label={isOutOfStock ? `Produto ${product.name} indisponível` : `Adicionar ${product.name} ao carrinho`}
          >
            <Plus className="h-4 w-4 mr-1" aria-hidden="true" />
            {isOutOfStock ? 'Indisponível' : 'Adicionar'}
          </Button>
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison para otimizar re-renders
  return prevProps.product.id === nextProps.product.id &&
         prevProps.product.stock_quantity === nextProps.product.stock_quantity &&
         prevProps.product.price === nextProps.product.price &&
         prevProps.product.name === nextProps.product.name;
});