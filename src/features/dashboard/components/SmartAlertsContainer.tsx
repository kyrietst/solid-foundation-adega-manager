/**
 * SmartAlertsContainer Component
 * Escolhe automaticamente entre AlertsPanel e AlertsCarousel baseado no número de alertas
 */

import React from 'react';
import { AlertsPanel } from './AlertsPanel';
import { AlertsCarousel } from './AlertsCarousel';
import { useSmartAlerts } from '../hooks/useSmartAlerts';
import { RecentActivity } from '@/features/dashboard/hooks/useDashboardData';

interface SmartAlertsContainerProps {
  className?: string;
  cardHeight?: number;
  maxItems?: number;
  previewActivities?: RecentActivity[];
  
  // Configurações do carrossel
  carouselThreshold?: number; // mínimo de alertas para usar carrossel (default: 2)
  autoRotateInterval?: number; // tempo de rotação automática em ms
  showControls?: boolean; // mostrar controles de navegação
  
  // Força um modo específico
  forceMode?: 'panel' | 'carousel';
}

export function SmartAlertsContainer({ 
  className,
  cardHeight,
  maxItems = 6,
  previewActivities,
  carouselThreshold = 2,
  autoRotateInterval = 6000,
  showControls = true,
  forceMode
}: SmartAlertsContainerProps) {
  const { data: alertsData, isLoading } = useSmartAlerts();
  
  const alerts = alertsData?.alerts || [];
  const alertsCount = alerts.length;
  
  // Determina qual componente usar
  const shouldUseCarousel = forceMode === 'carousel' || 
    (forceMode !== 'panel' && alertsCount >= carouselThreshold);

  if (shouldUseCarousel) {
    return (
      <AlertsCarousel
        className={className}
        cardHeight={cardHeight}
        autoRotateInterval={autoRotateInterval}
        showControls={showControls}
        previewActivities={previewActivities}
      />
    );
  }

  return (
    <AlertsPanel
      className={className}
      cardHeight={cardHeight}
      maxItems={maxItems}
      previewActivities={previewActivities}
    />
  );
}