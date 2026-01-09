/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/**
 * Componente Cart (Shopping Sidebar) - Refatorado para Stitch Design
 * Exibe apenas itens e totais, delegando checkout para o Drawer.
 */

import { useId, useMemo } from 'react';
import { useCart, useCartTotal } from '@/features/sales/hooks/use-cart';
import { useCustomer } from '@/features/customers/hooks/use-crm';
import { cn, formatCurrency } from '@/core/config/utils';

import { Button } from '@/shared/ui/primitives/button';
import { ShoppingCart, Trash2 } from 'lucide-react';
import type { SaleType } from './SalesPage';

import { CartItemList } from './CartItemList';
import { CartCustomerSelector } from './CartCustomerSelector';

export interface CartProps {
  className?: string;
  onCheckout: () => void;
  variant?: 'default' | 'premium' | 'success' | 'warning' | 'error';
  glassEffect?: boolean;
  saleType?: SaleType;
}

export function Cart({
  className = '',
  onCheckout,
  variant = 'default',
  glassEffect = true,
}: CartProps) {
  const cartId = useId();
  const { items, updateItemQuantity, removeItem, customerId, setCustomer, clearCart } = useCart();
  const { data: selectedCustomer } = useCustomer(customerId || '');

  // Totals
  const subtotal = useCartTotal();
  // No Shopping Cart phase, we typically show just the subtotal. 
  // Discounts and Delivery fees are applied in the Checkout Drawer.
  const total = subtotal;

  if (items.length === 0) {
    return (
      <div className={cn('bg-surface-dark border border-white/5 rounded-2xl overflow-hidden shadow-2xl relative h-full flex flex-col', className)}>
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4 opacity-50">
          <div className="size-16 rounded-full bg-white/5 flex items-center justify-center">
            <ShoppingCart className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-gray-400 font-medium">Seu carrinho está vazio</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'w-full max-w-[420px] flex flex-col h-full bg-surface-dark border border-white/5 rounded-2xl overflow-hidden shadow-2xl relative',
        className
      )}
    >
      {/* Cart Header & Client Select */}
      <div className="p-4 border-b border-white/5 bg-white/5 backdrop-blur-md z-10 flex-shrink-0">
        <div className="mb-4">
          {/* Label movida para dentro do seletor ou removida pois o card é auto-explicativo */}
          {/* <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">Cliente</label> */}
          <CartCustomerSelector
            selectedCustomer={selectedCustomer}
            onSelectCustomer={setCustomer}
          />
        </div>

        <div className="flex justify-between items-end">
          <h2 className="text-white text-lg font-bold">Carrinho</h2>
          <div className="flex items-center gap-2">
            <span className="text-primary text-sm font-medium bg-primary/10 px-2 py-0.5 rounded-md">
              {items.length} {items.length === 1 ? 'item' : 'itens'}
            </span>
            <button
              onClick={clearCart}
              className="p-1 text-gray-500 hover:text-red-400 transition-colors"
              title="Limpar carrinho"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Cart Items List */}
      <CartItemList
        items={items}
        maxItems={99}
        onUpdateQuantity={updateItemQuantity}
        onRemoveItem={removeItem}
      />

      {/* Footer: Totals & Checkout */}
      <div className="bg-black/60 border-t border-white/10 p-5 backdrop-blur-xl flex-shrink-0">
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-gray-400 text-sm">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          {/* We can show "Calculated at checkout" for discounts if needed, or just hide */}
          <div className="flex justify-between text-white text-lg font-bold pt-2 border-t border-white/5">
            <span>Total</span>
            <span className="text-primary text-xl">{formatCurrency(total)}</span>
          </div>
        </div>

        <button
          onClick={onCheckout}
          className="w-full bg-primary hover:bg-[#e0b71f] text-black h-14 rounded-xl font-bold text-lg shadow-[0_4px_20px_rgba(244,202,37,0.3)] transition-all transform active:scale-[0.98] flex items-center justify-between px-6"
        >
          <span>IR PARA PAGAMENTO</span>
          <span className="bg-black/10 px-2 py-1 rounded text-base">{formatCurrency(total)}</span>
        </button>
      </div>
    </div>
  );
}

// Legacy alias
export const FullCart = Cart;
