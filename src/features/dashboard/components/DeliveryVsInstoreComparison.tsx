/**
 * @fileoverview Comparativo entre vendas delivery e presenciais no dashboard
 * Métricas comparativas e insights de performance entre canais
 * 
 * @author Adega Manager Team
 * @version 1.0.0
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { Button } from '@/shared/ui/primitives/button';
import { Badge } from '@/shared/ui/primitives/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/primitives/select';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { 
  Truck, Store, TrendingUp, TrendingDown, DollarSign, 
  ShoppingCart, Users, Clock, Target, ArrowRight
} from 'lucide-react';
import { cn } from '@/core/config/utils';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';

interface DeliveryVsInstoreComparisonProps {
  className?: string;
}

interface ComparisonData {
  delivery_orders: number;
  delivery_revenue: number;
  delivery_avg_ticket: number;
  instore_orders: number;
  instore_revenue: number;
  instore_avg_ticket: number;
  delivery_growth_rate: number;
  instore_growth_rate: number;
}

export const DeliveryVsInstoreComparison = ({ className }: DeliveryVsInstoreComparisonProps) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('30d');

  const days = selectedPeriod === '7d' ? 7 : selectedPeriod === '30d' ? 30 : 90;

  // Query para dados comparativos básicos para dashboard
  const { data: comparison, isLoading } = useQuery({
    queryKey: ['delivery-vs-instore-dashboard', selectedPeriod],
    queryFn: async (): Promise<ComparisonData> => {
      console.log('📊 Carregando comparativo básico para dashboard...');
      
      const { data, error } = await supabase.rpc('get_delivery_vs_instore_comparison', {
        p_days: days
      });

      if (error) {
        console.error('❌ Erro ao carregar comparativo:', error);
        throw error;
      }

      return data[0] || {
        delivery_orders: 0,
        delivery_revenue: 0,
        delivery_avg_ticket: 0,
        instore_orders: 0,
        instore_revenue: 0,
        instore_avg_ticket: 0,
        delivery_growth_rate: 0,
        instore_growth_rate: 0
      };
    },
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading || !comparison) {
    return (
      <Card className={cn("bg-gray-800/30 border-gray-700/40 backdrop-blur-sm", className)}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-600/30 rounded w-1/2"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-24 bg-gray-600/30 rounded"></div>
              <div className="h-24 bg-gray-600/30 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calcular totais
  const totalOrders = comparison.delivery_orders + comparison.instore_orders;
  const totalRevenue = comparison.delivery_revenue + comparison.instore_revenue;
  
  // Percentuais
  const deliveryOrdersPercent = totalOrders > 0 ? (comparison.delivery_orders / totalOrders) * 100 : 0;

  return (
    <Card className={cn("bg-gray-800/30 border-gray-700/40 backdrop-blur-sm", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-blue-400" />
              <span className="text-gray-400">vs</span>
              <Store className="h-5 w-5 text-green-400" />
            </div>
            Canais de Venda
          </CardTitle>
          
          <Select value={selectedPeriod} onValueChange={(value: any) => setSelectedPeriod(value)}>
            <SelectTrigger className="w-32 bg-black/40 border-white/30 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-900/95 border-white/20 backdrop-blur-xl">
              <SelectItem value="7d" className="text-white hover:bg-white/10">7 dias</SelectItem>
              <SelectItem value="30d" className="text-white hover:bg-white/10">30 dias</SelectItem>
              <SelectItem value="90d" className="text-white hover:bg-white/10">90 dias</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* KPIs básicos para dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-blue-900/20 rounded">
            <Truck className="h-5 w-5 text-blue-400 mx-auto mb-1" />
            <p className="text-xs text-gray-400">Delivery</p>
            <p className="text-lg font-semibold text-white">
              {comparison.delivery_orders}
            </p>
            <p className="text-xs text-blue-400">
              {deliveryOrdersPercent.toFixed(1)}%
            </p>
          </div>
          
          <div className="text-center p-3 bg-green-900/20 rounded">
            <Store className="h-5 w-5 text-green-400 mx-auto mb-1" />
            <p className="text-xs text-gray-400">Presencial</p>
            <p className="text-lg font-semibold text-white">
              {comparison.instore_orders}
            </p>
            <p className="text-xs text-green-400">
              {(100 - deliveryOrdersPercent).toFixed(1)}%
            </p>
          </div>
          
          <div className="text-center p-3 bg-purple-900/20 rounded">
            <DollarSign className="h-5 w-5 text-purple-400 mx-auto mb-1" />
            <p className="text-xs text-gray-400">Receita Total</p>
            <p className="text-lg font-semibold text-white">
              R$ {totalRevenue.toFixed(2)}
            </p>
          </div>
          
          <div className="text-center p-3 bg-orange-900/20 rounded">
            <TrendingUp className="h-5 w-5 text-orange-400 mx-auto mb-1" />
            <p className="text-xs text-gray-400">Melhor Ticket</p>
            <p className="text-sm font-semibold text-white">
              {comparison.delivery_avg_ticket > comparison.instore_avg_ticket ? 'Delivery' : 'Presencial'}
            </p>
            <p className="text-xs text-orange-400">
              R$ {Math.max(comparison.delivery_avg_ticket, comparison.instore_avg_ticket).toFixed(2)}
            </p>
          </div>
        </div>

        {/* Link para relatório completo */}
        <div className="flex items-center justify-center p-3 bg-gray-700/20 rounded border border-gray-600 hover:bg-gray-700/30 transition-colors">
          <Button
            variant="ghost"
            className="text-blue-400 hover:text-blue-300 hover:bg-transparent"
            onClick={() => window.location.href = '/relatorios?tab=delivery'}
          >
            Ver Análise Completa
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DeliveryVsInstoreComparison;