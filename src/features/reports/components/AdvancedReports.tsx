/**
 * Advanced Reports Dashboard - Sprint 2
 * Comprehensive reporting system with multiple modules
 */

import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '@/shared/ui/primitives/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/primitives/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/shared/ui/primitives/dropdown-menu';
import { FileSpreadsheet, BarChart3, Users, Package, DollarSign, ChevronDown, Truck, TrendingUp } from 'lucide-react';
import { PageHeader } from '@/shared/ui/composite/PageHeader';
import { supabase } from '@/core/api/supabase/client';

// Novos Dashboards Refatorados
import { DeliveryPerformanceDashboard } from './DeliveryPerformanceDashboard';
import { InventoryHealthDashboard } from './InventoryHealthDashboard';
import { FinancialCashFlowDashboard } from './FinancialCashFlowDashboard';
import { CrmReportsSection } from './CrmReportsSection';

import { DateRangePicker } from '@/shared/ui/composite/DateRangePicker';
import { DateRange } from 'react-day-picker';
import { startOfMonth, startOfDay, endOfDay } from 'date-fns';

// ... imports ...

export const AdvancedReports: React.FC = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('sales'); // Default para Vendas & Delivery

  // Default to current month (consistent with DateRangePicker preset)
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfDay(new Date())
  });

  // Lê parâmetros da URL para navegação do dashboard
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const urlTab = searchParams.get('tab');
    const urlSection = searchParams.get('section');

    // Define a aba baseada no parâmetro 'tab'
    if (urlTab && ['sales', 'inventory', 'crm', 'financial'].includes(urlTab)) {
      setActiveTab(urlTab);
    }

    // Note: URL period sync removed for now, can be re-implemented with date ranges if needed

    // Scroll automático para seção específica baseado no parâmetro 'section'
    const targetId = urlSection || location.hash.substring(1); // Usa section ou hash
    if (targetId) {
      setTimeout(() => {
        const element = document.getElementById(targetId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Adicionar efeito de destaque
          element.style.animation = 'pulse 3s ease-in-out';
          element.style.boxShadow = '0 0 20px rgba(59, 130, 246, 0.5)';

          // Remover o efeito após 3 segundos
          setTimeout(() => {
            element.style.animation = '';
            element.style.boxShadow = '';
          }, 3000);
        }
      }, 500); // Delay para garantir que o componente foi renderizado
    }
  }, [location.search, location.hash]);

  // Função para exportar dados para CSV
  const exportToCSV = async (reportType: string) => {
    try {
      let data = [];
      let filename = '';

      switch (reportType) {
        case 'vendas': {
          const { data: salesData } = await supabase
            .from('sales')
            .select(`
              id,
              total,
              status,
              delivery_fee,
              created_at,
              customers(name, email),
              users(full_name)
            `);
          data = salesData || [];
          filename = 'vendas.csv';
          break;
        }

        case 'produtos': {
          const { data: productsData } = await supabase
            .from('products')
            .select('*');
          data = productsData || [];
          filename = 'produtos.csv';
          break;
        }

        case 'clientes': {
          const { data: customersData } = await supabase
            .from('customers')
            .select('*');
          data = customersData || [];
          filename = 'clientes.csv';
          break;
        }

        case 'estoque': {
          const startDate = dateRange?.from ? dateRange.from.toISOString() : subDays(new Date(), 90).toISOString();
          const endDate = dateRange?.to ? dateRange.to.toISOString() : new Date().toISOString();

          // Note: get_inventory_kpis might return a complex object now, not just a list of rows.
          // If the RPC returns { replenishment: [...], deadStock: [...], ... } we might need to choose what to export.
          // However, for CSV export, usually a flat list is expected.
          // If the RPC was updated to return a JSON object with multiple lists, this export might break.
          // Let's assume for now we want to export the 'replenishment' list or similar, OR if the RPC returns a set of rows.
          // Given the previous context, get_inventory_kpis likely returns a JSON with lists.
          // A better approach for "Exportar Estoque" might be to fetch the raw product data + sales data like useInventoryHealth does,
          // or just export the 'products' table for now to be safe, as the KPI structure is complex for a single CSV.

          // Fallback: Exportar tabela de produtos com status atual
          const { data: productsData } = await supabase
            .from('products')
            .select('id, name, stock_packages, stock_units_loose, minimum_stock, cost_price');

          data = productsData || [];
          filename = 'estoque.csv';
          break;
        }

        default:
          throw new Error('Tipo de relatório não suportado');
      }

      if (data.length === 0) {
        alert('Nenhum dado encontrado para exportar');
        return;
      }

      // Converter para CSV
      const headers = Object.keys(data[0]);
      const csvContent = [
        headers.join(','),
        ...data.map(row =>
          headers.map(header => {
            const value = row[header];
            // Tratar valores que podem conter vírgulas ou quebras de linha
            if (typeof value === 'string' && (value.includes(',') || value.includes('\n'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          }).join(',')
        )
      ].join('\n');

      // Download do arquivo
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (error) {
      console.error('Erro ao exportar CSV:', error);
      alert('Erro ao exportar dados. Tente novamente.');
    }
  };


  return (
    <div className="w-full min-h-full flex flex-col">
      {/* Header - altura fixa */}
      <PageHeader
        title="RELATÓRIOS ESTRATÉGICOS"
        description="Visão unificada de Vendas, Estoque e Financeiro."
      >
        {/* Controles globais */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
          {/* Filtro Global de Período (Smart Date Filter) */}
          <DateRangePicker
            date={dateRange}
            onDateChange={setDateRange}
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-10 bg-black/80 border-accent-gold-100/40 text-accent-gold-100 hover:bg-accent-gold-100/20 hover:shadow-xl hover:shadow-accent-gold-100/30 hover:border-accent-gold-100/80 hover:scale-105 backdrop-blur-sm transition-all duration-300 relative overflow-hidden group"
              >
                <div className="text-accent-gold-100 or bg-accent-gold-100" />
                <FileSpreadsheet className="h-4 w-4 mr-2 relative z-10 group-hover:animate-bounce" />
                <span className="relative z-10 font-medium">Exportar</span>
                <ChevronDown className="h-4 w-4 ml-2 relative z-10 group-hover:rotate-180 transition-transform duration-300" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 -translate-x-full group-hover:translate-x-full transform" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-black/95 border-accent-gold-100/20 backdrop-blur-md shadow-2xl shadow-accent-gold-100/10 animate-in fade-in-0 zoom-in-95 duration-300"
            >
              <DropdownMenuItem
                onClick={() => exportToCSV('vendas')}
                className="text-white hover:bg-blue-500/20 hover:text-blue-300 cursor-pointer transition-all duration-200 group"
              >
                <BarChart3 className="h-4 w-4 mr-2 text-blue-400 group-hover:scale-110 transition-transform duration-200" />
                <span className="group-hover:font-medium transition-all duration-200">Exportar Vendas</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => exportToCSV('produtos')}
                className="text-white hover:bg-green-500/20 hover:text-green-300 cursor-pointer transition-all duration-200 group"
              >
                <Package className="h-4 w-4 mr-2 text-green-400 group-hover:scale-110 transition-transform duration-200" />
                <span className="group-hover:font-medium transition-all duration-200">Exportar Produtos</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => exportToCSV('clientes')}
                className="text-white hover:bg-purple-500/20 hover:text-purple-300 cursor-pointer transition-all duration-200 group"
              >
                <Users className="h-4 w-4 mr-2 text-purple-400 group-hover:scale-110 transition-transform duration-200" />
                <span className="group-hover:font-medium transition-all duration-200">Exportar Clientes</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => exportToCSV('estoque')}
                className="text-white hover:bg-amber-500/20 hover:text-amber-300 cursor-pointer transition-all duration-200 group"
              >
                <Package className="h-4 w-4 mr-2 text-amber-400 group-hover:scale-110 transition-transform duration-200" />
                <span className="group-hover:font-medium transition-all duration-200">Exportar Estoque</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </PageHeader>

      {/* Container principal com glassmorphism - ocupa altura restante */}
      <div className="h-auto bg-black/80 backdrop-blur-sm border border-white/10 rounded-xl shadow-lg p-4 flex flex-col hover:shadow-2xl hover:shadow-purple-500/10 hover:border-purple-400/30 transition-all duration-300"
        onMouseMove={(e) => {
          const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * 100;
          const y = ((e.clientY - rect.top) / rect.height) * 100;
          (e.currentTarget as HTMLElement).style.setProperty("--x", `${x}%`);
          (e.currentTarget as HTMLElement).style.setProperty("--y", `${y}%`);
        }}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-black/80 border border-white/10 backdrop-blur-sm w-full justify-center grid grid-cols-4 gap-2 h-auto p-2">

            {/* 1. Vendas & Delivery */}
            <TabsTrigger
              value="sales"
              className="flex flex-col items-center gap-2 py-3 data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:border data-[state=active]:border-white/20 transition-all duration-300 hover:bg-white/5"
            >
              <Truck className="h-5 w-5" />
              <span className="text-xs sm:text-sm font-medium">Vendas & Delivery</span>
            </TabsTrigger>

            {/* 2. Saúde do Estoque */}
            <TabsTrigger
              value="inventory"
              className="flex flex-col items-center gap-2 py-3 data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:border data-[state=active]:border-white/20 transition-all duration-300 hover:bg-white/5"
            >
              <Package className="h-5 w-5" />
              <span className="text-xs sm:text-sm font-medium">Saúde do Estoque</span>
            </TabsTrigger>

            {/* 3. Fluxo de Caixa */}
            <TabsTrigger
              value="financial"
              className="flex flex-col items-center gap-2 py-3 data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:border data-[state=active]:border-white/20 transition-all duration-300 hover:bg-white/5"
            >
              <DollarSign className="h-5 w-5" />
              <span className="text-xs sm:text-sm font-medium">Fluxo de Caixa</span>
            </TabsTrigger>

            {/* 4. Clientes & CRM */}
            <TabsTrigger
              value="crm"
              className="flex flex-col items-center gap-2 py-3 data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:border data-[state=active]:border-white/20 transition-all duration-300 hover:bg-white/5"
            >
              <Users className="h-5 w-5" />
              <span className="text-xs sm:text-sm font-medium">Clientes & CRM</span>
            </TabsTrigger>

          </TabsList>

          <TabsContent value="sales" className="space-y-6 mt-6">
            <DeliveryPerformanceDashboard dateRange={dateRange} />
          </TabsContent>

          <TabsContent value="inventory" className="space-y-6 mt-6">
            <InventoryHealthDashboard dateRange={dateRange} />
          </TabsContent>

          <TabsContent value="financial" className="space-y-6 mt-6">
            <FinancialCashFlowDashboard dateRange={dateRange} />
          </TabsContent>

          <TabsContent value="crm" className="space-y-6 mt-6">
            <CrmReportsSection dateRange={dateRange} />
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
};