import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download, Calendar, TrendingUp, Users, Package } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export const Reports = () => {
  const { userRole } = useAuth();
  const [period, setPeriod] = useState('month');

  // Dados de exemplo para relatórios
  const salesByCategory = [
    { name: 'Vinhos', value: 45, color: '#8b5cf6' },
    { name: 'Cervejas', value: 30, color: '#3b82f6' },
    { name: 'Destilados', value: 15, color: '#f59e0b' },
    { name: 'Espumantes', value: 10, color: '#10b981' },
  ];

  const monthlySales = [
    { month: 'Jan', vendas: 65000, clientes: 120 },
    { month: 'Fev', vendas: 59000, clientes: 115 },
    { month: 'Mar', vendas: 80000, clientes: 140 },
    { month: 'Abr', vendas: 81000, clientes: 145 },
    { month: 'Mai', vendas: 56000, clientes: 110 },
    { month: 'Jun', vendas: 95000, clientes: 160 },
  ];

  const topProducts = [
    { name: 'Vinho Tinto Cabernet', sales: 145, revenue: 6655.50 },
    { name: 'Cerveja Artesanal IPA', sales: 120, revenue: 1548.00 },
    { name: 'Espumante Moscatel', sales: 85, revenue: 4420.00 },
    { name: 'Whisky Single Malt', sales: 25, revenue: 4500.00 },
  ];

  const topCustomers = [
    { name: 'João Silva', purchases: 15, spent: 1250.00 },
    { name: 'Maria Santos', purchases: 12, spent: 890.50 },
    { name: 'Pedro Costa', purchases: 8, spent: 450.00 },
    { name: 'Ana Lima', purchases: 10, spent: 780.00 },
  ];

  const downloadReport = () => {
    // Implementar download do relatório
    alert('Download do relatório será implementado');
  };

  const reports = [
    {
      id: 'sales',
      title: 'Relatório de Vendas',
      description: 'Visualizar histórico de vendas',
      allowedRoles: ['admin', 'employee']
    },
    {
      id: 'inventory',
      title: 'Relatório de Estoque',
      description: 'Acompanhar movimentação de produtos',
      allowedRoles: ['admin', 'employee']
    },
    {
      id: 'customers',
      title: 'Relatório de Clientes',
      description: 'Análise de clientes e comportamento',
      allowedRoles: ['admin', 'employee']
    },
    {
      id: 'financial',
      title: 'Relatório Financeiro',
      description: 'Análise financeira detalhada',
      allowedRoles: ['admin']
    },
    {
      id: 'profit',
      title: 'Relatório de Lucros',
      description: 'Análise de margem e lucratividade',
      allowedRoles: ['admin']
    },
    {
      id: 'expenses',
      title: 'Relatório de Despesas',
      description: 'Controle de gastos e custos',
      allowedRoles: ['admin']
    }
  ];

  const allowedReports = reports.filter(report => 
    report.allowedRoles.includes(userRole || '')
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Relatórios</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {allowedReports.map(report => (
          <Card key={report.id}>
            <CardHeader>
              <CardTitle>{report.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {report.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {userRole === 'employee' && (
        <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
          <p className="text-sm text-yellow-800">
            Nota: Alguns relatórios financeiros e estratégicos estão disponíveis apenas para administradores.
          </p>
        </div>
      )}

      {/* Controles do Relatório */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Relatórios Gerenciais
            </span>
            <div className="flex items-center space-x-4">
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Esta Semana</SelectItem>
                  <SelectItem value="month">Este Mês</SelectItem>
                  <SelectItem value="quarter">Este Trimestre</SelectItem>
                  <SelectItem value="year">Este Ano</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={downloadReport}>
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Gráficos Principais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Vendas por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={salesByCategory}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {salesByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Evolução de Vendas e Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlySales}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="vendas" fill="#8b5cf6" name="Vendas (R$)" />
                <Bar dataKey="clientes" fill="#3b82f6" name="Clientes" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tabelas de Top Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="h-5 w-5 mr-2" />
              Produtos Mais Vendidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-gray-600">{product.sales} vendas</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">R$ {product.revenue.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Melhores Clientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topCustomers.map((customer, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{customer.name}</p>
                    <p className="text-sm text-gray-600">{customer.purchases} compras</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">R$ {customer.spent.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resumo Executivo */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo Executivo - {period === 'month' ? 'Mês Atual' : 'Período Selecionado'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">R$ 95.420</div>
              <p className="text-sm text-gray-600">Receita Total</p>
              <p className="text-xs text-green-600">+12% vs período anterior</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">1.234</div>
              <p className="text-sm text-gray-600">Vendas Realizadas</p>
              <p className="text-xs text-blue-600">+8% vs período anterior</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">456</div>
              <p className="text-sm text-gray-600">Clientes Ativos</p>
              <p className="text-xs text-purple-600">+23% vs período anterior</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">R$ 77,35</div>
              <p className="text-sm text-gray-600">Ticket Médio</p>
              <p className="text-xs text-orange-600">+4% vs período anterior</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
