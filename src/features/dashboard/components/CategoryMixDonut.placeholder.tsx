import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { PlaceholderBadge } from './PlaceholderBadge';

interface CategoryMixItem {
  category: string;
  revenue: number;
}

const MOCK_CATEGORY_MIX: CategoryMixItem[] = [
  { category: 'Tintos', revenue: 5400 },
  { category: 'Brancos', revenue: 2800 },
  { category: 'Espumantes', revenue: 3600 },
  { category: 'Rosés', revenue: 1800 },
  { category: 'Fortificados', revenue: 2200 },
];

const COLORS = ['#F59E0B', '#FBBF24', '#34D399', '#60A5FA', '#A78BFA'];

export function CategoryMixDonut(): JSX.Element {
  const formatCurrency = (value: number): string =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  return (
    <Card className="relative border-white/20 bg-black/80 backdrop-blur-xl shadow-lg">
      <PlaceholderBadge />
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white">Mix por Categoria</CardTitle>
          <span className="text-[10px] px-2 py-1 rounded-full border border-red-400/60 text-red-300">
            PLACEHOLDER / MOCK DATA
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={MOCK_CATEGORY_MIX}
                dataKey="revenue"
                nameKey="category"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={4}
              >
                {MOCK_CATEGORY_MIX.map((_, i) => (
                  <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [formatCurrency(value), 'Receita']}
                itemStyle={{ color: '#E5E7EB' }}
                contentStyle={{
                  background: 'rgba(0,0,0,0.9)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 12,
                }}
                labelStyle={{
                  color: '#E5E7EB',
                  fontWeight: '600'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {MOCK_CATEGORY_MIX.map((data, i) => (
            <div key={data.category} className="flex items-center gap-2">
              <span
                className="inline-block w-2 h-2 rounded-full"
                style={{ background: COLORS[i % COLORS.length] }}
              />
              <span className="text-gray-300">{data.category}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

