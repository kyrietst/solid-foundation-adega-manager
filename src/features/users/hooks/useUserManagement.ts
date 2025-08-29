/**
 * Hook para gerenciamento geral de usuários
 * Extraído do UserManagement.tsx para separar responsabilidades
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/core/api/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { User, UserManagementState } from '@/features/users/components/types';

export const useUserManagement = (): UserManagementState => {
  const [error, setError] = useState<string | null>(null);

  // Use React Query for better caching and state management
  const {
    data: users = [],
    isLoading,
    refetch,
    error: queryError
  } = useQuery({
    queryKey: ['users', 'management'],
    queryFn: async (): Promise<User[]> => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching users:', error);
        throw error;
      }

      return data as User[];
    },
    enabled: true, // Always fetch when component mounts
  });

  // Set error state from React Query
  useEffect(() => {
    if (queryError) {
      setError(queryError.message);
    } else {
      setError(null);
    }
  }, [queryError]);

  const refreshUsers = async (): Promise<void> => {
    try {
      await refetch();
      setError(null);
    } catch (err: any) {
      console.error('Error refreshing users:', err);
      setError(err.message);
    }
  };

  return {
    users,
    isLoading,
    error,
    refreshUsers,
  };
};