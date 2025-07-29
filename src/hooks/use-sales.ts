import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { recordCustomerEvent } from "./use-crm";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

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
  delivery_address: any | null; // Usando any para Json
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
  items: { 
    product_id: string; 
    quantity: number; 
    unit_price: number 
  }[];
  notes?: string;
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
      // Primeiro, buscamos as vendas básicas
      let query = supabase
        .from('sales')
        .select('*')
        .order('created_at', { ascending: false });

      if (params?.startDate) {
        query = query.gte("created_at", params.startDate.toISOString());
      }
      
      if (params?.endDate) {
        const nextDay = new Date(params.endDate);
        nextDay.setDate(nextDay.getDate() + 1);
        query = query.lt("created_at", nextDay.toISOString());
      }
      
      if (params?.status) {
        query = query.eq("status", params.status);
      }
      
      if (params?.limit) {
        query = query.limit(params.limit);
      }

      const { data: sales, error: salesError } = await query;

      if (salesError) {
        throw new Error(salesError.message);
      }

      if (!sales || sales.length === 0) {
        return [];
      }

      // Buscamos informações adicionais dos vendedores e clientes em paralelo
      const userIds = [...new Set(sales.map(sale => sale.user_id))];
      const customerIds = [...new Set(sales.map(sale => sale.customer_id).filter(Boolean))];

      // 1. Busca os perfis dos vendedores da tabela profiles
      let filteredUsers: { id: string; name: string | null; email: string | null }[] = [];
      
      if (userIds.length > 0) {
        const { data: usersData, error: usersError } = await supabase
          .from('profiles')
          .select('id, name, email')
          .in('id', userIds);
        
        if (usersError) {
          console.error('Erro ao buscar vendedores:', usersError);
          console.warn('Continuando sem informações detalhadas dos vendedores');
        } else {
          filteredUsers = usersData || [];
        }
      }

      // Busca informações dos clientes (se houver)
      let customers: Array<{
        id: string;
        name: string | null;
        email: string | null;
        phone: string | null;
      }> = [];
      
      if (customerIds.length > 0) {
        try {
          const { data: customersData, error: customersError } = await supabase
            .from('customers')
            .select('id, name, email, phone')
            .in('id', customerIds);

          if (customersError) throw customersError;
          
          customers = customersData || [];
        } catch (error) {
          console.error('Erro ao buscar clientes:', error);
          // Não interrompemos o fluxo, apenas registramos o erro
        }
      }

      // Busca itens das vendas
      const saleIds = sales.map(s => s.id);
      let itemsBySale: Record<string, Sale["items"]> = {};
      if (saleIds.length > 0) {
        const { data: itemsData, error: itemsError } = await supabase
          .from('sale_items')
          .select('id, sale_id, product_id, quantity, unit_price')
          .in('sale_id', saleIds);
        // Mapeia nomes dos produtos
        let productMap: Record<string,string> = {};
        if(!itemsError && itemsData && itemsData.length){
          const productIds = [...new Set(itemsData.map((it:any)=>it.product_id))];
          if(productIds.length){
            const { data: prodData } = await supabase
              .from('products')
              .select('id,name')
              .in('id', productIds);
            prodData?.forEach((p:any)=>{ productMap[p.id]=p.name; });
          }
        }
        if (!itemsError && itemsData) {
          itemsData.forEach((it: any) => {
            if (!itemsBySale[it.sale_id]) itemsBySale[it.sale_id] = [];
            itemsBySale[it.sale_id].push({
              id: it.id,
              sale_id: it.sale_id,
              product_id: it.product_id,
              quantity: it.quantity,
              unit_price: it.unit_price,
              subtotal: it.quantity * it.unit_price,
              product: { name: productMap[it.product_id] ?? 'Produto não encontrado' },
              
            });
          });
        }
      }

      // Mapeia os dados para o formato esperado
      const mappedData = sales.map(sale => {
        const user = filteredUsers.find(u => u.id === sale.user_id);
        const customer = customers.find(c => c.id === sale.customer_id);
        
        return {
          ...sale,
          customer: customer ? {
            id: customer.id,
            name: customer.name || customer.email?.split('@')[0] || 'Cliente',
            email: customer.email,
            phone: customer.phone
          } : null,
          seller: user ? {
            id: user.id,
            name: user.name || user.email?.split('@')[0] || 'Usuário',
            email: user.email || undefined
          } : null,
          // Garante que os campos obrigatórios existam
          discount_amount: sale.discount_amount || 0,
          final_amount: sale.final_amount || sale.total_amount,
          payment_status: sale.payment_status || 'pending',
          status: sale.status || 'completed',
          notes: sale.notes || null,
          delivery: sale.delivery || false,
          delivery_address: sale.delivery_address || null,
          items: itemsBySale[sale.id] ?? []
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
      const allowedRoles = ['admin', 'employee'] as const;
      if (!allowedRoles.includes(profile.role as any)) {
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

      // 4. Cria a venda principal
      const { data: sale, error: saleError } = await supabase
        .from('sales')
        .insert({
          customer_id: saleData.customer_id,
          user_id: user.id,
          seller_id: user.id, // Define o vendedor como o usuário logado
          total_amount: saleData.total_amount,
          discount_amount: 0, // Valor padrão
          final_amount: saleData.total_amount, // Inicialmente igual ao total
          payment_method: paymentMethod?.name || 'Outro',
          payment_status: 'paid', // Status de pagamento padrão
          status: 'completed', // Status da venda
          delivery: false, // Entrega desativada por padrão
          delivery_address: null, // Sem endereço de entrega
          delivery_user_id: null, // Sem usuário de entrega
          notes: saleData.notes || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('*')
        .single();

      if (saleError) {
        console.error('Erro ao criar venda:', saleError);
        throw new Error(`Falha ao criar venda: ${saleError.message}`);
      }

      // 5. Valida os itens da venda
      if (!saleData.items || saleData.items.length === 0) {
        throw new Error("A venda deve conter pelo menos um item");
      }

      // 6. Verifica a disponibilidade em estoque antes de processar a venda
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, stock_quantity')
        .in('id', saleData.items.map(item => item.product_id));

      if (productsError) {
        console.error('Erro ao verificar estoque:', productsError);
        throw new Error("Erro ao verificar a disponibilidade dos produtos");
      }

      // Cria um mapa de estoque para verificação rápida
      const stockMap = new Map(products.map(p => [p.id, p.stock_quantity]));
      
      // Verifica se algum produto não tem estoque suficiente
      const outOfStockItems = saleData.items.filter(item => {
        const availableStock = stockMap.get(item.product_id) || 0;
        return item.quantity > availableStock;
      });

      if (outOfStockItems.length > 0) {
        const productNames = await Promise.all(
          outOfStockItems.map(async (item) => {
            const { data: product } = await supabase
              .from('products')
              .select('name')
              .eq('id', item.product_id)
              .single();
            return product?.name || `Produto ${item.product_id}`;
          })
        );
        
        throw new Error(
          `Os seguintes produtos não têm estoque suficiente: ${productNames.join(', ')}`
        );
      }

      // 7. Insere os itens da venda
      const saleItems = saleData.items.map(item => ({
        sale_id: sale.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price
      }));

      const { error: itemsError } = await supabase
        .from('sale_items')
        .insert(saleItems);

      if (itemsError) {
        console.error('Erro ao salvar itens da venda:', itemsError);
        throw new Error(`Falha ao salvar os itens da venda: ${itemsError.message}`);
      }

      // 8. Ajuste de estoque
      // O estoque será ajustado automaticamente por meio dos triggers do banco de dados
      // (sale_items -> inventory_movements -> adjust_product_stock). Não é necessário
      // fazer nenhuma chamada RPC manual aqui para evitar dedução dupla de estoque.

      // 9. Registra a auditoria da venda
      try {
        await supabase
          .from('audit_logs')
          .insert({
            user_id: user.id,
            action: 'create_sale',
            table_name: 'sales',
            record_id: sale.id,
            old_data: null,
            new_data: {
              customer_id: saleData.customer_id,
              total_amount: saleData.total_amount,
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

      // 10. Atualiza histórico do cliente e insights
      if (saleData.customer_id) {
        await recordCustomerEvent({
          customer_id: saleData.customer_id,
          type: 'sale',
          origin_id: sale.id,
          value: saleData.total_amount,
          description: 'Venda registrada'
        });
      }

      return sale;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
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
      // 1. Verifica se o usuário está autenticado e é administrador
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error("Usuário não autenticado");
      }

      // 2. Verifica se o usuário tem permissão de administrador
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profileError || !profile || profile.role !== 'admin') {
        throw new Error("Apenas administradores podem excluir vendas");
      }

      // 3. Busca os itens da venda para restaurar o estoque
      const { data: saleItems, error: itemsError } = await supabase
        .from('sale_items')
        .select('product_id, quantity')
        .eq('sale_id', saleId);

      if (itemsError) {
        console.error('Erro ao buscar itens da venda:', itemsError);
        throw new Error("Falha ao buscar itens da venda");
      }

      // 4. Inicia uma transação para garantir a integridade dos dados
      const { error: deleteError } = await supabase.rpc('delete_sale_with_items', {
        p_sale_id: saleId
      });

      if (deleteError) {
        console.error('Erro ao excluir venda:', deleteError);
        throw new Error(`Falha ao excluir venda: ${deleteError.message}`);
      }

      // 5. Registra a auditoria
      try {
        await supabase
          .from('audit_logs')
          .insert({
            user_id: user.id,
            action: 'delete_sale',
            table_name: 'sales',
            record_id: saleId,
            old_data: { sale_id: saleId },
            new_data: null,
            ip_address: null,
            user_agent: null
          });
      } catch (auditError) {
        console.error('Erro ao registrar auditoria:', auditError);
        // Não falha a operação por causa de um erro de auditoria
      }

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      toast({
        title: "Venda excluída com sucesso!",
        description: "A venda foi removida do sistema.",
      });
    },
    onError: (error: Error) => {
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
