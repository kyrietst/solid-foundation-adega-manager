/**
 * CustomerProfile.tsx - Refactor Visual Stitch "Dark Glass"
 * 
 * @description
 * Full layout refactor implementing the Referência Visual v3 (Dark Glass).
 * - Layout: Grid 12 cols (3 cols Sidebar / 9 cols Main)
 * - Background: bg-zinc-950 global
 * - Navigation: Pills Tabs
 * 
 * @version 4.0.0 Refactor
 */

import React, { useState, useEffect } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/primitives/tabs';
import { LoadingScreen } from '@/shared/ui/composite/loading-spinner';
import { Button } from '@/shared/ui/primitives/button';
import { ArrowLeft, User, ShoppingBag } from 'lucide-react';

// SSoT Hooks
import { useCustomer } from '@/features/customers/hooks/use-crm';
import { useCustomerProfileHeaderSSoT } from '@/shared/hooks/business/useCustomerProfileHeaderSSoT';
import { useAuth } from '@/app/providers/AuthContext';

// Components
import { CustomerProfileHeader } from './CustomerProfileHeader';
import { CustomerOverviewTab } from './CustomerOverviewTab';
import { CustomerPurchaseHistoryTab } from './CustomerPurchaseHistoryTab';
import { EditCustomerModal } from './EditCustomerModal';
import { DeleteCustomerModal } from './DeleteCustomerModal';
import { CustomerStats } from './CustomerStats';
import { CustomerMainMetrics } from './CustomerMainMetrics';
import { CustomerAdvancedMetrics } from './CustomerAdvancedMetrics';


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
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // SSoT Hook for shared data (Metrics & Actions)
  const {
    realMetrics,
    handleNewSale,
    handleWhatsApp,
    hasPhoneNumber,
    customer: headerCustomer,
    isLoading: headerLoading
  } = useCustomerProfileHeaderSSoT(id || '');

  // Fetch basic customer data for validation (legacy)
  const {
    data: customer,
    isLoading: isCustomerLoading,
    error
  } = useCustomer(id || '');

  // ============================================================================
  // CUSTOM EVENT LISTENER - SSoT v3.1.0 Integration Fix
  // ============================================================================

  useEffect(() => {
    const handleOpenEditModal = () => { setIsEditModalOpen(true); };
    const handleOpenDeleteModal = () => { setIsDeleteModalOpen(true); };

    window.addEventListener('openCustomerEditModal', handleOpenEditModal as EventListener);
    window.addEventListener('openCustomerDeleteModal', handleOpenDeleteModal as EventListener);

    return () => {
      window.removeEventListener('openCustomerEditModal', handleOpenEditModal as EventListener);
      window.removeEventListener('openCustomerDeleteModal', handleOpenDeleteModal as EventListener);
    };
  }, []);

  const handleDeleteSuccess = () => {
    navigate('/customers');
  };

  // ============================================================================
  // GUARDS E VALIDAÇÕES
  // ============================================================================

  if (!id) return <Navigate to="/customers" replace />;
  if (isCustomerLoading || headerLoading) return <LoadingScreen text="Carregando perfil..." />;

  if (error || !customer) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="text-red-400 text-lg">❌ Cliente não encontrado</div>
        <Button variant="outline" onClick={() => window.history.back()} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Button>
      </div>
    );
  }

  // ============================================================================
  // RENDER - LAYOUT DARK GLASS
  // ============================================================================

  return (
    <div className={`flex flex-col w-full min-h-screen bg-zinc-950 text-zinc-100 animate-in fade-in duration-500 ${className || ''}`}>

      {/* Ambient Glows */}
      <div className="fixed top-[-20%] left-[-10%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="fixed bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none z-0" />

      {/* Main Grid Layout - FULL WIDTH */}
      <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 lg:p-8 items-start relative z-10 w-full">

        {/* COLUNA ESQUERDA - SIDEBAR (3 cols) */}
        <aside className="lg:col-span-3 flex flex-col gap-6 sticky top-6">
          <CustomerProfileHeader customerId={id} />
        </aside>

        {/* COLUNA DIREITA - CONTEÚDO (9 cols) */}
        <section className="lg:col-span-9 flex flex-col gap-8">

          {/* 1. New KPI Stats Strip */}
          <CustomerStats
            metrics={realMetrics}
            customerStatus={headerCustomer.segment || 'Regular'}
            isLoading={headerLoading}
          />

          {/* 1.2. Main Metrics Cards */}
          <CustomerMainMetrics
            metrics={realMetrics}
            customer={headerCustomer} // Using SSoT customer
            customerStatus={headerCustomer.segment || 'Regular'}
            profileCompleteness='100' // Placeholder/SSoT TODO
            onSendWhatsApp={handleWhatsApp}
            onSendEmail={() => { }} // Placeholder TODO
          />

          {/* 1.5. Advanced Metrics */}
          <CustomerAdvancedMetrics metrics={realMetrics} />

          {/* 2. Tabs Section */}
          <div className="flex flex-col gap-6 w-full">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">

              {/* Tab List: Pills Design */}
              <div className="flex items-center border-b border-white/5 pb-1 mb-6 overflow-x-auto scrollbar-hide w-full">
                <TabsList className="h-auto w-auto bg-transparent p-0 gap-6">
                  <TabsTrigger
                    value="overview"
                    className="bg-transparent border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-white text-zinc-500 hover:text-zinc-300 rounded-none px-4 py-2 font-bold text-sm transition-all shadow-none"
                  >
                    Timeline
                  </TabsTrigger>
                  <TabsTrigger
                    value="purchases"
                    className="bg-transparent border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-white text-zinc-500 hover:text-zinc-300 rounded-none px-4 py-2 font-bold text-sm transition-all shadow-none"
                  >
                    Histórico de Compras
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Tab Content 1: Overview (Timeline) */}
              <TabsContent value="overview" className="mt-0 focus-visible:outline-none w-full">
                <CustomerOverviewTab customerId={id} className="glass-panel w-full" />
              </TabsContent>

              {/* Tab Content 2: Purchases */}
              <TabsContent value="purchases" className="mt-0 focus-visible:outline-none w-full">
                <CustomerPurchaseHistoryTab customerId={id} />
              </TabsContent>

            </Tabs>
          </div>
        </section>

      </main>



      {/* Modais Legados (Mantidos para funcionalidade) */}
      <EditCustomerModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        customer={customer}
      />

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