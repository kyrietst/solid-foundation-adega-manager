
import React from 'react';
import { Sheet, SheetContent } from "@/shared/ui/primitives/sheet";
import { Button } from '@/shared/ui/primitives/button';
import { X, Share2, Package, Smartphone, Edit, History, Box, Lock } from 'lucide-react';
import { cn } from '@/core/config/utils';
import { useProductAnalytics } from '@/features/inventory/hooks/useProductAnalytics';
import type { Product } from '@/core/types/inventory.types';

// Stitch Components
import { ProductIdentityCard } from './product-view/stitch/ProductIdentityCard';
import { ProductSpecsCard } from './product-view/stitch/ProductSpecsCard';
import { ProductIntelligenceCard } from './product-view/stitch/ProductIntelligenceCard';

interface SimpleProductViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (product: Product) => void;
  onAdjustStock: (product: Product) => void;
  onViewHistory: (product: Product) => void;
}

export const SimpleProductViewModal: React.FC<SimpleProductViewModalProps> = ({
  product,
  isOpen,
  onClose,
  onEdit,
  onAdjustStock,
  onViewHistory,
}) => {
  const {
    analytics,
  } = useProductAnalytics(product?.id || null);

  if (!product) return null;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent 
        side="right" 
        className="w-full max-w-[1200px] sm:max-w-[1200px] bg-zinc-950 border-l border-white/5 p-0 shadow-[0_0_60px_rgba(0,0,0,0.6)] backdrop-blur-xl"
      >
        <div className="h-full flex flex-col">
            
            {/* HEADER */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-white/5 bg-zinc-900/30 backdrop-blur-md sticky top-0 z-50">
               <div className="flex flex-col">
                  <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                     <Package className="h-6 w-6 text-emerald-500" /> 
                     {product.name}
                  </h2>
                  <div className="flex items-center gap-3 mt-1 ml-9">
                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                       #{product.category.substring(0, 3).toUpperCase()}-{(product.barcode || '000').slice(-4)}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-zinc-700" />
                     <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-bold text-emerald-500 tracking-wide">SISTEMA ONLINE</span>
                     </div>
                  </div>
               </div>
               
               <div className="flex items-center gap-3">
                  <button className="h-10 px-4 rounded-lg bg-white/5 border border-white/10 text-sm font-medium hover:bg-white/10 transition flex items-center gap-2 text-zinc-300">
                     <Share2 className="h-4 w-4" />
                     Compartilhar
                  </button>
                  <button 
                     onClick={onClose} 
                     className="group p-2 rounded-full hover:bg-white/10 transition-colors focus:outline-none"
                  >
                     <X className="h-6 w-6 text-zinc-500 group-hover:text-white transition-colors" />
                  </button>
               </div>
            </div>

            {/* BACKGROUND AMBIENT LIGHTING */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
               <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/5 rounded-full blur-[120px]" />
               <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-500/5 rounded-full blur-[120px]" />
            </div>

            {/* MAIN CONTENT (SCROLLABLE) */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-8 bg-black/20">
               <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-20">
                  
                  {/* Column 1: Identity (3 cols) */}
                  <ProductIdentityCard 
                    product={product} 
                    onEdit={onEdit} 
                    onAdjustStock={onAdjustStock} 
                    onViewHistory={onViewHistory} 
                  />

                  {/* Column 2: Specs (5 cols) */}
                  <ProductSpecsCard product={product} />

                  {/* Column 3: Intelligence (4 cols) */}
                  <ProductIntelligenceCard product={product} analytics={analytics} />

               </div>
            </div>

            {/* FOOTER */}
            <div className="border-t border-white/5 bg-zinc-900/80 backdrop-blur-xl px-8 py-4 sticky bottom-0 z-50 flex items-center justify-between">
               <div className="flex items-center gap-2 text-zinc-600 text-xs font-medium">
                  <Lock className="h-3 w-3" />
                  ID do Produto: {product.id}
               </div>

               <div className="flex items-center justify-end w-full sm:w-auto gap-3">
                   <Button 
                     onClick={() => onViewHistory(product)}
                     variant="outline"
                     className="h-10 border-zinc-700 text-zinc-400 hover:text-white hover:border-violet-500 hover:bg-violet-500/10 transition-all rounded-full"
                   >
                     <History className="h-4 w-4 mr-2" /> Histórico
                   </Button>

                   <Button 
                     onClick={() => onAdjustStock(product)}
                     variant="outline"
                     className="h-10 border-zinc-700 text-zinc-400 hover:text-white hover:border-amber-500 hover:bg-amber-500/10 transition-all rounded-full"
                   >
                     <Box className="h-4 w-4 mr-2" /> Ajustar Estoque
                   </Button>

                   <Button 
                     onClick={() => onEdit(product)}
                     className="h-10 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-[0_0_20px_rgba(16,185,129,0.3)] border border-emerald-400/20 rounded-full"
                   >
                     <Edit className="h-4 w-4 mr-2" /> EDITAR
                   </Button>
               </div>
            </div>
            
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SimpleProductViewModal;
