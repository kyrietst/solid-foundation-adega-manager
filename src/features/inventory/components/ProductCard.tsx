/**
 * Card individual do produto
 * Sub-componente especializado para exibição de produto individual
 */

import React from 'react';
import { Button } from '@/shared/ui/primitives/button';
import { Plus } from 'lucide-react';
import type { Product } from '@/types/inventory.types';
import { formatCurrency, cn } from '@/core/config/utils';
import { getGlassCardClasses, getHoverTransformClasses } from '@/core/config/theme-utils';
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
      className={cn(
        "group hero-spotlight rounded-2xl border border-white/20 bg-black/70 backdrop-blur-md text-card-foreground shadow-[0_8px_24px_rgba(0,0,0,0.6)] overflow-hidden transition-all duration-200",
        getHoverTransformClasses('lift'),
        "hover:shadow-2xl hover:shadow-purple-500/20 hover:border-purple-400/60",
        glassClasses
      )}
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

      {/* Informações do produto - Seguindo padrão CardHeader/CardContent */}
      <div className="p-5 space-y-3">
        <div className="space-y-2">
          <h3 
            className="font-bold line-clamp-2 h-12 text-lg leading-tight text-gray-300"
            style={{ color: '#FF2400' }}
          >
            {product.name}
          </h3>
          
          {/* Preço com cores padronizadas */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-2xl font-bold block text-primary-yellow">
                {formatCurrency(product.price)}
              </span>
              {product.category && (
                <span className="text-xs text-gray-400">
                  {product.category}
                </span>
              )}
            </div>
          </div>
        </div>
        
        {/* Botão com cores padronizadas do sistema */}
        <Button 
          size="sm" 
          onClick={() => onAddToCart(product)}
          disabled={isOutOfStock}
          className={cn(
            'w-full h-10 font-semibold transition-all duration-200',
            getHoverTransformClasses('scale'),
            isOutOfStock 
              ? 'bg-gray-600/30 text-gray-400 border border-gray-500/40 cursor-not-allowed backdrop-blur-sm'
              : 'bg-gradient-to-r from-primary-yellow to-yellow-500 text-black hover:from-yellow-300 hover:to-yellow-400 border border-primary-yellow/50 shadow-lg hover:shadow-yellow-400/30'
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