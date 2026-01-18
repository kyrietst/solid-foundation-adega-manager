
/**
 * CustomerOverviewTab.tsx - Tab SSoT v4.0.0 Refatorado
 * Componente Orchestrator
 */

import React from 'react';
import { Card, CardContent } from '@/shared/ui/primitives/card';
import { Button } from '@/shared/ui/primitives/button';
import { Badge } from '@/shared/ui/primitives/badge';
import { LoadingSpinner } from '@/shared/ui/composite/loading-spinner';
import { useGlassmorphismEffect } from '@/shared/hooks/ui/useGlassmorphismEffect';
import {
  AlertTriangle,
  AlertCircle
} from 'lucide-react';
import { formatCurrency } from '@/core/config/utils';
import { useCustomerOverviewSSoT } from '@/shared/hooks/business/useCustomerOverviewSSoT';

// Sub-components

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
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner text="Carregando visão geral do cliente..." />
        </div>
      </div>
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
    <div
      className={`space-y-6 ${className}`}
    >






      {/* Timeline Section */}
      <CustomerTimeline timeline={timeline} />
    </div>
  );
};

export default CustomerOverviewTab;