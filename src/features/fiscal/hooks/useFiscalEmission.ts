import { useState } from 'react';
import { supabase } from '@/core/api/supabase/client';
import { useToast } from '@/shared/hooks/common/use-toast';

export interface FiscalResponse {
  message: string;
  data: {
    status: 'authorized' | 'rejected' | 'pending' | 'cancelled';
    external_id: string;
    xml_url: string;
    pdf_url: string;
    chave?: string;
    numero?: number;
    serie?: number;
    protocolo_autorizacao?: string;
    autorizacao?: { protocolo: string; data_hora: string };
    qrcode_url?: string;
    url_consulta_qrcode?: string;
  };
}

export const useFiscalEmission = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const emitInvoice = async (saleId: string, onSuccess?: (data: FiscalResponse['data']) => void, extraPayload?: Record<string, any>) => {
    if (!saleId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('fiscal-handler', {
        body: { sale_id: saleId, ...extraPayload }
      });

      if (error) throw error;

      // Log para debug da estrutura real
      console.log('Fiscal Response Data:', data);

      const responseStatus = data?.data?.status || data?.status;
      const responseMessage = data?.message || "Nota autorizada";

      if (responseStatus === 'authorized' || responseStatus === 'autorizado') {
        toast({
          title: "✅ Nota Fiscal Autorizada!",
          description: responseMessage,
          variant: "success", 
        });
        
        // Prioritize data.data, fallback to data root
        const payload = data?.data || data;
        if (onSuccess) onSuccess(payload);
      } else {
        console.warn('Fiscal unexpected status:', responseStatus, data);
        
        // UX FIX: Check casing (Authorized vs authorized) and ensure success is triggered
        const stringifiedData = JSON.stringify(data).toLowerCase();
        
        if (stringifiedData.includes('authorized')) {
             toast({
              title: "✅ Nota Autorizada!",
              description: "Processando impressão...",
              variant: "success", 
            });
            
            // Normalize payload and FORCE status 'authorized' for UI to react
            let payload = data?.data || data || {};
            // Ensure we don't overwrite if it's already there, but if it's "Recovered", we trust it.
            payload = { ...payload, status: 'authorized' };

            if (onSuccess) onSuccess(payload);
            return data;
        }

        toast({
          title: "⚠️ Retorno Fiscal Inesperado",
          description: responseMessage || "Verifique o status da nota.",
          variant: "default", 
        });
      }
      
      return data;

    } catch (err: any) {
      console.error('Fiscal Error:', err);
      toast({
        title: "❌ Erro na Emissão",
        description: err.message || "Falha ao comunicar com o servidor fiscal.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    emitInvoice,
    isLoading
  };
};
