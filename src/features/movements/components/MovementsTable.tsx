/**
 * Tabela de movimentações - Refatorada para Layout Legacy/Expandable
 * Restaura o design antigo com colunas específicas e expansão de detalhes
 */

import React, { useState } from 'react';
import { InventoryMovement } from '@/core/types/inventory.types';
import { Customer } from '@/features/movements/hooks/useMovements';
import { Badge } from '@/shared/ui/primitives/badge';
import { Button } from '@/shared/ui/primitives/button';
import {
  Eye,
  ChevronDown,
  ChevronUp,
  CreditCard,
  CalendarDays,
  User,
  Store,
  Truck,
  Package,
  FileText
} from 'lucide-react';
import { cn } from '@/core/config/utils';
import { shadows, text } from '@/core/config/theme';
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

  // Helpers de formatação
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getPaymentBadge = (method?: string, status?: string) => {
    if (!method) return <span className="text-gray-500">-</span>;

    const methodLabel = {
      'credit_card': 'Crédito',
      'debit_card': 'Débito',
      'pix': 'PIX',
      'cash': 'Dinheiro',
      'bank_transfer': 'Transf.',
      'other': 'Outro'
    }[method] || method;

    const statusColor = status === 'paid' ? 'bg-emerald-500/20 text-emerald-400' :
      status === 'pending' ? 'bg-amber-500/20 text-amber-400' :
        'bg-red-500/20 text-red-400';

    const statusLabel = status === 'paid' ? 'Pago' :
      status === 'pending' ? 'Pendente' :
        'Cancelado';

    return (
      <div className="flex flex-col gap-1 items-start">
        <div className="flex items-center gap-1.5 text-xs font-medium text-gray-300">
          <CreditCard className="h-3 w-3" />
          {methodLabel}
        </div>
        <span className={cn("text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider font-bold", statusColor)}>
          {statusLabel}
        </span>
      </div>
    );
  };

  const getStatusBadge = (status?: string, type?: string) => {
    // Se não tiver status de venda, usa o tipo de movimentação
    // Se não tiver status de venda, usa o tipo de movimentação
    if (!status) {
      const typeTranslations: Record<string, string> = {
        'inventory_adjustment': 'Ajuste de Estoque',
        'stock_transfer_out': 'Transferência (Saída)',
        'stock_transfer_in': 'Transferência (Entrada)',
        'sale': 'Venda',
        'purchase': 'Compra',
        'return': 'Devolução',
        'loss': 'Perda',
        'gift': 'Brinde/Bonificação',
        'manual_entry': 'Entrada Manual',
        'manual_exit': 'Saída Manual'
      };

      return (
        <Badge variant="outline" className="bg-gray-500/10 text-gray-400 border-gray-500/30">
          {typeTranslations[type || ''] || type || 'N/A'}
        </Badge>
      );
    }

    const styles = {
      'completed': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      'pending': 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      'cancelled': 'bg-red-500/10 text-red-400 border-red-500/30',
      'returned': 'bg-purple-500/10 text-purple-400 border-purple-500/30'
    }[status.toLowerCase()] || 'bg-gray-500/10 text-gray-400 border-gray-500/30';

    const label = {
      'completed': 'Concluído',
      'pending': 'Pendente',
      'cancelled': 'Cancelado',
      'returned': 'Devolvido'
    }[status.toLowerCase()] || status;

    return (
      <Badge variant="outline" className={cn("backdrop-blur-sm", styles)}>
        {label}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="w-full h-40 flex items-center justify-center text-gray-400">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-yellow mr-2"></div>
        Carregando movimentações...
      </div>
    );
  }

  if (movements.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-400">
        <FileText className="h-12 w-12 mb-4 opacity-50" />
        <p>Nenhuma movimentação encontrada</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden rounded-lg border border-white/10 bg-black/40 backdrop-blur-md">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs uppercase bg-black/60 text-gray-400 border-b border-white/10 sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 font-semibold">ID</th>
              <th className="px-4 py-3 font-semibold text-center">Canal</th>
              <th className="px-4 py-3 font-semibold">Data</th>
              <th className="px-4 py-3 font-semibold">Cliente</th>
              <th className="px-4 py-3 font-semibold">Vendedor</th>
              <th className="px-4 py-3 font-semibold">Pagamento</th>
              <th className="px-4 py-3 font-semibold text-center">Status</th>
              <th className="px-4 py-3 font-semibold text-right">Valor</th>
              <th className="px-4 py-3 font-semibold text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {movements.map((movement) => {
              // Preparar dados
              const sale = movement.sales;
              const isSale = !!sale;
              // FIX: Lint error - Property 'date' does not exist (using created_at as standard)
              const date = new Date(movement.created_at);

              const idDisplay = isSale ? `#${sale.id.slice(0, 8).toUpperCase()}` : `#${movement.id.slice(0, 8).toUpperCase()}`;

              // Helper para detectar delivery robustamente
              const isDeliveryType = isSale && (sale.delivery === true || (sale.delivery_fee || 0) > 0);

              // Cliente - Prioriza: Cliente do Movimento -> Cliente da Venda -> Fallback específico
              const customerName = movement.customer?.name
                || sale?.customer?.name
                || (isDeliveryType ? 'Cliente (Delivery)' : (isSale ? 'Cliente Balcão' : 'Não informado'));

              // Vendedor
              const sellerName = usersMap[movement.user_id || ''] || movement.user?.name || 'Sistema';

              // Valor
              const amount = isSale ? sale.final_amount : movement.amount;
              const itemsCount = sale?.sale_items?.length || (movement.quantity ? 1 : 0);

              const isExpanded = expandedId === movement.id;

              return (
                <React.Fragment key={movement.id}>
                  <tr
                    className={cn(
                      "hover:bg-white/5 transition-colors duration-200 group",
                      isExpanded && "bg-white/5"
                    )}
                  >
                    {/* ID */}
                    <td className="px-4 py-3 font-mono text-gray-400 group-hover:text-primary-yellow transition-colors">
                      {idDisplay}
                    </td>

                    {/* Canal (Delivery/Presencial) */}
                    <td className="px-4 py-3 text-center">
                      {isDeliveryType ? (
                        <div className="flex justify-center" title="Delivery">
                          <div className="bg-amber-500/10 p-1.5 rounded-full border border-amber-500/30">
                            <Truck className="h-4 w-4 text-amber-400" />
                          </div>
                        </div>
                      ) : isSale ? (
                        <div className="flex justify-center" title="Presencial / Retirada">
                          <div className="bg-blue-500/10 p-1.5 rounded-full border border-blue-500/30">
                            <Store className="h-4 w-4 text-blue-400" />
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-600">-</span>
                      )}
                    </td>

                    {/* Data */}
                    <td className="px-4 py-3 text-gray-300">
                      <div className="flex flex-col">
                        <span className="font-medium">{format(date, 'dd/MM/yyyy')}</span>
                        <span className="text-xs text-gray-500">{format(date, 'HH:mm')}</span>
                      </div>
                    </td>

                    {/* Cliente */}
                    <td className="px-4 py-3 text-gray-300">
                      <div className="flex items-center gap-2">
                        <User className="h-3 w-3 text-gray-500" />
                        <span className="truncate max-w-[150px]" title={customerName}>
                          {customerName}
                        </span>
                      </div>
                    </td>

                    {/* Vendedor */}
                    <td className="px-4 py-3 text-gray-300">
                      <div className="flex items-center gap-2">
                        <span className="truncate max-w-[150px]" title={sellerName}>
                          {sellerName}
                        </span>
                      </div>
                    </td>

                    {/* Pagamento */}
                    <td className="px-4 py-3">
                      {isSale ? getPaymentBadge(sale.payment_method, sale.payment_status) : <span className="text-gray-600">-</span>}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3 text-center">
                      {getStatusBadge(sale?.status, movement.type)}
                    </td>

                    {/* Valor */}
                    <td className="px-4 py-3 text-right">
                      <div className="flex flex-col items-end">
                        <span className={cn("font-bold text-emerald-400", !amount && !movement.quantity && "text-gray-500")}>
                          {isSale
                            ? (amount ? formatCurrency(typeof amount === 'number' ? amount : 0) : 'R$ 0,00')
                            : (
                              <span>{Math.abs(Number(movement.quantity) || 0)} <span className="text-xs font-normal text-gray-400">{movement.products?.unit_type || 'un'}</span></span>
                            )
                          }
                        </span>
                        {itemsCount > 0 && (
                          <span className="text-[10px] text-gray-500">
                            {itemsCount} {itemsCount === 1 ? 'item' : 'itens'}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Ações */}
                    <td className="px-4 py-3 text-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          "h-8 w-8 hover:bg-primary-yellow/20 hover:text-primary-yellow transition-all",
                          isExpanded && "text-primary-yellow bg-primary-yellow/10"
                        )}
                        onClick={() => toggleExpand(movement.id)}
                        disabled={!isSale && !movement.reason}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>

                  {/* Detalhes Expandidos */}
                  {isExpanded && (() => {
                    return (
                      <tr className="bg-transparent">
                        <td colSpan={8} className="p-0 border-none">
                          <div className="mt-2 mx-4 mb-4 border-t border-white/20 bg-white/5 backdrop-blur-sm rounded-lg p-4 animate-in slide-in-from-top-2 duration-300">

                            {/* Cabeçalho dos detalhes */}
                            <div className="flex items-center gap-2 mb-3">
                              <Package className="h-4 w-4 text-emerald-400" />
                              <h4 className={cn(text.h4, shadows.medium, "font-medium text-emerald-400")}>
                                Itens da venda ({sale?.sale_items?.length || 0})
                              </h4>
                            </div>

                            {/* Lista de Itens */}
                            {(sale?.sale_items && sale.sale_items.length > 0) || (!isSale && movement.products) ? (
                              <div className="space-y-3">
                                {isSale && sale?.sale_items ? (
                                  sale.sale_items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center text-sm bg-black/30 rounded-lg p-3 border border-white/10">
                                      <div className="flex items-center gap-3">
                                        <div className="bg-blue-500/20 text-blue-400 rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold">
                                          {item.quantity}
                                        </div>
                                        <div>
                                          <span className={cn(text.h5, shadows.light, "font-medium text-white")}>
                                            {item.products?.name || item.product_id}
                                          </span>
                                          <div className="text-xs text-gray-400">
                                            {formatCurrency(item.unit_price)} por unidade
                                          </div>
                                        </div>
                                      </div>
                                      <div className={cn(text.h4, shadows.light, "font-bold text-emerald-400")}>
                                        {formatCurrency(item.unit_price * item.quantity)}
                                      </div>
                                    </div>
                                  ))
                                ) : (
                                  // Caso não seja venda (Movimentação Manual)
                                  <div className="flex justify-between items-center text-sm bg-black/30 rounded-lg p-3 border border-white/10">
                                    <div className="flex items-center gap-3">
                                      <div className="bg-amber-500/20 text-amber-400 rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold">
                                        {movement.quantity}
                                      </div>
                                      <div>
                                        <span className={cn(text.h5, shadows.light, "font-medium text-white")}>
                                          {movement.products?.name || 'Produto sem nome'}
                                        </span>
                                        <div className="text-xs text-gray-400">
                                          Movimentação Manual ({movement.type === 'in' ? 'Entrada' : 'Saída'})
                                        </div>
                                      </div>
                                    </div>
                                    <div className={cn(text.h4, shadows.light, "font-bold text-emerald-400")}>
                                      {Math.abs(Number(movement.quantity) || 0)} {movement.products?.unit_type || 'un'}
                                    </div>
                                  </div>
                                )}
                              </div>

                            ) : (
                              <div className="text-center py-6 bg-amber-500/10 rounded-lg border border-amber-400/30">
                                <Package className="h-8 w-8 text-amber-400 mx-auto mb-2" />
                                <p className={cn(text.h6, shadows.subtle, "text-sm text-amber-300 font-medium")}>
                                  {isSale ? 'Venda sem itens registrados' : 'Movimentação sem detalhes'}
                                </p>
                                {movement.reason && (
                                  <p className={cn(text.h6, shadows.subtle, "text-xs text-amber-400/70 mt-1")}>
                                    {movement.reason}
                                  </p>
                                )}
                              </div>
                            )}

                            {/* Observações / Detalhes de Entrega */}
                            {(isDeliveryType || (!isSale && movement.reason)) && (
                              <div className="mt-4 pt-4 border-t border-white/20">
                                <div className="flex items-center gap-2 mb-2">
                                  {isDeliveryType ? (
                                    <>
                                      <Truck className="h-4 w-4 text-amber-400" />
                                      <h4 className={cn(text.h5, shadows.medium, "font-medium text-amber-400")}>
                                        Detalhes de Entrega
                                      </h4>
                                    </>
                                  ) : (
                                    <>
                                      <FileText className="h-4 w-4 text-amber-400" />
                                      <h4 className={cn(text.h5, shadows.medium, "font-medium text-amber-400")}>
                                        Observações
                                      </h4>
                                    </>
                                  )}
                                </div>
                                <div className="bg-black/30 rounded-lg p-4 border border-white/10 space-y-3">
                                  {/* Endereço de Entrega */}
                                  {sale?.delivery_address && (
                                    <div className="text-sm text-gray-300">
                                      <p className="font-medium text-white mb-1">Endereço:</p>
                                      {/* Suporte para formato estruturado ou simplificado */}
                                      {sale.delivery_address.street ? (
                                        <>
                                          <p>{sale.delivery_address.street}, {sale.delivery_address.number}</p>
                                          <p>{sale.delivery_address.neighborhood} - {sale.delivery_address.city}</p>
                                          {sale.delivery_address.complement && <p className="text-gray-400 text-xs mt-0.5">Complemento: {sale.delivery_address.complement}</p>}
                                        </>
                                      ) : (
                                        <p>{sale.delivery_address.address || 'Endereço sem detalhes'}</p>
                                      )}
                                    </div>
                                  )}

                                  {/* Entregador */}
                                  {sale?.delivery_person && (
                                    <div className="text-sm text-gray-300">
                                      <p className="font-medium text-white mb-1">Entregador:</p>
                                      <p>{sale.delivery_person.full_name}</p>
                                    </div>
                                  )}

                                  {/* Resumo Financeiro da Entrega */}
                                  {sale && (
                                    <div className="flex flex-col gap-1 text-sm pt-2 mt-2 border-t border-white/5">
                                      {sale.delivery_fee > 0 && (
                                        <div className="flex justify-between text-gray-300">
                                          <span>Taxa de Entrega:</span>
                                          <span className="text-red-400">+ {formatCurrency(sale.delivery_fee)}</span>
                                        </div>
                                      )}
                                      {sale.discount_amount > 0 && (
                                        <div className="flex justify-between text-gray-300">
                                          <span>Desconto:</span>
                                          <span className="text-emerald-400">- {formatCurrency(sale.discount_amount)}</span>
                                        </div>
                                      )}
                                      <div className="flex justify-between font-bold text-white mt-1 pt-1 border-t border-white/10">
                                        <span>Total Final:</span>
                                        <span className="text-emerald-400">{formatCurrency(sale.final_amount)}</span>
                                      </div>
                                    </div>
                                  )}

                                  <div className="text-sm text-gray-300 space-y-1 pt-2 border-t border-white/5">
                                    {isDeliveryType && (
                                      <p className="flex items-center gap-2">
                                        <Truck className="h-3 w-3" />
                                        <span className="capitalize text-gray-400">{isDeliveryType ? 'Entrega Delivery' : 'Retirada / Presencial'}</span>
                                      </p>
                                    )}
                                    {!isSale && movement.reason && (
                                      <p className="italic text-gray-400">"{movement.reason}"</p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })()}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer da tabela */}
      <div className="bg-black/60 px-4 py-3 border-t border-white/10 flex justify-between items-center text-xs text-gray-500">
        <span>Mostrando {movements.length} registros</span>
        <div className="flex gap-4">
          {/* Sumários rápidos poderiam vir aqui */}
        </div>
      </div>
    </div>
  );
};