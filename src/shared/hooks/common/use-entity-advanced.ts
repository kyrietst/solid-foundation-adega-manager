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
  WithId,
  BaseEntity,
  AuditableEntity,
  ListResponse,
  ProductLike,
  CustomerLike,
  SaleLike,
  Repository,
  ValidationSchema,
} from '@/core/types/generic.types';

import {
  hasId,
  hasName,
  hasTimestamps,
  isNotNullish
} from '@/core/types/generic.types';
import { Database, Tables, TablesInsert, TablesUpdate } from '@/core/types/database.types';

// Helper type for valid table names
type TableName = keyof Database['public']['Tables'];

// ============================================================================
// ADVANCED GENERIC CONSTRAINTS
// ============================================================================

// Constraint para entidades que podem ser pesquisadas por nome
type SearchableByName<T> = T & WithId & { name: string };

// Constraint para entidades com status
type WithStatus<T, TStatus extends string> = T & { status: TStatus };

// Constraint para entidades paginadas
interface PaginationOptions {
  page?: number;
  limit?: number;
  offset?: number;
}

// Constraint para entidades que podem ser ordenadas
interface OrderableEntity<T> {
  orderBy?: {
    field: keyof T;
    direction: 'asc' | 'desc';
  };
}

// ============================================================================
// SPECIALIZED HOOKS WITH CONSTRAINTS
// ============================================================================

/**
 * Hook para entidades com nome pesquisável
 * Aplica constraint que garante existência do campo 'name'
 */
export function useSearchableEntity<T extends SearchableByName<T>, K extends TableName = any>(
  table: K,
  searchTerm?: string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: [table, 'searchable', searchTerm],
    queryFn: async (): Promise<T[]> => {
      let query = supabase.from(table).select('*');

      if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Type guard: garante que todos os itens têm ID e nome
      const validData = (data || []).filter((item): item is T =>
        hasId(item) && hasName(item)
      ) as T[];

      return validData;
    },
    enabled: options?.enabled ?? true,
  });
}

/**
 * Hook para produtos com constraint ProductLike
 * Garante que a entidade tem name, price, category, stock_quantity
 */
export function useProductEntity<T extends ProductLike, K extends TableName = any>(
  table: K,
  filters?: { category?: string; inStock?: boolean }
) {
  return useQuery({
    queryKey: [table, 'products', filters],
    queryFn: async (): Promise<T[]> => {
      let query = supabase.from(table).select('*');

      if (filters?.category) {
        query = query.eq('category' as any, filters.category);
      }

      if (filters?.inStock) {
        query = query.filter('stock_quantity' as any, 'gt', 0);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Type guard específico para produtos
      const validProducts = (data || []).filter((item): item is T => {
        return hasId(item) &&
          hasName(item) &&
          'price' in item &&
          'category' in item &&
          'stock_quantity' in item &&
          typeof item.price === 'number' &&
          typeof item.category === 'string' &&
          typeof item.stock_quantity === 'number';
      }) as T[];

      return validProducts;
    },
  });
}

/**
 * Hook para clientes com constraint CustomerLike
 * Garante que a entidade tem name e campos opcionais de contato
 */
export function useCustomerEntity<T extends CustomerLike, K extends TableName = any>(
  table: K,
  searchTerm?: string
) {
  return useQuery({
    queryKey: [table, 'customers', searchTerm],
    queryFn: async (): Promise<T[]> => {
      let query = supabase.from(table).select('*');

      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Type guard específico para clientes
      const validCustomers = (data || []).filter((item): item is T => {
        return hasId(item) && hasName(item);
      }) as T[];

      return validCustomers;
    },
  });
}

/**
 * Hook para vendas com constraint SaleLike
 * Garante que a entidade tem customer_id, total_amount, payment_method
 */
export function useSaleEntity<T extends SaleLike, K extends TableName = any>(
  table: K,
  dateRange?: { start: Date; end: Date }
) {
  return useQuery({
    queryKey: [table, 'sales', dateRange],
    queryFn: async (): Promise<T[]> => {
      let query = supabase.from(table).select('*');

      if (dateRange) {
        query = query
          .gte('created_at' as any, dateRange.start.toISOString())
          .lte('created_at' as any, dateRange.end.toISOString());
      }

      query = query.order('created_at' as any, { ascending: false });

      const { data, error } = await query;
      if (error) throw error;

      // Type guard específico para vendas
      const validSales = (data || []).filter((item): item is T => {
        return hasId(item) &&
          hasTimestamps(item) &&
          'total_amount' in item &&
          'payment_method' in item &&
          typeof item.total_amount === 'number' &&
          typeof item.payment_method === 'string';
      }) as T[];

      return validSales;
    },
  });
}

// ============================================================================
// ADVANCED PAGINATION HOOK
// ============================================================================

/**
 * Hook para entidades com paginação avançada e type safety
 */
export function usePaginatedEntity<T extends BaseEntity, K extends TableName = any>(
  table: K,
  options: PaginationOptions & OrderableEntity<T> & {
    filters?: Record<string, unknown>;
    search?: { field: keyof T; term: string };
  } = {} as any
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
    queryFn: async (): Promise<ListResponse<T>> => {
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
        if (isNotNullish(value)) {
          countQuery = countQuery.eq(key as any, value);
          dataQuery = dataQuery.eq(key as any, value);
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
        dataQuery = dataQuery.order(String(orderBy.field), {
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
      const data = (dataResult.data || []).filter(hasId) as unknown as T[];

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
  TEntity extends BaseEntity,
  K extends TableName,
  TInput extends TablesInsert<K> = TablesInsert<K>
>(
  table: K,
  validationSchema?: ValidationSchema<TInput>,
  options?: {
    onSuccess?: (data: TEntity) => void;
    onError?: (error: Error) => void;
  }
) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (input: TInput): Promise<TEntity> => {
      // Validação opcional
      if (validationSchema && !validationSchema.validate(input)) {
        const errors = validationSchema.errors.map(e => e.message).join(', ');
        throw new Error(`Dados inválidos: ${errors}`);
      }

      const { data, error } = await supabase
        .from(table)
        .insert(input)
        .select()
        .single();

      if (error) throw error;

      if (!hasId(data)) {
        throw new Error('Entidade criada não possui ID válido');
      }

      return data as unknown as TEntity;
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
export function createRepository<T extends BaseEntity, K extends TableName>(
  table: K
): Repository<T> {
  return {
    async findById(id: string): Promise<T | null> {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('id' as any, id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
      }

      return hasId(data) ? (data as unknown as T) : null;
    },

    async findMany(options: {
      filters?: Record<string, unknown>;
      orderBy?: { field: keyof T; direction: 'asc' | 'desc' };
      limit?: number;
      offset?: number;
    } = {}): Promise<ListResponse<T>> {
      const { filters = {}, orderBy, limit = 50, offset = 0 } = options;

      let query = supabase.from(table).select('*', { count: 'exact' });

      // Aplicar filtros
      Object.entries(filters).forEach(([key, value]) => {
        if (isNotNullish(value)) {
          query = query.eq(key as any, value);
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

      const validData = (data || []).filter(hasId) as unknown as T[];

      return {
        data: validData,
        total: count || 0,
        page: Math.floor(offset / limit) + 1,
        limit,
        hasMore: offset + limit < (count || 0)
      };
    },

    // Note: strict typing here requires TInput to match TablesInsert<K>
    async create(input): Promise<T> {
      // We cast input to TablesInsert<K> because Repository interface is generic
      // but we know 'table' matches 'K'
      const { data, error } = await supabase
        .from(table)
        .insert(input as any) // Keeping explicit cast due to Repository interface constraints
        .select()
        .single();

      if (error) throw error;

      if (!hasId(data)) {
        throw new Error('Entidade criada não possui ID válido');
      }

      return data as unknown as T;
    },

    async update(id: string, input): Promise<T> {
      const { data, error } = await supabase
        .from(table)
        .update({ ...input, updated_at: new Date().toISOString() } as any)
        .eq('id' as any, id)
        .select()
        .single();

      if (error) throw error;

      if (!hasId(data)) {
        throw new Error('Entidade atualizada não possui ID válido');
      }

      return data as unknown as T;
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
export function useEntityAdvanced<T extends BaseEntity, K extends TableName = any>(
  table: K,
  options?: {
    type?: 'searchable' | 'product' | 'customer' | 'sale' | 'paginated';
    searchTerm?: string;
    filters?: Record<string, unknown>;
    pagination?: PaginationOptions & OrderableEntity<T>;
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
  const searchableQuery = useQuery({
    queryKey: [table, 'searchable-advanced', searchTerm],
    queryFn: async (): Promise<T[]> => {
      let query = supabase.from(table).select('*');

      if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      const validData = (data || []).filter(hasId) as unknown as T[];
      return validData;
    },
    enabled: type === 'searchable',
  });

  // Hook para produtos
  const productQuery = useProductEntity(table, productFilters);

  // Hook para clientes  
  const customerQuery = useCustomerEntity(table, searchTerm);

  // Hook para vendas
  const saleQuery = useSaleEntity(table, dateRange);

  // Hook paginado
  const paginatedQuery = usePaginatedEntity(table, pagination);

  // Repository
  const repository = createRepository<T, K>(table);

  // Hook para mutations validadas
  const mutation = useValidatedMutation<T, K>(table);

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