/**
 * Hook para exclusão segura de usuários
 * Gerencia remoção completa de usuários do sistema via Edge Function
 */

import { useState } from 'react';
import { supabase } from '@/core/api/supabase/client';
import { useToast } from '@/shared/hooks/common/use-toast';
import { useAuth } from '@/app/providers/AuthContext';
import { useQueryClient } from '@tanstack/react-query';

interface UseUserDeletionReturn {
  deleteUser: (userId: string) => Promise<boolean>;
  isDeleting: boolean;
  error: string | null;
}

export const useUserDeletion = (): UseUserDeletionReturn => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();

  const deleteUser = async (userId: string): Promise<boolean> => {
    // Validações de segurança
    if (!userId) {
      const errorMsg = "ID do usuário é obrigatório";
      setError(errorMsg);
      toast({
        title: "Erro",
        description: errorMsg,
        variant: "destructive",
      });
      return false;
    }

    // Impedir auto-exclusão
    if (currentUser?.id === userId) {
      const errorMsg = "Você não pode excluir sua própria conta";
      setError(errorMsg);
      toast({
        title: "Erro",
        description: errorMsg,
        variant: "destructive",
      });
      return false;
    }

    setIsDeleting(true);
    setError(null);

    try {
      // Invocar Edge Function para deleção segura (Auth + Profile)
      const { data, error: funcError } = await supabase.functions.invoke('delete-user', {
        body: { userId }
      });

      if (funcError) {
        throw new Error(funcError.message || 'Falha na comunicação com o servidor');
      }

      // Verificar erro retornado no body (embora delete-user atual retorne 400 no status se falhar, bom garantir)
      if (data && data.error) {
        throw new Error(data.error);
      }

      toast({
        title: "Usuário removido",
        description: "Usuário foi removido com sucesso",
      });

      // Invalidar cache para atualizar lista
      queryClient.invalidateQueries({ queryKey: ['users', 'management'] });

      return true;

    } catch (error: any) {
      console.error('Error deleting user:', error);
      const errorMessage = error.message || 'Erro inesperado ao excluir usuário';
      setError(errorMessage);
      
      toast({
        title: "Erro ao excluir usuário",
        description: errorMessage,
        variant: "destructive",
      });
      
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    deleteUser,
    isDeleting,
    error,
  };
};