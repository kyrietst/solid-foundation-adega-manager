/**
 * Modal para ajuste de estoque com suporte a variantes
 * Permite entrada, saída e correções de estoque com seleção de variante
 * Integrado com o sistema de product_variants
 */

import React, { useState, useEffect } from 'react';
import { BaseModal } from '@/shared/ui/composite/BaseModal';
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
  CheckCircle,
  Loader2,
  RefreshCw,
  Wine
} from 'lucide-react';
import { cn } from '@/core/config/utils';
import { useProductVariants } from '@/features/sales/hooks/useProductVariants';
import { VariantSelector } from './VariantSelector';
import { StockConversionPreview } from './StockConversionPreview';
import type { Product } from '@/types/inventory.types';
import type { VariantType } from '@/core/types/variants.types';

interface StockAdjustmentModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (adjustment: StockAdjustmentWithVariant) => void;
  isLoading?: boolean;
}

export interface StockAdjustmentWithVariant {
  productId: string;
  variantId: string;
  variantType: VariantType;
  type: 'entrada' | 'saida' | 'ajuste';
  quantity: number;
  reason: string;
  newStock?: number;
  // Campos legados para compatibilidade
  productData?: {
    name: string;
    currentStock: number;
  };
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
  const [selectedVariant, setSelectedVariant] = useState<VariantType>('unit');
  const [quantity, setQuantity] = useState<string>('');
  const [reason, setReason] = useState<string>('');

  // Buscar dados de variantes do produto (sempre chamar o hook com ID válido)
  const productId = product?.id || '';
  const { 
    data: productWithVariants, 
    isLoading: variantsLoading, 
    error: variantsError 
  } = useProductVariants(productId);

  // Reset form quando modal abrir (hook sempre chamado)
  useEffect(() => {
    if (isOpen && productWithVariants && product) {
      // Selecionar a primeira variante disponível
      if (productWithVariants.unit_variant) {
        setSelectedVariant('unit');
      } else if (productWithVariants.package_variant) {
        setSelectedVariant('package');
      }
    }
  }, [isOpen, productWithVariants, product]);

  // Early return após todos os hooks
  if (!product) return null;

  const handleClose = () => {
    setAdjustmentType('entrada');
    setSelectedVariant('unit');
    setQuantity('');
    setReason('');
    onClose();
  };

  const handleConfirm = () => {
    if (!productWithVariants) return;
    
    const quantityNum = parseInt(quantity);
    if (isNaN(quantityNum) || quantityNum <= 0) return;

    const selectedVariantData = selectedVariant === 'unit' 
      ? productWithVariants.unit_variant 
      : productWithVariants.package_variant;

    if (!selectedVariantData) return;

    const adjustment: StockAdjustmentWithVariant = {
      productId: product.id,
      variantId: selectedVariantData.id,
      variantType: selectedVariant,
      type: adjustmentType,
      quantity: quantityNum,
      reason: reason.trim() || getDefaultReason(adjustmentType),
      productData: {
        name: product.name,
        currentStock: selectedVariantData.stock_quantity
      }
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

  // Validações baseadas na variante selecionada
  const isValidQuantity = quantity && !isNaN(parseInt(quantity)) && parseInt(quantity) > 0;
  const quantityNum = parseInt(quantity) || 0;
  
  const selectedVariantData = productWithVariants 
    ? (selectedVariant === 'unit' ? productWithVariants.unit_variant : productWithVariants.package_variant)
    : null;
    
  const currentStock = selectedVariantData?.stock_quantity || 0;
  const willBeNegative = adjustmentType === 'saida' && quantityNum > currentStock;
  const canConfirm = isValidQuantity && selectedVariantData && !willBeNegative && !isLoading;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Ajustar Estoque - ${product.name}`}
      description="Selecione a variante e o tipo de ajuste para registrar a movimentação de estoque."
      size="4xl"
      icon={Settings}
      iconColor="text-primary-yellow"
    >

        <div className="space-y-6 mt-4">
          {/* Loading state */}
          {variantsLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary-yellow mr-2" />
              <span className="text-gray-400">Carregando dados do produto...</span>
            </div>
          )}

          {/* Error state */}
          {variantsError && (
            <div className="flex items-center justify-center py-8 text-red-400">
              <AlertTriangle className="h-6 w-6 mr-2" />
              <span>Erro ao carregar dados do produto</span>
            </div>
          )}

          {/* Main form */}
          {!variantsLoading && !variantsError && productWithVariants && (
            <>
              {/* Seleção de variante */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">1. Selecione a Variante</h3>
                <VariantSelector
                  product={productWithVariants}
                  selectedVariant={selectedVariant}
                  onVariantChange={setSelectedVariant}
                  context="inventory"
                  showPrices={false}
                  showStockInfo={true}
                />
              </div>

              {/* Tipo de ajuste */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">2. Tipo de Ajuste</h3>
                <RadioGroup
                  value={adjustmentType}
                  onValueChange={(value) => setAdjustmentType(value as AdjustmentType)}
                  className="grid grid-cols-3 gap-4"
                >
                  {/* Entrada */}
                  <div className={cn(
                    "flex items-center space-x-3 rounded-lg border p-4 transition-all duration-200",
                    adjustmentType === 'entrada' 
                      ? "border-green-400 bg-green-400/10" 
                      : "border-white/20 bg-black/20 hover:bg-white/5"
                  )}>
                    <RadioGroupItem value="entrada" id="entrada" />
                    <Label htmlFor="entrada" className="cursor-pointer flex items-center gap-2">
                      <Plus className="h-4 w-4 text-green-400" />
                      <div>
                        <div className="font-medium text-white">Entrada</div>
                        <div className="text-xs text-gray-400">Adicionar ao estoque</div>
                      </div>
                    </Label>
                  </div>

                  {/* Saída */}
                  <div className={cn(
                    "flex items-center space-x-3 rounded-lg border p-4 transition-all duration-200",
                    adjustmentType === 'saida' 
                      ? "border-red-400 bg-red-400/10" 
                      : "border-white/20 bg-black/20 hover:bg-white/5"
                  )}>
                    <RadioGroupItem value="saida" id="saida" />
                    <Label htmlFor="saida" className="cursor-pointer flex items-center gap-2">
                      <Minus className="h-4 w-4 text-red-400" />
                      <div>
                        <div className="font-medium text-white">Saída</div>
                        <div className="text-xs text-gray-400">Remover do estoque</div>
                      </div>
                    </Label>
                  </div>

                  {/* Ajuste */}
                  <div className={cn(
                    "flex items-center space-x-3 rounded-lg border p-4 transition-all duration-200",
                    adjustmentType === 'ajuste' 
                      ? "border-yellow-400 bg-yellow-400/10" 
                      : "border-white/20 bg-black/20 hover:bg-white/5"
                  )}>
                    <RadioGroupItem value="ajuste" id="ajuste" />
                    <Label htmlFor="ajuste" className="cursor-pointer flex items-center gap-2">
                      <Settings className="h-4 w-4 text-yellow-400" />
                      <div>
                        <div className="font-medium text-white">Correção</div>
                        <div className="text-xs text-gray-400">Definir valor exato</div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Quantidade */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">3. Quantidade</h3>
                <div className="space-y-2">
                  <Label className="text-white font-medium">
                    {adjustmentType === 'ajuste' ? 'Novo valor do estoque' : 'Quantidade'}
                  </Label>
                  <Input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder={adjustmentType === 'ajuste' ? 'Valor correto do estoque' : 'Digite a quantidade'}
                    className="bg-black/40 border-white/20 text-white"
                    min="1"
                  />
                  {willBeNegative && (
                    <div className="flex items-center gap-2 text-red-400 text-sm">
                      <AlertTriangle className="h-4 w-4" />
                      <span>Quantidade superior ao estoque disponível ({currentStock})</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Preview */}
              {isValidQuantity && selectedVariantData && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">4. Preview</h3>
                  <StockConversionPreview
                    product={productWithVariants}
                    selectedVariant={selectedVariant}
                    adjustmentType={adjustmentType}
                    quantity={quantityNum}
                    showFinancialImpact={false}
                  />
                </div>
              )}

              {/* Motivo */}
              <div className="space-y-2">
                <Label className="text-white font-medium">Motivo (opcional)</Label>
                <Textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder={`Motivo do ajuste (padrão: "${getDefaultReason(adjustmentType)}")`}
                  className="bg-black/40 border-white/20 text-white"
                  rows={3}
                />
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 pt-4 border-t border-white/10">
          <Button
            variant="outline"
            onClick={handleClose}
            className="flex-1 border-white/20 text-white hover:bg-white/10"
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!canConfirm}
            className="flex-1 bg-primary-yellow text-black hover:bg-primary-yellow/80 font-semibold disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4 mr-2" />
            )}
            Confirmar Ajuste
          </Button>
        </div>
    </BaseModal>
  );
};