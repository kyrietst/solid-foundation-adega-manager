/* eslint-disable react-refresh/only-export-components */
/**
 * CustomerProfileContext.tsx - Context para gerenciamento de estado do CustomerProfile
 * Context7 Pattern: Lifting State Up aplicado
 * Elimina prop drilling identificado na análise (4 estados locais + callbacks)
 *
 * REFATORAÇÃO APLICADA:
 * - Estado centralizado em Context
 * - Eliminação de prop drilling
 * - Actions consolidadas
 * - Performance otimizada com useMemo
 * - Custom hook para consumo
 *
 * @version 2.0.0 - Refatorado com Context7
 */

import React, { createContext, useContext, useState, useMemo, useCallback, ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import { useCustomer, useCustomerPurchases } from '@/features/customers/hooks/use-crm';
import { useCustomerRealMetrics } from '@/features/customers/hooks/useCustomerRealMetrics';

// Types para o contexto
interface CustomerProfileState {
  // Tab management
  activeTab: string;
  setActiveTab: (tab: string) => void;

  // Filters
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  periodFilter: string;
  setPeriodFilter: (period: string) => void;

  // Modal states
  isEditModalOpen: boolean;
  setIsEditModalOpen: (open: boolean) => void;

  // Data
  customer: any;
  purchases: any[];
  realMetrics: any;

  // Loading states
  isLoading: boolean;
  isLoadingMetrics: boolean;
  isLoadingPurchases: boolean;

  // Errors
  error: any;
  metricsError: any;
  purchasesError: any;

  // Computed data
  filteredPurchases: any[];
  salesChartData: any[];
  productsChartData: any[];
  frequencyChartData: any[];
  missingReportFields: any[];
  criticalMissingFields: any[];
  importantMissingFields: any[];

  // Actions
  handleWhatsApp: () => void;
  handleEmail: () => void;
  handleNewSale: () => void;
}

const CustomerProfileContext = createContext<CustomerProfileState | undefined>(undefined);

interface CustomerProfileProviderProps {
  children: ReactNode;
}

export const CustomerProfileProvider: React.FC<CustomerProfileProviderProps> = ({ children }) => {
  const { id } = useParams<{ id: string }>();

  // Estados locais consolidados
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [periodFilter, setPeriodFilter] = useState('all');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Hooks de dados
  const {
    data: customer,
    isLoading,
    error
  } = useCustomer(id || '');

  const {
    data: realMetrics,
    isLoading: isLoadingMetrics,
    error: metricsError
  } = useCustomerRealMetrics(id || '');

  const {
    data: purchases = [],
    isLoading: isLoadingPurchases,
    error: purchasesError
  } = useCustomerPurchases(id || '');

  // Função para verificar campos em falta que impactam relatórios
  const checkMissingReportFields = useCallback((customer: Record<string, any>) => {
    const reportFields = [
      { key: 'email', label: 'Email', value: customer?.email, required: true, icon: 'Mail', impact: 'Necessário para campanhas de email marketing e relatórios de comunicação.' },
      { key: 'phone', label: 'Telefone', value: customer?.phone, required: true, icon: 'Phone', impact: 'Essencial para relatórios de WhatsApp e análises de contato.' },
      { key: 'address', label: 'Endereço', value: customer?.address, required: false, icon: 'MapPin', impact: 'Importante para análises geográficas e relatórios de entrega.' },
      { key: 'favorite_category', label: 'Categoria Favorita', value: customer?.favorite_category, required: false, icon: 'TrendingUp', impact: 'Fundamental para relatórios de preferências e recomendações.' },
      { key: 'birthday', label: 'Aniversário', value: customer?.birthday, required: false, icon: 'Calendar', impact: 'Usado em campanhas sazonais e análises demográficas.' }
    ];

    return reportFields.filter(field => !field.value || field.value === 'N/A' || field.value === 'Não definida');
  }, []);

  // Computed values with memoization
  const missingReportFields = useMemo(() =>
    customer ? checkMissingReportFields(customer) : []
  , [customer, checkMissingReportFields]);

  const criticalMissingFields = useMemo(() =>
    missingReportFields.filter(field => field.required)
  , [missingReportFields]);

  const importantMissingFields = useMemo(() =>
    missingReportFields.filter(field => !field.required)
  , [missingReportFields]);

  // Filtrar compras baseado nos filtros aplicados
  const filteredPurchases = useMemo(() => {
    if (!purchases) return [];

    let filtered = purchases;

    // Filtro por período
    if (periodFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();

      switch (periodFilter) {
        case '30':
          filterDate.setDate(now.getDate() - 30);
          break;
        case '90':
          filterDate.setDate(now.getDate() - 90);
          break;
        case '180':
          filterDate.setDate(now.getDate() - 180);
          break;
        case '365':
          filterDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      filtered = filtered.filter(purchase =>
        new Date(purchase.date) >= filterDate
      );
    }

    // Filtro por termo de busca (produtos)
    if (searchTerm) {
      filtered = filtered.filter(purchase =>
        purchase.items.some(item =>
          item.product_name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    return filtered;
  }, [purchases, periodFilter, searchTerm]);

  // Dados para gráfico de vendas por mês
  const salesChartData = useMemo(() => {
    if (!purchases || purchases.length === 0) return [];

    const monthlyData = purchases.reduce((acc, purchase) => {
      const date = new Date(purchase.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = date.toLocaleDateString('pt-BR', { year: 'numeric', month: 'short' });

      if (!acc[monthKey]) {
        acc[monthKey] = { month: monthLabel, total: 0, count: 0 };
      }

      acc[monthKey].total += purchase.total;
      acc[monthKey].count += 1;

      return acc;
    }, {} as Record<string, { month: string; total: number; count: number }>);

    return Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));
  }, [purchases]);

  // Dados para gráfico de produtos mais comprados
  const productsChartData = useMemo(() => {
    if (!purchases || purchases.length === 0) return [];

    const productCount = purchases.reduce((acc, purchase) => {
      purchase.items.forEach(item => {
        if (!acc[item.product_name]) {
          acc[item.product_name] = 0;
        }
        acc[item.product_name] += item.quantity;
      });
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(productCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 produtos
  }, [purchases]);

  // Dados para gráfico de frequência de compras
  const frequencyChartData = useMemo(() => {
    if (!purchases || purchases.length === 0) return [];

    const intervals = purchases.slice(1).map((purchase, index) => {
      const currentDate = new Date(purchase.date);
      const previousDate = new Date(purchases[index].date);
      const diffTime = Math.abs(currentDate.getTime() - previousDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return {
        purchase: `Compra ${index + 2}`,
        days: diffDays,
        date: currentDate.toLocaleDateString('pt-BR')
      };
    });

    return intervals;
  }, [purchases]);

  // Actions consolidadas
  const handleWhatsApp = useCallback(() => {
    if (!customer?.phone) {
      alert('Cliente não possui telefone cadastrado');
      return;
    }
    const phone = customer.phone.replace(/\D/g, '');
    const message = `Olá ${customer.name}, tudo bem? Aqui é da Adega! 🍷`;
    const url = `https://wa.me/55${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  }, [customer]);

  const handleEmail = useCallback(() => {
    if (!customer?.email) {
      alert('Cliente não possui email cadastrado');
      return;
    }
    const subject = `Contato - Adega Wine Store`;
    const body = `Prezado(a) ${customer.name},\n\nEsperamos que esteja bem!\n\nAtenciosamente,\nEquipe Adega`;
    const url = `mailto:${customer.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(url, '_blank');
  }, [customer]);

  const handleNewSale = useCallback(() => {
    const salesUrl = `/sales?customer_id=${id}&customer_name=${encodeURIComponent(customer?.name || '')}`;
    window.open(salesUrl, '_blank');
  }, [id, customer]);

  // Context value com memoização para performance
  const contextValue = useMemo(() => ({
    // State
    activeTab,
    setActiveTab,
    searchTerm,
    setSearchTerm,
    periodFilter,
    setPeriodFilter,
    isEditModalOpen,
    setIsEditModalOpen,

    // Data
    customer,
    purchases,
    realMetrics,

    // Loading states
    isLoading,
    isLoadingMetrics,
    isLoadingPurchases,

    // Errors
    error,
    metricsError,
    purchasesError,

    // Computed data
    filteredPurchases,
    salesChartData,
    productsChartData,
    frequencyChartData,
    missingReportFields,
    criticalMissingFields,
    importantMissingFields,

    // Actions
    handleWhatsApp,
    handleEmail,
    handleNewSale,
  }), [
    activeTab,
    searchTerm,
    periodFilter,
    isEditModalOpen,
    customer,
    purchases,
    realMetrics,
    isLoading,
    isLoadingMetrics,
    isLoadingPurchases,
    error,
    metricsError,
    purchasesError,
    filteredPurchases,
    salesChartData,
    productsChartData,
    frequencyChartData,
    missingReportFields,
    criticalMissingFields,
    importantMissingFields,
    handleWhatsApp,
    handleEmail,
    handleNewSale,
  ]);

  return (
    <CustomerProfileContext.Provider value={contextValue}>
      {children}
    </CustomerProfileContext.Provider>
  );
};

// Custom hook para usar o contexto
export const useCustomerProfile = (): CustomerProfileState => {
  const context = useContext(CustomerProfileContext);
  if (context === undefined) {
    throw new Error('useCustomerProfile must be used within a CustomerProfileProvider');
  }
  return context;
};

export default CustomerProfileContext;