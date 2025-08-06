/**
 * Hook para validações do carrinho
 * Centraliza todas as regras de negócio do carrinho
 */

import type { CartItem } from '@/features/sales/hooks/use-cart';

export interface CartValidationResult {
  isValid: boolean;
  errors: string[];
  fieldErrors: Record<string, string>;
}

export interface CartValidationConfig {
  maxItems?: number;
  allowDiscounts?: boolean;
  requireCustomer?: boolean;
  requirePaymentMethod?: boolean;
}

export const useCartValidation = (config: CartValidationConfig = {}) => {
  const {
    maxItems = 50,
    allowDiscounts = true,
    requireCustomer = true,
    requirePaymentMethod = true,
  } = config;

  const validateCart = (
    items: CartItem[],
    customerId: string | null,
    paymentMethodId: string,
    discount: number = 0
  ): CartValidationResult => {
    const errors: string[] = [];
    const fieldErrors: Record<string, string> = {};

    // Validação de itens
    if (items.length === 0) {
      errors.push('Adicione produtos para iniciar uma venda');
      fieldErrors.items = 'Carrinho vazio';
    }

    if (items.length > maxItems) {
      errors.push(`Máximo de ${maxItems} itens permitidos no carrinho`);
      fieldErrors.items = `Muitos itens (${items.length}/${maxItems})`;
    }

    // Validação de cliente
    if (requireCustomer && !customerId) {
      errors.push('Selecione um cliente antes de finalizar a venda');
      fieldErrors.customer = 'Cliente obrigatório';
    }

    // Validação de forma de pagamento
    if (requirePaymentMethod && !paymentMethodId) {
      errors.push('Selecione uma forma de pagamento');
      fieldErrors.paymentMethod = 'Forma de pagamento obrigatória';
    }

    // Validação de desconto
    if (allowDiscounts && discount < 0) {
      errors.push('Desconto não pode ser negativo');
      fieldErrors.discount = 'Valor inválido';
    }

    // Validação de quantidades
    const invalidQuantities = items.filter(item => 
      item.quantity <= 0 || item.quantity > item.maxQuantity
    );

    if (invalidQuantities.length > 0) {
      errors.push('Algumas quantidades são inválidas');
      invalidQuantities.forEach(item => {
        fieldErrors[`quantity_${item.id}`] = `Quantidade inválida (máx: ${item.maxQuantity})`;
      });
    }

    // Validação do total
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const total = subtotal - discount;

    if (total <= 0) {
      errors.push('Total da venda deve ser maior que zero');
      fieldErrors.total = 'Total inválido';
    }

    return {
      isValid: errors.length === 0,
      errors,
      fieldErrors
    };
  };

  const getCartSummary = (items: CartItem[], discount: number = 0) => {
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const total = Math.max(0, subtotal - discount);
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

    return {
      subtotal,
      discount,
      total,
      totalItems,
      itemCount: items.length,
    };
  };

  const canApplyDiscount = (subtotal: number, discount: number): boolean => {
    if (!allowDiscounts) return false;
    if (discount < 0) return false;
    if (discount >= subtotal) return false;
    return true;
  };

  const getMaxAllowedDiscount = (subtotal: number): number => {
    if (!allowDiscounts) return 0;
    // Permite desconto de até 95% do subtotal
    return subtotal * 0.95;
  };

  return {
    validateCart,
    getCartSummary,
    canApplyDiscount,
    getMaxAllowedDiscount,
    config: {
      maxItems,
      allowDiscounts,
      requireCustomer,
      requirePaymentMethod,
    }
  };
};