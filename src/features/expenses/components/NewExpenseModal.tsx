/**
 * NewExpenseModal.tsx - Modal para criar nova despesa
 * Estilo padronizado: FormDialog + emojis + layout compacto
 */

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Receipt, Calendar, CreditCard, Building, FileText, Tag, DollarSign, RotateCcw, Home, Zap, Users, Megaphone, Wrench, Truck, Shield, Calculator, Package, Droplets, Wifi, MoreHorizontal } from 'lucide-react';
import { FormDialog } from '@/shared/ui/layout/FormDialog';
import { Input } from '@/shared/ui/primitives/input';
import { Textarea } from '@/shared/ui/primitives/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/primitives/select';
import { SwitchAnimated } from '@/shared/ui/primitives/switch-animated';
import { useCreateExpense, useExpenseCategories } from '../hooks';
import { format } from 'date-fns';
import { cn } from '@/core/config/utils';
import { getGlassInputClasses } from '@/core/config/theme-utils';

// Tipo local para categorias de despesas
interface ExpenseCategory {
  id: string;
  name: string;
  color: string;
  icon: string;
}

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

export const NewExpenseModal: React.FC<NewExpenseModalProps> = ({ isOpen, onClose }) => {
  const { data: categoriesData = [] } = useExpenseCategories();
  const categories = categoriesData as unknown as ExpenseCategory[];
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
    'Home': Home, 'Zap': Zap, 'Droplets': Droplets, 'Wifi': Wifi, 'Users': Users,
    'FileText': FileText, 'Megaphone': Megaphone, 'Wrench': Wrench, 'Truck': Truck,
    'Shield': Shield, 'Calculator': Calculator, 'Package': Package, 'MoreHorizontal': MoreHorizontal
  };

  const paymentMethods = [
    { value: 'credit_card', label: '💳 Cartão de Crédito' },
    { value: 'debit_card', label: '💳 Cartão de Débito' },
    { value: 'pix', label: '📱 PIX' },
    { value: 'cash', label: '💵 Dinheiro' },
    { value: 'bank_transfer', label: '🏦 Transferência' },
    { value: 'check', label: '📄 Cheque' },
    { value: 'other', label: '📋 Outro' }
  ];

  const recurringFrequencies = [
    { value: 'monthly', label: '📅 Mensal' },
    { value: 'quarterly', label: '📆 Trimestral' },
    { value: 'yearly', label: '🗓️ Anual' }
  ];

  const onSubmit = async (data: ExpenseFormData) => {
    try {
      // Type assertion para contornar tipos gerados do Supabase
      await createExpenseMutation.mutateAsync({
        ...data,
        amount: Number(data.amount),
        receipt_url: data.receipt_url || null,
        supplier_vendor: data.supplier_vendor || null,
        subcategory: data.subcategory || null,
        budget_category: data.budget_category || null
      } as any);
      reset();
      onClose();
    } catch (error) {
      console.error('Erro ao criar despesa:', error);
    }
  };

  const handleClose = () => {
    if (createExpenseMutation.isPending) return;
    reset();
    onClose();
  };

  const inputClasses = cn(getGlassInputClasses('form'), 'h-9 text-sm');

  return (
    <FormDialog
      open={isOpen}
      onOpenChange={(open) => !open && handleClose()}
      title="NOVA DESPESA"
      description="Registre uma nova despesa do estabelecimento"
      onSubmit={handleSubmit(onSubmit)}
      submitLabel={createExpenseMutation.isPending ? 'Criando...' : 'Criar Despesa'}
      cancelLabel="Cancelar"
      loading={createExpenseMutation.isPending}
      size="full"
      variant="premium"
      glassEffect={true}
      className="max-w-5xl"
    >
      {/* Layout em 3 colunas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-4">

        {/* ========================================== */}
        {/* COLUNA 1 - Identificação */}
        {/* ========================================== */}
        <div className="space-y-3">
          <h3 className="text-base font-semibold text-white flex items-center gap-2 border-b border-gray-700 pb-2">
            <Receipt className="h-4 w-4 text-primary-yellow" />
            🏷️ Identificação
          </h3>

          {/* Categoria */}
          <div>
            <label className="block text-xs font-medium mb-1 text-gray-400">📂 Categoria *</label>
            <Select onValueChange={(value) => setValue('category_id', value)}>
              <SelectTrigger className={inputClasses}>
                <div className="flex items-center gap-2 flex-1">
                  {selectedCategoryId && (() => {
                    const selectedCategory = categories.find(cat => cat.id === selectedCategoryId);
                    if (selectedCategory) {
                      const IconComponent = iconMap[selectedCategory.icon] || Tag;
                      return (
                        <>
                          <IconComponent className="h-3.5 w-3.5" style={{ color: selectedCategory.color }} />
                          <span className="truncate">{selectedCategory.name}</span>
                        </>
                      );
                    }
                    return null;
                  })()}
                  {!selectedCategoryId && <span className="text-gray-400">Selecione...</span>}
                </div>
              </SelectTrigger>
              <SelectContent className="bg-gray-900/95 border-white/20 max-h-60">
                {categories.map((category) => {
                  const IconComponent = iconMap[category.icon] || Tag;
                  return (
                    <SelectItem key={category.id} value={category.id} className="text-white hover:bg-white/10">
                      <div className="flex items-center gap-2">
                        <IconComponent className="h-4 w-4" style={{ color: category.color }} />
                        <span>{category.name}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            {errors.category_id && <p className="text-red-400 text-xs mt-1">{errors.category_id.message}</p>}
          </div>

          {/* Subcategoria */}
          <div>
            <label className="block text-xs font-medium mb-1 text-gray-400">🏷️ Subcategoria</label>
            <Input {...register('subcategory')} placeholder="Ex: Material de limpeza" className={inputClasses} />
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-xs font-medium mb-1 text-gray-400">📝 Descrição *</label>
            <Textarea
              {...register('description')}
              placeholder="Descreva a despesa..."
              rows={2}
              className={cn(inputClasses, 'min-h-[60px] h-auto')}
            />
            {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description.message}</p>}
          </div>
        </div>

        {/* ========================================== */}
        {/* COLUNA 2 - Valor + Pagamento */}
        {/* ========================================== */}
        <div className="space-y-3">
          <h3 className="text-base font-semibold text-white flex items-center gap-2 border-b border-gray-700 pb-2">
            <DollarSign className="h-4 w-4 text-primary-yellow" />
            💰 Valor e Pagamento
          </h3>

          {/* Valor + Data lado a lado */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-400">💵 Valor (R$) *</label>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                value={watch('amount') === 0 ? '' : watch('amount')}
                onChange={(e) => setValue('amount', e.target.value === '' ? 0 : Number(e.target.value))}
                placeholder="0,00"
                className={inputClasses}
              />
              {errors.amount && <p className="text-red-400 text-xs mt-1">{errors.amount.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium mb-1 text-gray-400">📅 Data *</label>
              <Input type="date" {...register('expense_date')} className={inputClasses} />
              {errors.expense_date && <p className="text-red-400 text-xs mt-1">{errors.expense_date.message}</p>}
            </div>
          </div>

          {/* Forma de Pagamento */}
          <div>
            <label className="block text-xs font-medium mb-1 text-gray-400">💳 Forma de Pagamento *</label>
            <Select onValueChange={(value) => setValue('payment_method', value)}>
              <SelectTrigger className={inputClasses}>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent className="bg-gray-900/95 border-white/20">
                {paymentMethods.map((method) => (
                  <SelectItem key={method.value} value={method.value} className="text-white hover:bg-white/10">
                    {method.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.payment_method && <p className="text-red-400 text-xs mt-1">{errors.payment_method.message}</p>}
          </div>

          {/* Fornecedor */}
          <div>
            <label className="block text-xs font-medium mb-1 text-gray-400">🏢 Fornecedor</label>
            <Input {...register('supplier_vendor')} placeholder="Nome do fornecedor" className={inputClasses} />
          </div>

          {/* URL Comprovante */}
          <div>
            <label className="block text-xs font-medium mb-1 text-gray-400">🔗 URL Comprovante</label>
            <Input type="url" {...register('receipt_url')} placeholder="https://..." className={inputClasses} />
            {errors.receipt_url && <p className="text-red-400 text-xs mt-1">{errors.receipt_url.message}</p>}
          </div>
        </div>

        {/* ========================================== */}
        {/* COLUNA 3 - Recorrência */}
        {/* ========================================== */}
        <div className="space-y-3">
          <h3 className="text-base font-semibold text-white flex items-center gap-2 border-b border-gray-700 pb-2">
            <RotateCcw className="h-4 w-4 text-primary-yellow" />
            🔄 Recorrência
          </h3>

          {/* Toggle Recorrente */}
          <div className="flex items-center justify-between rounded-lg border border-gray-700 p-3 bg-gray-800/30">
            <div>
              <span className="text-sm text-gray-200 font-medium">🔁 Despesa Recorrente?</span>
              <p className="text-xs text-gray-500">Esta despesa se repete</p>
            </div>
            <SwitchAnimated
              checked={isRecurring}
              onCheckedChange={(checked) => setValue('is_recurring', checked)}
              variant="yellow"
              size="sm"
            />
          </div>

          {/* Frequência (condicional) */}
          {isRecurring && (
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-400">📆 Frequência</label>
              <Select onValueChange={(value) => setValue('recurring_frequency', value as 'monthly' | 'quarterly' | 'yearly')}>
                <SelectTrigger className={inputClasses}>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent className="bg-gray-900/95 border-white/20">
                  {recurringFrequencies.map((freq) => (
                    <SelectItem key={freq.value} value={freq.value} className="text-white hover:bg-white/10">
                      {freq.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Espaço visual quando não recorrente */}
          {!isRecurring && (
            <div className="p-3 rounded-lg bg-gray-800/10 border border-dashed border-gray-700/30 text-center">
              <p className="text-xs text-gray-500">Ative o toggle acima se a despesa se repetir periodicamente</p>
            </div>
          )}

        </div>
      </div>
    </FormDialog>
  );
};

export default NewExpenseModal;