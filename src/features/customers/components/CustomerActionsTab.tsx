/**
 * CustomerActionsTab.tsx - Tab SSoT v3.1.0 Revenue Intelligence Center
 *
 * @description
 * Componente SSoT completo que busca dados diretamente do banco para ações comerciais.
 * Centro de inteligência que transforma dados em receita através de ações personalizadas.
 *
 * @features
 * - Busca direta do banco (sem props)
 * - IA para recomendações inteligentes
 * - Análise de risco de churn em tempo real
 * - Executores de ações automatizadas
 * - Métricas de conversão e ROI
 * - Sistema de comunicação centralizado
 * - Loading e error states internos
 * - Business logic centralizada em hook SSoT
 * - Cache inteligente e auto-refresh
 * - Revenue Intelligence Engine
 *
 * @author Adega Manager Team
 * @version 3.1.0 - SSoT Revenue Intelligence Implementation
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { Button } from '@/shared/ui/primitives/button';
import { Badge } from '@/shared/ui/primitives/badge';
import { StatCard } from '@/shared/ui/composite/stat-card';
import { LoadingSpinner } from '@/shared/ui/composite/loading-spinner';
import { useGlassmorphismEffect } from '@/shared/hooks/ui/useGlassmorphismEffect';
import {
  Zap,
  ShoppingBag,
  Target,
  MessageSquare,
  Mail,
  Gift,
  TrendingUp,
  Users,
  Percent,
  Star,
  ExternalLink,
  Plus,
  Package,
  AlertTriangle,
  Brain,
  DollarSign,
  AlertCircle,
  Phone
} from 'lucide-react';
import { useCustomerActionsSSoT } from '@/shared/hooks/business/useCustomerActionsSSoT';
import { formatCurrency } from '@/core/config/utils';

// ============================================================================
// TYPES
// ============================================================================

export interface CustomerActionsTabProps {
  customerId: string;
  className?: string;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export const CustomerActionsTab: React.FC<CustomerActionsTabProps> = ({
  customerId,
  className = ''
}) => {
  // ============================================================================
  // BUSINESS LOGIC COM SSoT v3.1.0
  // ============================================================================

  const { handleMouseMove } = useGlassmorphismEffect();

  const {
    customer,
    realMetrics,
    recommendedActions,
    riskAnalysis,
    revenueOpportunities,
    isLoading,
    error,
    executeAction,
    sendTargetedPromo,
    sendWhatsApp,
    sendEmail,
    conversionMetrics,
    roiCalculator,
    hasIntelligentSuggestions,
    hasContactInfo,
    hasPhoneNumber,
    hasEmailAddress,
    isHighValue,
    isAtRisk,
    needsAttention,
    hasData,
    isEmpty,
    refetch
  } = useCustomerActionsSSoT(customerId);

  // ============================================================================
  // GUARDS E VALIDAÇÕES
  // ============================================================================

  // Loading state
  if (isLoading) {
    return (
      <section className={`bg-black/80 backdrop-blur-sm border border-white/10 rounded-xl shadow-lg py-6 px-4 sm:px-6 space-y-6 ${className}`}>
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner text="Carregando centro de ações..." />
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className={`bg-black/80 backdrop-blur-sm border border-white/10 rounded-xl shadow-lg py-6 px-4 sm:px-6 space-y-6 ${className}`}>
        <Card className="bg-red-900/20 border-red-500/30">
          <CardContent className="p-6 text-center">
            <div className="text-red-400 text-lg">❌ Erro ao carregar centro de ações</div>
            <p className="text-gray-400 mt-2">{error.message}</p>
            <Button onClick={() => refetch()} className="mt-4 bg-red-600 hover:bg-red-700">
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      </section>
    );
  }

  // Empty state (cliente não encontrado)
  if (isEmpty) {
    return (
      <section className={`bg-black/80 backdrop-blur-sm border border-white/10 rounded-xl shadow-lg py-6 px-4 sm:px-6 space-y-6 ${className}`}>
        <Card className="bg-black/70 backdrop-blur-xl border-white/20">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <div className="text-gray-200 font-medium">Cliente não encontrado</div>
          </CardContent>
        </Card>
      </section>
    );
  }

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleNewSale = () => {
    const salesUrl = `/sales?customer_id=${customerId}&customer_name=${encodeURIComponent(customer?.name || '')}`;
    window.open(salesUrl, '_blank');
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'border-red-500/50 text-red-400 bg-red-900/20';
      case 'high': return 'border-orange-500/50 text-orange-400 bg-orange-900/20';
      case 'medium': return 'border-yellow-500/50 text-yellow-400 bg-yellow-900/20';
      default: return 'border-green-500/50 text-green-400 bg-green-900/20';
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical': return 'text-red-400';
      case 'high': return 'text-orange-400';
      case 'medium': return 'text-yellow-400';
      default: return 'text-green-400';
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <section
      className={`bg-black/80 backdrop-blur-sm border border-white/10 rounded-xl shadow-lg py-6 px-4 sm:px-6 hover:shadow-2xl hover:shadow-purple-500/10 hover:border-purple-400/30 transition-all duration-300 space-y-6 ${className}`}
      onMouseMove={handleMouseMove}
    >
      {/* Header com Status Inteligente - Redesign UX/UI v3.2.0 */}
      <Card className="bg-black/70 backdrop-blur-xl border-white/20 hover:border-accent-purple/60 hover:shadow-xl transition-all duration-300">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white font-semibold text-lg flex items-center gap-2">
              <Brain className="h-5 w-5 text-accent-purple" />
              Centro de Inteligência Comercial
              <Badge variant="outline" className="ml-2 border-2 border-accent-purple/60 text-accent-purple bg-accent-purple/20 font-semibold">
                AI-Powered
              </Badge>
            </CardTitle>

            <div className="flex items-center gap-2">
              {hasIntelligentSuggestions && (
                <Badge variant="outline" className="border-2 border-accent-green/60 text-accent-green bg-accent-green/20 font-semibold">
                  {recommendedActions.length} ações sugeridas
                </Badge>
              )}

              {isAtRisk && (
                <Badge variant="outline" className="border-2 border-accent-red/60 text-accent-red bg-accent-red/20 font-semibold">
                  ⚠️ Cliente em risco
                </Badge>
              )}

              {isHighValue && (
                <Badge variant="outline" className="border-2 border-accent-gold-100/60 text-accent-gold-100 bg-accent-gold-100/20 font-semibold">
                  ⭐ High Value
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Análise de Risco de Churn - Redesign UX/UI v3.2.0 */}
      {isAtRisk && (
        <Card className="bg-black/70 backdrop-blur-xl border-accent-red/60 hover:border-accent-red hover:shadow-2xl hover:shadow-accent-red/20 transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-white font-semibold text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-accent-red animate-pulse" />
              Alerta de Churn - Ação Urgente
              <Badge variant="outline" className="ml-2 border-2 bg-accent-red/30 text-accent-red border-accent-red/60 font-semibold">
                Risco {riskAnalysis.riskLevel}: {riskAnalysis.riskScore}%
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 bg-white/5 rounded-lg border border-accent-red/20">
                <h4 className="text-accent-red font-semibold mb-2 flex items-center gap-2">
                  <span className="text-lg">🚨</span> Fatores de Risco
                </h4>
                <ul className="text-gray-200 text-sm space-y-1.5">
                  {riskAnalysis.riskFactors.map((factor, index) => (
                    <li key={index} className="font-medium">• {factor}</li>
                  ))}
                </ul>
              </div>
              <div className="p-3 bg-white/5 rounded-lg border border-accent-orange/20">
                <h4 className="text-accent-orange font-semibold mb-2 flex items-center gap-2">
                  <span className="text-lg">🎯</span> Ações Preventivas
                </h4>
                <ul className="text-gray-200 text-sm space-y-1.5">
                  {riskAnalysis.preventionActions.map((action, index) => (
                    <li key={index} className="font-medium">• {action}</li>
                  ))}
                </ul>
              </div>
              <div className="text-center pt-2">
                <Badge variant="outline" className="border-2 border-accent-red/60 text-accent-red bg-accent-red/20 font-semibold">
                  ⏰ Tempo estimado para churn: {riskAnalysis.timeToChurn} dias
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ações Inteligentes Recomendadas - Redesign UX/UI v3.2.0 */}
      {hasIntelligentSuggestions && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Target className="h-5 w-5 text-accent-purple" />
            Ações Inteligentes Recomendadas
          </h3>
          <div className="space-y-3">
            {recommendedActions.slice(0, 3).map((action) => {
              const urgencyColors = {
                critical: 'bg-black/70 backdrop-blur-xl border-accent-red/60 hover:border-accent-red hover:shadow-xl hover:shadow-accent-red/20 transition-all duration-300',
                high: 'bg-black/70 backdrop-blur-xl border-accent-orange/60 hover:border-accent-orange hover:shadow-xl hover:shadow-accent-orange/20 transition-all duration-300',
                medium: 'bg-black/70 backdrop-blur-xl border-yellow-400/60 hover:border-yellow-400 hover:shadow-xl hover:shadow-yellow-400/20 transition-all duration-300',
                low: 'bg-black/70 backdrop-blur-xl border-accent-green/60 hover:border-accent-green hover:shadow-xl hover:shadow-accent-green/20 transition-all duration-300'
              };

              return (
                <Card key={action.id} className={urgencyColors[action.urgency] || urgencyColors.low}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="text-white font-semibold">{action.title}</h4>
                          <Badge variant="outline" className="text-xs border-2 border-accent-blue/60 text-accent-blue bg-accent-blue/20 font-semibold">
                            {action.confidence}% confiança
                          </Badge>
                          {action.expectedRevenue > 0 && (
                            <Badge variant="outline" className="text-xs border-2 border-accent-green/60 text-accent-green bg-accent-green/20 font-semibold">
                              +{formatCurrency(action.expectedRevenue)}
                            </Badge>
                          )}
                        </div>
                        <p className="text-gray-200 text-sm mb-2 font-medium">{action.description}</p>
                        <p className="text-gray-300 text-xs font-medium">💡 {action.reasoning}</p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => executeAction(action.id)}
                        className="ml-4 bg-accent-purple hover:bg-accent-purple/80"
                      >
                        <Zap className="h-3 w-3 mr-1" />
                        Executar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Ações de Vendas Diretas */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <ShoppingBag className="h-5 w-5 text-green-400" />
          Ações de Vendas Diretas
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            size="lg"
            className="h-20 bg-green-600 hover:bg-green-700 flex flex-col items-center justify-center"
            onClick={handleNewSale}
          >
            <Plus className="h-6 w-6 mb-1" />
            <span className="text-sm">Nova Venda</span>
          </Button>

          <Button
            size="lg"
            variant="outline"
            className="h-20 border-blue-500/30 text-blue-400 hover:bg-blue-500/10 flex flex-col items-center justify-center"
            onClick={() => sendWhatsApp()}
            disabled={!hasPhoneNumber}
          >
            <Phone className="h-6 w-6 mb-1" />
            <span className="text-sm">WhatsApp</span>
            {!hasPhoneNumber && <span className="text-xs text-red-400">Sem telefone</span>}
          </Button>

          <Button
            size="lg"
            variant="outline"
            className="h-20 border-purple-500/30 text-purple-400 hover:bg-purple-500/10 flex flex-col items-center justify-center"
            onClick={() => sendEmail()}
            disabled={!hasEmailAddress}
          >
            <Mail className="h-6 w-6 mb-1" />
            <span className="text-sm">Email</span>
            {!hasEmailAddress && <span className="text-xs text-red-400">Sem email</span>}
          </Button>
        </div>
      </div>

      {/* Oportunidades de Receita */}
      {revenueOpportunities.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-400" />
            Oportunidades de Receita
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {revenueOpportunities.map((opportunity, index) => {
              const categoryColors = {
                immediate: 'bg-black/70 backdrop-blur-xl border-accent-red/60 hover:border-accent-red hover:shadow-xl hover:shadow-accent-red/20 transition-all duration-300',
                short_term: 'bg-black/70 backdrop-blur-xl border-yellow-400/60 hover:border-yellow-400 hover:shadow-xl hover:shadow-yellow-400/20 transition-all duration-300',
                long_term: 'bg-black/70 backdrop-blur-xl border-accent-green/60 hover:border-accent-green hover:shadow-xl hover:shadow-accent-green/20 transition-all duration-300'
              };

              const categoryTextColors = {
                immediate: 'text-accent-red',
                short_term: 'text-yellow-400',
                long_term: 'text-accent-green'
              };

              return (
                <Card key={index} className={categoryColors[opportunity.category]}>
                  <CardContent className="p-5">
                    <div className="text-center space-y-3">
                      <h4 className="text-white font-semibold text-base capitalize">
                        {opportunity.category.replace('_', ' ')}
                      </h4>
                      <div className={`text-3xl font-bold ${categoryTextColors[opportunity.category]}`}>
                        {formatCurrency(opportunity.potential)}
                      </div>
                      <div className="text-sm text-gray-200 font-medium">
                        {opportunity.probability}% probabilidade
                      </div>
                      <p className="text-xs text-gray-300 font-medium">{opportunity.action}</p>
                      <Badge variant="outline" className="mt-2 text-xs border-2 border-white/30 text-gray-200 bg-white/10 font-semibold">
                        {opportunity.timeframe}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Métricas de Performance */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-400" />
          Métricas de Performance
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            layout="crm"
            variant="success"
            title="LTV Cliente"
            value={formatCurrency(realMetrics?.lifetime_value_calculated || 0)}
            description="💰 Valor total"
            icon={DollarSign}
            formatType="none"
          />

          <StatCard
            layout="crm"
            variant="warning"
            title="Risk Score"
            value={`${riskAnalysis.riskScore}%`}
            description={`⚠️ ${riskAnalysis.riskLevel}`}
            icon={AlertTriangle}
            formatType="none"
          />

          <StatCard
            layout="crm"
            variant="purple"
            title="Ações Sugeridas"
            value={recommendedActions.length}
            description="🎯 Ações inteligentes"
            icon={Target}
            formatType="none"
          />

          <StatCard
            layout="crm"
            variant="default"
            title="ROI Médio"
            value={`${roiCalculator('cross_sell')}%`}
            description="📈 Retorno esperado"
            icon={Percent}
            formatType="none"
          />
        </div>
      </div>

      {/* Ferramentas de Marketing - Redesign UX/UI v3.2.0 */}
      <Card className="bg-black/70 backdrop-blur-xl border-white/20 hover:border-accent-purple/60 hover:shadow-xl transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-white font-semibold text-lg flex items-center gap-2">
            <Gift className="h-5 w-5 text-accent-purple" />
            Ferramentas de Marketing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Campanhas Personalizadas */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                <Target className="h-4 w-4 text-accent-purple" />
                Campanhas Personalizadas
              </h4>
              <p className="text-gray-200 text-sm mb-3 font-medium">
                Crie campanhas baseadas no perfil e histórico do cliente
              </p>
              <div className="space-y-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => sendTargetedPromo('birthday')}
                >
                  <ExternalLink className="h-3 w-3 mr-2" />
                  Campanha de Aniversário
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => sendTargetedPromo('cross_sell')}
                >
                  <ExternalLink className="h-3 w-3 mr-2" />
                  Produtos Relacionados
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => sendTargetedPromo('vip_reactivation')}
                >
                  <ExternalLink className="h-3 w-3 mr-2" />
                  Reativação VIP
                </Button>
              </div>
            </div>

            {/* Automações */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                <Zap className="h-4 w-4 text-accent-gold-100" />
                Automações
              </h4>
              <p className="text-gray-200 text-sm mb-3 font-medium">
                Status das automações para este cliente
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Follow-up pós-venda</span>
                  <Badge variant="outline" className="text-xs">
                    {hasEmailAddress ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Lembrete aniversário</span>
                  <Badge variant="outline" className="text-xs">
                    Em breve
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Recomendação mensal</span>
                  <Badge variant="outline" className="text-xs">
                    Em breve
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Links Rápidos - Redesign UX/UI v3.2.0 */}
      <Card className="bg-black/70 backdrop-blur-xl border-white/20 hover:border-accent-blue/60 hover:shadow-xl transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-white font-semibold text-lg flex items-center gap-2">
            <ExternalLink className="h-5 w-5 text-accent-blue" />
            Links Rápidos para Ação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button
              size="sm"
              variant="outline"
              className="flex flex-col items-center gap-1 h-16"
              onClick={() => window.open('/sales', '_blank')}
            >
              <ShoppingBag className="h-4 w-4" />
              <span className="text-xs">Vendas</span>
            </Button>

            <Button
              size="sm"
              variant="outline"
              className="flex flex-col items-center gap-1 h-16"
              onClick={() => window.open('/inventory', '_blank')}
            >
              <Package className="h-4 w-4" />
              <span className="text-xs">Estoque</span>
            </Button>

            <Button
              size="sm"
              variant="outline"
              className="flex flex-col items-center gap-1 h-16"
              onClick={() => window.open('/reports', '_blank')}
            >
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs">Relatórios</span>
            </Button>

            <Button
              size="sm"
              variant="outline"
              className="flex flex-col items-center gap-1 h-16"
              onClick={() => window.open('/customers', '_blank')}
            >
              <Users className="h-4 w-4" />
              <span className="text-xs">Clientes</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

export default CustomerActionsTab;