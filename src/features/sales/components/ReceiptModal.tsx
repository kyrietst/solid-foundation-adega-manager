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
import { Alert, AlertDescription } from '@/shared/ui/primitives/alert';
import { Settings } from 'lucide-react';

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
    // Configurar impressão SUPER LEGÍVEL + VISIBILIDADE GARANTIDA
    const style = document.createElement('style');
    style.textContent = `
      @media print {
        @page { 
          size: 58mm auto !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        html, body { 
          height: auto !important;
          width: 58mm !important;
          overflow: visible !important;
          margin: 0 !important;
          padding: 0 !important;
          display: block !important;
        }
        .receipt-print {
          /* VISIBILIDADE MÁXIMA */
          position: static !important;
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
          margin: 0 !important;
          width: 100% !important;
          
          /* ANTI-DESPERDÍCIO */
          page-break-before: avoid !important;
          page-break-after: avoid !important;
        }
      }
    `;
    document.head.appendChild(style);
    
    // Chamar impressão do navegador
    window.print();
    
    // Remover estilo após impressão
    setTimeout(() => {
      document.head.removeChild(style);
    }, 1000);
    
    toast({
      title: "🖨️ Impressão Iniciada",
      description: "Cupom fiscal sendo processado...",
      variant: "default",
      duration: 2000,
    });

    // FECHAMENTO AUTOMÁTICO APENAS SE FOR autoClose (venda finalizada)
    if (autoClose) {
      setTimeout(() => {
        onClose();
      }, 1500);
    }
  };


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white text-black">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-primary-yellow font-semibold">
            <Receipt className="h-5 w-5 text-primary-yellow" />
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
              
              {/* AÇÃO RÁPIDA - FECHAR APENAS */}
              <div className="flex justify-center mt-4">
                <Button
                  onClick={onClose}
                  variant="outline"
                  size="lg"
                  className="px-8 py-3"
                >
                  <X className="h-4 w-4 mr-2" />
                  FECHAR
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReceiptModal;