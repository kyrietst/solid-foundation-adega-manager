/**
 * @fileoverview Hooks para gerenciamento de notificações de delivery
 * Inclui notificações em tempo real e marcação de leitura
 * 
 * @author Adega Manager Team
 * @version 1.0.0
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/core/api/supabase/client';
import { useToast } from '@/shared/hooks/common/use-toast';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  category: string;
  data: any;
  read_at?: string;
  created_at: string;
  updated_at: string;
  expires_at?: string;
}

/**
 * Hook para buscar notificações do usuário atual
 */
export const useNotifications = (params?: {
  limit?: number;
  unreadOnly?: boolean;
  category?: string;
}) => {
  return useQuery({
    queryKey: ['notifications', params],
    queryFn: async (): Promise<Notification[]> => {
      console.log('🔔 Buscando notificações...');

      let query = supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      // Filtros
      if (params?.unreadOnly) {
        query = query.is('read_at', null);
      }

      if (params?.category) {
        query = query.eq('category', params.category);
      }

      if (params?.limit) {
        query = query.limit(params.limit);
      }

      // Filtrar notificações não expiradas
      query = query.or('expires_at.is.null,expires_at.gt.' + new Date().toISOString());

      const { data, error } = await query;

      if (error) {
        console.error('❌ Erro ao buscar notificações:', error);
        throw error;
      }

      console.log(`✅ ${data?.length || 0} notificações carregadas`);
      return data || [];
    },
    staleTime: 30 * 1000, // 30 segundos
    refetchInterval: 60 * 1000, // Refetch a cada minuto
  });
};

/**
 * Hook para contar notificações não lidas
 */
export const useUnreadNotificationsCount = () => {
  return useQuery({
    queryKey: ['notifications-unread-count'],
    queryFn: async (): Promise<number> => {
      const { data, error } = await supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .is('read_at', null)
        .or('expires_at.is.null,expires_at.gt.' + new Date().toISOString());

      if (error) {
        console.error('❌ Erro ao contar notificações:', error);
        throw error;
      }

      return data?.length || 0;
    },
    staleTime: 30 * 1000,
    refetchInterval: 30 * 1000,
  });
};

/**
 * Hook para marcar notificação como lida
 */
export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      console.log(`📖 Marcando notificação ${notificationId} como lida...`);

      const { error } = await supabase
        .from('notifications')
        .update({ 
          read_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', notificationId);

      if (error) {
        console.error('❌ Erro ao marcar como lida:', error);
        throw error;
      }

      console.log('✅ Notificação marcada como lida');
      return true;
    },
    onSuccess: () => {
      // Invalidar queries de notificações
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
  });
};

/**
 * Hook para marcar todas as notificações como lidas
 */
export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      console.log('📖 Marcando todas as notificações como lidas...');

      const { error } = await supabase
        .from('notifications')
        .update({ 
          read_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .is('read_at', null);

      if (error) {
        console.error('❌ Erro ao marcar todas como lidas:', error);
        throw error;
      }

      console.log('✅ Todas as notificações marcadas como lidas');
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
  });
};

/**
 * Hook para notificações em tempo real via subscription
 */
export const useRealtimeNotifications = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    console.log('🔔 Configurando subscription de notificações em tempo real...');

    // Subscription para novas notificações
    const subscription = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${supabase.auth.getUser().then(r => r.data.user?.id)}`
        },
        (payload) => {
          console.log('🔔 Nova notificação recebida:', payload.new);
          
          const notification = payload.new as Notification;
          
          // Mostrar toast da notificação
          toast({
            title: notification.title,
            description: notification.message,
            variant: notification.type === 'error' ? 'destructive' : 'default',
          });

          // Invalidar queries para atualizar a interface
          queryClient.invalidateQueries({ queryKey: ['notifications'] });
          queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
        }
      )
      .subscribe();

    return () => {
      console.log('🔔 Removendo subscription de notificações...');
      subscription.unsubscribe();
    };
  }, [queryClient, toast]);
};

/**
 * Hook para buscar notificações de delivery especificamente
 */
export const useDeliveryNotifications = (limit: number = 10) => {
  return useNotifications({
    category: 'delivery',
    limit,
  });
};

/**
 * Hook para criar notificação manualmente (para testes ou casos especiais)
 */
export const useCreateNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      title,
      message,
      type = 'info',
      category = 'general',
      data = {},
      expiresHours
    }: {
      userId: string;
      title: string;
      message: string;
      type?: 'info' | 'success' | 'warning' | 'error';
      category?: string;
      data?: any;
      expiresHours?: number;
    }) => {
      console.log(`🔔 Criando notificação para usuário ${userId}...`);

      const { data: result, error } = await supabase.rpc('create_notification', {
        p_user_id: userId,
        p_title: title,
        p_message: message,
        p_type: type,
        p_category: category,
        p_data: data,
        p_expires_hours: expiresHours
      });

      if (error) {
        console.error('❌ Erro ao criar notificação:', error);
        throw error;
      }

      console.log('✅ Notificação criada:', result);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
  });
};