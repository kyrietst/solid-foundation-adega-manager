/**
 * DeleteProductModal Component
 *
 * Modal de confirmação para exclusão (soft delete) de produtos
 * Segue o padrão estabelecido em DeleteCustomerModal
 *
 * @author Adega Manager Team
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/primitives/dialog';
import { Button } from '@/shared/ui/primitives/button';
import { Input } from '@/shared/ui/primitives/input';
import { Alert, AlertDescription } from '@/shared/ui/primitives/alert';
import { Badge } from '@/shared/ui/primitives/badge';
import {
  AlertTriangle,
  Trash2,
  Package,
  Box,
  ShoppingCart,
  TrendingUp,
  Barcode,
  DollarSign,
  Loader2,
  Copy,
  Check
} from 'lucide-react';
import { cn } from '@/core/config/utils';
import { formatCurrency } from '@/core/config/utils';
import useProductDelete, { ProductDeleteInfo } from '../hooks/useProductDelete';

interface DeleteProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string | null;
  productName: string;
  onSuccess?: () => void;
}

export const DeleteProductModal: React.FC<DeleteProductModalProps> = ({
  isOpen,
  onClose,
  productId,
  productName,
  onSuccess,
}) => {
  const [confirmationText, setConfirmationText] = useState('');
  const [copied, setCopied] = useState(false);

  const { softDelete, isDeleting } = useProductDelete();

  // Reset ao fechar
  useEffect(() => {
    if (!isOpen) {
      setConfirmationText('');
    }
  }, [isOpen]);

  const handleConfirm = async () => {
    if (!productId || !productName) return;

    try {
      // ✅ Fechar modal ANTES de deletar
      onClose();

      // ✅ Passar productName como argumento (NUNCA fazer fetch após delete!)
      await softDelete({ productId, productName });
      onSuccess?.();
    } catch (error) {
      console.error('Erro na operação:', error);
    }
  };

  const handleCopyName = () => {
    navigator.clipboard.writeText(productName);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Validação do botão de confirmar - COMPARAÇÃO EXATA
  const canConfirm = () => {
    return confirmationText === productName;
  };

  // ❌ REMOVIDO: hasHistory (não fazemos mais fetch de productInfo)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <Trash2 className="h-6 w-6 text-red-500" />
            🗑️ Excluir Produto
          </DialogTitle>
          <DialogDescription className="text-gray-300 text-base mt-2">
            O produto será excluído, mas seus dados e histórico serão preservados. Você poderá restaurar este produto mais tarde se necessário.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* ✅ SIMPLIFICADO: Apenas mostrar o nome do produto */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary-yellow" />
              <span className="font-semibold text-lg text-white">{productName}</span>
            </div>
          </div>

          {/* Info sobre soft delete */}
          <Alert className="bg-blue-900/20 border-blue-500/50">
            <AlertDescription className="text-blue-200">
              <strong>Exclusão Segura:</strong> O produto será marcado como inativo mas não será removido do banco de dados.
              Todas as vendas e relatórios anteriores continuarão funcionando normalmente.
            </AlertDescription>
          </Alert>

          {/* Campo de Confirmação */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-300">
              Para confirmar, digite o nome EXATAMENTE como aparece abaixo:
            </p>

            {/* Caixa destacada mostrando o nome exato */}
            <div className="bg-gray-700/50 border-2 border-yellow-500/50 rounded-lg p-3 relative group">
              <p className="text-xs text-gray-400 mb-1">Nome a ser digitado:</p>
              <div className="flex items-center justify-between gap-2">
                <p className="text-lg font-bold text-white font-mono select-all break-all">
                  {productName}
                </p>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCopyName}
                  className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-gray-600"
                  title="Copiar nome"
                >
                  {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-yellow-400 mt-1">
                ⚠️ Copie ou digite exatamente como mostrado acima
              </p>
            </div>

            <Input
              type="text"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              placeholder="Cole o nome do produto aqui..."
              className={cn(
                "bg-gray-800 border-gray-600 text-white transition-colors",
                confirmationText && confirmationText !== productName && "border-red-500 focus:ring-red-500",
                confirmationText === productName && "border-green-500 focus:ring-green-500"
              )}
              disabled={isDeleting}
              autoComplete="off"
            />
            {confirmationText && !canConfirm() && (
              <p className="text-xs text-red-400 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Texto de confirmação incorreto
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
            className="border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            Cancelar
          </Button>

          <Button
            onClick={handleConfirm}
            disabled={!canConfirm() || isDeleting}
            className={cn(
              'font-semibold bg-red-600 hover:bg-red-700'
            )}
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir Produto
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteProductModal;
