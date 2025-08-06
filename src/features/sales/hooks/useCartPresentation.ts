/**
 * Hook coordenador para apresentação do carrinho
 * Combina todos os hooks do carrinho em uma interface única
 */

import { useCheckout } from './useCheckout';
import { CartValidationConfig } from './useCartValidation';

export interface CartPresentationConfig extends CartValidationConfig {
  className?: string;
  showCustomerSearch?: boolean;
  allowDiscounts?: boolean;
  onSaleComplete?: (saleId: string) => void;
  maxItems?: number;
}

export const useCartPresentation = (config: CartPresentationConfig = {}) => {
  const {
    className,
    showCustomerSearch = true,
    allowDiscounts = true,
    onSaleComplete,
    maxItems = 50,
    ...checkoutConfig
  } = config;

  // Lógica principal do checkout
  const checkout = useCheckout({
    ...checkoutConfig,
    allowDiscounts,
    maxItems,
    onSaleComplete,
    requireCustomer: showCustomerSearch,
  });

  // Estados derivados para apresentação
  const isEmpty = checkout.items.length === 0;
  const hasErrors = !checkout.validation.isValid;
  const canFinalizeSale = checkout.validation.isValid && !checkout.isProcessingSale;

  // Formatação para apresentação
  const displayData = {
    itemCount: checkout.cartSummary.itemCount,
    totalItems: checkout.cartSummary.totalItems,
    subtotalFormatted: checkout.cartSummary.subtotal,
    discountFormatted: checkout.cartSummary.discount,
    totalFormatted: checkout.cartSummary.total,
  };

  return {
    // Dados principais
    ...checkout,

    // Estados de apresentação
    isEmpty,
    hasErrors,
    canFinalizeSale,
    displayData,

    // Configuração de apresentação
    presentationConfig: {
      className,
      showCustomerSearch,
      allowDiscounts,
      maxItems,
    },
  };
};