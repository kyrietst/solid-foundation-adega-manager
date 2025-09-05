import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, clearChromeAuthData } from '@/core/api/supabase/client';
import { useToast } from '@/shared/hooks/common/use-toast';
import { useNavigate } from 'react-router-dom';
import { useAuthErrorHandler } from '@/shared/hooks/auth/useAuthErrorHandler';
import { UserRole } from '@/core/types/supabase';

interface AuthContextType {
  user: User | null;
  userRole: UserRole | null;
  loading: boolean;
  hasTemporaryPassword: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  hasPermission: (requiredRole: UserRole | UserRole[]) => boolean;
  onTemporaryPasswordChanged: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  console.log('🔐 AuthProvider - Inicializando provider');
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasTemporaryPassword, setHasTemporaryPassword] = useState(false);
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

  const signOut = useCallback(async () => {
    const signOutOperation = async () => {
      
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

  const fetchUserProfile = useCallback(async (currentUser: User) => {
    const fetchProfileOperation = async () => {
      // Se é o admin principal, define o role diretamente
      if (currentUser.email === 'adm@adega.com') {
        setUserRole('admin');
        setHasTemporaryPassword(false);
        return;
      }

      // First try to get from profiles table
      console.log('🔍 AuthProvider - Tentando buscar perfil para usuário ID:', currentUser.id);
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role, is_temporary_password')
        .eq('id', currentUser.id)
        .single();

      console.log('📊 AuthProvider - Resultado profiles:', { profileData, profileError });

      if (profileError) {
        console.log('⚠️ AuthProvider - Erro na tabela profiles, tentando users table:', profileError);
        // If not found in profiles table, try users table
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('role')
          .eq('id', currentUser.id)
          .single();

        console.log('📊 AuthProvider - Resultado users:', { userData, userError });

        if (userError) {
          console.error('💥 AuthProvider - Falha em ambas as tabelas:', { profileError, userError });
          throw new Error(`Could not fetch user role from any table. Profiles error: ${profileError.message}, Users error: ${userError.message}`);
        }

        setUserRole(userData.role);
        setHasTemporaryPassword(false); // Users table doesn't have temp password field
      } else {
        setUserRole(profileData.role);
        setHasTemporaryPassword(profileData.is_temporary_password || false);
      }
    };

    // Usar o handler de erro de auth com retry
    const result = await authErrorHandler.retryWithAuth(
      fetchProfileOperation, 
      'busca de perfil do usuário',
      1 // 1 tentativa de retry
    );

    // Se não conseguiu buscar o role após retry, fazer logout limpo
    if (result === null) {
      await signOut();
    }
  }, [authErrorHandler, signOut]);

  const onTemporaryPasswordChanged = useCallback(async () => {
    if (!user) return;
    
    // Refresh user profile to update temporary password status
    await fetchUserProfile(user);
  }, [user, fetchUserProfile]);

  useEffect(() => {
    console.log('🔍 AuthProvider - useEffect iniciado, buscando sessão...');
    
    // Timeout de segurança para evitar loading infinito
    const timeoutId = setTimeout(() => {
      console.warn('⏰ AuthProvider - Timeout de 10s atingido, forçando loading=false');
      console.log('🔧 AuthProvider - Tentando limpeza de estado e redirecionamento...');
      setUser(null);
      setUserRole(null);
      setLoading(false);
      // If we timeout and there's no user, redirect to auth page
      if (!user) {
        console.log('🚪 AuthProvider - Redirecionando para /auth devido ao timeout');
        window.location.href = '/auth';
      }
    }, 10000);
    
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      console.log('📡 AuthProvider - Resposta getSession:', { 
        hasSession: !!session, 
        email: session?.user?.email || 'sem usuário',
        userId: session?.user?.id || 'sem ID',
        error: error
      });
      clearTimeout(timeoutId);
      setUser(session?.user ?? null);
      if (session?.user) {
        console.log('👤 AuthProvider - Usuário encontrado, buscando perfil...');
        fetchUserProfile(session.user);
      } else {
        console.log('❌ AuthProvider - Nenhuma sessão ativa');
        // Chrome-specific cleanup for corrupted session data
        const clearedKeys = clearChromeAuthData();
        console.log(`🧹 AuthProvider - Limpou ${clearedKeys} chaves específicas do Chrome`);
        setLoading(false);
      }
    }).catch((error) => {
      console.error('💥 AuthProvider - Erro ao buscar sessão:', error);
      clearTimeout(timeoutId);
      setLoading(false);
    });

    // Listen for changes on auth state (sign in, sign out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log('🔄 AuthProvider - onAuthStateChange:', _event, !!session);
      setUser(session?.user ?? null);
      if (session?.user) {
        console.log('👤 AuthProvider - onAuthStateChange: buscando perfil do usuário...');
        await fetchUserProfile(session.user);
      } else {
        console.log('❌ AuthProvider - onAuthStateChange: sem sessão, limpando dados');
        setUserRole(null);
        setHasTemporaryPassword(false);
      }
      setLoading(false);
      console.log('✅ AuthProvider - onAuthStateChange: loading=false definido');
    });

    return () => subscription.unsubscribe();
  }, [fetchUserProfile]);

  const hasPermission = useCallback((requiredRole: UserRole | UserRole[]) => {

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
      return hasAccess;
    }

    // Se não é array, compara os níveis de hierarquia
    const hasAccess = roleHierarchy[userRole] >= roleHierarchy[requiredRole];
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

  const value = useMemo(() => ({
    user,
    userRole,
    loading,
    hasTemporaryPassword,
    signIn,
    signOut,
    hasPermission,
    onTemporaryPasswordChanged,
  }), [user, userRole, loading, hasTemporaryPassword, signIn, signOut, hasPermission, onTemporaryPasswordChanged]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};