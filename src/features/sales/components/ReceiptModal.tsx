/**
 * ReceiptModal.tsx - Modal para visualizar e imprimir cupom fiscal
 */

import React, { useEffect, useRef, useState } from 'react';
import { BaseModal } from '@/shared/ui/composite';
import { LoadingSpinner } from '@/shared/ui/composite/loading-spinner';
import { Button } from '@/shared/ui/primitives/button';
import { ReceiptPrint, FiscalPrintData } from './ReceiptPrint';
import { useReceiptData } from '../hooks/useReceiptData';
import { Receipt, Printer, CheckCircle, FileText, QrCode } from 'lucide-react';
import { useToast } from '@/shared/hooks/common/use-toast';
import { Alert, AlertDescription } from '@/shared/ui/primitives/alert';
import { Settings } from 'lucide-react';
import { useFiscalEmission, FiscalResponse } from '@/features/fiscal/hooks/useFiscalEmission';
import { FiscalStatusBadge } from '@/features/fiscal/components/FiscalStatusBadge';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  saleId: string | null;
  autoClose?: boolean;
  initialFiscalData?: FiscalResponse['data'] | null;
  cpfNaNota?: string; // New Prop
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  saleId,
  autoClose = false,
  initialFiscalData,
  cpfNaNota
}) => {
  const { toast } = useToast();
  const { data: receiptData, isLoading, error } = useReceiptData(saleId);
  const { emitInvoice, isLoading: isFiscalLoading } = useFiscalEmission();
  const [fiscalData, setFiscalData] = useState<FiscalResponse['data'] | null>(null);
  const [printMode, setPrintMode] = useState<'managerial' | 'fiscal'>('managerial');
  const hasPrinted = useRef(false);

  // Sync initialFiscalData when it changes or modal opens
  useEffect(() => {
    if (isOpen && initialFiscalData) {
      console.log("ReceiptModal: Setting initial fiscal data", initialFiscalData);
      setFiscalData(initialFiscalData);
      if (initialFiscalData.status === 'authorized') {
        setPrintMode('fiscal');
      }
    }
  }, [isOpen, initialFiscalData]);

  // Auto-print logic ONLY when triggered via emission (initialFiscalData present)
  useEffect(() => {
    if (isOpen && receiptData && initialFiscalData && printMode === 'fiscal' && !hasPrinted.current) {
       console.log("ReceiptModal: Auto-printing fiscal receipt");
       hasPrinted.current = true;
       
       const timer = setTimeout(() => {
         try {
           window.print();
           toast({
             title: "🖨️ Impressão iniciada",
             description: "Cupom fiscal enviado para a impressora",
             variant: "default",
           });
         } catch (e) {
           console.error("Auto-print error:", e);
         }
       }, 1000); // 1s delay to ensure rendering

       return () => clearTimeout(timer);
    }

    if (!isOpen) {
      hasPrinted.current = false;
      if (!initialFiscalData) {
        setFiscalData(null); 
        setPrintMode('managerial');
      }
    }
  }, [isOpen, receiptData, initialFiscalData, printMode, toast]);

  const handlePrint = () => {
    try {
      window.print();
      toast({
        title: "🖨️ Impressão manual iniciada",
        description: `Cupom ${printMode === 'fiscal' ? 'Fiscal' : 'Gerencial'} sendo impresso`,
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
    // Pass custom payload if CPF na Nota exists
    const extraPayload = cpfNaNota ? { cpfNaNota } : undefined;
    
    await emitInvoice(saleId, (data) => {
      setFiscalData(data);
      
      // Se autorizado, mudar para modo fiscal e imprimir
      if (data.status === 'authorized') {
        setPrintMode('fiscal');
        
        // Aguardar renderização e imprimir
        setTimeout(() => {
            try {
                window.print();
                toast({
                    title: "🖨️ Imprimindo NFC-e",
                    description: "Cupom fiscal enviado para impressora.",
                    variant: "success",
                });
            } catch (e) {
                console.error("Erro ao imprimir fiscal:", e);
            }
        }, 800);
      }
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
      showHeader={false}
      className="bg-white text-black max-h-[90vh] flex flex-col !p-0 gap-0 overflow-hidden"
    >
        {/* === HEADER (Fixed) === */}
        <div className="p-4 border-b flex items-center justify-between shrink-0 bg-white z-10">
           <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-lg font-bold">
                <Receipt className="h-5 w-5 text-primary-yellow" />
                <span>Cupom Fiscal - Adega Anita's</span>
                {fiscalData && <FiscalStatusBadge status={fiscalData.status} />}
              </div>
              <div className="text-sm text-gray-500">
                {saleId ? `Venda: #${saleId.slice(-8).toUpperCase()}` : 'Preparando cupom...'}
              </div>
           </div>
        </div>

        {/* === BODY (Scrollable) === */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50">
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
              <Button onClick={onClose} variant="outline" className="border-gray-300">
                Fechar
              </Button>
            </div>
          )}

          {receiptData && (
            <>
              {/* Receipt Preview */}
              <div className="shadow-sm border rounded-sm overflow-hidden bg-white mb-4">
                  <ReceiptPrint 
                    data={receiptData}
                    mode={printMode}
                    fiscalData={fiscalData as FiscalPrintData}
                  />
              </div>

              {/* Status Info */}
              <Alert className="mb-4 bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <strong>✅ Atomo MO-5812 - ZPrinter Paper (58x210mm)</strong><br/>
                  <span className="text-sm">Modo: {printMode === 'fiscal' ? 'FISCAL (NFC-e)' : 'GERENCIAL (Recibo)'}</span>
                </AlertDescription>
              </Alert>

              {/* Config Info */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <Settings className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div className="text-xs text-blue-800">
                    <p className="font-medium">🔧 Configuração Otimizada:</p>
                    <ul className="mt-1 space-y-1">
                      <li>• <strong>Driver:</strong> "Print as Image" para melhor legibilidade</li>
                      <li>• <strong>Papel:</strong> ZPrinter Paper (58x210mm)</li>
                      <li>• <strong>Feed:</strong> 3mm após impressão</li>
                      <li>• <strong>Layout:</strong> Posição superior (Top-Left)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* === FOOTER (Fixed) === */}
        {receiptData && (
             <div className="p-4 border-t bg-white flex flex-col gap-3 shrink-0 z-10 shadow-[0_-5px_15px_rgba(0,0,0,0.05)]">
                <Button
                  onClick={handlePrint}
                  size="lg"
                  autoFocus
                  className="w-full bg-primary-yellow hover:bg-yellow-500 text-black font-semibold shadow-lg transition-all"
                >
                  <Printer className="h-5 w-5 mr-2" />
                  IMPRIMIR {printMode === 'fiscal' ? 'NFC-e' : 'RECIBO'}
                </Button>

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
                   <div className="flex gap-2">
                       {printMode !== 'fiscal' && (
                           <Button
                                onClick={() => setPrintMode('fiscal')}
                                variant="outline"
                                className="flex-1 border-blue-500 text-blue-600"
                           >
                               <QrCode className="h-4 w-4 mr-2"/> Ver NFC-e
                           </Button>
                       )}
                       {printMode === 'fiscal' && (
                           <Button
                                onClick={() => setPrintMode('managerial')}
                                variant="outline"
                                className="flex-1 border-gray-500 text-gray-600"
                           >
                               <FileText className="h-4 w-4 mr-2"/> Ver Recibo
                           </Button>
                       )}
                      <Button
                        onClick={handleOpenFiscalPDF}
                        variant="outline"
                        className="flex-1 border-green-500 text-green-600 hover:bg-green-50"
                      >
                        <FileText className="h-5 w-5 mr-2" />
                        PDF Oficial
                      </Button>
                   </div>
                )}
             </div>
        )}
    </BaseModal>
  );
};

export default ReceiptModal;