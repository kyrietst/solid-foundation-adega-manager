/**
 * Hook para criação de usuários
 * Extraído do UserManagement.tsx para separar responsabilidades
 */

import { useState } from 'react';
import { supabase } from '@/core/api/supabase/client';
import { useToast } from '@/shared/hooks/common/use-toast';
import { UserCreationData, UserCreationOperations } from '@/features/users/components/types';

export const useUserCreation = (): UserCreationOperations => {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

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
      // Store current session before creating new user
      const currentSession = await supabase.auth.getSession();
      
      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
      });

      if (authError) {
        throw new Error(authError.message);
      }

      if (authData.user) {
        let hasError = false;

        // 2. Insert into users table
        const { error: userError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            email: authData.user.email,
            full_name: userData.name,
            role: userData.role
          });

        if (userError) {
          console.error('Error creating user record:', userError);
          hasError = true;
        }

        // 3. Insert into profiles table
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            email: authData.user.email,
            name: userData.name,
            role: userData.role
          });

        if (profileError) {
          console.error('Error creating user profile:', profileError);
          hasError = true;
        }

        // 4. Restore admin session
        if (currentSession.data.session) {
          const { error: signInError } = await supabase.auth.setSession(currentSession.data.session);
          if (signInError) {
            console.error('Error restoring admin session:', signInError);
            // Force reload to ensure admin is logged in
            window.location.reload();
            return;
          }
        }

        // Only show success message if both operations succeeded
        if (!hasError) {
          toast({
            title: "Usuário criado!",
            description: `${userData.name} foi criado com sucesso`,
          });
        } else {
          throw new Error('Erro ao criar registros do usuário');
        }
      }
    } catch (error: any) {
      console.error('Error creating user:', error);
      setError(error.message);
      toast({
        title: "Erro ao criar usuário",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const createFirstAdmin = async (): Promise<void> => {
    setIsCreating(true);
    setError(null);
    
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: 'adm@adm.com',
        password: 'adm123',
      });

      if (authError) {
        throw new Error(authError.message);
      }

      if (authData.user) {
        // Insert into users table
        const { error: userError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            email: authData.user.email,
            full_name: 'Administrador Supremo',
            role: 'admin'
          });

        if (userError) {
          console.error('Error creating admin user:', userError);
          throw new Error('Database error saving new user');
        }

        // Insert into profiles table
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            email: authData.user.email,
            name: 'Administrador Supremo',
            role: 'admin'
          });

        if (profileError) {
          console.error('Error creating admin profile:', profileError);
          throw new Error(profileError.message);
        }
      }

      toast({
        title: "Administrador criado!",
        description: "Conta de administrador supremo criada com sucesso. Email: adm@adm.com, Senha: adm123",
      });

    } catch (error: any) {
      console.error('Error creating first admin:', error);
      setError(error.message);
      toast({
        title: "Erro ao criar administrador",
        description: error.message,
        variant: "destructive",
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