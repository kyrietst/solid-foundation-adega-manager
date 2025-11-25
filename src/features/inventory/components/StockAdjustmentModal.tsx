/**
 * StockAdjustmentModal.tsx - Modal de ajuste de estoque com Estado Absoluto
 * REFATORADO PARA MODELO ABSOLUTO: Frontend como mensageiro - não calcula deltas
 * Envia valores absolutos diretamente para o backend via set_product_stock_absolute
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
import { useAuth } from '@/app/providers/AuthContext';
import type { Product, StoreLocation } from '@/core/types/inventory.types';
import { getSaoPauloTimestamp } from '@/shared/hooks/common/use-brasil-timezone';
import { getStoreStock } from '../hooks/useStoreInventory';

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
  storeFilter?: StoreLocation; // 🏪 v3.4.0 - Qual loja está sendo ajustada
}

export const StockAdjustmentModal: React.FC<StockAdjustmentModalProps> = ({
  isOpen,
  onClose,
  productId,
  onSuccess,
  storeFilter // 🏪 v3.4.0 - Filtro de loja
}) => {
  // Log de diagnóstico para verificar renderização
  React.useEffect(() => {
    if (isOpen) {
    }
  }, [isOpen]);

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

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

      if (error) {
        // PGRST116 = produto deletado/não encontrado, retornar null ao invés de throw
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return data;
    },
    enabled: !!productId && isOpen,
    // 🚨 ESTRATÉGIA ANTI-CACHE AGRESSIVA
    staleTime: 0, // Dados sempre considerados obsoletos
    refetchOnWindowFocus: true, // Refetch ao focar janela
    refetchOnMount: true, // Refetch ao montar componente
    refetchOnReconnect: true, // Refetch ao reconectar
    cacheTime: 0, // Não manter cache (React Query v4) / gcTime: 0 (v5)
    gcTime: 0, // Garbage collection imediato (React Query v5)
    retry: (failureCount, error) => {
      // Não fazer retry para produtos deletados/não encontrados
      if (failureCount < 3 && error.code !== 'PGRST116' && !error.message?.includes('not found')) {
        return true;
      }
      return false;
    },
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
      // 🏪 v3.4.0 - Ler do estoque correto baseado na loja selecionada
      const storeStock = storeFilter ? getStoreStock(product, storeFilter) : {
        packages: product.stock_packages || 0,
        units: product.stock_units_loose || 0
      };

      setValue('newPackages', storeStock.packages);
      setValue('newUnitsLoose', storeStock.units);
    }
  }, [product, storeFilter, setValue]);

  // Mutation para ajuste de estoque usando estado absoluto
  const adjustStockMutation = useMutation({
    mutationFn: async (formData: StockAdjustmentFormData) => {
      // 🛡️ VALIDAÇÕES CRÍTICAS DE SEGURANÇA
      if (!product) {
        console.error('❌ ERRO CRÍTICO: Produto não encontrado');
        throw new Error('Produto não encontrado');
      }

      if (!user) {
        console.error('❌ ERRO CRÍTICO: Usuário não está autenticado');
        throw new Error('Usuário não autenticado. Por favor, faça login novamente.');
      }

      if (!user.id) {
        console.error('❌ ERRO CRÍTICO: ID do usuário não disponível', { user });
        throw new Error('ID do usuário não disponível. Por favor, faça login novamente.');
      }

      if (!productId) {
        console.error('❌ ERRO CRÍTICO: ID do produto não fornecido');
        throw new Error('ID do produto é obrigatório');
      }

      // Garantir valores numéricos válidos
      const newPackages = Number(formData.newPackages || 0);
      const newUnitsLoose = Number(formData.newUnitsLoose || 0);
      const reason = (formData.reason || '').trim();

      // Validações antes de enviar
      if (isNaN(newPackages) || isNaN(newUnitsLoose)) {
        console.error('❌ VALIDAÇÃO: Valores inválidos (NaN detectado)', {
          newPackages, newUnitsLoose
        });
        throw new Error('Valores inválidos (NaN detectado)');
      }

      if (newPackages < 0 || newUnitsLoose < 0) {
        console.error('❌ VALIDAÇÃO: Valores negativos não permitidos', {
          newPackages, newUnitsLoose
        });
        throw new Error('Valores não podem ser negativos');
      }

      if (reason.length < 3) {
        console.error('❌ VALIDAÇÃO: Motivo muito curto', {
          reason, length: reason.length
        });
        throw new Error('Motivo deve ter pelo menos 3 caracteres');
      }

      // 🚀 CHAMAR RPC MULTISTORE COM PARÂMETRO DE LOJA
      // 🏪 v3.4.3 - Usar função multistore com p_store
      const storeNumber = storeFilter === 'store1' ? 1 : storeFilter === 'store2' ? 2 : 1; // Default Loja 1

      const { data: result, error } = await supabase
        .rpc('set_product_stock_absolute_multistore', {
          p_product_id: productId,
          p_new_packages: newPackages,
          p_new_units_loose: newUnitsLoose,
          p_reason: reason,
          p_user_id: user.id,
          p_store: storeNumber // 🏪 1 = Loja 1, 2 = Loja 2
        });

      if (error) {
        console.error('❌ ERRO RPC set_product_stock_absolute_multistore:', {
          error,
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
          parameters_sent: {
            p_product_id: productId,
            p_new_packages: newPackages,
            p_new_units_loose: newUnitsLoose,
            p_reason: reason,
            p_user_id: user.id,
            p_store: storeNumber
          }
        });
        throw error;
      }


      // Verificar se a RPC retornou sucesso
      if (!result?.success) {
        console.error('❌ RPC retornou falha:', result);
        throw new Error(result?.error || 'Erro desconhecido no ajuste de estoque');
      }

      return result;
    },
    onSuccess: async (result, variables) => {
      // 🚨 INVALIDAÇÃO AGRESSIVA DE CACHE - Garantir que todos os dados sejam atualizados
      await Promise.all([
        // Core product queries
        queryClient.invalidateQueries({ queryKey: ['products'] }),
        queryClient.invalidateQueries({ queryKey: ['product', productId] }),
        queryClient.invalidateQueries({ queryKey: ['product-dual-stock', productId] }),
        queryClient.invalidateQueries({ queryKey: ['product-ssot', productId] }),

        // 🏪 v3.4.2 - Multi-store queries
        queryClient.invalidateQueries({ queryKey: ['products', 'store'] }),
        queryClient.invalidateQueries({ queryKey: ['products', 'store', 'store1'] }),
        queryClient.invalidateQueries({ queryKey: ['products', 'store', 'store2'] }),
        queryClient.invalidateQueries({ queryKey: ['products', 'store-counts'] }),

        // SSoT product queries
        queryClient.invalidateQueries({ queryKey: ['products-ssot'] }),
        queryClient.invalidateQueries({ queryKey: ['all-products-ssot'] }),
        queryClient.invalidateQueries({ queryKey: ['stock-availability-ssot', productId] }),

        // Product variants and availability
        queryClient.invalidateQueries({ queryKey: ['product-variants', productId] }),
        queryClient.invalidateQueries({ queryKey: ['product-variants'] }),
        queryClient.invalidateQueries({ queryKey: ['products-with-variants'] }),
        queryClient.invalidateQueries({ queryKey: ['variant-availability'] }),

        // Grid and listing queries
        queryClient.invalidateQueries({ queryKey: ['products', 'available'] }),
        queryClient.invalidateQueries({ queryKey: ['products', 'lowStock'] }),

        // Inventory and movements
        queryClient.invalidateQueries({ queryKey: ['inventory_movements'] }),
        queryClient.invalidateQueries({ queryKey: ['movements'] }),

        // Dashboard and reporting
        queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
        queryClient.invalidateQueries({ queryKey: ['reports'] }),
        queryClient.invalidateQueries({ queryKey: ['top-products'] }),

        // ✅ v3.5.4 - KPIs de inventário para Dashboard atualizar
        queryClient.invalidateQueries({ queryKey: ['kpis-inventory'] }),
        queryClient.invalidateQueries({ queryKey: ['out-of-stock-products'] }),

        // Categories and batch data
        queryClient.invalidateQueries({ queryKey: ['products-by-category'] }),
        queryClient.invalidateQueries({ queryKey: ['batches', productId] }),
      ]);

      // 🔄 REFETCH IMEDIATO do produto específico para garantir dados atualizados
      await queryClient.refetchQueries({
        queryKey: ['product-dual-stock', productId],
        type: 'active'
      });

      toast({
        title: "Estoque ajustado com sucesso!",
        description: `Estoque atualizado para: ${variables.newPackages} pacotes e ${variables.newUnitsLoose} unidades soltas`,
      });

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

  // ULTRA SIMPLIFICADO - Apenas 2 números diretos
  const calculations = useMemo(() => {
    if (!product) return null;

    // 🏪 v3.4.0 - Ler do estoque correto baseado na loja selecionada
    const storeStock = storeFilter ? getStoreStock(product, storeFilter) : {
      packages: product.stock_packages || 0,
      units: product.stock_units_loose || 0
    };

    const currentPackages = Number(storeStock.packages);
    const currentUnitsLoose = Number(storeStock.units);
    const newPackages = Number(watchedValues.newPackages || 0);
    const newUnitsLoose = Number(watchedValues.newUnitsLoose || 0);

    // Validar que não temos NaN
    if (isNaN(currentPackages) || isNaN(currentUnitsLoose) || isNaN(newPackages) || isNaN(newUnitsLoose)) {
      console.error('❌ NaN detectado:', { currentPackages, currentUnitsLoose, newPackages, newUnitsLoose });
      return null;
    }

    // APENAS diferenças diretas dos 2 campos
    const packagesChange = newPackages - currentPackages;
    const unitsLooseChange = newUnitsLoose - currentUnitsLoose;

    return {
      currentPackages,
      currentUnitsLoose,
      packagesChange,
      unitsLooseChange,
      hasChanges: newPackages !== currentPackages || newUnitsLoose !== currentUnitsLoose
    };
  }, [product, storeFilter, watchedValues]);

  const handleClose = () => {
    reset();
    onClose();
  };

  // Função simplificada - apenas envia valores absolutos
  const onSubmit = (data: StockAdjustmentFormData) => {
    adjustStockMutation.mutate(data);
  };

  // ✅ FIX: Previne flash do modal de erro durante carregamento inicial
  // Só mostra erro se realmente houve um erro E não está carregando
  if (isLoadingProduct || (!product && !productError)) {
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

  // ✅ FIX: Só mostra erro se realmente houver erro ou dados inválidos após carregamento
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
      className="max-h-[90vh] overflow-y-auto"
      customIcon={ClipboardList}
      loading={adjustStockMutation.isPending}
      showCloseButton={false}
      primaryAction={{
        label: adjustStockMutation.isPending ? "Ajustando..." : "Confirmar Ajuste",
        icon: adjustStockMutation.isPending ? Loader2 : CheckCircle,
        onClick: handleSubmit(onSubmit),
        disabled: !isDirty || !calculations.hasChanges || adjustStockMutation.isPending || !user?.id,
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
                {product.category}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="text-center p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <Package className="h-5 w-5 text-blue-400 mx-auto mb-1" />
              <div className="text-sm text-gray-400">Pacotes Fechados</div>
              <div className="text-xl font-bold text-blue-400">{calculations.currentPackages || 0}</div>
            </div>

            <div className="text-center p-3 bg-green-500/10 rounded-lg border border-green-500/20">
              <Wine className="h-5 w-5 text-green-400 mx-auto mb-1" />
              <div className="text-sm text-gray-400">Unidades Soltas</div>
              <div className="text-xl font-bold text-green-400">{calculations.currentUnitsLoose || 0}</div>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-sm text-gray-400 mb-1">Pacotes</div>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-gray-300">{calculations.currentPackages || 0}</span>
                    <span className="text-gray-500">→</span>
                    <span className="text-blue-400 font-semibold">{watchedValues.newPackages || 0}</span>
                    <span className={cn(
                      "text-xs font-medium px-1.5 py-0.5 rounded",
                      (calculations.packagesChange || 0) > 0
                        ? "bg-green-500/20 text-green-400"
                        : (calculations.packagesChange || 0) < 0
                        ? "bg-red-500/20 text-red-400"
                        : "bg-gray-500/20 text-gray-400"
                    )}>
                      {(calculations.packagesChange || 0) > 0 ? '+' : ''}{calculations.packagesChange || 0}
                    </span>
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-sm text-gray-400 mb-1">Unidades Soltas</div>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-gray-300">{calculations.currentUnitsLoose || 0}</span>
                    <span className="text-gray-500">→</span>
                    <span className="text-green-400 font-semibold">{watchedValues.newUnitsLoose || 0}</span>
                    <span className={cn(
                      "text-xs font-medium px-1.5 py-0.5 rounded",
                      (calculations.unitsLooseChange || 0) > 0
                        ? "bg-green-500/20 text-green-400"
                        : (calculations.unitsLooseChange || 0) < 0
                        ? "bg-red-500/20 text-red-400"
                        : "bg-gray-500/20 text-gray-400"
                    )}>
                      {(calculations.unitsLooseChange || 0) > 0 ? '+' : ''}{calculations.unitsLooseChange || 0}
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