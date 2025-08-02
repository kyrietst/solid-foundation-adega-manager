/**
 * Hook para cálculos estatísticos de clientes
 * Extraído do CustomersNew.tsx para separar responsabilidades
 */

import { useMemo } from 'react';
import { CustomerProfile } from '@/hooks/use-crm';
import { CustomerStatsData } from '@/components/customers/types';

export const useCustomerStats = (customers: CustomerProfile[]): CustomerStatsData => {
  return useMemo(() => {
    if (!customers.length) {
      return {
        totalCustomers: 0,
        vipCustomers: 0,
        totalRevenue: 0,
        averageTicket: 0,
        activeCustomers: 0
      };
    }

    // Cálculo de clientes VIP
    const vipCount = customers.filter(c => 
      c.segment === 'VIP' || c.segment === 'Fiel - VIP'
    ).length;

    // Cálculo de receita total (lifetime value)
    const totalRevenue = customers.reduce((sum, c) => sum + (c.lifetime_value || 0), 0);

    // Cálculo de ticket médio
    const averageTicket = totalRevenue > 0 ? totalRevenue / customers.length : 0;

    // Cálculo de clientes ativos (compraram nos últimos 30 dias)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const activeCustomers = customers.filter(c => {
      const lastPurchase = c.last_purchase_date ? new Date(c.last_purchase_date) : null;
      return lastPurchase && lastPurchase > thirtyDaysAgo;
    }).length;

    return {
      totalCustomers: customers.length,
      vipCustomers: vipCount,
      totalRevenue,
      averageTicket,
      activeCustomers
    };
  }, [customers]);
};