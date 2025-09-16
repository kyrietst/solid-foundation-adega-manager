import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { recordCustomerEvent } from "@/features/customers/hooks/use-crm";
import { supabase } from "@/core/api/supabase/client";
import { useToast } from "@/shared/hooks/common/use-toast";
import { DeliveryAddress } from "@/core/types/sales.types";
import type { SaleType } from "@/features/sales/components/SalesPage";
import type { DeliveryData } from "@/features/sales/components/DeliveryOptionsModal";

// Interfaces para dados de query
interface RawSaleItem {
  id: string;
  sale_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
}

interface RawProduct {
  id: string;
  name: string;
}

// Tipos para roles
type AllowedRole = 'admin' | 'employee';

// Tipos
type Sale = {
  id: string;
  customer_id: string | null;
  user_id: string;
  seller_id: string | null;
  total_amount: number;
  discount_amount: number;
  final_amount: number;
  payment_method: string;
  payment_status: 'pending' | 'paid' | 'cancelled';
  status: 'pending' | 'completed' | 'cancelled' | 'delivering' | 'delivered' | 'returned';
  delivery: boolean | null;
  delivery_address: DeliveryAddress | null;
  delivery_user_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  customer?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
  } | null;
  seller?: {
    id: string;
    name: string;
    email?: string;
  } | null;
  items?: Array<{
    id: string;
    sale_id: string;
    product_id: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
    product?: {
      name: string;
      barcode?: string;
    };
  }>;
};

type SaleItemInput = {
  product_id: string;
  quantity: number;
  unit_price: number;
};

type UpsertSaleInput = {
  customer_id: string | null;
  payment_method_id: string;
  total_amount: number;
  discount_amount?: number;
  items: { 
    product_id: string; 
    variant_id: string; // Novo: ID da variante específica
    quantity: number; 
    unit_price: number;
    units_sold: number; // Novo: unidades efetivamente vendidas
    conversion_required: boolean; // Novo: se requer conversão automática
    packages_converted?: number; // Novo: quantos pacotes foram convertidos
    // Campos legados para compatibilidade (serão removidos futuramente)
    sale_type?: 'unit' | 'package';
    package_units?: number;
  }[];
  notes?: string;
  // Campos para delivery
  saleType: SaleType;
  deliveryData?: DeliveryData;
};

type PaymentMethod = {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
};

// Hooks
export const useSales = (params?: { 
  startDate?: Date; 
  endDate?: Date;
  limit?: number;
  status?: string;
}) => {
  return useQuery({
    queryKey: ["sales", params],
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
          )
        `)
        .order('created_at', { ascending: false });

      if (params?.startDate) {
        baseQuery = baseQuery.gte("created_at", params.startDate.toISOString());
      }
      
      if (params?.endDate) {
        const nextDay = new Date(params.endDate);
        nextDay.setDate(nextDay.getDate() + 1);
        baseQuery = baseQuery.lt("created_at", nextDay.toISOString());
      }
      
      if (params?.status) {
        baseQuery = baseQuery.eq("status", params.status);
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
        sellers = sellersData || [];
      }

      // Mapeia os dados para o formato esperado
      const mappedData = salesWithItems.map((sale: any) => {
        // Mapeia os itens da venda
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

export const useUpsertSale = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (saleData: UpsertSaleInput) => {
      console.log('🔥 INÍCIO: processando venda com sistema de variantes');
      console.log('📦 Dados da venda completos:', JSON.stringify(saleData, null, 2));
      console.log('🔑 Payment Method ID recebido:', saleData.payment_method_id);
      
      // 1. Verifica se o usuário está autenticado
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error("Usuário não autenticado");
      }

      // 2. Verifica se o usuário tem permissão para criar vendas
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profileError || !profile) {
        throw new Error("Perfil de usuário não encontrado");
      }

      // Verifica se o usuário tem uma função que permite criar vendas
      const allowedRoles: AllowedRole[] = ['admin', 'employee'];
      if (!allowedRoles.includes(profile.role as AllowedRole)) {
        throw new Error("Você não tem permissão para criar vendas. Apenas administradores e funcionários podem criar vendas.");
      }

      // 3. Obtém o método de pagamento
      const { data: paymentMethod, error: paymentError } = await supabase
        .from('payment_methods')
        .select('name')
        .eq('id', saleData.payment_method_id)
        .single();

      if (paymentError && !paymentMethod) {
        console.error('Método de pagamento não encontrado:', paymentError);
        // Continua com um valor padrão em vez de falhar
      }

      // 4. Prepara dados de delivery
      const isDeliveryOrder = saleData.saleType === 'delivery';
      const totalWithDeliveryFee = isDeliveryOrder && saleData.deliveryData 
        ? saleData.total_amount + saleData.deliveryData.deliveryFee
        : saleData.total_amount;

      // 5. Valida os itens da venda
      if (!saleData.items || saleData.items.length === 0) {
        throw new Error("A venda deve conter pelo menos um item");
      }

      // 6. Processa a venda usando o novo sistema de variantes
      let saleId: string;
      
      // Primeiro, cria a venda básica
      const salePayload = {
        customer_id: saleData.customer_id,
        user_id: user.id,
        total_amount: saleData.total_amount,
        discount_amount: saleData.discount_amount || 0,
        final_amount: totalWithDeliveryFee - (saleData.discount_amount || 0),
        payment_method: paymentMethod?.name || 'Não especificado',
        payment_status: 'paid',
        status: isDeliveryOrder ? 'pending' : 'completed',
        notes: saleData.notes || null,
        delivery: isDeliveryOrder
      };
      
      console.log('🔥 PAYLOAD sendo enviado para tabela sales:', JSON.stringify(salePayload, null, 2));
      
      const { data: createdSale, error: saleError } = await supabase
        .from('sales')
        .insert(salePayload)
        .select('id')
        .single();

      if (saleError) {
        console.error('Erro ao criar venda:', saleError);
        throw new Error(`Falha ao criar venda: ${saleError.message}`);
      }

      saleId = createdSale.id;

      // Processa cada item usando o sistema de variantes
      for (const item of saleData.items) {
        if (item.conversion_required) {
          // Usa stored procedure para conversão automática
          const { error: conversionError } = await supabase.rpc('process_sale_with_conversion', {
            p_product_id: item.product_id,
            p_variant_type: item.sale_type || 'unit',
            p_quantity: item.quantity,
            p_sale_id: saleId,
            p_user_id: user.id
          });

          if (conversionError) {
            console.error('Erro na conversão:', conversionError);
            throw new Error(`Erro na conversão do produto: ${conversionError.message}`);
          }
        }

        // Insere o item da venda com informações de variante
        const { error: itemError } = await supabase
          .from('sale_items')
          .insert({
            sale_id: saleId,
            product_id: item.product_id,
            variant_id: item.variant_id,
            quantity: item.quantity,
            unit_price: item.unit_price,
            units_sold: item.units_sold,
            conversion_required: item.conversion_required,
            packages_converted: item.packages_converted || 0
          });

        if (itemError) {
          console.error('Erro ao inserir item da venda:', itemError);
          throw new Error(`Erro ao inserir item: ${itemError.message}`);
        }
      }

      // 7. Se for uma venda com delivery, atualiza os campos específicos
      if (isDeliveryOrder && saleData.deliveryData) {
        const { error: updateError } = await supabase
          .from('sales')
          .update({
            delivery: true,
            delivery_address: saleData.deliveryData.address,
            delivery_type: saleData.saleType,
            delivery_fee: saleData.deliveryData.deliveryFee,
            delivery_status: 'pending',
            delivery_zone_id: saleData.deliveryData.zoneId,
            delivery_instructions: saleData.deliveryData.instructions,
            estimated_delivery_time: new Date(Date.now() + saleData.deliveryData.estimatedTime * 60 * 1000).toISOString(),
            final_amount: saleData.total_amount + saleData.deliveryData.deliveryFee - (saleData.discount_amount || 0),
            status: 'pending'
          })
          .eq('id', saleId);

        if (updateError) {
          console.error('Erro ao atualizar delivery:', updateError);
          // Não falha a venda por erro no delivery, apenas loga
        }
      }

      // 8. Busca a venda criada para retornar
      const { data: sale, error: fetchError } = await supabase
        .from('sales')
        .select('*')
        .eq('id', saleId)
        .single();

      if (fetchError || !sale) {
        console.error('Erro ao buscar venda criada:', fetchError);
        // Retorna um objeto mínimo se não conseguir buscar
        const saleResult = { id: saleId };
        return saleResult;
      }

      // 9. Registra a auditoria da venda
      try {
        await supabase
          .from('audit_logs')
          .insert({
            user_id: user.id,
            action: 'create_sale',
            table_name: 'sales',
            record_id: saleId,
            old_data: null,
            new_data: {
              customer_id: saleData.customer_id,
              total_amount: saleData.total_amount,
              discount_amount: saleData.discount_amount || 0,
              item_count: saleData.items.length,
              payment_method: paymentMethod?.name || 'Outro'
            },
            ip_address: null,
            user_agent: null
          });
      } catch (auditError) {
        console.error('Erro ao registrar auditoria:', auditError);
        // Não falha a venda por causa de um erro de auditoria
      }

      // 10. Registra tracking inicial para delivery
      if (isDeliveryOrder) {
        try {
          await supabase
            .from('delivery_tracking')
            .insert({
              sale_id: saleId,
              status: 'pending',
              notes: 'Pedido criado - aguardando preparação',
              created_by: user.id
            });
          console.log('Tracking de delivery criado com sucesso');
        } catch (trackingError) {
          console.warn('Erro ao criar tracking de delivery (não crítico):', trackingError);
        }
      }

      // 11. Atualiza histórico do cliente e insights (opcional)
      if (saleData.customer_id) {
        try {
          await recordCustomerEvent({
            customer_id: saleData.customer_id,
            type: 'sale',
            origin_id: saleId,
            value: totalWithDeliveryFee - (saleData.discount_amount || 0),
            description: isDeliveryOrder ? 'Venda delivery registrada' : 'Venda registrada'
          });
          console.log('Evento do cliente registrado com sucesso');
        } catch (customerEventError: any) {
          console.warn('Erro ao registrar evento do cliente (não crítico):', customerEventError);
          
          // Log específico para erros de RLS
          if (customerEventError?.code === '42501') {
            console.warn('Políticas RLS impedem inserção em customer_history/customer_events');
            console.warn('A venda será processada normalmente, mas sem tracking CRM');
          }
          
          // Não bloqueia a venda - evento do cliente é opcional para funcionalidade básica
          // A venda deve funcionar mesmo sem o sistema CRM completo
        }
      }

      return sale;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product-variants"] }); // CORREÇÃO: Invalidar cache de variantes
      queryClient.invalidateQueries({ queryKey: ["variant-availability"] }); // CORREÇÃO: Invalidar disponibilidade
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      toast({
        title: "Venda registrada com sucesso!",
        description: "A venda foi registrada no sistema.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao registrar venda",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useDeleteSale = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (saleId: string) => {
      console.log('Iniciando exclusão da venda:', saleId);
      
      // 1. Verifica se o usuário está autenticado
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.error('Erro de autenticação:', authError);
        throw new Error("Usuário não autenticado");
      }

      console.log('Usuário autenticado:', user.id);

      // 2. Verifica se o usuário tem permissão de administrador
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profileError || !profile) {
        console.error('Erro ao buscar perfil:', profileError);
        throw new Error("Perfil de usuário não encontrado");
      }

      if (profile.role !== 'admin') {
        console.error('Usuário não é admin:', profile.role);
        throw new Error("Apenas administradores podem excluir vendas");
      }

      console.log('Permissões validadas. Executando exclusão...');

      // 3. Executa a função de exclusão melhorada
      const { data: result, error: deleteError } = await supabase.rpc('delete_sale_with_items', {
        p_sale_id: saleId
      });

      if (deleteError) {
        console.error('Erro na função de exclusão:', deleteError);
        
        // Tratamento específico de erros conhecidos
        if (deleteError.code === '42501') {
          throw new Error("Acesso negado. Apenas administradores podem excluir vendas.");
        } else if (deleteError.code === '02000') {
          throw new Error("Venda não encontrada ou já foi excluída.");
        } else {
          throw new Error(`Falha ao excluir venda: ${deleteError.message}`);
        }
      }

      console.log('Venda excluída com sucesso:', result);
      return result || { success: true };
    },
    onSuccess: (data) => {
      console.log('Exclusão concluída, invalidando queries...');
      
      // Invalida todas as queries relacionadas
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product-variants"] }); // CORREÇÃO: Invalidar cache de variantes
      queryClient.invalidateQueries({ queryKey: ["variant-availability"] }); // CORREÇÃO: Invalidar disponibilidade
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      
      const message = data?.message || "A venda foi removida do sistema.";
      const details = data?.items_deleted ? 
        `${data.items_deleted} itens removidos, ${data.products_restored} produtos com estoque restaurado.` :
        "Estoque dos produtos foi restaurado.";
      
      toast({
        title: "Venda excluída com sucesso!",
        description: `${message} ${details}`,
      });
    },
    onError: (error: Error) => {
      console.error('Erro final na exclusão:', error);
      
      toast({
        title: "Erro ao excluir venda",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const usePaymentMethods = () => {
  return useQuery({
    queryKey: ["payment-methods"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payment_methods")
        .select("*")
        .eq("is_active", true)
        .order("name", { ascending: true });

      if (error) {
        throw new Error(error.message);
      }

      return data as PaymentMethod[];
    },
  });
};
