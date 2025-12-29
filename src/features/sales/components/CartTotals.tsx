
import { formatCurrency } from '@/core/config/utils';

interface CartTotalsProps {
    subtotal: number;
    discount: number;
    deliveryFee: number;
    total: number;
    cashReceived: number;
    change: number;
    showDiscount: boolean;
    showDelivery: boolean;
    showChange: boolean;
}

export function CartTotals({
    subtotal,
    discount,
    deliveryFee,
    total,
    cashReceived,
    change,
    showDiscount,
    showDelivery,
    showChange
}: CartTotalsProps) {
    return (
        <div className="space-y-2">
            <div className="flex justify-between text-sm">
                <span className="text-gray-300">Subtotal:</span>
                <span className="text-gray-200">{formatCurrency(subtotal)}</span>
            </div>
            {showDiscount && discount > 0 && (
                <div className="flex justify-between text-sm text-accent-red">
                    <span>Desconto:</span>
                    <span>-{formatCurrency(discount)}</span>
                </div>
            )}
            {showDelivery && deliveryFee > 0 && (
                <div className="flex justify-between text-sm text-orange-400">
                    <span>Taxa de Entrega:</span>
                    <span>+{formatCurrency(deliveryFee)}</span>
                </div>
            )}
            <div className="flex justify-between items-center text-lg font-bold pt-2 border-t border-primary-yellow/20">
                <span className="text-gray-100">Total:</span>
                <span className="text-primary-yellow">{formatCurrency(total)}</span>
            </div>

            {showChange && cashReceived > 0 && (
                <>
                    <div className="flex justify-between text-sm pt-2 border-t border-gray-600/20">
                        <span className="text-gray-300">Valor Recebido:</span>
                        <span className="text-gray-200">{formatCurrency(cashReceived)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-green-400 font-semibold">
                        <span>Troco:</span>
                        <span>{formatCurrency(change)}</span>
                    </div>
                </>
            )}
        </div>
    );
}
