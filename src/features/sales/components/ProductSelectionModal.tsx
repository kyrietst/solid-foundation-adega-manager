/**
 * ProductSelectionModal.tsx - Modal para seleção de unidade vs pacote
 * Permite ao usuário escolher entre vender unidade individual ou pacote/fardo completo
 */

import React, { useState, useMemo } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from '@/shared/ui/primitives/dialog';
import { Button } from '@/shared/ui/primitives/button';
import { Input } from '@/shared/ui/primitives/input';
import { RadioGroup, RadioGroupItem } from '@/shared/ui/primitives/radio-group';
import { Label } from '@/shared/ui/primitives/label';
import { 
  Package, 
  Wine, 
  Plus, 
  Minus, 
  ShoppingCart, 
  AlertTriangle,
  CheckCircle 
} from 'lucide-react';
import type { Product } from '@/types/inventory.types';
import { formatCurrency, cn } from '@/core/config/utils';
import { getGlassCardClasses } from '@/core/config/theme-utils';

export type SelectionType = 'unit' | 'package';

export interface ProductSelectionData {
  type: SelectionType;
  quantity: number;
  price: number;
  totalPrice: number;
  packageUnits?: number;
}

interface ProductSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selection: ProductSelectionData) => void;
  product: Product;
}

export const ProductSelectionModal: React.FC<ProductSelectionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  product
}) => {
  const [selectionType, setSelectionType] = useState<SelectionType>('unit');
  const [quantity, setQuantity] = useState(1);

  // Calcular informações de estoque e preços
  const stockInfo = useMemo(() => {
    const packageUnits = product.package_units || 1;
    const totalStock = product.stock_quantity;
    const completePackages = Math.floor(totalStock / packageUnits);
    const remainingUnits = totalStock % packageUnits;
    
    return {
      packageUnits,
      totalStock,
      completePackages,
      remainingUnits,
      unitPrice: product.price,
      packagePrice: product.package_price || (product.price * packageUnits),
      canSellPackages: completePackages > 0
    };
  }, [product]);

  // Validar quantidade baseada no tipo selecionado
  const maxQuantity = useMemo(() => {
    if (selectionType === 'unit') {
      return stockInfo.totalStock;
    } else {
      return stockInfo.completePackages;
    }
  }, [selectionType, stockInfo]);

  // Calcular preço total
  const totalPrice = useMemo(() => {
    const unitPrice = selectionType === 'unit' 
      ? stockInfo.unitPrice 
      : stockInfo.packagePrice;
    return unitPrice * quantity;
  }, [selectionType, quantity, stockInfo]);

  // Reset quantity when changing type
  React.useEffect(() => {
    setQuantity(1);
  }, [selectionType]);

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= maxQuantity) {
      setQuantity(newQuantity);
    }
  };

  const handleConfirm = () => {
    const selection: ProductSelectionData = {
      type: selectionType,
      quantity,
      price: selectionType === 'unit' ? stockInfo.unitPrice : stockInfo.packagePrice,
      totalPrice,
      packageUnits: selectionType === 'package' ? stockInfo.packageUnits : undefined
    };
    
    
    onConfirm(selection);
    onClose();
  };

  const isValidSelection = quantity > 0 && quantity <= maxQuantity;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className={cn(
          "max-w-md w-full mx-4",
          getGlassCardClasses(),
          "border-white/20 bg-gray-900/95 backdrop-blur-xl"
        )}
      >
        <DialogHeader className="text-center pb-4">
          <DialogTitle className="text-xl font-bold text-white flex items-center justify-center gap-2">
            <ShoppingCart className="h-5 w-5 text-primary-yellow" />
            Selecionar Tipo de Venda
          </DialogTitle>
          <DialogDescription className="text-gray-400 mt-2">
            Escolha como deseja adicionar este produto ao carrinho
          </DialogDescription>
        </DialogHeader>

        {/* Informações do Produto */}
        <div className="bg-black/40 rounded-lg p-4 border border-white/10 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
              <Wine className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-white line-clamp-2">{product.name}</h3>
              <p className="text-sm text-gray-400">{product.category}</p>
            </div>
          </div>
          
          {/* Informações de Estoque */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-center p-2 bg-white/5 rounded">
              <p className="text-gray-400">Estoque Total</p>
              <p className="font-semibold text-white">{stockInfo.totalStock} unidades</p>
            </div>
            <div className="text-center p-2 bg-white/5 rounded">
              <p className="text-gray-400">Pacotes Completos</p>
              <p className="font-semibold text-white">{stockInfo.completePackages} fardos</p>
            </div>
          </div>
        </div>

        {/* Seleção do Tipo */}
        <RadioGroup value={selectionType} onValueChange={(value) => setSelectionType(value as SelectionType)}>
          {/* Opção Unidade */}
          <div className={cn(
            "flex items-center space-x-3 rounded-lg border p-4 transition-all duration-200",
            selectionType === 'unit' 
              ? "border-primary-yellow bg-primary-yellow/10" 
              : "border-white/20 bg-black/20 hover:bg-white/5"
          )}>
            <RadioGroupItem value="unit" id="unit" />
            <div className="flex-1">
              <Label htmlFor="unit" className="cursor-pointer">
                <div className="flex items-center gap-2 mb-1">
                  <Wine className="h-4 w-4 text-blue-400" />
                  <span className="font-semibold text-white">Unidade Individual</span>
                </div>
                <div className="text-sm text-gray-400">
                  {formatCurrency(stockInfo.unitPrice)} cada • {stockInfo.totalStock} disponíveis
                </div>
              </Label>
            </div>
            {selectionType === 'unit' && (
              <CheckCircle className="h-5 w-5 text-primary-yellow" />
            )}
          </div>

          {/* Opção Pacote */}
          <div className={cn(
            "flex items-center space-x-3 rounded-lg border p-4 transition-all duration-200",
            selectionType === 'package' 
              ? "border-primary-yellow bg-primary-yellow/10" 
              : "border-white/20 bg-black/20 hover:bg-white/5",
            !stockInfo.canSellPackages && "opacity-50"
          )}>
            <RadioGroupItem 
              value="package" 
              id="package" 
              disabled={!stockInfo.canSellPackages}
            />
            <div className="flex-1">
              <Label htmlFor="package" className={cn("cursor-pointer", !stockInfo.canSellPackages && "cursor-not-allowed")}>
                <div className="flex items-center gap-2 mb-1">
                  <Package className="h-4 w-4 text-green-400" />
                  <span className="font-semibold text-white">Fardo/Pacote Completo</span>
                </div>
                <div className="text-sm text-gray-400">
                  {formatCurrency(stockInfo.packagePrice)} fardo ({stockInfo.packageUnits} unidades) • {stockInfo.completePackages} disponíveis
                </div>
                {!stockInfo.canSellPackages && (
                  <div className="flex items-center gap-1 mt-1 text-xs text-orange-400">
                    <AlertTriangle className="h-3 w-3" />
                    Estoque insuficiente para fardo completo
                  </div>
                )}
              </Label>
            </div>
            {selectionType === 'package' && stockInfo.canSellPackages && (
              <CheckCircle className="h-5 w-5 text-primary-yellow" />
            )}
          </div>
        </RadioGroup>

        {/* Seleção de Quantidade */}
        <div className="space-y-2">
          <Label className="text-white font-medium">Quantidade</Label>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={quantity <= 1}
              className="border-white/20 text-white hover:bg-white/10"
            >
              <Minus className="h-4 w-4" />
            </Button>
            
            <Input
              type="number"
              value={quantity}
              onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
              className="text-center bg-black/40 border-white/20 text-white w-20"
              min="1"
              max={maxQuantity}
            />
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuantityChange(quantity + 1)}
              disabled={quantity >= maxQuantity}
              className="border-white/20 text-white hover:bg-white/10"
            >
              <Plus className="h-4 w-4" />
            </Button>
            
            <div className="flex-1 text-right">
              <p className="text-sm text-gray-400">
                Máximo: {maxQuantity} {selectionType === 'unit' ? 'unidades' : 'fardos'}
              </p>
            </div>
          </div>
        </div>

        {/* Resumo do Preço */}
        <div className="bg-primary-yellow/10 border border-primary-yellow/20 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white font-medium">Total a pagar:</span>
            <span className="text-xl font-bold text-primary-yellow">
              {formatCurrency(totalPrice)}
            </span>
          </div>
          <div className="text-sm text-gray-400">
            {quantity} {selectionType === 'unit' ? 'unidade(s)' : 'fardo(s)'} × {formatCurrency(selectionType === 'unit' ? stockInfo.unitPrice : stockInfo.packagePrice)}
          </div>
          {selectionType === 'package' && (
            <div className="text-xs text-gray-500 mt-1">
              Total: {quantity * stockInfo.packageUnits} unidades individuais
            </div>
          )}
        </div>

        {/* Botões de Ação */}
        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 border-white/20 text-white hover:bg-white/10"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!isValidSelection}
            className="flex-1 bg-primary-yellow text-black hover:bg-primary-yellow/80 font-semibold"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Adicionar ao Carrinho
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};