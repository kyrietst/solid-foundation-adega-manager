import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';

export interface PaymentMethod {
    id: string;
    code: string;
    name: string;
    slug: string;
    is_active: boolean;
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
            return data as unknown as PaymentMethod[];
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
