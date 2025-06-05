import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Users, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const Customers = () => {
  const { userRole } = useAuth();
  const [customers, setCustomers] = useState([
    { id: 1, name: 'João Silva', phone: '(11) 98765-4321', email: 'joao@email.com', totalSpent: 1250.00, lastPurchase: '2024-05-28', segment: 'VIP' },
    { id: 2, name: 'Maria Santos', phone: '(11) 91234-5678', email: 'maria@email.com', totalSpent: 890.50, lastPurchase: '2024-05-27', segment: 'Regular' },
    { id: 3, name: 'Pedro Costa', phone: '(11) 99999-8888', email: 'pedro@email.com', totalSpent: 450.00, lastPurchase: '2024-05-25', segment: 'Regular' },
  ]);

  const [newCustomer, setNewCustomer] = useState({
    name: '',
    phone: '',
    email: ''
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const addCustomer = () => {
    if (!newCustomer.name || !newCustomer.phone) {
      toast({
        title: "Erro",
        description: "Preencha pelo menos nome e telefone",
        variant: "destructive",
      });
      return;
    }

    const customer = {
      id: Date.now(),
      ...newCustomer,
      totalSpent: 0,
      lastPurchase: null,
      segment: 'Novo'
    };

    setCustomers([...customers, customer]);
    setNewCustomer({ name: '', phone: '', email: '' });
    setIsDialogOpen(false);

    toast({
      title: "Cliente adicionado!",
      description: `${customer.name} foi cadastrado com sucesso`,
    });
  };

  const getSegmentColor = (segment) => {
    switch (segment) {
      case 'VIP': return 'bg-purple-100 text-purple-700';
      case 'Regular': return 'bg-blue-100 text-blue-700';
      case 'Novo': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handleDeleteCustomer = () => {
    if (userRole === 'employee') {
      toast({
        title: "Acesso negado",
        description: "Apenas administradores podem excluir clientes",
        variant: "destructive",
      });
      return;
    }
  };

  const handleEditFinancialInfo = () => {
    if (userRole === 'employee') {
      toast({
        title: "Acesso negado",
        description: "Apenas administradores podem editar informações financeiras",
        variant: "destructive",
      });
      return;
    }
  };

  return (
    <div className="space-y-6">
      {/* Resumo de Clientes */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customers.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes VIP</CardTitle>
            <Star className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {customers.filter(c => c.segment === 'VIP').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {customers.reduce((total, c) => total + c.totalSpent, 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
            <Users className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {customers.length > 0 ? (customers.reduce((total, c) => total + c.totalSpent, 0) / customers.length).toFixed(2) : '0.00'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Clientes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Clientes Cadastrados</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Cliente
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Cadastrar Novo Cliente</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="customer-name">Nome</Label>
                  <Input
                    id="customer-name"
                    value={newCustomer.name}
                    onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
                    placeholder="Nome completo"
                  />
                </div>
                <div>
                  <Label htmlFor="customer-phone">Telefone</Label>
                  <Input
                    id="customer-phone"
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
                    placeholder="(11) 99999-9999"
                  />
                </div>
                <div>
                  <Label htmlFor="customer-email">Email</Label>
                  <Input
                    id="customer-email"
                    type="email"
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
                    placeholder="email@exemplo.com"
                  />
                </div>
                <Button onClick={addCustomer} className="w-full">
                  Cadastrar Cliente
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Nome</th>
                  <th className="text-left p-2">Telefone</th>
                  <th className="text-left p-2">Email</th>
                  <th className="text-left p-2">Total Gasto</th>
                  <th className="text-left p-2">Última Compra</th>
                  <th className="text-left p-2">Segmento</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-medium">{customer.name}</td>
                    <td className="p-2">{customer.phone}</td>
                    <td className="p-2">{customer.email}</td>
                    <td className="p-2 font-medium text-green-600">R$ {customer.totalSpent.toFixed(2)}</td>
                    <td className="p-2">{customer.lastPurchase || 'Nunca'}</td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${getSegmentColor(customer.segment)}`}>
                        {customer.segment}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
