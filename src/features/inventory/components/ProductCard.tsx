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
import { text, shadows } from "@/core/config/theme";
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
    <div 
      className="group bg-black/70 backdrop-blur-xl border border-white/20 shadow-lg rounded-xl overflow-hidden hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-500 hover:border-purple-400/60 hover:scale-[1.03] hover:-translate-y-1 hero-spotlight"
      onMouseMove={(e) => {
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        (e.currentTarget as HTMLElement).style.setProperty("--x", `${x}%`);
        (e.currentTarget as HTMLElement).style.setProperty("--y", `${y}%`);
      }}
    >
      {/* Imagem do produto */}
      <div className="aspect-square bg-gradient-to-br from-gray-800/50 to-gray-900/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
        <ProductImage
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          containerClassName="w-full h-full"
        />
        
        {/* Badge de estoque melhorado */}
        <div className={cn(
          'absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-md shadow-lg transition-all duration-300 group-hover:scale-105',
          isOutOfStock 
            ? 'bg-red-500/30 text-red-200 border-red-400/50 shadow-red-500/25' 
            : product.stock_quantity <= 5
            ? 'bg-orange-500/30 text-orange-200 border-orange-400/50 shadow-orange-500/25'
            : 'bg-emerald-500/30 text-emerald-200 border-emerald-400/50 shadow-emerald-500/25'
        )}>
          {isOutOfStock ? '⚠️ Esgotado' : product.stock_quantity <= 5 ? `⚡ ${product.stock_quantity} restam` : `✓ ${product.stock_quantity} disponível`}
        </div>
      </div>

      {/* Informações do produto */}
      <div className="p-4 space-y-3">
        <div className="space-y-2">
          <h3 
            className="font-bold line-clamp-2 h-12 text-lg leading-tight"
            style={{ color: '#FF4B01' }}
          >
            {product.name}
          </h3>
          
          {/* Preço com destaque maior */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-2xl font-bold block text-yellow-400">
                {formatCurrency(product.price)}
              </span>
              {product.category && (
                <span className="text-xs opacity-75 text-gray-300">
                  {product.category}
                </span>
              )}
            </div>
          </div>
        </div>
        
        {/* Botão de ação melhorado */}
        <Button 
          size="sm" 
          onClick={() => onAddToCart(product)}
          disabled={isOutOfStock}
          className={cn(
            'w-full h-10 font-semibold transition-all duration-300 transform',
            isOutOfStock 
              ? 'bg-gray-600/30 text-gray-400 border border-gray-500/40 cursor-not-allowed backdrop-blur-sm'
              : 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-black hover:from-yellow-300 hover:to-yellow-400 border border-yellow-400/50 shadow-lg hover:shadow-yellow-400/30 hover:scale-105 active:scale-95'
          )}
          aria-label={isOutOfStock ? `Produto ${product.name} indisponível` : `Adicionar ${product.name} ao carrinho`}
        >
          <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
          {isOutOfStock ? '❌ Indisponível' : '🛒 Adicionar'}
        </Button>
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