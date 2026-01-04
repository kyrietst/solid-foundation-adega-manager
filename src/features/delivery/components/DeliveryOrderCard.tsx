/**
 * @fileoverview Card componente para exibir pedidos de delivery completos
 * Exibe informações detalhadas incluindo customer, items, tracking e status
 * 
 * @author Adega Manager Team
 * @version 1.0.0
 */

import React, { useState, useCallback, useMemo } from 'react';
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
  ArrowRight,
  Map,
  MessageCircle,
  Trash2
} from 'lucide-react';
import { cn } from '@/core/config/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { DeliveryOrder } from '@/features/delivery/hooks/useDeliveryOrders';
import { DeliveryTimeline } from './DeliveryTimeline';
import { DeliveryAssignmentModal } from './DeliveryAssignmentModal';
import { formatDeliveryAddress, formatPhoneForWhatsApp } from '@/shared/utils/addressHelpers';

interface DeliveryOrderCardProps {
  delivery: DeliveryOrder;
  onUpdateStatus?: (saleId: string, newStatus: string, deliveryPersonId?: string) => void;
  onViewDetails?: (saleId: string) => void;
  onDelete?: (saleId: string) => void;
  isUpdating?: boolean;
  className?: string;
}

export const DeliveryOrderCard = React.memo(({
  delivery,
  onUpdateStatus,
  onViewDetails,
  onDelete,
  isUpdating = false,
  className
}: DeliveryOrderCardProps) => {
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);
  const [isAssignmentOpen, setIsAssignmentOpen] = useState(false);

  // ✅ Context7 Pattern: Memoizar funções utilitárias
  const getStatusIcon = useCallback((status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-yellow-400" />;
      case 'preparing': return <Package className="h-4 w-4 text-orange-400" />;
      case 'out_for_delivery': return 'Em Trânsito';
      case 'delivered': return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'cancelled': return <AlertCircle className="h-4 w-4 text-red-400" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  }, []);

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40';
      case 'preparing': return 'bg-orange-500/20 text-orange-300 border-orange-500/40';
      case 'out_for_delivery': return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'delivered': return 'bg-green-500/20 text-green-300 border-green-500/40';
      case 'cancelled': return 'bg-red-500/20 text-red-300 border-red-500/40';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/40';
    }
  }, []);

  const getStatusText = useCallback((status: string) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'preparing': return 'Preparando';
      case 'out_for_delivery': return 'Em Rota de Entrega';
      case 'delivered': return 'Entregue';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  }, []);

  const getNextStatus = useCallback((currentStatus: string) => {
    switch (currentStatus) {
      case 'pending': return 'preparing';
      case 'preparing': return 'out_for_delivery';
      case 'out_for_delivery': return 'delivered';
      default: return null;
    }
  }, []);

  const getNextStatusText = useCallback((currentStatus: string) => {
    const nextStatus = getNextStatus(currentStatus);
    if (!nextStatus) return null;

    switch (nextStatus) {
      case 'preparing': return 'Preparar';
      case 'out_for_delivery': return 'Iniciar Entrega';
      case 'delivered': return 'Marcar Entregue';
      default: return null;
    }
  }, [getNextStatus]);

  const getActionButtonColor = useCallback((currentStatus: string) => {
    const nextStatus = getNextStatus(currentStatus);
    switch (nextStatus) {
      case 'preparing':
        return 'bg-yellow-600 hover:bg-yellow-700 hover:shadow-yellow-500/25';
      case 'out_for_delivery':
        return 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-500/25';
      case 'delivered':
        return 'bg-green-600 hover:bg-green-700 hover:shadow-green-500/25';
      default:
        return 'bg-gray-600 hover:bg-black/40';
    }
  }, [getNextStatus]);

  // Usar helper defensivo para lidar com formatos inconsistentes
  const formatAddress = useCallback((address: any) => {
    return formatDeliveryAddress(address);
  }, []);

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

  const formatCurrency = useCallback((value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value), []);

  // ✅ Context7 Pattern: Memoizar event handlers para evitar re-criação
  const handleOpenAssignment = useCallback(() => {
    setIsAssignmentOpen(true);
  }, []);

  const handleOpenTimeline = useCallback(() => {
    setIsTimelineOpen(true);
  }, []);

  const handleCloseTimeline = useCallback(() => {
    setIsTimelineOpen(false);
  }, []);

  const handleCloseAssignment = useCallback(() => {
    setIsAssignmentOpen(false);
  }, []);

  const handleAssignmentComplete = useCallback(() => {
    setIsAssignmentOpen(false);
  }, []);

  const handleViewDetails = useCallback(() => {
    if (onViewDetails) {
      onViewDetails(delivery.id);
    }
  }, [onViewDetails, delivery.id]);

  const handleUpdateStatus = useCallback(() => {
    if (onUpdateStatus) {
      const nextStatus = getNextStatus(delivery.delivery_status);
      if (nextStatus) {
        onUpdateStatus(delivery.id, nextStatus);
      }
    }
  }, [onUpdateStatus, delivery.id, delivery.delivery_status, getNextStatus]);

  return (
    <Card className={cn(
      "bg-black/80 backdrop-blur-xl border border-white/10 shadow-lg rounded-xl transition-all duration-300",
      "hover:border-white/20 hover:shadow-xl",
      className
    )}>
      {/* Header do Card */}
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-400/40">
              <Truck className="h-5 w-5 text-yellow-400" />
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
              <div className="flex items-center gap-3 text-gray-400 text-sm">
                <div className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  <span>{delivery.customer.phone}</span>
                </div>
                <a
                  href={`https://wa.me/${formatPhoneForWhatsApp(delivery.customer.phone)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-green-400 hover:text-green-300 transition-colors"
                  title="Abrir WhatsApp"
                >
                  <MessageCircle className="h-3 w-3" />
                  <span className="text-xs">WhatsApp</span>
                </a>
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
          <div className="ml-6 space-y-2">
            <p className="text-gray-200 text-sm font-medium">
              {formatAddress(delivery.delivery_address)}
            </p>
            {delivery.delivery_instructions && (
              <div className="flex items-start gap-2 text-gray-400 text-sm">
                <FileText className="h-3 w-3 mt-0.5 flex-shrink-0" />
                <span>{delivery.delivery_instructions}</span>
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const addressText = formatAddress(delivery.delivery_address);
                const encoded = encodeURIComponent(addressText);
                window.open(`https://www.google.com/maps/search/?api=1&query=${encoded}`, '_blank');
              }}
              className="border-green-400/50 text-green-400 hover:bg-green-400/10 hover:border-green-400"
            >
              <Map className="h-3 w-3 mr-1" />
              Abrir no Maps
            </Button>
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
              Entregador / Agente Logístico
            </div>
            <div className="ml-6 flex items-center gap-2">
              <p className="text-gray-300 text-sm flex-1">
                {delivery.delivery_person?.name || 'Não atribuído'}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenAssignment}
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
                  {formatCurrency(item.subtotal)}
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
              <span className="text-gray-300">{formatCurrency(delivery.total_amount)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">Taxa de Entrega:</span>
              <span className="text-gray-300">{formatCurrency(delivery.delivery_fee)}</span>
            </div>
            <Separator className="bg-gray-600/30 my-1" />
            <div className="flex justify-between items-center text-sm font-medium">
              <span className="text-white">Total:</span>
              <span className="text-green-400 font-bold text-lg">{formatCurrency(delivery.final_amount)}</span>
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
              onClick={handleUpdateStatus}
              disabled={isUpdating}
              className={cn(
                "transition-all duration-300 text-white font-medium hover:scale-105 shadow-lg",
                isUpdating
                  ? "bg-gray-500 cursor-not-allowed opacity-75"
                  : getActionButtonColor(delivery.delivery_status)
              )}
            >
              {isUpdating ? (
                <>
                  <div className="h-3 w-3 mr-1 animate-spin rounded-full border border-white/30 border-t-white" />
                  Atualizando...
                </>
              ) : (
                <>
                  <ArrowRight className="h-3 w-3 mr-1" />
                  {getNextStatusText(delivery.delivery_status)}
                </>
              )}
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
            onClick={handleOpenTimeline}
            className="border-white/10 text-gray-300 hover:bg-black/40 hover:text-white"
          >
            <Calendar className="h-3 w-3 mr-1" />
            Timeline
          </Button>

          {/* Botão de ver detalhes */}
          {onViewDetails && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewDetails}
              className="border-white/10 text-gray-300 hover:bg-black/40 hover:text-white"
            >
              Ver Detalhes
            </Button>
          )}

          {/* Botão de deletar */}
          {onDelete && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (window.confirm(`Tem certeza que deseja excluir o pedido #${delivery.id.slice(-8)}?`)) {
                  onDelete(delivery.id);
                }
              }}
              className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      </CardContent>

      {/* Modal Timeline Detalhada */}
      <Dialog open={isTimelineOpen} onOpenChange={handleCloseTimeline}>
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
        onClose={handleCloseAssignment}
        saleId={delivery.id}
        currentDeliveryPersonId={delivery.delivery_person?.id}
        currentDeliveryPersonName={delivery.delivery_person?.name}
        onAssignmentComplete={handleAssignmentComplete}
      />
    </Card>
  );
});

export default DeliveryOrderCard;