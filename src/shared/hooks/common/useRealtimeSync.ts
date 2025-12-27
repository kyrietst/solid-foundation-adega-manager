import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';
import { useToast } from './use-toast';

/**
 * Hook Sentinela para Sincronização Híbrida em Tempo Real
 * 
 * Estratégia "Smart Sync":
 * 1. Cache agressivo (5min) para evitar excesso de requisições de leitura.
 * 2. Listener global do Realtime para invalidar cache APENAS quando houver mudanças reais.
 * 3. Debounce para evitar "event storms" (múltiplas invalidações seguidas).
 */
export const useRealtimeSync = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Debounce function to prevent excessive cache invalidations
    const debouncedInvalidate = (keys: string[][], delay: number = 2000) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            console.log('🔄 [Realtime] Invalidando queries devido a eventos do Supabase:', keys);

            // Invalidate all provided keys
            keys.forEach(key => {
                queryClient.invalidateQueries({ queryKey: key });
            });

            timeoutRef.current = null;
        }, delay);
    };

    useEffect(() => {
        // Only run if supabase is available and configured
        if (!supabase) return;

        console.log('📡 [Realtime] Iniciando monitoramento global de mudanças...');

        // Subscribe to changes in critical tables
        const channel = supabase
            .channel('global-db-changes')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'sales' },
                (payload) => {
                    console.log('🛒 [Realtime] Mudança em Vendas detectada:', payload.eventType);
                    debouncedInvalidate([
                        ['sales'],
                        ['dashboard'],
                        ['recent-sales']
                    ]);
                }
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'products' },
                (payload) => {
                    console.log('📦 [Realtime] Mudança em Produtos detectada:', payload.eventType);
                    debouncedInvalidate([
                        ['products'],
                        ['low-stock-products'],
                        ['inventory_movements']
                    ]);
                }
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'customers' },
                (payload) => {
                    console.log('👥 [Realtime] Mudança em Clientes detectada:', payload.eventType);
                    debouncedInvalidate([
                        ['customers'],
                        ['customer-stats']
                    ]);
                }
            )
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    console.log('✅ [Realtime] Sincronização ativa para: sales, products, customers');
                }
            });

        return () => {
            console.log('🔌 [Realtime] Desconectando monitoramento...');
            supabase.removeChannel(channel);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [queryClient]);
};
