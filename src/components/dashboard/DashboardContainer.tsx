/**
 * Container do Dashboard - Coordena dados e lógica de apresentação
 * Implementa padrão Container/Presentational
 */

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboardData } from '@/hooks/dashboard/useDashboardData';
import { useDashboardMetrics } from '@/hooks/dashboard/useDashboardMetrics';
import { DashboardPresentation } from './DashboardPresentation';

export const DashboardContainer: React.FC = () => {
  const { userRole } = useAuth();
  
  // Buscar dados reais do dashboard
  const {
    counts,
    financials,
    salesData,
    recentActivities,
    isLoading,
    isLoadingCounts,
    isLoadingFinancials,
    isLoadingSales,
    isLoadingActivities
  } = useDashboardData();

  // Processar métricas para apresentação
  const { publicMetrics, sensitiveMetrics } = useDashboardMetrics(counts, financials);

  // Preparar dados para o componente de apresentação
  const presentationProps = {
    // Dados processados
    publicMetrics,
    sensitiveMetrics: userRole === 'admin' ? sensitiveMetrics : undefined,
    salesData: salesData || [],
    recentActivities: recentActivities || [],
    
    // Estados de loading
    isLoading,
    isLoadingCounts,
    isLoadingFinancials,
    isLoadingSales,
    isLoadingActivities,
    
    // Configuração de apresentação
    userRole,
    showFinancialMetrics: userRole === 'admin',
    showEmployeeNote: userRole === 'employee',
  };

  return <DashboardPresentation {...presentationProps} />;
};