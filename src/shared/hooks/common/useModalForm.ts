/**
 * Hook genérico para formulários em modais
 * Combina funcionalidades de modal + formulário + validação
 */

import { useState, useCallback } from 'react';
import { useFormValidation, UseFormValidationConfig } from './useFormValidation';

export interface UseModalFormConfig<T> extends UseFormValidationConfig<T> {
  initialData?: Partial<T>;
  onSuccess?: (data: T) => void;
  onCancel?: () => void;
  resetOnSuccess?: boolean;
  resetOnCancel?: boolean;
}

export const useModalForm = <T extends Record<string, any>>(
  config: UseModalFormConfig<T> = {}
) => {
  const {
    initialData = {},
    onSuccess,
    onCancel,
    resetOnSuccess = true,
    resetOnCancel = false,
    ...validationConfig
  } = config;

  // Estados do modal
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados do formulário
  const [formData, setFormData] = useState<Partial<T>>(initialData);

  // Validação
  const validation = useFormValidation<T>(validationConfig);

  // Handlers do modal
  const openModal = useCallback((data?: Partial<T>) => {
    if (data) {
      setFormData({ ...initialData, ...data });
    } else {
      setFormData(initialData);
    }
    validation.clearErrors();
    setIsOpen(true);
  }, [initialData, validation]);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    if (resetOnCancel) {
      setFormData(initialData);
      validation.clearErrors();
    }
  }, [initialData, resetOnCancel, validation]);

  // Handlers do formulário
  const updateField = useCallback(<K extends keyof T>(
    field: K, 
    value: T[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Validação em tempo real se configurada
    if (validationConfig.validateOnChange) {
      const fieldError = validation.validateField(field, value, formData as T);
      // Atualizar apenas este campo específico
    }
  }, [formData, validation, validationConfig.validateOnChange]);

  const updateMultipleFields = useCallback((updates: Partial<T>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  }, []);

  const resetForm = useCallback(() => {
    setFormData(initialData);
    validation.clearErrors();
  }, [initialData, validation]);

  // Handler de submit
  const handleSubmit = useCallback(async (
    submitFunction?: (data: T) => Promise<void> | void
  ) => {
    const currentData = formData as T;
    const validationResult = validation.validateData(currentData);

    if (!validationResult.isValid) {
      return false;
    }

    setIsSubmitting(true);

    try {
      if (submitFunction) {
        await submitFunction(currentData);
      }
      
      onSuccess?.(currentData);
      
      if (resetOnSuccess) {
        resetForm();
      }
      
      closeModal();
      return true;
    } catch (error) {
      console.error('Erro no submit do formulário:', error);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validation, onSuccess, resetOnSuccess, resetForm, closeModal]);

  // Handler de cancelamento
  const handleCancel = useCallback(() => {
    onCancel?.();
    closeModal();
  }, [onCancel, closeModal]);

  // Verificar se o formulário mudou
  const hasChanges = useCallback(() => {
    return JSON.stringify(formData) !== JSON.stringify(initialData);
  }, [formData, initialData]);

  // Verificar se pode submeter
  const canSubmit = useCallback(() => {
    const validationResult = validation.validateData(formData as T);
    return validationResult.isValid && !isSubmitting && hasChanges();
  }, [validation, formData, isSubmitting, hasChanges]);

  return {
    // Estados do modal
    isOpen,
    isSubmitting,

    // Estados do formulário
    formData,
    validation: validation.validationState,

    // Estados derivados
    hasChanges: hasChanges(),
    canSubmit: canSubmit(),
    isValid: validation.isValid,

    // Ações do modal
    openModal,
    closeModal,

    // Ações do formulário
    updateField,
    updateMultipleFields,
    resetForm,
    handleSubmit,
    handleCancel,

    // Validação
    validateData: validation.validateData,
    validateField: validation.validateField,
    getFieldError: validation.getFieldError,
    hasFieldError: validation.hasFieldError,
    clearErrors: validation.clearErrors,

    // Configuração
    config,
  };
};