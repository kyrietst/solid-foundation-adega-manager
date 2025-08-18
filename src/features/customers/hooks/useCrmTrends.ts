/**
 * @fileoverview Hook para buscar dados reais de tendências CRM do Supabase
 * Substitui dados simulados por métricas reais de clientes e vendas
 * 
 * @author Adega Manager Team
 * @version 1.0.0
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';

export interface TrendData {
  month: string;
  novos: number;
  ativos: number;
  ltv: number;
}

interface RawTrendData {
  mes: number;
  ano: number;
  novos_clientes?: number;
  clientes_ativos?: number;
  ltv_medio?: string;
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
        // 1. Buscar dados de tendências com período dinâmico via RPC
        const { data: rpcTrendsData, error: rpcError } = await supabase
          .rpc('get_crm_trends_by_period', { period_days: periodDays });

        if (!rpcError && rpcTrendsData && rpcTrendsData.length > 0) {
          // Usando dados do RPC Supabase
          return rpcTrendsData.map((item: any) => ({
            month: item.period_label,
            novos: item.new_customers || 0,
            ativos: item.active_customers || 0,
            ltv: Math.round(parseFloat(item.avg_ltv) || 0)
          }));
        }

        console.warn('RPC get_crm_trends_by_period não disponível, usando query manual');
        
        // 2. Fallback para cálculo manual (código existente)
        const { data: newCustomersData, error: newError } = await supabase
          .rpc('get_crm_trends_new_customers');

        if (newError) {
          console.warn('RPC get_crm_trends_new_customers não encontrada, usando query manual');
          
          // Fallback: query manual para novos clientes baseado no período
          const periodStartDate = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000);
          const { data: manualNew, error: manualNewError } = await supabase
            .from('customers')
            .select('created_at')
            .gte('created_at', periodStartDate.toISOString());

          if (manualNewError) throw manualNewError;

          // Processar dados manualmente
          const newByMonth = new Map<string, number>();
          manualNew?.forEach(customer => {
            const date = new Date(customer.created_at);
            const key = `${date.getFullYear()}-${date.getMonth()}`;
            newByMonth.set(key, (newByMonth.get(key) || 0) + 1);
          });

          // 2. Buscar clientes ativos baseado no período
          const { data: manualActive, error: manualActiveError } = await supabase
            .from('customers')
            .select('last_purchase_date, lifetime_value')
            .not('last_purchase_date', 'is', null)
            .gte('last_purchase_date', periodStartDate.toISOString());

          if (manualActiveError) throw manualActiveError;

          // Processar clientes ativos e LTV por mês
          const activeByMonth = new Map<string, { count: number, totalLtv: number }>();
          manualActive?.forEach(customer => {
            if (customer.last_purchase_date) {
              const date = new Date(customer.last_purchase_date);
              const key = `${date.getFullYear()}-${date.getMonth()}`;
              const current = activeByMonth.get(key) || { count: 0, totalLtv: 0 };
              activeByMonth.set(key, {
                count: current.count + 1,
                totalLtv: current.totalLtv + (parseFloat(customer.lifetime_value) || 0)
              });
            }
          });

          // 3. Gerar dados baseado no período selecionado
          const trends: TrendData[] = [];
          const now = new Date();
          
          // Calcular número de pontos baseado no período
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
        }

        // Se RPC existir, processar dados dela
        return processRpcTrendData(newCustomersData);

      } catch (error) {
        console.error('Erro ao buscar tendências CRM:', error);
        
        // Fallback final: retornar dados baseados em dados reais existentes
        return generateFallbackTrends();
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutos - menor para períodos dinâmicos
    gcTime: 5 * 60 * 1000, // 5 minutos
  });
};

/**
 * Processa dados de RPC se disponível
 */
function processRpcTrendData(data: any[]): TrendData[] {
  return data.map(item => ({
    month: MONTH_NAMES[item.month - 1] || 'N/A',
    novos: item.new_customers || 0,
    ativos: item.active_customers || 0,
    ltv: Math.round(parseFloat(item.avg_ltv || '0'))
  }));
}

/**
 * Gera dados de fallback usando APENAS dados reais do banco (sem invenções)
 */
async function generateFallbackTrends(): Promise<TrendData[]> {
  try {
    console.warn('📊 Fallback: Usando dados reais limitados devido a erro na RPC');
    
    // Buscar apenas dados reais existentes
    const { data: customers } = await supabase
      .from('customers')
      .select('created_at, lifetime_value, last_purchase_date');

    if (!customers || customers.length === 0) {
      console.error('❌ Nenhum cliente encontrado para fallback');
      return []; // Retornar array vazio se não há dados reais
    }

    // Usar apenas dados reais dos últimos meses sem invenção
    const monthsData: TrendData[] = [];
    const now = new Date();
    
    // Processar apenas últimos 6 meses com dados reais
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      const monthName = MONTH_NAMES[monthStart.getMonth()];
      
      // Contar novos clientes reais neste mês
      const novosReais = customers.filter(c => {
        if (!c.created_at) return false;
        const createdDate = new Date(c.created_at);
        return createdDate >= monthStart && createdDate <= monthEnd;
      }).length;
      
      // Contar clientes ativos reais neste mês
      const ativosReais = customers.filter(c => {
        if (!c.last_purchase_date) return false;
        const purchaseDate = new Date(c.last_purchase_date);
        return purchaseDate >= monthStart && purchaseDate <= monthEnd;
      }).length;
      
      // LTV médio real dos clientes ativos neste mês
      const clientesAtivosDoMes = customers.filter(c => {
        if (!c.last_purchase_date) return false;
        const purchaseDate = new Date(c.last_purchase_date);
        return purchaseDate >= monthStart && purchaseDate <= monthEnd;
      });
      
      const ltvMedio = clientesAtivosDoMes.length > 0 
        ? clientesAtivosDoMes.reduce((sum, c) => sum + (parseFloat(c.lifetime_value) || 0), 0) / clientesAtivosDoMes.length
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
    
    // Se falhar completamente, retornar array vazio ao invés de dados falsos
    return [];
  }
}

export default useCrmTrends;