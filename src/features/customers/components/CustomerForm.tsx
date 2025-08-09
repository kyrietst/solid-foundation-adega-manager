import React from 'react';
import * as z from 'zod';
import { Button } from '@/shared/ui/primitives/button';
import { Input } from '@/shared/ui/primitives/input';
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
import { Loader2 } from 'lucide-react';
import { cn } from '@/core/config/utils';
import { getGlassCardClasses } from '@/core/config/theme-utils';

const formSchema = z.object({
  name: z.string().min(2, { message: 'O nome deve ter pelo menos 2 caracteres.' }),
  email: z.string().email({ message: 'Email inválido.' }).optional().or(z.literal('')),
  phone: z.string().optional(),
});

type CustomerFormValues = z.infer<typeof formSchema>;

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

  const form = useFormWithToast<CustomerFormValues>({
    schema: formSchema,
    defaultValues: {
      name: '',
      email: '',
      phone: '',
    },
    successMessage: 'Cliente salvo!',
    successDescription: 'O novo cliente foi cadastrado com sucesso.',
    errorTitle: 'Erro ao salvar',
    onSuccess,
  });

  const glassClasses = glassEffect ? getGlassCardClasses(variant) : '';

  return (
    <Form {...form}>
      <fieldset className={cn('space-y-4 p-6 rounded-lg', glassClasses)}>
        <legend className="sr-only">Informações do Cliente</legend>
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
