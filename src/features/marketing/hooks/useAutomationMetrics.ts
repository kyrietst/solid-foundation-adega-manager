/**
 * @fileoverview Hook para métricas de automação baseadas em dados reais
 * Refatorado para usar audit_logs e customers como fonte de dados
 * (automation_logs foi deprecada e removida do banco de dados)
 * 
 * @author Adega Manager Team
 * @version 2.0.0
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';

export interface AutomationMetrics {
  activeWorkflows: number;
  totalExecutions: number;
  successRate: number;
  customersImpacted: number;
  lastExecution: string | null;
  upcomingTasks: number;
}

export interface WorkflowSuggestion {
  id: string;
  type: 'birthday' | 'churn' | 'retention' | 'recommendation' | 'stock';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  estimatedImpact: number;
  readyToImplement: boolean;
  requiredData: string[];
}

export interface AutomationExecution {
  id: string;
  workflow_name: string;
  trigger_event: string;
  result: 'success' | 'error' | 'pending';
  customer_id?: string;
  created_at: string;
  details?: any;
}

/**
 * Hook para calcular métricas reais de automação baseadas nos dados do sistema
 * Utiliza audit_logs como proxy para atividade de automação
 */
export const useAutomationMetrics = () => {
  return useQuery({
    queryKey: ['automation-metrics'],
    queryFn: async (): Promise<AutomationMetrics> => {

      try {
        // 1. Buscar dados de clientes para calcular impacto potencial
        const { data: customers, error: customersError } = await supabase
          .from('customers')
          .select('id, created_at, birthday, last_purchase_date');

        if (customersError) {
          console.error('Erro ao buscar clientes:', customersError);
        }

        // 3. Calcular métricas baseadas em cenários realistas
        // Como o motor de automação (n8n) foi removido, não temos workflows ativos reais ainda.
        // O sistema deve refletir isso (Realismo).
        
        const activeWorkflows = 0;
        const totalExecutions = 0;
        const successRate = 0;
        const customersImpacted = 0;
        const lastExecution = null;

        // Tarefas pendentes baseadas em oportunidades reais (Aniversariantes)
        const now = new Date();
        const upcomingBirthdays = customers?.filter(c => {
          if (!c.birthday) return false;
          const birthDate = new Date(c.birthday);
          const thisYear = now.getFullYear();
          const nextBirthday = new Date(thisYear, birthDate.getMonth(), birthDate.getDate());
          if (nextBirthday < now) {
            nextBirthday.setFullYear(thisYear + 1);
          }
          const daysUntil = Math.ceil((nextBirthday.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          return daysUntil <= 30 && daysUntil > 0;
        }).length || 0;

        const upcomingTasks = upcomingBirthdays; // Apenas aniversários reais

        return {
          activeWorkflows,
          totalExecutions,
          successRate,
          customersImpacted,
          lastExecution,
          upcomingTasks
        };

      } catch (error) {
        console.error('Erro ao calcular métricas de automação:', error);

        // Fallback para métricas mínimas
        return {
          activeWorkflows: 0,
          totalExecutions: 0,
          successRate: 0,
          customersImpacted: 0,
          lastExecution: null,
          upcomingTasks: 0
        };
      }
    },
    staleTime: 5 * 60 * 1000, 
    refetchInterval: false,
  });
};

/**
 * Hook para gerar sugestões de workflows baseadas nos dados reais do sistema
 */
export const useWorkflowSuggestions = () => {
  return useQuery({
    queryKey: ['workflow-suggestions'],
    queryFn: async (): Promise<WorkflowSuggestion[]> => {

      try {
        // Buscar dados para análise
        const [customersResult, salesResult, productsResult] = await Promise.all([
          supabase.from('customers').select('id, birthday, last_purchase_date, created_at'),
          supabase.from('sales').select('id, created_at, customer_id'),
          supabase.from('products').select('id, stock_quantity, minimum_stock')
        ]);

        const customers = customersResult.data || [];
        const sales = salesResult.data || [];
        const products = productsResult.data || [];

        const suggestions: WorkflowSuggestion[] = [];

        // 1. Workflow de Aniversários
        const customersWithBirthdays = customers.filter(c => c.birthday).length;
        if (customersWithBirthdays > 0) {
          suggestions.push({
            id: 'birthday-automation',
            type: 'birthday',
            title: 'Campanhas de Aniversário Automatizadas',
            description: `Enviar ofertas personalizadas para ${customersWithBirthdays} clientes nos seus aniversários`,
            priority: 'high',
            estimatedImpact: Math.min(customersWithBirthdays * 15, 80), // 15% de conversão esperada
            readyToImplement: true,
            requiredData: ['birthday', 'contact_preference', 'favorite_category']
          });
        }

        // 2. Workflow de Prevenção de Churn
        const now = new Date();
        const inactiveCustomers = customers.filter(c => {
          if (!c.last_purchase_date) return true;
          const daysSince = Math.floor(
            (now.getTime() - new Date(c.last_purchase_date).getTime()) / (1000 * 60 * 60 * 24)
          );
          return daysSince > 60;
        }).length;

        if (inactiveCustomers > 0) {
          suggestions.push({
            id: 'churn-prevention',
            type: 'churn',
            title: 'Prevenção de Churn Inteligente',
            description: `Reengajar ${inactiveCustomers} clientes inativos com ofertas personalizadas`,
            priority: 'high',
            estimatedImpact: Math.min(inactiveCustomers * 8, 60), // 8% de reativação esperada
            readyToImplement: true,
            requiredData: ['last_purchase_date', 'favorite_category', 'lifetime_value']
          });
        }

        // 3. Workflow de Recomendações
        const activeCustomers = customers.filter(c => {
          if (!c.last_purchase_date) return false;
          const daysSince = Math.floor(
            (now.getTime() - new Date(c.last_purchase_date).getTime()) / (1000 * 60 * 60 * 24)
          );
          return daysSince <= 30;
        }).length;

        if (activeCustomers > 0) {
          suggestions.push({
            id: 'smart-recommendations',
            type: 'recommendation',
            title: 'Recomendações Inteligentes',
            description: `Sugerir produtos para ${activeCustomers} clientes ativos baseado no histórico`,
            priority: 'medium',
            estimatedImpact: Math.min(activeCustomers * 12, 70), // 12% de conversão esperada
            readyToImplement: false,
            requiredData: ['purchase_history', 'favorite_category', 'price_range']
          });
        }

        // 4. Workflow de Estoque Baixo
        const lowStockProducts = products.filter(p => {
          const currentStock = Number(p.stock_quantity) || 0;
          const minStock = Number(p.minimum_stock) || 0;
          return currentStock <= minStock && minStock > 0;
        }).length;

        if (lowStockProducts > 0) {
          suggestions.push({
            id: 'stock-alerts',
            type: 'stock',
            title: 'Alertas de Estoque Automatizados',
            description: `Notificar sobre ${lowStockProducts} produtos com estoque baixo`,
            priority: 'medium',
            estimatedImpact: lowStockProducts * 5, // Impacto operacional
            readyToImplement: true,
            requiredData: ['stock_quantity', 'minimum_stock', 'reorder_point']
          });
        }

        // 5. Workflow de Retenção
        const recentCustomers = customers.filter(c => {
          const daysSinceCreation = Math.floor(
            (now.getTime() - new Date(c.created_at).getTime()) / (1000 * 60 * 60 * 24)
          );
          return daysSinceCreation <= 30;
        }).length;

        if (recentCustomers > 0) {
          suggestions.push({
            id: 'retention-sequence',
            type: 'retention',
            title: 'Sequência de Retenção de Novos Clientes',
            description: `Acompanhar ${recentCustomers} novos clientes com sequência de engajamento`,
            priority: 'low',
            estimatedImpact: Math.min(recentCustomers * 20, 50), // 20% de engajamento esperado
            readyToImplement: false,
            requiredData: ['created_at', 'first_purchase_date', 'contact_preference']
          });
        }


        return suggestions.sort((a, b) => {
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        });

      } catch (error) {
        console.error('Erro ao gerar sugestões de workflow:', error);
        return [];
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
};

/**
 * Hook para buscar execuções recentes de automação
 * Adaptado para usar audit_logs como proxy (automation_logs foi removida)
 */
export const useRecentExecutions = (limit: number = 10) => {
  return useQuery({
    queryKey: ['recent-executions', limit],
    queryFn: async (): Promise<AutomationExecution[]> => {
      // Como não temos logs de automação reais ainda, retornamos vazio para evitar erros de tipo
      // e respeitar a política de "Zero Fake".
      return [];
    },
    staleTime: 1 * 60 * 1000, // 1 minuto
  });
};

export default useAutomationMetrics;