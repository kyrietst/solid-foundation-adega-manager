/**
 * StockAdjustmentModal.tsx - Modal unificado para ajustes de estoque
 * Implementa Single Source of Truth para ajustes usando apenas sistema de variantes
 * Pós-refatoração: substituirá todos os modais antigos de ajuste
 */

import React, { useState, useMemo } from 'react';
import { BaseModal } from '@/shared/ui/composite';
import { Button } from '@/shared/ui/primitives/button';
import { Input } from '@/shared/ui/primitives/input';
import { RadioGroup, RadioGroupItem } from '@/shared/ui/primitives/radio-group';
import { Label } from '@/shared/ui/primitives/label';
import { Textarea } from '@/shared/ui/primitives/textarea';
import {
  Package,
  Wine,
  Plus,
  Minus,
  Settings,
  AlertTriangle,
  CheckCircle,
  Loader2,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { formatCurrency, cn } from '@/core/config/utils';
import { getGlassCardClasses } from '@/core/config/theme-utils';
import { useProductVariants } from '../../sales/hooks/useProductVariants';
import { useStockAdjustment } from '../hooks/useStockAdjustment';
import { StockDisplay } from '@/shared/ui/composite/StockDisplay';
import type { VariantType } from '@/core/types/variants.types';

type AdjustmentType = 'entrada' | 'saida' | 'ajuste';

interface StockAdjustmentData {
  variantId: string;
  variantType: VariantType;
  adjustmentType: AdjustmentType;
  quantity?: number;
  newStock?: number;
  reason: string;
}

interface StockAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  onSuccess?: (data: StockAdjustmentData) => void;
}

export const StockAdjustmentModal: React.FC<StockAdjustmentModalProps> = ({
  isOpen,
  onClose,
  productId,
  onSuccess
}) => {
  const [selectedVariant, setSelectedVariant] = useState<VariantType>('unit');
  const [adjustmentType, setAdjustmentType] = useState<AdjustmentType>('entrada');
  const [quantity, setQuantity] = useState<number>(1);
  const [newStock, setNewStock] = useState<number>(0);
  const [reason, setReason] = useState<string>('');

  // Buscar dados do produto com variantes
  const {
    data: product,
    isLoading: isLoadingProduct,
    error: productError,
    refetch: refetchProduct
  } = useProductVariants(productId);

  // Hook para ajuste de estoque
  const {
    mutate: adjustStock,
    isPending: isAdjusting
  } = useStockAdjustment({
    onSuccess: (data) => {
      onSuccess?.(data as StockAdjustmentData);
      onClose();
    }
  });

  // Informações da variante selecionada
  const selectedVariantInfo = useMemo(() => {
    if (!product) return null;

    const variant = selectedVariant === 'unit'
      ? product.unit_variant
      : product.package_variant;

    if (!variant) return null;

    return {
      variant,
      currentStock: variant.stock_quantity || 0,
      price: variant.price || 0,
      unitsPerPackage: selectedVariant === 'package'
        ? variant.units_in_package || 1
        : 1,
      canAdjust: variant.is_active
    };
  }, [product, selectedVariant]);

  // Calcular estoque resultante
  const resultingStock = useMemo(() => {
    if (!selectedVariantInfo) return 0;

    switch (adjustmentType) {
      case 'entrada':
        return selectedVariantInfo.currentStock + quantity;
      case 'saida':
        return Math.max(0, selectedVariantInfo.currentStock - quantity);
      case 'ajuste':
        return newStock;
      default:
        return selectedVariantInfo.currentStock;
    }
  }, [selectedVariantInfo, adjustmentType, quantity, newStock]);

  // Validação do formulário
  const isValidAdjustment = useMemo(() => {
    if (!selectedVariantInfo) return false;
    if (!reason.trim()) return false;

    switch (adjustmentType) {
      case 'entrada':
      case 'saida':
        return quantity > 0;
      case 'ajuste':
        return newStock >= 0;
      default:
        return false;
    }
  }, [selectedVariantInfo, adjustmentType, quantity, newStock, reason]);

  const handleConfirm = () => {
    if (!selectedVariantInfo || !isValidAdjustment) return;

    const adjustmentData: StockAdjustmentData = {
      variantId: selectedVariantInfo.variant.id,
      variantType: selectedVariant,
      adjustmentType,
      quantity: adjustmentType !== 'ajuste' ? quantity : undefined,
      newStock: adjustmentType === 'ajuste' ? newStock : undefined,
      reason: reason.trim()
    };

    adjustStock(adjustmentData);
  };

  const handleClose = () => {
    setQuantity(1);
    setNewStock(0);
    setReason('');
    setAdjustmentType('entrada');
    setSelectedVariant('unit');
    onClose();
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title={
        <>
          <Settings className="h-5 w-5 text-primary-yellow" />
          Ajustar Estoque
        </>
      }
      description="Faça ajustes precisos no estoque do produto"
      size="lg"
      className={cn(
        getGlassCardClasses(),
        "border-white/20 bg-gray-900/95 backdrop-blur-xl"
      )}
    >
      {/* Loading State */}
      {isLoadingProduct && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary-yellow" />
          <span className="ml-2 text-white">Carregando produto...</span>
        </div>
      )}

      {/* Error State */}
      {productError && (
        <div className="flex flex-col items-center justify-center py-8">
          <AlertTriangle className="h-8 w-8 text-red-400 mb-2" />
          <p className="text-red-400 text-center mb-4">Erro ao carregar produto</p>
          <Button
            onClick={() => refetchProduct()}
            variant="outline"
            size="sm"
            className="border-white/20 text-white hover:bg-white/10"
          >
            Tentar novamente
          </Button>
        </div>
      )}

      {/* Product Content */}
      {product && (
        <>
          {/* Informações do Produto */}
          <div className="bg-black/40 rounded-lg p-4 border border-white/10 mb-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                <Wine className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white">{product.name}</h3>
                <p className="text-sm text-gray-400">{product.category}</p>
              </div>
            </div>
          </div>

          {/* Seleção da Variante */}
          <div className="mb-6">
            <Label className="text-white font-medium mb-3 block">Tipo de Estoque</Label>
            <RadioGroup value={selectedVariant} onValueChange={(value) => setSelectedVariant(value as VariantType)}>
              {/* Unidade */}
              {product.unit_variant && (
                <div className={cn(
                  "flex items-center space-x-3 rounded-lg border p-4 transition-all",
                  selectedVariant === 'unit'
                    ? "border-primary-yellow bg-primary-yellow/10"
                    : "border-white/20 bg-black/20 hover:bg-white/5"
                )}>
                  <RadioGroupItem value="unit" id="unit" />
                  <div className="flex-1">
                    <Label htmlFor="unit" className="cursor-pointer">
                      <div className="flex items-center gap-2 mb-1">
                        <Wine className="h-4 w-4 text-blue-400" />
                        <span className="font-semibold text-white">Unidades</span>
                      </div>
                      <div className="text-sm text-gray-400">
                        Estoque atual:
                        <StockDisplay
                          stock_quantity={product.unit_variant.stock_quantity || 0}
                          variant="compact"
                          showTooltip={false}
                          className="text-gray-400 inline ml-1"
                        />
                        • {formatCurrency(product.unit_variant.price || 0)} cada
                      </div>
                    </Label>
                  </div>
                  {selectedVariant === 'unit' && (
                    <CheckCircle className="h-5 w-5 text-primary-yellow" />
                  )}
                </div>
              )}

              {/* Pacote */}
              {product.package_variant && (
                <div className={cn(
                  "flex items-center space-x-3 rounded-lg border p-4 transition-all",
                  selectedVariant === 'package'
                    ? "border-primary-yellow bg-primary-yellow/10"
                    : "border-white/20 bg-black/20 hover:bg-white/5"
                )}>
                  <RadioGroupItem value="package" id="package" />
                  <div className="flex-1">
                    <Label htmlFor="package" className="cursor-pointer">
                      <div className="flex items-center gap-2 mb-1">
                        <Package className="h-4 w-4 text-green-400" />
                        <span className="font-semibold text-white">Pacotes/Fardos</span>
                      </div>
                      <div className="text-sm text-gray-400">
                        Estoque atual:
                        <StockDisplay
                          stock_quantity={product.package_variant.stock_quantity || 0}
                          variant="compact"
                          showTooltip={false}
                          className="text-gray-400 inline ml-1"
                        />
                        • {formatCurrency(product.package_variant.price || 0)} por fardo
                        • {product.package_variant.units_in_package || 1} unidades/fardo
                      </div>
                    </Label>
                  </div>
                  {selectedVariant === 'package' && (
                    <CheckCircle className="h-5 w-5 text-primary-yellow" />
                  )}
                </div>
              )}
            </RadioGroup>
          </div>

          {selectedVariantInfo && (
            <>
              {/* Tipo de Ajuste */}
              <div className="mb-6">
                <Label className="text-white font-medium mb-3 block">Tipo de Ajuste</Label>
                <RadioGroup value={adjustmentType} onValueChange={(value) => setAdjustmentType(value as AdjustmentType)}>
                  <div className={cn(
                    "flex items-center space-x-3 rounded-lg border p-3 transition-all",
                    adjustmentType === 'entrada'
                      ? "border-green-500 bg-green-500/10"
                      : "border-white/20 bg-black/20 hover:bg-white/5"
                  )}>
                    <RadioGroupItem value="entrada" id="entrada" />
                    <Label htmlFor="entrada" className="cursor-pointer flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-400" />
                      <span className="text-white">Entrada (Adicionar estoque)</span>
                    </Label>
                  </div>

                  <div className={cn(
                    "flex items-center space-x-3 rounded-lg border p-3 transition-all",
                    adjustmentType === 'saida'
                      ? "border-red-500 bg-red-500/10"
                      : "border-white/20 bg-black/20 hover:bg-white/5"
                  )}>
                    <RadioGroupItem value="saida" id="saida" />
                    <Label htmlFor="saida" className="cursor-pointer flex items-center gap-2">
                      <TrendingDown className="h-4 w-4 text-red-400" />
                      <span className="text-white">Saída (Remover estoque)</span>
                    </Label>
                  </div>

                  <div className={cn(
                    "flex items-center space-x-3 rounded-lg border p-3 transition-all",
                    adjustmentType === 'ajuste'
                      ? "border-yellow-500 bg-yellow-500/10"
                      : "border-white/20 bg-black/20 hover:bg-white/5"
                  )}>
                    <RadioGroupItem value="ajuste" id="ajuste" />
                    <Label htmlFor="ajuste" className="cursor-pointer flex items-center gap-2">
                      <Settings className="h-4 w-4 text-yellow-400" />
                      <span className="text-white">Ajuste (Definir estoque exato)</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Quantidade/Novo Estoque */}
              <div className="mb-6">
                {adjustmentType === 'ajuste' ? (
                  <>
                    <Label className="text-white font-medium mb-2 block">Novo Estoque Total</Label>
                    <div className="flex items-center gap-3">
                      <Input
                        type="number"
                        value={newStock}
                        onChange={(e) => setNewStock(parseInt(e.target.value) || 0)}
                        className="bg-black/40 border-white/20 text-white"
                        min="0"
                        placeholder="0"
                      />
                      <span className="text-gray-400 text-sm">
                        {selectedVariant === 'unit' ? 'unidades' : 'fardos'}
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <Label className="text-white font-medium mb-2 block">Quantidade</Label>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                        className="border-white/20 text-white hover:bg-white/10"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>

                      <Input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        className="text-center bg-black/40 border-white/20 text-white w-24"
                        min="1"
                      />

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setQuantity(quantity + 1)}
                        className="border-white/20 text-white hover:bg-white/10"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>

                      <span className="text-gray-400 text-sm">
                        {selectedVariant === 'unit' ? 'unidades' : 'fardos'}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Motivo */}
              <div className="mb-6">
                <Label className="text-white font-medium mb-2 block">Motivo do Ajuste</Label>
                <Textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="bg-black/40 border-white/20 text-white resize-none"
                  placeholder="Ex: Contagem física, correção de erro, produtos danificados..."
                  rows={3}
                />
              </div>

              {/* Resumo do Ajuste */}
              <div className="bg-primary-yellow/10 border border-primary-yellow/20 rounded-lg p-4 mb-6">
                <h4 className="text-white font-medium mb-3">Resumo do Ajuste</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Estoque Atual:</p>
                    <div className="text-white font-medium">
                      <StockDisplay
                        stock_quantity={selectedVariantInfo.currentStock}
                        units_per_package={selectedVariantInfo.unitsPerPackage}
                        variant="compact"
                        showTooltip={false}
                        className="text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-400">Estoque Final:</p>
                    <div className="text-primary-yellow font-medium">
                      <StockDisplay
                        stock_quantity={resultingStock}
                        units_per_package={selectedVariantInfo.unitsPerPackage}
                        variant="compact"
                        showTooltip={false}
                        className="text-primary-yellow"
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-primary-yellow/20">
                  <p className="text-gray-400 text-xs">
                    Diferença: {resultingStock - selectedVariantInfo.currentStock > 0 ? '+' : ''}
                    {resultingStock - selectedVariantInfo.currentStock} {selectedVariant === 'unit' ? 'unidades' : 'fardos'}
                  </p>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1 border-white/20 text-white hover:bg-white/10"
                  disabled={isAdjusting}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleConfirm}
                  disabled={!isValidAdjustment || isAdjusting}
                  className="flex-1 bg-primary-yellow text-black hover:bg-primary-yellow/80 font-semibold disabled:opacity-50"
                >
                  {isAdjusting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  Confirmar Ajuste
                </Button>
              </div>
            </>
          )}
        </>
      )}
    </BaseModal>
  );
};

export default StockAdjustmentModal;