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
  Eye,
  Calendar,
  CreditCard,
  Building,
  FileText
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PaginationControls, LoadingSpinner, EmptyState } from '@/shared/ui/composite';
import { usePagination } from '@/shared/hooks/common/use-pagination';
import { useExpenses, useDeleteExpense, type ExpenseFilters } from '../hooks';
import { NewExpenseModal } from './NewExpenseModal';
import { EditExpenseModal } from './EditExpenseModal';
import { ExpenseFiltersModal } from './ExpenseFiltersModal';
import { getGlassCardClasses, getGlassButtonClasses, getHoverTransformClasses } from '@/core/config/theme-utils';
import { cn } from '@/core/config/utils';
import { SearchBar21st } from '@/shared/ui/thirdparty/search-bar-21st';

export const ExpensesTab: React.FC = () => {
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<ExpenseFilters>({});

  const pagination = usePagination();
  
  const expenseFilters: ExpenseFilters = {
    ...filters,
    search: searchTerm || undefined,
    page: pagination.currentPage,
    limit: pagination.pageSize
  };

  const { data: expensesData, isLoading } = useExpenses(expenseFilters);
  const deleteExpenseMutation = useDeleteExpense();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
  };

  const translatePaymentMethod = (method: string) => {
    const translations: Record<string, string> = {
      'credit_card': 'Cartão de Crédito',
      'debit_card': 'Cartão de Débito',
      'pix': 'PIX',
      'cash': 'Dinheiro',
      'bank_transfer': 'Transferência',
      'check': 'Cheque',
      'other': 'Outro'
    };
    return translations[method] || method;
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
              Nova Despesa
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex-1">
              <SearchBar21st
                placeholder="Buscar por descrição ou fornecedor..."
                value={searchTerm}
                onChange={setSearchTerm}
                className="w-full"
                disableResizeAnimation={true}
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setIsFiltersOpen(true)}
              className={cn(
                getGlassButtonClasses('secondary'),
                getHoverTransformClasses('scale')
              )}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de despesas */}
      {expenses.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Nenhuma despesa encontrada"
          description="Nenhuma despesa foi encontrada com os filtros aplicados."
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
                    <th className="p-4 text-gray-300 font-semibold font-sf-pro text-sm">Valor</th>
                    <th className="p-4 text-gray-300 font-semibold font-sf-pro text-sm">Pagamento</th>
                    <th className="p-4 text-gray-300 font-semibold font-sf-pro text-sm">Fornecedor</th>
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
                          {formatDate(expense.expense_date)}
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <div className="text-white font-medium">{expense.description}</div>
                          {expense.subcategory && (
                            <div className="text-sm text-gray-400">{expense.subcategory}</div>
                          )}
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
                      <td className="p-4">
                        <div className="text-white font-semibold">
                          {formatCurrency(expense.amount)}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-gray-300">
                          <CreditCard className="h-4 w-4" />
                          {translatePaymentMethod(expense.payment_method)}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-gray-300">
                          {expense.supplier_vendor ? (
                            <>
                              <Building className="h-4 w-4" />
                              {expense.supplier_vendor}
                            </>
                          ) : (
                            <span className="text-gray-500">-</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          {expense.receipt_url && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(expense.receipt_url!, '_blank')}
                              className={cn(
                                getGlassButtonClasses('secondary', 'sm'),
                                getHoverTransformClasses('scale'),
                                "shadow-sm hover:shadow-blue-500/20"
                              )}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
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
                              getGlassButtonClasses('destructive', 'sm'),
                              getHoverTransformClasses('scale'),
                              "shadow-sm hover:shadow-red-500/20"
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
      {totalExpenses > pagination.pageSize && (
        <PaginationControls
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages(totalExpenses)}
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