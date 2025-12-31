/* eslint-disable react-hooks/exhaustive-deps */
/**
 * useSupabaseQuery - Generic Supabase Query Hook with Context7 Patterns
 * Enhanced TanStack Query integration with type-safe Supabase operations
 * Follows Context7 best practices for error handling and async operations
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { supabase } from '@/core/api/supabase/client';
import { PostgrestSingleResponse, PostgrestResponse } from '@supabase/supabase-js';
import { Database } from '@/core/types/database.types';

// ============================================================================
// STRICT DATABASE TYPING HELPER
// ============================================================================

type TableName = keyof Database['public']['Tables'];
type Row<K extends TableName> = Database['public']['Tables'][K]['Row'];
type Insert<K extends TableName> = Database['public']['Tables'][K]['Insert'];
type Update<K extends TableName> = Database['public']['Tables'][K]['Update'];
type Column<K extends TableName> = keyof Row<K> & string;

// Context7 Pattern: Custom error classes for better error handling
export class SupabaseQueryError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: string,
    public hint?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'SupabaseQueryError';
  }
}

export class SupabaseMutationError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: string,
    public hint?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'SupabaseMutationError';
  }
}

// Context7 Pattern: Type-safe query result with discriminated unions
export type QueryResult<T> =
  | { success: true; data: T; error: null }
  | { success: false; data: null; error: SupabaseQueryError }
  | { success: false; data: null; error: null }; // Loading or Initial state

export type MutationResult<T> =
  | { success: true; data: T; error: null }
  | { success: false; data: null; error: SupabaseMutationError }
  | { success: false; data: null; error: null }; // Loading or Initial state

// Context7 Pattern: Query configuration interface
export interface SupabaseQueryConfig<T> {
  queryKey: readonly unknown[];
  queryFn: () => PromiseLike<PostgrestResponse<T> | PostgrestSingleResponse<T>>;
  enabled?: boolean;
  staleTime?: number;
  cacheTime?: number;
  retry?: boolean | number;
  refetchOnWindowFocus?: boolean;
  select?: (data: T[]) => any;
}

// Context7 Pattern: Mutation configuration interface
export interface SupabaseMutationConfig<TData, TVariables> {
  mutationFn: (variables: TVariables) => PromiseLike<PostgrestResponse<TData> | PostgrestSingleResponse<TData>>;
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: SupabaseMutationError, variables: TVariables) => void;
  invalidateQueries?: string[][];
}

// Context7 Pattern: Generic hook for TSX compatibility
export function useSupabaseQuery<T>(
  config: SupabaseQueryConfig<T>,
  options?: Omit<UseQueryOptions<T[], SupabaseQueryError>, 'queryKey' | 'queryFn' | 'select'>
) {
  // Context7 Pattern: Memoize error transformation
  const transformError = useCallback((error: any): SupabaseQueryError => {
    if (error instanceof SupabaseQueryError) return error;

    return new SupabaseQueryError(
      error?.message || 'Erro na consulta Supabase',
      error?.code,
      error?.details,
      error?.hint,
      error?.statusCode
    );
  }, []);

  // Context7 Pattern: Memoize query function with error handling
  const queryFn = useCallback(async (): Promise<T[]> => {
    try {
      const response = await config.queryFn();

      if (response.error) {
        throw transformError(response.error);
      }

      // Handle single response vs array response
      if ('data' in response && response.data !== null) {
        return Array.isArray(response.data) ? response.data : [response.data];
      }

      return [];
    } catch (error) {
      throw transformError(error);
    }
  }, [config.queryFn, transformError]);

  // Context7 Pattern: Combine default options with user options
  const queryOptions = useMemo(() => ({
    enabled: config.enabled ?? true,
    staleTime: config.staleTime ?? 5 * 60 * 1000, // 5 minutes
    cacheTime: config.cacheTime ?? 10 * 60 * 1000, // 10 minutes
    retry: config.retry ?? 3,
    refetchOnWindowFocus: config.refetchOnWindowFocus ?? false,
    select: config.select,
    ...options
  }), [config, options]);

  const query = useQuery({
    queryKey: config.queryKey,
    queryFn,
    ...queryOptions
  });

  // Context7 Pattern: Enhanced return with result pattern
  const result = useMemo<QueryResult<T[]>>(() => {
    if (query.isError && query.error) {
      return {
        success: false,
        data: null,
        error: query.error
      };
    }

    if (query.isSuccess && query.data) {
      return {
        success: true,
        data: query.data,
        error: null
      };
    }

    // Loading or initial state
    return {
      success: false,
      data: null,
      error: null
    }; // Temporary for loading states
  }, [query.isError, query.isSuccess, query.data, query.error]);

  return {
    ...query,
    result,
    // Context7 Pattern: Type-safe convenience getters
    isLoading: query.isLoading,
    isError: query.isError,
    isSuccess: query.isSuccess,
    data: query.data || [],
    error: query.error
  } as const;
}

// Context7 Pattern: Generic mutation hook
export function useSupabaseMutation<TData, TVariables = void>(
  config: SupabaseMutationConfig<TData, TVariables>,
  options?: Omit<UseMutationOptions<TData, SupabaseMutationError, TVariables>, 'mutationFn' | 'onSuccess' | 'onError'>
) {
  const queryClient = useQueryClient();

  // Context7 Pattern: Memoize error transformation
  const transformError = useCallback((error: any): SupabaseMutationError => {
    if (error instanceof SupabaseMutationError) return error;

    return new SupabaseMutationError(
      error?.message || 'Erro na mutação Supabase',
      error?.code,
      error?.details,
      error?.hint,
      error?.statusCode
    );
  }, []);

  // Context7 Pattern: Memoize mutation function with error handling
  const mutationFn = useCallback(async (variables: TVariables): Promise<TData> => {
    try {
      const response = await config.mutationFn(variables);

      if (response.error) {
        throw transformError(response.error);
      }

      // Handle single response vs array response
      if ('data' in response && response.data !== null) {
        return Array.isArray(response.data) ? response.data[0] : response.data;
      }

      throw new SupabaseMutationError('Dados não retornados pela mutação');
    } catch (error) {
      throw transformError(error);
    }
  }, [config.mutationFn, transformError]);

  // Context7 Pattern: Enhanced success handler with query invalidation
  const onSuccess = useCallback((data: TData, variables: TVariables) => {
    // Invalidate related queries
    if (config.invalidateQueries) {
      config.invalidateQueries.forEach(queryKey => {
        queryClient.invalidateQueries({ queryKey });
      });
    }

    // Call user-provided success handler
    if (config.onSuccess) {
      config.onSuccess(data, variables);
    }
  }, [config.onSuccess, config.invalidateQueries, queryClient]);

  // Context7 Pattern: Enhanced error handler
  const onError = useCallback((error: SupabaseMutationError, variables: TVariables) => {
    console.error('Supabase Mutation Error:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
      statusCode: error.statusCode,
      variables
    });

    if (config.onError) {
      config.onError(error, variables);
    }
  }, [config.onError]);

  const mutation = useMutation<TData, SupabaseMutationError, TVariables>({
    mutationFn,
    ...options,
    onSuccess,
    onError
  });

  // Context7 Pattern: Enhanced return with result pattern
  const result = useMemo<MutationResult<TData>>(() => {
    if (mutation.isError && mutation.error) {
      return {
        success: false,
        data: null,
        error: mutation.error
      };
    }

    if (mutation.isSuccess && mutation.data) {
      return {
        success: true,
        data: mutation.data,
        error: null
      };
    }

    // Loading or initial state
    return {
      success: false,
      data: null,
      error: null
    } as any; // Temporary for loading states
  }, [mutation.isError, mutation.isSuccess, mutation.data, mutation.error]);

  return {
    ...mutation,
    result,
    // Context7 Pattern: Type-safe convenience methods
    mutateAsync: mutation.mutateAsync,
    mutate: mutation.mutate,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    isSuccess: mutation.isSuccess,
    data: mutation.data,
    error: mutation.error
  } as const;
}

// Context7 Pattern: Specialized hooks for common Supabase operations

// Generic CRUD operations hook
// REFACTORED: Now strictly constrained to valid table names and types
export function useSupabaseCRUD<K extends TableName>(tableName: K) {
  const queryClient = useQueryClient();

  // Context7 Pattern: Memoized query configurations
  const queries = useMemo(() => ({
    // List all records
    list: (filters?: Partial<Row<K>>) => ({
      queryKey: ['supabase', tableName, 'list', filters],
      queryFn: async () => {
        let query = supabase.from(tableName).select('*');

        if (filters) {
          Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
              // Valid usage: key is from Partial<Row<K>>, query.eq accepts strictly typed columns
              query = query.eq(key as Column<K>, value);
            }
          });
        }

        return (await query) as any;
      }
    }),

    // Get single record by ID
    single: (id: string) => ({
      queryKey: ['supabase', tableName, 'single', id],
      queryFn: async () => (await supabase.from(tableName).select('*').eq('id' as any, id).single()) as any
    })
  }), [tableName]);

  // Context7 Pattern: Memoized mutation configurations
  const mutations = useMemo(() => ({
    create: {
      mutationFn: async (variables: Insert<K>) =>
        (await supabase.from(tableName).insert(variables as any).select().single()) as any, // insert types can be complex, explicit cast often needed safely
      invalidateQueries: [['supabase', tableName, 'list']]
    },

    // Update existing record
    update: (id: string) => ({
      mutationFn: async (variables: Update<K>) =>
        (await supabase.from(tableName).update(variables as any).eq('id' as any, id).select().single()) as any,
      invalidateQueries: [
        ['supabase', tableName, 'list'],
        ['supabase', tableName, 'single', id]
      ]
    }),

    // Delete record
    delete: (id: string) => ({
      mutationFn: async () => (await supabase.from(tableName).delete().eq('id' as any, id)) as any,
      invalidateQueries: [['supabase', tableName, 'list']]
    })
  }), [tableName]);

  return {
    queries,
    mutations,
    // Context7 Pattern: Pre-configured hooks
    useList: (filters?: Partial<Row<K>>) => useSupabaseQuery<Row<K>>(queries.list(filters)),
    useSingle: (id: string) => useSupabaseQuery<Row<K>>(queries.single(id)),
    useCreate: () => useSupabaseMutation<Row<K>, Insert<K>>(mutations.create),
    useUpdate: (id: string) => useSupabaseMutation<Row<K>, Update<K>>(mutations.update(id)),
    useDelete: (id: string) => useSupabaseMutation<null, void>(mutations.delete(id))
  };
}

// Context7 Pattern: Table-specific hooks for the application
export const useProductsQuery = () => useSupabaseCRUD('products');
export const useCustomersQuery = () => useSupabaseCRUD('customers');
export const useSuppliersQuery = () => useSupabaseCRUD('suppliers');
export const useSalesQuery = () => useSupabaseCRUD('sales');

export default { useSupabaseQuery, useSupabaseMutation, useSupabaseCRUD };