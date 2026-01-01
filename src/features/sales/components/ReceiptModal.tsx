/**
 * ReceiptModal.tsx - Modal para visualizar e imprimir cupom fiscal
 */

import React, { useEffect, useRef, useState } from 'react';
import { BaseModal } from '@/shared/ui/composite';
import { LoadingSpinner } from '@/shared/ui/composite/loading-spinner';
import { Button } from '@/shared/ui/primitives/button';
import { ReceiptPrint } from './ReceiptPrint';
import { useReceiptData } from '../hooks/useReceiptData';
import { Receipt, Printer, CheckCircle, FileText, QrCode } from 'lucide-react';
import { useToast } from '@/shared/hooks/common/use-toast';
import { Alert, AlertDescription } from '@/shared/ui/primitives/alert';
import { Settings } from 'lucide-react';
import { useFiscalEmission } from '@/features/fiscal/hooks/useFiscalEmission';
import { FiscalStatusBadge } from '@/features/fiscal/components/FiscalStatusBadge';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  saleId: string | null;
  autoClose?: boolean;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  saleId,
  autoClose = false
}) => {
  const { toast } = useToast();
  const { data: receiptData, isLoading, error } = useReceiptData(saleId);
  const { emitInvoice, isLoading: isFiscalLoading } = useFiscalEmission();
  const [fiscalData, setFiscalData] = useState<{ status: string, pdf_url?: string, xml_url?: string } | null>(null);
  const hasPrinted = useRef(false);

  // Iniciar impressão automaticamente quando o modal abrir e os dados estiverem prontos
  useEffect(() => {
    if (isOpen && receiptData && !isLoading && !error && !hasPrinted.current) {
      hasPrinted.current = true;
      
      const timer = setTimeout(() => {
        if (isOpen) {
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
        }
      }, 500);

      return () => clearTimeout(timer);
    }
    
    if (!isOpen) {
      hasPrinted.current = false;
      setFiscalData(null); // Reset fiscal data on close
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

  const handleEmitFiscal = async () => {
    if (!saleId) return;
    await emitInvoice(saleId, (data) => {
      setFiscalData(data);
    });
  };

  const handleOpenFiscalPDF = () => {
    if (fiscalData?.pdf_url) {
      window.open(fiscalData.pdf_url, '_blank');
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <Receipt className="h-5 w-5 text-primary-yellow" />
          <span>Cupom Fiscal - Adega Anita's</span>
          {fiscalData && <FiscalStatusBadge status={fiscalData.status} />}
        </div>
      }
      description={saleId ? `Venda: #${saleId.slice(-8).toUpperCase()}` : 'Preparando cupom...'}
      size="md"
      className="bg-white text-black"
    >

        <div className="mt-4">
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner size="md" color="default" />
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

              {/* Botões de Ação */}
              <div className="flex flex-col gap-3 mt-6">
                <Button
                  onClick={handlePrint}
                  size="lg"
                  className="w-full bg-primary-yellow hover:bg-yellow-500 text-black font-semibold shadow-lg transition-all"
                >
                  <Printer className="h-5 w-5 mr-2" />
                  IMPRIMIR CUPOM (NÃO FISCAL)
                </Button>

                {/* Botão Fiscal - Lógica Condicional */}
                {!fiscalData || fiscalData.status !== 'authorized' ? (
                  <Button
                    onClick={handleEmitFiscal}
                    disabled={isFiscalLoading}
                    variant="outline"
                    className="w-full border-blue-500 text-blue-600 hover:bg-blue-50"
                  >
                    {isFiscalLoading ? (
                      <LoadingSpinner size="sm" color="default" />
                    ) : (
                      <>
                        <QrCode className="h-5 w-5 mr-2" />
                        EMITIR NFC-e (FISCAL)
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={handleOpenFiscalPDF}
                    variant="outline"
                    className="w-full border-green-500 text-green-600 hover:bg-green-50"
                  >
                    <FileText className="h-5 w-5 mr-2" />
                    VER NOTA FISCAL (PDF)
                  </Button>
                )}
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
    </BaseModal>
  );
};

export default ReceiptModal;