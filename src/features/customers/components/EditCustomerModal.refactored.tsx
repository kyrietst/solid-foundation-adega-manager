/**
 * EditCustomerModal.tsx - Modal para edição de clientes existentes (REFATORADO)
 * Context7 Pattern: Form State Consolidation aplicado
 * Elimina duplicação de estado encontrada na análise (isSubmitting, toast, etc.)
 *
 * REFATORAÇÃO APLICADA:
 * - Hook useFormWithToast centralizado
 * - Eliminação de estado local duplicado
 * - Validação Zod integrada
 * - Toast padronizado
 * - Error handling consolidado
 *
 * @author Adega Manager Team
 * @version 2.0.0 - Refatorado com Context7
 */

import React, { useEffect } from 'react';
import { z } from 'zod';
import { BaseModal } from '@/shared/ui/composite';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui/primitives/form';
import { Input } from '@/shared/ui/primitives/input';
import { Button } from '@/shared/ui/primitives/button';
import { Textarea } from '@/shared/ui/primitives/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/primitives/select';
import { SwitchAnimated } from '@/shared/ui/primitives/switch-animated';
import { Label } from '@/shared/ui/primitives/label';
import { useUpsertCustomer } from '@/features/customers/hooks/use-crm';
import { useFormWithToast } from '@/shared/hooks/common/useFormWithToast';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  MessageSquare,
  Save,
  X,
  Edit
} from 'lucide-react';
import { isValidBrazilianPhone, formatPhoneInput, PHONE_PLACEHOLDER, PHONE_ERROR_MESSAGE } from '@/shared/utils/phone';

// Schema de validação com Zod (reutilizado)
const editCustomerSchema = z.object({
  name: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras e espaços'),

  email: z
    .string()
    .email('Email inválido')
    .optional()
    .or(z.literal('')),

  phone: z
    .string()
    .refine((val) => !val || isValidBrazilianPhone(val), {
      message: PHONE_ERROR_MESSAGE
    })
    .optional()
    .or(z.literal('')),

  birthday: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine((date) => {
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

  contact_preference: z
    .enum(['whatsapp', 'sms', 'email', 'call'])
    .optional(),

  contact_permission: z.boolean().default(false),

  notes: z
    .string()
    .max(500, 'Observações devem ter no máximo 500 caracteres')
    .optional()
    .or(z.literal('')),
});

type EditCustomerFormData = z.infer<typeof editCustomerSchema>;

// Interface para os dados do cliente
interface CustomerData {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  birthday?: string | null;
  address?: any;
  contact_preference?: string | null;
  contact_permission?: boolean;
  notes?: string | null;
  segment?: string | null;
  favorite_category?: string | null;
  lifetime_value?: number;
  created_at?: string;
}

interface EditCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: CustomerData | null;
}

export const EditCustomerModal: React.FC<EditCustomerModalProps> = ({
  isOpen,
  onClose,
  customer,
}) => {
  const upsertCustomer = useUpsertCustomer();

  // Dados iniciais do formulário
  const initialFormData: EditCustomerFormData = {
    name: '',
    email: '',
    phone: '',
    birthday: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      full_address: '',
    },
    contact_preference: undefined,
    contact_permission: false,
    notes: '',
  };

  // Hook centralizado de formulário com toast
  const {
    data,
    errors,
    isSubmitting,
    updateField,
    updateFields,
    handleSubmit,
    reset,
    getError,
  } = useFormWithToast(initialFormData, {
    schema: editCustomerSchema,
    onSubmit: async (formData) => {
      if (!customer) return;

      // Preparar dados para atualização
      const customerData = {
        id: customer.id, // ID obrigatório para update
        name: formData.name,
        email: formData.email || null,
        phone: formData.phone || null,
        birthday: formData.birthday || null,
        address: formData.address && (
          formData.address.street ||
          formData.address.city ||
          formData.address.state ||
          formData.address.zipCode ||
          formData.address.full_address
        ) ? {
          ...formData.address,
          full_address: [
            formData.address.street,
            formData.address.city,
            formData.address.state,
            formData.address.zipCode
          ].filter(Boolean).join(', ') || formData.address.full_address
        } : null,
        contact_preference: formData.contact_preference || null,
        contact_permission: formData.contact_permission,
        notes: formData.notes || null,
        // Manter dados existentes que não são editáveis no modal
        segment: customer.segment,
        favorite_category: customer.favorite_category,
        lifetime_value: customer.lifetime_value,
      };

      // Usar Promise para aguardar o resultado da mutação
      await new Promise((resolve, reject) => {
        upsertCustomer.mutate(customerData, {
          onSuccess: () => resolve(true),
          onError: (error: any) => reject(new Error(error.message || "Erro inesperado ao atualizar cliente")),
        });
      });
    },
    onSuccess: onClose,
    successMessage: `Cliente "${data.name}" atualizado com sucesso!`,
    errorMessage: 'Erro ao atualizar cliente',
    resetOnSuccess: false, // Não resetar ao salvar (é uma edição)
  });

  // Carregar dados do cliente quando o modal abrir
  useEffect(() => {
    if (customer && isOpen) {
      // Processar data de nascimento
      const birthdayFormatted = customer.birthday
        ? new Date(customer.birthday).toISOString().split('T')[0]
        : '';

      // Processar endereço
      const address = customer.address || {};

      updateFields({
        name: customer.name || '',
        email: customer.email || '',
        phone: customer.phone || '',
        birthday: birthdayFormatted,
        address: {
          street: address.street || '',
          city: address.city || '',
          state: address.state || '',
          zipCode: address.zipCode || '',
          full_address: address.full_address || '',
        },
        contact_preference: customer.contact_preference as any || undefined,
        contact_permission: customer.contact_permission || false,
        notes: customer.notes || '',
      });
    }
  }, [customer, isOpen, updateFields]);

  const handleClose = () => {
    if (isSubmitting) return; // Não permitir fechar durante envio
    reset(); // Limpar formulário
    onClose();
  };

  if (!customer) return null;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title={
        <>
          <Edit className="h-5 w-5 text-blue-400" />
          Editar Cliente
        </>
      }
      description={`Atualize os dados de ${customer.name}`}
      size="2xl"
      className="max-h-[90vh] overflow-y-auto bg-black/95 backdrop-blur-sm border border-white/10"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informações Básicas */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <User className="h-4 w-4 text-blue-400" />
            Informações Básicas
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-300">Nome Completo *</Label>
              <Input
                placeholder="Ex: João Silva"
                value={data.name}
                onChange={(e) => updateField('name', e.target.value)}
                className="bg-gray-800/50 border-gray-600 text-white"
              />
              {getError('name') && (
                <p className="text-red-500 text-sm mt-1">{getError('name')}</p>
              )}
            </div>

            <div>
              <Label className="text-gray-300">Data de Nascimento</Label>
              <Input
                type="date"
                value={data.birthday}
                onChange={(e) => updateField('birthday', e.target.value)}
                className="bg-gray-800/50 border-gray-600 text-white"
              />
              {getError('birthday') && (
                <p className="text-red-500 text-sm mt-1">{getError('birthday')}</p>
              )}
            </div>
          </div>
        </div>

        {/* Informações de Contato */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-green-400" />
            Contato
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-300">Email</Label>
              <Input
                type="email"
                placeholder="joao@exemplo.com"
                value={data.email}
                onChange={(e) => updateField('email', e.target.value)}
                className="bg-gray-800/50 border-gray-600 text-white"
              />
              {getError('email') && (
                <p className="text-red-500 text-sm mt-1">{getError('email')}</p>
              )}
            </div>

            <div>
              <Label className="text-gray-300">Telefone</Label>
              <Input
                placeholder={PHONE_PLACEHOLDER}
                value={data.phone}
                onChange={(e) => updateField('phone', formatPhoneInput(e.target.value))}
                className="bg-gray-800/50 border-gray-600 text-white"
              />
              {getError('phone') && (
                <p className="text-red-500 text-sm mt-1">{getError('phone')}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-300">Preferência de Contato</Label>
              <Select
                value={data.contact_preference || ''}
                onValueChange={(value) => updateField('contact_preference', value)}
              >
                <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="call">Ligação</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-row items-center justify-between rounded-lg border border-gray-600 p-3 bg-gray-800/30">
              <div className="space-y-0.5">
                <Label className="text-sm text-gray-300">
                  Permitir Contatos
                </Label>
                <p className="text-xs text-gray-500">
                  Cliente autoriza receber comunicações
                </p>
              </div>
              <SwitchAnimated
                checked={data.contact_permission}
                onCheckedChange={(checked) => updateField('contact_permission', checked)}
                variant="yellow"
                size="md"
              />
            </div>
          </div>
        </div>

        {/* Endereço */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <MapPin className="h-4 w-4 text-purple-400" />
            Endereço
          </h3>

          <div>
            <Label className="text-gray-300">Endereço Completo</Label>
            <Input
              placeholder="Rua das Flores, 123, Centro, São Paulo - SP"
              value={data.address?.full_address || ''}
              onChange={(e) => updateField('address', { ...data.address, full_address: e.target.value })}
              className="bg-gray-800/50 border-gray-600 text-white"
            />
            <p className="text-xs text-gray-500 mt-1">
              Ou preencha os campos separados abaixo
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label className="text-gray-300">Rua</Label>
              <Input
                placeholder="Rua das Flores, 123"
                value={data.address?.street || ''}
                onChange={(e) => updateField('address', { ...data.address, street: e.target.value })}
                className="bg-gray-800/50 border-gray-600 text-white"
              />
            </div>

            <div>
              <Label className="text-gray-300">Cidade</Label>
              <Input
                placeholder="São Paulo"
                value={data.address?.city || ''}
                onChange={(e) => updateField('address', { ...data.address, city: e.target.value })}
                className="bg-gray-800/50 border-gray-600 text-white"
              />
            </div>

            <div>
              <Label className="text-gray-300">Estado</Label>
              <Input
                placeholder="SP"
                value={data.address?.state || ''}
                onChange={(e) => updateField('address', { ...data.address, state: e.target.value })}
                className="bg-gray-800/50 border-gray-600 text-white"
              />
            </div>

            <div>
              <Label className="text-gray-300">CEP</Label>
              <Input
                placeholder="01234-567"
                value={data.address?.zipCode || ''}
                onChange={(e) => updateField('address', { ...data.address, zipCode: e.target.value })}
                className="bg-gray-800/50 border-gray-600 text-white"
              />
            </div>
          </div>
        </div>

        {/* Observações */}
        <div className="space-y-4">
          <div>
            <Label className="text-gray-300">Observações</Label>
            <Textarea
              placeholder="Informações adicionais sobre o cliente..."
              className="bg-gray-800/50 border-gray-600 text-white min-h-[80px]"
              value={data.notes}
              onChange={(e) => updateField('notes', e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">
              Máximo 500 caracteres
            </p>
            {getError('notes') && (
              <p className="text-red-500 text-sm mt-1">{getError('notes')}</p>
            )}
          </div>
        </div>

        {/* Informações do Sistema (Read-only) */}
        <div className="space-y-4 border-t border-gray-700 pt-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            Informações do Sistema
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-800/30 rounded-lg p-3">
              <Label className="text-xs text-gray-400">Segmento</Label>
              <p className="text-sm text-white font-medium">{customer.segment || 'Não definido'}</p>
            </div>

            <div className="bg-gray-800/30 rounded-lg p-3">
              <Label className="text-xs text-gray-400">LTV Atual</Label>
              <p className="text-sm text-white font-medium">
                R$ {(customer.lifetime_value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>

            <div className="bg-gray-800/30 rounded-lg p-3">
              <Label className="text-xs text-gray-400">Cliente desde</Label>
              <p className="text-sm text-white font-medium">
                {customer.created_at ? new Date(customer.created_at).toLocaleDateString('pt-BR') : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Salvar Alterações
              </>
            )}
          </Button>
        </div>
      </form>
    </BaseModal>
  );
};

export default EditCustomerModal;