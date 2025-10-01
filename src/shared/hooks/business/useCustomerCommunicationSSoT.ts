/**
 * useCustomerCommunicationSSoT.ts - Hook SSoT v3.1.0 Server-Side
 *
 * @description
 * Hook SSoT completo que busca dados diretamente do banco para comunicação e interações.
 * Elimina dependência de props e implementa performance otimizada com queries SQL.
 *
 * @features
 * - Busca direta do Supabase (sem props)
 * - Carrega histórico de customer_interactions
 * - Handlers centralizados para WhatsApp/Email
 * - Registro automático de interações no banco
 * - Cache inteligente com invalidação
 * - Performance otimizada para escalabilidade
 *
 * @author Adega Manager Team
 * @version 3.1.0 - SSoT Server-Side Implementation
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';
import { useMemo, useCallback } from 'react';

// ============================================================================
// TYPES E INTERFACES
// ============================================================================

export interface CustomerCommunicationData {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  contact_preference?: string;
  contact_permission?: boolean;
  created_at: string;
}

export interface CommunicationInteraction {
  id: string;
  customer_id: string;
  interaction_type: string;
  description: string;
  associated_sale_id?: string;
  created_by?: string;
  created_at: string;
}

export interface CommunicationOperations {
  // Dados do servidor
  customer: CustomerCommunicationData | null;
  interactions: CommunicationInteraction[];

  // Estados de carregamento
  isLoading: boolean;
  error: Error | null;

  // Handlers centralizados
  sendWhatsApp: (message?: string) => Promise<void>;
  sendEmail: (subject?: string, body?: string) => Promise<void>;

  // Funcionalidades futuras
  addInteraction: (type: string, description: string) => Promise<void>;

  // Estado derivado
  hasContactInfo: boolean;
  hasPhoneNumber: boolean;
  hasEmailAddress: boolean;
  preferredChannel: 'phone' | 'email' | 'none';

  // Refresh manual
  refetch: () => void;

  // Utilitários
  formatPhoneForWhatsApp: (phone: string) => string;
  createWhatsAppUrl: (phone: string, message: string) => string;
  createEmailUrl: (email: string, subject: string, body: string) => string;

  // Estados derivados
  hasData: boolean;
  isEmpty: boolean;
  hasInteractions: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_WHATSAPP_MESSAGE = 'Olá {name}, tudo bem? Aqui é da Adega! 🍷';
const DEFAULT_EMAIL_SUBJECT = 'Contato - Adega Wine Store';
const DEFAULT_EMAIL_BODY = 'Prezado(a) {name},\n\nEsperamos que esteja bem!\n\nAtenciosamente,\nEquipe Adega';

// ============================================================================
// HOOK PRINCIPAL SSoT v3.1.0
// ============================================================================

export const useCustomerCommunicationSSoT = (
  customerId: string
): CommunicationOperations => {

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
    queryKey: ['customer-communication-data', customerId],
    queryFn: async (): Promise<CustomerCommunicationData | null> => {
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
          console.error('❌ Erro ao buscar dados do cliente para comunicação:', error);
          throw error;
        }

        return data;
      } catch (error) {
        console.error('❌ Erro crítico ao buscar cliente para comunicação:', error);
        throw error;
      }
    },
    enabled: !!customerId,
    staleTime: 5 * 60 * 1000, // 5 min cache para dados de cliente (mais estáveis)
    refetchInterval: false, // Desabilitar auto-refresh para dados básicos do cliente
    refetchOnWindowFocus: false, // Evitar refetch desnecessário
  });

  // ============================================================================
  // SERVER-SIDE DATA FETCHING - INTERACTIONS
  // ============================================================================

  const {
    data: rawInteractions = [],
    isLoading: isLoadingInteractions,
    error: interactionsError,
    refetch: refetchInteractions
  } = useQuery({
    queryKey: ['customer-communication-interactions', customerId],
    queryFn: async (): Promise<CommunicationInteraction[]> => {
      if (!customerId) return [];

      try {
        const { data: interactions, error: interactionsError } = await supabase
          .from('customer_interactions')
          .select(`
            id,
            customer_id,
            interaction_type,
            description,
            associated_sale_id,
            created_by,
            created_at
          `)
          .eq('customer_id', customerId)
          .order('created_at', { ascending: false })
          .limit(50); // Limitar a 50 interações mais recentes para performance

        if (interactionsError) {
          console.error('❌ Erro ao buscar interações de comunicação:', interactionsError);
          throw interactionsError;
        }

        return interactions || [];

      } catch (error) {
        console.error('❌ Erro crítico ao buscar interações de comunicação:', error);
        throw error;
      }
    },
    enabled: !!customerId,
    staleTime: 2 * 60 * 1000, // 2 min cache para interações (dados dinâmicos)
    refetchInterval: 5 * 60 * 1000, // Auto-refresh a cada 5 min
    refetchOnWindowFocus: true, // Manter focus refresh para dados dinâmicos
    retry: 3, // Retry em caso de falha
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000), // Backoff exponencial
  });

  // ============================================================================
  // MUTATIONS PARA ADICIONAR INTERAÇÕES
  // ============================================================================

  const addInteractionMutation = useMutation({
    mutationFn: async ({ type, description }: { type: string; description: string }) => {
      const { data, error } = await supabase
        .from('customer_interactions')
        .insert([{
          customer_id: customerId,
          interaction_type: type,
          description,
          created_by: null, // TODO: Implementar auth.uid() quando necessário
        }])
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao criar interação:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      // Invalidar cache de interações para refresh automático
      queryClient.invalidateQueries({ queryKey: ['customer-communication-interactions', customerId] });
    },
  });

  // ============================================================================
  // UTILITY FUNCTIONS
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

  // ============================================================================
  // HANDLERS CENTRALIZADOS
  // ============================================================================

  const sendWhatsApp = useCallback(async (customMessage?: string) => {
    if (!customer?.phone) {
      alert('Cliente não possui telefone cadastrado');
      return;
    }

    const message = customMessage || DEFAULT_WHATSAPP_MESSAGE;
    const url = createWhatsAppUrl(customer.phone, message);

    // Abrir WhatsApp
    window.open(url, '_blank');

    // Registrar interação automaticamente
    try {
      await addInteractionMutation.mutateAsync({
        type: 'whatsapp',
        description: `WhatsApp enviado: ${message.replace('{name}', customer.name)}`
      });
    } catch (error) {
      console.error('❌ Erro ao registrar interação de WhatsApp:', error);
    }
  }, [customer, createWhatsAppUrl, addInteractionMutation]);

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

    // Registrar interação automaticamente
    try {
      await addInteractionMutation.mutateAsync({
        type: 'email',
        description: `Email enviado: ${subject.replace('{name}', customer.name)}`
      });
    } catch (error) {
      console.error('❌ Erro ao registrar interação de email:', error);
    }
  }, [customer, createEmailUrl, addInteractionMutation]);

  const addInteraction = useCallback(async (type: string, description: string) => {
    try {
      await addInteractionMutation.mutateAsync({ type, description });
    } catch (error) {
      console.error('❌ Erro ao adicionar interação manual:', error);
      throw error;
    }
  }, [addInteractionMutation]);

  // ============================================================================
  // ESTADO DERIVADO
  // ============================================================================

  const isLoading = isLoadingCustomer || isLoadingInteractions;
  const error = customerError || interactionsError;

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

  const hasData = !!customer;
  const isEmpty = !hasData;
  const hasInteractions = rawInteractions.length > 0;

  const refetch = useCallback(() => {
    refetchCustomer();
    refetchInteractions();
  }, [refetchCustomer, refetchInteractions]);

  // ============================================================================
  // RETURN SSoT v3.1.0
  // ============================================================================

  return {
    // Dados do servidor
    customer,
    interactions: rawInteractions,

    // Estados de carregamento
    isLoading,
    error: error as Error | null,

    // Handlers centralizados
    sendWhatsApp,
    sendEmail,

    // Funcionalidades futuras
    addInteraction,

    // Estado derivado
    hasContactInfo,
    hasPhoneNumber,
    hasEmailAddress,
    preferredChannel,

    // Refresh manual
    refetch,

    // Utilitários
    formatPhoneForWhatsApp,
    createWhatsAppUrl,
    createEmailUrl,

    // Estados derivados
    hasData,
    isEmpty,
    hasInteractions
  };
};

export default useCustomerCommunicationSSoT;