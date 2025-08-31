/**
 * ReceiptModal.tsx - Modal para visualizar e imprimir cupom fiscal
 */

import React, { useEffect } from 'react';
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

  // Iniciar impressão automaticamente quando o modal abrir e os dados estiverem prontos
  useEffect(() => {
    if (isOpen && receiptData && !isLoading && !error) {
      // Aguardar um momento para garantir que o modal esteja renderizado
      const timer = setTimeout(() => {
        try {
          window.print();
          toast({
            title: "🖨️ Impressão iniciada automaticamente",
            description: "Cupom sendo impresso - Use o botão se necessário",
            variant: "default",
          });
        } catch (error) {
          console.warn('Auto-print error:', error);
          toast({
            title: "⚠️ Use o botão para imprimir",
            description: "Impressão automática falhou - Clique no botão abaixo",
            variant: "destructive",
          });
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [isOpen, receiptData, isLoading, error, toast]);

  const handlePrint = () => {
    try {
      window.print();
      toast({
        title: "🖨️ Impressão manual iniciada",
        description: "Cupom sendo impresso via botão",
        variant: "default",
      });
    } catch (error) {
      console.warn('Manual print error:', error);
      toast({
        title: "⚠️ Erro na impressão",
        description: "Tente usar Ctrl+P do navegador",
        variant: "destructive",
      });
    }

    if (autoClose) {
      setTimeout(() => {
        onClose();
      }, 1500);
    }
  };

  const handleCustomPrint = () => {
    toast({
      title: "💡 SOLUÇÃO MANUAL",
      description: "1. Ctrl+P 2. Mais definições 3. Tamanho papel: Personalizado 4. Largura: 58mm 5. Altura: 100mm",
      variant: "default",
      duration: 10000
    });
  };

  const openPrintSettings = () => {
    toast({
      title: "💡 Configuração ZPrinter Paper (58x210mm)",
      description: "1. Selecione 'ZPrinter Paper (58x210mm)' 2. Margens: Padrão 3. Escala: 100% 4. Qualidade: Rascunho",
      variant: "default",
      duration: 8000
    });
  };

  const handlePrintAndClose = () => {
    // Usar apenas handlePrint() para evitar duplicação
    handlePrint();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white text-black">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-primary-yellow">
            <Receipt className="h-5 w-5 text-primary-yellow" />
            Cupom Fiscal - Adega Anita's
          </DialogTitle>
          <DialogDescription className="text-gray-700 font-medium">
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
              />
              
              {/* Status de Impressão - UX MELHORADA */}
              <Alert className="mb-4 bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <strong>✅ Atomo MO-5812 - ZPrinter Paper (58x210mm)</strong><br/>
                  <span className="text-sm">Feed: 3mm • Print as Image • Bold Universal</span>
                </AlertDescription>
              </Alert>

              {/* Botão de ação único - UX MELHORADA */}
              <div className="flex justify-center mt-6">
                <Button
                  onClick={() => {
                    try {
                      window.print();
                    } catch (error) {
                      console.warn('Print handled:', error);
                    }
                  }}
                  size="lg"
                  className="bg-primary-yellow hover:bg-yellow-500 text-black px-8 py-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                >
                  <Printer className="h-5 w-5 mr-2" />
                  IMPRIMIR CUPOM
                </Button>
              </div>

              {/* Instruções de Configuração */}
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <Settings className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div className="text-xs text-blue-800">
                    <p className="font-medium">🔧 Configuração Otimizada:</p>
                    <ul className="mt-1 space-y-1">
                      <li>• <strong>Driver:</strong> "Print as Image" para melhor legibilidade</li>
                      <li>• <strong>Papel:</strong> ZPrinter Paper (58x210mm)</li>
                      <li>• <strong>Feed:</strong> 3mm após impressão (economia de papel)</li>
                      <li>• <strong>Layout:</strong> Posição superior, sem margens desnecessárias</li>
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