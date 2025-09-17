import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/primitives/tabs';
import { Button } from '@/shared/ui/primitives/button';
import { Calculator, Receipt, PieChart, BarChart3, Download } from 'lucide-react';
import ExpensesTab from './ExpensesTab';
import ExpenseReportsTab from './ExpenseReportsTab';
import { useExpenseSummary } from '../hooks';
import { format } from 'date-fns';
import { StatCard } from '@/shared/ui/composite/stat-card';
import { getGlassCardClasses, getGlassButtonClasses, getHoverTransformClasses } from '@/core/config/theme-utils';
import { cn } from '@/core/config/utils';
import { LoadingScreen } from '@/shared/ui/composite/loading-spinner';
import { PageHeader } from '@/shared/ui/composite/PageHeader';

const ExpensesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('expenses');
  
  // Dados do mês atual
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();
  const monthStart = format(new Date(currentYear, currentMonth - 1, 1), 'yyyy-MM-dd');
  const monthEnd = format(new Date(currentYear, currentMonth, 0), 'yyyy-MM-dd');

  const { data: expenseSummary, isLoading: summaryLoading } = useExpenseSummary(monthStart, monthEnd);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };



  // Preparar dados para os KPIs usando StatCard - Versão Simplificada
  const kpiData = [
    {
      title: 'Total de Despesas',
      value: summaryLoading ? '...' : formatCurrency(expenseSummary?.total_expenses || 0),
      subtitle: `${expenseSummary?.total_transactions || 0} transações este mês`,
      icon: Receipt,
      variant: 'default' as const,
      href: '#expenses-tab'
    },
    {
      title: 'Média por Transação', 
      value: summaryLoading ? '...' : formatCurrency(expenseSummary?.avg_expense || 0),
      subtitle: `Categoria top: ${expenseSummary?.top_category || 'N/A'}`,
      icon: Calculator,
      variant: 'success' as const,
      href: '#reports-tab'
    },
    {
      title: 'Categoria Principal',
      value: summaryLoading ? '...' : (expenseSummary?.top_category || 'N/A'),
      subtitle: formatCurrency(expenseSummary?.top_category_amount || 0),
      icon: PieChart,
      variant: 'purple' as const,
      href: '#reports-tab'
    }
  ];

  if (summaryLoading) {
    return <LoadingScreen text="Carregando dados de despesas..." />;
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header padronizado com botões de ação */}
      <PageHeader title="GESTÃO DE DESPESAS">
        <Button
          onClick={() => setActiveTab('reports')}
          className={cn(
            getGlassButtonClasses('primary'),
            getHoverTransformClasses('scale'),
            "flex items-center gap-2"
          )}
        >
          <BarChart3 className="h-4 w-4" />
          Relatórios
        </Button>
        <Button
          variant="outline"
          className={cn(
            getGlassButtonClasses('secondary'),
            getHoverTransformClasses('scale'),
            "flex items-center gap-2"
          )}
        >
          <Download className="h-4 w-4" />
          Exportar
        </Button>
      </PageHeader>

      {/* Container principal com glassmorphism - ocupa altura restante */}
      <div className="flex-1 min-h-0 bg-black/80 backdrop-blur-sm border border-white/10 rounded-xl shadow-lg p-4 flex flex-col hover:shadow-2xl hover:shadow-purple-500/10 hover:border-purple-400/30 transition-all duration-300 space-y-6"
        onMouseMove={(e) => {
          const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * 100;
          const y = ((e.clientY - rect.top) / rect.height) * 100;
          (e.currentTarget as HTMLElement).style.setProperty("--x", `${x}%`);
          (e.currentTarget as HTMLElement).style.setProperty("--y", `${y}%`);
        }}
      >
        {/* KPIs Resumo do Mês */}
        <div className="flex-shrink-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {kpiData.map((kpi, index) => (
            <StatCard
              key={index}
              {...kpi}
              className={cn(
                getGlassCardClasses(),
                getHoverTransformClasses('scale'),
                "cursor-pointer"
              )}
              onClick={() => {
                if (kpi.href.includes('expenses')) setActiveTab('expenses');
                if (kpi.href.includes('reports')) setActiveTab('reports');
              }}
            />
          ))}
        </div>

        {/* Tabs de Navegação */}
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab} 
          className="flex-1 space-y-6"
        >
        <TabsList className={cn(
          getGlassCardClasses(),
          "grid w-full grid-cols-2 p-1"
        )}>
          <TabsTrigger 
            value="expenses" 
            className={cn(
              "data-[state=active]:bg-purple-500/20 data-[state=active]:text-white",
              "data-[state=active]:shadow-lg data-[state=active]:shadow-purple-500/25",
              "transition-all duration-300 ease-out"
            )}
          >
            <Receipt className="h-4 w-4 mr-2" />
            Despesas
          </TabsTrigger>
          <TabsTrigger 
            value="reports"
            className={cn(
              "data-[state=active]:bg-purple-500/20 data-[state=active]:text-white",
              "data-[state=active]:shadow-lg data-[state=active]:shadow-purple-500/25",
              "transition-all duration-300 ease-out"
            )}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Relatórios
          </TabsTrigger>
        </TabsList>

        <TabsContent value="expenses" className="space-y-6">
          <ExpensesTab />
        </TabsContent>


        <TabsContent value="reports" className="space-y-6">
          <ExpenseReportsTab />
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
};

export default ExpensesPage;