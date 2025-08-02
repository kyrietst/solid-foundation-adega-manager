/**
 * Apresentação pura do Cart
 * Componente sem lógica de negócio, apenas renderização
 */

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CustomerSearch } from '@/components/sales/CustomerSearch';
import { CustomerForm } from '@/components/clients/CustomerForm';
import { CartHeader } from './CartHeader';
import { CartItems } from './CartItems';
import { CartSummary } from './CartSummary';
import { CartActions } from './CartActions';
import type { CartItem } from '@/hooks/use-cart';
import type { CustomerProfile } from '@/hooks/use-crm';
import type { PaymentMethod } from '@/hooks/use-sales';
import type { CartValidationResult } from '@/hooks/cart/useCartValidation';

export interface CartPresentationProps {
  // Dados processados
  items: CartItem[];
  selectedCustomer: CustomerProfile | null;
  paymentMethods: PaymentMethod[];
  cartSummary: {
    subtotal: number;
    discount: number;
    total: number;
    totalItems: number;
    itemCount: number;
  };
  validation: CartValidationResult;
  displayData: {
    itemCount: number;
    totalItems: number;
    subtotalFormatted: number;
    discountFormatted: number;
    totalFormatted: number;
  };

  // Estados
  paymentMethodId: string;
  discount: number;
  isCustomerModalOpen: boolean;
  isLoadingPaymentMethods: boolean;
  isProcessingSale: boolean;
  isEmpty: boolean;
  hasErrors: boolean;
  canFinalizeSale: boolean;

  // Configuração
  presentationConfig: {
    className?: string;
    showCustomerSearch: boolean;
    allowDiscounts: boolean;
    maxItems: number;
  };
  validationConfig: {
    maxItems: number;
    allowDiscounts: boolean;
    requireCustomer: boolean;
    requirePaymentMethod: boolean;
    maxAllowedDiscount: number;
  };

  // Ações
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
  onSelectCustomer: (customerId: string | null) => void;
  onPaymentMethodChange: (value: string) => void;
  onDiscountChange: (value: number) => void;
  onClearDiscount: () => void;
  onFinishSale: () => void;
  onOpenCustomerModal: () => void;
  onCloseCustomerModal: () => void;
}

export const CartPresentation: React.FC<CartPresentationProps> = ({
  items,
  selectedCustomer,
  paymentMethods,
  cartSummary,
  validation,
  displayData,
  paymentMethodId,
  discount,
  isCustomerModalOpen,
  isLoadingPaymentMethods,
  isProcessingSale,
  isEmpty,
  hasErrors,
  canFinalizeSale,
  presentationConfig,
  validationConfig,
  onUpdateQuantity,
  onRemoveItem,
  onSelectCustomer,
  onPaymentMethodChange,
  onDiscountChange,
  onClearDiscount,
  onFinishSale,
  onOpenCustomerModal,
  onCloseCustomerModal,
}) => {
  return (
    <div className={`flex h-full flex-col bg-card lg:border-l ${presentationConfig.className || ''}`}>
      {/* Header */}
      <CartHeader itemCount={displayData.itemCount} />

      {/* Conteúdo principal */}
      <section className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Busca de cliente */}
        {presentationConfig.showCustomerSearch && (
          <CustomerSearch
            selectedCustomer={selectedCustomer}
            onSelect={(customer) => onSelectCustomer(customer?.id || null)}
            onAddNew={onOpenCustomerModal}
          />
        )}

        {/* Modal de novo cliente */}
        <Dialog open={isCustomerModalOpen} onOpenChange={onCloseCustomerModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Novo Cliente</DialogTitle>
            </DialogHeader>
            <CustomerForm onSuccess={onCloseCustomerModal} />
          </DialogContent>
        </Dialog>

        {/* Lista de itens */}
        <CartItems
          items={items}
          onUpdateQuantity={onUpdateQuantity}
          onRemoveItem={onRemoveItem}
          fieldErrors={validation.fieldErrors}
        />
      </section>

      {/* Footer com resumo e ações */}
      {!isEmpty && (
        <footer className="p-4 border-t space-y-4">
          {/* Resumo dos totais */}
          <CartSummary
            subtotal={cartSummary.subtotal}
            discount={cartSummary.discount}
            total={cartSummary.total}
            allowDiscounts={presentationConfig.allowDiscounts}
            maxAllowedDiscount={validationConfig.maxAllowedDiscount}
            onDiscountChange={onDiscountChange}
            onClearDiscount={onClearDiscount}
            fieldErrors={validation.fieldErrors}
          />

          {/* Ações de finalização */}
          <CartActions
            paymentMethods={paymentMethods}
            paymentMethodId={paymentMethodId}
            total={cartSummary.total}
            isLoadingPaymentMethods={isLoadingPaymentMethods}
            isProcessingSale={isProcessingSale}
            canFinalizeSale={canFinalizeSale}
            onPaymentMethodChange={onPaymentMethodChange}
            onFinishSale={onFinishSale}
            fieldErrors={validation.fieldErrors}
          />
        </footer>
      )}
    </div>
  );
};