/**
 * Advanced Reports Dashboard - Sprint 2
 * Comprehensive reporting system with multiple modules
 */

import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { Button } from '@/shared/ui/primitives/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/primitives/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/shared/ui/primitives/dropdown-menu';
import { CalendarIcon, FileSpreadsheet, BarChart3, Users, Package, DollarSign, ChevronDown, Calendar, Truck } from 'lucide-react';
import { BlurIn } from '@/shared/ui/effects/blur-in';
import { getSFProTextClasses, getHeaderTextClasses } from '@/core/config/theme-utils';
import { supabase } from '@/core/api/supabase/client';
import { SalesReportsSection } from './SalesReportsSection';
import { InventoryReportsSection } from './InventoryReportsSection';
import { CrmReportsSection } from './CrmReportsSection';
import { FinancialReportsSection } from './FinancialReportsSection';
import { ExpiryReportsSection } from './ExpiryReportsSection';
import { DeliveryVsPresencialReport } from './DeliveryVsPresencialReport';

export const AdvancedReports: React.FC = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('sales');
  const [globalPeriod, setGlobalPeriod] = useState(90);

  // Lê parâmetros da URL para navegação do dashboard
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const urlTab = searchParams.get('tab');
    const urlPeriod = searchParams.get('period');
    const urlSection = searchParams.get('section');

    // Define a aba baseada no parâmetro 'tab'
    if (urlTab && ['sales', 'inventory', 'crm', 'financial', 'expiry', 'delivery'].includes(urlTab)) {
      setActiveTab(urlTab);
    }

    // Define o período baseado no parâmetro 'period'
    if (urlPeriod) {
      const period = parseInt(urlPeriod);
      if ([7, 30, 90, 180].includes(period)) {
        setGlobalPeriod(period);
      }
    }

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
        case 'vendas':
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

        case 'produtos':
          const { data: productsData } = await supabase
            .from('products')
            .select('*');
          data = productsData || [];
          filename = 'produtos.csv';
          break;

        case 'clientes':
          const { data: customersData } = await supabase
            .from('customers')
            .select('*');
          data = customersData || [];
          filename = 'clientes.csv';
          break;

        case 'estoque':
          const { data: inventoryData } = await supabase
            .rpc('get_inventory_kpis', { window_days: 90 });
          data = inventoryData || [];
          filename = 'estoque.csv';
          break;

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
    <div className="w-full h-full flex flex-col p-4">
      {/* Header padronizado */}
      <div className="flex-shrink-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        {/* Header com BlurIn animation */}
        <div className="relative text-center sm:text-left">
          {/* Título animado */}
          <BlurIn
            word="RELATÓRIOS CENTRAIS"
            duration={1.2}
            variant={{
              hidden: { filter: "blur(15px)", opacity: 0 },
              visible: { filter: "blur(0px)", opacity: 1 }
            }}
            className={`${getHeaderTextClasses('main')} text-transparent bg-clip-text bg-gradient-to-r from-[#FF2400] via-[#FFDA04] to-[#FF2400] drop-shadow-lg`}
            style={{
              textShadow: '0 2px 4px rgba(0,0,0,0.3), 0 0 20px rgba(255, 218, 4, 0.2)'
            }}
          />
          
          {/* Sublinhado elegante */}
          <div className="w-full h-2 relative">
            <div className="absolute inset-x-0 top-0 bg-gradient-to-r from-transparent via-[#FF2400]/80 to-transparent h-[2px] w-full blur-sm" />
            <div className="absolute inset-x-0 top-0 bg-gradient-to-r from-transparent via-[#FF2400] to-transparent h-px w-full" />
            <div className="absolute inset-x-0 top-0 bg-gradient-to-r from-transparent via-[#FFDA04]/80 to-transparent h-[3px] w-3/4 blur-sm mx-auto" />
            <div className="absolute inset-x-0 top-0 bg-gradient-to-r from-transparent via-[#FFDA04] to-transparent h-px w-3/4 mx-auto" />
          </div>
          
        </div>
        
        {/* Controles globais */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
          {/* Filtro Global de Período */}
          <div 
            className="relative flex items-center gap-2 h-10 px-3 py-2 bg-black/80 rounded-lg border border-white/10 backdrop-blur-sm hover:shadow-2xl hover:shadow-purple-500/10 hover:border-purple-400/30 transition-all duration-300 group"
            onMouseMove={(e) => {
              const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
              const x = ((e.clientX - rect.left) / rect.width) * 100;
              const y = ((e.clientY - rect.top) / rect.height) * 100;
              (e.currentTarget as HTMLElement).style.setProperty("--x", `${x}%`);
              (e.currentTarget as HTMLElement).style.setProperty("--y", `${y}%`);
            }}
          >
            <span className="text-sm text-white/70 font-medium">Período:</span>
            {[7, 30, 90, 180].map((days) => (
              <Button
                key={days}
                variant={globalPeriod === days ? "default" : "outline"}
                size="sm"
                onClick={() => setGlobalPeriod(days)}
                className={`${
                  globalPeriod === days 
                    ? "bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black font-bold shadow-lg shadow-[#FFD700]/30 scale-105 border-0" 
                    : "border-white/30 text-white hover:bg-white/20 hover:border-white/50 hover:scale-105 hover:shadow-md"
                } backdrop-blur-sm transition-all duration-300 relative overflow-hidden group`}
              >
                <span className="relative z-10">{days}d</span>
                {globalPeriod === days && (
                  <div className="absolute inset-0 bg-gradient-to-r from-[#FFD700]/20 to-[#FFA500]/20 animate-pulse" />
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 -translate-x-full group-hover:translate-x-full transform" />
              </Button>
            ))}
            {/* Purple glow effect */}
            <div 
              className="absolute inset-0 rounded-lg bg-gradient-to-br from-purple-500/20 via-transparent to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{
                background: `radial-gradient(600px circle at var(--x, 50%) var(--y, 50%), rgba(147, 51, 234, 0.15), transparent 40%)`
              }}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline"
                size="sm"
                className="h-10 bg-black/80 border-[#FFD700]/40 text-[#FFD700] hover:bg-[#FFD700]/20 hover:shadow-xl hover:shadow-[#FFD700]/30 hover:border-[#FFD700]/80 hover:scale-105 backdrop-blur-sm transition-all duration-300 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#FFD700]/5 via-[#FFD700]/10 to-[#FFD700]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <FileSpreadsheet className="h-4 w-4 mr-2 relative z-10 group-hover:animate-bounce" />
                <span className="relative z-10 font-medium">Exportar</span>
                <ChevronDown className="h-4 w-4 ml-2 relative z-10 group-hover:rotate-180 transition-transform duration-300" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 -translate-x-full group-hover:translate-x-full transform" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="bg-black/95 border-[#FFD700]/20 backdrop-blur-md shadow-2xl shadow-[#FFD700]/10 animate-in fade-in-0 zoom-in-95 duration-300"
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
      </div>


      {/* Container principal com glassmorphism */}
      <section 
        className="bg-black/80 backdrop-blur-sm border border-white/10 rounded-xl shadow-lg p-4 hover:shadow-2xl hover:shadow-purple-500/10 hover:border-purple-400/30 transition-all duration-300"
        onMouseMove={(e) => {
          const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * 100;
          const y = ((e.clientY - rect.top) / rect.height) * 100;
          (e.currentTarget as HTMLElement).style.setProperty("--x", `${x}%`);
          (e.currentTarget as HTMLElement).style.setProperty("--y", `${y}%`);
        }}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-black/80 border border-white/10 backdrop-blur-sm w-full justify-center">
            <TabsTrigger 
              value="sales"
              className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-300 data-[state=active]:border data-[state=active]:border-blue-400/30 transition-all duration-300"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Vendas & Performance
            </TabsTrigger>
            <TabsTrigger 
              value="delivery"
              className="data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-300 data-[state=active]:border data-[state=active]:border-orange-400/30 transition-all duration-300"
            >
              <Truck className="h-4 w-4 mr-2" />
              Delivery vs Presencial
            </TabsTrigger>
            <TabsTrigger 
              value="inventory"
              className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-300 data-[state=active]:border data-[state=active]:border-green-400/30 transition-all duration-300"
            >
              <Package className="h-4 w-4 mr-2" />
              Estoque & Produtos
            </TabsTrigger>
            <TabsTrigger 
              value="crm"
              className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300 data-[state=active]:border data-[state=active]:border-purple-400/30 transition-all duration-300"
            >
              <Users className="h-4 w-4 mr-2" />
              Clientes & CRM
            </TabsTrigger>
            <TabsTrigger 
              value="financial"
              className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-300 data-[state=active]:border data-[state=active]:border-amber-400/30 transition-all duration-300"
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Financeiro & Fluxo
            </TabsTrigger>
            <TabsTrigger 
              value="expiry"
              className="data-[state=active]:bg-red-500/20 data-[state=active]:text-red-300 data-[state=active]:border data-[state=active]:border-red-400/30 transition-all duration-300"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Vencimento & Validade
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sales" className="space-y-6 mt-6">
            <SalesReportsSection period={globalPeriod} />
          </TabsContent>

          <TabsContent value="delivery" className="space-y-6 mt-6">
            <DeliveryVsPresencialReport />
          </TabsContent>

          <TabsContent value="inventory" className="space-y-6 mt-6">
            <InventoryReportsSection period={globalPeriod} />
          </TabsContent>

          <TabsContent value="crm" className="space-y-6 mt-6">
            <CrmReportsSection period={globalPeriod} />
          </TabsContent>

          <TabsContent value="financial" className="space-y-6 mt-6">
            <FinancialReportsSection period={globalPeriod} />
          </TabsContent>

          <TabsContent value="expiry" className="space-y-6 mt-6">
            <ExpiryReportsSection />
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
};