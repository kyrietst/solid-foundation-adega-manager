/**
 * EditExpenseModal.tsx - Modal para editar despesa existente
 */

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Home, Zap, Users, Megaphone, Wrench, Truck, Shield, Calculator, Package, Tag, Droplets, Wifi, MoreHorizontal } from 'lucide-react';
import { BaseModal } from '@/shared/ui/composite/BaseModal';
import { Button } from '@/shared/ui/primitives/button';
import { Input } from '@/shared/ui/primitives/input';
import { Label } from '@/shared/ui/primitives/label';
import { Textarea } from '@/shared/ui/primitives/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/primitives/select';
import { Switch } from '@/shared/ui/primitives/switch';
import { LoadingSpinner } from '@/shared/ui/composite';
import { useExpense, useUpdateExpense, useExpenseCategories } from '../hooks';
import { cn } from '@/core/config/utils';
import { format } from 'date-fns';

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

interface EditExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  expenseId: string;
}

export const EditExpenseModal: React.FC<EditExpenseModalProps> = ({
  isOpen,
  onClose,
  expenseId
}) => {
  const { data: expense, isLoading: loadingExpense } = useExpense(expenseId);
  const { data: categories = [] } = useExpenseCategories();
  const updateExpenseMutation = useUpdateExpense();

  const form = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
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
    'FileText': Tag,
    'Megaphone': Megaphone,
    'Wrench': Wrench,
    'Truck': Truck,
    'Shield': Shield,
    'Calculator': Calculator,
    'Package': Package,
    'MoreHorizontal': MoreHorizontal
  };

  // Carregar dados da despesa no formulário
  useEffect(() => {
    if (expense && isOpen) {
      reset({
        category_id: expense.category_id,
        subcategory: expense.subcategory || '',
        description: expense.description,
        amount: Number(expense.amount),
        expense_date: expense.expense_date,
        payment_method: expense.payment_method,
        supplier_vendor: expense.supplier_vendor || '',
        receipt_url: expense.receipt_url || '',
        is_recurring: expense.is_recurring || false,
        recurring_frequency: expense.recurring_frequency as 'monthly' | 'quarterly' | 'yearly' || undefined,
        budget_category: expense.budget_category || ''
      });
    }
  }, [expense, isOpen, reset]);

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
      await updateExpenseMutation.mutateAsync({
        id: expenseId,
        updates: {
          ...data,
          amount: Number(data.amount),
          recurring_frequency: data.is_recurring ? data.recurring_frequency : null,
          receipt_url: data.receipt_url || null,
          supplier_vendor: data.supplier_vendor || null,
          subcategory: data.subcategory || null,
          budget_category: data.budget_category || null
        }
      });
      
      onClose();
    } catch (error) {
      console.error('Erro ao atualizar despesa:', error);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (loadingExpense) {
    return (
      <BaseModal
        isOpen={isOpen}
        onClose={handleClose}
        title="Carregando..."
        className="bg-gray-800 border-gray-700 text-white"
        showHeader={false}
      >
        <div className="flex items-center justify-center p-8">
          <LoadingSpinner />
        </div>
      </BaseModal>
    );
  }

  if (!expense) {
    return null;
  }

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Editar Despesa"
      size="2xl"
      className="bg-gray-800 border-gray-700 text-white max-h-[90vh] overflow-y-auto"
    >

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Categoria */}
            <div className="space-y-2">
              <Label htmlFor="category_id">Categoria *</Label>
              <Select
                value={watch('category_id')}
                onValueChange={(value) => setValue('category_id', value)}
              >
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
              <Label htmlFor="subcategory">Subcategoria</Label>
              <Input
                id="subcategory"
                {...register('subcategory')}
                placeholder="Ex: Material de limpeza"
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição *</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Descreva a despesa..."
              className="bg-gray-700 border-gray-600 text-white"
              rows={3}
            />
            {errors.description && (
              <p className="text-red-400 text-sm">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Valor */}
            <div className="space-y-2">
              <Label htmlFor="amount">Valor (R$) *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                {...register('amount', { valueAsNumber: true })}
                placeholder="0,00"
                className="bg-gray-700 border-gray-600 text-white"
              />
              {errors.amount && (
                <p className="text-red-400 text-sm">{errors.amount.message}</p>
              )}
            </div>

            {/* Data */}
            <div className="space-y-2">
              <Label htmlFor="expense_date">Data da Despesa *</Label>
              <Input
                id="expense_date"
                type="date"
                {...register('expense_date')}
                className="bg-gray-700 border-gray-600 text-white"
              />
              {errors.expense_date && (
                <p className="text-red-400 text-sm">{errors.expense_date.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Forma de Pagamento */}
            <div className="space-y-2">
              <Label htmlFor="payment_method">Forma de Pagamento *</Label>
              <Select
                value={watch('payment_method')}
                onValueChange={(value) => setValue('payment_method', value)}
              >
                <SelectTrigger className="bg-gray-700 border-gray-600">
                  <SelectValue placeholder="Selecione o pagamento" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  {paymentMethods.map((method) => (
                    <SelectItem key={method.value} value={method.value} className="text-white">
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
              <Label htmlFor="supplier_vendor">Fornecedor</Label>
              <Input
                id="supplier_vendor"
                {...register('supplier_vendor')}
                placeholder="Nome do fornecedor"
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
          </div>

          {/* URL do Comprovante */}
          <div className="space-y-2">
            <Label htmlFor="receipt_url">URL do Comprovante</Label>
            <Input
              id="receipt_url"
              type="url"
              {...register('receipt_url')}
              placeholder="https://..."
              className="bg-gray-700 border-gray-600 text-white"
            />
            {errors.receipt_url && (
              <p className="text-red-400 text-sm">{errors.receipt_url.message}</p>
            )}
          </div>

          {/* Despesa Recorrente */}
          <div className="space-y-4 border-t border-gray-700 pt-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="is_recurring" className="text-base">Despesa Recorrente</Label>
              <Switch
                id="is_recurring"
                checked={isRecurring}
                onCheckedChange={(checked) => setValue('is_recurring', checked)}
              />
            </div>

            {isRecurring && (
              <div className="space-y-2">
                <Label htmlFor="recurring_frequency">Frequência</Label>
                <Select
                  value={watch('recurring_frequency')}
                  onValueChange={(value) => setValue('recurring_frequency', value as 'monthly' | 'quarterly' | 'yearly')}
                >
                  <SelectTrigger className="bg-gray-700 border-gray-600">
                    <SelectValue placeholder="Selecione a frequência" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    {recurringFrequencies.map((freq) => (
                      <SelectItem key={freq.value} value={freq.value} className="text-white">
                        {freq.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={updateExpenseMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {updateExpenseMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
    </BaseModal>
  );
};

export default EditExpenseModal;