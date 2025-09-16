/**
 * TopProductsCardPresentation.tsx - Componente de apresentação puro (REFATORADO)
 * Context7 Pattern: Componente focado apenas na apresentação visual
 * Remove toda lógica de negócio e API calls do componente de UI
 *
 * REFATORAÇÃO APLICADA:
 * - Componente puro sem hooks de dados
 * - Props claramente definidas
 * - Formatação através de utilities
 * - Loading e error states separados
 * - Focus na apresentação visual
 *
 * @version 2.0.0 - Presentational Component (Context7)
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { TrendingUp, Package, ExternalLink } from 'lucide-react';
import { cn } from '@/core/config/utils';
import { TopProduct } from '../hooks/useTopProductsData';
import { formatCurrency, formatQuantity, formatPeriodLabel } from '../utils/formatters';

export interface TopProductsCardPresentationProps {
  // Data props
  data: TopProduct[] | undefined;
  isLoading: boolean;
  error: Error | null;

  // Computed props from container
  totalRevenue: number;
  totalQuantity: number;
  hasData: boolean;

  // Configuration props
  className?: string;
  period?: number;
  limit?: number;
  useCurrentMonth?: boolean;
  cardHeight?: number;
}

/**
 * Componente de apresentação puro para Top Products
 * Foca apenas na renderização visual sem lógica de negócio
 */
export const TopProductsCardPresentation: React.FC<TopProductsCardPresentationProps> = ({
  data,
  isLoading,
  error,
  totalRevenue,
  totalQuantity,
  hasData,
  className,
  period = 30,
  limit = 5,
  useCurrentMonth = true,
  cardHeight,
}) => {
  // Error State
  if (error) {
    return (
      <Card className={cn("border-red-500/40 bg-black/80 backdrop-blur-xl shadow-lg", className)}>
        <CardHeader>
          <CardTitle className="text-red-300 font-bold flex items-center gap-2">
            <Package className="h-5 w-5" />
            Erro - Top Produtos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-200 text-sm font-medium">Não foi possível carregar os dados.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn("bg-black/70 backdrop-blur-xl border border-white/20 shadow-lg hero-spotlight", className)}
      style={cardHeight ? { height: cardHeight } : undefined}
      onMouseMove={(e) => {
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        (e.currentTarget as HTMLElement).style.setProperty("--x", `${x}%`);
        (e.currentTarget as HTMLElement).style.setProperty("--y", `${y}%`);
      }}
    >
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-amber-400 tracking-tight flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-amber-400" />
            Top {limit} Produtos {formatPeriodLabel(useCurrentMonth, period)}
          </CardTitle>
          <a
            href="/reports?tab=sales&period=30"
            className="text-gray-300 hover:text-amber-400 transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </CardHeader>

      <CardContent
        className="space-y-2 text-sm text-gray-200 pb-6"
        style={cardHeight ? { maxHeight: cardHeight - 80, overflowY: 'auto' } : undefined}
      >
        {isLoading ? (
          <LoadingState limit={limit} />
        ) : hasData ? (
          <DataState
            data={data!}
            totalRevenue={totalRevenue}
            totalQuantity={totalQuantity}
          />
        ) : (
          <EmptyState useCurrentMonth={useCurrentMonth} period={period} />
        )}
      </CardContent>
    </Card>
  );
};

/**
 * Loading state component
 */
const LoadingState: React.FC<{ limit: number }> = ({ limit }) => (
  <div className="space-y-3 h-[380px]">
    {Array.from({ length: limit }).map((_, i) => (
      <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/5 animate-pulse">
        <div className="flex-1">
          <div className="h-4 bg-white/10 rounded mb-2" />
          <div className="h-3 bg-white/5 rounded w-2/3" />
        </div>
        <div className="w-16 h-6 bg-white/10 rounded" />
      </div>
    ))}
  </div>
);

/**
 * Data state component
 */
const DataState: React.FC<{
  data: TopProduct[];
  totalRevenue: number;
  totalQuantity: number;
}> = ({ data, totalRevenue, totalQuantity }) => (
  <>
    <div className="space-y-2">
      {data.map((product, index) => (
        <ProductRow key={product.product_id} product={product} index={index} />
      ))}
    </div>

    <div className="pt-4 mt-3 border-t border-white/10">
      <div className="flex justify-between items-center">
        <div>
          <div className="text-sm font-semibold text-white">
            Total: {formatCurrency(totalRevenue)}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">
            Receita combinada
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-semibold text-amber-400">
            {totalQuantity} itens
          </div>
          <div className="text-xs text-gray-500 mt-0.5">
            vendidos
          </div>
        </div>
      </div>
    </div>
  </>
);

/**
 * Product row component
 */
const ProductRow: React.FC<{ product: TopProduct; index: number }> = ({ product, index }) => (
  <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
    <div className="flex items-center gap-4 flex-1 min-w-0">
      <div className={cn(
        "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
        index === 0 ? "bg-amber-500 text-black" :
        index === 1 ? "bg-gray-400 text-black" :
        index === 2 ? "bg-amber-600 text-white" :
        "bg-white/20 text-gray-300"
      )}>
        {index + 1}
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-base font-semibold text-white truncate">
          {product.name}
        </div>
        <div className="text-sm text-gray-400 mt-1">
          {product.category} • {formatQuantity(product.qty)} vendidos
        </div>
      </div>
    </div>

    <div className="text-right flex-shrink-0">
      <div className="text-base font-bold text-emerald-400">
        {formatCurrency(product.revenue)}
      </div>
      <div className="text-sm text-gray-500 mt-0.5">
        receita
      </div>
    </div>
  </div>
);

/**
 * Empty state component
 */
const EmptyState: React.FC<{ useCurrentMonth: boolean; period: number }> = ({ useCurrentMonth, period }) => (
  <div className="text-center py-8">
    <Package className="h-12 w-12 text-gray-600 mx-auto mb-3" />
    <div className="text-sm text-gray-400 mb-2">Nenhuma venda no período</div>
    <div className="text-xs text-gray-500">
      {useCurrentMonth ? 'Dados do mês atual' : `Dados dos últimos ${period} dias`}
    </div>
  </div>
);