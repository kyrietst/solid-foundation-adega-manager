/**
 * CustomerInsightsTab.tsx - Tab SSoT v3.1.0 Server-Side
 *
 * @description
 * Componente SSoT completo que busca dados diretamente do banco.
 * Elimina dependência de props e implementa performance otimizada.
 *
 * @features
 * - Busca direta do banco (sem props)
 * - Gráficos interativos com dados em tempo real
 * - Insights de IA baseados em dados frescos
 * - Loading e error states internos
 * - Analytics completos server-side
 * - Cache inteligente e auto-refresh
 * - Glassmorphism effects
 *
 * @author Adega Manager Team
 * @version 3.1.0 - SSoT Server-Side Implementation
 */

import React, { useCallback } from 'react';
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
import { LoadingSpinner } from '@/shared/ui/composite/loading-spinner';
import { Button } from '@/shared/ui/primitives/button';
import { useCustomerInsightsSSoT } from '@/shared/hooks/business/useCustomerInsightsSSoT';

// ============================================================================
// TYPES
// ============================================================================

export interface CustomerInsightsTabProps {
  customerId: string;
  className?: string;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export const CustomerInsightsTab: React.FC<CustomerInsightsTabProps> = React.memo(({
  customerId,
  className = ''
}) => {
  // ============================================================================
  // BUSINESS LOGIC COM SSoT v3.1.0
  // ============================================================================

  const { handleMouseMove } = useGlassmorphismEffect();

  const {
    customer,
    purchases,
    isLoading,
    error,
    salesChartData,
    productsChartData,
    frequencyChartData,
    insights,
    hasAnalyticsData,
    hasFrequencyData,
    chartColors,
    refetch,
    hasData,
    isEmpty
  } = useCustomerInsightsSSoT(customerId);

  // ============================================================================
  // RISK LEVEL STYLING - OTIMIZADO COM useCallback
  // ============================================================================

  const getRiskBadgeStyle = useCallback((riskLevel: string) => {
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
  }, []);

  const getGrowthBadgeStyle = useCallback((growthPotential: string) => {
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
  }, []);

  // ============================================================================
  // LOADING STATES SSoT v3.1.0
  // ============================================================================

  if (isLoading) {
    return (
      <section
        className={`bg-black/80 backdrop-blur-sm border border-white/10 rounded-xl shadow-lg py-6 px-4 sm:px-6 space-y-6 ${className}`}
        onMouseMove={handleMouseMove}
      >
        <Card className="bg-gray-800/30 border-gray-700/40">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-400" />
              Analytics & Insights IA
              <LoadingSpinner size="sm" className="ml-2" />
            </CardTitle>
          </CardHeader>
          <CardContent className="py-8">
            <div className="space-y-6">
              {/* Skeleton para estatísticas */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="bg-gray-800/50 rounded-lg p-4 space-y-3">
                    <div className="h-3 bg-gray-700/50 rounded animate-pulse w-1/2" />
                    <div className="h-6 bg-gray-700/50 rounded animate-pulse w-3/4" />
                    <div className="h-3 bg-gray-700/50 rounded animate-pulse w-2/3" />
                  </div>
                ))}
              </div>

              {/* Skeleton para gráficos */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="bg-gray-800/50 rounded-lg p-4 space-y-4">
                    <div className="h-4 bg-gray-700/50 rounded animate-pulse w-1/3" />
                    <div className="h-48 bg-gray-700/30 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  // ============================================================================
  // ERROR STATES SSoT v3.1.0
  // ============================================================================

  if (error) {
    return (
      <section
        className={`bg-black/80 backdrop-blur-sm border border-white/10 rounded-xl shadow-lg py-6 px-4 sm:px-6 space-y-6 ${className}`}
        onMouseMove={handleMouseMove}
      >
        <Card className="bg-gradient-to-br from-red-900/30 to-red-800/20 border-red-700/40">
          <CardContent className="py-12">
            <div className="text-center space-y-6">
              <div className="relative">
                <AlertTriangle className="h-16 w-16 mx-auto text-red-500 opacity-80" />
                <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl" />
              </div>

              <div className="space-y-3">
                <h3 className="text-xl font-semibold text-white">
                  Falha na Conexão
                </h3>
                <p className="text-red-300 max-w-md mx-auto leading-relaxed">
                  Não foi possível carregar os dados de analytics e insights para este cliente.
                  Verifique sua conexão e tente novamente.
                </p>
              </div>

              <div className="bg-red-900/30 border border-red-700/40 rounded-lg p-4 max-w-sm mx-auto">
                <div className="text-red-300 text-sm">
                  <strong>Código do erro:</strong> {error?.message || 'Erro desconhecido'}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={() => refetch()}
                  variant="outline"
                  className="border-red-500/40 text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Tentar Novamente
                </Button>

                <Button
                  onClick={() => window.location.reload()}
                  variant="ghost"
                  className="text-gray-400 hover:text-white hover:bg-gray-700/30"
                >
                  Recarregar Página
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  // ============================================================================
  // RENDER PRINCIPAL SSoT v3.1.0
  // ============================================================================

  return (
    <section
      className={`bg-black/80 backdrop-blur-sm border border-white/10 rounded-xl shadow-lg py-6 px-4 sm:px-6 hover:shadow-2xl hover:shadow-purple-500/10 hover:border-purple-400/30 transition-all duration-300 space-y-6 ${className}`}
      onMouseMove={handleMouseMove}
    >
      {/* Header dos Insights com Informações de Atualização - Redesign UX/UI v3.2.0 */}
      <Card className="bg-black/70 backdrop-blur-xl border-white/20 hover:border-accent-purple/60 hover:shadow-xl transition-all duration-300">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-white font-semibold text-lg flex items-center gap-2">
              <Brain className="h-5 w-5 text-accent-purple" />
              Analytics & Insights IA
              <Badge variant="outline" className="border-2 border-accent-purple/60 text-accent-purple bg-accent-purple/20 font-semibold">
                {purchases?.length || 0} compras analisadas
              </Badge>
            </CardTitle>

            <div className="flex items-center gap-3 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span>Dados em tempo real</span>
              </div>
              <Button
                onClick={() => refetch()}
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-purple-400 hover:bg-purple-500/10 transition-colors"
              >
                <Brain className="h-4 w-4 mr-1" />
                Atualizar
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {hasAnalyticsData ? (
        <div className="space-y-6">
          {/* Insights de IA - Seção Principal - Redesign UX/UI v3.2.0 */}
          <Card className="bg-black/70 backdrop-blur-xl border-white/20 hover:border-accent-purple/60 hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-white font-semibold text-lg flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-accent-purple" />
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
                formatType="none"
              />

              <StatCard
                layout="crm"
                variant="purple"
                title="Score de Oportunidade"
                value={`${insights.opportunityScore}/100`}
                description="🎯 Potencial calculado"
                icon={Target}
                formatType="none"
              />

              <StatCard
                layout="crm"
                variant="warning"
                title="Nível de Engajamento"
                value={insights.engagementLevel === 'high' ? 'Alto' : insights.engagementLevel === 'medium' ? 'Médio' : 'Baixo'}
                description="⚡ Atividade atual"
                icon={Zap}
                formatType="none"
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

          {/* Gráficos Analíticos - Responsivo Otimizado */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Gráfico de Vendas por Mês - Redesign UX/UI v3.2.0 */}
            <Card className="bg-black/70 backdrop-blur-xl border-white/20 hover:border-accent-green/60 hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-white font-semibold text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-accent-green" />
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
                        labelStyle={{
                          color: '#E5E7EB',
                          fontWeight: '600'
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

            {/* Gráfico de Top Produtos - Redesign UX/UI v3.2.0 */}
            <Card className="bg-black/70 backdrop-blur-xl border-white/20 hover:border-accent-blue/60 hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-white font-semibold text-base flex items-center gap-2">
                  <Package className="h-4 w-4 text-accent-blue" />
                  Top Produtos Preferidos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div style={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer>
                    <BarChart
                      data={productsChartData}
                      margin={{ top: 5, right: 20, left: 10, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis
                        dataKey="name"
                        stroke="#9CA3AF"
                        fontSize={12}
                      />
                      <YAxis
                        stroke="#9CA3AF"
                        fontSize={12}
                        allowDecimals={false}
                        domain={[0, 'dataMax']}
                        label={{ value: 'Quantidade (un)', angle: -90, position: 'insideLeft' }}
                      />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: '#1F2937',
                          border: '1px solid #374151',
                          borderRadius: '8px'
                        }}
                        labelStyle={{
                          color: '#E5E7EB',
                          fontWeight: '600'
                        }}
                        formatter={(value: number) => [`${value} unidades`, 'Quantidade']}
                      />
                      <Bar
                        dataKey="count"
                        fill="#3B82F6"
                        radius={[4, 4, 0, 0]}
                        barSize={40}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Gráfico de Frequência (se houver dados) - Redesign UX/UI v3.2.0 */}
            {hasFrequencyData && (
              <Card className="bg-black/70 backdrop-blur-xl border-white/20 hover:border-accent-purple/60 hover:shadow-xl transition-all duration-300 xl:col-span-2">
                <CardHeader>
                  <CardTitle className="text-white font-semibold text-base flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-accent-purple" />
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
                          labelStyle={{
                            color: '#E5E7EB',
                            fontWeight: '600'
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
        <Card className="bg-gradient-to-br from-gray-800/40 to-gray-900/60 border-gray-700/40">
          <CardContent className="py-16">
            <div className="text-center space-y-6">
              <div className="relative">
                <Brain className="h-16 w-16 mx-auto text-gray-600 opacity-60" />
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full blur-xl" />
              </div>

              <div className="space-y-3">
                <h3 className="text-xl font-semibold text-white">
                  Insights em Preparação
                </h3>
                <p className="text-gray-400 max-w-md mx-auto leading-relaxed">
                  Este cliente ainda não possui histórico de compras suficiente para gerar
                  analytics e insights detalhados com IA.
                </p>
              </div>

              <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-4 max-w-sm mx-auto">
                <div className="flex items-center gap-3 text-blue-400">
                  <Lightbulb className="h-5 w-5 flex-shrink-0" />
                  <div className="text-left">
                    <div className="font-medium text-sm">Dica Estratégica</div>
                    <div className="text-xs text-blue-300">
                      Realize vendas para desbloquear insights de IA
                    </div>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => refetch()}
                variant="outline"
                className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10 transition-colors"
              >
                <Brain className="h-4 w-4 mr-2" />
                Verificar Novamente
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </section>
  );
});

// Adicionar displayName para debugging melhor
CustomerInsightsTab.displayName = 'CustomerInsightsTab';

export default CustomerInsightsTab;