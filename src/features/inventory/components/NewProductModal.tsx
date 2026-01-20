
/**
 * NewProductModal.tsx - TACTICAL STITCH REDESIGN
 * Layout: 3-Col Side Sheet (Glass/Dark Mode)
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
  MinusCircle
} from 'lucide-react';

import { useProductFormLogic } from '@/features/inventory/hooks/useProductFormLogic';
import { useProductOperations } from '@/features/inventory/hooks/useProductOperations';
import { useProductResources } from '@/features/inventory/hooks/useProductResources';
import { useToast } from '@/shared/hooks/common/use-toast';
import { cn } from '@/core/config/utils';

// Stitch Components
import { ProductIdentitySection } from '@/features/inventory/components/product-form/stitch/ProductIdentitySection';
import { ProductLogisticsSection } from '@/features/inventory/components/product-form/stitch/ProductLogisticsSection';
import { ProductPricingSection } from '@/features/inventory/components/product-form/stitch/ProductPricingSection';

interface NewProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const NewProductModal: React.FC<NewProductModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { toast } = useToast();
  const [activeScanner, setActiveScanner] = useState<'main' | 'package' | null>(null);

  // Hook operations
  const { createProduct } = useProductOperations(() => {});

  // Form Logic
  const { form, handleSubmit, isSubmitting, calculations } = useProductFormLogic({
    mode: 'create',
    onSubmit: async (data) => {
      // Custom Validations
      if (data.barcode && !/^[0-9]{8,14}$/.test(data.barcode)) {
        toast({ title: '❌ Validação', description: 'Código de barras inválido', variant: 'destructive' });
        throw new Error('Invalid Barcode');
      }
      if (data.package_barcode && !/^[0-9]{8,14}$/.test(data.package_barcode)) {
         toast({ title: '❌ Validação', description: 'Código do fardo inválido', variant: 'destructive' });
         throw new Error('Invalid Package Barcode');
      }
      
      await createProduct(data);
    },
    onSuccess,
    onClose
  });

  // Resources
  const { categories, suppliers } = useProductResources(isOpen);

  const handleClose = () => {
    if (isSubmitting) return;
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

  return (
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
                   <Package className="h-6 w-6 text-primary" /> 
                   NOVO PRODUTO
                </h2>
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1 ml-8">
                   Cadastro Unificado v2.0
                </span>
             </div>
             
             <button 
                onClick={handleClose} 
                disabled={isSubmitting}
                className="group p-2 rounded-full hover:bg-white/10 transition-colors focus:outline-none disabled:opacity-50"
             >
                <X className="h-6 w-6 text-zinc-500 group-hover:text-white transition-colors" />
             </button>
          </div>

          {/* BACKGROUND AMBIENT LIGHTING */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
             <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
             <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/5 rounded-full blur-[120px]" />
          </div>

          {/* FORM GRID (SCROLLABLE) */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
             <Form {...form}>
                <form onSubmit={handleSubmit} className="h-full">
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
             <div className="hidden sm:flex items-center gap-2 text-zinc-600 text-[10px] font-bold tracking-widest uppercase">
                <Lock className="h-3 w-3" />
                Dados Seguros & Criptografados
             </div>

             <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
                <Button 
                   type="button"
                   variant="ghost"
                   onClick={handleClose}
                   disabled={isSubmitting}
                   className="rounded-full px-6 text-zinc-400 hover:text-white hover:bg-white/5"
                >
                   Cancelar
                </Button>

                <Button 
                   onClick={handleSubmit}
                   disabled={isSubmitting}
                   className="relative group rounded-full px-8 py-6 bg-primary hover:bg-primary/90 text-white font-bold tracking-wide shadow-[0_0_20px_rgba(149,19,236,0.3)] hover:shadow-[0_0_35px_rgba(149,19,236,0.6)] hover:scale-[1.02] transition-all overflow-hidden"
                >
                   {/* Shine Effect */}
                   <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                   
                   <span className="relative flex items-center gap-2">
                      {isSubmitting ? (
                         <>Processing...</>
                      ) : (
                         <>
                           <Save className="h-4 w-4" /> SALVAR PRODUTO
                         </>
                      )}
                   </span>
                </Button>
             </div>
          </div>

        </div>
      </SheetContent>
    </Sheet>
  );
};

export default NewProductModal;