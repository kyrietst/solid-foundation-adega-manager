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
          .select('id, name, last_purchase')
          .or(`last_purchase.lt.${sixtyDaysAgo.toISOString()},last_purchase.is.null`)
          .eq('is_active', true)
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
            id, name, price, stock,
            sale_items!left(quantity, sales!inner(created_at))
          `)
          .gt('price', 50) // High value products
          .gt('stock', 0) // With stock
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

      // 5. Total de valor em estoque (para mostrar no card)
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

      // Sort alerts by severity priority
      const severityOrder = { critical: 0, warning: 1, info: 2 };
      alerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

      const criticalCount = alerts.filter(a => a.severity === 'critical').length;
      const warningCount = alerts.filter(a => a.severity === 'warning').length;
      const infoCount = alerts.filter(a => a.severity === 'info').length;

      return {
        alerts: alerts.slice(0, 10), // Limit to top 10 alerts
        criticalCount,
        warningCount,
        infoCount,
        inventoryTotalValue
      };
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