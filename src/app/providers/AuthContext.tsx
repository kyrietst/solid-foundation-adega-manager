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

    console.log('🔍 AuthProvider - Iniciando fetchUserProfile para:', currentUser.id);
    fetchingProfileRef.current = true;
    currentUserIdRef.current = currentUser.id;

    // Timeout específico para a busca do perfil (6 segundos)
    const profileTimeout = setTimeout(() => {
      console.warn('⏰ AuthProvider - Timeout de 6s na busca do perfil, forçando fallback');
      fetchingProfileRef.current = false;
      // Definir role básico baseado no email como fallback
      if (currentUser.email === 'funcionario@adega.com') {
        setUserRole('employee');
        setHasTemporaryPassword(false);
        setFeatureFlags({
          sales_enabled: true,
          reports_enabled: false,
          delivery_enabled: false,
          expenses_enabled: false,
          customers_enabled: true,
          dashboard_enabled: false,
          inventory_enabled: true,
          movements_enabled: false,
          suppliers_enabled: false
        });
      } else {
        setUserRole('employee'); // fallback seguro
        setHasTemporaryPassword(false);
        setFeatureFlags({});
      }
      setLoading(false);
    }, 6000);

    const fetchProfileOperation = async () => {
      try {
        // Se é o admin principal, define o role diretamente
        if (currentUser.email === 'adm@adega.com') {
          console.log('👤 AuthProvider - Admin principal detectado');
          setUserRole('admin');
          setHasTemporaryPassword(false);
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

        const profilePromise = supabase
          .from('profiles')
          .select('role, is_temporary_password, feature_flags')
          .eq('id', currentUser.id)
          .single();

        // Adicionar timeout na Promise da consulta (5s para a query específica)
        const profilePromiseWithTimeout = Promise.race([
          profilePromise,
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Profile query timeout')), 5000)
          )
        ]);

        const result = await profilePromiseWithTimeout as Awaited<typeof profilePromise>;
        const { data: profileData, error: profileError } = result;

        console.log('📊 AuthProvider - Resultado profiles:', {
          hasData: !!profileData,
          role: profileData?.role,
          errorCode: profileError?.code,
          errorMessage: profileError?.message
        });

        if (profileError) {
          console.log('⚠️ AuthProvider - Erro na tabela profiles, tentando users table:', profileError);

          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('role')
            .eq('id', currentUser.id)
            .single();

          console.log('📊 AuthProvider - Resultado users:', { userData, userError });

          if (userError) {
            console.error('💥 AuthProvider - Falha em ambas as tabelas:', { profileError, userError });
            // Em vez de throw, definir fallback baseado no email
            if (currentUser.email === 'funcionario@adega.com') {
              setUserRole('employee');
            } else {
              setUserRole('employee'); // fallback seguro
            }
            setHasTemporaryPassword(false);
            setFeatureFlags({});
            return;
          }

          setUserRole(userData.role);
          setHasTemporaryPassword(false);
          setFeatureFlags(null);
        } else {
          console.log('✅ AuthProvider - Perfil encontrado com sucesso');
          setUserRole(profileData.role);
          setHasTemporaryPassword(profileData.is_temporary_password || false);
          setFeatureFlags(profileData.feature_flags || {});
        }
      } catch (error) {
        console.error('💥 AuthProvider - Erro inesperado na busca do perfil:', error);
        // Fallback baseado no email conhecido
        if (currentUser.email === 'funcionario@adega.com') {
          setUserRole('employee');
          setFeatureFlags({
            sales_enabled: true,
            reports_enabled: false,
            delivery_enabled: false,
            expenses_enabled: false,
            customers_enabled: true,
            dashboard_enabled: false,
            inventory_enabled: true,
            movements_enabled: false,
            suppliers_enabled: false
          });
        } else {
          setUserRole('employee'); // fallback seguro
          setFeatureFlags({});
        }
        setHasTemporaryPassword(false);
      }
    };

    try {
      await fetchProfileOperation();
      console.log('✅ AuthProvider - fetchUserProfile concluído com sucesso');
    } catch (error) {
      console.error('💥 AuthProvider - Erro final ao buscar perfil:', error);
    } finally {
      clearTimeout(profileTimeout);
      fetchingProfileRef.current = false;
      setLoading(false);
    }
  }, []); // Remover dependências que causam loops

  const onTemporaryPasswordChanged = useCallback(async () => {
    console.log('🔄 AuthProvider - onTemporaryPasswordChanged chamado');
    const currentUser = currentUserIdRef.current;
    if (!currentUser) {
      console.log('❌ AuthProvider - Nenhum usuário atual para atualizar');
      return;
    }

    // Reset flag para permitir nova busca do perfil
    fetchingProfileRef.current = false;

    // Forçar atualização do status de senha temporária
    setHasTemporaryPassword(false);

    // Buscar usuário atual do Supabase para garantir dados atualizados
    const { data: { user: latestUser } } = await supabase.auth.getUser();
    if (latestUser) {
      console.log('🔍 AuthProvider - Buscando perfil atualizado após mudança de senha');
      await fetchUserProfile(latestUser);
    }

    // Verificação adicional direta do banco de dados
    try {
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('is_temporary_password')
        .eq('id', currentUser)
        .single();

      if (!error && profileData) {
        console.log('🔍 AuthProvider - Status real no banco:', profileData.is_temporary_password);
        setHasTemporaryPassword(profileData.is_temporary_password || false);
      }
    } catch (error) {
      console.error('Erro ao verificar status de senha temporária:', error);
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

    // Timeout de segurança para evitar loading infinito (aumentado para 12s)
    const timeoutId = setTimeout(() => {
      console.warn('⏰ AuthProvider - Timeout de 12s atingido, forçando loading=false');
      setLoading(false);
      // Resetar estado em caso de timeout
      if (!currentUserIdRef.current) {
        console.log('🚪 AuthProvider - Redirecionando para /auth devido ao timeout');
        window.location.href = '/auth';
      }
    }, 12000);

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

      // Limpar timeout principal quando auth state muda
      clearTimeout(timeoutId);

      setUser(session?.user ?? null);
      if (session?.user) {
        console.log('👤 AuthProvider - onAuthStateChange: buscando perfil do usuário...');
        console.log('🔍 AuthProvider - Tentando buscar perfil para usuário ID:', session.user.id);
        await fetchUserProfile(session.user);
      } else {
        console.log('❌ AuthProvider - onAuthStateChange: sem sessão, limpando dados');
        setUserRole(null);
        setFeatureFlags(null);
        setHasTemporaryPassword(false);
        currentUserIdRef.current = null;
        fetchingProfileRef.current = false;
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