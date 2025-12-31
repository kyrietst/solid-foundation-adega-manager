import React from 'react';
import { useAuth } from '@/app/providers/AuthContext';
import { useDashboardData } from '@/features/dashboard/hooks/useDashboardData';
import { useInventoryKpis } from '@/features/dashboard/hooks/useDashboardKpis';
import { useChannelData } from '@/features/dashboard/hooks/useChannelData';
import { useSalesChart, useTopProducts } from '@/features/dashboard/hooks/useDashboardMetrics';
import { DashboardPresentation } from './DashboardPresentation';

export const DashboardContainer: React.FC = () => {
  const { userRole } = useAuth();

  // 1. Dados Gerais do Dashboard (Vendas, Clientes, etc)
  const {
    counts,
    financials,
    // salesData, // Deprecated in favor of useSalesChart for the chart
    isLoading: isLoadingGeneral,
    isLoadingCounts,
    isLoadingFinancials
  } = useDashboardData(30);

  // 2. Dados de Estoque (KPIs)
  const {
    data: inventoryKpis,
    isLoading: isLoadingInventory
  } = useInventoryKpis();

  // 3. Dados de Canais (Delivery vs Loja)
  const {
    data: channelData,
    isLoading: isLoadingChannels
  } = useChannelData();

  // 4. ✅ SSoT: Dados do Gráfico de Vendas (Centralizado)
  const {
    data: salesChartData,
    isLoading: isLoadingSalesChart,
    error: salesChartError
  } = useSalesChart();

  // 5. ✅ SSoT: Top Produtos (Centralizado)
  const {
    data: topProductsData,
    isLoading: isLoadingTopProducts,
    error: topProductsError
  } = useTopProducts(5);

  // Preparar dados centralizados para o componente de apresentação
  const presentationProps = {
    // Dados Consolidados
    kpiData: {
      counts,
      financials,
      inventory: inventoryKpis,
      channels: channelData
    },

    // Dados de Gráficos e Listas
    chartData: salesChartData || [],
    topProducts: topProductsData || [],

    // Estados de loading consolidados
    loadingStates: {
      general: isLoadingGeneral,
      counts: isLoadingCounts,
      sales: isLoadingSalesChart,
      financials: isLoadingFinancials,
      inventory: isLoadingInventory,
      channels: isLoadingChannels,
      topProducts: isLoadingTopProducts
    },

    // Estados de erro (Novo)
    errors: {
      salesChart: salesChartError,
      topProducts: topProductsError
    },

    // Configuração de apresentação
    userRole,
    showEmployeeNote: userRole === 'employee',
  };

  return <DashboardPresentation {...presentationProps} />;
};