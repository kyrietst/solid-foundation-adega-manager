/**
 * Hook para formulário de fornecedores com validação
 * Segue padrão v2.0.0 com Zod + React Hook Form
 */

import { z } from 'zod';
import { useFormWithToast } from '@/shared/hooks/common/use-form-with-toast';
import { useCreateSupplier, useUpdateSupplier } from './useSuppliers';
import type { Supplier, SupplierFormData } from '../types';

// Schema de validação com Zod
const supplierSchema = z.object({
  company_name: z.string()
    .min(2, 'Nome da empresa deve ter pelo menos 2 caracteres')
    .max(100, 'Nome da empresa deve ter no máximo 100 caracteres'),
  
  contact_info: z.object({
    phone: z.string()
      .optional()
      .refine(val => !val || val.length >= 10, 'Telefone deve ter pelo menos 10 dígitos'),
    whatsapp: z.string()
      .optional()
      .refine(val => !val || val.length >= 10, 'WhatsApp deve ter pelo menos 10 dígitos'),
    email: z.string()
      .optional()
      .refine(val => !val || z.string().email().safeParse(val).success, 'Email inválido'),
  }).refine(
    data => data.phone || data.whatsapp || data.email,
    { message: 'Pelo menos um meio de contato é obrigatório' }
  ),
  
  products_supplied: z.array(z.string())
    .min(1, 'Pelo menos um produto deve ser informado'),
  
  delivery_time: z.string().optional(),
  
  payment_methods: z.array(z.string())
    .min(1, 'Pelo menos uma forma de pagamento deve ser selecionada'),
  
  minimum_order_value: z.number()
    .min(0, 'Valor mínimo deve ser positivo')
    .max(999999, 'Valor mínimo muito alto'),
  
  notes: z.string()
    .max(500, 'Observações devem ter no máximo 500 caracteres')
    .optional(),
});

/**
 * Hook para criar novo fornecedor
 */
export const useCreateSupplierForm = () => {
  const createSupplier = useCreateSupplier();
  
  return useFormWithToast({
    schema: supplierSchema,
    defaultValues: {
      company_name: '',
      contact_info: {
        phone: '',
        whatsapp: '',
        email: '',
      },
      products_supplied: [],
      delivery_time: '',
      payment_methods: [],
      minimum_order_value: 0,
      notes: '',
    },
    onSuccess: (data: SupplierFormData) => {
      createSupplier.mutate(data);
    },
    successMessage: 'Fornecedor criado com sucesso!',
  });
};

/**
 * Hook para editar fornecedor existente
 */
export const useEditSupplierForm = (supplier: Supplier) => {
  const updateSupplier = useUpdateSupplier();
  
  return useFormWithToast({
    schema: supplierSchema,
    defaultValues: {
      company_name: supplier.company_name,
      contact_info: {
        phone: supplier.contact_info?.phone || '',
        whatsapp: supplier.contact_info?.whatsapp || '',
        email: supplier.contact_info?.email || '',
      },
      products_supplied: supplier.products_supplied || [],
      delivery_time: supplier.delivery_time || '',
      payment_methods: supplier.payment_methods || [],
      minimum_order_value: supplier.minimum_order_value || 0,
      notes: supplier.notes || '',
    },
    onSuccess: (data: SupplierFormData) => {
      updateSupplier.mutate({ id: supplier.id, data });
    },
    successMessage: 'Fornecedor atualizado com sucesso!',
  });
};

// Utilitários para validação individual
export const validateSupplierName = (name: string) => {
  const result = z.string().min(2).max(100).safeParse(name);
  return result.success ? null : result.error.errors[0].message;
};

export const validateContactInfo = (contactInfo: any) => {
  const hasContact = contactInfo.phone || contactInfo.whatsapp || contactInfo.email;
  if (!hasContact) {
    return 'Pelo menos um meio de contato é obrigatório';
  }
  return null;
};

export const validateMinimumOrderValue = (value: number) => {
  if (value < 0) return 'Valor deve ser positivo';
  if (value > 999999) return 'Valor muito alto';
  return null;
};