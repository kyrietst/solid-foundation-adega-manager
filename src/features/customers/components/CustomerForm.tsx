import React, { useState, useEffect } from 'react';
import * as z from 'zod';
import { Button } from '@/shared/ui/primitives/button';
import { Input } from '@/shared/ui/primitives/input';
import { Textarea } from '@/shared/ui/primitives/textarea';
import { Checkbox } from '@/shared/ui/primitives/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/primitives/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui/primitives/form';
import { useUpsertCustomer, useCustomer } from '@/features/customers/hooks/use-crm';
import { useStandardForm } from '@/shared/hooks/common/useStandardForm';
import { CustomerTagManager } from './CustomerTagManager';
import { Loader2, MapPin, Calendar, MessageSquare, Shield, CheckCircle2 } from 'lucide-react';
import { cn } from '@/core/config/utils';
import { FiscalAddressForm } from '@/shared/components/form/FiscalAddressForm';

// Schema para Endereço Fiscal (NFe 4.0 Standard) - Agora Opcional na Criação
const fiscalAddressSchema = z.object({
  cep: z.string().min(8, 'CEP inválido').max(9, 'CEP inválido').optional().or(z.literal('')),
  logradouro: z.string().optional(),
  numero: z.string().optional(),
  bairro: z.string().optional(),
  nome_municipio: z.string().optional(),
  uf: z.string().optional(),
  complemento: z.string().optional(),
  codigo_municipio: z.string().optional(), // IBGE
  pais: z.string().optional(),
  codigo_pais: z.string().optional(),
});

const formSchema = z.object({
  name: z.string().min(2, { message: 'O nome deve ter pelo menos 2 caracteres.' }),
  email: z.string().email({ message: 'Email inválido.' }).optional().or(z.literal('')),
  phone: z.string().optional(),
  address: fiscalAddressSchema.nullable().optional(),
  birthday: z.string().optional(),
  // Relaxed contact preference
  contact_preference: z.string().optional(),
  contact_permission: z.boolean().default(true),
  cpf_cnpj: z.string().max(18, 'Máximo 18 caracteres').optional().or(z.literal('')),
  ie: z.string().max(20, 'Máximo 20 caracteres').optional().or(z.literal('')),
  indicador_ie: z.coerce.number().optional().default(9),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

type CustomerFormValues = z.infer<typeof formSchema>;



interface CustomerFormProps {
  customerId?: string;
  onSuccess: () => void;
}

export function CustomerForm({ 
  customerId,
  onSuccess
}: CustomerFormProps) {
  const upsertCustomer = useUpsertCustomer();
  const { data: customerData, isLoading: isLoadingData } = useCustomer(customerId || '');
  const [currentTags, setCurrentTags] = useState<string[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showAddress, setShowAddress] = useState(false);

  // Initialize form with default empty values
  const { form, isLoading, handleSubmit } = useStandardForm<CustomerFormValues>({
    schema: formSchema,
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      address: {
        cep: '',
        logradouro: '',
        numero: '',
        bairro: '',
        nome_municipio: '',
        uf: '',
        complemento: '',
        codigo_municipio: '',
        pais: 'Brasil',
        codigo_pais: '1058'
      },
      birthday: '',
      contact_preference: undefined,
      contact_permission: true,
      notes: '',
      tags: [],
      cpf_cnpj: '',
      ie: '',
      indicador_ie: 9,
    },
    onSuccess: `Cliente ${customerId ? 'atualizado' : 'salvo'} com sucesso!`,
    onError: 'Erro ao salvar cliente',
    onSubmit: async (data: any) => {
      // Clean up empty optional fields before sending
      const payload = {
        ...data,
        id: customerId, // Include ID if editing
        tags: currentTags,
        // Sanitize empty strings to null for DB compatibility
        birthday: data.birthday === '' ? null : data.birthday,
        email: data.email === '' ? null : data.email,
        phone: data.phone === '' ? null : data.phone,
        notes: data.notes === '' ? null : data.notes,
        cpf_cnpj: data.cpf_cnpj === '' ? null : data.cpf_cnpj,
        ie: data.ie === '' ? null : data.ie,
        indicador_ie: data.indicador_ie,
        contact_preference: data.contact_preference || null,
        // Standardize address to FiscalAddress structure is handled by form
      };
      
      await upsertCustomer.mutateAsync(payload);
    },
    onSuccessCallback: onSuccess,
    resetOnSuccess: !customerId, // Don't reset if editing, or maybe yes? Usually close modal.
  });

  // Populate form when editing
  useEffect(() => {
    if (customerId && customerData) {
      setIsEditMode(true);
      if (customerData.tags) setCurrentTags(customerData.tags as any || []); // Ensure array
      
      const addressData = customerData.address as any; // FiscalAddress
      
      form.reset({
        name: customerData.name,
        email: customerData.email || '',
        phone: customerData.phone || '',
        birthday: customerData.birthday || '',
        contact_preference: (customerData.contact_preference as any) || '',
        contact_permission: customerData.contact_permission || false,

        notes: customerData.notes || '',
        cpf_cnpj: customerData.cpf_cnpj || '',
        ie: customerData.ie || '',
        indicador_ie: customerData.indicador_ie || 9,
        tags: (customerData.tags as any) || [], 
        address: addressData ? {
          cep: addressData.cep || '',
          logradouro: addressData.logradouro || '',
          numero: addressData.numero || '',
          bairro: addressData.bairro || '',
          nome_municipio: addressData.nome_municipio || '',
          uf: addressData.uf || '',
          complemento: addressData.complemento || '',
          codigo_municipio: addressData.codigo_municipio || '',
          pais: addressData.pais || 'Brasil',
          codigo_pais: addressData.codigo_pais || '1058'
        } : {
           cep: '', logradouro: '', numero: '', bairro: '', nome_municipio: '', uf: '', complemento: '', codigo_municipio: '', pais: 'Brasil', codigo_pais: '1058'
        }
      });
      if (addressData && addressData.logradouro) setShowAddress(true);
    }
  }, [customerId, customerData, form]);

  if (customerId && isLoadingData) {
    return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary-yellow" /></div>;
  }



  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-6">
        

        
        {/* Informações Básicas - Grid Responsivo */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <CheckCircle2 className="h-3 w-3 text-primary-yellow" />
            Informações Básicas
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-200 text-sm">Razão Social / Nome Completo *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Nome completo do cliente" 
                      aria-required="true"
                      className="bg-gray-800/50 border-primary-yellow/30 text-gray-200 focus:border-primary-yellow placeholder:text-gray-400 h-9"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cpf_cnpj"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-200 text-sm">CPF / CNPJ</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="000.000.000-00" 
                      className="bg-gray-800/50 border-primary-yellow/30 text-gray-200 focus:border-primary-yellow placeholder:text-gray-400 h-9"
                      {...field} 
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
                  <FormLabel className="text-gray-200 text-sm">Telefone / WhatsApp</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="(99) 99999-9999" 
                      type="tel"
                      aria-required="false"
                      className="bg-gray-800/50 border-primary-yellow/30 text-gray-200 focus:border-primary-yellow placeholder:text-gray-400 h-9"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-200 text-sm">Email</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="email@exemplo.com" 
                      type="email"
                      aria-required="false"
                      className="bg-gray-800/50 border-primary-yellow/30 text-gray-200 focus:border-primary-yellow placeholder:text-gray-400 h-9"
                      {...field} 
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
                  <FormLabel className="text-gray-200 text-sm">Data de Nascimento</FormLabel>
                  <FormControl>
                    <Input 
                      type="date"
                      className="bg-gray-800/50 border-primary-yellow/30 text-gray-200 focus:border-primary-yellow h-9"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
             <FormField
              control={form.control}
              name="ie"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-200 text-sm">Inscrição Estadual</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Isento ou Número" 
                      className="bg-gray-800/50 border-primary-yellow/30 text-gray-200 focus:border-primary-yellow placeholder:text-gray-400 h-9"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="indicador_ie"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-200 text-sm">Contribuinte ICMS?</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={String(field.value)}>
                    <FormControl>
                      <SelectTrigger className="bg-gray-800/50 border-primary-yellow/30 text-gray-200 focus:border-primary-yellow h-9">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">1 - Contribuinte ICMS</SelectItem>
                      <SelectItem value="2">2 - Contribuinte Isento</SelectItem>
                      <SelectItem value="9">9 - Não Contribuinte</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Endereço Fiscal Padronizado */}
        {/* Endereço Fiscal Padronizado (Collapsible) */}
        <div className="border border-gray-600/30 rounded-lg bg-gray-900/20 overflow-hidden transition-all duration-300">
          <button
            type="button"
            onClick={() => setShowAddress(!showAddress)}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-2 text-gray-200">
              <MapPin className="w-4 h-4 text-primary-yellow" />
              <h3 className="font-medium text-sm">Endereço (Fiscal & Delivery)</h3>
            </div>
             <span className="text-xs text-primary-yellow font-medium">
              {showAddress ? 'Ocultar' : 'Adicionar Endereço'}
            </span>
          </button>
          
          {showAddress && (
            <div className="px-4 pb-4 animate-in slide-in-from-top-2 duration-300">
              <div className="h-px w-full bg-gray-700/50 mb-4" />
              <FiscalAddressForm prefix="address" />
            </div>
          )}
        </div>

        {/* Preferências de Contato */}
        <div className="space-y-3 border border-gray-600/30 rounded-lg p-3">
          <div className="flex items-center gap-2 text-gray-200">
            <MessageSquare className="w-3 w-3" />
            <h3 className="text-sm font-semibold">Preferências de Comunicação</h3>
          </div>
          
          <FormField
            control={form.control}
            name="contact_preference"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-200 text-sm">Forma Preferida de Contato</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                  <FormControl>
                    <SelectTrigger className="bg-gray-800/50 border-primary-yellow/30 text-gray-200 focus:border-primary-yellow h-9">
                      <SelectValue placeholder="Selecione como prefere ser contatado" />
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
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-primary-yellow/30 p-3">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-gray-200 text-sm flex items-center gap-2">
                    <Shield className="w-3 h-3" />
                    Autorização LGPD *
                  </FormLabel>
                  <p className="text-xs text-gray-400">
                    Autorizo o recebimento de comunicações sobre produtos, promoções e ofertas especiais da adega.
                    Esta autorização pode ser revogada a qualquer momento.
                  </p>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Observações da Equipe */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <MessageSquare className="h-3 w-3 text-primary-yellow" />
            Observações da Equipe
          </h3>
          
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
              <FormControl>
                <Textarea 
                  placeholder="Anotações internas sobre o cliente (preferências, observações, etc.)"
                  className="bg-gray-800/50 border-primary-yellow/30 text-gray-200 focus:border-primary-yellow placeholder:text-gray-400 min-h-[80px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        </div>

        {/* Sistema de Tags Personalizáveis */}
        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <CustomerTagManager
                  tags={field.value || []}
                  onTagsChange={(newTags) => {
                    field.onChange(newTags);
                    setCurrentTags(newTags);
                  }}
                  maxTags={8}
                  placeholder="Digite uma tag para categorizar o cliente..."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Botão de Ação */}
        <div className="pt-4 border-t border-gray-700">
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary-yellow text-black hover:bg-primary-yellow/90 font-semibold"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin text-black" aria-hidden="true" />}
            Salvar Cliente
          </Button>
        </div>
      </form>
    </Form>
  );
}
