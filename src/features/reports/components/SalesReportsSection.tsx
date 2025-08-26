/**
 * Sales Reports Section - Sprint 2
 * Comprehensive sales analysis with filters and metrics
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { Button } from '@/shared/ui/primitives/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/primitives/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/primitives/tabs';
import { LoadingSpinner } from '@/shared/ui/composite/loading-spinner';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Package, CreditCard, Download, Filter, History, BarChart3 } from 'lucide-react';
import { cn } from '@/core/config/utils';
import { SalesHistoryTable } from './SalesHistoryTable';
import { useLocation } from 'react-router-dom';

interface SalesFilters {
  category: string;
  paymentMethod: string;
}

interface SalesReportsSectionProps {
  period?: number;
}

export const SalesReportsSection: React.FC<SalesReportsSectionProps> = ({ period = 90 }) => {
  const location = useLocation();
  const [filters, setFilters] = useState<SalesFilters>({
    category: 'all',
    paymentMethod: 'all'
  });

  const [showFilters, setShowFilters] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState('analytics');

  // Detecta parâmetro subtab da URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const subtab = searchParams.get('subtab');
    
    if (subtab === 'history') {
      setActiveSubTab('history');
    } else {
      setActiveSubTab('analytics');
    }
  }, [location.search]);

  // Sales Metrics Query
  const { data: salesMetrics, isLoading: loadingMetrics } = useQuery({
    queryKey: ['sales-metrics', period],
    queryFn: async () => {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - period);

      const { data, error } = await supabase
        .rpc('get_sales_metrics', {
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString()
        });

      if (error) throw error;
      return data?.[0] || { total_revenue: 0, total_sales: 0, average_ticket: 0 };
    },
    staleTime: 5 * 60 * 1000,
  });

  // Top Products Query - com fallback manual para garantir nomes reais
  const { data: topProducts, isLoading: loadingProducts } = useQuery({
    queryKey: ['top-products', period],
    queryFn: async () => {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - period);

      console.log('🔍 Buscando top produtos...');

      try {
        // FORÇAR fallback manual para garantir que nomes reais sejam exibidos
        console.log('🚀 Forçando cálculo manual para garantir nomes reais...');
        throw new Error('Forçando fallback manual para debug');
        
        // Tentar usar RPC primeiro (comentado para forçar fallback)
        // const { data, error } = await supabase
        //   .rpc('get_top_products', {
        //     start_date: startDate.toISOString(),
        //     end_date: endDate.toISOString(),
        //     limit_count: 10,
        //     by: 'revenue'
        //   });

        // if (error) {
        //   console.warn('⚠️ RPC get_top_products falhou, usando query manual:', error);
        //   throw error;
        // }

        // console.log('✅ Top products from RPC:', data);
        // return data || [];
      } catch (error) {
        console.log('📊 Executando cálculo manual de top produtos...');
        
        // Fallback manual: query direta com JOIN para garantir nomes reais
        const { data: salesData, error: salesError } = await supabase
          .from('sale_items')
          .select(`
            product_id,
            quantity,
            unit_price,
            products!inner (
              id,
              name,
              category
            ),
            sales!inner (
              created_at,
              status
            )
          `)
          .gte('sales.created_at', startDate.toISOString())
          .lte('sales.created_at', endDate.toISOString())
          .eq('sales.status', 'completed');

        if (salesError) {
          console.error('❌ Erro na query manual de top produtos:', salesError);
          throw salesError;
        }

        // Agrupar por produto e calcular receita
        const productRevenues = new Map();
        
        (salesData || []).forEach((item: any) => {
          const productId = item.product_id;
          const productName = item.products?.name || `Produto ${productId.slice(-8)}`;
          const revenue = item.quantity * parseFloat(item.unit_price || 0);
          
          if (productRevenues.has(productId)) {
            const current = productRevenues.get(productId);
            productRevenues.set(productId, {
              ...current,
              revenue: current.revenue + revenue,
              quantity: current.quantity + item.quantity
            });
          } else {
            productRevenues.set(productId, {
              id: productId,
              name: productName,
              revenue: revenue,
              quantity: item.quantity
            });
          }
        });

        // Ordenar por receita e pegar top 10
        const topProductsArray = Array.from(productRevenues.values())
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 10)
          .map(product => ({
            ...product,
            name: truncateProductName(product.name, 15), // Truncar para legibilidade
            fullName: product.name // Manter nome completo para tooltip
          }));

        console.log('✅ Top produtos calculados manualmente:', topProductsArray);
        return topProductsArray;
      }
    },
    staleTime: 5 * 60 * 1000,
  });

  // Sales by Category Query - com fallback manual para categorias reais de produtos
  const { data: categoryData, isLoading: loadingCategories } = useQuery({
    queryKey: ['sales-by-category', period],
    queryFn: async () => {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - period);

      console.log('🔍 Buscando vendas por categoria...');

      try {
        // FORÇAR fallback manual para garantir categorias corretas de produtos
        console.log('🚀 Forçando cálculo manual de categorias para garantir dados corretos...');
        throw new Error('Forçando fallback manual para debug');
        
        // Tentar usar RPC primeiro (comentado para forçar fallback)
        // const { data, error } = await supabase
        //   .rpc('get_sales_by_category', {
        //     start_date: startDate.toISOString(),
        //     end_date: endDate.toISOString()
        //   });

        // if (error) {
        //   console.warn('⚠️ RPC get_sales_by_category falhou, usando query manual:', error);
        //   throw error;
        // }

        // const result = (data || []).map((item: any) => ({
        //   category: item.category_name || item.category || 'Sem categoria',
        //   revenue: Number(item.total_revenue || 0)
        // }));

        // console.log('✅ Categorias from RPC:', result);
        // return result;
      } catch (error) {
        console.log('📊 Executando cálculo manual de vendas por categoria...');
        
        // Fallback manual: query direta por categorias de produtos (não payment_method)
        const { data: salesData, error: salesError } = await supabase
          .from('sale_items')
          .select(`
            quantity,
            unit_price,
            products!inner (
              category
            ),
            sales!inner (
              created_at,
              status
            )
          `)
          .gte('sales.created_at', startDate.toISOString())
          .lte('sales.created_at', endDate.toISOString())
          .eq('sales.status', 'completed');

        if (salesError) {
          console.error('❌ Erro na query manual de categorias:', salesError);
          throw salesError;
        }

        // Agrupar por categoria de produto e calcular receita
        const categoryRevenues = new Map();
        
        (salesData || []).forEach((item: any) => {
          const category = item.products?.category || 'Sem categoria';
          const revenue = item.quantity * parseFloat(item.unit_price || 0);
          
          if (categoryRevenues.has(category)) {
            categoryRevenues.set(category, categoryRevenues.get(category) + revenue);
          } else {
            categoryRevenues.set(category, revenue);
          }
        });

        // Converter para array e traduzir categorias
        const categoryArray = Array.from(categoryRevenues.entries())
          .map(([category, revenue]) => ({
            category: translateCategory(category),
            revenue: revenue
          }))
          .sort((a, b) => b.revenue - a.revenue);

        console.log('✅ Categorias calculadas manualmente:', categoryArray);
        return categoryArray;
      }
    },
    staleTime: 5 * 60 * 1000,
  });

  // Sales by Payment Method Query
  const { data: paymentData, isLoading: loadingPayments } = useQuery({
    queryKey: ['sales-by-payment', period],
    queryFn: async () => {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - period);

      const { data, error } = await supabase
        .rpc('get_sales_by_payment_method', {
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString()
        });

      if (error) throw error;
      return (data || []).map((item: any) => ({
        method: translatePaymentMethod(item.payment_method),
        count: Number(item.total_sales || 0),
        revenue: Number(item.total_revenue || 0),
        avg_ticket: Number(item.avg_ticket || 0)
      }));
    },
    staleTime: 5 * 60 * 1000,
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Função para traduzir categorias de produtos
  const translateCategory = (category: string): string => {
    const translations: Record<string, string> = {
      'beverages': 'Bebidas',
      'snacks': 'Petiscos',
      'cigarettes': 'Cigarros',
      'beer': 'Cerveja',
      'wine': 'Vinho',
      'spirits': 'Destilados',
      'non_alcoholic': 'Não Alcoólicos',
      'food': 'Comida',
      'accessories': 'Acessórios',
      'others': 'Outros'
    };
    return translations[category?.toLowerCase()] || category || 'Sem categoria';
  };

  // Função para traduzir métodos de pagamento
  const translatePaymentMethod = (method: string): string => {
    const translations: Record<string, string> = {
      'credit_card': 'Cartão de Crédito',
      'debit_card': 'Cartão de Débito', 
      'pix': 'PIX',
      'cash': 'Dinheiro',
      'money': 'Dinheiro',
      'card': 'Cartão'
    };
    return translations[method?.toLowerCase()] || method || 'Não informado';
  };

  // Função para truncar nomes de produtos para o gráfico
  const truncateProductName = (name: string, maxLength: number = 15): string => {
    if (!name) return 'Produto';
    if (name.length <= maxLength) return name;
    return name.substring(0, maxLength) + '...';
  };

  const COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#f97316'];

  return (
    <div className="space-y-6">
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="space-y-6">
        <TabsList className="bg-black/80 border border-white/10 backdrop-blur-sm">
          <TabsTrigger 
            value="analytics"
            className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-300 data-[state=active]:border data-[state=active]:border-blue-400/30 transition-all duration-300"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics & Métricas
          </TabsTrigger>
          <TabsTrigger 
            value="history"
            className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300 data-[state=active]:border data-[state=active]:border-purple-400/30 transition-all duration-300"
          >
            <History className="h-4 w-4 mr-2" />
            Histórico Completo
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-6">
          {/* Sales Metrics Cards com glassmorphism padronizado */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-gray-800/30 border-gray-700/40 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 hover:border-blue-400/30 hover:bg-gray-700/40">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-8 w-8 text-blue-400 transition-all duration-300" />
                  <div>
                    <p className="text-sm text-gray-400">Receita Total</p>
                    <div className="text-2xl font-bold text-white">
                      {loadingMetrics ? (
                        <LoadingSpinner size="sm" color="yellow" />
                      ) : (
                        formatCurrency(salesMetrics?.total_revenue || 0)
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/30 border-gray-700/40 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl hover:shadow-green-500/10 hover:border-green-400/30 hover:bg-gray-700/40">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Package className="h-8 w-8 text-green-400 transition-all duration-300" />
                  <div>
                    <p className="text-sm text-gray-400">Total de Vendas</p>
                    <div className="text-2xl font-bold text-white">
                      {loadingMetrics ? (
                        <LoadingSpinner size="sm" color="yellow" />
                      ) : (
                        salesMetrics?.total_sales || 0
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/30 border-gray-700/40 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10 hover:border-purple-400/30 hover:bg-gray-700/40">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-8 w-8 text-purple-400 transition-all duration-300" />
                  <div>
                    <p className="text-sm text-gray-400">Ticket Médio</p>
                    <div className="text-2xl font-bold text-white">
                      {loadingMetrics ? (
                        <LoadingSpinner size="sm" color="yellow" />
                      ) : (
                        formatCurrency(salesMetrics?.average_ticket || 0)
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section com glassmorphism */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Products Chart */}
            <Card className="bg-gray-800/30 border-gray-700/40 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 hover:border-blue-400/30 hover:bg-gray-700/40">
              <CardHeader>
                <CardTitle className="text-white">Top 10 Produtos (Receita)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topProducts?.slice(0, 8) || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        dataKey="name" 
                        stroke="#9ca3af"
                        fontSize={10}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        interval={0}
                        tick={{ fontSize: 10 }}
                      />
                      <YAxis stroke="#9ca3af" fontSize={12} />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: '#1f2937',
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#ffffff'
                        }}
                        formatter={(value, name, props) => [
                          formatCurrency(Number(value)), 
                          'Receita'
                        ]}
                        labelFormatter={(label, payload) => {
                          if (payload && payload[0] && payload[0].payload.fullName) {
                            return payload[0].payload.fullName;
                          }
                          return label;
                        }}
                      />
                      <Bar dataKey="revenue" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Sales by Category */}
            <Card className="bg-gray-800/30 border-gray-700/40 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10 hover:border-purple-400/30 hover:bg-gray-700/40">
              <CardHeader>
                <CardTitle className="text-white">Vendas por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData || []}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="revenue"
                        label={({ category, percent }) => {
                          // Debug log para ver os dados
                          console.log('🎯 Pie Chart Data:', { category, percent, data: categoryData });
                          return `${category} (${(percent * 100).toFixed(0)}%)`;
                        }}
                      >
                        {(categoryData || []).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: '#1f2937',
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#ffffff'
                        }}
                        formatter={(value) => [formatCurrency(Number(value)), 'Receita']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <SalesHistoryTable />
        </TabsContent>
      </Tabs>
    </div>
  );
};