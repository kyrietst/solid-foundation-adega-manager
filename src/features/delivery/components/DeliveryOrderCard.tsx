import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/core/config/utils';
import { DeliveryOrder } from '@/features/delivery/types';
import { 
  Clock, 
  MapPin, 
  GripVertical, 
  User, 
  DollarSign,
  MessageCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardContent } from '@/shared/ui/primitives/card';
import { Button } from '@/shared/ui/primitives/button';

import DeliveryDetailsPopover from './DeliveryDetailsPopover';

interface DeliveryOrderCardProps {
  delivery: DeliveryOrder;
  onUpdateStatus?: (id: string, status: string, deliveryPersonId?: string) => void;
  onDelete?: (id: string) => void;
  onClick?: () => void;
  isOverlay?: boolean;
}

export const DeliveryOrderCard: React.FC<DeliveryOrderCardProps> = ({
  delivery,
  onUpdateStatus,
  onDelete,
  onClick,
  isOverlay = false
}) => {
  // Use useSortable instead of useDraggable
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = !isOverlay
    ? useSortable({
        id: delivery.id,
        data: delivery,
      })
    : {
        attributes: {},
        listeners: {},
        setNodeRef: undefined,
        transform: undefined,
        transition: undefined,
        isDragging: false,
      };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleUpdateStatusWrapper = (id: string, status: string) => {
      onUpdateStatus?.(id, status);
  };

  const getStatusColorClass = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'preparing': return 'bg-orange-500';
      case 'out_for_delivery': return 'bg-blue-500';
      case 'delivered': return 'bg-emerald-500';
      default: return 'bg-zinc-500';
    }
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const CardContentRender = (
    <Card 
      onClick={!isOverlay ? onClick : undefined}
      className={cn(
        "bg-[#09090b] border-white/10 overflow-hidden shadow-lg",
        !isOverlay && "hover:border-primary/50 transition-all duration-200 cursor-pointer",
        isDragging && "opacity-0", // Hide original when dragging (if using DragOverlay)
        isOverlay && "border-primary/50 shadow-2xl scale-105 rotate-2 cursor-grabbing ring-2 ring-primary" // Styling for the overlay
      )}
    >
      {/* Pipe Lateral de Status */}
      <div className={cn(
        "absolute left-0 top-0 bottom-0 w-1 transition-colors bg-opacity-80", 
        getStatusColorClass(delivery.delivery_status)
      )} />

      <CardContent className="p-3 pl-4 flex flex-col gap-2.5">
        {/* Header: Drag Handle + ID + Tempo */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-1.5">
             {/* Only show grip cursor if not overlay, but icon is fine */}
             <div {...listeners} {...attributes} className={cn("text-muted-foreground p-0.5 -ml-1 rounded transition-colors", !isOverlay && "cursor-grab active:cursor-grabbing hover:text-foreground")}>
                <GripVertical size={14} />
             </div>
             <span className="font-mono text-xs text-muted-foreground tracking-wider">
               #{delivery.id.slice(0, 8)}
             </span>
          </div>
          <span className="text-xs text-muted-foreground flex items-center gap-1 bg-muted/50 px-1.5 py-0.5 rounded">
            <Clock size={10} /> 
            {format(new Date(delivery.created_at), 'HH:mm')}
          </span>
        </div>

        {/* Cliente e Endereço */}
        <div>
          <div className="flex items-center gap-1.5 mb-1">
             <User size={14} className="text-primary shrink-0" />
             <h4 className="text-sm font-semibold text-foreground truncate leading-none">
               {delivery.customer?.name || "Cliente Balcão"}
             </h4>
          </div>
          
          {delivery.delivery_address ? (
            <div className="flex items-start gap-1.5 text-xs text-muted-foreground mt-1.5">
              <MapPin size={12} className="shrink-0 mt-0.5" />
              <span className="line-clamp-2 leading-tight">
                {delivery.delivery_address.street}, {delivery.delivery_address.number}
                {delivery.delivery_address.neighborhood && ` - ${delivery.delivery_address.neighborhood}`}
              </span>
            </div>
          ) : (
            <span className="text-xs text-muted-foreground italic ml-5">Retirada na Loja</span>
          )}
        </div>

        {/* Resumo de Itens */}
        <div className="pl-5 space-y-1">
             {delivery.items.slice(0, 3).map((item, idx) => (
               <div key={idx} className="flex items-center justify-between text-xs text-muted-foreground/80">
                  <span className="truncate">{item.quantity}x {item.product_name}</span>
               </div>
             ))}
             {delivery.items.length > 3 && (
               <div className="text-[10px] text-muted-foreground italic">+ {delivery.items.length - 3} itens...</div>
             )}
        </div>

        {/* Footer: Valor e Ações */}
        <div className="pt-2 mt-1 border-t border-border/50 flex items-center justify-between">
           <div className="flex items-center gap-1 text-emerald-500 font-bold text-sm">
              <DollarSign size={14} />
              {formatCurrency(delivery.final_amount)}
           </div>

           <div className="flex gap-1" onPointerDown={(e) => e.stopPropagation()}>
              {delivery.customer?.phone && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-green-500 hover:bg-green-500/10"
                  onClick={(e) => {
                      if (isOverlay) return;
                      // e.stopPropagation() is already on parent div
                      window.open(`https://wa.me/55${delivery.customer!.phone.replace(/\D/g, '')}`, '_blank')
                  }}
                >
                  <MessageCircle size={16} />
                </Button>
              )}
           </div>
        </div>
      </CardContent>
    </Card>
  );

  if (isOverlay) {
      return (
         <div className="relative cursor-grabbing z-50">
             {CardContentRender}
         </div>
      );
  }

  return (
    <div ref={setNodeRef} style={style} className={cn("group relative")}>
      <DeliveryDetailsPopover delivery={delivery} onUpdateStatus={handleUpdateStatusWrapper}>
          {CardContentRender}
      </DeliveryDetailsPopover>
    </div>
  );
};

export default DeliveryOrderCard;