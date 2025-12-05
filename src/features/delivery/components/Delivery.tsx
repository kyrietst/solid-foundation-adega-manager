
import React, { useState, useMemo } from 'react';
import { Button } from '@/shared/ui/primitives/button';
import { cn } from '@/core/config/utils';
import { RefreshCw } from 'lucide-react';
import { SearchBar21st } from '@/shared/ui/thirdparty/search-bar-21st';
import { useToast } from '@/shared/hooks/common/use-toast';
import { PageHeader } from '@/shared/ui/composite/PageHeader';
import { useDeliveryOrders, useUpdateDeliveryStatus } from '@/features/delivery/hooks/useDeliveryOrders';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';
import DeliveryStatsGrid from './DeliveryStatsGrid';
import KanbanColumn from './KanbanColumn';
import NotificationCenter from './NotificationCenter';

const Delivery = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Hooks para dados reais
  const { data: deliveries = [], isLoading: isLoadingDeliveries, refetch } = useDeliveryOrders();
  const updateDeliveryStatus = useUpdateDeliveryStatus();

  const [searchTerm, setSearchTerm] = useState('');

  // Filtro de busca
  const filteredDeliveries = useMemo(() => {
    if (isLoadingDeliveries) return [];

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
    return {
      pending: filteredDeliveries
        .filter(d => d.delivery_status === 'pending')
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()), // Mais antigos primeiro

      preparing: filteredDeliveries
        .filter(d => d.delivery_status === 'preparing')
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()),

      out_for_delivery: filteredDeliveries
        .filter(d => d.delivery_status === 'out_for_delivery')
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()),

      delivered_today: filteredDeliveries
        .filter(d => isDeliveredToday(d))
        .sort((a, b) => new Date(b.delivery_completed_at || b.updated_at).getTime() - new Date(a.delivery_completed_at || a.updated_at).getTime()) // Mais recentes primeiro (topo)
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

      // Atualizar dados
      refetch();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast({
        title: "Erro ao atualizar status",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    }
  };

  const totalActiveDeliveries = kanbanColumns.pending.length +
    kanbanColumns.preparing.length +
    kanbanColumns.out_for_delivery.length;

  // Função de hard refresh para limpar cache fantasma
  const handleHardRefresh = async () => {
    try {
      // Invalidar TODAS as queries de delivery
      await queryClient.invalidateQueries({ queryKey: ['delivery-orders'], exact: false });
      await queryClient.invalidateQueries({ queryKey: ['delivery-metrics'], exact: false });

      // Remover dados antigos do cache completamente
      queryClient.removeQueries({ queryKey: ['delivery-orders'], exact: false });

      // Buscar dados frescos do banco
      await refetch();

      toast({
        title: "✅ Cache limpo!",
        description: "Dados atualizados do banco de dados.",
      });
    } catch (error) {
      console.error('Erro ao atualizar:', error);
      toast({
        title: "Erro ao atualizar",
        description: "Ocorreu um erro ao buscar dados atualizados.",
        variant: "destructive",
      });
    }
  };

  // Função para deletar pedido (com itens relacionados)
  const handleDeleteOrder = async (saleId: string) => {
    try {
      // 1. Deletar itens da venda primeiro (foreign key)
      const { error: itemsError } = await supabase
        .from('sale_items')
        .delete()
        .eq('sale_id', saleId);

      if (itemsError) {
        console.error('Erro ao deletar sale_items:', itemsError);
        throw new Error('Erro ao deletar itens do pedido: ' + itemsError.message);
      }

      // 2. Deletar registros de tracking
      const { error: trackingError } = await supabase
        .from('delivery_tracking')
        .delete()
        .eq('sale_id', saleId);

      if (trackingError) {
        console.error('Erro ao deletar delivery_tracking:', trackingError);
        // Não falha se não tiver tracking
      }

      // 3. Deletar a venda
      const { error: saleError } = await supabase
        .from('sales')
        .delete()
        .eq('id', saleId);

      if (saleError) {
        console.error('Erro ao deletar sale:', saleError);

        // Mensagem específica para erro de permissão
        if (saleError.code === 'PGRST301' || saleError.message.includes('policy')) {
          throw new Error('Sem permissão para deletar. Apenas Admin/Employee podem excluir pedidos.');
        }

        throw new Error('Erro ao deletar pedido: ' + saleError.message);
      }

      toast({
        title: "✅ Pedido excluído!",
        description: "O pedido e seus itens foram removidos com sucesso.",
      });

      // Limpar cache e atualizar lista
      queryClient.invalidateQueries({ queryKey: ['delivery-orders'] });
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
    <div className="w-full min-h-screen flex flex-col">
      {/* Header - altura fixa */}
      <PageHeader
        title="CONTROLE DE ENTREGAS"
        count={totalActiveDeliveries}
        countLabel="ativas"
      >
        {/* Controles */}
        <div className="flex items-center gap-4">
          <NotificationCenter />
          <Button
            onClick={handleHardRefresh}
            disabled={isLoadingDeliveries}
            className="bg-yellow-600 hover:bg-yellow-700 text-white font-medium group relative overflow-hidden"
          >
            <RefreshCw className={cn(
              "h-4 w-4 mr-2 relative z-10 transition-transform duration-300",
              isLoadingDeliveries && "animate-spin"
            )} />
            <span className="relative z-10 font-medium">
              {isLoadingDeliveries ? 'Atualizando...' : 'Atualizar'}
            </span>
          </Button>
        </div>
      </PageHeader>

      {/* Container principal - expande com conteúdo */}
      <div className="flex-1 bg-black/80 backdrop-blur-sm border border-white/10 rounded-xl shadow-lg p-6 flex flex-col hover:shadow-2xl hover:shadow-purple-500/10 hover:border-purple-400/30 transition-all duration-300 space-y-6 relative">
        {/* Stats Grid - KPIs operacionais do dia */}
        <DeliveryStatsGrid
          deliveries={deliveries}
          isLoading={isLoadingDeliveries}
        />

        {/* Barra de busca */}
        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="flex-1">
            <SearchBar21st
              placeholder="Buscar por cliente, endereço, entregador..."
              value={searchTerm}
              onChange={setSearchTerm}
              debounceMs={300}
              disableResizeAnimation={true}
            />
          </div>
        </div>

        {/* Grid Kanban - 4 Colunas */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {/* Coluna 1: A Fazer */}
          <KanbanColumn
            title="A Fazer"
            status="pending"
            deliveries={kanbanColumns.pending}
            onUpdateStatus={handleUpdateStatus}
            onDelete={handleDeleteOrder}
            isUpdating={updateDeliveryStatus.isPending}
            color="yellow"
          />

          {/* Coluna 2: Em Preparo */}
          <KanbanColumn
            title="Em Preparo"
            status="preparing"
            deliveries={kanbanColumns.preparing}
            onUpdateStatus={handleUpdateStatus}
            onDelete={handleDeleteOrder}
            isUpdating={updateDeliveryStatus.isPending}
            color="orange"
          />

          {/* Coluna 3: Em Rota */}
          <KanbanColumn
            title="Em Rota"
            status="out_for_delivery"
            deliveries={kanbanColumns.out_for_delivery}
            onUpdateStatus={handleUpdateStatus}
            onDelete={handleDeleteOrder}
            isUpdating={updateDeliveryStatus.isPending}
            color="blue"
          />

          {/* Coluna 4: Concluído (Hoje) */}
          <KanbanColumn
            title="Concluído (Hoje)"
            status="delivered"
            deliveries={kanbanColumns.delivered_today}
            onUpdateStatus={handleUpdateStatus}
            onDelete={handleDeleteOrder}
            isUpdating={updateDeliveryStatus.isPending}
            color="green"
          />
        </div>
      </div>
    </div>
  );
};

export default Delivery;
