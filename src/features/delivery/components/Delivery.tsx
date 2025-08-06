
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { Button } from '@/shared/ui/primitives/button';
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
            <CardTitle className="text-sm font-medium">Total de Entregas</CardTitle>
            <Truck className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card className="bg-adega-charcoal/20 border-white/10 backdrop-blur-xl shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendentes}</div>
          </CardContent>
        </Card>

        <Card className="bg-adega-charcoal/20 border-white/10 backdrop-blur-xl shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Trânsito</CardTitle>
            <Truck className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.emTransito}</div>
          </CardContent>
        </Card>

        <Card className="bg-adega-charcoal/20 border-white/10 backdrop-blur-xl shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entregues</CardTitle>
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
          <CardTitle>Controle de Entregas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Pedido</th>
                  <th className="text-left p-2">Cliente</th>
                  <th className="text-left p-2">Endereço</th>
                  <th className="text-left p-2">Entregador</th>
                  <th className="text-left p-2">Horário</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Ações</th>
                </tr>
              </thead>
              <tbody>
                {deliveries.map((delivery) => (
                  <tr key={delivery.id} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-medium">#{delivery.saleId}</td>
                    <td className="p-2">{delivery.customer}</td>
                    <td className="p-2">{delivery.address}</td>
                    <td className="p-2">{delivery.deliveryPerson || '-'}</td>
                    <td className="p-2">{delivery.estimatedTime}</td>
                    <td className="p-2">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(delivery.status)}
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(delivery.status)}`}>
                          {getStatusText(delivery.status)}
                        </span>
                      </div>
                    </td>
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
          <CardTitle>Mapa de Entregas</CardTitle>
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
