/**
 * Ações do carrinho
 * Sub-componente especializado para finalização de venda
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { PaymentMethod } from '@/hooks/use-sales';

interface CartActionsProps {
  // Dados
  paymentMethods: PaymentMethod[];
  paymentMethodId: string;
  total: number;

  // Estados
  isLoadingPaymentMethods: boolean;
  isProcessingSale: boolean;
  canFinalizeSale: boolean;

  // Handlers
  onPaymentMethodChange: (value: string) => void;
  onFinishSale: () => void;

  // Validação
  fieldErrors?: Record<string, string>;
}

export const CartActions: React.FC<CartActionsProps> = ({
  paymentMethods,
  paymentMethodId,
  total,
  isLoadingPaymentMethods,
  isProcessingSale,
  canFinalizeSale,
  onPaymentMethodChange,
  onFinishSale,
  fieldErrors = {},
}) => {
  const paymentError = fieldErrors.paymentMethod;

  return (
    <div className="space-y-2">
      <div className="space-y-1">
        <Select 
          onValueChange={onPaymentMethodChange} 
          value={paymentMethodId}
        >
          <SelectTrigger 
            disabled={isLoadingPaymentMethods}
            className={paymentError ? 'border-red-500' : ''}
          >
            <SelectValue 
              placeholder={
                isLoadingPaymentMethods ? 'Carregando...' : 'Selecione o pagamento'
              } 
            />
          </SelectTrigger>
          <SelectContent>
            {paymentMethods.map((method) => (
              <SelectItem key={method.id} value={method.id}>
                {method.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {paymentError && (
          <p className="text-xs text-red-500">{paymentError}</p>
        )}
      </div>

      <Button
        onClick={onFinishSale}
        disabled={!canFinalizeSale}
        className="w-full h-12 text-lg"
      >
        {isProcessingSale ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> 
            Finalizando...
          </>
        ) : (
          `Finalizar Venda (${formatCurrency(total)})`
        )}
      </Button>
    </div>
  );
};