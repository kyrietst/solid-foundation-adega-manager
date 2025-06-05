import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { DollarSign, ShoppingCart, Users, Package } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export const Dashboard = () => {
  const { userRole } = useAuth();

  // Dados que todos podem ver
  const publicMetrics = [
    {
      title: 'Total de Clientes',
      value: '3',
      icon: 'users'
    },
    {
      title: 'Clientes VIP',
      value: '1',
      icon: 'star'
    },
    {
      title: 'Produtos em Estoque',
      value: '150',
      icon: 'package'
    },
    {
      title: 'Entregas Pendentes',
      value: '5',
      icon: 'truck'
    }
  ];

  // Dados sensíveis que apenas admin pode ver
  const sensitiveMetrics = [
    {
      title: 'Faturamento Total',
      value: 'R$ 25.890,50',
      icon: 'dollar'
    },
    {
      title: 'Lucro Líquido',
      value: 'R$ 8.450,30',
      icon: 'trending-up'
    },
    {
      title: 'Margem de Lucro',
      value: '32,6%',
      icon: 'percent'
    },
    {
      title: 'Custos Operacionais',
      value: 'R$ 12.340,20',
      icon: 'trending-down'
    }
  ];

  // Dados de exemplo - em produção viriam do Supabase
  const salesData = [
    { month: 'Jan', vendas: 65000 },
    { month: 'Fev', vendas: 59000 },
    { month: 'Mar', vendas: 80000 },
    { month: 'Abr', vendas: 81000 },
    { month: 'Mai', vendas: 56000 },
    { month: 'Jun', vendas: 95000 },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Dashboard</h2>
      
      {/* Métricas públicas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {publicMetrics.map((metric, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Métricas sensíveis - apenas para admin */}
      {userRole === 'admin' && (
        <>
          <h3 className="text-xl font-semibold mt-8">Métricas Financeiras</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {sensitiveMetrics.map((metric, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {metric.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metric.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {userRole === 'employee' && (
        <div className="mt-8 p-4 bg-yellow-50 rounded-lg">
          <p className="text-sm text-yellow-800">
            Nota: Algumas métricas financeiras e estratégicas estão disponíveis apenas para administradores.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Vendas por Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`R$ ${value}`, 'Vendas']} />
                <Bar dataKey="vendas" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tendência de Vendas</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`R$ ${value}`, 'Vendas']} />
                <Line type="monotone" dataKey="vendas" stroke="#8b5cf6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Atividades Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Nova venda realizada</p>
                <p className="text-xs text-gray-500">João Silva - R$ 150,00 - Há 5 min</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Produto adicionado ao estoque</p>
                <p className="text-xs text-gray-500">Vinho Tinto Cabernet - 50 unidades - Há 15 min</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Entrega realizada</p>
                <p className="text-xs text-gray-500">Pedido #1234 - Maria Santos - Há 30 min</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
