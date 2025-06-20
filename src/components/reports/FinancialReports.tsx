import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FinancialReportProps {
  financialMetrics?: {
    revenue: number;
    expenses: number;
    profit: number;
    profit_margin: number;
    cash_flow: number;
  };
  isLoading?: boolean;
  onExport?: () => void;
  className?: string;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(value);

const FinancialReports = ({
  financialMetrics,
  isLoading = false,
  onExport,
  className = '',
}: FinancialReportProps) => {
  if (isLoading) {
    return <Skeleton className={cn('h-40 w-full', className)} />;
  }

  if (!financialMetrics) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Relatório Financeiro</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Nenhum dado financeiro disponível.</p>
        </CardContent>
      </Card>
    );
  }

  const { revenue, expenses, profit, profit_margin, cash_flow } = financialMetrics;

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="text-2xl font-bold">Relatório Financeiro</CardTitle>
          <p className="text-muted-foreground text-sm">
            Visão geral de receitas, despesas e lucros
          </p>
        </div>
        <Button size="sm" onClick={onExport}>
          <Download className="h-4 w-4 mr-2" /> Exportar
        </Button>
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div>
          <p className="text-sm text-muted-foreground">Receita</p>
          <p className="text-xl font-semibold text-green-600">{formatCurrency(revenue)}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Despesas</p>
          <p className="text-xl font-semibold text-red-600">{formatCurrency(expenses)}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Lucro</p>
          <p className="text-xl font-semibold">{formatCurrency(profit)}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Margem de Lucro</p>
          <p className="text-xl font-semibold">{profit_margin.toFixed(2)}%</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Fluxo de Caixa</p>
          <p className="text-xl font-semibold">{formatCurrency(cash_flow)}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export { FinancialReports };
