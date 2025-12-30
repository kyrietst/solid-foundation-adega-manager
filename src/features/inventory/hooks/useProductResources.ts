import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/core/api/supabase/client';

export function useProductResources(isOpen: boolean) {
    const [categories, setCategories] = useState<string[]>([]);
    const [suppliers, setSuppliers] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchCategoriesAndSuppliers = useCallback(async () => {
        setLoading(true);
        try {
            const { data: categoriesData, error: catErr } = await supabase.from('categories').select('name').filter('is_active', 'eq', true).order('name');
            if (!catErr && categoriesData) {
                setCategories((categoriesData as { name: string }[]).map((c) => c.name));
            }
            const { data: suppliersData } = await supabase.from('products').select('supplier').not('supplier', 'is', null).filter('supplier', 'neq', '');
            if (suppliersData) {
                const suppliersList = (suppliersData as { supplier: string }[]).map((s) => s.supplier);
                setSuppliers([...new Set(suppliersList)].sort());
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isOpen) {
            fetchCategoriesAndSuppliers();
        }
    }, [isOpen, fetchCategoriesAndSuppliers]);

    return {
        categories,
        suppliers,
        refreshResources: fetchCategoriesAndSuppliers,
        loading
    };
}
