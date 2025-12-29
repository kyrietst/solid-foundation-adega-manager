
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
            const allowedRoles: AllowedRole[] = ['admin', 'employee'];

            // Check user profile permissions
            const { data: profileVal, error: profileError } = await (supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id))
                .maybeSingle();

            const profileData = profileVal as { role: string };

            if (profileError) throw profileError;

            // Strict check: profileData must exist and have a role
            if (!profileData || !profileData.role || !allowedRoles.includes(profileData.role as AllowedRole)) {
                throw new Error('Permissão negada ou perfil não encontrado.');
            }

            // Fetch payment method details
            const { data: paymentMethodDataVal } = await (supabase
                .from('payment_methods')
                .select('name')
                .eq('id', saleData.payment_method_id))
                .maybeSingle();

            const paymentMethodData = paymentMethodDataVal as { name: string };

            const totalAmount = saleData.total_amount || 0;
            const discountAmount = saleData.discount_amount || 0;
            let saleResult: Database['public']['Tables']['sales']['Row'];

            // Construct strictly typed payload
            // Convert to unknown then Json to satisfy strictly typed Json unions if the object shape is complex
            const deliveryAddr: Json | null = saleData.delivery_address
                ? (saleData.delivery_address as unknown as Json)
                : (saleData.deliveryData?.address ? (saleData.deliveryData.address as unknown as Json) : null);

            const isDelivery = saleData.saleType === 'delivery' || !!saleData.deliveryData;

            // We define the partial payload first to ensure shared properties match
            // We use a temporary object that matches key parts of Insert/Update
            const baseSalePayloadPart = {
                customer_id: saleData.customer_id,
                total_amount: totalAmount,
                discount_amount: discountAmount,
                final_amount: totalAmount - discountAmount,
                payment_method: paymentMethodData?.name || 'Outro', // Using data directly
                payment_status: 'paid', // Default to paid for POS
                status: 'completed',
                updated_at: new Date().toISOString(),
                delivery: isDelivery,
                delivery_type: isDelivery ? 'delivery' : 'presencial',
                delivery_status: isDelivery ? 'pending' : null, // Set initial delivery status
                delivery_fee: saleData.delivery_fee || saleData.deliveryData?.deliveryFee || 0,
                delivery_address: deliveryAddr,
                delivery_person_id: saleData.delivery_person_id || null,
                notes: saleData.notes || null,
                user_id: user.id
            };

            if (saleId) {
                // Update existing sale
                const updatePayload: TablesUpdate<'sales'> = {
                    ...baseSalePayloadPart
                };

                const { data: updatedSale, error: updateError } = await supabase
                    .from('sales')
                    .update(updatePayload)
                    .eq('id', saleId)
                    .select()
                    .single();

                if (updateError) throw updateError;
                if (!updatedSale) throw new Error('Venda não encontrada após atualização.');
                saleResult = updatedSale;

                // Audit Log
                const auditPayload: TablesInsert<'audit_logs'> = {
                    user_id: user.id,
                    action: 'update_sale',
                    table_name: 'sales',
                    record_id: saleId,
                    old_data: null,
                    // Cast to unknown first to safely assign to Json compatible type
                    new_data: { ...updatePayload, item_count: saleData.items.length } as unknown as Json,
                    ip_address: '0.0.0.0'
                };

                await supabase.from('audit_logs').insert(auditPayload);

            } else {
                // Create new sale
                const insertPayload: TablesInsert<'sales'> = {
                    ...baseSalePayloadPart,
                    status: 'completed'
                };

                const { data: newSale, error: insertError } = await supabase
                    .from('sales')
                    .insert(insertPayload)
                    .select()
                    .single();

                if (insertError) throw insertError;
                if (!newSale) throw new Error('Falha ao criar venda.');
                saleResult = newSale;

                // Insert Items
                if (saleData.items.length > 0) {
                    const itemsPayload: TablesInsert<'sale_items'>[] = saleData.items.map(item => ({
                        sale_id: newSale.id,
                        product_id: item.product_id,
                        quantity: item.quantity,
                        unit_price: item.unit_price,
                        units_sold: item.units_sold,
                        sale_type: item.sale_type || null,
                        package_units: item.package_units || null,
                        conversion_required: false
                    }));

                    const { error: itemsError } = await supabase.from('sale_items').insert(itemsPayload);
                    if (itemsError) throw itemsError;
                }

                // Insert Delivery Tracking
                if (saleData.deliveryData) {
                    const deliveryPayload: TablesInsert<'delivery_tracking'> = {
                        sale_id: newSale.id,
                        status: 'pending',
                        notes: saleData.deliveryData.instructions || '',
                        created_by: user.id,
                        location_lat: null, // ensuring fields exist
                        location_lng: null
                    };
                    await supabase.from('delivery_tracking').insert(deliveryPayload);
                }
            }

            return saleResult;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sales'] });
            queryClient.invalidateQueries({ queryKey: ['products'] });
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

            const { data: profileVal } = await (supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id))
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
