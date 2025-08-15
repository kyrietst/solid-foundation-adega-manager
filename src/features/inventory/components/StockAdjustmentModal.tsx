/**
 * Modal para ajuste de estoque
 * Permite entrada, saída e correções de estoque
 */

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/ui/primitives/dialog';
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
  X,
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
  type: 'entry' | 'exit' | 'correction';
  quantity: number;
  reason: string;
  newStock?: number;
}

type AdjustmentType = 'entry' | 'exit' | 'correction';

export const StockAdjustmentModal: React.FC<StockAdjustmentModalProps> = ({
  product,
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}) => {
  const [adjustmentType, setAdjustmentType] = useState<AdjustmentType>('entry');
  const [quantity, setQuantity] = useState<string>('');
  const [reason, setReason] = useState<string>('');

  if (!product) return null;

  const handleClose = () => {
    setAdjustmentType('entry');
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
    if (adjustmentType === 'correction') {
      adjustment.newStock = quantityNum;
    }

    onConfirm(adjustment);
  };

  const getDefaultReason = (type: AdjustmentType): string => {
    switch (type) {
      case 'entry':
        return 'Entrada de mercadoria';
      case 'exit':
        return 'Saída de mercadoria';
      case 'correction':
        return 'Correção de estoque';
      default:
        return 'Ajuste de estoque';
    }
  };

  const calculateNewStock = (): number => {
    const quantityNum = parseInt(quantity) || 0;
    const currentStock = product.stock_quantity;

    switch (adjustmentType) {
      case 'entry':
        return currentStock + quantityNum;
      case 'exit':
        return Math.max(0, currentStock - quantityNum);
      case 'correction':
        return quantityNum;
      default:
        return currentStock;
    }
  };

  const getTypeIcon = (type: AdjustmentType) => {
    switch (type) {
      case 'entry':
        return <Plus className="h-4 w-4" />;
      case 'exit':
        return <Minus className="h-4 w-4" />;
      case 'correction':
        return <Settings className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: AdjustmentType) => {
    switch (type) {
      case 'entry':
        return 'text-green-400 border-green-400/30 bg-green-400/10';
      case 'exit':
        return 'text-red-400 border-red-400/30 bg-red-400/10';
      case 'correction':
        return 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10';
    }
  };

  const isValidQuantity = quantity !== '' && parseInt(quantity) > 0;
  const newStock = isValidQuantity ? calculateNewStock() : product.stock_quantity;
  const willBeNegative = adjustmentType === 'exit' && parseInt(quantity || '0') > product.stock_quantity;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md bg-adega-charcoal/95 border-adega-gold/30 backdrop-blur-xl">
        <DialogHeader className="border-b border-white/10 pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-bold text-adega-platinum flex items-center">
              <Package className="h-5 w-5 mr-2 text-yellow-400" />
              Ajustar Estoque
            </DialogTitle>
            <Button
              onClick={handleClose}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-gray-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
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
            <RadioGroup
              value={adjustmentType}
              onValueChange={(value) => setAdjustmentType(value as AdjustmentType)}
              className="space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="entry" id="entry" />
                <Label htmlFor="entry" className="flex items-center text-green-400">
                  <Plus className="h-4 w-4 mr-1" />
                  Entrada (adicionar estoque)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="exit" id="exit" />
                <Label htmlFor="exit" className="flex items-center text-red-400">
                  <Minus className="h-4 w-4 mr-1" />
                  Saída (remover estoque)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="correction" id="correction" />
                <Label htmlFor="correction" className="flex items-center text-yellow-400">
                  <Settings className="h-4 w-4 mr-1" />
                  Correção (definir valor exato)
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Quantidade */}
          <div className="space-y-2">
            <Label htmlFor="quantity" className="text-sm font-medium text-gray-200">
              {adjustmentType === 'correction' ? 'Novo estoque:' : 'Quantidade:'}
            </Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder={adjustmentType === 'correction' ? 'Estoque correto' : 'Quantidade a ajustar'}
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
                      {adjustmentType === 'correction' ? 'Correção' : 
                       adjustmentType === 'entry' ? `+${quantity}` : `-${quantity}`}
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