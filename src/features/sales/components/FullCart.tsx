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
      <div className={cn('bg-black/30 backdrop-blur-xl border border-white/20 rounded-lg p-6 text-center', className)}>
        <ShoppingCart className="mx-auto h-12 w-12 text-yellow-400 mb-4" aria-hidden="true" />
        <p className={cn(text.h4, shadows.medium)}>Seu carrinho está vazio</p>
        <p className={cn(text.h6, shadows.subtle, "text-sm mt-2")}>
          Adicione produtos para começar uma venda
        </p>
      </div>
    );
  }

  return (
    <div 
      className={cn('bg-black/70 backdrop-blur-xl border border-white/20 shadow-lg rounded-lg flex flex-col h-full hero-spotlight', className)}
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
      <div className="p-4 border-b border-white/20 space-y-3">
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
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className={cn(text.h2, shadows.medium)}>Novo Cliente</DialogTitle>
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