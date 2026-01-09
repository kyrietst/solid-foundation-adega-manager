/**
 * ProductSelectionModal.tsx - Modal para seleção de tipo de venda (unidade vs pacote)
 * Refatorado para usar Single Source of Truth (SSoT) - Opera exclusivamente com tabela 'products'
 */

import React, { useState, useMemo } from 'react';
import { BaseModal } from '@/shared/ui/composite';
import { StockDisplay } from '@/shared/ui/composite/StockDisplay';
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
import { useSingleProductStock } from '@/shared/hooks/business/useSingleProductStock';
import { createProductSelection } from '@/shared/hooks/business/useStockData';


// Interface simplificada para seleção de produto (SSoT)
export interface ProductSelectionData {
  product_id: string;
  quantity: number;
  type: 'unit' | 'package';
  variant_type: 'unit' | 'package'; // ✅ CORREÇÃO: Campo necessário para o carrinho
  variant_id: string; // ✅ CORREÇÃO: Campo necessário para o carrinho
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

  // ✅ Optimization: Fetch ONLY this product's fresh data
  const { data: product, isLoading: isLoadingStock, refetch } = useSingleProductStock(productId);

  const isLoadingProduct = isLoadingStock;
  const productError = null;

  // Wrapper para refetch
  const refetchProduct = () => refetch();

  // ✅ Local Availability Check (Replaces global hook helper)
  const availability = React.useMemo(() => {
    if (!product) return { available: false, maxUnits: 0, maxPackages: 0 };

    const totalPhysicalUnits = (product.stock_packages * product.units_per_package) + product.stock_units_loose;
    const requestedUnits = selectionType === 'package' ? quantity * product.units_per_package : quantity;

    if (totalPhysicalUnits <= 0) {
      return { available: false, maxUnits: 0, maxPackages: 0, reason: 'out_of_stock' };
    }

    const maxPackages = Math.floor(totalPhysicalUnits / product.units_per_package);

    if (requestedUnits > totalPhysicalUnits) {
      return {
        available: false,
        maxUnits: totalPhysicalUnits,
        maxPackages,
        reason: 'insufficient_quantity'
      };
    }

    return { available: true, maxUnits: totalPhysicalUnits, maxPackages };
  }, [product, quantity, selectionType]);

  const isLoadingAvailability = isLoadingStock;

  // ✅ ULTRA-SIMPLIFICAÇÃO: Informações diretas do estoque
  const stockInfo = useMemo(() => {
    if (!product) return null;

    return {
      // ✅ DADOS DIRETOS DA PRATELEIRA (SEM SOMA)
      stockPackages: product.stockDisplay.packages,
      stockUnitsLoose: product.stockDisplay.units,
      // ✅ REMOVIDO: totalStock (não somar tipos diferentes)
      canSellUnits: product.canSellUnits,
      canSellPackages: product.canSellPackages,
      unitPrice: product.unitPrice,
      packagePrice: product.packagePrice,

      // ✅ STATUS SIMPLIFICADO
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
      // ✅ CORREÇÃO: Campos necessários para o carrinho
      variant_type: selectionType, // Mapear type para variant_type
      variant_id: `${product.id}-${selectionType}`, // Criar variant_id
      // Campos para compatibilidade com sistema anterior
      price: baseSelection.unit_price,
      totalPrice: baseSelection.total_price,
      packageUnits: selectionType === 'package' ? 1 : undefined
    };

    onConfirm(selection);
    onClose();
  };

  const isValidSelection = quantity > 0 && quantity <= maxQuantity && stockInfo;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={null}
      showHeader={false}
      showCloseButton={false}
      size="md"
      className="!bg-transparent !border-0 !p-0 !shadow-none [&>button]:hidden ring-0"
    >
      {/* Container Principal com Estilo Stitch (Movido para dentro) */}
      <div className="flex flex-col w-full h-full bg-zinc-950 border border-white/10 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-black/50">
        
        {/* Loading State */}
        {isLoadingProduct && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary-yellow" />
            <span className="text-gray-400 font-medium">Carregando catálogo...</span>
          </div>
        )}

        {/* Error State */}
        {productError && (
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <div className="rounded-full bg-red-500/10 p-4 mb-4">
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
            <p className="text-white font-semibold mb-2">Erro ao carregar produto</p>
            <p className="text-gray-400 text-sm mb-6 max-w-xs">Não foi possível sincronizar o estoque deste item.</p>
            <Button
              onClick={() => refetchProduct()}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar novamente
            </Button>
          </div>
        )}

        {/* Product Content */}
        {product && stockInfo && (
          <div className="flex flex-col h-full bg-zinc-950">
              
            {/* 1. Header Premium (Single Layer) */}
            <div className="relative p-6 pb-8 bg-zinc-900/50 border-b border-white/5">
              <button 
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition-colors z-50 rounded-full hover:bg-white/10"
              >
                  <span className="sr-only">Fechar</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>

              <div className="flex flex-col gap-2">
                  <h2 className="text-xl font-bold text-white leading-tight pr-8">
                      {product.name}
                  </h2>
                  <div className="flex flex-wrap gap-2 mt-2">
                      {/* Stat Badge: Units */}
                      <div className="flex items-center gap-2 bg-black/40 border border-white/5 rounded px-2 py-1">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]"></div>
                        <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">SOLTOS:</span>
                        <span className="text-sm font-bold text-white tabular-nums">{stockInfo.stockUnitsLoose}</span>
                      </div>
                      {/* Stat Badge: Packages */}
                      <div className="flex items-center gap-2 bg-black/40 border border-white/5 rounded px-2 py-1">
                        <div className="h-1.5 w-1.5 rounded-full bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.8)]"></div>
                        <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">CAIXAS:</span>
                        <span className="text-sm font-bold text-white tabular-nums">{stockInfo.stockPackages}</span>
                      </div>
                  </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
                {/* 2. Selection Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Card: Unidade */}
                    <div 
                      onClick={() => stockInfo.canSellUnits && setSelectionType('unit')}
                      className={cn(
                          "relative flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all duration-200",
                          selectionType === 'unit' 
                            ? "border-emerald-500/50 bg-emerald-950/20"
                            : "border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900/60 hover:border-zinc-700",
                          !stockInfo.canSellUnits && "opacity-40 cursor-not-allowed grayscale"
                      )}
                    >
                          <div className="flex justify-between items-start mb-4">
                              <div className={cn(
                                  "p-2 rounded-lg",
                                  selectionType === 'unit' ? "bg-emerald-500/20 text-emerald-400" : "bg-zinc-800 text-gray-400"
                              )}>
                                  <Wine className="w-5 h-5" />
                              </div>
                              {selectionType === 'unit' && (
                                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                              )}
                          </div>
                          <div className="space-y-1">
                              <h3 className="text-white font-bold text-lg">Unidade</h3>
                              <p className="text-xs text-gray-400">Venda avulsa</p>
                          </div>
                          <div className="mt-4 pt-4 border-t border-white/5">
                              <span className={cn(
                                  "text-xl font-bold",
                                  selectionType === 'unit' ? "text-emerald-400" : "text-white"
                              )}>
                                  {formatCurrency(stockInfo.unitPrice)}
                              </span>
                          </div>
                    </div>

                    {/* Card: Pacote */}
                    <div 
                      onClick={() => stockInfo.canSellPackages && setSelectionType('package')}
                      className={cn(
                          "relative flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all duration-200",
                          selectionType === 'package' 
                            ? "border-blue-500/50 bg-blue-950/20"
                            : "border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900/60 hover:border-zinc-700",
                          !stockInfo.canSellPackages && "opacity-40 cursor-not-allowed grayscale"
                      )}
                    >
                          <div className="flex justify-between items-start mb-4">
                              <div className={cn(
                                  "p-2 rounded-lg",
                                  selectionType === 'package' ? "bg-blue-500/20 text-blue-400" : "bg-zinc-800 text-gray-400"
                              )}>
                                  <Package className="w-5 h-5" />
                              </div>
                              {selectionType === 'package' && (
                                  <CheckCircle className="w-5 h-5 text-blue-400" />
                              )}
                          </div>
                          <div className="space-y-1">
                              <h3 className="text-white font-bold text-lg">Fardo Fechado</h3>
                              <p className="text-xs text-gray-400">{product.units_per_package || 12} unidades/cx</p>
                          </div>
                          <div className="mt-4 pt-4 border-t border-white/5">
                              <span className={cn(
                                  "text-xl font-bold",
                                  selectionType === 'package' ? "text-blue-400" : "text-white"
                              )}>
                                  {formatCurrency(stockInfo.packagePrice)}
                              </span>
                          </div>
                    </div>
                </div>

                {/* 3. Quantity & Action */}
                <div className="pt-2 space-y-4">
                    
                  {/* Quantity Control - Darker, cleaner */}
                  <div className="flex items-center justify-between bg-zinc-900 rounded-xl p-1.5 border border-zinc-800">
                      <button
                          onClick={() => handleQuantityChange(quantity - 1)}
                          disabled={quantity <= 1}
                          className="h-12 w-14 flex items-center justify-center rounded-lg bg-zinc-800/50 text-white hover:bg-zinc-800 active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all"
                      >
                          <Minus className="h-5 w-5" />
                      </button>
                      
                      <div className="flex flex-col items-center">
                          <span className="text-2xl font-bold text-white tabular-nums tracking-tight">
                              {quantity}
                          </span>
                          <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                              {selectionType === 'unit' ? 'UNIDADES' : 'FARDOS'}
                          </span>
                      </div>

                      <button
                          onClick={() => handleQuantityChange(quantity + 1)}
                          disabled={quantity >= maxQuantity}
                          className="h-12 w-14 flex items-center justify-center rounded-lg bg-zinc-800/50 text-white hover:bg-zinc-800 active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all"
                      >
                          <Plus className="h-5 w-5" />
                      </button>
                  </div>

                  {/* Total Price & CTA */}
                  <div className="flex items-center justify-between pt-2">
                      <div className="flex flex-col">
                          <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total Estimado</span>
                          <span className="text-2xl font-bold text-white">
                              {formatCurrency(totalPrice)}
                          </span>
                      </div>

                      <Button
                          onClick={handleConfirm}
                          disabled={!isValidSelection || isLoadingProduct || isLoadingAvailability}
                          className="h-14 px-8 text-base bg-[#FACC15] hover:bg-[#EAB308] text-black font-bold rounded-xl shadow-lg transition-all"
                      >
                          {isLoadingAvailability ? (
                              <Loader2 className="h-5 w-5 animate-spin mr-2" />
                          ) : (
                              <ShoppingCart className="h-5 w-5 mr-2" />
                          )}
                          Adicionar
                      </Button>
                  </div>
                </div>
            </div>
          </div>
        )}
      </div>
    </BaseModal>
  );
};