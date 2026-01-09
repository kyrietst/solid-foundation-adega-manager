import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';

export interface PaymentMethod {
    id: string;
    code: string;
    name: string;
    slug: string;
    is_active: boolean;
    type?: string;
}

export const usePaymentMethods = () => {
    return useQuery<PaymentMethod[]>({
        queryKey: ['payment-methods'],
        queryFn: async () => {
            const { data, error } = await (supabase as any)
                .from('payment_methods')
                .select('*')
                .eq('is_active', true)
                .order('name');

            if (error) throw error;

            // Map 'type' from DB to 'slug' for frontend compatibility
            // CRITICAL: Distinguish 'Fiado' (code FI) from 'Outros' (code 99) even if both are type 'other'
            return (data || []).map((m: any) => {
                let derivedSlug = m.type || m.slug;
                
                // Override for Fiado to ensure distinct slug
                if (m.code === 'FI' || m.name.toLowerCase() === 'fiado') {
                    derivedSlug = 'fiado';
                }

                return {
                    ...m,
                    slug: derivedSlug
                };
            }) as PaymentMethod[];
        },
        staleTime: 1000 * 60 * 30, // 30 minutes
    });
};

// Mapeamento legado para compatibilidade se necessário
export const PAYMENT_METHODS_MAP = {
    'dinheiro': 'Dinheiro',
    'pix': 'PIX',
    'debito': 'Débito',
    'credito': 'Crédito',
    'fiado': 'Fiado'
};
