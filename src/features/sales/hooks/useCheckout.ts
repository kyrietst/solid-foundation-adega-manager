import { useState } from 'react';
import { useUpsertSale } from '@/features/sales/hooks/use-sales';
import { useToast } from '@/shared/hooks/common/use-toast';
import { useAuth } from '@/app/providers/AuthContext';
import { CartItem } from '@/features/sales/hooks/use-cart';
import type { SaleType } from '@/features/sales/components/SalesPage';
import { FiscalAddress } from '@/core/types/fiscal.types';

export interface CheckoutState {
    processSale: () => Promise<void>;
    isProcessing: boolean;
    error: Error | null;
}

export interface UseCheckoutProps {
    items: CartItem[];
    subtotal: number;
    total: number;
    customerId: string | null;
    saleType: SaleType;
    paymentMethodId: string;
    discount: number;
    allowDiscounts: boolean;

    // Delivery props
    deliveryAddress: string | FiscalAddress | null;
    deliveryFee: number;
    deliveryPersonId: string;

    // Cash props
    isCashPayment: boolean;
    cashReceived: number;

    // Callbacks
    onSuccess: (saleId: string) => void;
    clearCart: () => void;
    resetState: () => void;
}

export const useCheckout = ({
    items,
    subtotal,
    total,
    customerId,
    saleType,
    paymentMethodId,
    discount,
    allowDiscounts,
    deliveryAddress,
    deliveryFee,
    deliveryPersonId,
    isCashPayment,
    cashReceived,
    onSuccess,
    clearCart,
    resetState
}: UseCheckoutProps): CheckoutState => {
    const { toast } = useToast();
    const { user } = useAuth();
    const upsertSale = useUpsertSale();
    const [error, setError] = useState<Error | null>(null);

    const processSale = async () => {
        setError(null);

        if (!user) {
            toast({
                title: "Erro de Autenticação",
                description: "Usuário não identificado. Faça login novamente.",
                variant: "destructive",
            });
            return;
        }

        // Validações básicas
        if (!paymentMethodId) {
            toast({
                title: "Erro",
                description: "Selecione um método de pagamento",
                variant: "destructive",
            });
            return;
        }

        if (items.length === 0) {
            toast({
                title: "Erro",
                description: "Adicione produtos ao carrinho",
                variant: "destructive",
            });
            return;
        }

        // Validação específica para pagamento em dinheiro
        if (isCashPayment && cashReceived < total) {
            toast({
                title: "Valor insuficiente",
                description: "O valor recebido deve ser maior ou igual ao total da venda",
                variant: "destructive",
            });
            return;
        }

        // Validações específicas para delivery
        if (saleType === 'delivery') {
            let isValidAddress = false;
            
            if (typeof deliveryAddress === 'string') {
                 isValidAddress = !!deliveryAddress.trim();
            } else if (deliveryAddress) {
                 // Check if FiscalAddress has mandatory fields (Logradouro, Numero)
                 // Note: CEP and others handled by form validation usually, but here we double check
                 isValidAddress = !!deliveryAddress.logradouro && !!deliveryAddress.numero;
            }

            if (!isValidAddress) {
                toast({
                    title: "Endereço incompleto",
                    description: "Informe o endereço de entrega (Logradouro e Número)",
                    variant: "destructive",
                });
                return;
            }

            if (!deliveryPersonId) {
                toast({
                    title: "Entregador obrigatório",
                    description: "Selecione um entregador para o delivery",
                    variant: "destructive",
                });
                return;
            }
        }

        // Aviso de Venda Anônima (Non-blocking Nudge)
        if (!customerId) {
            toast({
                title: "⚠️ Venda Anônima",
                description: "Pontos/LTV não registrados. Clique em 'Buscar/Cadastrar Cliente' para converter este Lead.",
                className: "bg-yellow-500 border-yellow-600 text-black font-medium",
                duration: 4000,
            });
        }

        try {
            // Prepared Address Payload
            let finalDeliveryAddress: string | null = null;
            if (saleType === 'delivery' && deliveryAddress) {
                if (typeof deliveryAddress === 'string') {
                     // Legacy or simple string fallback
                     finalDeliveryAddress = deliveryAddress;
                } else {
                     // SERIALIZE FISCAL OBJECT TO JSON STRING for RPC
                     finalDeliveryAddress = JSON.stringify(deliveryAddress);
                }
            }

            const saleData = {
                customer_id: customerId || null,
                total_amount: subtotal,
                payment_method_id: paymentMethodId,
                discount_amount: allowDiscounts ? discount : 0,
                saleType: saleType,
                // Dados de delivery (se aplicável)
                delivery_address: finalDeliveryAddress,
                delivery_fee: saleType === 'delivery' ? deliveryFee : 0,
                delivery_person_id: saleType === 'delivery' ? (deliveryPersonId || null) : null,
                items: items.map(item => ({
                    product_id: item.id,
                    variant_id: item.variant_id,
                    quantity: item.quantity,
                    unit_price: item.price,
                    units_sold: item.units_sold,
                    // Campos legados para compatibilidade
                    sale_type: (item.variant_type === 'package' ? 'package' : 'unit') as 'package' | 'unit',
                    package_units: item.packageUnits
                })),
                notes: `Desconto aplicado: R$ ${allowDiscounts ? discount.toFixed(2) : '0.00'}`
            };

            const result = await upsertSale.mutateAsync({
                saleData,
                user
            });

            if (result?.id) {
                toast({
                    title: "Sucesso!",
                    description: "Venda finalizada com sucesso",
                });

                clearCart();
                resetState();
                onSuccess(result.id);
            }
        } catch (err: any) {
            console.error('Erro ao finalizar venda:', err);
            setError(err);
            toast({
                title: "Erro",
                description: "Erro ao finalizar venda. Tente novamente.",
                variant: "destructive",
            });
        }
    };

    return {
        processSale,
        isProcessing: upsertSale.isPending,
        error
    };
};
