/**
 * Modal para ajuste de estoque
 * Permite entrada, saída e correções de estoque
 */

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/shared/ui/primitives/dialog';
import { Button } from '@/shared/ui/primitives/button';
import { Input } from '@/shared/ui/primitives/input';
import { Textarea } from '@/shared/ui/primitives/textarea';
import { RadioGroup, RadioGroupItem } from '@/shared/ui/primitives/radio-group';
import { Label } from '@/shared/ui/primitives/label';
import { Badge } from '@/shared/ui/primitives/badge';
import { 
  Package, 
  Plus, 
  Minus, 
  Settings,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { cn } from '@/core/config/utils';
import type { Product } from '@/types/inventory.types';

interface StockAdjustmentModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (adjustment: StockAdjustment) => void;
  isLoading?: boolean;
}

export interface StockAdjustment {
  productId: string;
  type: 'entrada' | 'saida' | 'ajuste';
  quantity: number;
  reason: string;
  newStock?: number;
}

type AdjustmentType = 'entrada' | 'saida' | 'ajuste';

export const StockAdjustmentModal: React.FC<StockAdjustmentModalProps> = ({
  product,
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}) => {
  const [adjustmentType, setAdjustmentType] = useState<AdjustmentType>('entrada');
  const [quantity, setQuantity] = useState<string>('');
  const [reason, setReason] = useState<string>('');

  if (!product) return null;

  const handleClose = () => {
    setAdjustmentType('entrada');
    setQuantity('');
    setReason('');
    onClose();
  };

  const handleConfirm = () => {
    const quantityNum = parseInt(quantity);
    if (isNaN(quantityNum) || quantityNum <= 0) return;

    const adjustment: StockAdjustment = {
      productId: product.id,
      type: adjustmentType,
      quantity: quantityNum,
      reason: reason.trim() || getDefaultReason(adjustmentType),
    };

    // Para correção, calcular o novo estoque
    if (adjustmentType === 'ajuste') {
      adjustment.newStock = quantityNum;
    }

    onConfirm(adjustment);
  };

  const getDefaultReason = (type: AdjustmentType): string => {
    switch (type) {
      case 'entrada':
        return 'Entrada de mercadoria';
      case 'saida':
        return 'Saída de mercadoria';
      case 'ajuste':
        return 'Correção de estoque';
      default:
        return 'Ajuste de estoque';
    }
  };

  const calculateNewStock = (): number => {
    const quantityNum = parseInt(quantity) || 0;
    const currentStock = product.stock_quantity;

    switch (adjustmentType) {
      case 'entrada':
        return currentStock + quantityNum;
      case 'saida':
        return Math.max(0, currentStock - quantityNum);
      case 'ajuste':
        return quantityNum;
      default:
        return currentStock;
    }
  };

  const getTypeIcon = (type: AdjustmentType) => {
    switch (type) {
      case 'entrada':
        return <Plus className="h-4 w-4" />;
      case 'saida':
        return <Minus className="h-4 w-4" />;
      case 'ajuste':
        return <Settings className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: AdjustmentType) => {
    switch (type) {
      case 'entrada':
        return 'text-green-400 border-green-400/30 bg-green-400/10';
      case 'saida':
        return 'text-red-400 border-red-400/30 bg-red-400/10';
      case 'ajuste':
        return 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10';
    }
  };

  const isValidQuantity = quantity !== '' && parseInt(quantity) > 0;
  const newStock = isValidQuantity ? calculateNewStock() : product.stock_quantity;
  const willBeNegative = adjustmentType === 'saida' && parseInt(quantity || '0') > product.stock_quantity;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md bg-adega-charcoal/95 border-adega-gold/30 backdrop-blur-xl">
        <DialogHeader className="border-b border-white/10 pb-4">
          <DialogTitle className="text-lg font-bold text-adega-platinum flex items-center">
            <Package className="h-5 w-5 mr-2 text-yellow-400" />
            Ajustar Estoque
          </DialogTitle>
          <DialogDescription className="text-gray-400 mt-2">
            Registre movimentações de entrada, saída ou correções de estoque para este produto.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Informações do produto */}
          <div className="bg-black/30 rounded-lg p-3">
            <h4 className="font-medium text-gray-100 mb-2">{product.name}</h4>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Estoque atual:</span>
              <Badge className="bg-gray-700/50 text-gray-100 border-gray-600/50">
                {product.stock_quantity} un
              </Badge>
            </div>
          </div>

          {/* Tipo de ajuste */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-200">
              Tipo de ajuste:
            </Label>
            <div className="grid grid-cols-1 gap-3">
              {/* Entrada */}
              <div
                onClick={() => setAdjustmentType('entrada')}
                className={cn(
                  "relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-300",
                  "hover:scale-105 hover:shadow-lg transform",
                  adjustmentType === 'entrada' 
                    ? "border-green-400 bg-green-400/10 shadow-green-400/20 shadow-lg" 
                    : "border-gray-600/50 bg-black/20 hover:border-green-400/50 hover:bg-green-400/5"
                )}
              >
                <div className="flex items-center space-x-3">
                  <div className={cn(
                    "p-2 rounded-full transition-all duration-300",
                    adjustmentType === 'entrada' 
                      ? "bg-green-400 text-black shadow-green-400/50 shadow-md" 
                      : "bg-green-400/20 text-green-400"
                  )}>
                    <Plus className={cn(
                      "h-4 w-4 transition-transform duration-300",
                      adjustmentType === 'entrada' && "scale-110"
                    )} />
                  </div>
                  <div className="flex-1">
                    <div className={cn(
                      "font-medium transition-colors duration-300",
                      adjustmentType === 'entrada' ? "text-green-300" : "text-green-400"
                    )}>
                      Entrada (adicionar estoque)
                    </div>
                    <div className="text-xs text-gray-400">
                      Recebimento de mercadoria
                    </div>
                  </div>
                  {adjustmentType === 'entrada' && (
                    <div className="absolute -top-1 -right-1">
                      <div className="w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
                      <div className="absolute top-0 w-3 h-3 bg-green-400 rounded-full"></div>
                    </div>
                  )}
                </div>
              </div>

              {/* Saída */}
              <div
                onClick={() => setAdjustmentType('saida')}
                className={cn(
                  "relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-300",
                  "hover:scale-105 hover:shadow-lg transform",
                  adjustmentType === 'saida' 
                    ? "border-red-400 bg-red-400/10 shadow-red-400/20 shadow-lg" 
                    : "border-gray-600/50 bg-black/20 hover:border-red-400/50 hover:bg-red-400/5"
                )}
              >
                <div className="flex items-center space-x-3">
                  <div className={cn(
                    "p-2 rounded-full transition-all duration-300",
                    adjustmentType === 'saida' 
                      ? "bg-red-400 text-black shadow-red-400/50 shadow-md" 
                      : "bg-red-400/20 text-red-400"
                  )}>
                    <Minus className={cn(
                      "h-4 w-4 transition-transform duration-300",
                      adjustmentType === 'saida' && "scale-110"
                    )} />
                  </div>
                  <div className="flex-1">
                    <div className={cn(
                      "font-medium transition-colors duration-300",
                      adjustmentType === 'saida' ? "text-red-300" : "text-red-400"
                    )}>
                      Saída (remover estoque)
                    </div>
                    <div className="text-xs text-gray-400">
                      Retirada de produtos
                    </div>
                  </div>
                  {adjustmentType === 'saida' && (
                    <div className="absolute -top-1 -right-1">
                      <div className="w-3 h-3 bg-red-400 rounded-full animate-ping"></div>
                      <div className="absolute top-0 w-3 h-3 bg-red-400 rounded-full"></div>
                    </div>
                  )}
                </div>
              </div>

              {/* Ajuste */}
              <div
                onClick={() => setAdjustmentType('ajuste')}
                className={cn(
                  "relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-300",
                  "hover:scale-105 hover:shadow-lg transform",
                  adjustmentType === 'ajuste' 
                    ? "border-yellow-400 bg-yellow-400/10 shadow-yellow-400/20 shadow-lg" 
                    : "border-gray-600/50 bg-black/20 hover:border-yellow-400/50 hover:bg-yellow-400/5"
                )}
              >
                <div className="flex items-center space-x-3">
                  <div className={cn(
                    "p-2 rounded-full transition-all duration-300",
                    adjustmentType === 'ajuste' 
                      ? "bg-yellow-400 text-black shadow-yellow-400/50 shadow-md" 
                      : "bg-yellow-400/20 text-yellow-400"
                  )}>
                    <Settings className={cn(
                      "h-4 w-4 transition-transform duration-300",
                      adjustmentType === 'ajuste' && "scale-110 rotate-180"
                    )} />
                  </div>
                  <div className="flex-1">
                    <div className={cn(
                      "font-medium transition-colors duration-300",
                      adjustmentType === 'ajuste' ? "text-yellow-300" : "text-yellow-400"
                    )}>
                      Correção (definir valor exato)
                    </div>
                    <div className="text-xs text-gray-400">
                      Inventário e acertos
                    </div>
                  </div>
                  {adjustmentType === 'ajuste' && (
                    <div className="absolute -top-1 -right-1">
                      <div className="w-3 h-3 bg-yellow-400 rounded-full animate-ping"></div>
                      <div className="absolute top-0 w-3 h-3 bg-yellow-400 rounded-full"></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Quantidade */}
          <div className="space-y-2">
            <Label htmlFor="quantity" className="text-sm font-medium text-gray-200">
              {adjustmentType === 'ajuste' ? 'Novo estoque:' : 'Quantidade:'}
            </Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder={adjustmentType === 'ajuste' ? 'Estoque correto' : 'Quantidade a ajustar'}
              className="bg-gray-800/60 border-gray-600 text-gray-100"
            />
            
            {willBeNegative && (
              <div className="flex items-center text-red-400 text-sm">
                <AlertTriangle className="h-4 w-4 mr-1" />
                Saída maior que estoque disponível
              </div>
            )}
          </div>

          {/* Motivo */}
          <div className="space-y-2">
            <Label htmlFor="reason" className="text-sm font-medium text-gray-200">
              Motivo (opcional):
            </Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={getDefaultReason(adjustmentType)}
              rows={2}
              className="bg-gray-800/60 border-gray-600 text-gray-100 resize-none"
            />
          </div>

          {/* Preview do resultado */}
          {isValidQuantity && (
            <div className="bg-black/30 rounded-lg p-3 border border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Novo estoque:</span>
                <div className="flex items-center">
                  <Badge className={cn("mr-2", getTypeColor(adjustmentType))}>
                    {getTypeIcon(adjustmentType)}
                    <span className="ml-1">
                      {adjustmentType === 'ajuste' ? 'Correção' : 
                       adjustmentType === 'entrada' ? `+${quantity}` : `-${quantity}`}
                    </span>
                  </Badge>
                  <Badge className="bg-gray-700/50 text-gray-100 border-gray-600/50">
                    {newStock} un
                  </Badge>
                </div>
              </div>
            </div>
          )}

          {/* Ações */}
          <div className="flex gap-3 pt-2">
            <Button
              onClick={handleClose}
              variant="outline"
              className="flex-1 bg-gray-800/60 border-gray-600 text-gray-100 hover:bg-gray-700/80"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!isValidQuantity || isLoading || willBeNegative}
              className="flex-1 bg-yellow-400/20 border border-yellow-400/30 text-yellow-400 hover:bg-yellow-400/30 disabled:opacity-50"
            >
              {isLoading ? (
                'Processando...'
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Confirmar
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StockAdjustmentModal;