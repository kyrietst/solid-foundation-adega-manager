import { useForm, UseFormProps, UseFormReturn, FieldValues, Path } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import { ZodSchema } from 'zod';
import { UseMutationResult } from '@tanstack/react-query';

export interface UseFormWithToastOptions<T extends FieldValues> extends UseFormProps<T> {
  schema: ZodSchema<T>;
  successMessage?: string;
  successDescription?: string;
  errorTitle?: string;
  onSuccess?: (data?: any) => void;
  onError?: (error: Error) => void;
}

export interface UseFormWithToastReturn<T extends FieldValues> extends UseFormReturn<T> {
  handleSubmit: (mutation: UseMutationResult<any, Error, T>) => (e?: React.BaseSyntheticEvent) => Promise<void>;
  handleSubmitWithCallback: (
    callback: (data: T) => Promise<void> | void,
    options?: {
      successMessage?: string;
      successDescription?: string;
      errorTitle?: string;
    }
  ) => (e?: React.BaseSyntheticEvent) => Promise<void>;
  isSubmitting: boolean;
}

/**
 * Hook que combina react-hook-form com toast notifications
 * @param options Configurações do formulário e mensagens
 */
export function useFormWithToast<T extends FieldValues>({
  schema,
  successMessage = 'Sucesso!',
  successDescription = 'Operação realizada com sucesso.',
  errorTitle = 'Erro',
  onSuccess,
  onError,
  ...formOptions
}: UseFormWithToastOptions<T>): UseFormWithToastReturn<T> {
  const { toast } = useToast();
  
  const form = useForm<T>({
    resolver: zodResolver(schema),
    ...formOptions,
  });

  const { formState: { isSubmitting } } = form;

  // Handler para mutations do React Query
  const handleSubmit = (mutation: UseMutationResult<any, Error, T>) => {
    return form.handleSubmit((data: T) => {
      mutation.mutate(data, {
        onSuccess: (result) => {
          toast({
            title: successMessage,
            description: successDescription,
          });
          onSuccess?.(result);
        },
        onError: (error) => {
          toast({
            title: errorTitle,
            description: error.message,
            variant: 'destructive',
          });
          onError?.(error);
        },
      });
    });
  };

  // Handler para callbacks customizados
  const handleSubmitWithCallback = (
    callback: (data: T) => Promise<void> | void,
    options?: {
      successMessage?: string;
      successDescription?: string;
      errorTitle?: string;
    }
  ) => {
    return form.handleSubmit(async (data: T) => {
      try {
        await callback(data);
        toast({
          title: options?.successMessage || successMessage,
          description: options?.successDescription || successDescription,
        });
        onSuccess?.(data);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
        toast({
          title: options?.errorTitle || errorTitle,
          description: errorMessage,
          variant: 'destructive',
        });
        onError?.(error instanceof Error ? error : new Error(errorMessage));
      }
    });
  };

  return {
    ...form,
    handleSubmit,
    handleSubmitWithCallback,
    isSubmitting,
  };
}

// Utility para reset com toast
export function useFormResetWithToast<T extends FieldValues>(
  form: UseFormReturn<T>,
  message = 'Formulário resetado'
) {
  const { toast } = useToast();
  
  const resetWithToast = (values?: Partial<T>) => {
    form.reset(values);
    toast({
      title: message,
      description: 'Os campos foram limpos.',
    });
  };

  return resetWithToast;
}

// Utility para validação de campo com toast
export function useFieldValidationWithToast<T extends FieldValues>(
  form: UseFormReturn<T>
) {
  const { toast } = useToast();
  
  const validateField = async (fieldName: Path<T>): Promise<boolean> => {
    const isValid = await form.trigger(fieldName);
    
    if (!isValid) {
      const error = form.formState.errors[fieldName];
      if (error?.message) {
        toast({
          title: 'Erro de validação',
          description: error.message as string,
          variant: 'destructive',
        });
      }
    }
    
    return isValid;
  };

  return validateField;
}