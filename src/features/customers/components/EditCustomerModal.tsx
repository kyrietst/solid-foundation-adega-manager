/**
 * EditCustomerModal.tsx - Modal para edição de clientes existentes
 * Baseado no NewCustomerModal com dados pré-carregados
 * 
 * @author Adega Manager Team
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { useToast } from '@/shared/hooks/common/use-toast';
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

// Schema de validação com Zod (mesmo do NewCustomerModal)
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
    .min(10, 'Telefone deve ter pelo menos 10 dígitos')
    .max(15, 'Telefone deve ter no máximo 15 dígitos')
    .regex(/^[\d\s()-+]+$/, 'Formato de telefone inválido')
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
    },
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
      
      form.reset({
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
  }, [customer, isOpen, form]);

  const onSubmit = async (data: EditCustomerFormData) => {
    if (!customer) return;
    
    setIsSubmitting(true);
    
    try {
      // Preparar dados para atualização
      const customerData = {
        id: customer.id, // ID obrigatório para update
        name: data.name,
        email: data.email || null,
        phone: data.phone || null,
        birthday: data.birthday || null,
        address: data.address && (
          data.address.street || 
          data.address.city || 
          data.address.state || 
          data.address.zipCode ||
          data.address.full_address
        ) ? {
          ...data.address,
          full_address: [
            data.address.street,
            data.address.city,
            data.address.state,
            data.address.zipCode
          ].filter(Boolean).join(', ') || data.address.full_address
        } : null,
        contact_preference: data.contact_preference || null,
        contact_permission: data.contact_permission,
        notes: data.notes || null,
        // Manter dados existentes que não são editáveis no modal
        segment: customer.segment,
        favorite_category: customer.favorite_category,
        lifetime_value: customer.lifetime_value,
      };

      await new Promise((resolve) => {
        upsertCustomer.mutate(customerData, {
          onSuccess: () => {
            toast({
              title: "✅ Cliente atualizado!",
              description: `${data.name} foi atualizado com sucesso.`,
              variant: "default",
            });
            
            onClose();
            resolve(true);
          },
          onError: (error: any) => {
            console.error('Erro ao atualizar cliente:', error);
            toast({
              title: "❌ Erro ao atualizar",
              description: error.message || "Erro inesperado. Tente novamente.",
              variant: "destructive",
            });
            resolve(false);
          },
        });
      });
    } catch (error) {
      console.error('Erro na atualização:', error);
      toast({
        title: "❌ Erro na atualização",
        description: "Erro inesperado. Verifique os dados e tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return; // Não permitir fechar durante envio
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
      className="max-h-content-2xl overflow-y-auto bg-black/95 backdrop-blur-sm border border-white/10"
    >

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                          placeholder="(11) 99999-9999"
                          {...field}
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
        </Form>
    </BaseModal>
  );
};

export default EditCustomerModal;