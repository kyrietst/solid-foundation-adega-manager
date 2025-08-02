/**
 * Componente Cart simplificado - apenas itens e total
 * Usado quando não precisa de customer search nem discounts
 */

import { useMemo } from 'react';
import { useCart, useCartTotal } from '@/hooks/use-cart';
import { formatCurrency } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ShoppingCart, Trash2 } from 'lucide-react';

export interface SimpleCartProps {
  className?: string;
  maxItems?: number;
  onCheckout?: (total: number) => void;
  showCheckoutButton?: boolean;
}

export function SimpleCart({
  className = '',
  maxItems = 50,
  onCheckout,
  showCheckoutButton = true
}: SimpleCartProps) {
  const { items, updateItemQuantity, removeItem, clearCart } = useCart();
  const total = useCartTotal();

  const handleCheckout = () => {
    if (onCheckout && total > 0) {
      onCheckout(total);
    }
  };

  if (items.length === 0) {
    return (
      <div className={`p-6 text-center ${className}`}>
        <ShoppingCart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-gray-500">Seu carrinho está vazio</p>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="text-lg font-semibold">
          Carrinho ({items.length}/{maxItems})
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearCart}
          className="text-red-500 hover:text-red-700"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Items */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <h4 className="font-medium text-sm">{item.name}</h4>
                <p className="text-xs text-gray-500">
                  {formatCurrency(item.price)} × {item.quantity}
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => updateItemQuantity(item.id, Math.max(0, item.quantity - 1))}
                    className="h-6 w-6 p-0"
                  >
                    -
                  </Button>
                  <span className="w-8 text-center text-sm">{item.quantity}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                    className="h-6 w-6 p-0"
                    disabled={item.quantity >= maxItems}
                  >
                    +
                  </Button>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeItem(item.id)}
                  className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t p-4 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold">Total:</span>
          <span className="text-xl font-bold text-green-600">
            {formatCurrency(total)}
          </span>
        </div>
        
        {showCheckoutButton && (
          <Button
            onClick={handleCheckout}
            className="w-full"
            disabled={total <= 0}
          >
            Finalizar Compra
          </Button>
        )}
      </div>
    </div>
  );
}