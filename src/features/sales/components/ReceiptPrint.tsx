/**
 * ReceiptPrint.tsx - Componente de impressão de cupom fiscal
 * Para impressoras térmicas de 58mm (Atomo MO-5812)
 * Versão CALIBRAGEM FÍSICA: Compensa corte lateral, gap superior, rodapé cortado
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
  address?: string;
  deliveryInstructions?: string;
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

  return (
    <div className="print-area bg-white text-black">
      <div className="receipt-print">

        {/* HEADER */}
        <div className="receipt-header">
          <div className="text-lg">ADEGA ANITA'S</div>
          <div>é tudo que precisamos</div>
          {data.delivery && (
            <div className="text-lg" style={{ marginTop: '2px' }}>★ DELIVERY ★</div>
          )}
        </div>

        <div className="receipt-line" />

        {/* DATA E CUPOM */}
        <div className="receipt-row">
          <span>{formatDate(data.created_at)}</span>
          <span>#{data.id?.slice(-4)}</span>
        </div>

        {/* DADOS DO CLIENTE */}
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

        <div className="receipt-line" />

        {/* ITENS */}
        <div style={{ marginBottom: '2px' }}>ITENS</div>
        {data.items?.map((item, i) => (
          <div key={i} style={{ marginBottom: '2px' }}>
            <div className="receipt-row">
              <span>{item.quantity}x {item.product_name}</span>
            </div>
            <div className="receipt-row">
              <span>UN {formatCurrency(item.unit_price)}</span>
              <span>{formatCurrency(item.total_item)}</span>
            </div>
          </div>
        ))}

        <div className="receipt-line" />

        {/* TOTAIS */}
        <div className="receipt-row">
          <span>Subtotal:</span>
          <span>{formatCurrency(data.total_amount)}</span>
        </div>

        {data.delivery_fee && data.delivery_fee > 0 && (
          <div className="receipt-row">
            <span>Entrega:</span>
            <span>{formatCurrency(data.delivery_fee)}</span>
          </div>
        )}

        {data.discount_amount > 0 && (
          <div className="receipt-row">
            <span>Desconto:</span>
            <span>-{formatCurrency(data.discount_amount)}</span>
          </div>
        )}

        <div className="receipt-row text-lg" style={{ margin: '4px 0' }}>
          <span>TOTAL:</span>
          <span>{formatCurrency(data.final_amount)}</span>
        </div>

        <div className="receipt-row">
          <span>Pagamento:</span>
          <span>{translatePayment(data.payment_method)}</span>
        </div>

        {/* RODAPÉ */}
        <div className="receipt-footer" style={{ marginTop: '5px' }}>
          <div>Obrigado pela preferência!</div>
          <div style={{ fontSize: '10px' }}>www.adegaanitas.com.br</div>
        </div>

        {/* ZONA DE SACRIFÍCIO: Papel em branco extra para corte não pegar texto */}
        <div className="cut-zone" />

      </div>
    </div>
  );
};

export default ReceiptPrint;