/**
 * CustomerProfile.tsx - Página de perfil do cliente SSoT v3.1.0
 *
 * @description
 * Implementação SSoT v3.1.0 com arquitetura completamente server-side.
 * CustomerProfileHeader e CustomerActionsTab agora são 100% autossuficientes.
 *
 * @features
 * - 5 tabs otimizadas com SSoT v3.1.0 compliance
 * - CustomerProfileHeader autossuficiente (customerId only)
 * - CustomerActionsTab com Revenue Intelligence Center
 * - Business logic centralizada em hooks SSoT server-side
 * - Eliminação de props dependencies
 * - Performance otimizada com cache inteligente
 *
 * @author Adega Manager Team
 * @version 3.1.0 - SSoT Server-Side Implementation
 */

import React, { useState, useEffect } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/primitives/tabs';
import { LoadingScreen } from '@/shared/ui/composite/loading-spinner';
import { Button } from '@/shared/ui/primitives/button';
import {
  User,
  ShoppingBag,
  Brain,
  MessageSquare,
  Zap,
  ArrowLeft,
  History
} from 'lucide-react';

// Importar componentes SSoT v3.0.0
import { CustomerProfileHeader } from './CustomerProfileHeader';
import { CustomerOverviewTab } from './CustomerOverviewTab';
import { CustomerPurchaseHistoryTab } from './CustomerPurchaseHistoryTab';
import { CustomerInsightsTab } from './CustomerInsightsTab';
import { CustomerCommunicationTab } from './CustomerCommunicationTab';
import { CustomerActionsTab } from './CustomerActionsTab';
import { CustomerHistoricalSalesTab } from './CustomerHistoricalSalesTab';
import { EditCustomerModal } from './EditCustomerModal';
import { DeleteCustomerModal } from './DeleteCustomerModal';

// Hooks e dados
import { useCustomer } from '@/features/customers/hooks/use-crm';
import { useAuth } from '@/app/providers/AuthContext';

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
  const navigate = useNavigate();
  const { userRole } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Check if user is admin
  const isAdmin = userRole === 'admin';

  // ============================================================================
  // DATA FETCHING - Mínimo necessário para validação
  // ============================================================================

  // Buscar dados básicos do cliente apenas para validação
  const {
    data: customer,
    isLoading,
    error
  } = useCustomer(id || '');

  // ============================================================================
  // CUSTOM EVENT LISTENER - SSoT v3.1.0 Integration Fix
  // ============================================================================

  // Escutar eventos personalizados disparados pelo CustomerProfileHeader
  useEffect(() => {
    const handleOpenEditModal = () => {
      console.log('🔧 Custom Event received: openCustomerEditModal');
      setIsEditModalOpen(true);
    };

    const handleOpenDeleteModal = () => {
      console.log('🗑️ Custom Event received: openCustomerDeleteModal');
      setIsDeleteModalOpen(true);
    };

    window.addEventListener('openCustomerEditModal', handleOpenEditModal as EventListener);
    window.addEventListener('openCustomerDeleteModal', handleOpenDeleteModal as EventListener);

    return () => {
      window.removeEventListener('openCustomerEditModal', handleOpenEditModal as EventListener);
      window.removeEventListener('openCustomerDeleteModal', handleOpenDeleteModal as EventListener);
    };
  }, []);

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

  const handleDeleteSuccess = () => {
    // Redirecionar para lista de clientes após exclusão bem-sucedida
    navigate('/customers');
  };

  // ============================================================================
  // GUARDS E VALIDAÇÕES
  // ============================================================================

  // Se não tem ID, redirecionar
  if (!id) {
    return <Navigate to="/customers" replace />;
  }

  // Loading state - Simplified (Header handles its own loading)
  if (isLoading) {
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
    <div className={`w-full px-4 sm:px-6 lg:px-8 space-y-6 ${className || ''}`}>
      {/* Header Unificado - Componente SSoT v3.1.0 */}
      <CustomerProfileHeader
        customerId={id || ''}
      />

      {/* Sistema de Tabs - Nova Estrutura 6 Tabs (admin tem acesso a Importar Vendas) */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className={`grid w-full ${isAdmin ? 'grid-cols-6' : 'grid-cols-5'} bg-gray-800/50`}>
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

          {/* Tab 5: Ações Rápidas (Ferramentas de Vendas) */}
          <TabsTrigger value="actions" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
            <div className="flex items-center gap-1">
              <Zap className="h-4 w-4" />
              <span className="hidden sm:inline">Ações Rápidas</span>
            </div>
          </TabsTrigger>

          {/* Tab 6: Importar Vendas Históricas (ADMIN ONLY) */}
          {isAdmin && (
            <TabsTrigger value="historical" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
              <div className="flex items-center gap-1">
                <History className="h-4 w-4" />
                <span className="hidden sm:inline">Importar Vendas</span>
              </div>
            </TabsTrigger>
          )}
        </TabsList>

        {/* Conteúdo das Tabs - Componentes SSoT */}
        <div className="mt-6">
          {/* Tab 1: Visão Geral - Dashboard + Timeline integrada */}
          <TabsContent value="overview">
            <CustomerOverviewTab
              customerId={id || ''}
            />
          </TabsContent>

          {/* Tab 2: Histórico de Compras - SSoT v3.1.0 Server-Side */}
          <TabsContent value="purchases">
            <CustomerPurchaseHistoryTab
              customerId={id || ''}
            />
          </TabsContent>

          {/* Tab 3: Insights & Analytics - SSoT v3.1.0 ✅ */}
          <TabsContent value="insights">
            <CustomerInsightsTab
              customerId={id || ''}
            />
          </TabsContent>

          {/* Tab 4: Comunicação - Centro de comunicação SSoT v3.1.0 */}
          <TabsContent value="communication">
            <CustomerCommunicationTab
              customerId={id || ''}
            />
          </TabsContent>

          {/* Tab 5: Ações Rápidas - SSoT v3.1.0 Revenue Intelligence Center */}
          <TabsContent value="actions">
            <CustomerActionsTab
              customerId={id || ''}
            />
          </TabsContent>

          {/* Tab 6: Importar Vendas Históricas - ADMIN ONLY */}
          {isAdmin && (
            <TabsContent value="historical">
              <CustomerHistoricalSalesTab
                customerId={id || ''}
              />
            </TabsContent>
          )}
        </div>
      </Tabs>

      {/* Modal de Edição - Mantido para compatibilidade */}
      <EditCustomerModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        customer={customer}
      />

      {/* Modal de Exclusão - Sistema de Hard Delete (v3.3.0) */}
      <DeleteCustomerModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        customerId={id || null}
        customerName={customer?.name || ''}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
};

export default CustomerProfile;