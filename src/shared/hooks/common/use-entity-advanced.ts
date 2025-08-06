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
  hasId,
  hasName,
  hasTimestamps,
  isNotNullish
} from '@/types/generic.types';

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
export function useSearchableEntity<T extends SearchableByName<T>>(
  table: string,
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
export function useProductEntity<T extends ProductLike>(
  table: string,
  filters?: { category?: string; inStock?: boolean }
) {
  return useQuery({
    queryKey: [table, 'products', filters],
    queryFn: async (): Promise<T[]> => {
      let query = supabase.from(table).select('*');
      
      if (filters?.category) {
        query = query.eq('category', filters.category);
      }
      
      if (filters?.inStock) {
        query = query.filter('stock_quantity', 'gt', 0);
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
export function useCustomerEntity<T extends CustomerLike>(
  table: string,
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
export function useSaleEntity<T extends SaleLike>(
  table: string,
  dateRange?: { start: Date; end: Date }
) {
  return useQuery({
    queryKey: [table, 'sales', dateRange],
    queryFn: async (): Promise<T[]> => {
      let query = supabase.from(table).select('*');
      
      if (dateRange) {
        query = query
          .gte('created_at', dateRange.start.toISOString())
          .lte('created_at', dateRange.end.toISOString());
      }
      
      query = query.order('created_at', { ascending: false });
      
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
export function usePaginatedEntity<T extends BaseEntity>(
  table: string,
  options: PaginationOptions & OrderableEntity<T> & {
    filters?: Record<string, unknown>;
    search?: { field: keyof T; term: string };
  } = {}
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
          countQuery = countQuery.eq(key, value);
          dataQuery = dataQuery.eq(key, value);
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
      const data = (dataResult.data || []).filter(hasId) as T[];

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
  TInput = Omit<TEntity, 'id' | 'created_at' | 'updated_at'>
>(
  table: string,
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
        .insert(input as any)
        .select()
        .single();

      if (error) throw error;
      
      if (!hasId(data)) {
        throw new Error('Entidade criada não possui ID válido');
      }

      return data as TEntity;
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
export function createRepository<T extends BaseEntity>(
  table: string
): Repository<T> {
  return {
    async findById(id: string): Promise<T | null> {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
      }

      return hasId(data) ? (data as T) : null;
    },

    async findMany(options = {}): Promise<ListResponse<T>> {
      const { filters = {}, orderBy, limit = 50, offset = 0 } = options;

      let query = supabase.from(table).select('*', { count: 'exact' });

      // Aplicar filtros
      Object.entries(filters).forEach(([key, value]) => {
        if (isNotNullish(value)) {
          query = query.eq(key, value);
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

      const validData = (data || []).filter(hasId) as T[];

      return {
        data: validData,
        total: count || 0,
        page: Math.floor(offset / limit) + 1,
        limit,
        hasMore: offset + limit < (count || 0)
      };
    },

    async create(input): Promise<T> {
      const { data, error } = await supabase
        .from(table)
        .insert(input as any)
        .select()
        .single();

      if (error) throw error;
      
      if (!hasId(data)) {
        throw new Error('Entidade criada não possui ID válido');
      }

      return data as T;
    },

    async update(id: string, input): Promise<T> {
      const { data, error } = await supabase
        .from(table)
        .update({ ...input, updated_at: new Date().toISOString() } as any)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      if (!hasId(data)) {
        throw new Error('Entidade atualizada não possui ID válido');
      }

      return data as T;
    },

    async delete(id: string): Promise<void> {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);

      if (error) throw error;
    }
  };
}