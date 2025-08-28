/**
 * EditBudgetModal.tsx - Modal para editar orçamento existente
 */

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/shared/ui/primitives/dialog';
import { Button } from '@/shared/ui/primitives/button';
import { Input } from '@/shared/ui/primitives/input';
import { Label } from '@/shared/ui/primitives/label';
import { LoadingSpinner } from '@/shared/ui/composite';
import { useExpenseBudget, useUpdateExpenseBudget } from '../hooks';

const budgetSchema = z.object({
  budgeted_amount: z.number().min(0.01, 'Valor orçado deve ser maior que zero')
});

type BudgetFormData = z.infer<typeof budgetSchema>;

interface EditBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  budgetId: string;
}

export const EditBudgetModal: React.FC<EditBudgetModalProps> = ({
  isOpen,
  onClose,
  budgetId
}) => {
  const { data: budget, isLoading: loadingBudget } = useExpenseBudget(budgetId);
  const updateBudgetMutation = useUpdateExpenseBudget();

  const form = useForm<BudgetFormData>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      budgeted_amount: 0
    }
  });

  const { register, handleSubmit, reset, formState: { errors } } = form;

  // Carregar dados do orçamento no formulário
  useEffect(() => {
    if (budget && isOpen) {
      reset({
        budgeted_amount: Number(budget.budgeted_amount)
      });
    }
  }, [budget, isOpen, reset]);

  const onSubmit = async (data: BudgetFormData) => {
    try {
      await updateBudgetMutation.mutateAsync({
        id: budgetId,
        updates: {
          budgeted_amount: Number(data.budgeted_amount)
        }
      });
      
      onClose();
    } catch (error) {
      console.error('Erro ao atualizar orçamento:', error);
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  };

  if (loadingBudget) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white">
          <div className="flex items-center justify-center p-8">
            <LoadingSpinner />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!budget) {
    return null;
  }

  const currentProgress = budget.budgeted_amount > 0 
    ? (Number(budget.actual_amount) / Number(budget.budgeted_amount)) * 100 
    : 0;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Editar Orçamento</DialogTitle>
          <p className="text-gray-400">
            {budget.expense_categories?.name} • {formatDate(budget.month_year)}
          </p>
        </DialogHeader>

        {/* Informações Atuais */}
        <div className="bg-gray-700/30 rounded-lg p-4 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Orçamento Atual:</span>
            <span className="text-white font-medium">
              {formatCurrency(Number(budget.budgeted_amount))}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Valor Realizado:</span>
            <span className="text-white font-medium">
              {formatCurrency(Number(budget.actual_amount))}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Progresso:</span>
            <span className={`font-medium ${
              currentProgress > 100 ? 'text-red-400' : 
              currentProgress > 80 ? 'text-yellow-400' : 'text-green-400'
            }`}>
              {currentProgress.toFixed(1)}%
            </span>
          </div>
          
          {/* Barra de Progresso */}
          <div className="w-full bg-gray-600 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                currentProgress > 100 ? 'bg-red-500' : 
                currentProgress > 80 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(currentProgress, 100)}%` }}
            />
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Novo Valor Orçado */}
          <div className="space-y-2">
            <Label htmlFor="budgeted_amount">Novo Valor Orçado (R$) *</Label>
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

          {/* Alertas e Dicas */}
          <div className="space-y-2">
            {currentProgress > 100 && (
              <div className="bg-red-900/20 border border-red-700 rounded-lg p-3">
                <div className="text-red-400 text-sm font-medium">⚠️ Orçamento Estourado</div>
                <div className="text-red-300 text-xs mt-1">
                  O orçamento atual já foi ultrapassado em {formatCurrency(Number(budget.variance))}
                </div>
              </div>
            )}
            
            {currentProgress > 80 && currentProgress <= 100 && (
              <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-3">
                <div className="text-yellow-400 text-sm font-medium">⚠️ Próximo do Limite</div>
                <div className="text-yellow-300 text-xs mt-1">
                  Restam apenas {formatCurrency(Number(budget.budgeted_amount) - Number(budget.actual_amount))} do orçamento
                </div>
              </div>
            )}
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
              disabled={updateBudgetMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {updateBudgetMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditBudgetModal;