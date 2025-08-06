import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { InventoryTable } from '../InventoryTable';
import { Product } from '@/core/types/inventory.types';

// Mock data - produtos realistas do estoque
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Vinho Tinto Reserva Premium',
    description: 'Excelente vinho tinto para ocasiões especiais',
    price: 89.90,
    stock_quantity: 25,
    category: 'Vinho Tinto',
    vintage: 2020,
    producer: 'Vinícola Reserva',
    country: 'Brasil',
    region: 'Vale dos Vinhedos',
    alcohol_content: 13.5,
    volume_ml: 750,
    image_url: 'https://example.com/vinho-tinto.jpg',
    supplier: 'Distribuidora Premium Ltda',
    minimum_stock: 5,
    cost_price: 45.00,
    margin_percent: 99.78,
    created_at: '2023-01-15T10:00:00Z',
    updated_at: '2024-01-15T15:30:00Z',
    unit_type: 'un',
    package_size: 12,
    package_price: 1020.00,
    package_margin: 85.5,
    turnover_rate: 'fast',
    last_sale_date: '2024-01-30',
    barcode: '7891234567890'
  },
  {
    id: '2',
    name: 'Whisky Single Malt 12 Anos',
    description: 'Whisky escocês envelhecido premium',
    price: 245.50,
    stock_quantity: 8,
    category: 'Whisky',
    producer: 'Highland Distillery',
    country: 'Escócia',
    region: 'Highlands',
    alcohol_content: 40.0,
    volume_ml: 750,
    image_url: 'https://example.com/whisky.jpg',
    supplier: 'Importadora Bebidas SA',
    minimum_stock: 3,
    cost_price: 150.00,
    margin_percent: 63.67,
    created_at: '2023-02-20T11:00:00Z',
    updated_at: '2024-01-28T14:20:00Z',
    unit_type: 'un',
    package_size: 6,
    package_price: 1400.00,
    package_margin: 55.5,
    turnover_rate: 'medium',
    last_sale_date: '2024-01-25',
    barcode: '7891234567891'
  },
  {
    id: '3',
    name: 'Champagne Francês Extra Dry',
    description: 'Champagne authentic da região de Champagne',
    price: 180.00,
    stock_quantity: 2, // ESTOQUE BAIXO - menor que mínimo
    category: 'Champagne',
    vintage: 2018,
    producer: 'Maison Champagne',
    country: 'França',
    region: 'Champagne',
    alcohol_content: 12.0,
    volume_ml: 750,
    image_url: 'https://example.com/champagne.jpg',
    supplier: 'Importadora França',
    minimum_stock: 5, // Estoque atual (2) está abaixo do mínimo
    cost_price: 120.00,
    margin_percent: 50.0,
    created_at: '2023-03-10T09:00:00Z',
    updated_at: '2024-01-20T10:15:00Z',
    unit_type: 'un',
    package_size: 6,
    package_price: 1000.00,
    package_margin: 45.0,
    turnover_rate: 'slow',
    last_sale_date: '2023-12-15',
    barcode: '7891234567892'
  },
  {
    id: '4',
    name: 'Cerveja Artesanal IPA',
    description: 'Cerveja artesanal com lúpulo premium',
    price: 12.50,
    stock_quantity: 48,
    category: 'Cerveja',
    producer: 'Cervejaria Artesanal',
    country: 'Brasil',
    region: 'São Paulo',
    alcohol_content: 6.5,
    volume_ml: 355,
    image_url: 'https://example.com/cerveja-ipa.jpg',
    supplier: 'Cervejaria Artesanal Ltda',
    minimum_stock: 12,
    cost_price: 7.50,
    margin_percent: 66.67,
    created_at: '2023-04-05T14:00:00Z',
    updated_at: '2024-02-01T16:30:00Z',
    unit_type: 'un',
    package_size: 24,
    package_price: 280.00,
    package_margin: 60.0,
    turnover_rate: 'fast',
    last_sale_date: '2024-02-01',
    barcode: '7891234567893'
  }
];

// Mock handlers
const mockOnEditProduct = vi.fn();
const mockOnDeleteProduct = vi.fn();

// Mock components básicos
vi.mock('@/shared/ui/primitives/card', () => ({
  Card: ({ children, className }: any) => React.createElement('div', { className, 'data-testid': 'inventory-table-card' }, children),
  CardContent: ({ children, className }: any) => React.createElement('div', { className }, children)
}));

vi.mock('@/shared/ui/composite/empty-state', () => ({
  EmptyProducts: () => React.createElement('div', { 'data-testid': 'empty-products' }, 'Nenhum produto encontrado')
}));

vi.mock('@/shared/ui/composite/loading-spinner', () => ({
  LoadingScreen: ({ text }: any) => React.createElement('div', { 'data-testid': 'loading-screen' }, text)
}));

// Mock ProductRow component
vi.mock('../ProductRow', () => ({
  ProductRow: ({ product, onEdit, onDelete, canDelete }: any) => {
    const isLowStock = product.stock_quantity < product.minimum_stock;
    return React.createElement('div', { 'data-testid': `product-row-${product.id}` }, [
      React.createElement('div', { key: 'name' }, product.name),
      React.createElement('div', { key: 'price' }, `R$ ${product.price.toFixed(2)}`),
      React.createElement('div', { 
        key: 'stock', 
        className: isLowStock ? 'text-red-500' : '',
        'data-testid': `stock-${product.id}`
      }, `${product.stock_quantity}/${product.minimum_stock}`),
      React.createElement('div', { key: 'turnover' }, product.turnover_rate),
      React.createElement('div', { key: 'supplier' }, product.supplier || 'N/A'),
      React.createElement('div', { key: 'barcode' }, product.barcode || 'N/A'),
      React.createElement('div', { key: 'category' }, product.category),
      React.createElement('div', { key: 'actions' }, [
        React.createElement('button', {
          key: 'edit',
          onClick: () => onEdit(product),
          'data-testid': `edit-product-${product.id}`
        }, 'Editar'),
        canDelete && React.createElement('button', {
          key: 'delete',
          onClick: () => onDelete(product.id),
          'data-testid': `delete-product-${product.id}`
        }, 'Excluir')
      ])
    ]);
  }
}));

// Mock virtualização simplificada
vi.mock('@/hooks/common/useVirtualizedTable', () => ({
  useVirtualizedProductTable: (products: any[]) => ({
    parentRef: { current: null },
    virtualItems: products.map((_, index) => ({
      index,
      start: index * 60,
      size: 60,
      end: (index + 1) * 60
    })),
    totalSize: products.length * 60
  })
}));

// Test wrapper
const createWrapper = (queryClient: QueryClient) => {
  return ({ children }: { children: React.ReactNode }) => {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
};

describe('InventoryTable - Componente de Estoque', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: 0 },
        mutations: { retry: false }
      }
    });
  });

  describe('Renderização básica', () => {
    it('deve renderizar a tabela sem erros', () => {
      expect(() => {
        render(
          <InventoryTable
            products={mockProducts}
            onEditProduct={mockOnEditProduct}
            onDeleteProduct={mockOnDeleteProduct}
            canDeleteProduct={true}
          />,
          { wrapper: createWrapper(queryClient) }
        );
      }).not.toThrow();
    });

    it('deve renderizar estrutura semântica da tabela', () => {
      render(
        <InventoryTable
          products={mockProducts}
          onEditProduct={mockOnEditProduct}
          onDeleteProduct={mockOnDeleteProduct}
          canDeleteProduct={true}
        />,
        { wrapper: createWrapper(queryClient) }
      );

      const table = screen.getByRole('table', { name: /lista de produtos do estoque/i });
      expect(table).toBeInTheDocument();

      // Verificar cabeçalhos da tabela
      expect(screen.getByText('Produto')).toBeInTheDocument();
      expect(screen.getByText('Preço')).toBeInTheDocument();
      expect(screen.getByText('Estoque')).toBeInTheDocument();
      expect(screen.getByText('Mínimo')).toBeInTheDocument();
      expect(screen.getByText('Giro')).toBeInTheDocument();
      expect(screen.getByText('Fornecedor')).toBeInTheDocument();
      expect(screen.getByText('Código')).toBeInTheDocument();
      expect(screen.getByText('Ações')).toBeInTheDocument();
    });

    it('deve renderizar todos os produtos fornecidos', () => {
      render(
        <InventoryTable
          products={mockProducts}
          onEditProduct={mockOnEditProduct}
          onDeleteProduct={mockOnDeleteProduct}
          canDeleteProduct={true}
        />,
        { wrapper: createWrapper(queryClient) }
      );

      // Verificar se todos os produtos são renderizados
      expect(screen.getByTestId('product-row-1')).toBeInTheDocument();
      expect(screen.getByTestId('product-row-2')).toBeInTheDocument();
      expect(screen.getByTestId('product-row-3')).toBeInTheDocument();
      expect(screen.getByTestId('product-row-4')).toBeInTheDocument();

      // Verificar dados específicos dos produtos
      expect(screen.getByText('Vinho Tinto Reserva Premium')).toBeInTheDocument();
      expect(screen.getByText('Whisky Single Malt 12 Anos')).toBeInTheDocument();
      expect(screen.getByText('Champagne Francês Extra Dry')).toBeInTheDocument();
      expect(screen.getByText('Cerveja Artesanal IPA')).toBeInTheDocument();
    });

    it('deve renderizar card container', () => {
      render(
        <InventoryTable
          products={mockProducts}
          onEditProduct={mockOnEditProduct}
          onDeleteProduct={mockOnDeleteProduct}
          canDeleteProduct={true}
        />,
        { wrapper: createWrapper(queryClient) }
      );

      const card = screen.getByTestId('inventory-table-card');
      expect(card).toBeInTheDocument();
    });
  });

  describe('Estados de loading e vazio', () => {
    it('deve exibir loading quando isLoading=true', () => {
      render(
        <InventoryTable
          products={[]}
          onEditProduct={mockOnEditProduct}
          onDeleteProduct={mockOnDeleteProduct}
          canDeleteProduct={true}
          isLoading={true}
        />,
        { wrapper: createWrapper(queryClient) }
      );

      const loadingScreen = screen.getByTestId('loading-screen');
      expect(loadingScreen).toBeInTheDocument();
      expect(loadingScreen).toHaveTextContent('Carregando produtos...');

      // Tabela não deve estar presente durante loading
      expect(screen.queryByRole('table')).not.toBeInTheDocument();
    });

    it('deve exibir estado vazio quando não há produtos', () => {
      render(
        <InventoryTable
          products={[]}
          onEditProduct={mockOnEditProduct}
          onDeleteProduct={mockOnDeleteProduct}
          canDeleteProduct={true}
          isLoading={false}
        />,
        { wrapper: createWrapper(queryClient) }
      );

      const emptyState = screen.getByTestId('empty-products');
      expect(emptyState).toBeInTheDocument();
      expect(emptyState).toHaveTextContent('Nenhum produto encontrado');

      // Tabela não deve estar presente quando vazia
      expect(screen.queryByRole('table')).not.toBeInTheDocument();
    });

    it('deve renderizar tabela quando há produtos e não está carregando', () => {
      render(
        <InventoryTable
          products={mockProducts}
          onEditProduct={mockOnEditProduct}
          onDeleteProduct={mockOnDeleteProduct}
          canDeleteProduct={true}
          isLoading={false}
        />,
        { wrapper: createWrapper(queryClient) }
      );

      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();
      
      // Loading e empty state não devem estar presentes
      expect(screen.queryByTestId('loading-screen')).not.toBeInTheDocument();
      expect(screen.queryByTestId('empty-products')).not.toBeInTheDocument();
    });
  });

  describe('Indicadores de estoque baixo', () => {
    it('deve identificar produtos com estoque baixo', () => {
      render(
        <InventoryTable
          products={mockProducts}
          onEditProduct={mockOnEditProduct}
          onDeleteProduct={mockOnDeleteProduct}
          canDeleteProduct={true}
        />,
        { wrapper: createWrapper(queryClient) }
      );

      // Champagne tem estoque 2, mínimo 5 - deve estar marcado como baixo
      const champagneStock = screen.getByTestId('stock-3');
      expect(champagneStock).toHaveTextContent('2/5');
      expect(champagneStock).toHaveClass('text-red-500');

      // Vinho tem estoque 25, mínimo 5 - deve estar normal
      const vinhoStock = screen.getByTestId('stock-1');
      expect(vinhoStock).toHaveTextContent('25/5');
      expect(vinhoStock).not.toHaveClass('text-red-500');
    });

    it('deve exibir quantidades de estoque atual vs mínimo', () => {
      render(
        <InventoryTable
          products={mockProducts}
          onEditProduct={mockOnEditProduct}
          onDeleteProduct={mockOnDeleteProduct}
          canDeleteProduct={true}
        />,
        { wrapper: createWrapper(queryClient) }
      );

      // Verificar formato "atual/mínimo"
      expect(screen.getByText('25/5')).toBeInTheDocument(); // Vinho
      expect(screen.getByText('8/3')).toBeInTheDocument();  // Whisky
      expect(screen.getByText('2/5')).toBeInTheDocument();  // Champagne (baixo)
      expect(screen.getByText('48/12')).toBeInTheDocument(); // Cerveja
    });

    it('deve aplicar estilos visuais para estoque crítico', () => {
      render(
        <InventoryTable
          products={mockProducts}
          onEditProduct={mockOnEditProduct}
          onDeleteProduct={mockOnDeleteProduct}
          canDeleteProduct={true}
        />,
        { wrapper: createWrapper(queryClient) }
      );

      // Apenas o Champagne deve ter estilo de alerta
      const stocks = screen.getAllByTestId(/stock-/);
      const lowStockItems = stocks.filter(stock => stock.classList.contains('text-red-500'));
      expect(lowStockItems).toHaveLength(1);
      expect(lowStockItems[0]).toHaveTextContent('2/5');
    });
  });

  describe('Filtros por categoria', () => {
    it('deve exibir diferentes categorias de produtos', () => {
      render(
        <InventoryTable
          products={mockProducts}
          onEditProduct={mockOnEditProduct}
          onDeleteProduct={mockOnDeleteProduct}
          canDeleteProduct={true}
        />,
        { wrapper: createWrapper(queryClient) }
      );

      // Verificar categorias dos produtos
      expect(screen.getByText('Vinho Tinto')).toBeInTheDocument();
      expect(screen.getByText('Whisky')).toBeInTheDocument();
      expect(screen.getByText('Champagne')).toBeInTheDocument();
      expect(screen.getByText('Cerveja')).toBeInTheDocument();
    });

    it('deve suportar filtros de categoria (implementado pelos pais)', () => {
      // Testar com produtos filtrados por categoria
      const vinhoProducts = mockProducts.filter(p => p.category === 'Vinho Tinto');
      
      render(
        <InventoryTable
          products={vinhoProducts}
          onEditProduct={mockOnEditProduct}
          onDeleteProduct={mockOnDeleteProduct}
          canDeleteProduct={true}
        />,
        { wrapper: createWrapper(queryClient) }
      );

      // Deve renderizar apenas produtos da categoria Vinho Tinto
      expect(screen.getByText('Vinho Tinto Reserva Premium')).toBeInTheDocument();
      expect(screen.queryByText('Whisky Single Malt 12 Anos')).not.toBeInTheDocument();
      expect(screen.queryByText('Champagne Francês Extra Dry')).not.toBeInTheDocument();
      expect(screen.queryByText('Cerveja Artesanal IPA')).not.toBeInTheDocument();
    });
  });

  describe('Busca por nome/código', () => {
    it('deve exibir nomes dos produtos para busca', () => {
      render(
        <InventoryTable
          products={mockProducts}
          onEditProduct={mockOnEditProduct}
          onDeleteProduct={mockOnDeleteProduct}
          canDeleteProduct={true}
        />,
        { wrapper: createWrapper(queryClient) }
      );

      // Verificar nomes completos dos produtos
      expect(screen.getByText('Vinho Tinto Reserva Premium')).toBeInTheDocument();
      expect(screen.getByText('Whisky Single Malt 12 Anos')).toBeInTheDocument();
      expect(screen.getByText('Champagne Francês Extra Dry')).toBeInTheDocument();
      expect(screen.getByText('Cerveja Artesanal IPA')).toBeInTheDocument();
    });

    it('deve exibir códigos de barras dos produtos', () => {
      render(
        <InventoryTable
          products={mockProducts}
          onEditProduct={mockOnEditProduct}
          onDeleteProduct={mockOnDeleteProduct}
          canDeleteProduct={true}
        />,
        { wrapper: createWrapper(queryClient) }
      );

      // Verificar códigos de barras
      expect(screen.getByText('7891234567890')).toBeInTheDocument(); // Vinho
      expect(screen.getByText('7891234567891')).toBeInTheDocument(); // Whisky
      expect(screen.getByText('7891234567892')).toBeInTheDocument(); // Champagne
      expect(screen.getByText('7891234567893')).toBeInTheDocument(); // Cerveja
    });

    it('deve suportar busca por texto (implementada pelos pais)', () => {
      // Testar com produtos filtrados por busca
      const searchResults = mockProducts.filter(p => 
        p.name.toLowerCase().includes('vinho') || 
        p.barcode?.includes('7890')
      );
      
      render(
        <InventoryTable
          products={searchResults}
          onEditProduct={mockOnEditProduct}
          onDeleteProduct={mockOnDeleteProduct}
          canDeleteProduct={true}
        />,
        { wrapper: createWrapper(queryClient) }
      );

      // Deve renderizar apenas produtos que correspondem à busca
      expect(screen.getByText('Vinho Tinto Reserva Premium')).toBeInTheDocument();
      expect(screen.queryByText('Whisky Single Malt 12 Anos')).not.toBeInTheDocument();
    });
  });

  describe('Ações de editar/deletar', () => {
    it('deve chamar onEditProduct ao clicar em editar', async () => {
      const user = userEvent.setup();
      
      render(
        <InventoryTable
          products={mockProducts}
          onEditProduct={mockOnEditProduct}
          onDeleteProduct={mockOnDeleteProduct}
          canDeleteProduct={true}
        />,
        { wrapper: createWrapper(queryClient) }
      );

      const editButton = screen.getByTestId('edit-product-1');
      await user.click(editButton);

      expect(mockOnEditProduct).toHaveBeenCalledWith(mockProducts[0]);
    });

    it('deve chamar onDeleteProduct quando canDeleteProduct=true', async () => {
      const user = userEvent.setup();
      
      render(
        <InventoryTable
          products={mockProducts}
          onEditProduct={mockOnEditProduct}
          onDeleteProduct={mockOnDeleteProduct}
          canDeleteProduct={true}
        />,
        { wrapper: createWrapper(queryClient) }
      );

      const deleteButton = screen.getByTestId('delete-product-1');
      await user.click(deleteButton);

      expect(mockOnDeleteProduct).toHaveBeenCalledWith('1');
    });

    it('não deve mostrar botão de deletar quando canDeleteProduct=false', () => {
      render(
        <InventoryTable
          products={mockProducts}
          onEditProduct={mockOnEditProduct}
          onDeleteProduct={mockOnDeleteProduct}
          canDeleteProduct={false}
        />,
        { wrapper: createWrapper(queryClient) }
      );

      // Botões de exclusão não devem estar presentes
      expect(screen.queryByTestId('delete-product-1')).not.toBeInTheDocument();
      expect(screen.queryByTestId('delete-product-2')).not.toBeInTheDocument();
      expect(screen.queryByTestId('delete-product-3')).not.toBeInTheDocument();
      expect(screen.queryByTestId('delete-product-4')).not.toBeInTheDocument();
    });

    it('deve sempre mostrar botões de editar', () => {
      render(
        <InventoryTable
          products={mockProducts}
          onEditProduct={mockOnEditProduct}
          onDeleteProduct={mockOnDeleteProduct}
          canDeleteProduct={false}
        />,
        { wrapper: createWrapper(queryClient) }
      );

      // Botões de edição devem estar sempre presentes
      expect(screen.getByTestId('edit-product-1')).toBeInTheDocument();
      expect(screen.getByTestId('edit-product-2')).toBeInTheDocument();
      expect(screen.getByTestId('edit-product-3')).toBeInTheDocument();
      expect(screen.getByTestId('edit-product-4')).toBeInTheDocument();
    });
  });

  describe('Informações de giro e análise', () => {
    it('deve exibir informações de giro dos produtos', () => {
      render(
        <InventoryTable
          products={mockProducts}
          onEditProduct={mockOnEditProduct}
          onDeleteProduct={mockOnDeleteProduct}
          canDeleteProduct={true}
        />,
        { wrapper: createWrapper(queryClient) }
      );

      // Verificar indicadores de giro
      expect(screen.getByText('fast')).toBeInTheDocument();   // Vinho e Cerveja
      expect(screen.getByText('medium')).toBeInTheDocument(); // Whisky
      expect(screen.getByText('slow')).toBeInTheDocument();   // Champagne
    });

    it('deve exibir preços formatados corretamente', () => {
      render(
        <InventoryTable
          products={mockProducts}
          onEditProduct={mockOnEditProduct}
          onDeleteProduct={mockOnDeleteProduct}
          canDeleteProduct={true}
        />,
        { wrapper: createWrapper(queryClient) }
      );

      // Verificar formatação de preços
      expect(screen.getByText('R$ 89.90')).toBeInTheDocument();  // Vinho
      expect(screen.getByText('R$ 245.50')).toBeInTheDocument(); // Whisky
      expect(screen.getByText('R$ 180.00')).toBeInTheDocument(); // Champagne
      expect(screen.getByText('R$ 12.50')).toBeInTheDocument();  // Cerveja
    });

    it('deve exibir informações de fornecedores', () => {
      render(
        <InventoryTable
          products={mockProducts}
          onEditProduct={mockOnEditProduct}
          onDeleteProduct={mockOnDeleteProduct}
          canDeleteProduct={true}
        />,
        { wrapper: createWrapper(queryClient) }
      );

      // Verificar fornecedores
      expect(screen.getByText('Distribuidora Premium Ltda')).toBeInTheDocument();
      expect(screen.getByText('Importadora Bebidas SA')).toBeInTheDocument();
      expect(screen.getByText('Importadora França')).toBeInTheDocument();
      expect(screen.getByText('Cervejaria Artesanal Ltda')).toBeInTheDocument();
    });
  });

  describe('Virtualização para performance', () => {
    it('deve usar virtualização para listas grandes', () => {
      // Criar lista com muitos produtos para testar virtualização
      const manyProducts = Array.from({ length: 100 }, (_, i) => ({
        ...mockProducts[0],
        id: `product-${i}`,
        name: `Produto ${i}`,
        barcode: `789123456789${i.toString().padStart(2, '0')}`
      }));

      render(
        <InventoryTable
          products={manyProducts}
          onEditProduct={mockOnEditProduct}
          onDeleteProduct={mockOnDeleteProduct}
          canDeleteProduct={true}
        />,
        { wrapper: createWrapper(queryClient) }
      );

      // Deve ter container de virtualização
      const virtualContainer = screen.getByRole('region', { name: /lista de produtos virtualizados/i });
      expect(virtualContainer).toBeInTheDocument();
      expect(virtualContainer).toHaveAttribute('aria-live', 'polite');
    });

    it('deve ter altura fixa para container virtualizado', () => {
      render(
        <InventoryTable
          products={mockProducts}
          onEditProduct={mockOnEditProduct}
          onDeleteProduct={mockOnDeleteProduct}
          canDeleteProduct={true}
        />,
        { wrapper: createWrapper(queryClient) }
      );

      const virtualContainer = screen.getByRole('region', { name: /lista de produtos virtualizados/i });
      expect(virtualContainer).toHaveClass('h-[400px]');
      expect(virtualContainer).toHaveClass('overflow-auto');
    });

    it('deve renderizar itens de acordo com a virtualização', () => {
      const manyProducts = Array.from({ length: 20 }, (_, i) => ({
        ...mockProducts[0],
        id: `product-${i}`,
        name: `Produto ${i}`,
        barcode: `789123456789${i.toString().padStart(2, '0')}`
      }));

      render(
        <InventoryTable
          products={manyProducts}
          onEditProduct={mockOnEditProduct}
          onDeleteProduct={mockOnDeleteProduct}
          canDeleteProduct={true}
        />,
        { wrapper: createWrapper(queryClient) }
      );

      // Deve renderizar todos os produtos (mock simplificado)
      const productRows = screen.getAllByTestId(/product-row-/);
      expect(productRows.length).toBe(20);
    });
  });

  describe('Acessibilidade', () => {
    it('deve ter estrutura semântica adequada', () => {
      render(
        <InventoryTable
          products={mockProducts}
          onEditProduct={mockOnEditProduct}
          onDeleteProduct={mockOnDeleteProduct}
          canDeleteProduct={true}
        />,
        { wrapper: createWrapper(queryClient) }
      );

      const table = screen.getByRole('table');
      expect(table).toHaveAttribute('aria-label', 'Lista de produtos do estoque');

      // Deve ter caption para screen readers
      const caption = screen.getByText(/tabela de produtos com 4 produtos/i);
      expect(caption).toBeInTheDocument();
      expect(caption.tagName).toBe('CAPTION');
      expect(caption).toHaveClass('sr-only');
    });

    it('deve ter cabeçalhos apropriados com scope', () => {
      render(
        <InventoryTable
          products={mockProducts}
          onEditProduct={mockOnEditProduct}
          onDeleteProduct={mockOnDeleteProduct}
          canDeleteProduct={true}
        />,
        { wrapper: createWrapper(queryClient) }
      );

      const headers = screen.getAllByRole('columnheader');
      expect(headers).toHaveLength(8); // 8 colunas

      headers.forEach(header => {
        expect(header).toHaveAttribute('scope', 'col');
      });
    });

    it('deve ter instruções informativas no caption', () => {
      render(
        <InventoryTable
          products={mockProducts}
          onEditProduct={mockOnEditProduct}
          onDeleteProduct={mockOnDeleteProduct}
          canDeleteProduct={true}
        />,
        { wrapper: createWrapper(queryClient) }
      );

      const instructions = screen.getByText(/inclui informações sobre preço, estoque e giro/i);
      expect(instructions).toBeInTheDocument();
    });

    it('deve ter região de virtualização com labels apropriados', () => {
      render(
        <InventoryTable
          products={mockProducts}
          onEditProduct={mockOnEditProduct}
          onDeleteProduct={mockOnDeleteProduct}
          canDeleteProduct={true}
        />,
        { wrapper: createWrapper(queryClient) }
      );

      const virtualRegion = screen.getByRole('region', { name: /lista de produtos virtualizados/i });
      expect(virtualRegion).toHaveAttribute('aria-live', 'polite');
      expect(virtualRegion).toHaveAttribute('aria-label', 'Lista de produtos virtualizados');
    });

    it('deve ter navegação por teclado funcional', async () => {
      const user = userEvent.setup();
      
      render(
        <InventoryTable
          products={mockProducts}
          onEditProduct={mockOnEditProduct}
          onDeleteProduct={mockOnDeleteProduct}
          canDeleteProduct={true}
        />,
        { wrapper: createWrapper(queryClient) }
      );

      const editButton = screen.getByTestId('edit-product-1');
      editButton.focus();
      
      expect(document.activeElement).toBe(editButton);
      
      // Navegar com Tab
      await user.tab();
      expect(document.activeElement).not.toBe(editButton);
    });
  });

  describe('Responsividade', () => {
    it('deve ter scroll horizontal para telas pequenas', () => {
      render(
        <InventoryTable
          products={mockProducts}
          onEditProduct={mockOnEditProduct}
          onDeleteProduct={mockOnDeleteProduct}
          canDeleteProduct={true}
        />,
        { wrapper: createWrapper(queryClient) }
      );

      const scrollContainer = screen.getByRole('table').closest('.overflow-x-auto');
      expect(scrollContainer).toBeInTheDocument();
      expect(scrollContainer).toHaveClass('overflow-x-auto');
    });

    it('deve ter cabeçalho fixo durante scroll', () => {
      render(
        <InventoryTable
          products={mockProducts}
          onEditProduct={mockOnEditProduct}
          onDeleteProduct={mockOnDeleteProduct}
          canDeleteProduct={true}
        />,
        { wrapper: createWrapper(queryClient) }
      );

      const thead = screen.getByRole('table').querySelector('thead');
      expect(thead).toHaveClass('sticky', 'top-0', 'z-10');
    });
  });

  describe('Temas e estilos', () => {
    it('deve aplicar classes de tema Adega', () => {
      render(
        <InventoryTable
          products={mockProducts}
          onEditProduct={mockOnEditProduct}
          onDeleteProduct={mockOnDeleteProduct}
          canDeleteProduct={true}
        />,
        { wrapper: createWrapper(queryClient) }
      );

      const card = screen.getByTestId('inventory-table-card');
      expect(card).toHaveClass('bg-adega-charcoal/20', 'border-white/10');

      const thead = screen.getByRole('table').querySelector('thead tr');
      expect(thead).toHaveClass('bg-adega-charcoal/30', 'backdrop-blur-sm');
    });

    it('deve ter cores apropriadas para headers', () => {
      render(
        <InventoryTable
          products={mockProducts}
          onEditProduct={mockOnEditProduct}
          onDeleteProduct={mockOnDeleteProduct}
          canDeleteProduct={true}
        />,
        { wrapper: createWrapper(queryClient) }
      );

      const headers = screen.getAllByRole('columnheader');
      headers.forEach(header => {
        expect(header).toHaveClass('text-adega-platinum');
      });
    });
  });

  describe('TypeScript e tipos', () => {
    it('deve aceitar interface InventoryTableProps corretamente', () => {
      const props = {
        products: mockProducts,
        onEditProduct: mockOnEditProduct,
        onDeleteProduct: mockOnDeleteProduct,
        canDeleteProduct: true,
        isLoading: false
      };
      
      expect(() => {
        render(
          <InventoryTable {...props} />,
          { wrapper: createWrapper(queryClient) }
        );
      }).not.toThrow();
    });

    it('deve usar tipos Product para dados', () => {
      render(
        <InventoryTable
          products={mockProducts}
          onEditProduct={mockOnEditProduct}
          onDeleteProduct={mockOnDeleteProduct}
          canDeleteProduct={true}
        />,
        { wrapper: createWrapper(queryClient) }
      );

      // Se renderiza sem erro, os tipos estão corretos
      expect(screen.getByRole('table')).toBeInTheDocument();
    });
  });
});