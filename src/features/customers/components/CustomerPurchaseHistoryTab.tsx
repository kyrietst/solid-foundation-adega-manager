/**
 * CustomerPurchaseHistoryTab.tsx - Tab unificada de histórico de compras e financeiro
 *
 * @description
 * Componente SSoT v3.0.0 que consolida histórico de compras e dados financeiros
 * em uma interface única e otimizada.
 *
 * @features
 * - Histórico completo de compras com filtros avançados
 * - Dados financeiros integrados (LTV, ticket médio, etc.)
 * - Search e filtros por período
 * - Resumo estatístico com StatCard
 * - Lista detalhada de compras
 * - Business logic centralizada em hooks
 * - Glassmorphism effects
 *
 * @author Adega Manager Team
 * @version 3.0.0 - SSoT Implementation
 */

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { Button } from '@/shared/ui/primitives/button';
import { Badge } from '@/shared/ui/primitives/badge';
import { Input } from '@/shared/ui/primitives/input';
import { StatCard } from '@/shared/ui/composite/stat-card';
import { SearchInput } from '@/shared/ui/composite/search-input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/primitives/select';
import { useGlassmorphismEffect } from '@/shared/hooks/ui/useGlassmorphismEffect';
import {
  ShoppingBag,
  Search,
  Filter,
  Package,
  DollarSign,
  BarChart3,
  CreditCard,
  TrendingUp,
  Calendar
} from 'lucide-react';
import { formatCurrency } from '@/core/config/utils';
import {
  useCustomerPurchaseHistory,
  type Purchase,
  type PurchaseFilters
} from '@/shared/hooks/business/useCustomerPurchaseHistory';

// ============================================================================
// TYPES
// ============================================================================

export interface CustomerPurchaseHistoryTabProps {
  purchases: Purchase[];
  isLoading?: boolean;
  error?: Error | null;
  className?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const PERIOD_OPTIONS = [
  { value: 'all', label: 'Todas' },
  { value: '30', label: 'Últimos 30 dias' },
  { value: '90', label: 'Últimos 3 meses' },
  { value: '180', label: 'Últimos 6 meses' },
  { value: '365', label: 'Último ano' }
];

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export const CustomerPurchaseHistoryTab: React.FC<CustomerPurchaseHistoryTabProps> = ({
  purchases = [],
  isLoading = false,
  error = null,
  className = ''
}) => {
  // ============================================================================
  // ESTADO LOCAL
  // ============================================================================

  const [filters, setFilters] = useState<PurchaseFilters>({
    searchTerm: '',
    periodFilter: 'all'
  });

  // ============================================================================
  // BUSINESS LOGIC COM SSoT
  // ============================================================================

  const { handleMouseMove } = useGlassmorphismEffect();

  const {
    filteredPurchases,
    summary,
    formatPurchaseDate,
    formatPurchaseId,
    hasData,
    isEmpty,
    isFiltered
  } = useCustomerPurchaseHistory(purchases, filters);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleSearchChange = useCallback((value: string) => {
    setFilters(prev => ({ ...prev, searchTerm: value }));
  }, []);

  const handlePeriodChange = useCallback((value: string) => {
    setFilters(prev => ({
      ...prev,
      periodFilter: value as PurchaseFilters['periodFilter']
    }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({
      searchTerm: '',
      periodFilter: 'all'
    });
  }, []);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <section
      className={`bg-black/80 backdrop-blur-sm border border-white/10 rounded-xl shadow-lg p-6 hover:shadow-2xl hover:shadow-purple-500/10 hover:border-purple-400/30 transition-all duration-300 space-y-6 ${className}`}
      onMouseMove={handleMouseMove}
    >
      {/* Header com filtros */}
      <Card className="bg-gray-800/30 border-gray-700/40">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-green-400" />
              Histórico de Compras & Financeiro
              <Badge variant="outline" className="ml-2 border-green-500/30 text-green-400">
                {filteredPurchases.length} compras
              </Badge>
            </CardTitle>

            <div className="flex items-center gap-3">
              {/* Busca por produto - Usando SearchInput SSoT */}
              <SearchInput
                value={filters.searchTerm}
                onChange={handleSearchChange}
                placeholder="Buscar produtos..."
                className="w-64"
              />

              {/* Filtro por período */}
              <Select value={filters.periodFilter} onValueChange={handlePeriodChange}>
                <SelectTrigger className="w-40 bg-gray-700 border-gray-600">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PERIOD_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        {/* Resumo financeiro - SSoT StatCard */}
        {hasData && (
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard
                layout="crm"
                variant="success"
                title="Total Gasto"
                value={formatCurrency(summary.totalSpent)}
                description="💰 Valor total"
                icon={DollarSign}
                className="h-20"
              />

              <StatCard
                layout="crm"
                variant="default"
                title="Itens Comprados"
                value={summary.totalItems}
                description="📦 Quantidade"
                icon={Package}
                className="h-20"
              />

              <StatCard
                layout="crm"
                variant="purple"
                title="Ticket Médio"
                value={formatCurrency(summary.averageTicket)}
                description="🎟️ Média por compra"
                icon={BarChart3}
                className="h-20"
              />

              <StatCard
                layout="crm"
                variant="warning"
                title="Compras"
                value={summary.purchaseCount}
                description="🛒 Total de transações"
                icon={CreditCard}
                className="h-20"
              />
            </div>
          </CardContent>
        )}
      </Card>

      {/* Lista de compras */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400 mx-auto mb-3"></div>
            <p className="text-gray-400">Carregando compras...</p>
          </div>
        ) : error ? (
          <Card className="bg-red-900/20 border-red-700/30">
            <CardContent className="p-6 text-center">
              <div className="text-red-400 mb-2">❌ Erro ao carregar compras</div>
              <p className="text-sm text-gray-400">Tente recarregar a página</p>
            </CardContent>
          </Card>
        ) : isEmpty ? (
          <Card className="bg-gray-800/30 border-gray-700/40">
            <CardContent className="p-8 text-center">
              <Package className="h-12 w-12 mx-auto mb-4 text-gray-500 opacity-50" />
              <div className="text-gray-400">
                {isFiltered ?
                  'Nenhuma compra encontrada com os filtros aplicados' :
                  'Este cliente ainda não realizou compras'
                }
              </div>
              {isFiltered && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={handleClearFilters}
                >
                  Limpar Filtros
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredPurchases.map((purchase) => (
            <Card key={purchase.id} className="bg-gray-800/30 border-gray-700/40 hover:border-gray-600/50 transition-colors">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="text-white font-medium">
                      Compra {formatPurchaseId(purchase.id)}
                    </div>
                    <div className="text-sm text-gray-400">
                      {formatPurchaseDate(purchase.date)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-400">
                      {formatCurrency(purchase.total)}
                    </div>
                    <div className="text-xs text-gray-400">
                      {purchase.items.length} {purchase.items.length === 1 ? 'item' : 'itens'}
                    </div>
                  </div>
                </div>

                {/* Lista de itens da compra */}
                <div className="space-y-2 border-t border-gray-700/30 pt-3">
                  {purchase.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <div className="flex-1">
                        <span className="text-gray-200">{item.product_name}</span>
                        <span className="text-gray-500 ml-2">x{item.quantity}</span>
                      </div>
                      <div className="text-gray-300">
                        {formatCurrency(item.unit_price)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Métricas da compra */}
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-700/30 text-xs">
                  <div className="flex items-center gap-4">
                    <span className="text-gray-400">
                      Ticket: <span className="text-green-400">{formatCurrency(purchase.total)}</span>
                    </span>
                    <span className="text-gray-400">
                      Itens: <span className="text-blue-400">{purchase.items.reduce((sum, item) => sum + item.quantity, 0)}</span>
                    </span>
                  </div>
                  <div className="text-gray-500">
                    {new Date(purchase.date).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Resumo de performance financeira */}
      {hasData && (
        <Card className="bg-gradient-to-r from-green-900/20 to-blue-900/20 border-green-700/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-400" />
              Performance Financeira
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  {formatCurrency(summary.totalSpent)}
                </div>
                <div className="text-sm text-gray-400">Receita Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">
                  {formatCurrency(summary.averageTicket)}
                </div>
                <div className="text-sm text-gray-400">Ticket Médio</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">
                  {summary.purchaseCount}
                </div>
                <div className="text-sm text-gray-400">Total de Compras</div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-700/30">
              <div className="text-center text-xs text-gray-400">
                📊 Dados financeiros integrados com histórico de compras
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </section>
  );
};

export default CustomerPurchaseHistoryTab;