
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { Button } from '@/shared/ui/primitives/button';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from '@/shared/ui/primitives/dropdown-menu';
import { SearchBar21st } from '@/shared/ui/thirdparty/search-bar-21st';
import { ArrowUpDown, ArrowUp, ArrowDown, RefreshCw, MapPin } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/primitives/select';
import { Truck, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/shared/hooks/common/use-toast';
import { BlurIn } from '@/components/ui/blur-in';

export const Delivery = () => {
  const [deliveries, setDeliveries] = useState([
    { id: 1, saleId: 1001, customer: 'João Silva', address: 'Rua das Flores, 123', status: 'pendente', deliveryPerson: '', estimatedTime: '14:30' },
    { id: 2, saleId: 1002, customer: 'Maria Santos', address: 'Av. Paulista, 456', status: 'em_transito', deliveryPerson: 'Carlos', estimatedTime: '15:00' },
    { id: 3, saleId: 1003, customer: 'Pedro Costa', address: 'Rua São João, 789', status: 'entregue', deliveryPerson: 'Ana', estimatedTime: '13:30' },
  ]);

  const { toast } = useToast();

  const ALL_COLUMNS = ['Pedido', 'Cliente', 'Endereço', 'Entregador', 'Horário', 'Status', 'Ações'] as const;
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleColumns, setVisibleColumns] = useState<string[]>([...ALL_COLUMNS]);
  const [sortField, setSortField] = useState<'saleId' | 'customer' | 'address' | 'deliveryPerson' | 'estimatedTime' | 'status' | null>('status');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const dataset = React.useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    let rows = term
      ? deliveries.filter(d =>
          d.customer.toLowerCase().includes(term) ||
          d.address.toLowerCase().includes(term) ||
          (d.deliveryPerson || '').toLowerCase().includes(term) ||
          String(d.saleId).includes(term)
        )
      : deliveries;
    if (sortField) {
      rows = [...rows].sort((a, b) => {
        const av: any = (a as any)[sortField!];
        const bv: any = (b as any)[sortField!];
        if (typeof av === 'number' && typeof bv === 'number') return sortDirection === 'asc' ? av - bv : bv - av;
        return sortDirection === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
      });
    }
    return rows;
  }, [deliveries, searchTerm, sortField, sortDirection]);

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDirection('asc'); }
  };
  const icon = (field: typeof sortField) => sortField !== field ? <ArrowUpDown className="w-4 h-4" /> : (sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />);

  const updateDeliveryStatus = (deliveryId, newStatus, deliveryPerson = '') => {
    setDeliveries(deliveries.map(delivery => 
      delivery.id === deliveryId 
        ? { ...delivery, status: newStatus, deliveryPerson }
        : delivery
    ));

    toast({
      title: "Status atualizado!",
      description: `Entrega ${deliveryId} foi atualizada para ${newStatus}`,
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pendente': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'em_transito': return <Truck className="h-4 w-4 text-blue-600" />;
      case 'entregue': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'cancelado': return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pendente': return 'bg-yellow-100 text-yellow-700';
      case 'em_transito': return 'bg-blue-100 text-blue-700';
      case 'entregue': return 'bg-green-100 text-green-700';
      case 'cancelado': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pendente': return 'Pendente';
      case 'em_transito': return 'Em Trânsito';
      case 'entregue': return 'Entregue';
      case 'cancelado': return 'Cancelado';
      default: return status;
    }
  };

  const getDeliveryStats = () => {
    const total = deliveries.length;
    const pendentes = deliveries.filter(d => d.status === 'pendente').length;
    const emTransito = deliveries.filter(d => d.status === 'em_transito').length;
    const entregues = deliveries.filter(d => d.status === 'entregue').length;
    
    return { total, pendentes, emTransito, entregues };
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
            className="text-xl lg:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FF2400] via-[#FFDA04] to-[#FF2400] drop-shadow-lg"
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
          <Button 
            onClick={() => window.location.reload()}
            className="bg-black/80 border-[#FFD700]/40 text-[#FFD700] hover:bg-[#FFD700]/20 hover:shadow-xl hover:shadow-[#FFD700]/30 hover:border-[#FFD700]/80 hover:scale-105 backdrop-blur-sm transition-all duration-300 relative overflow-hidden group"
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
        {/* Resumo de Entregas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gray-800/30 border-gray-700/40 backdrop-blur-sm shadow-lg hover:shadow-2xl hover:shadow-blue-500/10 hover:border-blue-400/30 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Truck className="h-8 w-8 text-blue-400 transition-all duration-300" />
                <div>
                  <p className="text-sm text-gray-400">Total de Entregas</p>
                  <div className="text-2xl font-bold text-white">
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
                  <p className="text-sm text-gray-400">Pendentes</p>
                  <div className="text-2xl font-bold text-white">
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
                  <p className="text-sm text-gray-400">Em Trânsito</p>
                  <div className="text-2xl font-bold text-white">
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
                  <p className="text-sm text-gray-400">Entregues</p>
                  <div className="text-2xl font-bold text-white">
                    {stats.entregues}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Entregas */}
        <Card className="bg-gray-800/30 border-gray-700/40 backdrop-blur-sm shadow-lg hover:shadow-2xl hover:shadow-purple-500/10 hover:border-purple-400/30 transition-all duration-300">
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <CardTitle className="text-lg font-bold text-white">Lista de Entregas</CardTitle>
              <div className="flex flex-col sm:flex-row gap-3 sm:items-center w-full sm:w-auto">
                <div className="w-full sm:w-80">
                  <SearchBar21st 
                    placeholder="Buscar entregas..." 
                    value={searchTerm} 
                    onChange={setSearchTerm} 
                    debounceMs={150} 
                  />
                </div>
                <div className="flex items-center gap-2 text-sm text-white/70">
                  <span>{dataset.length} de {deliveries.length} entregas</span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="bg-black/40 border-white/30 text-white hover:bg-white/10 hover:border-white/50 transition-all duration-200"
                      >
                        Colunas
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 bg-gray-900/95 border-white/20 backdrop-blur-xl">
                      {ALL_COLUMNS.map(col => (
                        <DropdownMenuCheckboxItem
                          key={col}
                          checked={visibleColumns.includes(col)}
                          onCheckedChange={() => setVisibleColumns(prev => prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col])}
                          className="text-white hover:bg-white/10 focus:bg-white/10"
                        >
                          {col}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-white/20">
                    {visibleColumns.includes('Pedido') && (
                      <th className="text-left p-3">
                        <button 
                          className="inline-flex items-center gap-2 text-white/90 hover:text-white font-medium transition-colors"
                          onClick={() => handleSort('saleId')}
                        >
                          Pedido {icon('saleId')}
                        </button>
                      </th>
                    )}
                    {visibleColumns.includes('Cliente') && (
                      <th className="text-left p-3">
                        <button 
                          className="inline-flex items-center gap-2 text-white/90 hover:text-white font-medium transition-colors"
                          onClick={() => handleSort('customer')}
                        >
                          Cliente {icon('customer')}
                        </button>
                      </th>
                    )}
                    {visibleColumns.includes('Endereço') && (
                      <th className="text-left p-3">
                        <button 
                          className="inline-flex items-center gap-2 text-white/90 hover:text-white font-medium transition-colors"
                          onClick={() => handleSort('address')}
                        >
                          Endereço {icon('address')}
                        </button>
                      </th>
                    )}
                    {visibleColumns.includes('Entregador') && (
                      <th className="text-left p-3">
                        <button 
                          className="inline-flex items-center gap-2 text-white/90 hover:text-white font-medium transition-colors"
                          onClick={() => handleSort('deliveryPerson')}
                        >
                          Entregador {icon('deliveryPerson')}
                        </button>
                      </th>
                    )}
                    {visibleColumns.includes('Horário') && (
                      <th className="text-left p-3">
                        <button 
                          className="inline-flex items-center gap-2 text-white/90 hover:text-white font-medium transition-colors"
                          onClick={() => handleSort('estimatedTime')}
                        >
                          Horário {icon('estimatedTime')}
                        </button>
                      </th>
                    )}
                    {visibleColumns.includes('Status') && (
                      <th className="text-left p-3">
                        <button 
                          className="inline-flex items-center gap-2 text-white/90 hover:text-white font-medium transition-colors"
                          onClick={() => handleSort('status')}
                        >
                          Status {icon('status')}
                        </button>
                      </th>
                    )}
                    {visibleColumns.includes('Ações') && (
                      <th className="text-left p-3 text-white/90 font-medium">Ações</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {dataset.map((delivery) => (
                    <tr 
                      key={delivery.id} 
                      className="border-b border-white/10 hover:bg-white/5 transition-colors duration-200"
                    >
                      {visibleColumns.includes('Pedido') && (
                        <td className="p-3 font-medium text-white">#{delivery.saleId}</td>
                      )}
                      {visibleColumns.includes('Cliente') && (
                        <td className="p-3 text-white/90">{delivery.customer}</td>
                      )}
                      {visibleColumns.includes('Endereço') && (
                        <td className="p-3 text-white/90">{delivery.address}</td>
                      )}
                      {visibleColumns.includes('Entregador') && (
                        <td className="p-3 text-white/90">{delivery.deliveryPerson || '-'}</td>
                      )}
                      {visibleColumns.includes('Horário') && (
                        <td className="p-3 text-white/90">{delivery.estimatedTime}</td>
                      )}
                      {visibleColumns.includes('Status') && (
                        <td className="p-3">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(delivery.status)}
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(delivery.status)}`}>
                              {getStatusText(delivery.status)}
                            </span>
                          </div>
                        </td>
                      )}
                      {visibleColumns.includes('Ações') && (
                        <td className="p-3">
                          {delivery.status === 'pendente' && (
                            <Button 
                              size="sm"
                              onClick={() => updateDeliveryStatus(delivery.id, 'em_transito', 'Carlos')}
                              className="bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200"
                            >
                              Iniciar Entrega
                            </Button>
                          )}
                          {delivery.status === 'em_transito' && (
                            <Button 
                              size="sm"
                              variant="outline"
                              onClick={() => updateDeliveryStatus(delivery.id, 'entregue')}
                              className="border-green-400 text-green-400 hover:bg-green-400/10 transition-colors duration-200"
                            >
                              Marcar Entregue
                            </Button>
                          )}
                          {delivery.status === 'entregue' && (
                            <span className="text-green-400 text-sm font-medium">Concluída</span>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

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
      </section>
    </div>
  );
};

export default Delivery;
