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
  address?: string; // Legacy/Fallback formatted string
  deliveryAddressStructured?: { // New Structured Data
    street: string;
    number: string;
    neighborhood: string;
    complement?: string;
    city?: string;
    state?: string;
    reference?: string;
  };
  deliveryInstructions?: string;
  customer_cpf_cnpj?: string;
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

  // Determine valid QR Code URL (Prioritize explicit URL from SEFAZ/Nuvem Fiscal)
  const qrValue = fiscalData?.url_consulta_qrcode || fiscalData?.qrcode_url || '';

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
                DANFE NFC-e - Documento Auxiliar<br />
                da Nota Fiscal de Consumidor Eletrônica
              </div>
              {/* --- LÓGICA CONDICIONAL: SE DELIVERY, MOSTRA DADOS --- */}
              {data.delivery ? (
                <div className="text-[10px] font-bold font-mono text-left my-1">
                  <div className="text-center font-black text-xs border-b border-black pb-1 mb-1">ENTREGA / DELIVERY</div>
                  <div>CLIENTE: {data.customer_name || 'NÃO IDENTIFICADO'}</div>
                  <div>
                    END: {data.deliveryAddressStructured ? (
                      `${data.deliveryAddressStructured.street}, ${data.deliveryAddressStructured.number}${data.deliveryAddressStructured.neighborhood ? ` - ${data.deliveryAddressStructured.neighborhood}` : ''} - ${data.deliveryAddressStructured.city || ''}`
                    ) : (
                      data.address || 'ENDEREÇO NÃO CADASTRADO'
                    )}
                  </div>
                  {data.deliveryInstructions && (
                    <div>OBS: {data.deliveryInstructions}</div>
                  )}
                </div>
              ) : (
                <div className="text-[10px] font-bold">
                  Não permite aproveitamento de crédito de ICMS
                </div>
              )}
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
                  {i + 1} {item.product_name}
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
        {/* --- TOTAIS (Reformulado para UX do Motoboy) --- */}
        <div style={{ marginTop: '5px', marginBottom: '5px' }}>
          {/* Subtotal */}
          <div className="receipt-row">
            <span>Subtotal:</span>
            <span>{formatCurrency(data.total_amount)}</span>
          </div>

          {/* Descontos */}
          {data.discount_amount > 0 && (
            <div className="receipt-row">
              <span>(-) Descontos:</span>
              <span>{formatCurrency(data.discount_amount)}</span>
            </div>
          )}

          {/* Taxa de Entrega */}
          {(data.delivery || (data.delivery_fee || 0) > 0) && (
            <div className="receipt-row">
              <span>(+) Taxa de Entrega:</span>
              <span>{formatCurrency(data.delivery_fee || 0)}</span>
            </div>
          )}

          <div className="receipt-line" />

          {/* TOTAL FINAL A PAGAR (Soma Visual) */}
          <div className="receipt-row" style={{ fontSize: '14px', fontWeight: '900', marginTop: '2px' }}>
            <span>TOTAL A PAGAR:</span>
            <span>{formatCurrency(data.final_amount + (data.delivery_fee || 0))}</span>
          </div>

          {/* Forma de Pagamento */}
          <div className="receipt-row" style={{ marginTop: '4px', fontSize: '10px' }}>
            <span>Forma de Pagamento:</span>
            <span className="uppercase font-bold">{translatePayment(data.payment_method)}</span>
          </div>
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
              {qrValue ? (
                <QRCode
                  value={qrValue}
                  size={120}
                  style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                  viewBox={`0 0 256 256`}
                />
              ) : (
                /* Fallback when URL is missing */
                <div className="text-[10px] italic text-center p-2 border border-dashed border-gray-400">
                  QR Code Indisponível<br />Consulte pela Chave
                </div>
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
                  <div>{data.customer_name}<br />CPF/CNPJ: {data.customer_cpf_cnpj}</div> :
                  <div>{data.customer_name}<br />CPF: NÃO INFORMADO</div>
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

            {/* AMBIENTE DE HOMOLOGAÇÃO - Display ONLY if explicitly in testing mode */}
            {fiscalData.is_homologacao && (
              <div className="mt-4 text-xs font-bold uppercase border border-black p-1">
                AMBIENTE DE HOMOLOGAÇÃO - SEM VALOR FISCAL
              </div>
            )}
          </div>
        ) : (
          // --- MANAGERIAL FOOTER ---
          <>
            {/* DADOS DE ENTREGA / CLIENTE */}
            <div style={{ margin: '4px 0' }}>

              {data.delivery ? (
                // === LAYOUT DELIVERY (IFOOD STYLE) ===
                <div className="border border-black p-2 my-2 rounded-sm">
                  <div className="text-lg font-bold text-center border-b border-black pb-1 mb-1 bg-black text-white">
                    🛵 ENTREGA / DELIVERY
                  </div>

                  <div className="text-md font-bold uppercase mb-1 border-b border-dashed border-gray-400 pb-1">
                    CLIENTE: {data.customer_name || 'NÃO IDENTIFICADO'}
                    {data.customer_phone && <span className="block font-normal text-sm">Tel: {data.customer_phone}</span>}
                  </div>

                  {data.deliveryAddressStructured ? (
                    <div className="text-sm flex flex-col gap-0.5 mt-1">
                      <div className="font-bold text-md uppercase">{data.deliveryAddressStructured.street}, {data.deliveryAddressStructured.number}</div>
                      {data.deliveryAddressStructured.neighborhood && (
                        <div className="uppercase">Bairro: {data.deliveryAddressStructured.neighborhood}</div>
                      )}
                      {data.deliveryAddressStructured.complement && (
                        <div className="uppercase">Compl: {data.deliveryAddressStructured.complement}</div>
                      )}
                      <div className="uppercase">
                        {data.deliveryAddressStructured.city}
                        {data.deliveryAddressStructured.state && ` - ${data.deliveryAddressStructured.state}`}
                      </div>
                      {data.deliveryAddressStructured.reference && (
                        <div className="mt-1 font-bold bg-gray-200 px-1">REF: {data.deliveryAddressStructured.reference}</div>
                      )}
                    </div>
                  ) : (
                    // Fallback for legacy address string
                    <div className="text-md whitespace-pre-wrap font-bold">
                      {data.address || 'ENDEREÇO NÃO INFORMADO'}
                    </div>
                  )}

                  {data.deliveryInstructions && (
                    <div className="mt-2 text-sm border-t border-dashed border-black pt-1 font-bold">
                      OBS: {data.deliveryInstructions}
                    </div>
                  )}
                </div>
              ) : (
                // === LAYOUT BALCÃO / RETIRADA ===
                <div className="text-center my-4 py-2 border-y border-dashed border-black">
                  <div className="text-lg font-bold">🏪 BALCÃO / RETIRADA</div>
                  <div className="text-md uppercase">{data.customer_name || 'CONSUMIDOR FINAL'}</div>
                  {data.customer_phone && <div className="text-sm">{data.customer_phone}</div>}
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