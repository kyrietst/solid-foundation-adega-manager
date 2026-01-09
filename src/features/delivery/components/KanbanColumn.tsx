import React, { useMemo } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { cn } from '@/core/config/utils';
import DeliveryOrderCard from './DeliveryOrderCard';
import type { DeliveryOrder } from '@/features/delivery/types';
import { Package } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/shared/ui/primitives/card';
import { Badge } from '@/shared/ui/primitives/badge';

interface KanbanColumnProps {
  title: string;
  status: 'pending' | 'preparing' | 'out_for_delivery' | 'delivered';
  deliveries: DeliveryOrder[];
  onUpdateStatus: (saleId: string, newStatus: string, deliveryPersonId?: string) => void;
  onDelete?: (saleId: string) => void;
  isUpdating?: boolean;
  color?: 'yellow' | 'orange' | 'blue' | 'green';
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({
  title,
  status,
  deliveries,
  onUpdateStatus,
  onDelete,
  isUpdating = false,
  color = 'yellow'
}) => {
  const { isOver, setNodeRef } = useDroppable({
    id: status,
  });

  const deliveryIds = useMemo(() => deliveries.map(d => d.id), [deliveries]);

  return (
    <Card 
      ref={setNodeRef}
      className={cn(
        "flex flex-col h-full shadow-sm transition-all rounded-2xl",
        isOver && "ring-2 ring-primary/50 border-primary shadow-lg scale-[1.01]",
        isUpdating && "opacity-50 pointer-events-none"
      )}
      style={{
        backgroundColor: isOver ? '#27272a' : '#18181b', // zinc-800 : zinc-900
        borderWidth: '2px',
        borderStyle: 'dashed',
        borderColor: isOver ? '#eab308' : '#3f3f46', // primary : zinc-700
      }}
    >
      <CardHeader className="p-3 pb-2 flex-row items-center justify-between space-y-0 sticky top-0 bg-zinc-900/40 backdrop-blur-sm z-10 border-b border-border/40 rounded-t-xl">
        <h3 className="font-bold text-sm text-zinc-100 uppercase tracking-wide flex items-center gap-2">
          <span className={cn("w-2 h-2 rounded-full", 
            color === 'yellow' && "bg-yellow-500",
            color === 'orange' && "bg-orange-500",
            color === 'blue' && "bg-blue-500",
            color === 'green' && "bg-emerald-500"
          )} />
          {title}
        </h3>
        <Badge variant="secondary" className="px-3 py-0.5 rounded-full text-xs font-medium bg-white/10 text-white border-none hover:bg-white/20">
          {deliveries.length}
        </Badge>
      </CardHeader>

      <CardContent className="flex-1 p-2 overflow-y-auto space-y-2 custom-scrollbar min-h-0">
        <SortableContext items={deliveryIds} strategy={verticalListSortingStrategy}>
          {deliveries.length === 0 ? (
            <div className="h-full min-h-[120px] flex flex-col items-center justify-center text-muted-foreground/40 gap-2 border-2 border-dashed border-muted rounded-lg m-1">
               <Package className="w-8 h-8 opacity-20" />
               <span className="text-xs font-medium uppercase tracking-wider opacity-50">Vazio</span>
            </div>
          ) : (
            deliveries.map((delivery) => (
              <DeliveryOrderCard
                key={delivery.id}
                delivery={delivery}
                onUpdateStatus={onUpdateStatus}
                onDelete={onDelete}
              />
            ))
          )}
        </SortableContext>
      </CardContent>
    </Card>
  );
};

export default KanbanColumn;
