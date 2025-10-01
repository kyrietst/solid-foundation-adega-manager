/**
 * useCustomerActionsSSoT.ts - Hook SSoT v3.1.0 Revenue Intelligence
 *
 * @description
 * Hook SSoT completo que busca dados diretamente do banco para ações comerciais.
 * Centro de inteligência que transforma dados em receita através de ações personalizadas.
 *
 * @features
 * - Busca direta do Supabase (sem props)
 * - Análise de risco de churn em tempo real
 * - Recomendações inteligentes baseadas em dados
 * - Executores de ações automatizadas
 * - Métricas de conversão e ROI
 * - Sistema de comunicação centralizado
 * - Cache inteligente com invalidação
 * - Performance otimizada para escalabilidade
 *
 * @author Adega Manager Team
 * @version 3.1.0 - SSoT Revenue Intelligence Implementation
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';
import { useMemo, useCallback } from 'react';

// ============================================================================
// TYPES E INTERFACES
// ============================================================================

export interface CustomerActionsData {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  contact_preference?: string;
  contact_permission?: boolean;
  created_at: string;
}

export interface CustomerRealMetrics {
  total_purchases: number;
  lifetime_value_calculated: number;
  avg_purchase_value: number;
  days_since_last_purchase?: number;
  last_purchase_real?: string;
  calculated_favorite_category?: string;
  calculated_favorite_product?: string;
  insights_count: number;
  insights_confidence: number;
  data_sync_status: {
    ltv_synced: boolean;
    dates_synced: boolean;
    preferences_synced: boolean;
  };
}

export interface IntelligentAction {
  id: string;
  type: 'cross_sell' | 'upsell' | 'reactivation' | 'retention' | 'acquisition' | 'birthday' | 'milestone';
  title: string;
  description: string;
  expectedRevenue: number;
  confidence: number; // 0-100
  urgency: 'low' | 'medium' | 'high' | 'critical';
  products?: string[];
  discount?: number;
  expiresAt?: string;
  reasoning: string;
  channelRecommendation: 'whatsapp' | 'email' | 'both';
}

export interface ChurnRiskAnalysis {
  riskScore: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskFactors: string[];
  preventionActions: string[];
  timeToChurn: number; // dias estimados
}

export interface RevenueOpportunity {
  category: 'immediate' | 'short_term' | 'long_term';
  potential: number; // Valor em R$
  probability: number; // 0-100
  action: string;
  timeframe: string;
  products?: string[];
}

export interface ConversionMetrics {
  actionsTaken: number;
  successRate: number;
  avgRevenuePerAction: number;
  totalRevenueBoosted: number;
  bestPerformingAction: string;
  lastActionDate?: string;
}

export interface CustomerActionsOperations {
  // Dados do servidor
  customer: CustomerActionsData | null;
  realMetrics: CustomerRealMetrics | null;

  // Inteligência artificial
  recommendedActions: IntelligentAction[];
  riskAnalysis: ChurnRiskAnalysis;
  revenueOpportunities: RevenueOpportunity[];

  // Estados de carregamento
  isLoading: boolean;
  error: Error | null;

  // Ações executáveis
  executeAction: (actionId: string, params?: any) => Promise<void>;
  sendTargetedPromo: (promoType: string, customMessage?: string) => Promise<void>;
  sendWhatsApp: (customMessage?: string) => Promise<void>;
  sendEmail: (customSubject?: string, customBody?: string) => Promise<void>;
  scheduleFollowUp: (days: number, message: string) => Promise<void>;

  // Métricas de performance
  conversionMetrics: ConversionMetrics;
  roiCalculator: (actionType: string) => number;

  // Estados derivados
  hasIntelligentSuggestions: boolean;
  hasContactInfo: boolean;
  hasPhoneNumber: boolean;
  hasEmailAddress: boolean;
  preferredChannel: 'phone' | 'email' | 'none';
  isHighValue: boolean;
  isAtRisk: boolean;
  needsAttention: boolean;

  // Refresh manual
  refetch: () => void;

  // Estado geral
  hasData: boolean;
  isEmpty: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_WHATSAPP_MESSAGE = 'Olá {name}! 🍷 Temos uma oferta especial para você na Adega! Confira nossas novidades exclusivas.';
const DEFAULT_EMAIL_SUBJECT = '🍷 Oferta Exclusiva - Adega Wine Store';
const DEFAULT_EMAIL_BODY = 'Prezado(a) {name},\n\nTemos uma seleção especial de vinhos selecionados especialmente para você!\n\nConfira nossas ofertas exclusivas e descubra novos sabores.\n\nAtenciosamente,\nEquipe Adega Wine Store';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const calculateChurnRisk = (
  customer: CustomerActionsData | null,
  metrics: CustomerRealMetrics | null
): ChurnRiskAnalysis => {
  if (!customer || !metrics) {
    return {
      riskScore: 0,
      riskLevel: 'low',
      riskFactors: [],
      preventionActions: [],
      timeToChurn: 365
    };
  }

  let riskScore = 0;
  const riskFactors: string[] = [];
  const preventionActions: string[] = [];

  // Análise de recência
  if (metrics.days_since_last_purchase !== undefined) {
    if (metrics.days_since_last_purchase > 180) {
      riskScore += 40;
      riskFactors.push('Mais de 6 meses sem comprar');
      preventionActions.push('Campanha de reativação urgente');
    } else if (metrics.days_since_last_purchase > 90) {
      riskScore += 25;
      riskFactors.push('Mais de 3 meses sem comprar');
      preventionActions.push('Oferta especial personalizada');
    } else if (metrics.days_since_last_purchase > 30) {
      riskScore += 10;
      riskFactors.push('Mais de 1 mês sem comprar');
      preventionActions.push('Lembrete amigável com novidades');
    }
  }

  // Análise de valor
  if (metrics.total_purchases === 0) {
    riskScore += 20;
    riskFactors.push('Nunca realizou compra');
    preventionActions.push('Campanha de primeira compra');
  } else if (metrics.total_purchases < 3) {
    riskScore += 15;
    riskFactors.push('Poucas compras realizadas');
    preventionActions.push('Programa de engajamento');
  }

  // Análise de ticket médio baixo
  if (metrics.avg_purchase_value < 50) {
    riskScore += 10;
    riskFactors.push('Ticket médio baixo');
    preventionActions.push('Ofertas de produtos premium');
  }

  // Análise de dados de contato
  if (!customer.email && !customer.phone) {
    riskScore += 20;
    riskFactors.push('Sem dados de contato');
    preventionActions.push('Capturar dados de contato');
  }

  // Determinar nível de risco
  let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
  if (riskScore >= 70) riskLevel = 'critical';
  else if (riskScore >= 50) riskLevel = 'high';
  else if (riskScore >= 30) riskLevel = 'medium';

  // Calcular tempo estimado para churn
  let timeToChurn = 365;
  if (riskLevel === 'critical') timeToChurn = 30;
  else if (riskLevel === 'high') timeToChurn = 60;
  else if (riskLevel === 'medium') timeToChurn = 120;

  return {
    riskScore: Math.min(100, riskScore),
    riskLevel,
    riskFactors,
    preventionActions,
    timeToChurn
  };
};

const generateIntelligentActions = (
  customer: CustomerActionsData | null,
  metrics: CustomerRealMetrics | null,
  riskAnalysis: ChurnRiskAnalysis
): IntelligentAction[] => {
  if (!customer || !metrics) return [];

  const actions: IntelligentAction[] = [];

  // Ação de reativação para clientes em risco
  if (riskAnalysis.riskLevel === 'high' || riskAnalysis.riskLevel === 'critical') {
    actions.push({
      id: 'reactivation_campaign',
      type: 'reactivation',
      title: 'Campanha de Reativação Urgente',
      description: `Cliente em risco ${riskAnalysis.riskLevel}. Enviar oferta especial para reengajamento.`,
      expectedRevenue: metrics.avg_purchase_value * 1.5,
      confidence: 75,
      urgency: riskAnalysis.riskLevel === 'critical' ? 'critical' : 'high',
      discount: riskAnalysis.riskLevel === 'critical' ? 25 : 15,
      reasoning: `Cliente com ${riskAnalysis.riskScore}% de risco de churn`,
      channelRecommendation: customer.phone ? 'whatsapp' : 'email'
    });
  }

  // Cross-sell baseado em categoria favorita
  if (metrics.calculated_favorite_category && metrics.total_purchases > 0) {
    actions.push({
      id: 'cross_sell_favorite',
      type: 'cross_sell',
      title: 'Cross-sell Categoria Favorita',
      description: `Sugerir produtos da categoria "${metrics.calculated_favorite_category}" que o cliente adora.`,
      expectedRevenue: metrics.avg_purchase_value * 0.8,
      confidence: 85,
      urgency: 'medium',
      products: [metrics.calculated_favorite_category],
      reasoning: `Cliente tem preferência por ${metrics.calculated_favorite_category}`,
      channelRecommendation: 'both'
    });
  }

  // Upsell para clientes com bom histórico
  if (metrics.total_purchases >= 3 && metrics.avg_purchase_value > 0) {
    const upsellValue = metrics.avg_purchase_value * 1.3;
    actions.push({
      id: 'upsell_premium',
      type: 'upsell',
      title: 'Upgrade para Linha Premium',
      description: `Cliente com bom histórico. Apresentar produtos premium superiores.`,
      expectedRevenue: upsellValue,
      confidence: 70,
      urgency: 'medium',
      reasoning: `Ticket médio de R$ ${metrics.avg_purchase_value.toFixed(2)} indica potencial para premium`,
      channelRecommendation: customer.email ? 'email' : 'whatsapp'
    });
  }

  // Programa de fidelidade para clientes frequentes
  if (metrics.total_purchases >= 5) {
    actions.push({
      id: 'loyalty_program',
      type: 'retention',
      title: 'Convidar para Programa VIP',
      description: `Cliente frequente qualificado para programa de fidelidade exclusivo.`,
      expectedRevenue: metrics.lifetime_value_calculated * 0.3,
      confidence: 90,
      urgency: 'low',
      reasoning: `${metrics.total_purchases} compras qualificam para programa VIP`,
      channelRecommendation: 'email'
    });
  }

  // Captura de dados para clientes sem contato completo
  if (!customer.email || !customer.phone) {
    actions.push({
      id: 'capture_contact',
      type: 'acquisition',
      title: 'Capturar Dados de Contato',
      description: `Oferecer incentivo para completar dados de contato e melhorar comunicação.`,
      expectedRevenue: 0,
      confidence: 60,
      urgency: 'medium',
      discount: 10,
      reasoning: 'Dados incompletos limitam potencial de comunicação',
      channelRecommendation: customer.phone ? 'whatsapp' : 'email'
    });
  }

  return actions.sort((a, b) => {
    // Ordenar por urgência e depois por revenue esperado
    const urgencyOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    const urgencyDiff = urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
    if (urgencyDiff !== 0) return urgencyDiff;
    return b.expectedRevenue - a.expectedRevenue;
  });
};

const identifyRevenueOpportunities = (
  customer: CustomerActionsData | null,
  metrics: CustomerRealMetrics | null,
  actions: IntelligentAction[]
): RevenueOpportunity[] => {
  if (!customer || !metrics) return [];

  const opportunities: RevenueOpportunity[] = [];

  // Oportunidade imediata
  const immediateActions = actions.filter(a => a.urgency === 'high' || a.urgency === 'critical');
  if (immediateActions.length > 0) {
    const immediateRevenue = immediateActions.reduce((sum, a) => sum + a.expectedRevenue, 0);
    opportunities.push({
      category: 'immediate',
      potential: immediateRevenue,
      probability: 75,
      action: 'Executar ações de alta prioridade',
      timeframe: '1-7 dias'
    });
  }

  // Oportunidade de médio prazo
  if (metrics.total_purchases > 0) {
    const monthlyPotential = metrics.avg_purchase_value * 2;
    opportunities.push({
      category: 'short_term',
      potential: monthlyPotential,
      probability: 60,
      action: 'Campanha mensal personalizada',
      timeframe: '30 dias'
    });
  }

  // Oportunidade de longo prazo
  const annualPotential = metrics.avg_purchase_value * 6;
  opportunities.push({
    category: 'long_term',
    potential: annualPotential,
    probability: 40,
    action: 'Desenvolvimento de relacionamento LTV',
    timeframe: '12 meses'
  });

  return opportunities;
};

// ============================================================================
// HOOK PRINCIPAL SSoT v3.1.0
// ============================================================================

export const useCustomerActionsSSoT = (
  customerId: string
): CustomerActionsOperations => {

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
    queryKey: ['customer-actions-data', customerId],
    queryFn: async (): Promise<CustomerActionsData | null> => {
      if (!customerId) return null;

      try {
        const { data, error } = await supabase
          .from('customers')
          .select(`
            id,
            name,
            email,
            phone,
            contact_preference,
            contact_permission,
            created_at
          `)
          .eq('id', customerId)
          .single();

        if (error) {
          console.error('❌ Erro ao buscar dados do cliente para ações:', error);
          throw error;
        }

        return data;
      } catch (error) {
        console.error('❌ Erro crítico ao buscar cliente para ações:', error);
        throw error;
      }
    },
    enabled: !!customerId,
    staleTime: 5 * 60 * 1000, // 5 min cache
    refetchInterval: false,
    refetchOnWindowFocus: false,
  });

  // ============================================================================
  // SERVER-SIDE DATA FETCHING - METRICS
  // ============================================================================

  const {
    data: realMetrics = null,
    isLoading: isLoadingMetrics,
    error: metricsError,
    refetch: refetchMetrics
  } = useQuery({
    queryKey: ['customer-actions-metrics', customerId],
    queryFn: async (): Promise<CustomerRealMetrics | null> => {
      if (!customerId) return null;

      try {
        const { data, error } = await supabase
          .rpc('get_customer_real_metrics', { p_customer_id: parseInt(customerId) });

        if (error) {
          console.error('❌ Erro ao buscar métricas para ações:', error);
          // Fallback manual se RPC falhar
          return {
            total_purchases: 0,
            lifetime_value_calculated: 0,
            avg_purchase_value: 0,
            days_since_last_purchase: undefined,
            last_purchase_real: undefined,
            calculated_favorite_category: undefined,
            calculated_favorite_product: undefined,
            insights_count: 0,
            insights_confidence: 0,
            data_sync_status: {
              ltv_synced: false,
              dates_synced: false,
              preferences_synced: false
            }
          };
        }

        return data;
      } catch (error) {
        console.error('❌ Erro crítico ao buscar métricas para ações:', error);
        throw error;
      }
    },
    enabled: !!customerId,
    staleTime: 2 * 60 * 1000, // 2 min cache
    refetchInterval: 5 * 60 * 1000, // Auto-refresh 5 min
    refetchOnWindowFocus: true,
  });

  // ============================================================================
  // MUTATIONS PARA REGISTRAR AÇÕES
  // ============================================================================

  const logActionMutation = useMutation({
    mutationFn: async ({ actionType, description }: { actionType: string; description: string }) => {
      const { data, error } = await supabase
        .from('customer_interactions')
        .insert([{
          customer_id: customerId,
          interaction_type: actionType,
          description,
          created_by: null, // TODO: auth.uid() quando implementado
        }])
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao registrar ação:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      // Invalidar caches relacionados
      queryClient.invalidateQueries({ queryKey: ['customer-actions-metrics', customerId] });
      queryClient.invalidateQueries({ queryKey: ['customer-communication-interactions', customerId] });
    },
  });

  // ============================================================================
  // INTELLIGENT BUSINESS LOGIC
  // ============================================================================

  const riskAnalysis = useMemo(() =>
    calculateChurnRisk(customer, realMetrics)
  , [customer, realMetrics]);

  const recommendedActions = useMemo(() =>
    generateIntelligentActions(customer, realMetrics, riskAnalysis)
  , [customer, realMetrics, riskAnalysis]);

  const revenueOpportunities = useMemo(() =>
    identifyRevenueOpportunities(customer, realMetrics, recommendedActions)
  , [customer, realMetrics, recommendedActions]);

  // ============================================================================
  // COMMUNICATION HANDLERS
  // ============================================================================

  const formatPhoneForWhatsApp = useCallback((phone: string): string => {
    return phone.replace(/\D/g, '');
  }, []);

  const createWhatsAppUrl = useCallback((phone: string, message: string): string => {
    const cleanPhone = formatPhoneForWhatsApp(phone);
    const formattedMessage = message.replace('{name}', customer?.name || 'Cliente');
    return `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(formattedMessage)}`;
  }, [customer?.name, formatPhoneForWhatsApp]);

  const createEmailUrl = useCallback((email: string, subject: string, body: string): string => {
    const formattedSubject = subject.replace('{name}', customer?.name || 'Cliente');
    const formattedBody = body.replace('{name}', customer?.name || 'Cliente');
    return `mailto:${email}?subject=${encodeURIComponent(formattedSubject)}&body=${encodeURIComponent(formattedBody)}`;
  }, [customer?.name]);

  const sendWhatsApp = useCallback(async (customMessage?: string) => {
    if (!customer?.phone) {
      alert('Cliente não possui telefone cadastrado');
      return;
    }

    const message = customMessage || DEFAULT_WHATSAPP_MESSAGE;
    const url = createWhatsAppUrl(customer.phone, message);

    // Abrir WhatsApp
    window.open(url, '_blank');

    // Registrar ação automaticamente
    try {
      await logActionMutation.mutateAsync({
        actionType: 'whatsapp_action',
        description: `WhatsApp ação enviado: ${message.replace('{name}', customer.name)}`
      });
    } catch (error) {
      console.error('❌ Erro ao registrar ação de WhatsApp:', error);
    }
  }, [customer, createWhatsAppUrl, logActionMutation]);

  const sendEmail = useCallback(async (customSubject?: string, customBody?: string) => {
    if (!customer?.email) {
      alert('Cliente não possui email cadastrado');
      return;
    }

    const subject = customSubject || DEFAULT_EMAIL_SUBJECT;
    const body = customBody || DEFAULT_EMAIL_BODY;
    const url = createEmailUrl(customer.email, subject, body);

    // Abrir cliente de email
    window.open(url, '_blank');

    // Registrar ação automaticamente
    try {
      await logActionMutation.mutateAsync({
        actionType: 'email_action',
        description: `Email ação enviado: ${subject.replace('{name}', customer.name)}`
      });
    } catch (error) {
      console.error('❌ Erro ao registrar ação de email:', error);
    }
  }, [customer, createEmailUrl, logActionMutation]);

  // ============================================================================
  // ACTION EXECUTORS
  // ============================================================================

  const executeAction = useCallback(async (actionId: string, params: any = {}) => {
    const action = recommendedActions.find(a => a.id === actionId);
    if (!action) {
      throw new Error('Ação não encontrada');
    }

    try {
      // Log início da execução
      await logActionMutation.mutateAsync({
        actionType: 'action_executed',
        description: `Ação executada: ${action.title} - ${action.description}`
      });

      // Executar ação baseada no tipo
      switch (action.type) {
        case 'reactivation':
          if (action.channelRecommendation === 'whatsapp' && customer?.phone) {
            const message = `Olá ${customer.name}! 🍷 Sentimos sua falta! Temos uma oferta especial ${action.discount ? `de ${action.discount}% de desconto` : ''} para você. Que tal descobrir nossas novidades?`;
            await sendWhatsApp(message);
          } else if (customer?.email) {
            const subject = `🍷 Sentimos sua falta! Oferta especial para ${customer.name}`;
            const body = `Prezado(a) ${customer.name},\n\nNotamos que você não nos visita há um tempo e preparamos uma oferta especial!\n\n${action.discount ? `Desconto exclusivo de ${action.discount}%` : 'Confira nossas novidades'}\n\nAtenciosamente,\nEquipe Adega`;
            await sendEmail(subject, body);
          }
          break;

        case 'cross_sell':
        case 'upsell': {
          const channel = action.channelRecommendation === 'whatsapp' ? 'whatsapp' : 'email';
          if (channel === 'whatsapp' && customer?.phone) {
            const message = `Olá ${customer.name}! 🍷 Baseado no seu gosto, separamos produtos especiais para você. Confira nossa seleção personalizada!`;
            await sendWhatsApp(message);
          } else if (customer?.email) {
            const subject = `🍷 Seleção Personalizada para ${customer.name}`;
            const body = `Prezado(a) ${customer.name},\n\nBaseado no seu histórico e preferências, nossa equipe separou uma seleção especial de produtos.\n\nConfira nossa recomendação personalizada!\n\nAtenciosamente,\nEquipe Adega`;
            await sendEmail(subject, body);
          }
          break;
        }

        case 'retention':
          if (customer?.email) {
            const subject = `🌟 Convite VIP para ${customer.name}`;
            const body = `Prezado(a) ${customer.name},\n\nPor ser um cliente especial, gostaríamos de convidá-lo para nosso programa VIP exclusivo!\n\nBenefícios incluem descontos especiais, produtos exclusivos e atendimento preferencial.\n\nAtenciosamente,\nEquipe Adega`;
            await sendEmail(subject, body);
          }
          break;

        default:
          console.log('📧 Ação executada via canal padrão');
      }

    } catch (error) {
      console.error('❌ Erro ao executar ação:', error);
      throw error;
    }
  }, [recommendedActions, customer, sendWhatsApp, sendEmail, logActionMutation]);

  const sendTargetedPromo = useCallback(async (promoType: string, customMessage?: string) => {
    const preferredChannel = customer?.phone ? 'whatsapp' : customer?.email ? 'email' : 'none';

    if (preferredChannel === 'whatsapp') {
      const message = customMessage || `🍷 Promoção especial para você, ${customer?.name}! Confira nossa oferta exclusiva da semana.`;
      await sendWhatsApp(message);
    } else if (preferredChannel === 'email') {
      const subject = `🍷 Promoção ${promoType} - Oferta Especial`;
      const body = customMessage || `Prezado(a) ${customer?.name},\n\nTemos uma promoção especial que pode interessar você!\n\nConfira nossa oferta exclusiva.\n\nAtenciosamente,\nEquipe Adega`;
      await sendEmail(subject, body);
    }
  }, [customer, sendWhatsApp, sendEmail]);

  const scheduleFollowUp = useCallback(async (days: number, message: string) => {
    // Por enquanto apenas registrar - implementação futura de agendamento
    await logActionMutation.mutateAsync({
      actionType: 'follow_up_scheduled',
      description: `Follow-up agendado para ${days} dias: ${message}`
    });

    console.log(`📅 Follow-up agendado para ${days} dias: ${message}`);
  }, [logActionMutation]);

  // ============================================================================
  // METRICS AND CALCULATIONS
  // ============================================================================

  const conversionMetrics = useMemo((): ConversionMetrics => {
    // Por enquanto dados simulados - implementação futura com dados reais
    return {
      actionsTaken: 0,
      successRate: 0,
      avgRevenuePerAction: 0,
      totalRevenueBoosted: 0,
      bestPerformingAction: 'cross_sell_favorite'
    };
  }, []);

  const roiCalculator = useCallback((actionType: string): number => {
    // ROI simulado baseado em tipos de ação - implementação futura com dados reais
    const roiMap: Record<string, number> = {
      'cross_sell': 250,
      'upsell': 300,
      'reactivation': 150,
      'retention': 400,
      'acquisition': 120
    };
    return roiMap[actionType] || 100;
  }, []);

  // ============================================================================
  // ESTADO DERIVADO
  // ============================================================================

  const isLoading = isLoadingCustomer || isLoadingMetrics;
  const error = customerError || metricsError;

  const hasPhoneNumber = !!(customer?.phone && customer.phone.trim() !== '');
  const hasEmailAddress = !!(customer?.email && customer.email.trim() !== '');
  const hasContactInfo = hasPhoneNumber || hasEmailAddress;

  const preferredChannel = useMemo((): 'phone' | 'email' | 'none' => {
    if (customer?.contact_preference === 'phone' && hasPhoneNumber) return 'phone';
    if (customer?.contact_preference === 'email' && hasEmailAddress) return 'email';
    if (hasPhoneNumber) return 'phone';
    if (hasEmailAddress) return 'email';
    return 'none';
  }, [customer?.contact_preference, hasPhoneNumber, hasEmailAddress]);

  const isHighValue = realMetrics ? realMetrics.lifetime_value_calculated >= 500 && realMetrics.total_purchases >= 5 : false;
  const isAtRisk = riskAnalysis.riskLevel === 'high' || riskAnalysis.riskLevel === 'critical';
  const needsAttention = isAtRisk || !hasContactInfo || (realMetrics?.total_purchases === 0);

  const hasData = !!customer;
  const isEmpty = !hasData;
  const hasIntelligentSuggestions = recommendedActions.length > 0;

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
    realMetrics,

    // Inteligência artificial
    recommendedActions,
    riskAnalysis,
    revenueOpportunities,

    // Estados de carregamento
    isLoading,
    error: error as Error | null,

    // Ações executáveis
    executeAction,
    sendTargetedPromo,
    sendWhatsApp,
    sendEmail,
    scheduleFollowUp,

    // Métricas de performance
    conversionMetrics,
    roiCalculator,

    // Estados derivados
    hasIntelligentSuggestions,
    hasContactInfo,
    hasPhoneNumber,
    hasEmailAddress,
    preferredChannel,
    isHighValue,
    isAtRisk,
    needsAttention,

    // Refresh manual
    refetch,

    // Estado geral
    hasData,
    isEmpty
  };
};

export default useCustomerActionsSSoT;