import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { DollarSign, ShoppingCart, Users, Package, TrendingUp, TrendingDown, Percent, Star, Truck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export const Dashboard = () => {
  const { userRole } = useAuth();

  // Dados que todos podem ver
  const publicMetrics = [
    {
      title: 'Total de Clientes',
      value: '3',
      icon: Users,
      description: '3 clientes ativos'
    },
    {
      title: 'Clientes VIP',
      value: '1',
      icon: Star,
      description: '1 cliente premium'
    },
    {
      title: 'Produtos em Estoque',
      value: '150',
      icon: Package,
      description: '150 produtos disponíveis'
    },
    {
      title: 'Entregas Pendentes',
      value: '5',
      icon: Truck,
      description: '5 entregas aguardando'
    }
  ];

  // Dados sensíveis que apenas admin pode ver
  const sensitiveMetrics = [
    {
      title: 'Faturamento Total',
      value: 'R$ 25.890,50',
      icon: DollarSign,
      description: 'R$ 25.890,50 este mês'
    },
    {
      title: 'Lucro Líquido',
      value: 'R$ 8.450,30',
      icon: TrendingUp,
      description: 'R$ 8.450,30 de lucro'
    },
    {
      title: 'Margem de Lucro',
      value: '32,6%',
      icon: Percent,
      description: '32,6% de margem'
    },
    {
      title: 'Custos Operacionais',
      value: 'R$ 12.340,20',
      icon: TrendingDown,
      description: 'R$ 12.340,20 em custos'
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
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Dashboard</h2>
      
      {/* Métricas públicas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {publicMetrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Card key={index} className="bg-adega-charcoal/20 border-white/10 backdrop-blur-xl shadow-xl hover:bg-adega-charcoal/30 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-adega-platinum">
                  {metric.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-adega-gold" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{metric.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Métricas sensíveis - apenas para admin */}
      {userRole === 'admin' && (
        <>
          <h3 className="text-xl font-semibold mt-8 text-white">Métricas Financeiras</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {sensitiveMetrics.map((metric, index) => {
              const Icon = metric.icon;
              return (
                <Card key={index} className="bg-adega-charcoal/20 border-white/10 backdrop-blur-xl shadow-xl hover:bg-adega-charcoal/30 transition-all duration-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-adega-platinum">
                      {metric.title}
                    </CardTitle>
                    <Icon className="h-4 w-4 text-adega-amber" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">{metric.value}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}

      {userRole === 'employee' && (
        <div className="mt-8 p-4 bg-yellow-900/30 border border-yellow-700/50 rounded-lg backdrop-blur-sm">
          <p className="text-sm text-yellow-300">
            Nota: Algumas métricas financeiras e estratégicas estão disponíveis apenas para administradores.
          </p>
        </div>
      )}

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <Card className="bg-adega-charcoal/20 border-white/10 backdrop-blur-xl shadow-xl">
          <CardHeader>
            <CardTitle className="text-adega-yellow">Vendas por Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  formatter={(value) => [`R$ ${value}`, 'Vendas']}
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F3F4F6'
                  }}
                />
                <Bar dataKey="vendas" fill="url(#purpleGradient)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-adega-charcoal/20 border-white/10 backdrop-blur-xl shadow-xl">
          <CardHeader>
            <CardTitle className="text-adega-yellow">Tendência de Vendas</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  formatter={(value) => [`R$ ${value}`, 'Vendas']}
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F3F4F6'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="vendas" 
                  stroke="#10B981" 
                  strokeWidth={4}
                  dot={{ fill: '#10B981', strokeWidth: 3, r: 5 }}
                  activeDot={{ r: 8, stroke: '#10B981', strokeWidth: 3, fill: '#10B981' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Atividades Recentes */}
      <Card className="bg-adega-charcoal/20 border-white/10 backdrop-blur-xl shadow-xl">
        <CardHeader>
          <CardTitle className="text-adega-yellow text-xl font-semibold">Atividades Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center space-x-4 p-4 rounded-xl bg-adega-graphite/30 hover:bg-adega-graphite/50 transition-all duration-200 border border-white/5">
              <div className="p-2 rounded-xl bg-white/10">
                <ShoppingCart className="h-6 w-6 text-white/70" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-adega-platinum">Nova venda realizada</p>
                <p className="text-xs text-adega-silver mt-1">João Silva - R$ 150,00 - Há 5 min</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 p-4 rounded-xl bg-adega-graphite/30 hover:bg-adega-graphite/50 transition-all duration-200 border border-white/5">
              <div className="p-2 rounded-xl bg-white/10">
                <Package className="h-6 w-6 text-white/70" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-adega-platinum">Produto adicionado ao estoque</p>
                <p className="text-xs text-adega-silver mt-1">Vinho Tinto - 12 unidades - Há 15 min</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 p-4 rounded-xl bg-adega-graphite/30 hover:bg-adega-graphite/50 transition-all duration-200 border border-white/5">
              <div className="p-2 rounded-xl bg-white/10">
                <Users className="h-6 w-6 text-white/70" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-adega-platinum">Cliente cadastrado</p>
                <p className="text-xs text-adega-silver mt-1">Maria Santos - Há 1 hora</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 p-4 rounded-xl bg-adega-graphite/30 hover:bg-adega-graphite/50 transition-all duration-200 border border-white/5">
              <div className="p-2 rounded-xl bg-white/10">
                <Truck className="h-6 w-6 text-white/70" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-adega-platinum">Entrega concluída</p>
                <p className="text-xs text-adega-silver mt-1">Pedido #1234 - Há 2 horas</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};