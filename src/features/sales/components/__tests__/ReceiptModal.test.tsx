/**
 * ReceiptModal.test.tsx - Testes Robustos para Modal de Recibo (Context7 Pattern)
 * Implementa testes comportamentais para fluxo de checkout crítico
 * Testa finalização de vendas, impressão e persistência de dados
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render, createMockSale, createMockCustomer, createMockProduct } from '@/__tests__/utils/test-utils';
import { server, resetMockData } from '@/__tests__/mocks/server';
import { http, HttpResponse } from 'msw';
import { ReceiptModal } from '../ReceiptModal';

// Mock data para venda completa
const mockSaleData = {
  sale: createMockSale({
    id: 'sale-123',
    total: 425.30,
    payment_method: 'credit_card',
    status: 'completed',
    created_at: '2024-01-15T14:30:00Z'
  }),
  customer: createMockCustomer({
    id: 'customer-1',
    name: 'João Silva',
    email: 'joao.silva@email.com',
    phone: '(11) 99999-9999'
  }),
  items: [
    {
      id: 'item-1',
      product: createMockProduct({
        id: 'product-1',
        name: 'Vinho Tinto Premium',
        price: 89.90
      }),
      quantity: 2,
      price: 89.90,
      subtotal: 179.80
    },
    {
      id: 'item-2',
      product: createMockProduct({
        id: 'product-2',
        name: 'Champagne Francês',
        price: 245.50
      }),
      quantity: 1,
      price: 245.50,
      subtotal: 245.50
    }
  ]
};

// Mock das funções de impressão
const mockPrint = vi.fn();
const mockPrintThermal = vi.fn();
Object.defineProperty(window, 'print', {
  writable: true,
  value: mockPrint,
});

vi.mock('@/features/sales/utils/thermal-print', () => ({
  printThermalReceipt: mockPrintThermal,
}));

describe('ReceiptModal - Fluxo de Checkout Crítico', () => {
  const user = userEvent.setup();
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    saleData: mockSaleData,
    onFinalizeSale: vi.fn(),
  };

  beforeEach(() => {
    resetMockData();
    vi.clearAllMocks();
  });

  describe('Exibição do Recibo', () => {
    it('deve exibir todas as informações da venda corretamente', () => {
      render(<ReceiptModal {...defaultProps} />);

      // Informações do cliente
      expect(screen.getByText('João Silva')).toBeInTheDocument();
      expect(screen.getByText('joao.silva@email.com')).toBeInTheDocument();
      expect(screen.getByText('(11) 99999-9999')).toBeInTheDocument();

      // Informações da venda
      expect(screen.getByText('SALE-123')).toBeInTheDocument();
      expect(screen.getByText('15/01/2024 14:30')).toBeInTheDocument();
      expect(screen.getByText('Cartão de Crédito')).toBeInTheDocument();

      // Itens da venda
      expect(screen.getByText('Vinho Tinto Premium')).toBeInTheDocument();
      expect(screen.getByText('Champagne Francês')).toBeInTheDocument();
      expect(screen.getByText('2x R$ 89,90')).toBeInTheDocument();
      expect(screen.getByText('1x R$ 245,50')).toBeInTheDocument();

      // Total
      expect(screen.getByText('R$ 425,30')).toBeInTheDocument();
    });

    it('deve exibir resumo fiscal com impostos e descontos', () => {
      const saleWithDiscount = {
        ...mockSaleData,
        sale: {
          ...mockSaleData.sale,
          discount: 21.27, // 5% desconto VIP
          tax: 42.53, // 10% impostos
        }
      };

      render(<ReceiptModal {...defaultProps} saleData={saleWithDiscount} />);

      expect(screen.getByText(/subtotal/i)).toBeInTheDocument();
      expect(screen.getByText(/desconto vip/i)).toBeInTheDocument();
      expect(screen.getByText(/impostos/i)).toBeInTheDocument();
      expect(screen.getByText('R$ 21,27')).toBeInTheDocument(); // Desconto
      expect(screen.getByText('R$ 42,53')).toBeInTheDocument(); // Impostos
    });

    it('deve exibir informações da empresa/loja', () => {
      render(<ReceiptModal {...defaultProps} />);

      expect(screen.getByText(/adega manager/i)).toBeInTheDocument();
      expect(screen.getByText(/cnpj/i)).toBeInTheDocument();
      expect(screen.getByText(/endereço/i)).toBeInTheDocument();
      expect(screen.getByText(/telefone/i)).toBeInTheDocument();
    });
  });

  describe('Funcionalidades de Impressão', () => {
    it('deve imprimir recibo padrão ao clicar em Imprimir', async () => {
      render(<ReceiptModal {...defaultProps} />);

      const printButton = screen.getByRole('button', { name: /imprimir recibo/i });
      await user.click(printButton);

      expect(mockPrint).toHaveBeenCalled();
    });

    it('deve imprimir recibo térmico ao clicar em Impressão Térmica', async () => {
      render(<ReceiptModal {...defaultProps} />);

      const thermalPrintButton = screen.getByRole('button', { name: /impressão térmica/i });
      await user.click(thermalPrintButton);

      expect(mockPrintThermal).toHaveBeenCalledWith({
        sale: mockSaleData.sale,
        customer: mockSaleData.customer,
        items: mockSaleData.items,
        companyInfo: expect.any(Object)
      });
    });

    it('deve exibir loading durante impressão térmica', async () => {
      // Mock delay na impressão
      mockPrintThermal.mockImplementation(() =>
        new Promise(resolve => setTimeout(resolve, 1000))
      );

      render(<ReceiptModal {...defaultProps} />);

      const thermalPrintButton = screen.getByRole('button', { name: /impressão térmica/i });
      await user.click(thermalPrintButton);

      expect(screen.getByText(/imprimindo/i)).toBeInTheDocument();
      expect(thermalPrintButton).toBeDisabled();
    });

    it('deve tratar erro de impressão adequadamente', async () => {
      mockPrintThermal.mockRejectedValue(new Error('Impressora não conectada'));

      render(<ReceiptModal {...defaultProps} />);

      const thermalPrintButton = screen.getByRole('button', { name: /impressão térmica/i });
      await user.click(thermalPrintButton);

      await waitFor(() => {
        expect(screen.getByText(/erro na impressão/i)).toBeInTheDocument();
        expect(screen.getByText(/impressora não conectada/i)).toBeInTheDocument();
      });
    });
  });

  describe('Finalização da Venda', () => {
    it('deve finalizar venda e fechar modal ao clicar em Finalizar', async () => {
      render(<ReceiptModal {...defaultProps} />);

      const finalizeButton = screen.getByRole('button', { name: /finalizar venda/i });
      await user.click(finalizeButton);

      expect(defaultProps.onFinalizeSale).toHaveBeenCalledWith(mockSaleData.sale.id);
      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('deve persistir venda no banco de dados', async () => {
      let capturedRequest: any = null;

      // Intercepta request de finalização
      server.use(
        http.post('/rest/v1/rpc/process_sale', async ({ request }) => {
          capturedRequest = await request.json();
          return HttpResponse.json({ success: true, sale_id: 'sale-123' });
        })
      );

      render(<ReceiptModal {...defaultProps} />);

      const finalizeButton = screen.getByRole('button', { name: /finalizar venda/i });
      await user.click(finalizeButton);

      await waitFor(() => {
        expect(capturedRequest).toEqual({
          customer_id: mockSaleData.customer.id,
          items: expect.arrayContaining([
            expect.objectContaining({
              product_id: 'product-1',
              quantity: 2,
              price: 89.90
            }),
            expect.objectContaining({
              product_id: 'product-2',
              quantity: 1,
              price: 245.50
            })
          ]),
          payment_method: 'credit_card',
          total: 425.30
        });
      });
    });

    it('deve tratar erro na finalização da venda', async () => {
      server.use(
        http.post('/rest/v1/rpc/process_sale', () => {
          return new HttpResponse(
            JSON.stringify({ message: 'Erro no processamento' }),
            { status: 500 }
          );
        })
      );

      render(<ReceiptModal {...defaultProps} />);

      const finalizeButton = screen.getByRole('button', { name: /finalizar venda/i });
      await user.click(finalizeButton);

      await waitFor(() => {
        expect(screen.getByText(/erro ao finalizar venda/i)).toBeInTheDocument();
        expect(screen.getByText(/erro no processamento/i)).toBeInTheDocument();
      });

      // Modal deve permanecer aberto em caso de erro
      expect(defaultProps.onClose).not.toHaveBeenCalled();
    });

    it('deve atualizar estoque após finalização', async () => {
      let stockUpdateCalls: any[] = [];

      // Intercepta atualizações de estoque
      server.use(
        http.patch('/rest/v1/products/:id', async ({ params, request }) => {
          const body = await request.json();
          stockUpdateCalls.push({ productId: params.id, body });
          return HttpResponse.json({ success: true });
        })
      );

      render(<ReceiptModal {...defaultProps} />);

      const finalizeButton = screen.getByRole('button', { name: /finalizar venda/i });
      await user.click(finalizeButton);

      await waitFor(() => {
        expect(stockUpdateCalls).toHaveLength(2);
        expect(stockUpdateCalls[0]).toEqual({
          productId: 'product-1',
          body: expect.objectContaining({
            stock_quantity: expect.any(Number) // Stock decremented
          })
        });
      });
    });
  });

  describe('Funcionalidades Avançadas', () => {
    it('deve permitir envio do recibo por email', async () => {
      let emailRequest: any = null;

      server.use(
        http.post('/rest/v1/send-receipt-email', async ({ request }) => {
          emailRequest = await request.json();
          return HttpResponse.json({ success: true });
        })
      );

      render(<ReceiptModal {...defaultProps} />);

      const emailButton = screen.getByRole('button', { name: /enviar por email/i });
      await user.click(emailButton);

      await waitFor(() => {
        expect(emailRequest).toEqual({
          to: 'joao.silva@email.com',
          sale_id: 'sale-123',
          receipt_data: expect.any(Object)
        });
      });

      expect(screen.getByText(/email enviado com sucesso/i)).toBeInTheDocument();
    });

    it('deve permitir compartilhamento via WhatsApp', async () => {
      // Mock window.open
      const mockOpen = vi.fn();
      Object.defineProperty(window, 'open', { value: mockOpen });

      render(<ReceiptModal {...defaultProps} />);

      const whatsappButton = screen.getByRole('button', { name: /compartilhar whatsapp/i });
      await user.click(whatsappButton);

      expect(mockOpen).toHaveBeenCalledWith(
        expect.stringContaining('https://wa.me/5511999999999'),
        '_blank'
      );
    });

    it('deve gerar código QR para avaliação', () => {
      render(<ReceiptModal {...defaultProps} />);

      expect(screen.getByText(/avalie nossa loja/i)).toBeInTheDocument();
      expect(screen.getByRole('img', { name: /código qr/i })).toBeInTheDocument();
    });
  });

  describe('Acessibilidade e UX', () => {
    it('deve focar no botão de finalizar quando modal abre', async () => {
      render(<ReceiptModal {...defaultProps} />);

      const finalizeButton = screen.getByRole('button', { name: /finalizar venda/i });

      await waitFor(() => {
        expect(finalizeButton).toHaveFocus();
      });
    });

    it('deve fechar modal ao pressionar Escape', async () => {
      render(<ReceiptModal {...defaultProps} />);

      await user.keyboard('[Escape]');

      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('deve ter navegação por teclado funcional', async () => {
      render(<ReceiptModal {...defaultProps} />);

      // Navega entre botões
      await user.tab();
      expect(screen.getByRole('button', { name: /imprimir recibo/i })).toHaveFocus();

      await user.tab();
      expect(screen.getByRole('button', { name: /impressão térmica/i })).toHaveFocus();

      await user.tab();
      expect(screen.getByRole('button', { name: /enviar por email/i })).toHaveFocus();
    });

    it('deve ter labels adequados para screen readers', () => {
      render(<ReceiptModal {...defaultProps} />);

      expect(screen.getByRole('dialog', { name: /recibo da venda/i })).toBeInTheDocument();
      expect(screen.getByText('Total da Venda')).toHaveAttribute('aria-label', 'Total da venda: R$ 425,30');
    });

    it('deve anunciar status de operações para screen readers', async () => {
      render(<ReceiptModal {...defaultProps} />);

      const printButton = screen.getByRole('button', { name: /imprimir recibo/i });
      await user.click(printButton);

      // Verifica aria-live region
      expect(screen.getByRole('status')).toHaveTextContent(/recibo enviado para impressão/i);
    });
  });
});