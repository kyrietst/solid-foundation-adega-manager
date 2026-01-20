/**
 * Tabela de movimentações com Composite UI
 * Estrutura visual baseada em CustomerTable (Master)
 * Detalhes baseados em RecentSales (Detail)
 */

import React, { useState } from 'react';
import { InventoryMovement } from '@/core/types/inventory.types';
import { Customer } from '@/features/movements/hooks/useMovements';
import { Badge } from '@/shared/ui/primitives/badge';
import { Button } from '@/shared/ui/primitives/button';
import {
  ChevronDown,
  ChevronUp,
  CreditCard,
  User,
  Store,
  Truck,
  Package,
  FileText,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/core/config/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MovementsTableProps {
  movements: InventoryMovement[];
  productsMap: Record<string, { name: string; price: number }>;
  usersMap: Record<string, string>;
  typeInfo: Record<string, { label: string; color: string }>;
  customers: Customer[];
  salesMap?: Record<string, { delivery_type?: string }>;
  maxRows?: number;
  isLoading?: boolean;
}

export const MovementsTable: React.FC<MovementsTableProps> = ({
  movements,
  usersMap,
  isLoading = false,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="w-full h-64 flex flex-col items-center justify-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-adega-gold"></div>
        <p className="text-adega-platinum/60 text-sm animate-pulse">Carregando movimentações...</p>
      </div>
    );
  }

  if (movements.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-adega-charcoal/20 border border-white/5 rounded-2xl">
        <div className="bg-white/5 p-4 rounded-full mb-4">
          <Package className="h-8 w-8 text-zinc-500" />
        </div>
        <h3 className="text-lg font-bold text-zinc-300">Nenhuma movimentação</h3>
        <p className="text-sm text-center max-w-md mt-1 text-zinc-500">
          O histórico de movimentações aparecerá aqui.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Table Container - Style matched to CustomerTable */}
      <div className="bg-adega-charcoal/20 border border-white/5 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/5">
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider font-display">Tipo / ID</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider font-display">Data</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider font-display">Produto / Descrição</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider font-display">Responsável</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider font-display text-center">Qtd.</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider font-display text-right w-20">Detalhes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.02]">
              {movements.map((movement) => {
                const sale = movement.sales;
                const isSale = !!sale;
                const isExpanded = expandedId === movement.id;
                const date = new Date(movement.created_at);
                
                // Tipos de Movimento (Badges)
                const isEntry = ['purchase', 'stock_transfer_in', 'manual_entry', 'return'].includes(movement.type);
                const isExit = ['sale', 'stock_transfer_out', 'manual_exit', 'loss', 'gift'].includes(movement.type);
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const isAdjustment = movement.type === 'inventory_adjustment';

                const typeLabel = {
                  'sale': 'Venda',
                  'purchase': 'Compra',
                  'inventory_adjustment': 'Ajuste',
                  'stock_transfer_in': 'Transf. (Entrada)',
                  'stock_transfer_out': 'Transf. (Saída)',
                  'manual_entry': 'Entrada Manual',
                  'manual_exit': 'Saída Manual',
                  'return': 'Devolução',
                  'loss': 'Perda',
                  'gift': 'Brinde'
                }[movement.type] || movement.type;

                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const amount = isSale ? sale.final_amount : 0;

                return (
                  <React.Fragment key={movement.id}>
                    <tr 
                      className={cn(
                        "group transition-colors duration-200 border-b border-white/[0.02] last:border-0",
                        isExpanded ? "bg-white/[0.04]" : "hover:bg-white/[0.03]"
                      )}
                    >
                      {/* Tipo / ID */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1.5">
                          <span className={cn(
                            "inline-flex items-center w-fit px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border",
                            isEntry ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                            isExit ? "bg-rose-500/10 text-rose-400 border-rose-500/20" :
                            "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          )}>
                             {isEntry ? <ArrowDownLeft className="w-3 h-3 mr-1" /> : 
                              isExit ? <ArrowUpRight className="w-3 h-3 mr-1" /> : 
                              <RefreshCw className="w-3 h-3 mr-1" />}
                            {typeLabel}
                          </span>
                          <span className="text-[10px] font-mono text-zinc-600 group-hover:text-zinc-500 transition-colors">
                            #{movement.id.slice(0, 8)}
                          </span>
                        </div>
                      </td>

                      {/* Data */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-sm text-zinc-300 font-medium">
                            {format(date, 'dd/MM/yyyy', { locale: ptBR })}
                          </span>
                          <span className="text-xs text-zinc-600">
                            {format(date, 'HH:mm')}
                          </span>
                        </div>
                      </td>

                      {/* Produto / Descrição */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {movement.products ? (
                            <>
                              <div className="h-8 w-8 rounded bg-zinc-800/50 flex items-center justify-center border border-white/5 shrink-0">
                                <Package className="h-4 w-4 text-zinc-400" />
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="text-sm font-medium text-zinc-200 truncate max-w-[200px]" title={movement.products.name}>
                                  {movement.products.name}
                                </span>
                                {isSale && sale && (
                                  <span className="text-xs text-zinc-500 flex items-center gap-1">
                                    {sale.delivery ? <Truck className="w-3 h-3" /> : <Store className="w-3 h-3" />}
                                    {sale.customer?.name || 'Consumidor Final'}
                                  </span>
                                )}
                              </div>
                            </>
                          ) : (
                            <div className="flex flex-col">
                              <span className="text-sm text-zinc-400 italic">
                                {isSale ? 'Venda (Múltiplos Itens)' : 'Movimentação sem produto'}
                              </span>
                              {movement.reason && (
                                <span className="text-xs text-zinc-600 truncate max-w-[200px]">
                                  "{movement.reason}"
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Responsável */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-500">
                             {(usersMap[movement.user_id || ''] || movement.user?.name || 'S').charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm text-zinc-400">
                            {usersMap[movement.user_id || ''] || movement.user?.name || 'Sistema'}
                          </span>
                        </div>
                      </td>

                      {/* Quantidade */}
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={cn(
                          "text-sm font-bold font-mono",
                          isEntry ? "text-emerald-400" : 
                          isExit ? "text-rose-400" : 
                          "text-amber-400"
                        )}>
                          {Number(movement.quantity) > 0 ? '+' : ''}{Number(movement.quantity)}
                        </span>
                      </td>

                      {/* Detalhes Toggle */}
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        {(isSale || movement.reason) && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleExpand(movement.id)}
                            className={cn(
                              "h-8 w-8 rounded-lg transition-all",
                              isExpanded 
                                ? "bg-adega-gold/10 text-adega-gold" 
                                : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
                            )}
                          >
                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </Button>
                        )}
                      </td>
                    </tr>

                    {/* EXPANDED ROW - COMPOSITE UI DETAIL */}
                    {isExpanded && (
                      <tr className="bg-transparent">
                        <td colSpan={6} className="p-0 border-none">
                          <div className="transform origin-top animate-in slide-in-from-top-2 duration-300">
                            
                            {/* Inner Container matched to RecentSales/Cart Item style */}
                            <div className="bg-black/40 border-y border-white/5 shadow-inner">
                              <div className="px-6 py-4 max-w-4xl mx-auto space-y-4">
                                
                                {/* Header Expansão */}
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2 text-adega-gold text-xs font-bold uppercase tracking-wider">
                                    <FileText className="h-3 w-3" />
                                    Detalhes da Operação
                                  </div>
                                  {isSale && sale && (
                                    <Badge variant="outline" className="text-[10px] border-white/10 text-zinc-400 bg-white/5">
                                      Pedido #{sale.order_number}
                                    </Badge>
                                  )}
                                </div>

                                {/* CONTEÚDO PRINCIPAL (Cart Style) */}
                                <div className="space-y-2">
                                  {/* Listagem de Itens (Se for Venda) */}
                                  {isSale && sale?.sale_items ? (
                                    sale.sale_items.map((item, idx) => (
                                      <div key={idx} className="flex items-center gap-4 bg-white/[0.02] p-3 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                                        {/* Thumbnail / Icon */}
                                        <div className="h-10 w-10 rounded-lg bg-zinc-900 border border-white/5 flex items-center justify-center shrink-0">
                                          <Package className="h-5 w-5 text-zinc-500" />
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                          <p className="text-sm font-medium text-white truncate">{item.products?.name || item.product_id}</p>
                                          <p className="text-xs text-zinc-500">{formatCurrency(item.unit_price)} un</p>
                                        </div>

                                        {/* Qtd Badge */}
                                        <div className="bg-zinc-900 rounded-md px-2 py-1 border border-white/5 text-xs text-zinc-300 font-mono">
                                          {item.quantity}x
                                        </div>

                                        {/* Total Item */}
                                        <div className="text-sm font-bold text-white w-24 text-right">
                                          {formatCurrency(item.unit_price * item.quantity)}
                                        </div>
                                      </div>
                                    ))
                                  ) : (
                                    /* Single Product Movement Detail */
                                    <div className="flex items-center gap-4 bg-white/[0.02] p-3 rounded-xl border border-white/5">
                                      <div className="h-10 w-10 rounded-lg bg-zinc-900 border border-white/5 flex items-center justify-center shrink-0">
                                        {movement.type === 'inventory_adjustment' ? <RefreshCw className="h-5 w-5 text-amber-500" /> : <Package className="h-5 w-5 text-zinc-500" />}
                                      </div>
                                      <div className="flex-1">
                                        <p className="text-sm font-medium text-white">{movement.products?.name || 'Produto'}</p>
                                        <p className="text-xs text-zinc-500">Movimentação Individual</p>
                                      </div>
                                      <div className={cn(
                                        "bg-zinc-900 rounded-md px-2 py-1 border border-white/5 text-xs font-mono",
                                        Number(movement.quantity) > 0 ? "text-emerald-400" : "text-rose-400"
                                      )}>
                                        {Number(movement.quantity) > 0 ? '+' : ''}{Number(movement.quantity)}
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* FOOTER: Totals & Info (RecentSales Style) */}
                                <div className="flex flex-col md:flex-row gap-4 pt-2">
                                  
                                  {/* Left: Notes */}
                                  <div className="flex-1">
                                    {(movement.reason || (isSale && sale?.notes)) && (
                                      <div className="bg-zinc-900/50 rounded-lg p-3 border border-white/5 h-full">
                                        <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Observações</p>
                                        <p className="text-sm text-zinc-300 italic">
                                          "{movement.reason || sale?.notes}"
                                        </p>
                                      </div>
                                    )}
                                  </div>

                                  {/* Right: Financial Summary */}
                                  {isSale && sale && (
                                    <div className="min-w-[240px] bg-zinc-900/80 border border-white/10 rounded-xl p-4 backdrop-blur-xl">
                                      <div className="space-y-2 text-sm">
                                        <div className="flex justify-between text-zinc-400">
                                          <span>Subtotal</span>
                                          <span>{formatCurrency(sale.total_amount)}</span>
                                        </div>
                                        {sale.discount_amount > 0 && (
                                          <div className="flex justify-between text-rose-400">
                                            <span>Desconto</span>
                                            <span>- {formatCurrency(sale.discount_amount)}</span>
                                          </div>
                                        )}
                                        {sale.delivery_fee > 0 && (
                                          <div className="flex justify-between text-amber-400">
                                            <span>Entrega</span>
                                            <span>+ {formatCurrency(sale.delivery_fee)}</span>
                                          </div>
                                        )}
                                        <div className="border-t border-white/10 pt-2 mt-2 flex justify-between items-center">
                                          <span className="text-white font-medium">Total</span>
                                          <span className="text-lg font-bold text-adega-gold">{formatCurrency(sale.final_amount)}</span>
                                        </div>
                                        <div className="pt-2 flex items-center justify-between text-xs text-zinc-500">
                                          <div className="flex items-center gap-1">
                                            <CreditCard className="h-3 w-3" />
                                            <span className="capitalize">{sale.payment_method}</span>
                                          </div>
                                          <span className={cn(
                                            "px-1.5 py-0.5 rounded capitalize",
                                            sale.payment_status === 'paid' ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"
                                          )}>
                                            {sale.payment_status === 'paid' ? 'Pago' : 'Pendente'}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};