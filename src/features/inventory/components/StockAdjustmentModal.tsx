/**
 * StockAdjustmentModal.tsx - Stock Calibration Station // V.01
 * Tactical Interface for Inventory Management
 */

import React, { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Dialog, DialogPortal, DialogOverlay, DialogTitle } from '@/shared/ui/primitives/dialog';
import { cn } from '@/core/config/utils';
import { useAuth } from '@/app/providers/AuthContext';
import { Loader2, Settings2, X, CheckCircle, Package, Wine } from 'lucide-react';
import {
  useProductStockDetails,
  useStockAdjustment,
  ADJUSTMENT_REASONS
} from '@/features/inventory/hooks/useStockOperations';
import { StockCounterInput } from './adjust-stock/stitch/StockCounterInput';
import { StockCalibrationAnalysis } from './adjust-stock/stitch/StockCalibrationAnalysis';

// Schema de validação
const stockAdjustmentSchema = z.object({
  newPackages: z.number().min(0, 'Quantidade de pacotes não pode ser negativa'),
  newUnitsLoose: z.number().min(0, 'Quantidade de unidades soltas não pode ser negativa'),
  reason: z.enum(['inventory', 'loss', 'consumption', 'purchase'], {
    errorMap: () => ({ message: 'Selecione um motivo válido' })
  })
});

type StockAdjustmentFormData = z.infer<typeof stockAdjustmentSchema>;

interface StockAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  onSuccess?: () => void;
}

export const StockAdjustmentModal: React.FC<StockAdjustmentModalProps> = ({
  isOpen,
  onClose,
  productId,
  onSuccess
}) => {
  const { user } = useAuth();

  const {
    data: product,
    isLoading: isLoadingProduct,
    error: productError
  } = useProductStockDetails(productId, isOpen);

  const adjustStockMutation = useStockAdjustment();

  const {
    setValue,
    watch,
    handleSubmit,
    reset,
    formState: { isDirty }
  } = useForm<StockAdjustmentFormData>({
    resolver: zodResolver(stockAdjustmentSchema),
    defaultValues: {
      newPackages: 0,
      newUnitsLoose: 0,
      reason: 'inventory'
    }
  });

  const watchedValues = watch();

  // Set initial values
  React.useEffect(() => {
    if (product) {
      setValue('newPackages', product.stock_packages || 0);
      setValue('newUnitsLoose', product.stock_units_loose || 0);
    }
  }, [product, setValue]);

  const calculations = useMemo(() => {
    if (!product) return null;
    const currentPackages = product.stock_packages || 0;
    const currentUnitsLoose = product.stock_units_loose || 0;
    const newPackages = watchedValues.newPackages || 0;
    const newUnitsLoose = watchedValues.newUnitsLoose || 0;

    return {
      currentPackages,
      currentUnitsLoose,
      packagesChange: newPackages - currentPackages,
      unitsLooseChange: newUnitsLoose - currentUnitsLoose,
      hasChanges: newPackages !== currentPackages || newUnitsLoose !== currentUnitsLoose
    };
  }, [product, watchedValues.newPackages, watchedValues.newUnitsLoose]);

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = (data: StockAdjustmentFormData) => {
    if (!user?.id) return;

    adjustStockMutation.mutate({
      productId,
      newPackages: data.newPackages,
      newUnitsLoose: data.newUnitsLoose,
      reason: data.reason,
      userId: user.id
    }, {
      onSuccess: () => {
        onSuccess?.();
        handleClose();
      }
    });
  };

  const unitsPerPackage = Number(product?.units_per_package || 1);
  const totalDelta = calculations 
    ? (calculations.packagesChange * unitsPerPackage) + calculations.unitsLooseChange
    : 0;

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogPortal>
        <DialogOverlay className="bg-black/80 backdrop-blur-sm" />
        <DialogPrimitive.Content 
          className={cn(
            "fixed left-[50%] top-[50%] z-50 flex flex-col w-full max-w-5xl translate-x-[-50%] translate-y-[-50%]",
            "bg-zinc-950 border border-white/5 shadow-2xl rounded-xl overflow-hidden duration-200",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]",
            "data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]"
          )}
        >
          {/* Top Decorative Line */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-zinc-800 via-emerald-500 to-zinc-800 opacity-50"></div>

          {/* Modal Header */}
          <div className="flex items-center justify-between px-8 py-6 border-b border-white/5 bg-zinc-900/30 backdrop-blur-md">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <Settings2 className="text-emerald-500 w-6 h-6" />
                <DialogTitle className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                  STOCK CALIBRATION
                </DialogTitle>
              </div>
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-9">
                 Tactical Adjustment Station
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs text-emerald-500 font-mono tracking-widest uppercase">System Online</span>
            </div>
          </div>

          {(isLoadingProduct || !product) ? (
            <div className="h-96 flex flex-col items-center justify-center gap-4 text-zinc-500">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
              <p>Initializing Calibration Module...</p>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-white/5 h-full">
              {/* COLUMN 1: INPUTS */}
              <div className="flex-1 p-8 flex flex-col gap-8">
                <StockCounterInput
                  label="Pacotes"
                  icon={<Package className="text-zinc-500 w-4 h-4" />}
                  subtitle={`SKU: PKT-${product.barcode?.slice(-4) || 'XXXX'}`}
                  value={watchedValues.newPackages}
                  onChange={(val) => setValue('newPackages', val, { shouldDirty: true })}
                  systemStock={calculations?.currentPackages || 0}
                />
                
                <div className="h-px w-full bg-white/5"></div>
                
                <StockCounterInput
                  label="Unidades Soltas"
                  icon={<Wine className="text-zinc-500 w-4 h-4" />}
                  subtitle={`SKU: UNT-${product.barcode?.slice(-4) || 'XXXX'}`}
                  value={watchedValues.newUnitsLoose}
                  onChange={(val) => setValue('newUnitsLoose', val, { shouldDirty: true })}
                  systemStock={calculations?.currentUnitsLoose || 0}
                />
              </div>

              {/* COLUMN 2: ANALYSIS */}
              <StockCalibrationAnalysis
                calculations={calculations}
                product={product}
                reason={watchedValues.reason}
                onReasonChange={(val) => setValue('reason', val)}
              />
            </div>
          )}

          {/* Modal Footer */}
          <div className="border-t border-white/5 bg-zinc-900/80 backdrop-blur-xl px-8 py-6 flex flex-col md:flex-row gap-4 items-center justify-between">
            <button
              onClick={handleClose}
              className="w-full md:w-auto px-6 py-4 rounded-full text-zinc-400 hover:text-white hover:bg-white/5 font-bold uppercase tracking-wider text-xs transition-all flex items-center justify-center gap-2"
            >
              Cancelar
            </button>
            
            <button
              onClick={handleSubmit(onSubmit)}
              disabled={!isDirty || adjustStockMutation.isPending}
              className={cn(
                "w-full md:w-auto px-10 py-6 rounded-full font-bold uppercase tracking-wider text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-3 relative overflow-hidden group shadow-[0_0_20px_rgba(16,185,129,0.3)]",
                !isDirty || adjustStockMutation.isPending
                  ? "bg-zinc-800 text-zinc-500 cursor-not-allowed shadow-none"
                  : "bg-emerald-500 hover:bg-emerald-400 text-zinc-950 hover:shadow-[0_0_35px_rgba(16,185,129,0.5)] hover:scale-[1.02]"
              )}
            >
              {adjustStockMutation.isPending ? (
                 <>
                   <Loader2 className="w-5 h-5 animate-spin" />
                   Processando...
                 </>
              ) : (
                <>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                  <CheckCircle className="w-5 h-5 z-10" />
                  <span className="z-10">Confirmar Calibração</span>
                  {isDirty && (
                    <span className="z-10 bg-black/20 px-2 py-1 rounded text-[10px] font-mono ml-2 border border-black/10">
                      DELTA: {totalDelta > 0 ? '+' : ''}{totalDelta}
                    </span>
                  )}
                </>
              )}
            </button>
          </div>
          
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
};

export default StockAdjustmentModal;