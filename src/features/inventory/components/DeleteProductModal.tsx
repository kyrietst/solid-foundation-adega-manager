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
  Loader2
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
  const [productInfo, setProductInfo] = useState<ProductDeleteInfo | null>(null);
  const [isLoadingInfo, setIsLoadingInfo] = useState(false);

  const {
    softDelete,
    getProductInfo,
    isDeleting
  } = useProductDelete();

  // Buscar informações do produto quando o modal abrir
  useEffect(() => {
    const fetchProductInfo = async () => {
      if (isOpen && productId) {
        setIsLoadingInfo(true);
        const info = await getProductInfo(productId);
        setProductInfo(info);
        setIsLoadingInfo(false);
      }
    };

    fetchProductInfo();
  }, [isOpen, productId, getProductInfo]);

  // Reset ao fechar
  useEffect(() => {
    if (!isOpen) {
      setConfirmationText('');
      setProductInfo(null);
    }
  }, [isOpen]);

  const handleConfirm = async () => {
    if (!productId) return;

    try {
      await softDelete(productId);
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Erro na operação:', error);
    }
  };

  // Validação do botão de confirmar - COMPARAÇÃO EXATA
  const canConfirm = () => {
    return confirmationText === productName;
  };

  const hasHistory = productInfo && (productInfo.salesCount > 0 || productInfo.movementsCount > 0);

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
          {/* Informações do Produto */}
          {isLoadingInfo ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary-yellow" />
            </div>
          ) : productInfo ? (
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary-yellow" />
                  <span className="font-semibold text-lg text-white">{productInfo.name}</span>
                </div>
                {productInfo.barcode && (
                  <Badge variant="outline" className="text-gray-300 flex items-center gap-1">
                    <Barcode className="h-3 w-3" />
                    {productInfo.barcode}
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-400">
                <span className="px-2 py-1 bg-gray-700 rounded">{productInfo.category}</span>
                <span className="px-2 py-1 bg-green-900/20 text-green-400 rounded">
                  {formatCurrency(productInfo.price)}
                </span>
              </div>

              {/* Estoque Atual */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-700">
                <div className="flex items-center gap-2">
                  <Box className="h-4 w-4 text-blue-400" />
                  <div>
                    <p className="text-xs text-gray-400">Pacotes</p>
                    <p className="text-sm font-medium text-white">{productInfo.stockPackages}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-green-400" />
                  <div>
                    <p className="text-xs text-gray-400">Unidades Soltas</p>
                    <p className="text-sm font-medium text-white">{productInfo.stockUnitsLoose}</p>
                  </div>
                </div>
              </div>

              {/* Histórico - se houver */}
              {hasHistory && (
                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-700">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4 text-yellow-400" />
                    <div>
                      <p className="text-xs text-gray-400">Vendas</p>
                      <p className="text-sm font-medium text-white">{productInfo.salesCount}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-purple-400" />
                    <div>
                      <p className="text-xs text-gray-400">Movimentos</p>
                      <p className="text-sm font-medium text-white">{productInfo.movementsCount}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : null}

          {/* Alerta de histórico */}
          {hasHistory && (
            <Alert className="bg-yellow-900/20 border-yellow-500/50">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-yellow-200">
                <strong>Atenção:</strong> Este produto possui {productInfo!.salesCount} vendas e {productInfo!.movementsCount} movimentos de estoque registrados.
                O histórico será preservado para fins de auditoria e relatórios.
              </AlertDescription>
            </Alert>
          )}

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
            <div className="bg-gray-700/50 border-2 border-yellow-500/50 rounded-lg p-3">
              <p className="text-xs text-gray-400 mb-1">Nome a ser digitado:</p>
              <p className="text-lg font-bold text-white font-mono select-all">
                {productName}
              </p>
              <p className="text-xs text-yellow-400 mt-1">
                ⚠️ Copie ou digite exatamente como mostrado acima
              </p>
            </div>

            <Input
              type="text"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              placeholder="Digite aqui..."
              className="bg-gray-800 border-gray-600 text-white"
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
