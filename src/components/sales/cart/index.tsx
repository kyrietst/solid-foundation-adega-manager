/**
 * Sistema de composição para Cart
 * Permite usar Cart.Header, Cart.Items, Cart.Footer
 */

import { ReactNode } from 'react';
import { ShoppingCart } from 'lucide-react';

import { CartHeader } from './CartHeader';
import { CartItems } from './CartItems';
import { CartFooter } from './CartFooter';

export interface CartCompositionProps {
  children?: ReactNode;
  className?: string;
}

function CartRoot({ children, className = '' }: CartCompositionProps) {
  return (
    <div className={`flex flex-col h-full ${className}`}>
      {children}
    </div>
  );
}

function CartEmpty({ message = "Seu carrinho está vazio" }: { message?: string }) {
  return (
    <div className="p-6 text-center">
      <ShoppingCart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
      <p className="text-gray-500">{message}</p>
    </div>
  );
}

// Componente principal com composição
export const Cart = Object.assign(CartRoot, {
  Header: CartHeader,
  Items: CartItems,
  Footer: CartFooter,
  Empty: CartEmpty,
});

// Re-exportar componentes individuais
export { CartHeader, CartItems, CartFooter };
export type { CartItem } from './CartItems';