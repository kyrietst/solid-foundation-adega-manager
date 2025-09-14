/**
 * ExpenseFiltersModal.tsx - Modal de filtros para despesas
 */

import React from 'react';
import { useForm } from 'react-hook-form';
import { Home, Zap, Users, Megaphone, Wrench, Truck, Shield, Calculator, Package, Tag, Droplets, Wifi, MoreHorizontal, Filter } from 'lucide-react';
import { BaseModal } from '@/shared/ui/composite/BaseModal';
import { Button } from '@/shared/ui/primitives/button';
import { Input } from '@/shared/ui/primitives/input';
import { Label } from '@/shared/ui/primitives/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/primitives/select';
import { useExpenseCategories, type ExpenseFilters } from '../hooks';
import { cn } from '@/core/config/utils';

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
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Filtrar Despesas"
      size="md"
      icon={Filter}
      iconColor="text-blue-400"
    >

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Categoria */}
          <div className="space-y-2">
            <Label htmlFor="category_id">Categoria</Label>
            <Select
              value={watch('category_id') || undefined}
              onValueChange={(value) => setValue('category_id', value || undefined)}
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
                    <span className="text-gray-400">Todas as categorias</span>
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

          <div className="flex gap-2 pt-4">
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
          </div>
        </form>
    </BaseModal>
  );
};

export default ExpenseFiltersModal;