/**
 * NewCustomerModal.tsx - Modal para cadastro de novos clientes
 * Estilo padronizado: FormDialog + emojis + layout horizontal compacto
 */

import React from 'react';
import { z } from 'zod';
import { FormDialog } from '@/shared/ui/layout/FormDialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
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
import { useUpsertCustomer } from '@/features/customers/hooks/use-crm';
import { useStandardForm } from '@/shared/hooks/common/useStandardForm';
import { User, MessageSquare, MapPin } from 'lucide-react';
import { getGlassInputClasses } from '@/core/config/theme-utils';
import { cn } from '@/core/config/utils';
import { isValidBrazilianPhone, formatPhoneInput, PHONE_PLACEHOLDER, PHONE_ERROR_MESSAGE } from '@/shared/utils/phone';

// Schema de validação
const newCustomerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100, 'Nome deve ter no máximo 100 caracteres').regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras e espaços'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().refine((val) => !val || isValidBrazilianPhone(val), { message: PHONE_ERROR_MESSAGE }).optional().or(z.literal('')),
  birthday: z.string().optional().or(z.literal('')).refine((date) => {
    if (!date || date === '') return true;
    const birthDate = new Date(date);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    return age >= 0 && age <= 120;
  }, 'Data de nascimento inválida'),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    full_address: z.string().optional(),
  }).optional(),
  contact_preference: z.enum(['whatsapp', 'sms', 'email', 'call']).optional(),
  contact_permission: z.boolean().default(false),
  notes: z.string().max(500, 'Observações devem ter no máximo 500 caracteres').optional().or(z.literal('')),
});

type NewCustomerFormData = z.infer<typeof newCustomerSchema>;

interface NewCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewCustomerModal: React.FC<NewCustomerModalProps> = ({ isOpen, onClose }) => {
  const upsertCustomer = useUpsertCustomer();

  const { form, isLoading, handleSubmit } = useStandardForm<NewCustomerFormData>({
    schema: newCustomerSchema,
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      birthday: '',
      address: { street: '', city: '', state: '', zipCode: '', full_address: '' },
      contact_preference: undefined,
      contact_permission: false,
      notes: '',
    },
    onSuccess: (data) => `✅ Cliente ${data.name} cadastrado com sucesso!`,
    onError: 'Erro ao cadastrar cliente. Tente novamente.',
    onSuccessCallback: () => onClose(),
    onSubmit: async (data) => {
      const customerData = {
        name: data.name,
        email: data.email || null,
        phone: data.phone || null,
        birthday: data.birthday || null,
        address: data.address && (data.address.street || data.address.city || data.address.state || data.address.zipCode || data.address.full_address) ? {
          ...data.address,
          full_address: [data.address.street, data.address.city, data.address.state, data.address.zipCode].filter(Boolean).join(', ') || data.address.full_address
        } : null,
        contact_preference: data.contact_preference || null,
        contact_permission: data.contact_permission,
        notes: data.notes || null,
        segment: 'Novo',
        lifetime_value: 0,
        tags: [],
      };
      return new Promise<void>((resolve, reject) => {
        upsertCustomer.mutate(customerData, { onSuccess: () => resolve(), onError: (error: Error) => reject(error) });
      });
    },
  });

  const handleClose = () => {
    if (isLoading) return;
    form.reset();
    onClose();
  };

  const inputClasses = cn(getGlassInputClasses('form'), 'h-9 text-sm');

  return (
    <FormDialog
      open={isOpen}
      onOpenChange={(open) => !open && handleClose()}
      title="CADASTRAR CLIENTE"
      description="Preencha os dados do cliente. Apenas o nome é obrigatório."
      onSubmit={handleSubmit}
      submitLabel={isLoading ? 'Cadastrando...' : 'Cadastrar Cliente'}
      cancelLabel="Cancelar"
      loading={isLoading}
      size="full"
      variant="premium"
      glassEffect={true}
      className="max-w-5xl"
    >
      <Form {...form}>
        {/* Layout horizontal em 3 colunas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* ========================================== */}
          {/* COLUNA 1 - Identificação */}
          {/* ========================================== */}
          <div className="space-y-3">
            <h3 className="text-base font-semibold text-white flex items-center gap-2 border-b border-gray-700 pb-2">
              <User className="h-4 w-4 text-primary-yellow" />
              👤 Identificação
            </h3>

            {/* Nome */}
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-400">📝 Nome Completo *</label>
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="Ex: João Silva" {...field} className={inputClasses} />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )} />
            </div>

            {/* Data de Nascimento */}
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-400">🎂 Data de Nascimento</label>
              <FormField control={form.control} name="birthday" render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input type="date" {...field} className={inputClasses} />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )} />
            </div>

            {/* Observações */}
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-400">📋 Observações</label>
              <FormField control={form.control} name="notes" render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea placeholder="Informações adicionais..." className={cn(inputClasses, 'min-h-[60px] h-auto')} {...field} />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )} />
            </div>
          </div>

          {/* ========================================== */}
          {/* COLUNA 2 - Contato */}
          {/* ========================================== */}
          <div className="space-y-3">
            <h3 className="text-base font-semibold text-white flex items-center gap-2 border-b border-gray-700 pb-2">
              <MessageSquare className="h-4 w-4 text-primary-yellow" />
              📱 Contato
            </h3>

            {/* Email */}
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-400">📧 Email</label>
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input type="email" placeholder="joao@exemplo.com" {...field} className={inputClasses} />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )} />
            </div>

            {/* Telefone */}
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-400">📞 Telefone</label>
              <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder={PHONE_PLACEHOLDER} {...field} onChange={(e) => field.onChange(formatPhoneInput(e.target.value))} className={inputClasses} />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )} />
            </div>

            {/* Preferência de Contato */}
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-400">💬 Preferência</label>
              <FormField control={form.control} name="contact_preference" render={({ field }) => (
                <FormItem>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className={inputClasses}>
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
                  <FormMessage className="text-xs" />
                </FormItem>
              )} />
            </div>

            {/* Permitir Contatos */}
            <div className="flex items-center justify-between rounded-lg border border-gray-700 p-3 bg-gray-800/30">
              <div>
                <span className="text-sm text-gray-200 font-medium">✅ Permitir Contatos?</span>
                <p className="text-xs text-gray-500">Autoriza comunicações</p>
              </div>
              <FormField control={form.control} name="contact_permission" render={({ field }) => (
                <FormControl>
                  <SwitchAnimated checked={field.value} onCheckedChange={field.onChange} variant="yellow" size="sm" />
                </FormControl>
              )} />
            </div>
          </div>

          {/* ========================================== */}
          {/* COLUNA 3 - Endereço */}
          {/* ========================================== */}
          <div className="space-y-3">
            <h3 className="text-base font-semibold text-white flex items-center gap-2 border-b border-gray-700 pb-2">
              <MapPin className="h-4 w-4 text-primary-yellow" />
              📍 Endereço
            </h3>

            {/* Endereço Completo */}
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-400">🏠 Endereço Completo</label>
              <FormField control={form.control} name="address.full_address" render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="Rua das Flores, 123, Centro" {...field} className={inputClasses} />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )} />
            </div>

            {/* Rua + Cidade lado a lado */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-400">🛣️ Rua</label>
                <FormField control={form.control} name="address.street" render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="Rua das Flores" {...field} className={inputClasses} />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-400">🏙️ Cidade</label>
                <FormField control={form.control} name="address.city" render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="São Paulo" {...field} className={inputClasses} />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )} />
              </div>
            </div>

            {/* Estado + CEP lado a lado */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-400">🗺️ Estado</label>
                <FormField control={form.control} name="address.state" render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="SP" {...field} className={inputClasses} />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-400">📮 CEP</label>
                <FormField control={form.control} name="address.zipCode" render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="01234-567" {...field} className={inputClasses} />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )} />
              </div>
            </div>
          </div>
        </div>
      </Form>
    </FormDialog>
  );
};

export default NewCustomerModal;