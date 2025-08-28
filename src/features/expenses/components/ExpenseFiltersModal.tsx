/**
 * ExpenseFiltersModal.tsx - Modal de filtros para despesas
 */

import React from 'react';
import { useForm } from 'react-hook-form';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/primitives/select';
import { useExpenseCategories, type ExpenseFilters } from '../hooks';

interface ExpenseFiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: ExpenseFilters;
  onApplyFilters: (filters: ExpenseFilters) => void;
}

export const ExpenseFiltersModal: React.FC<ExpenseFiltersModalProps> = ({
  isOpen,
  onClose,
  filters,
  onApplyFilters
}) => {
  const { data: categories = [] } = useExpenseCategories();

  const { register, handleSubmit, setValue, reset, watch } = useForm<ExpenseFilters>({
    defaultValues: filters
  });

  const onSubmit = (data: ExpenseFilters) => {
    // Remove campos vazios
    const cleanFilters = Object.entries(data).reduce((acc, [key, value]) => {
      if (value && value !== '') {
        acc[key as keyof ExpenseFilters] = value;
      }
      return acc;
    }, {} as ExpenseFilters);

    onApplyFilters(cleanFilters);
    onClose();
  };

  const handleClearFilters = () => {
    const emptyFilters = {};
    reset(emptyFilters);
    setValue('category_id', undefined);
    setValue('payment_method', undefined);
    onApplyFilters(emptyFilters);
    onClose();
  };

  React.useEffect(() => {
    if (isOpen) {
      reset(filters);
    }
  }, [isOpen, filters, reset]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Filtrar Despesas</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Categoria */}
          <div className="space-y-2">
            <Label htmlFor="category_id">Categoria</Label>
            <Select
              value={watch('category_id') || undefined}
              onValueChange={(value) => setValue('category_id', value || undefined)}
            >
              <SelectTrigger className="bg-gray-700 border-gray-600">
                <SelectValue placeholder="Todas as categorias" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id} className="text-white">
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Período */}
          <div className="space-y-4">
            <Label>Período</Label>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="start_date" className="text-sm text-gray-400">De:</Label>
                <Input
                  id="start_date"
                  type="date"
                  {...register('start_date')}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="end_date" className="text-sm text-gray-400">Até:</Label>
                <Input
                  id="end_date"
                  type="date"
                  {...register('end_date')}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
            </div>
          </div>

          {/* Valor Mínimo e Máximo */}
          <div className="space-y-4">
            <Label>Faixa de Valor (R$)</Label>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="min_amount" className="text-sm text-gray-400">Mínimo:</Label>
                <Input
                  id="min_amount"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('min_amount')}
                  placeholder="0,00"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="max_amount" className="text-sm text-gray-400">Máximo:</Label>
                <Input
                  id="max_amount"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('max_amount')}
                  placeholder="999999,99"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
            </div>
          </div>

          {/* Forma de Pagamento */}
          <div className="space-y-2">
            <Label htmlFor="payment_method">Forma de Pagamento</Label>
            <Select
              value={watch('payment_method') || undefined}
              onValueChange={(value) => setValue('payment_method', value || undefined)}
            >
              <SelectTrigger className="bg-gray-700 border-gray-600">
                <SelectValue placeholder="Todas as formas" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="credit_card" className="text-white">
                  Cartão de Crédito
                </SelectItem>
                <SelectItem value="debit_card" className="text-white">
                  Cartão de Débito
                </SelectItem>
                <SelectItem value="pix" className="text-white">
                  PIX
                </SelectItem>
                <SelectItem value="cash" className="text-white">
                  Dinheiro
                </SelectItem>
                <SelectItem value="bank_transfer" className="text-white">
                  Transferência
                </SelectItem>
                <SelectItem value="check" className="text-white">
                  Cheque
                </SelectItem>
                <SelectItem value="other" className="text-white">
                  Outro
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClearFilters}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Limpar Filtros
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Aplicar Filtros
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ExpenseFiltersModal;