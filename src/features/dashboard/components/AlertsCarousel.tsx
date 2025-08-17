/**
 * AlertsCarousel Component
 * Carrossel elegante para exibir múltiplos alertas com navegação automática e manual
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { AlertTriangle, Info, XCircle, ExternalLink, ChevronLeft, ChevronRight, Pause, Play, ShoppingCart, Package, Users, Truck } from 'lucide-react';
import { useSmartAlerts, Alert } from '../hooks/useSmartAlerts';
import { cn } from '@/core/config/utils';
import { Button } from '@/shared/ui/primitives/button';
import { RecentActivity } from '@/features/dashboard/hooks/useDashboardData';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';

const severityConfig: Record<Alert['severity'], {
  color: string;
  bgColor: string;
  borderColor: string;
  icon: React.ComponentType<{ className?: string }>;
}> = {
  critical: {
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
    icon: XCircle
  },
  warning: {
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    icon: AlertTriangle
  },
  info: {
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    icon: Info
  }
};

interface AlertsCarouselProps {
  className?: string;
  cardHeight?: number;
  autoRotateInterval?: number; // tempo em ms para rotação automática
  showControls?: boolean; // mostrar controles de navegação
  previewActivities?: RecentActivity[]; // preview das últimas atividades reais
}

export function AlertsCarousel({ 
  className, 
  cardHeight, 
  autoRotateInterval = 5000,
  showControls = true,
  previewActivities
}: AlertsCarouselProps) {
  const { data: alertsData, isLoading, error } = useSmartAlerts();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  // Query para valor total do estoque (igual ao AlertsPanel)
  const shouldFetchInventoryTotal = alertsData?.inventoryTotalValue == null;
  const { data: inventoryTotal } = useQuery({
    queryKey: ['inventory-total-value'],
    enabled: shouldFetchInventoryTotal,
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<number | null> => {
      try {
        const { data: rpcData, error: rpcError } = await supabase.rpc('get_inventory_total_value');
        if (!rpcError && rpcData && typeof rpcData.total_value === 'number') {
          return Number(rpcData.total_value);
        }
      } catch {}
      try {
        const { data, error } = await supabase.from('products').select('price, stock_quantity');
        if (!error && data) {
          return data.reduce((sum: number, p: any) => sum + Number(p.price || 0) * Number(p.stock_quantity || 0), 0);
        }
      } catch {}
      return null;
    },
  });
  const totalInventoryValue = alertsData?.inventoryTotalValue ?? inventoryTotal ?? null;

  const alerts = alertsData?.alerts || [];
  const hasMultipleAlerts = alerts.length > 1;

  // Auto-rotation effect
  useEffect(() => {
    if (!hasMultipleAlerts || !isAutoRotating || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % alerts.length);
    }, autoRotateInterval);

    return () => clearInterval(interval);
  }, [alerts.length, isAutoRotating, isPaused, autoRotateInterval, hasMultipleAlerts]);

  // Pause auto-rotation on hover
  const handleMouseEnter = () => setIsPaused(true);
  const handleMouseLeave = () => setIsPaused(false);

  // Manual navigation
  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % alerts.length);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + alerts.length) % alerts.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const toggleAutoRotation = () => {
    setIsAutoRotating(!isAutoRotating);
  };

  if (error) {
    return (
      <Card className={cn("border-white/10 bg-black/40 backdrop-blur-xl", className)}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-gray-400 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-400" />
            Alertas - Erro
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-red-400">Erro ao carregar alertas</div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className={cn("border-white/20 bg-black/80 backdrop-blur-xl shadow-lg", className)} style={cardHeight ? { minHeight: cardHeight } : undefined}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-bold text-amber-400 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Alertas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl bg-white/5 border border-white/10 p-4 animate-pulse">
            <div className="h-4 bg-white/10 rounded mb-2" />
            <div className="h-3 bg-white/5 rounded w-3/4" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (alerts.length === 0) {
    return (
      <Card className={cn("border-white/20 bg-black/80 backdrop-blur-xl shadow-lg", className)} style={cardHeight ? { minHeight: cardHeight } : undefined}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-bold text-amber-400 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Alertas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Info className="h-8 w-8 text-green-400 mx-auto mb-2" />
            <div className="text-sm text-green-400 font-medium">Tudo funcionando bem!</div>
            <div className="text-xs text-gray-400 mt-1">Nenhum alerta no momento</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentAlert = alerts[currentIndex];
  const config = severityConfig[currentAlert.severity];
  const IconComponent = config.icon;

  return (
    <Card 
      className={cn("border-white/20 bg-black/80 backdrop-blur-xl shadow-lg", className)} 
      style={cardHeight ? { height: cardHeight, overflow: 'hidden' } : undefined}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Header com controles */}
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-amber-400 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Alertas
            {alertsData && (
              <span className="text-sm bg-white/10 px-2 py-1 rounded-full font-medium">
                {alertsData.criticalCount + alertsData.warningCount + alertsData.infoCount}
              </span>
            )}
          </CardTitle>
          
          {/* Controles de navegação (apenas se houver múltiplos alertas) */}
          {hasMultipleAlerts && showControls && (
            <div className="flex items-center gap-2">
              {/* Auto-rotation toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleAutoRotation}
                className="h-7 w-7 p-0 text-gray-400 hover:text-amber-300"
                title={isAutoRotating ? "Pausar rotação automática" : "Iniciar rotação automática"}
              >
                {isAutoRotating ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
              </Button>

              {/* Previous/Next buttons */}
              <Button
                variant="ghost"
                size="sm"
                onClick={goToPrevious}
                className="h-7 w-7 p-0 text-gray-400 hover:text-amber-300"
                title="Alerta anterior"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={goToNext}
                className="h-7 w-7 p-0 text-gray-400 hover:text-amber-300"
                title="Próximo alerta"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Severity indicators */}
          {alertsData && (alertsData.criticalCount > 0 || alertsData.warningCount > 0) && (
            <div className="flex items-center gap-1">
              {alertsData.criticalCount > 0 && (
                <div className="flex items-center gap-1 text-xs text-red-400">
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                  {alertsData.criticalCount}
                </div>
              )}
              {alertsData.warningCount > 0 && (
                <div className="flex items-center gap-1 text-xs text-amber-400">
                  <div className="w-2 h-2 bg-amber-400 rounded-full" />
                  {alertsData.warningCount}
                </div>
              )}
            </div>
          )}
        </div>
      </CardHeader>

      {/* Alert content com animação */}
      <CardContent className="space-y-3 text-sm text-gray-300 overflow-y-auto">
        {/* Container com overflow hidden para slide effect */}
        <div className="relative overflow-hidden">
          <div 
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {alerts.map((alert, index) => {
              const alertConfig = severityConfig[alert.severity];
              const AlertIcon = alertConfig.icon;
              
              const AlertContent = (
                <div 
                  key={alert.id}
                  className="w-full flex-shrink-0"
                >
                  <div className={cn(
                    "rounded-xl border p-4 transition-all duration-300 cursor-pointer",
                    "hover:scale-[1.02] hover:shadow-lg",
                    alertConfig.bgColor,
                    alertConfig.borderColor,
                    alert.href ? "hover:bg-opacity-80" : "",
                    // Destacar alerta atual
                    index === currentIndex ? "ring-2 ring-white/20" : ""
                  )}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <AlertIcon className={cn("h-6 w-6 mt-0.5 flex-shrink-0", alertConfig.color)} />
                        <div className="flex-1 min-w-0">
                          <div className="text-base font-semibold text-white flex items-center gap-2">
                            {alert.title}
                            {alert.icon && <span className="text-lg">{alert.icon}</span>}
                          </div>
                          {alert.description && (
                            <div className="text-sm mt-2 text-gray-300 leading-relaxed">{alert.description}</div>
                          )}
                          {alert.count && (
                            <div className="text-sm mt-2 font-medium text-gray-400">
                              {alert.count} item{alert.count > 1 ? 's' : ''}
                            </div>
                          )}
                        </div>
                      </div>
                      {alert.href && (
                        <ExternalLink className="h-5 w-5 text-gray-400 flex-shrink-0" />
                      )}
                    </div>
                  </div>
                </div>
              );

              return alert.href ? (
                <a key={alert.id} href={alert.href} className="w-full flex-shrink-0">
                  {AlertContent}
                </a>
              ) : (
                AlertContent
              );
            })}
          </div>
        </div>

        {/* Indicadores de posição (dots) */}
        {hasMultipleAlerts && (
          <div className="flex items-center justify-center gap-2 pt-2">
            {alerts.map((_, index) => {
              const alert = alerts[index];
              const dotConfig = severityConfig[alert.severity];
              return (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all duration-300",
                    index === currentIndex 
                      ? cn("w-6", dotConfig.color.replace('text-', 'bg-'))
                      : "bg-gray-600 hover:bg-gray-500"
                  )}
                  title={`Ir para alerta ${index + 1}`}
                />
              );
            })}
          </div>
        )}

        {/* Contador de alertas */}
        {hasMultipleAlerts && (
          <div className="text-center">
            <span className="text-xs text-gray-500">
              {currentIndex + 1} de {alerts.length} alertas
            </span>
          </div>
        )}

        {/* Progress bar para auto-rotation */}
        {hasMultipleAlerts && isAutoRotating && !isPaused && (
          <div className="w-full bg-gray-700 rounded-full h-1 overflow-hidden">
            <div 
              className="h-full bg-amber-400 rounded-full transition-all ease-linear"
              style={{
                width: '100%',
                animation: `progressBar ${autoRotateInterval}ms linear infinite`
              }}
            />
          </div>
        )}

        {/* Total de estoque (quando disponível) */}
        {totalInventoryValue != null && (
          <div className="pt-3 mt-3 border-t border-white/10 text-center">
            <div className="text-sm text-gray-400 font-medium">Total em estoque</div>
            <div className="text-xl font-bold text-emerald-400 mt-1">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalInventoryValue)}
            </div>
            <div className="text-xs text-gray-500 mt-1">Baseado no valor do estoque</div>
          </div>
        )}

        {/* Prévia últimas atividades reais */}
        {previewActivities && previewActivities.length > 0 && (
          <div className="pt-3 mt-3 border-t border-white/10">
            <div className="text-sm uppercase tracking-wide mb-3 text-gray-400 font-semibold">Últimas atividades</div>
            <div className="space-y-3">
              {previewActivities.slice(0, 3).map((act) => {
                const iconMap = { sale: ShoppingCart, stock: Package, customer: Users, delivery: Truck } as const;
                const Icon = iconMap[act.type as keyof typeof iconMap] || ShoppingCart;
                return (
                  <div key={act.id} className="flex items-start gap-3">
                    <Icon className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white">{act.description}</div>
                      <div className="text-sm text-gray-400 mt-0.5 leading-relaxed">{act.details}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Link de navegação para atividades */}
        <div className="flex items-center justify-end pt-3 mt-2">
          <a 
            href="/activities" 
            className="text-sm text-blue-400 hover:text-blue-300 transition-colors font-medium"
          >
            Ver todos
          </a>
        </div>
      </CardContent>

      {/* CSS para animação da progress bar */}
      <style jsx>{`
        @keyframes progressBar {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </Card>
  );
}