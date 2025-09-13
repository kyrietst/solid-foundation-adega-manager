/**
 * useStandardForm.ts - Hook padronizado para formulários
 * Elimina duplicação de useForm + zodResolver + useToast em 115+ ocorrências
 * 
 * @author Adega Manager Team
 * @version 1.0.0
 */

import { useState, useCallback } from 'react';
import { useForm, UseFormReturn, UseFormProps, FieldValues, Path } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from './use-toast';

export interface UseStandardFormConfig<T extends FieldValues> {
  /** Schema de validação Zod */
  schema: z.ZodSchema<T>;
  /** Função de submissão */
  onSubmit: (data: T) => Promise<void> | void;
  /** Mensagem de sucesso (ou função que retorna mensagem) */
  onSuccess?: string | ((data: T) => string);
  /** Mensagem de erro personalizada */
  onError?: string | ((error: Error) => string);
  /** Valores padrão do formulário */
  defaultValues?: Partial<T>;
  /** Modo de validação */
  mode?: UseFormProps<T>['mode'];
  /** Se deve resetar o form após sucesso */
  resetOnSuccess?: boolean;
  /** Callback chamado após sucesso */
  onSuccessCallback?: (data: T) => void;
  /** Callback chamado após erro */
  onErrorCallback?: (error: Error) => void;
}

export interface UseStandardFormReturn<T extends FieldValues> {
  /** Instância do react-hook-form */
  form: UseFormReturn<T>;
  /** Estado de loading */
  isLoading: boolean;
  /** Função de submissão processada */
  handleSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  /** Função para setar campo específico */
  setValue: (field: Path<T>, value: any) => void;
  /** Função para setar erro específico */
  setError: (field: Path<T>, error: { message: string }) => void;
  /** Função para limpar o formulário */
  reset: (values?: Partial<T>) => void;
  /** Função para validar campo específico */
  trigger: (field?: Path<T> | Path<T>[]) => Promise<boolean>;
}

export const useStandardForm = <T extends FieldValues>({
  schema,
  onSubmit,
  onSuccess = 'Operação realizada com sucesso!',
  onError = 'Erro ao processar operação',
  defaultValues,
  mode = 'onBlur',
  resetOnSuccess = false,
  onSuccessCallback,
  onErrorCallback
}: UseStandardFormConfig<T>): UseStandardFormReturn<T> => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues,
    mode
  });

  const handleSubmit = useCallback(async (e?: React.BaseSyntheticEvent) => {
    if (e) {
      e.preventDefault();
    }

    setIsLoading(true);

    try {
      const data = await form.handleSubmit(async (formData) => {
        await onSubmit(formData);
        
        // Mostrar toast de sucesso
        const successMessage = typeof onSuccess === 'function' 
          ? onSuccess(formData) 
          : onSuccess;
        
        toast({
          title: 'Sucesso',
          description: successMessage,
          variant: 'default'
        });

        // Reset form se configurado
        if (resetOnSuccess) {
          form.reset();
        }

        // Callback de sucesso
        onSuccessCallback?.(formData);
      })(e);

      return data;
    } catch (error) {
      const errorMessage = typeof onError === 'function'
        ? onError(error as Error)
        : onError;

      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive'
      });

      // Callback de erro
      onErrorCallback?.(error as Error);
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [form, onSubmit, onSuccess, onError, resetOnSuccess, onSuccessCallback, onErrorCallback, toast]);

  return {
    form,
    isLoading,
    handleSubmit,
    setValue: form.setValue,
    setError: form.setError,
    reset: form.reset,
    trigger: form.trigger
  };
};

/**
 * Hook especializado para formulários de modal
 * Inclui funcionalidade de fechamento automático após sucesso
 */
export const useModalForm = <T extends FieldValues>(
  config: UseStandardFormConfig<T> & { onClose?: () => void }
) => {
  const { onClose, onSuccessCallback, ...restConfig } = config;

  const enhancedSuccessCallback = useCallback((data: T) => {
    onSuccessCallback?.(data);
    onClose?.();
  }, [onSuccessCallback, onClose]);

  return useStandardForm({
    ...restConfig,
    onSuccessCallback: enhancedSuccessCallback,
    resetOnSuccess: true
  });
};

/**
 * Hook especializado para formulários de entidade (CRUD)
 * Inclui padrões comuns para operações de entidade
 */
export const useEntityForm = <T extends FieldValues>(
  config: UseStandardFormConfig<T> & {
    entityName: string;
    operation: 'create' | 'update' | 'delete';
  }
) => {
  const { entityName, operation, onSuccess, onError, ...restConfig } = config;

  const defaultSuccessMessage = {
    create: `${entityName} criado com sucesso!`,
    update: `${entityName} atualizado com sucesso!`,  
    delete: `${entityName} excluído com sucesso!`
  };

  const defaultErrorMessage = {
    create: `Erro ao criar ${entityName}`,
    update: `Erro ao atualizar ${entityName}`,
    delete: `Erro ao excluir ${entityName}`
  };

  return useStandardForm({
    ...restConfig,
    onSuccess: onSuccess || defaultSuccessMessage[operation],
    onError: onError || defaultErrorMessage[operation]
  });
};

export default useStandardForm;