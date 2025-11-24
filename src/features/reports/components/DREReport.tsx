import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { Button } from '@/shared/ui/primitives/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';
import { useDashboardExpenses } from '@/features/dashboard/hooks/useDashboardExpenses';
import { Calculator, Calendar, TrendingUp, TrendingDown, FileText, Download } from 'lucide-react';
import { cn } from '@/core/config/utils';

interface DREData {
  // Receitas
  receita_bruta: number;
  deducoes_receita: number; // Impostos, devoluções, descontos
  receita_liquida: number;
  
  // Custos
  cogs: number; // Custo dos produtos vendidos
  lucro_bruto: number;
  margem_bruta_percent: number;
  
  // Despesas Operacionais
  despesas_administrativas: number;
  despesas_comerciais: number;
  despesas_gerais: number;
  total_despesas_operacionais: number;
  
  // Resultado Operacional
  resultado_operacional: number;
  margem_operacional_percent: number;
  
  // Resultado Final
  outras_receitas: number;
  outras_despesas: number;
  resultado_antes_imposto: number;
  impostos_sobre_lucro: number;
  lucro_liquido: number;
  margem_liquida_percent: number;
}

interface DREReportProps {
  className?: string;
}

const periodOptions = [
  { value: 30, label: 'Últimos 30 dias' },
  { value: 90, label: 'Últimos 3 meses' },
  { value: 365, label: 'Último ano' }
];

export function DREReport({ className }: DREReportProps) {
  const [selectedPeriod, setSelectedPeriod] = useState(30);
  
  const { data: expensesData } = useDashboardExpenses(selectedPeriod);

  const { data: dreData, isLoading, error } = useQuery({
    queryKey: ['dre-report', selectedPeriod, expensesData?.total_expenses],
    queryFn: async (): Promise<DREData> => {
      
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - selectedPeriod);

      // 1. Buscar receitas (vendas)
      const { data: salesData, error: salesError } = await supabase
        .from('sales')
        .select('id, final_amount, total_amount, created_at')
        .eq('status', 'completed')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .not('final_amount', 'is', null);

      if (salesError) {
        console.error('❌ Erro ao buscar vendas para DRE:', salesError);
        throw salesError;
      }

      // 2. Calcular COGS (Custo dos Produtos Vendidos)
      const salesIds = (salesData || []).map(sale => sale.id);
      let cogs = 0;
      
      if (salesIds.length > 0) {
        const { data: cogsData, error: cogsError } = await supabase
          .from('sale_items')
          .select(`
            quantity,
            products!inner(cost_price),
            sales!inner(id)
          `)
          .in('sales.id', salesIds);

        if (!cogsError && cogsData) {
          cogs = cogsData.reduce((sum, item) => {
            const quantity = Number(item.quantity) || 0;
            const costPrice = Number(item.products?.cost_price) || 0;
            return sum + (quantity * costPrice);
          }, 0);
        }
      }

      // 3. Calcular receitas
      const receita_bruta = (salesData || []).reduce((sum, sale) => 
        sum + (Number(sale.total_amount) || 0), 0);
      
      const deducoes_receita = receita_bruta - (salesData || []).reduce((sum, sale) => 
        sum + (Number(sale.final_amount) || 0), 0);
      
      const receita_liquida = receita_bruta - deducoes_receita;
      
      // 4. Lucro bruto
      const lucro_bruto = receita_liquida - cogs;
      const margem_bruta_percent = receita_liquida > 0 ? (lucro_bruto / receita_liquida) * 100 : 0;

      // 5. Despesas operacionais (do sistema de gestão de despesas)
      const total_despesas_operacionais = expensesData?.total_expenses || 0;
      
      // Quebrar por categoria (aproximadamente)
      const despesas_administrativas = total_despesas_operacionais * 0.4; // 40% admin
      const despesas_comerciais = total_despesas_operacionais * 0.3; // 30% comercial
      const despesas_gerais = total_despesas_operacionais * 0.3; // 30% gerais

      // 6. Resultado operacional
      const resultado_operacional = lucro_bruto - total_despesas_operacionais;
      const margem_operacional_percent = receita_liquida > 0 ? (resultado_operacional / receita_liquida) * 100 : 0;

      // 7. Resultado final (simplificado)
      const outras_receitas = 0; // Placeholder
      const outras_despesas = 0; // Placeholder
      const resultado_antes_imposto = resultado_operacional + outras_receitas - outras_despesas;
      
      // Impostos aproximados (simplificado - 27% para Lucro Real)
      const impostos_sobre_lucro = resultado_antes_imposto > 0 ? resultado_antes_imposto * 0.27 : 0;
      const lucro_liquido = resultado_antes_imposto - impostos_sobre_lucro;
      const margem_liquida_percent = receita_liquida > 0 ? (lucro_liquido / receita_liquida) * 100 : 0;


      return {
        receita_bruta,
        deducoes_receita,
        receita_liquida,
        cogs,
        lucro_bruto,
        margem_bruta_percent,
        despesas_administrativas,
        despesas_comerciais,
        despesas_gerais,
        total_despesas_operacionais,
        resultado_operacional,
        margem_operacional_percent,
        outras_receitas,
        outras_despesas,
        resultado_antes_imposto,
        impostos_sobre_lucro,
        lucro_liquido,
        margem_liquida_percent
      };
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    enabled: !!expensesData,
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const DRELine = ({ 
    label, 
    value, 
    percentage, 
    isTotal = false, 
    isSubtotal = false,
    isNegative = false,
    level = 0 
  }: {
    label: string;
    value: number;
    percentage?: number;
    isTotal?: boolean;
    isSubtotal?: boolean;
    isNegative?: boolean;
    level?: number;
  }) => {
    const indentClass = level > 0 ? `ml-${level * 4}` : '';
    
    return (
      <div className={cn(
        "flex items-center justify-between py-2 px-4",
        isTotal && "border-t border-b border-white/20 bg-white/5 font-bold text-lg",
        isSubtotal && "border-t border-white/10 bg-white/3 font-semibold",
        !isTotal && !isSubtotal && "text-gray-200",
        indentClass
      )}>
        <span className={cn(
          isTotal && "text-white",
          isSubtotal && "text-gray-100",
          isNegative && "text-red-300"
        )}>
          {label}
        </span>
        <div className="flex items-center gap-3">
          <span className={cn(
            "font-mono",
            isTotal && "text-white font-bold",
            isSubtotal && "text-gray-100 font-semibold",
            isNegative ? "text-red-300" : "text-green-300"
          )}>
            {isNegative ? `-${formatCurrency(Math.abs(value))}` : formatCurrency(value)}
          </span>
          {percentage !== undefined && (
            <span className={cn(
              "text-xs w-16 text-right",
              percentage > 0 ? "text-green-400" : "text-red-400"
            )}>
              {formatPercent(percentage)}
            </span>
          )}
        </div>
      </div>
    );
  };

  if (error) {
    return (
      <Card className="border-red-500/40 bg-black/80 backdrop-blur-xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-red-300 font-bold flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Erro ao carregar DRE
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-200 text-sm font-medium">Não foi possível carregar os dados do Demonstrativo de Resultado.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("border-white/20 bg-black/80 backdrop-blur-xl shadow-lg", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg tracking-tight flex items-center gap-2 text-blue-400 font-bold">
            <FileText className="h-5 w-5" />
            DRE - Demonstrativo de Resultado do Exercício
          </CardTitle>
          
          <div className="flex items-center gap-2">
            {/* Period selector */}
            <div className="flex bg-white/5 rounded-lg p-1">
              {periodOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={selectedPeriod === option.value ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setSelectedPeriod(option.value)}
                  className={cn(
                    "text-xs h-7",
                    selectedPeriod === option.value 
                      ? "bg-blue-500 text-white hover:bg-blue-600 font-semibold" 
                      : "hover:text-white hover:bg-white/15 font-medium text-gray-300"
                  )}
                >
                  {option.label}
                </Button>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              className="text-xs h-7 bg-white/5 hover:bg-white/10 border-white/20"
            >
              <Download className="h-3 w-3 mr-1" />
              Exportar
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="text-sm text-gray-200 pb-0">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-blue-300/30 border-t-blue-300 rounded-full animate-spin" />
          </div>
        ) : dreData && (
          <div className="space-y-1">
            {/* RECEITAS */}
            <div className="mb-4">
              <h3 className="text-sm font-bold text-blue-300 mb-2 px-4">RECEITAS</h3>
              <DRELine label="Receita Bruta de Vendas" value={dreData.receita_bruta} percentage={100} />
              <DRELine label="(-) Deduções da Receita" value={dreData.deducoes_receita} isNegative level={1} />
              <DRELine 
                label="Receita Líquida de Vendas" 
                value={dreData.receita_liquida} 
                percentage={100}
                isSubtotal 
              />
            </div>

            {/* CUSTOS */}
            <div className="mb-4">
              <h3 className="text-sm font-bold text-blue-300 mb-2 px-4">CUSTOS</h3>
              <DRELine 
                label="(-) Custo dos Produtos Vendidos" 
                value={dreData.cogs} 
                percentage={(dreData.cogs / dreData.receita_liquida) * 100}
                isNegative 
                level={1} 
              />
              <DRELine 
                label="Lucro Bruto" 
                value={dreData.lucro_bruto} 
                percentage={dreData.margem_bruta_percent}
                isSubtotal 
              />
            </div>

            {/* DESPESAS OPERACIONAIS */}
            <div className="mb-4">
              <h3 className="text-sm font-bold text-blue-300 mb-2 px-4">DESPESAS OPERACIONAIS</h3>
              <DRELine 
                label="(-) Despesas Administrativas" 
                value={dreData.despesas_administrativas} 
                isNegative 
                level={1} 
              />
              <DRELine 
                label="(-) Despesas Comerciais" 
                value={dreData.despesas_comerciais} 
                isNegative 
                level={1} 
              />
              <DRELine 
                label="(-) Despesas Gerais" 
                value={dreData.despesas_gerais} 
                isNegative 
                level={1} 
              />
              <DRELine 
                label="Total Despesas Operacionais" 
                value={dreData.total_despesas_operacionais} 
                percentage={(dreData.total_despesas_operacionais / dreData.receita_liquida) * 100}
                isNegative 
                isSubtotal 
              />
            </div>

            {/* RESULTADO OPERACIONAL */}
            <DRELine 
              label="Resultado Operacional" 
              value={dreData.resultado_operacional} 
              percentage={dreData.margem_operacional_percent}
              isTotal 
            />

            {/* RESULTADO FINAL */}
            <div className="mt-6 mb-4">
              <h3 className="text-sm font-bold text-blue-300 mb-2 px-4">RESULTADO FINAL</h3>
              <DRELine label="(+) Outras Receitas" value={dreData.outras_receitas} level={1} />
              <DRELine label="(-) Outras Despesas" value={dreData.outras_despesas} isNegative level={1} />
              <DRELine 
                label="Resultado Antes dos Impostos" 
                value={dreData.resultado_antes_imposto} 
                isSubtotal 
              />
              <DRELine 
                label="(-) Impostos sobre Lucro" 
                value={dreData.impostos_sobre_lucro} 
                isNegative 
                level={1} 
              />
              <DRELine 
                label="LUCRO LÍQUIDO DO PERÍODO" 
                value={dreData.lucro_liquido} 
                percentage={dreData.margem_liquida_percent}
                isTotal 
              />
            </div>

            {/* Resumo de margens */}
            <div className="mt-6 pt-4 border-t border-white/20 bg-white/5 rounded-lg p-4">
              <h4 className="text-sm font-bold text-yellow-300 mb-3">INDICADORES</h4>
              <div className="grid grid-cols-3 gap-4 text-xs">
                <div className="text-center">
                  <div className="text-gray-400">Margem Bruta</div>
                  <div className={cn(
                    "font-bold text-lg",
                    dreData.margem_bruta_percent > 30 ? "text-green-400" : "text-yellow-400"
                  )}>
                    {formatPercent(dreData.margem_bruta_percent)}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-gray-400">Margem Operacional</div>
                  <div className={cn(
                    "font-bold text-lg",
                    dreData.margem_operacional_percent > 15 ? "text-green-400" : 
                    dreData.margem_operacional_percent > 5 ? "text-yellow-400" : "text-red-400"
                  )}>
                    {formatPercent(dreData.margem_operacional_percent)}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-gray-400">Margem Líquida</div>
                  <div className={cn(
                    "font-bold text-lg",
                    dreData.margem_liquida_percent > 10 ? "text-green-400" : 
                    dreData.margem_liquida_percent > 5 ? "text-yellow-400" : "text-red-400"
                  )}>
                    {formatPercent(dreData.margem_liquida_percent)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}