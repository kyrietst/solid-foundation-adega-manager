/**
 * Modal de detalhes completos do cliente
 * Extraído do CustomersNew.tsx para separar responsabilidades
 * Enhanced for Story 2.3: Glass morphism + Black/Gold theme
 */

import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/primitives/dialog';
import { Button } from '@/shared/ui/primitives/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { Badge } from '@/shared/ui/primitives/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/primitives/tabs';
import { Progress } from '@/shared/ui/primitives/progress';
import { Input } from '@/shared/ui/primitives/input';
import { cn } from '@/core/config/utils';
import { getGlassCardClasses } from '@/core/config/theme-utils';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  DollarSign, 
  ShoppingBag,
  Edit,
  MessageSquare,
  TrendingUp,
  Clock,
  Gift,
  Filter,
  Search,
  AlertCircle,
  Settings,
  Sparkles
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { formatCurrency } from '@/core/config/utils';
import { CustomerDetailModalProps } from './types';
import { CustomerSegmentBadge } from './CustomerSegmentBadge';
import { CustomerInsights } from './CustomerInsights';
import { CustomerTagDisplay } from './CustomerTagDisplay';
import { GoogleMapsPlaceholder } from './GoogleMapsPlaceholder';
import { N8NPlaceholder } from './N8NPlaceholder';
import { 
  useCustomerInsights, 
  useCustomerInteractions, 
  useCustomerPurchases 
} from '@/features/customers/hooks/use-crm';

export const CustomerDetailModal: React.FC<CustomerDetailModalProps> = ({
  isOpen,
  onClose,
  customer,
  onEdit,
  canEdit = false,
}) => {
  // State para filtros e tabs
  const [activeTab, setActiveTab] = useState('overview');
  const [purchaseFilter, setPurchaseFilter] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('all');

  // Dados específicos do cliente selecionado
  const { data: insights = [], isLoading: isLoadingInsights } = useCustomerInsights(customer?.id || '');
  const { data: interactions = [], isLoading: isLoadingInteractions } = useCustomerInteractions(customer?.id || '');
  const { data: purchases = [], isLoading: isLoadingPurchases } = useCustomerPurchases(customer?.id || '');

  // Cálculo do countdown de aniversário
  const birthdayCountdown = useMemo(() => {
    if (!customer?.birthday) return null;
    
    const today = new Date();
    const birthDate = new Date(customer.birthday);
    const currentYear = today.getFullYear();
    
    // Próximo aniversário este ano
    let nextBirthday = new Date(currentYear, birthDate.getMonth(), birthDate.getDate());
    
    // Se já passou, próximo ano
    if (nextBirthday < today) {
      nextBirthday = new Date(currentYear + 1, birthDate.getMonth(), birthDate.getDate());
    }
    
    const daysUntil = Math.ceil((nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      date: nextBirthday,
      daysUntil,
      isToday: daysUntil === 0,
      isSoon: daysUntil <= 7,
      message: daysUntil === 0 ? 'Hoje! 🎉' : 
               daysUntil === 1 ? 'Amanhã 🎂' :
               daysUntil <= 7 ? `${daysUntil} dias 🎈` :
               daysUntil <= 30 ? `${daysUntil} dias` :
               nextBirthday.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
    };
  }, [customer?.birthday]);

  // Dados simulados do gráfico LTV (baseados em compras reais)
  const ltvChartData = useMemo(() => {
    if (!purchases.length) return [];
    
    // Simular evolução do LTV baseado nas compras reais
    let runningTotal = 0;
    return purchases
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      .map((purchase, index) => {
        runningTotal += purchase.total || 0;
        return {
          month: new Date(purchase.created_at).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
          ltv: runningTotal,
          purchases: index + 1
        };
      });
  }, [purchases]);

  // Filtrar compras
  const filteredPurchases = useMemo(() => {
    let filtered = purchases;
    
    // Filtro por texto
    if (purchaseFilter) {
      filtered = filtered.filter(purchase => 
        purchase.id?.toLowerCase().includes(purchaseFilter.toLowerCase()) ||
        purchase.status?.toLowerCase().includes(purchaseFilter.toLowerCase())
      );
    }
    
    // Filtro por período
    if (selectedPeriod !== 'all') {
      const days = selectedPeriod === '30' ? 30 : selectedPeriod === '90' ? 90 : 365;
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      filtered = filtered.filter(purchase => 
        new Date(purchase.created_at) >= cutoffDate
      );
    }
    
    return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [purchases, purchaseFilter, selectedPeriod]);

  if (!customer) return null;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatContactPreference = (preference: string | null) => {
    const preferences = {
      whatsapp: 'WhatsApp',
      sms: 'SMS',
      email: 'E-mail',
      call: 'Telefone'
    };
    return preference ? preferences[preference as keyof typeof preferences] || preference : 'Não definido';
  };

  const formatPurchaseFrequency = (frequency: string | null) => {
    const frequencies = {
      weekly: 'Semanal',
      biweekly: 'Quinzenal',
      monthly: 'Mensal',
      occasional: 'Ocasional'
    };
    return frequency ? frequencies[frequency as keyof typeof frequencies] || frequency : 'Não definido';
  };

  const glassClasses = getGlassCardClasses('premium');
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn(
        "max-w-6xl max-h-[90vh] overflow-y-auto backdrop-blur-xl shadow-2xl",
        glassClasses,
        "bg-gray-900/90 border border-primary-yellow/30"
      )}>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-white flex items-center gap-2 font-semibold">
              <User className="h-5 w-5 text-primary-yellow" />
              {customer.name}
            </DialogTitle>
            {canEdit && onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(customer)}
                className="border-primary-yellow/30 text-primary-yellow hover:bg-primary-yellow/20 hover:border-primary-yellow/50 transition-all duration-200"
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            )}
          </div>
        </DialogHeader>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-4 bg-gray-800/50 border border-gray-700/40">
            <TabsTrigger value="overview" className="data-[state=active]:bg-primary-yellow data-[state=active]:text-gray-900">
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-primary-yellow data-[state=active]:text-gray-900">
              Analytics
            </TabsTrigger>
            <TabsTrigger value="purchases" className="data-[state=active]:bg-primary-yellow data-[state=active]:text-gray-900">
              Compras
            </TabsTrigger>
            <TabsTrigger value="ai" className="data-[state=active]:bg-primary-yellow data-[state=active]:text-gray-900">
              IA & Mapas
            </TabsTrigger>
          </TabsList>

          {/* Tab: Overview */}
          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna 1: Informações Básicas */}
          <div className="space-y-4">
            {/* Informações de Contato */}
            <Card className={cn(getGlassCardClasses('default'), "bg-gray-800/30 border-gray-700/40 backdrop-blur-sm")}>
              <CardHeader>
                <CardTitle className="text-sm text-gray-200 font-medium">Informações de Contato</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-adega-platinum/60" />
                  <span className="text-sm text-adega-platinum/80">
                    {customer.email || 'Não informado'}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-adega-platinum/60" />
                  <span className="text-sm text-adega-platinum/80">
                    {customer.phone || 'Não informado'}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-adega-platinum/60" />
                  <span className="text-sm text-adega-platinum/80">
                    {customer.address || 'Não informado'}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-adega-platinum/60" />
                  <span className="text-sm text-adega-platinum/80">
                    {formatDate(customer.birthday)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Tags Personalizadas */}
            <Card className={cn(getGlassCardClasses('default'), "bg-gray-800/30 border-gray-700/40 backdrop-blur-sm")}>
              <CardHeader>
                <CardTitle className="text-sm text-gray-200 font-medium flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary-yellow" />
                  Tags Personalizadas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CustomerTagDisplay tags={customer.tags} maxVisible={6} size="md" />
              </CardContent>
            </Card>

            {/* Segmentação */}
            <Card className="bg-adega-charcoal/20 border-white/10">
              <CardHeader>
                <CardTitle className="text-sm text-adega-platinum">Segmentação</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-adega-platinum/60">Segmento:</span>
                  <CustomerSegmentBadge segment={customer.segment || ''} />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-adega-platinum/60">Preferência de contato:</span>
                  <span className="text-sm text-adega-platinum/80">
                    {formatContactPreference(customer.contact_preference)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-adega-platinum/60">Frequência de compra:</span>
                  <span className="text-sm text-adega-platinum/80">
                    {formatPurchaseFrequency(customer.purchase_frequency)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-adega-platinum/60">Permissão de contato:</span>
                  <Badge variant={customer.contact_permission ? "default" : "secondary"}>
                    {customer.contact_permission ? 'Sim' : 'Não'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Coluna 2: Dados de Compra */}
          <div className="space-y-4">
            {/* Métricas de Compra */}
            <Card className="bg-adega-charcoal/20 border-white/10">
              <CardHeader>
                <CardTitle className="text-sm text-adega-platinum flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Métricas de Compra
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-adega-platinum/60">Lifetime Value:</span>
                  <span className="font-semibold text-adega-gold">
                    {formatCurrency(customer.lifetime_value || 0)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-adega-platinum/60">Primeira compra:</span>
                  <span className="text-sm text-adega-platinum/80">
                    {formatDate(customer.first_purchase_date)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-adega-platinum/60">Última compra:</span>
                  <span className="text-sm text-adega-platinum/80">
                    {formatDate(customer.last_purchase_date)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-adega-platinum/60">Categoria favorita:</span>
                  <span className="text-sm text-adega-platinum/80">
                    {customer.favorite_category || 'N/A'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-adega-platinum/60">Produto favorito:</span>
                  <span className="text-sm text-adega-platinum/80">
                    {customer.favorite_product || 'N/A'}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Histórico de Interações */}
            <Card className="bg-adega-charcoal/20 border-white/10">
              <CardHeader>
                <CardTitle className="text-sm text-adega-platinum flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Interações Recentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingInteractions ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-adega-gold mx-auto"></div>
                  </div>
                ) : interactions.length > 0 ? (
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {interactions.slice(0, 5).map((interaction) => (
                      <div key={interaction.id} className="p-2 rounded bg-adega-charcoal/30">
                        <div className="flex justify-between items-start">
                          <span className="text-sm font-medium text-adega-platinum">
                            {interaction.interaction_type}
                          </span>
                          <span className="text-xs text-adega-platinum/40">
                            {formatDate(interaction.created_at)}
                          </span>
                        </div>
                        <p className="text-xs text-adega-platinum/70 mt-1">
                          {interaction.description}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-adega-platinum/60 text-center py-4">
                    Nenhuma interação registrada
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Coluna 3: Insights */}
          <div>
            <CustomerInsights
              customerId={customer.id}
              insights={insights}
              isLoading={isLoadingInsights}
            />
          </div>
            </div>
          </TabsContent>

          {/* Tab: Analytics */}
          <TabsContent value="analytics" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Gráfico de Evolução LTV */}
              <Card className="bg-gray-800/30 border-gray-700/40 backdrop-blur-sm col-span-2">
                <CardHeader>
                  <CardTitle className="text-sm text-gray-200 font-medium flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    Evolução do Lifetime Value
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {ltvChartData.length > 0 ? (
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={ltvChartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis 
                            dataKey="month" 
                            tick={{ fill: '#9CA3AF', fontSize: 12 }}
                            stroke="#6B7280"
                          />
                          <YAxis 
                            tick={{ fill: '#9CA3AF', fontSize: 12 }}
                            stroke="#6B7280"
                            tickFormatter={(value) => `R$ ${value}`}
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#1F2937', 
                              border: '1px solid #374151',
                              borderRadius: '8px',
                              color: '#F3F4F6'
                            }}
                            formatter={(value, name) => [
                              formatCurrency(Number(value)), 
                              name === 'ltv' ? 'LTV Acumulado' : name
                            ]}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="ltv" 
                            stroke="#F59E0B" 
                            strokeWidth={3}
                            dot={{ fill: '#F59E0B', strokeWidth: 2, r: 4 }}
                            activeDot={{ r: 6, stroke: '#F59E0B', strokeWidth: 2 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-64 flex items-center justify-center">
                      <p className="text-gray-400">Dados insuficientes para o gráfico</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Estatísticas Detalhadas */}
              <Card className="bg-gray-800/30 border-gray-700/40 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-sm text-gray-200 font-medium">
                    Métricas Detalhadas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">Média por compra:</span>
                    <span className="font-medium text-green-400">
                      {purchases.length > 0 
                        ? formatCurrency((customer.lifetime_value || 0) / purchases.length)
                        : 'N/A'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">Total de compras:</span>
                    <span className="font-medium text-blue-400">{purchases.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">Insights de IA:</span>
                    <span className="font-medium text-purple-400">{insights.length}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Tab: Purchases */}
          <TabsContent value="purchases" className="mt-6">
            <Card className="bg-gray-800/30 border-gray-700/40 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-sm text-gray-200 font-medium flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4 text-blue-500" />
                    Histórico de Compras ({filteredPurchases.length})
                  </div>
                </CardTitle>
                
                {/* Filtros */}
                <div className="flex gap-2 mt-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Filtrar por ID ou status..."
                      value={purchaseFilter}
                      onChange={(e) => setPurchaseFilter(e.target.value)}
                      className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400"
                    />
                  </div>
                  <select
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                    className="px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-md text-white text-sm"
                  >
                    <option value="all">Todos os períodos</option>
                    <option value="30">Últimos 30 dias</option>
                    <option value="90">Últimos 90 dias</option>
                    <option value="365">Último ano</option>
                  </select>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingPurchases ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  </div>
                ) : filteredPurchases.length > 0 ? (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {filteredPurchases.map((purchase) => (
                      <div key={purchase.id} className="p-4 rounded-lg bg-gray-700/30 border border-gray-600/30">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <span className="font-medium text-white">#{purchase.id?.slice(-8)}</span>
                            <Badge 
                              variant={purchase.status === 'completed' ? 'default' : 'secondary'}
                              className="ml-2"
                            >
                              {purchase.status}
                            </Badge>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-green-400">
                              {formatCurrency(purchase.total || 0)}
                            </p>
                            <p className="text-xs text-gray-400">
                              {formatDate(purchase.created_at)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-8 text-gray-400">
                    {purchaseFilter || selectedPeriod !== 'all' 
                      ? 'Nenhuma compra encontrada com os filtros aplicados'
                      : 'Nenhuma compra registrada'
                    }
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Tab: AI & Maps */}
          <TabsContent value="ai" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Google Maps Integration */}
              <GoogleMapsPlaceholder
                customerAddress={customer.address || undefined}
                variant="customer"
              />
              
              
              {/* AI Recommendations System */}
              <N8NPlaceholder
                automationType="recommendations"
                customerName={customer.name}
              />
              
              {/* WhatsApp Automation */}
              <N8NPlaceholder
                automationType="whatsapp"
                customerName={customer.name}
              />
              
              {/* Current AI Insights - Functional */}
              <div className="bg-gray-800/30 border-gray-700/40 backdrop-blur-sm rounded-lg">
                <CustomerInsights
                  customerId={customer.id}
                  insights={insights}
                  isLoading={isLoadingInsights}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Notas */}
        {customer.notes && (
          <Card className="bg-adega-charcoal/20 border-white/10 mt-6">
            <CardHeader>
              <CardTitle className="text-sm text-adega-platinum">Observações</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-adega-platinum/80">
                {customer.notes}
              </p>
            </CardContent>
          </Card>
        )}
      </DialogContent>
    </Dialog>
  );
};