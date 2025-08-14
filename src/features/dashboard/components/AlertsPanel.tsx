import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { AlertTriangle, Info, XCircle, ExternalLink, ShoppingCart, Package, Users, Truck } from 'lucide-react';
import { useSmartAlerts, Alert } from '../hooks/useSmartAlerts';
import { cn } from '@/core/config/utils';
import { text, shadows } from '@/core/config/theme';
import { RecentActivity } from '@/features/dashboard/hooks/useDashboardData';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';

export interface AlertItem {
  id: string;
  severity: 'info' | 'warning' | 'critical';
  title: string;
  description?: string;
  href?: string;
}

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

interface AlertsPanelProps {
  items?: AlertItem[]; // Legacy prop for backward compatibility
  className?: string;
  maxItems?: number;
  previewActivities?: RecentActivity[]; // preview das últimas atividades reais
  cardHeight?: number; // altura fixa para alinhar com outros cards
}

export function AlertsPanel({ items, className, maxItems = 6, previewActivities, cardHeight }: AlertsPanelProps) {
  const { data: alertsData, isLoading, error } = useSmartAlerts();
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
  
  // Use smart alerts by default, fall back to legacy items prop
  const alerts = items || alertsData?.alerts || [];
  const displayAlerts = alerts.slice(0, maxItems);

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

  return (
    <Card className={cn("border-white/20 bg-black/80 backdrop-blur-xl shadow-lg", className)} style={cardHeight ? { minHeight: cardHeight } : undefined}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className={cn("text-base flex items-center gap-2", text.h2, shadows.light)}>
            <AlertTriangle className="h-4 w-4" />
            Alertas
            {alertsData && (
              <span className="text-xs bg-white/10 px-2 py-1 rounded-full">
                {alertsData.criticalCount + alertsData.warningCount + alertsData.infoCount}
              </span>
            )}
          </CardTitle>
          
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

      <CardContent className="space-y-3 text-sm text-gray-300">
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-xl bg-white/5 border border-white/10 p-3 animate-pulse">
                <div className="h-4 bg-white/10 rounded mb-2" />
                <div className="h-3 bg-white/5 rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : displayAlerts.length === 0 ? (
          <div className="text-center py-6">
            <Info className="h-8 w-8 text-green-400 mx-auto mb-2" />
            <div className="text-sm text-green-400 font-medium">Tudo funcionando bem!</div>
            <div className="text-xs text-gray-400 mt-1">Nenhum alerta no momento</div>
          </div>
        ) : (
          displayAlerts.map((alert) => {
            const config = severityConfig[alert.severity];
            const IconComponent = config.icon;
            
            const AlertContent = (
              <div className={cn(
                "rounded-xl border p-3 transition-all duration-200 cursor-pointer",
                "hover:scale-[1.02] hover:shadow-lg",
                config.bgColor,
                config.borderColor,
                alert.href ? "hover:bg-opacity-80" : ""
              )}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2 flex-1 min-w-0">
                    <IconComponent className={cn("h-4 w-4 mt-0.5 flex-shrink-0", config.color)} />
                    <div className="flex-1 min-w-0">
                      <div className={cn("text-sm flex items-center gap-1", text.h3, shadows.light)}>
                        {alert.title}
                        {alert.icon && <span>{alert.icon}</span>}
                      </div>
                      {alert.description && (
                        <div className={cn("text-xs mt-1", text.h5, shadows.subtle)}>{alert.description}</div>
                      )}
                      {alert.count && (
                        <div className={cn("text-xs mt-1 font-mono", text.h6, shadows.subtle)}>
                          {alert.count} item{alert.count > 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  </div>
                  {alert.href && (
                    <ExternalLink className="h-3 w-3 text-gray-400 flex-shrink-0" />
                  )}
                </div>
              </div>
            );

            return alert.href ? (
              <a key={alert.id} href={alert.href} className="block">
                {AlertContent}
              </a>
            ) : (
              <div key={alert.id}>
                {AlertContent}
              </div>
            );
          })
        )}

        {/* Total de estoque (quando disponível) */}
        {totalInventoryValue != null && (
          <div className="pt-3 mt-2 border-t border-white/10 text-center">
            <div className={cn("text-xs", text.h5, shadows.subtle)}>Total em estoque</div>
            <div className={cn("text-lg", text.h3, shadows.light)}>
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalInventoryValue)}
            </div>
            <div className={cn("text-[10px] mt-1", text.h6, shadows.subtle)}>Baseado no valor do estoque</div>
          </div>
        )}

        {/* Prévia últimas atividades reais */}
        {previewActivities && previewActivities.length > 0 && (
          <div className="pt-2 mt-2 border-t border-white/10">
            <div className={cn("text-xs uppercase tracking-wide mb-2", text.h5, shadows.subtle)}>Últimas atividades</div>
            <div className="space-y-2">
              {previewActivities.slice(0, 3).map((act) => {
                const iconMap = { sale: ShoppingCart, stock: Package, customer: Users, delivery: Truck } as const;
                const Icon = iconMap[act.type as keyof typeof iconMap] || ShoppingCart;
                return (
                  <div key={act.id} className={cn("flex items-start gap-2 text-xs", text.h6, shadows.subtle)}>
                    <Icon className="h-3.5 w-3.5 text-amber-400 mt-0.5" />
                    <div className="flex-1 min-w-0 truncate">
                      <span className={cn("font-medium", text.h4, shadows.light)}>{act.description}</span>
                      <span className={cn(text.h5, shadows.subtle)}> — {act.details}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          {alerts.length > maxItems ? (
            <a 
              href="/reports?tab=alerts" 
              className={cn("text-xs hover:text-amber-300 transition-colors", text.h5, shadows.subtle)}
            >
              Ver mais {alerts.length - maxItems} alerta{alerts.length - maxItems > 1 ? 's' : ''}...
            </a>
          ) : (
            <span />
          )}
          <a 
            href="/activities" 
            className={cn("text-xs hover:text-blue-300 transition-colors", text.h4, shadows.light)}
          >
            Ver todos
          </a>
        </div>
      </CardContent>
    </Card>
  );
}

