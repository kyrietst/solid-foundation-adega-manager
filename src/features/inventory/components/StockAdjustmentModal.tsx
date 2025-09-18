/**
 * StockAdjustmentModal.tsx - Modal de ajuste de estoque com Dupla Contagem (Controle Explícito)
 * REFATORADO COMPLETAMENTE: Nova arquitetura de contagem separada para pacotes e unidades soltas
 * Remove dependência de tipos de ajuste (entrada/saída) e implementa contagem física direta
 */

import React, { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { EnhancedBaseModal, ModalSection } from '@/shared/ui/composite';
import { Button } from '@/shared/ui/primitives/button';
import { Input } from '@/shared/ui/primitives/input';
import { Label } from '@/shared/ui/primitives/label';
import { Textarea } from '@/shared/ui/primitives/textarea';
import {
  Package,
  Wine,
  Calculator,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Eye,
  ClipboardList
} from 'lucide-react';
import { cn } from '@/core/config/utils';
import { getGlassCardClasses } from '@/core/config/theme-utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';
import { useToast } from '@/shared/hooks/common/use-toast';
import type { Product } from '@/core/types/inventory.types';

// Schema de validação para o formulário
const stockAdjustmentSchema = z.object({
  newPackages: z.number().min(0, 'Quantidade de pacotes não pode ser negativa'),
  newUnitsLoose: z.number().min(0, 'Quantidade de unidades soltas não pode ser negativa'),
  reason: z.string().min(3, 'Motivo deve ter pelo menos 3 caracteres').max(500, 'Motivo muito longo')
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

  // Buscar dados do produto com campos de dupla contagem
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
        .eq('id', productId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!productId && isOpen,
  });

  // Configuração do formulário com React Hook Form + Zod
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
      reason: ''
    }
  });

  // Observar mudanças nos campos para cálculo em tempo real
  const watchedValues = watch();

  // Configurar valores iniciais quando o produto for carregado
  React.useEffect(() => {
    if (product) {
      setValue('newPackages', product.stock_packages || 0);
      setValue('newUnitsLoose', product.stock_units_loose || 0);
    }
  }, [product, setValue]);

  // Mutation para ajuste de estoque usando a nova RPC
  const adjustStockMutation = useMutation({
    mutationFn: async (formData: StockAdjustmentFormData) => {
      if (!product) throw new Error('Produto não encontrado');

      // Calcular diferenças (deltas)
      const packagesChange = formData.newPackages - (product.stock_packages || 0);
      const unitsLooseChange = formData.newUnitsLoose - (product.stock_units_loose || 0);

      // Chamar a nova RPC adjust_stock_explicit
      const { data: result, error } = await supabase
        .rpc('adjust_stock_explicit', {
          p_product_id: productId,
          p_packages_change: packagesChange,
          p_units_loose_change: unitsLooseChange,
          p_reason: formData.reason
        });

      if (error) throw error;

      // Verificar se a RPC retornou sucesso
      if (!result.success) {
        throw new Error(result.error || 'Erro desconhecido no ajuste de estoque');
      }

      return result;
    },
    onSuccess: (result) => {
      toast({
        title: "Estoque ajustado com sucesso!",
        description: `Pacotes: ${result.old_packages} → ${result.new_packages} | Unidades soltas: ${result.old_units_loose} → ${result.new_units_loose}`,
      });

      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product-dual-stock', productId] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });

      onSuccess?.();
      onClose();
      reset();
    },
    onError: (error) => {
      toast({
        title: "Erro ao ajustar estoque",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Cálculos em tempo real
  const calculations = useMemo(() => {
    if (!product) return null;

    const currentPackages = product.stock_packages || 0;
    const currentUnitsLoose = product.stock_units_loose || 0;
    const packageUnits = product.package_units || 1;

    const newPackages = watchedValues.newPackages;
    const newUnitsLoose = watchedValues.newUnitsLoose;

    // Calcular totais
    const currentTotal = (currentPackages * packageUnits) + currentUnitsLoose;
    const newTotal = (newPackages * packageUnits) + newUnitsLoose;

    // Calcular diferenças
    const packagesChange = newPackages - currentPackages;
    const unitsLooseChange = newUnitsLoose - currentUnitsLoose;
    const totalChange = newTotal - currentTotal;

    return {
      currentPackages,
      currentUnitsLoose,
      currentTotal,
      newTotal,
      packagesChange,
      unitsLooseChange,
      totalChange,
      packageUnits,
      hasChanges: packagesChange !== 0 || unitsLooseChange !== 0
    };
  }, [product, watchedValues]);

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = (data: StockAdjustmentFormData) => {
    adjustStockMutation.mutate(data);
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
          <Loader2 className="h-6 w-6 animate-spin text-yellow-400 mr-2" />
          <span className="text-gray-300">Carregando produto...</span>
        </div>
      </EnhancedBaseModal>
    );
  }

  if (productError || !product || !calculations) {
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
          <AlertTriangle className="h-6 w-6 mr-2" />
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
      subtitle={`${product.name} - Contagem Física`}
      size="5xl"
      customIcon={ClipboardList}
      loading={adjustStockMutation.isPending}
      primaryAction={{
        label: adjustStockMutation.isPending ? "Ajustando..." : "Confirmar Ajuste",
        icon: adjustStockMutation.isPending ? Loader2 : CheckCircle,
        onClick: handleSubmit(onSubmit),
        disabled: !isDirty || !calculations.hasChanges || adjustStockMutation.isPending,
        loading: adjustStockMutation.isPending
      }}
      secondaryAction={{
        label: "Cancelar",
        onClick: handleClose,
        disabled: adjustStockMutation.isPending
      }}
    >
      {/* Seção: Informações Atuais do Produto */}
      <ModalSection
        title="Estoque Atual"
        subtitle="Estado atual do estoque no sistema"
      >
        <div className={cn(
          "p-4 rounded-lg border",
          getGlassCardClasses('premium')
        )}>
          <div className="flex items-center gap-4 mb-4">
            <Package className="h-8 w-8 text-yellow-400" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-100">
                {product.name}
              </h3>
              <p className="text-sm text-gray-400">
                {product.category} • Unidades por pacote: {calculations.packageUnits}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <Package className="h-5 w-5 text-blue-400 mx-auto mb-1" />
              <div className="text-sm text-gray-400">Pacotes Fechados</div>
              <div className="text-xl font-bold text-blue-400">{calculations.currentPackages}</div>
            </div>

            <div className="text-center p-3 bg-green-500/10 rounded-lg border border-green-500/20">
              <Wine className="h-5 w-5 text-green-400 mx-auto mb-1" />
              <div className="text-sm text-gray-400">Unidades Soltas</div>
              <div className="text-xl font-bold text-green-400">{calculations.currentUnitsLoose}</div>
            </div>

            <div className="text-center p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
              <Calculator className="h-5 w-5 text-yellow-400 mx-auto mb-1" />
              <div className="text-sm text-gray-400">Total de Unidades</div>
              <div className="text-xl font-bold text-yellow-400">{calculations.currentTotal}</div>
            </div>
          </div>
        </div>
      </ModalSection>

      {/* Seção: Contagem Física */}
      <ModalSection
        title="Nova Contagem Física"
        subtitle="Insira a contagem real dos produtos após verificação física"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="newPackages" className="text-gray-100 font-medium">
                Pacotes Fechados Contados
              </Label>
              <Input
                id="newPackages"
                type="number"
                min="0"
                {...register('newPackages', { valueAsNumber: true })}
                className="bg-gray-800/50 border-gray-600 text-gray-100 text-lg font-semibold"
                placeholder="Ex: 10"
              />
              {errors.newPackages && (
                <p className="text-red-400 text-sm">{errors.newPackages.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="newUnitsLoose" className="text-gray-100 font-medium">
                Unidades Soltas Contadas
              </Label>
              <Input
                id="newUnitsLoose"
                type="number"
                min="0"
                {...register('newUnitsLoose', { valueAsNumber: true })}
                className="bg-gray-800/50 border-gray-600 text-gray-100 text-lg font-semibold"
                placeholder="Ex: 5"
              />
              {errors.newUnitsLoose && (
                <p className="text-red-400 text-sm">{errors.newUnitsLoose.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason" className="text-gray-100 font-medium">
              Motivo do Ajuste <span className="text-red-400">*</span>
            </Label>
            <Textarea
              id="reason"
              {...register('reason')}
              className="bg-gray-800/50 border-gray-600 text-gray-100"
              placeholder="Descreva o motivo do ajuste (ex: contagem física, produto danificado, etc.)"
              rows={3}
            />
            {errors.reason && (
              <p className="text-red-400 text-sm">{errors.reason.message}</p>
            )}
          </div>
        </form>
      </ModalSection>

      {/* Seção: Preview das Mudanças */}
      <ModalSection
        title="Preview das Mudanças"
        subtitle="Resumo das alterações que serão aplicadas"
        icon={Eye}
      >
        <div className={cn(
          "p-4 rounded-lg border",
          calculations.hasChanges
            ? "border-blue-500/30 bg-blue-500/5"
            : "border-gray-600/30 bg-gray-700/5"
        )}>
          {calculations.hasChanges ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-sm text-gray-400 mb-1">Pacotes</div>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-gray-300">{calculations.currentPackages}</span>
                    <span className="text-gray-500">→</span>
                    <span className="text-blue-400 font-semibold">{watchedValues.newPackages}</span>
                    <span className={cn(
                      "text-xs font-medium px-1.5 py-0.5 rounded",
                      calculations.packagesChange > 0
                        ? "bg-green-500/20 text-green-400"
                        : calculations.packagesChange < 0
                        ? "bg-red-500/20 text-red-400"
                        : "bg-gray-500/20 text-gray-400"
                    )}>
                      {calculations.packagesChange > 0 ? '+' : ''}{calculations.packagesChange}
                    </span>
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-sm text-gray-400 mb-1">Unidades Soltas</div>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-gray-300">{calculations.currentUnitsLoose}</span>
                    <span className="text-gray-500">→</span>
                    <span className="text-green-400 font-semibold">{watchedValues.newUnitsLoose}</span>
                    <span className={cn(
                      "text-xs font-medium px-1.5 py-0.5 rounded",
                      calculations.unitsLooseChange > 0
                        ? "bg-green-500/20 text-green-400"
                        : calculations.unitsLooseChange < 0
                        ? "bg-red-500/20 text-red-400"
                        : "bg-gray-500/20 text-gray-400"
                    )}>
                      {calculations.unitsLooseChange > 0 ? '+' : ''}{calculations.unitsLooseChange}
                    </span>
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-sm text-gray-400 mb-1">Total de Unidades</div>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-gray-300">{calculations.currentTotal}</span>
                    <span className="text-gray-500">→</span>
                    <span className="text-yellow-400 font-semibold">{calculations.newTotal}</span>
                    <span className={cn(
                      "text-xs font-medium px-1.5 py-0.5 rounded",
                      calculations.totalChange > 0
                        ? "bg-green-500/20 text-green-400"
                        : calculations.totalChange < 0
                        ? "bg-red-500/20 text-red-400"
                        : "bg-gray-500/20 text-gray-400"
                    )}>
                      {calculations.totalChange > 0 ? '+' : ''}{calculations.totalChange}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-gray-400">
              <Eye className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Nenhuma alteração detectada</p>
              <p className="text-sm">As quantidades estão iguais ao estoque atual</p>
            </div>
          )}
        </div>
      </ModalSection>
    </EnhancedBaseModal>
  );
};

export default StockAdjustmentModal;