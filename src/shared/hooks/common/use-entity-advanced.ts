/**
 * Hook Avançado para Entidades com Generic Constraints
 * 
 * Versão aprimorada do useEntity com constraints específicos e type guards
 * para maior type safety e melhores abstrações de business logic
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';
import { useToast } from '@/shared/hooks/common/use-toast';
import type {
  ListResponse,
  Repository,
  ValidationSchema,
} from '@/core/types/generic.types';

import {
  hasId,
  isNotNullish
} from '@/core/types/generic.types';
import { Database } from '@/core/types/database.types';

// ============================================================================
// STRICT DATABASE TYPING
// ============================================================================

type TableName = keyof Database['public']['Tables'];
type Row<K extends TableName> = Database['public']['Tables'][K]['Row'];
type Insert<K extends TableName> = Database['public']['Tables'][K]['Insert'];
type Update<K extends TableName> = Database['public']['Tables'][K]['Update'];

// Helper to cast string keys to column names safely when we know the logic holds
type Column<K extends TableName> = keyof Row<K> & string;

// ============================================================================
// ADVANCED GENERIC CONSTRAINTS
// ============================================================================

// Constraint para entidades paginadas
interface PaginationOptions<K extends TableName> {
  page?: number;
  limit?: number;
  offset?: number;
  orderBy?: {
    field: Column<K>;
    direction: 'asc' | 'desc';
  };
  filters?: Partial<Row<K>>; // Strict typing for filters
  search?: { field: Column<K>; term: string };
}

// ============================================================================
// SPECIALIZED HOOKS WITH CONSTRAINTS
// ============================================================================

/**
 * Hook para entidades com nome pesquisável
 * Assumes que a tabela possui uma coluna 'name'
 */
export function useSearchableEntity<K extends TableName>(
  table: K,
  searchTerm?: string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: [table, 'searchable', searchTerm],
    queryFn: async (): Promise<Row<K>[]> => {
      let query = supabase.from(table).select('*');

      if (searchTerm) {
        // Safe cast: assumimos que tabelas usadas aqui têm 'name'
        // Em um sistema ideal, restringiríamos K, mas para flexibilidade usamos cast tipado
        query = query.ilike('name' as Column<K>, `%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []) as unknown as Row<K>[];
    },
    enabled: options?.enabled ?? true,
  });
}

/**
 * Hook para produtos
 * Filtros específicos para produtos
 */
export function useProductEntity<K extends TableName>(
  table: K,
  filters?: { category?: string; inStock?: boolean }
) {
  return useQuery({
    queryKey: [table, 'products', filters],
    queryFn: async (): Promise<Row<K>[]> => {
      let query = supabase.from(table).select('*');

      if (filters?.category) {
        query = query.eq('category' as any, filters.category);
      }

      if (filters?.inStock) {
        // 'stock_quantity' > 0
        query = query.filter('stock_quantity' as any, 'gt', 0);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []) as unknown as Row<K>[];
    },
  });
}

/**
 * Hook para clientes
 */
export function useCustomerEntity<K extends TableName>(
  table: K,
  searchTerm?: string
) {
  return useQuery({
    queryKey: [table, 'customers', searchTerm],
    queryFn: async (): Promise<Row<K>[]> => {
      let query = supabase.from(table).select('*');

      if (searchTerm) {
        // Busca multicampo complexa
        // Precisamos garantir que a string de filtro é válida para o Postgrest
        // Aqui mantemos a string pura pois é sintaxe do Postgrest, não nome de coluna direto
        query = query.or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []) as unknown as Row<K>[];
    },
  });
}

/**
 * Hook para vendas
 */
export function useSaleEntity<K extends TableName>(
  table: K,
  dateRange?: { start: Date; end: Date }
) {
  return useQuery({
    queryKey: [table, 'sales', dateRange],
    queryFn: async (): Promise<Row<K>[]> => {
      let query = supabase.from(table).select('*');

      if (dateRange) {
        query = query
          .gte('created_at' as Column<K>, dateRange.start.toISOString())
          .lte('created_at' as Column<K>, dateRange.end.toISOString());
      }

      query = query.order('created_at' as Column<K>, { ascending: false });

      const { data, error } = await query;
      if (error) throw error;

      return (data || []) as unknown as Row<K>[];
    },
  });
}

// ============================================================================
// ADVANCED PAGINATION HOOK
// ============================================================================

/**
 * Hook para entidades com paginação avançada e type safety
 */
export function usePaginatedEntity<K extends TableName>(
  table: K,
  options: PaginationOptions<K> = {}
) {
  const {
    page = 1,
    limit = 10,
    orderBy,
    filters = {},
    search
  } = options;

  const offset = (page - 1) * limit;

  return useQuery({
    queryKey: [table, 'paginated', { page, limit, orderBy, filters, search }],
    queryFn: async (): Promise<ListResponse<Row<K>>> => {
      // Query para contar total
      let countQuery = supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      // Query para dados
      let dataQuery = supabase
        .from(table)
        .select('*')
        .range(offset, offset + limit - 1);

      // Aplicar filtros em ambas as queries
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          countQuery = countQuery.eq(key as any, value as any);
          dataQuery = dataQuery.eq(key as any, value as any);
        }
      });

      // Aplicar busca
      if (search?.term && search.field) {
        const searchFilter = `${String(search.field)}.ilike.%${search.term}%`;
        countQuery = countQuery.or(searchFilter);
        dataQuery = dataQuery.or(searchFilter);
      }

      // Aplicar ordenação
      if (orderBy) {
        dataQuery = dataQuery.order(orderBy.field, {
          ascending: orderBy.direction === 'asc'
        });
      }

      // Executar queries
      const [countResult, dataResult] = await Promise.all([
        countQuery,
        dataQuery
      ]);

      if (countResult.error) throw countResult.error;
      if (dataResult.error) throw dataResult.error;

      const total = countResult.count || 0;
      const data = (dataResult.data || []) as unknown as Row<K>[];

      return {
        data,
        total,
        page,
        limit,
        hasMore: offset + limit < total
      };
    },
  });
}

// ============================================================================
// VALIDATION ENHANCED MUTATION
// ============================================================================

/**
 * Hook para mutations com validação e constraints genéricos
 */
export function useValidatedMutation<
  K extends TableName,
  TInput extends Insert<K> = Insert<K>
>(
  table: K,
  validationSchema?: ValidationSchema<TInput>,
  options?: {
    onSuccess?: (data: Row<K>) => void;
    onError?: (error: Error) => void;
  }
) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (input: TInput): Promise<Row<K>> => {
      // Validação opcional
      if (validationSchema && !validationSchema.validate(input)) {
        const errors = validationSchema.errors.map(e => e.message).join(', ');
        throw new Error(`Dados inválidos: ${errors}`);
      }

      const { data, error } = await supabase
        .from(table)
        .insert(input as any)
        .select()
        .single();

      if (error) throw error;

      if (!data) {
        throw new Error('Erro ao criar registro: nenhum dado retornado.');
      }

      return data as unknown as Row<K>;
    },
    onSuccess: (data) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: [table] });

      toast({
        title: 'Sucesso',
        description: 'Registro criado com sucesso!',
      });

      options?.onSuccess?.(data);
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });

      options?.onError?.(error);
    },
  });
}

// ============================================================================
// REPOSITORY PATTERN IMPLEMENTATION
// ============================================================================

/**
 * Factory para criar um repository com constraints genéricos
 */
export function createRepository<K extends TableName>(
  table: K
): Repository<Row<K>> {
  return {
    async findById(id: string): Promise<Row<K> | null> {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('id' as any, id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
      }

      return data as unknown as Row<K> | null;
    },

    async findMany(options: {
      filters?: Partial<Row<K>>;
      orderBy?: { field: keyof Row<K>; direction: 'asc' | 'desc' };
      limit?: number;
      offset?: number;
    } = {}): Promise<ListResponse<Row<K>>> {
      const { filters = {}, orderBy, limit = 50, offset = 0 } = options;

      let query = supabase.from(table).select('*', { count: 'exact' });

      // Aplicar filtros
      Object.entries(filters).forEach(([key, value]) => {
        if (isNotNullish(value)) {
          query = query.eq(key as any, value as any);
        }
      });

      // Aplicar ordenação
      if (orderBy) {
        query = query.order(String(orderBy.field), {
          ascending: orderBy.direction === 'asc'
        });
      }

      // Aplicar paginação
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;
      if (error) throw error;

      return {
        data: (data || []) as unknown as Row<K>[],
        total: count || 0,
        page: Math.floor(offset / limit) + 1,
        limit,
        hasMore: offset + limit < (count || 0)
      };
    },

    async create(input: Insert<K>): Promise<Row<K>> {
      // Note: Repository interface is slightly loose on input type vs Insert<K>
      // We assume input is compatible.
      const { data, error } = await supabase
        .from(table)
        .insert(input as any)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('No data returned from create');

      return data as unknown as Row<K>;
    },

    async update(id: string, input: Update<K>): Promise<Row<K>> {
      const { data, error } = await supabase
        .from(table)
        .update({ ...input, updated_at: new Date().toISOString() } as any)
        .eq('id' as any, id)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('No data returned from update');

      return data as unknown as Row<K>;
    },

    async delete(id: string): Promise<void> {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id' as any, id);

      if (error) throw error;
    }
  };
}

// ============================================================================
// MAIN ENTITY ADVANCED HOOK
// ============================================================================

/**
 * Hook principal que combina todas as funcionalidades avançadas
 * Serve como interface unificada para os hooks especializados
 */
export function useEntityAdvanced<K extends TableName>(
  table: K,
  options?: {
    type?: 'searchable' | 'product' | 'customer' | 'sale' | 'paginated';
    searchTerm?: string;
    filters?: Partial<Row<K>>;
    pagination?: PaginationOptions<K>;
    productFilters?: { category?: string; inStock?: boolean };
    dateRange?: { start: Date; end: Date };
  }
) {
  const {
    type = 'searchable',
    searchTerm,
    filters,
    pagination,
    productFilters,
    dateRange
  } = options || {};

  // Hook para entidades pesquisáveis
  const searchableQuery = useSearchableEntity(table, searchTerm, { 
    enabled: type === 'searchable' 
  });

  // Hook para produtos
  const productQuery = useProductEntity(table, productFilters);

  // Hook para clientes  
  const customerQuery = useCustomerEntity(table, searchTerm);

  // Hook para vendas
  const saleQuery = useSaleEntity(table, dateRange);

  // Hook paginado
  // Ensure strict compatibility for options
  const paginatedQuery = usePaginatedEntity(table, pagination || {});

  // Repository
  const repository = createRepository<K>(table);

  // Hook para mutations validadas
  const mutation = useValidatedMutation<K>(table);

  // Retornar dados baseado no tipo
  switch (type) {
    case 'product':
      return {
        ...productQuery,
        repository,
        mutation,
        type: 'product' as const
      };
    case 'customer':
      return {
        ...customerQuery,
        repository,
        mutation,
        type: 'customer' as const
      };
    case 'sale':
      return {
        ...saleQuery,
        repository,
        mutation,
        type: 'sale' as const
      };
    case 'paginated':
      return {
        ...paginatedQuery,
        repository,
        mutation,
        type: 'paginated' as const
      };
    default:
      return {
        ...searchableQuery,
        repository,
        mutation,
        type: 'searchable' as const
      };
  }
}