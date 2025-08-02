/**
 * Cart principal - Implementa padrão Container/Presentational
 * Componente refatorado para usar separação de responsabilidades
 */

import React from 'react';
import { CartContainer } from '../cart/CartContainer';

export interface CartProps {
  className?: string;
  showCustomerSearch?: boolean;
  allowDiscounts?: boolean;
  onSaleComplete?: (saleId: string) => void;
  maxItems?: number;
}

export function Cart(props: CartProps) {
  return <CartContainer {...props} />;
}
