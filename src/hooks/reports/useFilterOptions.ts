import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface FilterOptions {
  categories: Array<{ id: string; name: string }>;
  sellers: Array<{ id: string; name: string }>;
  paymentMethods: Array<{ id: string; name: string }>;
  customers: Array<{ id: string; name: string; email?: string }>;
}

export const useFilterOptions = () => {
  // Buscar categorias
  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name')
      .order('name', { ascending: true });
    
    if (error) throw error;
    return data || [];
  };

  // Buscar vendedores
  const fetchSellers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name')
      .order('full_name', { ascending: true });
    
    if (error) throw error;
    return data.map(seller => ({
      id: seller.id,
      name: seller.full_name
    }));
  };

  // Buscar métodos de pagamento
  const fetchPaymentMethods = async () => {
    const { data, error } = await supabase
      .from('payment_methods')
      .select('id, name')
      .order('name', { ascending: true });
    
    if (error) throw error;
    return data || [];
  };

  // Buscar clientes
  const fetchCustomers = async () => {
    const { data, error } = await supabase
      .from('customers')
      .select('id, name, email')
      .order('name', { ascending: true });
    
    if (error) throw error;
    return data || [];
  };

  // Queries para cada tipo de opção
  const categoriesQuery = useQuery({
    queryKey: ['filter-options', 'categories'],
    queryFn: fetchCategories,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  const sellersQuery = useQuery({
    queryKey: ['filter-options', 'sellers'],
    queryFn: fetchSellers,
    staleTime: 5 * 60 * 1000,
  });

  const paymentMethodsQuery = useQuery({
    queryKey: ['filter-options', 'payment-methods'],
    queryFn: fetchPaymentMethods,
    staleTime: 5 * 60 * 1000,
  });

  const customersQuery = useQuery({
    queryKey: ['filter-options', 'customers'],
    queryFn: fetchCustomers,
    staleTime: 5 * 60 * 1000,
  });

  // Estado de carregamento e erro agregado
  const isLoading = categoriesQuery.isLoading || 
                   sellersQuery.isLoading || 
                   paymentMethodsQuery.isLoading ||
                   customersQuery.isLoading;

  const error = categoriesQuery.error || 
               sellersQuery.error || 
               paymentMethodsQuery.error ||
               customersQuery.error;

  // Dados formatados para os selects
  const options: FilterOptions = {
    categories: categoriesQuery.data || [],
    sellers: sellersQuery.data || [],
    paymentMethods: paymentMethodsQuery.data || [],
    customers: customersQuery.data || [],
  };

  // Função para buscar opções de forma assíncrona (útil para componentes de busca)
  const searchOptions = async (type: keyof FilterOptions, searchTerm: string) => {
    if (!searchTerm.trim()) {
      return options[type].slice(0, 20); // Retorna as primeiras 20 opções
    }

    const term = searchTerm.toLowerCase();
    return options[type].filter(option => 
      option.name.toLowerCase().includes(term) || 
      (option as any).email?.toLowerCase().includes(term)
    ).slice(0, 20); // Limita a 20 resultados
  };

  return {
    options,
    isLoading,
    error,
    refetch: () => {
      categoriesQuery.refetch();
      sellersQuery.refetch();
      paymentMethodsQuery.refetch();
      customersQuery.refetch();
    },
    searchOptions,
  };
};

// Hook para buscar estatísticas de filtros ativos
export const useFilterStats = (filters: any) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['filter-stats', filters],
    queryFn: async () => {
      // Aqui você pode implementar consultas para contar itens com base nos filtros ativos
      // Por exemplo, contar quantos pedidos existem para cada filtro ativo
      const stats: Record<string, number> = {};
      
      // Exemplo: Contar pedidos por categoria
      if (filters.categoryId) {
        const { count } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('category_id', filters.categoryId);
        
        stats.categoryCount = count || 0;
      }
      
      // Adicione mais contagens conforme necessário
      
      return stats;
    },
    enabled: !!filters, // Só executa quando há filtros
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
  
  return { stats: data, isLoading, error };
};
