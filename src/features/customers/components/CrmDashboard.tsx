/**
 * Dashboard CRM Dedicado - Análise Completa de Clientes
 * Sistema empresarial com métricas avançadas e visualizações
 */

import React, { useState, useMemo } from 'react';
import { Button } from '@/shared/ui/primitives/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/primitives/tabs';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/primitives/dropdown-menu';
import { PageHeader } from '@/shared/ui/composite/PageHeader';
import {
  Users,
  MessageSquare,
  BarChart3,
  Search,
  Download,
  ChevronDown,
  MapPin
} from 'lucide-react';

import { useCustomers } from '@/features/customers/hooks/use-crm';
import { useCrmTrends } from '@/features/customers/hooks/useCrmTrends';
import { useCrmMetrics } from '@/features/customers/hooks/useCrmMetrics';
import { BirthdayCalendar } from './BirthdayCalendar';
import { supabase } from '@/core/api/supabase/client';
import { chartTheme } from '@/shared/ui/composite/ChartTheme';

// Import extracted components
import { CrmStatsCards } from './dashboard/CrmStatsCards';
import { CustomerTrendsChart } from './dashboard/CustomerTrendsChart';
import { AtRiskCustomersList } from './dashboard/AtRiskCustomersList';
import { SegmentDistributionCharts } from './dashboard/SegmentDistributionCharts';
import { MaintenancePlaceholder } from './dashboard/MaintenancePlaceholder';

// Usar paleta padronizada para CRM
const COLORS = chartTheme.crm;

interface SegmentData {
  segment: string;
  count: number;
  ltv: number;
  percentage: number;
  color: string;
}

export const CrmDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState(30);
  const [activeTab, setActiveTab] = useState('overview');

  // Buscar dados de clientes
  const { data: customers = [], isLoading } = useCustomers();

  // Buscar métricas dinâmicas baseadas no período selecionado
  const { metrics, customersAtRisk, isLoading: isLoadingMetrics } = useCrmMetrics(selectedPeriod);

  // Buscar dados reais de tendências com período dinâmico
  const { data: trendsData = [], isLoading: isLoadingTrends, error: trendsError } = useCrmTrends(selectedPeriod);

  // Funções de navegação para os KPIs
  const handleTotalCustomersClick = () => {
    navigate('/reports?tab=crm&section=total-clientes&period=' + selectedPeriod);
  };

  const handleLtvClick = () => {
    navigate('/reports?tab=crm&section=ltv&period=' + selectedPeriod);
  };

  const handleBirthdaysClick = () => {
    navigate('/reports?tab=crm&section=aniversarios&period=30'); // Aniversários sempre próximos 30 dias
  };

  const handleRiskClick = () => {
    navigate('/reports?tab=crm&section=clientes-risco&period=' + selectedPeriod);
  };

  // Função de exportação CSV
  const exportToCSV = async (type: string) => {
    try {
      let data: Record<string, unknown>[] = [];
      let filename = '';

      switch (type) {
        case 'clientes':
          data = customers as unknown as Record<string, unknown>[];
          filename = 'clientes-crm.csv';
          break;

        case 'interacoes': {
          const { data: interactionsData } = await supabase
            .from('customer_interactions')
            .select('*');
          data = (interactionsData || []) as unknown as Record<string, unknown>[];
          filename = 'interacoes-clientes.csv';
          break;
        }

        case 'vendas': {
          const { data: salesData } = await supabase
            .from('sales')
            .select('*')
            .not('customer_id', 'is', null);
          data = (salesData || []) as unknown as Record<string, unknown>[];
          filename = 'vendas-clientes.csv';
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
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Erro ao exportar:', error);
      alert('Erro ao exportar dados. Tente novamente.');
    }
  };

  // Dados por segmento
  const segmentData = useMemo((): SegmentData[] => {
    const segmentMap = new Map<string, { count: number; ltv: number }>();

    customers.forEach(customer => {
      const segment = customer.segment || 'Novo';
      const existing = segmentMap.get(segment) || { count: 0, ltv: 0 };
      segmentMap.set(segment, {
        count: existing.count + 1,
        ltv: existing.ltv + (customer.lifetime_value || 0)
      });
    });

    const totalCustomers = customers.length;
    return Array.from(segmentMap.entries()).map(([segment, data], index) => ({
      segment,
      count: data.count,
      ltv: data.ltv,
      percentage: totalCustomers > 0 ? (data.count / totalCustomers) * 100 : 0,
      color: COLORS[index % COLORS.length]
    })).sort((a, b) => b.count - a.count);
  }, [customers]);

  if (isLoading || isLoadingTrends || isLoadingMetrics) {
    return (
      <div className="w-full h-full flex flex-col p-4">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Carregando dashboard CRM...</p>
            <p className="text-gray-500 text-sm mt-2">
              {isLoading && "Carregando clientes..."}
              {isLoadingTrends && "Carregando tendências..."}
              {isLoadingMetrics && "Calculando métricas..."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col p-4">
      {/* Header padronizado com PageHeader */}
      <PageHeader
        title="DASHBOARD CRM"
        count={metrics.totalCustomers}
        countLabel="clientes"
      >
        {/* Filtro de Período */}
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
              variant={selectedPeriod === days ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPeriod(days)}
              className="text-accent-gold-100 or bg-accent-gold-100"
            >
              <span className="relative z-10">{days}d</span>
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

        {/* Botão de Exportação */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-10 bg-black/80 border-accent-gold-100/40 text-accent-gold-100 hover:bg-accent-gold-100/20 hover:shadow-xl hover:shadow-accent-gold-100/30 hover:border-accent-gold-100/80 hover:scale-105 backdrop-blur-sm transition-all duration-300 relative overflow-hidden group"
            >
              <div className="text-accent-gold-100 or bg-accent-gold-100" />
              <Download className="h-4 w-4 mr-2 relative z-10 group-hover:animate-bounce" />
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
              onClick={() => exportToCSV('clientes')}
              className="text-white hover:bg-purple-500/20 hover:text-purple-300 cursor-pointer transition-all duration-200 group"
            >
              <Users className="h-4 w-4 mr-2 text-purple-400 group-hover:scale-110 transition-transform duration-200" />
              <span className="group-hover:font-medium transition-all duration-200">Exportar Clientes</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => exportToCSV('interacoes')}
              className="text-white hover:bg-green-500/20 hover:text-green-300 cursor-pointer transition-all duration-200 group"
            >
              <MessageSquare className="h-4 w-4 mr-2 text-green-400 group-hover:scale-110 transition-transform duration-200" />
              <span className="group-hover:font-medium transition-all duration-200">Exportar Interações</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => exportToCSV('vendas')}
              className="text-white hover:bg-amber-500/20 hover:text-amber-300 cursor-pointer transition-all duration-200 group"
            >
              <BarChart3 className="h-4 w-4 mr-2 text-amber-400 group-hover:scale-110 transition-transform duration-200" />
              <span className="group-hover:font-medium transition-all duration-200">Exportar Vendas</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </PageHeader>

      {/* Container principal com glassmorphism */}
      <section
        className="bg-black/80 backdrop-blur-sm border border-white/10 rounded-xl shadow-lg p-4 hover:shadow-2xl hover:shadow-purple-500/10 hover:border-purple-400/30 transition-all duration-300 flex-1 space-y-6"
        onMouseMove={(e) => {
          const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * 100;
          const y = ((e.clientY - rect.top) / rect.height) * 100;
          (e.currentTarget as HTMLElement).style.setProperty("--x", `${x}%`);
          (e.currentTarget as HTMLElement).style.setProperty("--y", `${y}%`);
        }}
      >

        {/* Métricas Principais */}
        <CrmStatsCards
          metrics={metrics}
          selectedPeriod={selectedPeriod}
          onTotalCustomersClick={handleTotalCustomersClick}
          onLtvClick={handleLtvClick}
          onBirthdaysClick={handleBirthdaysClick}
          onRiskClick={handleRiskClick}
        />

        {/* Tabs para diferentes visões */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 bg-black/40 border border-white/20 backdrop-blur-sm rounded-xl">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-accent-gold-100 data-[state=active]:text-black data-[state=active]:shadow-lg data-[state=active]:shadow-accent-gold-100/30 text-white hover:bg-white/10 transition-all duration-200"
            >
              Visão Geral
            </TabsTrigger>
            <TabsTrigger
              value="segments"
              className="data-[state=active]:bg-accent-gold-100 data-[state=active]:text-black data-[state=active]:shadow-lg data-[state=active]:shadow-accent-gold-100/30 text-white hover:bg-white/10 transition-all duration-200"
            >
              Segmentação
            </TabsTrigger>
            <TabsTrigger
              value="calendar"
              className="data-[state=active]:bg-accent-gold-100 data-[state=active]:text-black data-[state=active]:shadow-lg data-[state=active]:shadow-accent-gold-100/30 text-white hover:bg-white/10 transition-all duration-200"
            >
              Calendário
            </TabsTrigger>
            <TabsTrigger
              value="maps"
              className="data-[state=active]:bg-accent-gold-100 data-[state=active]:text-black data-[state=active]:shadow-lg data-[state=active]:shadow-accent-gold-100/30 text-white hover:bg-white/10 transition-all duration-200"
            >
              Mapas & IA
            </TabsTrigger>
          </TabsList>

          {/* Tab: Overview */}
          <TabsContent value="overview" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Gráfico de Tendências */}
              <CustomerTrendsChart
                data={trendsData}
                isLoading={isLoadingTrends}
                error={trendsError}
              />

              {/* Lista de Clientes em Risco */}
              <AtRiskCustomersList customers={customersAtRisk} />
            </div>
          </TabsContent>

          {/* Tab: Segmentação */}
          <TabsContent value="segments" className="mt-6">
            <SegmentDistributionCharts segmentData={segmentData} />
          </TabsContent>

          {/* Tab: Calendário de Aniversários */}
          <TabsContent value="calendar" className="mt-6">
            <BirthdayCalendar showActions={true} />
          </TabsContent>

          {/* Tab: Mapas & IA */}
          <TabsContent value="maps" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Google Maps Placeholder */}
              <MaintenancePlaceholder
                title="Mapa de Distribuição"
                description="Visualização geográfica dos clientes com clusters por região e análise de densidade"
                icon={MapPin}
              />
            </div>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
};