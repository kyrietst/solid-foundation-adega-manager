import React from 'react';
import { Button } from '@/shared/ui/primitives/button';
import { Eye, Edit, Package, Archive, ArrowRightLeft, SlidersHorizontal, AlertTriangle } from 'lucide-react';
import { cn, formatCurrency } from '@/core/config/utils';
import { OptimizedImage } from '@/shared/ui/composite/optimized-image';
import type { Product } from '@/core/types/inventory.types';

interface InventoryCardProps {
  product: Product;
  onViewDetails: (product: Product) => void;
  onEdit: (product: Product) => void;
  onAdjustStock?: (product: Product) => void;
  onTransfer?: (product: Product) => void;
  storeFilter?: string; // Legacy
  variant?: 'default' | 'premium' | 'success' | 'warning' | 'error';
  glassEffect?: boolean;
}

export const InventoryCard: React.FC<InventoryCardProps> = ({
  product,
  onViewDetails,
  onEdit,
  onAdjustStock,
  onTransfer,
  variant = 'default',
}) => {
  const stockPackages = product.stock_packages || 0;
  const stockUnitsLoose = product.stock_units_loose || 0;
  const totalUnits = stockPackages * (product.units_per_package || 1) + stockUnitsLoose;
  const minStock = product.minimum_stock || 0;
  const isLowStock = totalUnits <= minStock;

  return (
    <div className={cn(
      "group relative flex flex-col bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-2xl transition-all duration-300 p-4 gap-4",
      "hover:border-[#f9cb15]/30 hover:shadow-[0_4px_24px_-12px_rgba(249,203,21,0.1)]",
      isLowStock ? "border-red-900/30 hover:border-red-500/50" : ""
    )}>
        
        {/* Low Stock Indicator Ping */}
        {isLowStock && (
            <div className="absolute -right-1 -top-1">
                <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
            </div>
        )}

      <div className="flex gap-4">
        {/* Product Image */}
        <div className="size-20 rounded-xl bg-black/20 shrink-0 border border-white/10 overflow-hidden flex items-center justify-center">
            {product.image_url ? (
                <OptimizedImage
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                />
            ) : (
                <Package className="h-8 w-8 text-zinc-600" />
            )}
        </div>

        {/* Product Info */}
        <div className="flex flex-col justify-center min-w-0">
          <h3 className={cn(
               "text-white text-base font-bold leading-tight truncate pr-2 transition-colors",
               isLowStock ? "group-hover:text-red-400" : "group-hover:text-[#f9cb15]"
           )}>
            {product.name}
          </h3>
          <p className="text-zinc-400 text-xs font-medium mt-1">
             {product.category || 'Sem Categoria'}
          </p>
          <span className="text-xs text-zinc-600 font-mono mt-1">
             SKU: {product.barcode || '---'}
          </span>
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-2 gap-3">
        {/* Inventory Block */}
        <div className={cn(
            "flex flex-col gap-1 rounded-lg p-3 border",
            isLowStock ? "bg-red-500/10 border-red-500/20" : "bg-black/40 border-white/5"
        )}>
           <div className={cn(
               "flex items-center gap-2 text-xs uppercase tracking-wider font-semibold",
               isLowStock ? "text-red-400" : "text-zinc-400"
           )}>
              {isLowStock ? <AlertTriangle className="text-[16px]" /> : <Archive className="text-[16px]" />}
              {isLowStock ? 'Baixo' : 'Estoque'}
           </div>
           <div className="flex items-baseline gap-1 mt-1">
              <span className={cn("text-xl font-bold", isLowStock ? "text-red-500" : "text-white")}>
                 {stockUnitsLoose}
              </span>
              <span className={cn("text-xs", isLowStock ? "text-red-400/70" : "text-zinc-500")}>unid.</span>
           </div>
           <div className={cn("text-xs", isLowStock ? "text-red-400/60" : "text-zinc-600")}>
               {stockPackages} Caixas
           </div>
        </div>

        {/* Price Block */}
        <div className="flex flex-col gap-1 bg-black/40 rounded-lg p-3 border border-white/5">
           <div className="flex items-center gap-2 text-zinc-400 text-xs uppercase tracking-wider font-semibold">
              <span className="material-symbols-outlined text-[16px]">$</span> Preço
           </div>
           <div className="flex items-baseline gap-1 mt-1">
              <span className="text-white text-xl font-bold">
                 {/* Only showing integer part for style? No, let's show full formatCurrency but stripped for style if needed. 
                     FormatCurrency returns "R$ 10,00". Let's just render it normally for now as splitting currency components is risky without robust logic.
                  */}
                 {formatCurrency(product.price)}
              </span>
           </div>
           <div className="text-xs text-zinc-600">
               Custo: {product.cost_price ? formatCurrency(product.cost_price) : '--'}
           </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-2">
         <div className="flex gap-1">
            <button 
                onClick={() => onViewDetails(product)}
                className="size-9 flex items-center justify-center rounded-lg text-zinc-400 hover:bg-white/10 hover:text-white transition-colors" 
                title="Ver Detalhes"
            >
               <Eye className="h-5 w-5" />
            </button>
            <button 
                onClick={() => onEdit(product)}
                className="size-9 flex items-center justify-center rounded-lg text-zinc-400 hover:bg-white/10 hover:text-white transition-colors" 
                title="Editar Produto"
            >
               <Edit className="h-5 w-5" />
            </button>
             {onTransfer && (
                <button 
                    onClick={() => onTransfer(product)}
                    className="size-9 flex items-center justify-center rounded-lg text-blue-400 hover:bg-blue-500/10 hover:text-blue-300 transition-colors" 
                    title="Transferir"
                >
                   <ArrowRightLeft className="h-5 w-5" />
                </button>
             )}
         </div>

         {onAdjustStock && (
             <button 
                onClick={() => onAdjustStock(product)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[#f9cb15] text-[#f9cb15] text-xs font-bold uppercase tracking-wide hover:bg-[#f9cb15] hover:text-black transition-all"
             >
                <SlidersHorizontal className="h-4 w-4" /> 
                Ajustar
             </button>
         )}
      </div>
    </div>
  );
};

export default InventoryCard;