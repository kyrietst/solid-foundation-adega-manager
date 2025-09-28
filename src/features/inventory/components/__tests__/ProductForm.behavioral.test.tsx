/**
 * ProductForm.behavioral.test.tsx - Testes Robustos para Formulário de Produto (Context7 Pattern)
 * Implementa testes comportamentais focados no usuário
 * Testa validações, cálculos e integração com API real
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render, createMockProduct } from '@/__tests__/utils/test-utils';
import { server, resetMockData } from '@/__tests__/mocks/server';
import { http, HttpResponse } from 'msw';
import { ProductForm } from '../ProductForm';
import { ProductFormData } from '@/core/types/inventory.types';

// Mock data para produto realista
const mockProductData: ProductFormData = {
  name: 'Vinho Tinto Reserva',
  category: 'Vinho Tinto',
  price: 129.90,
  cost_price: 65.00,
  margin_percent: 99.85,
  stock_quantity: 48,
  minimum_stock: 10,
  supplier: 'Vinícola Premium LTDA',
  producer: 'Casa dos Vinhos',
  country: 'Brasil',
  region: 'Serra Gaúcha',
  vintage: 2021,
  alcohol_content: 14.5,
  volume_ml: 750,
  unit_type: 'un',
  package_size: 6,
  barcode: '7898765432109',
  description: 'Vinho tinto encorpado com notas de frutas vermelhas e taninos macios'
};

const mockOnSubmit = vi.fn();
const mockOnCancel = vi.fn();

// Mock do useAuth para evitar erro de contexto
vi.mock('@/app/providers/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'test-user', role: 'admin' },
    isLoading: false,
    signOut: vi.fn(),
    hasPermission: vi.fn(() => true), // Sempre retorna true para testes
  })
}));

// Mock do useSensitiveValue para permitir visualização de campos sensíveis
vi.mock('@/shared/ui/composite', async (importOriginal) => {
  const original = await importOriginal() as any;
  return {
    ...original,
    useSensitiveValue: () => ({
      canViewCosts: true,
      canViewProfits: true,
    })
  };
});

// Mock de hooks específicos para reduzir dependências
vi.mock('@/features/inventory/hooks/useProductCalculations', () => ({
  useProductCalculations: () => ({
    calculations: {
      unitMargin: 99.85,
      packageMargin: 85.6,
      unitProfitAmount: 64.90,
      packageProfitAmount: 389.40
    },
    validation: {
      isValid: true,
      errors: [],
      fieldErrors: {}
    },
    isCalculating: false,
    handleMarginChange: vi.fn(),
    handleCostPriceChange: vi.fn(),
    handlePriceChange: vi.fn()
  })
}));

vi.mock('@/features/inventory/hooks/useProductValidation', () => ({
  useProductValidation: () => ({
    validateProduct: vi.fn(() => ({
      isValid: true,
      errors: [],
      fieldErrors: {}
    })),
    getFieldError: vi.fn(() => undefined)
  })
}));

vi.mock('@/shared/hooks/common/use-barcode', () => ({
  useBarcode: () => ({
    validateBarcode: vi.fn(() => ({ isValid: true, format: 'EAN-13' })),
    generateBarcode: vi.fn(() => '7898765432109')
  })
}));

describe('ProductForm - Comportamento do Usuário', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    resetMockData();
    vi.clearAllMocks();
  });

  describe('Criação de Produto', () => {
    it('deve permitir criar produto com dados válidos', async () => {
      let capturedRequest: any = null;

      server.use(
        http.post('/rest/v1/products', async ({ request }) => {
          capturedRequest = await request.json();
          return HttpResponse.json({
            id: 'product-new-123',
            ...capturedRequest
          });
        })
      );

      render(
        <ProductForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      // Preencher dados do produto (apenas campos básicos disponíveis)
      await user.type(screen.getByLabelText(/nome do produto/i), 'Vinho Premium Test');
      await user.type(screen.getByLabelText(/categoria/i), 'Vinho Tinto');
      await user.type(screen.getByLabelText(/volume.*ml/i), '750');
      await user.type(screen.getByLabelText(/descrição/i), 'Produto premium de teste');

      const submitButton = screen.getByRole('button', { name: /criar produto/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(capturedRequest).toMatchObject({
          name: 'Vinho Premium Test',
          category: 'Vinho Tinto',
          volume_ml: 750,
          description: 'Produto premium de teste'
        });
      });

      expect(mockOnSubmit).toHaveBeenCalled();
    });

    it('deve validar campos obrigatórios', async () => {
      render(
        <ProductForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const submitButton = screen.getByRole('button', { name: /criar produto/i });
      await user.click(submitButton);

      // Verificar mensagens de validação para campos obrigatórios
      await waitFor(() => {
        expect(screen.getByText(/nome é obrigatório/i)).toBeInTheDocument();
        expect(screen.getByText(/categoria é obrigatória/i)).toBeInTheDocument();
        expect(screen.getByText(/preço é obrigatório/i)).toBeInTheDocument();
      });

      // Não deve chamar onSubmit com dados inválidos
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('deve validar preços positivos', async () => {
      render(
        <ProductForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      await user.type(screen.getByLabelText(/nome do produto/i), 'Produto Teste');
      await user.type(screen.getByLabelText(/categoria/i), 'Vinho Tinto');
      await user.type(screen.getByLabelText(/preço de venda.*un/i), '-10');

      const submitButton = screen.getByRole('button', { name: /criar produto/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/preço deve ser maior que zero/i)).toBeInTheDocument();
      });
    });

    it('deve validar quantidades não negativas', async () => {
      render(
        <ProductForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      await user.type(screen.getByLabelText(/nome do produto/i), 'Produto Teste');
      await user.type(screen.getByLabelText(/unidades/i), '-5');

      const submitButton = screen.getByRole('button', { name: /criar produto/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/quantidade não pode ser negativa/i)).toBeInTheDocument();
      });
    });
  });

  describe('Cálculos Automáticos de Margem', () => {
    it('deve calcular margem automaticamente baseada em preço e custo', async () => {
      render(
        <ProductForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      // Inserir preço de venda e custo
      const priceInput = screen.getByLabelText(/preço de venda.*un/i);
      const costInput = screen.getByLabelText(/preço de custo.*un/i);
      const marginDisplay = screen.getByLabelText(/margem.*%/i) || screen.getByTestId('calculated-margin');

      await user.type(priceInput, '100.00');
      await user.type(costInput, '60.00');
      await user.tab(); // Trigger calculation

      await waitFor(() => {
        // Margem deve ser calculada: ((100 - 60) / 60) * 100 = 66.67%
        expect(marginDisplay).toHaveValue(66.67);
      });
    });

    it('deve calcular preço baseado em margem desejada', async () => {
      render(
        <ProductForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const costInput = screen.getByLabelText(/preço de custo.*un/i);
      const marginInput = screen.getByLabelText(/margem.*%/i);
      const priceDisplay = screen.getByLabelText(/preço de venda.*un/i);

      await user.type(costInput, '50.00');
      await user.type(marginInput, '100'); // 100% de margem
      await user.tab(); // Trigger calculation

      await waitFor(() => {
        // Preço deve ser calculado: 50 + (50 * 100/100) = 100.00
        expect(priceDisplay).toHaveValue(100.00);
      });
    });

    it('deve exibir lucro por unidade calculado', async () => {
      render(
        <ProductForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      await user.type(screen.getByLabelText(/preço de venda.*un/i), '89.90');
      await user.type(screen.getByLabelText(/preço de custo.*un/i), '45.00');
      await user.tab();

      await waitFor(() => {
        // Deve mostrar lucro unitário: 89.90 - 45.00 = 44.90
        expect(screen.getByText(/lucro por unidade.*r\$ 44,90/i)).toBeInTheDocument();
      });
    });
  });


  describe('Edição de Produto', () => {
    it('deve carregar dados existentes para edição', () => {
      render(
        <ProductForm
          initialData={mockProductData}
          isEdit={true}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      // Verificar se campos foram preenchidos
      expect(screen.getByDisplayValue('Vinho Tinto Reserva')).toBeInTheDocument();
      expect(screen.getByDisplayValue('129.90')).toBeInTheDocument();
      expect(screen.getByDisplayValue('65.00')).toBeInTheDocument();
      expect(screen.getByDisplayValue('48')).toBeInTheDocument();
    });

    it('deve atualizar produto existente via API', async () => {
      let capturedRequest: any = null;
      const productId = 'product-123';

      server.use(
        http.patch(`/rest/v1/products?id=eq.${productId}`, async ({ request }) => {
          capturedRequest = await request.json();
          return HttpResponse.json({ success: true });
        })
      );

      render(
        <ProductForm
          initialData={{ ...mockProductData, id: productId }}
          isEdit={true}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      // Alterar nome do produto
      const nameInput = screen.getByDisplayValue('Vinho Tinto Reserva');
      await user.clear(nameInput);
      await user.type(nameInput, 'Vinho Tinto Premium Editado');

      const submitButton = screen.getByRole('button', { name: /atualizar produto/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(capturedRequest.name).toBe('Vinho Tinto Premium Editado');
      });
    });

    it('deve validar se estoque atual é maior que mínimo', async () => {
      render(
        <ProductForm
          initialData={mockProductData}
          isEdit={true}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      // Definir estoque mínimo maior que atual
      const minStockInput = screen.getByDisplayValue('10');
      await user.clear(minStockInput);
      await user.type(minStockInput, '100'); // Maior que os 48 atuais
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/estoque mínimo não pode ser maior que estoque atual/i)).toBeInTheDocument();
      });
    });
  });

  describe('Estados de Loading e Erro', () => {
    it('deve exibir loading durante submissão', async () => {
      // Mock delay na API
      server.use(
        http.post('/rest/v1/products', () => {
          return new Promise(resolve =>
            setTimeout(() => resolve(HttpResponse.json({ success: true })), 2000)
          );
        })
      );

      render(
        <ProductForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      // Preencher dados mínimos
      await user.type(screen.getByLabelText(/nome do produto/i), 'Produto');
      await user.type(screen.getByLabelText(/categoria/i), 'Vinho Tinto');
      await user.type(screen.getByLabelText(/preço de venda.*un/i), '50');
      await user.type(screen.getByLabelText(/unidades soltas/i), '10');

      const submitButton = screen.getByRole('button', { name: /criar produto/i });
      await user.click(submitButton);

      // Verificar estado de loading
      expect(screen.getByRole('button', { name: /salvando/i })).toBeDisabled();
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    it('deve tratar erro de API adequadamente', async () => {
      server.use(
        http.post('/rest/v1/products', () => {
          return HttpResponse.json(
            { message: 'Produto já existe' },
            { status: 409 }
          );
        })
      );

      render(
        <ProductForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      // Preencher e submeter
      await user.type(screen.getByLabelText(/nome do produto/i), 'Produto Duplicado');
      await user.type(screen.getByLabelText(/categoria/i), 'Vinho Tinto');
      await user.type(screen.getByLabelText(/preço de venda.*un/i), '50');

      const submitButton = screen.getByRole('button', { name: /criar produto/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/produto já existe/i)).toBeInTheDocument();
      });
    });

    it('deve permitir cancelar operação', async () => {
      render(
        <ProductForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const cancelButton = screen.getByRole('button', { name: /cancelar/i });
      await user.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalled();
    });
  });

  describe('Categorização e Inventário', () => {
    it('deve carregar categorias disponíveis', () => {
      render(
        <ProductForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const categoryInput = screen.getByLabelText(/categoria/i);
      expect(categoryInput).toBeInTheDocument();

      // Verificar opções padrão
      expect(screen.getByRole('option', { name: 'Vinho Tinto' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Vinho Branco' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Espumante' })).toBeInTheDocument();
    });

    it('deve permitir entrada de dados de produtor e região', async () => {
      render(
        <ProductForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      await user.type(screen.getByLabelText(/produtor/), 'Casa dos Vinhos');
      await user.type(screen.getByLabelText(/país/), 'Brasil');
      await user.type(screen.getByLabelText(/região/), 'Serra Gaúcha');
      await user.type(screen.getByLabelText(/safra/), '2021');

      expect(screen.getByDisplayValue('Casa dos Vinhos')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Brasil')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Serra Gaúcha')).toBeInTheDocument();
      expect(screen.getByDisplayValue('2021')).toBeInTheDocument();
    });

    it('deve validar teor alcoólico dentro dos limites', async () => {
      render(
        <ProductForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const alcoholInput = screen.getByLabelText(/teor alcoólico/);
      await user.type(alcoholInput, '50'); // Muito alto
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/teor alcoólico deve estar entre 0% e 40%/i)).toBeInTheDocument();
      });
    });
  });

  describe('Acessibilidade', () => {
    it('deve ter estrutura semântica adequada', () => {
      render(
        <ProductForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByRole('form')).toBeInTheDocument();
      expect(screen.getByRole('group')).toBeInTheDocument(); // fieldset
      expect(screen.getByText(/informações do produto/i)).toBeInTheDocument(); // legend
    });

    it('deve ter labels apropriados para todos os campos', () => {
      render(
        <ProductForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const inputs = screen.getAllByRole('textbox');
      const selects = screen.getAllByRole('combobox');
      const numbers = screen.getAllByRole('spinbutton');

      [...inputs, ...selects, ...numbers].forEach(field => {
        expect(field).toHaveAccessibleName();
      });
    });

    it('deve anunciar erros para screen readers', async () => {
      render(
        <ProductForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const submitButton = screen.getByRole('button', { name: /criar produto/i });
      await user.click(submitButton);

      await waitFor(() => {
        const errorRegion = screen.getByRole('alert');
        expect(errorRegion).toBeInTheDocument();
        expect(errorRegion).toHaveAttribute('aria-live', 'polite');
      });
    });

    it('deve ter navegação por teclado funcional', async () => {
      render(
        <ProductForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const nameInput = screen.getByLabelText(/nome do produto/i);
      nameInput.focus();

      expect(document.activeElement).toBe(nameInput);

      await user.tab();
      const categoryInput = screen.getByLabelText(/categoria/i);
      expect(document.activeElement).toBe(categoryInput);
    });
  });
});