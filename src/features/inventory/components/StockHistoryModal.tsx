/**
 * Modal para visualizar histórico de movimentações de estoque
 * Mostra todas as entradas, saídas e ajustes de um produto
 */

import React, { useMemo, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BaseModal } from '@/shared/ui/composite/BaseModal';
import { Button } from '@/shared/ui/primitives/button';
import { Badge } from '@/shared/ui/primitives/badge';
import {
  X,
  Package,
  TrendingUp,
  TrendingDown,
  Settings,
  Calendar,
  User,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Loader2
} from 'lucide-react';
import { cn } from '@/core/config/utils';
import { formatCurrency } from '@/core/config/utils';
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
    case 'entrada':
      return ArrowUp;
    case 'saida':
      return ArrowDown;
    case 'ajuste':
      return RotateCcw;
    case 'venda':
      return Package;
    default:
      return Package;
  }
};

const getMovementColor = (type: StockMovement['type']) => {
  switch (type) {
    case 'entrada':
      return 'text-green-400 bg-green-400/10 border-green-400/30';
    case 'saida':
      return 'text-red-400 bg-red-400/10 border-red-400/30';
    case 'ajuste':
      return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
    case 'venda':
      return 'text-blue-400 bg-blue-400/10 border-blue-400/30';
    default:
      return 'text-gray-400 bg-gray-400/10 border-gray-400/30';
  }
};

const getMovementLabel = (type: StockMovement['type']) => {
  switch (type) {
    case 'entrada':
      return 'Entrada';
    case 'saida':
      return 'Saída';
    case 'ajuste':
      return 'Ajuste';
    case 'venda':
      return 'Venda';
    default:
      return type;
  }
};

export const StockHistoryModal: React.FC<StockHistoryModalProps> = ({
  product,
  isOpen,
  onClose,
}) => {
  const { formatCompact } = useFormatBrazilianDate();

  // SSoT: Calcular breakdown de estoque diretamente do produto
  const stockDisplay = product ? calculatePackageDisplay(product.stock_quantity, product.package_units) : null;

  // Query para buscar movimentações
  const { data: movements = [], isLoading, error } = useQuery({
    queryKey: ['stock-history', product?.id],
    enabled: !!product && isOpen,
    queryFn: async () => {
      if (!product) return [];

      // Buscar as movimentações
      const { data: movementsData, error: movementsError } = await supabase
        .from('inventory_movements')
        .select(`
          id,
          date,
          type,
          quantity_change,
          new_stock_quantity,
          reason,
          metadata,
          user_id
        `)
        .eq('product_id', product.id)
        .order('date', { ascending: false });

      if (movementsError) throw movementsError;

      // Type safe cast handling the mismatch between DB column 'type' and generated 'type_enum'
      const rawMovements = movementsData as unknown as InventoryMovementRow[];

      if (!rawMovements || rawMovements.length === 0) {
        return [];
      }

      // Buscar nomes dos usuários para os user_ids únicos
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
        // Mapear tipos corretamente baseado na nova estrutura enum
        let mappedType: StockMovement['type'];
        // Handle type being possibly 'type_enum' or 'type' or just string value
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
          // Legacy support
          case 'out':
          case 'saida':
            mappedType = 'saida';
            break;
          case 'in':
          case 'entrada':
            mappedType = 'entrada';
            break;
          default:
            mappedType = 'ajuste'; // Default para adjustment
        }

        const stockChange = movement.quantity_change;
        const displayQuantity = Math.abs(stockChange);

        const metadata = movement.metadata as any || {};
        const reference = metadata.sale_id || metadata.movement_id || undefined;

        return {
          id: movement.id,
          date: new Date(movement.date),
          type: mappedType,
          quantity: displayQuantity,
          reason: movement.reason || 'Sem motivo especificado',
          user: userMap.get(movement.user_id) || 'Sistema',
          balanceAfter: movement.new_stock_quantity || 0,
          reference: reference,
          stockChange: stockChange
        } as StockMovement;
      });
    }
  });

  if (!product) return null;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Histórico de Movimentações"
      description="Visualize todas as movimentações de estoque deste produto, incluindo entradas, saídas e ajustes."
      size="4xl"
    >
      {/* Informações do produto */}
      <div className="bg-black/30 rounded-lg p-3 mt-4">
        <h4 className="font-medium text-gray-100 mb-1">{product.name}</h4>
        <div className="space-y-2">
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span>Categoria: {product.category}</span>
            <span>Total de Movimentações: <span className="text-yellow-400 font-medium">{movements.length}</span></span>
          </div>

          {/* Estoque atual com variantes quando disponível */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span>Estoque Total: <span className="text-gray-100 font-medium">{product.stock_quantity} un</span></span>
            </div>
            {product.has_package_tracking && stockDisplay && stockDisplay.packages > 0 && (
              <div className="text-xs text-gray-500">
                {stockDisplay.formatted}
              </div>
            )}
          </div>
        </div>

        {/* Lista de movimentações */}
        <div className="flex-1 overflow-y-auto mt-4 space-y-3 max-h-[60vh]">
          {isLoading ? (
            <div className="text-center py-12">
              <Loader2 className="h-16 w-16 text-yellow-400 mx-auto mb-4 animate-spin" />
              <p className="text-gray-400">Carregando histórico de movimentações...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="bg-red-500/10 p-4 rounded-full w-fit mx-auto mb-4">
                <X className="h-8 w-8 text-red-500" />
              </div>
              <p className="text-red-400 font-medium">Erro ao carregar histórico</p>
              <p className="text-xs text-gray-500 mt-2">Tente novamente mais tarde.</p>
            </div>
          ) : movements.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">Nenhuma movimentação encontrada</p>
              <p className="text-xs text-gray-500 mt-2">Este produto ainda não possui histórico de movimentações</p>
            </div>
          ) : (
            movements.map((movement) => {
              const MovementIcon = getMovementIcon(movement.type);
              const colorClasses = getMovementColor(movement.type);

              return (
                <div
                  key={movement.id}
                  className="bg-black/30 rounded-lg p-4 border border-white/10 hover:border-purple-400/30 transition-all duration-200"
                >
                  <div className="flex items-start justify-between">
                    {/* Lado esquerdo: Tipo e detalhes */}
                    <div className="flex items-start space-x-3">
                      <div className={cn("p-2 rounded-lg border", colorClasses)}>
                        <MovementIcon className="h-4 w-4" />
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <Badge className={cn("text-xs", colorClasses)}>
                            {getMovementLabel(movement.type)}
                          </Badge>
                          {movement.reference && (
                            <span className="text-xs text-gray-400">
                              Ref: {movement.reference}
                            </span>
                          )}
                        </div>

                        <p className="text-sm text-gray-100 font-medium">
                          {movement.reason}
                        </p>

                        <div className="flex items-center space-x-4 text-xs text-gray-400">
                          <span className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatCompact(movement.date)}
                          </span>
                          <span className="flex items-center">
                            <User className="h-3 w-3 mr-1" />
                            {movement.user}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Lado direito: Quantidade e saldo */}
                    <div className="text-right space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className={cn(
                          "text-lg font-bold",
                          movement.stockChange > 0 ? "text-green-400" : "text-red-400"
                        )}>
                          {movement.stockChange > 0 ? '+' : ''}{movement.stockChange}
                        </span>
                        <span className="text-xs text-gray-400">un</span>
                      </div>

                      <div className="text-xs text-gray-400">
                        Saldo: <span className="text-gray-100 font-medium">{movement.balanceAfter} un</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer com estatísticas */}
        {movements.length > 0 && (
          <div className="border-t border-white/10 pt-4 mt-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-green-400/10 rounded-lg p-3 border border-green-400/30">
                <div className="text-green-400 font-bold text-lg">
                  {movements.filter(m => m.type === 'entrada').reduce((sum, m) => sum + m.quantity, 0)}
                </div>
                <div className="text-xs text-green-400/70">Total Entradas</div>
              </div>

              <div className="bg-red-400/10 rounded-lg p-3 border border-red-400/30">
                <div className="text-red-400 font-bold text-lg">
                  {Math.abs(movements.filter(m => m.type === 'saida' || m.type === 'venda').reduce((sum, m) => sum + m.quantity, 0))}
                </div>
                <div className="text-xs text-red-400/70">Total Saídas</div>
              </div>

              <div className="bg-yellow-400/10 rounded-lg p-3 border border-yellow-400/30">
                <div className="text-yellow-400 font-bold text-lg">
                  {movements.filter(m => m.type === 'ajuste').length}
                </div>
                <div className="text-xs text-yellow-400/70">Ajustes</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </BaseModal>
  );
};

export default StockHistoryModal;