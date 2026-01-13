import React from 'react';
import { formatDate } from '@/shared/utils/formatters';
import QRCode from "react-qr-code";
import '../styles/thermal-print.css';

export interface ReceiptItem {
  quantity: number;
  product_name: string;
  unit_price: number;
  total_item: number;
  category?: string;
}

export interface StoreInfo {
  trade_name: string;
  business_name: string;
  cnpj: string;
  address: {
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
    zip_code: string;
  }
}

export interface ReceiptData {
  id: string;
  created_at: string;
  total_amount: number;
  final_amount: number;
  discount_amount: number;
  payment_method: string;
  delivery: boolean;
  customer_name?: string;
  customer_phone?: string;
  seller_name?: string;
  items: ReceiptItem[];
  delivery_fee?: number;
  address?: string;
  deliveryInstructions?: string;
  customer_cpf_cnpj?: string; // Added for Fiscal
  store_info?: StoreInfo;
}

// Minimal fiscal data interface needed for printing
export interface FiscalPrintData {
  chave?: string;
  numero?: number;
  serie?: number;
  protocolo_autorizacao?: string;
  autorizacao?: { protocolo: string; data_hora: string };
  url_consulta_qrcode?: string;
  qrcode_url?: string;
  is_homologacao?: boolean; // Derived or passed
}

interface ReceiptPrintProps {
  data: ReceiptData;
  mode?: 'managerial' | 'fiscal';
  fiscalData?: FiscalPrintData;
}

export const ReceiptPrint: React.FC<ReceiptPrintProps> = ({ 
  data, 
  mode = 'managerial', 
  fiscalData 
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const translatePayment = (method: string): string => {
    const translations: Record<string, string> = {
      'credit_card': 'Crédito',
      'debit_card': 'Débito',
      'pix': 'PIX',
      'cash': 'Dinheiro',
      'money': 'Dinheiro'
    };
    return translations[method?.toLowerCase()] || method || 'N/I';
  };

  const formatAccessKey = (key?: string) => {
    if (!key) return '';
    return key.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const isFiscal = mode === 'fiscal' && fiscalData;

  // Determine valid QR Code URL
  const qrValue = fiscalData?.qrcode_url || fiscalData?.url_consulta_qrcode || fiscalData?.chave || '';

  // Store Fallback (if missing from hook) to avoid crash, but prefer empty or safe default
  const store = data.store_info || {
    trade_name: "ADEGA ANITA'S",
    business_name: "ADEGA ANITA'S LTDA",
    cnpj: "00.000.000/0000-00",
    address: {
      street: "Endereço não configurado",
      number: "",
      neighborhood: "",
      city: "",
      state: "",
      zip_code: ""
    }
  };

  const formatCnpj = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/^(\d{2})(\d{3})?(\d{3})?(\d{4})?(\d{2})?/, "$1.$2.$3/$4-$5");
  };

  return (
    <div className="print-area bg-white text-black">
      <div className="receipt-print">

        {/* --- HEADER --- */}
        <div className="receipt-header">
          {isFiscal ? (
            <>
              {/* Force "ADEGA ANITA'S LTDA" per user request, while keeping address dynamic */}
              <div className="font-bold text-sm uppercase">ADEGA ANITA'S LTDA</div>
              <div className="text-[10px]">CNPJ: {formatCnpj(store.cnpj)}</div>
              <div className="text-[10px] uppercase">
                {store.address.street}, {store.address.number}
                {store.address.neighborhood ? ` - ${store.address.neighborhood}` : ''}
              </div>
              <div className="text-[10px] mb-1 uppercase">
                {store.address.city} - {store.address.state}
              </div>
              <div className="font-bold text-xs border-y border-black py-1 my-1">
                DANFE NFC-e - Documento Auxiliar<br/>
                da Nota Fiscal de Consumidor Eletrônica
              </div>
              <div className="text-[10px] font-bold">
                Não permite aproveitamento de crédito de ICMS
              </div>
            </>
          ) : (
            <>
              <div className="text-lg uppercase">{store.trade_name}</div>
              <div style={{ fontSize: '10px' }}>{store.address.street}, {store.address.number}</div>
              {data.delivery && (
                <div className="text-lg" style={{ marginTop: '2px' }}>★ DELIVERY ★</div>
              )}
            </>
          )}
        </div>

        <div className="receipt-line" />

        {/* --- DATA E CUPOM (Unificado para manter padrão) --- */}
        {!isFiscal && (
          <div className="receipt-row">
            <span>{formatDate(data.created_at)}</span>
            <span>#{data.id?.slice(-4)}</span>
          </div>
        )}

        {/* --- ITENS --- */}
        <div style={{ marginBottom: '2px', fontWeight: isFiscal ? 'bold' : 'normal' }}>
          {isFiscal ? 'ITEM CÓDIGO DESCRIÇÃO QTD UN VL.UNIT(R$) VL.ITEM(R$)' : 'ITENS'}
        </div>
        
        {data.items?.map((item, i) => (
          <div key={i} style={{ marginBottom: '2px' }}>
             {isFiscal ? (
               // Fiscal Layout (More detailed/Single line if possible)
                <>
                  <div className="text-[10px] uppercase truncate">
                    {i+1} {item.product_name}
                  </div>
                  <div className="flex justify-between text-[10px]">
                     <span>Qtd: {item.quantity}</span>
                     <span>
                        {formatCurrency(item.unit_price)} x {item.quantity} = {formatCurrency(item.total_item)}
                     </span>
                  </div>
                </>
             ) : (
               // Managerial Layout
               <>
                <div className="receipt-row">
                  <span>{item.quantity}x {item.product_name}</span>
                </div>
                <div className="receipt-row">
                  <span>UN {formatCurrency(item.unit_price)}</span>
                  <span>{formatCurrency(item.total_item)}</span>
                </div>
               </>
             )}
          </div>
        ))}

        <div className="receipt-line" />

        {/* --- TOTAIS --- */}
        <div className="receipt-row">
          <span>Qtd. Total de Itens:</span>
          <span>{data.items.length}</span>
        </div>
        <div className="receipt-row font-bold text-md">
          <span>Valor Total:</span>
          <span>{formatCurrency(data.final_amount)}</span>
        </div>
        <div className="receipt-row">
           <span>Forma de Pagamento:</span>
           <span className="uppercase">{translatePayment(data.payment_method)}</span>
        </div>
        {/* Change/troco logic could go here if available */}
        
        <div className="receipt-line" />

        {/* --- FISCAL FOOTER --- */}
        {isFiscal ? (
          <div className="text-center mt-2">
             <div className="text-[10px] mb-2">
                Consulta via Leitor de QR Code
             </div>
             
             {/* QR CODE CENTERED */}
             <div className="flex justify-center mb-2">
                {qrValue && (
                   <QRCode 
                      value={qrValue} 
                      size={120}
                      style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                      viewBox={`0 0 256 256`}
                    />
                )}
             </div>

             <div className="text-[10px] font-bold mb-1">
                Chave de Acesso
             </div>
             <div className="text-[10px] tracking-tighter mb-2 font-mono">
                {formatAccessKey(fiscalData.chave)}
             </div>

             <div className="receipt-line" />
             
             <div className="text-center text-[10px] my-2">
                <div><strong>CONSUMIDOR</strong></div>
                {data.customer_name ? (
                  data.customer_cpf_cnpj ? 
                    <div>{data.customer_name}<br/>CPF/CNPJ: {data.customer_cpf_cnpj}</div> : 
                    <div>{data.customer_name}<br/>CPF: NÃO INFORMADO</div>
                ) : (
                  <div>CONSUMIDOR NÃO IDENTIFICADO</div>
                )}
             </div>

             <div className="receipt-line" />

             <div className="text-[10px] mt-2">
                <div><strong>NFC-e nº {fiscalData.numero} Série {fiscalData.serie}</strong></div>
                <div>{formatDate(data.created_at)}</div>
                <div>Protocolo de Autorização: {fiscalData.protocolo_autorizacao || fiscalData.autorizacao?.protocolo}</div>
             </div>
             
             {/* AMBIENTE DE HOMOLOGAÇÃO */}
             <div className="mt-4 text-xs font-bold uppercase border border-black p-1">
                AMBIENTE DE HOMOLOGAÇÃO - SEM VALOR FISCAL
             </div>
          </div>
        ) : (
          // --- MANAGERIAL FOOTER ---
          <>
             {/* DADOS DO CLIENTE (Legacy Placement) */}
             <div style={{ margin: '4px 0' }}>
               <div className="text-md">{data.customer_name || 'Consumidor'}</div>
               {data.customer_phone && <div>{data.customer_phone}</div>}
               {data.delivery && data.address && (
                 <div className="address-box" style={{
                   wordWrap: 'break-word',
                   whiteSpace: 'pre-wrap',
                   marginTop: '4px',
                   padding: '4px',
                   border: '1px solid #000'
                 }}>
                   <div className="text-md" style={{ fontWeight: 'bold' }}>ENDEREÇO DE ENTREGA:</div>
                   {data.address}
                   {data.deliveryInstructions && (
                     <div style={{ marginTop: '2px', fontStyle: 'italic' }}>
                       Obs: {data.deliveryInstructions}
                     </div>
                   )}
                 </div>
               )}
             </div>

             {/* Footer Standard */}
             <div className="receipt-footer" style={{ marginTop: '5px' }}>
               <div>Obrigado pela preferência!</div>
               <div style={{ fontSize: '10px' }}>www.adegaanitas.com.br</div>
             </div>
          </>
        )}

        {/* ZONA DE SACRIFÍCIO */}
        <div className="cut-zone" />

      </div>
    </div>
  );
};

export default ReceiptPrint;