/**
 * Container do Dashboard - Coordena dados e lógica de apresentação
 * Implementa padrão Container/Presentational
 */

import React from 'react';
import { useAuth } from '@/app/providers/AuthContext';
import { useDashboardData } from '@/features/dashboard/hooks/useDashboardData';
import { useInventoryKpis } from '@/features/dashboard/hooks/useDashboardKpis';
import { useChannelData } from '@/features/dashboard/hooks/useChannelData';
import { DashboardPresentation } from './DashboardPresentation';

export const DashboardContainer: React.FC = () => {
  const { userRole } = useAuth();

  // 1. Dados Gerais do Dashboard (Vendas, Clientes, etc)
  const {
    counts,
    salesData,
    financials,
    isLoading: isLoadingGeneral,
    isLoadingCounts,
    isLoadingSales,
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

  // Preparar dados centralizados para o componente de apresentação
  const presentationProps = {
    // Dados processados
    salesData: salesData || [],

    // Dados Consolidados para UnifiedKpiSection
    kpiData: {
      counts,
      financials,
      inventory: inventoryKpis,
      channels: channelData
    },

    // Estados de loading consolidados
    loadingStates: {
      general: isLoadingGeneral,
      counts: isLoadingCounts,
      sales: isLoadingSales,
      financials: isLoadingFinancials,
      inventory: isLoadingInventory,
      channels: isLoadingChannels
    },

    // Configuração de apresentação
    userRole,
    showEmployeeNote: userRole === 'employee',
  };

  return <DashboardPresentation {...presentationProps} />;
};