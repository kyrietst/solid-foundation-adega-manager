import React, { useState, useId } from 'react';
import { BaseModal } from '@/shared/ui/composite/BaseModal';
import { Button } from '@/shared/ui/primitives/button';
import { Input } from '@/shared/ui/primitives/input';
import { Label } from '@/shared/ui/primitives/label';
import { useToast } from '@/shared/hooks/common/use-toast';
import { UserPlus, Loader2, Phone, User, AlertTriangle } from 'lucide-react';
import { cn } from '@/core/config/utils';
import { useCustomerOperations } from '@/features/customers/hooks/useCustomerOperations';
import { supabase } from '@/core/api/supabase/client';

interface QuickCustomerCreateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (customerId: string) => void;
}

export function QuickCustomerCreateModal({
    isOpen,
    onClose,
    onSuccess
}: QuickCustomerCreateModalProps) {
    // ✅ ACCESSIBILITY FIX: Generate unique ID prefix to prevent duplicate IDs
    const formId = useId();
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    
    // Validation States
    const [isCheckingPhone, setIsCheckingPhone] = useState(false);
    const [duplicateError, setDuplicateError] = useState<{name: string, id: string} | null>(null);

    const { toast } = useToast();
    const { createQuickCustomer, isCreatingQuick } = useCustomerOperations();

    const checkPhoneNumber = async (phoneNumber: string) => {
        if (!phoneNumber || phoneNumber.length < 8) {
            setDuplicateError(null);
            return;
        }

        setIsCheckingPhone(true);
        try {
            const { data, error } = await supabase
                .from('customers')
                .select('id, name')
                .eq('phone', phoneNumber)
                .maybeSingle();

            if (error) throw error;

            if (data) {
                setDuplicateError({ name: data.name, id: data.id });
                toast({
                    title: "Cliente já cadastrado",
                    description: `O telefone pertence a: ${data.name}`,
                    variant: "destructive"
                });
            } else {
                setDuplicateError(null);
            }
        } catch (err) {
            console.error('Erro ao verificar telefone:', err);
        } finally {
            setIsCheckingPhone(false);
        }
    };

    const handlePhoneBlur = () => {
        checkPhoneNumber(phone);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (duplicateError) {
             toast({
                title: "Cliente duplicado",
                description: `Use o cadastro existente de: ${duplicateError.name}`,
                variant: "destructive"
            });
            return;
        }

        if (!name.trim()) {
            toast({
                title: "Nome obrigatório",
                description: "Por favor, informe o nome do cliente.",
                variant: "destructive"
            });
            return;
        }

        createQuickCustomer({ name, phone }, {
            onSuccess: (newCustomerId) => {
                toast({
                    title: "Cliente cadastrado!",
                    description: "Cliente vinculado à venda com sucesso.",
                    variant: "default",
                    className: "bg-green-500 border-green-600 text-white"
                });
                onSuccess(newCustomerId);
                handleClose();
            },
            onError: (error) => {
                console.error('Erro ao criar cliente:', error);
                toast({
                    title: "Erro ao cadastrar",
                    description: "Não foi possível criar o cliente. Tente novamente.",
                    variant: "destructive"
                });
            }
        });
    };

    const handleClose = () => {
        setName('');
        setPhone('');
        setDuplicateError(null);
        onClose();
    };

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={handleClose}
            title="Cadastro Rápido"
            size="sm"
        >
            <form onSubmit={handleSubmit} className="space-y-6 p-1">
                <div className="space-y-4">
                    {/* Name Input */}
                    <div className="space-y-2">
                        <Label htmlFor={`${formId}-quick-name`} className="text-gray-200 flex items-center gap-2">
                            <User className="h-4 w-4 text-primary-yellow" />
                            Nome do Cliente <span className="text-red-400">*</span>
                        </Label>
                        <Input
                            id={`${formId}-quick-name`}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ex: João da Silva"
                            className="bg-gray-800/50 border-white/10 text-white focus:border-primary-yellow/50 placeholder:text-gray-500"
                        />
                    </div>

                    {/* Phone Input */}
                    <div className="space-y-2">
                        <Label htmlFor={`${formId}-quick-phone`} className="text-gray-200 flex items-center gap-2">
                            <Phone className="h-4 w-4 text-primary-yellow" />
                            Telefone / WhatsApp
                        </Label>
                        <div className="relative">
                            <Input
                                id={`${formId}-quick-phone`}
                                value={phone}
                                onChange={(e) => {
                                    setPhone(e.target.value);
                                    if (duplicateError) setDuplicateError(null); // Clear error on type
                                }}
                                onBlur={handlePhoneBlur}
                                placeholder="Ex: 11 99999-9999"
                                className={cn(
                                    "bg-gray-800/50 border-white/10 text-white placeholder:text-gray-500",
                                    "focus:border-primary-yellow/50",
                                    duplicateError && "border-red-500 focus:border-red-500"
                                )}
                            />
                            {isCheckingPhone && (
                                <div className="absolute right-3 top-2.5">
                                    <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                                </div>
                            )}
                        </div>
                        
                        {/* DUPLICATE WARNING */}
                        {duplicateError && (
                            <div className="text-xs bg-red-900/30 border border-red-500/50 text-red-200 p-2 rounded flex items-start gap-2 animate-in fade-in slide-in-from-top-1">
                                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-red-400" />
                                <div>
                                    <span className="font-bold block text-red-100">Cliente já cadastrado!</span>
                                    Este telefone pertence a: <strong className="text-white">{duplicateError.name}</strong>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex gap-3 pt-2">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={handleClose}
                        className="flex-1 text-gray-400 hover:text-white hover:bg-white/5"
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        disabled={isCreatingQuick || !!duplicateError || isCheckingPhone}
                        className={cn(
                            "flex-1 font-semibold transition-all",
                            duplicateError 
                                ? "bg-gray-700 text-gray-400 cursor-not-allowed hover:bg-gray-700"
                                : "bg-primary-yellow text-black hover:bg-primary-yellow/90"
                        )}
                    >
                        {isCreatingQuick ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Salvando...
                            </>
                        ) : duplicateError ? (
                            'Já Existente'
                        ) : (
                            'Salvar e Vincular'
                        )}
                    </Button>
                </div>
            </form>
        </BaseModal>
    );
}
