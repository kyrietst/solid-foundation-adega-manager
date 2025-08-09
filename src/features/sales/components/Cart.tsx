/**
 * Cart principal - Implementa padrão Container/Presentational
 * Componente refatorado para usar separação de responsabilidades
 */

import React from 'react';
import { FullCart } from './FullCart';

export interface CartProps {
  className?: string;
  showCustomerSearch?: boolean;
  allowDiscounts?: boolean;
  onSaleComplete?: (saleId: string) => void;
  maxItems?: number;
  variant?: 'default' | 'premium' | 'success' | 'warning' | 'error';
  glassEffect?: boolean;
}

export function Cart(props: CartProps) {
  return <FullCart {...props} />;
}
