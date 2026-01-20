/**
 * NewExpenseModal.tsx - TACTICAL STITCH REDESIGN
 * Layout: 2-Col Side Sheet (Glass/Dark Mode) with Premium UI
 */

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Sheet, SheetContent } from '@/shared/ui/primitives/sheet';
import { Button } from '@/shared/ui/primitives/button';
import { 
  DollarSign, 
  X, 
  Save, 
  Lock, 
  Tag, 
  CreditCard, 
  RotateCcw, 
  Home, 
  Zap, 
  Users, 
  Megaphone, 
  Wrench, 
  Truck, 
  Shield, 
  Calculator, 
  Package, 
  Droplets, 
  Wifi, 
  MoreHorizontal, 
  FileText,
  Calendar,
  Wallet,
  Building2,
  Link
} from 'lucide-react';
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
      const payload = {
        ...data,
        amount: Number(data.amount),
        receipt_url: data.receipt_url || null,
        supplier_vendor: data.supplier_vendor || null,
        subcategory: data.subcategory || null,
        budget_category: data.budget_category || null,
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

  const inputClasses = cn(getGlassInputClasses('form'), 'h-10 text-sm focus:border-primary/50');
  const sectionTitleClasses = "text-sm font-bold text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2";

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <SheetContent 
        side="right" 
        className="w-full max-w-[1000px] sm:max-w-[1000px] bg-zinc-950 border-l border-white/5 p-0 shadow-[0_0_60px_rgba(0,0,0,0.6)] backdrop-blur-xl"
      >
        <div className="h-full flex flex-col">
          
          {/* HEADER TÁTICO */}
          <div className="flex items-center justify-between px-8 py-6 border-b border-white/5 bg-zinc-900/30 backdrop-blur-md sticky top-0 z-50">
             <div className="flex flex-col">
                <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                   <DollarSign className="h-6 w-6 text-primary" /> 
                   NOVA DESPESA
                </h2>
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1 ml-8">
                   Registro Financeiro
                </span>
             </div>
             
             <button 
                onClick={handleClose} 
                disabled={createExpenseMutation.isPending}
                className="group p-2 rounded-full hover:bg-white/10 transition-colors focus:outline-none disabled:opacity-50"
             >
                <X className="h-6 w-6 text-zinc-500 group-hover:text-white transition-colors" />
             </button>
          </div>

          {/* BACKGROUND AMBIENT LIGHTING */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
             <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
             <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-rose-500/5 rounded-full blur-[120px]" />
          </div>

          {/* FORM GRID (SCROLLABLE) */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
             <form onSubmit={handleSubmit(onSubmit)} className="h-full">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pb-20">
                   
                   {/* COLUNA 1: CLASSIFICAÇÃO */}
                   <div className="lg:col-span-1 space-y-8">
                      <div>
                        <h3 className={sectionTitleClasses}>
                          <Tag className="h-4 w-4 text-primary" />
                          Classificação
                        </h3>
                        
                        <div className="space-y-6">
                          {/* Categoria */}
                          <div className="space-y-2">
                            <label className="text-xs font-medium text-zinc-400">Categoria Principal</label>
                            <Select onValueChange={(value) => setValue('category_id', value)}>
                              <SelectTrigger className={inputClasses}>
                                <div className="flex items-center gap-2 flex-1">
                                  {selectedCategoryId ? (() => {
                                    const selectedCategory = categories.find(cat => cat.id === selectedCategoryId);
                                    if (selectedCategory) {
                                      const IconComponent = iconMap[selectedCategory.icon] || Tag;
                                      return (
                                        <>
                                          <IconComponent className="h-4 w-4" style={{ color: selectedCategory.color }} />
                                          <span className="text-white">{selectedCategory.name}</span>
                                        </>
                                      );
                                    }
                                    return null;
                                  })() : <span className="text-zinc-500">Selecione uma categoria...</span>}
                                </div>
                              </SelectTrigger>
                              <SelectContent className="bg-zinc-900 border-white/10">
                                {categories.map((category) => {
                                  const IconComponent = iconMap[category.icon] || Tag;
                                  return (
                                    <SelectItem key={category.id} value={category.id} className="text-zinc-300 focus:text-white focus:bg-white/10">
                                      <div className="flex items-center gap-2">
                                        <IconComponent className="h-4 w-4" style={{ color: category.color }} />
                                        <span>{category.name}</span>
                                      </div>
                                    </SelectItem>
                                  );
                                })}
                              </SelectContent>
                            </Select>
                            {errors.category_id && <p className="text-rose-500 text-xs">{errors.category_id.message}</p>}
                          </div>

                          {/* Subcategoria */}
                          <div className="space-y-2">
                            <label className="text-xs font-medium text-zinc-400">Especificação / Subcategoria</label>
                            <Input {...register('subcategory')} placeholder="Ex: Material de limpeza, Aluguel Setembro..." className={inputClasses} />
                          </div>

                          {/* Descrição */}
                          <div className="space-y-2">
                            <label className="text-xs font-medium text-zinc-400">Descrição Detalhada</label>
                            <Textarea
                              {...register('description')}
                              placeholder="Descreva os detalhes desta despesa..."
                              rows={4}
                              className={cn(inputClasses, 'min-h-[100px] h-auto resize-none')}
                            />
                            {errors.description && <p className="text-rose-500 text-xs">{errors.description.message}</p>}
                          </div>
                        </div>
                      </div>

                      {/* Recorrência */}
                      <div>
                         <h3 className={sectionTitleClasses}>
                            <RotateCcw className="h-4 w-4 text-primary" />
                            Recorrência
                         </h3>
                         <div className="bg-white/5 rounded-xl p-4 border border-white/5 space-y-4">
                            <div className="flex items-center justify-between">
                               <div>
                                  <div className="text-sm font-medium text-white">Despesa Fixa?</div>
                                  <div className="text-xs text-zinc-500">Marque se esta conta se repete automaticamente</div>
                               </div>
                               <SwitchAnimated
                                  checked={isRecurring}
                                  onCheckedChange={(checked) => setValue('is_recurring', checked)}
                                  variant="yellow"
                                  size="sm"
                               />
                            </div>
                            
                            {isRecurring && (
                              <div className="animate-in fade-in slide-in-from-top-2 pt-2 border-t border-white/5">
                                <label className="text-xs font-medium text-zinc-400 block mb-2">Frequência da Cobrança</label>
                                <Select onValueChange={(value) => setValue('recurring_frequency', value as any)}>
                                  <SelectTrigger className={inputClasses}>
                                    <SelectValue placeholder="Selecione a frequência..." />
                                  </SelectTrigger>
                                  <SelectContent className="bg-zinc-900 border-white/10">
                                    {recurringFrequencies.map((freq) => (
                                      <SelectItem key={freq.value} value={freq.value} className="text-zinc-300 focus:text-white focus:bg-white/10">
                                        {freq.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            )}
                         </div>
                      </div>
                   </div>

                   {/* COLUNA 2: FINANCEIRO E DADOS */}
                   <div className="lg:col-span-1 border-l border-white/5 lg:pl-12 space-y-8">
                      <div>
                         <h3 className={sectionTitleClasses}>
                            <CreditCard className="h-4 w-4 text-primary" />
                            Dados Financeiros
                         </h3>
                         
                         <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                               <div className="space-y-2">
                                  <label className="text-xs font-medium text-zinc-400">Valor (R$)</label>
                                  <div className="relative">
                                     <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">R$</span>
                                     <Input
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        value={watch('amount') === 0 ? '' : watch('amount')}
                                        onChange={(e) => setValue('amount', e.target.value === '' ? 0 : Number(e.target.value))}
                                        placeholder="0,00"
                                        className={cn(inputClasses, "pl-9 text-lg font-bold text-white")}
                                     />
                                  </div>
                                  {errors.amount && <p className="text-rose-500 text-xs">{errors.amount.message}</p>}
                               </div>
                               
                               <div className="space-y-2">
                                  <label className="text-xs font-medium text-zinc-400">Data de Competência</label>
                                  <div className="relative">
                                     <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                                     <Input type="date" {...register('date')} className={cn(inputClasses, "pl-9")} />
                                  </div>
                                  {errors.date && <p className="text-rose-500 text-xs">{errors.date.message}</p>}
                               </div>
                            </div>

                            <div className="space-y-2">
                               <label className="text-xs font-medium text-zinc-400">Método de Pagamento</label>
                               <Select onValueChange={(value) => setValue('payment_method', value)}>
                                  <SelectTrigger className={inputClasses}>
                                    <div className="flex items-center gap-2 text-zinc-300">
                                       <Wallet className="h-4 w-4 text-zinc-500" />
                                       <SelectValue placeholder="Selecione o meio de pagamento..." />
                                    </div>
                                  </SelectTrigger>
                                  <SelectContent className="bg-zinc-900 border-white/10">
                                    {paymentMethods.map((method) => (
                                      <SelectItem key={method.value} value={method.value} className="text-zinc-300 focus:text-white focus:bg-white/10">
                                        {method.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                               </Select>
                               {errors.payment_method && <p className="text-rose-500 text-xs">{errors.payment_method.message}</p>}
                            </div>
                         </div>
                      </div>

                      <div className="pt-8 border-t border-white/5">
                         <h3 className={sectionTitleClasses}>
                            <Building2 className="h-4 w-4 text-primary" />
                            Origem & Comprovantes
                         </h3>
                         
                         <div className="space-y-6">
                            <div className="space-y-2">
                               <label className="text-xs font-medium text-zinc-400">Fornecedor / Beneficiário</label>
                               <Input {...register('supplier_vendor')} placeholder="Nome da empresa ou pessoa" className={inputClasses} />
                            </div>

                            <div className="space-y-2">
                               <label className="text-xs font-medium text-zinc-400">Link do Comprovante / Nota</label>
                               <div className="relative">
                                  <Link className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                                  <Input type="url" {...register('receipt_url')} placeholder="https://drive.google.com/..." className={cn(inputClasses, "pl-9")} />
                               </div>
                               {errors.receipt_url && <p className="text-rose-500 text-xs">{errors.receipt_url.message}</p>}
                            </div>
                         </div>
                      </div>
                   </div>

                </div>
             </form>
          </div>

          {/* FOOTER (FIXO) */}
          <div className="border-t border-white/5 bg-zinc-900/80 backdrop-blur-xl px-8 py-6 sticky bottom-0 z-50 flex items-center justify-between">
             <div className="hidden sm:flex items-center gap-2 text-zinc-600 text-[10px] font-bold tracking-widest uppercase">
                <Lock className="h-3 w-3" />
                Lançamento Financeiro Seguro
             </div>

             <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
                <Button 
                   type="button"
                   variant="ghost"
                   onClick={handleClose}
                   disabled={createExpenseMutation.isPending}
                   className="rounded-full px-6 text-zinc-400 hover:text-white hover:bg-white/5"
                >
                   Cancelar
                </Button>

                <Button 
                   onClick={handleSubmit(onSubmit)}
                   disabled={createExpenseMutation.isPending}
                   className="relative group rounded-full px-8 py-6 bg-primary hover:bg-primary/90 text-white font-bold tracking-wide shadow-[0_0_20px_rgba(244,202,37,0.3)] hover:shadow-[0_0_35px_rgba(244,202,37,0.6)] hover:scale-[1.02] transition-all overflow-hidden"
                >
                   {/* Shine Effect */}
                   <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                   
                   <span className="relative flex items-center gap-2">
                      {createExpenseMutation.isPending ? (
                         <>
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            Processando...
                         </>
                      ) : (
                         <>
                           <Save className="h-4 w-4" /> CONFIRMAR DESPESA
                         </>
                      )}
                   </span>
                </Button>
             </div>
          </div>

        </div>
      </SheetContent>
    </Sheet>
  );
};

export default NewExpenseModal;