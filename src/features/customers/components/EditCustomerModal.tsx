
/**
 * EditCustomerModal.tsx - Modal para edição de clientes existentes
 * Refatorado para usar CustomerForm
 * 
 * @author Adega Manager Team
 * @version 1.1.0
 */

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { BaseModal } from '@/shared/ui/composite';
import { Form } from '@/shared/ui/primitives/form';
import { Button } from '@/shared/ui/primitives/button';
import { useUpsertCustomer } from '@/features/customers/hooks/use-crm';
import { useToast } from '@/shared/hooks/common/use-toast';
import { Edit, Save, X, Calendar } from 'lucide-react'; // Added Calendar import
import { isValidBrazilianPhone, PHONE_ERROR_MESSAGE } from '@/shared/utils/phone';
import { Label } from '@/shared/ui/primitives/label';
import { CustomerForm } from './forms/CustomerForm';

// Schema Validation
const editCustomerSchema = z.object({
  name: z.string().min(2, 'Nome muito curto').max(100).regex(/^[a-zA-ZÀ-ÿ\s]+$/),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().refine(val => !val || isValidBrazilianPhone(val), { message: PHONE_ERROR_MESSAGE }).optional().or(z.literal('')),
  birthday: z.string().optional().or(z.literal('')),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    full_address: z.string().optional(),
  }).optional(),
  contact_preference: z.enum(['whatsapp', 'sms', 'email', 'call']).optional(),
  contact_permission: z.boolean().default(false),
  notes: z.string().max(500).optional().or(z.literal('')),
});

type EditCustomerFormData = z.infer<typeof editCustomerSchema>;

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
  lifetime_value?: number;
  created_at?: string;
  favorite_category?: string | null;
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
  const { toast } = useToast();
  const upsertCustomer = useUpsertCustomer();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<EditCustomerFormData>({
    resolver: zodResolver(editCustomerSchema),
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
  });

  useEffect(() => {
    if (customer && isOpen) {
      const address = customer.address || {};
      form.reset({
        name: customer.name || '',
        email: customer.email || '',
        phone: customer.phone || '',
        birthday: customer.birthday ? new Date(customer.birthday).toISOString().split('T')[0] : '',
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
  }, [customer, isOpen, form]);

  const onSubmit = async (data: EditCustomerFormData) => {
    if (!customer) return;
    setIsSubmitting(true);

    try {
      const customerData = {
        id: customer.id,
        name: data.name,
        email: data.email || null,
        phone: data.phone || null,
        birthday: data.birthday || null,
        address: data.address ? {
          ...data.address,
          full_address: [data.address.street, data.address.city, data.address.state]
            .filter(Boolean).join(', ') || data.address.full_address
        } : null,
        contact_preference: data.contact_preference || null,
        contact_permission: data.contact_permission,
        notes: data.notes || null,
        segment: customer.segment as any,
        favorite_category: customer.favorite_category,
        lifetime_value: customer.lifetime_value,
      };

      await upsertCustomer.mutateAsync(customerData);
      toast({ title: "✅ Cliente atualizado!", description: "Dados salvos com sucesso." });
      onClose();
    } catch (error: any) {
      toast({ title: "❌ Erro ao atualizar", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!customer) return null;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={<><Edit className="h-5 w-5 text-blue-400" /> Editar Cliente</>}
      description={`Atualize os dados de ${customer.name}`}
      size="2xl"
      className="max-h-content-2xl overflow-y-auto bg-black/95 backdrop-blur-sm border border-white/10"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <CustomerForm form={form} />

          {/* Read-Only Info */}
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

          {/* Footer Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting} className="border-gray-600 text-gray-300">
              <X className="h-4 w-4 mr-2" /> Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-blue-500 hover:bg-blue-600 text-white">
              {isSubmitting ? 'Salvando...' : <><Save className="h-4 w-4 mr-2" /> Salvar Alterações</>}
            </Button>
          </div>
        </form>
      </Form>
    </BaseModal>
  );
};

export default EditCustomerModal;