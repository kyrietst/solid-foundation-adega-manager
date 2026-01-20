import React from 'react';
import { TrendingUp, TrendingDown, Minus, Info, ClipboardList } from 'lucide-react';
import { formatCurrency } from '@/core/config/utils';
import { ADJUSTMENT_REASONS, AdjustmentReason } from '@/features/inventory/hooks/useStockOperations';
import type { Product } from '@/core/types/inventory.types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/primitives/select';
import { cn } from '@/core/config/utils';

interface StockCalibrationAnalysisProps {
  calculations: {
    packagesChange: number;
    unitsLooseChange: number;
    hasChanges: boolean;
  } | null;
  product: Product;
  reason: AdjustmentReason;
  onReasonChange: (reason: AdjustmentReason) => void;
}

export const StockCalibrationAnalysis: React.FC<StockCalibrationAnalysisProps> = ({
  calculations,
  product,
  reason,
  onReasonChange,
}) => {
  const costPrice = Number(product.cost_price || 0);

  // Calculate total units diff to estimate value
  const unitsPerPackage = Number(product.units_per_package || 1);
  const totalUnitsDiff = calculations 
    ? (calculations.packagesChange * unitsPerPackage) + calculations.unitsLooseChange
    : 0;
  
  // Calculate financial impact roughly (cost per unit * total units diff)
  const costPerUnit = unitsPerPackage > 0 ? costPrice / unitsPerPackage : 0;
  // If cost per unit is NaN or Infinite, use 0
  const validCostPerUnit = isFinite(costPerUnit) ? costPerUnit : 0;
  
  const estimatedImpact = totalUnitsDiff * validCostPerUnit;
  const isGain = totalUnitsDiff > 0;
  const isLoss = totalUnitsDiff < 0;

  return (
    <div className="w-full lg:w-[420px] bg-zinc-900/30 p-8 flex flex-col gap-6">
      <h2 className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase flex items-center gap-2 mb-2">
        <ClipboardList className="text-emerald-500 w-4 h-4" />
        Análise de Divergência
      </h2>

      {/* Delta Card: Gain/Loss/Neutral */}
      {calculations?.hasChanges ? (
        <div className={cn(
          "p-4 rounded-lg flex flex-col gap-1 relative overflow-hidden transition-colors border",
          isGain ? "bg-emerald-500/10 border-emerald-500/20 hover:border-emerald-500/40" :
          isLoss ? "bg-rose-500/10 border-rose-500/20 hover:border-rose-500/40" :
          "bg-zinc-800/30 border-zinc-700/50"
        )}>
          <div className="absolute right-0 top-0 p-3 opacity-20">
            {isGain ? <TrendingUp className="text-emerald-500 w-12 h-12" /> :
             isLoss ? <TrendingDown className="text-rose-500 w-12 h-12" /> :
             <Minus className="text-zinc-500 w-12 h-12" />}
          </div>
          
          <span className={cn(
            "text-xs font-mono uppercase tracking-wider font-bold",
            isGain ? "text-emerald-400" : isLoss ? "text-rose-400" : "text-zinc-400"
          )}>
            Diferença Física
          </span>
          
          <div className="flex items-baseline gap-2 z-10">
            <span className="text-white text-3xl font-mono font-bold">
              {totalUnitsDiff > 0 ? '+' : ''}{totalUnitsDiff}
            </span>
            <span className={cn(
               "text-sm font-medium",
               isGain ? "text-emerald-400" : isLoss ? "text-rose-400" : "text-zinc-500"
            )}>
              Unidades (Total)
            </span>
          </div>
          
          <p className={cn(
            "text-xs mt-1 z-10",
            isGain ? "text-emerald-400/60" : isLoss ? "text-rose-400/60" : "text-zinc-500"
          )}>
            {isGain ? "Estoque físico superior ao sistêmico." :
             isLoss ? "Estoque físico inferior ao sistêmico." :
             "Sem divergências."}
          </p>
        </div>
      ) : (
        <div className="p-4 rounded-lg bg-zinc-800/30 border border-zinc-700/50 flex flex-col items-center justify-center gap-2 py-8 text-zinc-500">
          <Minus className="w-8 h-8 opacity-20" />
          <span className="text-xs uppercase tracking-wide">Aguardando Input</span>
        </div>
      )}

      {/* Delta Card: Financial Impact */}
      <div className="p-4 rounded-lg bg-zinc-800/50 border border-white/5 flex flex-col gap-1 relative overflow-hidden">
        <span className="text-zinc-400 text-xs font-mono uppercase tracking-wider font-bold">Impacto Financeiro</span>
        <div className="flex items-baseline gap-2">
          <span className={cn(
            "text-3xl font-mono font-bold tracking-tight",
            isGain ? "text-emerald-400" : isLoss ? "text-rose-400" : "text-white"
          )}>
            {formatCurrency(Math.abs(estimatedImpact))}
          </span>
        </div>
        <p className="text-zinc-500 text-xs mt-1">Estimativa baseada no custo unitário.</p>
      </div>

      <div className="h-px w-full bg-white/5 my-2"></div>

      {/* Reason Select */}
      <div className="flex flex-col gap-3">
        <label className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase flex items-center gap-2">
          <Info className="text-zinc-500 w-4 h-4" />
          Motivo da Operação
        </label>
        
        <Select value={reason} onValueChange={(val) => onReasonChange(val as AdjustmentReason)}>
          <SelectTrigger className="w-full bg-zinc-900 border-zinc-700 text-white h-14 rounded-lg shadow-lg">
             <SelectValue placeholder="Selecione um motivo..." />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-zinc-800">
            {Object.entries(ADJUSTMENT_REASONS).map(([key, config]) => (
              <SelectItem key={key} value={key} className="focus:bg-zinc-800 focus:text-white cursor-pointer">
                <span className="flex items-center gap-2">
                  <span>{config.emoji}</span>
                  <span>{config.label}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Additional Info / Warning */}
      <div className="mt-auto p-3 rounded bg-blue-500/10 border border-blue-500/20 flex gap-3 items-start">
        <Info className="text-blue-400 w-5 h-5 mt-0.5 shrink-0" />
        <p className="text-blue-200/80 text-xs leading-relaxed">
           Esta calibração gerará um movimento de entrada/saída no kardex e atualizará o estoque imediatamente.
        </p>
      </div>
    </div>
  );
};
