import React from 'react';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useUpsertCustomer } from '@/hooks/use-crm';
import { useFormWithToast } from '@/hooks/use-form-with-toast';
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
      <form onSubmit={form.handleSubmit(upsertCustomer)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input placeholder="Nome completo do cliente" {...field} />
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
                <Input placeholder="email@exemplo.com" {...field} />
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
                <Input placeholder="(99) 99999-9999" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.isSubmitting} className="w-full">
          {form.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Salvar Cliente
        </Button>
      </form>
    </Form>
  );
}
