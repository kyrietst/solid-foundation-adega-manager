import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';

export interface Alert {
  id: string;
  severity: 'info' | 'warning' | 'critical';
  title: string;
  description?: string;
  href?: string;
  count?: number;
  icon?: string;
}

export interface AlertsData {
  alerts: Alert[];
  criticalCount: number;
  warningCount: number;
  infoCount: number;
  inventoryTotalValue?: number;
}

export function useSmartAlerts() {
  return useQuery({
    queryKey: ['smart-alerts'],
    queryFn: async (): Promise<AlertsData> => {
      const alerts: Alert[] = [];

      // 1. Low stock products (CRITICAL and WARNING)
      try {
        const { data: lowStockData, error: lowStockError } = await supabase
          .rpc('get_low_stock_products', { limit_count: 50 });

        if (!lowStockError && lowStockData) {
          const zeroStock = lowStockData.filter((p: any) => Number(p.stock || 0) === 0);
          const lowStock = lowStockData.filter((p: any) => {
            const stock = Number(p.stock || 0);
            const minStock = Number(p.min_stock || 0);
            return stock > 0 && stock <= minStock;
          });

          if (zeroStock.length > 0) {
            alerts.push({
              id: 'zero-stock',
              severity: 'critical',
              title: `${zeroStock.length} produto${zeroStock.length > 1 ? 's' : ''} sem estoque`,
              description: 'Produtos com estoque zerado precisam de reposição urgente',
              href: '/inventory?filter=zero-stock',
              count: zeroStock.length,
              icon: '🔴'
            });
          }

          if (lowStock.length > 0) {
            alerts.push({
              id: 'low-stock',
              severity: 'warning',
              title: `${lowStock.length} produto${lowStock.length > 1 ? 's' : ''} abaixo do mínimo`,
              description: 'Produtos com estoque crítico',
              href: '/inventory?filter=low-stock',
              count: lowStock.length,
              icon: '🟡'
            });
          }
        }
      } catch (error) {
        console.error('Error fetching low stock alerts:', error);
      }

      // 2. Accounts receivable overdue (WARNING)
      try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { data: receivablesData, error: receivablesError } = await supabase
          .from('accounts_receivable')
          .select('amount, due_date')
          .eq('status', 'open')
          .lt('due_date', new Date().toISOString());

        if (!receivablesError && receivablesData && receivablesData.length > 0) {
          const totalOverdue = receivablesData.reduce((sum, item) => sum + Number(item.amount || 0), 0);
          const overdue30Plus = receivablesData.filter(item => {
            const dueDate = new Date(item.due_date);
            return dueDate < thirtyDaysAgo;
          });

          if (overdue30Plus.length > 0) {
            const totalOverdue30Plus = overdue30Plus.reduce((sum, item) => sum + Number(item.amount || 0), 0);
            alerts.push({
              id: 'overdue-receivables',
              severity: 'warning',
              title: `R$ ${totalOverdue30Plus.toFixed(2)} em atraso +30 dias`,
              description: `${overdue30Plus.length} conta${overdue30Plus.length > 1 ? 's' : ''} em atraso`,
              href: '/reports?tab=financial&filter=overdue-30',
              count: overdue30Plus.length,
              icon: '💰'
            });
          } else if (receivablesData.length > 0) {
            alerts.push({
              id: 'recent-overdue',
              severity: 'info',
              title: `R$ ${totalOverdue.toFixed(2)} em atraso recente`,
              description: `${receivablesData.length} conta${receivablesData.length > 1 ? 's' : ''} vencida${receivablesData.length > 1 ? 's' : ''}`,
              href: '/reports?tab=financial&filter=overdue',
              count: receivablesData.length,
              icon: '📅'
            });
          }
        }
      } catch (error) {
        console.error('Error fetching receivables alerts:', error);
      }

      // 3. Inactive customers (potential churn) - INFO
      try {
        const sixtyDaysAgo = new Date();
        sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

        const { data: inactiveCustomersData, error: inactiveError } = await supabase
          .from('customers')
          .select('id, name, last_purchase_date')
          .or(`last_purchase_date.lt.${sixtyDaysAgo.toISOString()},last_purchase_date.is.null`)
          .limit(100);

        if (!inactiveError && inactiveCustomersData && inactiveCustomersData.length > 0) {
          alerts.push({
            id: 'inactive-customers',
            severity: 'info',
            title: `${inactiveCustomersData.length} cliente${inactiveCustomersData.length > 1 ? 's' : ''} inativo${inactiveCustomersData.length > 1 ? 's' : ''}`,
            description: 'Clientes sem compra há mais de 60 dias',
            href: '/customers?filter=inactive-60d',
            count: inactiveCustomersData.length,
            icon: '👥'
          });
        }
      } catch (error) {
        console.error('Error fetching inactive customers alerts:', error);
      }

      // 4. High value products with zero sales (INFO) - Dead stock
      try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { data: deadStockData, error: deadStockError } = await supabase
          .from('products')
          .select(`
            id, name, price, stock_quantity,
            sale_items!left(quantity, sales!inner(created_at))
          `)
          .gt('price', 50) // High value products
          .gt('stock_quantity', 0) // With stock
          .is('sale_items.sales.created_at', null); // No sales in period

        if (!deadStockError && deadStockData && deadStockData.length > 5) {
          alerts.push({
            id: 'dead-stock',
            severity: 'info',
            title: `${deadStockData.length} produto${deadStockData.length > 1 ? 's' : ''} sem giro`,
            description: 'Produtos de alto valor sem vendas recentes',
            href: '/inventory?filter=dead-stock',
            count: deadStockData.length,
            icon: '📦'
          });
        }
      } catch (error) {
        console.error('Error fetching dead stock alerts:', error);
      }

      // 5. Alertas de vencimento (CRITICAL, WARNING, INFO)
      try {
        const { data: expiryAlertsData, error: expiryError } = await supabase
          .rpc('get_expiry_alerts_30_days', { limit_count: 20 });

        console.log('📊 Expiry Alerts Debug:', { expiryAlertsData, expiryError });

        if (!expiryError && expiryAlertsData && expiryAlertsData.length > 0) {
          // 🚨 TODOS OS ALERTAS DE VENCIMENTO SÃO CRÍTICOS (VERMELHOS)
          // Independente de quantos dias faltam - vencimento é sempre urgente
          
          const totalLotes = expiryAlertsData.length;
          const totalUnits = expiryAlertsData.reduce((sum: number, item: any) => sum + (item.affected_units || 0), 0);
          const totalValue = expiryAlertsData.reduce((sum: number, item: any) => sum + (Number(item.estimated_loss_value) || 0), 0);
          
          // Determinar o menor prazo para mostrar na mensagem
          const minDays = Math.min(...expiryAlertsData.map((item: any) => item.days_until_expiry));
          const maxDays = Math.max(...expiryAlertsData.map((item: any) => item.days_until_expiry));
          
          let timeDescription = '';
          if (minDays === maxDays) {
            timeDescription = `${minDays} dias`;
          } else {
            timeDescription = `${minDays}-${maxDays} dias`;
          }
          
          const expiryAlert = {
            id: 'critical-expiry-all',
            severity: 'critical' as const,
            title: `${totalLotes} lote${totalLotes > 1 ? 's' : ''} com vencimento próximo`,
            description: `${totalUnits} unidades (R$ ${totalValue.toFixed(2)}) - vencimento em ${timeDescription}`,
            href: '/reports?tab=expiry',
            count: totalLotes,
            icon: '🚨'
          };
          
          console.log('🚨 Adding CRITICAL Expiry Alert (All):', expiryAlert);
          alerts.push(expiryAlert);
        }
      } catch (error) {
        console.error('Error fetching expiry alerts:', error);
      }

      // 6. Total de valor em estoque (para mostrar no card)
      try {
        const { data: stockValueData, error: stockValueError } = await supabase
          .rpc('get_inventory_total_value');
        if (!stockValueError && stockValueData && typeof stockValueData.total_value === 'number') {
          // anexar no retorno final
          var inventoryTotalValue = Number(stockValueData.total_value);
        }
      } catch (error) {
        console.error('Error fetching inventory total value:', error);
      }

      // 🚨 ALERTAS MOCKADOS PARA TESTE DO CARROSSEL (TEMPORARIAMENTE DESABILITADOS)
      // Comentados para priorizar alertas reais de vencimento
      /*
      alerts.push(
        {
          id: 'mock-critical-1',
          severity: 'critical',
          title: 'Sistema de backup offline',
          description: 'Backup automático falhou nas últimas 24 horas',
          href: '/reports?tab=system&filter=backup',
          count: 1,
          icon: '🔴'
        },
        {
          id: 'mock-warning-1',
          severity: 'warning',
          title: 'R$ 2.617,90 em atraso +30 dias',
          description: '6 contas em atraso',
          href: '/reports?tab=financial&filter=overdue-30',
          count: 6,
          icon: '💰'
        },
        {
          id: 'mock-warning-2',
          severity: 'warning',
          title: '15 produtos abaixo do mínimo',
          description: 'Produtos com estoque crítico precisam reposição',
          href: '/inventory?filter=low-stock',
          count: 15,
          icon: '🟡'
        },
        {
          id: 'mock-critical-2',
          severity: 'critical',
          title: '3 produtos sem estoque',
          description: 'Produtos zerados impedem vendas',
          href: '/inventory?filter=zero-stock',
          count: 3,
          icon: '🔴'
        },
        {
          id: 'mock-info-1',
          severity: 'info',
          title: '28 clientes inativos',
          description: 'Clientes sem compra há mais de 60 dias',
          href: '/customers?filter=inactive-60d',
          count: 28,
          icon: '👥'
        },
        {
          id: 'mock-info-2',
          severity: 'info',
          title: 'Meta mensal 87% atingida',
          description: 'Faltam R$ 4.250,00 para atingir 100%',
          href: '/reports?tab=sales&period=30d',
          count: 1,
          icon: '📈'
        }
      );
      */

      // Sort alerts by severity priority
      const severityOrder = { critical: 0, warning: 1, info: 2 };
      alerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

      const criticalCount = alerts.filter(a => a.severity === 'critical').length;
      const warningCount = alerts.filter(a => a.severity === 'warning').length;
      const infoCount = alerts.filter(a => a.severity === 'info').length;

      const result = {
        alerts: alerts.slice(0, 10), // Limit to top 10 alerts
        criticalCount,
        warningCount,
        infoCount,
        inventoryTotalValue
      };

      console.log('🎯 Final Smart Alerts Result:', result);
      
      return result;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    refetchInterval: 5 * 60 * 1000, // Auto refresh every 5 minutes
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

// Individual alert hooks for specific use cases
export function useLowStockAlerts() {
  const { data } = useSmartAlerts();
  return data?.alerts.filter(alert => 
    alert.id === 'low-stock' || alert.id === 'zero-stock'
  ) || [];
}

export function useFinancialAlerts() {
  const { data } = useSmartAlerts();
  return data?.alerts.filter(alert => 
    alert.id === 'overdue-receivables' || alert.id === 'recent-overdue'
  ) || [];
}

export function useCustomerAlerts() {
  const { data } = useSmartAlerts();
  return data?.alerts.filter(alert => 
    alert.id === 'inactive-customers'
  ) || [];
}

export function useExpiryAlerts() {
  const { data } = useSmartAlerts();
  return data?.alerts.filter(alert => 
    alert.id === 'critical-expiry-all' || alert.id === 'critical-expiry' || alert.id === 'warning-expiry' || alert.id === 'info-expiry'
  ) || [];
}