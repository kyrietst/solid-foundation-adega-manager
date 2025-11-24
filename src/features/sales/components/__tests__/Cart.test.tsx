/**
 * Cart.test.tsx - Testes Robustos para Carrinho de Compras (Context7 Pattern)
 * Implementa testes comportamentais focados no usuário
 * Substitui testes superficiais por validações de casos de uso reais
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render, createMockProduct, createMockCustomer } from '@/__tests__/utils/test-utils';
import { server, resetMockData } from '@/__tests__/mocks/server';
import { http, HttpResponse } from 'msw';
import { Cart as FullCart } from '../Cart'; // FullCart is now Cart

// Mock do hook de carrinho
const mockCartItems = [
  {
    id: '1',
    product: createMockProduct({
      id: '1',
      name: 'Vinho Tinto Premium',
      price: 89.90,
      stock_quantity: 15
    }),
    quantity: 2,
    subtotal: 179.80
  },
  {
    id: '2',
    product: createMockProduct({
      id: '2',
      name: 'Champagne Francês',
      price: 245.50,
      stock_quantity: 5
    }),
    quantity: 1,
    subtotal: 245.50
  }
];

const mockCartHook = {
  items: mockCartItems,
  total: 425.30,
  isEmpty: false,
  itemCount: 3,
  updateQuantity: vi.fn(),
  removeItem: vi.fn(),
  clearCart: vi.fn(),
  addItem: vi.fn(),
};

vi.mock('@/features/sales/hooks/use-cart', () => ({
  useCart: () => mockCartHook,
}));

// Mock do customer selecionado
const mockCustomer = createMockCustomer({
  id: 'customer-1',
  name: 'João Silva',
  segment: 'high_value'
});

describe('FullCart - Comportamento do Usuário', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    resetMockData();
    vi.clearAllMocks();
  });

  describe('Exibição do Carrinho', () => {
    it('deve exibir todos os itens do carrinho com informações corretas', () => {
      render(<FullCart selectedCustomer={mockCustomer} />);

      // Verifica produtos no carrinho
      expect(screen.getByText('Vinho Tinto Premium')).toBeInTheDocument();
      expect(screen.getByText('Champagne Francês')).toBeInTheDocument();

      // Verifica quantidades
      expect(screen.getByDisplayValue('2')).toBeInTheDocument();
      expect(screen.getByDisplayValue('1')).toBeInTheDocument();

      // Verifica preços
      expect(screen.getByText('R$ 89,90')).toBeInTheDocument();
      expect(screen.getByText('R$ 245,50')).toBeInTheDocument();

      // Verifica total
      expect(screen.getByText('R$ 425,30')).toBeInTheDocument();
    });

    it('deve exibir carrinho vazio quando não há itens', () => {
      const emptyCartHook = { ...mockCartHook, items: [], isEmpty: true, total: 0 };
      vi.mocked(vi.fn()).mockReturnValue(emptyCartHook);

      render(<FullCart selectedCustomer={null} />);

      expect(screen.getByText(/carrinho vazio/i)).toBeInTheDocument();
      expect(screen.getByText(/adicione produtos/i)).toBeInTheDocument();
    });

    it('deve exibir informações do cliente selecionado', () => {
      render(<FullCart selectedCustomer={mockCustomer} />);

      expect(screen.getByText('João Silva')).toBeInTheDocument();
      expect(screen.getByText(/cliente vip/i)).toBeInTheDocument(); // Based on high_value segment
    });
  });

  describe('Atualização de Quantidade', () => {
    it('deve atualizar quantidade quando usuário altera input', async () => {
      render(<FullCart selectedCustomer={mockCustomer} />);

      const quantityInput = screen.getByDisplayValue('2');

      // Limpa e digita nova quantidade
      await user.clear(quantityInput);
      await user.type(quantityInput, '3');
      await user.tab(); // Trigger blur event

      await waitFor(() => {
        expect(mockCartHook.updateQuantity).toHaveBeenCalledWith('1', 3);
      });
    });

    it('deve incrementar quantidade ao clicar no botão +', async () => {
      render(<FullCart selectedCustomer={mockCustomer} />);

      const increaseButton = screen.getAllByRole('button', { name: /incrementar/i })[0];
      await user.click(increaseButton);

      expect(mockCartHook.updateQuantity).toHaveBeenCalledWith('1', 3);
    });

    it('deve decrementar quantidade ao clicar no botão -', async () => {
      render(<FullCart selectedCustomer={mockCustomer} />);

      const decreaseButton = screen.getAllByRole('button', { name: /decrementar/i })[0];
      await user.click(decreaseButton);

      expect(mockCartHook.updateQuantity).toHaveBeenCalledWith('1', 1);
    });

    it('deve remover item quando quantidade chega a zero', async () => {
      // Mock item com quantidade 1
      const singleItemCart = {
        ...mockCartHook,
        items: [{
          id: '1',
          product: mockCartItems[0].product,
          quantity: 1,
          subtotal: 89.90
        }]
      };
      vi.mocked(vi.fn()).mockReturnValue(singleItemCart);

      render(<FullCart selectedCustomer={mockCustomer} />);

      const decreaseButton = screen.getByRole('button', { name: /decrementar/i });
      await user.click(decreaseButton);

      expect(mockCartHook.removeItem).toHaveBeenCalledWith('1');
    });

    it('deve validar quantidade máxima baseada no estoque', async () => {
      render(<FullCart selectedCustomer={mockCustomer} />);

      const quantityInput = screen.getByDisplayValue('2');

      // Tenta inserir quantidade maior que estoque (15)
      await user.clear(quantityInput);
      await user.type(quantityInput, '20');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/quantidade maior que estoque/i)).toBeInTheDocument();
      });

      // Não deve chamar updateQuantity com quantidade inválida
      expect(mockCartHook.updateQuantity).not.toHaveBeenCalledWith('1', 20);
    });
  });

  describe('Remoção de Itens', () => {
    it('deve remover item ao clicar no botão de remover', async () => {
      render(<FullCart selectedCustomer={mockCustomer} />);

      const removeButton = screen.getAllByRole('button', { name: /remover item/i })[0];
      await user.click(removeButton);

      expect(mockCartHook.removeItem).toHaveBeenCalledWith('1');
    });

    it('deve limpar carrinho inteiro ao clicar em limpar carrinho', async () => {
      render(<FullCart selectedCustomer={mockCustomer} />);

      const clearButton = screen.getByRole('button', { name: /limpar carrinho/i });
      await user.click(clearButton);

      expect(mockCartHook.clearCart).toHaveBeenCalled();
    });

    it('deve confirmar antes de limpar carrinho com muitos itens', async () => {
      render(<FullCart selectedCustomer={mockCustomer} />);

      const clearButton = screen.getByRole('button', { name: /limpar carrinho/i });
      await user.click(clearButton);

      // Verifica se aparece confirmação
      expect(screen.getByText(/tem certeza/i)).toBeInTheDocument();

      // Confirma limpeza
      const confirmButton = screen.getByRole('button', { name: /confirmar/i });
      await user.click(confirmButton);

      expect(mockCartHook.clearCart).toHaveBeenCalled();
    });
  });

  describe('Validações de Negócio', () => {
    it('deve exibir aviso quando item tem baixo estoque', () => {
      const lowStockCart = {
        ...mockCartHook,
        items: [{
          id: '1',
          product: { ...mockCartItems[0].product, stock_quantity: 2 },
          quantity: 1,
          subtotal: 89.90
        }]
      };
      vi.mocked(vi.fn()).mockReturnValue(lowStockCart);

      render(<FullCart selectedCustomer={mockCustomer} />);

      expect(screen.getByText(/baixo estoque/i)).toBeInTheDocument();
      expect(screen.getByText(/apenas 2 unidades/i)).toBeInTheDocument();
    });

    it('deve calcular desconto para cliente VIP', () => {
      const vipCustomer = { ...mockCustomer, segment: 'high_value' };
      render(<FullCart selectedCustomer={vipCustomer} />);

      // Cliente VIP deve ter desconto
      expect(screen.getByText(/desconto vip/i)).toBeInTheDocument();
      expect(screen.getByText(/5%/i)).toBeInTheDocument();
    });

    it('deve exibir total com impostos calculados', () => {
      render(<FullCart selectedCustomer={mockCustomer} />);

      // Verifica cálculos de impostos
      expect(screen.getByText(/subtotal/i)).toBeInTheDocument();
      expect(screen.getByText(/impostos/i)).toBeInTheDocument();
      expect(screen.getByText(/total final/i)).toBeInTheDocument();
    });
  });

  describe('Estados de Loading e Erro', () => {
    it('deve exibir loading ao atualizar quantidades', async () => {
      // Mock delay na atualização
      mockCartHook.updateQuantity.mockImplementation(() =>
        new Promise(resolve => setTimeout(resolve, 1000))
      );

      render(<FullCart selectedCustomer={mockCustomer} />);

      const quantityInput = screen.getByDisplayValue('2');
      await user.clear(quantityInput);
      await user.type(quantityInput, '3');
      await user.tab();

      expect(screen.getByText(/atualizando/i)).toBeInTheDocument();
    });

    it('deve exibir erro quando atualização falha', async () => {
      // Mock erro na API
      server.use(
        http.patch('/rest/v1/cart_items/*', () => {
          return new HttpResponse(null, { status: 500 });
        })
      );

      render(<FullCart selectedCustomer={mockCustomer} />);

      const quantityInput = screen.getByDisplayValue('2');
      await user.clear(quantityInput);
      await user.type(quantityInput, '3');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/erro ao atualizar/i)).toBeInTheDocument();
      });
    });
  });

  describe('Acessibilidade', () => {
    it('deve ter labels adequados para screen readers', () => {
      render(<FullCart selectedCustomer={mockCustomer} />);

      expect(screen.getByLabelText(/quantidade do produto vinho tinto/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /remover vinho tinto do carrinho/i })).toBeInTheDocument();
    });

    it('deve suportar navegação por teclado', async () => {
      render(<FullCart selectedCustomer={mockCustomer} />);

      const quantityInput = screen.getByDisplayValue('2');

      // Navega por tab e altera valor
      await user.tab();
      expect(quantityInput).toHaveFocus();

      await user.keyboard('[ArrowUp]'); // Incrementa
      await waitFor(() => {
        expect(mockCartHook.updateQuantity).toHaveBeenCalledWith('1', 3);
      });
    });

    it('deve anunciar mudanças para screen readers', async () => {
      render(<FullCart selectedCustomer={mockCustomer} />);

      const removeButton = screen.getAllByRole('button', { name: /remover item/i })[0];
      await user.click(removeButton);

      // Verifica aria-live region
      expect(screen.getByRole('status')).toHaveTextContent(/item removido/i);
    });
  });
});