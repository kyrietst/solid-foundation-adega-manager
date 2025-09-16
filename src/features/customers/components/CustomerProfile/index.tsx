/**
 * CustomerProfile/index.tsx - Container Principal (Context7 Pattern)
 * Componente refatorado de 1.474 linhas dividido em sub-componentes
 * Responsabilidades: Orchestração, navegação, estados globais
 */

import React, { useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Tabs } from '@/shared/ui/primitives/tabs';
import { LoadingScreen } from '@/shared/ui/composite/loading-spinner';
import { useGlassmorphismEffect } from '@/shared/hooks/ui/useGlassmorphismEffect';
import { useCustomer, useCustomerPurchases } from '@/features/customers/hooks/use-crm';
import { useCustomerRealMetrics } from '@/features/customers/hooks/useCustomerRealMetrics';
import { EditCustomerModal } from '../EditCustomerModal';

import { CustomerHeader } from './CustomerHeader';
import { CustomerTabs } from './CustomerTabs';
import { CustomerStatsSection } from './CustomerStatsSection';
import { CustomerChartsSection } from './CustomerChartsSection';
import { CustomerInsightsSection } from './CustomerInsightsSection';
import { CustomerEmptyTabs } from './CustomerEmptyTabs';

import type { CustomerProfileProps, MissingField } from './types';
import { Mail, Phone, MapPin, TrendingUp, Calendar } from 'lucide-react';

export const CustomerProfile: React.FC<CustomerProfileProps> = ({ className }) => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Hook para efeito glassmorphism reutilizável
  const { handleMouseMove } = useGlassmorphismEffect();

  // Data hooks
  const { data: customer, isLoading: customerLoading, error: customerError } = useCustomer(id!);
  const { data: purchases = [], isLoading: purchasesLoading, error: purchasesError } = useCustomerPurchases(id!);
  const { data: realMetrics } = useCustomerRealMetrics(id!);

  // Loading state
  if (customerLoading) {
    return <LoadingScreen />;
  }

  // Error or not found
  if (customerError || !customer) {
    return <Navigate to="/customers" replace />;
  }

  // Função para verificar campos em falta
  const checkMissingReportFields = (customer: Record<string, any>): MissingField[] => {
    const reportFields = [
      { key: 'email', label: 'Email', value: customer?.email, required: true, icon: Mail, impact: 'Necessário para campanhas de email marketing e relatórios de comunicação.' },
      { key: 'phone', label: 'Telefone', value: customer?.phone, required: true, icon: Phone, impact: 'Essencial para relatórios de WhatsApp e análises de contato.' },
      { key: 'address', label: 'Endereço', value: customer?.address, required: false, icon: MapPin, impact: 'Importante para análises geográficas e relatórios de entrega.' },
      { key: 'favorite_category', label: 'Categoria Favorita', value: customer?.favorite_category, required: false, icon: TrendingUp, impact: 'Fundamental para relatórios de preferências e recomendações.' },
      { key: 'birthday', label: 'Aniversário', value: customer?.birthday, required: false, icon: Calendar, impact: 'Usado em campanhas sazonais e análises demográficas.' }
    ];

    return reportFields.filter(field => !field.value || field.value === 'N/A' || field.value === 'Não definida');
  };

  const missingFields = checkMissingReportFields(customer);

  // Event handlers
  const handleWhatsApp = () => {
    if (customer.phone) {
      const phone = customer.phone.replace(/\D/g, '');
      window.open(`https://wa.me/55${phone}`, '_blank');
    }
  };

  const handleEmail = () => {
    if (customer.email) {
      window.open(`mailto:${customer.email}`, '_blank');
    }
  };

  const handleNewSale = () => {
    window.open(`/sales?customer=${customer.id}`, '_blank');
  };

  return (
    <div className={className}>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-4">
        {/* Header Principal */}
        <CustomerHeader
          customer={customer}
          realMetrics={realMetrics}
          missingFields={missingFields}
          onEdit={() => setIsEditModalOpen(true)}
          onWhatsApp={handleWhatsApp}
          onEmail={handleEmail}
          onNewSale={handleNewSale}
          isEditModalOpen={isEditModalOpen}
          setIsEditModalOpen={setIsEditModalOpen}
        />

        {/* Sistema de Tabs */}
        <CustomerTabs activeTab={activeTab} onTabChange={setActiveTab}>
          {/* Overview - Stats */}
          {activeTab === 'overview' && (
            <CustomerStatsSection
              customer={customer}
              realMetrics={realMetrics}
              missingFields={missingFields}
              onEdit={() => setIsEditModalOpen(true)}
              handleMouseMove={handleMouseMove}
            />
          )}

          {/* Analytics - Charts */}
          {activeTab === 'analytics' && (
            <CustomerChartsSection
              purchases={purchases}
              customer={customer}
              isLoading={purchasesLoading}
              error={purchasesError}
              handleMouseMove={handleMouseMove}
            />
          )}

          {/* Purchases - Insights */}
          {activeTab === 'purchases' && (
            <CustomerInsightsSection
              purchases={purchases}
              customer={customer}
              isLoading={purchasesLoading}
              error={purchasesError}
              handleMouseMove={handleMouseMove}
            />
          )}

          {/* Empty Tabs */}
          {['communication', 'financial', 'insights', 'documents', 'timeline'].includes(activeTab) && (
            <CustomerEmptyTabs activeTab={activeTab} handleMouseMove={handleMouseMove} />
          )}
        </CustomerTabs>
      </Tabs>

      {/* Modal de Edição */}
      <EditCustomerModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        customer={customer}
      />
    </div>
  );
};