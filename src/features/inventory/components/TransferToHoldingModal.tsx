/**
 * Modal para transferir estoque da Loja 1 (Active) para Loja 2 (Holding)
 * v3.6.5 - Padronizado com FormDialog + estilo neutro + emojis
 */

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';
import { useToast } from '@/shared/hooks/common/use-toast';
import { FormDialog } from '@/shared/ui/layout/FormDialog';
import { Input } from '@/shared/ui/primitives/input';
import { Textarea } from '@/shared/ui/primitives/textarea';
import { Package, Box, ArrowRight, Store } from 'lucide-react';
import { cn } from '@/core/config/utils';
import { getGlassInputClasses } from '@/core/config/theme-utils';
import type { Product } from '@/core/types/inventory.types';

// Schema de validação Zod
const transferSchema = z.object({
  packages: z.number().min(0, 'Quantidade não pode ser negativa').default(0),
  unitsLoose: z.number().min(0, 'Quantidade não pode ser negativa').default(0),
  notes: z.string().optional(),
}).refine(
  (data) => data.packages > 0 || data.unitsLoose > 0,
  { message: 'Transfira pelo menos pacotes OU unidades', path: ['packages'] }
);

type TransferFormData = z.infer<typeof transferSchema>;

interface TransferToHoldingModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const TransferToHoldingModal: React.FC<TransferToHoldingModalProps> = ({
  product,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<TransferFormData>({
    resolver: zodResolver(transferSchema),
    defaultValues: { packages: 0, unitsLoose: 0, notes: '' },
  });

  const packages = watch('packages');
  const unitsLoose = watch('unitsLoose');

  // Mutation para transferir estoque usando RPC
  const transferMutation = useMutation({
    mutationFn: async (data: TransferFormData) => {
      if (!product) throw new Error('Produto não selecionado');

      const { data: result, error } = await supabase.rpc('transfer_to_store2_holding', {
        p_product_id: product.id,
        p_quantity_packages: data.packages,
        p_quantity_units: data.unitsLoose,
        p_user_id: null,
        p_notes: data.notes || null,
      });

      if (error) {
        console.error('Erro na transferência:', error);
        throw error;
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['products', 'for-store-toggle'] });

      toast({
        title: '✅ Transferência realizada',
        description: `${packages} pacote(s) e ${unitsLoose} unidade(s) transferidos para Loja 2 (Depósito)`,
        variant: 'default',
      });

      reset();
      onClose();
      onSuccess?.();
    },
    onError: (error: any) => {
      let errorMessage = 'Erro ao transferir estoque. Tente novamente.';
      if (error.message?.includes('Estoque insuficiente')) errorMessage = error.message;
      else if (error.message?.includes('Produto não encontrado')) errorMessage = 'Produto não encontrado ou foi deletado.';

      toast({ title: '❌ Erro na transferência', description: errorMessage, variant: 'destructive' });
    },
  });

  const onSubmit = (data: TransferFormData) => {
    transferMutation.mutate(data);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!product) return null;

  const inputClasses = cn(getGlassInputClasses('form'), 'h-9 text-sm');

  return (
    <FormDialog
      open={isOpen}
      onOpenChange={(open) => !open && handleClose()}
      title="TRANSFERIR ESTOQUE"
      description={`Transferir "${product.name}" para Loja 2 (Depósito)`}
      onSubmit={handleSubmit(onSubmit)}
      submitLabel={transferMutation.isPending ? 'Transferindo...' : 'Transferir'}
      cancelLabel="Cancelar"
      loading={transferMutation.isPending}
      size="full"
      variant="premium"
      glassEffect={true}
      className="max-w-2xl"
    >
      {/* Layout compacto em 2 colunas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-4">

        {/* ========================================== */}
        {/* COLUNA 1 - Origem (Loja 1) */}
        {/* ========================================== */}
        <div className="space-y-3">
          <h3 className="text-base font-semibold text-white flex items-center gap-2 border-b border-gray-700 pb-2">
            <Store className="h-4 w-4 text-blue-400" />
            🏪 Loja 1 (Vendas) - Origem
          </h3>

          {/* Estoque disponível */}
          <div className="p-3 rounded-lg bg-gray-800/30 border border-gray-700/50">
            <p className="text-xs text-gray-400 mb-2">📦 Estoque Disponível</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-2 bg-blue-500/10 rounded border border-blue-500/20">
                <Package className="h-4 w-4 text-blue-400 mx-auto mb-1" />
                <div className="text-lg font-bold text-blue-400">{product.stock_packages || 0}</div>
                <div className="text-xs text-gray-400">pacotes</div>
              </div>
              <div className="text-center p-2 bg-green-500/10 rounded border border-green-500/20">
                <Box className="h-4 w-4 text-green-400 mx-auto mb-1" />
                <div className="text-lg font-bold text-green-400">{product.stock_units_loose || 0}</div>
                <div className="text-xs text-gray-400">unidades</div>
              </div>
            </div>
          </div>

          {/* Quantidade a transferir */}
          <div>
            <label className="block text-xs font-medium mb-1 text-gray-400">📦 Pacotes a Transferir</label>
            <Input
              type="number"
              min="0"
              max={product.stock_packages}
              {...register('packages', { valueAsNumber: true })}
              className={inputClasses}
              placeholder="0"
            />
            {errors.packages && <p className="text-xs text-red-400 mt-1">{errors.packages.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium mb-1 text-gray-400">🍾 Unidades Soltas a Transferir</label>
            <Input
              type="number"
              min="0"
              max={product.stock_units_loose}
              {...register('unitsLoose', { valueAsNumber: true })}
              className={inputClasses}
              placeholder="0"
            />
            {errors.unitsLoose && <p className="text-xs text-red-400 mt-1">{errors.unitsLoose.message}</p>}
          </div>
        </div>

        {/* ========================================== */}
        {/* COLUNA 2 - Destino (Loja 2) + Preview */}
        {/* ========================================== */}
        <div className="space-y-3">
          <h3 className="text-base font-semibold text-white flex items-center gap-2 border-b border-gray-700 pb-2">
            <ArrowRight className="h-4 w-4 text-purple-400" />
            🏬 Loja 2 (Depósito) - Destino
          </h3>

          {/* Preview da transferência */}
          <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/30">
            <p className="text-xs text-purple-300 mb-2 flex items-center gap-1">
              <ArrowRight className="h-3 w-3" />
              📋 Será Transferido:
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-2 bg-purple-500/20 rounded">
                <div className="text-lg font-bold text-purple-300">{packages || 0}</div>
                <div className="text-xs text-gray-400">pacotes</div>
              </div>
              <div className="text-center p-2 bg-purple-500/20 rounded">
                <div className="text-lg font-bold text-purple-300">{unitsLoose || 0}</div>
                <div className="text-xs text-gray-400">unidades</div>
              </div>
            </div>
          </div>

          {/* Estoque atual na Loja 2 */}
          <div className="p-3 rounded-lg bg-gray-800/30 border border-gray-700/50">
            <p className="text-xs text-gray-400 mb-2">📊 Estoque Atual na Loja 2</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-2 bg-gray-700/30 rounded">
                <div className="text-sm font-semibold text-gray-300">{product.store2_holding_packages || 0}</div>
                <div className="text-xs text-gray-500">pacotes</div>
              </div>
              <div className="text-center p-2 bg-gray-700/30 rounded">
                <div className="text-sm font-semibold text-gray-300">{product.store2_holding_units_loose || 0}</div>
                <div className="text-xs text-gray-500">unidades</div>
              </div>
            </div>
          </div>

          {/* Observações */}
          <div>
            <label className="block text-xs font-medium mb-1 text-gray-400">📝 Observações (opcional)</label>
            <Textarea
              {...register('notes')}
              className={cn(inputClasses, 'h-20 resize-none')}
              placeholder="Ex: Transferência para armazenamento de longo prazo"
            />
          </div>
        </div>
      </div>
    </FormDialog>
  );
};
