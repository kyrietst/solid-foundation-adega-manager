/**
 * Card PREMIUM "Stitch Design" para POS/Vendas
 * Aspect Ratio 3/4, Glassmorphism e Interações Refinadas
 */

import React from 'react';
import { Badge } from '@/shared/ui/primitives/badge';
import { Plus, Package, AlertTriangle } from 'lucide-react';
import type { Product } from '@/core/types/inventory.types';
import { formatCurrency, cn } from '@/core/config/utils';
import { OptimizedImage } from '@/shared/ui/composite/optimized-image';

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
}) => {

  // Dados unificados de estoque
  const stockPackages = product.stock_packages || 0;
  const stockUnitsLoose = product.stock_units_loose || 0;

  const isOutOfStock = stockPackages === 0 && stockUnitsLoose === 0;
  const hasMultipleOptions = stockPackages > 0 && stockUnitsLoose > 0;

  // Handler de clique
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    
    if (hasMultipleOptions && onOpenSelection) {
      onOpenSelection(product);
    } else {
      onAddToCart(product);
    }
  };

  return (
    <div
      onClick={handleClick}
      className="group relative bg-white/5 border border-white/5 hover:border-primary/50 rounded-xl p-3 cursor-pointer transition-all hover:bg-white/10 hover:shadow-[0_0_20px_rgba(0,0,0,0.5)] hover:-translate-y-1 overflow-hidden"
    >
      {/* Imagem (Aspect Ratio 3/4) com Zoom Effect */}
      <div className="aspect-[3/4] w-full mb-3 relative rounded-lg overflow-hidden bg-black/20">
        <div className="w-full h-full transition-transform duration-500 group-hover:scale-110 flex items-center justify-center bg-gray-900/40">
           {product.image_url ? (
            <OptimizedImage
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
           ) : (
            <Package className="h-12 w-12 text-gray-600" />
           )}
        </div>

        {/* Floating Add Button - Aparece no Hover */}
        {!isOutOfStock && (
            <button 
                onClick={handleClick}
                className="absolute bottom-2 right-2 size-8 rounded-full bg-primary text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg scale-90 group-hover:scale-100 hover:bg-[#e0b71f]"
            >
                <Plus className="h-5 w-5" />
            </button>
        )}

        {/* Status Badges - Smart Inventory Logic */}
        <>
            {/* Out of Stock - Center/Overlay? No, Keep Top Right for consistency, or overlay */}
            {isOutOfStock && (
                <div className="absolute top-2 right-2 z-10">
                    <Badge className="bg-red-500/90 text-white text-[10px] uppercase font-bold px-2 py-0.5 backdrop-blur-md border border-red-500/30 shadow-lg">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Esgotado
                    </Badge>
                </div>
            )}

            {!isOutOfStock && (
                <>
                    {/* Unit Badge (Top-Left) - Green */}
                    {stockUnitsLoose > 0 && (
                        <div className="absolute top-2 left-2 z-10">
                            <Badge className="bg-emerald-500/90 hover:bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 backdrop-blur-md border border-emerald-500/30 shadow-sm">
                                {stockUnitsLoose} un
                            </Badge>
                        </div>
                    )}

                    {/* Package Badge (Top-Right) - Blue */}
                    {stockPackages > 0 && (
                        <div className="absolute top-2 right-2 z-10">
                            <Badge className="bg-blue-600/90 hover:bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 backdrop-blur-md border border-blue-500/30 shadow-sm">
                                <Package className="h-3 w-3 mr-1 inline-block" />
                                CX: {stockPackages}
                            </Badge>
                        </div>
                    )}
                </>
            )}
        </>
      </div>

      {/* Product Info */}
      <div className="space-y-1">
        <div className="flex justify-between items-start">
             <h3 className="text-white text-sm font-medium leading-tight line-clamp-2 min-h-[2.5em]" title={product.name}>
                {product.name}
             </h3>
        </div>
        
        <div className="flex items-end justify-between pt-1 border-t border-white/5 mt-2">
            <p className="text-xs text-gray-400">
                {product.volume || product.volume_ml || 'Unitário'}
            </p>
            <p className="text-primary font-bold text-sm">
                {formatCurrency(product.price)}
            </p>
        </div>
      </div>
    </div>
  );
});