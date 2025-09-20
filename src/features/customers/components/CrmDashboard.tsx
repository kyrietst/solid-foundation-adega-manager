/**
 * Dashboard CRM Dedicado - Análise Completa de Clientes
 * Sistema empresarial com métricas avançadas e visualizações
 */

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { Badge } from '@/shared/ui/primitives/badge';
import { Button } from '@/shared/ui/primitives/button';
import { Input } from '@/shared/ui/primitives/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/primitives/tabs';
import { useNavigate } from 'react-router-dom';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/primitives/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/primitives/dropdown-menu';
import { cn } from '@/core/config/utils';
import { formatCurrency } from '@/core/config/utils';
import { StatCard } from '@/shared/ui/composite/stat-card';
import { PageHeader } from '@/shared/ui/composite/PageHeader';
import {
  Users,
  TrendingUp,
  DollarSign,
  Calendar,
  AlertTriangle,
  Gift,
  MapPin,
  Settings,
  Sparkles,
  MessageSquare,
  PieChart,
  BarChart3,
  Target,
  Clock,
  Filter,
  Search,
  Download,
  RefreshCw,
  FileSpreadsheet,
  ChevronDown,
  Package
} from 'lucide-react';
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import { useCustomers } from '@/features/customers/hooks/use-crm';
import { useCrmTrends } from '@/features/customers/hooks/useCrmTrends';
import { useCrmMetrics } from '@/features/customers/hooks/useCrmMetrics';
import { BirthdayCalendar } from './BirthdayCalendar';
import { supabase } from '@/core/api/supabase/client';
import { chartTheme } from '@/shared/ui/composite/ChartTheme';

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
  const [selectedSegment, setSelectedSegment] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
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
          data = customers;
          filename = 'clientes-crm.csv';
          break;

        case 'insights': {
          const { data: insightsData } = await supabase
            .from('customer_insights')
            .select('*');
          data = insightsData || [];
          filename = 'insights-clientes.csv';
          break;
        }

        case 'interacoes': {
          const { data: interactionsData } = await supabase
            .from('customer_interactions')
            .select('*');
          data = interactionsData || [];
          filename = 'interacoes-clientes.csv';
          break;
        }

        case 'vendas': {
          const { data: salesData } = await supabase
            .from('sales')
            .select('*')
            .not('customer_id', 'is', null);
          data = salesData || [];
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
  
  // Métricas são calculadas dinamicamente pelo hook useCrmMetrics baseado no período

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

  // Clientes em risco são calculados dinamicamente pelo hook useCrmMetrics

  // DADOS REAIS: tendências são buscadas via useCrmTrends() hook

  // Próximos aniversários
  const upcomingBirthdaysList = useMemo(() => {
    const now = new Date();
    return customers
      .filter(c => c.birthday)
      .map(customer => {
        const birthDate = new Date(customer.birthday!);
        const thisYear = now.getFullYear();
        const nextBirthday = new Date(thisYear, birthDate.getMonth(), birthDate.getDate());
        if (nextBirthday < now) {
          nextBirthday.setFullYear(thisYear + 1);
        }
        const daysUntil = Math.ceil((nextBirthday.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return {
          ...customer,
          daysUntil,
          nextBirthday
        };
      })
      .filter(c => c.daysUntil <= 30)
      .sort((a, b) => a.daysUntil - b.daysUntil)
      .slice(0, 10);
  }, [customers]);

  // Componente para placeholder "Em Manutenção"
  const MaintenancePlaceholder = ({ title, description, icon: Icon }: { 
    title: string; 
    description: string; 
    icon: React.ElementType 
  }) => (
    <Card className="bg-gray-800/30 border-gray-700/40 backdrop-blur-sm shadow-lg hover:shadow-2xl hover:shadow-yellow-500/10 hover:border-yellow-400/30 transition-all duration-300">
      <CardHeader>
        <CardTitle className="text-sm text-white font-medium flex items-center gap-2">
          <Icon className="h-4 w-4 text-yellow-400" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center py-8 relative overflow-hidden group">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-transparent to-orange-500/5"></div>
        
        <div className="relative z-10 text-center">
          <div className="relative mb-4">
            <div className="absolute inset-0 bg-yellow-500/20 rounded-full blur-lg group-hover:blur-xl transition-all duration-300"></div>
            <Settings className="h-16 w-16 text-yellow-400 relative z-10 animate-pulse group-hover:scale-110 transition-transform duration-300" />
          </div>
          <p className="text-sm text-white/70 text-center mb-3">{description}</p>
          <Badge variant="outline" className="border-yellow-400/30 text-yellow-400 bg-yellow-400/10">
            🔧 Em Manutenção
          </Badge>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-4 left-4 w-2 h-2 bg-yellow-400/60 rounded-full animate-pulse"></div>
        <div className="absolute bottom-6 right-8 w-1.5 h-1.5 bg-orange-400/60 rounded-full animate-pulse delay-700"></div>
      </CardContent>
    </Card>
  );

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
              onClick={() => exportToCSV('clientes')}
              className="text-white hover:bg-purple-500/20 hover:text-purple-300 cursor-pointer transition-all duration-200 group"
            >
              <Users className="h-4 w-4 mr-2 text-purple-400 group-hover:scale-110 transition-transform duration-200" />
              <span className="group-hover:font-medium transition-all duration-200">Exportar Clientes</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => exportToCSV('insights')}
              className="text-white hover:bg-blue-500/20 hover:text-blue-300 cursor-pointer transition-all duration-200 group"
            >
              <Sparkles className="h-4 w-4 mr-2 text-blue-400 group-hover:scale-110 transition-transform duration-200" />
              <span className="group-hover:font-medium transition-all duration-200">Exportar Insights</span>
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

        {/* Métricas Principais - Padronizadas com StatCard v2.0.0 - Clicáveis */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            className="cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20"
            role="button"
            tabIndex={0}
            onClick={handleTotalCustomersClick}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleTotalCustomersClick();
              }
            }}
          >
            <StatCard
              layout="crm"
              variant="default"
              title="Total de Clientes"
              value={metrics.totalCustomers}
              description={`📈 +${metrics.newCustomersThisPeriod} nos últimos ${selectedPeriod}d`}
              icon={Users}
            />
          </div>

          <div
            className="cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-green-500/20"
            role="button"
            tabIndex={0}
            onClick={handleLtvClick}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleLtvClick();
              }
            }}
          >
            <StatCard
              layout="crm"
              variant="success"
              title="LTV Total"
              value={formatCurrency(metrics.totalLTV)}
              description={`💰 Média: ${formatCurrency(metrics.averageLTV)}`}
              icon={DollarSign}
            />
          </div>

          <div
            className="cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-yellow-500/20"
            role="button"
            tabIndex={0}
            onClick={handleBirthdaysClick}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleBirthdaysClick();
              }
            }}
          >
            <StatCard
              layout="crm"
              variant="warning"
              title="Aniversários"
              value={metrics.upcomingBirthdays}
              description={`🎂 Próximos ${Math.max(selectedPeriod, 30)} dias`}
              icon={Gift}
            />
          </div>

          <div
            className="cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-red-500/20"
            role="button"
            tabIndex={0}
            onClick={handleRiskClick}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleRiskClick();
              }
            }}
          >
            <StatCard
              layout="crm"
              variant="error"
              title="Em Risco"
              value={metrics.atRiskCustomers}
              description={`⚠️ ${metrics.churnRate.toFixed(1)}% churn rate`}
              icon={AlertTriangle}
            />
          </div>
        </div>

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
              {/* Gráfico de Tendências - DADOS REAIS */}
              <Card className="bg-gray-800/30 border-gray-700/40 backdrop-blur-sm shadow-lg hover:shadow-2xl hover:shadow-green-500/10 hover:border-green-400/30 transition-all duration-300 col-span-2">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    Tendências de Clientes
                    {isLoadingTrends && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-500 ml-2"></div>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {trendsError ? (
                    <div className="h-80 flex flex-col items-center justify-center">
                      <AlertTriangle className="h-12 w-12 text-red-400 mb-4" />
                      <p className="text-red-400 font-medium mb-2">Erro ao carregar tendências</p>
                      <p className="text-gray-400 text-sm text-center">
                        Dados usando fallback baseado em estatísticas reais
                      </p>
                    </div>
                  ) : isLoadingTrends ? (
                    <div className="h-80 flex items-center justify-center">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
                        <p className="text-gray-400">Carregando dados reais...</p>
                      </div>
                    </div>
                  ) : (
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={trendsData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis dataKey="month" tick={{ fill: '#9CA3AF' }} stroke="#6B7280" />
                          <YAxis tick={{ fill: '#9CA3AF' }} stroke="#6B7280" />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#1F2937', 
                              border: '1px solid #374151',
                              borderRadius: '8px',
                              color: '#F3F4F6'
                            }}
                            formatter={(value, name) => [
                              `${value}${name === 'LTV Médio' ? '' : ' clientes'}`,
                              name
                            ]}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="novos" 
                            stroke="#3B82F6" 
                            strokeWidth={3}
                            name="Novos Clientes"
                          />
                          <Line 
                            type="monotone" 
                            dataKey="ativos" 
                            stroke="#10B981" 
                            strokeWidth={3}
                            name="Clientes Ativos"
                          />
                          <Line 
                            type="monotone" 
                            dataKey="ltv" 
                            stroke="#F59E0B" 
                            strokeWidth={3}
                            name="LTV Médio"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Lista de Clientes em Risco */}
              <Card className="bg-gray-800/30 border-gray-700/40 backdrop-blur-sm shadow-lg hover:shadow-2xl hover:shadow-red-500/10 hover:border-red-400/30 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    Clientes em Risco ({customersAtRisk.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {customersAtRisk.map((customer) => (
                      <div key={customer.id} className="flex items-center justify-between p-3 rounded-lg bg-black/20 border border-white/10 hover:bg-white/5 transition-colors duration-200">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-white">{customer.name}</p>
                            <Badge 
                              variant={customer.risk_level === 'alto' ? 'destructive' : customer.risk_level === 'medio' ? 'secondary' : 'default'}
                              className="text-xs"
                            >
                              {customer.risk_level}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-400 mb-1">
                            {customer.daysSinceLastPurchase !== null 
                              ? `${customer.daysSinceLastPurchase} dias sem comprar`
                              : 'Nunca realizou compra'
                            }
                          </p>
                          <p className="text-xs text-orange-300 opacity-90">
                            📋 {customer.riskReason}
                          </p>
                        </div>
                        <div className="text-right ml-4">
                          <p className="text-sm text-green-400 font-medium">
                            {formatCurrency(customer.ltv)}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {customer.segment}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab: Segmentação */}
          <TabsContent value="segments" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Gráfico de Pizza - Segmentos */}
              <Card className="bg-gray-800/30 border-gray-700/40 backdrop-blur-sm shadow-lg hover:shadow-2xl hover:shadow-blue-500/10 hover:border-blue-400/30 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <PieChart className="h-5 w-5 text-blue-500" />
                    Distribuição por Segmento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col lg:flex-row items-center gap-6">
                    {/* Gráfico */}
                    <div className="flex-1 h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Pie
                            dataKey="count"
                            data={segmentData}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={80}
                            paddingAngle={2}
                            startAngle={90}
                            endAngle={450}
                          >
                            {segmentData.map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={entry.color}
                                stroke={entry.color}
                                strokeWidth={2}
                              />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#1F2937', 
                              border: '1px solid #374151',
                              borderRadius: '8px',
                              color: '#F3F4F6',
                              boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
                            }}
                            formatter={(value, name) => [
                              `${value} clientes`,
                              name
                            ]}
                          />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </div>
                    
                    {/* Legenda Lateral */}
                    <div className="flex-1 space-y-3">
                      <h4 className="text-white font-medium text-sm mb-4">Segmentos de Clientes</h4>
                      {segmentData.map((segment, index) => (
                        <div 
                          key={segment.segment} 
                          className="flex items-center justify-between p-3 rounded-lg bg-black/20 border border-white/10 hover:bg-white/5 transition-all duration-200 group"
                        >
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-4 h-4 rounded-full border-2 border-white/20 group-hover:scale-110 transition-transform duration-200"
                              style={{ backgroundColor: segment.color }}
                            />
                            <div>
                              <p className="font-medium text-white text-sm">{segment.segment}</p>
                              <p className="text-xs text-gray-400">{segment.count} clientes</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-white font-bold text-sm">{segment.percentage.toFixed(1)}%</p>
                            <p className="text-xs text-green-400">
                              {formatCurrency(segment.count > 0 ? segment.ltv / segment.count : 0)}
                            </p>
                          </div>
                        </div>
                      ))}
                      
                      {/* Resumo Total */}
                      <div className="mt-4 p-3 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30">
                        <div className="flex justify-between items-center">
                          <span className="text-white font-medium text-sm">Total de Clientes</span>
                          <span className="text-blue-400 font-bold">{segmentData.reduce((sum, s) => sum + s.count, 0)}</span>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-gray-400 text-xs">LTV Total</span>
                          <span className="text-green-400 font-medium text-sm">
                            {formatCurrency(segmentData.reduce((sum, s) => sum + s.ltv, 0))}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tabela de Segmentos */}
              <Card className="bg-gray-800/30 border-gray-700/40 backdrop-blur-sm shadow-lg hover:shadow-2xl hover:shadow-green-500/10 hover:border-green-400/30 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-green-500" />
                    ROI por Segmento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {segmentData.map((segment) => (
                      <div key={segment.segment} className="flex items-center justify-between p-3 rounded-lg bg-black/20 border border-white/10 hover:bg-white/5 transition-colors duration-200">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: segment.color }}
                          />
                          <div>
                            <p className="font-medium text-white">{segment.segment}</p>
                            <p className="text-sm text-gray-400">{segment.count} clientes</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-400">{formatCurrency(segment.ltv)}</p>
                          <p className="text-xs text-gray-400">
                            {formatCurrency(segment.count > 0 ? segment.ltv / segment.count : 0)}/cliente
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
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

              {/* IA Pipeline Placeholder */}
              <MaintenancePlaceholder
                title="Pipeline de Oportunidades"
                description="Previsões de IA para identificar oportunidades de upsell e cross-sell baseadas em ML"
                icon={Sparkles}
              />

              {/* Insights Atuais Funcionais */}
              <Card className="bg-gray-800/30 border-gray-700/40 backdrop-blur-sm shadow-lg hover:shadow-2xl hover:shadow-purple-500/10 hover:border-purple-400/30 transition-all duration-300 col-span-2">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Target className="h-5 w-5 text-purple-500" />
                    Insights Atuais do Sistema
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/30 hover:bg-purple-500/20 transition-colors duration-200">
                      <h4 className="font-medium text-purple-300 mb-2">Retenção</h4>
                      <p className="text-2xl font-bold text-white mb-1">
                        {((metrics.activeCustomers / metrics.totalCustomers) * 100).toFixed(1)}%
                      </p>
                      <p className="text-sm text-purple-200">Taxa de retenção mensal</p>
                    </div>
                    <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30 hover:bg-green-500/20 transition-colors duration-200">
                      <h4 className="font-medium text-green-300 mb-2">Crescimento</h4>
                      <p className="text-2xl font-bold text-white mb-1">+{metrics.newCustomersThisPeriod}</p>
                      <p className="text-sm text-green-200">Novos nos últimos {selectedPeriod}d</p>
                    </div>
                    <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30 hover:bg-blue-500/20 transition-colors duration-200">
                      <h4 className="font-medium text-blue-300 mb-2">Oportunidades</h4>
                      <p className="text-2xl font-bold text-white mb-1">{metrics.upcomingBirthdays}</p>
                      <p className="text-sm text-blue-200">Campanhas potenciais</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
};