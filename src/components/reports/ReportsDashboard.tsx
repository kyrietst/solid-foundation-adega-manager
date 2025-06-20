import { useState, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Download, Calendar, Filter, BarChart2, Users, Package, DollarSign } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { addDays, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { SalesReports } from './SalesReports';
import { InventoryReports } from './InventoryReports';
import { CustomerReports } from './CustomerReports';
import { FinancialReports } from './FinancialReports';
import { useReportFilters } from '@/hooks/reports/useReportFilters';
import { useReportData } from '@/hooks/reports/useReportData';

type ReportTab = 'overview' | 'sales' | 'inventory' | 'customers' | 'financial';

export const ReportsDashboard = () => {
  const [activeTab, setActiveTab] = useState<ReportTab>('overview');
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // Inicializa os filtros
  const {
    filters,
    setFilters,
    periodOptions,
    categoryOptions,
    sellerOptions,
    paymentMethodOptions,
    updatePeriod,
  } = useReportFilters();

  // Busca os dados dos relatórios
  const {
    salesData,
    inventoryData,
    customerData,
    financialData,
    isLoading,
    error,
  } = useReportData(filters);

  // Manipuladores de eventos
  const handleTabChange = (value: string) => {
    setActiveTab(value as ReportTab);
  };

  const handleDateRangeSelect = (range: DateRange | undefined) => {
    setDateRange(range);
    if (range?.from && range?.to) {
      setShowDatePicker(false);
    }
  };

  const handleFilterChange = useCallback((key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  }, [setFilters]);

  const handleExport = () => {
    // Implementar lógica de exportação
    console.log('Exporting report', { activeTab, dateRange, filters });
  };

  // Formata o intervalo de datas para exibição
  const formatDateRange = () => {
    if (dateRange?.from && dateRange?.to) {
      return (
        <>
          {format(dateRange.from, 'dd MMM yyyy', { locale: ptBR })} -{' '}
          {format(dateRange.to, 'dd MMM yyyy', { locale: ptBR })}
        </>
      );
    }
    return 'Selecione um período';
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
          <p className="text-muted-foreground">
            Análise completa do desempenho do seu negócio
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleExport} disabled={isLoading}>
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-card rounded-lg border p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Seletor de Período */}
          <div className="flex-1">
            <label className="text-sm font-medium mb-1 block">Período</label>
            <Popover open={showDatePicker} onOpenChange={setShowDatePicker}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !dateRange && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      formatDateRange()
                    ) : (
                      format(dateRange.from, 'PPP', { locale: ptBR })
                    )
                  ) : (
                    <span>Selecione um período</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={handleDateRangeSelect}
                  numberOfMonths={2}
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Seletor de Granularidade */}
          <div className="flex-1">
            <label className="text-sm font-medium mb-1 block">Granularidade</label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={filters.periodType}
              onChange={(e) => updatePeriod(e.target.value as any)}
            >
              {periodOptions.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>

          {/* Filtro de Categoria */}
          <div className="flex-1">
            <label className="text-sm font-medium mb-1 block">Categoria</label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
            >
              <option value="">Todas as categorias</option>
              {categoryOptions.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro de Vendedor */}
          <div className="flex-1">
            <label className="text-sm font-medium mb-1 block">Vendedor</label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={filters.seller}
              onChange={(e) => handleFilterChange('seller', e.target.value)}
            >
              <option value="">Todos os vendedores</option>
              {sellerOptions.map((seller) => (
                <option key={seller.value} value={seller.value}>
                  {seller.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Conteúdo dos Relatórios */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 max-w-3xl">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="sales">Vendas</TabsTrigger>
          <TabsTrigger value="inventory">Estoque</TabsTrigger>
          <TabsTrigger value="customers">Clientes</TabsTrigger>
          <TabsTrigger value="financial">Financeiro</TabsTrigger>
        </TabsList>

        {/* Visão Geral */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Vendas do Período</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? '--' : `R$ ${(salesData?.salesMetrics.total_sales || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                </div>
                <p className="text-xs text-muted-foreground">
                  {salesData?.salesMetrics.total_orders || 0} pedidos realizados
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Clientes Ativos</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? '--' : customerData?.total_customers || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {customerData?.new_customers || 0} novos clientes
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Situação do Estoque</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? '--' : inventoryData?.out_of_stock || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {inventoryData?.low_stock || 0} produtos com estoque baixo
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Vendas por Categoria</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                {isLoading ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="animate-pulse">Carregando gráfico...</div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center bg-muted/30 rounded-md">
                    <p className="text-muted-foreground">Gráfico de Vendas por Categoria</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Produtos</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : salesData?.top_products && salesData.top_products.length > 0 ? (
                  <div className="space-y-4">
                    {salesData.top_products.slice(0, 5).map((product) => (
                      <div key={product.id} className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-muted-foreground">{product.category}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">
                            {product.quantity_sold} un.
                          </div>
                          <div className="text-sm text-muted-foreground">
                            R$ {product.total_revenue.toFixed(2).replace('.', ',')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhum dado de produto disponível
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Relatório de Vendas */}
        <TabsContent value="sales">
          <SalesReports 
            salesMetrics={salesData?.salesMetrics}
            salesByCategory={salesData?.sales_by_category || []}
            salesByPaymentMethod={salesData?.payment_methods || []}
            salesTrend={salesData?.sales_trend || []}
            topProducts={salesData?.top_products || []}
            isLoading={isLoading}
            onExport={handleExport}
          />
        </TabsContent>

        {/* Relatório de Estoque */}
        <TabsContent value="inventory">
          <InventoryReports 
            inventoryMetrics={inventoryData}
            stockMovements={inventoryData?.recent_movements || []}
            lowStockProducts={inventoryData?.low_stock_products || []}
            isLoading={isLoading}
            onExport={handleExport}
          />
        </TabsContent>

        {/* Relatório de Clientes */}
        <TabsContent value="customers">
          <CustomerReports 
            customerMetrics={customerData}
            topCustomers={customerData?.top_customers || []}
            customerAcquisition={customerData?.acquisition || []}
            customerSegments={customerData?.segments || []}
            isLoading={isLoading}
            onExport={handleExport}
          />
        </TabsContent>

        {/* Relatório Financeiro */}
        <TabsContent value="financial">
          <FinancialReports 
            financialMetrics={financialData}
            revenueByCategory={financialData?.revenue_by_category || []}
            expensesByCategory={financialData?.expenses_by_category || []}
            paymentMethods={financialData?.payment_methods || []}
            financialTrends={financialData?.trends || []}
            isLoading={isLoading}
            onExport={handleExport}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
