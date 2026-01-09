/**
 * Apresentação pura do Dashboard - Centro de Comando Operacional
 * Layout Bento Grid com KPIs unificados e hierarquia visual clara
 *
 * @version 4.0.0 - Stitch Design System (Gold/Dark)
 */

import React from 'react';
import { PremiumBackground } from '@/shared/ui/composite/PremiumBackground';
import { useNavigate } from 'react-router-dom';

import { motion, Variants } from 'framer-motion';
import { 
  TrendingUp, 
  DollarSign, 
  CreditCard, 
  Truck, 
  Store, 
  Users, 
  Package, 
  AlertTriangle,
  ChevronRight,
  Download,
  Plus
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

import { SalesDataPoint, DashboardCounts, DashboardFinancials } from '@/features/dashboard/hooks/useDashboardData';
import { SalesChartData, TopProduct } from '@/features/dashboard/hooks/useDashboardMetrics';
import { InventoryKpis } from '@/features/dashboard/hooks/useDashboardKpis';
import { getDataPeriodLabel, getNowSaoPaulo, getCurrentMonthLabel } from '../utils/dateHelpers';
import { cn } from '@/core/config/utils';

interface ChannelData {
  delivery_revenue: number;
  instore_revenue: number;
  delivery_orders: number;
  instore_orders: number;
  total_orders: number;
}

export interface DashboardPresentationProps {
  chartData: SalesChartData[];
  topProducts: TopProduct[];
  lowStockProducts?: any[]; // Using any[] temporarily or importing LowStockProduct interface if available
  kpiData: {
    counts: DashboardCounts | undefined;
    financials: DashboardFinancials | undefined;
    inventory: InventoryKpis | undefined;
    channels: ChannelData | undefined;
  };
  loadingStates: {
    general: boolean;
    counts: boolean;
    sales: boolean;
    financials: boolean;
    inventory: boolean;
    channels: boolean;
    topProducts?: boolean;
    lowStock?: boolean;
  };
  errors: {
    salesChart: any;
    topProducts: any;
  };
  userRole: string;
  showEmployeeNote: boolean;
}

export const DashboardPresentation: React.FC<DashboardPresentationProps> = ({
  chartData,
  topProducts,
  lowStockProducts,
  kpiData,
  loadingStates,
  errors,
}) => {
  const navigate = useNavigate();
  const { counts, financials, inventory } = kpiData;

  // Helper safeValue
  const safeValue = (value: unknown, fallback: number = 0): number => {
    if (value === null || value === undefined || isNaN(Number(value)) || !isFinite(Number(value))) {
      return fallback;
    }
    return Number(value);
  };

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value);

  // Animation Variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 50 } }
  };

  return (
    <div className="font-sans antialiased min-h-screen flex flex-col bg-[#050505] text-white overflow-x-hidden">
      <PremiumBackground />


      {/* Main Content Wrapper */}
      <div className="layout-container relative z-10 flex h-full grow flex-col px-4 md:px-8 py-6 max-w-[1600px] mx-auto w-full">
        
        {/* Header */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-10"
        >
          <div className="flex flex-col gap-2">
            <h1 className="text-white text-4xl md:text-5xl font-bold tracking-tight">
              Bem-vinda, <span className="text-primary drop-shadow-[0_0_12px_rgba(244,202,37,0.4)]">Anita</span>
            </h1>
            <p className="text-gray-400 text-lg font-light">
              Resumo executivo da adega • <span className="text-primary/80 font-medium">{getNowSaoPaulo().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </p>
          </div>
          <div className="flex gap-3">
            <button className="bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-primary px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-all backdrop-blur-md">
              <Download size={20} />
              Exportar Relatório
            </button>
            <button 
              onClick={() => navigate('/sales')}
              className="bg-primary hover:bg-primary-dark text-black px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold shadow-[0_0_15px_rgba(244,202,37,0.3)] transition-all"
            >
              <Plus size={20} />
              Novo Pedido
            </button>
          </div>
        </motion.header>

        {/* Main Dashboard Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {/* KPI 1: Faturamento */}
          <motion.div variants={itemVariants} className="group relative overflow-hidden rounded-xl bg-[#121214]/60 p-6 backdrop-blur-xl border border-white/5 shadow-2xl transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_8px_32px_-4px_rgba(244,202,37,0.1)]">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <DollarSign size={64} className="text-primary" />
            </div>
            <div className="flex flex-col gap-1 z-10 relative">
              <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">Faturamento</p>
              <p className="text-white text-3xl font-bold tracking-tight">{formatCurrency(safeValue(financials?.totalRevenue))}</p>
            </div>
            <div className="flex items-center gap-2 z-10 relative mt-4">
              <span className="bg-green-500/10 text-green-400 text-xs font-bold px-2 py-1 rounded-full border border-green-500/20 flex items-center gap-1">
                <TrendingUp size={14} /> +12%
              </span>
              <span className="text-gray-500 text-xs">vs mês anterior</span>
            </div>
          </motion.div>

          {/* KPI 2: A Receber */}
          <motion.div variants={itemVariants} className="group relative overflow-hidden rounded-xl bg-[#121214]/60 p-6 backdrop-blur-xl border border-white/5 shadow-2xl transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_8px_32px_-4px_rgba(244,202,37,0.1)]">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <CreditCard size={64} className="text-white" />
            </div>
            <div className="flex flex-col gap-1 z-10 relative">
              <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">A Receber</p>
              <p className="text-white text-3xl font-bold tracking-tight">{formatCurrency(safeValue(financials?.accountsReceivable))}</p>
            </div>
            <div className="flex items-center gap-2 z-10 relative mt-4">
              <span className="bg-green-500/10 text-green-400 text-xs font-bold px-2 py-1 rounded-full border border-green-500/20 flex items-center gap-1">
                <TrendingUp size={14} /> +5%
              </span>
              <span className="text-gray-500 text-xs">vs mês anterior</span>
            </div>
          </motion.div>

          {/* KPI 3: Base de Clientes */}
          <motion.div variants={itemVariants} className="group relative overflow-hidden rounded-xl bg-[#121214]/60 p-6 backdrop-blur-xl border border-white/5 shadow-2xl transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_8px_32px_-4px_rgba(244,202,37,0.1)]">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Users size={64} className="text-white" />
            </div>
            <div className="flex flex-col gap-1 z-10 relative">
              <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">Total de Clientes</p>
              <p className="text-white text-3xl font-bold tracking-tight">{safeValue(counts?.totalCustomers)}</p>
            </div>
            <div className="flex items-center gap-2 z-10 relative mt-4">
              <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded-full border border-primary/20 flex items-center gap-1">
                <Users size={14} /> VIPs: {safeValue(counts?.vipCustomers)}
              </span>
            </div>
          </motion.div>

          {/* KPI 4: Pending Deliveries */}
          <motion.div variants={itemVariants} className="group relative overflow-hidden rounded-xl bg-[#121214]/60 p-6 backdrop-blur-xl border border-white/5 shadow-2xl transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_8px_32px_-4px_rgba(244,202,37,0.1)]">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Truck size={64} className={cn("text-white transition-colors", safeValue(counts?.pendingDeliveries) > 0 && "text-primary animate-pulse")} />
            </div>
            <div className="flex flex-col gap-1 z-10 relative">
              <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">Entregas Pendentes</p>
              <p className={cn("text-white text-3xl font-bold tracking-tight transition-colors", safeValue(counts?.pendingDeliveries) > 0 && "text-primary")}>
                {safeValue(counts?.pendingDeliveries)}
              </p>
            </div>
            <div className="flex items-center gap-2 z-10 relative mt-4">
              <span className={cn(
                "text-xs font-bold px-2 py-1 rounded-full border flex items-center gap-1 transition-colors",
                safeValue(counts?.pendingDeliveries) > 0 
                  ? "bg-primary/10 text-primary border-primary/20" 
                  : "bg-gray-500/10 text-gray-400 border-gray-500/20"
              )}>
                {safeValue(counts?.pendingDeliveries) > 0 ? "Aguardando Despacho" : "Tudo entregue"}
              </span>
            </div>
          </motion.div>
        </motion.div>
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8"
        >
            {/* Main Chart */}
          <motion.div variants={itemVariants} className="rounded-xl bg-[#121214]/60 p-6 backdrop-blur-xl border border-white/5 shadow-2xl lg:col-span-2 flex flex-col relative min-h-[400px]">
            <div className="flex flex-wrap justify-between items-end gap-4 mb-6">
              <div className="flex flex-col gap-1">
                <h3 className="text-white text-lg font-medium">Tendência de Vendas - {getCurrentMonthLabel().split(' ')[0]}</h3>
                <p className="text-gray-400 text-sm">Visão Diária</p>
              </div>
              <div className="text-right">
                <p className="text-white text-3xl font-bold tracking-tight">{formatCurrency(safeValue(financials?.totalRevenue))}</p>
              </div>
            </div>
            
            <div className="flex-1 w-full min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorGold" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f4ca25" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f4ca25" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="period_label" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 600 }}
                    dy={10}
                    interval="preserveStartEnd"
                  />
                  <YAxis 
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `R$ ${value}`}
                    tick={{ fill: '#6b7280' }} 
                    width={80}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(18, 18, 20, 0.9)', 
                      borderColor: 'rgba(255,255,255,0.1)',
                      color: '#fff',
                      borderRadius: '8px',
                      backdropFilter: 'blur(8px)'
                    }}
                    itemStyle={{ color: '#f4ca25' }}
                    labelStyle={{ color: '#9ca3af', marginBottom: '0.5rem' }}
                    formatter={(value: any) => [`R$ ${value}`, 'Vendas']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#f4ca25" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorGold)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Right Column: Stats & Alerts */}
          <motion.div variants={itemVariants} className="flex flex-col gap-6 lg:col-span-1">
            
            {/* Top Products Card */}
            <div className="rounded-xl bg-[#121214]/60 p-6 backdrop-blur-xl border border-white/5 shadow-2xl flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <TrendingUp className="text-primary" size={20} />
                  <h3 className="text-white text-base font-medium">Top 4 Produtos</h3>
                </div>
                <span className="text-xs text-gray-500">{getDataPeriodLabel()}</span>
              </div>
              
              <div className="flex flex-col gap-3">
                {topProducts && topProducts.length > 0 ? (
                  topProducts.slice(0, 4).map((product, index) => (
                    <div key={product.product_id} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg transition-colors group">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                        index === 0 ? "bg-primary text-black shadow-[0_0_10px_rgba(244,202,37,0.4)]" :
                        index === 1 ? "bg-white/20 text-white" :
                        "bg-white/10 text-gray-400"
                      )}>
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{product.name}</p>
                        <p className="text-gray-500 text-xs">{product.qty} vendidos</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white text-sm font-bold">{formatCurrency(product.revenue)}</p>
                        <p className="text-gray-600 text-[10px]">receita</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    Nenhum dado disponível
                  </div>
                )}
              </div>
            </div>

            {/* Stock Health - Now Dynamic 🟢 🟡 🔴 */}
            <div className="rounded-xl bg-[#121214]/60 p-6 backdrop-blur-xl border border-white/5 shadow-2xl flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <h3 className="text-white text-base font-medium">Saúde do Estoque</h3>
                <div className="bg-gray-800 rounded-lg p-1">
                  <Package className="text-gray-400" size={20} />
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-baseline">
                  <p className="text-gray-400 text-sm">Valor Potencial</p>
                  <p className="text-white text-xl font-bold">{formatCurrency(safeValue(inventory?.potentialRevenue))}</p>
                </div>
                
                {/* Dynamic Top Category */}
                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-300">
                        {inventory?.topCategory?.name || 'N/A'} ({inventory?.topCategory?.percentage || 0}%)
                      </span>
                      <span className="text-primary">High Value</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-800/50 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full shadow-[0_0_10px_rgba(244,202,37,0.4)]" 
                        style={{ width: `${Math.min(inventory?.topCategory?.percentage || 0, 100)}%` }} 
                      />
                    </div>
                  </div>
                </div>

                {/* Dynamic Health Status based on Stockout Ratio */}
                {(() => {
                  const status = inventory?.stockHealth?.status || 'warning';
                  const statusConfigs = {
                    excellent: { color: 'bg-green-500', text: 'text-green-400', label: 'Excelente' },
                    good: { color: 'bg-blue-500', text: 'text-blue-400', label: 'Bom' },
                    warning: { color: 'bg-yellow-500', text: 'text-yellow-400', label: 'Atenção' },
                    critical: { color: 'bg-red-500', text: 'text-red-400', label: 'Crítico' }
                  };
                  const config = statusConfigs[status];
                  
                  return (
                    <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={cn("w-2 h-2 rounded-full animate-pulse", config.color)} />
                        <p className={cn("text-xs font-medium", config.text)}>Status: {config.label}</p>
                      </div>
                      {/* Optional: Show stockout ratio context */}
                      <span className="text-[10px] text-gray-500 capitalize">
                         {inventory?.stockHealth?.stockoutPercentage || 0}% de ruptura
                      </span>
                    </div>
                  );
                })()}

              </div>
            </div>

            {/* Replenishment Alert - Now Dynamic 🟢 🟡 🔴 */}
            {(() => {
              const stockCount = safeValue(inventory?.lowStockCount);
              const products = loadingStates.lowStock ? [] : (lowStockProducts || []);
              
              // Determine Severity
              let status: 'ok' | 'warning' | 'critical' = 'ok';
              if (stockCount > 0) {
                // If any product has 0 stock -> Critical. Otherwise -> Warning.
                const hasZeroStock = products.some(p => p.current_stock === 0);
                // Fallback: if we have count > 0 but no products loaded yet/error, assume critical for safety
                status = hasZeroStock ? 'critical' : 'warning';
              }

              // Configs
              const statusConfig = {
                ok: {
                  borderColor: 'border-l-green-500/80',
                  headerBg: 'bg-green-500/10',
                  icon: <Package className="text-green-400" size={20} />,
                  title: 'Estoque Saudável',
                  badge: { text: 'Online', style: 'bg-green-500/20 text-green-300' },
                  message: 'Nenhum item abaixo do mínimo.',
                  countText: 'Operação 100%'
                },
                warning: {
                  borderColor: 'border-l-yellow-500/80',
                  headerBg: 'bg-yellow-500/10',
                  icon: <AlertTriangle className="text-yellow-400" size={20} />,
                  title: 'Atenção ao Estoque',
                  badge: { text: 'Alerta', style: 'bg-yellow-500/20 text-yellow-300' },
                  message: 'Itens próximos do fim.',
                  countText: `${stockCount} itens abaixo do mínimo`
                },
                critical: {
                  borderColor: 'border-l-red-500/80',
                  headerBg: 'bg-red-500/10',
                  icon: <AlertTriangle className="text-red-400 animate-pulse" size={20} />,
                  title: 'Ruptura de Estoque',
                  badge: { text: 'Urgente', style: 'bg-red-500/20 text-red-300' },
                  message: 'Reposição Imediata Necessária.',
                  countText: `${stockCount} itens com ruptura`
                }
              };

              const config = statusConfig[status];

              return (
                <div className={cn(
                  "rounded-xl bg-[#121214]/60 p-0 overflow-hidden backdrop-blur-xl border border-white/5 shadow-2xl flex flex-col h-full transition-all duration-300",
                  config.borderColor,
                  "border-l-4"
                )}>
                  <div className={cn("p-4 border-b border-white/5 flex justify-between items-center", config.headerBg)}>
                    <div className="flex items-center gap-2">
                      {config.icon}
                      <h3 className="text-white text-base font-medium">{config.title}</h3>
                    </div>
                    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded uppercase", config.badge.style)}>
                      {config.badge.text}
                    </span>
                  </div>
                  
                  <div className="flex flex-col p-2 flex-1 justify-between">
                    <div 
                      className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-lg transition-colors group cursor-pointer"
                      onClick={() => navigate('/inventory')}
                    >
                      <div className="w-10 h-10 rounded-md bg-gray-800 overflow-hidden relative border border-white/10 group-hover:border-primary/50 transition-colors flex items-center justify-center">
                        <Package className={cn("size-18", status === 'ok' ? "text-green-500" : "text-gray-500")} size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-sm font-medium truncate group-hover:text-primary transition-colors", status === 'ok' ? "text-green-400" : "text-white")}>
                          {status === 'ok' ? 'Tudo Certo' : 'Verificar Lista'}
                        </p>
                        <p className={cn("text-xs", status === 'critical' ? "text-red-400" : status === 'warning' ? "text-yellow-400" : "text-gray-400")}>
                           {status === 'ok' ? config.message : config.countText}
                        </p>
                      </div>
                      <button className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-white/10">
                        <ChevronRight size={18} />
                      </button>
                    </div>

                    <div className="mt-2 px-2 pb-2">
                      <button onClick={() => navigate('/inventory')} className="w-full py-2 text-xs font-medium text-center text-gray-400 hover:text-white hover:bg-white/5 rounded transition-colors uppercase tracking-wider">
                        {status === 'ok' ? 'Ver Inventário' : 'Gerenciar Reposição'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};
