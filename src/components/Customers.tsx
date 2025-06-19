import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CustomerStats } from '@/components/ui/customer-stats';
import { CustomerList } from '@/components/ui/customer-list';
import { CustomerDetail } from '@/components/ui/customer-detail';
import { CustomerSegments } from '@/components/ui/customer-segments';
import { CustomerActivity } from '@/components/ui/customer-activity';
import { CustomerTrends } from '@/components/ui/customer-trends';
import { CustomerOpportunities } from '@/components/ui/customer-opportunities';
import { 
  useCustomers, 
  useCustomerInsights, 
  useCustomerInteractions, 
  useCustomerPurchases,
  useSalesData,
  useAllCustomerInsights,
  CustomerProfile 
} from '@/hooks/use-crm';
import { useAuth } from '@/contexts/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Criar um cliente de consulta para o React Query
const queryClient = new QueryClient();

export const Customers = () => {
  const { userRole } = useAuth();
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'list' | 'detail' | 'analytics'>('list');

  // Wrapper para o conteúdo principal do CRM
  const CustomersContent = () => {
    const { data: customers, isLoading: isLoadingCustomers } = useCustomers();
    const { data: insights, isLoading: isLoadingInsights } = useCustomerInsights(selectedCustomer?.id || '');
    const { data: interactions, isLoading: isLoadingInteractions } = useCustomerInteractions(selectedCustomer?.id || '');
    const { data: purchases, isLoading: isLoadingPurchases } = useCustomerPurchases(selectedCustomer?.id || '');
    
    // Obter todas as interações para exibir no painel de análise
    const { data: allInteractions, isLoading: isLoadingAllInteractions } = useCustomerInteractions('');
    
    // Obter dados de vendas para análise de tendências
    const { data: salesData, isLoading: isLoadingSalesData } = useSalesData();
    
    // Obter todos os insights para oportunidades
    const { data: allInsights, isLoading: isLoadingAllInsights } = useAllCustomerInsights();

    const handleSelectCustomer = (customer: CustomerProfile) => {
      setSelectedCustomer(customer);
      setActiveTab('detail');
    };

    const handleBackToList = () => {
      setActiveTab('list');
    };

    return (
      <div className="space-y-6">
        <CustomerStats />

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="list">Lista de Clientes</TabsTrigger>
            {selectedCustomer && (
              <TabsTrigger value="detail">Detalhes do Cliente</TabsTrigger>
            )}
            <TabsTrigger value="analytics">Análise de Clientes</TabsTrigger>
          </TabsList>
          
          <TabsContent value="list" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Clientes Cadastrados</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingCustomers ? (
                  <div className="py-8 text-center">Carregando clientes...</div>
                ) : (
                  <CustomerList 
                    customers={customers || []} 
                    onSelectCustomer={handleSelectCustomer} 
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="detail" className="mt-6">
            {selectedCustomer && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Detalhes do Cliente</CardTitle>
                  <button
                    onClick={handleBackToList}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    ← Voltar para lista
                  </button>
                </CardHeader>
                <CardContent>
                  <CustomerDetail
                    customer={selectedCustomer}
                    insights={insights || []}
                    interactions={interactions || []}
                    purchases={purchases || []}
                  />
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="analytics" className="mt-6">
            <div className="space-y-6">
              {/* Segmentação de Clientes e Atividades Recentes */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {!isLoadingCustomers && customers && (
                  <CustomerSegments customers={customers} />
                )}
                
                {!isLoadingCustomers && !isLoadingAllInteractions && customers && allInteractions && (
                  <CustomerActivity 
                    interactions={allInteractions} 
                    customers={customers}
                    limit={4}
                  />
                )}
              </div>
              
              {/* Oportunidades de Negócio */}
              {!isLoadingCustomers && !isLoadingAllInsights && customers && allInsights && (
                <CustomerOpportunities 
                  insights={allInsights} 
                  customers={customers} 
                  limit={5}
                />
              )}
              
              {/* Tendências de Vendas */}
              {!isLoadingCustomers && !isLoadingSalesData && customers && salesData && (
                <CustomerTrends 
                  salesData={salesData} 
                  customers={customers} 
                />
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  };

  return (
    <QueryClientProvider client={queryClient}>
      <CustomersContent />
    </QueryClientProvider>
  );
};
