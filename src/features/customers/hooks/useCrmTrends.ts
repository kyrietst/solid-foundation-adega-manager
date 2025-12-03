/**
 * @fileoverview Hook para buscar dados reais de tendências CRM
 * Calcula tendências baseadas em queries diretas às tabelas customers e sales
 * 
 * @author Adega Manager Team
 * @version 2.0.0 - Removido RPCs inexistentes, usando cálculo direto
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';

export interface TrendData {
  month: string;
  novos: number;
  ativos: number;
  ltv: number;
}

const MONTH_NAMES = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
];

/**
 * Hook para buscar dados reais de tendências CRM
 * Combina dados de novos clientes, clientes ativos e LTV médio por mês
 * @param periodDays - Período em dias para cálculo (7, 30, 90, 180)
 */
export const useCrmTrends = (periodDays: number = 180) => {
  return useQuery({
    queryKey: ['crm-trends', periodDays],
    queryFn: async (): Promise<TrendData[]> => {
      try {
        // ✅ REMOVED: RPC calls (get_crm_trends_by_period, get_crm_trends_new_customers)
        // Using direct queries only

        const periodStartDate = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000);

        // 1. Buscar novos clientes baseado no período
        const { data: newCustomersData, error: newError } = await supabase
          .from('customers')
          .select('created_at')
          .gte('created_at', periodStartDate.toISOString());

        if (newError) throw newError;

        // 2. Buscar clientes ativos baseado no período
        const { data: activeCustomersData, error: activeError } = await supabase
          .from('customers')
          .select('last_purchase_date, lifetime_value')
          .not('last_purchase_date', 'is', null)
          .gte('last_purchase_date', periodStartDate.toISOString());

        if (activeError) throw activeError;

        // 3. Processar dados por mês/período
        const newByMonth = new Map<string, number>();
        newCustomersData?.forEach(customer => {
          const date = new Date(customer.created_at);
          const key = `${date.getFullYear()}-${date.getMonth()}`;
          newByMonth.set(key, (newByMonth.get(key) || 0) + 1);
        });

        const activeByMonth = new Map<string, { count: number, totalLtv: number }>();
        activeCustomersData?.forEach(customer => {
          if (customer.last_purchase_date) {
            const date = new Date(customer.last_purchase_date);
            const key = `${date.getFullYear()}-${date.getMonth()}`;
            const current = activeByMonth.get(key) || { count: 0, totalLtv: 0 };
            activeByMonth.set(key, {
              count: current.count + 1,
              totalLtv: current.totalLtv + (parseFloat((customer as any).lifetime_value) || 0)
            });
          }
        });

        // 4. Gerar array de tendências baseado no período
        const trends: TrendData[] = [];
        const now = new Date();

        const dataPoints = periodDays <= 30 ? Math.min(periodDays, 30) / 5 : Math.min(periodDays / 30, 6);
        const intervalDays = periodDays / dataPoints;

        for (let i = Math.floor(dataPoints) - 1; i >= 0; i--) {
          const date = new Date(now.getTime() - (i * intervalDays * 24 * 60 * 60 * 1000));
          const key = `${date.getFullYear()}-${date.getMonth()}`;
          let monthName: string;

          if (periodDays <= 30) {
            monthName = `${date.getDate()}/${date.getMonth() + 1}`;
          } else {
            monthName = MONTH_NAMES[date.getMonth()];
          }

          const novos = newByMonth.get(key) || 0;
          const activeData = activeByMonth.get(key) || { count: 0, totalLtv: 0 };
          const ltv = activeData.count > 0 ? activeData.totalLtv / activeData.count : 0;

          trends.push({
            month: monthName,
            novos,
            ativos: activeData.count,
            ltv: Math.round(ltv)
          });
        }

        return trends;

      } catch (error) {
        console.error('Erro ao buscar tendências CRM:', error);

        // Fallback: retornar dados baseados em últimos 6 meses
        return generateFallbackTrends();
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000, // 5 minutos
  });
};

/**
 * Gera dados de fallback usando APENAS dados reais do banco
 */
async function generateFallbackTrends(): Promise<TrendData[]> {
  try {
    console.warn('📊 Fallback: Usando dados reais limitados dos últimos 6 meses');

    const { data: customers } = await supabase
      .from('customers')
      .select('created_at, lifetime_value, last_purchase_date');

    if (!customers || customers.length === 0) {
      console.error('❌ Nenhum cliente encontrado para fallback');
      return [];
    }

    const monthsData: TrendData[] = [];
    const now = new Date();

    // Processar últimos 6 meses com dados reais
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      const monthName = MONTH_NAMES[monthStart.getMonth()];

      const novosReais = customers.filter(c => {
        if (!c.created_at) return false;
        const createdDate = new Date(c.created_at);
        return createdDate >= monthStart && createdDate <= monthEnd;
      }).length;

      const ativosReais = customers.filter(c => {
        if (!c.last_purchase_date) return false;
        const purchaseDate = new Date(c.last_purchase_date);
        return purchaseDate >= monthStart && purchaseDate <= monthEnd;
      }).length;

      const clientesAtivosDoMes = customers.filter(c => {
        if (!c.last_purchase_date) return false;
        const purchaseDate = new Date(c.last_purchase_date);
        return purchaseDate >= monthStart && purchaseDate <= monthEnd;
      });

      const ltvMedio = clientesAtivosDoMes.length > 0
        ? clientesAtivosDoMes.reduce((sum, c) => sum + (parseFloat((c as any).lifetime_value) || 0), 0) / clientesAtivosDoMes.length
        : 0;

      monthsData.push({
        month: monthName,
        novos: novosReais,
        ativos: ativosReais,
        ltv: Math.round(ltvMedio)
      });
    }

    return monthsData;

  } catch (error) {
    console.error('❌ Erro crítico no fallback de tendências:', error);
    return [];
  }
}

export default useCrmTrends;