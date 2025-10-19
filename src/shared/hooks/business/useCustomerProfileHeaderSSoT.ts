/**
 * useCustomerProfileHeaderSSoT.ts - Hook SSoT v3.1.0 Server-Side
 *
 * @description
 * Hook SSoT completo que consolida TODOS os dados para o header do perfil do cliente.
 * Elimina dependência de props e implementa performance otimizada com handlers centralizados.
 *
 * @features
 * - Busca consolidada de customer data + real metrics do banco
 * - Handlers centralizados para edit, newSale, whatsApp, email
 * - Cálculos real-time de status, completude e badges
 * - Cache inteligente com invalidação coordenada
 * - Performance otimizada para escalabilidade
 * - Elimina múltiplas dependencies e props externas
 *
 * @author Adega Manager Team
 * @version 3.1.0 - SSoT Server-Side Implementation
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';
import { useMemo, useCallback } from 'react';
import { useCustomerMetrics } from './useCustomerMetrics';

// ============================================================================
// TYPES E INTERFACES
// ============================================================================

export interface CustomerProfileHeaderData {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  segment?: string;
  contact_preference?: string;
  contact_permission?: boolean;
  tags?: string[];
  birthday?: string;
}

export interface CustomerRealMetrics {
  total_purchases: number;
  total_spent: number;
  lifetime_value_calculated: number;
  avg_purchase_value: number;
  avg_items_per_purchase: number;
  total_products_bought: number;
  last_purchase_real?: string;
  days_since_last_purchase?: number;
  purchase_frequency: number;
  loyalty_score: number;
  data_sync_status: {
    ltv_synced: boolean;
    dates_synced: boolean;
    preferences_synced: boolean;
  };
}

export interface ProfileCompletenessData {
  score: number;
  missingFields: string[];
  recommendations: string[];
  isComplete: boolean;
}

export interface CustomerProfileHeaderOperations {
  // Dados do servidor
  customer: CustomerProfileHeaderData | null;
  realMetrics: CustomerRealMetrics | null;
  profileCompleteness: ProfileCompletenessData;

  // Estados de carregamento
  isLoading: boolean;
  error: Error | null;

  // Handlers centralizados
  handleEdit: () => void;
  handleDelete: () => void;
  handleNewSale: () => void;
  handleWhatsApp: () => void;
  handleEmail: () => void;
  handleBack: () => void;

  // Utilitários
  formatCurrency: (value: number) => string;
  formatDate: (date: string) => string;
  getSegmentColor: (segment?: string) => string;
  getSegmentLabel: (segment?: string) => string;

  // Estados derivados
  hasContactInfo: boolean;
  hasPhoneNumber: boolean;
  hasEmailAddress: boolean;
  isHighValue: boolean;
  isAtRisk: boolean;
  lastPurchaseDays: number;
  customerSince: string;

  // Refresh manual
  refetch: () => void;

  // Estado de disponibilidade
  hasData: boolean;
  isEmpty: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const SEGMENT_COLORS = {
  'high_value': 'bg-gradient-to-r from-yellow-400 to-orange-500',
  'regular': 'bg-gradient-to-r from-blue-400 to-blue-600',
  'occasional': 'bg-gradient-to-r from-green-400 to-green-600',
  'new': 'bg-gradient-to-r from-purple-400 to-purple-600',
  'at_risk': 'bg-gradient-to-r from-red-400 to-red-600',
  'inactive': 'bg-gradient-to-r from-gray-400 to-gray-600'
};

const SEGMENT_LABELS = {
  'high_value': 'Alto Valor',
  'regular': 'Regular',
  'occasional': 'Ocasional',
  'new': 'Novo',
  'at_risk': 'Em Risco',
  'inactive': 'Inativo'
};

// ============================================================================
// HOOK PRINCIPAL SSoT v3.1.0
// ============================================================================

export const useCustomerProfileHeaderSSoT = (
  customerId: string
): CustomerProfileHeaderOperations => {

  const queryClient = useQueryClient();

  // ============================================================================
  // SERVER-SIDE DATA FETCHING - CUSTOMER DATA
  // ============================================================================

  const {
    data: customer = null,
    isLoading: isLoadingCustomer,
    error: customerError,
    refetch: refetchCustomer
  } = useQuery({
    queryKey: ['customer-profile-header-data', customerId],
    queryFn: async (): Promise<CustomerProfileHeaderData | null> => {
      if (!customerId) return null;

      try {
        const { data, error } = await supabase
          .from('customers')
          .select(`
            id,
            name,
            email,
            phone,
            address,
            notes,
            created_at,
            updated_at,
            segment,
            contact_preference,
            contact_permission,
            tags,
            birthday
          `)
          .eq('id', customerId)
          .single();

        if (error) {
          console.error('❌ Erro ao buscar dados do cliente para header:', error);
          throw error;
        }

        return data;
      } catch (error) {
        console.error('❌ Erro crítico ao buscar cliente para header:', error);
        throw error;
      }
    },
    enabled: !!customerId,
    staleTime: 5 * 60 * 1000, // 5 min cache para dados básicos do cliente
    refetchInterval: false, // Dados básicos não precisam de auto-refresh
    refetchOnWindowFocus: false,
  });

  // ============================================================================
  // SERVER-SIDE DATA FETCHING - REAL METRICS (SSoT Centralizado)
  // ============================================================================

  // ✅ USO DO HOOK CENTRALIZADO - SINGLE SOURCE OF TRUTH
  const {
    data: rawRealMetrics = null,
    isLoading: isLoadingMetrics,
    error: metricsError,
    refetch: refetchMetrics
  } = useCustomerMetrics(customerId);

  // ============================================================================
  // PROFILE COMPLETENESS CALCULATION
  // ============================================================================

  const profileCompleteness = useMemo((): ProfileCompletenessData => {
    if (!customer) {
      return {
        score: 0,
        missingFields: [],
        recommendations: [],
        isComplete: false
      };
    }

    const requiredFields = [
      { field: 'name', label: 'Nome', weight: 20 },
      { field: 'email', label: 'Email', weight: 15 },
      { field: 'phone', label: 'Telefone', weight: 15 },
      { field: 'address', label: 'Endereço', weight: 15 },
      { field: 'birthday', label: 'Aniversário', weight: 10 },
      { field: 'contact_preference', label: 'Preferência de Contato', weight: 10 },
      { field: 'segment', label: 'Segmento', weight: 10 },
      { field: 'notes', label: 'Observações', weight: 5 }
    ];

    let score = 0;
    const missingFields: string[] = [];
    const recommendations: string[] = [];

    requiredFields.forEach(({ field, label, weight }) => {
      const value = customer[field as keyof CustomerProfileHeaderData];
      if (value && value !== '' && value !== null) {
        score += weight;
      } else {
        missingFields.push(label);
        if (weight >= 15) {
          recommendations.push(`Adicionar ${label} para melhorar comunicação`);
        }
      }
    });

    return {
      score,
      missingFields,
      recommendations,
      isComplete: score >= 80
    };
  }, [customer]);

  // ============================================================================
  // HANDLERS CENTRALIZADOS
  // ============================================================================

  const handleEdit = useCallback(() => {
    // Dispatch evento personalizado para abrir modal de edição
    window.dispatchEvent(new CustomEvent('openCustomerEditModal', {
      detail: { customerId }
    }));
  }, [customerId]);

  const handleDelete = useCallback(() => {
    // Dispatch evento personalizado para abrir modal de exclusão
    window.dispatchEvent(new CustomEvent('openCustomerDeleteModal', {
      detail: { customerId }
    }));
  }, [customerId]);

  const handleNewSale = useCallback(() => {
    if (!customer) {
      alert('Cliente não encontrado');
      return;
    }
    const salesUrl = `/sales?customer_id=${customerId}&customer_name=${encodeURIComponent(customer.name)}`;
    window.open(salesUrl, '_blank');
  }, [customerId, customer]);

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

  const handleBack = useCallback(() => {
    window.history.back();
  }, []);

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const formatCurrency = useCallback((value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  }, []);

  const formatDate = useCallback((date: string): string => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(new Date(date));
  }, []);

  const getSegmentColor = useCallback((segment?: string): string => {
    return SEGMENT_COLORS[segment as keyof typeof SEGMENT_COLORS] || SEGMENT_COLORS.new;
  }, []);

  const getSegmentLabel = useCallback((segment?: string): string => {
    return SEGMENT_LABELS[segment as keyof typeof SEGMENT_LABELS] || 'Novo';
  }, []);

  // ============================================================================
  // ESTADO DERIVADO
  // ============================================================================

  const isLoading = isLoadingCustomer || isLoadingMetrics;
  const error = customerError || metricsError;

  const hasPhoneNumber = !!(customer?.phone && customer.phone.trim() !== '');
  const hasEmailAddress = !!(customer?.email && customer.email.trim() !== '');
  const hasContactInfo = hasPhoneNumber || hasEmailAddress;

  const isHighValue = useMemo(() => {
    return customer?.segment === 'high_value' || (rawRealMetrics?.lifetime_value_calculated || 0) > 2000;
  }, [customer?.segment, rawRealMetrics?.lifetime_value_calculated]);

  const isAtRisk = useMemo(() => {
    return customer?.segment === 'at_risk' || (rawRealMetrics?.days_since_last_purchase || 0) > 90;
  }, [customer?.segment, rawRealMetrics?.days_since_last_purchase]);

  const lastPurchaseDays = rawRealMetrics?.days_since_last_purchase || 0;

  const customerSince = useMemo(() => {
    if (!customer?.created_at) return '';
    return formatDate(customer.created_at);
  }, [customer?.created_at, formatDate]);

  const hasData = !!customer;
  const isEmpty = !hasData;

  const refetch = useCallback(() => {
    refetchCustomer();
    refetchMetrics();
  }, [refetchCustomer, refetchMetrics]);

  // ============================================================================
  // RETURN SSoT v3.1.0
  // ============================================================================

  return {
    // Dados do servidor
    customer,
    realMetrics: rawRealMetrics,
    profileCompleteness,

    // Estados de carregamento
    isLoading,
    error: error as Error | null,

    // Handlers centralizados
    handleEdit,
    handleDelete,
    handleNewSale,
    handleWhatsApp,
    handleEmail,
    handleBack,

    // Utilitários
    formatCurrency,
    formatDate,
    getSegmentColor,
    getSegmentLabel,

    // Estados derivados
    hasContactInfo,
    hasPhoneNumber,
    hasEmailAddress,
    isHighValue,
    isAtRisk,
    lastPurchaseDays,
    customerSince,

    // Refresh manual
    refetch,

    // Estado de disponibilidade
    hasData,
    isEmpty
  };
};

export default useCustomerProfileHeaderSSoT;