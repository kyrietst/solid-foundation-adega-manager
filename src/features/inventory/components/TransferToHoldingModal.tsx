/**
 * TransferToHoldingModal.tsx - LOGISTIC BRIDGE UI
 * Design: Tactical Stitch - Bridge Layout (Origin -> Bridge -> Destination)
 */

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { 
  X, 
  Store, 
  ArrowRight, 
  Warehouse, 
  Package, 
  Box, 
  Info, 
  Minus, 
  Plus, 
  Truck, 
  Edit3 
} from 'lucide-react';
import { cn } from '@/core/config/utils';
import type { Product } from '@/core/types/inventory.types';
import { useStockTransfer } from '@/features/inventory/hooks/useStockOperations';
import { useAuth } from '@/app/providers/AuthContext';
import { Button } from '@/shared/ui/primitives/button';

// Schema Validation
const transferSchema = z.object({
  packages: z.number().min(0).default(0),
  unitsLoose: z.number().min(0).default(0),
  notes: z.string().optional(),
}).refine(
  (data) => data.packages > 0 || data.unitsLoose > 0,
  { message: 'Transfira pelo menos 1 item.', path: ['packages'] }
);

type TransferFormData = z.infer<typeof transferSchema>;

interface TransferToHoldingModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const TransferToHoldingModal: React.FC<TransferToHoldingModalProps> = ({
  product,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const transferMutation = useStockTransfer();
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { isSubmitting }
  } = useForm<TransferFormData>({
    resolver: zodResolver(transferSchema),
    defaultValues: { packages: 0, unitsLoose: 0, notes: '' },
  });

  const packagesToTransfer = watch('packages');
  const unitsToTransfer = watch('unitsLoose');

  const handleClose = () => {
    if (isSubmitting) return;
    reset();
    onClose();
  };

  const onSubmit = (data: TransferFormData) => {
    if (!product || !user?.id) return;

    transferMutation.mutate({
      productId: product.id,
      packages: data.packages,
      unitsLoose: data.unitsLoose,
      notes: data.notes,
      userId: user.id
    }, {
      onSuccess: () => {
        onSuccess?.();
        handleClose();
      }
    });
  };

  // Helper Inputs
  const handleIncrement = (field: 'packages' | 'unitsLoose', max: number) => {
    const current = field === 'packages' ? packagesToTransfer : unitsToTransfer;
    if (current < max) setValue(field, current + 1);
  };

  const handleDecrement = (field: 'packages' | 'unitsLoose') => {
    const current = field === 'packages' ? packagesToTransfer : unitsToTransfer;
    if (current > 0) setValue(field, current - 1);
  };

  if (!product) return null;

  // Calculos Visuais
  const originStockPackages = product.stock_packages || 0;
  const originStockUnits = product.stock_units_loose || 0;
  
  const destStockPackages = product.store2_holding_packages || 0;
  
  // Future State
  const futureDestPackages = destStockPackages + packagesToTransfer;

  const capacityPercent = Math.min(100, Math.round((originStockPackages / 500) * 100)); // Simulando max 500

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content 
          className={cn(
            "fixed left-[50%] top-[50%] z-50 grid w-full max-w-6xl translate-x-[-50%] translate-y-[-50%] gap-4 border border-zinc-800 bg-zinc-950 p-0 shadow-2xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-2xl overflow-hidden",
            "max-h-[90vh] flex flex-col"
          )}
        >
          {/* Background Ambience */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
              <div 
                className="absolute inset-0 opacity-[0.03] mix-blend-overlay" 
                style={{ 
                  backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)`,
                  backgroundSize: '20px 20px'
                }}
              />
              <div className="absolute top-[-20%] left-[20%] w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[120px]" />
              <div className="absolute bottom-[-20%] right-[20%] w-[600px] h-[600px] bg-violet-500/10 rounded-full blur-[120px]" />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full">

            {/* HEADER */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-white/5 bg-zinc-900/30 backdrop-blur-md sticky top-0 z-50">
              <div className="flex flex-col">
                <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                  <Truck className="h-6 w-6 text-cyan-400" />
                  TRANSFERÊNCIA DE ESTOQUE
                </h1>
                <div className="flex items-center gap-3 mt-1 ml-9">
                   <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                      LOGISTIC BRIDGE
                   </span>
                   <span className="w-1 h-1 rounded-full bg-zinc-700" />
                   <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                      {product.name}
                   </span>
                </div>
              </div>
              <button 
                type="button"
                onClick={handleClose}
                className="group p-2 rounded-full hover:bg-white/10 transition-colors focus:outline-none"
              >
                <X className="h-6 w-6 text-zinc-500 group-hover:text-white transition-colors" />
              </button>
            </div>

            {/* MAIN CONTENT - THE BRIDGE */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full items-stretch">
                
                {/* SETOR ESQUERDO: ORIGEM (LOJA 1) */}
                <div className="lg:col-span-3 flex flex-col gap-4">
                  <div className="flex-1 bg-zinc-900/60 backdrop-blur-xl border border-white/10 rounded-xl p-6 border-l-4 border-l-cyan-500 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl -mr-10 -mt-10 transition-opacity group-hover:opacity-100 opacity-50 pointer-events-none" />
                    
                    <div className="relative z-10 flex flex-col h-full justify-between">
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2 text-cyan-500">
                          <Store className="h-5 w-5" />
                          <span className="text-xs font-bold tracking-wider uppercase">Origem</span>
                        </div>
                        <div>
                          <h2 className="text-lg font-bold text-white leading-tight">LOJA 1 (VENDAS)</h2>
                          <p className="text-zinc-500 text-xs mt-1">Status: Ativo</p>
                        </div>
                      </div>

                      <div className="my-8">
                        <p className="text-zinc-400 text-xs font-medium uppercase tracking-widest mb-2">Estoque Disponível</p>
                        <div className="flex items-baseline gap-2">
                          <span className="text-5xl font-bold text-white tracking-tighter">{originStockPackages}</span>
                          <span className="text-lg text-zinc-500 font-medium">pks.</span>
                        </div>
                        <div className="flex items-baseline gap-2 mt-1">
                          <span className="text-xl font-bold text-zinc-400 tracking-tighter">{originStockUnits}</span>
                          <span className="text-xs text-zinc-600 font-medium">un. soltas</span>
                        </div>
                      </div>

                      <div className="space-y-3">
                         <div className="flex justify-between text-xs text-zinc-400">
                            <span>Capacidade (Est)</span>
                            <span>{capacityPercent}%</span>
                         </div>
                         <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                            <div className="h-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]" style={{ width: `${capacityPercent}%` }} />
                         </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SETOR CENTRAL: BRIDGE (INPUTS) */}
                <div className="lg:col-span-6 flex flex-col gap-6">
                  
                  {/* Top Flow Indicator */}
                  <div className="flex items-center justify-center gap-4 py-4">
                     <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-zinc-700 to-zinc-700" />
                     <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-zinc-900 border border-zinc-700 shadow-xl group">
                        <div className="absolute inset-0 rounded-full bg-cyan-500/10 animate-pulse" />
                        <ArrowRight className="h-8 w-8 text-white group-hover:translate-x-1 transition-transform" />
                     </div>
                     <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-zinc-700 to-zinc-700" />
                  </div>

                  {/* DUAL CORE INPUTS */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                      
                      {/* MODULE 1: PACKAGES (CYAN) */}
                      <div className="bg-zinc-900/60 backdrop-blur-xl border border-white/10 rounded-xl p-6 flex flex-col items-center justify-center gap-6 relative overflow-hidden group hover:border-cyan-500/30 transition-colors">
                         {/* Tactical Corners */}
                         <div className="absolute top-0 left-0 w-2 h-2 border-l-2 border-t-2 border-cyan-500/30" />
                         <div className="absolute top-0 right-0 w-2 h-2 border-r-2 border-t-2 border-cyan-500/30" />
                         <div className="absolute bottom-0 left-0 w-2 h-2 border-l-2 border-b-2 border-cyan-500/30" />
                         <div className="absolute bottom-0 right-0 w-2 h-2 border-r-2 border-b-2 border-cyan-500/30" />

                         <label className="text-xs font-bold text-cyan-500 uppercase tracking-widest flex items-center gap-2">
                            <Package className="h-4 w-4" /> PACOTES
                         </label>
                         
                         <div className="flex items-center gap-2 w-full justify-center">
                            <button 
                               type="button" 
                               onClick={() => handleDecrement('packages')}
                               className="w-12 h-12 rounded-lg border border-zinc-700 bg-zinc-800/50 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-all active:scale-95"
                            >
                               <Minus className="h-6 w-6" />
                            </button>

                            <div className="relative group/input flex-1 flex justify-center">
                               <input 
                                  type="number"
                                  min="0"
                                  max={originStockPackages}
                                  className="w-full bg-transparent text-center text-6xl font-bold text-white border-none focus:ring-0 p-0 appearance-none placeholder-zinc-700 font-mono"
                                  placeholder="00"
                                  {...register('packages', { valueAsNumber: true })} 
                               />
                               <div className="absolute -bottom-4 left-0 right-0 text-center text-[10px] text-zinc-500 font-mono">PKS</div>
                            </div>
                            
                            <button 
                               type="button" 
                               onClick={() => handleIncrement('packages', originStockPackages)}
                               className="w-12 h-12 rounded-lg border border-zinc-700 bg-zinc-800/50 hover:bg-cyan-500/20 hover:border-cyan-500/50 text-zinc-400 hover:text-white flex items-center justify-center transition-all active:scale-95"
                            >
                               <Plus className="h-6 w-6" />
                            </button>
                         </div>
                      </div>

                      {/* MODULE 2: UNITS LOOSE (EMERALD) */}
                      <div className="bg-zinc-900/60 backdrop-blur-xl border border-white/10 rounded-xl p-6 flex flex-col items-center justify-center gap-6 relative overflow-hidden group hover:border-emerald-500/30 transition-colors">
                         {/* Tactical Corners */}
                         <div className="absolute top-0 left-0 w-2 h-2 border-l-2 border-t-2 border-emerald-500/30" />
                         <div className="absolute top-0 right-0 w-2 h-2 border-r-2 border-t-2 border-emerald-500/30" />
                         <div className="absolute bottom-0 left-0 w-2 h-2 border-l-2 border-b-2 border-emerald-500/30" />
                         <div className="absolute bottom-0 right-0 w-2 h-2 border-r-2 border-b-2 border-emerald-500/30" />

                         <label className="text-xs font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                            <Box className="h-4 w-4" /> UNIDADES SOLTAS
                         </label>
                         
                         <div className="flex items-center gap-2 w-full justify-center">
                            <button 
                               type="button" 
                               onClick={() => handleDecrement('unitsLoose')}
                               className="w-12 h-12 rounded-lg border border-zinc-700 bg-zinc-800/50 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-all active:scale-95"
                            >
                               <Minus className="h-6 w-6" />
                            </button>

                            <div className="relative group/input flex-1 flex justify-center">
                               <input 
                                  type="number"
                                  min="0"
                                  max={originStockUnits}
                                  className="w-full bg-transparent text-center text-6xl font-bold text-white border-none focus:ring-0 p-0 appearance-none placeholder-zinc-700 font-mono"
                                  placeholder="00"
                                  {...register('unitsLoose', { valueAsNumber: true })} 
                               />
                               <div className="absolute -bottom-4 left-0 right-0 text-center text-[10px] text-zinc-500 font-mono">UN</div>
                            </div>
                            
                            <button 
                               type="button" 
                               onClick={() => handleIncrement('unitsLoose', originStockUnits)}
                               className="w-12 h-12 rounded-lg border border-zinc-700 bg-zinc-800/50 hover:bg-emerald-500/20 hover:border-emerald-500/50 text-zinc-400 hover:text-white flex items-center justify-center transition-all active:scale-95"
                            >
                               <Plus className="h-6 w-6" />
                            </button>
                         </div>
                      </div>

                  </div>
                </div>

                {/* SETOR DIREITO: DESTINO (LOJA 2) */}
                <div className="lg:col-span-3 flex flex-col gap-4">
                  <div className="flex-1 bg-zinc-900/60 backdrop-blur-xl border border-white/10 rounded-xl p-6 border-r-4 border-r-violet-500 relative overflow-hidden group">
                     <div className="absolute bottom-0 left-0 w-32 h-32 bg-violet-500/5 rounded-full blur-2xl -ml-10 -mb-10 transition-opacity group-hover:opacity-100 opacity-50 pointer-events-none" />
                     
                     <div className="relative z-10 flex flex-col h-full justify-between">
                        <div className="flex flex-col gap-4">
                           <div className="flex items-center justify-end gap-2 text-violet-500">
                              <span className="text-xs font-bold tracking-wider uppercase">Destino</span>
                              <Warehouse className="h-5 w-5" />
                           </div>
                           <div className="text-right">
                              <h2 className="text-lg font-bold text-white leading-tight">LOJA 2 (DEPÓSITO)</h2>
                              <p className="text-zinc-500 text-xs mt-1">Status: Recebimento Auto</p>
                           </div>
                        </div>

                        <div className="my-8 text-right">
                           <p className="text-zinc-400 text-xs font-medium uppercase tracking-widest mb-2">Estoque Futuro</p>
                           <div className="flex flex-col items-end gap-1">
                              <div className="flex items-center gap-2 text-zinc-500 text-sm font-mono">
                                 <span>Atual: {destStockPackages}</span>
                                 <span className={cn("text-violet-500 transition-opacity", packagesToTransfer > 0 ? "opacity-100" : "opacity-0")}>
                                    + {packagesToTransfer}
                                 </span>
                              </div>
                              <div className="h-[1px] w-24 bg-zinc-700 my-1" />
                              <div className="flex items-baseline gap-2">
                                 <span className="text-5xl font-bold text-white tracking-tighter transition-all">
                                    {futureDestPackages}
                                 </span>
                                 <span className="text-lg text-zinc-500 font-medium">pks.</span>
                              </div>
                           </div>
                        </div>

                        <div className="bg-violet-500/10 border border-violet-500/20 rounded-lg p-3">
                           <div className="flex gap-2 items-start">
                              <Info className="h-4 w-4 text-violet-400 mt-0.5" />
                              <div>
                                 <p className="text-xs text-white font-medium">Fluxo Direto</p>
                                 <p className="text-[10px] text-zinc-400 mt-0.5 leading-tight">O estoque será debitado da Loja 1 e creditado na Loja 2 imediatamente.</p>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
                </div>

              </div>
            </div>

            {/* FOOTER */}
            <div className="border-t border-white/5 bg-zinc-900/80 backdrop-blur-xl px-8 py-6 flex flex-col md:flex-row gap-6 items-center sticky bottom-0 z-50">
               <div className="flex-1 w-full">
                  <div className="relative">
                     <Edit3 className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 h-4 w-4" />
                     <input 
                        className="w-full bg-zinc-950 border border-white/5 rounded-full py-3.5 pl-12 pr-4 text-sm text-white placeholder-zinc-600 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-colors outline-none" 
                        placeholder="Adicionar observações para a equipe..." 
                        type="text"
                        autoComplete="off"
                        {...register('notes')}
                     />
                  </div>
               </div>
               
               <div className="flex gap-3 w-full md:w-auto">
                  <Button 
                     type="button" 
                     variant="ghost" 
                     onClick={handleClose}
                     disabled={isSubmitting}
                     className="rounded-full px-6 text-zinc-400 hover:text-white hover:bg-white/5 h-auto py-4"
                  >
                     Cancelar
                  </Button>
                  
                  <Button 
                     type="submit"
                     disabled={isSubmitting || (packagesToTransfer === 0 && unitsToTransfer === 0)}
                     className="rounded-full px-8 py-6 bg-gradient-to-r from-cyan-600 to-violet-600 text-white font-bold tracking-wide hover:opacity-90 transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] flex items-center justify-center gap-2 group relative overflow-hidden h-auto"
                  >
                     {isSubmitting ? (
                        <>Iniciando...</>
                     ) : (
                        <>
                           <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                           <Store className="h-4 w-4" />
                           <ArrowRight className="h-4 w-4" />
                           <Warehouse className="h-4 w-4" />
                           <span className="relative z-10">PROCESSAR</span>
                        </>
                     )}
                  </Button>
               </div>
            </div>

          </form>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};

export default TransferToHoldingModal;
