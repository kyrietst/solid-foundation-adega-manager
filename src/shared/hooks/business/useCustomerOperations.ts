/**
 * useCustomerOperations.ts - Hook de operações centralizadas para clientes
 *
 * @description
 * Centraliza toda a lógica de negócio relacionada a clientes seguindo o padrão
 * do useInventoryCalculations. Elimina duplicação de código entre componentes.
 *
 * @features
 * - Cálculos de segmentação automática
 * - Análise de perfil de cliente (LTV, frequência, etc.)
 * - Validações de dados de cliente
 * - Formatação e normalização de dados
 * - Métricas de performance
 * - Insights de IA calculados
 *
 * @author Adega Manager Team
 * @version 3.0.0 - Business Logic Centralization
 */

import { useMemo } from 'react';

// ============================================================================
// TYPES E INTERFACES
// ============================================================================

export interface CustomerData {
  id?: number;
  cliente: string;
  telefone?: string | null;
  email?: string | null;
  endereco?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  cep?: string | null;
  observacoes?: string | null;
  ativo: boolean;
  created_at?: string;
  updated_at?: string;

  // Campos calculados de CRM
  totalCompras?: number;
  valorTotalCompras?: number;
  ultimaCompra?: string | null;
  frequenciaCompras?: number;
  segmento?: 'High Value' | 'Regular' | 'Occasional' | 'New';
}

export interface CustomerMetrics {
  ltv: number; // Lifetime Value
  averageOrderValue: number;
  purchaseFrequency: number;
  daysSinceLastPurchase: number;
  totalOrders: number;
  segment: 'High Value' | 'Regular' | 'Occasional' | 'New';
  loyaltyScore: number; // 0-100
  riskScore: number; // 0-100 (risk of churn)
}

export interface CustomerInsights {
  hasEmail: boolean;
  hasPhone: boolean;
  hasCompleteAddress: boolean;
  profileCompleteness: number; // 0-100
  marketingReachable: boolean;
  deliveryReady: boolean;
  preferredContactMethod: 'email' | 'phone' | 'none';
  riskFactors: string[];
  opportunities: string[];
}

export interface CustomerValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// ============================================================================
// HOOK PRINCIPAL
// ============================================================================

export const useCustomerOperations = (customerData: Partial<CustomerData> = {}) => {

  // ============================================================================
  // MÉTRICAS CALCULADAS
  // ============================================================================

  const metrics = useMemo((): CustomerMetrics => {
    const {
      totalCompras = 0,
      valorTotalCompras = 0,
      ultimaCompra,
      frequenciaCompras = 0
    } = customerData;

    // Lifetime Value
    const ltv = valorTotalCompras;

    // Average Order Value
    const averageOrderValue = totalCompras > 0 ? valorTotalCompras / totalCompras : 0;

    // Purchase Frequency (compras por mês)
    const purchaseFrequency = frequenciaCompras;

    // Dias desde última compra
    let daysSinceLastPurchase = 0;
    if (ultimaCompra) {
      const lastPurchase = new Date(ultimaCompra);
      const now = new Date();
      daysSinceLastPurchase = Math.floor((now.getTime() - lastPurchase.getTime()) / (1000 * 60 * 60 * 24));
    }

    // Segmentação automática
    let segment: 'High Value' | 'Regular' | 'Occasional' | 'New' = 'New';
    if (totalCompras >= 10 && ltv >= 500) {
      segment = 'High Value';
    } else if (totalCompras >= 5 && ltv >= 200) {
      segment = 'Regular';
    } else if (totalCompras > 0) {
      segment = 'Occasional';
    }

    // Loyalty Score (0-100)
    let loyaltyScore = 0;
    if (totalCompras > 0) {
      loyaltyScore = Math.min(100,
        (totalCompras * 10) + // Quantidade de compras
        (purchaseFrequency * 15) + // Frequência
        Math.max(0, 30 - daysSinceLastPurchase) // Recência
      );
    }

    // Risk Score (0-100) - risco de churn
    let riskScore = 0;
    if (totalCompras > 0) {
      riskScore = Math.min(100,
        daysSinceLastPurchase * 2 + // Muito tempo sem comprar
        (purchaseFrequency < 1 ? 30 : 0) + // Baixa frequência
        (averageOrderValue < 50 ? 20 : 0) // Baixo ticket médio
      );
    }

    return {
      ltv: Math.round(ltv * 100) / 100,
      averageOrderValue: Math.round(averageOrderValue * 100) / 100,
      purchaseFrequency,
      daysSinceLastPurchase,
      totalOrders: totalCompras,
      segment,
      loyaltyScore: Math.round(loyaltyScore),
      riskScore: Math.round(riskScore)
    };
  }, [customerData]);

  // ============================================================================
  // INSIGHTS DE PERFIL
  // ============================================================================

  const insights = useMemo((): CustomerInsights => {
    const {
      email,
      telefone,
      endereco,
      bairro,
      cidade,
      cep
    } = customerData;

    const hasEmail = !!(email && email.trim() && email.includes('@'));
    const hasPhone = !!(telefone && telefone.trim() && telefone.length >= 10);
    const hasCompleteAddress = !!(endereco && bairro && cidade && cep);

    // Profile Completeness (0-100)
    let completeness = 20; // Base por ter nome
    if (hasEmail) completeness += 20;
    if (hasPhone) completeness += 20;
    if (hasCompleteAddress) completeness += 30;
    if (customerData.observacoes?.trim()) completeness += 10;

    const marketingReachable = hasEmail || hasPhone;
    const deliveryReady = hasCompleteAddress;

    const preferredContactMethod: 'email' | 'phone' | 'none' =
      hasEmail ? 'email' : hasPhone ? 'phone' : 'none';

    // Risk Factors
    const riskFactors: string[] = [];
    if (!hasEmail) riskFactors.push('Sem email cadastrado');
    if (!hasPhone) riskFactors.push('Sem telefone cadastrado');
    if (!hasCompleteAddress) riskFactors.push('Endereço incompleto');
    if (metrics.daysSinceLastPurchase > 90) riskFactors.push('Mais de 90 dias sem comprar');
    if (metrics.riskScore > 70) riskFactors.push('Alto risco de churn');

    // Opportunities
    const opportunities: string[] = [];
    if (!hasEmail && hasPhone) opportunities.push('Cadastrar email para marketing');
    if (hasEmail && !hasPhone) opportunities.push('Cadastrar telefone para contato');
    if (!hasCompleteAddress) opportunities.push('Completar endereço para delivery');
    if (metrics.segment === 'Occasional') opportunities.push('Potencial para engajamento');
    if (metrics.loyaltyScore > 60) opportunities.push('Candidato a programa de fidelidade');

    return {
      hasEmail,
      hasPhone,
      hasCompleteAddress,
      profileCompleteness: Math.round(completeness),
      marketingReachable,
      deliveryReady,
      preferredContactMethod,
      riskFactors,
      opportunities
    };
  }, [customerData, metrics]);

  // ============================================================================
  // FUNÇÕES UTILITÁRIAS
  // ============================================================================

  const validateCustomerData = (data: Partial<CustomerData>): CustomerValidation => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validações obrigatórias
    if (!data.cliente?.trim()) {
      errors.push('Nome do cliente é obrigatório');
    } else if (data.cliente.trim().length < 2) {
      errors.push('Nome deve ter pelo menos 2 caracteres');
    }

    // Validações de formato
    if (data.email && data.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email.trim())) {
        errors.push('Email inválido');
      }
    }

    if (data.telefone && data.telefone.trim()) {
      const phoneRegex = /^(\(\d{2}\)\s\d{5}-\d{4}|\(\d{2}\)\s\d{4}-\d{4})$/;
      if (!phoneRegex.test(data.telefone.trim())) {
        errors.push('Formato de telefone inválido. Use (11) 99999-9999');
      }
    }

    if (data.cep && data.cep.trim()) {
      const cepRegex = /^\d{5}-\d{3}$/;
      if (!cepRegex.test(data.cep.trim())) {
        errors.push('CEP deve estar no formato 12345-678');
      }
    }

    // Warnings
    if (!data.email?.trim()) {
      warnings.push('Email não informado - limitará comunicação');
    }
    if (!data.telefone?.trim()) {
      warnings.push('Telefone não informado - limitará contato');
    }
    if (!data.endereco?.trim()) {
      warnings.push('Endereço não informado - impossibilitará delivery');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  };

  const formatCustomerData = (data: Partial<CustomerData>): Partial<CustomerData> => {
    return {
      ...data,
      cliente: data.cliente?.trim() || '',
      email: data.email?.trim()?.toLowerCase() || null,
      telefone: data.telefone?.trim() || null,
      endereco: data.endereco?.trim() || null,
      bairro: data.bairro?.trim() || null,
      cidade: data.cidade?.trim() || null,
      cep: data.cep?.replace(/\D/g, '').replace(/(\d{5})(\d{3})/, '$1-$2') || null,
      observacoes: data.observacoes?.trim() || null,
      ativo: data.ativo !== false // Default true
    };
  };

  const getSegmentColor = (segment: string): string => {
    switch (segment) {
      case 'High Value': return 'text-accent-gold bg-accent-gold-100/20';
      case 'Regular': return 'text-green-400 bg-green-400/20';
      case 'Occasional': return 'text-blue-400 bg-blue-400/20';
      case 'New': return 'text-gray-400 bg-gray-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getSegmentLabel = (segment: string): string => {
    switch (segment) {
      case 'High Value': return 'Alto Valor';
      case 'Regular': return 'Regular';
      case 'Occasional': return 'Ocasional';
      case 'New': return 'Novo';
      default: return 'Indefinido';
    }
  };

  const calculateNextBestAction = (): { action: string; priority: 'high' | 'medium' | 'low'; description: string } => {
    if (metrics.riskScore > 70) {
      return {
        action: 'reactivate',
        priority: 'high',
        description: 'Cliente em risco de churn - iniciar campanha de reativação'
      };
    }

    if (!insights.hasEmail && insights.hasPhone) {
      return {
        action: 'capture_email',
        priority: 'medium',
        description: 'Capturar email para melhorar comunicação'
      };
    }

    if (metrics.segment === 'High Value' && insights.profileCompleteness < 80) {
      return {
        action: 'complete_profile',
        priority: 'medium',
        description: 'Cliente VIP com perfil incompleto - priorizar atualização'
      };
    }

    return {
      action: 'maintain',
      priority: 'low',
      description: 'Cliente estável - manter relacionamento atual'
    };
  };

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    // Dados calculados
    metrics,
    insights,

    // Funções utilitárias
    validateCustomerData,
    formatCustomerData,
    getSegmentColor,
    getSegmentLabel,
    calculateNextBestAction,

    // Estado derivado
    isHighValue: metrics.segment === 'High Value',
    isAtRisk: metrics.riskScore > 60,
    needsProfileUpdate: insights.profileCompleteness < 60,
    isMarketingReady: insights.marketingReachable,
    isDeliveryReady: insights.deliveryReady
  };
};

export default useCustomerOperations;