/**
 * ReceiptModal.tsx - Modal para visualizar e imprimir cupom fiscal
 */

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/primitives/dialog';
import { LoadingSpinner } from '@/shared/ui/composite/loading-spinner';
import { Button } from '@/shared/ui/primitives/button';
import { ReceiptPrint } from './ReceiptPrint';
import { useReceiptData } from '../hooks/useReceiptData';
import { Receipt, Printer, X, CheckCircle } from 'lucide-react';
import { useToast } from '@/shared/hooks/common/use-toast';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  saleId: string | null;
  autoClose?: boolean; // Fechar automaticamente após imprimir
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  saleId,
  autoClose = false
}) => {
  const { toast } = useToast();
  const { data: receiptData, isLoading, error } = useReceiptData(saleId);

  const handlePrint = () => {
    toast({
      title: "✅ Cupom enviado para impressão",
      description: "Verifique sua impressora para retirar o cupom",
      variant: "default",
    });

    if (autoClose) {
      // Fechar modal após um pequeno delay
      setTimeout(() => {
        onClose();
      }, 1500);
    }
  };

  const handlePrintAndClose = () => {
    window.print();
    handlePrint();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white text-black">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-black">
            <Receipt className="h-5 w-5 text-blue-600" />
            Cupom Fiscal - Adega Anita's
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            {saleId ? `Venda: #${saleId.slice(-8).toUpperCase()}` : 'Preparando cupom...'}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner size="md" color="blue" />
              <span className="ml-3 text-gray-600">Carregando dados da venda...</span>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <div className="text-red-600 mb-4">
                ❌ Erro ao carregar dados da venda
              </div>
              <div className="text-sm text-gray-600 mb-4">
                {error.message || 'Não foi possível buscar os dados'}
              </div>
              <Button
                onClick={onClose}
                variant="outline"
                className="border-gray-300 text-gray-700"
              >
                Fechar
              </Button>
            </div>
          )}

          {receiptData && (
            <>
              <ReceiptPrint 
                data={receiptData} 
                onPrint={handlePrint}
              />
              
              {/* Botões de ação */}
              <div className="flex justify-center gap-3 mt-4 pt-4 border-t border-gray-200">
                <Button
                  onClick={handlePrintAndClose}
                  className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                >
                  <Printer className="h-4 w-4" />
                  Imprimir e Fechar
                </Button>
                
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="border-gray-300 text-gray-700"
                >
                  <X className="h-4 w-4 mr-2" />
                  Fechar
                </Button>
              </div>

              {/* Dica de impressão */}
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div className="text-xs text-blue-800">
                    <p className="font-medium">Dicas de Impressão:</p>
                    <ul className="mt-1 space-y-1">
                      <li>• Configure sua impressora para 80mm</li>
                      <li>• Remova margens se necessário</li>
                      <li>• Funciona melhor com impressoras térmicas</li>
                    </ul>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReceiptModal;