/**
 * StockAdjustmentModal.tsx - Modal de ajuste de estoque com Estado Absoluto
 * v3.6.5 - Padronizado com FormDialog + estilo neutro + emojis
 * REFATORADO PARA MODELO ABSOLUTO: Frontend como mensageiro - não calcula deltas
 * Envia valores absolutos diretamente para o backend via set_product_stock_absolute
 */

import React, { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormDialog } from '@/shared/ui/layout/FormDialog';
import { Input } from '@/shared/ui/primitives/input';
import { Package, Wine, AlertTriangle, Loader2, Eye, ArrowRight, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/core/config/utils';
import { getGlassInputClasses } from '@/core/config/theme-utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';
import { useToast } from '@/shared/hooks/common/use-toast';
import { useAuth } from '@/app/providers/AuthContext';
import type { Product } from '@/core/types/inventory.types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/primitives/select';

// ✅ MOTIVOS SIMPLIFICADOS PARA INVENTÁRIO RÁPIDO
const ADJUSTMENT_REASONS = {
  'inventory': { label: '📋 Inventário/Correção', emoji: '📋' },
  'loss': { label: '💔 Perda/Quebra', emoji: '💔' },
  'consumption': { label: '🍷 Consumo Próprio', emoji: '🍷' },
  'purchase': { label: '📦 Chegada de Mercadoria', emoji: '📦' }
} as const;

// Schema de validação para o formulário
const stockAdjustmentSchema = z.object({
  newPackages: z.number().min(0, 'Quantidade de pacotes não pode ser negativa'),
  newUnitsLoose: z.number().min(0, 'Quantidade de unidades soltas não pode ser negativa'),
  reason: z.enum(['inventory', 'loss', 'consumption', 'purchase'], {
    errorMap: () => ({ message: 'Selecione um motivo válido' })
  })
});

type StockAdjustmentFormData = z.infer<typeof stockAdjustmentSchema>;

interface StockAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  onSuccess?: () => void;
}

export const StockAdjustmentModal: React.FC<StockAdjustmentModalProps> = ({
  isOpen,
  onClose,
  productId,
  onSuccess
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Buscar dados do produto
  const {
    data: product,
    isLoading: isLoadingProduct,
    error: productError
  } = useQuery({
    queryKey: ['product-dual-stock', productId],
    queryFn: async (): Promise<Product | null> => {
      if (!productId) return null;
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId as any)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }
      return data as unknown as Product;
    },
    enabled: !!productId && isOpen,
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    gcTime: 0,
  });

  // Configuração do formulário
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isDirty }
  } = useForm<StockAdjustmentFormData>({
    resolver: zodResolver(stockAdjustmentSchema),
    defaultValues: {
      newPackages: 0,
      newUnitsLoose: 0,
      reason: 'inventory' as const
    }
  });

  const watchedValues = watch();

  // Configurar valores iniciais quando o produto for carregado
  React.useEffect(() => {
    if (product) {
      setValue('newPackages', product.stock_packages || 0);
      setValue('newUnitsLoose', product.stock_units_loose || 0);
    }
  }, [product, setValue]);

  // Mutation para ajuste de estoque
  const adjustStockMutation = useMutation({
    mutationFn: async (formData: StockAdjustmentFormData) => {
      if (!product) throw new Error('Produto não encontrado');
      if (!user?.id) throw new Error('Usuário não autenticado.');

      const newPackages = Number(formData.newPackages || 0);
      const newUnitsLoose = Number(formData.newUnitsLoose || 0);
      const reasonText = ADJUSTMENT_REASONS[formData.reason].label.replace(/^[^\s]+\s/, '');

      const { data: result, error } = await supabase
        .rpc('set_product_stock_absolute', {
          p_product_id: productId,
          p_new_packages: newPackages,
          p_new_units_loose: newUnitsLoose,
          p_reason: reasonText,
          p_user_id: user.id
        });

      if (error) throw error;
      const typedResult = result as unknown as { success?: boolean; error?: string };
      if (!typedResult?.success) throw new Error(typedResult?.error || 'Erro desconhecido');
      return typedResult;
    },
    onSuccess: async (result, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['products'] }),
        queryClient.invalidateQueries({ queryKey: ['product', productId] }),
        queryClient.invalidateQueries({ queryKey: ['product-dual-stock', productId] }),
        queryClient.invalidateQueries({ queryKey: ['products', 'store'] }),
        queryClient.invalidateQueries({ queryKey: ['inventory_movements'] }),
        queryClient.invalidateQueries({ queryKey: ['kpis-inventory'] }),
        queryClient.invalidateQueries({ queryKey: ['low-stock-products-infinite'] }),
      ]);

      toast({
        title: "✅ Estoque ajustado!",
        description: `Novo estoque: ${variables.newPackages} pacotes e ${variables.newUnitsLoose} unidades`,
      });

      onSuccess?.();
      onClose();
      reset();
    },
    onError: (error) => {
      toast({
        title: "❌ Erro ao ajustar estoque",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Cálculos de preview
  const calculations = useMemo(() => {
    if (!product) return null;

    const currentPackages = Number(product.stock_packages || 0);
    const currentUnitsLoose = Number(product.stock_units_loose || 0);
    const newPackages = Number(watchedValues.newPackages || 0);
    const newUnitsLoose = Number(watchedValues.newUnitsLoose || 0);

    if (isNaN(currentPackages) || isNaN(newPackages)) return null;

    return {
      currentPackages,
      currentUnitsLoose,
      packagesChange: newPackages - currentPackages,
      unitsLooseChange: newUnitsLoose - currentUnitsLoose,
      hasChanges: newPackages !== currentPackages || newUnitsLoose !== currentUnitsLoose
    };
  }, [product, watchedValues]);

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = (data: StockAdjustmentFormData) => {
    adjustStockMutation.mutate(data);
  };

  // Loading state
  if (isLoadingProduct || (!product && !productError)) {
    return (
      <FormDialog
        open={isOpen}
        onOpenChange={(open) => !open && handleClose()}
        title="AJUSTAR ESTOQUE"
        description="Carregando informações do produto..."
        onSubmit={() => { }}
        submitLabel="Aguarde..."
        cancelLabel="Cancelar"
        loading={true}
        className="max-w-3xl"
      >
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-yellow-400 mr-2" />
          <span className="text-gray-300">Carregando produto...</span>
        </div>
      </FormDialog>
    );
  }

  // Error state
  if (productError || !product || !calculations) {
    return (
      <FormDialog
        open={isOpen}
        onOpenChange={(open) => !open && handleClose()}
        title="ERRO"
        description="Não foi possível carregar o produto"
        onSubmit={handleClose}
        submitLabel="Fechar"
        className="max-w-3xl"
      >
        <div className="flex items-center justify-center py-8 text-red-400">
          <AlertTriangle className="h-6 w-6 mr-2" />
          <span>Erro ao carregar produto. Tente novamente.</span>
        </div>
      </FormDialog>
    );
  }

  const inputClasses = cn(getGlassInputClasses('form'), 'h-9 text-sm');

  // Função helper para renderizar indicador de mudança
  const renderChangeIndicator = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4 text-green-400" />;
    if (change < 0) return <TrendingDown className="h-4 w-4 text-red-400" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  return (
    <FormDialog
      open={isOpen}
      onOpenChange={(open) => !open && handleClose()}
      title="AJUSTAR ESTOQUE"
      description={`📦 ${product.name} - Contagem Física da Loja 1`}
      onSubmit={handleSubmit(onSubmit)}
      submitLabel={adjustStockMutation.isPending ? "Ajustando..." : "✓ Confirmar Ajuste"}
      cancelLabel="Cancelar"
      loading={adjustStockMutation.isPending}
      size="full"
      variant="premium"
      glassEffect={true}
      className="max-w-3xl"
      disabled={!isDirty || !calculations.hasChanges || !user?.id}
    >
      {/* Layout compacto em 2 colunas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-4">

        {/* ========================================== */}
        {/* COLUNA 1 - Estoque Atual + Nova Contagem */}
        {/* ========================================== */}
        <div className="space-y-4">
          <h3 className="text-base font-semibold text-white flex items-center gap-2 border-b border-gray-700 pb-2">
            <Package className="h-4 w-4 text-blue-400" />
            📊 Contagem de Estoque
          </h3>

          {/* Resumo do estoque atual */}
          <div className="p-3 rounded-lg bg-gray-800/30 border border-gray-700/50">
            <p className="text-xs text-gray-400 mb-2">📦 Estoque Atual no Sistema</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-2 bg-blue-500/10 rounded border border-blue-500/20">
                <Package className="h-4 w-4 text-blue-400 mx-auto mb-1" />
                <div className="text-lg font-bold text-blue-400">{calculations.currentPackages}</div>
                <div className="text-xs text-gray-400">pacotes</div>
              </div>
              <div className="text-center p-2 bg-green-500/10 rounded border border-green-500/20">
                <Wine className="h-4 w-4 text-green-400 mx-auto mb-1" />
                <div className="text-lg font-bold text-green-400">{calculations.currentUnitsLoose}</div>
                <div className="text-xs text-gray-400">unidades</div>
              </div>
            </div>
          </div>

          {/* Inputs de contagem */}
          <div>
            <label className="block text-xs font-medium mb-1 text-gray-400">📦 Pacotes Contados</label>
            <Input
              type="number"
              min="0"
              autoFocus
              {...register('newPackages', { valueAsNumber: true })}
              className={cn(inputClasses, 'text-lg font-semibold')}
              placeholder="Ex: 10"
            />
            {errors.newPackages && <p className="text-xs text-red-400 mt-1">{errors.newPackages.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium mb-1 text-gray-400">🍾 Unidades Soltas Contadas</label>
            <Input
              type="number"
              min="0"
              {...register('newUnitsLoose', { valueAsNumber: true })}
              className={cn(inputClasses, 'text-lg font-semibold')}
              placeholder="Ex: 5"
            />
            {errors.newUnitsLoose && <p className="text-xs text-red-400 mt-1">{errors.newUnitsLoose.message}</p>}
          </div>

          {/* Motivo do ajuste */}
          <div>
            <label className="block text-xs font-medium mb-1 text-gray-400">📝 Motivo do Ajuste <span className="text-red-400">*</span></label>
            <Select
              value={watchedValues.reason}
              onValueChange={(value) => setValue('reason', value as keyof typeof ADJUSTMENT_REASONS)}
            >
              <SelectTrigger className={inputClasses}>
                <SelectValue placeholder="Selecione o motivo" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ADJUSTMENT_REASONS).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.reason && <p className="text-xs text-red-400 mt-1">{errors.reason.message}</p>}
          </div>
        </div>

        {/* ========================================== */}
        {/* COLUNA 2 - Preview das Mudanças */}
        {/* ========================================== */}
        <div className="space-y-4">
          <h3 className="text-base font-semibold text-white flex items-center gap-2 border-b border-gray-700 pb-2">
            <Eye className="h-4 w-4 text-purple-400" />
            👁️ Preview das Mudanças
          </h3>

          {calculations.hasChanges ? (
            <>
              {/* Mudança em Pacotes */}
              <div className="p-3 rounded-lg bg-gray-800/30 border border-gray-700/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">📦 Pacotes</span>
                  {renderChangeIndicator(calculations.packagesChange)}
                </div>
                <div className="flex items-center justify-between gap-2">
                  <div className="text-center p-2 bg-gray-700/30 rounded flex-1">
                    <div className="text-sm text-gray-400">Antes</div>
                    <div className="text-lg font-bold text-gray-300">{calculations.currentPackages}</div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-500" />
                  <div className="text-center p-2 bg-blue-500/20 rounded flex-1 border border-blue-500/30">
                    <div className="text-sm text-blue-300">Depois</div>
                    <div className="text-lg font-bold text-blue-400">{watchedValues.newPackages || 0}</div>
                  </div>
                  <div className={cn(
                    "text-center p-2 rounded min-w-[60px]",
                    calculations.packagesChange > 0 ? "bg-green-500/20 border border-green-500/30" :
                      calculations.packagesChange < 0 ? "bg-red-500/20 border border-red-500/30" :
                        "bg-gray-500/20"
                  )}>
                    <div className="text-xs text-gray-400">Diff</div>
                    <div className={cn(
                      "text-sm font-bold",
                      calculations.packagesChange > 0 ? "text-green-400" :
                        calculations.packagesChange < 0 ? "text-red-400" : "text-gray-400"
                    )}>
                      {calculations.packagesChange > 0 ? '+' : ''}{calculations.packagesChange}
                    </div>
                  </div>
                </div>
              </div>

              {/* Mudança em Unidades */}
              <div className="p-3 rounded-lg bg-gray-800/30 border border-gray-700/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">🍾 Unidades Soltas</span>
                  {renderChangeIndicator(calculations.unitsLooseChange)}
                </div>
                <div className="flex items-center justify-between gap-2">
                  <div className="text-center p-2 bg-gray-700/30 rounded flex-1">
                    <div className="text-sm text-gray-400">Antes</div>
                    <div className="text-lg font-bold text-gray-300">{calculations.currentUnitsLoose}</div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-500" />
                  <div className="text-center p-2 bg-green-500/20 rounded flex-1 border border-green-500/30">
                    <div className="text-sm text-green-300">Depois</div>
                    <div className="text-lg font-bold text-green-400">{watchedValues.newUnitsLoose || 0}</div>
                  </div>
                  <div className={cn(
                    "text-center p-2 rounded min-w-[60px]",
                    calculations.unitsLooseChange > 0 ? "bg-green-500/20 border border-green-500/30" :
                      calculations.unitsLooseChange < 0 ? "bg-red-500/20 border border-red-500/30" :
                        "bg-gray-500/20"
                  )}>
                    <div className="text-xs text-gray-400">Diff</div>
                    <div className={cn(
                      "text-sm font-bold",
                      calculations.unitsLooseChange > 0 ? "text-green-400" :
                        calculations.unitsLooseChange < 0 ? "text-red-400" : "text-gray-400"
                    )}>
                      {calculations.unitsLooseChange > 0 ? '+' : ''}{calculations.unitsLooseChange}
                    </div>
                  </div>
                </div>
              </div>

              {/* Motivo selecionado */}
              <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/30">
                <div className="text-xs text-purple-300 mb-1">📝 Motivo Selecionado</div>
                <div className="text-sm font-medium text-white">
                  {ADJUSTMENT_REASONS[watchedValues.reason]?.label || 'Não selecionado'}
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-gray-400">
              <Eye className="h-10 w-10 mb-3 opacity-30" />
              <p className="text-sm font-medium">Nenhuma alteração detectada</p>
              <p className="text-xs mt-1 text-gray-500">Altere as quantidades para ver o preview</p>
            </div>
          )}
        </div>
      </div>
    </FormDialog>
  );
};

export default StockAdjustmentModal;