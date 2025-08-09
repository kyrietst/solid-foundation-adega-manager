/**
 * Componente Cart simplificado - apenas itens e total
 * Usado quando não precisa de customer search nem discounts
 * Modernizado com glass morphism e nova paleta preto/dourado
 */

import { useMemo } from 'react';
import { useCart, useCartTotal } from '@/features/sales/hooks/use-cart';
import { formatCurrency, cn } from '@/core/config/utils';
import { getGlassCardClasses, getValueClasses } from '@/core/config/theme-utils';

import { Button } from '@/shared/ui/primitives/button';
import { ScrollArea } from '@/shared/ui/primitives/scroll-area';
import { ShoppingCart, Trash2 } from 'lucide-react';

export interface SimpleCartProps {
  className?: string;
  maxItems?: number;
  onCheckout?: (total: number) => void;
  showCheckoutButton?: boolean;
  variant?: 'default' | 'premium' | 'success' | 'warning' | 'error';
  glassEffect?: boolean;
}

export function SimpleCart({
  className = '',
  maxItems = 50,
  onCheckout,
  showCheckoutButton = true,
  variant = 'default',
  glassEffect = true
}: SimpleCartProps) {
  const { items, updateItemQuantity, removeItem, clearCart } = useCart();
  const total = useCartTotal();

  const handleCheckout = () => {
    if (onCheckout && total > 0) {
      onCheckout(total);
    }
  };

  const glassClasses = glassEffect ? getGlassCardClasses(variant) : '';

  if (items.length === 0) {
    return (
      <div className={cn(glassClasses, 'p-6 text-center', className)}>
        <ShoppingCart className="mx-auto h-12 w-12 text-primary-yellow/70 mb-4" />
        <p className="text-gray-300">Seu carrinho está vazio</p>
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
        >
          <Trash2 className="h-4 w-4" />
        </Button>
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
                  >
                    +
                  </Button>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeItem(item.id)}
                  className="h-6 w-6 p-0 text-accent-red hover:text-accent-red/80 hover:bg-accent-red/10"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t border-primary-yellow/20 p-4 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold text-gray-100">Total:</span>
          <span className="text-xl font-bold text-primary-yellow">
            {formatCurrency(total)}
          </span>
        </div>
        
        {showCheckoutButton && (
          <Button
            onClick={handleCheckout}
            className="w-full bg-primary-yellow text-black hover:bg-primary-yellow/90 font-semibold"
            disabled={total <= 0}
          >
            Finalizar Compra
          </Button>
        )}
      </div>
    </div>
  );
}