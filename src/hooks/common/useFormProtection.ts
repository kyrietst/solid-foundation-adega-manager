/**
 * Hook para proteção de formulários contra double-submit e outras falhas
 * Implementa dirty state checking, timeout e prevenção de submissões múltiplas
 */

import { useCallback, useState, useRef, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';

export interface FormProtectionConfig {
  enableDoubleSubmitProtection?: boolean;
  enableDirtyStateCheck?: boolean;
  enableTimeout?: boolean;
  timeoutMs?: number;
  enableBeforeUnloadWarning?: boolean;
  onTimeout?: () => void;
  onDoubleSubmitAttempt?: () => void;
  onDirtyStateWarning?: () => boolean; // Return false to cancel navigation
}

export interface FormProtectionState {
  isSubmitting: boolean;
  isDirty: boolean;
  isTimeout: boolean;
  submitCount: number;
  lastSubmitTime: number | null;
  timeoutId: NodeJS.Timeout | null;
}

export const useFormProtection = (config: FormProtectionConfig = {}) => {
  const {
    enableDoubleSubmitProtection = true,
    enableDirtyStateCheck = true,
    enableTimeout = true,
    timeoutMs = 30000, // 30 segundos
    enableBeforeUnloadWarning = true,
    onTimeout,
    onDoubleSubmitAttempt,
    onDirtyStateWarning
  } = config;

  const { toast } = useToast();
  const [state, setState] = useState<FormProtectionState>({
    isSubmitting: false,
    isDirty: false,
    isTimeout: false,
    submitCount: 0,
    lastSubmitTime: null,
    timeoutId: null
  });

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Limpar timeout ao desmontar componente
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Warning antes de sair da página com dados não salvos
  useEffect(() => {
    if (!enableBeforeUnloadWarning) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (state.isDirty && !state.isSubmitting) {
        // Chamar callback personalizado se fornecido
        if (onDirtyStateWarning) {
          const shouldWarn = onDirtyStateWarning();
          if (!shouldWarn) return;
        }

        e.preventDefault();
        e.returnValue = 'Você tem alterações não salvas. Deseja realmente sair?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [state.isDirty, state.isSubmitting, enableBeforeUnloadWarning, onDirtyStateWarning]);

  // Marcar formulário como dirty
  const markDirty = useCallback(() => {
    if (enableDirtyStateCheck) {
      setState(prev => ({ ...prev, isDirty: true }));
    }
  }, [enableDirtyStateCheck]);

  // Marcar formulário como limpo
  const markClean = useCallback(() => {
    setState(prev => ({ ...prev, isDirty: false }));
  }, []);

  // Iniciar timeout de submissão
  const startTimeout = useCallback(() => {
    if (!enableTimeout) return;

    // Limpar timeout anterior se existir
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      console.warn('Timeout de formulário atingido');
      
      setState(prev => ({
        ...prev,
        isSubmitting: false,
        isTimeout: true,
        timeoutId: null
      }));

      toast({
        title: 'Timeout',
        description: 'A operação demorou muito para ser concluída. Tente novamente.',
        variant: 'destructive',
      });

      onTimeout?.();
    }, timeoutMs);

    setState(prev => ({ ...prev, timeoutId: timeoutRef.current }));
  }, [enableTimeout, timeoutMs, onTimeout, toast]);

  // Limpar timeout
  const clearTimeoutTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
      setState(prev => ({ ...prev, timeoutId: null, isTimeout: false }));
    }
  }, []);

  // Verificar se pode submeter
  const canSubmit = useCallback((): boolean => {
    // Verificar se já está submetendo
    if (state.isSubmitting) {
      if (enableDoubleSubmitProtection) {
        console.warn('Tentativa de double-submit detectada');
        
        toast({
          title: 'Aguarde',
          description: 'Uma operação já está em andamento. Aguarde a conclusão.',
          variant: 'default',
        });

        onDoubleSubmitAttempt?.();
        return false;
      }
    }

    // Verificar se está em timeout
    if (state.isTimeout) {
      toast({
        title: 'Timeout',
        description: 'A operação anterior atingiu o timeout. Recarregue a página e tente novamente.',
        variant: 'destructive',
      });
      return false;
    }

    // Verificar intervalo mínimo entre submissões (1 segundo)
    if (state.lastSubmitTime && Date.now() - state.lastSubmitTime < 1000) {
      toast({
        title: 'Muito rápido',
        description: 'Aguarde um momento antes de submeter novamente.',
        variant: 'default',
      });
      return false;
    }

    return true;
  }, [
    state.isSubmitting,
    state.isTimeout,
    state.lastSubmitTime,
    enableDoubleSubmitProtection,
    onDoubleSubmitAttempt,
    toast
  ]);

  // Iniciar submissão
  const startSubmission = useCallback(() => {
    if (!canSubmit()) return false;

    setState(prev => ({
      ...prev,
      isSubmitting: true,
      isTimeout: false,
      submitCount: prev.submitCount + 1,
      lastSubmitTime: Date.now()
    }));

    startTimeout();
    return true;
  }, [canSubmit, startTimeout]);

  // Finalizar submissão com sucesso
  const finishSubmission = useCallback((success: boolean = true) => {
    clearTimeoutTimer();
    
    setState(prev => ({
      ...prev,
      isSubmitting: false,
      isDirty: success ? false : prev.isDirty, // Limpar dirty state apenas em caso de sucesso
      isTimeout: false
    }));
  }, [clearTimeoutTimer]);

  // Wrapper para proteger funções de submit
  const protectedSubmit = useCallback(<T extends any[], R>(
    submitFn: (...args: T) => Promise<R>
  ) => {
    return async (...args: T): Promise<R | null> => {
      // Verificar se pode submeter
      const canProceed = startSubmission();
      if (!canProceed) return null;

      try {
        const result = await submitFn(...args);
        finishSubmission(true); // Sucesso
        return result;
      } catch (error) {
        finishSubmission(false); // Erro
        throw error; // Re-throw para ser tratado pelo caller
      }
    };
  }, [startSubmission, finishSubmission]);

  // Reset completo do estado
  const reset = useCallback(() => {
    clearTimeoutTimer();
    setState({
      isSubmitting: false,
      isDirty: false,
      isTimeout: false,
      submitCount: 0,
      lastSubmitTime: null,
      timeoutId: null
    });
  }, [clearTimeoutTimer]);

  // Força parada da submissão (para casos de emergência)
  const forceStop = useCallback(() => {
    clearTimeoutTimer();
    setState(prev => ({
      ...prev,
      isSubmitting: false,
      isTimeout: false
    }));
  }, [clearTimeoutTimer]);

  return {
    // Estado atual
    ...state,

    // Ações principais
    markDirty,
    markClean,
    startSubmission,
    finishSubmission,
    protectedSubmit,

    // Utilitários
    canSubmit,
    reset,
    forceStop,

    // Estado derivado
    canSubmitNow: canSubmit(),
    hasUnsavedChanges: state.isDirty && !state.isSubmitting,
    submitButtonText: state.isSubmitting ? 'Processando...' : 'Salvar',
    submitButtonDisabled: !canSubmit() || state.isSubmitting,

    // Configuração
    config: {
      enableDoubleSubmitProtection,
      enableDirtyStateCheck,
      enableTimeout,
      timeoutMs,
      enableBeforeUnloadWarning
    }
  };
};