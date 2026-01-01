
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';
import { useToast } from '@/shared/hooks/common/use-toast';
import { Database, TablesInsert, TablesUpdate, Json } from '@/core/types/supabase';
import { UpsertSaleInput, AllowedRole } from '../types';

export const useUpsertSale = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: async ({ saleId, saleData, user }: { saleId?: string; saleData: UpsertSaleInput; user: { id: string } }) => {
            // Check user profile permissions
            const { data: profileVal, error: profileError } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .maybeSingle();

            if (profileError) throw profileError;

            const allowedRoles: AllowedRole[] = ['admin', 'employee'];
            const profileData = profileVal as { role: string };

            if (!profileData || !profileData.role || !allowedRoles.includes(profileData.role as AllowedRole)) {
                throw new Error('Permissão negada ou perfil não encontrado.');
            }

            // Fetch payment method details
            const { data: paymentMethodDataVal } = await supabase
                .from('payment_methods')
                .select('name')
                .eq('id', saleData.payment_method_id)
                .maybeSingle();

            const paymentMethodData = paymentMethodDataVal as { name: string };
            const paymentName = paymentMethodData?.name || 'Outro';

            const totalAmount = saleData.total_amount || 0;
            const discountAmount = saleData.discount_amount || 0;
            const finalAmount = totalAmount - discountAmount;
            const isDelivery = saleData.saleType === 'delivery' || !!saleData.deliveryData;
            
            // Prepare Common Data
            const deliveryAddress = saleData.delivery_address || saleData.deliveryData?.address || null;
            const deliveryFee = saleData.delivery_fee || saleData.deliveryData?.deliveryFee || 0;
            const deliveryInstructions = saleData.notes || saleData.deliveryData?.instructions || null;

            if (saleId) {
                // UPDATE SCENARIO (Manteve-se o update manual pois RPC é só para Create por enquanto)
                const baseSalePayloadPart = {
                    customer_id: saleData.customer_id,
                    total_amount: totalAmount,
                    discount_amount: discountAmount,
                    final_amount: finalAmount,
                    payment_method: paymentName,
                    payment_status: 'paid',
                    status: 'completed',
                    updated_at: new Date().toISOString(),
                    delivery: isDelivery,
                    delivery_type: isDelivery ? 'delivery' : 'presencial',
                    delivery_status: isDelivery ? 'pending' : null,
                    delivery_fee: deliveryFee,
                    delivery_address: deliveryAddress,
                    delivery_person_id: saleData.delivery_person_id || null,
                    notes: saleData.notes || null,
                    user_id: user.id
                };

                const updatePayload: any = { ...baseSalePayloadPart };

                const { data: updatedSaleVal, error: updateError } = await supabase
                    .from('sales')
                    .update(updatePayload)
                    .eq('id', saleId)
                    .select()
                    .single();

                if (updateError) throw updateError;
                if (!updatedSaleVal) throw new Error('Venda não encontrada após atualização.');

                // Log Audit
                await supabase.from('audit_logs').insert({
                    user_id: user.id,
                    action: 'update_sale',
                    table_name: 'sales',
                    record_id: saleId,
                    new_data: updatePayload as unknown as Json,
                    ip_address: '0.0.0.0'
                });

                return updatedSaleVal as unknown as Database['public']['Tables']['sales']['Row'];

            } else {
                // CREATE SCENARIO -> USE RPC 'process_sale'
                // This ensures stock is decremented correctly (Zero Trust / Integrity Rule)
                
                const rpcPayload = {
                    p_customer_id: saleData.customer_id || null,
                    p_user_id: user.id,
                    p_items: saleData.items.map(item => ({
                        product_id: item.product_id,
                        quantity: item.quantity,
                        unit_price: item.unit_price,
                        sale_type: item.sale_type, // 'package' or 'unit'
                        units_sold: item.units_sold,
                        package_units: item.package_units
                    })),
                    p_total_amount: totalAmount,
                    p_final_amount: finalAmount,
                    p_payment_method_id: saleData.payment_method_id,
                    p_discount_amount: discountAmount,
                    p_notes: saleData.notes || '',
                    p_is_delivery: isDelivery,
                    p_delivery_fee: deliveryFee,
                    p_delivery_address: typeof deliveryAddress === 'object' && deliveryAddress !== null 
                        ? JSON.stringify(deliveryAddress) 
                        : (deliveryAddress as string || null),
                    p_delivery_person_id: saleData.delivery_person_id || null,
                    p_delivery_instructions: deliveryInstructions
                };

                const { data: rpcData, error: rpcError } = await supabase.rpc('process_sale', rpcPayload);

                if (rpcError) throw rpcError;
                
                // RPC returns jsonb { sale_id: ... }
                // We need to return the full Row object to satisfy type requirements or compatibility
                const newSaleId = (rpcData as any)?.sale_id;
                
                if (!newSaleId) throw new Error('RPC executou mas não retornou ID da venda.');

                // Fetch the created sale to return consistent data
                const { data: newSaleRow, error: fetchError } = await supabase
                    .from('sales')
                    .select('*')
                    .eq('id', newSaleId)
                    .single();

                if (fetchError || !newSaleRow) throw new Error('Erro ao recuperar venda criada.');

                return newSaleRow as unknown as Database['public']['Tables']['sales']['Row'];
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sales'] });
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['financial-metrics'] });
            toast({
                title: 'Venda salva',
                description: 'A venda foi processada com sucesso.',
            });
        },
        onError: (error: Error) => {
            console.error('Erro ao processar venda:', error);
            toast({
                title: 'Erro na venda',
                description: error.message || 'Falha ao processar venda.',
                variant: 'destructive',
                duration: 5000
            });
        }
    });
};

export const useDeleteSale = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: async ({ saleId, user }: { saleId: string; user: { id: string } }) => {
            const allowedRoles: AllowedRole[] = ['admin'];

            const { data: profileVal } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .maybeSingle();

            const profileData = profileVal as { role: string };

            if (!profileData || !profileData.role || !allowedRoles.includes(profileData.role as AllowedRole)) {
                throw new Error('Apenas administradores podem cancelar vendas.');
            }

            const { error } = await supabase.rpc('delete_sale_with_items', { p_sale_id: saleId });

            if (error) throw error;
            return true;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sales'] });
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['financial-metrics'] });
            toast({
                title: 'Venda cancelada',
                description: 'A venda foi removida e o estoque restaurado.',
            });
        },
        onError: (error: Error) => {
            toast({
                title: 'Erro ao cancelar',
                description: error.message,
                variant: 'destructive',
            });
        }
    });
};
