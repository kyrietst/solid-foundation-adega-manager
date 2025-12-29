
/**
 * Modal de detalhes completos do cliente
 * Refatorado para usar Sub-componentes (SRP)
 */

import React, { useState, useMemo } from 'react';
import { BaseModal } from '@/shared/ui/composite/BaseModal';
import { Button } from '@/shared/ui/primitives/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/primitives/tabs';
import { cn } from '@/core/config/utils';
import { getGlassCardClasses } from '@/core/config/theme-utils';
import { User, Edit } from 'lucide-react';
import { CustomerDetailModalProps } from './types';

// Hooks
import {
  useCustomerInteractions,
  useCustomerPurchases,
  CustomerPurchase,
  CustomerInteraction
} from '@/features/customers/hooks/use-crm';

// Sub-components
import { CustomerOverviewContent } from './tabs/CustomerOverviewContent';
import { CustomerAnalyticsTab } from './tabs/CustomerAnalyticsTab';
import { CustomerPurchasesTab } from './tabs/CustomerPurchasesTab';
import { CustomerAITab } from './tabs/CustomerAITab';

export const CustomerDetailModal: React.FC<CustomerDetailModalProps> = ({
  isOpen, onClose, customer, onEdit, canEdit = false,
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [purchaseFilter, setPurchaseFilter] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('all');

  // const { data: insights = [], isLoading: isLoadingInsights } = useCustomerInsights(customer?.id || '');
  const { data: interactions = [], isLoading: isLoadingInteractions } = useCustomerInteractions(customer?.id || '');
  const { data: purchases = [], isLoading: isLoadingPurchases } = useCustomerPurchases(customer?.id || '');

  // LTV Chart Data
  const ltvChartData = useMemo(() => {
    if (!purchases.length) return [];
    let runningTotal = 0;
    return purchases
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((purchase, index) => {
        runningTotal += purchase.total || 0;
        return {
          month: new Date(purchase.date).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
          ltv: runningTotal,
          purchases: index + 1
        };
      });
  }, [purchases]);

  // Filtered Purchases
  const filteredPurchases = useMemo(() => {
    let filtered = purchases;
    if (purchaseFilter) {
      const search = purchaseFilter.toLowerCase();
      filtered = filtered.filter(purchase => {
        const matchesId = purchase.id.toLowerCase().includes(search);
        const matchesDate = new Date(purchase.date).toLocaleDateString().includes(search);
        return matchesId || matchesDate;
      });
    }
    if (selectedPeriod !== 'all') {
      const days = selectedPeriod === '30' ? 30 : selectedPeriod === '90' ? 90 : 365;
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      filtered = filtered.filter(purchase => new Date(purchase.date) >= cutoffDate);
    }
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [purchases, purchaseFilter, selectedPeriod]);

  if (!customer) return null;

  // Helpers
  const formatDate = (dateString: string | null) => dateString ? new Date(dateString).toLocaleDateString('pt-BR') : 'N/A';
  const formatContactPreference = (preference: string | null) => {
    const preferences: any = { whatsapp: 'WhatsApp', sms: 'SMS', email: 'E-mail', call: 'Telefone' };
    return preference ? preferences[preference] || preference : 'Não definido';
  };
  const formatPurchaseFrequency = (frequency: string | null) => {
    const frequencies: any = { weekly: 'Semanal', biweekly: 'Quinzenal', monthly: 'Mensal', occasional: 'Ocasional' };
    return frequency ? frequencies[frequency] || frequency : 'Não definido';
  };

  const glassClasses = getGlassCardClasses('premium');

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={customer.name}
      description="Detalhes completos, histórico e análises"
      size="6xl"
      className={cn("w-[95vw] max-w-6xl backdrop-blur-xl shadow-2xl", glassClasses, "bg-gray-900/90 border border-primary-yellow/30", "max-h-[90vh] overflow-y-auto")}
    >
      <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
        <div></div>
        {canEdit && onEdit && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(customer)}
            className="border-primary-yellow/30 text-primary-yellow hover:bg-primary-yellow/20 hover:border-primary-yellow/50 transition-all duration-200"
          >
            <Edit className="h-4 w-4 mr-2" /> Editar
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
        <TabsList className="grid w-full grid-cols-4 bg-gray-800/50 border border-gray-700/40">
          <TabsTrigger value="overview" className="data-[state=active]:bg-primary-yellow data-[state=active]:text-gray-900">Visão Geral</TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-primary-yellow data-[state=active]:text-gray-900">Analytics</TabsTrigger>
          <TabsTrigger value="purchases" className="data-[state=active]:bg-primary-yellow data-[state=active]:text-gray-900">Compras</TabsTrigger>
          <TabsTrigger value="ai" className="data-[state=active]:bg-primary-yellow data-[state=active]:text-gray-900">IA & Mapas</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <CustomerOverviewContent
            customer={customer}
            interactions={interactions}
            isLoadingInteractions={isLoadingInteractions}
            formatDate={formatDate}
            formatContactPreference={formatContactPreference}
            formatPurchaseFrequency={formatPurchaseFrequency}
          />
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <CustomerAnalyticsTab
            ltvChartData={ltvChartData}
            customer={customer}
            purchases={purchases}
          />
        </TabsContent>

        <TabsContent value="purchases" className="mt-6">
          <CustomerPurchasesTab
            filteredPurchases={filteredPurchases}
            isLoadingPurchases={isLoadingPurchases}
            purchaseFilter={purchaseFilter}
            onFilterChange={setPurchaseFilter}
            selectedPeriod={selectedPeriod}
            onPeriodChange={setSelectedPeriod}
            formatDate={formatDate}
          />
        </TabsContent>

        <TabsContent value="ai" className="mt-6">
          {/* Column 3: Customer Insights (Placeholder or Removed) */}
          <div>
            {/* Insights removed as per hook update */}
            <div className="p-4 bg-gray-800/30 rounded-lg">
              <p className="text-gray-400">Insights não disponíveis no momento.</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {customer.notes && (
        <Card className="bg-adega-charcoal/20 border-white/10 mt-6">
          <CardHeader><CardTitle className="text-sm text-adega-platinum">Observações</CardTitle></CardHeader>
          <CardContent><p className="text-sm text-adega-platinum/80">{customer.notes}</p></CardContent>
        </Card>
      )}
    </BaseModal>
  );
};

export default CustomerDetailModal;