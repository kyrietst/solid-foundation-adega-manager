/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import { useState, useMemo, useEffect, useId } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { useCart, useCartTotal } from '@/features/sales/hooks/use-cart';
import { useCustomer } from '@/features/customers/hooks/use-crm';
import { usePaymentMethods } from '@/features/sales/hooks/use-sales';
import { useCheckout } from '@/features/sales/hooks/useCheckout';
import { useDeliveryPersons } from '@/features/delivery/hooks/useDeliveryPersons';
import { fetchAddressByCEP } from '@/shared/utils/address-lookup';
import { cn, formatCurrency } from '@/core/config/utils';
import { FiscalAddress } from '@/core/types/fiscal.types';

import { Button } from '@/shared/ui/primitives/button';
import { Input } from '@/shared/ui/primitives/input';
import { Switch } from '@/shared/ui/primitives/switch';
import { Label } from '@/shared/ui/primitives/label';
import { ScrollArea } from '@/shared/ui/primitives/scroll-area';
import {
    X, Store, Truck, CreditCard, User, Search, Trash2,
    MapPin, DollarSign, Wallet, Bike, Loader2, AlertTriangle, FileText
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

// Icons mapping for payment methods
import { QrCode, Banknote } from 'lucide-react';
import { useToast } from '@/shared/hooks/common/use-toast';

interface CheckoutDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: (saleId: string, extraData?: any) => void;
}

export function CheckoutDrawer({ isOpen, onClose, onSuccess }: CheckoutDrawerProps) {
    const { toast } = useToast();
    const drawerId = useId();
    const { items, customerId, clearCart } = useCart();
    const { data: customer } = useCustomer(customerId || '');
    const { data: paymentMethods = [] } = usePaymentMethods();

    // Checkout State
    const [saleType, setSaleType] = useState<'presencial' | 'delivery' | 'pickup'>('presencial');
    const [fiadoChannel, setFiadoChannel] = useState<'presencial' | 'delivery'>('presencial');
    const [paymentMethodId, setPaymentMethodId] = useState<string>('');
    const [discount, setDiscount] = useState<number>(0);
    const [cashReceived, setCashReceived] = useState<number>(0);
    const [deliveryFee, setDeliveryFee] = useState<number>(0);
    const [deliveryPersonId, setDeliveryPersonId] = useState<string>('');
    const [installments, setInstallments] = useState<number>(1); // Added State
    const [isLoadingCep, setIsLoadingCep] = useState(false);

    // CPF na Nota State
    const [cpfNaNotaEnabled, setCpfNaNotaEnabled] = useState(false);
    const [cpfNaNotaValue, setCpfNaNotaValue] = useState('');

    // State for Split Payment
    const [isMultiPayment, setIsMultiPayment] = useState(false);
    const [payments, setPayments] = useState<Array<{ methodId: string; methodName: string; amount: number; installments: number; methodCode?: string }>>([]);
    const [partialAmount, setPartialAmount] = useState<string>(''); // For input binding


    // Address Form
    const addressForm = useForm<FiscalAddress>({
        defaultValues: { pais: 'Brasil', codigo_pais: '1058' }
    });

    // Effect: Auto-fill address if customer has one and it's delivery
    useEffect(() => {
        if (saleType === 'delivery' && customer?.address) {
            // Logic to map customer address to form
            const addr = customer.address as any; // Using any for loose typing flexibility here as per legacy logic
            if (typeof addr === 'string') {
                // Legacy support - try to parse or just set street
                addressForm.setValue('logradouro', addr);
            } else if (typeof addr === 'object' && addr !== null) {
                // Map DB columns to form fields strict
                if (addr.street || addr.logradouro) addressForm.setValue('logradouro', addr.street || addr.logradouro);
                if (addr.number || addr.numero) addressForm.setValue('numero', addr.number || addr.numero);
                if (addr.neighborhood || addr.bairro) addressForm.setValue('bairro', addr.neighborhood || addr.bairro);
                if (addr.city || addr.nome_municipio) addressForm.setValue('nome_municipio', addr.city || addr.nome_municipio);
                if (addr.state || addr.uf) addressForm.setValue('uf', addr.state || addr.uf);
                if (addr.zipcode || addr.cep) addressForm.setValue('cep', addr.zipcode || addr.cep);
                if (addr.complement || addr.complemento) addressForm.setValue('complemento', addr.complement || addr.complemento);
                
                // Set focus to number if it's missing, otherwise just valid
                // if (!addr.number) addressForm.setFocus('numero'); // Logic handled by form state usually
            }
        }
    }, [saleType, customer, addressForm]);

    // Derived State
    const subtotal = useCartTotal();
    const isDelivery = saleType === 'delivery' || (saleType === 'pickup' && fiadoChannel === 'delivery');

    const total = useMemo(() => {
        return Math.max(0, subtotal - discount + (isDelivery ? deliveryFee : 0));
    }, [subtotal, discount, isDelivery, deliveryFee]);

    const { data: deliveryPersons = [] } = useDeliveryPersons(isDelivery);

    // Auto-select single delivery person
    useEffect(() => {
        if (isDelivery && deliveryPersons.length === 1) {
            setDeliveryPersonId(deliveryPersons[0].id);
        }
    }, [isDelivery, deliveryPersons]);

    // Payment Logic: Find 'Fiado' method dynamically
    const fiadoMethod = useMemo(() => {
        console.log('💰 Métodos de Pagamento Disponíveis (Debug):', paymentMethods);

        // 1. Try to find explicit Fiado method by Slug, Name or Code
        const explicit = paymentMethods.find(m =>
            m.slug === 'fiado' ||
            m.slug === 'account' ||
            m.slug === 'on_account' ||
            m.slug === 'crediario' ||
            m.slug === 'conta_cliente' ||
            m.code?.toLowerCase() === 'fiado' ||
            m.name.toLowerCase().includes('fiado')
        );
        if (explicit) return explicit;

        // 2. Fallback: Use "Outros" (99) as Fiado if available (matches DB ID for FK constraint usually)
        // This is a safety net to prevent blocking sales if DB is missing the specific 'fiado' slug entry
        const other = paymentMethods.find(m => m.slug === 'other' || m.code === '99');
        if (other) {
            console.warn('⚠️ CheckoutDrawer: Usando método "Outros" como fallback para "Fiado"');
            return {
                ...other,
                name: 'Fiado (Alias)',
                slug: 'fiado' // Force slug to satisfy checks
            };
        }

        return undefined;
    }, [paymentMethods]);

    const selectedPaymentMethod = paymentMethods.find(m => m.id === paymentMethodId);
    const isCash = selectedPaymentMethod?.slug === 'dinheiro' || selectedPaymentMethod?.code === '01';
    
    // Credit Card Detection Logic
    // Validates against 'credit' type (std) or slug/name Fallbacks
    const isCreditCard = useMemo(() => {
        if (!selectedPaymentMethod) return false;
        return (
            selectedPaymentMethod.type === 'credit' || 
            selectedPaymentMethod.slug?.includes('credit') || 
            selectedPaymentMethod.name?.toLowerCase().includes('crédito') ||
            selectedPaymentMethod.code === '03'
        );
    }, [selectedPaymentMethod]);

    // Reset installments if not credit card
    useEffect(() => {
        if (!isCreditCard) {
            setInstallments(1);
        }
    }, [isCreditCard]);

    // Split Payment Helpers
    const totalPaid = payments.reduce((acc, p) => acc + p.amount, 0);
    const remainingToPay = Math.max(0, total - totalPaid);

    const handleAddPayment = (methodId: string, methodName: string, methodSlug: string, methodCode: string) => {
        if (!isMultiPayment) {
            // SINGLE MODE: Reset and select only this one (Visual only, logic handled at checkout)
            setPaymentMethodId(methodId);
            return;
        }

        // MULTI MODE
        const amountToAdd = partialAmount ? parseFloat(partialAmount) : remainingToPay;
        if (amountToAdd <= 0) {
            toast({ title: "Valor inválido", description: "Informe um valor maior que zero.", variant: "destructive" });
            return;
        }

        if (totalPaid + amountToAdd > total + 0.05) { // Tolerance
             toast({ title: "Valor excede o total", description: "A soma dos pagamentos não pode exceder o valor da venda.", variant: "destructive" });
             return;
        }

        const newPayment = {
            methodId,
            methodName,
            methodCode,
            amount: amountToAdd,
            installments: methodSlug.includes('credit') ? installments : 1
        };

        setPayments([...payments, newPayment]);
        setPartialAmount(''); // Reset input
        setPaymentMethodId(''); // Reset selection highlight
    };

    const handleRemovePayment = (index: number) => {
        const newPayments = [...payments];
        newPayments.splice(index, 1);
        setPayments(newPayments);
    };

    const change = isCash && cashReceived > total ? cashReceived - total : 0;

    // Checkout Hook
    const { processSale, isProcessing } = useCheckout({
        items,
        subtotal,
        total,
        customerId,
        // ⚠️ CRITICAL BUSINESS LOGIC:
        // 'pickup' in UI means "Fiado/Conta".
        // Backend expects 'presencial' channel for in-store sales.
        // We map UI 'pickup' -> 'presencial' (or 'delivery' if toggled) but with 'Fiado' payment method.
        saleType,
        paymentMethodId,
        discount,
        allowDiscounts: true, // Configurable?
        deliveryAddress: addressForm.getValues(), // Get address from form, fallback inside hook
        deliveryFee,
        deliveryPersonId,
        isCashPayment: isCash,
        cashReceived,
        installments,
        cpfNaNota: cpfNaNotaEnabled ? cpfNaNotaValue : undefined,
        payments: isMultiPayment ? payments.map(p => ({
            method_id: p.methodId,
            amount: p.amount,
            installments: p.installments
        })) : undefined, // NEW: Pass payments array
        isDelivery, // Pass derived delivery state (handles Fiado Delivery)
        onSuccess: (saleId, extraData) => {
            onSuccess?.(saleId, extraData);
            onClose();
        },
        clearCart,
        resetState: () => {
            setPaymentMethodId('');
            setDiscount(0);
            setCashReceived(0);
            setDeliveryFee(0);
            setDeliveryPersonId('');
            addressForm.reset();
            setInstallments(1);
            setCpfNaNotaEnabled(false);
            setCpfNaNotaValue('');
            setIsMultiPayment(false);
            setPayments([]);
        }
    });

    // Validation
    const isValid = useMemo(() => {
        if (items.length === 0) return false;
        
        // 1. Delivery Validation
        if (isDelivery) {
            const addr = addressForm.getValues(); // Use getValues to avoid render loops if not watched
            if (!addr?.logradouro || !addr?.numero) return false;
            if (!deliveryPersonId) return false;
        }

        // 2. Fiado Validation (Pickup/Term Check)
        if (saleType === 'pickup') {
            if (!customerId) return false;
            if (!fiadoMethod) return false; 
            return true; 
        }

        // 3. Payment Validation (Split vs Single)
        if (isMultiPayment) {
            // Split Mode: Validate Sum
            if (payments.length === 0) return false;
            
            const currentTotalPaid = payments.reduce((acc, p) => acc + p.amount, 0);
            const diff = Math.abs(total - currentTotalPaid);
            
            // Tolerance for floating point errors (0.05 cents)
            if (diff > 0.05) return false;
            
        } else {
            // Single Mode: Must have selected method
            if (!paymentMethodId) return false;
        }

        return true;
    }, [items, saleType, addressForm, paymentMethodId, customerId, fiadoMethod, deliveryPersonId, isMultiPayment, payments, total, isDelivery]);

    // Icons Helper
    const getPaymentIcon = (slug: string) => {
        if (slug === 'pix') return <QrCode size={20} />;
        if (slug === 'dinheiro') return <Banknote size={20} />;
        return <CreditCard size={20} />;
    }

    // Handle Tab Change
    const handleTabChange = (type: 'presencial' | 'delivery' | 'pickup') => {
        setSaleType(type);
        setDiscount(0);
        setDeliveryFee(0);
        if (type === 'pickup') setPaymentMethodId(''); // Fiado auto-handled
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex justify-end">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    onClick={onClose}
                />

                {/* Drawer Panel */}
                <motion.div
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="relative w-full max-w-2xl bg-[#0F0F11] border-l border-white/10 shadow-2xl h-full flex flex-col"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/5">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            <Wallet className="text-primary" />
                            Finalizar Venda
                        </h2>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                        {/* Left Col: Order Summary (Hidden on small mobile, visible on tablet+) */}
                        <div className="hidden md:flex flex-col w-1/3 border-r border-white/5 bg-black/20 p-4">
                            <h3 className="text-sm font-medium text-gray-400 mb-4 uppercase tracking-wider">Resumo do Pedido</h3>
                            <ScrollArea className="flex-1 -mx-2 px-2">
                                <div className="space-y-3">
                                    {items.map(item => (
                                        <div key={item.variant_id} className="flex justify-between items-start gap-2 text-sm">
                                            <div className="flex flex-col">
                                                <span className="text-gray-200 line-clamp-2">{item.name}</span>
                                                <span className="text-xs text-gray-500">{item.quantity}x {formatCurrency(item.price)}</span>
                                            </div>
                                            <span className="font-medium text-gray-300">{formatCurrency(item.price * item.quantity)}</span>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                            <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
                                <div className="flex justify-between text-gray-400 text-sm">
                                    <span>Subtotal</span>
                                    <span>{formatCurrency(subtotal)}</span>
                                </div>
                                {discount > 0 && (
                                    <div className="flex justify-between text-green-400 text-sm">
                                        <span>Desconto</span>
                                        <span>- {formatCurrency(discount)}</span>
                                    </div>
                                )}
                                {deliveryFee > 0 && (
                                    <div className="flex justify-between text-blue-400 text-sm">
                                        <span>Entrega</span>
                                        <span>+ {formatCurrency(deliveryFee)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-white text-lg font-bold pt-2 border-t border-white/5">
                                    <span>Total</span>
                                    <span className="text-primary">{formatCurrency(total)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Right Col: Checkout Forms */}
                        <div className="flex-1 flex flex-col bg-surface-dark overflow-y-auto">
                            <div className="p-6 space-y-8">

                                {/* 1. Customer Review */}
                                <div className="space-y-2">
                                    <Label className="uppercase text-xs text-gray-500 font-bold tracking-wider">Cliente</Label>
                                    {customerId ? (
                                        <div className="flex items-center gap-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                                            <div className="size-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                                                <User size={20} />
                                            </div>
                                            <div>
                                                <p className="font-medium text-blue-100">{customer?.name}</p>
                                                <p className="text-xs text-blue-300/70">{customer?.phone || 'Sem telefone'}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3 p-3 bg-white/5 border border-white/5 rounded-lg text-gray-400">
                                            <User size={20} />
                                            <span>Venda para Consumidor Final</span>
                                        </div>
                                    )}
                                </div>

                                {/* 2. Sale Type Tabs */}
                                <div className="space-y-4">
                                    <Label className="uppercase text-xs text-gray-500 font-bold tracking-wider">Tipo de Venda</Label>
                                    <div className="grid grid-cols-3 gap-2 bg-black/20 p-1 rounded-xl">
                                        <button
                                            onClick={() => handleTabChange('presencial')}
                                            className={cn(
                                                "flex flex-col items-center justify-center gap-2 py-3 rounded-lg transition-all border border-transparent",
                                                saleType === 'presencial' ? "bg-primary text-black font-bold shadow-lg" : "text-gray-400 hover:bg-white/5"
                                            )}
                                        >
                                            <Store size={20} />
                                            <span className="text-xs">No Balcão</span>
                                        </button>
                                        <button
                                            onClick={() => handleTabChange('delivery')}
                                            className={cn(
                                                "flex flex-col items-center justify-center gap-2 py-3 rounded-lg transition-all border border-transparent",
                                                saleType === 'delivery' ? "bg-primary text-black font-bold shadow-lg" : "text-gray-400 hover:bg-white/5"
                                            )}
                                        >
                                            <Bike size={20} />
                                            <span className="text-xs">Entrega</span>
                                        </button>
                                        <button
                                            onClick={() => handleTabChange('pickup')} // Mapped to Fiado logic
                                            className={cn(
                                                "flex flex-col items-center justify-center gap-2 py-3 rounded-lg transition-all border border-transparent",
                                                saleType === 'pickup' ? "bg-primary text-black font-bold shadow-lg" : "text-gray-400 hover:bg-white/5"
                                            )}
                                        >
                                            <CreditCard size={20} />
                                            <span className="text-xs">Fiado</span>
                                        </button>
                                    </div>
                                </div>

                                {/* 3. Delivery Details (Conditional) */}
                                {/* 3. Delivery Details (Conditional: Standard Delivery OR Fiado Delivery) */}
                                {isDelivery && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="space-y-4 pt-4 border-t border-white/5"
                                    >
                                        <Label className="text-primary flex items-center gap-2">
                                            <Truck size={16} /> Detalhes da Entrega
                                        </Label>


                                        
                                        <div className="space-y-3">
                                            <div className="grid grid-cols-1 gap-3">
                                                {/* CEP Search */}
                                                <div className="space-y-1">
                                                    <Label className="text-xs text-gray-400">CEP</Label>
                                                    <div className="flex gap-2 relative">
                                                        <Input 
                                                            className="bg-white/5 border-white/10 text-white pl-3" 
                                                            placeholder="00000-000"
                                                            value={addressForm.watch('cep') || ''}
                                                            onChange={(e) => {
                                                                let v = e.target.value.replace(/\D/g, '');
                                                                if (v.length > 5) v = v.replace(/^(\d{5})(\d)/, '$1-$2');
                                                                addressForm.setValue('cep', v);
                                                            }}
                                                            maxLength={9}
                                                        />
                                                        <Button 
                                                            type="button"
                                                            size="icon"
                                                            className="h-10 w-10 shrink-0 bg-white/10 hover:bg-white/20 text-white"
                                                            disabled={isLoadingCep}
                                                            onClick={async () => {
                                                                const cep = addressForm.watch('cep');
                                                                if (!cep || cep.length < 8) return;
                                                                setIsLoadingCep(true);
                                                                try {
                                                                    const addr = await fetchAddressByCEP(cep);
                                                                    if (addr) {
                                                                        addressForm.setValue('logradouro', addr.logradouro);
                                                                        addressForm.setValue('bairro', addr.bairro);
                                                                        addressForm.setValue('nome_municipio', addr.nome_municipio);
                                                                        addressForm.setValue('uf', addr.uf);
                                                                        addressForm.setValue('codigo_municipio', addr.codigo_municipio);
                                                                        addressForm.setFocus('numero');
                                                                    }
                                                                } catch (err) {
                                                                    console.error(err);
                                                                } finally {
                                                                    setIsLoadingCep(false);
                                                                }
                                                            }}
                                                        >
                                                            {isLoadingCep ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                                                        </Button>
                                                    </div>
                                                </div>

                                                {/* Logradouro (Read Only) */}
                                                <div className="space-y-1">
                                                    <Label className="text-xs text-gray-400">Rua / Logradouro</Label>
                                                    <div className="relative">
                                                        <MapPin className="absolute left-3 top-2.5 text-gray-500 h-4 w-4" />
                                                        <Input
                                                            className="pl-9 bg-black/20 border-white/5 text-gray-300 cursor-not-allowed"
                                                            placeholder="Endereço carregado pelo CEP..."
                                                            value={addressForm.watch('logradouro') || ''}
                                                            readOnly
                                                            tabIndex={-1}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Número & Complemento */}
                                                <div className="grid grid-cols-3 gap-3">
                                                    <div className="space-y-1 col-span-1">
                                                        <Label className="text-xs text-primary font-bold">Número *</Label>
                                                        <Input
                                                            {...addressForm.register('numero', { required: true })}
                                                            className="bg-white/5 border-white/10 text-white focus:border-primary/50 transition-colors"
                                                            placeholder="123"
                                                        />
                                                    </div>
                                                    <div className="space-y-1 col-span-2">
                                                        <Label className="text-xs text-gray-400">Complemento</Label>
                                                        <Input
                                                            {...addressForm.register('complemento')}
                                                            className="bg-white/5 border-white/10 text-white"
                                                            placeholder="Apto, Bloco..."
                                                        />
                                                    </div>
                                                </div>

                                                {/* Bairro, Cidade & UF (Read Only) */}
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="space-y-1">
                                                        <Label className="text-xs text-gray-400">Bairro</Label>
                                                        <Input
                                                            className="bg-black/20 border-white/5 text-gray-400 text-xs cursor-not-allowed"
                                                            value={addressForm.watch('bairro') || ''}
                                                            readOnly
                                                            tabIndex={-1}
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <Label className="text-xs text-gray-400">Cidade / UF</Label>
                                                        <div className="flex gap-2">
                                                            <Input
                                                                className="bg-black/20 border-white/5 text-gray-400 text-xs cursor-not-allowed"
                                                                value={addressForm.watch('nome_municipio') || ''}
                                                                readOnly
                                                                tabIndex={-1}
                                                            />
                                                            <Input
                                                                className="w-12 bg-black/20 border-white/5 text-gray-400 text-xs text-center cursor-not-allowed p-0"
                                                                value={addressForm.watch('uf') || ''}
                                                                readOnly
                                                                tabIndex={-1}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Taxa & Entregador Row */}
                                                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/5 mt-2">
                                                    <div className="space-y-1">
                                                        <Label className="text-xs text-gray-400">Taxa de Entrega</Label>
                                                        <div className="relative">
                                                            <div className="absolute left-3 top-2.5 text-gray-500 text-xs">R$</div>
                                                            <Input
                                                                type="number"
                                                                className="pl-8 bg-white/5 border-white/10 text-white"
                                                                value={deliveryFee}
                                                                onChange={(e) => setDeliveryFee(Number(e.target.value))}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <Label className="text-xs text-gray-400">Entregador</Label>
                                                        <select
                                                            className="w-full h-10 rounded-md bg-white/5 border border-white/10 text-white text-sm px-3 focus:outline-none focus:ring-1 focus:ring-primary"
                                                            value={deliveryPersonId}
                                                            onChange={(e) => setDeliveryPersonId(e.target.value)}
                                                        >
                                                            <option value="" className="bg-gray-900">Selecione...</option>
                                                            {deliveryPersons.map(dp => (
                                                                <option key={dp.id} value={dp.id} className="bg-gray-900">{dp.name}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* 4. Payment Methods Options */}
                                {saleType !== 'pickup' && (
                                    <div className="space-y-4 pt-4 border-t border-white/5">
                                        
                                        <div className="flex items-center justify-between mb-2">
                                            <Label className="uppercase text-xs text-gray-500 font-bold tracking-wider">Pagamento</Label>
                                            
                                            {/* Enable Multi Payment Switch */}
                                            <div className="flex items-center gap-2">
                                                <span className={`text-xs ${isMultiPayment ? 'text-primary' : 'text-gray-500'}`}>
                                                    Dividir Pagamento
                                                </span>
                                                <Switch 
                                                    checked={isMultiPayment}
                                                    onCheckedChange={(checked) => {
                                                        setIsMultiPayment(checked);
                                                        setPayments([]); // Clear on toggle
                                                        setPaymentMethodId('');
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        {/* Multi Payment: List of Added Payments */}
                                        {isMultiPayment && (
                                            <div className="space-y-2 mb-4 bg-black/20 p-3 rounded-lg border border-white/5">
                                                {payments.length === 0 && (
                                                    <p className="text-xs text-gray-500 text-center italic">Nenhum pagamento adicionado.</p>
                                                )}
                                                {payments.map((p, idx) => (
                                                    <div key={idx} className="flex justify-between items-center text-sm">
                                                        <span className="text-gray-300">{p.methodName} {p.installments > 1 ? `(${p.installments}x)` : ''}</span>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-mono text-white">{formatCurrency(p.amount)}</span>
                                                            <button 
                                                                onClick={() => handleRemovePayment(idx)}
                                                                className="text-red-500 hover:text-red-400"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                                <div className="border-t border-white/10 pt-2 flex justify-between items-center font-bold">
                                                    <span className={remainingToPay > 0.05 ? "text-red-400" : "text-green-400"}>
                                                        {remainingToPay > 0.05 ? "Faltam:" : "Ok:"}
                                                    </span>
                                                    <span className={remainingToPay > 0.05 ? "text-red-400" : "text-green-400"}>
                                                        {formatCurrency(remainingToPay)}
                                                    </span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Multi Payment: Amount Input for Next Payment */}
                                        {isMultiPayment && remainingToPay > 0.05 && (
                                            <div className="mb-3">
                                                <Label className="text-xs text-gray-400">Valor para este método</Label>
                                                <Input 
                                                    type="number" 
                                                    value={partialAmount}
                                                    placeholder={remainingToPay.toFixed(2)}
                                                    onChange={(e) => setPartialAmount(e.target.value)}
                                                    className="bg-white/5 border-white/10 text-white"
                                                />
                                            </div>
                                        )}

                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                            {paymentMethods
                                                .filter(m => 
                                                    !m.slug.includes('fiado') && 
                                                    !m.slug.includes('account')
                                                )
                                                .map(method => (
                                                <button
                                                    key={method.id}
                                                    onClick={() => handleAddPayment(method.id, method.name, method.slug, method.code)}
                                                    className={cn(
                                                        "flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all h-20",
                                                        !isMultiPayment && paymentMethodId === method.id
                                                            ? "bg-primary/20 border-primary text-primary"
                                                            : "bg-white/5 border-white/5 text-gray-400 hover:bg-white/10"
                                                    )}
                                                >
                                                    {getPaymentIcon(method.slug)}
                                                    <span className="text-[10px] uppercase font-bold text-center leading-tight">{method.name}</span>
                                                </button>
                                            ))}
                                        </div>

                                        {/* Discount & Cash Logic */}
                                        <div className="grid grid-cols-2 gap-4 mt-4">
                                            <div className="space-y-1">
                                                <Label className="text-xs text-gray-400">Desconto (R$)</Label>
                                                <Input
                                                    type="number"
                                                    className="bg-white/5 border-white/10 text-white"
                                                    value={discount}
                                                    onChange={(e) => setDiscount(Number(e.target.value))}
                                                />
                                            </div>

                                            {isCash && (
                                                <div className="space-y-1">
                                                    <Label className="text-xs text-gray-400">Valor Recebido</Label>
                                                    <div className="relative">
                                                        <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-green-500" />
                                                        <Input
                                                            type="number"
                                                            className="pl-9 bg-green-900/10 border-green-900/30 text-green-400"
                                                            value={cashReceived}
                                                            onChange={(e) => setCashReceived(Number(e.target.value))}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        {isCash && change > 0 && (
                                            <div className="p-3 bg-green-500/20 border border-green-500/30 rounded-lg flex justify-between items-center animate-in fade-in">
                                                <span className="text-green-400 font-medium">Troco:</span>
                                                <span className="text-green-300 font-bold text-lg">{formatCurrency(change)}</span>
                                            </div>
                                        )}

                                        {/* Installments for Credit Card */}
                                        {isCreditCard && (
                                            <div className="space-y-1 mt-4">
                                                <Label className="text-xs text-gray-400">Parcelas</Label>
                                                <select
                                                    className="w-full h-10 rounded-md bg-white/5 border border-white/10 text-white text-sm px-3 focus:outline-none focus:ring-1 focus:ring-primary"
                                                    value={installments}
                                                    onChange={(e) => setInstallments(Number(e.target.value))}
                                                >
                                                    {[...Array(12)].map((_, i) => (
                                                        <option key={i + 1} value={i + 1} className="bg-gray-900">
                                                            {i + 1}x de {formatCurrency(total / (i + 1))}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Fiado Warning */}
                                {/* Fiado Section: Config & Warning */}
                                {saleType === 'pickup' && (
                                     <div className="space-y-4 pt-4 border-t border-white/5">
                                         
                                        <Label className="uppercase text-xs text-gray-500 font-bold tracking-wider flex items-center gap-2">
                                            <CreditCard size={14} /> Opções do Fiado
                                        </Label>

                                        {/* 1. Fiado Channel Toggle */}
                                        <div className="bg-black/40 p-1 rounded-lg flex gap-1 border border-white/5">
                                            <button
                                                onClick={() => setFiadoChannel('presencial')}
                                                className={cn(
                                                    "flex-1 py-2 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-2",
                                                    fiadoChannel === 'presencial' ? "bg-white/10 text-white" : "text-gray-500 hover:text-white"
                                                )}
                                            >
                                                <Store size={14} /> Balcão / Retirada
                                            </button>
                                            <button
                                                onClick={() => setFiadoChannel('delivery')}
                                                className={cn(
                                                    "flex-1 py-2 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-2",
                                                    fiadoChannel === 'delivery' ? "bg-amber-500/20 text-amber-400 border border-amber-500/20" : "text-gray-500 hover:text-white"
                                                )}
                                            >
                                                <Bike size={14} /> Entrega Motoboy
                                            </button>
                                        </div>
                                        
                                        {/* 2. Customer Validation Warning */}
                                        {!customer && (
                                             <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex gap-3 text-red-400 items-center animate-pulse">
                                                <div className="p-2 bg-red-500/20 rounded-full shrink-0">
                                                    <User size={20} />
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="font-bold text-sm">Cliente Obrigatório</p>
                                                    <p className="text-xs opacity-80">Você deve selecionar um cliente para vender fiado.</p>
                                                </div>
                                             </div>
                                        )}

                                        {/* 3. System Config Warning */}
                                        {!fiadoMethod && (
                                             <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex gap-3 text-amber-400 items-start">
                                                <AlertTriangle className="shrink-0 mt-0.5" />
                                                <div className="space-y-1">
                                                    <p className="font-bold text-sm">Configuração Pendente</p>
                                                    <p className="text-xs opacity-80">Método de pagamento 'Fiado' não encontrado no sistema. Contate o suporte.</p>
                                                </div>
                                             </div>
                                        )}
                                     </div>
                                )}

                                {/* CPF na Nota (Universal) */}
                                <div className="space-y-3 pt-4 border-t border-white/5">
                                    <div className="flex items-center justify-between">
                                        <Label className="uppercase text-xs text-gray-500 font-bold tracking-wider flex items-center gap-2">
                                            <FileText className="h-4 w-4" /> CPF na Nota
                                        </Label>
                                        <div className="flex items-center gap-2">
                                            <Label htmlFor="cpf-switch" className="text-xs text-gray-400 cursor-pointer">
                                                {cpfNaNotaEnabled ? 'Ativado' : 'Não informar'}
                                            </Label>
                                            <Switch
                                                id="cpf-switch"
                                                checked={cpfNaNotaEnabled}
                                                onCheckedChange={setCpfNaNotaEnabled}
                                            />
                                        </div>
                                    </div>

                                    {cpfNaNotaEnabled && (
                                        <div className="animate-in fade-in slide-in-from-top-2">
                                            <Input
                                                placeholder="000.000.000-00"
                                                className="bg-white/5 border-white/10 text-white"
                                                value={cpfNaNotaValue}
                                                onChange={(e) => {
                                                    let v = e.target.value.replace(/\D/g, '');
                                                    if (v.length > 11) v = v.slice(0, 11);
                                                    if (v.length > 9) v = v.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
                                                    else if (v.length > 6) v = v.replace(/(\d{3})(\d{3})(\d{3})/, '$1.$2.$3');
                                                    else if (v.length > 3) v = v.replace(/(\d{3})(\d{3})/, '$1.$2');
                                                    setCpfNaNotaValue(v);
                                                }}
                                                maxLength={14}
                                            />
                                            {/* Validation Hint */}
                                            {cpfNaNotaValue.replace(/\D/g, '').length === 11 ? (
                                                <p className="text-[10px] text-green-400 mt-1">CPF completo</p>
                                            ) : (
                                                 <p className="text-[10px] text-amber-500 mt-1">Digite os 11 números</p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="h-4"></div> {/* Spacer */}
                            </div>
                        </div>
                    </div>

                    {/* Sticky Footer Action */}
                    <div className="p-4 border-t border-white/10 bg-black/40 backdrop-blur-md">
                        <Button
                            size="lg"
                            className={cn(
                                "w-full h-14 text-lg font-bold shadow-lg transition-all",
                                isValid
                                    ? "bg-primary hover:bg-[#e0b71f] text-black shadow-primary/20"
                                    : "bg-gray-700 text-gray-400 cursor-not-allowed"
                            )}
                            disabled={!isValid || isProcessing}
                            onClick={processSale}
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                                    Processando Venda...
                                </>
                            ) : (
                                <div className="flex items-center justify-between w-full">
                                    <span>CONFIRMAR VENDA</span>
                                    <span className="bg-black/10 px-3 py-1 rounded text-base">
                                        {formatCurrency(total)}
                                    </span>
                                </div>
                            )}
                        </Button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
