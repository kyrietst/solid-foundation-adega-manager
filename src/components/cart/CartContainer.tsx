/**
 * Container do Cart - Coordena dados e lógica
 * Implementa padrão Container/Presentational
 */

import React from 'react';
import { useCartPresentation, CartPresentationConfig } from '@/hooks/cart/useCartPresentation';
import { CartPresentation } from './CartPresentation';

export interface CartContainerProps extends CartPresentationConfig {}

export const CartContainer: React.FC<CartContainerProps> = (config) => {
  // Lógica centralizada
  const {
    // Dados principais
    items,
    selectedCustomer,
    paymentMethods,
    cartSummary,
    validation,

    // Estados
    paymentMethodId,
    discount,
    isCustomerModalOpen,
    isLoadingPaymentMethods,
    isProcessingSale,

    // Estados de apresentação
    isEmpty,
    hasErrors,
    canFinalizeSale,
    displayData,

    // Configuração
    config: validationConfig,
    presentationConfig,

    // Ações do carrinho
    updateItemQuantity,
    removeItem,
    setCustomer,

    // Ações do checkout
    setPaymentMethodId,
    handleDiscountChange,
    clearDiscount,
    handleFinishSale,
    openCustomerModal,
    closeCustomerModal,
  } = useCartPresentation(config);

  // Preparar props para apresentação
  const presentationProps = {
    // Dados processados
    items,
    selectedCustomer,
    paymentMethods,
    cartSummary,
    validation,
    displayData,

    // Estados
    paymentMethodId,
    discount,
    isCustomerModalOpen,
    isLoadingPaymentMethods,
    isProcessingSale,
    isEmpty,
    hasErrors,
    canFinalizeSale,

    // Configuração
    presentationConfig,
    validationConfig,

    // Ações
    onUpdateQuantity: updateItemQuantity,
    onRemoveItem: removeItem,
    onSelectCustomer: setCustomer,
    onPaymentMethodChange: setPaymentMethodId,
    onDiscountChange: handleDiscountChange,
    onClearDiscount: clearDiscount,
    onFinishSale: handleFinishSale,
    onOpenCustomerModal: openCustomerModal,
    onCloseCustomerModal: closeCustomerModal,
  };

  return <CartPresentation {...presentationProps} />;
};