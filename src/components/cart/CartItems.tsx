/**
 * Lista de itens do carrinho
 * Sub-componente especializado para exibição de itens
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ShoppingCart, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { CartItem } from '@/hooks/use-cart';

interface CartItemsProps {
  items: CartItem[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
  fieldErrors?: Record<string, string>;
}

export const CartItems: React.FC<CartItemsProps> = ({
  items,
  onUpdateQuantity,
  onRemoveItem,
  fieldErrors = {},
}) => {
  if (items.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground">
        <ShoppingCart className="h-12 w-12 mb-4" />
        <h3 className="text-lg font-semibold">Seu carrinho está vazio</h3>
        <p className="text-sm">Adicione produtos da grade ao lado para começar.</p>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-grow pr-2">
      <div className="space-y-3">
        {items.map((item) => {
          const quantityError = fieldErrors[`quantity_${item.id}`];
          const isQuantityInvalid = !!quantityError;

          return (
            <div 
              key={item.id} 
              className={`flex items-center gap-3 p-2 rounded-lg border bg-background ${
                isQuantityInvalid ? 'border-red-500' : ''
              }`}
            >
              <div className="flex-1">
                <p className="font-medium text-sm truncate">{item.name}</p>
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(item.price)} x {item.quantity} = {formatCurrency(item.price * item.quantity)}
                </p>
                {isQuantityInvalid && (
                  <p className="text-xs text-red-500 mt-1">{quantityError}</p>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  className={`h-8 w-16 text-center ${isQuantityInvalid ? 'border-red-500' : ''}`}
                  value={item.quantity}
                  onChange={(e) => onUpdateQuantity(item.id, parseInt(e.target.value) || 1)}
                  min="1"
                  max={item.maxQuantity}
                />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-destructive" 
                  onClick={() => onRemoveItem(item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
};