import { useState } from 'react';
import { Card, CardContent } from "@/shared/ui/primitives/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/primitives/tabs";
import { ExpensesTab } from './ExpensesTab';
import { ExpenseReportsTab } from './ExpenseReportsTab';
import { DateRangePicker } from '@/shared/ui/primitives/date-range-picker';
import { startOfMonth, endOfMonth } from 'date-fns';
import { Button } from '@/shared/ui/primitives/button';
import { CalendarClock, Wand2, Settings2 } from 'lucide-react';
import { useGenerateMonthlyExpenses } from '../hooks/useExpenses';
import { cn } from '@/core/config/utils';
import { ExpenseTemplatesModal } from './ExpenseTemplatesModal';

interface DateRange {
  from: Date;
  to: Date;
}

export const ExpensesPage = () => {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date())
  });

  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false);
  const generateMonthly = useGenerateMonthlyExpenses();

  const handleGenerateClick = () => {
    const targetMonth = dateRange.from.getMonth() + 1; // 1-12
    const targetYear = dateRange.from.getFullYear();
    generateMonthly.mutate({ month: targetMonth, year: targetYear });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1">
            Gestão de Despesas
          </h1>
          <p className="text-muted-foreground">
            Controle de custos operacionais e fixos.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-900/50 p-1.5 rounded-lg border border-slate-800">
          <DateRangePicker
            dateRange={dateRange}
            onDateRangeChange={(range) => {
              if (range?.from && range?.to) {
                setDateRange({ from: range.from, to: range.to });
              }
            }}
          />
        </div>
      </div>

      {/* RECURRENCE TOOLBAR */}
      <Card className="bg-slate-900/40 border-slate-800/60">
        <CardContent className="p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500/10 p-2 rounded-full">
              <CalendarClock className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-emerald-100">Despesas Fixas</h3>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Gerencie aluguel, internet e outros custos recorrentes.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-slate-700 hover:bg-slate-800 text-slate-300"
              onClick={() => setIsTemplatesModalOpen(true)}
            >
              <Settings2 className="w-4 h-4 mr-2" />
              Gerenciar Modelos
            </Button>
            
            <Button
              variant="secondary"
              size="sm"
              className={cn(
                "bg-emerald-600 hover:bg-emerald-700 text-white border-none transition-all",
                generateMonthly.isPending && "opacity-80 cursor-wait"
              )}
              onClick={handleGenerateClick}
              disabled={generateMonthly.isPending}
            >
              <Wand2 className={cn("w-4 h-4 mr-2", generateMonthly.isPending && "animate-spin")} />
              {generateMonthly.isPending ? 'Gerando...' : 'Gerar Fixas do Mês'}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="list" className="space-y-4">
        <TabsList className="bg-slate-800/50 border border-slate-700/50 p-1">
          <TabsTrigger value="list" className="data-[state=active]:bg-slate-700">Explorar Lançamentos</TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-slate-700">Análise Gráfica</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4 focus-visible:outline-none">
          <ExpensesTab 
            startDate={dateRange.from} 
            endDate={dateRange.to} 
          />
        </TabsContent>

        <TabsContent value="analytics" className="focus-visible:outline-none">
          <ExpenseReportsTab />
        </TabsContent>
      </Tabs>

      <ExpenseTemplatesModal 
        isOpen={isTemplatesModalOpen}
        onClose={() => setIsTemplatesModalOpen(false)}
      />
    </div>
  );
};

export default ExpensesPage;