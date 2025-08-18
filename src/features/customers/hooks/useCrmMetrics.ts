/**
 * @fileoverview Hook para calcular métricas CRM dinâmicas baseadas no período
 * Recalcula todas as métricas com base no período selecionado (7d, 30d, 90d, 180d)
 * 
 * @author Adega Manager Team
 * @version 1.0.0
 */

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useCustomers } from './use-crm';
import { supabase } from '@/core/api/supabase/client';

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

  // Buscar métricas via RPC Supabase para performance
  const { data: rpcMetrics, isLoading: isLoadingRpc, error: rpcError } = useQuery({
    queryKey: ['crm-metrics-rpc', periodDays],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.rpc('get_crm_metrics_by_period', {
          period_days: periodDays
        });
        
        if (error) throw error;
        return data?.[0] || null;
      } catch (error) {
        console.warn('RPC get_crm_metrics_by_period falhou, usando cálculo manual:', error);
        return null;
      }
    },
    staleTime: 1 * 60 * 1000, // 1 minuto
    gcTime: 3 * 60 * 1000, // 3 minutos
  });

  // Buscar clientes em risco via RPC
  const { data: rpcCustomersAtRisk, isLoading: isLoadingRiskRpc } = useQuery({
    queryKey: ['customers-at-risk-rpc', periodDays],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.rpc('get_customers_at_risk_by_period', {
          period_days: periodDays,
          limit_count: 10
        });
        
        if (error) throw error;
        return data || [];
      } catch (error) {
        console.warn('RPC get_customers_at_risk_by_period falhou:', error);
        return [];
      }
    },
    staleTime: 1 * 60 * 1000,
    gcTime: 3 * 60 * 1000,
  });

  const metrics = useMemo((): CrmMetrics => {
    // Recalculando métricas para período dinâmico
    
    // Se RPC disponível, usar dados do Supabase
    if (rpcMetrics && !rpcError) {
      // Usando dados do RPC Supabase
      
      // Calcular aniversários baseado no período selecionado (mínimo 30 dias para aniversários)
      const now = new Date();
      const birthdayPeriod = Math.max(periodDays, 30); // Mínimo 30 dias para aniversários
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
      
      return {
        totalCustomers: parseInt(rpcMetrics.total_customers) || 0,
        activeCustomers: parseInt(rpcMetrics.active_customers) || 0,
        totalLTV: parseFloat(rpcMetrics.total_ltv) || 0,
        averageLTV: parseFloat(rpcMetrics.average_ltv) || 0,
        churnRate: parseFloat(rpcMetrics.churn_rate) || 0,
        newCustomersThisPeriod: parseInt(rpcMetrics.new_customers) || 0,
        upcomingBirthdays,
        atRiskCustomers: parseInt(rpcMetrics.at_risk_customers) || 0,
        retentionRate: parseFloat(rpcMetrics.retention_rate) || 0,
        avgPurchaseFrequency: 0 // Calculado separadamente se necessário
      };
    }
    
    // Fallback para cálculo manual se RPC falhar
    // Usando cálculo manual (fallback)
    const now = new Date();
    const periodStartDate = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000);
    
    const totalCustomers = customers.length;
    
    const activeCustomers = customers.filter(c => {
      const lastPurchase = c.last_purchase_date ? new Date(c.last_purchase_date) : null;
      return lastPurchase && lastPurchase >= periodStartDate;
    }).length;
    
    const totalLTV = customers.reduce((sum, c) => sum + (parseFloat(c.lifetime_value) || 0), 0);
    const averageLTV = totalCustomers > 0 ? totalLTV / totalCustomers : 0;
    
    const newCustomersThisPeriod = customers.filter(c => {
      if (!c.created_at) return false;
      const createdAt = new Date(c.created_at);
      return createdAt >= periodStartDate;
    }).length;

    // Calcular aniversários baseado no período (mínimo 30 dias)
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
  }, [customers, periodDays, rpcMetrics, rpcError]);

  // Clientes em risco detalhados
  const customersAtRisk = useMemo((): CustomerAtRisk[] => {
    // Se RPC disponível, usar dados do Supabase
    if (rpcCustomersAtRisk && rpcCustomersAtRisk.length > 0) {
      // Usando dados do RPC Supabase
      return rpcCustomersAtRisk.map(customer => ({
        id: customer.id,
        name: customer.name || '',
        segment: customer.segment || 'Novo',
        daysSinceLastPurchase: customer.days_since_last_purchase || null,
        ltv: parseFloat(customer.lifetime_value) || 0,
        risk_level: customer.risk_level as 'alto' | 'medio' | 'baixo',
        lastPurchaseDate: customer.last_purchase_date || null,
        riskReason: customer.risk_reason || 'Não especificado'
      }));
    }
    
    // Fallback para cálculo manual
    // Usando cálculo manual (fallback)
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
          ltv: parseFloat(customer.lifetime_value) || 0,
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
  }, [customers, periodDays, rpcCustomersAtRisk]);

  return {
    metrics,
    customersAtRisk,
    isLoading: isLoadingCustomers || isLoadingRpc || isLoadingRiskRpc
  };
};

export default useCrmMetrics;