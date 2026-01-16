
import React, { createContext, useContext, useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, clearChromeAuthData } from '@/core/api/supabase/client';
import { Database } from '@/core/types/supabase';
import { useToast } from '@/shared/hooks/common/use-toast';
import { useNavigate } from 'react-router-dom';
import { useAuthErrorHandler } from '@/shared/hooks/auth/useAuthErrorHandler';
import { useUserProfile } from '@/shared/hooks/auth/useUserProfile';

// Using Database Enums strictly
export type UserRole = Database['public']['Enums']['user_role'];

// Extending Supabase User to include our domain-specific role
export type AppUser = User & { role: UserRole | null };

interface AuthContextType {
  user: User | null; // Keeping base User for compatibility
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

  // States
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Hooks
  const { toast } = useToast();
  const navigate = useNavigate();
  const {
    userRole,
    setUserRole,
    featureFlags,
    setFeatureFlags,
    hasTemporaryPassword,
    setHasTemporaryPassword,
    fetchUserProfile
  } = useUserProfile();

  // Refs
  const isInitialized = useRef(false);

  // Authentication Error Handler
  const authErrorHandler = useAuthErrorHandler({
    showToast: true,
    redirectToLogin: false,
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
      // Clean local state first
      setUser(null);
      setUserRole(null);
      setFeatureFlags(null);

      // Sign out from Supabase
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
        await authErrorHandler.clearAuthState();
        toast({
          title: "Logout Realizado",
          description: "Você foi desconectado com sucesso.",
        });
        setTimeout(() => {
          window.location.href = '/auth';
        }, 1000);
      }
    } catch (error: unknown) {
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
  }, [toast, authErrorHandler, setUserRole, setFeatureFlags]);

  const onTemporaryPasswordChanged = useCallback(async () => {
    console.log('🔄 AuthProvider - onTemporaryPasswordChanged chamado');
    if (!user) return;

    // Otimistic update
    setHasTemporaryPassword(false);

    // Refresh profile check
    const { data: { user: latestUser } } = await supabase.auth.getUser();
    if (latestUser) {
      console.log('🔍 AuthProvider - Buscando perfil atualizado após mudança de senha');
      await fetchUserProfile(latestUser);
    }
  }, [user, fetchUserProfile, setHasTemporaryPassword]);

  useEffect(() => {
    if (isInitialized.current) return;

    console.log('🔍 AuthProvider - Iniciando autenticação...');
    isInitialized.current = true;

    // Security timeout
    const timeoutId = setTimeout(() => {
      console.warn('⏰ AuthProvider - Timeout de 12s atingido, forçando loading=false');
      setLoading(false);
      if (!user) {
        // Only redirect if effectively no user state
      }
    }, 12000);

    const initAuth = async () => {
      try {
        // Verificar sessão existente
        const { data: { session: currentSession } } = await supabase.auth.getSession();

        if (currentSession) {
          const { error: refreshError } = await supabase.auth.refreshSession();
          if (!refreshError) console.log('✅ AuthProvider - Sessão renovada com sucesso');
        }

        const { data: { session }, error } = await supabase.auth.getSession();

        clearTimeout(timeoutId);
        setUser(session?.user ?? null);

        if (session?.user) {
          console.log('👤 AuthProvider - Usuário encontrado, buscando perfil...');
          await fetchUserProfile(session.user);
        } else {
          console.log('❌ AuthProvider - Nenhuma sessão ativa');
          clearChromeAuthData();
          setLoading(false);
        }
      } catch (error) {
        console.error('💥 AuthProvider - Erro ao inicializar auth:', error);
        clearTimeout(timeoutId);
        setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`[AUTH-DEBUG] Auth state changed: ${event}`, { userId: session?.user?.id });
      clearTimeout(timeoutId);

      if ((event as string) === 'TOKEN_REFRESH_ERRORED') {
        const { data: { session: fallbackSession } } = await supabase.auth.getSession();
        if (fallbackSession) {
          setUser(fallbackSession.user);
          return;
        }
      }

      if (event === 'SIGNED_OUT') {
        setUser(null);
        setUserRole(null);
        setFeatureFlags(null);
        setHasTemporaryPassword(false);
        setLoading(false);
        return;
      }

      setUser(session?.user ?? null);

      if (session?.user && (event === 'SIGNED_IN' || event === 'USER_UPDATED')) {
        await fetchUserProfile(session.user);
      } else if (!session) {
        setUser(null);
        setUserRole(null);
        setFeatureFlags(null);
      }

      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeoutId);
    };
  }, [fetchUserProfile, setFeatureFlags, setHasTemporaryPassword, setUserRole, user]); // Added dependencies

  const hasPermission = useCallback((requiredRole: UserRole | UserRole[]) => {
    if (!user) return false;
    if (user.email === 'adm@adega.com') return true;
    if (!userRole) return false;

    const roleHierarchy: Record<string, number> = { admin: 3, manager: 3, employee: 2, delivery: 1 };

    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(userRole);
    }
    return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
  }, [user, userRole]);

  const signIn = useCallback(async (email: string, password: string) => {
    const signInOperation = async () => {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return data;
    };

    try {
      const result = await authErrorHandler.withAuthErrorHandling(signInOperation, 'login do usuário')();
      if (result) {
        toast({ title: "Bem-vindo de volta!", description: "Login realizado com sucesso." });
        navigate('/');
        return { error: null };
      } else {
        return { error: new Error('Login falhou') };
      }
    } catch (error: unknown) {
      console.error('Erro inesperado no signIn:', error);
      // Customize generic error if needed
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