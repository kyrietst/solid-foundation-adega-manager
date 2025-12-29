
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { User, MessageSquare, MapPin } from 'lucide-react';
import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/shared/ui/primitives/form';
import { Input } from '@/shared/ui/primitives/input';
import { Textarea } from '@/shared/ui/primitives/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/ui/primitives/select';
import { SwitchAnimated } from '@/shared/ui/primitives/switch-animated';
import { formatPhoneInput, PHONE_PLACEHOLDER } from '@/shared/utils/phone';

interface CustomerFormProps {
    form: UseFormReturn<any>;
}

export const CustomerForm: React.FC<CustomerFormProps> = ({ form }) => {
    return (
        <div className="space-y-6">
            {/* Informações Básicas */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <User className="h-4 w-4 text-blue-400" />
                    Informações Básicas
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-gray-300">Nome Completo *</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Ex: João Silva"
                                        {...field}
                                        className="bg-gray-800/50 border-gray-600 text-white"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="birthday"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-gray-300">Data de Nascimento</FormLabel>
                                <FormControl>
                                    <Input
                                        type="date"
                                        {...field}
                                        className="bg-gray-800/50 border-gray-600 text-white"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            </div>

            {/* Informações de Contato */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-green-400" />
                    Contato
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-gray-300">Email</FormLabel>
                                <FormControl>
                                    <Input
                                        type="email"
                                        placeholder="joao@exemplo.com"
                                        {...field}
                                        className="bg-gray-800/50 border-gray-600 text-white"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-gray-300">Telefone</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder={PHONE_PLACEHOLDER}
                                        {...field}
                                        onChange={(e) => field.onChange(formatPhoneInput(e.target.value))}
                                        className="bg-gray-800/50 border-gray-600 text-white"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="contact_preference"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-gray-300">Preferência de Contato</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value || ''}>
                                    <FormControl>
                                        <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white">
                                            <SelectValue placeholder="Selecione..." />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="whatsapp">WhatsApp</SelectItem>
                                        <SelectItem value="sms">SMS</SelectItem>
                                        <SelectItem value="email">Email</SelectItem>
                                        <SelectItem value="call">Ligação</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="contact_permission"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gray-600 p-3 bg-gray-800/30">
                                <div className="space-y-0.5">
                                    <FormLabel className="text-sm text-gray-300">
                                        Permitir Contatos
                                    </FormLabel>
                                    <FormDescription className="text-xs text-gray-500">
                                        Cliente autoriza receber comunicações
                                    </FormDescription>
                                </div>
                                <FormControl>
                                    <SwitchAnimated
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        variant="yellow"
                                        size="md"
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </div>
            </div>

            {/* Endereço */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-purple-400" />
                    Endereço
                </h3>

                <FormField
                    control={form.control}
                    name="address.full_address"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-gray-300">Endereço Completo</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Rua das Flores, 123, Centro, São Paulo - SP"
                                    {...field}
                                    className="bg-gray-800/50 border-gray-600 text-white"
                                />
                            </FormControl>
                            <FormDescription className="text-xs text-gray-500">
                                Ou preencha os campos separados abaixo
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <FormField
                        control={form.control}
                        name="address.street"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-gray-300">Rua</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Rua das Flores, 123"
                                        {...field}
                                        className="bg-gray-800/50 border-gray-600 text-white"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="address.city"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-gray-300">Cidade</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="São Paulo"
                                        {...field}
                                        className="bg-gray-800/50 border-gray-600 text-white"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="address.state"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-gray-300">Estado</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="SP"
                                        {...field}
                                        className="bg-gray-800/50 border-gray-600 text-white"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="address.zipCode"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-gray-300">CEP</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="01234-567"
                                        {...field}
                                        className="bg-gray-800/50 border-gray-600 text-white"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            </div>

            {/* Observações */}
            <div className="space-y-4">
                <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-gray-300">Observações</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Informações adicionais sobre o cliente..."
                                    className="bg-gray-800/50 border-gray-600 text-white min-h-[80px]"
                                    {...field}
                                />
                            </FormControl>
                            <FormDescription className="text-xs text-gray-500">
                                Máximo 500 caracteres
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
        </div>
    );
};
