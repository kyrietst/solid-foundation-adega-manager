/**
 * Modal para visualizar histórico de movimentações de estoque
 * Mostra todas as entradas, saídas e ajustes de um produto
 */

import React, { useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/ui/primitives/dialog';
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
  RotateCcw
} from 'lucide-react';
import { cn } from '@/core/config/utils';
import { formatCurrency } from '@/core/config/utils';
import type { Product } from '@/types/inventory.types';

interface StockHistoryModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

interface StockMovement {
  id: string;
  date: Date;
  type: 'entry' | 'exit' | 'adjustment' | 'sale';
  quantity: number;
  reason: string;
  user: string;
  balanceAfter: number;
  reference?: string;
}

// Simular histórico de movimentações baseado no produto
const generateStockHistory = (product: Product): StockMovement[] => {
  // Usar ID do produto para seed consistente
  const seed = product.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const movements: StockMovement[] = [];
  
  let currentBalance = product.stock_quantity;
  const movementCount = (seed % 8) + 5; // 5-12 movimentações
  
  for (let i = 0; i < movementCount; i++) {
    const movementSeed = seed + i;
    const daysAgo = (movementSeed % 60) + 1; // 1-60 dias atrás
    const movementType = ['entry', 'exit', 'adjustment', 'sale'][movementSeed % 4] as StockMovement['type'];
    
    let quantity: number;
    let reason: string;
    let reference: string | undefined;
    
    switch (movementType) {
      case 'entry':
        quantity = (movementSeed % 20) + 5; // 5-24 unidades
        reason = 'Recebimento de fornecedor';
        reference = `NF-${1000 + (movementSeed % 999)}`;
        currentBalance -= quantity; // Histórico vai do mais recente ao mais antigo
        break;
      case 'exit':
        quantity = (movementSeed % 10) + 1; // 1-10 unidades
        reason = 'Saída manual';
        currentBalance += quantity;
        break;
      case 'adjustment':
        quantity = (movementSeed % 5) + 1; // 1-5 unidades
        reason = 'Ajuste de inventário';
        currentBalance += Math.random() > 0.5 ? quantity : -quantity;
        break;
      case 'sale':
        quantity = (movementSeed % 8) + 1; // 1-8 unidades
        reason = 'Venda no sistema';
        reference = `VD-${2000 + (movementSeed % 999)}`;
        currentBalance += quantity;
        break;
    }
    
    movements.push({
      id: `mov-${i}`,
      date: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
      type: movementType,
      quantity: Math.abs(quantity),
      reason,
      user: ['Admin', 'João Silva', 'Maria Santos', 'Carlos Oliveira'][movementSeed % 4],
      balanceAfter: Math.max(0, currentBalance),
      reference
    });
  }
  
  return movements.sort((a, b) => b.date.getTime() - a.date.getTime()); // Mais recente primeiro
};

const getMovementIcon = (type: StockMovement['type']) => {
  switch (type) {
    case 'entry':
      return ArrowUp;
    case 'exit':
      return ArrowDown;
    case 'adjustment':
      return RotateCcw;
    case 'sale':
      return Package;
  }
};

const getMovementColor = (type: StockMovement['type']) => {
  switch (type) {
    case 'entry':
      return 'text-green-400 bg-green-400/10 border-green-400/30';
    case 'exit':
      return 'text-red-400 bg-red-400/10 border-red-400/30';
    case 'adjustment':
      return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
    case 'sale':
      return 'text-blue-400 bg-blue-400/10 border-blue-400/30';
  }
};

const getMovementLabel = (type: StockMovement['type']) => {
  switch (type) {
    case 'entry':
      return 'Entrada';
    case 'exit':
      return 'Saída';
    case 'adjustment':
      return 'Ajuste';
    case 'sale':
      return 'Venda';
  }
};

export const StockHistoryModal: React.FC<StockHistoryModalProps> = ({
  product,
  isOpen,
  onClose,
}) => {
  const movements = useMemo(() => {
    return product ? generateStockHistory(product) : [];
  }, [product]);

  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden bg-adega-charcoal/95 border-adega-gold/30 backdrop-blur-xl">
        <DialogHeader className="border-b border-white/10 pb-4">
          <DialogTitle className="text-xl font-bold text-adega-platinum flex items-center">
            <Package className="h-5 w-5 mr-2 text-yellow-400" />
            Histórico de Movimentações
          </DialogTitle>
          
          {/* Informações do produto */}
          <div className="bg-black/30 rounded-lg p-3 mt-4">
            <h4 className="font-medium text-gray-100 mb-1">{product.name}</h4>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span>Categoria: {product.category}</span>
              <span>Estoque Atual: <span className="text-gray-100 font-medium">{product.stock_quantity} un</span></span>
              <span>Total de Movimentações: <span className="text-yellow-400 font-medium">{movements.length}</span></span>
            </div>
          </div>
        </DialogHeader>

        {/* Lista de movimentações */}
        <div className="flex-1 overflow-y-auto mt-4 space-y-3 max-h-[60vh]">
          {movements.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">Nenhuma movimentação encontrada</p>
            </div>
          ) : (
            movements.map((movement) => {
              const MovementIcon = getMovementIcon(movement.type);
              const colorClasses = getMovementColor(movement.type);
              const isPositive = movement.type === 'entry';
              
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
                            {movement.date.toLocaleDateString('pt-BR')} às {movement.date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
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
                          isPositive ? "text-green-400" : "text-red-400"
                        )}>
                          {isPositive ? '+' : '-'}{movement.quantity}
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
        <div className="border-t border-white/10 pt-4 mt-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-green-400/10 rounded-lg p-3 border border-green-400/30">
              <div className="text-green-400 font-bold text-lg">
                {movements.filter(m => m.type === 'entry').reduce((sum, m) => sum + m.quantity, 0)}
              </div>
              <div className="text-xs text-green-400/70">Total Entradas</div>
            </div>
            
            <div className="bg-red-400/10 rounded-lg p-3 border border-red-400/30">
              <div className="text-red-400 font-bold text-lg">
                {movements.filter(m => m.type === 'exit' || m.type === 'sale').reduce((sum, m) => sum + m.quantity, 0)}
              </div>
              <div className="text-xs text-red-400/70">Total Saídas</div>
            </div>
            
            <div className="bg-yellow-400/10 rounded-lg p-3 border border-yellow-400/30">
              <div className="text-yellow-400 font-bold text-lg">
                {movements.filter(m => m.type === 'adjustment').length}
              </div>
              <div className="text-xs text-yellow-400/70">Ajustes</div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StockHistoryModal;