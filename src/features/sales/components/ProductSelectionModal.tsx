/**
 * ProductSelectionModal.tsx - Modal para seleção de tipo de venda (unidade vs pacote)
 * Refatorado para usar Single Source of Truth (SSoT) - Opera exclusivamente com tabela 'products'
 */

import React, { useState, useMemo } from 'react';
import { BaseModal } from '@/shared/ui/composite';
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
  CheckCircle,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { formatCurrency, cn } from '@/core/config/utils';
import { getGlassCardClasses } from '@/core/config/theme-utils';
import { useProductSSoT, useStockAvailabilitySSoT, createProductSelection } from '../hooks/useProductsSSoT';

// Interface simplificada para seleção de produto (SSoT)
export interface ProductSelectionData {
  product_id: string;
  quantity: number;
  type: 'unit' | 'package';
  unit_price: number;
  total_price: number;
  units_sold: number; // Total de unidades individuais vendidas
  // Campos para compatibilidade com sistema anterior
  price: number;
  totalPrice: number;
  packageUnits?: number;
}

interface ProductSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selection: ProductSelectionData) => void;
  productId: string;
}

export const ProductSelectionModal: React.FC<ProductSelectionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  productId
}) => {
  const [selectionType, setSelectionType] = useState<'unit' | 'package'>('unit');
  const [quantity, setQuantity] = useState(1);

  // Buscar dados do produto usando SSoT
  const {
    data: product,
    isLoading: isLoadingProduct,
    error: productError,
    refetch: refetchProduct
  } = useProductSSoT(productId);

  // Buscar disponibilidade simplificada
  const {
    data: availability,
    isLoading: isLoadingAvailability
  } = useStockAvailabilitySSoT(productId, quantity, selectionType);

  // Calcular informações de estoque usando dados SSoT
  const stockInfo = useMemo(() => {
    if (!product) return null;

    return {
      // Dados básicos já calculados no hook SSoT
      totalStockUnits: product.stock_quantity || 0,
      canSellUnits: product.canSellUnits,
      canSellPackages: product.canSellPackages,
      unitPrice: product.unitPrice,
      packagePrice: product.packagePrice,
      unitsPerPackage: product.unitsPerPackage,

      // Estoque calculado usando SSoT
      stockDisplay: product.stockDisplay,

      // Status de estoque
      stockStatus: product.stockStatus,
      stockStatusLabel: product.stockStatusLabel,
      stockStatusColor: product.stockStatusColor,
    };
  }, [product]);

  // Validar quantidade baseada no tipo selecionado
  const maxQuantity = useMemo(() => {
    if (!availability) return 0;

    if (selectionType === 'unit') {
      return availability.maxUnits;
    } else {
      return availability.maxPackages;
    }
  }, [selectionType, availability]);

  // Calcular preço total
  const totalPrice = useMemo(() => {
    if (!stockInfo) return 0;

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
    if (!stockInfo || !product) return;

    // Usar função helper para criar seleção padronizada
    const baseSelection = createProductSelection(product, quantity, selectionType);

    const selection: ProductSelectionData = {
      ...baseSelection,
      // Campos para compatibilidade com sistema anterior
      price: baseSelection.unit_price,
      totalPrice: baseSelection.total_price,
      packageUnits: selectionType === 'package' ? stockInfo.unitsPerPackage : undefined
    };

    onConfirm(selection);
    onClose();
  };

  const isValidSelection = quantity > 0 && quantity <= maxQuantity && stockInfo;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <>
          <ShoppingCart className="h-5 w-5 text-primary-yellow" />
          Selecionar Tipo de Venda
        </>
      }
      description="Escolha como deseja adicionar este produto ao carrinho"
      size="md"
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
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar novamente
          </Button>
        </div>
      )}

      {/* Product Content */}
      {product && stockInfo && (
        <>
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
                <p className="text-gray-400">Total Disponível</p>
                <div className="font-semibold text-white">
                  <StockDisplay
                    stock_quantity={stockInfo.totalStockUnits}
                    units_per_package={stockInfo.unitsPerPackage}
                    variant="compact"
                    showTooltip={false}
                    className="text-white"
                  />
                </div>
              </div>
              <div className="text-center p-2 bg-white/5 rounded">
                <p className="text-gray-400">Pacotes Disponíveis</p>
                <div className="font-semibold text-white">
                  <StockDisplay
                    stock_quantity={stockInfo.packageStock}
                    variant="compact"
                    showTooltip={false}
                    className="text-white"
                  />
                </div>
              </div>
            </div>

            {/* Indicador de conversão se necessário */}
            {availability?.needs_conversion && (
              <div className="mt-3 p-2 bg-orange-500/10 border border-orange-500/20 rounded flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-orange-400" />
                <span className="text-sm text-orange-400">
                  Conversão automática de pacotes será necessária
                </span>
              </div>
            )}
          </div>

          {/* Seleção do Tipo */}
          <RadioGroup value={selectionType} onValueChange={(value) => setSelectionType(value as VariantType)}>
            {/* Opção Unidade */}
            {stockInfo.unitVariant && (
              <div className={cn(
                "flex items-center space-x-3 rounded-lg border p-4 transition-all duration-200",
                selectionType === 'unit' 
                  ? "border-primary-yellow bg-primary-yellow/10" 
                  : "border-white/20 bg-black/20 hover:bg-white/5",
                !stockInfo.canSellUnits && "opacity-50"
              )}>
                <RadioGroupItem 
                  value="unit" 
                  id="unit" 
                  disabled={!stockInfo.canSellUnits}
                />
                <div className="flex-1">
                  <Label htmlFor="unit" className={cn("cursor-pointer", !stockInfo.canSellUnits && "cursor-not-allowed")}>
                    <div className="flex items-center gap-2 mb-1">
                      <Wine className="h-4 w-4 text-blue-400" />
                      <span className="font-semibold text-white">Unidade Individual</span>
                    </div>
                    <div className="text-sm text-gray-400">
                      {formatCurrency(stockInfo.unitPrice)} cada •
                      <StockDisplay
                        stock_quantity={stockInfo.unitStock}
                        variant="compact"
                        showTooltip={false}
                        className="text-gray-400 inline ml-1"
                      /> em estoque
                      {availability?.total_units_available && availability.total_units_available > stockInfo.unitStock && (
                        <span className="text-green-400"> (+{availability.total_units_available - stockInfo.unitStock} via conversão)</span>
                      )}
                    </div>
                  </Label>
                </div>
                {selectionType === 'unit' && stockInfo.canSellUnits && (
                  <CheckCircle className="h-5 w-5 text-primary-yellow" />
                )}
              </div>
            )}

            {/* Opção Pacote */}
            {stockInfo.packageVariant && (
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
                      {formatCurrency(stockInfo.packagePrice)} fardo ({stockInfo.unitsPerPackage} unidades) •
                      <StockDisplay
                        stock_quantity={stockInfo.packageStock}
                        variant="compact"
                        showTooltip={false}
                        className="text-gray-400 inline ml-1"
                      /> disponíveis
                    </div>
                    {!stockInfo.canSellPackages && (
                      <div className="flex items-center gap-1 mt-1 text-xs text-orange-400">
                        <AlertTriangle className="h-3 w-3" />
                        Nenhum pacote disponível no momento
                      </div>
                    )}
                  </Label>
                </div>
                {selectionType === 'package' && stockInfo.canSellPackages && (
                  <CheckCircle className="h-5 w-5 text-primary-yellow" />
                )}
              </div>
            )}

            {/* Caso nenhuma variante esteja disponível */}
            {!stockInfo.canSellUnits && !stockInfo.canSellPackages && (
              <div className="text-center py-4 text-gray-400">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-orange-400" />
                <p>Produto sem estoque disponível</p>
              </div>
            )}
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
              Total:
              <StockDisplay
                stock_quantity={quantity * stockInfo.unitsPerPackage}
                variant="compact"
                showTooltip={false}
                className="text-gray-500 inline ml-1"
              />
            </div>
          )}
          {isLoadingAvailability && (
            <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" />
              Verificando disponibilidade...
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
              disabled={!isValidSelection || isLoadingProduct || isLoadingAvailability}
              className="flex-1 bg-primary-yellow text-black hover:bg-primary-yellow/80 font-semibold disabled:opacity-50"
            >
              {isLoadingAvailability ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <ShoppingCart className="h-4 w-4 mr-2" />
              )}
              Adicionar ao Carrinho
            </Button>
          </div>
        </>
      )}
    </BaseModal>
  );
};