import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/core/api/supabase/client";
import { convertToSaoPaulo } from "@/shared/utils/timezone-saopaulo";
import { Sale } from "@/features/sales/types";

export const useSales = (params?: {
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    status?: string;
}) => {
    return useQuery({
        queryKey: ["sales", params],
        // ✅ Smart Sync Optimization: High concurrency settings
        staleTime: 5 * 60 * 1000, // 5 minutes cache to prevent request flooding
        refetchOnWindowFocus: false, // Don't refetch on window focus (relies on Realtime)
        queryFn: async () => {
            // Query otimizada com join direto para buscar vendas e itens
            let baseQuery = supabase
                .from('sales')
                .select(`
          *,
          sale_items (
            id,
            product_id,
            quantity,
            unit_price,
            products (
              id,
              name,
              barcode
            )
          ),
          customers (
            id,
            name,
            email,
            phone
          ),
          invoice_logs (
            status,
            external_id,
            pdf_url,
            xml_url
          )
        `)
                .order('created_at', { ascending: false });

            if (params?.startDate) {
                // Converter startDate para horário de São Paulo antes de comparar
                const spDate = convertToSaoPaulo(params.startDate);
                baseQuery = baseQuery.gte("created_at", spDate.toISOString());
            }

            if (params?.endDate) {
                // Converter endDate para horário de São Paulo antes de comparar
                const spDate = convertToSaoPaulo(params.endDate);
                const nextDay = new Date(spDate);
                nextDay.setDate(nextDay.getDate() + 1);
                baseQuery = baseQuery.lt("created_at", nextDay.toISOString());
            }

            if (params?.status) {
                // Cast to match sales table status column type
                baseQuery = baseQuery.eq("status", params.status as any);
            }

            if (params?.limit) {
                baseQuery = baseQuery.limit(params.limit);
            }

            const { data: salesWithItems, error: salesError } = await baseQuery;

            if (salesError) {
                throw new Error(salesError.message);
            }

            if (!salesWithItems || salesWithItems.length === 0) {
                return [];
            }

            // Buscar informações dos vendedores separadamente
            const userIds = [...new Set(salesWithItems.map((sale: any) => sale.user_id || sale.seller_id).filter(Boolean))];
            let sellers: { id: string; name: string | null; email: string | null }[] = [];

            if (userIds.length > 0) {
                const { data: sellersData } = await supabase
                    .from('profiles')
                    .select('id, name, email')
                    .in('id', userIds);
                sellers = sellersData as any || [];
            }

            // Mapeia os dados para o formato esperado
            const mappedData = salesWithItems.map((sale: any) => {
                // Mapeias os itens da venda
                const items = (sale.sale_items || []).map((item: any) => ({
                    id: item.id,
                    sale_id: sale.id,
                    product_id: item.product_id,
                    quantity: item.quantity,
                    unit_price: item.unit_price,
                    subtotal: item.quantity * item.unit_price,
                    product: {
                        name: item.products?.name || 'Produto não encontrado',
                        barcode: item.products?.barcode || null
                    }
                }));

                // Buscar seller pelos dados carregados
                const sellerId = sale.seller_id || sale.user_id;
                const seller = sellers.find(s => s.id === sellerId);
                
                // Mapeia o invoice (pega o ultimo/mais recente se houver array)
                const lastInvoice = sale.invoice_logs && sale.invoice_logs.length > 0 
                  ? sale.invoice_logs[0] // Assumindo que o banco retorna ordem padrao ou podemos ordenar
                  : null;

                return {
                    ...sale,
                    customer: sale.customers ? {
                        id: sale.customers.id,
                        name: sale.customers.name || sale.customers.email?.split('@')[0] || 'Cliente',
                        email: sale.customers.email,
                        phone: sale.customers.phone
                    } : null,
                    seller: seller ? {
                        id: seller.id,
                        name: seller.name || seller.email?.split('@')[0] || 'Usuário',
                        email: seller.email || undefined
                    } : null,
                    // Remove as relações do objeto para evitar conflitos
                    sale_items: undefined,
                    customers: undefined,
                    invoice_logs: undefined,
                    // Adiciona dados mapeados
                    invoice: lastInvoice, 
                    // Garante que os campos obrigatórios existam
                    discount_amount: sale.discount_amount || 0,
                    final_amount: sale.final_amount || sale.total_amount,
                    payment_status: sale.payment_status || 'pending',
                    status: sale.status || 'completed',
                    notes: sale.notes || null,
                    delivery: sale.delivery || false,
                    delivery_address: sale.delivery_address || null,
                    items: items
                } as Sale;
            });

            return mappedData;
        },
    });
};
