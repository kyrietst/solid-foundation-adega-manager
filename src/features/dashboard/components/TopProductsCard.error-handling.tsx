/**
 * TopProductsCard.tsx - Componente com Error Handling robusto (REFATORADO)
 * Context7 Pattern: Elimina error state genérico identificado na análise
 * Substitui error fallback genérico por UX informativa e acionável
 *
 * REFATORAÇÃO BASEADA NA ANÁLISE:
 * - Error state específico com retry
 * - Loading state detalhado
 * - Empty state diferenciado de error
 * - Fallback navigation para outras features
 * - Debugging info em desenvolvimento
 *
 * @version 2.0.0 - Error Handling Implementation (Context7)
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { Button } from '@/shared/ui/primitives/button';
import { TrendingUp, Package, ExternalLink, AlertTriangle, RefreshCw, BarChart3 } from 'lucide-react';
import { cn } from '@/core/config/utils';
import { useTopProductsData } from '../hooks/useTopProductsData.error-handling';
import { formatCurrency, formatQuantity, formatPeriodLabel } from '../utils/formatters';
import { ComponentErrorBoundary } from '@/core/error-handling/ErrorBoundary';

interface TopProductsCardProps {
  className?: string;
  period?: number; // days
  limit?: number;
  useCurrentMonth?: boolean; // Use current month instead of last N days
  cardHeight?: number; // altura fixa do card (para alinhar com outros cards)
}

/**
 * TopProductsCard refatorado com error handling robusto
 * REFATORADO: Remove error state genérico, adiciona UX informativa
 */
export function TopProductsCard({
  className,
  period = 30,
  limit = 5,
  useCurrentMonth = true,
  cardHeight
}: TopProductsCardProps) {
  const {
    data: topProducts,
    isLoading,
    error,
    totalRevenue,
    totalQuantity,
    hasData,
    retry
  } = useTopProductsData({
    period,
    limit,
    useCurrentMonth,
  });

  // REFATORADO: Error state específico com ações (substitui error genérico)
  if (error) {
    return (
      <Card
        className={cn("border-red-500/40 bg-red-500/5 backdrop-blur-xl shadow-lg", className)}
        style={cardHeight ? { height: cardHeight } : undefined}
      >
        <CardHeader>
          <CardTitle className="text-red-300 font-bold flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Top Produtos Indisponível
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-300 text-sm leading-relaxed">
              Não foi possível carregar os produtos mais vendidos.
              {error.message.includes('network') && ' Verifique sua conexão com a internet.'}
              {error.message.includes('auth') && ' Sua sessão pode ter expirado.'}
            </p>

            {/* Ações de recovery */}
            <div className="flex gap-2 flex-wrap">
              <Button
                onClick={retry}
                size="sm"
                variant="outline"
                className="border-red-400/40 text-red-300 hover:bg-red-500/10"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Tentar Novamente
              </Button>

              <Button
                onClick={() => window.location.href = '/reports?tab=sales'}
                size="sm"
                variant="ghost"
                className="text-gray-400 hover:text-white"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Ver Relatórios
              </Button>
            </div>

            {/* Debug info em desenvolvimento */}
            {process.env.NODE_ENV === 'development' && (
              <details className="bg-black/50 p-3 rounded border border-red-500/20">
                <summary className="cursor-pointer text-sm text-red-400 mb-2">
                  Debug Info (Desenvolvimento)
                </summary>
                <pre className="text-xs text-red-200 whitespace-pre-wrap">
                  Error: {error.message}
                  {error.stack && '\n\nStack:\n' + error.stack}
                </pre>
              </details>
            )}
          </div>
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
            topProducts={topProducts!}
            totalRevenue={totalRevenue}
            totalQuantity={totalQuantity}
          />
        ) : (
          <EmptyState
            useCurrentMonth={useCurrentMonth}
            period={period}
            onCreateSale={() => window.location.href = '/sales'}
          />
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Loading state component (melhorado)
 */
const LoadingState: React.FC<{ limit: number }> = ({ limit }) => (
  <div className="space-y-3 h-[380px]">
    <div className="flex items-center gap-2 text-amber-400 text-sm font-medium mb-4">
      <div className="w-4 h-4 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
      Carregando produtos mais vendidos...
    </div>
    {Array.from({ length: limit }).map((_, i) => (
      <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/5 animate-pulse">
        <div className="flex items-center gap-4 flex-1">
          <div className="w-8 h-8 bg-white/10 rounded-full" />
          <div className="flex-1">
            <div className="h-4 bg-white/10 rounded mb-2" />
            <div className="h-3 bg-white/5 rounded w-2/3" />
          </div>
        </div>
        <div className="w-16 h-6 bg-white/10 rounded" />
      </div>
    ))}
  </div>
);

/**
 * Data state component (mantido do original)
 */
const DataState: React.FC<{
  topProducts: any[];
  totalRevenue: number;
  totalQuantity: number;
}> = ({ topProducts, totalRevenue, totalQuantity }) => (
  <>
    <div className="space-y-2">
      {topProducts.map((product, index) => (
        <div
          key={product.product_id}
          className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
        >
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
 * Empty state component (melhorado com ações)
 * REFATORADO: Diferencia ausência de dados de erro
 */
const EmptyState: React.FC<{
  useCurrentMonth: boolean;
  period: number;
  onCreateSale: () => void;
}> = ({ useCurrentMonth, period, onCreateSale }) => (
  <div className="text-center py-8">
    <Package className="h-12 w-12 text-gray-600 mx-auto mb-3" />
    <div className="text-sm text-gray-400 mb-2">Nenhuma venda no período</div>
    <div className="text-xs text-gray-500 mb-4">
      {useCurrentMonth ? 'Dados do mês atual' : `Dados dos últimos ${period} dias`}
    </div>

    {/* Ação para criar venda */}
    <Button
      onClick={onCreateSale}
      size="sm"
      className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-black font-medium"
    >
      <Package className="h-4 w-4 mr-2" />
      Registrar Primeira Venda
    </Button>
  </div>
);

/**
 * Export com Error Boundary para proteção adicional
 */
export default function TopProductsCardWithErrorBoundary(props: TopProductsCardProps) {
  return (
    <ComponentErrorBoundary componentName="TopProductsCard">
      <TopProductsCard {...props} />
    </ComponentErrorBoundary>
  );
}