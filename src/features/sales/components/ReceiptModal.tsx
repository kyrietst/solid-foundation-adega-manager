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
      title: "✅ BOLD UNIVERSAL + LEGÍVEL",
      description: "Todos textos em BOLD + Otimizado para 'Print as Image' + Topo garantido",
      variant: "default",
    });

    if (autoClose) {
      setTimeout(() => {
        onClose();
      }, 2000);
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
              
              {/* Alertas de configuração - BOLD UNIVERSAL V3 */}
              <Alert className="mb-4 bg-green-50 border-green-200">
                <Settings className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <strong>✅ BOLD UNIVERSAL V3 - Print as Image</strong><br/>
                  • DESCOBERTA: Apenas negritos ficam legíveis no modo "Print as Image"<br/>
                  • SOLUÇÃO: Todos os textos convertidos para BOLD<br/>
                  • HIERARQUIA: Mantida através de tamanhos diferentes<br/>
                  • COMPATIBILIDADE: 100% otimizado para sua impressora Atomo
                </AlertDescription>
              </Alert>

              {/* Botões de ação - COM SOLUÇÃO MANUAL */}
              <div className="flex justify-center gap-2 mt-4 pt-4 border-t border-gray-200">
                <Button
                  onClick={handleCustomPrint}
                  variant="outline"
                  className="border-amber-400 text-amber-700 hover:bg-amber-50 flex items-center gap-1 text-xs px-2"
                >
                  <Settings className="h-3 w-3" />
                  Manual
                </Button>

                <Button
                  onClick={handlePrint}
                  className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                >
                  <Printer className="h-4 w-4" />
                  Bold Universal V3
                </Button>
                
                <Button
                  onClick={() => {
                    try {
                      window.print();
                    } catch (error) {
                      console.warn('Standard print error:', error);
                    }
                  }}
                  variant="outline"
                  className="border-blue-300 text-blue-700 hover:bg-blue-50 flex items-center gap-1 text-xs px-2"
                >
                  Ctrl+P
                </Button>
                
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="border-gray-300 text-gray-700"
                >
                  <X className="h-4 w-4 mr-1" />
                  Fechar
                </Button>
              </div>

              {/* Instruções BOLD UNIVERSAL V3 */}
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <Printer className="h-4 w-4 text-amber-600 mt-0.5" />
                  <div className="text-xs text-amber-800">
                    <p className="font-medium">🖨️ BOLD UNIVERSAL V3 - LEGIBILIDADE 100%:</p>
                    <ul className="mt-1 space-y-1">
                      <li>• <strong>Análise:</strong> Negritos legíveis vs textos normais tracejados</li>
                      <li>• <strong>Estratégia:</strong> font-weight: bold em TODOS os elementos</li>
                      <li>• <strong>Hierarquia:</strong> Diferenciação por tamanhos (12px-20px)</li>
                      <li>• <strong>Configuração:</strong> Driver "Print as Image" + Bold Universal</li>
                      <li>• <strong>Resultado:</strong> 100% legibilidade como elementos que já funcionavam</li>
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