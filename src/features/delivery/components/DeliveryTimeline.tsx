/**
 * @fileoverview Timeline component para exibir histórico completo de delivery
 * Mostra cronologia detalhada de status, localizações e eventos
 * 
 * @author Adega Manager Team
 * @version 1.0.0
 */

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { Badge } from '@/shared/ui/primitives/badge';
import { Separator } from '@/shared/ui/primitives/separator';
import { 
  Clock, 
  MapPin, 
  User, 
  CheckCircle, 
  Truck, 
  Package,
  AlertCircle,
  Navigation,
  MessageSquare
} from 'lucide-react';
import { cn } from '@/core/config/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/core/api/supabase/client';

interface DeliveryTimelineEvent {
  tracking_id: string;
  status: string;
  notes: string;
  location_lat?: number;
  location_lng?: number;
  created_by_id?: string;
  created_by_name: string;
  created_at: string;
  time_diff_minutes?: number;
  is_current_status: boolean;
}

interface DeliveryTimelineProps {
  saleId: string;
  className?: string;
}

export const DeliveryTimeline = ({ saleId, className }: DeliveryTimelineProps) => {
  
  // Buscar timeline da entrega
  const { data: timeline = [], isLoading, error } = useQuery({
    queryKey: ['delivery-timeline', saleId],
    queryFn: async (): Promise<DeliveryTimelineEvent[]> => {
      console.log(`📅 Buscando timeline para entrega ${saleId}...`);

      const { data, error } = await supabase.rpc('get_delivery_timeline', {
        p_sale_id: saleId
      });

      if (error) {
        console.error('❌ Erro ao buscar timeline:', error);
        throw error;
      }

      console.log(`✅ Timeline carregada: ${data?.length || 0} eventos`);
      return data || [];
    },
    staleTime: 30 * 1000, // 30 segundos
    refetchInterval: 60 * 1000, // Refetch a cada minuto
  });

  const getStatusIcon = (status: string, isCurrent: boolean) => {
    const iconProps = {
      className: cn(
        "h-5 w-5",
        isCurrent ? "text-white" : "text-gray-400"
      )
    };

    switch (status) {
      case 'pending': return <Package {...iconProps} />;
      case 'preparing': return <Clock {...iconProps} />;
      case 'out_for_delivery': return <Truck {...iconProps} />;
      case 'delivered': return <CheckCircle {...iconProps} />;
      case 'cancelled': return <AlertCircle {...iconProps} />;
      default: return <Clock {...iconProps} />;
    }
  };

  const getStatusColor = (status: string, isCurrent: boolean) => {
    if (!isCurrent) return 'bg-gray-600/30 border-gray-500/50';
    
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 border-yellow-400/50';
      case 'preparing': return 'bg-orange-500/20 border-orange-400/50';
      case 'out_for_delivery': return 'bg-blue-500/20 border-blue-400/50';
      case 'delivered': return 'bg-green-500/20 border-green-400/50';
      case 'cancelled': return 'bg-red-500/20 border-red-400/50';
      default: return 'bg-gray-500/20 border-gray-400/50';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pedido Recebido';
      case 'preparing': return 'Preparando Pedido';
      case 'out_for_delivery': return 'Saiu para Entrega';
      case 'delivered': return 'Entregue';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  const formatTime = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: ptBR });
    } catch {
      return 'Data inválida';
    }
  };

  const formatTimeDiff = (minutes?: number) => {
    if (!minutes || minutes <= 0) return null;
    
    if (minutes < 60) {
      return `${Math.round(minutes)} min depois`;
    } else if (minutes < 1440) { // menos de 24h
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = Math.round(minutes % 60);
      return `${hours}h${remainingMinutes > 0 ? ` ${remainingMinutes}min` : ''} depois`;
    } else {
      const days = Math.floor(minutes / 1440);
      const hours = Math.floor((minutes % 1440) / 60);
      return `${days}d${hours > 0 ? ` ${hours}h` : ''} depois`;
    }
  };

  if (isLoading) {
    return (
      <Card className={cn("bg-gray-800/30 border-gray-700/40", className)}>
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-400" />
            Timeline da Entrega
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-4 animate-pulse">
                <div className="w-10 h-10 bg-gray-600/30 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-600/30 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-600/30 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={cn("bg-gray-800/30 border-gray-700/40", className)}>
        <CardContent className="py-8">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-white mb-2">Erro ao carregar timeline</h3>
            <p className="text-gray-400 text-sm">Não foi possível carregar o histórico da entrega.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (timeline.length === 0) {
    return (
      <Card className={cn("bg-gray-800/30 border-gray-700/40", className)}>
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-400" />
            Timeline da Entrega
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-gray-500 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-white mb-2">Nenhum evento registrado</h3>
            <p className="text-gray-400 text-sm">O histórico da entrega aparecerá aqui conforme for atualizado.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("bg-gray-800/30 border-gray-700/40", className)}>
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Clock className="h-5 w-5 text-blue-400" />
          Timeline da Entrega
          <Badge variant="outline" className="ml-auto text-xs">
            {timeline.length} eventos
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Linha vertical da timeline */}
          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-600/50"></div>
          
          <div className="space-y-6">
            {timeline.map((event, index) => (
              <div key={event.tracking_id} className="relative flex gap-4">
                {/* Ícone do status */}
                <div className={cn(
                  "relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300",
                  getStatusColor(event.status, event.is_current_status)
                )}>
                  {getStatusIcon(event.status, event.is_current_status)}
                </div>

                {/* Conteúdo do evento */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className={cn(
                        "font-medium",
                        event.is_current_status ? "text-white" : "text-gray-300"
                      )}>
                        {getStatusText(event.status)}
                      </h4>
                      
                      {event.notes && (
                        <div className="flex items-start gap-2 mt-1">
                          <MessageSquare className="h-3 w-3 text-gray-500 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-gray-400">{event.notes}</p>
                        </div>
                      )}
                      
                      {/* Localização se disponível */}
                      {event.location_lat && event.location_lng && (
                        <div className="flex items-center gap-2 mt-1">
                          <Navigation className="h-3 w-3 text-gray-500" />
                          <span className="text-xs text-gray-500">
                            {event.location_lat.toFixed(6)}, {event.location_lng.toFixed(6)}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="text-right flex-shrink-0 ml-4">
                      <div className="text-sm text-gray-300">
                        {formatTime(event.created_at)}
                      </div>
                      
                      {/* Diferença de tempo */}
                      {event.time_diff_minutes && formatTimeDiff(event.time_diff_minutes) && (
                        <div className="text-xs text-gray-500 mt-1">
                          {formatTimeDiff(event.time_diff_minutes)}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Responsável pela ação */}
                  <div className="flex items-center gap-1 mt-2">
                    <User className="h-3 w-3 text-gray-500" />
                    <span className="text-xs text-gray-500">
                      {event.created_by_name}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DeliveryTimeline;