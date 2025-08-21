/**
 * @fileoverview Card componente para exibir pedidos de delivery completos
 * Exibe informações detalhadas incluindo customer, items, tracking e status
 * 
 * @author Adega Manager Team
 * @version 1.0.0
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { Button } from '@/shared/ui/primitives/button';
import { Badge } from '@/shared/ui/primitives/badge';
import { Separator } from '@/shared/ui/primitives/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/ui/primitives/dialog';
import { 
  User, 
  MapPin, 
  Clock, 
  DollarSign, 
  Package,
  Truck,
  CheckCircle,
  AlertCircle,
  Phone,
  FileText,
  Calendar,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/core/config/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { DeliveryOrder } from '@/features/delivery/hooks/useDeliveryOrders';
import { DeliveryTimeline } from './DeliveryTimeline';
import { DeliveryAssignmentModal } from './DeliveryAssignmentModal';

interface DeliveryOrderCardProps {
  delivery: DeliveryOrder;
  onUpdateStatus?: (saleId: string, newStatus: string, deliveryPersonId?: string) => void;
  onViewDetails?: (saleId: string) => void;
  isUpdating?: boolean;
  className?: string;
}

export const DeliveryOrderCard = ({
  delivery,
  onUpdateStatus,
  onViewDetails,
  isUpdating = false,
  className
}: DeliveryOrderCardProps) => {
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);
  const [isAssignmentOpen, setIsAssignmentOpen] = useState(false);
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'preparing': return <Package className="h-4 w-4 text-orange-500" />;
      case 'out_for_delivery': return <Truck className="h-4 w-4 text-blue-500" />;
      case 'delivered': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'cancelled': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'preparing': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'out_for_delivery': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'delivered': return 'bg-green-100 text-green-700 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'preparing': return 'Preparando';
      case 'out_for_delivery': return 'Em Trânsito';
      case 'delivered': return 'Entregue';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case 'pending': return 'preparing';
      case 'preparing': return 'out_for_delivery';
      case 'out_for_delivery': return 'delivered';
      default: return null;
    }
  };

  const getNextStatusText = (currentStatus: string) => {
    const nextStatus = getNextStatus(currentStatus);
    if (!nextStatus) return null;
    
    switch (nextStatus) {
      case 'preparing': return 'Preparar';
      case 'out_for_delivery': return 'Iniciar Entrega';
      case 'delivered': return 'Marcar Entregue';
      default: return null;
    }
  };

  const formatAddress = (address: any) => {
    if (!address) return 'Endereço não informado';
    return `${address.street} ${address.number}${address.complement ? `, ${address.complement}` : ''}, ${address.neighborhood}`;
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return '-';
    try {
      return format(new Date(timeString), 'HH:mm', { locale: ptBR });
    } catch {
      return '-';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: ptBR });
    } catch {
      return 'Data inválida';
    }
  };

  return (
    <Card className={cn(
      "bg-gray-800/30 border-gray-700/40 backdrop-blur-sm shadow-lg transition-all duration-300",
      "hover:shadow-2xl hover:shadow-purple-500/10 hover:border-purple-400/30",
      className
    )}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/20 border border-blue-400/30">
              <Package className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-white">
                Pedido #{delivery.id.slice(-8)}
              </CardTitle>
              <p className="text-sm text-gray-400 mt-1">
                {formatDate(delivery.created_at)}
              </p>
            </div>
          </div>
          
          <Badge className={cn("font-medium border", getStatusColor(delivery.delivery_status))}>
            <div className="flex items-center gap-1">
              {getStatusIcon(delivery.delivery_status)}
              {getStatusText(delivery.delivery_status)}
            </div>
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Informações do Cliente */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-white font-medium">
            <User className="h-4 w-4 text-blue-400" />
            Cliente
          </div>
          <div className="ml-6 space-y-1">
            <p className="text-white font-medium">
              {delivery.customer?.name || 'Cliente não informado'}
            </p>
            {delivery.customer?.phone && (
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <Phone className="h-3 w-3" />
                {delivery.customer.phone}
              </div>
            )}
          </div>
        </div>

        <Separator className="bg-gray-600/30" />

        {/* Endereço de Entrega */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-white font-medium">
            <MapPin className="h-4 w-4 text-green-400" />
            Endereço de Entrega
          </div>
          <div className="ml-6">
            <p className="text-gray-300 text-sm">
              {formatAddress(delivery.delivery_address)}
            </p>
            {delivery.delivery_instructions && (
              <div className="flex items-start gap-2 mt-2 text-gray-400 text-sm">
                <FileText className="h-3 w-3 mt-0.5 flex-shrink-0" />
                <span>{delivery.delivery_instructions}</span>
              </div>
            )}
          </div>
        </div>

        <Separator className="bg-gray-600/30" />

        {/* Informações da Entrega */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-white font-medium">
              <Clock className="h-4 w-4 text-yellow-400" />
              Tempo Estimado
            </div>
            <p className="ml-6 text-gray-300 text-sm">
              {formatTime(delivery.estimated_delivery_time)}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-white font-medium">
              <Truck className="h-4 w-4 text-purple-400" />
              Entregador
            </div>
            <div className="ml-6 flex items-center gap-2">
              <p className="text-gray-300 text-sm flex-1">
                {delivery.delivery_person?.name || 'Não atribuído'}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAssignmentOpen(true)}
                className="h-6 px-2 text-xs border-purple-400/50 text-purple-400 hover:bg-purple-400/10"
              >
                {delivery.delivery_person?.name ? 'Alterar' : 'Atribuir'}
              </Button>
            </div>
          </div>
        </div>

        <Separator className="bg-gray-600/30" />

        {/* Itens do Pedido */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-white font-medium">
            <Package className="h-4 w-4 text-orange-400" />
            Itens ({delivery.items.length})
          </div>
          <div className="ml-6 space-y-1 max-h-32 overflow-y-auto">
            {delivery.items.map((item, index) => (
              <div key={item.id || index} className="flex justify-between items-center text-sm">
                <span className="text-gray-300">
                  {item.quantity}x {item.product_name}
                </span>
                <span className="text-gray-400">
                  R$ {item.subtotal.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <Separator className="bg-gray-600/30" />

        {/* Valores Financeiros */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-white font-medium">
            <DollarSign className="h-4 w-4 text-green-400" />
            Valores
          </div>
          <div className="ml-6 space-y-1">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">Subtotal:</span>
              <span className="text-gray-300">R$ {delivery.total_amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">Taxa de Entrega:</span>
              <span className="text-gray-300">R$ {delivery.delivery_fee.toFixed(2)}</span>
            </div>
            <Separator className="bg-gray-600/30 my-1" />
            <div className="flex justify-between items-center text-sm font-medium">
              <span className="text-white">Total:</span>
              <span className="text-green-400 font-bold">R$ {delivery.final_amount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Timeline de Tracking (últimos 3 eventos) */}
        {delivery.tracking && delivery.tracking.length > 0 && (
          <>
            <Separator className="bg-gray-600/30" />
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-white font-medium">
                <Calendar className="h-4 w-4 text-purple-400" />
                Histórico Recente
              </div>
              <div className="ml-6 space-y-2 max-h-24 overflow-y-auto">
                {delivery.tracking.slice(0, 3).map((track, index) => (
                  <div key={track.id || index} className="flex items-start gap-2 text-xs">
                    <div className="flex-shrink-0 mt-0.5">
                      {getStatusIcon(track.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-300 truncate">{track.notes}</p>
                      <p className="text-gray-500">
                        {formatDate(track.created_at)} • {track.created_by_name}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Ações */}
        <div className="flex items-center gap-2 pt-2">
          {/* Botão de próximo status */}
          {getNextStatusText(delivery.delivery_status) && onUpdateStatus && (
            <Button
              size="sm"
              onClick={() => {
                const nextStatus = getNextStatus(delivery.delivery_status);
                if (nextStatus) {
                  onUpdateStatus(delivery.id, nextStatus);
                }
              }}
              disabled={isUpdating}
              className="bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200"
            >
              <ArrowRight className="h-3 w-3 mr-1" />
              {getNextStatusText(delivery.delivery_status)}
            </Button>
          )}

          {/* Status final */}
          {delivery.delivery_status === 'delivered' && (
            <Badge className="bg-green-100 text-green-700 border-green-200">
              <CheckCircle className="h-3 w-3 mr-1" />
              Entrega Concluída
            </Badge>
          )}

          {/* Botão Timeline */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsTimelineOpen(true)}
            className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
          >
            <Calendar className="h-3 w-3 mr-1" />
            Timeline
          </Button>

          {/* Botão de ver detalhes */}
          {onViewDetails && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetails(delivery.id)}
              className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
            >
              Ver Detalhes
            </Button>
          )}

          {/* Valor em destaque */}
          <div className="ml-auto flex items-center gap-1 text-sm font-medium text-yellow-400">
            <DollarSign className="h-3 w-3" />
            R$ {delivery.final_amount.toFixed(2)}
          </div>
        </div>
      </CardContent>

      {/* Modal Timeline Detalhada */}
      <Dialog open={isTimelineOpen} onOpenChange={setIsTimelineOpen}>
        <DialogContent className="max-w-2xl bg-black/95 backdrop-blur-xl border-white/20">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold text-white">
              <Calendar className="h-6 w-6 text-blue-400" />
              Timeline Detalhada - Pedido #{delivery.id.slice(-8)}
            </DialogTitle>
          </DialogHeader>
          
          <div className="max-h-[70vh] overflow-y-auto">
            <DeliveryTimeline saleId={delivery.id} />
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Atribuição de Entregador */}
      <DeliveryAssignmentModal
        isOpen={isAssignmentOpen}
        onClose={() => setIsAssignmentOpen(false)}
        saleId={delivery.id}
        currentDeliveryPersonId={delivery.delivery_person?.id}
        currentDeliveryPersonName={delivery.delivery_person?.name}
        onAssignmentComplete={() => {
          // O modal já invalida as queries necessárias
          setIsAssignmentOpen(false);
        }}
      />
    </Card>
  );
};

export default DeliveryOrderCard;