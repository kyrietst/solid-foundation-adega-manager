/**
 * Resumo do carrinho
 * Sub-componente especializado para totais e descontos
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/utils';

interface CartSummaryProps {
  subtotal: number;
  discount: number;
  total: number;
  allowDiscounts: boolean;
  maxAllowedDiscount: number;
  onDiscountChange: (value: number) => void;
  onClearDiscount: () => void;
  fieldErrors?: Record<string, string>;
}

export const CartSummary: React.FC<CartSummaryProps> = ({
  subtotal,
  discount,
  total,
  allowDiscounts,
  maxAllowedDiscount,
  onDiscountChange,
  onClearDiscount,
  fieldErrors = {},
}) => {
  const discountError = fieldErrors.discount;
  const totalError = fieldErrors.total;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>Subtotal</span>
        <span className="font-medium">{formatCurrency(subtotal)}</span>
      </div>
      
      {allowDiscounts && (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Input
              type="number"
              placeholder="Desconto (R$)"
              value={discount || ''}
              onChange={(e) => onDiscountChange(Number(e.target.value) || 0)}
              className={`h-9 ${discountError ? 'border-red-500' : ''}`}
              max={maxAllowedDiscount}
              min="0"
              step="0.01"
            />
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onClearDiscount} 
              disabled={discount === 0}
            >
              Remover
            </Button>
          </div>
          {discountError && (
            <p className="text-xs text-red-500">{discountError}</p>
          )}
          {discount > 0 && (
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Desconto</span>
              <span>- {formatCurrency(discount)}</span>
            </div>
          )}
        </div>
      )}
      
      <div className={`flex justify-between text-sm font-bold text-primary ${totalError ? 'text-red-500' : ''}`}>
        <span>Total</span>
        <span>{formatCurrency(total)}</span>
      </div>
      
      {totalError && (
        <p className="text-xs text-red-500">{totalError}</p>
      )}
    </div>
  );
};