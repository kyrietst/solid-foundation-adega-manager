/**
 * ExpensesTab.tsx - Tab de gestão de despesas
 */

import { useState } from 'react';
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
  RefreshCw,
  Download,
  BarChart3,
  List,
  Wand2,
  Settings2
} from 'lucide-react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { DateRange } from "react-day-picker";
import { ptBR } from 'date-fns/locale';
import { PaginationControls, LoadingSpinner, EmptyState } from '@/shared/ui/composite';
import { DatePickerWithRange } from '@/shared/ui/composite/date-range-picker';
import { usePagination } from '@/shared/hooks/common/use-pagination';
import { useExpenses, useDeleteExpense, useToggleExpenseStatus, useGenerateMonthlyExpenses, type ExpenseFilters, type OperationalExpense } from '../hooks';
import { NewExpenseModal } from './NewExpenseModal';
import { EditExpenseModal } from './EditExpenseModal';
import { ExpenseFiltersModal } from './ExpenseFiltersModal';
import { ExpensesEmptyState } from './ExpensesEmptyState';
import { ExpenseReportsTab } from './ExpenseReportsTab';
import { ExpenseTemplatesModal } from './ExpenseTemplatesModal';
import { getGlassCardClasses, getGlassButtonClasses, getHoverTransformClasses } from '@/core/config/theme-utils';
import { cn } from '@/core/config/utils';
import { PremiumBackground } from '@/shared/ui/composite/PremiumBackground';
// import { StandardPageHeader } from '@/shared/ui/composite/StandardPageHeader';

export const ExpensesTab: React.FC = () => {
  // State: View Mode
  const [viewMode, setViewMode] = useState<'list' | 'analytics'>('list');

  // State: Date Range (Default: Current Month)
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date())
  });

  // State: Modals
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  
  // State: Filters
  const [filters, setFilters] = useState<ExpenseFilters>({});

  const pagination = usePagination();
  const generateMonthly = useGenerateMonthlyExpenses();

  // Convert Dates to string YYYY-MM-DD for API
  const formattedStartDate = dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : undefined;
  const formattedEndDate = dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : undefined;

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

  const handleGenerateClick = () => {
    if (dateRange?.from) {
      const targetMonth = dateRange.from.getMonth() + 1; // 1-12
      const targetYear = dateRange.from.getFullYear();
      generateMonthly.mutate({ month: targetMonth, year: targetYear });
    }
  };

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

  const expenses = expensesData?.expenses || [];
  const totalExpenses = expensesData?.total || 0;

  return (
    <div className="w-full h-[100dvh] flex flex-col relative z-10 overflow-hidden">
      <PremiumBackground />

      <div className="flex-none z-10">

        {/* Header Standardized */}
        <header className="px-8 py-6 pt-8 pb-6">
          <div className="flex flex-wrap justify-between items-end gap-4 mb-4">
             <div className="flex flex-col gap-1">
               <p className="text-zinc-500 text-sm font-medium tracking-widest uppercase">Módulo Financeiro</p>
               <h2 className="text-white text-3xl md:text-4xl font-bold leading-tight tracking-tight">GESTÃO DE DESPESAS</h2>
             </div>
             <div className="flex items-center gap-3">
               {/* View Mode Toggle */}
               <div className="flex bg-zinc-900/50 p-1 rounded-xl border border-zinc-700/50 mr-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className={cn(
                      "rounded-lg px-3 py-1.5 h-8 text-xs font-medium transition-all",
                      viewMode === 'list' ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                    )}
                  >
                    <List className="h-3.5 w-3.5 mr-2" />
                    Lista
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode('analytics')}
                    className={cn(
                      "rounded-lg px-3 py-1.5 h-8 text-xs font-medium transition-all",
                      viewMode === 'analytics' ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                    )}
                  >
                    <BarChart3 className="h-3.5 w-3.5 mr-2" />
                    Análise
                  </Button>
               </div>

               <Button 
                variant="outline"
                className="flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-sm font-semibold hover:border-[#f9cb15] hover:text-[#f9cb15] transition-colors"
                onClick={() => setIsTemplatesModalOpen(true)}
               >
                 <Settings2 className="w-[18px] h-[18px]" />
                 <span className="hidden sm:inline">Modelos</span>
               </Button>
                <Button 
                  onClick={() => setIsNewModalOpen(true)}
                  className="flex items-center justify-center gap-2 h-10 px-6 rounded-xl bg-white text-black text-sm font-bold shadow-lg hover:bg-zinc-200 transition-colors"
                 >
                  <Plus className="w-[18px] h-[18px]" />
                  <span>Novo Lançamento</span>
                </Button>
             </div>
          </div>
        </header>

        {/* Filters & Actions Bar */}
        <div className="px-8 pb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-black/40 p-1 rounded-xl border border-white/5 backdrop-blur-sm">
             <div className="flex items-center gap-4 px-2">
                {/* Date Picker */}
                <DatePickerWithRange 
                   date={dateRange} 
                   setDate={setDateRange} 
                   className="w-[260px]"
                />
                
                <div className="h-6 w-px bg-white/10 mx-2" />

                <Button
                  variant="ghost"
                  onClick={() => setIsFiltersOpen(true)}
                  className={cn(
                    "hover:bg-white/5 text-zinc-400 hover:text-white transition-colors h-8 text-sm"
                  )}
                >
                  <Filter className="h-3.5 w-3.5 mr-2" />
                  Filtros Avançados
                </Button>
             </div>

             {/* Auto-Generate Actions */}
             <div className="flex items-center px-2">
                <Button
                  variant="ghost" 
                  size="sm"
                  onClick={handleGenerateClick}
                  disabled={generateMonthly.isPending}
                  className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-400/10 h-8 text-xs uppercase tracking-wide font-medium"
                >
                  <Wand2 className={cn("h-3.5 w-3.5 mr-2", generateMonthly.isPending && "animate-spin")} />
                  {generateMonthly.isPending ? 'Gerando...' : 'Gerar Fixas'}
                </Button>
             </div>
          </div>
        </div>
      </div>

      {/* Main Content (Scrollable) */}
      {/* Main Content (Scrollable) */}
      <main className="flex-1 overflow-y-auto px-6 md:px-10 pb-40 scroll-smooth custom-scrollbar">
      {viewMode === 'list' ? (
        <>
          {isLoading ? <LoadingSpinner /> : expenses.length === 0 ? (
            <ExpensesEmptyState
              hasFilters={!!(filters.category_id || filters.start_date || filters.end_date)}
              onClearFilters={() => {
                setFilters({});
                pagination.goToPage(1);
              }}
              onCreateExpense={() => setIsNewModalOpen(true)}
            />
          ) : (
            <div className="bg-adega-charcoal/20 border border-white/5 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-white/[0.02] border-b border-white/5">
                        <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider font-display">Data</th>
                        <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider font-display">Descrição</th>
                        <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider font-display">Categoria</th>
                        <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider font-display text-center">Status</th>
                        <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider font-display">Valor</th>
                        <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider font-display text-center">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.02]">
                      {expenses.map((expense) => (
                        <tr
                          key={expense.id}
                          className="group transition-colors duration-200 border-b border-white/[0.02] last:border-0 hover:bg-white/[0.03]"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2 text-zinc-300 text-sm font-medium">
                              <Calendar className="h-4 w-4 text-zinc-600" />
                              {expense.date ? formatDate(expense.date) : '-'}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-zinc-200 font-medium text-sm">{expense.description}</div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge
                              className="border bg-transparent"
                              style={{ 
                                  color: getCategoryColor(expense.expense_categories),
                                  borderColor: getCategoryColor(expense.expense_categories) + '40',
                                  backgroundColor: getCategoryColor(expense.expense_categories) + '10'
                              }}
                            >
                              {expense.expense_categories?.name || 'N/A'}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-center">
                             <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleStatus(expense);
                                }}
                                disabled={toggleStatusMutation.isPending}
                                className={cn(
                                  "h-7 w-auto min-w-[90px] px-2 text-xs border transition-all duration-300 rounded-lg",
                                  expense.payment_status === 'paid' 
                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20" 
                                    : "bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20"
                                )}
                              >
                                {expense.payment_status === 'paid' ? (
                                  <>
                                    <Check className="h-3 w-3 mr-1.5" />
                                    Pago
                                  </>
                                ) : (
                                  <>
                                    <Clock className="h-3 w-3 mr-1.5" />
                                    Pendente
                                  </>
                                )}
                              </Button>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-white font-bold font-mono text-sm">
                              {formatCurrency(expense.amount)}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
    
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleEdit(expense.id)}
                                className="h-8 w-8 rounded-lg text-zinc-500 hover:text-white hover:bg-white/10"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleDelete(expense.id)}
                                disabled={deleteExpenseMutation.isPending}
                                className="h-8 w-8 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10"
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
            </div>
          )}
        </>
      ) : (
        <ExpenseReportsTab />
      )}
      </main>

      {/* Floating Pagination - Only show in list mode */}
      {viewMode === 'list' && totalExpenses > pagination.itemsPerPage && (
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#050505] via-[#050505]/95 to-transparent z-50 flex justify-center pb-8 pt-12 pointer-events-none">
            <div className="pointer-events-auto">
                <PaginationControls
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  onPageChange={pagination.goToPage}
                  variant="premium"
                  glassEffect={false}
                  showItemsCount={true}
                  totalItems={totalExpenses}
                  itemsPerPage={pagination.itemsPerPage}
                  onItemsPerPageChange={pagination.setItemsPerPage}
                  itemLabel="despesa"
                  itemsLabel="despesas"
                />
            </div>
        </div>
      )}

      {/* Modals */}
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
      
      <ExpenseTemplatesModal 
        isOpen={isTemplatesModalOpen}
        onClose={() => setIsTemplatesModalOpen(false)}
      />
    </div>
  );
};

export default ExpensesTab;