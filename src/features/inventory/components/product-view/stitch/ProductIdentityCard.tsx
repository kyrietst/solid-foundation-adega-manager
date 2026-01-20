
import React from 'react';
import { cn } from '@/core/config/utils';
import { Package, Smartphone, Edit, History, Archive, Share2, Box } from 'lucide-react';
import { Button } from '@/shared/ui/primitives/button';
import { Badge } from '@/shared/ui/primitives/badge';
import type { Product } from '@/core/types/inventory.types';

interface ProductIdentityCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onAdjustStock: (product: Product) => void;
  onViewHistory: (product: Product) => void;
}

export const ProductIdentityCard: React.FC<ProductIdentityCardProps> = ({
  product,
  onEdit,
  onAdjustStock,
  onViewHistory
}) => {
  const stockStatus = product.stock_quantity <= (product.minimum_stock || 0) 
    ? (product.stock_quantity === 0 ? 'out' : 'low') 
    : 'available';

  return (
    <div className="lg:col-span-3 h-full w-full rounded-xl bg-white/[0.02] border border-white/5 flex flex-col gap-4 p-5">
      {/* Image Card */}
      <div className="aspect-square w-full rounded-lg bg-black/20 relative overflow-hidden border border-white/5 group shadow-lg">
        {product.image_url ? (
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
            style={{ backgroundImage: `url('${product.image_url}')` }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center flex-col text-zinc-600">
             <Package className="h-16 w-16 mb-2 opacity-20" />
             <span className="text-sm">Sem imagem</span>
          </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-60"></div>
        
        <div className="absolute top-3 left-3">
           {stockStatus === 'available' && (
             <span className="px-3 py-1 rounded bg-emerald-500 text-zinc-950 text-xs font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(16,185,129,0.4)] border border-emerald-500/50">
                Em Estoque
             </span>
           )}
           {stockStatus === 'low' && (
             <span className="px-3 py-1 rounded bg-amber-500 text-zinc-950 text-xs font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(245,158,11,0.4)] border border-amber-500/50">
                Estoque Baixo
             </span>
           )}
           {stockStatus === 'out' && (
             <span className="px-3 py-1 rounded bg-rose-500 text-zinc-950 text-xs font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(244,63,94,0.4)] border border-rose-500/50">
                Esgotado
             </span>
           )}
        </div>
        
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center gap-2 text-zinc-400 text-xs font-mono bg-black/60 backdrop-blur-md px-2 py-1 rounded w-fit border border-white/5">
            <span className="text-emerald-500">●</span>
            Verified just now
          </div>
        </div>
      </div>

      {/* Stock Big Number */}
      <div className="bg-black/20 border border-white/5 p-5 rounded-lg flex flex-col items-center justify-center gap-1 shadow-md relative overflow-hidden backdrop-blur-sm">
        <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-bl-full -mr-8 -mt-8"></div>
        <span className="text-zinc-400 text-[10px] font-medium uppercase tracking-widest">Estoque Físico</span>
        <span className="text-6xl font-mono font-bold text-emerald-500 drop-shadow-[0_0_15px_rgba(16,185,129,0.2)] tracking-tighter">
          {product.stock_quantity}
        </span>
        <span className="text-xs text-zinc-500 font-mono">UNIDADES DISPONÍVEIS</span>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3 mt-2">
        <button 
          onClick={() => onEdit(product)}
          className="flex items-center justify-between w-full h-12 px-4 rounded-lg bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-emerald-500/50 text-zinc-400 hover:text-white transition group relative overflow-hidden"
        >
          <span className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 scale-y-0 group-hover:scale-y-100 transition-transform"></span>
          <span className="text-sm font-medium pl-2">Editar Detalhes</span>
          <Edit className="h-4 w-4 text-zinc-600 group-hover:text-emerald-500 transition-colors" />
        </button>
        
        <button 
          onClick={() => onAdjustStock(product)}
          className="flex items-center justify-between w-full h-12 px-4 rounded-lg bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-amber-500/50 text-zinc-400 hover:text-white transition group relative overflow-hidden"
        >
          <span className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500 scale-y-0 group-hover:scale-y-100 transition-transform"></span>
          <span className="text-sm font-medium pl-2">Ajustar Estoque</span>
          <Box className="h-4 w-4 text-zinc-600 group-hover:text-amber-500 transition-colors" />
        </button>

        <button 
          onClick={() => onViewHistory(product)}
          className="flex items-center justify-between w-full h-12 px-4 rounded-lg bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-violet-500/50 text-zinc-400 hover:text-white transition group relative overflow-hidden"
        >
          <span className="absolute left-0 top-0 bottom-0 w-1 bg-violet-500 scale-y-0 group-hover:scale-y-100 transition-transform"></span>
          <span className="text-sm font-medium pl-2">Ver Histórico</span>
          <History className="h-4 w-4 text-zinc-600 group-hover:text-violet-500 transition-colors" />
        </button>
      </div>
    </div>
  );
};
