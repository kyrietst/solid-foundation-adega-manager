
/**
 * SimpleEditProductModal.tsx - TACTICAL STITCH EDIT SHEET
 * Layout: 3-Col Side Sheet (Glass/Dark Mode) - Reusing Stitch Components
 */

import React, { useState } from 'react';
import { Sheet, SheetContent } from "@/shared/ui/primitives/sheet";
import { Form } from '@/shared/ui/primitives/form';
import { Button } from '@/shared/ui/primitives/button';
import { 
  Package, 
  X, 
  Save, 
  Lock,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import type { Product } from '@/core/types/inventory.types';

import { useProductFormLogic, ProductFormValues } from '@/features/inventory/hooks/useProductFormLogic';
import { useProductOperations } from '@/features/inventory/hooks/useProductOperations';
import { useProductResources } from '@/features/inventory/hooks/useProductResources';
import { useToast } from '@/shared/hooks/common/use-toast';
import { cn } from '@/core/config/utils';

// Stitch Components
import { ProductIdentitySection } from '@/features/inventory/components/product-form/stitch/ProductIdentitySection';
import { ProductLogisticsSection } from '@/features/inventory/components/product-form/stitch/ProductLogisticsSection';
import { ProductPricingSection } from '@/features/inventory/components/product-form/stitch/ProductPricingSection';
import { DeleteProductModal } from './DeleteProductModal';

interface SimpleEditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onSubmit: (data: ProductFormValues) => Promise<void> | void;
  isLoading?: boolean;
  onSuccess?: () => void;
}

export const SimpleEditProductModal: React.FC<SimpleEditProductModalProps> = ({
  isOpen,
  onClose,
  product,
  onSubmit,
  isLoading: isParentLoading,
  onSuccess
}) => {
  const { toast } = useToast();
  const [activeScanner, setActiveScanner] = useState<'main' | 'package' | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Form Logic
  const { form, handleSubmit: handleFormSubmit, isSubmitting, calculations } = useProductFormLogic({
    mode: 'edit',
    initialData: product,
    onSubmit: async (data: ProductFormValues) => {
      // Delegate to parent onSubmit which typically handles the update logic
      await onSubmit(data);
    },
    onSuccess: () => {
       onSuccess?.();
       // Don't auto-close here if parent dictates control, but usually we might want to.
       // The parent typically closes the modal on success.
    },
    onClose
  });

  // Resources
  const { categories, suppliers } = useProductResources(isOpen);

  const handleClose = () => {
    if (isSubmitting || isParentLoading) return;
    form.reset();
    setActiveScanner(null);
    onClose();
  };

  // Scan Handlers
  const handleScan = (code: string, type: 'main' | 'package') => {
     if (type === 'main') form.setValue('barcode', code);
     else form.setValue('package_barcode', code);
     
     setActiveScanner(null);
     toast({ 
        title: '✅ Código Lido', 
        description: `${code} atribuído ao campo ${type === 'main' ? 'Principal' : 'Fardo'}.`,
        className: "bg-emerald-500/20 border-emerald-500 text-white" 
     });
  };

  if (!product) return null;

  return (
    <>
      <Sheet open={isOpen} onOpenChange={(open) => !open && handleClose()}>
        <SheetContent 
          side="right" 
          className="w-full max-w-[1000px] sm:max-w-[1000px] bg-zinc-950 border-l border-white/5 p-0 shadow-[0_0_60px_rgba(0,0,0,0.6)] backdrop-blur-xl"
        >
          <div className="h-full flex flex-col">
            
            {/* HEADER TÁTICO */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-white/5 bg-zinc-900/30 backdrop-blur-md sticky top-0 z-50">
               <div className="flex flex-col">
                  <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                     <Package className="h-6 w-6 text-indigo-500" /> 
                     EDITAR PRODUTO
                  </h2>
                  <span className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-widest mt-1 ml-8">
                     SKU: {product.barcode || 'N/A'} • ID: {product.id.slice(0, 8)}...
                  </span>
               </div>
               
               <button 
                  onClick={handleClose} 
                  disabled={isSubmitting || isParentLoading}
                  className="group p-2 rounded-full hover:bg-white/10 transition-colors focus:outline-none disabled:opacity-50"
               >
                  <X className="h-6 w-6 text-zinc-500 group-hover:text-white transition-colors" />
               </button>
            </div>

            {/* BACKGROUND AMBIENT LIGHTING */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
               <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/5 rounded-full blur-[120px]" />
               <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/5 rounded-full blur-[120px]" />
            </div>

            {/* FORM GRID (SCROLLABLE) */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
               <Form {...form}>
                  <form onSubmit={handleFormSubmit} className="h-full">
                     <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
                        
                        {/* COLUNA 1: IDENTIDADE */}
                        <div className="lg:col-span-1">
                           <ProductIdentitySection 
                              categories={categories}
                              suppliers={suppliers}
                              isScanning={activeScanner === 'main'}
                              onStartScan={() => setActiveScanner('main')}
                              onScan={(code) => handleScan(code, 'main')}
                           />
                        </div>

                        {/* COLUNA 2: LOGÍSTICA & FISCAL */}
                        <div className="lg:col-span-1 border-l border-white/5 lg:pl-8">
                           <ProductLogisticsSection 
                              isScanningPackage={activeScanner === 'package'}
                              onStartScanPackage={() => setActiveScanner('package')}
                              onScanPackage={(code) => handleScan(code, 'package')}
                           />
                        </div>

                        {/* COLUNA 3: PRECIFICAÇÃO */}
                        <div className="lg:col-span-1 lg:pl-2">
                           <ProductPricingSection calculations={calculations} />
                        </div>

                     </div>
                  </form>
               </Form>
            </div>

            {/* FOOTER (FIXO) */}
            <div className="border-t border-white/5 bg-zinc-900/80 backdrop-blur-xl px-8 py-6 sticky bottom-0 z-50 flex items-center justify-between">
               
               {/* Danger Zone - Delete Button */}
               <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="flex items-center gap-2 text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 px-4 group/delete"
               >
                  <Trash2 className="h-4 w-4 group-hover/delete:animate-bounce" />
                  <span className="text-xs font-bold tracking-widest uppercase">Excluir Produto</span>
               </Button>

               <div className="flex items-center gap-4">
                  <Button 
                     type="button"
                     variant="ghost"
                     onClick={handleClose}
                     disabled={isSubmitting || isParentLoading}
                     className="rounded-full px-6 text-zinc-400 hover:text-white hover:bg-white/5"
                  >
                     Cancelar
                  </Button>

                  <Button 
                     onClick={handleFormSubmit}
                     disabled={isSubmitting || isParentLoading}
                     className="relative group rounded-full px-8 py-6 bg-indigo-600 hover:bg-indigo-500 text-white font-bold tracking-wide shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_35px_rgba(99,102,241,0.6)] hover:scale-[1.02] transition-all overflow-hidden"
                  >
                     {/* Shine Effect */}
                     <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                     
                     <span className="relative flex items-center gap-2">
                        {(isSubmitting || isParentLoading) ? (
                           <>Processando...</>
                        ) : (
                           <>
                             <Save className="h-4 w-4" /> SALVAR ALTERAÇÕES
                           </>
                        )}
                     </span>
                  </Button>
               </div>
            </div>

          </div>
        </SheetContent>
      </Sheet>

      {/* MODAL DE DELEÇÃO (Mantido e conectado) */}
      <DeleteProductModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        productId={product.id}
        productName={product.name || ''}
        onSuccess={() => {
          setIsDeleteModalOpen(false);
          onClose(); // Fecha o modal de edição tb
          onSuccess?.();
        }}
      />
    </>
  );
};

export default SimpleEditProductModal;
