
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { DollarSign, ShoppingCart, Users, Package } from 'lucide-react';

export const Dashboard = () => {
  // Dados de exemplo - em produção viriam do Supabase
  const salesData = [
    { month: 'Jan', vendas: 65000 },
    { month: 'Fev', vendas: 59000 },
    { month: 'Mar', vendas: 80000 },
    { month: 'Abr', vendas: 81000 },
    { month: 'Mai', vendas: 56000 },
    { month: 'Jun', vendas: 95000 },
  ];

  const metrics = [
    {
      title: 'Receita Mensal',
      value: 'R$ 95.420',
      change: '+12%',
      icon: DollarSign,
      color: 'text-green-600',
    },
    {
      title: 'Vendas do Mês',
      value: '1.234',
      change: '+8%',
      icon: ShoppingCart,
      color: 'text-blue-600',
    },
    {
      title: 'Clientes Ativos',
      value: '456',
      change: '+23%',
      icon: Users,
      color: 'text-purple-600',
    },
    {
      title: 'Produtos em Estoque',
      value: '789',
      change: '-5%',
      icon: Package,
      color: 'text-orange-600',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {metric.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${metric.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <p className="text-xs text-gray-600">
                  <span className={metric.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}>
                    {metric.change}
                  </span>
                  {' '}em relação ao mês anterior
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

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
