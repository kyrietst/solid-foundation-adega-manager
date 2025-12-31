import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';
import { subDays } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { transformToStockData } from '@/shared/hooks/business/useStockData';

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
    units_sold_30d?: number;
    stuck_value?: number;
    days_without_sale?: number;
}

export interface InventoryHealthData {
    replenishment: InventoryHealthProduct[];
    deadStock: InventoryHealthProduct[];
    topMovers: InventoryHealthProduct[];
    totalStockValue: number;
    totalProducts: number;
}

export function useInventoryHealth(dateRange: DateRange | undefined) {
    return useQuery({
        queryKey: ['inventory-health', dateRange],
        queryFn: async (): Promise<InventoryHealthData> => {
            const startDate = dateRange?.from ? dateRange.from.toISOString() : subDays(new Date(), 30).toISOString();
            const endDate = dateRange?.to ? dateRange.to.toISOString() : new Date().toISOString();

            const { data, error } = await supabase
                .rpc('get_inventory_health_metrics' as any, {
                    start_date: startDate,
                    end_date: endDate,
                    min_stock_default: 5
                });

            if (error) throw error;

            return data as InventoryHealthData;
        },
        enabled: true,
        staleTime: 5 * 60 * 1000 // 5 minutes
    });
}
