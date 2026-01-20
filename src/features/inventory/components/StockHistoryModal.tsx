/**
 * Modal para visualizar histórico de movimentações de estoque
 * Design: Tactical Stitch (Standardized)
 */

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Dialog, DialogPortal, DialogOverlay, DialogTitle } from '@/shared/ui/primitives/dialog';
import { Badge } from '@/shared/ui/primitives/badge';
import {
  X,
  Package,
  TrendingUp,
  TrendingDown,
  Calendar,
  User,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Loader2,
  History
} from 'lucide-react';
import { cn } from '@/core/config/utils';
import { supabase } from '@/core/api/supabase/client';
import { useFormatBrazilianDate } from '@/shared/hooks/common/use-brasil-timezone';
import { calculatePackageDisplay } from '@/shared/utils/stockCalculations';
import type { Product } from '@/core/types/inventory.types';
import type { Tables } from '@/core/types/database.types';

interface StockHistoryModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

interface StockMovement {
  id: string;
  date: Date;
  type: 'entrada' | 'saida' | 'ajuste' | 'venda';
  quantity: number;
  reason: string;
  user: string;
  balanceAfter: number;
  reference?: string;
  stockChange: number;
}

// Mapeando tipo do banco de dados que pode ter type_enum em vez de type
type InventoryMovementRow = Omit<Tables<'inventory_movements'>, 'type' | 'type_enum'> & {
  type: Tables<'inventory_movements'>['type_enum'] | string;
};

const getMovementIcon = (type: StockMovement['type']) => {
  switch (type) {
    case 'entrada': return ArrowUp;
    case 'saida': return ArrowDown;
    case 'ajuste': return RotateCcw;
    case 'venda': return Package;
    default: return Package;
  }
};

const getMovementColor = (type: StockMovement['type']) => {
  switch (type) {
    case 'entrada': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30';
    case 'saida': return 'text-rose-400 bg-rose-400/10 border-rose-400/30';
    case 'ajuste': return 'text-amber-400 bg-amber-400/10 border-amber-400/30';
    case 'venda': return 'text-cyan-400 bg-cyan-400/10 border-cyan-400/30';
    default: return 'text-zinc-400 bg-zinc-400/10 border-zinc-400/30';
  }
};

const getMovementLabel = (type: StockMovement['type']) => {
  switch (type) {
    case 'entrada': return 'Entrada';
    case 'saida': return 'Saída';
    case 'ajuste': return 'Ajuste';
    case 'venda': return 'Venda';
    default: return type;
  }
};

export const StockHistoryModal: React.FC<StockHistoryModalProps> = ({
  product,
  isOpen,
  onClose,
}) => {
  const { formatCompact } = useFormatBrazilianDate();

  const stockDisplay = product ? calculatePackageDisplay(product.stock_quantity, product.package_units) : null;

  const { data: movements = [], isLoading, error } = useQuery({
    queryKey: ['stock-history', product?.id],
    enabled: !!product && isOpen,
    queryFn: async () => {
      if (!product) return [];

      const { data: movementsData, error: movementsError } = await supabase
        .from('inventory_movements')
        .select(`
          id,
          created_at,
          type,
          quantity_change,
          new_stock_quantity,
          reason,
          metadata,
          user_id
        `)
        .eq('product_id', product.id)
        .order('created_at', { ascending: false });

      if (movementsError) throw movementsError;

      const rawMovements = movementsData as unknown as InventoryMovementRow[];

      if (!rawMovements || rawMovements.length === 0) {
        return [];
      }

      const userIds = [...new Set(rawMovements.map(m => m.user_id).filter(Boolean))];
      let userMap = new Map();

      if (userIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, name')
          .in('id', userIds);

        const profiles = profilesData as Pick<Tables<'profiles'>, 'id' | 'name'>[] | null;

        if (profiles) {
          profiles.forEach(profile => {
            userMap.set(profile.id, profile.name);
          });
        }
      }

      return rawMovements.map(movement => {
        let mappedType: StockMovement['type'];
        const typeValue = (movement as any).type || (movement as any).type_enum;

        switch (typeValue) {
          case 'initial_stock':
          case 'stock_transfer_in':
          case 'return':
            mappedType = 'entrada';
            break;
          case 'sale':
            mappedType = 'venda';
            break;
          case 'stock_transfer_out':
          case 'personal_consumption':
            mappedType = 'saida';
            break;
          case 'inventory_adjustment':
            mappedType = 'ajuste';
            break;
          case 'out':
          case 'saida':
            mappedType = 'saida';
            break;
          case 'in':
          case 'entrada':
            mappedType = 'entrada';
            break;
          default:
            mappedType = 'ajuste';
        }

        const stockChange = movement.quantity_change;
        const displayQuantity = Math.abs(stockChange);

        const metadata = movement.metadata as any || {};
        const reference = metadata.sale_id || metadata.movement_id || undefined;
        const dateValue = new Date((movement as any).created_at || (movement as any).date);

        return {
          id: movement.id,
          date: dateValue,
          type: mappedType,
          quantity: displayQuantity,
          reason: movement.reason || 'Sem motivo especificado',
          user: userMap.get(movement.user_id) || 'Sistema',
          balanceAfter: movement.new_stock_quantity || 0,
          reference,
          stockChange
        } as StockMovement;
      });
    }
  });

  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogPortal>
        <DialogOverlay className="bg-black/80 backdrop-blur-sm" />
        <DialogPrimitive.Content 
          className={cn(
            "fixed left-[50%] top-[50%] z-50 flex flex-col w-full max-w-4xl translate-x-[-50%] translate-y-[-50%]",
            "bg-zinc-950 border border-white/5 shadow-2xl rounded-xl overflow-hidden duration-200",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]",
            "data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]"
          )}
        >
          {/* HEADER TÁTICO */}
          <div className="flex items-center justify-between px-8 py-6 border-b border-white/5 bg-zinc-900/30 backdrop-blur-md">
            <div className="flex flex-col gap-1">
               <div className="flex items-center gap-3">
                  <History className="h-6 w-6 text-violet-500" />
                  <DialogTitle className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                     STOCK HISTORICAL LOGS
                  </DialogTitle>
               </div>
               <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-9">
                  Ledger Immutable Record
               </span>
            </div>
            
            <button 
               onClick={onClose} 
               className="group p-2 rounded-full hover:bg-white/10 transition-colors focus:outline-none"
            >
               <X className="h-6 w-6 text-zinc-500 group-hover:text-white transition-colors" />
            </button>
          </div>

          {/* BACKGROUND AMBIENCE */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
             <div className="absolute top-[-20%] left-[50%] -translate-x-1/2 w-[800px] h-[300px] bg-violet-500/5 rounded-full blur-[100px]" />
          </div>

          {/* CONTENT */}
          <div className="flex flex-col h-[70vh]">
            
            {/* Info Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 border-b border-white/5 bg-white/5">
                <div className="bg-zinc-900/50 border border-white/5 rounded-lg p-4 flex flex-col items-center justify-center">
                   <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1">Total Movimentos</span>
                   <span className="text-2xl font-mono text-white font-bold">{movements.length}</span>
                </div>
                <div className="bg-zinc-900/50 border border-white/5 rounded-lg p-4 flex flex-col items-center justify-center">
                   <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1">Entradas (Period)</span>
                   <span className="text-2xl font-mono text-emerald-400 font-bold">
                      +{movements.filter(m => m.type === 'entrada').reduce((acc, curr) => acc + curr.quantity, 0)}
                   </span>
                </div>
                <div className="bg-zinc-900/50 border border-white/5 rounded-lg p-4 flex flex-col items-center justify-center">
                   <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1">Saídas (Period)</span>
                   <span className="text-2xl font-mono text-rose-400 font-bold">
                      -{Math.abs(movements.filter(m => m.type === 'saida' || m.type === 'venda').reduce((acc, curr) => acc + curr.quantity, 0))}
                   </span>
                </div>
            </div>

            {/* Lista Scrollable */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-black/20">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-zinc-500">
                  <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
                  <p className="text-xs uppercase tracking-widest font-bold">Retrieving Logs...</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-rose-500">
                   <p>Erro ao carregar dados.</p>
                </div>
              ) : movements.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-zinc-500 opacity-50">
                   <Package className="h-12 w-12" />
                   <p className="text-xs uppercase tracking-widest font-bold">Nenhum registro encontrado</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {movements.map((movement) => {
                    const MovementIcon = getMovementIcon(movement.type);
                    const colorClasses = getMovementColor(movement.type);

                    return (
                      <div
                        key={movement.id}
                        className="bg-zinc-900/40 backdrop-blur-sm border border-white/5 rounded-lg p-4 hover:border-white/10 transition-colors group"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <div className={cn("p-2.5 rounded-lg border", colorClasses)}>
                              <MovementIcon className="h-5 w-5" />
                            </div>

                            <div className="flex flex-col gap-1">
                               <div className="flex items-center gap-2">
                                  <Badge className={cn("text-[10px] uppercase tracking-widest font-bold px-2 h-5 border-0", colorClasses)}>
                                    {getMovementLabel(movement.type)}
                                  </Badge>
                                  {movement.reference && (
                                    <span className="text-[10px] font-mono text-zinc-600 bg-zinc-900/80 px-1.5 py-0.5 rounded border border-white/5">
                                      REF: {movement.reference.substring(0, 8)}
                                    </span>
                                  )}
                               </div>
                               
                               <p className="text-sm text-zinc-200 font-medium">
                                 {movement.reason}
                               </p>

                               <div className="flex items-center gap-4 text-[11px] text-zinc-500 mt-1">
                                 <span className="flex items-center gap-1.5">
                                   <Calendar className="h-3 w-3" />
                                   {formatCompact(movement.date)}
                                 </span>
                                 <span className="flex items-center gap-1.5">
                                   <User className="h-3 w-3" />
                                   {movement.user}
                                 </span>
                               </div>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-1">
                             <div className="flex items-baseline gap-1.5">
                                <span className={cn(
                                  "text-xl font-mono font-bold tracking-tight",
                                  movement.stockChange > 0 ? "text-emerald-400" : "text-rose-400"
                                )}>
                                  {movement.stockChange > 0 ? '+' : ''}{movement.stockChange}
                                </span>
                                <span className="text-[10px] text-zinc-500 font-bold uppercase">un</span>
                             </div>
                             <div className="text-[10px] text-zinc-600 font-mono">
                                SALDO POST: <span className="text-zinc-400">{movement.balanceAfter}</span>
                             </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            
            {/* FOOTER */}
            <div className="border-t border-white/5 bg-zinc-900/80 backdrop-blur-xl px-8 py-5 flex items-center justify-end sticky bottom-0 z-50">
               <span className="text-[10px] text-zinc-600 font-mono uppercase tracking-wider mr-auto">
                  End of Log Stream
               </span>
               <button
                  onClick={onClose}
                  className="px-8 py-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-zinc-300 hover:text-white text-xs font-bold uppercase tracking-widest transition-all"
               >
                  Fechar Visualização
               </button>
            </div>

          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
};

export default StockHistoryModal;