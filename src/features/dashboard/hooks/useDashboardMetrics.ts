/**
 * Hook para métricas calculadas do dashboard
 * Transforma dados brutos em métricas formatadas para apresentação
 */

import { useMemo } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Percent, Users, Star, Package, Truck } from 'lucide-react';
import { DashboardCounts, DashboardFinancials } from './useDashboardData';

export interface MetricCard {
  title: string;
  value: string;
  icon: any;
  description: string;
  variant?: 'default' | 'success' | 'warning' | 'error';
  accent?: 'amber' | 'blue' | 'green' | 'purple' | 'red';
}

export const useDashboardMetrics = (
  counts?: DashboardCounts,
  financials?: DashboardFinancials
) => {
  // Métricas públicas (todos os usuários podem ver)
  const publicMetrics = useMemo((): MetricCard[] => {
    if (!counts) return [];

    return [
      {
        title: 'Total de Clientes',
        value: counts.totalCustomers.toString(),
        icon: Users,
        description: `${counts.totalCustomers} clientes ativos`,
        variant: counts.totalCustomers > 0 ? 'success' : 'warning'
      },
      {
        title: 'Clientes VIP',
        value: counts.vipCustomers.toString(),
        icon: Star,
        description: `${counts.vipCustomers} cliente${counts.vipCustomers !== 1 ? 's' : ''} premium`,
        variant: counts.vipCustomers > 0 ? 'success' : 'default'
      },
      {
        title: 'Produtos em Estoque',
        value: counts.productsInStock.toString(),
        icon: Package,
        description: `${counts.productsInStock} produtos disponíveis`,
        variant: counts.productsInStock > 10 ? 'success' : counts.productsInStock > 0 ? 'warning' : 'error'
      },
      {
        title: 'Entregas Pendentes',
        value: counts.pendingDeliveries.toString(),
        icon: Truck,
        description: `${counts.pendingDeliveries} entrega${counts.pendingDeliveries !== 1 ? 's' : ''} aguardando`,
        variant: counts.pendingDeliveries === 0 ? 'success' : counts.pendingDeliveries < 5 ? 'warning' : 'error'
      }
    ];
  }, [counts]);

  // Métricas sensíveis (apenas admin)
  const sensitiveMetrics = useMemo((): MetricCard[] => {
    if (!financials) return [];

    const formatCurrency = (value: number) => 
      new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(value);

    const formatPercentage = (value: number) => 
      `${value.toFixed(1)}%`;

    return [
      {
        title: 'Faturamento Total',
        value: formatCurrency(financials.totalRevenue),
        icon: DollarSign,
        description: `${formatCurrency(financials.totalRevenue)} este mês`,
        variant: financials.totalRevenue > 0 ? 'success' : 'warning',
        accent: 'amber' as const
      },
      {
        title: 'Lucro Líquido',
        value: formatCurrency(financials.netProfit),
        icon: TrendingUp,
        description: `${formatCurrency(financials.netProfit)} de lucro`,
        variant: financials.netProfit > 0 ? 'success' : 'error',
        accent: 'green' as const
      },
      {
        title: 'Margem de Lucro',
        value: formatPercentage(financials.profitMargin),
        icon: Percent,
        description: `${formatPercentage(financials.profitMargin)} de margem`,
        variant: financials.profitMargin > 30 ? 'success' : financials.profitMargin > 15 ? 'warning' : 'error',
        accent: 'purple' as const
      },
      {
        title: 'Custos Operacionais',
        value: formatCurrency(financials.operationalCosts),
        icon: TrendingDown,
        description: `${formatCurrency(financials.operationalCosts)} em custos`,
        variant: 'default',
        accent: 'red' as const
      }
    ];
  }, [financials]);

  return {
    publicMetrics,
    sensitiveMetrics,
  };
};