/**
 * Hook para exclusão segura de usuários
 * Gerencia remoção completa de usuários do sistema
 */

import { useState } from 'react';
import { supabase } from '@/core/api/supabase/client';
import { useToast } from '@/shared/hooks/common/use-toast';
import { useAuth } from '@/app/providers/AuthContext';

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
      // 1. Buscar dados do usuário antes de excluir (para logs)
      const { data: userToDelete, error: fetchError } = await supabase
        .from('users')
        .select('email, full_name')
        .eq('id', userId)
        .single();

      if (fetchError) {
        console.error('Error fetching user to delete:', fetchError);
        throw new Error('Usuário não encontrado');
      }

      // 2. Excluir da tabela profiles primeiro (devido a foreign keys)
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (profileError) {
        console.error('Error deleting from profiles:', profileError);
        throw new Error('Erro ao remover perfil do usuário');
      }

      // 3. Excluir da tabela users
      const { error: userError } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (userError) {
        console.error('Error deleting from users:', userError);
        throw new Error('Erro ao remover dados do usuário');
      }

      // 4. Auth.users permanece (sem acesso admin) - comportamento esperado

      toast({
        title: "Usuário removido",
        description: `${userToDelete.full_name || userToDelete.email} foi removido com sucesso`,
      });

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