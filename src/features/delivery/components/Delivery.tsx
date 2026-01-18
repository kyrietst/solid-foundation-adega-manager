
import React, { useState, useMemo } from 'react';
import { Button } from '@/shared/ui/primitives/button';
import { cn } from '@/core/config/utils';
import { RefreshCw } from 'lucide-react';
import { PremiumBackground } from '@/shared/ui/composite/PremiumBackground';
import { useToast } from '@/shared/hooks/common/use-toast';
import { PageHeader } from '@/shared/ui/composite/PageHeader';
// Removing StandardPageHeader import if I'm replacing it.
import { StandardPageHeader } from '@/shared/ui/composite/StandardPageHeader';
import { useDeliveryOrders, useUpdateDeliveryStatus } from '@/features/delivery/hooks/useDeliveryOrders';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';
import DeliveryStatsGrid from './DeliveryStatsGrid';
import KanbanColumn from '@/features/delivery/components/KanbanColumn';
import NotificationCenter from './NotificationCenter';
import { DeliveryOrder } from '@/features/delivery/types';
import {
  DndContext,
  DragOverlay, // import DragOverlay
  DragStartEvent, // import DragStartEvent
  DragEndEvent,
  DragOverEvent, // import DragOverEvent
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import DeliveryOrderCard from './DeliveryOrderCard'; // import the card

const Delivery = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Hooks para dados reais
  // Day View: Filtrar apenas pedidos criados hoje (00:00:00)
  const startOfToday = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);

  const { data: serverDeliveries = [], isLoading: isLoadingDeliveries, refetch } = useDeliveryOrders({
    createdAfter: startOfToday
  });
  const updateDeliveryStatus = useUpdateDeliveryStatus();

  const [searchTerm, setSearchTerm] = useState('');
  const [activeId, setActiveId] = useState<string | null>(null); // State for active drag item

  // Local state for optimistic updates and smooth dragging
  const [deliveries, setDeliveries] = useState<DeliveryOrder[]>([]);

  // Sync server data to local state when not dragging
  // This ensures we always have the latest data but don't overwrite optimistic updates instantly during drag
  // IMPORTANT: We do NOT depend on 'activeId' here to prevent "snap-back" when drag ends.
  // We only sync when SERVER data actually changes.
  React.useEffect(() => {
    if (!activeId) {
      setDeliveries(serverDeliveries);
    }
  }, [serverDeliveries]);


  // Configurar sensores do DnD (Touch + Mouse)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Filtro de busca (using local deliveries state)
  const filteredDeliveries = useMemo(() => {
    // If we are loading initial data and have nothing locally yet
    if (isLoadingDeliveries && deliveries.length === 0) return [];

    const term = searchTerm.trim().toLowerCase();
    if (!term) return deliveries;

    return deliveries.filter(d =>
      d.customer?.name.toLowerCase().includes(term) ||
      (d.delivery_address?.street || '').toLowerCase().includes(term) ||
      (d.delivery_person?.name || '').toLowerCase().includes(term) ||
      String(d.id.slice(-8)).includes(term)
    );
  }, [deliveries, searchTerm, isLoadingDeliveries]);

  // Função auxiliar para verificar se foi entregue hoje
  const isDeliveredToday = (delivery: any) => {
    if (delivery.delivery_status !== 'delivered' || !delivery.delivery_completed_at) {
      return false;
    }

    const completedDate = new Date(delivery.delivery_completed_at);
    const today = new Date();

    return (
      completedDate.getDate() === today.getDate() &&
      completedDate.getMonth() === today.getMonth() &&
      completedDate.getFullYear() === today.getFullYear()
    );
  };

  // Separar deliveries por coluna Kanban
  const kanbanColumns = useMemo(() => {
    // Helper to sort by date
    const sortByDate = (a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime();

    return {
      pending: filteredDeliveries
        .filter(d => d.delivery_status === 'pending')
        .sort(sortByDate),

      preparing: filteredDeliveries
        .filter(d => d.delivery_status === 'preparing')
        .sort(sortByDate),

      out_for_delivery: filteredDeliveries
        .filter(d => d.delivery_status === 'out_for_delivery')
        .sort(sortByDate),

      delivered_today: filteredDeliveries
        .filter(d => isDeliveredToday(d))
        .sort((a, b) => new Date(b.delivery_completed_at || b.updated_at).getTime() - new Date(a.delivery_completed_at || a.updated_at).getTime()) // Mais recentes primeiro
    };
  }, [filteredDeliveries]);

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      'pending': 'Pendente',
      'preparing': 'Preparando',
      'out_for_delivery': 'Em Trânsito',
      'delivered': 'Entregue',
      'cancelled': 'Cancelado'
    };
    return statusMap[status] || status;
  };

  const handleUpdateStatus = async (saleId: string, newStatus: string, deliveryPersonId?: string) => {
    try {
      await updateDeliveryStatus.mutateAsync({
        saleId,
        newStatus,
        notes: `Status alterado para ${getStatusText(newStatus)}`,
        deliveryPersonId
      });
      // Recarregar os dados acontece automaticamente por invalidation no hook
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast({
        title: "Erro ao atualizar status",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
      // Revert verification if needed, but react-query usually handles this by refetching
      refetch();
    }
  };

  // handleDragStart
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  // handleDragOver - Optimistic UI update
  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id; // Can be a container ID or an item ID

    // Find the current active item in local state
    const activeItem = deliveries.find(d => d.id === activeId);
    if (!activeItem) return;

    // Determine target container (status)
    // If overId is one of the container IDs (pending, preparing, etc), use it.
    // If overId is an item ID, find that item's status.
    let overStatus = '';
    const validStatuses = ['pending', 'preparing', 'out_for_delivery', 'delivered'];

    if (validStatuses.includes(overId as string)) {
      overStatus = overId as string;
    } else {
      const overItem = deliveries.find(d => d.id === overId);
      if (overItem) {
        overStatus = overItem.delivery_status;
      }
    }

    if (!overStatus) return; // Dropped over nothing valid

    // If status is different, update the item's status in local state
    if (activeItem.delivery_status !== overStatus) {
      setDeliveries((items) => {
        return items.map(item => {
          if (item.id === activeId) {
            return {
              ...item,
              delivery_status: overStatus as DeliveryOrder['delivery_status']
            };
          }
          return item;
        });
      });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    // If dragged over invalid area, local state will be reset by useEffect
    if (!over) return;

    const deliveryId = active.id as string;
    const activeItem = deliveries.find(d => d.id === deliveryId);

    // Determine final status similarly
    let newStatus = '';
    const validStatuses = ['pending', 'preparing', 'out_for_delivery', 'delivered'];
    if (validStatuses.includes(over.id as string)) {
      newStatus = over.id as string;
    } else {
      const overItem = deliveries.find(d => d.id === over.id);
      if (overItem) newStatus = overItem.delivery_status;
    }

    // Call API if changed
    // Note: Local state might already have the new status due to DragOver,
    // so we compare against the *original* server status or just check if the logic implies a change.
    // However, since handleDragOver mutates 'deliveries', activeItem.delivery_status might be the *new* status.
    // We should rely on checking if the update is necessary based on the *intended* move vs server reality.
    // Simpler: Just convert standard drag end logic.

    // Actually, since DragOver already updated the status visually, 
    // we assume the user intends this final state.
    // But we need to ensure the API call happens.

    // Find the original status from Server Data to verify change
    const originalItem = serverDeliveries.find(d => d.id === deliveryId);
    if (originalItem && originalItem.delivery_status !== newStatus && newStatus) {
      handleUpdateStatus(deliveryId, newStatus);
    } else {
      // If no change, force sync local state back to server state to ensure order is correct
      setDeliveries(serverDeliveries);
    }
  };

  // Find active delivery for overlay
  const activeDelivery = useMemo(() => {
    if (!activeId) return null;
    return deliveries.find(d => d.id === activeId);
  }, [activeId, deliveries]);

  // Calculate metrics
  const metrics = useMemo(() => {
    if (!deliveries.length) return null;

    // Logic to calculate metrics based on deliveries
    const totalOrders = deliveries.length;
    const delivered = deliveries.filter(d => d.delivery_status === 'delivered');
    const totalRevenue = delivered.reduce((acc, curr) => acc + (curr.final_amount || 0), 0);

    return {
      totalOrders: deliveries.length,
      totalRevenue: totalRevenue,
      pendingOrders: deliveries.filter(d => d.delivery_status === 'pending').length,
      inTransitOrders: deliveries.filter(d => d.delivery_status === 'out_for_delivery').length,
      deliveredOrders: delivered.length,
      cancelledOrders: deliveries.filter(d => d.delivery_status === 'cancelled').length,
      totalDeliveryFees: 0,
      avgDeliveryTime: 0,
      onTimeRate: 0,
      avgOrderValue: 0,
      avgTicketWithDelivery: 0,
      deliveryFeeRevenue: 0,
      revenueGrowthRate: 0,
      topZoneRevenue: null
    };
  }, [deliveries]);

  // Função para deletar pedido usando RPC (contorna políticas RLS inconsistentes)
  const handleDeleteOrder = async (saleId: string) => {
    try {


      // Usar RPC com SECURITY DEFINER para contornar políticas RLS
      const { data, error } = await supabase
        .rpc('delete_sale_cascade' as any, {
          sale_uuid: saleId
        });

      if (error) {
        console.error('❌ Erro RPC delete_sale_cascade:', error);

        // Mensagens específicas
        if (error.message?.includes('Sem permissão')) {
          throw new Error('Sem permissão. Apenas Admin/Employee podem excluir pedidos.');
        }

        throw new Error(`Erro ao deletar pedido: ${error.message}`);
      }

      // Tipagem do retorno da RPC (definida localmente pois pode não estar no gerado ainda)
      interface DeleteSaleResult {
        sale_items: number;
        inventory_movements: number;
      }

      const result = data as unknown as DeleteSaleResult;

      toast({
        title: "✅ Pedido excluído!",
        description: `Removidos: ${result.sale_items} itens, ${result.inventory_movements} movimentos de estoque.`,
      });

      // Limpar cache e atualizar lista
      queryClient.invalidateQueries({ queryKey: ['delivery-orders'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-movements'] });
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      refetch();

    } catch (error) {
      console.error('Erro ao deletar pedido:', error);
      toast({
        title: "❌ Erro ao excluir pedido",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col relative z-10 selection:bg-primary selection:text-black font-display overflow-hidden">
      {/* ... header ... */}
      <PremiumBackground />
      <header className="flex-none px-8 py-6 pt-8 pb-6 z-10 w-full">
        <div className="flex flex-wrap justify-between items-end gap-4 mb-12">
          <div className="flex flex-col gap-1">
            <p className="text-zinc-500 text-sm font-medium tracking-widest uppercase">Módulo de Logística</p>
            <h2 className="text-white text-3xl md:text-4xl font-bold leading-tight tracking-tight">CONTROLE DE ENTREGAS</h2>
          </div>
          <div className="flex gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-700/50 text-xs text-zinc-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Sistema Online
            </div>
            <Button
              onClick={() => {
                toast({ title: "Atualizando...", description: "Sincronizando dados.." });
                refetch();
              }}
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-xl bg-zinc-900 border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <DeliveryStatsGrid metrics={metrics} />
      </header>

      <main className="flex-1 overflow-hidden px-8 pb-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-4 gap-4 h-[calc(100vh-16rem)] min-w-[1024px] overflow-x-auto snap-x snap-mandatory pb-2">
            {/* Columns... */}
            {/* 1. Pending */}
            <div className="snap-center h-full">
              <KanbanColumn
                title="Pendente"
                status="pending"
                color="yellow"
                deliveries={kanbanColumns.pending}
                onUpdateStatus={handleUpdateStatus}
                onDelete={handleDeleteOrder}
              />
            </div>

            {/* 2. Preparing */}
            <div className="snap-center h-full">
              <KanbanColumn
                title="Preparando"
                status="preparing"
                color="orange"
                deliveries={kanbanColumns.preparing}
                onUpdateStatus={handleUpdateStatus}
                onDelete={handleDeleteOrder}
              />
            </div>

            {/* 3. Out For Delivery */}
            <div className="snap-center h-full">
              <KanbanColumn
                title="Em Rota"
                status="out_for_delivery"
                color="blue"
                deliveries={kanbanColumns.out_for_delivery}
                onUpdateStatus={handleUpdateStatus}
                onDelete={handleDeleteOrder}
              />
            </div>

            {/* 4. Delivered */}
            <div className="snap-center h-full">
              <KanbanColumn
                title="Entregue"
                status="delivered"
                color="green"
                deliveries={kanbanColumns.delivered_today}
                onUpdateStatus={handleUpdateStatus}
                onDelete={handleDeleteOrder}
              />
            </div>
          </div>

          <DragOverlay>
            {activeDelivery ? (
              <DeliveryOrderCard
                delivery={activeDelivery}
                isOverlay
              // No handlers needed for overlay visual
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      </main>
    </div>
  );
};

export default Delivery;
