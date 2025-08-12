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
      sale: { icon: 'text-accent-green', bg: 'bg-accent-green/10', border: 'border-accent-green/30' },
      stock: { icon: 'text-accent-blue', bg: 'bg-accent-blue/10', border: 'border-accent-blue/30' },
      customer: { icon: 'text-primary-yellow', bg: 'bg-primary-yellow/10', border: 'border-primary-yellow/30' },
      delivery: { icon: 'text-accent-purple', bg: 'bg-accent-purple/10', border: 'border-accent-purple/30' },
    };

    return colorMap[type] || colorMap.sale;
  };

  const glassClasses = glassEffect ? getGlassCardClasses(variant) : '';

  return (
    <Card className={cn(glassClasses, 'shadow-xl', classNameOverride)}>
      <CardHeader>
        <CardTitle className="text-primary-yellow text-xl font-semibold">
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
            <p className="text-gray-400">Nenhuma atividade recente encontrada</p>
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
                    'bg-gray-800/30 hover:bg-gray-800/50 border backdrop-blur-sm',
                    colors.border,
                    'hover:border-primary-yellow/40 hover:scale-[1.01]'
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
                    <p className="text-sm font-semibold text-gray-100 truncate" title={activity.description}>
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-400 mt-1 truncate" title={activity.details}>
                      {activity.details}
                    </p>
                  </div>
                  <div className="w-2 h-8 rounded-full bg-gradient-to-b from-primary-yellow/60 to-primary-yellow/20" aria-hidden="true" />
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};