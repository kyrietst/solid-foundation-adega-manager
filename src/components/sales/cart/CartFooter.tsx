/**
 * Footer do carrinho - totais e ações
 */

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/utils';

export interface CartFooterProps {
  subtotal: number;
  discount?: number;
  total: number;
  allowDiscounts?: boolean;
  onDiscountChange?: (discount: number) => void;
  onAction?: () => void;
  actionLabel?: string;
  actionDisabled?: boolean;
  isLoading?: boolean;
  className?: string;
}

export function CartFooter({
  subtotal,
  discount = 0,
  total,
  allowDiscounts = false,
  onDiscountChange,
  onAction,
  actionLabel = "Finalizar",
  actionDisabled = false,
  isLoading = false,
  className = ''
}: CartFooterProps) {
  return (
    <div className={`border-t p-4 space-y-4 ${className}`}>
      {/* Discount */}
      {allowDiscounts && onDiscountChange && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Desconto</label>
          <Input
            type="number"
            placeholder="0.00"
            value={discount}
            onChange={(e) => onDiscountChange(Math.max(0, Number(e.target.value)))}
            className="text-sm"
          />
        </div>
      )}

      {/* Totals */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Subtotal:</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        {allowDiscounts && discount > 0 && (
          <div className="flex justify-between text-sm text-red-600">
            <span>Desconto:</span>
            <span>-{formatCurrency(discount)}</span>
          </div>
        )}
        <div className="flex justify-between items-center text-lg font-bold pt-2 border-t">
          <span>Total:</span>
          <span className="text-green-600">{formatCurrency(total)}</span>
        </div>
      </div>

      {/* Action Button */}
      {onAction && (
        <Button
          onClick={onAction}
          disabled={actionDisabled || isLoading || total <= 0}
          className="w-full"
        >
          {isLoading ? 'Processando...' : actionLabel}
        </Button>
      )}
    </div>
  );
}