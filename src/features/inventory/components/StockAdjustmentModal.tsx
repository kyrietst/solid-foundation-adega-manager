/**
 * StockAdjustmentModal.tsx - Modal de ajuste de estoque SSoT
 * REFATORADO: Utiliza exclusivamente dados da tabela 'products' (Single Source of Truth)
 * Elimina dependência de product_variants
 */

import React, { useState, useMemo } from 'react';
import { EnhancedBaseModal, ModalSection } from '@/shared/ui/composite';
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
import { calculatePackageDisplay } from '@/shared/utils/stockCalculations';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';
import { useToast } from '@/shared/hooks/common/use-toast';
import type { Product } from '@/types/inventory.types';

type AdjustmentType = 'entrada' | 'saida' | 'ajuste';
type AdjustmentUnit = 'unit' | 'package';

interface StockAdjustmentData {
  productId: string;
  adjustmentType: AdjustmentType;
  adjustmentUnit: AdjustmentUnit;
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
  const [adjustmentUnit, setAdjustmentUnit] = useState<AdjustmentUnit>('unit');
  const [adjustmentType, setAdjustmentType] = useState<AdjustmentType>('entrada');
  const [quantity, setQuantity] = useState<number>(1);
  const [newStock, setNewStock] = useState<number>(0);
  const [reason, setReason] = useState<string>('');

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar dados do produto SSoT
  const {
    data: product,
    isLoading: isLoadingProduct,
    error: productError
  } = useQuery({
    queryKey: ['product-ssot', productId],
    queryFn: async (): Promise<Product | null> => {
      if (!productId) return null;

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!productId && isOpen,
  });

  // Mutation para ajuste de estoque SSoT
  const adjustStockMutation = useMutation({
    mutationFn: async (data: StockAdjustmentData) => {
      // Calcular mudança de quantidade baseada no tipo de ajuste
      let quantityChange = 0;

      if (data.adjustmentType === 'ajuste') {
        // Para ajuste direto, calcular diferença do estoque atual
        const currentStock = productInfo?.stockQuantity || 0;
        quantityChange = (data.newStock || 0) - currentStock;
      } else {
        // Para entrada/saída, usar a quantidade informada
        let adjustmentQuantity = data.quantity || 0;

        // Se ajustando pacotes, converter para unidades
        if (data.adjustmentUnit === 'package') {
          adjustmentQuantity = adjustmentQuantity * (productInfo?.packageUnits || 1);
        }

        quantityChange = data.adjustmentType === 'entrada' ? adjustmentQuantity : -adjustmentQuantity;
      }

      // Usar record_product_movement para registrar o movimento
      const { data: result, error } = await supabase
        .rpc('record_product_movement', {
          p_product_id: data.productId,
          p_type: data.adjustmentType,
          p_quantity: Math.abs(quantityChange),
          p_reason: data.reason,
          p_reference_number: null,
          p_source: 'manual_adjustment',
          p_user_id: null, // Será preenchido automaticamente com auth.uid()
          p_related_sale_id: null,
          p_notes: null
        });

      if (error) throw error;
      return result;
    },
    onSuccess: (result, variables) => {
      toast({
        title: "Estoque ajustado com sucesso!",
        description: `${variables.adjustmentType === 'entrada' ? 'Entrada' : variables.adjustmentType === 'saida' ? 'Saída' : 'Ajuste'} de ${variables.quantity || variables.newStock} unidades registrada.`,
      });

      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product-ssot', productId] });

      onSuccess?.(variables);
      onClose();

      // Reset form
      setQuantity(1);
      setNewStock(0);
      setReason('');
    },
    onError: (error) => {
      toast({
        title: "Erro ao ajustar estoque",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Informações calculadas do produto
  const productInfo = useMemo(() => {
    if (!product) return null;

    const stockQuantity = product.stock_quantity || 0;
    const packageUnits = product.package_units || 0;
    const hasPackageTracking = product.has_package_tracking;

    const stockDisplay = calculatePackageDisplay(stockQuantity, packageUnits);

    return {
      product,
      stockQuantity,
      packageUnits,
      hasPackageTracking,
      stockDisplay,
      canAdjustUnits: true,
      canAdjustPackages: hasPackageTracking && packageUnits > 0,
    };
  }, [product]);

  // Calcular novo estoque após ajuste
  const calculatedNewStock = useMemo(() => {
    if (!productInfo) return 0;

    const currentStock = productInfo.stockQuantity;

    if (adjustmentType === 'ajuste') {
      return newStock;
    }

    let adjustmentQuantity = quantity;

    // Se ajustando pacotes, converter para unidades
    if (adjustmentUnit === 'package') {
      adjustmentQuantity = quantity * productInfo.packageUnits;
    }

    if (adjustmentType === 'entrada') {
      return currentStock + adjustmentQuantity;
    } else {
      return Math.max(0, currentStock - adjustmentQuantity);
    }
  }, [productInfo, adjustmentType, adjustmentUnit, quantity, newStock]);

  // Validações
  const canSubmit = useMemo(() => {
    if (!productInfo || !reason.trim() || adjustStockMutation.isPending) return false;

    if (adjustmentType === 'ajuste') {
      return newStock >= 0;
    }

    return quantity > 0;
  }, [productInfo, reason, adjustmentType, quantity, newStock, adjustStockMutation.isPending]);

  const handleSubmit = () => {
    if (!canSubmit || !productInfo) return;

    const data: StockAdjustmentData = {
      productId,
      adjustmentType,
      adjustmentUnit,
      quantity: adjustmentType === 'ajuste' ? undefined : quantity,
      newStock: adjustmentType === 'ajuste' ? newStock : undefined,
      reason: reason.trim(),
    };

    adjustStockMutation.mutate(data);
  };

  const resetForm = () => {
    setAdjustmentUnit('unit');
    setAdjustmentType('entrada');
    setQuantity(1);
    setNewStock(0);
    setReason('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (isLoadingProduct) {
    return (
      <EnhancedBaseModal
        isOpen={isOpen}
        onClose={handleClose}
        modalType="action"
        title="Ajustar Estoque"
        subtitle="Carregando informações do produto"
        size="5xl"
        loading={true}
      >
        <div className="flex items-center justify-center py-8">
          <span className="text-gray-300">Carregando produto...</span>
        </div>
      </EnhancedBaseModal>
    );
  }

  if (productError || !productInfo) {
    return (
      <EnhancedBaseModal
        isOpen={isOpen}
        onClose={handleClose}
        modalType="danger"
        title="Erro ao Carregar"
        subtitle="Não foi possível carregar as informações do produto"
        size="5xl"
        status="error"
        customIcon={AlertTriangle}
      >
        <div className="flex items-center justify-center py-8 text-red-400">
          <span>Erro ao carregar produto. Tente novamente.</span>
        </div>
      </EnhancedBaseModal>
    );
  }

  return (
    <EnhancedBaseModal
      isOpen={isOpen}
      onClose={handleClose}
      modalType="action"
      title="Ajustar Estoque"
      subtitle={productInfo.product.name}
      size="5xl"
      customIcon={TrendingUp}
      loading={adjustStockMutation.isPending}
      primaryAction={{
        label: adjustStockMutation.isPending ? "Ajustando..." : "Confirmar Ajuste",
        icon: adjustStockMutation.isPending ? Loader2 : CheckCircle,
        onClick: handleSubmit,
        disabled: !canSubmit,
        loading: adjustStockMutation.isPending
      }}
      secondaryAction={{
        label: "Cancelar",
        onClick: handleClose,
        disabled: adjustStockMutation.isPending
      }}
    >
      <ModalSection
        title="Informações do Produto"
        subtitle="Detalhes atuais do produto selecionado"
      >
        <div className={cn(
          "p-4 rounded-lg border",
          getGlassCardClasses('premium')
        )}>
          <div className="flex items-center gap-4">
            <Package className="h-8 w-8 text-yellow-400" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-100">
                {productInfo.product.name}
              </h3>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span>Estoque atual: <span className="font-semibold text-gray-100">{productInfo.stockQuantity} unidades</span></span>
                {productInfo.hasPackageTracking && (
                  <span>Breakdown: <span className="font-semibold text-blue-400">{productInfo.stockDisplay.formatted}</span></span>
                )}
              </div>
            </div>
          </div>
        </div>
      </ModalSection>

      <ModalSection
        title="Configuração do Ajuste"
        subtitle="Selecione a unidade e tipo de ajuste"
      >
        <div className="space-y-6">
          {/* Seleção de unidade de ajuste */}
          <div className="space-y-3">
            <Label className="text-gray-100 font-medium">Unidade de Ajuste</Label>
            <RadioGroup
              value={adjustmentUnit}
              onValueChange={(value) => setAdjustmentUnit(value as AdjustmentUnit)}
              className="flex flex-wrap gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="unit" id="unit" />
                <Label htmlFor="unit" className="flex items-center gap-2 text-gray-300">
                  <Wine className="h-4 w-4" />
                  Unidades individuais
                </Label>
              </div>
              {productInfo.canAdjustPackages && (
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="package" id="package" />
                  <Label htmlFor="package" className="flex items-center gap-2 text-gray-300">
                    <Package className="h-4 w-4" />
                    Pacotes ({productInfo.packageUnits} un/cada)
                  </Label>
                </div>
              )}
            </RadioGroup>
          </div>

          {/* Tipo de ajuste */}
          <div className="space-y-3">
            <Label className="text-gray-100 font-medium">Tipo de Ajuste</Label>
            <RadioGroup
              value={adjustmentType}
              onValueChange={(value) => setAdjustmentType(value as AdjustmentType)}
              className="flex flex-wrap gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="entrada" id="entrada" />
                <Label htmlFor="entrada" className="flex items-center gap-2 text-green-400">
                  <Plus className="h-4 w-4" />
                  Entrada (Adicionar)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="saida" id="saida" />
                <Label htmlFor="saida" className="flex items-center gap-2 text-red-400">
                  <Minus className="h-4 w-4" />
                  Saída (Remover)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="ajuste" id="ajuste" />
                <Label htmlFor="ajuste" className="flex items-center gap-2 text-blue-400">
                  <Settings className="h-4 w-4" />
                  Ajuste direto
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      </ModalSection>

      <ModalSection
        title="Quantidade e Preview"
        subtitle="Defina a quantidade e visualize o resultado"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {adjustmentType === 'ajuste' ? (
            <div className="space-y-2">
              <Label htmlFor="newStock" className="text-gray-100">
                Novo estoque total (unidades)
              </Label>
              <Input
                id="newStock"
                type="number"
                min="0"
                value={newStock}
                onChange={(e) => setNewStock(parseInt(e.target.value) || 0)}
                className="bg-gray-800/50 border-gray-600 text-gray-100"
                placeholder="Ex: 100"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="quantity" className="text-gray-100">
                Quantidade a {adjustmentType === 'entrada' ? 'adicionar' : 'remover'} ({adjustmentUnit === 'unit' ? 'unidades' : 'pacotes'})
              </Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="bg-gray-800/50 border-gray-600 text-gray-100"
                placeholder="Ex: 10"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-gray-100">Estoque após ajuste</Label>
            <div className={cn(
              "p-3 rounded-md border",
              calculatedNewStock >= 0
                ? "border-green-500/30 bg-green-500/10"
                : "border-red-500/30 bg-red-500/10"
            )}>
              <span className={cn(
                "font-semibold text-lg",
                calculatedNewStock >= 0 ? "text-green-400" : "text-red-400"
              )}>
                {calculatedNewStock} unidades
              </span>
            </div>
          </div>
        </div>
      </ModalSection>

      <ModalSection
        title="Justificativa"
        subtitle="Descreva o motivo deste ajuste de estoque"
      >
        <div className="space-y-2">
          <Label htmlFor="reason" className="text-gray-100">
            Motivo do ajuste <span className="text-red-400">*</span>
          </Label>
          <Textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="bg-gray-800/50 border-gray-600 text-gray-100"
            placeholder="Descreva o motivo do ajuste de estoque..."
            rows={3}
          />
        </div>
      </ModalSection>
    </EnhancedBaseModal>
  );
};

export default StockAdjustmentModal;