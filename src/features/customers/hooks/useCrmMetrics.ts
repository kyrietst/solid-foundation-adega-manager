/**
 * @fileoverview Hook para calcular métricas CRM dinâmicas baseadas no período
 * Recalcula todas as métricas com base no período selecionado (7d, 30d, 90d, 180d)
 * 
 * @author Adega Manager Team
 * @version 2.0.0 - Removido RPCs inexistentes, usando cálculo direto
 */

import { useMemo } from 'react';
import { useCustomers } from './use-crm';

export interface CrmMetrics {
  totalCustomers: number;
  activeCustomers: number;
  totalLTV: number;
  averageLTV: number;
  churnRate: number;
  newCustomersThisPeriod: number;
  upcomingBirthdays: number;
  atRiskCustomers: number;
  retentionRate: number;
  avgPurchaseFrequency: number;
}

export interface CustomerAtRisk {
  id: string;
  name: string;
  segment: string;
  daysSinceLastPurchase: number | null; // null = nunca comprou
  ltv: number;
  risk_level: 'alto' | 'medio' | 'baixo';
  lastPurchaseDate: string | null;
  riskReason: string;
}

/**
 * Hook para calcular métricas CRM baseadas no período selecionado
 * @param periodDays - Período em dias para cálculo (7, 30, 90, 180)
 */
export const useCrmMetrics = (periodDays: number = 30) => {
  const { data: customers = [], isLoading: isLoadingCustomers } = useCustomers();

  // ✅ REMOVED: RPC calls (get_crm_metrics_by_period, get_customers_at_risk_by_period)
  // Using direct calculation only

  const metrics = useMemo((): CrmMetrics => {
    const now = new Date();
    const periodStartDate = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000);

    const totalCustomers = customers.length;

    const activeCustomers = customers.filter(c => {
      const lastPurchase = c.last_purchase_date ? new Date(c.last_purchase_date) : null;
      return lastPurchase && lastPurchase >= periodStartDate;
    }).length;

    const totalLTV = customers.reduce((sum, c) => sum + (parseFloat((c as any).lifetime_value) || 0), 0);
    const averageLTV = totalCustomers > 0 ? totalLTV / totalCustomers : 0;

    const newCustomersThisPeriod = customers.filter(c => {
      if (!c.created_at) return false;
      const createdAt = new Date(c.created_at);
      return createdAt >= periodStartDate;
    }).length;

    // Calculate birthdays (minimum 30 days)
    const birthdayPeriod = Math.max(periodDays, 30);
    const birthdayEndDate = new Date(now.getTime() + birthdayPeriod * 24 * 60 * 60 * 1000);
    const upcomingBirthdays = customers.filter(c => {
      if (!c.birthday) return false;
      const birthDate = new Date(c.birthday);
      const thisYear = now.getFullYear();
      const nextBirthday = new Date(thisYear, birthDate.getMonth(), birthDate.getDate());
      if (nextBirthday < now) {
        nextBirthday.setFullYear(thisYear + 1);
      }
      return nextBirthday <= birthdayEndDate;
    }).length;

    const riskThresholdDays = Math.max(periodDays * 2, 90);
    const atRiskCustomers = customers.filter(c => {
      const lastPurchase = c.last_purchase_date ? new Date(c.last_purchase_date) : null;
      if (!lastPurchase) return true;
      const daysSince = Math.floor((now.getTime() - lastPurchase.getTime()) / (1000 * 60 * 60 * 24));
      return daysSince > riskThresholdDays;
    }).length;

    const churnRate = totalCustomers > 0 ? (atRiskCustomers / totalCustomers) * 100 : 0;
    const retentionRate = totalCustomers > 0 ? (activeCustomers / totalCustomers) * 100 : 0;

    return {
      totalCustomers,
      activeCustomers,
      totalLTV,
      averageLTV,
      churnRate,
      newCustomersThisPeriod,
      upcomingBirthdays,
      atRiskCustomers,
      retentionRate,
      avgPurchaseFrequency: 0
    };
  }, [customers, periodDays]);

  // Clientes em risco detalhados
  const customersAtRisk = useMemo((): CustomerAtRisk[] => {
    const now = new Date();
    const riskThresholdDays = Math.max(periodDays * 2, 90);

    return customers
      .map(customer => {
        const lastPurchase = customer.last_purchase_date ? new Date(customer.last_purchase_date) : null;
        const daysSinceLastPurchase = lastPurchase
          ? Math.floor((now.getTime() - lastPurchase.getTime()) / (1000 * 60 * 60 * 24))
          : 365;

        let risk_level: 'alto' | 'medio' | 'baixo';
        if (daysSinceLastPurchase > riskThresholdDays * 1.5) risk_level = 'alto';
        else if (daysSinceLastPurchase > riskThresholdDays) risk_level = 'medio';
        else risk_level = 'baixo';

        return {
          id: customer.id,
          name: customer.name || '',
          segment: customer.segment || 'Novo',
          daysSinceLastPurchase,
          ltv: parseFloat((customer as any).lifetime_value) || 0,
          risk_level,
          lastPurchaseDate: customer.last_purchase_date || null,
          riskReason: risk_level === 'alto'
            ? 'Sem compras há muito tempo'
            : 'Inativo no período selecionado'
        };
      })
      .filter(c => c.risk_level !== 'baixo')
      .sort((a, b) => b.daysSinceLastPurchase - a.daysSinceLastPurchase)
      .slice(0, 10);
  }, [customers, periodDays]);

  return {
    metrics,
    customersAtRisk,
    isLoading: isLoadingCustomers
  };
};

export default useCrmMetrics;