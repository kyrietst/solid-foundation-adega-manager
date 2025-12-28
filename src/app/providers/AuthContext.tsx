/* eslint-disable react-hooks/exhaustive-deps */
import React, { createContext, useContext, useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, clearChromeAuthData } from '@/core/api/supabase/client';
import { useToast } from '@/shared/hooks/common/use-toast';
import { useNavigate } from 'react-router-dom';
import { useAuthErrorHandler } from '@/shared/hooks/auth/useAuthErrorHandler';
// UserRole removed to fix module error

export type UserRole = 'admin' | 'employee' | 'delivery';

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

  // ... (rest of the component)

  // skipping to the line to fix Promise.race result

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

    // ✅ CORREÇÃO: Adicionar retry logic para erros de JWT
    const fetchProfileOperation = async (retryCount = 0): Promise<void> => {
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
        console.log('🔍 AuthProvider - Buscando perfil (tentativa', retryCount + 1, ')');

        const profilePromise = (supabase
          .from('profiles')
          .select('role, is_temporary_password, feature_flags') as any)
          .eq('id', currentUser.id)
          .single();

        // Adicionar timeout na Promise da consulta (10s para a query específica)
        const profilePromiseWithTimeout = Promise.race([
          profilePromise,
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Profile query timeout')), 10000)
          )
        ]);

        const result = await profilePromiseWithTimeout as any;
        const { data: profileData, error: profileError } = result;

        console.log('📊 AuthProvider - Resultado profiles:', {
          hasData: !!profileData,
          role: profileData?.role,
          errorCode: profileError?.code,
          errorMessage: profileError?.message
        });

        if (profileError) {
          // ✅ RETRY LOGIC: Se erro é de JWT e ainda não tentou retry
          const isJWTError =
            profileError.code === 'PGRST301' ||
            profileError.message?.toLowerCase().includes('jwt') ||
            profileError.message?.toLowerCase().includes('token') ||
            profileError.message?.toLowerCase().includes('authenticated');

          if (isJWTError && retryCount === 0) {
            console.warn('⏳ AuthProvider - Erro de JWT detectado, aguardando 2s para retry...');
            await new Promise(resolve => setTimeout(resolve, 2000));
            return fetchProfileOperation(1); // Retry uma vez
          }

          // Se não é erro de JWT ou já tentou retry, tentar users table
          console.log('⚠️ AuthProvider - Erro na tabela profiles, tentando users table:', profileError);

          const { data: userData, error: userError } = await (supabase
            .from('users')
            .select('role') as any)
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

          setUserRole((userData as any)?.role);
          setHasTemporaryPassword(false);
          setFeatureFlags(null);
        } else {
          console.log('✅ AuthProvider - Perfil encontrado com sucesso');
          setUserRole(profileData.role);
          setHasTemporaryPassword(profileData.is_temporary_password || false);
          setFeatureFlags(profileData.feature_flags || {});
        }
      } catch (error) {
        console.warn('⚠️ AuthProvider - Timeout ou erro na busca do perfil, usando fallback:', error);
        // Fallback baseado no email conhecido - sistema continua funcionando normalmente
        if (currentUser.email === 'funcionario@adega.com') {
          console.log('✅ AuthProvider - Aplicando configuração de fallback para funcionario@adega.com');
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
          console.log('✅ AuthProvider - Aplicando configuração de fallback padrão (employee)');
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

    // ✅ OTIMIZADO: Atualização otimista do estado (assume que senha foi trocada)
    setHasTemporaryPassword(false);

    // Buscar usuário atual do Supabase para garantir dados atualizados
    const { data: { user: latestUser } } = await supabase.auth.getUser();
    if (latestUser) {
      console.log('🔍 AuthProvider - Buscando perfil atualizado após mudança de senha');
      await fetchUserProfile(latestUser);
      // ✅ fetchUserProfile já buscou is_temporary_password, role e feature_flags
      // Não precisa de query adicional redundante
    }
  }, []); // Remover dependências

  useEffect(() => {
    // Evitar re-execução se já inicializou
    if (isInitialized.current) {
      console.log('🔄 AuthProvider - Já inicializado, pulando useEffect');
      return;
    }

    console.log('🔍 AuthProvider - Iniciando autenticação...');
    // DEBUG: Verificar Clock Skew
    const localTime = new Date().getTime();
    console.log('[AUTH-DEBUG] Horário da Máquina:', new Date().toLocaleString());

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

    // ✅ CORREÇÃO: Aguardar renovação de sessão ANTES de buscar perfil
    const initAuth = async () => {
      try {
        // 1. VERIFICAR se existe sessão ANTES de tentar renovar (previne warning desnecessário)
        console.log('🔍 AuthProvider - Verificando sessão existente...');
        const { data: { session: currentSession } } = await supabase.auth.getSession();

        if (currentSession) {
          // Só renovar se sessão existe
          console.log('🔄 AuthProvider - Renovando sessão existente para garantir JWT válido...');
          const { error: refreshError } = await supabase.auth.refreshSession();

          if (refreshError) {
            console.warn('⚠️ AuthProvider - Erro ao renovar sessão:', refreshError.message);
          } else {
            console.log('✅ AuthProvider - Sessão renovada com sucesso');
          }
        } else {
          console.log('ℹ️ AuthProvider - Nenhuma sessão ativa (primeira visita ou após logout)');
        }

        // 2. Buscar sessão novamente (agora renovada se existia)
        const { data: { session }, error } = await supabase.auth.getSession();

        console.log('📡 AuthProvider - Sessão obtida:', {
          hasSession: !!session,
          email: session?.user?.email || 'sem usuário',
          userId: session?.user?.id || 'sem ID'
        });

        clearTimeout(timeoutId);
        setUser(session?.user ?? null);

        if (session?.user) {
          console.log('👤 AuthProvider - Usuário encontrado, buscando perfil...');
          await fetchUserProfile(session.user);
        } else {
          console.log('❌ AuthProvider - Nenhuma sessão ativa');
          // Chrome-specific cleanup for corrupted session data
          const clearedKeys = clearChromeAuthData();
          console.log(`🧹 AuthProvider - Limpou ${clearedKeys} chaves específicas do Chrome`);
          setLoading(false);
        }
      } catch (error) {
        console.error('💥 AuthProvider - Erro ao inicializar auth:', error);
        clearTimeout(timeoutId);
        setLoading(false);
      }
    };

    initAuth();

    // Listen for changes on auth state (sign in, sign out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`[AUTH-DEBUG] Auth state changed: ${event}`, {
        hasSession: !!session,
        userId: session?.user?.id,
        email: session?.user?.email
      });

      // Limpar timeout principal quando auth state muda
      clearTimeout(timeoutId);

      // Tratamento Específico de Eventos
      if ((event as string) === 'TOKEN_REFRESH_ERRORED') {
        console.error('[AUTH-DEBUG] 🚨 Erro na renovação do token!');
        // Tentar recuperar sessão uma última vez antes de desistir
        const { data: { session: fallbackSession }, error: fallbackError } = await supabase.auth.getSession();
        if (fallbackSession) {
          console.log('[AUTH-DEBUG] ✅ Sessão recuperada manualmente após erro de refresh');
          setUser(fallbackSession.user);
          return;
        } else {
          console.error('[AUTH-DEBUG] ❌ Sessão perdida definitivamente:', fallbackError);
        }
      }

      if (event === 'SIGNED_OUT') {
        console.log('[AUTH-DEBUG] 🚪 Usuário desconectado voluntariamente ou por expiração');
        // Limpeza explícita
        setUser(null);
        setUserRole(null);
        setFeatureFlags(null);
        setHasTemporaryPassword(false);
        currentUserIdRef.current = null;
        fetchingProfileRef.current = false;
        setLoading(false);
        return;
      }

      setUser(session?.user ?? null);

      // ✅ CORREÇÃO: Só buscar perfil em eventos específicos (não em TOKEN_REFRESHED)
      // Isso evita buscar perfil durante renovação automática de token
      if (session?.user && (event === 'SIGNED_IN' || event === 'USER_UPDATED')) {
        console.log(`[AUTH-DEBUG] 👤 Buscando perfil após ${event}`);
        await fetchUserProfile(session.user);
      } else if (!session) {
        // Fallback genérico para perda de sessão
        console.log('[AUTH-DEBUG] ❌ Sessão nula detectada no listener genérico');
        if (user) {
          // Se tinha user e perdeu, logar aviso forte
          console.warn('[AUTH-DEBUG] ⚠️ Logout involuntário detectado?');
        }
        setUser(null);
        setUserRole(null);
        setFeatureFlags(null);
        setHasTemporaryPassword(false);
        currentUserIdRef.current = null;
        fetchingProfileRef.current = false;
      }

      setLoading(false);
      console.log('[AUTH-DEBUG] ✅ Auth state change processado');
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