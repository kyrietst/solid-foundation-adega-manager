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
  };
}

export const useFiscalEmission = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const emitInvoice = async (saleId: string, onSuccess?: (data: FiscalResponse['data']) => void) => {
    if (!saleId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('fiscal-handler', {
        body: { sale_id: saleId }
      });

      if (error) throw error;

      if (data?.data?.status === 'authorized') {
        toast({
          title: "✅ Nota Fiscal Autorizada!",
          description: "A NFC-e foi emitida com sucesso.",
          variant: "success", 
        });
        if (onSuccess) onSuccess(data.data);
      } else {
        toast({
          title: "⚠️ Retorno Fiscal Inesperado",
          description: data?.message || "Verifique o status da nota.",
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
