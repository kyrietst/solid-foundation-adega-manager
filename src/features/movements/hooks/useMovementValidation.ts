/**
 * Hook para validações de movimentações
 * Centraliza todas as regras de validação de formulário
 */

import { MovementFormData } from './useMovementForm';

export interface ValidationError {
  field: string;
  message: string;
}

export const useMovementValidation = () => {
  const validateForm = (form: MovementFormData): ValidationError[] => {
    const errors: ValidationError[] = [];

    // Validações básicas
    if (!form.product_id) {
      errors.push({ field: 'product_id', message: 'Produto é obrigatório' });
    }

    if (!form.quantity) {
      errors.push({ field: 'quantity', message: 'Quantidade é obrigatória' });
    } else {
      const qty = parseInt(form.quantity);
      if (qty <= 0) {
        errors.push({ field: 'quantity', message: 'Quantidade deve ser positiva' });
      }
    }

    // Validações específicas por tipo
    if (form.type === 'fiado') {
      if (!form.customer_id) {
        errors.push({ field: 'customer_id', message: 'Cliente é obrigatório para fiado' });
      }
      if (!form.amount) {
        errors.push({ field: 'amount', message: 'Valor é obrigatório para fiado' });
      }
      if (!form.due_date) {
        errors.push({ field: 'due_date', message: 'Data de vencimento é obrigatória para fiado' });
      }
    }

    if (form.type === 'devolucao') {
      if (!form.sale_id) {
        errors.push({ field: 'sale_id', message: 'Venda original é obrigatória para devolução' });
      }
    }

    return errors;
  };

  const getErrorMessage = (errors: ValidationError[], field: string): string | undefined => {
    const error = errors.find(e => e.field === field);
    return error?.message;
  };

  const hasErrors = (errors: ValidationError[]): boolean => {
    return errors.length > 0;
  };

  const getFirstError = (errors: ValidationError[]): string | undefined => {
    return errors[0]?.message;
  };

  return {
    validateForm,
    getErrorMessage,
    hasErrors,
    getFirstError
  };
};