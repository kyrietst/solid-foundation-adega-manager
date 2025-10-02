/**
 * CustomerOverviewTab.tsx - Tab SSoT v3.1.0 Server-Side
 *
 * @description
 * Componente SSoT completo que busca dados diretamente do banco para visão geral.
 * Elimina dependência de props e implementa performance otimizada.
 *
 * @features
 * - Busca direta do banco (sem props)
 * - Dashboard executivo com 4 cards principais
 * - Alertas para campos críticos em falta
 * - Métricas avançadas com StatCard
 * - Timeline real integrada do banco
 * - Loading e error states internos
 * - Business logic centralizada em hook SSoT
 * - Cache inteligente e auto-refresh
 * - Glassmorphism effects
 *
 * @author Adega Manager Team
 * @version 3.1.0 - SSoT Server-Side Implementation
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { Button } from '@/shared/ui/primitives/button';
import { Badge } from '@/shared/ui/primitives/badge';
import { StatCard } from '@/shared/ui/composite/stat-card';
import { LoadingSpinner } from '@/shared/ui/composite/loading-spinner';
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
  MapPin,
  ShoppingBag,
  FileText,
  PhoneCall,
  Clock,
  AlertCircle
} from 'lucide-react';
import { formatCurrency } from '@/core/config/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  TooltipPortal,
} from '@/shared/ui/primitives/tooltip';
import { useCustomerOverviewSSoT } from '@/shared/hooks/business/useCustomerOverviewSSoT';

// ============================================================================
// TYPES
// ============================================================================

// ============================================================================
// COMPONENT TYPES
// ============================================================================

export interface CustomerOverviewTabProps {
  customerId: string;
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
  customerId,
  className = ''
}) => {
  // ============================================================================
  // BUSINESS LOGIC COM SSoT v3.1.0
  // ============================================================================

  const { handleMouseMove } = useGlassmorphismEffect();

  const {
    customer,
    metrics: realMetrics,
    purchases,
    timeline,
    isLoading,
    error,
    sendWhatsApp,
    sendEmail,
    customerStatus,
    profileCompleteness,
    missingCriticalFields: criticalMissingFields,
    hasData,
    isEmpty,
    refetch
  } = useCustomerOverviewSSoT(customerId);

  // ============================================================================
  // GUARDS E VALIDAÇÕES
  // ============================================================================

  // Loading state
  if (isLoading) {
    return (
      <section className={`bg-black/80 backdrop-blur-sm border border-white/10 rounded-xl shadow-lg p-6 space-y-6 ${className}`}>
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner text="Carregando visão geral do cliente..." />
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
            <div className="text-red-400 text-lg">❌ Erro ao carregar visão geral</div>
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

  // Dados calculados (já vêm do hook)
  const customerStatusData = customerStatus;

  // Report fields locais para MissingFieldAlert
  const reportFields = [
    {
      key: 'phone',
      label: 'Telefone',
      required: true,
      icon: Phone,
      impact: 'Essencial para relatórios de WhatsApp e análises de contato.'
    },
    {
      key: 'email',
      label: 'Email',
      required: true,
      icon: Mail,
      impact: 'Necessário para campanhas de email marketing e relatórios de comunicação.'
    },
    {
      key: 'address',
      label: 'Endereço',
      required: false,
      icon: MapPin,
      impact: 'Importante para análises geográficas e relatórios de entrega.'
    }
  ];

  // Placeholder para edição do perfil - será implementado no futuro
  const handleEdit = () => {
    console.log('📝 Editar perfil - implementar quando necessário');
  };

  // ============================================================================
  // TIMELINE HELPERS
  // ============================================================================

  const getTimelineIcon = (activityType: string) => {
    switch (activityType) {
      case 'sale': return ShoppingBag;
      case 'interaction': return PhoneCall;
      case 'event': return FileText;
      default: return Clock;
    }
  };

  const getTimelineColor = (activityType: string) => {
    switch (activityType) {
      case 'sale': return 'text-green-400';
      case 'interaction': return 'text-blue-400';
      case 'event': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  };

  const formatTimelineDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffHours < 1) return 'Agora mesmo';
    if (diffHours < 24) return `${diffHours}h atrás`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Ontem';
    if (diffDays < 7) return `${diffDays} dias atrás`;

    return date.toLocaleDateString('pt-BR');
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
                onClick={handleEdit}
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
                    {formatCurrency(realMetrics?.lifetime_value_calculated || 0)}
                    {realMetrics && !realMetrics.data_sync_status.ltv_synced && (
                      <span className="text-xs text-yellow-400 ml-1">⚠️</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    {`${realMetrics?.total_purchases || 0} compras reais`}
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Ticket Médio:</span>
                <div className="text-lg font-semibold text-purple-400">
                  {formatCurrency(realMetrics?.avg_purchase_value || 0)}
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
                  className={customerStatusData.className}
                >
                  {customerStatusData.status}
                </Badge>
              </div>
              <div className="pt-2 border-t border-gray-700/30">
                <div className="text-xs text-gray-400 text-center">
                  Engajamento: {customerStatusData.engagementLevel}
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
                    {realMetrics?.calculated_favorite_product || 'Não definido'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300 text-sm">Insights AI:</span>
                  <span className="text-blue-400 text-sm font-medium">
                    {`${realMetrics?.insights_count || 0} insights (${Math.round((realMetrics?.insights_confidence || 0) * 100)}% confiança)`}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-700/30">
                <span className="text-gray-300">Segmento:</span>
                <Badge
                  className={`
                    ${customer.segment === 'high_value' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                      customer.segment === 'regular' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                      customer.segment === 'new' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
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
                          onClick={() => sendWhatsApp()}
                        >
                          WhatsApp
                        </Button>
                      </>
                    ) : (
                      <>
                        <span className="text-red-400 text-xs">✗ Não cadastrado</span>
                        <MissingFieldAlert
                          field={reportFields.find(f => f.key === 'phone')!}
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
                          onClick={() => sendEmail()}
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
                  {profileCompleteness}
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
            value={realMetrics?.avg_items_per_purchase ?
              realMetrics.avg_items_per_purchase.toFixed(1) :
              '0'
            }
            description={`📦 ${realMetrics?.total_products_bought || 0} total itens`}
            icon={Package}
            formatType="none"
          />

          <StatCard
            layout="crm"
            variant="success"
            title="Ticket Médio"
            value={formatCurrency(realMetrics?.avg_purchase_value || 0)}
            description="💵 Por compra real"
            icon={DollarSign}
            formatType="none"
          />

          <StatCard
            layout="crm"
            variant="purple"
            title="Categoria Favorita"
            value={realMetrics?.calculated_favorite_category || 'N/A'}
            description={`📊 ${realMetrics?.data_sync_status.preferences_synced ? 'Sincronizado' : 'Desatualizado'}`}
            icon={TrendingUp}
            formatType="none"
          />
        </div>
      </div>

      {/* Timeline Section - Real Implementation */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-400" />
          Timeline de Atividades
        </h3>
        <Card className="bg-gray-800/30 border-gray-700/40">
          <CardContent className="p-6">
            {timeline.length === 0 ? (
              <div className="text-center py-4 text-gray-400">
                <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhuma atividade encontrada</p>
                <p className="text-xs mt-1">Histórico será exibido conforme interações ocorrem</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-80 overflow-y-auto">
                {timeline.slice(0, 10).map((item, index) => {
                  const IconComponent = getTimelineIcon(item.type);
                  const iconColor = getTimelineColor(item.type);

                  return (
                    <div key={item.id} className="flex items-start gap-3 pb-3 border-b border-gray-700/30 last:border-b-0">
                      <div className={`flex-shrink-0 p-2 rounded-full bg-gray-800/50 ${iconColor}`}>
                        <IconComponent className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-white capitalize">
                            {item.title}
                          </p>
                          <span className="text-xs text-gray-400">
                            {formatTimelineDate(item.created_at)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-300 mt-1 break-words">
                          {item.description}
                        </p>
                        {item.amount && (
                          <div className="flex items-center gap-1 mt-1">
                            <DollarSign className="h-3 w-3 text-green-400" />
                            <span className="text-xs text-green-400 font-medium">
                              {formatCurrency(item.amount)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                {timeline.length > 10 && (
                  <div className="text-center pt-2">
                    <p className="text-xs text-gray-500">
                      Mostrando as 10 atividades mais recentes ({timeline.length} no total)
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default CustomerOverviewTab;