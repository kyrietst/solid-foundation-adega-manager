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

      console.log(`🧾 Buscando dados da venda ${saleId} para cupom...`);

      // Buscar dados principais da venda
      const { data: saleData, error: saleError } = await supabase
        .from('sales')
        .select(`
          id,
          created_at,
          final_amount,
          discount_amount,
          payment_method,
          delivery,
          delivery_fee,
          customers (
            name,
            phone
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

      const receiptData: ReceiptData = {
        id: saleData.id,
        created_at: saleData.created_at,
        final_amount: Number(saleData.final_amount),
        discount_amount: Number(saleData.discount_amount || 0),
        payment_method: saleData.payment_method,
        delivery: saleData.delivery || false,
        customer_name: saleData.customers?.name,
        customer_phone: saleData.customers?.phone,
        seller_name: saleData.profiles?.name || currentUserName,
        items,
        delivery_fee: saleData.delivery_fee ? Number(saleData.delivery_fee) : undefined
      };

      console.log(`✅ Dados do cupom preparados: ${items.length} itens, total ${receiptData.final_amount}`);
      return receiptData;
    },
    enabled: !!saleId,
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 1
  });
};