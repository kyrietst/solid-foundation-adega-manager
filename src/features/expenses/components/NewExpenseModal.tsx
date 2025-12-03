/**
 * NewExpenseModal.tsx - Modal para criar nova despesa
 */

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Receipt, Save, X, Calendar, CreditCard, Building, FileText, Tag, DollarSign, RotateCcw, Home, Zap, Users, Megaphone, Wrench, Truck, Shield, Calculator, Package, Droplets, Wifi, MoreHorizontal } from 'lucide-react';
import { BaseModal } from '@/shared/ui/composite/BaseModal';
import { Button } from '@/shared/ui/primitives/button';
import { Input } from '@/shared/ui/primitives/input';
import { Label } from '@/shared/ui/primitives/label';
import { Textarea } from '@/shared/ui/primitives/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/primitives/select';
import { Switch } from '@/shared/ui/primitives/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { useCreateExpense, useExpenseCategories } from '../hooks';
import { format } from 'date-fns';
import { cn } from '@/core/config/utils';
import { getSFProTextClasses } from '@/core/config/theme-utils';

const expenseSchema = z.object({
  category_id: z.string().min(1, 'Categoria é obrigatória'),
  subcategory: z.string().optional(),
  description: z.string().min(1, 'Descrição é obrigatória'),
  amount: z.number().min(0.01, 'Valor deve ser maior que zero'),
  expense_date: z.string().min(1, 'Data é obrigatória'),
  payment_method: z.string().min(1, 'Forma de pagamento é obrigatória'),
  supplier_vendor: z.string().optional(),
  receipt_url: z.string().url().optional().or(z.literal('')),
  is_recurring: z.boolean().default(false),
  recurring_frequency: z.enum(['monthly', 'quarterly', 'yearly']).optional(),
  budget_category: z.string().optional()
});

type ExpenseFormData = z.infer<typeof expenseSchema>;

interface NewExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewExpenseModal: React.FC<NewExpenseModalProps> = ({
  isOpen,
  onClose
}) => {
  const { data: categories = [] } = useExpenseCategories();
  const createExpenseMutation = useCreateExpense();

  const form = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      expense_date: format(new Date(), 'yyyy-MM-dd'),
      is_recurring: false,
      amount: 0
    }
  });

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = form;
  const isRecurring = watch('is_recurring');
  const selectedCategoryId = watch('category_id');

  // Mapeamento de ícones para categorias
  const iconMap: { [key: string]: React.ElementType } = {
    'Home': Home,
    'Zap': Zap,
    'Droplets': Droplets,
    'Wifi': Wifi,
    'Users': Users,
    'FileText': FileText,
    'Megaphone': Megaphone,
    'Wrench': Wrench,
    'Truck': Truck,
    'Shield': Shield,
    'Calculator': Calculator,
    'Package': Package,
    'MoreHorizontal': MoreHorizontal
  };

  const paymentMethods = [
    { value: 'credit_card', label: 'Cartão de Crédito' },
    { value: 'debit_card', label: 'Cartão de Débito' },
    { value: 'pix', label: 'PIX' },
    { value: 'cash', label: 'Dinheiro' },
    { value: 'bank_transfer', label: 'Transferência Bancária' },
    { value: 'check', label: 'Cheque' },
    { value: 'other', label: 'Outro' }
  ];

  const recurringFrequencies = [
    { value: 'monthly', label: 'Mensal' },
    { value: 'quarterly', label: 'Trimestral' },
    { value: 'yearly', label: 'Anual' }
  ];

  const onSubmit = async (data: ExpenseFormData) => {
    try {
      await createExpenseMutation.mutateAsync({
        ...data,
        amount: Number(data.amount),
        recurring_frequency: data.is_recurring ? data.recurring_frequency : null,
        receipt_url: data.receipt_url || null,
        supplier_vendor: data.supplier_vendor || null,
        subcategory: data.subcategory || null,
        budget_category: data.budget_category || null
      });

      reset();
      onClose();
    } catch (error) {
      console.error('Erro ao criar despesa:', error);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title={
        <span className={cn(
          "flex items-center gap-2",
          getSFProTextClasses('heading', 'lg')
        )}>
          <Receipt className="h-6 w-6 text-purple-400" />
          Nova Despesa
        </span>
      }
      size="4xl"
      className="max-h-[90vh] overflow-y-auto bg-black/95 backdrop-blur-xl border-purple-500/30 shadow-2xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Informações básicas */}
        <Card className="bg-black/70 backdrop-blur-xl border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Tag className="h-5 w-5 text-purple-400" />
              Informações da Despesa
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Categoria */}
            <div className="space-y-2">
              <Label htmlFor="category_id" className="text-gray-300 flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Categoria *
              </Label>
              <Select onValueChange={(value) => setValue('category_id', value)}>
                <SelectTrigger className="bg-black/70 border-white/30 text-white">
                  <div className="flex items-center gap-2 flex-1">
                    {selectedCategoryId && (() => {
                      const selectedCategory = categories.find(cat => cat.id === selectedCategoryId);
                      if (selectedCategory) {
                        const IconComponent = iconMap[selectedCategory.icon] || Tag;
                        return (
                          <>
                            <div
                              className="p-1 rounded-sm flex-shrink-0"
                              style={{
                                backgroundColor: `${selectedCategory.color}20`,
                                border: `1px solid ${selectedCategory.color}40`
                              }}
                            >
                              <IconComponent
                                className="h-3.5 w-3.5"
                                style={{ color: selectedCategory.color }}
                              />
                            </div>
                            <span>{selectedCategory.name}</span>
                          </>
                        );
                      }
                      return null;
                    })()}
                    {!selectedCategoryId && (
                      <span className="text-gray-400">Selecione uma categoria</span>
                    )}
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-gray-900/95 border-white/20 backdrop-blur-xl">
                  {categories.map((category) => {
                    const IconComponent = iconMap[category.icon] || Tag;
                    return (
                      <SelectItem
                        key={category.id}
                        value={category.id}
                        className={cn(
                          "group text-white hover:text-black cursor-pointer transition-all duration-200",
                          "flex items-center gap-3 px-3 py-2.5",
                          "hover:bg-gradient-to-r hover:from-gray-200/90 hover:to-gray-100/90",
                          "focus:bg-gradient-to-r focus:from-purple-500/20 focus:to-purple-600/20",
                          "border-l-2 border-transparent hover:border-purple-400/60",
                          "data-[highlighted]:bg-gradient-to-r data-[highlighted]:from-purple-500/15 data-[highlighted]:to-purple-600/15"
                        )}
                      >
                        <div className="flex items-center gap-3 w-full">
                          <div
                            className="p-1.5 rounded-md flex-shrink-0"
                            style={{
                              backgroundColor: `${category.color}20`,
                              border: `1px solid ${category.color}40`
                            }}
                          >
                            <IconComponent
                              className="h-4 w-4"
                              style={{ color: category.color }}
                            />
                          </div>
                          <div className="flex flex-col items-start min-w-0 flex-1">
                            <span className="font-medium text-white group-hover:text-black truncate transition-colors duration-200">
                              {category.name}
                            </span>
                            <span
                              className="text-xs truncate text-gray-400 group-hover:text-gray-600 leading-tight transition-colors duration-200"
                              title={category.description}
                            >
                              {category.description}
                            </span>
                          </div>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {errors.category_id && (
                <p className="text-red-400 text-sm">{errors.category_id.message}</p>
              )}
            </div>

            {/* Subcategoria */}
            <div className="space-y-2">
              <Label htmlFor="subcategory" className="text-gray-300">
                Subcategoria
              </Label>
              <Input
                id="subcategory"
                {...register('subcategory')}
                placeholder="Ex: Material de limpeza"
                className="bg-black/70 border-white/30 text-white placeholder:text-gray-400"
              />
            </div>
          </CardContent>
        </Card>

        {/* Descrição detalhada */}
        <Card className="bg-black/70 border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-400" />
              Descrição da Despesa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-gray-300">
                Descrição *
              </Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Descreva detalhadamente a despesa..."
                className="bg-black/70 border-white/30 text-white placeholder:text-gray-400 resize-none"
                rows={3}
              />
              {errors.description && (
                <p className="text-red-400 text-sm">{errors.description.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Valores e data */}
        <Card className="bg-black/70 border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-400" />
              Valor e Data
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Valor */}
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-gray-300 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Valor (R$) *
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                value={watch('amount') === 0 ? '' : watch('amount')}
                onChange={(e) => setValue('amount', e.target.value === '' ? 0 : Number(e.target.value))}
                placeholder="0,00"
                className="bg-black/70 border-white/30 text-white placeholder:text-gray-400"
              />
              {errors.amount && (
                <p className="text-red-400 text-sm">{errors.amount.message}</p>
              )}
            </div>

            {/* Data */}
            <div className="space-y-2">
              <Label htmlFor="expense_date" className="text-gray-300 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Data da Despesa *
              </Label>
              <Input
                id="expense_date"
                type="date"
                {...register('expense_date')}
                className="bg-black/70 border-white/30 text-white"
              />
              {errors.expense_date && (
                <p className="text-red-400 text-sm">{errors.expense_date.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pagamento e fornecedor */}
        <Card className="bg-black/70 border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-yellow-400" />
              Pagamento e Fornecedor
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Forma de Pagamento */}
            <div className="space-y-2">
              <Label htmlFor="payment_method" className="text-gray-300 flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Forma de Pagamento *
              </Label>
              <Select onValueChange={(value) => setValue('payment_method', value)}>
                <SelectTrigger className="bg-black/70 border-white/30 text-white">
                  <SelectValue placeholder="Selecione o pagamento" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900/95 border-white/20 backdrop-blur-xl">
                  {paymentMethods.map((method) => (
                    <SelectItem key={method.value} value={method.value} className="text-white hover:bg-white/10">
                      {method.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.payment_method && (
                <p className="text-red-400 text-sm">{errors.payment_method.message}</p>
              )}
            </div>

            {/* Fornecedor */}
            <div className="space-y-2">
              <Label htmlFor="supplier_vendor" className="text-gray-300 flex items-center gap-2">
                <Building className="h-4 w-4" />
                Fornecedor
              </Label>
              <Input
                id="supplier_vendor"
                {...register('supplier_vendor')}
                placeholder="Nome do fornecedor"
                className="bg-black/70 border-white/30 text-white placeholder:text-gray-400"
              />
            </div>
          </CardContent>

          {/* URL do Comprovante */}
          <CardContent className="pt-0">
            <div className="space-y-2">
              <Label htmlFor="receipt_url" className="text-gray-300 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                URL do Comprovante
              </Label>
              <Input
                id="receipt_url"
                type="url"
                {...register('receipt_url')}
                placeholder="https://..."
                className="bg-black/70 border-white/30 text-white placeholder:text-gray-400"
              />
              {errors.receipt_url && (
                <p className="text-red-400 text-sm">{errors.receipt_url.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Despesa Recorrente */}
        <Card className="bg-black/70 border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <RotateCcw className="h-5 w-5 text-orange-400" />
              Despesa Recorrente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="is_recurring" className="text-gray-300 text-base">
                Esta despesa se repete?
              </Label>
              <Switch
                id="is_recurring"
                checked={isRecurring}
                onCheckedChange={(checked) => setValue('is_recurring', checked)}
                className="data-[state=checked]:bg-primary-yellow"
              />
            </div>

            {isRecurring && (
              <div className="space-y-2">
                <Label htmlFor="recurring_frequency" className="text-gray-300">
                  Frequência
                </Label>
                <Select onValueChange={(value) => setValue('recurring_frequency', value as 'monthly' | 'quarterly' | 'yearly')}>
                  <SelectTrigger className="bg-black/70 border-white/30 text-white">
                    <SelectValue placeholder="Selecione a frequência" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900/95 border-white/20 backdrop-blur-xl">
                    {recurringFrequencies.map((freq) => (
                      <SelectItem key={freq.value} value={freq.value} className="text-white hover:bg-white/10">
                        {freq.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ações */}
        <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={createExpenseMutation.isPending}
            className="bg-transparent border-white/30 text-white hover:bg-white/10"
          >
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={createExpenseMutation.isPending}
            className="bg-primary-yellow text-black hover:bg-primary-yellow/90 font-medium"
          >
            {createExpenseMutation.isPending ? (
              <>
                <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-black/30 border-t-black" />
                Criando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Criar Despesa
              </>
            )}
          </Button>
        </div>
      </form>
    </BaseModal>
  );
};

export default NewExpenseModal;