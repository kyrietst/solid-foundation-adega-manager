/**
 * NewExpenseModal.tsx - Side Sheet para criar nova despesa
 * Estilo padronizado: Sheet + emojis + layout vertical compacto
 */

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/shared/ui/primitives/sheet';
import { Button } from '@/shared/ui/primitives/button';
import { Receipt, CreditCard, Tag, DollarSign, RotateCcw, Home, Zap, Users, Megaphone, Wrench, Truck, Shield, Calculator, Package, Droplets, Wifi, MoreHorizontal, FileText } from 'lucide-react';
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
  date: z.string().min(1, 'Data é obrigatória'),
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
      date: format(new Date(), 'yyyy-MM-dd'),
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
      // Payload limpo: Mapeamento 1:1 com o banco
      const payload = {
        ...data,
        amount: Number(data.amount),
        
        // Garantir nulos para opcionais (Sanitização)
        receipt_url: data.receipt_url || null,
        supplier_vendor: data.supplier_vendor || null,
        subcategory: data.subcategory || null,
        budget_category: data.budget_category || null,
        
        // Campos de sistema
        payment_status: 'pending' 
      };

      await createExpenseMutation.mutateAsync(payload as any);

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
    <Sheet open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <SheetContent side="right" className="w-full sm:max-w-[500px] overflow-y-auto bg-black/95 backdrop-blur-md border-l border-white/10 p-0">
        <div className="h-full flex flex-col">
          {/* Header Fixo */}
          <SheetHeader className="px-6 py-4 border-b border-white/10 bg-black/50 sticky top-0 z-50 backdrop-blur-sm">
            <SheetTitle className="text-2xl font-bold text-primary-yellow flex items-center gap-2">
              <DollarSign className="h-6 w-6" /> NOVA DESPESA
            </SheetTitle>
            <div className="text-gray-400 text-sm">Registre uma saída financeira</div>
          </SheetHeader>

          {/* Form Scrollable */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

              {/* ========================================== */}
              {/* SEÇÃO 1 - Identificação */}
              {/* ========================================== */}
              <div className="space-y-4">
                <h3 className="text-base font-semibold text-white flex items-center gap-2 border-b border-gray-800 pb-2">
                  <Receipt className="h-4 w-4 text-primary-yellow" />
                  Identificação da Despesa
                </h3>

                {/* Categoria */}
                <div>
                  <label className="block text-xs font-medium mb-1.5 text-gray-400">📂 Categoria *</label>
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
                  <label className="block text-xs font-medium mb-1.5 text-gray-400">🏷️ Subcategoria</label>
                  <Input {...register('subcategory')} placeholder="Ex: Material de limpeza" className={inputClasses} />
                </div>

                {/* Descrição */}
                <div>
                  <label className="block text-xs font-medium mb-1.5 text-gray-400">📝 Descrição *</label>
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
              {/* SEÇÃO 2 - Valor e Pagamento */}
              {/* ========================================== */}
              <div className="space-y-4">
                <h3 className="text-base font-semibold text-white flex items-center gap-2 border-b border-gray-800 pb-2">
                  <CreditCard className="h-4 w-4 text-primary-yellow" />
                  Detalhes Financeiros
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium mb-1.5 text-gray-400">💵 Valor (R$) *</label>
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
                    <label className="block text-xs font-medium mb-1.5 text-gray-400">📅 Data *</label>
                    <Input type="date" {...register('date')} className={inputClasses} />
                    {errors.date && <p className="text-red-400 text-xs mt-1">{errors.date.message}</p>}
                  </div>
                </div>

                {/* Forma de Pagamento */}
                <div>
                  <label className="block text-xs font-medium mb-1.5 text-gray-400">💳 Forma de Pagamento *</label>
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
                  <label className="block text-xs font-medium mb-1.5 text-gray-400">🏢 Fornecedor</label>
                  <Input {...register('supplier_vendor')} placeholder="Nome do fornecedor" className={inputClasses} />
                </div>

                {/* URL Comprovante */}
                <div>
                  <label className="block text-xs font-medium mb-1.5 text-gray-400">🔗 Link do Comprovante</label>
                  <Input type="url" {...register('receipt_url')} placeholder="https://..." className={inputClasses} />
                  {errors.receipt_url && <p className="text-red-400 text-xs mt-1">{errors.receipt_url.message}</p>}
                </div>
              </div>

              {/* ========================================== */}
              {/* SEÇÃO 3 - Recorrência */}
              {/* ========================================== */}
              <div className="space-y-4">
                <h3 className="text-base font-semibold text-white flex items-center gap-2 border-b border-gray-800 pb-2">
                  <RotateCcw className="h-4 w-4 text-primary-yellow" />
                  Recorrência
                </h3>

                <div className="flex items-center justify-between rounded-lg border border-gray-700 p-3 bg-gray-800/30">
                  <div>
                    <span className="text-sm text-gray-200 font-medium">🔁 Despesa Fixa/Recorrente?</span>
                    <p className="text-xs text-gray-500">Marque se esta conta se repete</p>
                  </div>
                  <SwitchAnimated
                    checked={isRecurring}
                    onCheckedChange={(checked) => setValue('is_recurring', checked)}
                    variant="yellow"
                    size="sm"
                  />
                </div>

                {isRecurring && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <label className="block text-xs font-medium mb-1.5 text-gray-400">📆 Frequência</label>
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
              </div>

            </form>
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-white/10 bg-black/50 backdrop-blur-sm sticky bottom-0 z-50 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={createExpenseMutation.isPending}
              className="border-white/10 text-gray-300 hover:bg-white/10 hover:text-white"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit(onSubmit)}
              disabled={createExpenseMutation.isPending}
              className="bg-primary-yellow text-primary-black hover:bg-primary-yellow/90 font-bold min-w-[150px]"
            >
              {createExpenseMutation.isPending ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  <span>Registrando...</span>
                </div>
              ) : (
                'Confirmar Despesa'
              )}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default NewExpenseModal;