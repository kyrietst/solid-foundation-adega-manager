/**
 * ReceiptPrint.tsx - Componente de impressão de cupom fiscal
 * Para impressoras térmicas de 80mm
 */

import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import '../styles/thermal-print.css';

export interface ReceiptItem {
  quantity: number;
  product_name: string;
  unit_price: number;
  total_item: number;
  category?: string;
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
}

interface ReceiptPrintProps {
  data: ReceiptData;
}

export const ReceiptPrint: React.FC<ReceiptPrintProps> = ({ data }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: ptBR });
  };

  const translatePaymentMethod = (method: string): string => {
    const translations: Record<string, string> = {
      'credit_card': 'Cartão de Crédito',
      'debit_card': 'Cartão de Débito', 
      'pix': 'PIX',
      'cash': 'Dinheiro',
      'money': 'Dinheiro'
    };
    return translations[method?.toLowerCase()] || method || 'Não informado';
  };


  const subtotal = data.total_amount; // Usar total_amount do banco (subtotal antes do desconto)

  return (
    <>
      {/* CSS crítico inline como fallback */}
      <style>{`
        @media print {
          @page { size: auto !important; margin: 0 !important; }
          body * { visibility: hidden; }
          .receipt-print, .receipt-print * { visibility: visible !important; }
          .receipt-print {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 58mm !important;
            font-family: 'Courier New', monospace !important;
            font-size: 14px !important;
            color: #000 !important;
            background: white !important;
          }
        }
      `}</style>
      
      <div className="max-w-sm mx-auto bg-white text-black p-4">
        {/* Cupom fiscal */}
        <div className="receipt-print font-mono text-xs">
          {/* Cabeçalho */}
          <div className="receipt-header">
            <div className="company-name">ADEGA ANITA'S</div>
            <div className="company-subtitle">Vinhos e Bebidas Selecionadas</div>
            <div className="text-xs mt-2">CUPOM NÃO FISCAL</div>
          </div>
          <div className="receipt-line"></div>

          {/* Informações da venda */}
          <div className="receipt-info">
            <div className="receipt-info-line">
              <span>Data:</span>
              <span>{formatDate(data.created_at)}</span>
            </div>
            <div className="receipt-info-line">
              <span>Cupom:</span>
              <span>#{data.id.slice(-8).toUpperCase()}</span>
            </div>
            <div className="receipt-info-line">
              <span>Vendedor:</span>
              <span>{data.seller_name || ''}</span>
            </div>
            <div className="receipt-info-line">
              <span>Cliente:</span>
              <span>{data.customer_name || ''}</span>
            </div>
            <div className="receipt-info-line">
              <span>Tel:</span>
              <span>{data.customer_phone || ''}</span>
            </div>
            <div className="receipt-info-line">
              <span>Tipo:</span>
              <span>{data.delivery ? 'Entrega' : 'Presencial'}</span>
            </div>
          </div>

          {/* Itens */}
          <div className="receipt-items">
            <div className="receipt-line"></div>
            <div className="font-bold text-center mb-2">ITENS VENDIDOS</div>
            {data.items.map((item, index) => (
              <div key={index} className="receipt-item">
                <div className="receipt-item-name">
                  <span>{item.quantity}x {item.product_name}</span>
                </div>
                <div className="receipt-item-details">
                  <span>{formatCurrency(item.unit_price)} cada</span>
                  <span className="font-medium">
                    {formatCurrency(item.total_item)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Totais */}
          <div className="receipt-totals">
            <div className="receipt-total-line">
              <span>SUBTOTAL:</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            
            {data.discount_amount > 0 && (
              <div className="receipt-total-line text-green-600">
                <span>DESCONTO:</span>
                <span>-{formatCurrency(data.discount_amount)}</span>
              </div>
            )}
            
            {data.delivery_fee && data.delivery_fee > 0 && (
              <div className="receipt-total-line">
                <span>TAXA ENTREGA:</span>
                <span>{formatCurrency(data.delivery_fee)}</span>
              </div>
            )}
            
            <div className="receipt-total-line final">
              <span>TOTAL:</span>
              <span>{formatCurrency(data.final_amount)}</span>
            </div>
            
            <div className="receipt-total-line">
              <span>PAGAMENTO:</span>
              <span className="font-medium">{translatePaymentMethod(data.payment_method)}</span>
            </div>
          </div>

          {/* Rodapé */}
          <div className="receipt-footer">
            <div className="thanks">OBRIGADO!</div>
            <div className="message">Volte sempre à Adega Anita's!</div>
            <div className="timestamp">
              {formatDate(new Date().toISOString())}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ReceiptPrint;