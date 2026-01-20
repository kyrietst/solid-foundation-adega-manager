
import React from 'react';
import { formatCurrency } from '@/core/config/utils';
import { Settings, ScanLine, DollarSign, Scale, Ruler, Box, Globe, Code } from 'lucide-react';
import type { Product } from '@/core/types/inventory.types';

interface ProductSpecsCardProps {
  product: Product;
}

export const ProductSpecsCard: React.FC<ProductSpecsCardProps> = ({ product }) => {
  // Calculate margins for the visual bar
  const cost = Number(product.cost_price || 0);
  const price = Number(product.price || 0);
  const profit = price - cost;
  const markup = cost > 0 ? (profit / cost) * 100 : 0;
  
  // Visual bar widths
  const total = price || 1;
  const costPercent = cost > 0 ? (cost / total) * 100 : 0;
  const profitPercent = price > 0 ? 100 - costPercent : 0;

  return (
    <div className="lg:col-span-5 h-full w-full rounded-xl bg-white/[0.02] border border-white/5 flex flex-col gap-4 p-5">
      <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-2">
        <h3 className="text-zinc-500 font-bold text-sm flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Especificações
        </h3>
        <button className="text-emerald-500 text-xs hover:text-white transition-colors hover:underline font-medium">
           Exportar XML
        </button>
      </div>

      {/* EAN Scanner */}
      <div className="bg-black/20 border border-white/5 rounded-lg p-4 flex items-center justify-between relative overflow-hidden group hover:border-white/10 transition-colors">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
        <div className="flex flex-col gap-1 pl-2">
           <span className="text-xs text-zinc-500 font-medium">EAN-13 (Primário)</span>
           <span className="font-mono text-lg lg:text-xl tracking-widest text-zinc-200 group-hover:text-white transition-colors">
             {product.barcode || 'N/A'}
           </span>
        </div>
        <ScanLine className="text-zinc-700 h-8 w-8 opacity-50" />
      </div>

      {/* Price Matrix */}
      <div className="bg-black/20 border border-white/5 rounded-lg p-5 flex flex-col gap-4 shadow-sm hover:bg-white/[0.04] transition-colors">
         <div className="flex justify-between items-end">
            <div className="flex flex-col gap-1">
               <span className="text-xs text-rose-400 font-medium flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]"></span> Custo
               </span>
               <span className="text-2xl font-semibold text-zinc-500">
                 {formatCurrency(cost)}
               </span>
            </div>
            <div className="h-10 w-px bg-zinc-800"></div>
            <div className="flex flex-col gap-1 items-end">
               <span className="text-xs text-emerald-500 font-medium flex items-center gap-2">
                  Venda <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
               </span>
               <span className="text-3xl font-bold text-white tracking-tight">
                 {formatCurrency(price)}
               </span>
            </div>
         </div>

         {/* Visual Bar */}
         <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden flex relative">
            <div 
              className="h-full bg-rose-500/40 transition-all duration-1000" 
              style={{ width: `${Math.max(5, costPercent)}%` }}
            ></div> 
            <div 
              className="h-full bg-emerald-500 relative overflow-hidden transition-all duration-1000"
              style={{ width: `${Math.max(5, profitPercent)}%` }}
            >
               <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite]"></div>
            </div> 
         </div>
         
         <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
            <span>Markup: <span className="text-zinc-300">{markup.toFixed(0)}%</span></span>
            <span>Margem Bruta: {formatCurrency(profit)}</span>
         </div>
      </div>

      {/* Specs Grid */}
      <div className="grid grid-cols-2 gap-3">
         <div className="bg-white/5 border border-white/10 p-3 rounded flex flex-col gap-1 hover:border-zinc-700 transition-colors">
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold flex items-center gap-1">
               <Scale className="h-3 w-3" /> Volume
            </span>
            <span className="text-sm font-mono text-zinc-200">
               {product.volume_ml ? `${product.volume_ml}ml` : 'N/A'}
            </span>
         </div>
         <div className="bg-white/5 border border-white/10 p-3 rounded flex flex-col gap-1 hover:border-zinc-700 transition-colors">
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold flex items-center gap-1">
              <Code className="h-3 w-3" /> NCM
            </span>
            <span className="text-sm font-mono text-zinc-200">
               {product.ncm || 'N/A'}
            </span>
         </div>
         <div className="bg-white/5 border border-white/10 p-3 rounded flex flex-col gap-1 hover:border-zinc-700 transition-colors">
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold flex items-center gap-1">
              <Box className="h-3 w-3" /> CEST
            </span>
            <span className="text-sm font-mono text-zinc-200">
               {product.cest || 'N/A'}
            </span>
         </div>
         <div className="bg-white/5 border border-white/10 p-3 rounded flex flex-col gap-1 hover:border-zinc-700 transition-colors">
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold flex items-center gap-1">
              <Globe className="h-3 w-3" /> Origem
            </span>
            <span className="text-sm font-mono text-zinc-200">
               {product.origin === '0' ? 'Nacional' : product.origin === '1' ? 'Importado' : 'Outro'}
            </span>
         </div>
      </div>

      {/* Fiscal Code Block */}
      <div className="bg-black/40 border border-white/5 rounded p-4 text-xs relative group shadow-inner">
         <div className="absolute top-2 right-2 text-violet-500 opacity-30">
            <Code className="h-4 w-4" />
         </div>
         <div className="text-violet-400 mb-3 opacity-80 font-medium">// Regras Fiscais</div>
         <div className="grid grid-cols-2 gap-y-4 gap-x-2">
            <div>
               <span className="text-zinc-600 block mb-1 font-medium">CFOP Padrão</span>
               <span className="text-violet-200 bg-violet-500/10 px-2 py-1 rounded border border-violet-500/20 font-mono">
                  {product.cfop || '5102'}
               </span>
            </div>
            <div>
               <span className="text-zinc-600 block mb-1 font-medium">Grupo Tributário</span>
               <span className="text-violet-200 bg-violet-500/10 px-2 py-1 rounded border border-violet-500/20 font-mono">
                  A - Simples Nacional
               </span>
            </div>
         </div>
      </div>
    </div>
  );
};
