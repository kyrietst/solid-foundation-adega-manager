
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { ProductFormValues } from '@/features/inventory/hooks/useProductFormLogic';
import { 
  FormControl, 
  FormField, 
  FormItem, 
  FormMessage 
} from '@/shared/ui/primitives/form';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/shared/ui/primitives/select';
import { Input } from '@/shared/ui/primitives/input';
import { Button } from '@/shared/ui/primitives/button';
import { ScanLine, Tag, Box, Ruler, Truck } from 'lucide-react';
import { cn } from '@/core/config/utils';
import { useProductResources } from '@/features/inventory/hooks/useProductResources';
import { BarcodeInput } from '@/features/inventory/components/BarcodeInput';

interface ProductIdentitySectionProps {
  onScan: (code: string) => void;
  isScanning: boolean;
  onStartScan: () => void;
  categories: string[];
  suppliers: string[];
}

export const ProductIdentitySection: React.FC<ProductIdentitySectionProps> = ({
  onScan,
  isScanning,
  onStartScan,
  categories,
  suppliers
}) => {
  const { control } = useFormContext<ProductFormValues>();

  const activeScanner = isScanning ? 'main' : null;

  return (
    <div className="space-y-6">
      {/* Header da Seção */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 shadow-[0_0_15px_rgba(149,19,236,0.15)]">
          <Tag className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white tracking-tight">Identidade</h3>
          <p className="text-xs text-zinc-500 font-medium tracking-wide">Informações básicas do produto</p>
        </div>
      </div>

      <div className="space-y-5">
        
        {/* NOME DO PRODUTO */}
        <FormField control={control} name="name" render={({ field }) => (
          <FormItem className="group relative transition-all duration-300">
            <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-2 ml-1">
              Nome do Produto <span className="text-primary">*</span>
            </label>
            <FormControl>
              <div className="relative">
                <Input 
                  {...field} 
                  placeholder="Ex: Cerveja Heineken 350ml"
                  className="w-full bg-zinc-900/80 hover:bg-zinc-900 text-white font-medium placeholder-zinc-600 px-4 py-6 rounded-t-xl border-0 border-b-2 border-white/5 focus:border-primary focus:ring-0 transition-all duration-300 outline-none shadow-none"
                />
                {/* Gradient Overlay on Hover */}
                <div className="absolute inset-0 rounded-t-xl bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-500" />
              </div>
            </FormControl>
            <FormMessage className="text-xs font-medium text-red-400 mt-1 pl-1" />
          </FormItem>
        )} />

        {/* CATEGORIA */}
        <FormField control={control} name="category" render={({ field }) => (
          <FormItem className="group relative transition-all duration-300">
            <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-2 ml-1">
              Categoria <span className="text-primary">*</span>
            </label>
            <Select onValueChange={field.onChange} value={field.value || ''}>
              <FormControl>
                <SelectTrigger className="w-full bg-zinc-900/80 hover:bg-zinc-900 text-white font-medium px-4 py-6 rounded-t-xl border-0 border-b-2 border-white/5 focus:border-primary focus:ring-0 transition-all duration-300 outline-none shadow-none">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="bg-zinc-900/95 border-white/10 text-white backdrop-blur-xl">
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat} className="focus:bg-primary/20 focus:text-white cursor-pointer">{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage className="text-xs font-medium text-red-400 mt-1 pl-1" />
          </FormItem>
        )} />

        <div className="grid grid-cols-2 gap-4">
          {/* VOLUME */}
          <FormField control={control} name="volume_ml" render={({ field }) => (
            <FormItem className="group relative transition-all duration-300">
              <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-2 ml-1 flex items-center gap-1">
                <Ruler className="h-3 w-3" /> Volume (ml)
              </label>
              <FormControl>
                <div className="relative">
                  <Input 
                    type="number"
                    min="0"
                    placeholder="350"
                    {...field}
                    value={field.value === 0 ? '' : field.value}
                    onChange={e => field.onChange(e.target.value === '' ? 0 : Number(e.target.value))}
                    className="w-full bg-zinc-900/80 hover:bg-zinc-900 text-white font-medium placeholder-zinc-600 px-4 py-6 rounded-t-xl border-0 border-b-2 border-white/5 focus:border-primary focus:ring-0 transition-all duration-300 outline-none shadow-none"
                  />
                  <div className="absolute inset-0 rounded-t-xl bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-500" />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          {/* FORNECEDOR */}
          <FormField control={control} name="supplier" render={({ field }) => (
            <FormItem className="group relative transition-all duration-300">
              <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-2 ml-1 flex items-center gap-1">
                 <Truck className="h-3 w-3" /> Fornecedor
              </label>
              <Select onValueChange={field.onChange} value={field.value || ''}>
                <FormControl>
                  <SelectTrigger className="w-full bg-zinc-900/80 hover:bg-zinc-900 text-white font-medium px-4 py-6 rounded-t-xl border-0 border-b-2 border-white/5 focus:border-primary focus:ring-0 transition-all duration-300 outline-none shadow-none">
                    <SelectValue placeholder="Nenhum" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-zinc-900/95 border-white/10 text-white backdrop-blur-xl">
                  <SelectItem value="none" className="text-zinc-500">Nenhum</SelectItem>
                  {suppliers.map(sup => (
                    <SelectItem key={sup} value={sup} className="focus:bg-primary/20 focus:text-white cursor-pointer">{sup}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        {/* EAN / CÓDIGO DE BARRAS */}
        <div className="group relative transition-all duration-300 pt-2">
           <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-2 ml-1 flex items-center justify-between">
             <span>Código de Barras (EAN)</span>
             {activeScanner !== 'main' && (
               <button 
                 type="button" 
                 onClick={onStartScan}
                 className="text-[10px] text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
               >
                 <ScanLine className="h-3 w-3" /> ESCANEAR
               </button>
             )}
           </label>
           
           {activeScanner === 'main' ? (
             <div className="rounded-xl overflow-hidden border border-primary/50 shadow-[0_0_20px_rgba(149,19,236,0.2)] animate-in fade-in zoom-in-95 duration-300">
               <BarcodeInput onScan={onScan} placeholder="Aguardando Leitor..." className="w-full bg-black" />
             </div>
           ) : (
             <FormField control={control} name="barcode" render={({ field }) => (
               <FormItem>
                 <FormControl>
                    <div className="relative">
                       <Input 
                         placeholder="Digite ou Escaneie" 
                         {...field}
                         onChange={e => {
                           const v = e.target.value.replace(/\D/g, '');
                           if (v.length <= 14) field.onChange(v);
                         }}
                         maxLength={14}
                         className="w-full bg-zinc-900/80 hover:bg-zinc-900 text-white font-mono text-sm tracking-wider px-4 py-6 rounded-t-xl border-0 border-b-2 border-white/5 focus:border-primary focus:ring-0 transition-all duration-300 outline-none shadow-none"
                       />
                       <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                         <ScanLine className="h-4 w-4 text-zinc-600 group-hover:text-primary/50 transition-colors" />
                       </div>
                    </div>
                 </FormControl>
                 <FormMessage className="text-xs font-medium text-red-400 mt-1 pl-1" />
               </FormItem>
             )} />
           )}
        </div>

      </div>
    </div>
  );
};
