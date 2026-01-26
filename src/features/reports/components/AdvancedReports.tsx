/**
 * Advanced Reports Dashboard - Stitch Design System
 * Comprehensive reporting system with multiple modules
 */

import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '@/shared/ui/primitives/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/primitives/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/shared/ui/primitives/dropdown-menu';
import { FileSpreadsheet, BarChart3, Users, Package, DollarSign, ChevronDown, Truck, TrendingUp, Download, CalendarRange } from 'lucide-react';
import { StandardPageHeader } from '@/shared/ui/composite/StandardPageHeader';
import { supabase } from '@/core/api/supabase/client';

// Novos Dashboards Refatorados
import { DeliveryPerformanceDashboard } from './DeliveryPerformanceDashboard';
import { InventoryHealthDashboard } from './InventoryHealthDashboard';
import { FinancialCashFlowDashboard } from './FinancialCashFlowDashboard';
import { CrmReportsSection } from './CrmReportsSection';

import { DatePickerWithRange } from '@/shared/ui/composite/date-range-picker';
import { DateRange } from 'react-day-picker';
import { startOfMonth, endOfDay, subDays } from 'date-fns';
import { PremiumBackground } from '@/shared/ui/composite/PremiumBackground';
import { cn } from '@/core/config/utils';

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

    // Scroll automático para seção específica baseado no parâmetro 'section'
    const targetId = urlSection || location.hash.substring(1); 
    if (targetId) {
      setTimeout(() => {
        const element = document.getElementById(targetId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.style.animation = 'pulse 3s ease-in-out';
          element.style.boxShadow = '0 0 20px rgba(59, 130, 246, 0.5)';
          setTimeout(() => {
            element.style.animation = '';
            element.style.boxShadow = '';
          }, 3000);
        }
      }, 500);
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
              id, total, status, delivery_fee, created_at,
              customers(name, email), users(full_name)
            `);
          data = salesData || [];
          filename = 'vendas.csv';
          break;
        }
        case 'produtos': {
          const { data: productsData } = await supabase.from('products').select('*');
          data = productsData || [];
          filename = 'produtos.csv';
          break;
        }
        case 'clientes': {
          const { data: customersData } = await supabase.from('customers').select('*');
          data = customersData || [];
          filename = 'clientes.csv';
          break;
        }
        case 'estoque': {
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
            if (typeof value === 'string' && (value.includes(',') || value.includes('\n'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          }).join(',')
        )
      ].join('\n');

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
    <div className="w-full min-h-screen relative bg-adega-charcoal text-white overflow-hidden flex flex-col">
       <PremiumBackground />
      
      {/* Header Standard */}
      {/* Header Standardized with Inventory/Suppliers */}
      <header className="flex-none px-8 py-6 pt-8 pb-6 z-10 leading-none">
          <div className="flex flex-wrap justify-between items-end gap-4 mb-4">
             <div className="flex flex-col gap-1">
               <p className="text-zinc-500 text-sm font-medium tracking-widest uppercase">Módulo de Inteligência</p>
               <h2 className="text-white text-3xl md:text-4xl font-bold leading-tight tracking-tight">RELATÓRIOS ESSENSIAIS</h2>
             </div>
             
             {/* Controles do Header */}
             <div className="flex items-center gap-3">
                 {/* Date Picker Standardized */}
                 <DatePickerWithRange 
                     date={dateRange}
                     setDate={setDateRange}
                 />

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="h-10 border-white/10 bg-black/40 text-muted-foreground hover:text-primary hover:border-primary/50 transition-all">
                        <Download className="h-4 w-4 mr-2" />
                        Exportar
                        <ChevronDown className="h-3 w-3 ml-2 opacity-50" />
                    </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-black/90 border-white/10 backdrop-blur-xl">
                        <DropdownMenuItem onClick={() => exportToCSV('vendas')} className="cursor-pointer hover:bg-white/5 hover:text-primary">
                            <Truck className="h-4 w-4 mr-2" /> Vendas
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => exportToCSV('estoque')} className="cursor-pointer hover:bg-white/5 hover:text-primary">
                            <Package className="h-4 w-4 mr-2" /> Estoque
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => exportToCSV('financeiro')} className="cursor-pointer hover:bg-white/5 hover:text-primary">
                            <DollarSign className="h-4 w-4 mr-2" /> Financeiro
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => exportToCSV('clientes')} className="cursor-pointer hover:bg-white/5 hover:text-primary">
                            <Users className="h-4 w-4 mr-2" /> Clientes
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
          </div>
      </header>

      <div className="flex-1 px-8 pb-8 overflow-y-auto custom-scrollbar z-10">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            {/* Pill-style Tabs List (Standardized with Inventory/Movimentações) */}
            <TabsList className="inline-flex p-1 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm h-auto w-auto gap-1">
                {[
                    { id: 'sales', label: 'Vendas & Delivery', icon: Truck },
                    { id: 'inventory', label: 'Saúde do Estoque', icon: Package },
                    { id: 'financial', label: 'Fluxo de Caixa', icon: DollarSign },
                    { id: 'crm', label: 'Clientes & CRM', icon: Users },
                ].map((tab) => (
                    <TabsTrigger
                        key={tab.id}
                        value={tab.id}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all h-auto cursor-pointer",
                            "data-[state=active]:bg-[#f9cb15] data-[state=active]:text-black data-[state=active]:shadow-lg data-[state=active]:font-bold",
                            "data-[state=inactive]:text-zinc-400 data-[state=inactive]:hover:text-white data-[state=inactive]:hover:bg-white/5 data-[state=inactive]:font-medium",
                            "border-0 ring-0 outline-none focus-visible:ring-0 data-[state=active]:shadow-[0_0_15px_rgba(249,203,21,0.3)]"
                        )}
                    >
                        <tab.icon className="h-4 w-4" />
                        {tab.label}
                    </TabsTrigger>
                ))}
            </TabsList>

          <TabsContent value="sales" className="space-y-6 animate-in slide-in-from-bottom-2 duration-500">
            <DeliveryPerformanceDashboard dateRange={dateRange} />
          </TabsContent>

          <TabsContent value="inventory" className="space-y-6 animate-in slide-in-from-bottom-2 duration-500">
            <InventoryHealthDashboard dateRange={dateRange} />
          </TabsContent>

          <TabsContent value="financial" className="space-y-6 animate-in slide-in-from-bottom-2 duration-500">
            <FinancialCashFlowDashboard dateRange={dateRange} />
          </TabsContent>

          <TabsContent value="crm" className="space-y-6 animate-in slide-in-from-bottom-2 duration-500">
            <CrmReportsSection dateRange={dateRange} />
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
};