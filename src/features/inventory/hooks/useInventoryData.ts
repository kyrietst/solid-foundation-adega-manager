import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';
import { Product } from '@/core/types/inventory.types';

export function useInventoryData(isEnabled: boolean) {
    return useQuery({
        queryKey: ['products', 'for-store-toggle'],
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
        queryFn: async (): Promise<Product[]> => {
            const { data, error } = await supabase
                .from('products')
                .select('id, name, price, stock_quantity, cost_price, image_url, barcode, unit_barcode, package_barcode, category, package_units, package_price, has_package_tracking, units_per_package, stock_packages, stock_units_loose, store2_holding_packages, store2_holding_units_loose, minimum_stock, expiry_date, has_expiry_tracking, ncm, cest, cfop, origin, packaging_type, has_unit_tracking, description, volume_ml, supplier')
                .is('deleted_at', null)
                .order('name', { ascending: true });

            if (error) throw error;
            return (data || []) as unknown as Product[];
        },
        enabled: isEnabled,
    });
}
