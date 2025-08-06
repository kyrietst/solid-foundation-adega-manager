import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { CustomerProfile } from '@/features/customers/hooks/use-crm';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CustomerTrendsProps {
  salesData: Array<{
    id: string;
    customer_id: string;
    total_amount: number;
    created_at: string;
  }>;
  customers: CustomerProfile[];
}

export function CustomerTrends({ salesData, customers }: CustomerTrendsProps) {
  // Preparar dados para o gráfico de tendência mensal
  const getMonthlyTrendData = () => {
    const now = new Date();
    const monthsData = [];
    
    // Criar dados para os últimos 6 meses
    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(now, i);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);
      
      const monthSales = salesData.filter(sale => {
        const saleDate = new Date(sale.created_at);
        return saleDate >= monthStart && saleDate <= monthEnd;
      });
      
      const totalRevenue = monthSales.reduce((sum, sale) => sum + Number(sale.total_amount), 0);
      const averageTicket = monthSales.length > 0 ? totalRevenue / monthSales.length : 0;
      
      monthsData.push({
        name: format(monthDate, 'MMM', { locale: ptBR }),
        revenue: totalRevenue,
        sales: monthSales.length,
        average: averageTicket
      });
    }
    
    return monthsData;
  };
  
  // Preparar dados para o gráfico de segmentos
  const getSegmentRevenueData = () => {
    const segmentRevenue: Record<string, number> = {};
    
    salesData.forEach(sale => {
      const customer = customers.find(c => c.id === sale.customer_id);
      if (customer) {
        const segment = customer.segment || 'Não definido';
        segmentRevenue[segment] = (segmentRevenue[segment] || 0) + Number(sale.total_amount);
      }
    });
    
    return Object.entries(segmentRevenue).map(([name, value]) => ({
      name,
      value: Number(value.toFixed(2))
    }));
  };
  
  const monthlyTrendData = getMonthlyTrendData();
  const segmentRevenueData = getSegmentRevenueData();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="col-span-1 md:col-span-2">
        <CardHeader>
          <CardTitle>Tendência de Vendas Mensais</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={monthlyTrendData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip 
                  formatter={(value, name) => {
                    if (name === 'revenue') return [`R$ ${Number(value).toFixed(2)}`, 'Receita'];
                    if (name === 'sales') return [value, 'Vendas'];
                    if (name === 'average') return [`R$ ${Number(value).toFixed(2)}`, 'Ticket Médio'];
                    return [value, name];
                  }}
                />
                <Legend />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="revenue" 
                  name="Receita" 
                  stroke="#8884d8" 
                  activeDot={{ r: 8 }} 
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="sales" 
                  name="Vendas" 
                  stroke="#82ca9d" 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-adega-charcoal/20 border-white/10 backdrop-blur-xl shadow-xl">
        <CardHeader>
          <CardTitle>Receita por Segmento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={segmentRevenueData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`R$ ${Number(value).toFixed(2)}`, 'Receita']} />
                <Legend />
                <Bar dataKey="value" name="Receita" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-adega-charcoal/20 border-white/10 backdrop-blur-xl shadow-xl">
        <CardHeader>
          <CardTitle>Estatísticas de Vendas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Total de Vendas</p>
              <p className="text-2xl font-bold">{salesData.length}</p>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground">Receita Total</p>
              <p className="text-2xl font-bold">
                R$ {salesData.reduce((sum, sale) => sum + Number(sale.total_amount), 0).toFixed(2)}
              </p>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground">Ticket Médio</p>
              <p className="text-2xl font-bold">
                R$ {salesData.length > 0 
                  ? (salesData.reduce((sum, sale) => sum + Number(sale.total_amount), 0) / salesData.length).toFixed(2) 
                  : '0.00'}
              </p>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground">Clientes com Compras</p>
              <p className="text-2xl font-bold">
                {new Set(salesData.map(sale => sale.customer_id)).size}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 