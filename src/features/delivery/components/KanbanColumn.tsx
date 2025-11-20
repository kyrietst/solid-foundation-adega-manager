/**
 * @fileoverview Coluna Kanban para painel de entregas
 * Exibe uma lista vertical de pedidos agrupados por status
 *
 * @author Adega Manager Team
 * @version 1.0.0 - Painel Operacional Kanban
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { Badge } from '@/shared/ui/primitives/badge';
import { cn } from '@/core/config/utils';
import { getSFProTextClasses } from '@/core/config/theme-utils';
import { Clock, Package, Truck, CheckCircle, LucideIcon } from 'lucide-react';
import DeliveryOrderCard from './DeliveryOrderCard';
import type { DeliveryOrder } from '@/features/delivery/hooks/useDeliveryOrders';

interface KanbanColumnProps {
  title: string;
  status: 'pending' | 'preparing' | 'out_for_delivery' | 'delivered';
  deliveries: DeliveryOrder[];
  onUpdateStatus: (saleId: string, newStatus: string, deliveryPersonId?: string) => void;
  isUpdating?: boolean;
  icon?: LucideIcon;
  color?: 'yellow' | 'orange' | 'blue' | 'green';
}

const colorConfig = {
  yellow: {
    border: 'border-yellow-500/50 hover:border-yellow-400/70',
    headerBg: 'bg-gradient-to-r from-yellow-900/60 via-yellow-800/50 to-yellow-900/60',
    iconBg: 'bg-yellow-500/30 border-yellow-400/50',
    icon: 'text-yellow-400',
    badge: 'bg-yellow-500/30 text-yellow-300 border border-yellow-500/50',
    glow: 'hover:shadow-yellow-500/20'
  },
  orange: {
    border: 'border-orange-500/50 hover:border-orange-400/70',
    headerBg: 'bg-gradient-to-r from-orange-900/60 via-orange-800/50 to-orange-900/60',
    iconBg: 'bg-orange-500/30 border-orange-400/50',
    icon: 'text-orange-400',
    badge: 'bg-orange-500/30 text-orange-300 border border-orange-500/50',
    glow: 'hover:shadow-orange-500/20'
  },
  blue: {
    border: 'border-blue-500/50 hover:border-blue-400/70',
    headerBg: 'bg-gradient-to-r from-blue-900/60 via-blue-800/50 to-blue-900/60',
    iconBg: 'bg-blue-500/30 border-blue-400/50',
    icon: 'text-blue-400',
    badge: 'bg-blue-500/30 text-blue-300 border border-blue-500/50',
    glow: 'hover:shadow-blue-500/20'
  },
  green: {
    border: 'border-green-500/50 hover:border-green-400/70',
    headerBg: 'bg-gradient-to-r from-green-900/60 via-green-800/50 to-green-900/60',
    iconBg: 'bg-green-500/30 border-green-400/50',
    icon: 'text-green-400',
    badge: 'bg-green-500/30 text-green-300 border border-green-500/50',
    glow: 'hover:shadow-green-500/20'
  }
};

const defaultIcons: Record<string, LucideIcon> = {
  pending: Clock,
  preparing: Package,
  out_for_delivery: Truck,
  delivered: CheckCircle
};

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  title,
  status,
  deliveries,
  onUpdateStatus,
  isUpdating = false,
  icon,
  color = 'yellow'
}) => {
  const IconComponent = icon || defaultIcons[status];
  const colors = colorConfig[color];

  return (
    <Card className={cn(
      "bg-black/80 backdrop-blur-xl border-2 shadow-xl transition-all duration-300",
      colors.border,
      colors.glow,
      "flex flex-col h-full"
    )}>
      {/* Header da coluna */}
      <CardHeader className={cn("pb-3 flex-shrink-0", colors.headerBg)}>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3">
            <div className={cn(
              "p-2 rounded-lg border-2 transition-transform duration-300 hover:scale-110",
              colors.iconBg
            )}>
              <IconComponent className={cn("h-5 w-5", colors.icon)} />
            </div>
            <div>
              <h3 className={cn(
                getSFProTextClasses('h4', 'primary'),
                "text-white font-semibold"
              )}>
                {title}
              </h3>
            </div>
          </CardTitle>

          {/* Badge com contagem */}
          <Badge className={cn(
            "font-bold text-base px-3 py-1 border",
            colors.badge
          )}>
            {deliveries.length}
          </Badge>
        </div>
      </CardHeader>

      {/* Lista de cards - scroll independente */}
      <CardContent className={cn(
        "flex-1 min-h-0 overflow-y-auto space-y-4 pt-4 pb-4",
        "scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent",
        "hover:scrollbar-thumb-white/30",
        "bg-gradient-to-b from-transparent via-black/10 to-transparent"
      )}>
        {deliveries.length === 0 ? (
          // Estado vazio
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className={cn(
              "p-4 rounded-full mb-4",
              colors.iconBg
            )}>
              <IconComponent className={cn("h-12 w-12", colors.icon, "opacity-50")} />
            </div>
            <p className={cn(
              getSFProTextClasses('label', 'secondary'),
              "text-gray-400"
            )}>
              Nenhuma entrega neste status
            </p>
          </div>
        ) : (
          // Lista de cards
          deliveries.map((delivery) => (
            <DeliveryOrderCard
              key={delivery.id}
              delivery={delivery}
              onUpdateStatus={onUpdateStatus}
              isUpdating={isUpdating}
            />
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default KanbanColumn;
