
/**
 * CustomerOverviewTab.tsx - Tab SSoT v4.0.0 Refatorado
 * Componente Orchestrator
 */

import React from 'react';
import { Card, CardContent } from '@/shared/ui/primitives/card';
import { Button } from '@/shared/ui/primitives/button';
import { Badge } from '@/shared/ui/primitives/badge';
import { StatCard } from '@/shared/ui/composite/stat-card';
import { LoadingSpinner } from '@/shared/ui/composite/loading-spinner';
import { useGlassmorphismEffect } from '@/shared/hooks/ui/useGlassmorphismEffect';
import {
  DollarSign,
  BarChart3,
  Package,
  AlertTriangle,
  AlertCircle,
  TrendingUp // Added missing import
} from 'lucide-react';
import { formatCurrency } from '@/core/config/utils';
import { useCustomerOverviewSSoT } from '@/shared/hooks/business/useCustomerOverviewSSoT';

// Sub-components
import { CustomerFinanceCard } from './cards/CustomerFinanceCard';
import { CustomerActivityCard } from './cards/CustomerActivityCard';
import { CustomerPreferencesCard } from './cards/CustomerPreferencesCard';
import { CustomerContactCard } from './cards/CustomerContactCard';
import { CustomerTimeline } from './CustomerTimeline';

export interface CustomerOverviewTabProps {
  customerId: string;
  className?: string;
}

export const CustomerOverviewTab: React.FC<CustomerOverviewTabProps> = ({
  customerId,
  className = ''
}) => {
  const { handleMouseMove } = useGlassmorphismEffect();

  const {
    customer,
    metrics: realMetrics,
    timeline,
    isLoading,
    error,
    sendWhatsApp,
    sendEmail,
    customerStatus,
    profileCompleteness,
    missingCriticalFields: criticalMissingFields,
    isEmpty,
    refetch
  } = useCustomerOverviewSSoT(customerId);

  // Guards
  if (isLoading) {
    return (
      <section className={`bg-black/80 backdrop-blur-sm border border-white/10 rounded-xl shadow-lg py-6 px-4 sm:px-6 space-y-6 ${className}`}>
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner text="Carregando visão geral do cliente..." />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className={`bg-black/80 backdrop-blur-sm border border-white/10 rounded-xl shadow-lg py-6 px-4 sm:px-6 space-y-6 ${className}`}>
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

  if (isEmpty) {
    return (
      <section className={`bg-black/80 backdrop-blur-sm border border-white/10 rounded-xl shadow-lg py-6 px-4 sm:px-6 space-y-6 ${className}`}>
        <Card className="bg-gray-800/30 border-gray-700/40">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-500 opacity-50" />
            <div className="text-gray-400">Cliente não encontrado</div>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section
      className={`bg-black/80 backdrop-blur-sm border border-white/10 rounded-xl shadow-lg py-6 px-4 sm:px-6 hover:shadow-2xl hover:shadow-purple-500/10 hover:border-purple-400/30 transition-all duration-300 space-y-6 ${className}`}
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
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cards Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <CustomerFinanceCard metrics={realMetrics} />
        <CustomerActivityCard metrics={realMetrics} customerStatus={customerStatus} />
        <CustomerPreferencesCard metrics={realMetrics} segment={customer.segment || ''} />
        <CustomerContactCard
          customer={customer}
          profileCompleteness={`${profileCompleteness}%`}
          onSendWhatsApp={sendWhatsApp}
          onSendEmail={sendEmail}
        />
      </div>

      {/* Seção de Métricas Avançadas */}
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
            value={realMetrics?.avg_items_per_purchase ? realMetrics.avg_items_per_purchase.toFixed(1) : '0'}
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

      {/* Timeline Section */}
      <CustomerTimeline timeline={timeline} />
    </section>
  );
};

export default CustomerOverviewTab;