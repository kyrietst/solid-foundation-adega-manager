/**
 * Lista de itens do carrinho
 */

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface CartItemsProps {
  items: CartItem[];
  maxItems?: number;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  className?: string;
}

export function CartItems({
  items,
  maxItems = 50,
  onUpdateQuantity,
  onRemoveItem,
  className = ''
}: CartItemsProps) {
  if (items.length === 0) {
    return (
      <div className={`flex-1 flex items-center justify-center p-8 ${className}`}>
        <p className="text-gray-500 text-center">Nenhum item no carrinho</p>
      </div>
    );
  }

  return (
    <ScrollArea className={`flex-1 p-4 ${className}`}>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <h4 className="font-medium text-sm">{item.name}</h4>
              <p className="text-xs text-gray-500">
                {formatCurrency(item.price)} × {item.quantity}
              </p>
              <p className="text-sm font-medium text-green-600">
                {formatCurrency(item.price * item.quantity)}
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onUpdateQuantity(item.id, Math.max(0, item.quantity - 1))}
                  className="h-6 w-6 p-0"
                >
                  -
                </Button>
                <span className="w-8 text-center text-sm">{item.quantity}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                  className="h-6 w-6 p-0"
                  disabled={item.quantity >= maxItems}
                >
                  +
                </Button>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemoveItem(item.id)}
                className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}