import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';

/**
 * Hook Sentinela - Production Version
 * Gerencia a sincronia em tempo real do banco de dados com o cache do React Query.
 */
export const useRealtimeSync = () => {
    const queryClient = useQueryClient();
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Debounce para Vendas (atualização visual suave)
    const debouncedInvalidateSales = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            queryClient.invalidateQueries({
                queryKey: ['sales'],
                refetchType: 'all'
            });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
            queryClient.invalidateQueries({ queryKey: ['recent-sales'] });
        }, 1000);
    };

    useEffect(() => {
        if (!supabase) return;

        const channel = supabase
            .channel('global-db-changes')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'sales' },
                () => {
                    debouncedInvalidateSales();
                }
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'products' },
                () => {
                    // Estratégia Agressiva para Estoque: Reset garante dados frescos imediatamente
                    // Cobre lista principal, buscas filtradas e SSoT
                    queryClient.resetQueries({
                        queryKey: ['products'],
                        exact: false
                    });

                    queryClient.resetQueries({
                        queryKey: ['product-ssot'],
                        exact: false
                    });
                }
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'customers' },
                () => {
                    queryClient.invalidateQueries({ queryKey: ['customers'] });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [queryClient]);
};
