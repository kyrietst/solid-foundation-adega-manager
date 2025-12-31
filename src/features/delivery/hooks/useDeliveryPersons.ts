import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';
import { useToast } from '@/shared/hooks/common/use-toast';

export interface DeliveryPerson {
    id: string;
    name: string;
}

export interface AvailableDeliveryPerson {
    delivery_person_id: string;
    delivery_person_name: string;
    delivery_person_email: string;
    active_deliveries: number;
    completed_today: number;
    avg_delivery_time_minutes: number;
    is_available: boolean;
}

export function useDeliveryPersons(isEnabled: boolean) {
    return useQuery({
        queryKey: ['profiles', 'entregador'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('profiles')
                .select('id, name')
                .eq('role', 'delivery' as any)
                .order('name');

            if (error) throw error;
            return data as DeliveryPerson[];
        },
        enabled: isEnabled,
        staleTime: 10 * 60 * 1000, // 10 minutes
    });
}

export function useAvailableDeliveryPersons(isOpen: boolean) {
    return useQuery({
        queryKey: ['available-delivery-persons'],
        queryFn: async (): Promise<AvailableDeliveryPerson[]> => {
            const { data, error } = await supabase.rpc('get_available_delivery_persons');

            if (error) {
                console.error('❌ Erro ao buscar entregadores:', error);
                throw error;
            }

            return (data as unknown as AvailableDeliveryPerson[]) || [];
        },
        enabled: isOpen,
        staleTime: 30 * 1000,
    });
}

export function useAssignDeliveryPerson() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: async ({ saleId, deliveryPersonId, autoAssign }: { saleId: string; deliveryPersonId?: string; autoAssign?: boolean }) => {
            const { data, error } = await supabase.rpc('assign_delivery_person', {
                p_sale_id: saleId,
                p_delivery_person_id: deliveryPersonId || null,
                p_auto_assign: autoAssign || false
            });

            if (error) {
                console.error('❌ Erro ao atribuir entregador:', error);
                throw error;
            }

            return data as any;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['delivery-orders'] });
            queryClient.invalidateQueries({ queryKey: ['available-delivery-persons'] });

            toast({
                title: "Entregador atribuído!",
                description: `${data?.delivery_person_name || 'Entregador'} foi atribuído para esta entrega.`,
            });
        },
        onError: (error: any) => {
            console.error('❌ Erro na atribuição:', error);
            toast({
                title: "Erro ao atribuir entregador",
                description: error.message || "Ocorreu um erro inesperado.",
                variant: "destructive",
            });
        },
    });
}
