
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
import { Button } from '@/shared/ui/primitives/button';
import { SwitchAnimated } from '@/shared/ui/primitives/switch-animated';
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from '@/shared/ui/primitives/collapsible';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/shared/ui/primitives/select';
import { Package, ReceiptText, ChevronDown, ScanLine, Box } from 'lucide-react';
import { cn } from '@/core/config/utils';
import { BarcodeInput } from '@/features/inventory/components/BarcodeInput';

interface ProductLogisticsSectionProps {
  onScanPackage: (code: string) => void;
  isScanningPackage: boolean;
  onStartScanPackage: () => void;
}

export const ProductLogisticsSection: React.FC<ProductLogisticsSectionProps> = ({
  onScanPackage,
  isScanningPackage,
  onStartScanPackage
}) => {
  const { control, watch } = useFormContext<ProductFormValues>();
  const hasPackageTracking = watch('has_package_tracking');
  const activeScanner = isScanningPackage ? 'package' : null;

  return (
    <div className="space-y-8">
      
      {/* SECTION 1: VENDA EM FARDO */}
      <div className="space-y-5">
        <div className="flex items-center gap-3 mb-2">
           <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.15)]">
             <Package className="h-5 w-5 text-indigo-400" />
           </div>
           <div>
             <h3 className="text-lg font-bold text-white tracking-tight">Logística</h3>
             <p className="text-xs text-zinc-500 font-medium tracking-wide">Controle de fardos e embalagens</p>
           </div>
        </div>

        {/* Card de Fardo */}
        <div className={cn(
          "rounded-2xl border transition-all duration-300 overflow-hidden",
          hasPackageTracking 
            ? "bg-zinc-900/40 border-indigo-500/30 shadow-[0_0_30px_rgba(99,102,241,0.1)]" 
            : "bg-zinc-900/20 border-white/5"
        )}>
          {/* Header do Card com Toggle */}
          <div className="p-5 flex items-center justify-between">
             <div className="flex flex-col">
                <span className={cn("text-sm font-bold tracking-wide transition-colors", hasPackageTracking ? "text-indigo-400" : "text-zinc-400")}>
                  Vender em Fardo?
                </span>
                <span className="text-[10px] text-zinc-600 mt-0.5 uppercase tracking-wider font-semibold">
                  Habilita controle de estoque por caixa
                </span>
             </div>
             
             <FormField control={control} name="has_package_tracking" render={({ field }) => (
                <FormControl>
                   <SwitchAnimated 
                     checked={field.value} 
                     onCheckedChange={field.onChange} 
                     variant="default"
                     size="sm"
                   />
                </FormControl>
             )} />
          </div>

          {/* Conteúdo Expansível do Fardo */}
          {hasPackageTracking && (
            <div className="px-5 pb-5 pt-0 animate-in slide-in-from-top-2 duration-300">
               <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent mb-5" />
               
               <div className="grid grid-cols-2 gap-4 mb-4">
                  {/* Unidades por Fardo */}
                  <FormField control={control} name="package_units" render={({ field }) => (
                    <FormItem className="group relative">
                      <label className="block text-[10px] font-bold text-indigo-400/70 uppercase tracking-widest mb-1.5 ml-1">
                        Unid/Fardo
                      </label>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1" 
                          placeholder="Ex: 12"
                          {...field}
                          onChange={e => field.onChange(Number(e.target.value))}
                          className="w-full bg-zinc-950/50 hover:bg-zinc-950 text-white font-mono text-center px-4 py-3 rounded-lg border border-white/10 focus:border-indigo-500 focus:ring-0 transition-all outline-none"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  {/* Preço do Fardo */}
                  <FormField control={control} name="package_price" render={({ field }) => (
                    <FormItem className="group relative">
                      <label className="block text-[10px] font-bold text-indigo-400/70 uppercase tracking-widest mb-1.5 ml-1">
                        Preço Fardo
                      </label>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500/50 font-mono text-xs">R$</span>
                          <Input 
                            type="number" 
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            {...field}
                            value={field.value === 0 ? '' : field.value}
                            onChange={e => field.onChange(e.target.value === '' ? 0 : Number(e.target.value))}
                            className="w-full bg-zinc-950/50 hover:bg-zinc-950 text-white font-mono px-4 py-3 pl-8 rounded-lg border border-white/10 focus:border-indigo-500 focus:ring-0 transition-all outline-none"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
               </div>

               {/* Código do Fardo */}
               <div className="group relative">
                  <label className="block text-[10px] font-bold text-indigo-400/70 uppercase tracking-widest mb-1.5 ml-1 flex justify-between">
                    <span>Código do Fardo (GTIN-14)</span>
                    {activeScanner !== 'package' && (
                       <button 
                         type="button" 
                         onClick={onStartScanPackage}
                         className="text-[9px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors bg-indigo-500/10 px-2 py-0.5 rounded-full"
                       >
                         <ScanLine className="h-2.5 w-2.5" /> ESCANEAR
                       </button>
                     )}
                  </label>
                  
                  {activeScanner === 'package' ? (
                     <div className="rounded-xl overflow-hidden border border-indigo-500/50 animate-in fade-in zoom-in-95 duration-300">
                       <BarcodeInput onScan={onScanPackage} placeholder="Lendo código de caixa..." className="w-full bg-black" />
                     </div>
                   ) : (
                     <FormField control={control} name="package_barcode" render={({ field }) => (
                       <FormControl>
                          <Input 
                             placeholder="Ex: 1789..." 
                             {...field}
                             maxLength={14}
                             onChange={e => {
                               const v = e.target.value.replace(/\D/g, '');
                               if (v.length <= 14) field.onChange(v);
                             }}
                             className="w-full bg-zinc-950/50 hover:bg-zinc-950 text-white font-mono text-sm tracking-widest px-4 py-3 rounded-lg border border-white/10 focus:border-indigo-500 focus:ring-0 transition-all outline-none"
                           />
                       </FormControl>
                     )} />
                   )}
               </div>
            </div>
          )}
        </div>
      </div>

      {/* SECTION 2: DADOS FISCAIS (ACCORDION) */}
      <Collapsible className="group/fiscal rounded-2xl border border-white/5 bg-zinc-900/20 overflow-hidden transition-all duration-300 data-[state=open]:bg-zinc-900/40 data-[state=open]:border-zinc-700">
          <CollapsibleTrigger className="flex items-center justify-between w-full p-5 hover:bg-white/5 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-zinc-800 border border-zinc-700">
                    <ReceiptText className="h-4 w-4 text-zinc-400 group-data-[state=open]/fiscal:text-emerald-400 transition-colors" />
                  </div>
                  <div className="text-left">
                     <h4 className="text-sm font-bold text-zinc-300 group-data-[state=open]/fiscal:text-white transition-colors">Dados Fiscais</h4>
                     <p className="text-[10px] text-zinc-600 uppercase tracking-wider font-bold">NCM • CEST • Origem</p>
                  </div>
              </div>
              <ChevronDown className="h-4 w-4 text-zinc-500 transition-transform duration-300 group-data-[state=open]/fiscal:rotate-180" />
          </CollapsibleTrigger>
          
          <CollapsibleContent>
             <div className="px-5 pb-6 pt-2 space-y-4 border-t border-white/5">
                <div className="grid grid-cols-2 gap-4">
                   {/* NCM */}
                   <FormField control={control} name="ncm" render={({ field }) => (
                      <FormItem>
                         <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">NCM (8)</label>
                         <FormControl>
                            <Input 
                               {...field} 
                               maxLength={8}
                               placeholder="00000000"
                               onChange={(e) => {
                                  e.target.value = e.target.value.replace(/\D/g, '').substring(0, 8);
                                  field.onChange(e);
                               }}
                               className="bg-zinc-950/50 border-white/10 font-mono text-xs focus:border-emerald-500/50 transition-colors" 
                            />
                         </FormControl>
                      </FormItem>
                   )} />

                   {/* CEST */}
                   <FormField control={control} name="cest" render={({ field }) => (
                      <FormItem>
                         <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">CEST (7)</label>
                         <FormControl>
                            <Input 
                               {...field} 
                               maxLength={7}
                               placeholder="0000000"
                               onChange={(e) => {
                                  e.target.value = e.target.value.replace(/\D/g, '').substring(0, 7);
                                  field.onChange(e);
                               }}
                               className="bg-zinc-950/50 border-white/10 font-mono text-xs focus:border-emerald-500/50 transition-colors" 
                            />
                         </FormControl>
                      </FormItem>
                   )} />
                </div>

                {/* CFOP */}
                <FormField control={control} name="cfop" render={({ field }) => (
                   <FormItem>
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">CFOP (4)</label>
                      <FormControl>
                         <Input 
                            {...field} 
                            maxLength={4}
                            placeholder="5102"
                            onChange={(e) => {
                               e.target.value = e.target.value.replace(/\D/g, '').substring(0, 4);
                               field.onChange(e);
                            }}
                            className="bg-zinc-950/50 border-white/10 font-mono text-xs focus:border-emerald-500/50 transition-colors" 
                         />
                      </FormControl>
                   </FormItem>
                )} />
                
                {/* Origem */}
                <FormField control={control} name="origin" render={({ field }) => (
                   <FormItem>
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Origem</label>
                      <Select 
                        value={field.value ? String(field.value) : ''} 
                        onValueChange={field.onChange}
                      >
                         <FormControl>
                            <SelectTrigger className="bg-zinc-950/50 border-white/10 text-xs focus:border-emerald-500/50">
                               <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                         </FormControl>
                         <SelectContent className="bg-zinc-900 border-white/10">
                            <SelectItem value="0">0 - Nacional</SelectItem>
                            <SelectItem value="1">1 - Estrangeira (Imp. Direta)</SelectItem>
                            <SelectItem value="2">2 - Estrangeira (Merc. Interno)</SelectItem>
                         </SelectContent>
                      </Select>
                   </FormItem>
                )} />

             </div>
          </CollapsibleContent>
      </Collapsible>

    </div>
  );
};
