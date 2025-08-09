/**
 * Componente Cart completo - com customer search, discounts e payment processing
 * Usado no POS principal onde precisa de todas as funcionalidades
 * Modernizado com glass morphism e nova paleta preto/dourado
 */

import { useState, useMemo } from 'react';
import { useCart, useCartTotal } from '@/features/sales/hooks/use-cart';
import { useCustomer } from '@/features/customers/hooks/use-crm';
import { usePaymentMethods, useUpsertSale } from '@/features/sales/hooks/use-sales';
import { formatCurrency, cn } from '@/core/config/utils';
import { getGlassCardClasses, getValueClasses } from '@/core/config/theme-utils';

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
  
  const { toast } = useToast();
  const subtotal = useCartTotal();
  const upsertSale = useUpsertSale();

  const total = useMemo(() => {
    const calculatedTotal = subtotal - (allowDiscounts ? discount : 0);
    return calculatedTotal > 0 ? calculatedTotal : 0;
  }, [subtotal, discount, allowDiscounts]);

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

    try {
      const saleData = {
        customer_id: customerId,
        total: total,
        discount: allowDiscounts ? discount : 0,
        payment_method_id: paymentMethodId,
        items: items.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          unit_price: item.price,
          total_price: item.price * item.quantity
        }))
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
      <div className={cn(glassClasses, 'p-6 text-center', className)}>
        <ShoppingCart className="mx-auto h-12 w-12 text-primary-yellow/70 mb-4" aria-hidden="true" />
        <p className="text-gray-300">Seu carrinho está vazio</p>
        <p className="text-sm text-gray-400 mt-2">
          Adicione produtos para começar uma venda
        </p>
      </div>
    );
  }

  return (
    <div className={cn(glassClasses, 'flex flex-col h-full', className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-primary-yellow/20">
        <h3 className="text-lg font-semibold text-gray-100">
          Carrinho ({items.length}/{maxItems})
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearCart}
          className="text-accent-red hover:text-accent-red/80 hover:bg-accent-red/10"
          aria-label="Limpar carrinho completamente"
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>

      {/* Customer Search */}
      <div className="p-4 border-b border-primary-yellow/20 space-y-3">
        {selectedCustomer ? (
          <div className="flex items-center justify-between p-3 glass-subtle rounded-lg border border-accent-green/20">
            <div>
              <p className="font-medium text-sm text-gray-100">{selectedCustomer.name}</p>
              <p className="text-xs text-gray-400">{selectedCustomer.email}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCustomer('')}
              className="text-accent-red hover:text-accent-red/80 hover:bg-accent-red/10"
              aria-label={`Remover cliente ${selectedCustomer.name} da venda`}
            >
              Remover
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <CustomerSearch onCustomerSelect={setCustomer} />
            <Dialog open={isCustomerModalOpen} onOpenChange={setIsCustomerModalOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="w-full border-primary-yellow/30 text-gray-200 hover:bg-primary-yellow/10 hover:border-primary-yellow">
                  <UserPlus className="h-4 w-4 mr-2 text-primary-yellow" aria-hidden="true" />
                  Cadastrar Cliente
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="text-gray-100">Novo Cliente</DialogTitle>
                </DialogHeader>
                <CustomerForm 
                  onSuccess={() => setIsCustomerModalOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      {/* Items */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-3 glass-subtle rounded-lg hover:bg-primary-yellow/5 transition-colors">
              <div className="flex-1">
                <h4 className="font-medium text-sm text-gray-100">{item.name}</h4>
                <p className="text-xs text-gray-400">
                  {formatCurrency(item.price)} × {item.quantity}
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => updateItemQuantity(item.id, Math.max(0, item.quantity - 1))}
                    className="h-6 w-6 p-0 text-gray-300 hover:text-primary-yellow hover:bg-primary-yellow/10"
                    aria-label={`Diminuir quantidade de ${item.name}`}
                  >
                    -
                  </Button>
                  <span className="w-8 text-center text-sm text-gray-200">{item.quantity}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                    className="h-6 w-6 p-0 text-gray-300 hover:text-primary-yellow hover:bg-primary-yellow/10"
                    disabled={item.quantity >= maxItems}
                    aria-label={`Aumentar quantidade de ${item.name}`}
                  >
                    +
                  </Button>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeItem(item.id)}
                  className="h-6 w-6 p-0 text-accent-red hover:text-accent-red/80 hover:bg-accent-red/10"
                  aria-label={`Remover ${item.name} do carrinho`}
                >
                  <Trash2 className="h-3 w-3" aria-hidden="true" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t border-primary-yellow/20 p-4 space-y-4">
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