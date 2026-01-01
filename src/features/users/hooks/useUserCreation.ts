/**
 * Hook para criação de usuários
 * Utiliza Edge Function 'create-user' para garantir integridade e segurança
 */

import { useState } from 'react';
import { supabase } from '@/core/api/supabase/client';
import { useToast } from '@/shared/hooks/common/use-toast';
import { UserCreationData, UserCreationOperations } from '@/features/users/components/types';
import { useQueryClient } from '@tanstack/react-query';

export const useUserCreation = (): UserCreationOperations => {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createUser = async (userData: UserCreationData): Promise<void> => {
    if (!userData.name || !userData.email || !userData.password) {
      const errorMsg = "Preencha todos os campos obrigatórios";
      setError(errorMsg);
      toast({
        title: "Erro",
        description: errorMsg,
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      // Invoke Edge Function
      const { data, error: funcError } = await supabase.functions.invoke('create-user', {
        body: {
          email: userData.email,
          password: userData.password,
          name: userData.name,
          role: userData.role || 'employee'
        }
      });

      if (funcError) {
        throw new Error(funcError.message || 'Falha na comunicação com o servidor');
      }

      // Check for functional error returned in body (success: false)
      if (data && data.success === false) {
        throw new Error(data.error || 'Erro ao criar usuário');
      }

      // Success
      toast({
        title: "Usuário criado!",
        description: `${userData.name} foi criado com sucesso`,
      });

      // Invalidate query to refresh list
      queryClient.invalidateQueries({ queryKey: ['users', 'management'] });

    } catch (error: any) {
      console.error('Error creating user:', error);
      const errorMsg = error.message || 'Erro desconhecido ao criar usuário';
      setError(errorMsg);
      toast({
        title: "Erro ao criar usuário",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const createFirstAdmin = async (): Promise<void> => {
    // Legacy function - kept for compatibility but should be deprecated or refactored if needed
    // Assuming this is only used for bootstrapping empty systems via other means
    setIsCreating(true);
    try {
        const { data, error } = await supabase.functions.invoke('create-user', {
            body: {
                email: 'adm@adm.com',
                password: 'adm123',
                name: 'Administrador Supremo',
                role: 'admin'
            }
        });

        if (error || (data && data.success === false)) {
            throw new Error(error?.message || data?.error || 'Failed to create admin');
        }

        toast({
            title: "Administrador criado!",
            description: "Conta de administrador supremo criada com sucesso.",
        });
        queryClient.invalidateQueries({ queryKey: ['users', 'management'] });
    } catch (error: any) {
        toast({
            title: "Erro",
            description: error.message,
            variant: "destructive"
        });
    } finally {
        setIsCreating(false);
    }
  };

  return {
    createUser,
    createFirstAdmin,
    isCreating,
    error,
  };
};