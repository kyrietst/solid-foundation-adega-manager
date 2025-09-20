import React, { createContext, useContext, useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, clearChromeAuthData } from '@/core/api/supabase/client';
import { useToast } from '@/shared/hooks/common/use-toast';
import { useNavigate } from 'react-router-dom';
import { useAuthErrorHandler } from '@/shared/hooks/auth/useAuthErrorHandler';
import { UserRole } from '@/core/types/supabase';

interface AuthContextType {
  user: User | null;
  userRole: UserRole | null;
  featureFlags: Record<string, boolean> | null;
  loading: boolean;
  hasTemporaryPassword: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  hasPermission: (requiredRole: UserRole | UserRole[]) => boolean;
  onTemporaryPasswordChanged: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  console.log('🔐 AuthProvider - Inicializando provider (render)');
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [featureFlags, setFeatureFlags] = useState<Record<string, boolean> | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasTemporaryPassword, setHasTemporaryPassword] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Refs para evitar loops infinitos
  const isInitialized = useRef(false);
  const currentUserIdRef = useRef<string | null>(null);
  const fetchingProfileRef = useRef(false);

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
      setFeatureFlags(null);
      
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
      setFeatureFlags(null);
      
      toast({
        title: "Logout Forçado",
        description: "Ocorreu um erro, mas você foi desconectado.",
        variant: "destructive",
      });

      window.location.href = '/auth';
    }
  }, [toast, authErrorHandler]);

  const fetchUserProfile = useCallback(async (currentUser: User) => {
    // Evitar loops infinitos e chamadas desnecessárias
    if (fetchingProfileRef.current) {
      console.log('🔄 AuthProvider - Já buscando perfil, pulando chamada duplicada');
      return;
    }

    // Evitar busca se já temos os dados para o mesmo usuário
    if (currentUserIdRef.current === currentUser.id && userRole) {
      console.log('🔄 AuthProvider - Perfil já carregado para este usuário, pulando busca');
      return;
    }

    fetchingProfileRef.current = true;
    currentUserIdRef.current = currentUser.id;

    const fetchProfileOperation = async () => {
      // Se é o admin principal, define o role diretamente
      if (currentUser.email === 'adm@adega.com') {
        setUserRole('admin');
        setHasTemporaryPassword(false);
        // Admin principal tem todas as flags ativas
        setFeatureFlags({
          dashboard_enabled: true,
          sales_enabled: true,
          inventory_enabled: true,
          customers_enabled: true,
          suppliers_enabled: true,
          delivery_enabled: true,
          movements_enabled: true,
          reports_enabled: true,
          expenses_enabled: true
        });
        return;
      }

      // First try to get from profiles table
      console.log('🔍 AuthProvider - Tentando buscar perfil para usuário ID:', currentUser.id);
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role, is_temporary_password, feature_flags')
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
        setFeatureFlags(null); // Users table doesn't have feature flags
      } else {
        setUserRole(profileData.role);
        setHasTemporaryPassword(profileData.is_temporary_password || false);
        setFeatureFlags(profileData.feature_flags || {});
      }
    };

    try {
      await fetchProfileOperation();
    } catch (error) {
      console.error('💥 AuthProvider - Erro ao buscar perfil:', error);
      // Em vez de fazer logout, apenas definir loading como false
      setLoading(false);
    } finally {
      fetchingProfileRef.current = false;
    }
  }, []); // Remover dependências que causam loops

  const onTemporaryPasswordChanged = useCallback(async () => {
    const currentUser = currentUserIdRef.current;
    if (!currentUser) return;

    // Reset flag para permitir nova busca do perfil
    fetchingProfileRef.current = false;

    // Buscar usuário atual do Supabase para garantir dados atualizados
    const { data: { user: latestUser } } = await supabase.auth.getUser();
    if (latestUser) {
      await fetchUserProfile(latestUser);
    }
  }, []); // Remover dependências

  useEffect(() => {
    // Evitar re-execução se já inicializou
    if (isInitialized.current) {
      console.log('🔄 AuthProvider - Já inicializado, pulando useEffect');
      return;
    }

    console.log('🔍 AuthProvider - useEffect iniciado (primeira vez), buscando sessão...');
    isInitialized.current = true;

    // Timeout de segurança para evitar loading infinito
    const timeoutId = setTimeout(() => {
      console.warn('⏰ AuthProvider - Timeout de 10s atingido, forçando loading=false');
      setLoading(false);
      // Resetar estado em caso de timeout
      if (!currentUserIdRef.current) {
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
        setFeatureFlags(null);
        setHasTemporaryPassword(false);
        currentUserIdRef.current = null;
      }
      setLoading(false);
      console.log('✅ AuthProvider - onAuthStateChange: loading=false definido');
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeoutId);
    };
  }, []); // IMPORTANTE: Array vazio para executar apenas uma vez

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
    featureFlags,
    loading,
    hasTemporaryPassword,
    signIn,
    signOut,
    hasPermission,
    onTemporaryPasswordChanged,
  }), [user, userRole, featureFlags, loading, hasTemporaryPassword, signIn, signOut, hasPermission, onTemporaryPasswordChanged]);

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