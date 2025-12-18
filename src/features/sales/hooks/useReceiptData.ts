/**
 * Hook para buscar dados completos de uma venda para impressão de cupom
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';
import { useAuth } from '@/app/providers/AuthContext';
import type { ReceiptData, ReceiptItem } from '../components/ReceiptPrint';

export const useReceiptData = (saleId: string | null) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['receipt-data', saleId],
    queryFn: async (): Promise<ReceiptData | null> => {
      if (!saleId) return null;


      // Buscar dados principais da venda
      const { data: saleData, error: saleError } = await supabase
        .from('sales')
        .select(`
          id,
          created_at,
          total_amount,
          final_amount,
          discount_amount,
          payment_method,
          delivery,
          delivery_fee,
          delivery_address,
          delivery_instructions,
          customers (
            name,
            phone,
            address
          ),
          profiles (
            name
          )
        `)
        .eq('id', saleId)
        .single();

      if (saleError) {
        console.error('❌ Erro ao buscar dados da venda:', saleError);
        throw saleError;
      }

      if (!saleData) {
        throw new Error('Venda não encontrada');
      }

      // Buscar itens da venda
      const { data: itemsData, error: itemsError } = await supabase
        .from('sale_items')
        .select(`
          quantity,
          unit_price,
          products (
            name,
            category
          )
        `)
        .eq('sale_id', saleId)
        .order('created_at');

      if (itemsError) {
        console.error('❌ Erro ao buscar itens da venda:', itemsError);
        throw itemsError;
      }

      // Transformar dados para o formato do cupom
      const items: ReceiptItem[] = (itemsData || []).map(item => ({
        quantity: item.quantity,
        product_name: item.products?.name || 'Produto',
        unit_price: Number(item.unit_price),
        total_item: item.quantity * Number(item.unit_price),
        category: item.products?.category
      }));

      // Buscar nome do usuário logado atual se não houver vendedor na venda
      let currentUserName = null;
      if (!saleData.profiles?.name && user) {
        const { data: currentUserProfile } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', user.id)
          .single();

        currentUserName = currentUserProfile?.name;
      }

      // Formatar endereço de delivery (prioridade: delivery_address da venda > address do cliente)
      let formattedAddress: string | undefined = undefined;

      if (saleData.delivery) {
        if (saleData.delivery_address) {
          // delivery_address é um JSON, pode ter estrutura variada
          const addr = saleData.delivery_address as any;

          if (typeof addr === 'string') {
            // Se já for string, usa direto
            formattedAddress = addr;
          } else if (typeof addr === 'object' && addr !== null) {
            // PRIORIDADE 1: Verificar se já existe endereço formatado
            if (addr.full_address) {
              formattedAddress = addr.full_address;
            } else if (addr.address && typeof addr.address === 'string') {
              formattedAddress = addr.address;
            } else {
              // PRIORIDADE 2: Construir string formatada manualmente
              const parts: string[] = [];

              if (addr.street) parts.push(addr.street);
              if (addr.number) parts.push(`Nº ${addr.number}`);
              if (addr.neighborhood) parts.push(addr.neighborhood);
              if (addr.complement) parts.push(`Compl: ${addr.complement}`);
              if (addr.reference) parts.push(`Ref: ${addr.reference}`);
              if (addr.city) parts.push(addr.city);
              if (addr.state) parts.push(addr.state);
              if (addr.zip || addr.zipCode || addr.cep) parts.push(addr.zip || addr.zipCode || addr.cep);

              formattedAddress = parts.length > 0 ? parts.join(', ') : undefined;
            }
          }
        }

        // Fallback: usar endereço cadastral do cliente
        if (!formattedAddress && saleData.customers?.address) {
          formattedAddress = saleData.customers.address;
        }
      }

      const receiptData: ReceiptData = {
        id: saleData.id,
        created_at: saleData.created_at,
        total_amount: Number(saleData.total_amount),
        final_amount: Number(saleData.final_amount),
        discount_amount: Number(saleData.discount_amount || 0),
        payment_method: saleData.payment_method,
        delivery: saleData.delivery || false,
        customer_name: saleData.customers?.name,
        customer_phone: saleData.customers?.phone,
        seller_name: saleData.profiles?.name || currentUserName,
        items,
        delivery_fee: saleData.delivery_fee ? Number(saleData.delivery_fee) : undefined,
        address: formattedAddress,
        deliveryInstructions: saleData.delivery_instructions || undefined
      };

      return receiptData;
    },
    enabled: !!saleId,
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 1
  });
};