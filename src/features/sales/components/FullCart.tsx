/**
 * Componente Cart completo - com customer search, discounts e payment processing
 * Usado no POS principal onde precisa de todas as funcionalidades
 * Modernizado com glass morphism e nova paleta preto/dourado
 */

import { useState, useMemo, useEffect } from 'react';
import { useCart, useCartTotal } from '@/features/sales/hooks/use-cart';
import { useCustomer } from '@/features/customers/hooks/use-crm';
import { usePaymentMethods, useUpsertSale } from '@/features/sales/hooks/use-sales';
import { formatCurrency, cn } from '@/core/config/utils';
import { getGlassCardClasses, getValueClasses } from '@/core/config/theme-utils';
import { text, shadows } from "@/core/config/theme";

import { Button } from '@/shared/ui/primitives/button';
import { Input } from '@/shared/ui/primitives/input';
import { ScrollArea } from '@/shared/ui/primitives/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/primitives/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/ui/primitives/dialog';
import { useToast } from '@/shared/hooks/common/use-toast';

import { CustomerSearch } from './CustomerSearch';
import { CustomerForm } from '@/features/customers/components/CustomerForm';
import { Loader2, ShoppingCart, Trash2, UserPlus } from 'lucide-react';

export interface FullCartProps {
  className?: string;
  allowDiscounts?: boolean;
  onSaleComplete?: (saleId: string) => void;
  maxItems?: number;
  variant?: 'default' | 'premium' | 'success' | 'warning' | 'error';
  glassEffect?: boolean;
}

export function FullCart({
  className = '',
  allowDiscounts = true,
  onSaleComplete,
  maxItems = 50,
  variant = 'default',
  glassEffect = true
}: FullCartProps) {
  const { items, updateItemQuantity, removeItem, customerId, setCustomer, clearCart } = useCart();
  const { data: paymentMethods = [], isLoading: isLoadingPaymentMethods } = usePaymentMethods();
  const { data: selectedCustomer } = useCustomer(customerId || '');
  
  const [paymentMethodId, setPaymentMethodId] = useState<string>('');
  const [discount, setDiscount] = useState(0);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [cashReceived, setCashReceived] = useState<number>(0);
  const [showCashInput, setShowCashInput] = useState(false);
  
  const { toast } = useToast();
  const subtotal = useCartTotal();
  const upsertSale = useUpsertSale();

  const total = useMemo(() => {
    const calculatedTotal = subtotal - (allowDiscounts ? discount : 0);
    return calculatedTotal > 0 ? calculatedTotal : 0;
  }, [subtotal, discount, allowDiscounts]);

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

    try {
      const saleData = {
        customer_id: customerId,
        total_amount: total,
        payment_method_id: paymentMethodId,
        items: items.map(item => {
          // CORREÇÃO: Não fazer conversão aqui, deixar o useCheckout/stored procedure fazer
          // O carrinho mantém: 1 pacote = quantity: 1, type: 'package'
          // O stored procedure fará: 1 pacote × 6 unidades = 6 para o estoque
          
          
          return {
            product_id: item.id,
            quantity: item.quantity, // Quantidade original do carrinho (1 para pacotes)
            unit_price: item.price,
            sale_type: item.type, // Adicionar tipo de venda
            package_units: item.packageUnits // Para controle de estoque no stored procedure
          };
        }),
        notes: `Desconto aplicado: R$ ${allowDiscounts ? discount.toFixed(2) : '0.00'}`
      };

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
      className={cn('bg-black/70 backdrop-blur-xl border border-white/20 shadow-lg rounded-lg flex flex-col h-full max-h-[calc(100vh-200px)] hero-spotlight', className)}
      onMouseMove={(e) => {
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        (e.currentTarget as HTMLElement).style.setProperty("--x", `${x}%`);
        (e.currentTarget as HTMLElement).style.setProperty("--y", `${y}%`);
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/20">
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

      {/* Customer Search */}
      <div className="flex-shrink-0 p-4 border-b border-white/20 space-y-3">
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
            <Dialog open={isCustomerModalOpen} onOpenChange={setIsCustomerModalOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="w-full border-yellow-400/30 text-yellow-400 hover:bg-yellow-400/10 hover:border-yellow-400/50 backdrop-blur-sm">
                  <UserPlus className="h-4 w-4 mr-2 text-yellow-400" aria-hidden="true" />
                  Cadastrar Cliente
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[95vw] sm:w-[90vw] md:w-[600px] max-w-[600px] h-[85vh] max-h-[85vh] overflow-hidden bg-black/95 backdrop-blur-sm border border-white/10 flex flex-col">
                <DialogHeader className="flex-shrink-0 pb-4 border-b border-white/20">
                  <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
                    <UserPlus className="h-4 w-4 text-yellow-400" />
                    Novo Cliente
                  </DialogTitle>
                </DialogHeader>
                <div className="flex-1 min-h-0 overflow-y-auto px-2 py-1">
                  <CustomerForm 
                    onSuccess={() => setIsCustomerModalOpen(false)}
                  />
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      {/* Items - Área scrollável otimizada */}
      <ScrollArea className="flex-1 min-h-0 overflow-hidden">
        <div className="p-4 space-y-3">
          {items.map((item) => (
            <div key={`${item.id}-${item.type}`} className="flex items-center justify-between p-3 glass-subtle rounded-lg hover:bg-primary-yellow/5 transition-colors">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-sm text-gray-100">{item.name}</h4>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                    item.type === 'package' 
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' 
                      : 'bg-green-500/20 text-green-300 border border-green-500/30'
                  }`}>
                    {item.type === 'package' ? `Pacote ${item.packageUnits}x` : 'Unidade'}
                  </span>
                </div>
                <p className="text-xs text-gray-400">
                  {formatCurrency(item.price)} × {item.quantity}
                  {item.type === 'package' && item.packageUnits && (
                    <span className="ml-1 text-blue-300">
                      ({item.quantity * item.packageUnits} unid. total)
                    </span>
                  )}
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => updateItemQuantity(item.id, item.type, Math.max(0, item.quantity - 1))}
                    className="h-6 w-6 p-0 text-gray-300 hover:text-primary-yellow hover:bg-primary-yellow/10"
                    aria-label={`Diminuir quantidade de ${item.name} ${item.type === 'package' ? 'Pacote' : 'Unidade'}`}
                  >
                    -
                  </Button>
                  <span className="w-8 text-center text-sm text-gray-200">{item.quantity}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => updateItemQuantity(item.id, item.type, item.quantity + 1)}
                    className="h-6 w-6 p-0 text-gray-300 hover:text-primary-yellow hover:bg-primary-yellow/10"
                    disabled={item.quantity >= maxItems}
                    aria-label={`Aumentar quantidade de ${item.name} ${item.type === 'package' ? 'Pacote' : 'Unidade'}`}
                  >
                    +
                  </Button>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeItem(item.id, item.type)}
                  className="h-6 w-6 p-0 text-accent-red hover:text-accent-red/80 hover:bg-accent-red/10"
                  aria-label={`Remover ${item.name} ${item.type === 'package' ? 'Pacote' : 'Unidade'} do carrinho`}
                >
                  <Trash2 className="h-3 w-3" aria-hidden="true" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Footer - Sempre visível */}
      <div className="flex-shrink-0 border-t border-primary-yellow/20 p-4 space-y-4">
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
          <label className="text-sm font-medium text-gray-200">Método de Pagamento</label>
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
          className="w-full bg-primary-yellow text-black hover:bg-primary-yellow/90 font-semibold"
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
  );
}