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

const formSchema = z.object({
  name: z.string().min(2, { message: 'O nome deve ter pelo menos 2 caracteres.' }),
  email: z.string().email({ message: 'Email inválido.' }).optional().or(z.literal('')),
  phone: z.string().optional(),
});

type CustomerFormValues = z.infer<typeof formSchema>;

interface CustomerFormProps {
  onSuccess: () => void;
}

export function CustomerForm({ onSuccess }: CustomerFormProps) {
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

  return (
    <Form {...form}>
      <fieldset className="space-y-4">
        <legend className="sr-only">Informações do Cliente</legend>
        <form onSubmit={form.handleSubmit(upsertCustomer)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome *</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Nome completo do cliente" 
                  aria-required="true"
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
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input 
                  placeholder="email@exemplo.com" 
                  type="email"
                  aria-required="false"
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
              <FormLabel>Telefone</FormLabel>
              <FormControl>
                <Input 
                  placeholder="(99) 99999-9999" 
                  type="tel"
                  aria-required="false"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
          <Button type="submit" disabled={form.isSubmitting} className="w-full">
            {form.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
            Salvar Cliente
          </Button>
        </form>
      </fieldset>
    </Form>
  );
}
