/**
 * Header do carrinho
 * Sub-componente especializado para cabeçalho
 */

import React from 'react';
import { ShoppingCart } from 'lucide-react';

interface CartHeaderProps {
  itemCount: number;
}

export const CartHeader: React.FC<CartHeaderProps> = ({ itemCount }) => {
  return (
    <header className="flex items-center justify-between p-4 border-b lg:block">
      <h2 className="text-lg font-semibold flex items-center gap-2 lg:hidden">
        <ShoppingCart className="h-5 w-5" />
        Carrinho de Vendas
        {itemCount > 0 && (
          <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
            {itemCount}
          </span>
        )}
      </h2>
      <h2 className="hidden lg:flex text-lg font-semibold items-center gap-2">
        <ShoppingCart className="h-5 w-5" />
        Carrinho de Vendas
        {itemCount > 0 && (
          <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
            {itemCount}
          </span>
        )}
      </h2>
    </header>
  );
};