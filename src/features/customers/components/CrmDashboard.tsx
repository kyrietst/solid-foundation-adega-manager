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
import { cn } from '@/core/config/utils';
import { formatCurrency } from '@/core/config/utils';
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
  Download
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
import { BirthdayCalendar } from './BirthdayCalendar';

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
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [selectedSegment, setSelectedSegment] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  // Buscar dados de clientes
  const { data: customers = [], isLoading } = useCustomers();

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

    // Calcular aniversários próximos (próximos 7 dias)
    const upcomingBirthdays = customers.filter(c => {
      if (!c.birthday) return false;
      const birthDate = new Date(c.birthday);
      const thisYear = now.getFullYear();
      const nextBirthday = new Date(thisYear, birthDate.getMonth(), birthDate.getDate());
      if (nextBirthday < now) {
        nextBirthday.setFullYear(thisYear + 1);
      }
      const daysUntil = Math.ceil((nextBirthday.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntil <= 7;
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
    <Card className="bg-gray-800/30 border-gray-700/40">
      <CardHeader>
        <CardTitle className="text-sm text-gray-200 font-medium flex items-center gap-2">
          <Icon className="h-4 w-4 text-yellow-500" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center py-8">
        <Settings className="h-16 w-16 text-yellow-500/40 mb-4 animate-pulse" />
        <p className="text-sm text-gray-400 text-center mb-3">{description}</p>
        <Badge variant="outline" className="border-yellow-500/30 text-yellow-500">
          🔧 Em Manutenção
        </Badge>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
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
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard CRM</h1>
          <p className="text-gray-400">Análise completa dos seus {metrics.totalCustomers} clientes</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32 bg-gray-800 border-gray-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 dias</SelectItem>
              <SelectItem value="30">30 dias</SelectItem>
              <SelectItem value="90">90 dias</SelectItem>
              <SelectItem value="365">1 ano</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 border-blue-700/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-blue-200">Total de Clientes</CardTitle>
            <Users className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white mb-1">{metrics.totalCustomers}</div>
            <div className="flex items-center text-xs text-blue-300">
              <TrendingUp className="h-3 w-3 mr-1" />
              +{metrics.newCustomersThisMonth} este mês
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-900/40 to-green-800/20 border-green-700/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-green-200">LTV Total</CardTitle>
            <DollarSign className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white mb-1">{formatCurrency(metrics.totalLTV)}</div>
            <div className="flex items-center text-xs text-green-300">
              <BarChart3 className="h-3 w-3 mr-1" />
              Média: {formatCurrency(metrics.averageLTV)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-900/40 to-yellow-800/20 border-yellow-700/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-yellow-200">Aniversários</CardTitle>
            <Gift className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white mb-1">{metrics.upcomingBirthdays}</div>
            <div className="flex items-center text-xs text-yellow-300">
              <Calendar className="h-3 w-3 mr-1" />
              Próximos 7 dias
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-900/40 to-red-800/20 border-red-700/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-red-200">Em Risco</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white mb-1">{metrics.atRiskCustomers}</div>
            <div className="flex items-center text-xs text-red-300">
              <Target className="h-3 w-3 mr-1" />
              {metrics.churnRate.toFixed(1)}% churn rate
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs para diferentes visões */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 bg-gray-800/50">
          <TabsTrigger value="overview" className="data-[state=active]:bg-yellow-500 data-[state=active]:text-gray-900">
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="segments" className="data-[state=active]:bg-yellow-500 data-[state=active]:text-gray-900">
            Segmentação
          </TabsTrigger>
          <TabsTrigger value="calendar" className="data-[state=active]:bg-yellow-500 data-[state=active]:text-gray-900">
            Calendário
          </TabsTrigger>
          <TabsTrigger value="maps" className="data-[state=active]:bg-yellow-500 data-[state=active]:text-gray-900">
            Mapas & IA
          </TabsTrigger>
        </TabsList>

        {/* Tab: Overview */}
        <TabsContent value="overview" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico de Tendências */}
            <Card className="bg-gray-800/30 border-gray-700/40 col-span-2">
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
            <Card className="bg-gray-800/30 border-gray-700/40">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  Clientes em Risco ({customersAtRisk.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {customersAtRisk.map((customer) => (
                    <div key={customer.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-700/30">
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
            <Card className="bg-gray-800/30 border-gray-700/40">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-blue-500" />
                  Distribuição por Segmento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        dataKey="count"
                        data={segmentData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ segment, percentage }) => `${segment} (${percentage.toFixed(1)}%)`}
                        outerRadius={100}
                        fill="#8884d8"
                      >
                        {segmentData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#F3F4F6'
                        }}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Tabela de Segmentos */}
            <Card className="bg-gray-800/30 border-gray-700/40">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-green-500" />
                  ROI por Segmento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {segmentData.map((segment) => (
                    <div key={segment.segment} className="flex items-center justify-between p-3 rounded-lg bg-gray-700/30">
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
            <Card className="bg-gray-800/30 border-gray-700/40 col-span-2">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple-500" />
                  Insights Atuais do Sistema
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/30">
                    <h4 className="font-medium text-purple-300 mb-2">Retenção</h4>
                    <p className="text-2xl font-bold text-white mb-1">
                      {((metrics.activeCustomers / metrics.totalCustomers) * 100).toFixed(1)}%
                    </p>
                    <p className="text-sm text-purple-200">Taxa de retenção mensal</p>
                  </div>
                  <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                    <h4 className="font-medium text-green-300 mb-2">Crescimento</h4>
                    <p className="text-2xl font-bold text-white mb-1">+{metrics.newCustomersThisMonth}</p>
                    <p className="text-sm text-green-200">Novos clientes este mês</p>
                  </div>
                  <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
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
    </div>
  );
};