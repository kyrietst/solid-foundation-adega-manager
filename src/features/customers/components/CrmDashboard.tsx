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
import { BlurIn } from '@/components/ui/blur-in';
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
import { BirthdayCalendar } from './BirthdayCalendar';
import { supabase } from '@/core/api/supabase/client';

// Cores para gráficos
const COLORS = ['#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#F97316', '#06B6D4', '#84CC16'];

interface CrmMetrics {
  totalCustomers: number;
  activeCustomers: number;
  totalLTV: number;
  averageLTV: number;
  churnRate: number;
  newCustomersThisMonth: number;
  upcomingBirthdays: number;
  atRiskCustomers: number;
}

interface SegmentData {
  segment: string;
  count: number;
  ltv: number;
  percentage: number;
  color: string;
}

interface CustomerAtRisk {
  id: string;
  name: string;
  segment: string;
  daysSinceLastPurchase: number;
  ltv: number;
  risk_level: 'alto' | 'medio' | 'baixo';
}

export const CrmDashboard: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState(30);
  const [selectedSegment, setSelectedSegment] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  // Buscar dados de clientes
  const { data: customers = [], isLoading } = useCustomers();

  // Função de exportação CSV
  const exportToCSV = async (type: string) => {
    try {
      let data: any[] = [];
      let filename = '';

      switch (type) {
        case 'clientes':
          data = customers;
          filename = 'clientes-crm.csv';
          break;

        case 'insights':
          const { data: insightsData } = await supabase
            .from('customer_insights')
            .select('*');
          data = insightsData || [];
          filename = 'insights-clientes.csv';
          break;

        case 'interacoes':
          const { data: interactionsData } = await supabase
            .from('customer_interactions')
            .select('*');
          data = interactionsData || [];
          filename = 'interacoes-clientes.csv';
          break;

        case 'vendas':
          const { data: salesData } = await supabase
            .from('sales')
            .select('*')
            .not('customer_id', 'is', null);
          data = salesData || [];
          filename = 'vendas-clientes.csv';
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
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Erro ao exportar:', error);
      alert('Erro ao exportar dados. Tente novamente.');
    }
  };
  
  // Debug para verificar se os dados chegam
  console.log('🎂 CRM Dashboard - Total customers loaded:', customers.length);
  console.log('🎂 CRM Dashboard - Customers with birthdays:', customers.filter(c => c.birthday).length);
  console.log('🎂 CRM Dashboard - Sample customer:', customers[0]);

  // Calcular métricas
  const metrics = useMemo((): CrmMetrics => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const totalCustomers = customers.length;
    const activeCustomers = customers.filter(c => {
      const lastPurchase = c.last_purchase_date ? new Date(c.last_purchase_date) : null;
      return lastPurchase && lastPurchase > thirtyDaysAgo;
    }).length;
    
    const totalLTV = customers.reduce((sum, c) => sum + (c.lifetime_value || 0), 0);
    const averageLTV = totalCustomers > 0 ? totalLTV / totalCustomers : 0;
    
    const newCustomersThisMonth = customers.filter(c => {
      const createdAt = new Date(c.created_at);
      return createdAt > thirtyDaysAgo;
    }).length;

    // Calcular aniversários próximos (próximos 30 dias)
    const upcomingBirthdays = customers.filter(c => {
      if (!c.birthday) return false;
      const birthDate = new Date(c.birthday);
      const thisYear = now.getFullYear();
      const nextBirthday = new Date(thisYear, birthDate.getMonth(), birthDate.getDate());
      if (nextBirthday < now) {
        nextBirthday.setFullYear(thisYear + 1);
      }
      const daysUntil = Math.ceil((nextBirthday.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      console.log(`🎂 CRM Dashboard - ${c.name}: birthday=${c.birthday}, daysUntil=${daysUntil}`);
      
      return daysUntil <= 30;
    }).length;

    // Clientes em risco (sem comprar há mais de 90 dias)
    const atRiskCustomers = customers.filter(c => {
      const lastPurchase = c.last_purchase_date ? new Date(c.last_purchase_date) : null;
      if (!lastPurchase) return true;
      const daysSince = Math.floor((now.getTime() - lastPurchase.getTime()) / (1000 * 60 * 60 * 24));
      return daysSince > 90;
    }).length;

    const churnRate = totalCustomers > 0 ? (atRiskCustomers / totalCustomers) * 100 : 0;

    return {
      totalCustomers,
      activeCustomers,
      totalLTV,
      averageLTV,
      churnRate,
      newCustomersThisMonth,
      upcomingBirthdays,
      atRiskCustomers
    };
  }, [customers]);

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

  // Clientes em risco detalhados
  const customersAtRisk = useMemo((): CustomerAtRisk[] => {
    const now = new Date();
    return customers
      .map(customer => {
        const lastPurchase = customer.last_purchase_date ? new Date(customer.last_purchase_date) : null;
        const daysSinceLastPurchase = lastPurchase 
          ? Math.floor((now.getTime() - lastPurchase.getTime()) / (1000 * 60 * 60 * 24))
          : 365;

        let risk_level: 'alto' | 'medio' | 'baixo';
        if (daysSinceLastPurchase > 180) risk_level = 'alto';
        else if (daysSinceLastPurchase > 90) risk_level = 'medio';
        else risk_level = 'baixo';

        return {
          id: customer.id,
          name: customer.name || '',
          segment: customer.segment || 'Novo',
          daysSinceLastPurchase,
          ltv: customer.lifetime_value || 0,
          risk_level
        };
      })
      .filter(c => c.risk_level !== 'baixo')
      .sort((a, b) => b.daysSinceLastPurchase - a.daysSinceLastPurchase)
      .slice(0, 10);
  }, [customers]);

  // Dados para gráfico de tendências (simulados)
  const trendsData = useMemo(() => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
    return months.map((month, index) => ({
      month,
      novos: Math.floor(Math.random() * 20) + 5,
      ativos: Math.floor(Math.random() * 50) + 30,
      ltv: Math.floor(Math.random() * 500) + 300
    }));
  }, []);

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

  if (isLoading) {
    return (
      <div className="w-full h-full flex flex-col p-4">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Carregando dashboard CRM...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col p-4">
      {/* Header padronizado */}
      <div className="flex-shrink-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        {/* Header com BlurIn animation */}
        <div className="relative text-center sm:text-left">
          {/* Título animado */}
          <BlurIn
            word="DASHBOARD CRM"
            duration={1.2}
            variant={{
              hidden: { filter: "blur(15px)", opacity: 0 },
              visible: { filter: "blur(0px)", opacity: 1 }
            }}
            className="text-xl lg:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FF2400] via-[#FFDA04] to-[#FF2400] drop-shadow-lg"
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
        
        {/* Controles padronizados */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
          {/* Filtro de Período */}
          <div 
            className="relative flex gap-2 p-3 bg-black/80 rounded-xl border border-white/10 backdrop-blur-sm hover:shadow-2xl hover:shadow-purple-500/10 hover:border-purple-400/30 transition-all duration-300 group"
            onMouseMove={(e) => {
              const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
              const x = ((e.clientX - rect.left) / rect.width) * 100;
              const y = ((e.clientY - rect.top) / rect.height) * 100;
              (e.currentTarget as HTMLElement).style.setProperty("--x", `${x}%`);
              (e.currentTarget as HTMLElement).style.setProperty("--y", `${y}%`);
            }}
          >
            <span className="text-xs text-white/70 self-center mr-2 font-medium">Período:</span>
            {[7, 30, 90, 180].map((days) => (
              <Button
                key={days}
                variant={selectedPeriod === days ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPeriod(days)}
                className={`${
                  selectedPeriod === days 
                    ? "bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black font-bold shadow-lg shadow-[#FFD700]/30 scale-105 border-0" 
                    : "border-white/30 text-white hover:bg-white/20 hover:border-white/50 hover:scale-105 hover:shadow-md"
                } backdrop-blur-sm transition-all duration-300 relative overflow-hidden group`}
              >
                <span className="relative z-10">{days}d</span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 -translate-x-full group-hover:translate-x-full transform" />
              </Button>
            ))}
            {/* Purple glow effect */}
            <div 
              className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-500/20 via-transparent to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
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
        </div>
      </div>

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

        {/* Métricas Principais - Padronizadas com StatCard v2.0.0 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            layout="crm"
            variant="default"
            title="Total de Clientes"
            value={metrics.totalCustomers}
            description={`📈 +${metrics.newCustomersThisMonth} este mês`}
            icon={Users}
          />

          <StatCard
            layout="crm"
            variant="success"
            title="LTV Total"
            value={formatCurrency(metrics.totalLTV)}
            description={`💰 Média: ${formatCurrency(metrics.averageLTV)}`}
            icon={DollarSign}
          />

          <StatCard
            layout="crm"
            variant="warning"
            title="Aniversários"
            value={metrics.upcomingBirthdays}
            description="🎂 Próximos 30 dias"
            icon={Gift}
          />

          <StatCard
            layout="crm"
            variant="error"
            title="Em Risco"
            value={metrics.atRiskCustomers}
            description={`⚠️ ${metrics.churnRate.toFixed(1)}% churn rate`}
            icon={AlertTriangle}
          />
        </div>

        {/* Tabs para diferentes visões */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 bg-black/40 border border-white/20 backdrop-blur-sm rounded-xl">
            <TabsTrigger 
              value="overview" 
              className="data-[state=active]:bg-[#FFD700] data-[state=active]:text-black data-[state=active]:shadow-lg data-[state=active]:shadow-[#FFD700]/30 text-white hover:bg-white/10 transition-all duration-200"
            >
              Visão Geral
            </TabsTrigger>
            <TabsTrigger 
              value="segments" 
              className="data-[state=active]:bg-[#FFD700] data-[state=active]:text-black data-[state=active]:shadow-lg data-[state=active]:shadow-[#FFD700]/30 text-white hover:bg-white/10 transition-all duration-200"
            >
              Segmentação
            </TabsTrigger>
            <TabsTrigger 
              value="calendar" 
              className="data-[state=active]:bg-[#FFD700] data-[state=active]:text-black data-[state=active]:shadow-lg data-[state=active]:shadow-[#FFD700]/30 text-white hover:bg-white/10 transition-all duration-200"
            >
              Calendário
            </TabsTrigger>
            <TabsTrigger 
              value="maps" 
              className="data-[state=active]:bg-[#FFD700] data-[state=active]:text-black data-[state=active]:shadow-lg data-[state=active]:shadow-[#FFD700]/30 text-white hover:bg-white/10 transition-all duration-200"
            >
              Mapas & IA
            </TabsTrigger>
          </TabsList>

          {/* Tab: Overview */}
          <TabsContent value="overview" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Gráfico de Tendências */}
              <Card className="bg-gray-800/30 border-gray-700/40 backdrop-blur-sm shadow-lg hover:shadow-2xl hover:shadow-green-500/10 hover:border-green-400/30 transition-all duration-300 col-span-2">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    Tendências de Clientes
                  </CardTitle>
                </CardHeader>
                <CardContent>
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
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
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
                        <div>
                          <p className="font-medium text-white">{customer.name}</p>
                          <p className="text-sm text-gray-400">
                            {customer.daysSinceLastPurchase} dias sem comprar
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant={customer.risk_level === 'alto' ? 'destructive' : 'secondary'}>
                            {customer.risk_level}
                          </Badge>
                          <p className="text-sm text-green-400 mt-1">
                            {formatCurrency(customer.ltv)}
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
                      <p className="text-2xl font-bold text-white mb-1">+{metrics.newCustomersThisMonth}</p>
                      <p className="text-sm text-green-200">Novos clientes este mês</p>
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