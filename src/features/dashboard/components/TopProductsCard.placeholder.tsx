import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { ExternalLink } from 'lucide-react';
import { PlaceholderBadge } from './PlaceholderBadge';

interface TopProduct {
  id: string;
  name: string;
  category: string;
  qty: number;
  revenue: number;
}

const MOCK_TOP_PRODUCTS: TopProduct[] = [
  { id: '1', name: 'Vinho Reserva A', category: 'Tintos', qty: 42, revenue: 4200 },
  { id: '2', name: 'Espumante Premium', category: 'Espumantes', qty: 35, revenue: 3850 },
  { id: '3', name: 'Branco Seco B', category: 'Brancos', qty: 28, revenue: 2520 },
  { id: '4', name: 'Rosé Provence', category: 'Rosés', qty: 22, revenue: 1980 },
  { id: '5', name: 'Vinho do Porto', category: 'Fortificados', qty: 15, revenue: 2550 },
];

export function TopProductsCard(): JSX.Element {
  const formatCurrency = (value: number): string =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  return (
    <Card className="relative border-white/20 bg-black/80 backdrop-blur-xl shadow-lg">
      <PlaceholderBadge />
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white">Top 5 Produtos (Mês)</CardTitle>
          <span className="text-[10px] px-2 py-1 rounded-full border border-red-400/60 text-red-300">
            PLACEHOLDER / MOCK DATA
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <ul className="space-y-2">
          {MOCK_TOP_PRODUCTS.map((product, index) => (
            <li
              key={product.id}
              className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2"
            >
              <div className="flex items-center gap-3">
                <span className="w-6 text-xs text-amber-400 font-mono">{index + 1}.</span>
                <div>
                  <div className="text-sm text-white">{product.name}</div>
                  <div className="text-xs text-gray-400">{product.category}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-amber-300">{formatCurrency(product.revenue)}</div>
                <div className="text-xs text-gray-400">{product.qty} un</div>
              </div>
            </li>
          ))}
        </ul>

        <a
          href="/reports?tab=sales&view=top-products"
          className="text-xs text-amber-400 hover:text-amber-300 transition flex items-center gap-1"
        >
          Ver relatório completo
          <ExternalLink className="h-3 w-3" />
        </a>
      </CardContent>
    </Card>
  );
}

