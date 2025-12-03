import React, { useState, useId } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';
import { BaseModal } from '@/shared/ui/composite/BaseModal';
import { Button } from '@/shared/ui/primitives/button';
import { Input } from '@/shared/ui/primitives/input';
import { Label } from '@/shared/ui/primitives/label';
import { useToast } from '@/shared/hooks/common/use-toast';
import { UserPlus, Loader2, Phone, User } from 'lucide-react';
import { cn } from '@/core/config/utils';

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
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const createCustomer = useMutation({
        mutationFn: async () => {
            const { data, error } = await supabase.rpc('create_quick_customer', {
                p_name: name,
                p_phone: phone || null
            });

            if (error) throw error;
            return data as string; // Returns uuid
        },
        onSuccess: (newCustomerId) => {
            toast({
                title: "Cliente cadastrado!",
                description: "Cliente vinculado à venda com sucesso.",
                variant: "default",
                className: "bg-green-500 border-green-600 text-white"
            });

            // Invalidate customers list to ensure search works later
            queryClient.invalidateQueries({ queryKey: ['customers'] });

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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            toast({
                title: "Nome obrigatório",
                description: "Por favor, informe o nome do cliente.",
                variant: "destructive"
            });
            return;
        }
        createCustomer.mutate();
    };

    const handleClose = () => {
        setName('');
        setPhone('');
        onClose();
    };

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={handleClose}
            title="Cadastro Rápido"
            size="sm"
            icon={UserPlus}
            iconColor="text-primary-yellow"
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
                            autoFocus
                        />
                    </div>

                    {/* Phone Input */}
                    <div className="space-y-2">
                        <Label htmlFor={`${formId}-quick-phone`} className="text-gray-200 flex items-center gap-2">
                            <Phone className="h-4 w-4 text-primary-yellow" />
                            Telefone / WhatsApp
                        </Label>
                        <Input
                            id={`${formId}-quick-phone`}
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="Ex: 11 99999-9999"
                            className="bg-gray-800/50 border-white/10 text-white focus:border-primary-yellow/50 placeholder:text-gray-500"
                        />
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
                        disabled={createCustomer.isPending}
                        className={cn(
                            "flex-1 font-semibold",
                            "bg-primary-yellow text-black hover:bg-primary-yellow/90"
                        )}
                    >
                        {createCustomer.isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Salvando...
                            </>
                        ) : (
                            'Salvar e Vincular'
                        )}
                    </Button>
                </div>
            </form>
        </BaseModal>
    );
}
