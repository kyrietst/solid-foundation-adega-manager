/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/label-has-associated-control */
/**
 * Componente Cart completo - Refatorado e Fragmentado
 * Usado no POS principal onde precisa de todas as funcionalidades
 * Modernizado com glass morphism e nova paleta preto/dourado
 */

import { useState, useMemo, useEffect, useId } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { useCart, useCartTotal } from '@/features/sales/hooks/use-cart';
import { useCustomer } from '@/features/customers/hooks/use-crm';
import { usePaymentMethods } from '@/features/sales/hooks/use-sales';
import { useCheckout } from '@/features/sales/hooks/useCheckout';
import { useDeliveryPersons } from '@/features/delivery/hooks/useDeliveryPersons';
import { cn } from '@/core/config/utils';
import { getGlassCardClasses, getValueClasses } from '@/core/config/theme-utils';
import { text, shadows } from "@/core/config/theme";
import { FiscalAddress } from '@/core/types/fiscal.types';

import { Button } from '@/shared/ui/primitives/button';
import { ScrollArea } from '@/shared/ui/primitives/scroll-area';
import { Loader2, ShoppingCart, Trash2 } from 'lucide-react';
import type { SaleType } from './SalesPage';

// Import New Sub-components
import { CartItemList } from './CartItemList';
import { CartCustomerSelector } from './CartCustomerSelector';
import { CartPaymentSection } from './CartPaymentSection';
import { CartDeliverySection } from './CartDeliverySection';
import { CartTotals } from './CartTotals';

export interface CartProps {
  className?: string;
  showCustomerSearch?: boolean; // Prop mantida para compatibilidade, mas o controle agora é interno no CartCustomerSelector
  allowDiscounts?: boolean;
  onSaleComplete?: (saleId: string) => void;
  maxItems?: number;
  variant?: 'default' | 'premium' | 'success' | 'warning' | 'error';
  glassEffect?: boolean;
  saleType?: SaleType;
}

export function Cart({
  className = '',
  allowDiscounts = true,
  onSaleComplete,
  maxItems = 50,
  variant = 'default',
  glassEffect = true,
  saleType = 'presencial'
}: CartProps) {
  // ✅ ACCESSIBILITY FIX: Generate unique ID prefix to prevent duplicate IDs when Cart is rendered multiple times
  const cartId = useId();
  const { items, updateItemQuantity, removeItem, customerId, setCustomer, clearCart } = useCart();
  const { data: paymentMethods = [], isLoading: isLoadingPaymentMethods } = usePaymentMethods();
  const { data: selectedCustomer } = useCustomer(customerId || '');

  // Form System for Address
  const addressForm = useForm<FiscalAddress>({
      defaultValues: {
          pais: 'Brasil',
          codigo_pais: '1058'
      }
  });

  // Data Fetching
  const { data: deliveryPersons = [] } = useDeliveryPersons(saleType === 'delivery');

  const [paymentMethodId, setPaymentMethodId] = useState<string>('');
  const [discount, setDiscount] = useState(0);
  const [cashReceived, setCashReceived] = useState<number>(0);
  const [showCashInput, setShowCashInput] = useState(false);

  // Estados para delivery (Address movido para react-hook-form)
  const [deliveryFee, setDeliveryFee] = useState<number>(0);
  const [deliveryPersonId, setDeliveryPersonId] = useState<string>('');

  const subtotal = useCartTotal();

  const total = useMemo(() => {
    const baseTotal = subtotal - (allowDiscounts ? discount : 0);
    const deliveryTotal = saleType === 'delivery' ? deliveryFee : 0;
    const calculatedTotal = baseTotal + deliveryTotal;
    return calculatedTotal > 0 ? calculatedTotal : 0;
  }, [subtotal, discount, allowDiscounts, saleType, deliveryFee]);

  // Lógica para detectar pagamento em dinheiro
  const selectedPaymentMethod = paymentMethods.find(m => m.id === paymentMethodId);
  const isCashPayment = selectedPaymentMethod?.slug === 'dinheiro' || selectedPaymentMethod?.code === '01' || selectedPaymentMethod?.name === 'Dinheiro';

  // Cálculo do troco
  const change = useMemo(() => {
    return isCashPayment && cashReceived > 0 ? Math.max(0, cashReceived - total) : 0;
  }, [isCashPayment, cashReceived, total]);

  // Effect para mostrar/ocultar campo de dinheiro
  useEffect(() => {
    setShowCashInput(isCashPayment);
    if (!isCashPayment) {
      setCashReceived(0);
    }
  }, [isCashPayment]);

  // Autocomplete: Auto-selecionar entregador quando há apenas um disponível
  useEffect(() => {
    if (saleType === 'delivery' && deliveryPersons.length === 1 && !deliveryPersonId) {
      setDeliveryPersonId(deliveryPersons[0].id);
    }
  }, [saleType, deliveryPersons, deliveryPersonId]);

  // Autocomplete: Preencher endereço automaticamente do cliente selecionado
  useEffect(() => {
    if (saleType === 'delivery' && selectedCustomer?.address) {
      const addr = selectedCustomer.address;
      
      // Tentativa de mapeamento inteligente
      if (typeof addr === 'string') {
          // Fallback legacy string
          addressForm.setValue('logradouro', addr); 
          addressForm.setValue('cep', ''); 
      } else if (typeof addr === 'object' && addr !== null) {
          // If customer has structured data (even partial)
          // We map what we can. 
          // Note: In future, customer address should strictly be FiscalAddress too.
          if ((addr as any).street) addressForm.setValue('logradouro', (addr as any).street);
          if ((addr as any).number) addressForm.setValue('numero', (addr as any).number);
          if ((addr as any).neighborhood) addressForm.setValue('bairro', (addr as any).neighborhood);
          if ((addr as any).city) addressForm.setValue('nome_municipio', (addr as any).city);
          if ((addr as any).state) addressForm.setValue('uf', (addr as any).state);
          // If we had IBGE recorded, we would set it here too
          if ((addr as any).ibge) addressForm.setValue('codigo_municipio', (addr as any).ibge);
          if ((addr as any).zip_code) addressForm.setValue('cep', (addr as any).zip_code);
          if ((addr as any).complement) addressForm.setValue('complemento', (addr as any).complement);
      }
    }
  }, [saleType, selectedCustomer, addressForm]);

  // Map internal variantes to Theme variants
  const getGlassVariant = (v: string) => {
    switch (v) {
      case 'success': return 'strong';
      case 'warning': return 'yellow';
      case 'error': return 'strong';
      case 'premium': return 'premium';
      default: return 'default';
    }
  };

  const glassClasses = glassEffect ? getGlassCardClasses(getGlassVariant(variant)) : '';

  // Reset state function
  const resetLocalState = () => {
    setPaymentMethodId('');
    setDiscount(0);
    setCashReceived(0);
    setShowCashInput(false);
    addressForm.reset();
    setDeliveryFee(0);
    setDeliveryPersonId('');
  };

  const { processSale, isProcessing } = useCheckout({
    items,
    subtotal,
    total,
    customerId,
    saleType,
    paymentMethodId,
    discount,
    allowDiscounts,
    deliveryAddress: addressForm.watch(), 
    deliveryFee,
    deliveryPersonId,
    isCashPayment: !!isCashPayment,
    cashReceived,
    onSuccess: (saleId) => onSaleComplete?.(saleId),
    clearCart,
    resetState: resetLocalState
  });

  if (items.length === 0) {
    return (
      <div className={cn('bg-black/70 backdrop-blur-xl border border-white/20 rounded-lg py-16 px-8 text-center', className)}>
        <div className="space-y-8">
          <div className="mx-auto w-24 h-24 bg-gray-800/50 rounded-full flex items-center justify-center border-2 border-gray-600/30 backdrop-blur-sm">
            <ShoppingCart className="h-12 w-12 text-gray-400" aria-hidden="true" />
          </div>
          <div className="space-y-3">
            <h3 className="text-2xl font-bold text-white">Carrinho vazio</h3>
            <p className="text-gray-400 text-lg leading-relaxed">
              Adicione produtos para começar uma venda
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'bg-black/70 backdrop-blur-xl border border-white/20 shadow-lg rounded-lg flex flex-col hero-spotlight',
        'h-[calc(100vh-120px)] min-h-[600px] max-h-[900px]',
        className
      )}
      onMouseMove={(e) => {
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        (e.currentTarget as HTMLElement).style.setProperty("--x", `${x}%`);
        (e.currentTarget as HTMLElement).style.setProperty("--y", `${y}%`);
      }}
    >
      {/* Header Fixo */}
      <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-white/20">
        <h3 className={cn(text.h3, shadows.medium, "text-lg font-semibold")}>
          Carrinho ({items.length}/{maxItems})
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearCart}
          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
          aria-label="Limpar carrinho completamente"
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>

      {/* Seção Cliente */}
      <CartCustomerSelector
        selectedCustomer={selectedCustomer}
        onSelectCustomer={setCustomer}
      />

      {/* Lista de Produtos */}
      <CartItemList
        items={items}
        maxItems={maxItems}
        onUpdateQuantity={updateItemQuantity}
        onRemoveItem={removeItem}
      />

      {/* Footer com Formulários */}
      <ScrollArea className="flex-shrink-0 max-h-[400px]">
        <div>
          {/* Seção Pagamento */}
          <CartPaymentSection
            cartId={cartId}
            paymentMethods={paymentMethods}
            allowDiscounts={allowDiscounts}
            paymentMethodId={paymentMethodId}
            discount={discount}
            cashReceived={cashReceived}
            showCashInput={showCashInput}
            onPaymentMethodChange={setPaymentMethodId}
            onDiscountChange={(val) => setDiscount(Math.max(0, val))}
            onCashReceivedChange={(val) => setCashReceived(Math.max(0, val))}
          />

          {/* Seção Delivery */}
          {saleType === 'delivery' && (
            <FormProvider {...addressForm}>
                 <CartDeliverySection
                    cartId={cartId}
                    deliveryFee={deliveryFee}
                    deliveryPersonId={deliveryPersonId}
                    deliveryPersons={deliveryPersons}
                    onFeeChange={setDeliveryFee}
                    onDeliveryPersonChange={setDeliveryPersonId}
                 />
            </FormProvider>
          )}

          {/* Totais e Botão Final */}
          <div className="p-4 space-y-4">
            <CartTotals
              subtotal={subtotal}
              discount={discount}
              deliveryFee={deliveryFee}
              total={total}
              cashReceived={cashReceived}
              change={change}
              showDiscount={allowDiscounts}
              showDelivery={saleType === 'delivery'}
              showChange={isCashPayment}
            />

            <Button
              onClick={processSale}
              disabled={isProcessing || !paymentMethodId || total <= 0}
              className="w-full bg-primary-yellow text-black hover:bg-primary-yellow/90 font-semibold py-3"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin text-black" />
                  Finalizando...
                </>
              ) : (
                'Finalizar Venda'
              )}
            </Button>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}

// Legacy alias for backward compatibility
export const FullCart = Cart;
