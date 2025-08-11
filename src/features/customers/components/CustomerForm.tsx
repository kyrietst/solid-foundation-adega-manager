import React, { useState } from 'react';
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
import { useUpsertCustomer } from '@/features/customers/hooks/use-crm';
import { useFormWithToast } from '@/shared/hooks/common/use-form-with-toast';
import { CustomerTagManager } from './CustomerTagManager';
import { Loader2, MapPin, Calendar, Phone, MessageSquare, Shield, CheckCircle2 } from 'lucide-react';
import { cn } from '@/core/config/utils';
import { getGlassCardClasses } from '@/core/config/theme-utils';

const addressSchema = z.object({
  street: z.string().min(2, 'Rua é obrigatória'),
  number: z.string().min(1, 'Número é obrigatório'),
  complement: z.string().optional(),
  neighborhood: z.string().min(2, 'Bairro é obrigatório'),
  city: z.string().min(2, 'Cidade é obrigatória'),
  state: z.string().min(2, 'Estado é obrigatório'),
  zipcode: z.string().min(8, 'CEP deve ter 8 dígitos').max(9, 'CEP inválido'),
}).optional();

const formSchema = z.object({
  name: z.string().min(2, { message: 'O nome deve ter pelo menos 2 caracteres.' }),
  email: z.string().email({ message: 'Email inválido.' }).optional().or(z.literal('')),
  phone: z.string().optional(),
  address: addressSchema,
  birthday: z.string().optional(),
  contact_preference: z.enum(['whatsapp', 'sms', 'email', 'call', '']).optional(),
  contact_permission: z.boolean().refine(val => val === true, {
    message: "É obrigatório aceitar os termos de contato conforme LGPD"
  }),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

type CustomerFormValues = z.infer<typeof formSchema>;

const calculateProfileCompleteness = (values: CustomerFormValues): number => {
  const weights = {
    name: 15,
    phone: 15,
    contact_permission: 15, // Obrigatório LGPD
    email: 10,
    address: 10,
    birthday: 10,
    contact_preference: 10,
    notes: 5,
    tags: 10 // Tags personalizáveis
  };
  
  let totalPoints = 0;
  
  if (values.name?.trim()) totalPoints += weights.name;
  if (values.phone?.trim()) totalPoints += weights.phone;
  if (values.contact_permission) totalPoints += weights.contact_permission;
  if (values.email?.trim()) totalPoints += weights.email;
  if (values.address && values.address.street && values.address.city) totalPoints += weights.address;
  if (values.birthday?.trim()) totalPoints += weights.birthday;
  if (values.contact_preference?.trim()) totalPoints += weights.contact_preference;
  if (values.notes?.trim()) totalPoints += weights.notes;
  if (values.tags && values.tags.length > 0) totalPoints += weights.tags;
  
  const maxPoints = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
  return Math.round((totalPoints / maxPoints) * 100);
};

interface CustomerFormProps {
  onSuccess: () => void;
  variant?: 'default' | 'premium' | 'success' | 'warning' | 'error';
  glassEffect?: boolean;
}

export function CustomerForm({ 
  onSuccess,
  variant = 'default',
  glassEffect = true
}: CustomerFormProps) {
  const upsertCustomer = useUpsertCustomer();
  const [currentTags, setCurrentTags] = useState<string[]>([]);

  const form = useFormWithToast<CustomerFormValues>({
    schema: formSchema,
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      address: {
        street: '',
        number: '',
        complement: '',
        neighborhood: '',
        city: '',
        state: '',
        zipcode: '',
      },
      birthday: '',
      contact_preference: '',
      contact_permission: false,
      notes: '',
      tags: [],
    },
    successMessage: 'Cliente salvo!',
    successDescription: 'O novo cliente foi cadastrado com sucesso.',
    errorTitle: 'Erro ao salvar',
    onSuccess,
  });

  const glassClasses = glassEffect ? getGlassCardClasses(variant) : '';
  
  // Calcular completude em tempo real
  const currentValues = form.watch();
  const completeness = calculateProfileCompleteness(currentValues);
  
  const getCompletenessColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-400';
    if (percentage >= 60) return 'text-yellow-400'; 
    return 'text-red-400';
  };
  
  const getCompletenessBarColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Form {...form}>
      <fieldset className={cn('space-y-4 p-6 rounded-lg', glassClasses)}>
        <legend className="sr-only">Informações do Cliente</legend>
        
        {/* Indicador de Completude do Perfil */}
        <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-600/30">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary-yellow" />
              <span className="text-gray-200 font-medium">Completude do Perfil</span>
            </div>
            <span className={cn("font-bold text-sm", getCompletenessColor(completeness))}>
              {completeness}%
            </span>
          </div>
          
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className={cn("h-2 rounded-full transition-all duration-300", getCompletenessBarColor(completeness))}
              style={{ width: `${completeness}%` }}
            />
          </div>
          
          <p className="text-xs text-gray-400 mt-2">
            {completeness >= 80 
              ? "Perfil completo! Todos os dados essenciais coletados."
              : completeness >= 60 
              ? "Bom progresso! Preencha mais campos para melhorar o CRM."
              : "Perfil básico. Adicione mais informações para aproveitar todas as funcionalidades."
            }
          </p>
        </div>
        
        <form onSubmit={form.handleSubmit(upsertCustomer)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-200">Nome *</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Nome completo do cliente" 
                  aria-required="true"
                  className="bg-gray-800/50 border-primary-yellow/30 text-gray-200 focus:border-primary-yellow placeholder:text-gray-400"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-200">Email</FormLabel>
              <FormControl>
                <Input 
                  placeholder="email@exemplo.com" 
                  type="email"
                  aria-required="false"
                  className="bg-gray-800/50 border-primary-yellow/30 text-gray-200 focus:border-primary-yellow placeholder:text-gray-400"
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
              <FormLabel className="text-gray-200">Telefone</FormLabel>
              <FormControl>
                <Input 
                  placeholder="(99) 99999-9999" 
                  type="tel"
                  aria-required="false"
                  className="bg-gray-800/50 border-primary-yellow/30 text-gray-200 focus:border-primary-yellow placeholder:text-gray-400"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Endereço */}
        <div className="space-y-4 border border-gray-600/30 rounded-lg p-4">
          <div className="flex items-center gap-2 text-gray-200">
            <MapPin className="w-4 h-4" />
            <h3 className="font-medium">Endereço para Delivery</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="address.street"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-200">Rua/Avenida</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Nome da rua ou avenida"
                      className="bg-gray-800/50 border-primary-yellow/30 text-gray-200 focus:border-primary-yellow placeholder:text-gray-400"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="address.number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-200">Número</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="123"
                      className="bg-gray-800/50 border-primary-yellow/30 text-gray-200 focus:border-primary-yellow placeholder:text-gray-400"
                      {...field} 
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
              name="address.complement"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-200">Complemento</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Apto, bloco, etc (opcional)"
                      className="bg-gray-800/50 border-primary-yellow/30 text-gray-200 focus:border-primary-yellow placeholder:text-gray-400"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="address.neighborhood"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-200">Bairro</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Nome do bairro"
                      className="bg-gray-800/50 border-primary-yellow/30 text-gray-200 focus:border-primary-yellow placeholder:text-gray-400"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="address.city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-200">Cidade</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Nome da cidade"
                      className="bg-gray-800/50 border-primary-yellow/30 text-gray-200 focus:border-primary-yellow placeholder:text-gray-400"
                      {...field} 
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
                  <FormLabel className="text-gray-200">Estado</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="SP"
                      className="bg-gray-800/50 border-primary-yellow/30 text-gray-200 focus:border-primary-yellow placeholder:text-gray-400"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="address.zipcode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-200">CEP</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="12345-678"
                      className="bg-gray-800/50 border-primary-yellow/30 text-gray-200 focus:border-primary-yellow placeholder:text-gray-400"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Informações Pessoais */}
        <div className="space-y-4 border border-gray-600/30 rounded-lg p-4">
          <div className="flex items-center gap-2 text-gray-200">
            <Calendar className="w-4 h-4" />
            <h3 className="font-medium">Informações Pessoais</h3>
          </div>
          
          <FormField
            control={form.control}
            name="birthday"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-200">Data de Aniversário</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="dd/mm/aaaa"
                    type="date"
                    className="bg-gray-800/50 border-primary-yellow/30 text-gray-200 focus:border-primary-yellow placeholder:text-gray-400"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Preferências de Contato */}
        <div className="space-y-4 border border-gray-600/30 rounded-lg p-4">
          <div className="flex items-center gap-2 text-gray-200">
            <MessageSquare className="w-4 h-4" />
            <h3 className="font-medium">Preferências de Comunicação</h3>
          </div>
          
          <FormField
            control={form.control}
            name="contact_preference"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-200">Forma Preferida de Contato</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-gray-800/50 border-primary-yellow/30 text-gray-200 focus:border-primary-yellow">
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
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-primary-yellow/30 p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-gray-200 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
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
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-200">Observações da Equipe</FormLabel>
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

          <Button 
            type="submit" 
            disabled={form.isSubmitting} 
            className="w-full bg-primary-yellow text-black hover:bg-primary-yellow/90 font-semibold"
          >
            {form.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin text-black" aria-hidden="true" />}
            Salvar Cliente
          </Button>
        </form>
      </fieldset>
    </Form>
  );
}
