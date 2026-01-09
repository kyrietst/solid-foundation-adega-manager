import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/core/api/supabase/client';

export function useCategories() {
    const [categories, setCategories] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchCategories = useCallback(async () => {
        setLoading(true);
        try {
            const { data: categoriesData, error: catErr } = await supabase
                .from('categories')
                .select('name')
                .filter('is_active', 'eq', true)
                .order('name');
                
            if (!catErr && categoriesData) {
                setCategories((categoriesData as { name: string }[]).map((c) => c.name));
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    return {
        categories,
        loading,
        refreshCategories: fetchCategories
    };
}
