/**
 * Hook para processo de checkout
 * Centraliza lógica de finalização de venda
 * Refatorado para usar Single Source of Truth (create_inventory_movement RPC)
 */

import { useState } from 'react';
import { useCart, useCartTotal, type CartItem } from './use-cart';
import { useCustomer } from '@/features/customers/hooks/use-crm';
import { usePaymentMethods, useUpsertSale } from './use-sales';
import { useToast } from '@/shared/hooks/common/use-toast';
import { useCartValidation, CartValidationConfig } from './useCartValidation';
import { useInventoryMovements } from '@/features/inventory/hooks/useInventoryMovements';

export const useCheckout = (
  config: CartValidationConfig & {
    onSaleComplete?: (saleId: string) => void;
  } = {}
) => {
  const { onSaleComplete, ...validationConfig } = config;
  
  const { 
    items, 
    updateItemQuantity, 
    removeItem, 
    customerId, 
    setCustomer, 
    clearCart 
  } = useCart();
  
  const { data: paymentMethods = [], isLoading: isLoadingPaymentMethods } = usePaymentMethods();
  const { data: selectedCustomer } = useCustomer(customerId || '');
  const subtotal = useCartTotal();
  const upsertSale = useUpsertSale();
  const { toast } = useToast();
  const { createSaleMovement } = useInventoryMovements();

  // Estados locais
  const [paymentMethodId, setPaymentMethodId] = useState<string>('');
  const [discount, setDiscount] = useState(0);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);

  // Validações
  const { validateCart, getCartSummary, canApplyDiscount, getMaxAllowedDiscount } = 
    useCartValidation(validationConfig);

  // Resumo do carrinho
  const cartSummary = getCartSummary(items, discount);

  // Validação atual
  const validation = validateCart(items, customerId, paymentMethodId, discount);

  // Handler para finalizar venda
  const handleFinishSale = async () => {
    const currentValidation = validateCart(items, customerId, paymentMethodId, discount);
    
    if (!currentValidation.isValid) {
      // Mostrar primeiro erro
      toast({ 
        title: 'Erro na validação', 
        description: currentValidation.errors[0], 
        variant: 'destructive' 
      });
      return;
    }

    try {
      const saleData = await new Promise<{ id: string }>((resolve, reject) => {
        upsertSale.mutate(
          {
            customer_id: customerId!,
            payment_method_id: paymentMethodId,
            total_amount: cartSummary.subtotal, // Enviar subtotal (antes do desconto)
            discount_amount: discount > 0 ? discount : undefined, // Enviar desconto separadamente
            items: items.map(item => {
              // Para pacotes: quantity sempre = 1, e estoque será descontado pelo packageUnits
              // Para unidades: quantity = quantidade selecionada
              const correctQuantity = item.type === 'package' ? 1 : item.quantity;


              return {
                product_id: item.id,
                quantity: correctQuantity,
                unit_price: item.price,
                sale_type: item.type, // Adicionar tipo de venda
                package_units: item.packageUnits // Para controle de estoque
              };
            })
          },
          {
            onSuccess: (data) => resolve(data),
            onError: (error) => reject(error)
          }
        );
      });

      // Criar movimentações de estoque para cada item usando nossa nova RPC
      for (const item of items) {
        const quantityToDeduct = item.type === 'package' ? item.packageUnits : item.quantity;

        createSaleMovement(
          item.id,
          quantityToDeduct,
          `Venda #${saleData.id} - ${item.name}${item.type === 'package' ? ' (pacote)' : ''}`,
          saleData.id,
          customerId || undefined,
          {
            sale_id: saleData.id,
            sale_type: item.type,
            package_units: item.packageUnits,
            unit_price: item.price,
            quantity_sold: item.quantity,
            customer_id: customerId
          }
        );
      }

      // Sucesso
      toast({
        title: 'Venda finalizada!',
        description: 'A venda foi registrada com sucesso.'
      });

      // Reset do estado
      clearCart();
      setDiscount(0);
      setPaymentMethodId('');
      onSaleComplete?.(saleData.id);

    } catch (error: unknown) {
      toast({
        title: 'Erro ao finalizar a venda',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive'
      });
    }
  };

  // Handler para aplicar desconto
  const handleDiscountChange = (value: number) => {
    const maxDiscount = getMaxAllowedDiscount(subtotal);
    const validDiscount = Math.max(0, Math.min(value, maxDiscount));
    setDiscount(validDiscount);
  };

  // Handler para remover desconto
  const clearDiscount = () => setDiscount(0);

  // Handler para abrir modal de cliente
  const openCustomerModal = () => setIsCustomerModalOpen(true);

  // Handler para fechar modal de cliente
  const closeCustomerModal = () => setIsCustomerModalOpen(false);

  return {
    // Dados
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
    isProcessingSale: upsertSale.isPending,

    // Configuração
    config: {
      ...validationConfig,
      maxAllowedDiscount: getMaxAllowedDiscount(subtotal),
    },

    // Ações do carrinho
    updateItemQuantity,
    removeItem,
    setCustomer,
    clearCart,

    // Ações do checkout
    setPaymentMethodId,
    handleDiscountChange,
    clearDiscount,
    handleFinishSale,
    openCustomerModal,
    closeCustomerModal,

    // Utilities
    canApplyDiscount: (value: number) => canApplyDiscount(subtotal, value),
  };
};