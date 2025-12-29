
import { useState } from 'react';
import { Input } from '@/shared/ui/primitives/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/primitives/select';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface PaymentMethod {
    id: string;
    name: string;
    type?: string;
}

interface CartPaymentSectionProps {
    cartId: string;
    paymentMethods: PaymentMethod[];
    allowDiscounts: boolean;
    paymentMethodId: string;
    discount: number;
    cashReceived: number;
    showCashInput: boolean;
    onPaymentMethodChange: (id: string) => void;
    onDiscountChange: (val: number) => void;
    onCashReceivedChange: (val: number) => void;
}

export function CartPaymentSection({
    cartId,
    paymentMethods,
    allowDiscounts,
    paymentMethodId,
    discount,
    cashReceived,
    showCashInput,
    onPaymentMethodChange,
    onDiscountChange,
    onCashReceivedChange
}: CartPaymentSectionProps) {
    const [isExpanded, setIsExpanded] = useState(true);

    return (
        <div className="border-b border-white/20">
            <div
                className="flex items-center justify-between p-3 cursor-pointer hover:bg-white/5 transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <h4 className="text-sm font-medium text-gray-200 flex items-center gap-2">
                    Pagamento
                    {paymentMethodId && (
                        <span className="text-xs text-green-400">
                            ({paymentMethods.find(m => m.id === paymentMethodId)?.name})
                        </span>
                    )}
                </h4>
                {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-gray-400" />
                ) : (
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                )}
            </div>

            {isExpanded && (
                <div className="px-4 pb-4 space-y-4">
                    {/* Discount */}
                    {allowDiscounts && (
                        <div className="space-y-2">
                            <label htmlFor={`${cartId}-discount`} className="text-sm font-medium text-gray-200">Desconto</label>
                            <Input
                                id={`${cartId}-discount`}
                                name="sale_discount"
                                type="number"
                                placeholder="0.00"
                                value={discount}
                                onChange={(e) => onDiscountChange(Number(e.target.value))}
                                className="text-sm bg-gray-800/50 border-primary-yellow/30 text-gray-200 focus:border-primary-yellow"
                            />
                        </div>
                    )}

                    {/* Payment Method */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-200">Método de Pagamento *</label>
                        <Select value={paymentMethodId} onValueChange={onPaymentMethodChange}>
                            <SelectTrigger className="bg-gray-800/50 border-primary-yellow/30 text-gray-200">
                                <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 border-primary-yellow/30">
                                {paymentMethods.map((method) => (
                                    <SelectItem key={method.id} value={method.id} className="text-gray-200 hover:bg-primary-yellow/10">
                                        {method.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Campo Valor Recebido - só aparece se for dinheiro */}
                    {showCashInput && (
                        <div className="space-y-2">
                            <label htmlFor={`${cartId}-cash`} className="text-sm font-medium text-gray-200">Valor Recebido</label>
                            <Input
                                id={`${cartId}-cash`}
                                name="cash_received"
                                type="number"
                                placeholder="0,00"
                                value={cashReceived || ''}
                                onChange={(e) => onCashReceivedChange(Number(e.target.value))}
                                className="text-sm bg-gray-800/50 border-primary-yellow/30 text-gray-200 focus:border-primary-yellow"
                                step="0.01"
                                min="0"
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
