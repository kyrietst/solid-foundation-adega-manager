import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';
import { subDays } from 'date-fns';
import { DateRange } from 'react-day-picker';

export interface InventoryHealthProduct {
    id: string;
    name: string;
    stock_packages: number;
    stock_units_loose: number;
    units_per_package: number;
    minimum_stock: number;
    cost_price: number;
    image_url?: string;
    total_units: number;
    status: 'ok' | 'low' | 'critical';
}

export interface DeadStockProduct extends InventoryHealthProduct {
    days_without_sale: number; // Aproximado (30+)
    stuck_value: number;
}

export interface TopMoverProduct extends InventoryHealthProduct {
    units_sold_30d: number;
}

export function useInventoryHealth(dateRange: DateRange | undefined) {
    return useQuery({
        queryKey: ['inventory-health', dateRange],
        queryFn: async () => {
            const startDate = dateRange?.from ? dateRange.from.toISOString() : subDays(new Date(), 30).toISOString();
            const endDate = dateRange?.to ? dateRange.to.toISOString() : new Date().toISOString();

            // 1. Buscar todos os produtos (ativos)
            const { data: productsData, error: productsError } = await supabase
                .from('products')
                .select(`
                    id, name, stock_packages, stock_units_loose, 
                    units_per_package, minimum_stock, cost_price, image_url
                `)
                .is('deleted_at', null); // Soft delete check

            if (productsError) throw productsError;

            // 2. Buscar vendas do período para cálculo de giro e dead stock
            const { data: salesData, error: salesError } = await supabase
                .from('sale_items')
                .select('product_id, quantity, created_at, sales!inner(created_at)')
                .gte('sales.created_at', startDate)
                .lte('sales.created_at', endDate);

            if (salesError) throw salesError;

            // 3. Buscar Valor Total do Estoque (RPC para precisão)
            const { data: totalValuationData, error: valuationError } = await supabase
                .rpc('get_total_inventory_valuation');

            if (valuationError) console.error('Erro ao buscar valuation:', valuationError);
            const totalStockValue = Number(totalValuationData) || 0;

            // --- Processamento ---
            // ... (rest of the logic remains similar, using the filtered salesData)

            // Mapa de Vendas por Produto
            const salesMap = new Map<string, number>();
            ((salesData as any[]) || []).forEach(item => {
                const current = salesMap.get(item.product_id) || 0;
                salesMap.set(item.product_id, current + Number(item.quantity));
            });

            // Processar Produtos
            const processedProducts = (productsData || []).map((p: any) => {
                const unitsPerPackage = p.units_per_package || 1;
                const totalUnits = (p.stock_packages * unitsPerPackage) + p.stock_units_loose;
                const minStock = p.minimum_stock || 5; // Default seguro

                let status: 'ok' | 'low' | 'critical' = 'ok';
                if (totalUnits === 0) status = 'critical';
                else if (totalUnits <= minStock) status = 'low';

                return {
                    ...p,
                    units_per_package: unitsPerPackage,
                    minimum_stock: minStock,
                    cost_price: Number(p.cost_price || 0),
                    total_units: totalUnits,
                    status
                } as InventoryHealthProduct;
            });

            // 1. Low Stock (Reposição)
            // Ordenar por giro (mais vendidos primeiro) para priorizar reposição
            const replenishment = processedProducts
                .filter(p => p.status === 'low' || p.status === 'critical')
                .map(p => ({
                    ...p,
                    units_sold_30d: salesMap.get(p.id) || 0
                }))
                .sort((a, b) => b.units_sold_30d - a.units_sold_30d);

            // 2. Dead Stock (Encalhados)
            // Estoque > 0 E Vendas no período = 0
            const deadStock = processedProducts
                .filter(p => p.total_units > 0 && !salesMap.has(p.id))
                .map(p => ({
                    ...p,
                    days_without_sale: 30, // Placeholder, logicamente "sem vendas no período"
                    stuck_value: p.total_units * p.cost_price // Custo unitário confirmado pelo QA
                }))
                .sort((a, b) => b.stuck_value - a.stuck_value); // Ordenar por valor parado (R$) decrescente

            // 3. Top Movers (Giro Rápido)
            const topMovers = processedProducts
                .filter(p => salesMap.has(p.id))
                .map(p => ({
                    ...p,
                    units_sold_30d: salesMap.get(p.id) || 0
                }))
                .sort((a, b) => b.units_sold_30d - a.units_sold_30d)
                .slice(0, 5);

            return {
                replenishment,
                deadStock,
                topMovers,
                totalProducts: processedProducts.length,
                totalStockValue // Usar valor da RPC
            };
        },
        enabled: !!dateRange?.from,
        staleTime: 5 * 60 * 1000 // 5 minutos
    });
}
