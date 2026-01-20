
import React from 'react';
import { formatCurrency } from '@/core/config/utils';
import { TrendingUp, TrendingDown, Tag, Factory, Minus } from 'lucide-react';
import type { Product } from '@/core/types/inventory.types';

interface ProductIntelligenceCardProps {
  product: Product;
  analytics?: {
    turnoverRate: string;
    avgSales: number;
    daysOfStock: number;
  };
}

export const ProductIntelligenceCard: React.FC<ProductIntelligenceCardProps> = ({ 
  product,
  analytics 
}) => {
  // Margin calc for Gauge
  const cost = Number(product.cost_price || 0);
  const price = Number(product.price || 0);
  const profit = price - cost;
  const marginPercent = cost > 0 ? ((profit / cost) * 100) : 0;
  
  // Gauge visual calculation (max 200% for full circle visual scaling)
  const gaugePercent = Math.min(Math.max(marginPercent, 0), 200); 
  const strokeDasharray = 100;
  const strokeDashoffset = strokeDasharray - ((gaugePercent / 200) * strokeDasharray); // Partial circle logic

  // Determine Turnover visual
  const isHighTurnover = analytics?.turnoverRate === 'alto';
  
  return (
    <div className="lg:col-span-4 h-full w-full rounded-xl bg-white/[0.02] border border-white/5 flex flex-col gap-4 p-5">
      {/* High Turnover Badge */}
      {isHighTurnover ? (
        <div className="w-full p-4 rounded-lg bg-emerald-500 text-zinc-900 shadow-[0_0_30px_rgba(16,185,129,0.2)] flex items-center justify-between border border-emerald-400 relative overflow-hidden group">
          <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 skew-x-12"></div>
          <div className="flex flex-col relative z-10">
            <span className="font-black text-lg leading-tight uppercase tracking-tight">Alto Giro</span>
            <span className="text-xs font-bold opacity-70">Top 10% Categoria</span>
          </div>
          <TrendingUp className="h-8 w-8 relative z-10" />
        </div>
      ) : (
        <div className="w-full p-4 rounded-lg bg-black/20 text-zinc-500 border border-white/5 flex items-center justify-between relative overflow-hidden">
          <div className="flex flex-col relative z-10">
             <span className="font-bold text-sm uppercase tracking-wider">Demanda Regular</span>
             <span className="text-xs opacity-50">Classificação Padrão</span>
          </div>
          <Minus className="h-6 w-6 opacity-30" />
        </div>
      )}

      {/* Profit Gauge & Metrics */}
      <div className="bg-black/20 border border-white/5 rounded-lg p-6 flex flex-col items-center gap-4 relative shadow-lg">
         <div className="flex items-center justify-between w-full">
            <h4 className="text-xs text-zinc-400 uppercase tracking-widest">Margem de Lucro</h4>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-900 text-zinc-500 border border-zinc-800">Atual</span>
         </div>
         
         <div className="relative size-44 my-2">
            {/* SVG Gauge */}
            <svg className="size-full -rotate-90 transform" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
               <circle className="stroke-zinc-800" cx="18" cy="18" fill="none" r="16" strokeWidth="2.5"></circle>
               <circle 
                 className="stroke-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.6)] transition-all duration-1000 ease-out" 
                 cx="18" cy="18" fill="none" r="16" 
                 strokeDasharray={`${strokeDasharray}`} 
                 strokeDashoffset={`${strokeDashoffset}`}
                 strokeLinecap="round" 
                 strokeWidth="2.5"
               ></circle>
            </svg>
            
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center flex flex-col items-center">
                <span className="text-4xl font-bold text-white block tracking-tighter">
                  {marginPercent.toFixed(1)}<span className="text-lg text-zinc-500">%</span>
                </span>
                <span className="text-[10px] text-emerald-500 uppercase font-bold tracking-wider mt-1">
                  {marginPercent > 30 ? 'Saudável' : 'Atenção'}
                </span>
             </div>
          </div>

          <div className="w-full grid grid-cols-2 gap-4 mt-2 divide-x divide-white/5">
             <div className="text-center pr-2">
                <span className="text-xs text-zinc-500 block font-medium">Média Mensal</span>
                <span className="text-lg font-semibold text-zinc-200">
                  {analytics?.avgSales ? analytics.avgSales.toFixed(1) : '--'} un
                </span>
             </div>
             <div className="text-center pl-2">
                 <span className="text-xs text-zinc-500 block font-medium">Cobertura</span>
                 <span className="text-lg font-semibold text-emerald-500">
                   {analytics?.daysOfStock ? `${analytics.daysOfStock} dias` : '--'}
                 </span>
             </div>
          </div>
       </div>

       {/* Wholesale Conditional Card */}
       {product.has_package_tracking && (
         <div className="bg-black/20 border border-white/5 rounded-lg overflow-hidden group hover:border-indigo-500/30 transition-colors">
            <div className="bg-indigo-950/30 border-b border-indigo-500/20 px-4 py-3 flex items-center justify-between">
               <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-2">
                  <Tag className="h-4 w-4" /> Venda em Fardo
               </span>
               <span className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)] animate-pulse"></span>
            </div>
            <div className="p-4">
               <p className="text-xs text-zinc-400 mb-3">Preço especial para atacado ativo.</p>
                <div className="flex items-center gap-3 bg-black/40 p-3 rounded border border-indigo-500/10">
                  <span className="text-2xl font-bold text-indigo-400 tracking-tighter">
                    {formatCurrency(product.package_price || 0)}
                  </span>
                  <div className="h-8 w-px bg-white/10"></div>
                  <div className="text-xs text-zinc-500 leading-tight">
                     Fardo com <span className="text-white font-bold text-sm">{product.package_units}</span> un.
                  </div>
               </div>
            </div>
         </div>
       )}

       {/* Suppliers Mini List */}
       <div className="bg-black/20 border border-white/5 rounded-lg p-4 flex flex-col gap-3">
          <span className="text-xs text-zinc-500 font-medium">Fornecedor Principal</span>
          <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-black/40 flex items-center justify-center text-zinc-500 border border-white/5">
                <Factory className="h-5 w-5" />
             </div>
             <div>
                <div className="text-sm text-zinc-200 font-bold">{product.supplier || 'Não informado'}</div>
             </div>
          </div>
       </div>

    </div>
  );
};
