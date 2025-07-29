import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CustomerProfile } from '@/hooks/use-crm';
import { cn } from '@/lib/utils';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface CustomerSegmentsProps {
  customers: CustomerProfile[];
}

export function CustomerSegments({ customers }: CustomerSegmentsProps) {
  // Contar clientes por segmento
  const segmentCounts: Record<string, number> = {};
  customers.forEach(customer => {
    const segment = customer.segment || 'Não definido';
    segmentCounts[segment] = (segmentCounts[segment] || 0) + 1;
  });

  // Preparar dados para o gráfico
  const data = Object.entries(segmentCounts).map(([name, value]) => ({
    name,
    value
  }));

  // Cores para os segmentos
  const COLORS = {
    'VIP': '#9333ea', // purple
    'Regular': '#3b82f6', // blue
    'Novo': '#22c55e', // green
    'Inativo': '#6b7280', // gray
    'Em risco': '#ef4444', // red
    'Não definido': '#d1d5db' // light gray
  };

  // Função para obter a cor do segmento
  const getSegmentColor = (segment: string) => {
    return COLORS[segment as keyof typeof COLORS] || COLORS['Não definido'];
  };

  return (
    <Card className="col-span-1 md:col-span-2">
      <CardHeader>
        <CardTitle>Segmentação de Clientes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="w-full md:w-1/2 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getSegmentColor(entry.name)} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} clientes`, 'Quantidade']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="w-full md:w-1/2 mt-4 md:mt-0 space-y-3">
            {Object.entries(segmentCounts).map(([segment, count]) => (
              <div key={segment} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: getSegmentColor(segment) }}
                  />
                  <span className={cn(
                    "px-2 py-1 rounded-full text-xs font-medium",
                    segment === 'VIP' && "bg-purple-100 text-purple-700",
                    segment === 'Regular' && "bg-blue-100 text-blue-700",
                    segment === 'Novo' && "bg-green-100 text-green-700",
                    segment === 'Inativo' && "bg-gray-100 text-gray-700",
                    segment === 'Em risco' && "bg-red-100 text-red-700",
                    segment === 'Não definido' && "bg-gray-100 text-gray-700"
                  )}>
                    {segment}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium">{count}</span>
                  <span className="text-xs text-muted-foreground ml-1">
                    ({((count / customers.length) * 100).toFixed(1)}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 