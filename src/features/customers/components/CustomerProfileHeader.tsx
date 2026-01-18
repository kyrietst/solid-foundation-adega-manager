/**
 * CustomerProfileHeader.tsx - Sidebar Identity Panel Refactored (Visual v3.0 - Dark Glass)
 */

import React from 'react';
import { Button } from '@/shared/ui/primitives/button';
import { Badge } from '@/shared/ui/primitives/badge';
import { Card, CardContent } from '@/shared/ui/primitives/card';
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  MoreHorizontal,
  MessageSquare,
  AlertTriangle,
  Info,
  Plus,
  Pencil
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

// ============================================================================
// COMPONENTE PRINCIPAL (SIDEBAR VERTICAL)
// ============================================================================

export const CustomerProfileHeader: React.FC<CustomerProfileHeaderProps> = ({
  customerId,
  className = ''
}) => {
  // ============================================================================
  // SSoT HOOK
  // ============================================================================

  const {
    customer,
    profileCompleteness,
    isLoading,
    error,
    handleEdit,
    handleEmail,
    handleBack,
    handleNewSale,
    handleWhatsApp,
    getSegmentLabel,
    hasPhoneNumber,
    hasEmailAddress,
    hasData
  } = useCustomerProfileHeaderSSoT(customerId);

  // ============================================================================
  // EARLY RETURNS
  // ============================================================================

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 sticky top-8 animate-pulse">
        <div className="h-[400px] w-full bg-gray-800/50 rounded-2xl" />
        <div className="h-[200px] w-full bg-gray-800/50 rounded-2xl" />
      </div>
    );
  }

  if (error || !hasData) {
    return (
      <div className="flex flex-col gap-6 sticky top-8">
        <div className="p-6 rounded-2xl bg-red-900/10 border border-red-500/20 text-center">
          <AlertTriangle className="h-10 w-10 text-red-500 mx-auto mb-2" />
          <h3 className="text-red-400 font-bold">Cliente não encontrado</h3>
          <Button variant="outline" onClick={handleBack} className="mt-4 border-red-500/30 text-red-300 hover:bg-red-900/20">
            <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
          </Button>
        </div>
      </div>
    );
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className={`flex flex-col gap-6 sticky top-8 ${className}`}>

      {/* 1. Profile Identity Card */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl p-6 flex flex-col items-center text-center group transition-all hover:border-white/20 hover:bg-black/50 hover:shadow-2xl hover:shadow-primary/5">

        {/* Glow Effect on Hover */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        {/* Back Button (Absolute Top Left) */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="absolute top-4 left-4 text-zinc-500 hover:text-white p-2 h-auto"
          title="Voltar"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        {/* Avatar Section */}
        <div className="relative mb-4 mt-2">
          <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-zinc-800 to-zinc-900 border border-white/10 shadow-xl flex items-center justify-center">
            {/* Avatar Fallback / Content */}
            <div className="w-full h-full rounded-full bg-gradient-to-br from-primary/80 to-purple-900/80 flex items-center justify-center">
              <span className="text-4xl font-bold text-white drop-shadow-md">
                {customer.name?.charAt(0)?.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Status Indicator Dot */}
          <div className="absolute bottom-1 right-1 bg-zinc-950 rounded-full p-1.5 border border-zinc-800">
            <div className={`size-3 rounded-full animate-pulse ${customer.segment === 'at_risk' ? 'bg-red-500' :
              customer.segment === 'VIP' ? 'bg-amber-400' :
                'bg-emerald-500'
              }`} />
          </div>
        </div>

        {/* Name & Segment */}
        <h1 className="text-2xl font-bold text-white mb-1 line-clamp-2">{customer.name}</h1>
        <p className="text-sm text-zinc-400 mb-6 flex items-center justify-center gap-2">
          <Badge variant="outline" className={`border-zinc-700 bg-zinc-900/50 ${customer.segment === 'high_value' ? 'text-amber-400 border-amber-500/30' : 'text-zinc-400'
            }`}>
            {getSegmentLabel(customer.segment)}
          </Badge>
          {/* Completeness Badge */}
          {!profileCompleteness.isComplete && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="flex items-center text-xs text-amber-500 cursor-help">
                    <Info className="h-3 w-3 mr-1" />
                    {profileCompleteness.score}%
                  </span>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="dark bg-zinc-900 border-zinc-800">
                  <p>Perfil incompleto. Preencha os dados restantes.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </p>

        {/* Primary Actions (Horizontal) */}
        {/* Primary Actions (Vertical Group) */}
        <div className="flex flex-col gap-3 w-full">

          {/* Main CTA: Nova Venda */}
          <Button
            onClick={handleNewSale}
            className="w-full h-12 rounded-full bg-amber-500 hover:bg-amber-600 text-black font-bold text-base shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Nova Venda
          </Button>

          {/* Secondary Actions Row */}
          <div className="flex w-full gap-3">

            {/* WhatsApp */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex-1 h-10 rounded-full border-white/10 bg-white/5 hover:bg-white/10 hover:text-green-400 text-zinc-300 transition-all"
                    onClick={handleWhatsApp}
                    disabled={!hasPhoneNumber}
                  >
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="dark bg-zinc-900 border-zinc-800">
                  <p>WhatsApp</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Email */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex-1 h-10 rounded-full border-white/10 bg-white/5 hover:bg-white/10 hover:text-blue-400 text-zinc-300 transition-all"
                    onClick={handleEmail}
                    disabled={!hasEmailAddress}
                  >
                    <Mail className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="dark bg-zinc-900 border-zinc-800">
                  <p>Enviar Email</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Edit Action */}
            <Button
              variant="outline"
              size="icon"
              className="size-10 rounded-full border-white/10 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all flex items-center justify-center shrink-0"
              onClick={handleEdit}
              title="Editar Cliente"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Contact Details Card */}
      <div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl p-6 flex flex-col gap-6 hover:border-white/20 transition-all">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Detalhes de Contato</h3>

        {/* Phone */}
        <div className="flex items-start gap-4 group cursor-pointer transition-all">
          <div className="size-10 rounded-full bg-zinc-800/50 flex items-center justify-center text-zinc-400 group-hover:text-primary group-hover:bg-primary/10 transition-all">
            <Phone className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-zinc-400">Telefone</span>
            <span className="text-base text-white font-medium">
              {customer.phone || 'Não informado'}
            </span>
          </div>
        </div>

        {/* Email */}
        <div className="flex items-start gap-4 group cursor-pointer transition-all">
          <div className="size-10 rounded-full bg-zinc-800/50 flex items-center justify-center text-zinc-400 group-hover:text-primary group-hover:bg-primary/10 transition-all">
            <Mail className="h-5 w-5" />
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm text-zinc-400">Email</span>
            <span className="text-base text-white font-medium truncate" title={customer.email || ''}>
              {customer.email || 'Não informado'}
            </span>
          </div>
        </div>

        {/* Address */}
        <div className="flex items-start gap-4 group cursor-pointer transition-all">
          <div className="size-10 rounded-full bg-zinc-800/50 flex items-center justify-center text-zinc-400 group-hover:text-primary group-hover:bg-primary/10 transition-all">
            <MapPin className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-zinc-400">Endereço Principal</span>
            <span className="text-base text-white font-medium line-clamp-2">
              {formatAddress(customer.address) || 'Endereço não cadastrado'}
            </span>
          </div>
        </div>

      </div>

      {/* 3. Critical Fields Alert */}
      {(() => {
        const REPORT_FIELDS = [
          { key: 'email', label: 'Email', required: true },
          { key: 'phone', label: 'Telefone', required: true },
        ];

        const criticalMissingFields = REPORT_FIELDS.filter(field => {
          const value = customer[field.key as keyof typeof customer];
          return !value || value === '' || value === 'N/A';
        });

        if (criticalMissingFields.length === 0) return null;

        return (
          <Card className="bg-gradient-to-r from-red-900/30 to-red-800/20 border-red-500/40">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5 animate-pulse" />
                <div className="flex-1">
                  <h4 className="text-red-400 font-medium mb-1">Atenção Necessária</h4>
                  <p className="text-gray-300 text-sm mb-2">
                    {criticalMissingFields.length} dados de contato pendentes:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {criticalMissingFields.map((field, index) => (
                      <Badge key={index} variant="outline" className="border-red-400/50 text-red-400 bg-red-900/20">
                        {field.label}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })()}

    </div>
  );
};

export default CustomerProfileHeader;