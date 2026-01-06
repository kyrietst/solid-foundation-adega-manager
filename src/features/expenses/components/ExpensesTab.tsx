/**
 * ExpensesTab.tsx - Tab de gestão de despesas
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { Button } from '@/shared/ui/primitives/button';
import { Badge } from '@/shared/ui/primitives/badge';
import {

  Plus,
  Filter,
  Edit,
  Trash2,
  Calendar,
  Check,
  Clock,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PaginationControls, LoadingSpinner, EmptyState } from '@/shared/ui/composite';
import { usePagination } from '@/shared/hooks/common/use-pagination';
import { useExpenses, useDeleteExpense, useToggleExpenseStatus, type ExpenseFilters, type OperationalExpense } from '../hooks';
import { NewExpenseModal } from './NewExpenseModal';
import { EditExpenseModal } from './EditExpenseModal';
import { ExpenseFiltersModal } from './ExpenseFiltersModal';
import { ExpensesEmptyState } from './ExpensesEmptyState';
import { getGlassCardClasses, getGlassButtonClasses, getHoverTransformClasses } from '@/core/config/theme-utils';
import { cn } from '@/core/config/utils';

interface ExpensesTabProps {
  startDate: Date;
  endDate: Date;
}

export const ExpensesTab: React.FC<ExpensesTabProps> = ({ startDate, endDate }) => {
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [filters, setFilters] = useState<ExpenseFilters>({});

  const pagination = usePagination();

  // Convert Dates to string YYYY-MM-DD for API
  const formattedStartDate = format(startDate, 'yyyy-MM-dd');
  const formattedEndDate = format(endDate, 'yyyy-MM-dd');

  const expenseFilters: ExpenseFilters = {
    ...filters,
    start_date: formattedStartDate,
    end_date: formattedEndDate,
    page: pagination.currentPage,
    limit: pagination.itemsPerPage
  };

  const { data: expensesData, isLoading } = useExpenses(expenseFilters);
  const deleteExpenseMutation = useDeleteExpense();
  const toggleStatusMutation = useToggleExpenseStatus();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
  };



  const getCategoryColor = (category: any) => {
    return category?.color || '#6B7280';
  };

  const handleEdit = (expenseId: string) => {
    setEditingExpenseId(expenseId);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (expenseId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta despesa?')) {
      try {
        await deleteExpenseMutation.mutateAsync(expenseId);
      } catch (error) {
        console.error('Erro ao excluir despesa:', error);
      }
    }
  };

  const handleToggleStatus = async (expense: OperationalExpense) => {
    // Regra: Pendente -> Pago ou Pago -> Pendente
    // Se estiver Pago, vira Pendente. Se estiver Pendente, vira Pago.
    // Lógica de Negócio: NÃO alterar a data. Manter a data original.
    
    // Fallback safe defaults (se null)
    const currentStatus = expense.payment_status || 'pending';
    const newStatus = currentStatus === 'paid' ? 'pending' : 'paid';

    try {
      await toggleStatusMutation.mutateAsync({
        id: expense.id,
        newStatus
      });
    } catch (error) {
           console.error('Erro ao alternar status:', error);
    }
  };

  const handleFiltersApply = (newFilters: ExpenseFilters) => {
    setFilters(newFilters);
    pagination.goToPage(1);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const expenses = expensesData?.expenses || [];
  const totalExpenses = expensesData?.total || 0;

  return (
    <div className="space-y-6">
      {/* Header com busca e filtros */}
      <Card className={getGlassCardClasses()}>
        <CardHeader className="pb-4">
          <CardTitle className="text-white flex items-center justify-between">
            <span className="font-sf-pro font-semibold text-lg">Lista de Despesas</span>
            <Button
              onClick={() => setIsNewModalOpen(true)}
              className={cn(
                getGlassButtonClasses('primary'),
                getHoverTransformClasses('scale'),
                "shadow-lg shadow-purple-500/25"
              )}
            >
              <Plus className="h-4 w-4 mr-2" />
              Lançar Despesa Operacional

            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={() => setIsFiltersOpen(true)}
              className={cn(
                getGlassButtonClasses('secondary'),
                getHoverTransformClasses('scale')
              )}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtros Avançados
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de despesas */}
      {expenses.length === 0 ? (
        <ExpensesEmptyState
          hasFilters={!!(filters.category_id || filters.start_date || filters.end_date)}
          onClearFilters={() => {
            setFilters({});
            pagination.goToPage(1);
          }}
          onCreateExpense={() => setIsNewModalOpen(true)}
        />
      ) : (
        <Card className={cn(
          getGlassCardClasses(),
          "overflow-hidden"
        )}>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-white/10 bg-black/20">
                  <tr className="text-left">
                    <th className="p-4 text-gray-300 font-semibold font-sf-pro text-sm">Data</th>
                    <th className="p-4 text-gray-300 font-semibold font-sf-pro text-sm">Descrição</th>
                    <th className="p-4 text-gray-300 font-semibold font-sf-pro text-sm">Categoria</th>
                    <th className="p-4 text-gray-300 font-semibold font-sf-pro text-sm text-center">Status</th>
                    <th className="p-4 text-gray-300 font-semibold font-sf-pro text-sm">Valor</th>
                    <th className="p-4 text-gray-300 font-semibold font-sf-pro text-sm text-center">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((expense) => (
                    <tr
                      key={expense.id}
                      className="border-b border-white/5 hover:bg-purple-500/5 transition-all duration-300 cursor-pointer group"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-white">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          {expense.date ? formatDate(expense.date) : '-'}
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <div className="text-white font-medium">{expense.description}</div>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge
                          style={{ backgroundColor: getCategoryColor(expense.expense_categories) + '20', color: getCategoryColor(expense.expense_categories) }}
                          className="border"
                        >
                          {expense.expense_categories?.name || 'N/A'}
                        </Badge>
                      </td>
                      <td className="p-4 text-center">
                         <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleStatus(expense);
                            }}
                            disabled={toggleStatusMutation.isPending}
                            className={cn(
                              "h-8 w-auto min-w-[100px] border transition-all duration-300",
                              expense.payment_status === 'paid' 
                                ? "bg-green-500/10 text-green-400 border-green-500/30 hover:bg-green-500/20" 
                                : "bg-yellow-500/10 text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/20"
                            )}
                          >
                            {expense.payment_status === 'paid' ? (
                              <>
                                <Check className="h-4 w-4 mr-2" />
                                Pago
                              </>
                            ) : (
                              <>
                                <Clock className="h-4 w-4 mr-2" />
                                Pendente
                              </>
                            )}
                          </Button>
                      </td>
                      <td className="p-4">
                        <div className="text-white font-semibold">
                          {formatCurrency(expense.amount)}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(expense.id)}
                            className={cn(
                              getGlassButtonClasses('secondary', 'sm'),
                              getHoverTransformClasses('scale'),
                              "shadow-sm hover:shadow-purple-500/20"
                            )}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(expense.id)}
                            disabled={deleteExpenseMutation.isPending}
                            className={cn(
                              getGlassButtonClasses('outline', 'sm'),
                              getHoverTransformClasses('scale'),
                              "shadow-sm hover:shadow-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/10"
                            )}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Paginação */}
      {totalExpenses > pagination.itemsPerPage && (
        <PaginationControls
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={pagination.goToPage}
          className="justify-center"
        />
      )}

      {/* Modais */}
      <NewExpenseModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
      />

      {editingExpenseId && (
        <EditExpenseModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingExpenseId(null);
          }}
          expenseId={editingExpenseId}
        />
      )}

      <ExpenseFiltersModal
        isOpen={isFiltersOpen}
        onClose={() => setIsFiltersOpen(false)}
        filters={filters}
        onApplyFilters={handleFiltersApply}
      />
    </div>
  );
};

export default ExpensesTab;