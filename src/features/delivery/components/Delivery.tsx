
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { Button } from '@/shared/ui/primitives/button';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from '@/shared/ui/primitives/dropdown-menu';
import { SearchBar21st } from '@/shared/ui/thirdparty/search-bar-21st';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/primitives/select';
import { Truck, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/shared/hooks/common/use-toast';

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
    <div className="space-y-6">
      {/* Resumo de Entregas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-adega-charcoal/20 border-white/10 backdrop-blur-xl shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">TOTAL DE ENTREGAS</CardTitle>
            <Truck className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card className="bg-adega-charcoal/20 border-white/10 backdrop-blur-xl shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">PENDENTES</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendentes}</div>
          </CardContent>
        </Card>

        <Card className="bg-adega-charcoal/20 border-white/10 backdrop-blur-xl shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">EM TRÂNSITO</CardTitle>
            <Truck className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.emTransito}</div>
          </CardContent>
        </Card>

        <Card className="bg-adega-charcoal/20 border-white/10 backdrop-blur-xl shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ENTREGUES</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.entregues}</div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Entregas */}
      <Card className="bg-adega-charcoal/20 border-white/10 backdrop-blur-xl shadow-xl">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <CardTitle>CONTROLE DE ENTREGAS</CardTitle>
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center w-full sm:w-auto">
              <div className="w-full sm:w-80">
                <SearchBar21st placeholder="Buscar entregas..." value={searchTerm} onChange={setSearchTerm} debounceMs={150} />
              </div>
              <div className="flex items-center gap-2 text-sm text-adega-platinum/70">
                <span>{dataset.length} de {deliveries.length} entregas</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">Colunas</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    {ALL_COLUMNS.map(col => (
                      <DropdownMenuCheckboxItem
                        key={col}
                        checked={visibleColumns.includes(col)}
                        onCheckedChange={() => setVisibleColumns(prev => prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col])}
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
                <tr className="border-b">
                  {visibleColumns.includes('Pedido') && (
                    <th className="text-left p-2">
                      <button className="inline-flex items-center gap-2" onClick={() => handleSort('saleId')}>Pedido {icon('saleId')}</button>
                    </th>
                  )}
                  {visibleColumns.includes('Cliente') && (
                    <th className="text-left p-2">
                      <button className="inline-flex items-center gap-2" onClick={() => handleSort('customer')}>Cliente {icon('customer')}</button>
                    </th>
                  )}
                  {visibleColumns.includes('Endereço') && (
                    <th className="text-left p-2">
                      <button className="inline-flex items-center gap-2" onClick={() => handleSort('address')}>Endereço {icon('address')}</button>
                    </th>
                  )}
                  {visibleColumns.includes('Entregador') && (
                    <th className="text-left p-2">
                      <button className="inline-flex items-center gap-2" onClick={() => handleSort('deliveryPerson')}>Entregador {icon('deliveryPerson')}</button>
                    </th>
                  )}
                  {visibleColumns.includes('Horário') && (
                    <th className="text-left p-2">
                      <button className="inline-flex items-center gap-2" onClick={() => handleSort('estimatedTime')}>Horário {icon('estimatedTime')}</button>
                    </th>
                  )}
                  {visibleColumns.includes('Status') && (
                    <th className="text-left p-2">
                      <button className="inline-flex items-center gap-2" onClick={() => handleSort('status')}>Status {icon('status')}</button>
                    </th>
                  )}
                  {visibleColumns.includes('Ações') && (
                    <th className="text-left p-2">Ações</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {dataset.map((delivery) => (
                  <tr key={delivery.id} className="border-b hover:bg-gray-50">
                    {visibleColumns.includes('Pedido') && (
                      <td className="p-2 font-medium">#{delivery.saleId}</td>
                    )}
                    {visibleColumns.includes('Cliente') && (
                      <td className="p-2">{delivery.customer}</td>
                    )}
                    {visibleColumns.includes('Endereço') && (
                      <td className="p-2">{delivery.address}</td>
                    )}
                    {visibleColumns.includes('Entregador') && (
                      <td className="p-2">{delivery.deliveryPerson || '-'}</td>
                    )}
                    {visibleColumns.includes('Horário') && (
                      <td className="p-2">{delivery.estimatedTime}</td>
                    )}
                    {visibleColumns.includes('Status') && (
                      <td className="p-2">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(delivery.status)}
                          <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(delivery.status)}`}>
                            {getStatusText(delivery.status)}
                          </span>
                        </div>
                      </td>
                    )}
                    {visibleColumns.includes('Ações') && (
                      <td className="p-2">
                        {delivery.status === 'pendente' && (
                          <Button 
                            size="sm"
                            onClick={() => updateDeliveryStatus(delivery.id, 'em_transito', 'Carlos')}
                          >
                            Iniciar Entrega
                          </Button>
                        )}
                        {delivery.status === 'em_transito' && (
                          <Button 
                            size="sm"
                            variant="outline"
                            onClick={() => updateDeliveryStatus(delivery.id, 'entregue')}
                          >
                            Marcar Entregue
                          </Button>
                        )}
                        {delivery.status === 'entregue' && (
                          <span className="text-green-600 text-sm">Concluída</span>
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
      <Card className="bg-adega-charcoal/20 border-white/10 backdrop-blur-xl shadow-xl">
        <CardHeader>
          <CardTitle>MAPA DE ENTREGAS</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center text-gray-500">
              <Truck className="h-12 w-12 mx-auto mb-2" />
              <p>Integração com mapa será implementada</p>
              <p className="text-sm">Google Maps API ou similar</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Delivery;
