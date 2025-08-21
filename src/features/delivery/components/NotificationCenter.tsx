/**
 * @fileoverview Centro de notificações para o sistema de delivery
 * Exibe notificações em tempo real com ações e filtros
 * 
 * @author Adega Manager Team
 * @version 1.0.0
 */

import React, { useState } from 'react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuItem
} from '@/shared/ui/primitives/dropdown-menu';
import { Button } from '@/shared/ui/primitives/button';
import { Badge } from '@/shared/ui/primitives/badge';
import { ScrollArea } from '@/shared/ui/primitives/scroll-area';
import { 
  Bell, 
  BellDot, 
  Check, 
  CheckCheck, 
  Clock, 
  Truck, 
  AlertTriangle,
  CheckCircle,
  Info,
  X
} from 'lucide-react';
import { cn } from '@/core/config/utils';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  useNotifications, 
  useUnreadNotificationsCount, 
  useMarkNotificationAsRead, 
  useMarkAllNotificationsAsRead,
  useRealtimeNotifications,
  type Notification 
} from '@/features/delivery/hooks/useNotifications';

interface NotificationCenterProps {
  className?: string;
}

export const NotificationCenter = ({ className }: NotificationCenterProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'delivery' | 'unread'>('all');

  // Hooks para dados
  const { data: notifications = [], isLoading } = useNotifications({
    limit: 50,
    unreadOnly: filter === 'unread',
    category: filter === 'delivery' ? 'delivery' : undefined
  });
  
  const { data: unreadCount = 0 } = useUnreadNotificationsCount();
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();

  // Subscription em tempo real
  useRealtimeNotifications();

  const getNotificationIcon = (type: string, category: string) => {
    if (category === 'delivery') {
      return <Truck className="h-4 w-4 text-blue-400" />;
    }

    switch (type) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
      case 'error': return <X className="h-4 w-4 text-red-400" />;
      default: return <Info className="h-4 w-4 text-blue-400" />;
    }
  };

  const getNotificationBg = (type: string, isRead: boolean) => {
    const base = isRead ? 'bg-gray-800/30' : 'bg-gray-700/50';
    
    if (isRead) return base;

    switch (type) {
      case 'success': return 'bg-green-900/20 border-l-4 border-green-500';
      case 'warning': return 'bg-yellow-900/20 border-l-4 border-yellow-500';
      case 'error': return 'bg-red-900/20 border-l-4 border-red-500';
      default: return 'bg-blue-900/20 border-l-4 border-blue-500';
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read_at) {
      markAsRead.mutate(notification.id);
    }

    // Navegar para o contexto da notificação se for de delivery
    if (notification.category === 'delivery' && notification.data?.sale_id) {
      console.log('Navegar para entrega:', notification.data.sale_id);
      // Aqui poderia abrir o modal da entrega ou navegar para a página
    }
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead.mutate();
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.read_at;
    if (filter === 'delivery') return notification.category === 'delivery';
    return true;
  });

  const formatNotificationTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return formatDistanceToNow(date, { addSuffix: true, locale: ptBR });
    } else {
      return format(date, 'dd/MM HH:mm', { locale: ptBR });
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "relative bg-black/40 border-white/20 text-white hover:bg-white/10",
            className
          )}
        >
          {unreadCount > 0 ? (
            <BellDot className="h-4 w-4" />
          ) : (
            <Bell className="h-4 w-4" />
          )}
          
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent 
        className="w-80 bg-gray-900/95 border-white/20 backdrop-blur-xl" 
        align="end"
      >
        <DropdownMenuLabel className="flex items-center justify-between">
          <span className="text-white font-semibold">Notificações</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="h-6 px-2 text-xs text-blue-400 hover:text-blue-300"
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              Marcar todas
            </Button>
          )}
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="bg-white/10" />

        {/* Filtros */}
        <div className="p-2 flex gap-1">
          <Button
            variant={filter === 'all' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilter('all')}
            className="h-6 px-2 text-xs"
          >
            Todas
          </Button>
          <Button
            variant={filter === 'unread' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilter('unread')}
            className="h-6 px-2 text-xs"
          >
            Não lidas ({unreadCount})
          </Button>
          <Button
            variant={filter === 'delivery' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilter('delivery')}
            className="h-6 px-2 text-xs"
          >
            <Truck className="h-3 w-3 mr-1" />
            Delivery
          </Button>
        </div>

        <DropdownMenuSeparator className="bg-white/10" />

        {/* Lista de notificações */}
        <ScrollArea className="h-96">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className="w-8 h-8 bg-gray-600/30 rounded"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gray-600/30 rounded w-3/4"></div>
                    <div className="h-2 bg-gray-600/30 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="h-12 w-12 text-gray-500 mx-auto mb-3" />
              <h3 className="text-sm font-medium text-white mb-1">
                {filter === 'unread' ? 'Todas lidas!' : 'Nenhuma notificação'}
              </h3>
              <p className="text-xs text-gray-400">
                {filter === 'unread' 
                  ? 'Você está em dia com suas notificações' 
                  : 'As notificações aparecerão aqui'
                }
              </p>
            </div>
          ) : (
            <div className="p-1">
              {filteredNotifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className={cn(
                    "flex gap-3 p-3 cursor-pointer rounded-lg mb-1 focus:bg-white/10",
                    getNotificationBg(notification.type, !!notification.read_at)
                  )}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex-shrink-0">
                    {getNotificationIcon(notification.type, notification.category)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className={cn(
                        "text-sm font-medium truncate",
                        notification.read_at ? "text-gray-300" : "text-white"
                      )}>
                        {notification.title}
                      </h4>
                      {!notification.read_at && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                      )}
                    </div>
                    
                    <p className={cn(
                      "text-xs mt-1 line-clamp-2",
                      notification.read_at ? "text-gray-500" : "text-gray-300"
                    )}>
                      {notification.message}
                    </p>
                    
                    <div className="flex items-center gap-2 mt-2">
                      <Clock className="h-3 w-3 text-gray-500" />
                      <span className="text-xs text-gray-500">
                        {formatNotificationTime(notification.created_at)}
                      </span>
                      
                      {notification.category === 'delivery' && (
                        <Badge variant="outline" className="text-xs px-1 py-0 h-4">
                          Delivery
                        </Badge>
                      )}
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
          )}
        </ScrollArea>

        {filteredNotifications.length > 0 && (
          <>
            <DropdownMenuSeparator className="bg-white/10" />
            <div className="p-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-blue-400 hover:text-blue-300 hover:bg-blue-400/10"
                onClick={() => setIsOpen(false)}
              >
                Ver todas as notificações
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationCenter;