import React from 'react';
import { Building2, Package, TrendingUp, CheckCircle2 } from 'lucide-react';

// Interface inferida conforme uso em SuppliersManagement
export interface SupplierStatsData {
  total_suppliers: number;
  active_suppliers: number;
  total_product_categories: number;
}

interface SupplierStatsProps {
  stats: SupplierStatsData;
  isLoading?: boolean;
}

export const SupplierStats: React.FC<SupplierStatsProps> = ({
  stats,
  isLoading
}) => {
  if (isLoading) {
    return (
      <div className="w-full h-24 bg-gray-800/50 rounded-xl animate-pulse" />
    );
  }

  // Calculate generic engagement/active rate
  const activeRate = stats.total_suppliers > 0 
    ? Math.round((stats.active_suppliers / stats.total_suppliers) * 100) 
    : 0;

  return (
    <section className="w-full mb-8">
      <div className="flex flex-wrap items-center justify-between gap-6 px-4 py-2">

        {/* Metric 1: Total Suppliers */}
        <div className="flex flex-col gap-1 min-w-[140px]">
          <span className="text-sm font-medium text-zinc-500">Total de Fornecedores</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white tracking-tight">
              {stats.total_suppliers}
            </span>
            <span className="flex items-center text-xs font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-md">
              <Building2 className="h-3 w-3 mr-1" />
              Base
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="hidden md:block w-px h-12 bg-zinc-800"></div>

        {/* Metric 2: Active Suppliers */}
        <div className="flex flex-col gap-1 min-w-[140px]">
          <span className="text-sm font-medium text-zinc-500">Fornecedores Ativos</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white tracking-tight">
              {stats.active_suppliers}
            </span>
            <span className="text-sm text-zinc-600">parceiros</span>
          </div>
        </div>

        {/* Divider */}
        <div className="hidden md:block w-px h-12 bg-zinc-800"></div>

        {/* Metric 3: Product Categories (Mix) */}
        <div className="flex flex-col gap-1 min-w-[140px]">
          <span className="text-sm font-medium text-zinc-500">Categorias de Produtos</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-emerald-400 tracking-tight">
              {stats.total_product_categories}
            </span>
            <span className="text-sm text-emerald-500/60 flex items-center gap-1">
               <Package className="h-3 w-3" />
               Mix
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="hidden md:block w-px h-12 bg-zinc-800"></div>

        {/* Metric 4: Active Rate (Calculated) */}
        <div className="flex flex-col gap-1 min-w-[140px]">
          <span className="text-sm font-medium text-zinc-500">Taxa de Atividade</span>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold text-white tracking-tight">
              {activeRate}%
            </span>
            <div className="h-2 w-16 bg-zinc-800 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full bg-emerald-500 transition-all duration-500" 
                style={{ width: `${activeRate}%` }} 
              />
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
