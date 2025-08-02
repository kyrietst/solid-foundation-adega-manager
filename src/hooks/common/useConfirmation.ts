/**
 * Hook genérico para confirmações de ações
 * Padroniza dialogs de confirmação no sistema
 */

import { useState, useCallback } from 'react';

export interface ConfirmationConfig {
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive' | 'warning';
  requiresInput?: boolean;
  inputPlaceholder?: string;
  inputValidation?: (value: string) => boolean;
}

export interface ConfirmationState {
  isOpen: boolean;
  isLoading: boolean;
  inputValue: string;
  config: ConfirmationConfig;
}

export const useConfirmation = () => {
  const [state, setState] = useState<ConfirmationState>({
    isOpen: false,
    isLoading: false,
    inputValue: '',
    config: {}
  });

  const showConfirmation = useCallback((
    action: () => Promise<void> | void,
    config: ConfirmationConfig = {}
  ): Promise<boolean> => {
    return new Promise((resolve) => {
      setState(prev => ({
        ...prev,
        isOpen: true,
        inputValue: '',
        config: {
          title: 'Confirmar ação',
          description: 'Tem certeza que deseja continuar?',
          confirmText: 'Confirmar',
          cancelText: 'Cancelar',
          variant: 'default',
          requiresInput: false,
          ...config
        }
      }));

      // Armazenar a função de resolução para uso posterior
      (window as any).__confirmationResolve = resolve;
      (window as any).__confirmationAction = action;
    });
  }, []);

  const confirm = useCallback(async () => {
    const { config } = state;
    const resolve = (window as any).__confirmationResolve;
    const action = (window as any).__confirmationAction;

    // Validar input se necessário
    if (config.requiresInput && config.inputValidation) {
      if (!config.inputValidation(state.inputValue)) {
        return;
      }
    }

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      await action();
      setState(prev => ({ 
        ...prev, 
        isOpen: false, 
        isLoading: false,
        inputValue: '' 
      }));
      resolve(true);
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      console.error('Erro na confirmação:', error);
      resolve(false);
    } finally {
      // Limpar referências
      delete (window as any).__confirmationResolve;
      delete (window as any).__confirmationAction;
    }
  }, [state]);

  const cancel = useCallback(() => {
    const resolve = (window as any).__confirmationResolve;
    
    setState(prev => ({ 
      ...prev, 
      isOpen: false,
      inputValue: '',
      isLoading: false
    }));
    
    resolve(false);
    
    // Limpar referências
    delete (window as any).__confirmationResolve;
    delete (window as any).__confirmationAction;
  }, []);

  const updateInputValue = useCallback((value: string) => {
    setState(prev => ({ ...prev, inputValue: value }));
  }, []);

  // Helpers para tipos comuns de confirmação
  const confirmDelete = useCallback((
    itemName: string,
    action: () => Promise<void> | void
  ) => {
    return showConfirmation(action, {
      title: 'Confirmar exclusão',
      description: `Tem certeza que deseja excluir "${itemName}"? Esta ação não pode ser desfeita.`,
      confirmText: 'Excluir',
      cancelText: 'Cancelar',
      variant: 'destructive'
    });
  }, [showConfirmation]);

  const confirmAction = useCallback((
    actionName: string,
    action: () => Promise<void> | void,
    description?: string
  ) => {
    return showConfirmation(action, {
      title: `Confirmar ${actionName.toLowerCase()}`,
      description: description || `Tem certeza que deseja ${actionName.toLowerCase()}?`,
      confirmText: actionName,
      cancelText: 'Cancelar',
      variant: 'default'
    });
  }, [showConfirmation]);

  const confirmWithInput = useCallback((
    expectedInput: string,
    action: () => Promise<void> | void,
    config: Omit<ConfirmationConfig, 'requiresInput' | 'inputValidation'> = {}
  ) => {
    return showConfirmation(action, {
      ...config,
      requiresInput: true,
      inputPlaceholder: `Digite "${expectedInput}" para confirmar`,
      inputValidation: (value: string) => value === expectedInput
    });
  }, [showConfirmation]);

  const canConfirm = useCallback(() => {
    const { config } = state;
    
    if (state.isLoading) return false;
    
    if (config.requiresInput) {
      if (!state.inputValue.trim()) return false;
      if (config.inputValidation) {
        return config.inputValidation(state.inputValue);
      }
    }
    
    return true;
  }, [state]);

  return {
    // Estado atual
    ...state,
    canConfirm: canConfirm(),

    // Ações principais
    showConfirmation,
    confirm,
    cancel,
    updateInputValue,

    // Helpers
    confirmDelete,
    confirmAction,
    confirmWithInput,
  };
};