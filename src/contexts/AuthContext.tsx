import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useAuthErrorHandler } from '@/hooks/auth/useAuthErrorHandler';
import { UserRole } from '@/types/supabase';

interface AuthContextType {
  user: User | null;
  userRole: UserRole | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  hasPermission: (requiredRole: UserRole | UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Configurar error handler de autenticação
  const authErrorHandler = useAuthErrorHandler({
    showToast: true,
    redirectToLogin: false, // Controlaremos isso manualmente
    clearStorage: true,
    retryAttempts: 1,
    onError: (error) => {
      console.error('Erro capturado pelo AuthErrorHandler:', error);
      setUser(null);
      setUserRole(null);
    }
  });

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserRole(session.user);
      }
      setLoading(false);
    });

    // Listen for changes on auth state (sign in, sign out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchUserRole(session.user);
      } else {
        setUserRole(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRole = async (currentUser: User) => {
    const fetchRoleOperation = async () => {
      // Se é o admin principal, define o role diretamente
      if (currentUser.email === 'adm@adega.com') {
        setUserRole('admin');
        return;
      }

      // First try to get from profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', currentUser.id)
        .single();

      if (profileError) {
        // If not found in profiles table, try users table
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('role')
          .eq('id', currentUser.id)
          .single();

        if (userError) {
          throw new Error('Could not fetch user role from any table');
        }

        setUserRole(userData.role);
      } else {
        setUserRole(profileData.role);
      }
    };

    // Usar o handler de erro de auth com retry
    const result = await authErrorHandler.retryWithAuth(
      fetchRoleOperation, 
      'busca de role do usuário',
      1 // 1 tentativa de retry
    );

    // Se não conseguiu buscar o role após retry, fazer logout limpo
    if (result === null) {
      console.log('Não foi possível buscar role do usuário, fazendo logout...');
      await signOut();
    }
  };

  const hasPermission = useCallback((requiredRole: UserRole | UserRole[]) => {
    console.log('Checking permission:', { 
      user: user?.email, 
      userRole, 
      requiredRole 
    });

    // Se não há usuário, não tem permissão
    if (!user) {
      return false;
    }

    // Se o email é adm@adega.com, tem todas as permissões
    if (user.email === 'adm@adega.com') {
      return true;
    }

    // Se não há role definido e não é o admin principal, não tem permissão
    if (!userRole) {
      return false;
    }

    // Define a hierarquia de roles
    const roleHierarchy = {
      admin: 3,
      employee: 2,
      delivery: 1
    };

    // Se requiredRole é um array, verifica se o userRole está incluído
    if (Array.isArray(requiredRole)) {
      const hasAccess = requiredRole.includes(userRole);
      console.log('Array permission check:', { hasAccess });
      return hasAccess;
    }

    // Se não é array, compara os níveis de hierarquia
    const hasAccess = roleHierarchy[userRole] >= roleHierarchy[requiredRole];
    console.log('Hierarchy permission check:', { hasAccess });
    return hasAccess;
  }, [user, userRole]);

  const signIn = useCallback(async (email: string, password: string) => {
    const signInOperation = async () => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Criar mensagens mais específicas para erros de auth
        let errorMessage = error.message;
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Email ou senha incorretos. Verifique suas credenciais.';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Email não confirmado. Verifique sua caixa de entrada.';
        } else if (error.message.includes('Too many requests')) {
          errorMessage = 'Muitas tentativas de login. Tente novamente em alguns minutos.';
        }

        toast({
          title: "Erro no Login",
          description: errorMessage,
          variant: "destructive",
        });
        throw error;
      }

      return data;
    };

    try {
      const result = await authErrorHandler.withAuthErrorHandling(
        signInOperation,
        'login do usuário'
      )();

      if (result) {
        toast({
          title: "Bem-vindo de volta!",
          description: "Login realizado com sucesso.",
        });

        navigate('/');
        return { error: null };
      } else {
        // Error foi tratado pelo authErrorHandler
        return { error: new Error('Login falhou') };
      }
    } catch (error) {
      // Erro não relacionado à auth, tratar normalmente
      console.error('Erro inesperado no signIn:', error);
      toast({
        title: "Erro Inesperado",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
      return { error: error as Error };
    }
  }, [toast, navigate, authErrorHandler]);

  const signOut = useCallback(async () => {
    const signOutOperation = async () => {
      console.log('Iniciando processo de logout...');
      
      // Primeiro limpar estado local
      setUser(null);
      setUserRole(null);
      
      // Depois fazer logout no Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Erro no supabase.auth.signOut:', error);
        throw error;
      }

      return true;
    };

    try {
      const result = await authErrorHandler.withAuthErrorHandling(
        signOutOperation,
        'logout do usuário'
      )();

      if (result) {
        // Limpar storage adicional
        await authErrorHandler.clearAuthState();

        toast({
          title: "Logout Realizado",
          description: "Você foi desconectado com sucesso.",
        });

        // Forçar navegação para auth
        setTimeout(() => {
          window.location.href = '/auth';
        }, 1000);
      }
    } catch (error) {
      // Em caso de erro, ainda tentar limpar estado e redirecionar
      console.error('Erro durante logout, forçando limpeza:', error);
      
      await authErrorHandler.clearAuthState();
      setUser(null);
      setUserRole(null);
      
      toast({
        title: "Logout Forçado",
        description: "Ocorreu um erro, mas você foi desconectado.",
        variant: "destructive",
      });

      window.location.href = '/auth';
    }
  }, [toast, authErrorHandler]);

  const value = useMemo(() => ({
    user,
    userRole,
    loading,
    signIn,
    signOut,
    hasPermission,
  }), [user, userRole, loading, signIn, signOut, hasPermission]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
