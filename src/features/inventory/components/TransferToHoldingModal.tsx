/**
 * Modal para transferir estoque da Loja 1 (Active) para Loja 2 (Holding)
 * v3.6.1 - "Active vs Holding Stock" Architecture
 *
 * Este modal permite transferências atômicas de pacotes/unidades da Loja 1 para Loja 2
 * usando a RPC transfer_to_store2_holding que garante consistência e auditoria.
 */

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';
import { useToast } from '@/shared/hooks/common/use-toast';
import { Button } from '@/shared/ui/primitives/button';
import { Input } from '@/shared/ui/primitives/input';
import { Textarea } from '@/shared/ui/primitives/textarea';
import { Label } from '@/shared/ui/primitives/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/shared/ui/primitives/dialog';
import { Loader2, ArrowRight, Package, Box } from 'lucide-react';
import type { Product } from '@/core/types/inventory.types';

// Schema de validação Zod
const transferSchema = z.object({
  packages: z.number().min(0, 'Quantidade não pode ser negativa').default(0),
  unitsLoose: z.number().min(0, 'Quantidade não pode ser negativa').default(0),
  notes: z.string().optional(),
}).refine(
  (data) => data.packages > 0 || data.unitsLoose > 0,
  {
    message: 'Transfira pelo menos pacotes OU unidades',
    path: ['packages'], // Mostrar erro no campo packages
  }
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
    defaultValues: {
      packages: 0,
      unitsLoose: 0,
      notes: '',
    },
  });

  const packages = watch('packages');
  const unitsLoose = watch('unitsLoose');

  // Mutation para transferir estoque usando RPC
  const transferMutation = useMutation({
    mutationFn: async (data: TransferFormData) => {
      if (!product) throw new Error('Produto não selecionado');

      // Chamar RPC transfer_to_store2_holding
      const { data: result, error } = await supabase.rpc('transfer_to_store2_holding', {
        p_product_id: product.id,
        p_quantity_packages: data.packages,
        p_quantity_units: data.unitsLoose,
        p_user_id: null, // TODO: Pegar user_id do contexto de autenticação
        p_notes: data.notes || null,
      });

      if (error) {
        console.error('Erro na transferência:', error);
        throw error;
      }

      return result;
    },
    onSuccess: (result) => {
      // Invalidar cache de produtos para atualizar valores
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['products', 'for-store-toggle'] });

      toast({
        title: 'Transferência realizada',
        description: `${packages} pacote(s) e ${unitsLoose} unidade(s) transferidos para Loja 2 (Depósito)`,
        variant: 'default',
      });

      reset();
      onClose();
      onSuccess?.();
    },
    onError: (error: any) => {
      console.error('Erro ao transferir estoque:', error);

      // Mensagens de erro amigáveis
      let errorMessage = 'Erro ao transferir estoque. Tente novamente.';

      if (error.message?.includes('Estoque insuficiente')) {
        errorMessage = error.message;
      } else if (error.message?.includes('Produto não encontrado')) {
        errorMessage = 'Produto não encontrado ou foi deletado.';
      }

      toast({
        title: 'Erro na transferência',
        description: errorMessage,
        variant: 'destructive',
      });
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

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] bg-black/95 border-white/10">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
            <ArrowRight className="h-5 w-5 text-purple-400" />
            Transferir para Loja 2 (Depósito)
          </DialogTitle>
          <DialogDescription className="text-white/60">
            Transferir estoque de <span className="font-semibold text-white">{product.name}</span> da Loja 1 (Vendas) para Loja 2 (Depósito)
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Estoque Disponível */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <h3 className="text-sm font-medium text-white/70 mb-2">Estoque Disponível (Loja 1)</h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-blue-400" />
                <span className="text-white font-semibold">{product.stock_packages}</span>
                <span className="text-white/50 text-sm">pacotes</span>
              </div>
              <div className="flex items-center gap-2">
                <Box className="h-4 w-4 text-green-400" />
                <span className="text-white font-semibold">{product.stock_units_loose}</span>
                <span className="text-white/50 text-sm">unidades</span>
              </div>
            </div>
          </div>

          {/* Campo: Pacotes */}
          <div className="space-y-2">
            <Label htmlFor="packages" className="text-white">
              Pacotes a transferir
            </Label>
            <Input
              id="packages"
              type="number"
              min="0"
              max={product.stock_packages}
              {...register('packages', { valueAsNumber: true })}
              className="bg-white/5 border-white/20 text-white"
              placeholder="0"
            />
            {errors.packages && (
              <p className="text-red-400 text-sm">{errors.packages.message}</p>
            )}
          </div>

          {/* Campo: Unidades Soltas */}
          <div className="space-y-2">
            <Label htmlFor="unitsLoose" className="text-white">
              Unidades soltas a transferir
            </Label>
            <Input
              id="unitsLoose"
              type="number"
              min="0"
              max={product.stock_units_loose}
              {...register('unitsLoose', { valueAsNumber: true })}
              className="bg-white/5 border-white/20 text-white"
              placeholder="0"
            />
            {errors.unitsLoose && (
              <p className="text-red-400 text-sm">{errors.unitsLoose.message}</p>
            )}
          </div>

          {/* Campo: Observações */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-white">
              Observações (opcional)
            </Label>
            <Textarea
              id="notes"
              {...register('notes')}
              className="bg-white/5 border-white/20 text-white min-h-[80px]"
              placeholder="Ex: Transferência para armazenamento de longo prazo"
            />
          </div>

          {/* Botões */}
          <div className="flex gap-2 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={transferMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={transferMutation.isPending}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {transferMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Transferindo...
                </>
              ) : (
                <>
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Transferir
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
