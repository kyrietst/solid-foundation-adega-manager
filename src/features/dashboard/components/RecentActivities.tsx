/**
 * Atividades recentes do dashboard
 * Sub-componente especializado para timeline de atividades
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { ShoppingCart, Package, Users, Truck } from 'lucide-react';
import { LoadingSpinner } from '@/shared/ui/composite/loading-spinner';
import { RecentActivity } from '@/features/dashboard/hooks/useDashboardData';
import { cn } from '@/core/config/utils';
import { getGlassCardClasses } from '@/core/config/theme-utils';
import { text, shadows } from "@/core/config/theme";

interface RecentActivitiesProps {
  activities: RecentActivity[];
  isLoading?: boolean;
  variant?: 'default' | 'premium' | 'success' | 'warning' | 'error';
  glassEffect?: boolean;
  contentHeight?: number;
  classNameOverride?: string;
}

export const RecentActivities: React.FC<RecentActivitiesProps> = ({
  activities,
  isLoading = false,
  variant = 'premium',
  glassEffect = true,
  contentHeight = 360,
  classNameOverride,
}) => {
  // Mapear tipos de atividade para ícones e cores
  const getActivityIcon = (type: RecentActivity['type']) => {
    const iconMap = {
      sale: ShoppingCart,
      stock: Package,
      customer: Users,
      delivery: Truck,
    };

    return iconMap[type] || ShoppingCart;
  };

  // Cores por tipo de atividade no tema modernizado
  const getActivityColors = (type: RecentActivity['type']) => {
    const colorMap = {
      sale: { icon: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'border-emerald-500/30' },
      stock: { icon: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500/30' },
      customer: { icon: 'text-yellow-400', bg: 'bg-yellow-500/20', border: 'border-yellow-500/30' },
      delivery: { icon: 'text-purple-400', bg: 'bg-purple-500/20', border: 'border-purple-500/30' },
    };

    return colorMap[type] || colorMap.sale;
  };

  const glassClasses = glassEffect ? getGlassCardClasses(variant) : '';

  return (
    <Card 
      className={cn('bg-black/70 backdrop-blur-xl border border-white/20 shadow-lg hero-spotlight', classNameOverride)}
      onMouseMove={(e) => {
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        (e.currentTarget as HTMLElement).style.setProperty("--x", `${x}%`);
        (e.currentTarget as HTMLElement).style.setProperty("--y", `${y}%`);
      }}
    >
      <CardHeader>
        <CardTitle className={cn(text.h2, shadows.medium, "text-xl font-semibold")}>
          Atividades Recentes
        </CardTitle>
      </CardHeader>
      <CardContent className="overflow-y-auto" style={{ maxHeight: contentHeight }}>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner size="lg" />
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-8">
            <p className={cn(text.h5, shadows.subtle)}>Nenhuma atividade recente encontrada</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activities.map((activity) => {
              const IconComponent = getActivityIcon(activity.type);
              const colors = getActivityColors(activity.type);

              return (
                <div 
                  key={activity.id}
                  className={cn(
                    'flex items-center space-x-4 p-4 rounded-xl transition-all duration-300',
                    'bg-black/30 hover:bg-black/50 border backdrop-blur-sm',
                    colors.border,
                    'hover:border-white/40 hover:scale-[1.01]'
                  )}
                  role="listitem"
                  aria-label={`Atividade: ${activity.description}`}
                >
                  <div className={cn(
                    'p-3 rounded-xl backdrop-blur-sm transition-all duration-300',
                    colors.bg,
                    colors.border,
                    'border'
                  )}>
                    <IconComponent className={cn('h-5 w-5', colors.icon)} aria-hidden="true" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn(text.h4, shadows.medium, "text-sm font-semibold truncate")} title={activity.description}>
                      {activity.description}
                    </p>
                    <p className={cn(text.h6, shadows.subtle, "text-xs mt-1 truncate")} title={activity.details}>
                      {activity.details}
                    </p>
                  </div>
                  <div className="w-2 h-8 rounded-full bg-gradient-to-b from-yellow-400/60 to-yellow-400/20" aria-hidden="true" />
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};