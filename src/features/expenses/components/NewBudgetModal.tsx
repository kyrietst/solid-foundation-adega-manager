/**
 * NewBudgetModal.tsx - Modal para criar novo orçamento
 */

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { BaseModal } from '@/shared/ui/composite/BaseModal';
import { Button } from '@/shared/ui/primitives/button';
import { Input } from '@/shared/ui/primitives/input';
import { Label } from '@/shared/ui/primitives/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/primitives/select';
import { useCreateExpenseBudget, useExpenseCategories } from '../hooks';

const budgetSchema = z.object({
  category_id: z.string().min(1, 'Categoria é obrigatória'),
  month_year: z.string().min(1, 'Mês/ano é obrigatório'),
  budgeted_amount: z.number().min(0.01, 'Valor orçado deve ser maior que zero')
});

type BudgetFormData = z.infer<typeof budgetSchema>;

interface NewBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMonth?: number;
  defaultYear?: number;
}

export const NewBudgetModal: React.FC<NewBudgetModalProps> = ({
  isOpen,
  onClose,
  defaultMonth = new Date().getMonth() + 1,
  defaultYear = new Date().getFullYear()
}) => {
  const { data: categories = [] } = useExpenseCategories();
  const createBudgetMutation = useCreateExpenseBudget();

  const form = useForm<BudgetFormData>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      month_year: `${defaultYear}-${defaultMonth.toString().padStart(2, '0')}-01`,
      budgeted_amount: 0
    }
  });

  const { register, handleSubmit, setValue, reset, formState: { errors } } = form;

  const onSubmit = async (data: BudgetFormData) => {
    try {
      await createBudgetMutation.mutateAsync({
        category_id: data.category_id,
        month_year: data.month_year,
        budgeted_amount: Number(data.budgeted_amount),
        actual_amount: 0,
        variance: 0
      });
      
      reset();
      onClose();
    } catch (error) {
      console.error('Erro ao criar orçamento:', error);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Novo Orçamento"
      size="md"
      className="bg-gray-800 border-gray-700 text-white"
    >

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Categoria */}
          <div className="space-y-2">
            <Label htmlFor="category_id">Categoria *</Label>
            <Select onValueChange={(value) => setValue('category_id', value)}>
              <SelectTrigger className="bg-gray-700 border-gray-600">
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id} className="text-white">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: category.color }}
                      />
                      {category.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category_id && (
              <p className="text-red-400 text-sm">{errors.category_id.message}</p>
            )}
          </div>

          {/* Mês/Ano */}
          <div className="space-y-2">
            <Label htmlFor="month_year">Mês/Ano *</Label>
            <Input
              id="month_year"
              type="month"
              {...register('month_year')}
              className="bg-gray-700 border-gray-600 text-white"
            />
            {errors.month_year && (
              <p className="text-red-400 text-sm">{errors.month_year.message}</p>
            )}
          </div>

          {/* Valor Orçado */}
          <div className="space-y-2">
            <Label htmlFor="budgeted_amount">Valor Orçado (R$) *</Label>
            <Input
              id="budgeted_amount"
              type="number"
              step="0.01"
              min="0.01"
              {...register('budgeted_amount', { valueAsNumber: true })}
              placeholder="0,00"
              className="bg-gray-700 border-gray-600 text-white"
            />
            {errors.budgeted_amount && (
              <p className="text-red-400 text-sm">{errors.budgeted_amount.message}</p>
            )}
          </div>

          {/* Informações Adicionais */}
          <div className="bg-gray-700/30 rounded-lg p-3 space-y-2">
            <div className="text-sm font-medium text-gray-300">💡 Dicas:</div>
            <ul className="text-xs text-gray-400 space-y-1">
              <li>• Baseie-se no histórico de gastos da categoria</li>
              <li>• Considere sazonalidades e eventos especiais</li>
              <li>• Revise mensalmente para ajustes necessários</li>
            </ul>
          </div>

          <DialogFooter className="flex gap-2 pt-4">
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
              disabled={createBudgetMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {createBudgetMutation.isPending ? 'Criando...' : 'Criar Orçamento'}
            </Button>
          </div>
        </form>
    </BaseModal>
  );
};

export default NewBudgetModal;