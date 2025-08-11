/**
 * CustomerProfile.tsx - Página de perfil individual completo do cliente
 * Implementação da Fase 1: Infraestrutura Base
 * Data: 10 de agosto de 2025
 */

import React, { useState, useMemo } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { Button } from '@/shared/ui/primitives/button';
import { Badge } from '@/shared/ui/primitives/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/primitives/tabs';
import { LoadingScreen } from '@/shared/ui/composite/loading-spinner';
import { Input } from '@/shared/ui/primitives/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/primitives/select';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
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
  BarChart3,
  Settings,
  CreditCard,
  Lightbulb,
  ArrowLeft,
  ExternalLink,
  Search,
  Filter,
  Package,
  Plus
} from 'lucide-react';
import { formatCurrency } from '@/core/config/utils';
import { useCustomer, useCustomerPurchases } from '@/features/customers/hooks/use-crm';

interface CustomerProfileProps {
  className?: string;
}

export const CustomerProfile = ({ className }: CustomerProfileProps) => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Estados para filtros da aba Compras
  const [searchTerm, setSearchTerm] = useState('');
  const [periodFilter, setPeriodFilter] = useState('all');

  // Função para enviar WhatsApp
  const handleWhatsApp = () => {
    if (!customer?.phone) {
      alert('Cliente não possui telefone cadastrado');
      return;
    }
    const phone = customer.phone.replace(/\D/g, '');
    const message = `Olá ${customer.name}, tudo bem? Aqui é da Adega! 🍷`;
    const url = `https://wa.me/55${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  // Função para enviar email
  const handleEmail = () => {
    if (!customer?.email) {
      alert('Cliente não possui email cadastrado');
      return;
    }
    const subject = `Contato - Adega Wine Store`;
    const body = `Prezado(a) ${customer.name},\n\nEsperamos que esteja bem!\n\nAtenciosamente,\nEquipe Adega`;
    const url = `mailto:${customer.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(url, '_blank');
  };

  // Função para nova venda
  const handleNewSale = () => {
    // Navegação para página de vendas com cliente pré-selecionado
    const salesUrl = `/sales?customer_id=${id}&customer_name=${encodeURIComponent(customer?.name || '')}`;
    window.open(salesUrl, '_blank');
  };

  // Buscar dados do cliente
  const { 
    data: customer, 
    isLoading, 
    error 
  } = useCustomer(id || '');

  // Buscar histórico de compras do cliente
  const { 
    data: purchases = [], 
    isLoading: isLoadingPurchases,
    error: purchasesError
  } = useCustomerPurchases(id || '');

  // Filtrar compras baseado nos filtros aplicados
  const filteredPurchases = useMemo(() => {
    if (!purchases) return [];
    
    let filtered = purchases;
    
    // Filtro por período
    if (periodFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (periodFilter) {
        case '30':
          filterDate.setDate(now.getDate() - 30);
          break;
        case '90':
          filterDate.setDate(now.getDate() - 90);
          break;
        case '180':
          filterDate.setDate(now.getDate() - 180);
          break;
        case '365':
          filterDate.setFullYear(now.getFullYear() - 1);
          break;
      }
      
      filtered = filtered.filter(purchase => 
        new Date(purchase.date) >= filterDate
      );
    }
    
    // Filtro por termo de busca (produtos)
    if (searchTerm) {
      filtered = filtered.filter(purchase =>
        purchase.items.some(item =>
          item.product_name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
    
    return filtered;
  }, [purchases, periodFilter, searchTerm]);

  // Dados para gráfico de vendas por mês
  const salesChartData = useMemo(() => {
    if (!purchases || purchases.length === 0) return [];
    
    const monthlyData = purchases.reduce((acc, purchase) => {
      const date = new Date(purchase.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = date.toLocaleDateString('pt-BR', { year: 'numeric', month: 'short' });
      
      if (!acc[monthKey]) {
        acc[monthKey] = { month: monthLabel, total: 0, count: 0 };
      }
      
      acc[monthKey].total += purchase.total;
      acc[monthKey].count += 1;
      
      return acc;
    }, {} as Record<string, { month: string; total: number; count: number }>);
    
    return Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));
  }, [purchases]);

  // Dados para gráfico de produtos mais comprados
  const productsChartData = useMemo(() => {
    if (!purchases || purchases.length === 0) return [];
    
    const productCount = purchases.reduce((acc, purchase) => {
      purchase.items.forEach(item => {
        if (!acc[item.product_name]) {
          acc[item.product_name] = 0;
        }
        acc[item.product_name] += item.quantity;
      });
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(productCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 produtos
  }, [purchases]);

  // Dados para gráfico de frequência de compras
  const frequencyChartData = useMemo(() => {
    if (!purchases || purchases.length === 0) return [];
    
    const intervals = purchases.slice(1).map((purchase, index) => {
      const currentDate = new Date(purchase.date);
      const previousDate = new Date(purchases[index].date);
      const diffTime = Math.abs(currentDate.getTime() - previousDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return {
        purchase: `Compra ${index + 2}`,
        days: diffDays,
        date: currentDate.toLocaleDateString('pt-BR')
      };
    });
    
    return intervals;
  }, [purchases]);

  // Cores para gráficos
  const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#F97316', '#84CC16'];

  // Se não tem ID, redirecionar
  if (!id) {
    return <Navigate to="/customers" replace />;
  }

  // Loading state
  if (isLoading) {
    return <LoadingScreen text="Carregando perfil do cliente..." />;
  }

  // Error state
  if (error || !customer) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="text-red-400 text-lg">❌ Cliente não encontrado</div>
        <Button 
          variant="outline" 
          onClick={() => window.history.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => window.history.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <div className="text-sm text-gray-400">
            <span>Clientes</span> 
            <span className="mx-2">/</span>
            <span className="text-white">{customer.name}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-2"
            onClick={() => alert('Funcionalidade de edição será implementada em breve')}
          >
            <Edit className="h-4 w-4" />
            Editar
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-2"
            onClick={handleWhatsApp}
            disabled={!customer?.phone}
            title={!customer?.phone ? 'Cliente não possui telefone' : 'Enviar mensagem via WhatsApp'}
          >
            <MessageSquare className="h-4 w-4" />
            WhatsApp
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-2"
            onClick={handleEmail}
            disabled={!customer?.email}
            title={!customer?.email ? 'Cliente não possui email' : 'Enviar email'}
          >
            <Mail className="h-4 w-4" />
            Email
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            onClick={handleNewSale}
          >
            <Plus className="h-4 w-4" />
            Nova Venda
          </Button>
        </div>
      </div>

      {/* Customer Header Card */}
      <Card className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-700/30">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            {/* Customer Info */}
            <div className="flex items-start gap-4">
              {/* Avatar Placeholder */}
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                {customer.name?.charAt(0)?.toUpperCase() || 'C'}
              </div>
              
              {/* Basic Info */}
              <div className="space-y-2">
                <div>
                  <h1 className="text-2xl font-bold text-white">{customer.name}</h1>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge 
                      className={`text-xs ${
                        customer.segment === 'Fiel' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                        customer.segment === 'Regular' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                        customer.segment === 'Novo' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' :
                        'bg-gray-500/20 text-gray-400 border-gray-500/30'
                      }`}
                    >
                      {customer.segment || 'Não Classificado'}
                    </Badge>
                    <span className="text-gray-400 text-sm">
                      Cliente desde {new Date(customer.created_at || '').toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
                
                {/* Contact Info */}
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  {customer.phone && (
                    <div className="flex items-center gap-1 text-gray-300">
                      <Phone className="h-4 w-4" />
                      <span>{customer.phone}</span>
                    </div>
                  )}
                  {customer.email && (
                    <div className="flex items-center gap-1 text-gray-300">
                      <Mail className="h-4 w-4" />
                      <span>{customer.email}</span>
                    </div>
                  )}
                  {customer.address && (
                    <div className="flex items-center gap-1 text-gray-300">
                      <MapPin className="h-4 w-4" />
                      <span>
                        {typeof customer.address === 'object' 
                          ? `${customer.address.city || ''}, ${customer.address.state || ''}`.trim().replace(/^,\s*|,\s*$/g, '') 
                          : customer.address
                        }
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Key Metrics */}
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-green-400">
                  {formatCurrency(customer.lifetime_value || 0)}
                </div>
                <div className="text-xs text-gray-400">Valor Total</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-400">
                  {customer.purchase_frequency || 0}
                </div>
                <div className="text-xs text-gray-400">Compras</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-400">
                  {customer.last_purchase_date 
                    ? Math.floor((new Date().getTime() - new Date(customer.last_purchase_date).getTime()) / (1000 * 3600 * 24))
                    : '-'
                  }
                </div>
                <div className="text-xs text-gray-400">Dias Atrás</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs System */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-8 bg-gray-800/50">
          <TabsTrigger value="overview" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Visão Geral</span>
            </div>
          </TabsTrigger>
          <TabsTrigger value="purchases" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
            <div className="flex items-center gap-1">
              <ShoppingBag className="h-4 w-4" />
              <span className="hidden sm:inline">Compras</span>
            </div>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
            <div className="flex items-center gap-1">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
            </div>
          </TabsTrigger>
          <TabsTrigger value="communication" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
            <div className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Comunicação</span>
            </div>
          </TabsTrigger>
          <TabsTrigger value="financial" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
            <div className="flex items-center gap-1">
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">Financeiro</span>
            </div>
          </TabsTrigger>
          <TabsTrigger value="insights" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
            <div className="flex items-center gap-1">
              <Lightbulb className="h-4 w-4" />
              <span className="hidden sm:inline">Insights IA</span>
            </div>
          </TabsTrigger>
          <TabsTrigger value="documents" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
            <div className="flex items-center gap-1">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Documentos</span>
            </div>
          </TabsTrigger>
          <TabsTrigger value="timeline" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Timeline</span>
            </div>
          </TabsTrigger>
        </TabsList>

        {/* Tab Contents */}
        <div className="mt-6">
          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {/* Card Resumo Financeiro Expandido */}
              <Card className="bg-gradient-to-br from-green-900/20 to-green-800/20 border-green-700/40">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-400" />
                    Resumo Financeiro
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Valor Total (LTV):</span>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-400">
                          {formatCurrency(customer.lifetime_value || 0)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {customer.purchase_frequency ? `${customer.purchase_frequency} compras` : 'Sem compras'}
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Ticket Médio:</span>
                      <div className="text-lg font-semibold text-purple-400">
                        {formatCurrency(
                          (customer.lifetime_value || 0) / Math.max(customer.purchase_frequency || 1, 1)
                        )}
                      </div>
                    </div>
                    <div className="pt-2 border-t border-gray-700/30">
                      <div className="text-xs text-gray-400 text-center">
                        Cliente desde {new Date(customer.created_at || '').toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Card Atividade & Engajamento */}
              <Card className="bg-gradient-to-br from-blue-900/20 to-blue-800/20 border-blue-700/40">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-400" />
                    Atividade & Engajamento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Última Compra:</span>
                      <div className="text-right">
                        <div className="text-sm font-medium text-blue-400">
                          {customer.last_purchase_date 
                            ? new Date(customer.last_purchase_date).toLocaleDateString('pt-BR')
                            : 'Nunca'
                          }
                        </div>
                        <div className="text-xs text-gray-500">
                          {customer.last_purchase_date 
                            ? `${Math.floor((new Date().getTime() - new Date(customer.last_purchase_date).getTime()) / (1000 * 3600 * 24))} dias atrás`
                            : 'Primeira compra pendente'
                          }
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Status:</span>
                      <Badge 
                        variant="outline" 
                        className={
                          customer.last_purchase_date && 
                          Math.floor((new Date().getTime() - new Date(customer.last_purchase_date).getTime()) / (1000 * 3600 * 24)) <= 30
                            ? "border-green-500/30 text-green-400"
                            : customer.last_purchase_date
                            ? "border-yellow-500/30 text-yellow-400"
                            : "border-gray-500/30 text-gray-400"
                        }
                      >
                        {customer.last_purchase_date && 
                         Math.floor((new Date().getTime() - new Date(customer.last_purchase_date).getTime()) / (1000 * 3600 * 24)) <= 30
                          ? "Ativo" 
                          : customer.last_purchase_date
                          ? "Dormindo"
                          : "Novo"
                        }
                      </Badge>
                    </div>
                    <div className="pt-2 border-t border-gray-700/30">
                      <div className="text-xs text-gray-400 text-center">
                        Primeira compra: {customer.first_purchase_date 
                          ? new Date(customer.first_purchase_date).toLocaleDateString('pt-BR')
                          : 'Ainda não realizada'
                        }
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Card Preferências & Perfil */}
              <Card className="bg-gradient-to-br from-purple-900/20 to-purple-800/20 border-purple-700/40">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-purple-400" />
                    Preferências & Perfil
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-300 text-sm">Categoria Favorita:</span>
                        <span className="text-purple-400 text-sm font-medium">
                          {customer.favorite_category || 'Não definida'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300 text-sm">Produto Favorito:</span>
                        <span className="text-purple-400 text-sm font-medium">
                          {customer.favorite_product || 'Não definido'}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-gray-700/30">
                      <span className="text-gray-300">Segmento:</span>
                      <Badge 
                        className={`
                          ${customer.segment === 'Fiel' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' : 
                            customer.segment === 'Regular' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                            customer.segment === 'Novo' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                            'bg-gray-500/20 text-gray-400 border-gray-500/30'
                          }
                        `}
                      >
                        {customer.segment || 'Não Classificado'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Card Contato & Comunicação */}
              <Card className="bg-gradient-to-br from-orange-900/20 to-orange-800/20 border-orange-700/40">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-orange-400" />
                    Contato & Comunicação
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300 text-sm">Telefone:</span>
                        <div className="flex items-center gap-2">
                          {customer.phone ? (
                            <>
                              <span className="text-green-400 text-xs">✓</span>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 px-2 text-xs text-orange-400 hover:text-orange-300"
                                onClick={handleWhatsApp}
                              >
                                WhatsApp
                              </Button>
                            </>
                          ) : (
                            <span className="text-red-400 text-xs">✗ Não cadastrado</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300 text-sm">Email:</span>
                        <div className="flex items-center gap-2">
                          {customer.email ? (
                            <>
                              <span className="text-green-400 text-xs">✓</span>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 px-2 text-xs text-orange-400 hover:text-orange-300"
                                onClick={handleEmail}
                              >
                                Enviar
                              </Button>
                            </>
                          ) : (
                            <span className="text-red-400 text-xs">✗ Não cadastrado</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-gray-700/30">
                      <span className="text-gray-300 text-sm">Localização:</span>
                      <span className="text-orange-400 text-sm">
                        {customer.address && typeof customer.address === 'object' 
                          ? `${customer.address.city || ''}, ${customer.address.state || ''}`.replace(/^,\s*|,\s*$/g, '') || 'N/A'
                          : customer.address || 'N/A'
                        }
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Seção de Métricas Avançadas */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-400" />
                Métricas Avançadas
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gray-800/20 border-gray-700/30">
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-cyan-400">
                        {purchases && purchases.length > 0 
                          ? Math.round(purchases.reduce((sum, p) => sum + p.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0) / purchases.length)
                          : 0
                        }
                      </div>
                      <div className="text-xs text-gray-400">Itens por Compra</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {purchases ? `${purchases.reduce((sum, p) => sum + p.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0)} itens total` : 'Sem compras'}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800/20 border-gray-700/30">
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-emerald-400">
                        {customer.purchase_frequency && customer.first_purchase_date && customer.last_purchase_date 
                          ? Math.round((new Date(customer.last_purchase_date).getTime() - new Date(customer.first_purchase_date).getTime()) / (1000 * 60 * 60 * 24) / customer.purchase_frequency)
                          : 0
                        }
                      </div>
                      <div className="text-xs text-gray-400">Dias Entre Compras</div>
                      <div className="text-xs text-gray-500 mt-1">Frequência média</div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800/20 border-gray-700/30">
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-violet-400">
                        {customer.lifetime_value && customer.purchase_frequency 
                          ? Math.round((customer.lifetime_value * 12) / Math.max(
                              Math.floor((new Date().getTime() - new Date(customer.created_at || '').getTime()) / (1000 * 60 * 60 * 24 * 30)), 
                              1
                            ))
                          : 0
                        }
                      </div>
                      <div className="text-xs text-gray-400">Valor Mensal Projetado</div>
                      <div className="text-xs text-gray-500 mt-1">Estimativa baseada no histórico</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Placeholders for other tabs */}
          <TabsContent value="purchases">
            <div className="space-y-6">
              {/* Header com filtros */}
              <Card className="bg-gray-800/30 border-gray-700/40">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white flex items-center gap-2">
                      <ShoppingBag className="h-5 w-5 text-green-400" />
                      Histórico de Compras
                      <Badge variant="outline" className="ml-2 border-green-500/30 text-green-400">
                        {filteredPurchases.length} compras
                      </Badge>
                    </CardTitle>
                    <div className="flex items-center gap-3">
                      {/* Busca por produto */}
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          placeholder="Buscar produtos..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 w-64 bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                      
                      {/* Filtro por período */}
                      <Select value={periodFilter} onValueChange={setPeriodFilter}>
                        <SelectTrigger className="w-40 bg-gray-700 border-gray-600">
                          <Filter className="h-4 w-4 mr-2" />
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas</SelectItem>
                          <SelectItem value="30">Últimos 30 dias</SelectItem>
                          <SelectItem value="90">Últimos 3 meses</SelectItem>
                          <SelectItem value="180">Últimos 6 meses</SelectItem>
                          <SelectItem value="365">Último ano</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                
                {/* Resumo das compras filtradas */}
                {filteredPurchases.length > 0 && (
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-green-400">
                          {formatCurrency(filteredPurchases.reduce((sum, p) => sum + p.total, 0))}
                        </div>
                        <div className="text-xs text-gray-400">Total Gasto</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-blue-400">
                          {filteredPurchases.reduce((sum, p) => sum + p.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0)}
                        </div>
                        <div className="text-xs text-gray-400">Itens Comprados</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-purple-400">
                          {formatCurrency(filteredPurchases.reduce((sum, p) => sum + p.total, 0) / Math.max(filteredPurchases.length, 1))}
                        </div>
                        <div className="text-xs text-gray-400">Ticket Médio</div>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>

              {/* Lista de compras */}
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {isLoadingPurchases ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400 mx-auto mb-3"></div>
                    <p className="text-gray-400">Carregando compras...</p>
                  </div>
                ) : purchasesError ? (
                  <Card className="bg-red-900/20 border-red-700/30">
                    <CardContent className="p-6 text-center">
                      <div className="text-red-400 mb-2">❌ Erro ao carregar compras</div>
                      <p className="text-sm text-gray-400">Tente recarregar a página</p>
                    </CardContent>
                  </Card>
                ) : filteredPurchases.length === 0 ? (
                  <Card className="bg-gray-800/30 border-gray-700/40">
                    <CardContent className="p-8 text-center">
                      <Package className="h-12 w-12 mx-auto mb-4 text-gray-500 opacity-50" />
                      <div className="text-gray-400">
                        {searchTerm || periodFilter !== 'all' ? 
                          'Nenhuma compra encontrada com os filtros aplicados' :
                          'Este cliente ainda não realizou compras'
                        }
                      </div>
                      {(searchTerm || periodFilter !== 'all') && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-3"
                          onClick={() => {
                            setSearchTerm('');
                            setPeriodFilter('all');
                          }}
                        >
                          Limpar Filtros
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  filteredPurchases.map((purchase) => (
                    <Card key={purchase.id} className="bg-gray-800/30 border-gray-700/40 hover:border-gray-600/50 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <div className="text-white font-medium">
                              Compra #{purchase.id.slice(-8)}
                            </div>
                            <div className="text-sm text-gray-400">
                              {new Date(purchase.date).toLocaleDateString('pt-BR', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-green-400">
                              {formatCurrency(purchase.total)}
                            </div>
                            <div className="text-xs text-gray-400">
                              {purchase.items.length} {purchase.items.length === 1 ? 'item' : 'itens'}
                            </div>
                          </div>
                        </div>
                        
                        {/* Lista de itens da compra */}
                        <div className="space-y-2 border-t border-gray-700/30 pt-3">
                          {purchase.items.map((item, index) => (
                            <div key={index} className="flex justify-between items-center text-sm">
                              <div className="flex-1">
                                <span className="text-gray-200">{item.product_name}</span>
                                <span className="text-gray-500 ml-2">x{item.quantity}</span>
                              </div>
                              <div className="text-gray-300">
                                {formatCurrency(item.unit_price)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="space-y-6">
              {/* Header da Analytics */}
              <Card className="bg-gray-800/30 border-gray-700/40">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-blue-400" />
                    Analytics Avançados
                    <Badge variant="outline" className="ml-2 border-blue-500/30 text-blue-400">
                      {purchases?.length || 0} compras analisadas
                    </Badge>
                  </CardTitle>
                </CardHeader>
              </Card>

              {purchases && purchases.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Gráfico de Vendas por Mês */}
                  <Card className="bg-gray-800/30 border-gray-700/40">
                    <CardHeader>
                      <CardTitle className="text-white text-base flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-400" />
                        Vendas por Mês
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                          <LineChart data={salesChartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis 
                              dataKey="month" 
                              stroke="#9CA3AF"
                              fontSize={12}
                            />
                            <YAxis 
                              stroke="#9CA3AF"
                              fontSize={12}
                              tickFormatter={(value) => formatCurrency(value)}
                            />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: '#1F2937', 
                                border: '1px solid #374151',
                                borderRadius: '8px'
                              }}
                              formatter={(value: number, name: string) => [
                                name === 'total' ? formatCurrency(value) : value,
                                name === 'total' ? 'Vendas' : 'Compras'
                              ]}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="total" 
                              stroke="#10B981" 
                              strokeWidth={2}
                              dot={{ fill: '#10B981' }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Gráfico de Produtos Mais Comprados */}
                  <Card className="bg-gray-800/30 border-gray-700/40">
                    <CardHeader>
                      <CardTitle className="text-white text-base flex items-center gap-2">
                        <Package className="h-4 w-4 text-blue-400" />
                        Top 10 Produtos
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                          <BarChart data={productsChartData} layout="horizontal">
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis 
                              type="number"
                              stroke="#9CA3AF"
                              fontSize={12}
                            />
                            <YAxis 
                              type="category"
                              dataKey="name"
                              stroke="#9CA3AF"
                              fontSize={10}
                              width={120}
                            />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: '#1F2937', 
                                border: '1px solid #374151',
                                borderRadius: '8px'
                              }}
                              formatter={(value: number) => [`${value} unidades`, 'Quantidade']}
                            />
                            <Bar 
                              dataKey="count" 
                              fill="#3B82F6"
                              radius={[0, 4, 4, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Gráfico de Frequência de Compras */}
                  {frequencyChartData.length > 0 && (
                    <Card className="bg-gray-800/30 border-gray-700/40 lg:col-span-2">
                      <CardHeader>
                        <CardTitle className="text-white text-base flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-purple-400" />
                          Padrão de Compras (Intervalos)
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div style={{ width: '100%', height: 300 }}>
                          <ResponsiveContainer>
                            <BarChart data={frequencyChartData}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                              <XAxis 
                                dataKey="purchase" 
                                stroke="#9CA3AF"
                                fontSize={12}
                              />
                              <YAxis 
                                stroke="#9CA3AF"
                                fontSize={12}
                                label={{ value: 'Dias', angle: -90, position: 'insideLeft' }}
                              />
                              <Tooltip 
                                contentStyle={{ 
                                  backgroundColor: '#1F2937', 
                                  border: '1px solid #374151',
                                  borderRadius: '8px'
                                }}
                                formatter={(value: number, _name: string, props: { payload: { date: string } }) => [
                                  `${value} dias`,
                                  `Intervalo (${props.payload.date})`
                                ]}
                              />
                              <Bar 
                                dataKey="days" 
                                fill="#8B5CF6"
                                radius={[4, 4, 0, 0]}
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Resumo Estatístico */}
                  <Card className="bg-gray-800/30 border-gray-700/40 lg:col-span-2">
                    <CardHeader>
                      <CardTitle className="text-white text-base flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-orange-400" />
                        Resumo Estatístico
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-400">
                            {formatCurrency(purchases.reduce((sum, p) => sum + p.total, 0))}
                          </div>
                          <div className="text-xs text-gray-400">Total Gasto</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-400">
                            {formatCurrency(purchases.reduce((sum, p) => sum + p.total, 0) / purchases.length)}
                          </div>
                          <div className="text-xs text-gray-400">Ticket Médio</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-400">
                            {purchases.reduce((sum, p) => sum + p.items.length, 0)}
                          </div>
                          <div className="text-xs text-gray-400">Itens Comprados</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-400">
                            {customer.purchase_frequency || 0}
                          </div>
                          <div className="text-xs text-gray-400">Frequência</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Card className="bg-gray-800/30 border-gray-700/40">
                  <CardContent className="py-12">
                    <div className="text-center text-gray-400">
                      <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg mb-2">Sem dados para análise</p>
                      <p className="text-sm">Este cliente ainda não possui histórico de compras suficiente para gerar gráficos.</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="communication">
            <Card className="bg-gray-800/30 border-gray-700/40">
              <CardHeader>
                <CardTitle className="text-white">Centro de Comunicação</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-400">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>📱 Centro de comunicação será implementado na Fase 4</p>
                  <p className="text-sm mt-2">WhatsApp, Email, SMS e templates</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="financial">
            <Card className="bg-gray-800/30 border-gray-700/40">
              <CardHeader>
                <CardTitle className="text-white">Perfil Financeiro</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-400">
                  <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>💳 Perfil financeiro será implementado na Fase 6</p>
                  <p className="text-sm mt-2">Credit scoring, contas a receber, análises</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights">
            <Card className="bg-gray-800/30 border-gray-700/40">
              <CardHeader>
                <CardTitle className="text-white">Insights IA & N8N</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-400">
                  <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>🤖 Insights IA serão implementados na Fase 5</p>
                  <p className="text-sm mt-2">Machine Learning, recomendações e automações N8N</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents">
            <Card className="bg-gray-800/30 border-gray-700/40">
              <CardHeader>
                <CardTitle className="text-white">Documentos & Anexos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-400">
                  <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>📄 Sistema de documentos será implementado em fase futura</p>
                  <p className="text-sm mt-2">Contratos, anexos e arquivos</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timeline">
            <Card className="bg-gray-800/30 border-gray-700/40">
              <CardHeader>
                <CardTitle className="text-white">Timeline de Atividades</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-400">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>📅 Timeline completa será implementada em fase futura</p>
                  <p className="text-sm mt-2">Histórico completo de todas as atividades</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};