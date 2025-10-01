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
      <section className={`bg-black/80 backdrop-blur-sm border border-white/10 rounded-xl shadow-lg p-6 space-y-6 ${className}`}>
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner text="Carregando centro de ações..." />
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className={`bg-black/80 backdrop-blur-sm border border-white/10 rounded-xl shadow-lg p-6 space-y-6 ${className}`}>
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
      <section className={`bg-black/80 backdrop-blur-sm border border-white/10 rounded-xl shadow-lg p-6 space-y-6 ${className}`}>
        <Card className="bg-gray-800/30 border-gray-700/40">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-500 opacity-50" />
            <div className="text-gray-400">Cliente não encontrado</div>
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
      className={`bg-black/80 backdrop-blur-sm border border-white/10 rounded-xl shadow-lg p-6 hover:shadow-2xl hover:shadow-purple-500/10 hover:border-purple-400/30 transition-all duration-300 space-y-6 ${className}`}
      onMouseMove={handleMouseMove}
    >
      {/* Header com Status Inteligente */}
      <Card className="bg-gray-800/30 border-gray-700/40">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-400" />
              Centro de Inteligência Comercial
              <Badge variant="outline" className="ml-2 border-purple-500/30 text-purple-400">
                AI-Powered
              </Badge>
            </CardTitle>

            <div className="flex items-center gap-2">
              {hasIntelligentSuggestions && (
                <Badge variant="outline" className="border-green-500/30 text-green-400">
                  {recommendedActions.length} ações sugeridas
                </Badge>
              )}

              {isAtRisk && (
                <Badge variant="outline" className="border-red-500/30 text-red-400">
                  ⚠️ Cliente em risco
                </Badge>
              )}

              {isHighValue && (
                <Badge variant="outline" className="border-yellow-500/30 text-yellow-400">
                  ⭐ High Value
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Análise de Risco de Churn */}
      {isAtRisk && (
        <Card className={`bg-gradient-to-r from-red-900/30 to-orange-900/20 border-red-700/40`}>
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-400 animate-pulse" />
              Alerta de Churn - Ação Urgente
              <Badge className="ml-2 bg-red-500/20 text-red-400 border-red-500/30">
                Risco {riskAnalysis.riskLevel}: {riskAnalysis.riskScore}%
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="text-red-400 font-medium mb-2">🚨 Fatores de Risco:</h4>
                <ul className="text-gray-300 text-sm space-y-1">
                  {riskAnalysis.riskFactors.map((factor, index) => (
                    <li key={index}>• {factor}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-orange-400 font-medium mb-2">🎯 Ações Preventivas:</h4>
                <ul className="text-gray-300 text-sm space-y-1">
                  {riskAnalysis.preventionActions.map((action, index) => (
                    <li key={index}>• {action}</li>
                  ))}
                </ul>
              </div>
              <div className="text-center pt-2">
                <Badge variant="outline" className="border-red-500/30 text-red-400">
                  ⏰ Tempo estimado para churn: {riskAnalysis.timeToChurn} dias
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ações Inteligentes Recomendadas */}
      {hasIntelligentSuggestions && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Target className="h-5 w-5 text-purple-400" />
            Ações Inteligentes Recomendadas
          </h3>
          <div className="space-y-3">
            {recommendedActions.slice(0, 3).map((action) => (
              <Card key={action.id} className={getUrgencyColor(action.urgency)}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">{action.title}</h4>
                        <Badge variant="outline" className="text-xs">
                          {action.confidence}% confiança
                        </Badge>
                        {action.expectedRevenue > 0 && (
                          <Badge variant="outline" className="text-xs border-green-500/30 text-green-400">
                            +{formatCurrency(action.expectedRevenue)}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm mb-2">{action.description}</p>
                      <p className="text-xs opacity-75">💡 {action.reasoning}</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => executeAction(action.id)}
                      className="ml-4"
                    >
                      <Zap className="h-3 w-3 mr-1" />
                      Executar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
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
                immediate: 'border-red-500/40 bg-red-900/20',
                short_term: 'border-yellow-500/40 bg-yellow-900/20',
                long_term: 'border-green-500/40 bg-green-900/20'
              };

              return (
                <Card key={index} className={categoryColors[opportunity.category]}>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <h4 className="font-medium mb-2 capitalize">
                        {opportunity.category.replace('_', ' ')}
                      </h4>
                      <div className="text-2xl font-bold mb-1">
                        {formatCurrency(opportunity.potential)}
                      </div>
                      <div className="text-sm opacity-75 mb-2">
                        {opportunity.probability}% probabilidade
                      </div>
                      <p className="text-xs">{opportunity.action}</p>
                      <Badge variant="outline" className="mt-2 text-xs">
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

      {/* Ferramentas de Marketing */}
      <Card className="bg-gray-800/30 border-gray-700/40">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Gift className="h-5 w-5 text-pink-400" />
            Ferramentas de Marketing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Campanhas Personalizadas */}
            <div className="bg-gray-900/50 rounded-lg p-4">
              <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                <Target className="h-4 w-4 text-pink-400" />
                Campanhas Personalizadas
              </h4>
              <p className="text-gray-400 text-sm mb-3">
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
            <div className="bg-gray-900/50 rounded-lg p-4">
              <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-400" />
                Automações
              </h4>
              <p className="text-gray-400 text-sm mb-3">
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

      {/* Links Rápidos */}
      <Card className="bg-gradient-to-r from-indigo-900/20 to-purple-900/20 border-indigo-700/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <ExternalLink className="h-5 w-5 text-indigo-400" />
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