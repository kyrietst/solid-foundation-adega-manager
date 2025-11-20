/**
 * @fileoverview Grid de KPIs Operacionais para Delivery - REFATORADO com StatCard SSoT
 * Exibe 3 cards premium com métricas do dia: Entregas, Faturamento e Ticket Médio
 *
 * @author Adega Manager Team
 * @version 3.1.0 - Cálculo Local Otimizado (Performance)
 */

import React, { useMemo } from 'react';
import { CheckCircle, DollarSign, TrendingUp } from 'lucide-react';
import { StatCard } from '@/shared/ui/composite/stat-card';
import type { DeliveryOrder } from '@/features/delivery/hooks/useDeliveryOrders';

interface DeliveryStatsGridProps {
  deliveries: DeliveryOrder[];
  isLoading?: boolean;
}

export const DeliveryStatsGrid: React.FC<DeliveryStatsGridProps> = ({
  deliveries = [],
  isLoading = false
}) => {

  // Filtrar entregas concluídas hoje e calcular KPIs
  const stats = useMemo(() => {
    const deliveredToday = deliveries.filter(d => {
      const isDelivered = d.delivery_status === 'delivered';

      if (!isDelivered || !d.delivery_completed_at) return false;

      // Verificar se foi entregue hoje
      const completedDate = new Date(d.delivery_completed_at);
      const today = new Date();

      return (
        completedDate.getDate() === today.getDate() &&
        completedDate.getMonth() === today.getMonth() &&
        completedDate.getFullYear() === today.getFullYear()
      );
    });

    const entregasCount = deliveredToday.length;
    const faturamento = deliveredToday.reduce((sum, d) => sum + (d.final_amount || 0), 0);
    const ticketMedio = entregasCount > 0 ? faturamento / entregasCount : 0;

    return {
      entregas: entregasCount,
      faturamento,
      ticketMedio,
    };
  }, [deliveries]);

  // 🎯 KPI items usando padrão Dashboard
  const kpiItems = [
    {
      id: 'entregas-realizadas',
      label: 'Entregas Realizadas',
      value: stats.entregas,
      icon: CheckCircle,
      valueType: 'positive' as const,
      isLoading,
      formatType: 'number' as const,
    },
    {
      id: 'faturamento-hoje',
      label: 'Faturamento Hoje',
      value: stats.faturamento,
      icon: DollarSign,
      valueType: 'positive' as const,
      isLoading,
      formatType: 'currency' as const,
    },
    {
      id: 'ticket-medio',
      label: 'Ticket Médio',
      value: stats.ticketMedio,
      icon: TrendingUp,
      valueType: 'positive' as const,
      isLoading,
      formatType: 'currency' as const,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {kpiItems.map((kpi) => (
        <StatCard
          key={kpi.id}
          title={kpi.label}
          value={kpi.value}
          icon={kpi.icon}
          variant={kpi.valueType === 'positive' ? 'success' : 'default'}
          layout="crm"
          formatType={kpi.formatType}
        />
      ))}
    </div>
  );
};

export default DeliveryStatsGrid;
