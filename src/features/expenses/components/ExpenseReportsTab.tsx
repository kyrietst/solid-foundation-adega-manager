/**
 * ExpenseReportsTab.tsx - Tab de relatórios e análises
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { Button } from '@/shared/ui/primitives/button';
import { Badge } from '@/shared/ui/primitives/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/primitives/select';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  LineChart,
  Line
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Download, 
  Calendar,
  PieChart as PieChartIcon,
  BarChart3,
  TrendingUpIcon,
  FileText,
  Target
} from 'lucide-react';
import { format, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { LoadingSpinner, EmptyState } from '@/shared/ui/composite';
import { 
  useMonthlyExpenses, 
  useExpenseSummary, 
  useBudgetVariance,
  useExpenseCategories 
} from '../hooks';
import { getGlassCardClasses, getGlassButtonClasses, getHoverTransformClasses } from '@/core/config/theme-utils';
import { cn } from '@/core/config/utils';
import { chartTheme } from '@/shared/ui/composite/ChartTheme';

// Usar paleta padronizada para despesas
const COLORS = chartTheme.expenses;

export const ExpenseReportsTab: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('current_month');
  const [selectedChart, setSelectedChart] = useState('category_pie');

  // Dados do período atual
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();
  
  // Calcular período baseado na seleção
  const getPeriodDates = () => {
    const now = new Date();
    switch (selectedPeriod) {
      case 'current_month':
        return {
          start: format(new Date(now.getFullYear(), now.getMonth(), 1), 'yyyy-MM-dd'),
          end: format(new Date(now.getFullYear(), now.getMonth() + 1, 0), 'yyyy-MM-dd'),
          month: now.getMonth() + 1,
          year: now.getFullYear()
        };
      case 'last_month':
        const lastMonth = subMonths(now, 1);
        return {
          start: format(new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1), 'yyyy-MM-dd'),
          end: format(new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0), 'yyyy-MM-dd'),
          month: lastMonth.getMonth() + 1,
          year: lastMonth.getFullYear()
        };
      case 'last_3_months':
        const threeMonthsAgo = subMonths(now, 3);
        return {
          start: format(threeMonthsAgo, 'yyyy-MM-dd'),
          end: format(now, 'yyyy-MM-dd'),
          month: now.getMonth() + 1,
          year: now.getFullYear()
        };
      default:
        return {
          start: format(new Date(now.getFullYear(), now.getMonth(), 1), 'yyyy-MM-dd'),
          end: format(new Date(now.getFullYear(), now.getMonth() + 1, 0), 'yyyy-MM-dd'),
          month: now.getMonth() + 1,
          year: now.getFullYear()
        };
    }
  };

  const period = getPeriodDates();
  
  const { data: categories = [] } = useExpenseCategories();
  const { data: monthlyExpenses = [], isLoading: loadingMonthly } = useMonthlyExpenses(period.month, period.year);
  const { data: expenseSummary, isLoading: loadingSummary } = useExpenseSummary(period.start, period.end);
  const { data: budgetVariance = [], isLoading: loadingBudget } = useBudgetVariance(period.month, period.year);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getPeriodLabel = () => {
    switch (selectedPeriod) {
      case 'current_month': return 'Mês Atual';
      case 'last_month': return 'Mês Passado';
      case 'last_3_months': return 'Últimos 3 Meses';
      default: return 'Mês Atual';
    }
  };

  // Preparar dados para gráficos
  const pieChartData = monthlyExpenses.map((expense, index) => ({
    name: expense.category_name,
    value: Number(expense.total_amount),
    color: COLORS[index % COLORS.length]
  }));

  const barChartData = monthlyExpenses.map(expense => ({
    category: expense.category_name.length > 15 ? 
      expense.category_name.substring(0, 15) + '...' : 
      expense.category_name,
    realizado: Number(expense.total_amount),
    transacoes: expense.expense_count
  }));

  const budgetComparisonData = budgetVariance.map(budget => ({
    category: budget.category_name.length > 15 ? 
      budget.category_name.substring(0, 15) + '...' : 
      budget.category_name,
    orcado: Number(budget.budgeted_amount),
    realizado: Number(budget.actual_amount)
  }));

  const handleExport = (format: 'pdf' | 'excel') => {
    // TODO: Implementar exportação
    console.log(`Exportar relatório em ${format}`);
  };

  if (loadingMonthly || loadingSummary || loadingBudget) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Controles e Filtros */}
      <Card className={getGlassCardClasses()}>
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between font-sf-pro">
            <div className="flex items-center gap-3">
              <PieChartIcon className="h-5 w-5" />
              <span className="text-lg">Relatórios e Análises - {getPeriodLabel()}</span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport('pdf')}
                className={cn(
                  getGlassButtonClasses('secondary', 'sm'),
                  getHoverTransformClasses('scale'),
                  "shadow-sm hover:shadow-purple-500/20"
                )}
              >
                <Download className="h-4 w-4 mr-2" />
                PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport('excel')}
                className={cn(
                  getGlassButtonClasses('secondary', 'sm'),
                  getHoverTransformClasses('scale'),
                  "shadow-sm hover:shadow-green-500/20"
                )}
              >
                <Download className="h-4 w-4 mr-2" />
                Excel
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="bg-black/20 border-white/20 text-white focus:border-purple-500/50 focus:ring-purple-500/25">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black/80 backdrop-blur-sm border-white/10">
                  <SelectItem value="current_month" className="text-white hover:bg-purple-500/20">
                    Mês Atual
                  </SelectItem>
                  <SelectItem value="last_month" className="text-white hover:bg-purple-500/20">
                    Mês Passado
                  </SelectItem>
                  <SelectItem value="last_3_months" className="text-white hover:bg-purple-500/20">
                    Últimos 3 Meses
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Select value={selectedChart} onValueChange={setSelectedChart}>
                <SelectTrigger className="bg-black/20 border-white/20 text-white focus:border-purple-500/50 focus:ring-purple-500/25">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black/80 backdrop-blur-sm border-white/10">
                  <SelectItem value="category_pie" className="text-white hover:bg-purple-500/20">
                    Gráfico de Pizza - Categorias
                  </SelectItem>
                  <SelectItem value="category_bar" className="text-white hover:bg-purple-500/20">
                    Gráfico de Barras - Valores
                  </SelectItem>
                  <SelectItem value="budget_comparison" className="text-white hover:bg-purple-500/20">
                    Comparação Orçamentária
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumo KPIs */}
      {expenseSummary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className={getGlassCardClasses()}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-blue-400" />
                <div>
                  <div className="text-2xl font-bold text-white font-sf-pro">
                    {formatCurrency(expenseSummary.total_expenses)}
                  </div>
                  <div className="text-sm text-gray-400 font-sf-pro">Total de Despesas</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={getGlassCardClasses()}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Target className="h-8 w-8 text-green-400" />
                <div>
                  <div className="text-2xl font-bold text-white font-sf-pro">
                    {expenseSummary.total_transactions}
                  </div>
                  <div className="text-sm text-gray-400 font-sf-pro">Transações</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={getGlassCardClasses()}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <TrendingUpIcon className="h-8 w-8 text-purple-400" />
                <div>
                  <div className="text-2xl font-bold text-white font-sf-pro">
                    {formatCurrency(expenseSummary.avg_expense)}
                  </div>
                  <div className="text-sm text-gray-400 font-sf-pro">Ticket Médio</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={getGlassCardClasses()}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <BarChart3 className="h-8 w-8 text-yellow-400" />
                <div>
                  <div className="text-lg font-bold text-white font-sf-pro">
                    {expenseSummary.top_category}
                  </div>
                  <div className="text-sm text-gray-400 font-sf-pro">
                    {formatCurrency(expenseSummary.top_category_amount)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Gráficos */}
      {monthlyExpenses.length === 0 ? (
        <EmptyState
          icon={PieChartIcon}
          title="Nenhum dado encontrado"
          description="Não há despesas para o período selecionado."
        />
      ) : (
        <Card className={getGlassCardClasses()}>
          <CardHeader>
            <CardTitle className="text-white font-sf-pro text-lg">
              {selectedChart === 'category_pie' && 'Distribuição por Categoria'}
              {selectedChart === 'category_bar' && 'Valores por Categoria'}
              {selectedChart === 'budget_comparison' && 'Orçado vs Realizado'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                {selectedChart === 'category_pie' && (
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: any) => [formatCurrency(Number(value)), 'Valor']}
                      contentStyle={{
                        backgroundColor: '#374151',
                        border: '1px solid #4B5563',
                        borderRadius: '8px',
                        color: '#F9FAFB'
                      }}
                    />
                  </PieChart>
                )}

                {selectedChart === 'category_bar' && (
                  <BarChart data={barChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="category" 
                      stroke="#9CA3AF"
                      fontSize={12}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis stroke="#9CA3AF" fontSize={12} />
                    <Tooltip 
                      formatter={(value: any, name: string) => [
                        name === 'realizado' ? formatCurrency(Number(value)) : value,
                        name === 'realizado' ? 'Valor' : 'Transações'
                      ]}
                      contentStyle={{
                        backgroundColor: '#374151',
                        border: '1px solid #4B5563',
                        borderRadius: '8px',
                        color: '#F9FAFB'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="realizado" fill="#3B82F6" name="Realizado" />
                    <Bar dataKey="transacoes" fill="#10B981" name="Transações" />
                  </BarChart>
                )}

                {selectedChart === 'budget_comparison' && (
                  <BarChart data={budgetComparisonData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="category" 
                      stroke="#9CA3AF"
                      fontSize={12}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis stroke="#9CA3AF" fontSize={12} />
                    <Tooltip 
                      formatter={(value: any) => [formatCurrency(Number(value)), '']}
                      contentStyle={{
                        backgroundColor: '#374151',
                        border: '1px solid #4B5563',
                        borderRadius: '8px',
                        color: '#F9FAFB'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="orcado" fill="#6366F1" name="Orçado" />
                    <Bar dataKey="realizado" fill="#EF4444" name="Realizado" />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabela de Análise Detalhada */}
      {monthlyExpenses.length > 0 && (
        <Card className={getGlassCardClasses()}>
          <CardHeader>
            <CardTitle className="text-white font-sf-pro text-lg">Análise Detalhada por Categoria</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-white/10 bg-black/20">
                  <tr className="text-left">
                    <th className="p-4 text-gray-300 font-semibold font-sf-pro text-sm">Categoria</th>
                    <th className="p-4 text-gray-300 font-semibold font-sf-pro text-sm">Total</th>
                    <th className="p-4 text-gray-300 font-semibold font-sf-pro text-sm">Transações</th>
                    <th className="p-4 text-gray-300 font-semibold font-sf-pro text-sm">Ticket Médio</th>
                    <th className="p-4 text-gray-300 font-semibold font-sf-pro text-sm">% do Total</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyExpenses.map((expense, index) => {
                    const percentage = expenseSummary ? 
                      (Number(expense.total_amount) / expenseSummary.total_expenses) * 100 : 0;
                    
                    return (
                      <tr key={expense.category_id} className="border-b border-white/5 hover:bg-purple-500/5 transition-all duration-300 cursor-pointer group">
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            />
                            <span className="text-white font-medium font-sf-pro">{expense.category_name}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-white font-semibold font-sf-pro">
                            {formatCurrency(Number(expense.total_amount))}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-gray-300 font-sf-pro">
                            {expense.expense_count}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-gray-300 font-sf-pro">
                            {formatCurrency(Number(expense.avg_amount))}
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge 
                            variant={percentage > 20 ? 'destructive' : percentage > 10 ? 'warning' : 'secondary'} 
                            className="text-xs"
                          >
                            {percentage.toFixed(1)}%
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ExpenseReportsTab;