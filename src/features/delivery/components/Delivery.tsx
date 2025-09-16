
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { Button } from '@/shared/ui/primitives/button';
import { cn } from '@/core/config/utils';
import { getSFProTextClasses } from '@/core/config/theme-utils';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from '@/shared/ui/primitives/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/primitives/tabs';
import { SearchBar21st } from '@/shared/ui/thirdparty/search-bar-21st';
import { ArrowUpDown, ArrowUp, ArrowDown, RefreshCw, MapPin, BarChart3 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/primitives/select';
import { Truck, Clock, CheckCircle, AlertCircle, User, DollarSign } from 'lucide-react';
import { useToast } from '@/shared/hooks/common/use-toast';
import { BlurIn } from '@/shared/ui/effects/blur-in';
import { useDeliveryOrders, useDeliveryMetrics, useUpdateDeliveryStatus } from '@/features/delivery/hooks/useDeliveryOrders';
import DeliveryOrderCard from './DeliveryOrderCard';
import NotificationCenter from './NotificationCenter';
import DeliveryAnalytics from './DeliveryAnalytics';

const Delivery = () => {
  const { toast } = useToast();
  
  // Hooks para dados reais
  const { data: deliveries = [], isLoading: isLoadingDeliveries, refetch } = useDeliveryOrders();
  const { data: metrics, isLoading: isLoadingMetrics } = useDeliveryMetrics(7);
  const updateDeliveryStatus = useUpdateDeliveryStatus();

  const [activeTab, setActiveTab] = useState('deliveries');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<'created_at' | 'customer' | 'final_amount' | 'delivery_status'>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const dataset = React.useMemo(() => {
    if (isLoadingDeliveries) return [];
    
    const term = searchTerm.trim().toLowerCase();
    let rows = deliveries;

    // Filtro por busca
    if (term) {
      rows = rows.filter(d =>
        d.customer?.name.toLowerCase().includes(term) ||
        (d.delivery_address?.street || '').toLowerCase().includes(term) ||
        (d.delivery_person?.name || '').toLowerCase().includes(term) ||
        String(d.id.slice(-8)).includes(term)
      );
    }

    // Filtro por status
    if (statusFilter && statusFilter !== 'all') {
      rows = rows.filter(d => d.delivery_status === statusFilter);
    }
      
    // Ordenação
    if (sortField) {
      rows = [...rows].sort((a, b) => {
        let av: any, bv: any;
        
        switch (sortField) {
          case 'created_at':
            av = new Date(a.created_at).getTime();
            bv = new Date(b.created_at).getTime();
            break;
          case 'customer':
            av = a.customer?.name || '';
            bv = b.customer?.name || '';
            break;
          case 'final_amount':
            av = a.final_amount || 0;
            bv = b.final_amount || 0;
            break;
          case 'delivery_status':
            av = a.delivery_status;
            bv = b.delivery_status;
            break;
          default:
            av = '';
            bv = '';
        }
        
        if (typeof av === 'number' && typeof bv === 'number') {
          return sortDirection === 'asc' ? av - bv : bv - av;
        }
        return sortDirection === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
      });
    }
    return rows;
  }, [deliveries, searchTerm, statusFilter, sortField, sortDirection, isLoadingDeliveries]);

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDirection('asc'); }
  };

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
    }
  };


  const getDeliveryStats = () => {
    // Debug: Log dos dados para identificar problema
    console.log('🔍 Debug - Delivery Stats:', {
      isLoadingMetrics,
      metrics,
      deliveriesLength: deliveries.length,
      sampleDelivery: deliveries[0] // Log da primeira entrega para ver estrutura
    });

    // SEMPRE usar dados reais dos deliveries para garantir precisão
    const totalDeliveries = deliveries.length;
    const pendingCount = deliveries.filter(d => d.delivery_status === 'pending').length;
    const inTransitCount = deliveries.filter(d => d.delivery_status === 'out_for_delivery').length;
    const deliveredCount = deliveries.filter(d => d.delivery_status === 'delivered').length;
    
    // Calcular receita total e taxas
    const totalRevenue = deliveries.reduce((sum, d) => {
      const finalAmount = parseFloat(String(d.final_amount || 0));
      return sum + (isNaN(finalAmount) ? 0 : finalAmount);
    }, 0);
    
    const totalDeliveryFees = deliveries.reduce((sum, d) => {
      const deliveryFee = parseFloat(String(d.delivery_fee || 0));
      return sum + (isNaN(deliveryFee) ? 0 : deliveryFee);
    }, 0);
    
    const avgTicket = totalDeliveries > 0 ? totalRevenue / totalDeliveries : 0;
    
    // Calcular crescimento (comparar com métricas se disponível)
    let growthRate = 0;
    if (metrics && metrics.revenueGrowthRate) {
      growthRate = metrics.revenueGrowthRate;
    }
    
    // Top zona se disponível
    let topZone = null;
    if (metrics && metrics.topZoneRevenue) {
      topZone = metrics.topZoneRevenue;
    }
    
    console.log('📊 Calculated KPIs:', {
      total: totalDeliveries,
      receita: totalRevenue,
      ticketMedio: avgTicket,
      taxasEntrega: totalDeliveryFees
    });
    
    return {
      total: totalDeliveries,
      pendentes: pendingCount,
      emTransito: inTransitCount,
      entregues: deliveredCount,
      receita: totalRevenue,
      ticketMedio: avgTicket,
      taxasEntrega: totalDeliveryFees,
      crescimento: growthRate,
      topZona: topZone
    };
  };

  const stats = getDeliveryStats();

  return (
    <div className="w-full h-full flex flex-col p-4">
      {/* Header padronizado */}
      <div className="flex-shrink-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        {/* Header com BlurIn animation */}
        <div className="relative text-center sm:text-left">
          {/* Título animado */}
          <BlurIn
            word="CONTROLE DE ENTREGAS"
            duration={1.2}
            variant={{
              hidden: { filter: "blur(15px)", opacity: 0 },
              visible: { filter: "blur(0px)", opacity: 1 }
            }}
            className={cn(
              getSFProTextClasses('h1', 'accent'),
              "text-transparent bg-clip-text bg-gradient-to-r from-[#FF2400] via-[#FFDA04] to-[#FF2400] drop-shadow-lg"
            )}
            style={{
              textShadow: '0 2px 4px rgba(0,0,0,0.3), 0 0 20px rgba(255, 218, 4, 0.2)'
            }}
          />
          
          {/* Sublinhado elegante */}
          <div className="w-full h-2 relative">
            <div className="absolute inset-x-0 top-0 bg-gradient-to-r from-transparent via-[#FF2400]/80 to-transparent h-[2px] w-full blur-sm" />
            <div className="absolute inset-x-0 top-0 bg-gradient-to-r from-transparent via-[#FF2400] to-transparent h-px w-full" />
            <div className="absolute inset-x-0 top-0 bg-gradient-to-r from-transparent via-[#FFDA04]/80 to-transparent h-[3px] w-3/4 blur-sm mx-auto" />
            <div className="absolute inset-x-0 top-0 bg-gradient-to-r from-transparent via-[#FFDA04] to-transparent h-px w-3/4 mx-auto" />
          </div>
        </div>
        
        {/* Controles */}
        <div className="flex items-center gap-4">
          <NotificationCenter />
          <Button 
            onClick={() => refetch()}
            disabled={isLoadingDeliveries}
            className="bg-black/80 border-[#FFD700]/40 text-[#FFD700] hover:bg-[#FFD700]/20 hover:shadow-xl hover:shadow-[#FFD700]/30 hover:border-[#FFD700]/80 hover:scale-105 backdrop-blur-sm transition-all duration-300 relative overflow-hidden group disabled:opacity-50"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#FFD700]/5 via-[#FFD700]/10 to-[#FFD700]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <RefreshCw className="h-4 w-4 mr-2 relative z-10 group-hover:rotate-180 transition-transform duration-300" />
            <span className="relative z-10 font-medium">Atualizar</span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 -translate-x-full group-hover:translate-x-full transform" />
          </Button>
        </div>
      </div>

      {/* Container principal com glassmorphism */}
      <section 
        className="bg-black/80 backdrop-blur-sm border border-white/10 rounded-xl shadow-lg p-4 hover:shadow-2xl hover:shadow-purple-500/10 hover:border-purple-400/30 transition-all duration-300 flex-1 space-y-6"
        onMouseMove={(e) => {
          const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * 100;
          const y = ((e.clientY - rect.top) / rect.height) * 100;
          (e.currentTarget as HTMLElement).style.setProperty("--x", `${x}%`);
          (e.currentTarget as HTMLElement).style.setProperty("--y", `${y}%`);
        }}
      >
        {/* Resumo de Entregas - Status */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gray-800/30 border-gray-700/40 backdrop-blur-sm shadow-lg hover:shadow-2xl hover:shadow-blue-500/10 hover:border-blue-400/30 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Truck className="h-8 w-8 text-blue-400 transition-all duration-300" />
                <div>
                  <p className={getSFProTextClasses('caption', 'secondary')}>Total de Entregas</p>
                  <div className={getSFProTextClasses('value', 'primary')}>
                    {stats.total}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/30 border-gray-700/40 backdrop-blur-sm shadow-lg hover:shadow-2xl hover:shadow-yellow-500/10 hover:border-yellow-400/30 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Clock className="h-8 w-8 text-yellow-400 transition-all duration-300" />
                <div>
                  <p className={getSFProTextClasses('caption', 'secondary')}>Pendentes</p>
                  <div className={getSFProTextClasses('value', 'primary')}>
                    {stats.pendentes}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/30 border-gray-700/40 backdrop-blur-sm shadow-lg hover:shadow-2xl hover:shadow-blue-500/10 hover:border-blue-400/30 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Truck className="h-8 w-8 text-blue-400 transition-all duration-300" />
                <div>
                  <p className={getSFProTextClasses('caption', 'secondary')}>Em Trânsito</p>
                  <div className={getSFProTextClasses('value', 'primary')}>
                    {stats.emTransito}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/30 border-gray-700/40 backdrop-blur-sm shadow-lg hover:shadow-2xl hover:shadow-green-500/10 hover:border-green-400/30 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-8 w-8 text-green-400 transition-all duration-300" />
                <div>
                  <p className={getSFProTextClasses('caption', 'secondary')}>Entregues</p>
                  <div className={getSFProTextClasses('value', 'primary')}>
                    {stats.entregues}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Métricas Financeiras */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gray-800/30 border-gray-700/40 backdrop-blur-sm shadow-lg hover:shadow-2xl hover:shadow-green-500/10 hover:border-green-400/30 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <DollarSign className="h-8 w-8 text-green-400 transition-all duration-300" />
                <div>
                  <p className={getSFProTextClasses('caption', 'secondary')}>Receita Total</p>
                  <div className={getSFProTextClasses('value', 'success')}>
                    R$ {stats.receita.toFixed(2)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/30 border-gray-700/40 backdrop-blur-sm shadow-lg hover:shadow-2xl hover:shadow-purple-500/10 hover:border-purple-400/30 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <DollarSign className="h-8 w-8 text-purple-400 transition-all duration-300" />
                <div>
                  <p className={getSFProTextClasses('caption', 'secondary')}>Ticket Médio</p>
                  <div className={getSFProTextClasses('value', 'purple')}>
                    R$ {stats.ticketMedio.toFixed(2)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/30 border-gray-700/40 backdrop-blur-sm shadow-lg hover:shadow-2xl hover:shadow-orange-500/10 hover:border-orange-400/30 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Truck className="h-8 w-8 text-orange-400 transition-all duration-300" />
                <div>
                  <p className={getSFProTextClasses('caption', 'secondary')}>Taxas de Entrega</p>
                  <div className={getSFProTextClasses('value', 'warning')}>
                    R$ {stats.taxasEntrega.toFixed(2)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/30 border-gray-700/40 backdrop-blur-sm shadow-lg hover:shadow-2xl hover:shadow-cyan-500/10 hover:border-cyan-400/30 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <ArrowUp className={cn(
                  "h-8 w-8 transition-all duration-300",
                  stats.crescimento >= 0 ? "text-cyan-400" : "text-red-400"
                )} />
                <div>
                  <p className={getSFProTextClasses('caption', 'secondary')}>Crescimento</p>
                  <div className={cn(
                    getSFProTextClasses('value', stats.crescimento >= 0 ? 'success' : 'error')
                  )}>
                    {stats.crescimento >= 0 ? '+' : ''}{stats.crescimento.toFixed(1)}%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Zona de Entrega */}
        {stats.topZona && (
          <Card className="bg-gray-800/30 border-gray-700/40 backdrop-blur-sm shadow-lg hover:shadow-2xl hover:shadow-yellow-500/10 hover:border-yellow-400/30 transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className={cn(getSFProTextClasses('h3', 'primary'), "flex items-center gap-2")}>
                <MapPin className="h-6 w-6 text-yellow-400" />
                Zona Mais Rentável
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className={getSFProTextClasses('caption', 'secondary')}>Nome da Zona</p>
                  <p className={getSFProTextClasses('label', 'primary')}>{stats.topZona.zoneName}</p>
                </div>
                <div>
                  <p className={getSFProTextClasses('caption', 'secondary')}>Receita</p>
                  <p className={getSFProTextClasses('label', 'success')}>R$ {stats.topZona.revenue.toFixed(2)}</p>
                </div>
                <div>
                  <p className={getSFProTextClasses('caption', 'secondary')}>Pedidos</p>
                  <p className={getSFProTextClasses('label', 'accent')}>{stats.topZona.orderCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs para Entregas e Analytics */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-800/30">
            <TabsTrigger 
              value="deliveries" 
              className="data-[state=active]:bg-blue-600 flex items-center gap-2"
            >
              <Truck className="h-4 w-4" />
              Entregas
            </TabsTrigger>
            <TabsTrigger 
              value="analytics" 
              className="data-[state=active]:bg-purple-600 flex items-center gap-2"
            >
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger 
              value="map" 
              className="data-[state=active]:bg-green-600 flex items-center gap-2"
            >
              <MapPin className="h-4 w-4" />
              Mapa
            </TabsTrigger>
          </TabsList>

          <TabsContent value="deliveries" className="mt-6">

            {/* Lista de Entregas - Cards */}
            <Card className="bg-gray-800/30 border-gray-700/40 backdrop-blur-sm shadow-lg hover:shadow-2xl hover:shadow-purple-500/10 hover:border-purple-400/30 transition-all duration-300">
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <CardTitle className={getSFProTextClasses('h3', 'primary')}>Lista de Entregas</CardTitle>
              
              {/* Controles de Filtro e Busca */}
              <div className="flex flex-col sm:flex-row gap-3 sm:items-center w-full sm:w-auto">
                <div className="w-full sm:w-80">
                  <SearchBar21st 
                    placeholder="Buscar entregas..." 
                    value={searchTerm} 
                    onChange={setSearchTerm} 
                    debounceMs={150}
                    disableResizeAnimation={true}
                  />
                </div>
                
                {/* Filtro por Status */}
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-40 bg-black/40 border-white/30 text-white">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900/95 border-white/20 backdrop-blur-xl">
                    <SelectItem value="all" className="text-white hover:bg-white/10">Todos</SelectItem>
                    <SelectItem value="pending" className="text-white hover:bg-white/10">Pendente</SelectItem>
                    <SelectItem value="preparing" className="text-white hover:bg-white/10">Preparando</SelectItem>
                    <SelectItem value="out_for_delivery" className="text-white hover:bg-white/10">Em Trânsito</SelectItem>
                    <SelectItem value="delivered" className="text-white hover:bg-white/10">Entregue</SelectItem>
                  </SelectContent>
                </Select>

                {/* Ordenação */}
                <Select value={sortField} onValueChange={(value: any) => setSortField(value)}>
                  <SelectTrigger className="w-full sm:w-40 bg-black/40 border-white/30 text-white">
                    <SelectValue placeholder="Ordenar" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900/95 border-white/20 backdrop-blur-xl">
                    <SelectItem value="created_at" className="text-white hover:bg-white/10">Data</SelectItem>
                    <SelectItem value="customer" className="text-white hover:bg-white/10">Cliente</SelectItem>
                    <SelectItem value="final_amount" className="text-white hover:bg-white/10">Valor</SelectItem>
                    <SelectItem value="delivery_status" className="text-white hover:bg-white/10">Status</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
                  className="bg-black/40 border-white/30 text-white hover:bg-white/10"
                >
                  {sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            
            {/* Contador de resultados */}
            <div className="flex items-center gap-2 text-sm text-white/70">
              <span>{dataset.length} de {deliveries.length} entregas</span>
              {statusFilter !== 'all' && (
                <span className="text-blue-400">• Filtrado por status</span>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {isLoadingDeliveries ? (
              // Loading skeleton para cards
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="bg-gray-700/30 rounded-lg p-6 animate-pulse">
                    <div className="flex justify-between items-start mb-4">
                      <div className="space-y-2">
                        <div className="h-5 bg-white/10 rounded w-32"></div>
                        <div className="h-4 bg-white/10 rounded w-24"></div>
                      </div>
                      <div className="h-6 bg-white/10 rounded w-20"></div>
                    </div>
                    <div className="space-y-3">
                      <div className="h-4 bg-white/10 rounded w-full"></div>
                      <div className="h-4 bg-white/10 rounded w-3/4"></div>
                      <div className="h-4 bg-white/10 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : dataset.length === 0 ? (
              // Estado vazio
              <div className="py-12 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="p-3 rounded-full bg-gray-700/30">
                    <Truck className="h-12 w-12 text-gray-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-white mb-2">
                      {searchTerm || statusFilter !== 'all' ? 'Nenhuma entrega encontrada' : 'Nenhuma entrega ainda'}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      {searchTerm || statusFilter !== 'all' 
                        ? 'Tente ajustar os filtros de busca'
                        : 'As entregas aparecerão aqui quando forem criadas no POS'
                      }
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              // Grid de cards das entregas
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {dataset.map((delivery) => (
                  <DeliveryOrderCard
                    key={delivery.id}
                    delivery={delivery}
                    onUpdateStatus={handleUpdateStatus}
                    isUpdating={updateDeliveryStatus.isPending}
                  />
                ))}
              </div>
            )}
          </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <DeliveryAnalytics />
          </TabsContent>

          <TabsContent value="map" className="mt-6">
            {/* Mapa de Entregas (Placeholder) */}
            <Card className="bg-gray-800/30 border-gray-700/40 backdrop-blur-sm shadow-lg hover:shadow-2xl hover:shadow-green-500/10 hover:border-green-400/30 transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
              <MapPin className="h-6 w-6 text-green-400" />
              Mapa de Entregas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-black/40 border border-white/20 rounded-lg flex items-center justify-center relative overflow-hidden group">
              {/* Background pattern */}
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-blue-500/5"></div>
              
              <div className="text-center relative z-10">
                <div className="relative mb-4">
                  <div className="absolute inset-0 bg-green-500/20 rounded-full blur-lg group-hover:blur-xl transition-all duration-300"></div>
                  <Truck className="h-12 w-12 mx-auto text-green-400 relative z-10 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <p className="text-white/90 font-medium mb-1">Mapa Interativo em Desenvolvimento</p>
                <p className="text-white/60 text-sm">Integração com Google Maps API</p>
                <p className="text-white/50 text-xs mt-2">Rastreamento em tempo real • Otimização de rotas</p>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute top-4 left-4 w-2 h-2 bg-green-400/60 rounded-full animate-pulse"></div>
              <div className="absolute top-8 right-6 w-1 h-1 bg-blue-400/60 rounded-full animate-pulse delay-300"></div>
              <div className="absolute bottom-6 left-8 w-1.5 h-1.5 bg-yellow-400/60 rounded-full animate-pulse delay-700"></div>
            </div>
          </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
};

export default Delivery;
