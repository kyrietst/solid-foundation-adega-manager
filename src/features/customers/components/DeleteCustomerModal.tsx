/**
 * DeleteCustomerModal Component
 *
 * Modal de confirmação para exclusão de clientes
 * Implementa 3 níveis de exclusão:
 * 1. Soft Delete (padrão) - Exclusão lógica
 * 2. Restore - Restauração
 * 3. Hard Delete (admin) - Exclusão permanente
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
  RotateCcw,
  ShieldAlert,
  DollarSign,
  ShoppingCart,
  Calendar,
  User,
  Loader2
} from 'lucide-react';
import { cn } from '@/core/config/utils';
import useCustomerDelete, { CustomerDeleteInfo } from '../hooks/useCustomerDelete';

export type DeleteMode = 'soft' | 'hard' | 'restore';

interface DeleteCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerId: string | null;
  customerName: string;
  mode?: DeleteMode;
  onSuccess?: () => void;
}

export const DeleteCustomerModal: React.FC<DeleteCustomerModalProps> = ({
  isOpen,
  onClose,
  customerId,
  customerName,
  mode = 'soft',
  onSuccess,
}) => {
  const [confirmationText, setConfirmationText] = useState('');
  const [customerInfo, setCustomerInfo] = useState<CustomerDeleteInfo | null>(null);
  const [isLoadingInfo, setIsLoadingInfo] = useState(false);

  const {
    softDelete,
    restore,
    hardDelete,
    getCustomerInfo,
    isDeleting,
    isRestoring
  } = useCustomerDelete();

  // Buscar informações do cliente quando o modal abrir
  useEffect(() => {
    const fetchCustomerInfo = async () => {
      if (isOpen && customerId && mode !== 'restore') {
        setIsLoadingInfo(true);
        const info = await getCustomerInfo(customerId);
        setCustomerInfo(info);
        setIsLoadingInfo(false);
      }
    };

    fetchCustomerInfo();
  }, [isOpen, customerId, mode]);

  // Reset ao fechar
  useEffect(() => {
    if (!isOpen) {
      setConfirmationText('');
      setCustomerInfo(null);
    }
  }, [isOpen]);

  const handleConfirm = async () => {
    if (!customerId) return;

    try {
      if (mode === 'soft') {
        await softDelete(customerId);
      } else if (mode === 'restore') {
        await restore(customerId);
      } else if (mode === 'hard') {
        await hardDelete(customerId, confirmationText);
      }

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Erro na operação:', error);
    }
  };

  const isLoading = isDeleting || isRestoring;

  // Validação do botão de confirmar - COMPARAÇÃO EXATA
  const canConfirm = () => {
    if (mode === 'hard') {
      return confirmationText === 'EXCLUIR PERMANENTEMENTE';
    }
    if (mode === 'soft') {
      // Comparação exata: deve ser idêntico (com acentos, maiúsculas, espaços)
      return confirmationText === customerName;
    }
    return true; // restore não precisa confirmação
  };

  // Configurações por modo
  const getModeConfig = () => {
    switch (mode) {
      case 'hard':
        return {
          title: '⚠️ Exclusão Permanente',
          icon: <ShieldAlert className="h-6 w-6 text-red-500" />,
          color: 'red',
          confirmText: 'EXCLUIR PERMANENTEMENTE',
          confirmLabel: 'Digite exatamente: EXCLUIR PERMANENTEMENTE',
          description: 'Esta ação é IRREVERSÍVEL. O cliente será removido permanentemente do banco de dados.',
          warningLevel: 'critical',
        };
      case 'restore':
        return {
          title: '🔄 Restaurar Cliente',
          icon: <RotateCcw className="h-6 w-6 text-green-500" />,
          color: 'green',
          confirmText: '',
          confirmLabel: '',
          description: 'O cliente será restaurado e voltará a aparecer na lista de clientes ativos.',
          warningLevel: 'info',
        };
      default: // soft
        return {
          title: '🗑️ Excluir Cliente',
          icon: <Trash2 className="h-6 w-6 text-orange-500" />,
          color: 'orange',
          confirmText: customerName,
          confirmLabel: `Para confirmar, digite o nome EXATAMENTE como aparece abaixo:`,
          description: 'O cliente será excluído, mas seus dados e histórico serão preservados. Você poderá restaurar este cliente mais tarde.',
          warningLevel: 'warning',
        };
    }
  };

  const config = getModeConfig();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl">
            {config.icon}
            {config.title}
          </DialogTitle>
          <DialogDescription className="text-gray-300 text-base mt-2">
            {config.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Informações do Cliente */}
          {isLoadingInfo ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary-yellow" />
            </div>
          ) : customerInfo && mode !== 'restore' ? (
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary-yellow" />
                  <span className="font-semibold text-lg text-white">{customerInfo.name}</span>
                </div>
                {customerInfo.email && (
                  <Badge variant="outline" className="text-gray-300">
                    {customerInfo.email}
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4 pt-2 border-t border-gray-700">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4 text-blue-400" />
                  <div>
                    <p className="text-xs text-gray-400">Vendas</p>
                    <p className="text-sm font-medium text-white">{customerInfo.salesCount}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-400" />
                  <div>
                    <p className="text-xs text-gray-400">LTV</p>
                    <p className="text-sm font-medium text-white">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(customerInfo.lifetimeValue)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-yellow-400" />
                  <div>
                    <p className="text-xs text-gray-400">Última Compra</p>
                    <p className="text-sm font-medium text-white">
                      {customerInfo.lastPurchaseDate
                        ? customerInfo.lastPurchaseDate.toLocaleDateString('pt-BR')
                        : 'Nunca'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {/* Alertas baseados no modo */}
          {mode === 'hard' && (
            <Alert variant="destructive" className="bg-red-900/20 border-red-500/50">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-red-200">
                <strong>ATENÇÃO:</strong> Esta operação é IRREVERSÍVEL e só deve ser usada em casos excepcionais.
                O cliente será removido permanentemente do banco de dados, mas vendas serão mantidas para fins fiscais.
              </AlertDescription>
            </Alert>
          )}

          {mode === 'soft' && customerInfo && customerInfo.salesCount > 0 && (
            <Alert className="bg-blue-900/20 border-blue-500/50">
              <AlertDescription className="text-blue-200">
                <strong>Histórico Preservado:</strong> As {customerInfo.salesCount} vendas deste cliente serão mantidas
                para fins de auditoria e relatórios fiscais.
              </AlertDescription>
            </Alert>
          )}

          {mode === 'restore' && (
            <Alert className="bg-green-900/20 border-green-500/50">
              <AlertDescription className="text-green-200">
                <strong>Restauração:</strong> O cliente será reativado e todas as informações anteriores serão restauradas.
              </AlertDescription>
            </Alert>
          )}

          {/* Campo de Confirmação */}
          {(mode === 'soft' || mode === 'hard') && (
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-300">
                {config.confirmLabel}
              </label>

              {/* Caixa destacada mostrando o nome exato */}
              {mode === 'soft' && (
                <div className="bg-gray-700/50 border-2 border-yellow-500/50 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-1">Nome a ser digitado:</p>
                  <p className="text-lg font-bold text-white font-mono select-all">
                    {config.confirmText}
                  </p>
                  <p className="text-xs text-yellow-400 mt-1">
                    ⚠️ Copie ou digite exatamente como mostrado acima
                  </p>
                </div>
              )}

              <Input
                type="text"
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.target.value)}
                placeholder={mode === 'hard' ? config.confirmText : 'Digite aqui...'}
                className="bg-gray-800 border-gray-600 text-white"
                disabled={isLoading}
                autoComplete="off"
              />
              {confirmationText && !canConfirm() && (
                <p className="text-xs text-red-400 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Texto de confirmação incorreto
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            Cancelar
          </Button>

          <Button
            onClick={handleConfirm}
            disabled={!canConfirm() || isLoading}
            className={cn(
              'font-semibold',
              mode === 'restore'
                ? 'bg-green-600 hover:bg-green-700'
                : mode === 'hard'
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-orange-600 hover:bg-orange-700'
            )}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processando...
              </>
            ) : mode === 'restore' ? (
              <>
                <RotateCcw className="h-4 w-4 mr-2" />
                Restaurar Cliente
              </>
            ) : mode === 'hard' ? (
              <>
                <ShieldAlert className="h-4 w-4 mr-2" />
                Excluir Permanentemente
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir Cliente
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteCustomerModal;
