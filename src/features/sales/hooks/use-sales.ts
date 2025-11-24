import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { recordCustomerEvent } from "@/features/customers/hooks/use-crm";
import { supabase } from "@/core/api/supabase/client";
import { useToast } from "@/shared/hooks/common/use-toast";
import { DeliveryAddress } from "@/core/types/sales.types";
import type { SaleType } from "@/features/sales/components/SalesPage";
import type { DeliveryData } from "@/features/sales/components/DeliveryOptionsModal";
import { getSaoPauloTimestamp, convertToSaoPaulo } from "@/shared/utils/timezone-saopaulo";

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
    // Campos legados para compatibilidade (serão removidos futuramente)
    sale_type?: 'unit' | 'package';
    package_units?: number;
  }[];
  notes?: string;
  // Campos para delivery
  saleType: SaleType;
  deliveryData?: DeliveryData;
  // Novos campos individuais de delivery (simplificados)
  delivery_address?: string | null;
  delivery_fee?: number;
  delivery_person_id?: string | null;
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

      // CORREÇÃO: Suportar tanto formato antigo (deliveryData) quanto novo (delivery_fee)
      const deliveryFee = isDeliveryOrder
        ? (saleData.deliveryData?.deliveryFee || saleData.delivery_fee || 0)
        : 0;

      const totalWithDeliveryFee = saleData.total_amount + deliveryFee;


      // 5. Valida os itens da venda
      if (!saleData.items || saleData.items.length === 0) {
        throw new Error("A venda deve conter pelo menos um item");
      }

      // 6. Processa a venda usando o procedimento process_sale (COM SUBTRAÇÃO DE ESTOQUE)

      // Prepara os itens no formato esperado pelo procedimento
      const processedItems = saleData.items.map(item => ({
        product_id: item.product_id,
        variant_id: item.variant_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        units_sold: item.units_sold || item.quantity,
        sale_type: item.sale_type // ✅ CORREÇÃO CRÍTICA: Incluir sale_type no processamento
      }));


      // Chama o procedimento process_sale que faz TUDO: cria venda + itens + subtrai estoque
      // CORREÇÃO: Ordem correta dos parâmetros conforme assinatura do procedimento
      const { data: saleResult, error: processError } = await supabase.rpc('process_sale', {
        p_customer_id: saleData.customer_id || null, // ✅ CORREÇÃO: Garantir que string vazia vire null
        p_user_id: user.id,
        p_total_amount: saleData.total_amount,
        p_final_amount: totalWithDeliveryFee - (saleData.discount_amount || 0),
        p_payment_method_id: saleData.payment_method_id,
        p_items: processedItems,
        p_discount_amount: saleData.discount_amount || 0,
        p_notes: saleData.notes || null,
        p_is_delivery: isDeliveryOrder
      });

      if (processError) {
        console.error('❌ Erro no procedimento process_sale:', processError);
        throw new Error(`Falha ao processar venda: ${processError.message}`);
      }

      if (!saleResult || !saleResult.sale_id) {
        throw new Error('Procedimento process_sale não retornou ID da venda');
      }

      const saleId = saleResult.sale_id;

      // 7. SEMPRE atualizar o delivery_type para todas as vendas (presencial/delivery/pickup)

      const baseUpdate: any = {
        delivery_type: saleData.saleType
      };

      // 8. Se for uma venda com delivery, adiciona os campos específicos
      if (isDeliveryOrder) {
        const deliveryUpdate: any = {
          delivery: true,
          delivery_status: 'pending',
          status: 'pending'
        };

        // Usar dados do deliveryData (modal complexo) OU dados simplificados
        if (saleData.deliveryData) {
          // Modal complexo de delivery (sistema antigo)
          Object.assign(deliveryUpdate, {
            delivery_address: saleData.deliveryData.address,
            delivery_fee: saleData.deliveryData.deliveryFee,
            delivery_zone_id: saleData.deliveryData.zoneId,
            delivery_instructions: saleData.deliveryData.instructions,
            estimated_delivery_time: (() => {
              // Calcular tempo estimado de entrega baseado no horário de São Paulo
              const saoPauloNow = new Date(new Date().toLocaleString("en-US", {timeZone: "America/Sao_Paulo"}));
              const estimatedTime = new Date(saoPauloNow.getTime() + saleData.deliveryData.estimatedTime * 60 * 1000);
              return estimatedTime.toISOString();
            })(),
            final_amount: saleData.total_amount + saleData.deliveryData.deliveryFee - (saleData.discount_amount || 0)
          });
        } else {
          // Dados simplificados de delivery (novo sistema)
          Object.assign(deliveryUpdate, {
            delivery_address: saleData.delivery_address ? { address: saleData.delivery_address } : null,
            delivery_fee: saleData.delivery_fee || 0,
            delivery_person_id: saleData.delivery_person_id,
            final_amount: saleData.total_amount + (saleData.delivery_fee || 0) - (saleData.discount_amount || 0)
          });
        }

        Object.assign(baseUpdate, deliveryUpdate);
      } else {
      }

      const { error: updateError } = await supabase
        .from('sales')
        .update(baseUpdate)
        .eq('id', saleId);

      if (updateError) {
        console.error('❌ ERRO CRÍTICO ao atualizar delivery_type:', updateError);
        console.error('❌ Update que falhou:', JSON.stringify(baseUpdate, null, 2));
        console.error('❌ Sale ID:', saleId);
        throw new Error(`Falha ao atualizar dados de delivery: ${updateError.message}`);
      } else {

        // VERIFICAÇÃO ADICIONAL: Confirmar se dados foram realmente persistidos
        const { data: verifyData, error: verifyError } = await supabase
          .from('sales')
          .select('delivery_type, delivery_address, delivery_fee')
          .eq('id', saleId)
          .single();


        if (verifyError) {
          console.error('❌ ERRO na verificação pós-UPDATE:', verifyError);
        } else if (isDeliveryOrder && verifyData?.delivery_type !== 'delivery') {
          console.error('❌ PARADOXO: UPDATE disse sucesso mas dados não persistiram!');
          console.error('❌ Esperado delivery_type=delivery, encontrado:', verifyData?.delivery_type);
          throw new Error(`UPDATE falhou silenciosamente - delivery_type ainda é ${verifyData?.delivery_type}`);
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
    onSuccess: (data) => {
      // ✅ CORREÇÃO: Verificar se realmente houve sucesso antes de mostrar toast
      if (data && data.id) {
        queryClient.invalidateQueries({ queryKey: ["sales"] });
        queryClient.invalidateQueries({ queryKey: ["products"] });
        queryClient.invalidateQueries({ queryKey: ["product-variants"] }); // CORREÇÃO: Invalidar cache de variantes
        queryClient.invalidateQueries({ queryKey: ["variant-availability"] }); // CORREÇÃO: Invalidar disponibilidade
        queryClient.invalidateQueries({ queryKey: ["reports"] });
        queryClient.invalidateQueries({ queryKey: ["customer-table-data"] }); // CORREÇÃO: Invalidar tabela de clientes para refletir última compra

        // ✅ CORREÇÃO: Toast de sucesso apenas com dados válidos
        toast({
          title: "Venda registrada com sucesso!",
          description: "A venda foi registrada no sistema.",
        });
      } else {
        // ✅ CORREÇÃO: Se onSuccess for chamado sem dados válidos, não mostrar toast de sucesso
        console.warn('⚠️ onSuccess chamado sem dados válidos:', data);
      }
    },
    onError: (error: Error) => {
      // ✅ CORREÇÃO: Evitar toast de erro se for erro esperado/tratado
      if (error.message.includes('Invalid login credentials')) {
        // Error de login já é tratado na UI, não mostrar toast duplicado
        return;
      }

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
      
      // 1. Verifica se o usuário está autenticado
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.error('Erro de autenticação:', authError);
        throw new Error("Usuário não autenticado");
      }


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

      // Verificar se o usuário tem uma função que permite excluir vendas (admin ou employee)
      const allowedRoles: AllowedRole[] = ['admin', 'employee'];
      if (!allowedRoles.includes(profile.role as AllowedRole)) {
        console.error('Usuário não tem permissão para excluir:', profile.role);
        throw new Error("Apenas administradores e funcionários podem excluir vendas");
      }


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

      return result || { success: true };
    },
    onSuccess: (data) => {

      // ✅ CORREÇÃO: Verificar se realmente houve sucesso
      if (data && (data.success || data.message)) {
        // Invalida todas as queries relacionadas
        queryClient.invalidateQueries({ queryKey: ["sales"] });
        queryClient.invalidateQueries({ queryKey: ["products"] });
        queryClient.invalidateQueries({ queryKey: ["product-variants"] }); // CORREÇÃO: Invalidar cache de variantes
        queryClient.invalidateQueries({ queryKey: ["variant-availability"] }); // CORREÇÃO: Invalidar disponibilidade
        queryClient.invalidateQueries({ queryKey: ["reports"] });
        queryClient.invalidateQueries({ queryKey: ["dashboard"] });
        queryClient.invalidateQueries({ queryKey: ["customer-table-data"] }); // CORREÇÃO: Invalidar tabela de clientes após exclusão de venda

        const message = data?.message || "A venda foi removida do sistema.";
        const details = data?.items_deleted ?
          `${data.items_deleted} itens removidos, ${data.products_restored} produtos com estoque restaurado.` :
          "Estoque dos produtos foi restaurado.";

        toast({
          title: "Venda excluída com sucesso!",
          description: `${message} ${details}`,
        });
      } else {
        console.warn('⚠️ onSuccess de delete chamado sem dados válidos:', data);
      }
    },
    onError: (error: Error) => {
      console.error('Erro final na exclusão:', error);

      // ✅ CORREÇÃO: Filtrar erros específicos que já são tratados
      if (error.message.includes('Acesso negado') || error.message.includes('não encontrada')) {
        // Estes erros são específicos e já bem tratados, não precisa de toast genérico
        return;
      }

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
