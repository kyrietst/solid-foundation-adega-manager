/**
 * Hook Genérico para Entidades - useEntity
 * 
 * Hook genérico para queries Supabase básicas que abstrai padrões comuns
 * identificados nos hooks existentes (use-crm.ts, use-product.ts, etc.)
 * 
 * Baseado na análise de ~15 hooks existentes no projeto
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

// ============================================================================
// TYPES E INTERFACES
// ============================================================================

type Tables = Database['public']['Tables'];
type TableName = keyof Tables;

// Extrai o tipo Row de uma tabela específica
type TableRow<T extends TableName> = Tables[T]['Row'];
type TableInsert<T extends TableName> = Tables[T]['Insert'];
type TableUpdate<T extends TableName> = Tables[T]['Update'];

/**
 * Opções para query de entidade única
 */
export interface UseEntityOptions<T extends TableName> extends Omit<UseQueryOptions<TableRow<T>>, 'queryKey' | 'queryFn'> {
  /** Nome da tabela no Supabase */
  table: T;
  /** ID da entidade para buscar */
  id?: string | null;
  /** Campos para selecionar (padrão: '*') */
  select?: string;
  /** Se a query deve ser executada */
  enabled?: boolean;
  /** Tempo de cache em ms (padrão: 5 minutos) */
  staleTime?: number;
}

/**
 * Opções para query de lista de entidades
 */
export interface UseEntityListOptions<T extends TableName> extends Omit<UseQueryOptions<TableRow<T>[]>, 'queryKey' | 'queryFn'> {
  /** Nome da tabela no Supabase */
  table: T;
  /** Campos para selecionar (padrão: '*') */
  select?: string;
  /** Filtros a aplicar */
  filters?: Record<string, unknown>;
  /** Ordenação */
  orderBy?: {
    column: string;
    ascending?: boolean;
  };
  /** Limite de resultados */
  limit?: number;
  /** Busca textual */
  search?: {
    columns: string[];
    term: string;
  };
  /** Se a query deve ser executada */
  enabled?: boolean;
  /** Tempo de cache em ms (padrão: 1 minuto) */
  staleTime?: number;
}

/**
 * Opções para mutations
 */
export interface UseEntityMutationOptions<T extends TableName, TData = unknown> {
  /** Nome da tabela no Supabase */
  table: T;
  /** Tipo de operação */
  operation: 'insert' | 'update' | 'upsert' | 'delete';
  /** Chaves de query para invalidar após sucesso */
  invalidateKeys?: string[][];
  /** Mensagem de sucesso personalizada */
  successMessage?: string;
  /** Callback personalizado de sucesso */
  onSuccess?: (data: TableRow<T>) => void;
  /** Callback personalizado de erro */
  onError?: (error: Error) => void;
  /** Opções adicionais do useMutation */
  mutationOptions?: Omit<UseMutationOptions<TableRow<T>, Error, TData>, 'mutationFn' | 'onSuccess' | 'onError'>;
}

// ============================================================================
// HOOK PRINCIPAL - useEntity
// ============================================================================

/**
 * Hook para buscar uma entidade específica por ID
 * Abstrai o padrão comum de .select().eq('id', id).single()
 */
export function useEntity<T extends TableName>(
  options: UseEntityOptions<T>
): ReturnType<typeof useQuery<TableRow<T>, Error>> {
  const {
    table,
    id,
    select = '*',
    enabled = true,
    staleTime = 5 * 60 * 1000, // 5 minutos
    ...queryOptions
  } = options;

  return useQuery({
    queryKey: [table, id],
    queryFn: async () => {
      if (!id) throw new Error('ID é obrigatório para useEntity');

      const { data, error } = await supabase
        .from(table)
        .select(select)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as TableRow<T>;
    },
    enabled: enabled && !!id,
    staleTime,
    ...queryOptions,
  });
}

// ============================================================================
// HOOK DE LISTA - useEntityList  
// ============================================================================

/**
 * Hook para buscar lista de entidades com filtros, ordenação e busca
 * Abstrai padrões comuns de queries de lista identificados
 */
export function useEntityList<T extends TableName>(
  options: UseEntityListOptions<T>
): ReturnType<typeof useQuery<TableRow<T>[], Error>> {
  const {
    table,
    select = '*',
    filters = {},
    orderBy,
    limit,
    search,
    enabled = true,
    staleTime = 60 * 1000, // 1 minuto
    ...queryOptions
  } = options;

  // Gera chave de query baseada nos parâmetros
  const queryKey = [
    table + '_list',
    { filters, orderBy, limit, search: search?.term ? { ...search } : undefined }
  ].filter(Boolean);

  return useQuery({
    queryKey,
    queryFn: async () => {
      let query = supabase
        .from(table)
        .select(select);

      // Aplica filtros
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          query = query.eq(key, value);
        }
      });

      // Aplica busca textual (ilike em múltiplas colunas)
      if (search?.term && search.columns.length > 0) {
        const searchFilters = search.columns
          .map(column => `${column}.ilike.%${search.term}%`)
          .join(',');
        query = query.or(searchFilters);
      }

      // Aplica ordenação
      if (orderBy) {
        query = query.order(orderBy.column, { ascending: orderBy.ascending ?? false });
      }

      // Aplica limite
      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      return (data as TableRow<T>[]) || [];
    },
    enabled,
    staleTime,
    ...queryOptions,
  });
}

// ============================================================================
// HOOK DE MUTATION - useEntityMutation
// ============================================================================

/**
 * Hook para mutations (create, update, delete) com padrões otimizados
 * Inclui invalidação automática de cache e toast notifications
 */
export function useEntityMutation<T extends TableName, TData = unknown>(
  options: UseEntityMutationOptions<T, TData>
) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const {
    table,
    operation,
    invalidateKeys = [[table], [table + '_list']],
    successMessage,
    onSuccess: customOnSuccess,
    onError: customOnError,
    mutationOptions = {},
  } = options;

  return useMutation({
    mutationFn: async (data: TData) => {
      let query;
      
      switch (operation) {
        case 'insert':
          query = supabase
            .from(table)
            .insert(data as TableInsert<T>)
            .select()
            .single();
          break;
          
        case 'update': {
          const { id, ...updateData } = data as { id: string; [key: string]: unknown };
          if (!id) throw new Error('ID é obrigatório para update');
          query = supabase
            .from(table)
            .update(updateData as TableUpdate<T>)
            .eq('id', id)
            .select()
            .single();
          break;
        }
          
        case 'upsert':
          query = supabase
            .from(table)
            .upsert(data as TableInsert<T>)
            .select()
            .single();
          break;
          
        case 'delete': {
          const deleteId = typeof data === 'string' ? data : (data as { id: string }).id;
          if (!deleteId) throw new Error('ID é obrigatório para delete');
          query = supabase
            .from(table)
            .delete()
            .eq('id', deleteId)
            .select()
            .single();
          break;
        }
          
        default:
          throw new Error(`Operação não suportada: ${operation}`);
      }

      const { data: result, error } = await query;
      if (error) throw error;
      
      return result as TableRow<T>;
    },
    
    onSuccess: (data) => {
      // Invalida queries relacionadas
      invalidateKeys.forEach(key => {
        queryClient.invalidateQueries({ queryKey: key });
      });

      // Toast de sucesso
      if (successMessage) {
        toast({
          title: "Sucesso",
          description: successMessage,
        });
      }

      // Callback personalizado
      customOnSuccess?.(data);
    },
    
    onError: (error: Error) => {
      console.error(`Erro na operação ${operation} em ${table}:`, error);
      
      toast({
        title: "Erro",
        description: error.message || `Erro ao ${operation === 'insert' ? 'criar' : 
                    operation === 'update' ? 'atualizar' : 
                    operation === 'delete' ? 'deletar' : 'salvar'} registro`,
        variant: "destructive",
      });

      // Callback personalizado
      customOnError?.(error);
    },
    
    ...mutationOptions,
  });
}

// ============================================================================
// HOOKS DE CONVENIÊNCIA
// ============================================================================

/**
 * Hook de conveniência para criar entidade
 */
export function useCreateEntity<T extends TableName>(
  table: T,
  options?: Partial<UseEntityMutationOptions<T, TableInsert<T>>>
) {
  return useEntityMutation({
    table,
    operation: 'insert',
    successMessage: `${table} criado com sucesso`,
    ...options,
  });
}

/**
 * Hook de conveniência para atualizar entidade
 */
export function useUpdateEntity<T extends TableName>(
  table: T,
  options?: Partial<UseEntityMutationOptions<T, TableUpdate<T> & { id: string }>>
) {
  return useEntityMutation({
    table,
    operation: 'update',
    successMessage: `${table} atualizado com sucesso`,
    ...options,
  });
}

/**
 * Hook de conveniência para deletar entidade
 */
export function useDeleteEntity<T extends TableName>(
  table: T,
  options?: Partial<UseEntityMutationOptions<T, string>>
) {
  return useEntityMutation({
    table,
    operation: 'delete',
    successMessage: `${table} deletado com sucesso`,
    ...options,
  });
}