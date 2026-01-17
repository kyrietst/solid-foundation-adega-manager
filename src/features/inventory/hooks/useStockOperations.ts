import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';
import { useToast } from '@/shared/hooks/common/use-toast';
import type { Product } from '@/core/types/inventory.types';

// Constants
export const ADJUSTMENT_REASONS = {
    'inventory': { label: '📋 Inventário/Correção', emoji: '📋' },
    'loss': { label: '💔 Perda/Quebra', emoji: '💔' },
    'consumption': { label: '🍷 Consumo Próprio', emoji: '🍷' },
    'purchase': { label: '📦 Chegada de Mercadoria', emoji: '📦' }
} as const;

export type AdjustmentReason = keyof typeof ADJUSTMENT_REASONS;

// Types
export interface AdjustStockParams {
    productId: string;
    newPackages: number;
    newUnitsLoose: number;
    reason: AdjustmentReason;
    userId: string;
}

export interface TransferStockParams {
    productId: string;
    packages: number;
    unitsLoose: number;
    notes?: string;
    userId: string;
}

// 1. Fetch Product Stock Details Hook
export function useProductStockDetails(productId: string, isOpen: boolean) {
    return useQuery({
        queryKey: ['product-dual-stock', productId],
        queryFn: async (): Promise<Product | null> => {
            if (!productId) return null;
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('id', productId as any)
                .single();

            if (error) {
                if (error.code === 'PGRST116') return null;
                throw error;
            }
            return data as unknown as Product;
        },
        enabled: !!productId && isOpen,
        staleTime: 0,
        refetchOnWindowFocus: true,
        refetchOnMount: true,
        gcTime: 0,
    });
}

// 2. Stock Adjustment Mutation Hook
export function useStockAdjustment() {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ productId, newPackages, newUnitsLoose, reason, userId }: AdjustStockParams) => {
            const reasonText = ADJUSTMENT_REASONS[reason].label.replace(/^[^\s]+\s/, '');

            const { data: result, error } = await supabase
                .rpc('set_product_stock_absolute', {
                    p_product_id: productId,
                    p_new_packages: newPackages,
                    p_new_units_loose: newUnitsLoose,
                    p_reason: reasonText,
                    p_user_id: userId
                });

            if (error) throw error;
            const typedResult = result as unknown as { success?: boolean; error?: string };
            if (!typedResult?.success) throw new Error(typedResult?.error || 'Erro desconhecido');
            return typedResult;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['product', variables.productId] });
            queryClient.invalidateQueries({ queryKey: ['product-dual-stock', variables.productId] });
            queryClient.invalidateQueries({ queryKey: ['products', 'store'] });
            queryClient.invalidateQueries({ queryKey: ['inventory_movements'] });
            queryClient.invalidateQueries({ queryKey: ['kpis-inventory'] });
            queryClient.invalidateQueries({ queryKey: ['low-stock-products-infinite'] });

            toast({
                title: "✅ Estoque ajustado!",
                description: `Novo estoque: ${variables.newPackages} pacotes e ${variables.newUnitsLoose} unidades`,
            });
        },
        onError: (error) => {
            toast({
                title: "❌ Erro ao ajustar estoque",
                description: error.message,
                variant: "destructive",
            });
        }
    });
}

// 3. Stock Transfer Mutation Hook
export function useStockTransfer() {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ productId, packages, unitsLoose, notes, userId }: TransferStockParams) => {
            const { data: result, error } = await supabase.rpc('transfer_to_store2_holding', {
                p_product_id: productId,
                p_quantity_packages: packages,
                p_quantity_units: unitsLoose,
                p_user_id: userId,
                p_notes: notes || null,
            });

            if (error) throw error;
            return result;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['products', 'for-store-toggle'] });

            toast({
                title: '✅ Transferência realizada',
                description: `${variables.packages} pacote(s) e ${variables.unitsLoose} unidade(s) transferidos para Loja 2 (Depósito)`,
                variant: 'default',
            });
        },
        onError: (error: any) => {
            console.error('Transfer error:', error);
            
            let errorMessage = error.message || 'Erro ao transferir estoque.';
            
            if (errorMessage.includes('Estoque insuficiente')) {
                // Mantém a mensagem original do banco que detalha quantidades
            } else if (errorMessage.includes('Produto não encontrado')) {
                errorMessage = 'Produto não encontrado ou foi deletado.';
            }

            toast({ title: '❌ Erro na transferência', description: errorMessage, variant: 'destructive' });
        }
    });
}
