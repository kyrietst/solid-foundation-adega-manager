/**
 * CustomerOverviewTab.tsx - Tab de visão geral unificada do cliente
 *
 * @description
 * Componente SSoT v3.0.0 que centraliza o dashboard principal do cliente
 * integrando dados financeiros, atividade, preferências e timeline.
 *
 * @features
 * - Dashboard executivo com 4 cards principais
 * - Alertas para campos críticos em falta
 * - Métricas avançadas com StatCard
 * - Timeline integrada (futuro)
 * - Business logic centralizada em hooks
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
  DollarSign,
  Calendar,
  TrendingUp,
  MessageSquare,
  BarChart3,
  Package,
  AlertTriangle,
  Info,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';
import { formatCurrency } from '@/core/config/utils';
import { useCustomerOperations, type CustomerData } from '@/shared/hooks/business/useCustomerOperations';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  TooltipPortal,
} from '@/shared/ui/primitives/tooltip';

// ============================================================================
// TYPES
// ============================================================================

export interface CustomerOverviewTabProps {
  customer: CustomerData;
  realMetrics?: {
    lifetime_value_calculated?: number;
    total_purchases?: number;
    days_since_last_purchase?: number;
    last_purchase_real?: string;
    avg_purchase_value?: number;
    avg_items_per_purchase?: number;
    total_products_bought?: number;
    calculated_favorite_category?: string;
    calculated_favorite_product?: string;
    insights_count?: number;
    insights_confidence?: number;
    data_sync_status: {
      ltv_synced: boolean;
      dates_synced: boolean;
      preferences_synced: boolean;
    };
  };
  onEdit: () => void;
  onWhatsApp?: () => void;
  onEmail?: () => void;
  className?: string;
}

interface MissingFieldAlertProps {
  field: {
    key: string;
    label: string;
    icon: React.ComponentType<any>;
    impact: string;
    required: boolean;
  };
  variant?: 'critical' | 'warning';
}

// ============================================================================
// COMPONENTE DE ALERTA PARA CAMPOS EM FALTA
// ============================================================================

const MissingFieldAlert: React.FC<MissingFieldAlertProps> = ({
  field,
  variant = 'critical'
}) => {
  const IconComponent = field.icon || Info;

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="inline-flex items-center">
            {variant === 'critical' ? (
              <AlertTriangle className="h-4 w-4 text-red-400 animate-pulse cursor-help" />
            ) : (
              <Info className="h-4 w-4 text-yellow-400 cursor-help" />
            )}
          </div>
        </TooltipTrigger>
        <TooltipPortal>
          <TooltipContent
            side="top"
            className="max-w-sm z-[50000] bg-black/95 backdrop-blur-xl border border-red-400/30 shadow-2xl shadow-red-400/10"
            sideOffset={8}
            avoidCollisions={true}
            collisionPadding={10}
          >
            <div className="space-y-2 p-1">
              <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                <IconComponent className="h-4 w-4 text-red-400" />
                <span className="font-semibold text-red-400">{field.label} em Falta</span>
              </div>
              <p className="text-xs text-gray-300">{field.impact}</p>
              <div className="flex items-center gap-1 pt-1 border-t border-white/10">
                <AlertTriangle className="h-3 w-3 text-red-400" />
                <span className="text-xs text-red-400 font-medium">Impacta relatórios</span>
              </div>
            </div>
          </TooltipContent>
        </TooltipPortal>
      </Tooltip>
    </TooltipProvider>
  );
};

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export const CustomerOverviewTab: React.FC<CustomerOverviewTabProps> = ({
  customer,
  realMetrics,
  onEdit,
  onWhatsApp,
  onEmail,
  className = ''
}) => {
  // ============================================================================
  // BUSINESS LOGIC COM SSoT
  // ============================================================================

  const { insights, metrics } = useCustomerOperations(customer);
  const { handleMouseMove } = useGlassmorphismEffect();

  // Campos que impactam relatórios (centralizados)
  const reportFields = [
    {
      key: 'email',
      label: 'Email',
      value: customer?.email,
      required: true,
      icon: Mail,
      impact: 'Necessário para campanhas de email marketing e relatórios de comunicação.'
    },
    {
      key: 'telefone',
      label: 'Telefone',
      value: customer?.telefone,
      required: true,
      icon: Phone,
      impact: 'Essencial para relatórios de WhatsApp e análises de contato.'
    },
    {
      key: 'endereco',
      label: 'Endereço',
      value: customer?.endereco,
      required: false,
      icon: MapPin,
      impact: 'Importante para análises geográficas e relatórios de entrega.'
    }
  ];

  const missingReportFields = reportFields.filter(
    field => !field.value || field.value === 'N/A' || field.value === 'Não definida'
  );
  const criticalMissingFields = missingReportFields.filter(field => field.required);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleWhatsAppDefault = () => {
    if (!customer?.telefone) {
      alert('Cliente não possui telefone cadastrado');
      return;
    }
    const phone = customer.telefone.replace(/\D/g, '');
    const message = `Olá ${customer.cliente}, tudo bem? Aqui é da Adega! 🍷`;
    const url = `https://wa.me/55${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleEmailDefault = () => {
    if (!customer?.email) {
      alert('Cliente não possui email cadastrado');
      return;
    }
    const subject = `Contato - Adega Wine Store`;
    const body = `Prezado(a) ${customer.cliente},\n\nEsperamos que esteja bem!\n\nAtenciosamente,\nEquipe Adega`;
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
      {/* Alert para campos críticos em falta */}
      {criticalMissingFields.length > 0 && (
        <Card className="bg-gradient-to-r from-red-900/30 to-red-800/20 border-red-500/40">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5 animate-pulse" />
              <div className="flex-1">
                <h4 className="text-red-400 font-medium mb-1">Campos Críticos em Falta</h4>
                <p className="text-gray-300 text-sm mb-2">
                  {criticalMissingFields.length} campo(s) essencial(is) para relatórios não preenchido(s):
                </p>
                <div className="flex flex-wrap gap-2">
                  {criticalMissingFields.map((field, index) => (
                    <Badge key={index} variant="outline" className="border-red-400/50 text-red-400">
                      {field.label}
                    </Badge>
                  ))}
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="border-red-400/50 text-red-400 hover:bg-red-400/10"
                onClick={onEdit}
              >
                Editar Perfil
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cards Principais do Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Card Resumo Financeiro */}
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
                    {formatCurrency(realMetrics?.lifetime_value_calculated || metrics?.ltv || 0)}
                    {realMetrics && !realMetrics.data_sync_status.ltv_synced && (
                      <span className="text-xs text-yellow-400 ml-1">⚠️</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    {realMetrics?.total_purchases || metrics?.totalOrders || 0} compras reais
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Ticket Médio:</span>
                <div className="text-lg font-semibold text-purple-400">
                  {formatCurrency(realMetrics?.avg_purchase_value || metrics?.averageOrderValue || 0)}
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
                    {realMetrics?.last_purchase_real
                      ? new Date(realMetrics.last_purchase_real).toLocaleDateString('pt-BR')
                      : 'Nunca'
                    }
                    {realMetrics && !realMetrics.data_sync_status.dates_synced && (
                      <span className="text-xs text-yellow-400 ml-1">⚠️</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    {realMetrics?.days_since_last_purchase !== undefined
                      ? `${realMetrics.days_since_last_purchase} dias atrás`
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
                    (realMetrics?.days_since_last_purchase || 999) <= 30
                      ? "border-green-500/30 text-green-400"
                      : (realMetrics?.days_since_last_purchase || 0) > 0
                      ? "border-yellow-500/30 text-yellow-400"
                      : "border-gray-500/30 text-gray-400"
                  }
                >
                  {(realMetrics?.days_since_last_purchase || 999) <= 30
                    ? "Ativo"
                    : (realMetrics?.days_since_last_purchase || 0) > 0
                    ? "Dormindo"
                    : "Novo"
                  }
                </Badge>
              </div>
              <div className="pt-2 border-t border-gray-700/30">
                <div className="text-xs text-gray-400 text-center">
                  Loyalty Score: {metrics?.loyaltyScore || 0}%
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
                    {realMetrics?.calculated_favorite_category || 'Não definida'}
                    {realMetrics && !realMetrics.data_sync_status.preferences_synced && (
                      <span className="text-xs text-yellow-400 ml-1">⚠️</span>
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300 text-sm">Produto Favorito:</span>
                  <span className="text-purple-400 text-sm font-medium">
                    {realMetrics?.calculated_favorite_product || 'Calculando...'}
                  </span>
                </div>
                {realMetrics && (
                  <div className="flex justify-between">
                    <span className="text-gray-300 text-sm">Insights AI:</span>
                    <span className="text-blue-400 text-sm font-medium">
                      {realMetrics.insights_count || 0} insights ({Math.round((realMetrics.insights_confidence || 0) * 100)}% confiança)
                    </span>
                  </div>
                )}
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-700/30">
                <span className="text-gray-300">Segmento:</span>
                <Badge
                  className={`
                    ${customer.segmento === 'High Value' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                      customer.segmento === 'Regular' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                      customer.segmento === 'New' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                      'bg-gray-500/20 text-gray-400 border-gray-500/30'
                    }
                  `}
                >
                  {customer.segmento || 'Não Classificado'}
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
                    {customer.telefone ? (
                      <>
                        <span className="text-green-400 text-xs">✓</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 px-2 text-xs text-orange-400 hover:text-orange-300"
                          onClick={onWhatsApp || handleWhatsAppDefault}
                        >
                          WhatsApp
                        </Button>
                      </>
                    ) : (
                      <>
                        <span className="text-red-400 text-xs">✗ Não cadastrado</span>
                        <MissingFieldAlert
                          field={reportFields.find(f => f.key === 'telefone')!}
                          variant="critical"
                        />
                      </>
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
                          onClick={onEmail || handleEmailDefault}
                        >
                          Enviar
                        </Button>
                      </>
                    ) : (
                      <>
                        <span className="text-red-400 text-xs">✗ Não cadastrado</span>
                        <MissingFieldAlert
                          field={reportFields.find(f => f.key === 'email')!}
                          variant="critical"
                        />
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-700/30">
                <span className="text-gray-300 text-sm">Completude:</span>
                <span className="text-orange-400 text-sm">
                  {insights?.profileCompleteness || 0}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Seção de Métricas Avançadas - SSoT StatCard */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-blue-400" />
          Métricas Avançadas
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            layout="crm"
            variant="default"
            title="Itens por Compra"
            value={realMetrics?.avg_items_per_purchase ? Math.round(realMetrics.avg_items_per_purchase) : 0}
            description={`📦 ${realMetrics?.total_products_bought || 0} total itens`}
            icon={Package}
          />

          <StatCard
            layout="crm"
            variant="success"
            title="Ticket Médio"
            value={formatCurrency(realMetrics?.avg_purchase_value || metrics?.averageOrderValue || 0)}
            description="💵 Por compra real"
            icon={DollarSign}
          />

          <StatCard
            layout="crm"
            variant="purple"
            title="Categoria Favorita"
            value={realMetrics?.calculated_favorite_category || 'N/A'}
            description={`📊 ${realMetrics?.data_sync_status.preferences_synced ? 'Sincronizado' : 'Desatualizado'}`}
            icon={TrendingUp}
          />
        </div>
      </div>

      {/* Timeline Section (Placeholder for Future Implementation) */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-400" />
          Timeline de Atividades
        </h3>
        <Card className="bg-gray-800/30 border-gray-700/40">
          <CardContent className="p-6">
            <div className="text-center py-4 text-gray-400">
              <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">📅 Timeline integrada será implementada na próxima versão</p>
              <p className="text-xs mt-1">Histórico completo de compras, interações e eventos</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default CustomerOverviewTab;