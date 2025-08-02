/**
 * Hook especializado para tratamento de erros de autenticação
 * Fornece recovery automático e feedback contextual
 */

import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface AuthErrorConfig {
  showToast?: boolean;
  redirectToLogin?: boolean;
  clearStorage?: boolean;
  retryAttempts?: number;
  onError?: (error: Error) => void;
  onRecovery?: () => void;
}

export const useAuthErrorHandler = (config: AuthErrorConfig = {}) => {
  const {
    showToast = true,
    redirectToLogin = true,
    clearStorage = true,
    retryAttempts = 0,
    onError,
    onRecovery
  } = config;

  const { toast } = useToast();
  const navigate = useNavigate();

  const isAuthError = useCallback((error: Error): boolean => {
    const message = error.message.toLowerCase();
    const authKeywords = [
      'auth',
      'unauthorized', 
      'forbidden',
      'token',
      'session',
      'expired',
      'invalid_grant',
      'refresh_token',
      'access_denied',
      'user not found',
      'invalid_credentials'
    ];
    
    return authKeywords.some(keyword => message.includes(keyword));
  }, []);

  const clearAuthState = useCallback(async () => {
    try {
      if (clearStorage) {
        // Limpar storage
        localStorage.clear();
        sessionStorage.clear();
      }

      // Fazer logout no Supabase
      await supabase.auth.signOut();
      
      console.log('Estado de autenticação limpo com sucesso');
    } catch (error) {
      console.error('Erro ao limpar estado de autenticação:', error);
    }
  }, [clearStorage]);

  const showAuthErrorToast = useCallback((error: Error, context?: string) => {
    if (!showToast) return;

    const contextMessage = context ? ` durante ${context}` : '';
    
    let title = 'Erro de Autenticação';
    let description = `Sua sessão expirou${contextMessage}. Fazendo logout...`;

    // Mensagens específicas baseadas no tipo de erro
    if (error.message.includes('refresh_token')) {
      description = 'Sessão expirada. Por favor, faça login novamente.';
    } else if (error.message.includes('invalid_credentials')) {
      description = 'Credenciais inválidas. Verifique seu email e senha.';
    } else if (error.message.includes('user not found')) {
      description = 'Usuário não encontrado. Verifique suas credenciais.';
    } else if (error.message.includes('access_denied')) {
      description = 'Acesso negado. Você não tem permissão para esta ação.';
    }

    toast({
      title,
      description,
      variant: 'destructive',
    });
  }, [showToast, toast]);

  const handleAuthError = useCallback(async (
    error: Error, 
    context?: string,
    customConfig?: Partial<AuthErrorConfig>
  ): Promise<boolean> => {
    const finalConfig = { ...config, ...customConfig };
    
    console.error(`Erro de autenticação${context ? ` em ${context}` : ''}:`, error);

    // Verificar se é realmente um erro de auth
    if (!isAuthError(error)) {
      console.warn('Erro não é de autenticação, passando adiante');
      return false;
    }

    // Chamar callback de erro personalizado
    onError?.(error);

    // Mostrar toast de erro
    showAuthErrorToast(error, context);

    // Limpar estado de autenticação
    await clearAuthState();

    // Redirecionar para login se configurado
    if (finalConfig.redirectToLogin) {
      setTimeout(() => {
        navigate('/auth', { replace: true });
      }, 1000); // Delay para usuário ver o toast
    }

    return true; // Indica que o erro foi tratado
  }, [
    config, 
    isAuthError, 
    onError, 
    showAuthErrorToast, 
    clearAuthState, 
    navigate
  ]);

  const withAuthErrorHandling = useCallback(<T extends any[], R>(
    asyncFn: (...args: T) => Promise<R>,
    context?: string
  ) => {
    return async (...args: T): Promise<R | null> => {
      try {
        const result = await asyncFn(...args);
        onRecovery?.(); // Sucesso após possível erro anterior
        return result;
      } catch (error) {
        const handled = await handleAuthError(
          error instanceof Error ? error : new Error(String(error)),
          context
        );
        
        if (!handled) {
          throw error; // Re-throw se não foi um erro de auth
        }
        
        return null;
      }
    };
  }, [handleAuthError, onRecovery]);

  const retryWithAuth = useCallback(async <T>(
    operation: () => Promise<T>,
    context?: string,
    attempts: number = retryAttempts
  ): Promise<T | null> => {
    for (let i = 0; i <= attempts; i++) {
      try {
        const result = await operation();
        if (i > 0) {
          console.log(`Operação "${context}" bem-sucedida após ${i} tentativas`);
          onRecovery?.();
        }
        return result;
      } catch (error) {
        const isLastAttempt = i === attempts;
        const authError = error instanceof Error ? error : new Error(String(error));
        
        if (isAuthError(authError)) {
          if (isLastAttempt) {
            await handleAuthError(authError, context);
            return null;
          } else {
            console.log(`Tentativa ${i + 1} falhada para "${context}", tentando novamente...`);
            // Delay progressivo entre tentativas
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
          }
        } else {
          // Não é erro de auth, re-throw
          throw error;
        }
      }
    }
    
    return null;
  }, [retryAttempts, isAuthError, handleAuthError, onRecovery]);

  return {
    // Principais funções
    handleAuthError,
    withAuthErrorHandling,
    retryWithAuth,
    clearAuthState,

    // Utilitários
    isAuthError,
    showAuthErrorToast,

    // Estado/config
    config: {
      showToast,
      redirectToLogin,
      clearStorage,
      retryAttempts
    }
  };
};