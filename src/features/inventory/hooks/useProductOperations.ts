import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';
import { TablesInsert } from '@/core/types/supabase';
import { ProductFormValues } from '@/features/inventory/hooks/useProductFormLogic';
import { getSaoPauloTimestamp } from '@/shared/hooks/common/use-brasil-timezone';

export function useProductOperations(onSuccess?: () => void) {
    const queryClient = useQueryClient();

    const createProductMutation = useMutation({
        mutationFn: async (data: ProductFormValues) => {
            const productData: TablesInsert<'products'> = {
                name: data.name,
                category: data.category,
                barcode: data.barcode || null,
                package_barcode: data.package_barcode || null,
                units_per_package: data.package_units || 1,
                has_package_tracking: data.has_package_tracking || false,
                has_unit_tracking: true, // FORCE UNIT TRACKING
                price: data.price,
                package_price: (data.package_price || 0) > 0 ? data.package_price : null,
                cost_price: (data.cost_price || 0) > 0 ? data.cost_price : null,
                supplier: data.supplier === 'none' || !data.supplier ? null : data.supplier,
                volume_ml: (data.volume_ml || 0) > 0 ? data.volume_ml : null,
                stock_packages: 0,
                stock_units_loose: 0,
                stock_quantity: 0,
                turnover_rate: 'medium',
                // Fiscal data
                ncm: data.ncm || null,
                cest: data.cest || null,
                cfop: data.cfop || null,
                origin: data.origin ? String(data.origin) : null,
                created_at: getSaoPauloTimestamp(),
            };

            // Use as any to bypass complex overload mismatch while keeping loose typing on the variable itself
            const { data: result, error } = await supabase.from('products').insert(productData as any).select().single();
            if (error) throw error;
            return result;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            onSuccess?.();
        },
    });

    return {
        createProduct: createProductMutation.mutateAsync,
        isCreating: createProductMutation.isPending,
        error: createProductMutation.error
    };
}
