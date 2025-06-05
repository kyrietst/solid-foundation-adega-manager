import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
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

  useEffect(() => {
    // Check active sessions and sets the user
    const initializeAuth = async () => {
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchUserRole(session.user);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for changes on auth state (sign in, sign out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setLoading(true);
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
    try {
      console.log('Fetching user role for:', currentUser.email);
      
      // Se é o admin principal, define o role diretamente
      if (currentUser.email === 'adm@adega.com') {
        console.log('Setting admin role for main admin');
        setUserRole('admin');
        return;
      }

      // Busca primeiro na tabela profiles
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('email', currentUser.email)
        .single();

      if (profileData && !profileError) {
        console.log('Role found in profiles:', profileData.role);
        setUserRole(profileData.role);
        return;
      }

      console.error('Error or no data in profiles table:', profileError);
      
      // Se não encontrou em profiles, tenta na tabela users
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('email', currentUser.email)
        .single();

      if (userData && !userError) {
        console.log('Role found in users:', userData.role);
        setUserRole(userData.role);
        return;
      }

      console.error('Error or no data in users table:', userError);
      throw new Error('Could not fetch user role from any table');
    } catch (error) {
      console.error('Error in fetchUserRole:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar suas permissões. Por favor, faça login novamente.",
        variant: "destructive",
      });
      // Em caso de erro, fazer logout para forçar nova autenticação
      await signOut();
    }
  };

  const hasPermission = (requiredRole: UserRole | UserRole[]) => {
    console.log('Checking permission:', { 
      user: user?.email, 
      userRole, 
      requiredRole 
    });

    // Se não há usuário, não tem permissão
    if (!user) {
      console.log('No user found');
      return false;
    }

    // Se o email é adm@adega.com, tem todas as permissões
    if (user.email === 'adm@adega.com') {
      console.log('Main admin access granted');
      return true;
    }

    // Se não há role definido e não é o admin principal, não tem permissão
    if (!userRole) {
      console.log('No role found');
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
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Erro ao fazer login",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      if (data.user) {
        await fetchUserRole(data.user);
      }

      toast({
        title: "Bem-vindo!",
        description: "Login realizado com sucesso.",
      });

      navigate('/');
      return { error: null };
    } catch (error) {
      console.error('Error in signIn:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado. Por favor, tente novamente.",
        variant: "destructive",
      });
      return { error: error as Error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      console.log('Starting signOut process...');
      
      // First clear local state
      setUser(null);
      setUserRole(null);
      
      // Then sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Error in supabase.auth.signOut:', error);
        toast({
          title: "Error signing out",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      console.log('Successfully signed out from Supabase');
      
      // Show success message
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });

      // Force navigation to auth page
      window.location.href = '/auth';
    } catch (error) {
      console.error('Error in signOut:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while signing out.",
        variant: "destructive",
      });
    }
  };

  const value = {
    user,
    userRole,
    loading,
    signIn,
    signOut,
    hasPermission,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
