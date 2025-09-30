/**
 * CustomerInsightsTab.tsx - Tab consolidada de Analytics + Insights IA
 *
 * @description
 * Componente SSoT v3.0.0 que unifica analytics e insights de IA em uma
 * interface única e otimizada. Elimina a redundância de 70% entre as duas tabs.
 *
 * @features
 * - Gráficos interativos (vendas por mês, top produtos, frequência)
 * - Insights de IA integrados
 * - Recomendações automáticas
 * - Análise de risco e oportunidades
 * - Métricas estatísticas avançadas
 * - Business logic centralizada em hooks
 * - Glassmorphism effects
 *
 * @author Adega Manager Team
 * @version 3.0.0 - SSoT Implementation
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { Badge } from '@/shared/ui/primitives/badge';
import { StatCard } from '@/shared/ui/composite/stat-card';
import { useGlassmorphismEffect } from '@/shared/hooks/ui/useGlassmorphismEffect';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  Package,
  Calendar,
  DollarSign,
  Lightbulb,
  Target,
  AlertTriangle,
  Brain,
  Zap
} from 'lucide-react';
import { formatCurrency } from '@/core/config/utils';
import { useCustomerAnalytics } from '@/shared/hooks/business/useCustomerAnalytics';
import { type Purchase } from '@/shared/hooks/business/useCustomerPurchaseHistory';

// ============================================================================
// TYPES
// ============================================================================

export interface CustomerInsightsTabProps {
  purchases: Purchase[];
  customerData?: {
    segmento?: string;
    totalCompras?: number;
    valorTotalCompras?: number;
    ultimaCompra?: string;
  };
  className?: string;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export const CustomerInsightsTab: React.FC<CustomerInsightsTabProps> = ({
  purchases = [],
  customerData,
  className = ''
}) => {
  // ============================================================================
  // BUSINESS LOGIC COM SSoT
  // ============================================================================

  const { handleMouseMove } = useGlassmorphismEffect();

  const {
    salesChartData,
    productsChartData,
    frequencyChartData,
    insights,
    hasAnalyticsData,
    hasFrequencyData,
    chartColors
  } = useCustomerAnalytics(purchases, customerData);

  // ============================================================================
  // RISK LEVEL STYLING
  // ============================================================================

  const getRiskBadgeStyle = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getGrowthBadgeStyle = (growthPotential: string) => {
    switch (growthPotential) {
      case 'high':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'medium':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'low':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <section
      className={`bg-black/80 backdrop-blur-sm border border-white/10 rounded-xl shadow-lg p-6 hover:shadow-2xl hover:shadow-purple-500/10 hover:border-purple-400/30 transition-all duration-300 space-y-6 ${className}`}
      onMouseMove={handleMouseMove}
    >
      {/* Header dos Insights */}
      <Card className="bg-gray-800/30 border-gray-700/40">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-400" />
            Analytics & Insights IA
            <Badge variant="outline" className="ml-2 border-purple-500/30 text-purple-400">
              {purchases?.length || 0} compras analisadas
            </Badge>
          </CardTitle>
        </CardHeader>
      </Card>

      {hasAnalyticsData ? (
        <div className="space-y-6">
          {/* Insights de IA - Seção Principal */}
          <Card className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-purple-700/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-purple-400" />
                Insights de IA & Recomendações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Lado esquerdo - Recomendações */}
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-2">🎯 Próxima Ação Recomendada</h4>
                    <div className="bg-blue-900/30 border border-blue-700/30 rounded-lg p-3">
                      <p className="text-blue-400 font-medium">{insights.nextBestAction}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-2">📊 Segmentação Inteligente</h4>
                    <div className="bg-green-900/30 border border-green-700/30 rounded-lg p-3">
                      <p className="text-green-400">{insights.segmentRecommendation}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-2">🛍️ Produtos Preferidos</h4>
                    <div className="flex flex-wrap gap-2">
                      {insights.preferredProducts.slice(0, 3).map((product, index) => (
                        <Badge key={index} variant="outline" className="border-purple-500/30 text-purple-400">
                          {product}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Lado direito - Métricas de risco e oportunidade */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-800/50 rounded-lg p-3">
                      <div className="text-xs text-gray-400 mb-1">Nível de Risco</div>
                      <Badge className={getRiskBadgeStyle(insights.riskLevel)}>
                        {insights.riskLevel === 'high' ? 'Alto' :
                         insights.riskLevel === 'medium' ? 'Médio' : 'Baixo'}
                      </Badge>
                    </div>

                    <div className="bg-gray-800/50 rounded-lg p-3">
                      <div className="text-xs text-gray-400 mb-1">Potencial de Crescimento</div>
                      <Badge className={getGrowthBadgeStyle(insights.growthPotential)}>
                        {insights.growthPotential === 'high' ? 'Alto' :
                         insights.growthPotential === 'medium' ? 'Médio' : 'Baixo'}
                      </Badge>
                    </div>
                  </div>

                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <div className="text-xs text-gray-400 mb-2">Score de Oportunidade</div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${insights.opportunityScore}%` }}
                        />
                      </div>
                      <span className="text-purple-400 font-medium">{insights.opportunityScore}%</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs text-gray-400 mb-2">🎯 Indicadores de Fidelidade</h4>
                    <div className="space-y-1">
                      {insights.loyaltyIndicators.map((indicator, index) => (
                        <div key={index} className="text-xs text-gray-300 flex items-center gap-2">
                          <div className="w-1 h-1 bg-purple-400 rounded-full" />
                          {indicator}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Métricas Avançadas com StatCard */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-400" />
              Métricas de Performance
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <StatCard
                layout="crm"
                variant="success"
                title="Contribuição de Receita"
                value={`${insights.revenueContribution}%`}
                description="💰 % da base total"
                icon={DollarSign}
              />

              <StatCard
                layout="crm"
                variant="purple"
                title="Score de Oportunidade"
                value={`${insights.opportunityScore}/100`}
                description="🎯 Potencial calculado"
                icon={Target}
              />

              <StatCard
                layout="crm"
                variant="warning"
                title="Nível de Engajamento"
                value={insights.engagementLevel === 'high' ? 'Alto' : insights.engagementLevel === 'medium' ? 'Médio' : 'Baixo'}
                description="⚡ Atividade atual"
                icon={Zap}
              />

              <StatCard
                layout="crm"
                variant="default"
                title="Produtos Favoritos"
                value={insights.preferredProducts.length}
                description="🛍️ Diversidade"
                icon={Package}
              />
            </div>
          </div>

          {/* Gráficos Analíticos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico de Vendas por Mês */}
            <Card className="bg-gray-800/30 border-gray-700/40">
              <CardHeader>
                <CardTitle className="text-white text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-400" />
                  Evolução de Vendas
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
                      <RechartsTooltip
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

            {/* Gráfico de Top Produtos */}
            <Card className="bg-gray-800/30 border-gray-700/40">
              <CardHeader>
                <CardTitle className="text-white text-base flex items-center gap-2">
                  <Package className="h-4 w-4 text-blue-400" />
                  Top Produtos Preferidos
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
                      <RechartsTooltip
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

            {/* Gráfico de Frequência (se houver dados) */}
            {hasFrequencyData && (
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
                        <RechartsTooltip
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
          </div>
        </div>
      ) : (
        <Card className="bg-gray-800/30 border-gray-700/40">
          <CardContent className="py-12">
            <div className="text-center text-gray-400">
              <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">Sem dados para análise</p>
              <p className="text-sm">Este cliente ainda não possui histórico suficiente para gerar insights e analytics.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </section>
  );
};

export default CustomerInsightsTab;