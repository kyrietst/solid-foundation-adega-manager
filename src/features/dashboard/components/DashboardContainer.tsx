/**
 * Container do Dashboard - Coordena dados e lógica de apresentação
 * Implementa padrão Container/Presentational
 */

import React from 'react';
import { useAuth } from '@/app/providers/AuthContext';
import { useDashboardData } from '@/features/dashboard/hooks/useDashboardData';
import { useDashboardMetrics } from '@/features/dashboard/hooks/useDashboardMetrics';
import { DashboardPresentation } from './DashboardPresentation';

export const DashboardContainer: React.FC = () => {
  const { userRole } = useAuth();
  
  // Buscar dados reais do dashboard
  const {
    counts,
    salesData,
    recentActivities,
    isLoading,
    isLoadingCounts,
    isLoadingSales,
    isLoadingActivities
  } = useDashboardData();

  // Processar métricas para apresentação (apenas métricas públicas)
  const { publicMetrics } = useDashboardMetrics(counts);

  // Preparar dados para o componente de apresentação
  const presentationProps = {
    // Dados processados
    publicMetrics,
    salesData: salesData || [],
    recentActivities: recentActivities || [],
    
    // Estados de loading
    isLoading,
    isLoadingCounts,
    isLoadingSales,
    isLoadingActivities,
    
    // Configuração de apresentação
    userRole,
    showEmployeeNote: userRole === 'employee',
  };

  return <DashboardPresentation {...presentationProps} />;
};