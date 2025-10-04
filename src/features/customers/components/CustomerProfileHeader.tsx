/**
 * CustomerProfileHeader.tsx - Cabeçalho reutilizável do perfil do cliente SSoT v3.1.0
 *
 * @description
 * Componente SSoT v3.1.0 completamente autossuficiente que centraliza o cabeçalho do perfil do cliente
 * com navegação, ações rápidas e métricas principais usando server-side data fetching.
 *
 * @features
 * - Interface SSoT v3.1.0: apenas {customerId: string}
 * - Server-side data fetching consolidado
 * - Navegação breadcrumb responsiva
 * - Botões de ação contextual (Edit, WhatsApp, Email, Nova Venda)
 * - Card principal com avatar, informações básicas e métricas
 * - Profile completeness calculation automático
 * - Handlers centralizados via hook SSoT
 * - Glassmorphism effects reutilizáveis
 * - Loading states apropriados
 *
 * @author Adega Manager Team
 * @version 3.1.0 - SSoT Server-Side Implementation
 */

import React from 'react';
import { Card, CardContent } from '@/shared/ui/primitives/card';
import { Button } from '@/shared/ui/primitives/button';
import { Badge } from '@/shared/ui/primitives/badge';
import { StatCard } from '@/shared/ui/composite/stat-card';
import { LoadingSpinner } from '@/shared/ui/composite/loading-spinner';
import {
  ArrowLeft,
  Edit,
  MessageSquare,
  Mail,
  Plus,
  Phone,
  MapPin,
  DollarSign,
  ShoppingBag,
  Calendar,
  AlertTriangle,
  Info
} from 'lucide-react';
import { useCustomerProfileHeaderSSoT } from '@/shared/hooks/business/useCustomerProfileHeaderSSoT';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  TooltipPortal,
} from '@/shared/ui/primitives/tooltip';
import { formatAddress } from '@/core/config/utils';

// ============================================================================
// TYPES
// ============================================================================

export interface CustomerProfileHeaderProps {
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
// COMPONENTE PRINCIPAL SSoT v3.1.0
// ============================================================================

export const CustomerProfileHeader: React.FC<CustomerProfileHeaderProps> = ({
  customerId,
  className = ''
}) => {
  // ============================================================================
  // SSoT HOOK - SERVER-SIDE DATA FETCHING
  // ============================================================================

  const {
    customer,
    realMetrics,
    profileCompleteness,
    isLoading,
    error,
    handleEdit,
    handleNewSale,
    handleWhatsApp,
    handleEmail,
    handleBack,
    formatCurrency,
    formatDate,
    getSegmentColor,
    getSegmentLabel,
    hasPhoneNumber,
    hasEmailAddress,
    isHighValue,
    isAtRisk,
    customerSince,
    hasData
  } = useCustomerProfileHeaderSSoT(customerId);

  // ============================================================================
  // EARLY RETURNS
  // ============================================================================

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-12 bg-gray-800/50 rounded-lg animate-pulse" />
        <div className="h-48 bg-gray-800/50 rounded-lg animate-pulse" />
      </div>
    );
  }

  if (error || !hasData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </div>
        <Card className="bg-red-900/20 border-red-700/30">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-400 mb-2">Cliente não encontrado</h2>
            <p className="text-gray-300">Não foi possível carregar os dados do cliente.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ============================================================================
  // PROFILE COMPLETENESS LOGIC
  // ============================================================================

  // Campos que impactam relatórios
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
      key: 'phone',
      label: 'Telefone',
      value: customer?.phone,
      required: true,
      icon: Phone,
      impact: 'Essencial para relatórios de WhatsApp e análises de contato.'
    },
    {
      key: 'address',
      label: 'Endereço',
      value: customer?.address,
      required: false,
      icon: MapPin,
      impact: 'Importante para análises geográficas e relatórios de entrega.'
    }
  ];

  const missingReportFields = reportFields.filter(
    field => !field.value || field.value === 'N/A' || field.value === 'Não definida'
  );
  const criticalMissingFields = missingReportFields.filter(field => field.required);
  const importantMissingFields = missingReportFields.filter(field => !field.required);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
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

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            onClick={handleEdit}
          >
            <Edit className="h-4 w-4" />
            Editar
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            onClick={handleWhatsApp}
            disabled={!hasPhoneNumber}
            title={!hasPhoneNumber ? 'Cliente não possui telefone' : 'Enviar mensagem via WhatsApp'}
          >
            <MessageSquare className="h-4 w-4" />
            WhatsApp
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            onClick={handleEmail}
            disabled={!hasEmailAddress}
            title={!hasEmailAddress ? 'Cliente não possui email' : 'Enviar email'}
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

      {/* Customer Header Card - Redesign UX/UI v3.2.0 */}
      <Card className="bg-black/70 backdrop-blur-xl border-white/20 hover:border-white/40 hover:shadow-2xl transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            {/* Customer Info */}
            <div className="flex items-start gap-6">
              {/* Avatar - Gradient Adega */}
              <div className="w-24 h-24 bg-gradient-to-br from-accent-gold-100 via-primary-yellow to-accent-gold-70 rounded-full flex items-center justify-center shadow-lg ring-4 ring-white/10">
                <span className="text-primary-black font-bold text-3xl drop-shadow-lg">
                  {customer.name?.charAt(0)?.toUpperCase() || 'C'}
                </span>
              </div>

              {/* Basic Info */}
              <div className="space-y-3">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">{customer.name}</h1>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant="outline"
                      className={`border-2 font-semibold text-sm ${
                        customer.segment === 'high_value' ? 'bg-accent-gold-100/30 text-accent-gold-100 border-accent-gold-100/60' :
                        customer.segment === 'regular' ? 'bg-accent-blue/30 text-accent-blue border-accent-blue/60' :
                        customer.segment === 'new' ? 'bg-accent-green/30 text-accent-green border-accent-green/60' :
                        customer.segment === 'at_risk' ? 'bg-accent-red/30 text-accent-red border-accent-red/60' :
                        'bg-gray-500/30 text-gray-200 border-gray-500/60'
                      }`}
                    >
                      {getSegmentLabel(customer.segment)}
                    </Badge>
                    <span className="text-gray-200 text-sm font-medium">
                      Cliente desde {customerSince}
                    </span>

                    {/* Profile Completeness Indicator */}
                    {!profileCompleteness.isComplete && (
                      <TooltipProvider delayDuration={200}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge
                              variant="outline"
                              className={`border-2 font-semibold ${
                                criticalMissingFields.length > 0
                                  ? 'border-accent-red/60 text-accent-red bg-accent-red/20'
                                  : 'border-yellow-400/60 text-yellow-400 bg-yellow-400/20'
                              } cursor-help`}
                            >
                              {criticalMissingFields.length > 0 ? (
                                <>
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                  Perfil Incompleto ({profileCompleteness.score}%)
                                </>
                              ) : (
                                <>
                                  <Info className="h-3 w-3 mr-1" />
                                  Perfil Básico ({profileCompleteness.score}%)
                                </>
                              )}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipPortal>
                            <TooltipContent
                              side="bottom"
                              className="max-w-sm z-[50000] bg-black/95 backdrop-blur-xl border border-red-400/30 shadow-2xl"
                              sideOffset={8}
                            >
                              <div className="space-y-2 p-1">
                                <div className="border-b border-white/10 pb-2">
                                  <span className="font-semibold text-red-400">Status do Perfil ({profileCompleteness.score}%)</span>
                                </div>
                                {profileCompleteness.missingFields.length > 0 && (
                                  <div>
                                    <p className="text-xs text-red-400 font-medium">
                                      ⚠️ Campos em falta:
                                    </p>
                                    <p className="text-xs text-gray-300">
                                      {profileCompleteness.missingFields.join(', ')}
                                    </p>
                                  </div>
                                )}
                                {profileCompleteness.recommendations.length > 0 && (
                                  <div>
                                    <p className="text-xs text-yellow-400 font-medium">
                                      💡 Recomendações:
                                    </p>
                                    {profileCompleteness.recommendations.map((rec, idx) => (
                                      <p key={idx} className="text-xs text-gray-300">• {rec}</p>
                                    ))}
                                  </div>
                                )}
                                <div className="pt-1 border-t border-white/10">
                                  <p className="text-xs text-gray-400">
                                    Campos em falta afetam a precisão dos relatórios
                                  </p>
                                </div>
                              </div>
                            </TooltipContent>
                          </TooltipPortal>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                </div>

                {/* Contact Info - Melhor contraste e alinhamento */}
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  {customer.phone && (
                    <div className="flex items-center gap-2 text-gray-200 font-medium">
                      <Phone className="h-4 w-4 text-accent-green" />
                      <span>{customer.phone}</span>
                    </div>
                  )}
                  {customer.email && (
                    <div className="flex items-center gap-2 text-gray-200 font-medium">
                      <Mail className="h-4 w-4 text-accent-blue" />
                      <span>{customer.email}</span>
                    </div>
                  )}
                  {customer.address && (
                    <div className="flex items-center gap-2 text-gray-200 font-medium">
                      <MapPin className="h-4 w-4 text-accent-purple" />
                      <span>{formatAddress(customer.address)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Key Metrics - SSoT StatCard com melhor spacing */}
            <div className="grid grid-cols-3 gap-4 min-w-[500px]">
              <StatCard
                layout="crm"
                variant={isHighValue ? "success" : "default"}
                title="Valor Total"
                value={formatCurrency(realMetrics?.lifetime_value_calculated || 0)}
                description={`💰 LTV ${realMetrics?.data_sync_status.ltv_synced ? '✅' : '⚠️'}`}
                icon={DollarSign}
                className="h-28"
                formatType="none"
              />

              <StatCard
                layout="crm"
                variant="purple"
                title="Compras"
                value={realMetrics?.total_purchases || 0}
                description="🛒 Total Real"
                icon={ShoppingBag}
                className="h-28"
              />

              <StatCard
                layout="crm"
                variant={isAtRisk ? "error" : "warning"}
                title="Dias Atrás"
                value={realMetrics?.days_since_last_purchase !== undefined ? realMetrics.days_since_last_purchase : '-'}
                description="⏱️ Última compra"
                icon={Calendar}
                className="h-28"
                formatType="none"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerProfileHeader;