
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { ProductFormValues } from '@/features/inventory/hooks/useProductFormLogic';
import { 
  FormControl, 
  FormField, 
  FormItem, 
  FormMessage 
} from '@/shared/ui/primitives/form';
import { Input } from '@/shared/ui/primitives/input';
import { DollarSign, Percent, TrendingUp } from 'lucide-react';
import { cn } from '@/core/config/utils';
import { Slider } from '@/shared/ui/primitives/slider';

interface ProductPricingSectionProps {
  calculations: {
    handleCostPriceChange: (val: number) => void;
    handleMarginChange: (val: number) => void;
    handlePriceChange: (val: number) => void;
  };
}

export const ProductPricingSection: React.FC<ProductPricingSectionProps> = ({
  calculations
}) => {
  const { control, watch, setValue } = useFormContext<ProductFormValues>();
  
  // Watch values for the slider interaction
  const marginPercent = watch('margin_percent') || 0;

  return (
    <div className="space-y-6">
       <div className="flex items-center gap-3 mb-2">
           <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
             <DollarSign className="h-5 w-5 text-emerald-500" />
           </div>
           <div>
             <h3 className="text-lg font-bold text-white tracking-tight">Precificação</h3>
             <p className="text-xs text-zinc-500 font-medium tracking-wide">Formação do preço de venda</p>
           </div>
       </div>

       {/* CARD PRINCIPAL EMERALD */}
       <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/5 overflow-hidden shadow-[0_0_40px_rgba(16,185,129,0.05)] relative group">
          {/* Background Gradient Effect */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[50px] rounded-full pointer-events-none group-hover:bg-emerald-500/20 transition-all duration-700" />

          <div className="p-6 space-y-6 relative z-10">
             
             {/* ROW 1: Custo & Margem */}
             <div className="grid grid-cols-2 gap-5">
                {/* Custo */}
                <FormField control={control} name="cost_price" render={({ field }) => (
                   <FormItem className="space-y-1">
                      <label className="text-[10px] font-bold text-emerald-400/70 uppercase tracking-widest ml-1">Custo Médio</label>
                      <FormControl>
                         <div className="relative group/input">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600 font-mono text-sm group-focus-within/input:text-emerald-400 transition-colors">R$</span>
                            <Input 
                               type="number" 
                               step="0.01" 
                               min="0"
                               placeholder="0.00"
                               {...field}
                               onChange={(e) => {
                                 field.onChange(Number(e.target.value));
                                 calculations.handleCostPriceChange(Number(e.target.value));
                               }}
                               className="pl-9 bg-black/20 border-emerald-500/10 text-white font-mono text-base focus:bg-black/40 focus:border-emerald-500/50 focus:ring-0 transition-all shadow-inner"
                            />
                         </div>
                      </FormControl>
                   </FormItem>
                )} />

                {/* Margem Input */}
                <FormField control={control} name="margin_percent" render={({ field }) => (
                   <FormItem className="space-y-1">
                      <label className="text-[10px] font-bold text-emerald-400/70 uppercase tracking-widest ml-1">Margem (%)</label>
                      <FormControl>
                         <div className="relative group/input">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600 font-mono text-sm group-focus-within/input:text-emerald-400 transition-colors">
                              <Percent className="h-3 w-3" />
                            </span>
                            <Input 
                               type="number" 
                               step="0.1" 
                               {...field}
                               onChange={(e) => {
                                 field.onChange(Number(e.target.value));
                                 calculations.handleMarginChange(Number(e.target.value));
                               }}
                               className="pl-9 bg-black/20 border-emerald-500/10 text-white font-mono text-base focus:bg-black/40 focus:border-emerald-500/50 focus:ring-0 transition-all shadow-inner"
                            />
                         </div>
                      </FormControl>
                   </FormItem>
                )} />
             </div>

             {/* Slider de Margem */}
             <div className="pt-2 px-1">
                <div className="flex justify-between mb-2">
                   <span className="text-[9px] font-bold text-emerald-500/50 uppercase tracking-widest">Ajuste Fino</span>
                   <span className="text-[9px] font-mono text-emerald-400">{marginPercent.toFixed(1)}%</span>
                </div>
                <Slider 
                  defaultValue={[marginPercent]} 
                  value={[marginPercent]} 
                  max={200} 
                  step={0.5} 
                  onValueChange={(val) => {
                    const newValue = val[0];
                    // Update form value directly
                    calculations.handleMarginChange(newValue);
                    // Force update the input field visually if needed (though handleMarginChange usually does this via calculations)
                    // We can also use setValue if handleMarginChange doesn't update the form state
                     setValue('margin_percent', newValue, { shouldValidate: true });
                  }}
                  className="py-2 cursor-pointer"
                />
             </div>

             <div className="h-[1px] w-full bg-emerald-500/10 my-4" />

             {/* PREÇO FINAL BIG */}
             <FormField control={control} name="price" render={({ field }) => (
                <div className="text-right space-y-2">
                   <label className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest flex items-center justify-end gap-1">
                     <TrendingUp className="h-3 w-3" /> Preço de Venda Final
                   </label>
                   <div className="relative inline-block">
                      <span className="absolute left-0 top-1 text-2xl font-bold text-emerald-600/50">R$</span>
                      <Input 
                         type="number" 
                         step="0.01" 
                         min="0"
                         {...field}
                         onChange={(e) => {
                           field.onChange(Number(e.target.value));
                           calculations.handlePriceChange(Number(e.target.value));
                         }}
                         className="text-right text-4xl font-extrabold text-emerald-400 bg-transparent border-none p-0 h-auto pl-8 w-full placeholder-emerald-900/20 focus:ring-0 focus:outline-none focus:border-none"
                         placeholder="0.00"
                      />
                   </div>
                   <FormMessage className="text-right" />
                </div>
             )} />

          </div>
       </div>

    </div>
  );
};
