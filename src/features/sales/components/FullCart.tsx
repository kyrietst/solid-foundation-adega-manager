/**
 * Componente Cart completo - com customer search, discounts e payment processing
 * Usado no POS principal onde precisa de todas as funcionalidades
 * Modernizado com glass morphism e nova paleta preto/dourado
 */

import { useState, useMemo, useEffect } from 'react';
import { useCart, useCartTotal } from '@/features/sales/hooks/use-cart';
import { useCustomer } from '@/features/customers/hooks/use-crm';
import { usePaymentMethods, useUpsertSale } from '@/features/sales/hooks/use-sales';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';
import { formatCurrency, cn } from '@/core/config/utils';
import { getGlassCardClasses, getValueClasses } from '@/core/config/theme-utils';
import { text, shadows } from "@/core/config/theme";

import { Button } from '@/shared/ui/primitives/button';
import { Input } from '@/shared/ui/primitives/input';
import { ScrollArea } from '@/shared/ui/primitives/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/primitives/select';
import { BaseModal } from '@/shared/ui/composite/BaseModal';
import { useToast } from '@/shared/hooks/common/use-toast';

import { CustomerSearch } from './CustomerSearch';
import { CustomerForm } from '@/features/customers/components/CustomerForm';
import { Loader2, ShoppingCart, Trash2, UserPlus, ChevronDown, ChevronUp } from 'lucide-react';
import type { SaleType } from './SalesPage';

export interface FullCartProps {
  className?: string;
  allowDiscounts?: boolean;
  onSaleComplete?: (saleId: string) => void;
  maxItems?: number;
  variant?: 'default' | 'premium' | 'success' | 'warning' | 'error';
  glassEffect?: boolean;
  saleType?: SaleType;
}

export function FullCart({
  className = '',
  allowDiscounts = true,
  onSaleComplete,
  maxItems = 50,
  variant = 'default',
  glassEffect = true,
  saleType = 'presencial'
}: FullCartProps) {
  const { items, updateItemQuantity, removeItem, customerId, setCustomer, clearCart } = useCart();
  const { data: paymentMethods = [], isLoading: isLoadingPaymentMethods } = usePaymentMethods();
  const { data: selectedCustomer } = useCustomer(customerId || '');

  // Query para buscar entregadores disponíveis
  const { data: deliveryPersons = [] } = useQuery({
    queryKey: ['delivery-persons'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, email')
        .eq('role', 'delivery')
        .order('name');

      if (error) throw error;
      return data || [];
    }
  });
  
  const [paymentMethodId, setPaymentMethodId] = useState<string>('');
  const [discount, setDiscount] = useState(0);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [cashReceived, setCashReceived] = useState<number>(0);
  const [showCashInput, setShowCashInput] = useState(false);

  // Estados para delivery
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryFee, setDeliveryFee] = useState<number>(0);
  const [deliveryPersonId, setDeliveryPersonId] = useState<string>('');

  // Estados para controle de seções colapsáveis (responsividade)
  const [isCustomerSectionExpanded, setIsCustomerSectionExpanded] = useState(true);
  const [isPaymentSectionExpanded, setIsPaymentSectionExpanded] = useState(true);
  const [isDeliverySectionExpanded, setIsDeliverySectionExpanded] = useState(true);

  const { toast } = useToast();
  const subtotal = useCartTotal();
  const upsertSale = useUpsertSale();

  const total = useMemo(() => {
    const baseTotal = subtotal - (allowDiscounts ? discount : 0);
    const deliveryTotal = saleType === 'delivery' ? deliveryFee : 0;
    const calculatedTotal = baseTotal + deliveryTotal;
    return calculatedTotal > 0 ? calculatedTotal : 0;
  }, [subtotal, discount, allowDiscounts, saleType, deliveryFee]);

  // Lógica para detectar pagamento em dinheiro
  const selectedPaymentMethod = paymentMethods.find(m => m.id === paymentMethodId);
  const isCashPayment = selectedPaymentMethod?.type === 'cash' || selectedPaymentMethod?.name === 'Dinheiro';

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
    if (saleType === 'delivery' && selectedCustomer?.address && !deliveryAddress) {
      // Se address é string, usar diretamente. Se é objeto, converter para string
      const addressString = typeof selectedCustomer.address === 'string'
        ? selectedCustomer.address
        : JSON.stringify(selectedCustomer.address);
      setDeliveryAddress(addressString);
    }
  }, [saleType, selectedCustomer, deliveryAddress]);

  const glassClasses = glassEffect ? getGlassCardClasses(variant) : '';

  const handleFinishSale = async () => {
    if (!paymentMethodId) {
      toast({
        title: "Erro",
        description: "Selecione um método de pagamento",
        variant: "destructive",
      });
      return;
    }

    if (items.length === 0) {
      toast({
        title: "Erro", 
        description: "Adicione produtos ao carrinho",
        variant: "destructive",
      });
      return;
    }

    // Validação específica para pagamento em dinheiro
    if (isCashPayment && cashReceived < total) {
      toast({
        title: "Valor insuficiente",
        description: "O valor recebido deve ser maior ou igual ao total da venda",
        variant: "destructive",
      });
      return;
    }

    // Validações específicas para delivery
    if (saleType === 'delivery') {
      if (!deliveryAddress.trim()) {
        toast({
          title: "Endereço obrigatório",
          description: "Informe o endereço de entrega",
          variant: "destructive",
        });
        return;
      }

      if (!deliveryPersonId) {
        toast({
          title: "Entregador obrigatório",
          description: "Selecione um entregador para o delivery",
          variant: "destructive",
        });
        return;
      }
    }

    try {
      console.log('🚀 DEBUG FullCart: saleType recebido no prop:', saleType);
      console.log('🚀 DEBUG FullCart: deliveryAddress:', deliveryAddress);
      console.log('🚀 DEBUG FullCart: deliveryFee:', deliveryFee);
      console.log('🚀 DEBUG FullCart: deliveryPersonId:', deliveryPersonId);
      const saleData = {
        customer_id: customerId || null, // ✅ CORREÇÃO: Converter string vazia para null
        total_amount: subtotal, // ✅ CORREÇÃO: Passar subtotal (sem desconto) para o procedimento
        payment_method_id: paymentMethodId,
        discount_amount: allowDiscounts ? discount : 0, // ✅ CORREÇÃO: Adicionar campo discount_amount
        saleType: saleType, // ✅ CORREÇÃO: Usar saleType do prop em vez de hardcode
        // Dados de delivery (se aplicável)
        delivery_address: saleType === 'delivery' ? deliveryAddress : null,
        delivery_fee: saleType === 'delivery' ? deliveryFee : 0,
        delivery_person_id: saleType === 'delivery' ? (deliveryPersonId || null) : null, // ✅ CORREÇÃO: Converter string vazia para null
        items: items.map(item => {
          const itemData = {
            product_id: item.id,
            variant_id: item.variant_id,
            quantity: item.quantity,
            unit_price: item.price,
            units_sold: item.units_sold,
            // Campos legados para compatibilidade - CORREÇÃO: converter variant_type para sale_type
            sale_type: item.variant_type === 'package' ? 'package' : 'unit',
            package_units: item.packageUnits
          };


          return itemData;
        }),
        notes: `Desconto aplicado: R$ ${allowDiscounts ? discount.toFixed(2) : '0.00'}`
      };

      console.log('📦 DEBUG FullCart: saleData completo antes de enviar:', JSON.stringify(saleData, null, 2));
      

      const result = await upsertSale.mutateAsync(saleData);
      
      if (result?.id) {
        toast({
          title: "Sucesso!",
          description: "Venda finalizada com sucesso",
        });
        
        clearCart();
        setPaymentMethodId('');
        setDiscount(0);
        setCashReceived(0);
        setShowCashInput(false);

        // Limpar campos de delivery
        setDeliveryAddress('');
        setDeliveryFee(0);
        setDeliveryPersonId('');
        
        if (onSaleComplete) {
          onSaleComplete(result.id);
        }
      }
    } catch (error) {
      console.error('Erro ao finalizar venda:', error);
      toast({
        title: "Erro",
        description: "Erro ao finalizar venda. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  if (items.length === 0) {
    return (
      <div className={cn('bg-black/70 backdrop-blur-xl border border-white/20 rounded-lg py-16 px-8 text-center', className)}>
        <div className="space-y-8">
          {/* Ícone principal */}
          <div className="mx-auto w-24 h-24 bg-gray-800/50 rounded-full flex items-center justify-center border-2 border-gray-600/30 backdrop-blur-sm">
            <ShoppingCart className="h-12 w-12 text-gray-400" aria-hidden="true" />
          </div>
          
          {/* Conteúdo */}
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
        'h-[calc(100vh-120px)] min-h-[600px] max-h-[900px]', // Altura responsiva com limites
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

      {/* Seção Cliente - Colapsável */}
      <div className="flex-shrink-0 border-b border-white/20">
        <div
          className="flex items-center justify-between p-3 cursor-pointer hover:bg-white/5 transition-colors"
          onClick={() => setIsCustomerSectionExpanded(!isCustomerSectionExpanded)}
        >
          <h4 className="text-sm font-medium text-gray-200 flex items-center gap-2">
            Cliente
            {selectedCustomer && (
              <span className="text-xs text-emerald-400">
                ({selectedCustomer.name})
              </span>
            )}
          </h4>
          {isCustomerSectionExpanded ? (
            <ChevronUp className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          )}
        </div>

        {isCustomerSectionExpanded && (
          <div className="px-4 pb-4 space-y-3">
            {selectedCustomer ? (
              <div className="flex items-center justify-between p-3 bg-emerald-500/20 border border-emerald-500/30 backdrop-blur-sm rounded-lg">
                <div>
                  <p className={cn(text.h5, shadows.light, "font-medium text-sm")}>{selectedCustomer.name}</p>
                  <p className={cn(text.h6, shadows.subtle, "text-xs")}>{selectedCustomer.email}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCustomer('')}
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  aria-label={`Remover cliente ${selectedCustomer.name} da venda`}
                >
                  Remover
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <CustomerSearch
                  selectedCustomer={selectedCustomer || null}
                  onSelect={(customer) => setCustomer(customer?.id || null)}
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-yellow-400/30 text-yellow-400 hover:bg-yellow-400/10 hover:border-yellow-400/50 backdrop-blur-sm"
                  onClick={() => setIsCustomerModalOpen(true)}
                >
                  <UserPlus className="h-4 w-4 mr-2 text-yellow-400" aria-hidden="true" />
                  Cadastrar Cliente
                </Button>

                <BaseModal
                  isOpen={isCustomerModalOpen}
                  onClose={() => setIsCustomerModalOpen(false)}
                  title="Novo Cliente"
                  size="lg"
                  maxHeight="85vh"
                  icon={UserPlus}
                  iconColor="text-yellow-400"
                >
                  <div className="min-h-0 overflow-y-auto px-2 py-1">
                    <CustomerForm
                      onSuccess={() => setIsCustomerModalOpen(false)}
                    />
                  </div>
                </BaseModal>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Lista de Produtos - Área central com scroll independente e altura mínima garantida */}
      <div className="flex-1 min-h-[200px] flex flex-col border-b border-white/20">
        <div className="flex items-center justify-between p-3 bg-gray-800/30">
          <h4 className="text-sm font-medium text-gray-200">Produtos no Carrinho</h4>
          <span className="text-xs text-gray-400">{items.length} itens</span>
        </div>

        <ScrollArea className="flex-1 min-h-0">
          <div className="p-4 space-y-3">
            {items.map((item) => (
              <div key={`${item.id}-${item.variant_id}`} className="flex items-center justify-between p-3 glass-subtle rounded-lg hover:bg-primary-yellow/5 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm text-gray-100 truncate">{item.name}</h4>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full flex-shrink-0 ${
                      item.variant_type === 'package'
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        : 'bg-green-500/20 text-green-300 border border-green-500/30'
                    }`}>
                      {item.variant_type === 'package' ? `${item.packageUnits || 1}x` : 'Un'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">
                    {formatCurrency(item.price)} × {item.quantity}
                    {item.variant_type === 'package' && item.packageUnits && (
                      <span className="ml-1 text-blue-300">
                        ({item.units_sold} unid.)
                      </span>
                    )}
                  </p>
                </div>

                <div className="flex items-center space-x-2 flex-shrink-0">
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => updateItemQuantity(item.id, item.variant_id, Math.max(0, item.quantity - 1))}
                      className="h-6 w-6 p-0 text-gray-300 hover:text-primary-yellow hover:bg-primary-yellow/10"
                    >
                      -
                    </Button>
                    <span className="w-8 text-center text-sm text-gray-200">{item.quantity}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => updateItemQuantity(item.id, item.variant_id, item.quantity + 1)}
                      className="h-6 w-6 p-0 text-gray-300 hover:text-primary-yellow hover:bg-primary-yellow/10"
                      disabled={item.quantity >= maxItems}
                    >
                      +
                    </Button>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(item.id, item.variant_id)}
                    className="h-6 w-6 p-0 text-accent-red hover:text-accent-red/80 hover:bg-accent-red/10"
                  >
                    <Trash2 className="h-3 w-3" aria-hidden="true" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Footer com Formulários - Colapsável por seção */}
      <div className="flex-shrink-0">
        {/* Seção Pagamento - Colapsável */}
        <div className="border-b border-white/20">
          <div
            className="flex items-center justify-between p-3 cursor-pointer hover:bg-white/5 transition-colors"
            onClick={() => setIsPaymentSectionExpanded(!isPaymentSectionExpanded)}
          >
            <h4 className="text-sm font-medium text-gray-200 flex items-center gap-2">
              Pagamento
              {paymentMethodId && (
                <span className="text-xs text-green-400">
                  ({paymentMethods.find(m => m.id === paymentMethodId)?.name})
                </span>
              )}
            </h4>
            {isPaymentSectionExpanded ? (
              <ChevronUp className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            )}
          </div>

          {isPaymentSectionExpanded && (
            <div className="px-4 pb-4 space-y-4">
              {/* Discount */}
              {allowDiscounts && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-200">Desconto</label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={discount}
                    onChange={(e) => setDiscount(Math.max(0, Number(e.target.value)))}
                    className="text-sm bg-gray-800/50 border-primary-yellow/30 text-gray-200 focus:border-primary-yellow"
                  />
                </div>
              )}

              {/* Payment Method */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-200">Método de Pagamento *</label>
                <Select value={paymentMethodId} onValueChange={setPaymentMethodId}>
                  <SelectTrigger className="bg-gray-800/50 border-primary-yellow/30 text-gray-200">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-primary-yellow/30">
                    {paymentMethods.map((method) => (
                      <SelectItem key={method.id} value={method.id} className="text-gray-200 hover:bg-primary-yellow/10">
                        {method.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Campo Valor Recebido - só aparece se for dinheiro */}
              {showCashInput && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-200">Valor Recebido</label>
                  <Input
                    type="number"
                    placeholder="0,00"
                    value={cashReceived || ''}
                    onChange={(e) => setCashReceived(Math.max(0, Number(e.target.value)))}
                    className="text-sm bg-gray-800/50 border-primary-yellow/30 text-gray-200 focus:border-primary-yellow"
                    step="0.01"
                    min="0"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Seção Delivery - só aparece se for delivery e é colapsável */}
        {saleType === 'delivery' && (
          <div className="border-b border-white/20">
            <div
              className="flex items-center justify-between p-3 cursor-pointer hover:bg-white/5 transition-colors"
              onClick={() => setIsDeliverySectionExpanded(!isDeliverySectionExpanded)}
            >
              <h4 className="text-sm font-medium text-gray-200 flex items-center gap-2">
                Entrega
                {deliveryAddress && (
                  <span className="text-xs text-orange-400 truncate max-w-32">
                    ({deliveryAddress})
                  </span>
                )}
              </h4>
              {isDeliverySectionExpanded ? (
                <ChevronUp className="h-4 w-4 text-gray-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-400" />
              )}
            </div>

            {isDeliverySectionExpanded && (
              <div className="px-4 pb-4 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-200">Endereço de Entrega *</label>
                  <Input
                    placeholder="Ex: Rua das Flores, 123, Bela Vista"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className="text-sm bg-gray-800/50 border-orange-400/30 text-gray-200 focus:border-orange-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-200">Taxa</label>
                    <Input
                      type="number"
                      placeholder="0,00"
                      value={deliveryFee || ''}
                      onChange={(e) => setDeliveryFee(Math.max(0, Number(e.target.value)))}
                      className="text-sm bg-gray-800/50 border-orange-400/30 text-gray-200 focus:border-orange-400"
                      step="0.01"
                      min="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-200">Entregador</label>
                    <Select value={deliveryPersonId} onValueChange={setDeliveryPersonId}>
                      <SelectTrigger className="bg-gray-800/50 border-orange-400/30 text-gray-200">
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-orange-400/30">
                        {deliveryPersons.map((person) => (
                          <SelectItem key={person.id} value={person.id} className="text-gray-200 hover:bg-orange-400/10">
                            {person.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Totais e Botão Final - Sempre visível */}
        <div className="p-4 space-y-4">
          {/* Totals */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">Subtotal:</span>
              <span className="text-gray-200">{formatCurrency(subtotal)}</span>
            </div>
            {allowDiscounts && discount > 0 && (
              <div className="flex justify-between text-sm text-accent-red">
                <span>Desconto:</span>
                <span>-{formatCurrency(discount)}</span>
              </div>
            )}
            {saleType === 'delivery' && deliveryFee > 0 && (
              <div className="flex justify-between text-sm text-orange-400">
                <span>Taxa de Entrega:</span>
                <span>+{formatCurrency(deliveryFee)}</span>
              </div>
            )}
            <div className="flex justify-between items-center text-lg font-bold pt-2 border-t border-primary-yellow/20">
              <span className="text-gray-100">Total:</span>
              <span className="text-primary-yellow">{formatCurrency(total)}</span>
            </div>

            {/* Troco - só aparece se for dinheiro e houver valor recebido */}
            {isCashPayment && cashReceived > 0 && (
              <>
                <div className="flex justify-between text-sm pt-2 border-t border-gray-600/20">
                  <span className="text-gray-300">Valor Recebido:</span>
                  <span className="text-gray-200">{formatCurrency(cashReceived)}</span>
                </div>
                <div className="flex justify-between text-sm text-green-400 font-semibold">
                  <span>Troco:</span>
                  <span>{formatCurrency(change)}</span>
                </div>
              </>
            )}
          </div>

          {/* Finish Sale Button */}
          <Button
            onClick={handleFinishSale}
            disabled={upsertSale.isPending || !paymentMethodId || total <= 0}
            className="w-full bg-primary-yellow text-black hover:bg-primary-yellow/90 font-semibold py-3"
          >
            {upsertSale.isPending ? (
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
    </div>
  );
}