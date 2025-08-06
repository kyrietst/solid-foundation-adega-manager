/**
 * Atividades recentes do dashboard
 * Sub-componente especializado para timeline de atividades
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { ShoppingCart, Package, Users, Truck } from 'lucide-react';
import { LoadingSpinner } from '@/shared/ui/composite/loading-spinner';
import { RecentActivity } from '@/features/dashboard/hooks/useDashboardData';

interface RecentActivitiesProps {
  activities: RecentActivity[];
  isLoading?: boolean;
}

export const RecentActivities: React.FC<RecentActivitiesProps> = ({
  activities,
  isLoading = false,
}) => {
  // Mapear tipos de atividade para ícones
  const getActivityIcon = (type: RecentActivity['type']) => {
    const iconMap = {
      sale: ShoppingCart,
      stock: Package,
      customer: Users,
      delivery: Truck,
    };

    return iconMap[type] || ShoppingCart;
  };

  return (
    <Card className="bg-adega-charcoal/20 border-white/10 backdrop-blur-xl shadow-xl">
      <CardHeader>
        <CardTitle className="text-adega-yellow text-xl font-semibold">
          Atividades Recentes
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner size="lg" />
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-adega-silver">Nenhuma atividade recente encontrada</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activities.map((activity) => {
              const IconComponent = getActivityIcon(activity.type);

              return (
                <div 
                  key={activity.id}
                  className="flex items-center space-x-4 p-4 rounded-xl bg-adega-graphite/30 hover:bg-adega-graphite/50 transition-all duration-200 border border-white/5"
                >
                  <div className="p-2 rounded-xl bg-white/10">
                    <IconComponent className="h-6 w-6 text-white/70" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-adega-platinum">
                      {activity.description}
                    </p>
                    <p className="text-xs text-adega-silver mt-1">
                      {activity.details}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};