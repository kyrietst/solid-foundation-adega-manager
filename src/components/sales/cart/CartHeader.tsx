/**
 * Header do carrinho - mostra contagem de itens e botão limpar
 */

import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

export interface CartHeaderProps {
  itemCount: number;
  maxItems?: number;
  onClearCart: () => void;
  title?: string;
}

export function CartHeader({
  itemCount,
  maxItems = 50,
  onClearCart,
  title = "Carrinho"
}: CartHeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b">
      <h3 className="text-lg font-semibold">
        {title} ({itemCount}/{maxItems})
      </h3>
      {itemCount > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearCart}
          className="text-red-500 hover:text-red-700"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}