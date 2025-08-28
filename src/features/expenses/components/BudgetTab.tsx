/**
 * BudgetTab.tsx - Tab de gestão de orçamento
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { Button } from '@/shared/ui/primitives/button';
import { Badge } from '@/shared/ui/primitives/badge';
import { Progress } from '@/shared/ui/primitives/progress';
import { 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  AlertTriangle,
  Calendar,
  Edit,
  Trash2
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { LoadingSpinner, EmptyState } from '@/shared/ui/composite';
import { useBudgetVariance, useBudgetSummary, useDeleteExpenseBudget } from '../hooks';
import { NewBudgetModal } from './NewBudgetModal';
import { EditBudgetModal } from './EditBudgetModal';
import { getGlassCardClasses, getGlassButtonClasses, getHoverTransformClasses } from '@/core/config/theme-utils';
import { cn } from '@/core/config/utils';

export const BudgetTab: React.FC = () => {
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return now.getMonth() + 1;
  });
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear());

  const { data: budgetVariances, isLoading: loadingVariances } = useBudgetVariance(selectedMonth, selectedYear);
  const { data: budgetSummary, isLoading: loadingSummary } = useBudgetSummary(selectedMonth, selectedYear);
  const deleteBudgetMutation = useDeleteExpenseBudget();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'ON_TRACK': return 'success';
      case 'WARNING': return 'warning';
      case 'OVER_BUDGET': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ON_TRACK': return 'No Orçamento';
      case 'WARNING': return 'Atenção';
      case 'OVER_BUDGET': return 'Estourado';
      default: return 'N/A';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ON_TRACK': return Target;
      case 'WARNING': return AlertTriangle;
      case 'OVER_BUDGET': return TrendingUp;
      default: return Target;
    }
  };

  const getProgressColor = (status: string) => {
    switch (status) {
      case 'ON_TRACK': return 'bg-green-600';
      case 'WARNING': return 'bg-yellow-600';
      case 'OVER_BUDGET': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  const calculateProgress = (actual: number, budgeted: number) => {
    if (budgeted === 0) return 0;
    return Math.min((actual / budgeted) * 100, 100);
  };

  const handleEdit = (budgetId: string) => {
    setEditingBudgetId(budgetId);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (budgetId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este orçamento?')) {
      try {
        await deleteBudgetMutation.mutateAsync(budgetId);
      } catch (error) {
        console.error('Erro ao excluir orçamento:', error);
      }
    }
  };

  const getCurrentMonthName = () => {
    const date = new Date(selectedYear, selectedMonth - 1, 1);
    return format(date, 'MMMM yyyy', { locale: ptBR });
  };

  if (loadingVariances || loadingSummary) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Header com resumo e controles */}
      <Card className={getGlassCardClasses()}>
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between font-sf-pro">
            <div className="flex items-center gap-3">
              <span className="text-lg">Orçamento - {getCurrentMonthName()}</span>
              <Calendar className="h-5 w-5 text-gray-400" />
            </div>
            <Button
              onClick={() => setIsNewModalOpen(true)}
              className={cn(
                getGlassButtonClasses('primary'),
                getHoverTransformClasses('scale'),
                "shadow-lg shadow-purple-500/25"
              )}
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Orçamento
            </Button>
          </CardTitle>
        </CardHeader>
        
        {budgetSummary && (
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Orçado Total */}
              <div className={cn(getGlassCardClasses(), "p-4")}>
                <div className="text-sm text-gray-400 mb-1 font-sf-pro">Orçado Total</div>
                <div className="text-xl font-bold text-white font-sf-pro">
                  {formatCurrency(budgetSummary.totalBudgeted)}
                </div>
              </div>

              {/* Realizado Total */}
              <div className={cn(getGlassCardClasses(), "p-4")}>
                <div className="text-sm text-gray-400 mb-1 font-sf-pro">Realizado Total</div>
                <div className="text-xl font-bold text-white font-sf-pro">
                  {formatCurrency(budgetSummary.totalActual)}
                </div>
              </div>

              {/* Variação */}
              <div className={cn(getGlassCardClasses(), "p-4")}>
                <div className="text-sm text-gray-400 mb-1 font-sf-pro">Variação</div>
                <div className={`text-xl font-bold flex items-center gap-2 font-sf-pro ${
                  budgetSummary.totalVariance > 0 ? 'text-red-400' : 'text-green-400'
                }`}>
                  {budgetSummary.totalVariance > 0 ? (
                    <TrendingUp className="h-5 w-5" />
                  ) : (
                    <TrendingDown className="h-5 w-5" />
                  )}
                  {budgetSummary.variancePercent > 0 ? '+' : ''}{budgetSummary.variancePercent.toFixed(1)}%
                </div>
              </div>

              {/* Status Geral */}
              <div className={cn(getGlassCardClasses(), "p-4")}>
                <div className="text-sm text-gray-400 mb-1 font-sf-pro">Status Categorias</div>
                <div className="flex gap-1">
                  <Badge variant="success" className="text-xs">
                    {budgetSummary.categoriesOnTrack} OK
                  </Badge>
                  <Badge variant="warning" className="text-xs">
                    {budgetSummary.categoriesWarning} Atenção
                  </Badge>
                  <Badge variant="destructive" className="text-xs">
                    {budgetSummary.categoriesOverBudget} Estourado
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Lista de Orçamentos por Categoria */}
      {!budgetVariances || budgetVariances.length === 0 ? (
        <EmptyState
          icon={Target}
          title="Nenhum orçamento encontrado"
          description="Crie orçamentos para controlar os gastos por categoria."
        />
      ) : (
        <div className="space-y-4">
          {budgetVariances.map((budget) => {
            const StatusIcon = getStatusIcon(budget.status);
            const progress = calculateProgress(budget.actual_amount, budget.budgeted_amount);
            
            return (
              <Card key={`${budget.category_id}-${selectedMonth}-${selectedYear}`} className={getGlassCardClasses()}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <StatusIcon className="h-5 w-5 text-gray-400" />
                      <h3 className="text-lg font-semibold text-white">{budget.category_name}</h3>
                      <Badge variant={getStatusVariant(budget.status) as any} className="text-xs">
                        {getStatusLabel(budget.status)}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(`${budget.category_id}-${selectedMonth}-${selectedYear}`)}
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
                        onClick={() => handleDelete(`${budget.category_id}-${selectedMonth}-${selectedYear}`)}
                        disabled={deleteBudgetMutation.isPending}
                        className={cn(
                          getGlassButtonClasses('destructive', 'sm'),
                          getHoverTransformClasses('scale'),
                          "shadow-sm hover:shadow-red-500/20"
                        )}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {/* Valores */}
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-gray-400 font-sf-pro">Orçado</div>
                        <div className="font-medium text-white font-sf-pro">
                          {formatCurrency(budget.budgeted_amount)}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-400 font-sf-pro">Realizado</div>
                        <div className="font-medium text-white font-sf-pro">
                          {formatCurrency(budget.actual_amount)}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-400 font-sf-pro">Variação</div>
                        <div className={`font-medium font-sf-pro ${
                          budget.variance > 0 ? 'text-red-400' : 'text-green-400'
                        }`}>
                          {budget.variance > 0 ? '+' : ''}{formatCurrency(budget.variance)}
                          <span className="ml-1 text-xs">
                            ({budget.variance_percent > 0 ? '+' : ''}{budget.variance_percent.toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Barra de Progresso */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-gray-400">
                        <span className="font-sf-pro">Progresso do Orçamento</span>
                        <span className="font-sf-pro">{progress.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(budget.status)}`}
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modais */}
      <NewBudgetModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        defaultMonth={selectedMonth}
        defaultYear={selectedYear}
      />

      {editingBudgetId && (
        <EditBudgetModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingBudgetId(null);
          }}
          budgetId={editingBudgetId}
        />
      )}
    </div>
  );
};

export default BudgetTab;