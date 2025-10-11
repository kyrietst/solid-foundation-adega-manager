import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';
import { 
  CustomerTableRow, 
  CustomerStatus, 
  CustomerStatusColor 
} from '../types/customer-table.types';

// Função para calcular completude do perfil
const calculateProfileCompleteness = (customer: Record<string, unknown>): number => {
  const weights = {
    name: 15,
    phone: 15,
    contact_permission: 15, // Obrigatório LGPD
    email: 10,
    address: 10,
    birthday: 10,
    contact_preference: 10,
    notes: 5
  };
  
  let totalPoints = 0;
  
  if (customer.name && String(customer.name).trim()) totalPoints += weights.name;
  if (customer.phone && String(customer.phone).trim()) totalPoints += weights.phone;
  if (customer.contact_permission === true) totalPoints += weights.contact_permission;
  if (customer.email && String(customer.email).trim()) totalPoints += weights.email;

  // ✅ CORRIGIDO: Aceitar endereço como string ou objeto
  if (customer.address) {
    if (typeof customer.address === 'string' && customer.address.trim()) {
      // Endereço é string (formato atual)
      totalPoints += weights.address;
    } else if (typeof customer.address === 'object' && customer.address !== null) {
      // Endereço é objeto JSON (formato novo)
      const addr = customer.address as Record<string, unknown>;
      if (addr.city && addr.street) totalPoints += weights.address;
    }
  }

  if (customer.birthday) totalPoints += weights.birthday;
  if (customer.contact_preference && String(customer.contact_preference).trim()) totalPoints += weights.contact_preference;
  if (customer.notes && String(customer.notes).trim()) totalPoints += weights.notes;
  
  const maxPoints = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
  return Math.round((totalPoints / maxPoints) * 100);
};

// Função para calcular próximo aniversário
const calculateNextBirthday = (birthday: string | null): { nextBirthday: Date | null; daysUntil: number | null } => {
  if (!birthday) return { nextBirthday: null, daysUntil: null };
  
  const birthDate = new Date(birthday);
  const today = new Date();
  const currentYear = today.getFullYear();
  
  // Próximo aniversário este ano
  let nextBirthday = new Date(currentYear, birthDate.getMonth(), birthDate.getDate());
  
  // Se já passou, próximo ano
  if (nextBirthday < today) {
    nextBirthday = new Date(currentYear + 1, birthDate.getMonth(), birthDate.getDate());
  }
  
  const daysUntil = Math.ceil((nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  return { nextBirthday, daysUntil };
};

// Função para extrair cidade do endereço
const extractCityFromAddress = (address: unknown): string | null => {
  if (!address) return null;

  // Se for objeto JSON (formato novo), extrair city
  if (typeof address === 'object' && address !== null) {
    const addr = address as Record<string, unknown>;
    return (addr.city as string) || null;
  }

  // Se for string (formato atual), extrair cidade usando regex
  if (typeof address === 'string') {
    // Padrão: "... - Centro - São Paulo/SP - CEP ..." ou "... - São Paulo/SP"
    // Extrai: "São Paulo/SP" ou "São Paulo-SP"
    const match = address.match(/([A-Za-zÀ-ÿ\s]+)[\/-]([A-Z]{2})/);
    if (match && match[1]) {
      return match[1].trim(); // Retorna "São Paulo"
    }
  }

  return null;
};

// Função para calcular último contato
const calculateLastContact = async (customerId: string): Promise<{ lastContact: Date | null; daysAgo: number | null }> => {
  try {
    // Buscar última interação do customer_interactions
    const { data: interactions } = await supabase
      .from('customer_interactions')
      .select('created_at')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false })
      .limit(1);

    // Buscar última venda
    const { data: sales } = await supabase
      .from('sales')
      .select('created_at')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false })
      .limit(1);

    // Pegar a data mais recente entre interações e vendas
    const latestInteraction = interactions?.[0]?.created_at;
    const latestSale = sales?.[0]?.created_at;
    
    let lastContact: Date | null = null;
    
    if (latestInteraction && latestSale) {
      lastContact = new Date(latestInteraction) > new Date(latestSale) 
        ? new Date(latestInteraction)
        : new Date(latestSale);
    } else if (latestInteraction) {
      lastContact = new Date(latestInteraction);
    } else if (latestSale) {
      lastContact = new Date(latestSale);
    }

    if (!lastContact) return { lastContact: null, daysAgo: null };

    const today = new Date();
    const daysAgo = Math.floor((today.getTime() - lastContact.getTime()) / (1000 * 60 * 60 * 24));
    
    return { lastContact, daysAgo };
  } catch (error) {
    console.error('Error calculating last contact:', error);
    return { lastContact: null, daysAgo: null };
  }
};

// Função para calcular valor em aberto
const calculateOutstandingAmount = async (customerId: string): Promise<number> => {
  try {
    const { data, error } = await supabase
      .from('accounts_receivable')
      .select('amount')
      .eq('customer_id', customerId)
      .eq('status', 'open');

    if (error) {
      console.error('Error fetching outstanding amount:', error);
      return 0;
    }

    return (data || []).reduce((sum, ar) => sum + Number(ar.amount), 0);
  } catch (error) {
    console.error('Error calculating outstanding amount:', error);
    return 0;
  }
};

export const getCustomerStatus = (segment: string | null, lastPurchase: Date | null): {
  status: CustomerStatus;
  color: CustomerStatusColor;
} => {
  if (!segment) return { status: 'Inativo', color: 'gray' };

  if (segment === 'Fiel - Ouro') return { status: 'VIP', color: 'gold' };
  if (segment === 'Em Risco') return { status: 'Em Risco', color: 'red' };
  if (segment === 'Inativo') return { status: 'Inativo', color: 'gray' };

  if (lastPurchase) {
    const daysSinceLastPurchase = Math.floor(
      (new Date().getTime() - new Date(lastPurchase).getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceLastPurchase <= 30) return { status: 'Ativo', color: 'green' };
    if (daysSinceLastPurchase <= 90) return { status: 'Regular', color: 'yellow' };
    return { status: 'Reativar', color: 'orange' };
  }

  return { status: 'Regular', color: 'yellow' };
};

const fetchCustomerTableData = async (): Promise<CustomerTableRow[]> => {
  const { data, error } = await supabase.rpc('get_customer_table_data');
  
  if (error) {
    console.error('Error fetching customer table data:', error);
    throw new Error('Failed to fetch customer data');
  }

  // Processar todos os dados em paralelo
  const processedData = await Promise.all(
    (data || []).map(async (row: Record<string, unknown>): Promise<CustomerTableRow> => {
      const { status, color } = getCustomerStatus(row.segmento, row.ultima_compra);
      const { nextBirthday, daysUntil } = calculateNextBirthday(row.birthday as string);
      
      // Calcular último contato e valor em aberto em paralelo
      const [lastContactData, outstandingAmount] = await Promise.all([
        calculateLastContact(row.id as string),
        calculateOutstandingAmount(row.id as string)
      ]);
      
      return {
        id: row.id as string,
        cliente: (row.cliente as string) || 'N/A',
        categoriaFavorita: (row.categoria_favorita as string) || 'Não definida',
        segmento: (row.segmento as string) || 'Novo',
        metodoPreferido: (row.metodo_preferido as string) || null,
        ultimaCompra: row.ultima_compra ? new Date(row.ultima_compra as string) : null,
        insightsCount: (row.insights_count as number) || 0,
        insightsConfidence: (row.insights_confidence as number) || 0,
        status,
        statusColor: color,
        createdAt: new Date(row.created_at as string),
        updatedAt: new Date(row.updated_at as string),
        // Novos campos
        cidade: extractCityFromAddress(row.address),
        proximoAniversario: nextBirthday,
        diasParaAniversario: daysUntil,
        contactPermission: Boolean(row.contact_permission),
        profileCompleteness: calculateProfileCompleteness(row),
        // Campos adicionais
        ultimoContato: lastContactData.lastContact,
        diasSemContato: lastContactData.daysAgo,
        valorEmAberto: outstandingAmount,
      };
    })
  );

  return processedData;
};

// Fallback query se a RPC function não existir
const fetchCustomerTableDataFallback = async (): Promise<CustomerTableRow[]> => {
  const { data, error } = await supabase
    .from('customers')
    .select(`
      id,
      name,
      email,
      phone,
      address,
      birthday,
      contact_preference,
      contact_permission,
      notes,
      favorite_category,
      segment,
      last_purchase_date,
      created_at,
      updated_at
    `)
    .gte('lifetime_value', 0)
    .order('lifetime_value', { ascending: false });

  if (error) {
    console.error('Error fetching customer table data (fallback):', error);
    throw new Error('Failed to fetch customer data');
  }

  // Buscar método de pagamento preferido para cada cliente
  const customersWithPaymentMethods = await Promise.all(
    (data || []).map(async (customer: Record<string, unknown>) => {
      const { data: salesData } = await supabase
        .from('sales')
        .select('payment_method')
        .eq('customer_id', customer.id)
        .not('payment_method', 'is', null);

      // Contar métodos de pagamento e pegar o mais usado
      const paymentMethods = salesData?.map(s => s.payment_method) || [];
      const methodCount = paymentMethods.reduce((acc: Record<string, number>, method: string) => {
        acc[method] = (acc[method] || 0) + 1;
        return acc;
      }, {});
      
      const mostUsedMethod = Object.entries(methodCount)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || null;

      // Buscar TODOS os insights do cliente
      const { data: insightsData } = await supabase
        .from('customer_insights')
        .select('confidence')
        .eq('customer_id', customer.id)
        .eq('is_active', true);

      const insightsCount = insightsData?.length || 0;
      const avgConfidence = insightsData && insightsData.length > 0
        ? insightsData.reduce((sum, insight) => sum + (insight.confidence || 0), 0) / insightsData.length
        : 0;

      const { status, color } = getCustomerStatus(customer.segment as string, customer.last_purchase_date as string);
      const { nextBirthday, daysUntil } = calculateNextBirthday(customer.birthday as string);

      // Calcular último contato e valor em aberto
      const [lastContactData, outstandingAmount] = await Promise.all([
        calculateLastContact(customer.id as string),
        calculateOutstandingAmount(customer.id as string)
      ]);

      return {
        id: customer.id as string,
        cliente: (customer.name as string) || 'N/A',
        email: (customer.email as string) || null,
        phone: (customer.phone as string) || null,
        categoriaFavorita: (customer.favorite_category as string) || 'Não definida',
        segmento: (customer.segment as string) || 'Novo',
        metodoPreferido: mostUsedMethod,
        ultimaCompra: customer.last_purchase_date ? new Date(customer.last_purchase_date as string) : null,
        insightsCount,
        insightsConfidence: avgConfidence,
        status,
        statusColor: color,
        createdAt: new Date(customer.created_at as string),
        updatedAt: new Date(customer.updated_at as string),
        // Novos campos
        cidade: extractCityFromAddress(customer.address),
        proximoAniversario: nextBirthday,
        diasParaAniversario: daysUntil,
        contactPermission: Boolean(customer.contact_permission),
        profileCompleteness: calculateProfileCompleteness(customer),
        // Campos adicionais
        ultimoContato: lastContactData.lastContact,
        diasSemContato: lastContactData.daysAgo,
        valorEmAberto: outstandingAmount,
      } as CustomerTableRow;
    })
  );

  return customersWithPaymentMethods;
};

export const useCustomerTableData = () => {
  return useQuery({
    queryKey: ['customer-table-data'],
    queryFn: async () => {
      // Usar sempre a query de fallback corrigida
      console.log('🔄 Usando query de fallback corrigida (forçada)');
      return await fetchCustomerTableDataFallback();
    },
    staleTime: 1000 * 30, // 30 segundos para dados mais atualizados
    gcTime: 1000 * 60 * 5, // 5 minutos para garbage collection
    refetchOnWindowFocus: true, // Atualizar quando o usuário voltar à aba
    refetchOnReconnect: true, // Atualizar quando reconectar à internet
    refetchInterval: 1000 * 60 * 2, // Atualizar automaticamente a cada 2 minutos
    retry: 3, // Tentar novamente em caso de erro
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
};