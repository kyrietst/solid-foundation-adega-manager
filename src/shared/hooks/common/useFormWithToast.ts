/**
 * useFormWithToast - Hook centralizado para gerenciamento de formulários
 * Context7 Pattern: DRY principle aplicado para eliminar duplicação
 * Elimina código duplicado em 6+ componentes identificados na análise
 *
 * REFATORAÇÃO APLICADA:
 * - Estado consolidado de form (data, errors, isSubmitting)
 * - Toast integrado para feedback
 * - Validação Zod centralizada
 * - Reset automático em sucesso
 * - Error handling padronizado
 */

import { useState, useCallback } from 'react';
import { z } from 'zod';
import { useToast } from './use-toast';

interface UseFormWithToastOptions<T> {
  schema?: z.ZodSchema<T>;
  onSubmit: (data: T) => Promise<void>;
  onSuccess?: () => void;
  successMessage?: string;
  errorMessage?: string;
  resetOnSuccess?: boolean;
}

interface FormState<T> {
  data: T;
  errors: Record<string, string>;
  isSubmitting: boolean;
}

export const useFormWithToast = <T extends Record<string, any>>(
  initialData: T,
  options: UseFormWithToastOptions<T>
) => {
  const { toast } = useToast();
  const {
    schema,
    onSubmit,
    onSuccess,
    successMessage = 'Operação realizada com sucesso',
    errorMessage = 'Erro ao realizar operação',
    resetOnSuccess = true,
  } = options;

  const [formState, setFormState] = useState<FormState<T>>({
    data: initialData,
    errors: {},
    isSubmitting: false,
  });

  // Atualizar campo específico
  const updateField = useCallback((field: keyof T, value: any) => {
    setFormState(prev => ({
      ...prev,
      data: { ...prev.data, [field]: value },
      errors: { ...prev.errors, [field]: '' }, // Limpar erro do campo
    }));
  }, []);

  // Atualizar múltiplos campos
  const updateFields = useCallback((updates: Partial<T>) => {
    setFormState(prev => ({
      ...prev,
      data: { ...prev.data, ...updates },
    }));
  }, []);

  // Validar dados com Zod
  const validateData = useCallback((data: T): boolean => {
    if (!schema) return true;

    try {
      schema.parse(data);
      setFormState(prev => ({ ...prev, errors: {} }));
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const zodErrors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path) {
            zodErrors[err.path[0]] = err.message;
          }
        });
        setFormState(prev => ({ ...prev, errors: zodErrors }));
      }
      return false;
    }
  }, [schema]);

  // Submit com validação e toast
  const handleSubmit = useCallback(async (event?: React.FormEvent) => {
    if (event) {
      event.preventDefault();
    }

    const { data } = formState;

    // Validar dados se schema fornecido
    if (!validateData(data)) {
      return;
    }

    setFormState(prev => ({ ...prev, isSubmitting: true }));

    try {
      await onSubmit(data);

      // Toast de sucesso
      toast({
        title: 'Sucesso',
        description: successMessage,
      });

      // Reset se configurado
      if (resetOnSuccess) {
        setFormState({
          data: initialData,
          errors: {},
          isSubmitting: false,
        });
      } else {
        setFormState(prev => ({ ...prev, isSubmitting: false }));
      }

      // Callback de sucesso
      onSuccess?.();
    } catch (error) {
      console.error('Erro no submit:', error);

      // Toast de erro
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });

      setFormState(prev => ({ ...prev, isSubmitting: false }));
    }
  }, [formState, validateData, onSubmit, toast, successMessage, errorMessage, resetOnSuccess, initialData, onSuccess]);

  // Reset manual
  const reset = useCallback(() => {
    setFormState({
      data: initialData,
      errors: {},
      isSubmitting: false,
    });
  }, [initialData]);

  // Set errors externos
  const setErrors = useCallback((errors: Record<string, string>) => {
    setFormState(prev => ({ ...prev, errors }));
  }, []);

  // Set loading estado externo
  const setSubmitting = useCallback((isSubmitting: boolean) => {
    setFormState(prev => ({ ...prev, isSubmitting }));
  }, []);

  return {
    // Estado
    data: formState.data,
    errors: formState.errors,
    isSubmitting: formState.isSubmitting,

    // Actions
    updateField,
    updateFields,
    handleSubmit,
    reset,
    setErrors,
    setSubmitting,
    validateData,

    // Helpers
    isValid: Object.keys(formState.errors).length === 0,
    hasErrors: Object.keys(formState.errors).length > 0,
    getError: (field: keyof T) => formState.errors[field as string],
  };
};

export default useFormWithToast;