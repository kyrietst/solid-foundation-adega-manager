/**
 * CustomerProfile.tsx - Página de perfil do cliente SSoT v3.0.0
 *
 * @description
 * Implementação completa SSoT v3.0.0 com nova arquitetura de informação
 * focada em ações de vendas. Reduzida de 1,475 → ~300 linhas (80% redução).
 *
 * @features
 * - 5 tabs otimizadas (vs 8 antigas) - 37.5% redução na complexidade
 * - Business logic centralizada em hooks SSoT
 * - Componentes reutilizáveis
 * - Foco em geração de receita
 * - Timeline integrada na Visão Geral
 * - Analytics + IA unificados
 *
 * @author Adega Manager Team
 * @version 3.0.0 - SSoT Implementation
 */

import React, { useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/primitives/tabs';
import { LoadingScreen } from '@/shared/ui/composite/loading-spinner';
import { Button } from '@/shared/ui/primitives/button';
import {
  User,
  ShoppingBag,
  Brain,
  MessageSquare,
  Zap,
  ArrowLeft
} from 'lucide-react';

// Importar componentes SSoT v3.0.0
import { CustomerProfileHeader } from './CustomerProfileHeader';
import { CustomerOverviewTab } from './CustomerOverviewTab';
import { CustomerPurchaseHistoryTab } from './CustomerPurchaseHistoryTab';
import { CustomerInsightsTab } from './CustomerInsightsTab';
import { CustomerCommunicationTab } from './CustomerCommunicationTab';
import { CustomerActionsTab } from './CustomerActionsTab';
import { EditCustomerModal } from './EditCustomerModal';

// Hooks e dados
import { useCustomer, useCustomerPurchases } from '@/features/customers/hooks/use-crm';
import { useCustomerRealMetrics } from '@/features/customers/hooks/useCustomerRealMetrics';

// ============================================================================
// TYPES
// ============================================================================

export interface CustomerProfileProps {
  className?: string;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export const CustomerProfile = ({ className }: CustomerProfileProps) => {
  // ============================================================================
  // HOOKS E ESTADO
  // ============================================================================

  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  // Buscar dados do cliente
  const {
    data: customer,
    isLoading,
    error
  } = useCustomer(id || '');

  // Buscar métricas reais calculadas
  const {
    data: realMetrics,
    isLoading: isLoadingMetrics,
    error: metricsError
  } = useCustomerRealMetrics(id || '');

  // Buscar histórico de compras
  const {
    data: purchases = [],
    isLoading: isLoadingPurchases,
    error: purchasesError
  } = useCustomerPurchases(id || '');

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleEdit = () => {
    setIsEditModalOpen(true);
  };

  const handleNewSale = () => {
    const salesUrl = `/sales?customer_id=${id}&customer_name=${encodeURIComponent(customer?.cliente || '')}`;
    window.open(salesUrl, '_blank');
  };

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

  // ============================================================================
  // GUARDS E VALIDAÇÕES
  // ============================================================================

  // Se não tem ID, redirecionar
  if (!id) {
    return <Navigate to="/customers" replace />;
  }

  // Loading state
  if (isLoading || isLoadingMetrics) {
    return <LoadingScreen text="Carregando perfil do cliente..." />;
  }

  // Error state
  if (error || !customer) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="text-red-400 text-lg">❌ Cliente não encontrado</div>
        <Button
          variant="outline"
          onClick={() => window.history.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
      </div>
    );
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header Unificado - Componente SSoT */}
      <CustomerProfileHeader
        customer={customer}
        realMetrics={realMetrics}
        onEdit={handleEdit}
        onNewSale={handleNewSale}
      />

      {/* Sistema de Tabs - Nova Estrutura 5 Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5 bg-gray-800/50">
          {/* Tab 1: Visão Geral (Dashboard + Timeline) */}
          <TabsTrigger value="overview" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Visão Geral</span>
            </div>
          </TabsTrigger>

          {/* Tab 2: Histórico de Compras (Compras + Financeiro) */}
          <TabsTrigger value="purchases" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
            <div className="flex items-center gap-1">
              <ShoppingBag className="h-4 w-4" />
              <span className="hidden sm:inline">Histórico de Compras</span>
            </div>
          </TabsTrigger>

          {/* Tab 3: Insights & Analytics (Analytics + IA unificados) */}
          <TabsTrigger value="insights" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
            <div className="flex items-center gap-1">
              <Brain className="h-4 w-4" />
              <span className="hidden sm:inline">Insights & Analytics</span>
            </div>
          </TabsTrigger>

          {/* Tab 4: Comunicação (Comunicação + Documentos) */}
          <TabsTrigger value="communication" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
            <div className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Comunicação</span>
            </div>
          </TabsTrigger>

          {/* Tab 5: Ações Rápidas (NOVA - Ferramentas de Vendas) */}
          <TabsTrigger value="actions" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
            <div className="flex items-center gap-1">
              <Zap className="h-4 w-4" />
              <span className="hidden sm:inline">Ações Rápidas</span>
            </div>
          </TabsTrigger>
        </TabsList>

        {/* Conteúdo das Tabs - Componentes SSoT */}
        <div className="mt-6">
          {/* Tab 1: Visão Geral - Dashboard + Timeline integrada */}
          <TabsContent value="overview">
            <CustomerOverviewTab
              customer={customer}
              realMetrics={realMetrics}
              onEdit={handleEdit}
              onWhatsApp={handleWhatsApp}
              onEmail={handleEmail}
            />
          </TabsContent>

          {/* Tab 2: Histórico de Compras - Compras + Financeiro unificados */}
          <TabsContent value="purchases">
            <CustomerPurchaseHistoryTab
              purchases={purchases}
              isLoading={isLoadingPurchases}
              error={purchasesError}
            />
          </TabsContent>

          {/* Tab 3: Insights & Analytics - Analytics + IA consolidados */}
          <TabsContent value="insights">
            <CustomerInsightsTab
              purchases={purchases}
              customerData={{
                segmento: customer.segmento,
                totalCompras: customer.totalCompras,
                valorTotalCompras: customer.valorTotalCompras,
                ultimaCompra: customer.ultimaCompra
              }}
            />
          </TabsContent>

          {/* Tab 4: Comunicação - Centro de comunicação + documentos */}
          <TabsContent value="communication">
            <CustomerCommunicationTab
              customer={customer}
              onWhatsApp={handleWhatsApp}
              onEmail={handleEmail}
            />
          </TabsContent>

          {/* Tab 5: Ações Rápidas - NOVA - Ferramentas de vendas */}
          <TabsContent value="actions">
            <CustomerActionsTab
              customer={customer}
              onNewSale={handleNewSale}
              onWhatsApp={handleWhatsApp}
              onEmail={handleEmail}
            />
          </TabsContent>
        </div>
      </Tabs>

      {/* Modal de Edição - Mantido para compatibilidade */}
      <EditCustomerModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        customer={customer}
      />
    </div>
  );
};

export default CustomerProfile;