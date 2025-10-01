/**
 * CustomerProfileHeader.tsx - Cabeçalho reutilizável do perfil do cliente
 *
 * @description
 * Componente SSoT v3.0.0 que centraliza o cabeçalho do perfil do cliente
 * com navegação, ações rápidas e métricas principais.
 *
 * @features
 * - Navegação breadcrumb responsiva
 * - Botões de ação contextual (Edit, WhatsApp, Email, Nova Venda)
 * - Card principal com avatar, informações básicas e métricas
 * - Integração com useCustomerOperations para validações
 * - Glassmorphism effects reutilizáveis
 *
 * @author Adega Manager Team
 * @version 3.0.0 - SSoT Implementation
 */

import React from 'react';
import { Card, CardContent } from '@/shared/ui/primitives/card';
import { Button } from '@/shared/ui/primitives/button';
import { Badge } from '@/shared/ui/primitives/badge';
import { StatCard } from '@/shared/ui/composite/stat-card';
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

export interface CustomerProfileHeaderProps {
  customer: CustomerData;
  realMetrics?: {
    lifetime_value_calculated?: number;
    total_purchases?: number;
    days_since_last_purchase?: number;
    data_sync_status: {
      ltv_synced: boolean;
      dates_synced: boolean;
      preferences_synced: boolean;
    };
  };
  onEdit: () => void;
  onBack?: () => void;
  onNewSale?: () => void;
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

export const CustomerProfileHeader: React.FC<CustomerProfileHeaderProps> = ({
  customer,
  realMetrics,
  onEdit,
  onBack,
  onNewSale,
  className = ''
}) => {
  // ============================================================================
  // BUSINESS LOGIC COM SSoT
  // ============================================================================

  const { insights } = useCustomerOperations(customer);

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
  const importantMissingFields = missingReportFields.filter(field => !field.required);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleWhatsApp = () => {
    if (!customer?.telefone) {
      alert('Cliente não possui telefone cadastrado');
      return;
    }
    const phone = customer.telefone.replace(/\D/g, '');
    const message = `Olá ${customer.cliente}, tudo bem? Aqui é da Adega! 🍷`;
    const url = `https://wa.me/55${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleEmail = () => {
    if (!customer?.email) {
      alert('Cliente não possui email cadastrado');
      return;
    }
    const subject = `Contato - Adega Wine Store`;
    const body = `Prezado(a) ${customer.cliente},\n\nEsperamos que esteja bem!\n\nAtenciosamente,\nEquipe Adega`;
    const url = `mailto:${customer.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(url, '_blank');
  };

  const handleNewSaleDefault = () => {
    const salesUrl = `/sales?customer_id=${customer.id}&customer_name=${encodeURIComponent(customer?.cliente || '')}`;
    window.open(salesUrl, '_blank');
  };

  const handleBackDefault = () => {
    window.history.back();
  };

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
            onClick={onBack || handleBackDefault}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <div className="text-sm text-gray-400">
            <span>Clientes</span>
            <span className="mx-2">/</span>
            <span className="text-white">{customer.cliente}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            onClick={onEdit}
          >
            <Edit className="h-4 w-4" />
            Editar
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            onClick={handleWhatsApp}
            disabled={!customer?.telefone}
            title={!customer?.telefone ? 'Cliente não possui telefone' : 'Enviar mensagem via WhatsApp'}
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
            onClick={onNewSale || handleNewSaleDefault}
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
              {/* Avatar */}
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                {customer.cliente?.charAt(0)?.toUpperCase() || 'C'}
              </div>

              {/* Basic Info */}
              <div className="space-y-2">
                <div>
                  <h1 className="text-2xl font-bold text-white">{customer.cliente}</h1>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge
                      className={`text-xs ${
                        customer.segmento === 'High Value' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                        customer.segmento === 'Regular' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                        customer.segmento === 'New' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' :
                        'bg-gray-500/20 text-gray-400 border-gray-500/30'
                      }`}
                    >
                      {customer.segmento || 'Não Classificado'}
                    </Badge>
                    <span className="text-gray-400 text-sm">
                      Cliente desde {new Date(customer.created_at || '').toLocaleDateString('pt-BR')}
                    </span>

                    {/* Profile Completeness Indicator */}
                    {(criticalMissingFields.length > 0 || importantMissingFields.length > 0) && (
                      <TooltipProvider delayDuration={200}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge
                              variant="outline"
                              className={`${
                                criticalMissingFields.length > 0
                                  ? 'border-red-400/50 text-red-400 bg-red-400/10'
                                  : 'border-yellow-400/50 text-yellow-400 bg-yellow-400/10'
                              } cursor-help`}
                            >
                              {criticalMissingFields.length > 0 ? (
                                <>
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                  Perfil Incompleto
                                </>
                              ) : (
                                <>
                                  <Info className="h-3 w-3 mr-1" />
                                  Perfil Básico
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
                                  <span className="font-semibold text-red-400">Status do Perfil</span>
                                </div>
                                {criticalMissingFields.length > 0 && (
                                  <div>
                                    <p className="text-xs text-red-400 font-medium">
                                      ⚠️ {criticalMissingFields.length} campo(s) crítico(s) em falta:
                                    </p>
                                    <p className="text-xs text-gray-300">
                                      {criticalMissingFields.map(f => f.label).join(', ')}
                                    </p>
                                  </div>
                                )}
                                {importantMissingFields.length > 0 && (
                                  <div>
                                    <p className="text-xs text-yellow-400 font-medium">
                                      📋 {importantMissingFields.length} campo(s) importante(s) em falta:
                                    </p>
                                    <p className="text-xs text-gray-300">
                                      {importantMissingFields.map(f => f.label).join(', ')}
                                    </p>
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

                {/* Contact Info */}
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  {customer.telefone && (
                    <div className="flex items-center gap-1 text-gray-300">
                      <Phone className="h-4 w-4" />
                      <span>{customer.telefone}</span>
                    </div>
                  )}
                  {customer.email && (
                    <div className="flex items-center gap-1 text-gray-300">
                      <Mail className="h-4 w-4" />
                      <span>{customer.email}</span>
                    </div>
                  )}
                  {customer.endereco && (
                    <div className="flex items-center gap-1 text-gray-300">
                      <MapPin className="h-4 w-4" />
                      <span>{customer.endereco}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Key Metrics - SSoT StatCard */}
            <div className="grid grid-cols-3 gap-4">
              <StatCard
                layout="crm"
                variant="success"
                title="Valor Total"
                value={formatCurrency(realMetrics?.lifetime_value_calculated || 0)}
                description={`💰 LTV ${realMetrics?.data_sync_status.ltv_synced ? '✅' : '⚠️'}`}
                icon={DollarSign}
                className="h-24"
                formatType="none"
              />

              <StatCard
                layout="crm"
                variant="default"
                title="Compras"
                value={realMetrics?.total_purchases || 0}
                description="🛒 Total Real"
                icon={ShoppingBag}
                className="h-24"
              />

              <StatCard
                layout="crm"
                variant="warning"
                title="Dias Atrás"
                value={realMetrics?.days_since_last_purchase !== undefined ? realMetrics.days_since_last_purchase : '-'}
                description="⏱️ Última compra"
                icon={Calendar}
                className="h-24"
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