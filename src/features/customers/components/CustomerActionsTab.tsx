/**
 * CustomerActionsTab.tsx - Tab de ações rápidas e ferramentas de vendas
 *
 * @description
 * Componente SSoT v3.0.0 focado em ações que geram receita e valor.
 * Nova tab estratégica para maximizar o valor como ferramenta de vendas.
 *
 * @features
 * - Ações rápidas de vendas
 * - Ferramentas de marketing
 * - Campanhas personalizadas
 * - Recomendações de produtos
 * - Links diretos para ações
 * - Métricas de conversão
 * - Glassmorphism effects
 *
 * @author Adega Manager Team
 * @version 3.0.0 - SSoT Implementation
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { Button } from '@/shared/ui/primitives/button';
import { Badge } from '@/shared/ui/primitives/badge';
import { StatCard } from '@/shared/ui/composite/stat-card';
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
  Package
} from 'lucide-react';
import { useCustomerOperations, type CustomerData } from '@/shared/hooks/business/useCustomerOperations';

// ============================================================================
// TYPES
// ============================================================================

export interface CustomerActionsTabProps {
  customer: CustomerData;
  onNewSale?: () => void;
  onWhatsApp?: () => void;
  onEmail?: () => void;
  className?: string;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export const CustomerActionsTab: React.FC<CustomerActionsTabProps> = ({
  customer,
  onNewSale,
  onWhatsApp,
  onEmail,
  className = ''
}) => {
  // ============================================================================
  // BUSINESS LOGIC COM SSoT
  // ============================================================================

  const { handleMouseMove } = useGlassmorphismEffect();
  const { metrics, insights, calculateNextBestAction } = useCustomerOperations(customer);
  const nextAction = calculateNextBestAction();

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleNewSaleDefault = () => {
    const salesUrl = `/sales?customer_id=${customer.id}&customer_name=${encodeURIComponent(customer?.cliente || '')}`;
    window.open(salesUrl, '_blank');
  };

  const handleWhatsAppPromo = () => {
    if (!customer?.telefone) {
      alert('Cliente não possui telefone cadastrado');
      return;
    }
    const phone = customer.telefone.replace(/\D/g, '');
    const message = `🍷 Olá ${customer.cliente}! Temos uma promoção especial para você na Adega! Confira nossas ofertas exclusivas.`;
    const url = `https://wa.me/55${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleEmailCampaign = () => {
    if (!customer?.email) {
      alert('Cliente não possui email cadastrado');
      return;
    }
    const subject = `🍷 Oferta Exclusiva - Adega Wine Store`;
    const body = `Prezado(a) ${customer.cliente},\n\nTemos uma seleção especial de vinhos para você!\n\nConfira nossas ofertas exclusivas.\n\nAtenciosamente,\nEquipe Adega`;
    const url = `mailto:${customer.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(url, '_blank');
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <section
      className={`bg-black/80 backdrop-blur-sm border border-white/10 rounded-xl shadow-lg p-6 hover:shadow-2xl hover:shadow-purple-500/10 hover:border-purple-400/30 transition-all duration-300 space-y-6 ${className}`}
      onMouseMove={handleMouseMove}
    >
      {/* Header */}
      <Card className="bg-gray-800/30 border-gray-700/40">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-400" />
            Ações Rápidas & Ferramentas de Vendas
            <Badge variant="outline" className="ml-2 border-yellow-500/30 text-yellow-400">
              Revenue Focus
            </Badge>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Próxima Ação Recomendada */}
      <Card className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border-yellow-700/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Target className="h-5 w-5 text-yellow-400" />
            Próxima Ação Recomendada
            <Badge className={`ml-2 ${
              nextAction.priority === 'high' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
              nextAction.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
              'bg-green-500/20 text-green-400 border-green-500/30'
            }`}>
              {nextAction.priority === 'high' ? 'Alta Prioridade' :
               nextAction.priority === 'medium' ? 'Média Prioridade' : 'Baixa Prioridade'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="text-lg font-medium text-yellow-400 mb-2">🎯 {nextAction.action}</h4>
              <p className="text-gray-300 text-sm">{nextAction.description}</p>
            </div>
            <Button
              className="bg-yellow-600 hover:bg-yellow-700"
              onClick={onNewSale || handleNewSaleDefault}
            >
              <Plus className="h-4 w-4 mr-2" />
              Executar
            </Button>
          </div>
        </CardContent>
      </Card>

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
            onClick={onNewSale || handleNewSaleDefault}
          >
            <Plus className="h-6 w-6 mb-1" />
            <span className="text-sm">Nova Venda</span>
          </Button>

          <Button
            size="lg"
            variant="outline"
            className="h-20 border-blue-500/30 text-blue-400 hover:bg-blue-500/10 flex flex-col items-center justify-center"
            onClick={handleWhatsAppPromo}
            disabled={!customer.telefone}
          >
            <MessageSquare className="h-6 w-6 mb-1" />
            <span className="text-sm">Promo WhatsApp</span>
          </Button>

          <Button
            size="lg"
            variant="outline"
            className="h-20 border-purple-500/30 text-purple-400 hover:bg-purple-500/10 flex flex-col items-center justify-center"
            onClick={handleEmailCampaign}
            disabled={!customer.email}
          >
            <Mail className="h-6 w-6 mb-1" />
            <span className="text-sm">Email Campanha</span>
          </Button>
        </div>
      </div>

      {/* Métricas de Conversão */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-400" />
          Métricas de Conversão
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            layout="crm"
            variant="success"
            title="Loyalty Score"
            value={`${metrics?.loyaltyScore || 0}%`}
            description="🏆 Fidelidade atual"
            icon={Star}
          />

          <StatCard
            layout="crm"
            variant="warning"
            title="Risk Score"
            value={`${metrics?.riskScore || 0}%`}
            description="⚠️ Risco de churn"
            icon={Target}
          />

          <StatCard
            layout="crm"
            variant="purple"
            title="Completude"
            value={`${insights?.profileCompleteness || 0}%`}
            description="📋 Dados do perfil"
            icon={Users}
          />

          <StatCard
            layout="crm"
            variant="default"
            title="Potencial"
            value={insights?.marketingReachable ? 'Alto' : 'Baixo'}
            description="📈 Marketing reach"
            icon={Percent}
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
                <Button size="sm" variant="outline" className="w-full justify-start">
                  <ExternalLink className="h-3 w-3 mr-2" />
                  Campanha de Aniversário
                </Button>
                <Button size="sm" variant="outline" className="w-full justify-start">
                  <ExternalLink className="h-3 w-3 mr-2" />
                  Produtos Relacionados
                </Button>
                <Button size="sm" variant="outline" className="w-full justify-start">
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
                Configure automações para este cliente
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Follow-up pós-venda</span>
                  <Badge variant="outline" className="text-xs">
                    {insights?.hasEmail ? 'Ativo' : 'Inativo'}
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