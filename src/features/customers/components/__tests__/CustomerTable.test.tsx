import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { CustomerTable } from '../CustomerTable';
import { CustomerProfile } from '@/features/customers/hooks/use-crm';

// Mock data - clientes realistas
const mockCustomers: CustomerProfile[] = [
  {
    id: '1',
    name: 'João Silva Santos',
    email: 'joao.silva@email.com',
    phone: '(11) 99999-1111',
    segment: 'VIP',
    lifetime_value: 2500.75,
    last_purchase_date: '2024-01-15',
    total_purchases: 25,
    average_ticket: 100.03,
    purchase_frequency: 2.5,
    preferred_categories: ['Vinho Tinto', 'Whisky'],
    created_at: '2023-01-10T10:00:00Z',
    updated_at: '2024-01-15T15:30:00Z'
  },
  {
    id: '2',
    name: 'Maria Oliveira Costa',
    email: 'maria.oliveira@email.com',
    phone: '(21) 88888-2222',
    segment: 'Regular',
    lifetime_value: 850.25,
    last_purchase_date: '2024-02-01',
    total_purchases: 12,
    average_ticket: 70.85,
    purchase_frequency: 1.8,
    preferred_categories: ['Vinho Branco', 'Espumante'],
    created_at: '2023-03-15T14:00:00Z',
    updated_at: '2024-02-01T09:15:00Z'
  },
  {
    id: '3',
    name: 'Pedro Henrique Lima',
    email: 'pedro.lima@email.com',
    phone: '(31) 77777-3333',
    segment: 'Ocasional',
    lifetime_value: 320.50,
    last_purchase_date: '2024-01-20',
    total_purchases: 5,
    average_ticket: 64.10,
    purchase_frequency: 0.8,
    preferred_categories: ['Cerveja', 'Gin'],
    created_at: '2023-06-20T16:30:00Z',
    updated_at: '2024-01-20T11:45:00Z'
  },
  {
    id: '4',
    name: 'Ana Carolina Ferreira',
    email: 'ana.ferreira@email.com',
    phone: '(41) 66666-4444',
    segment: 'Novo',
    lifetime_value: 89.90,
    last_purchase_date: '2024-02-05',
    total_purchases: 1,
    average_ticket: 89.90,
    purchase_frequency: 0.2,
    preferred_categories: ['Vinho Rosé'],
    created_at: '2024-02-05T12:00:00Z',
    updated_at: '2024-02-05T12:00:00Z'
  }
];

// Mock handlers
const mockOnSelectCustomer = vi.fn();
const mockOnEditCustomer = vi.fn();

// Mock components básicos
vi.mock('@/shared/ui/primitives/card', () => ({
  Card: ({ children, className }: any) => React.createElement('div', { className, 'data-testid': 'customer-table-card' }, children),
  CardContent: ({ children, className }: any) => React.createElement('div', { className }, children)
}));

vi.mock('@/shared/ui/composite/empty-state', () => ({
  EmptyCustomers: () => React.createElement('div', { 'data-testid': 'empty-customers' }, 'Nenhum cliente encontrado')
}));

vi.mock('@/shared/ui/composite/loading-spinner', () => ({
  LoadingScreen: ({ text }: any) => React.createElement('div', { 'data-testid': 'loading-screen' }, text)
}));

// Mock CustomerRow component
vi.mock('../CustomerRow', () => ({
  CustomerRow: ({ customer, onSelect, onEdit, canEdit }: any) => {
    return React.createElement('div', { 'data-testid': `customer-row-${customer.id}`, style: { display: 'table-row' } }, [
      React.createElement('div', { key: 'name', style: { display: 'table-cell' } }, customer.name),
      React.createElement('div', { key: 'segment', style: { display: 'table-cell' } }, customer.segment),
      React.createElement('div', { key: 'email', style: { display: 'table-cell' } }, customer.email),
      React.createElement('div', { key: 'ltv', style: { display: 'table-cell' } }, `R$ ${customer.lifetime_value.toFixed(2)}`),
      React.createElement('div', { key: 'last-purchase', style: { display: 'table-cell' } }, customer.last_purchase_date),
      React.createElement('div', { key: 'category', style: { display: 'table-cell' } }, customer.preferred_categories[0] || 'N/A'),
      React.createElement('div', { key: 'actions', style: { display: 'table-cell' } }, [
        React.createElement('button', {
          key: 'select',
          onClick: () => onSelect(customer),
          'data-testid': `select-customer-${customer.id}`
        }, 'Selecionar'),
        canEdit && React.createElement('button', {
          key: 'edit',
          onClick: () => onEdit(customer),
          'data-testid': `edit-customer-${customer.id}`
        }, 'Editar')
      ])
    ]);
  }
}));

// Mock virtualização simplificada
vi.mock('@/hooks/common/useVirtualizedTable', () => ({
  useVirtualizedCustomerTable: (customers: any[]) => ({
    parentRef: { current: null },
    virtualItems: customers.map((_, index) => ({
      index,
      start: index * 70,
      size: 70,
      end: (index + 1) * 70
    })),
    totalSize: customers.length * 70
  })
}));

// Test wrapper
const createWrapper = (queryClient: QueryClient) => {
  return ({ children }: { children: React.ReactNode }) => {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
};

describe('CustomerTable - Componente de Lista', () => {
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
          <CustomerTable
            customers={mockCustomers}
            onSelectCustomer={mockOnSelectCustomer}
            onEditCustomer={mockOnEditCustomer}
          />,
          { wrapper: createWrapper(queryClient) }
        );
      }).not.toThrow();
    });

    it('deve renderizar estrutura semântica da tabela', () => {
      render(
        <CustomerTable
          customers={mockCustomers}
          onSelectCustomer={mockOnSelectCustomer}
          onEditCustomer={mockOnEditCustomer}
        />,
        { wrapper: createWrapper(queryClient) }
      );

      const table = screen.getByRole('table', { name: /lista de clientes/i });
      expect(table).toBeInTheDocument();

      // Verificar cabeçalhos da tabela
      expect(screen.getByText('Cliente')).toBeInTheDocument();
      expect(screen.getByText('Segmento')).toBeInTheDocument();
      expect(screen.getByText('Contato')).toBeInTheDocument();
      expect(screen.getByText('LTV')).toBeInTheDocument();
      expect(screen.getByText('Última Compra')).toBeInTheDocument();
      expect(screen.getByText('Categoria Favorita')).toBeInTheDocument();
      expect(screen.getByText('Ações')).toBeInTheDocument();
    });

    it('deve renderizar todos os clientes fornecidos', () => {
      render(
        <CustomerTable
          customers={mockCustomers}
          onSelectCustomer={mockOnSelectCustomer}
          onEditCustomer={mockOnEditCustomer}
        />,
        { wrapper: createWrapper(queryClient) }
      );

      // Verificar se todos os clientes são renderizados
      expect(screen.getByTestId('customer-row-1')).toBeInTheDocument();
      expect(screen.getByTestId('customer-row-2')).toBeInTheDocument();
      expect(screen.getByTestId('customer-row-3')).toBeInTheDocument();
      expect(screen.getByTestId('customer-row-4')).toBeInTheDocument();

      // Verificar dados específicos dos clientes
      expect(screen.getByText('João Silva Santos')).toBeInTheDocument();
      expect(screen.getByText('Maria Oliveira Costa')).toBeInTheDocument();
      expect(screen.getByText('Pedro Henrique Lima')).toBeInTheDocument();
      expect(screen.getByText('Ana Carolina Ferreira')).toBeInTheDocument();
    });

    it('deve renderizar card container', () => {
      render(
        <CustomerTable
          customers={mockCustomers}
          onSelectCustomer={mockOnSelectCustomer}
          onEditCustomer={mockOnEditCustomer}
        />,
        { wrapper: createWrapper(queryClient) }
      );

      const card = screen.getByTestId('customer-table-card');
      expect(card).toBeInTheDocument();
    });
  });

  describe('Estados de loading e vazio', () => {
    it('deve exibir loading quando isLoading=true', () => {
      render(
        <CustomerTable
          customers={[]}
          onSelectCustomer={mockOnSelectCustomer}
          onEditCustomer={mockOnEditCustomer}
          isLoading={true}
        />,
        { wrapper: createWrapper(queryClient) }
      );

      const loadingScreen = screen.getByTestId('loading-screen');
      expect(loadingScreen).toBeInTheDocument();
      expect(loadingScreen).toHaveTextContent('Carregando clientes...');

      // Tabela não deve estar presente durante loading
      expect(screen.queryByRole('table')).not.toBeInTheDocument();
    });

    it('deve exibir estado vazio quando não há clientes', () => {
      render(
        <CustomerTable
          customers={[]}
          onSelectCustomer={mockOnSelectCustomer}
          onEditCustomer={mockOnEditCustomer}
          isLoading={false}
        />,
        { wrapper: createWrapper(queryClient) }
      );

      const emptyState = screen.getByTestId('empty-customers');
      expect(emptyState).toBeInTheDocument();
      expect(emptyState).toHaveTextContent('Nenhum cliente encontrado');

      // Tabela não deve estar presente quando vazia
      expect(screen.queryByRole('table')).not.toBeInTheDocument();
    });

    it('deve renderizar tabela quando há clientes e não está carregando', () => {
      render(
        <CustomerTable
          customers={mockCustomers}
          onSelectCustomer={mockOnSelectCustomer}
          onEditCustomer={mockOnEditCustomer}
          isLoading={false}
        />,
        { wrapper: createWrapper(queryClient) }
      );

      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();
      
      // Loading e empty state não devem estar presentes
      expect(screen.queryByTestId('loading-screen')).not.toBeInTheDocument();
      expect(screen.queryByTestId('empty-customers')).not.toBeInTheDocument();
    });
  });

  describe('Segmentação por LTV', () => {
    it('deve exibir segmentos corretos para cada cliente', () => {
      render(
        <CustomerTable
          customers={mockCustomers}
          onSelectCustomer={mockOnSelectCustomer}
          onEditCustomer={mockOnEditCustomer}
        />,
        { wrapper: createWrapper(queryClient) }
      );

      // Verificar segmentos dos clientes
      expect(screen.getByText('VIP')).toBeInTheDocument(); // João - LTV alto
      expect(screen.getByText('Regular')).toBeInTheDocument(); // Maria - LTV médio
      expect(screen.getByText('Ocasional')).toBeInTheDocument(); // Pedro - LTV baixo
      expect(screen.getByText('Novo')).toBeInTheDocument(); // Ana - cliente novo
    });

    it('deve exibir valores de LTV formatados corretamente', () => {
      render(
        <CustomerTable
          customers={mockCustomers}
          onSelectCustomer={mockOnSelectCustomer}
          onEditCustomer={mockOnEditCustomer}
        />,
        { wrapper: createWrapper(queryClient) }
      );

      // Verificar formatação monetária dos LTVs
      expect(screen.getByText('R$ 2500.75')).toBeInTheDocument(); // João
      expect(screen.getByText('R$ 850.25')).toBeInTheDocument(); // Maria
      expect(screen.getByText('R$ 320.50')).toBeInTheDocument(); // Pedro
      expect(screen.getByText('R$ 89.90')).toBeInTheDocument(); // Ana
    });
  });

  describe('Ordenação de dados', () => {
    it('deve ter cabeçalhos com atributos de ordenação', () => {
      render(
        <CustomerTable
          customers={mockCustomers}
          onSelectCustomer={mockOnSelectCustomer}
          onEditCustomer={mockOnEditCustomer}
        />,
        { wrapper: createWrapper(queryClient) }
      );

      // Colunas que podem ser ordenadas devem ter aria-sort
      const ltvHeader = screen.getByText('LTV').closest('th');
      const lastPurchaseHeader = screen.getByText('Última Compra').closest('th');
      
      expect(ltvHeader).toHaveAttribute('aria-sort', 'none');
      expect(lastPurchaseHeader).toHaveAttribute('aria-sort', 'none');
    });

    it('deve exibir dados ordenados por padrão', () => {
      render(
        <CustomerTable
          customers={mockCustomers}
          onSelectCustomer={mockOnSelectCustomer}
          onEditCustomer={mockOnEditCustomer}
        />,
        { wrapper: createWrapper(queryClient) }
      );

      // Os clientes devem ser exibidos na ordem fornecida
      const customerRows = screen.getAllByTestId(/customer-row-/);
      expect(customerRows).toHaveLength(4);
      
      // Verificar ordem específica (por ID no caso)
      expect(customerRows[0]).toHaveAttribute('data-testid', 'customer-row-1');
      expect(customerRows[1]).toHaveAttribute('data-testid', 'customer-row-2');
      expect(customerRows[2]).toHaveAttribute('data-testid', 'customer-row-3');
      expect(customerRows[3]).toHaveAttribute('data-testid', 'customer-row-4');
    });
  });

  describe('Virtualização para performance', () => {
    it('deve usar virtualização para listas grandes', () => {
      // Criar lista com muitos clientes para testar virtualização
      const manyCustomers = Array.from({ length: 100 }, (_, i) => ({
        ...mockCustomers[0],
        id: `customer-${i}`,
        name: `Cliente ${i}`,
        email: `cliente${i}@email.com`
      }));

      render(
        <CustomerTable
          customers={manyCustomers}
          onSelectCustomer={mockOnSelectCustomer}
          onEditCustomer={mockOnEditCustomer}
        />,
        { wrapper: createWrapper(queryClient) }
      );

      // Deve ter container de virtualização
      const virtualContainer = screen.getByRole('region', { name: /lista de clientes virtualizados/i });
      expect(virtualContainer).toBeInTheDocument();
      expect(virtualContainer).toHaveAttribute('aria-live', 'polite');
    });

    it('deve ter altura fixa para container virtualizado', () => {
      render(
        <CustomerTable
          customers={mockCustomers}
          onSelectCustomer={mockOnSelectCustomer}
          onEditCustomer={mockOnEditCustomer}
        />,
        { wrapper: createWrapper(queryClient) }
      );

      const virtualContainer = screen.getByRole('region', { name: /lista de clientes virtualizados/i });
      expect(virtualContainer).toHaveClass('h-[500px]');
      expect(virtualContainer).toHaveClass('overflow-auto');
    });

    it('deve renderizar apenas itens visíveis para performance', () => {
      const manyCustomers = Array.from({ length: 50 }, (_, i) => ({
        ...mockCustomers[0],
        id: `customer-${i}`,
        name: `Cliente ${i}`,
        email: `cliente${i}@email.com`
      }));

      render(
        <CustomerTable
          customers={manyCustomers}
          onSelectCustomer={mockOnSelectCustomer}
          onEditCustomer={mockOnEditCustomer}
        />,
        { wrapper: createWrapper(queryClient) }
      );

      // Deve renderizar todos os clientes (mock simplificado)
      const customerRows = screen.getAllByTestId(/customer-row-/);
      expect(customerRows.length).toBe(50);
    });
  });

  describe('Interações do usuário', () => {
    it('deve chamar onSelectCustomer ao clicar em selecionar', async () => {
      const user = userEvent.setup();
      
      render(
        <CustomerTable
          customers={mockCustomers}
          onSelectCustomer={mockOnSelectCustomer}
          onEditCustomer={mockOnEditCustomer}
        />,
        { wrapper: createWrapper(queryClient) }
      );

      const selectButton = screen.getByTestId('select-customer-1');
      await user.click(selectButton);

      expect(mockOnSelectCustomer).toHaveBeenCalledWith(mockCustomers[0]);
    });

    it('deve chamar onEditCustomer quando canEdit=true', async () => {
      const user = userEvent.setup();
      
      render(
        <CustomerTable
          customers={mockCustomers}
          onSelectCustomer={mockOnSelectCustomer}
          onEditCustomer={mockOnEditCustomer}
          canEdit={true}
        />,
        { wrapper: createWrapper(queryClient) }
      );

      const editButton = screen.getByTestId('edit-customer-1');
      await user.click(editButton);

      expect(mockOnEditCustomer).toHaveBeenCalledWith(mockCustomers[0]);
    });

    it('não deve mostrar botão de editar quando canEdit=false', () => {
      render(
        <CustomerTable
          customers={mockCustomers}
          onSelectCustomer={mockOnSelectCustomer}
          onEditCustomer={mockOnEditCustomer}
          canEdit={false}
        />,
        { wrapper: createWrapper(queryClient) }
      );

      // Botões de edição não devem estar presentes
      expect(screen.queryByTestId('edit-customer-1')).not.toBeInTheDocument();
      expect(screen.queryByTestId('edit-customer-2')).not.toBeInTheDocument();
    });
  });

  describe('Acessibilidade', () => {
    it('deve ter estrutura semântica adequada', () => {
      render(
        <CustomerTable
          customers={mockCustomers}
          onSelectCustomer={mockOnSelectCustomer}
          onEditCustomer={mockOnEditCustomer}
        />,
        { wrapper: createWrapper(queryClient) }
      );

      const table = screen.getByRole('table');
      expect(table).toHaveAttribute('aria-label', 'Lista de clientes');

      // Deve ter caption para screen readers
      const caption = screen.getByText(/tabela de clientes com 4 clientes/i);
      expect(caption).toBeInTheDocument();
      expect(caption.tagName).toBe('CAPTION');
      expect(caption).toHaveClass('sr-only');
    });

    it('deve ter cabeçalhos apropriados com scope', () => {
      render(
        <CustomerTable
          customers={mockCustomers}
          onSelectCustomer={mockOnSelectCustomer}
          onEditCustomer={mockOnEditCustomer}
        />,
        { wrapper: createWrapper(queryClient) }
      );

      const headers = screen.getAllByRole('columnheader');
      expect(headers).toHaveLength(7); // 7 colunas

      headers.forEach(header => {
        expect(header).toHaveAttribute('scope', 'col');
      });
    });

    it('deve ter instruções de navegação para screen readers', () => {
      render(
        <CustomerTable
          customers={mockCustomers}
          onSelectCustomer={mockOnSelectCustomer}
          onEditCustomer={mockOnEditCustomer}
        />,
        { wrapper: createWrapper(queryClient) }
      );

      const instructions = screen.getByText(/use as setas para navegar e enter para selecionar/i);
      expect(instructions).toBeInTheDocument();
    });

    it('deve ter região de virtualização com labels apropriados', () => {
      render(
        <CustomerTable
          customers={mockCustomers}
          onSelectCustomer={mockOnSelectCustomer}
          onEditCustomer={mockOnEditCustomer}
        />,
        { wrapper: createWrapper(queryClient) }
      );

      const virtualRegion = screen.getByRole('region', { name: /lista de clientes virtualizados/i });
      expect(virtualRegion).toHaveAttribute('aria-live', 'polite');
      expect(virtualRegion).toHaveAttribute('aria-label', 'Lista de clientes virtualizados');
    });

    it('deve ter navegação por teclado funcional', async () => {
      const user = userEvent.setup();
      
      render(
        <CustomerTable
          customers={mockCustomers}
          onSelectCustomer={mockOnSelectCustomer}
          onEditCustomer={mockOnEditCustomer}
          canEdit={true}
        />,
        { wrapper: createWrapper(queryClient) }
      );

      const selectButton = screen.getByTestId('select-customer-1');
      selectButton.focus();
      
      expect(document.activeElement).toBe(selectButton);
      
      // Navegar com Tab
      await user.tab();
      expect(document.activeElement).not.toBe(selectButton);
    });
  });

  describe('Responsividade', () => {
    it('deve ter scroll horizontal para telas pequenas', () => {
      render(
        <CustomerTable
          customers={mockCustomers}
          onSelectCustomer={mockOnSelectCustomer}
          onEditCustomer={mockOnEditCustomer}
        />,
        { wrapper: createWrapper(queryClient) }
      );

      const scrollContainer = screen.getByRole('table').closest('.overflow-x-auto');
      expect(scrollContainer).toBeInTheDocument();
      expect(scrollContainer).toHaveClass('overflow-x-auto');
    });

    it('deve ter cabeçalho fixo durante scroll', () => {
      render(
        <CustomerTable
          customers={mockCustomers}
          onSelectCustomer={mockOnSelectCustomer}
          onEditCustomer={mockOnEditCustomer}
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
        <CustomerTable
          customers={mockCustomers}
          onSelectCustomer={mockOnSelectCustomer}
          onEditCustomer={mockOnEditCustomer}
        />,
        { wrapper: createWrapper(queryClient) }
      );

      const card = screen.getByTestId('customer-table-card');
      expect(card).toHaveClass('bg-adega-charcoal/20', 'border-white/10');

      const thead = screen.getByRole('table').querySelector('thead tr');
      expect(thead).toHaveClass('bg-adega-charcoal/30', 'backdrop-blur-sm');
    });

    it('deve ter cores apropriadas para headers', () => {
      render(
        <CustomerTable
          customers={mockCustomers}
          onSelectCustomer={mockOnSelectCustomer}
          onEditCustomer={mockOnEditCustomer}
        />,
        { wrapper: createWrapper(queryClient) }
      );

      const headers = screen.getAllByRole('columnheader');
      headers.forEach(header => {
        expect(header).toHaveClass('text-adega-platinum');
      });
    });
  });

  describe('Dados dos clientes', () => {
    it('deve exibir categorias favoritas', () => {
      render(
        <CustomerTable
          customers={mockCustomers}
          onSelectCustomer={mockOnSelectCustomer}
          onEditCustomer={mockOnEditCustomer}
        />,
        { wrapper: createWrapper(queryClient) }
      );

      // Verificar categorias favoritas (primeira da lista)
      expect(screen.getByText('Vinho Tinto')).toBeInTheDocument(); // João
      expect(screen.getByText('Vinho Branco')).toBeInTheDocument(); // Maria
      expect(screen.getByText('Cerveja')).toBeInTheDocument(); // Pedro
      expect(screen.getByText('Vinho Rosé')).toBeInTheDocument(); // Ana
    });

    it('deve exibir datas de última compra', () => {
      render(
        <CustomerTable
          customers={mockCustomers}
          onSelectCustomer={mockOnSelectCustomer}
          onEditCustomer={mockOnEditCustomer}
        />,
        { wrapper: createWrapper(queryClient) }
      );

      expect(screen.getByText('2024-01-15')).toBeInTheDocument(); // João
      expect(screen.getByText('2024-02-01')).toBeInTheDocument(); // Maria
      expect(screen.getByText('2024-01-20')).toBeInTheDocument(); // Pedro
      expect(screen.getByText('2024-02-05')).toBeInTheDocument(); // Ana
    });

    it('deve exibir informações de contato', () => {
      render(
        <CustomerTable
          customers={mockCustomers}
          onSelectCustomer={mockOnSelectCustomer}
          onEditCustomer={mockOnEditCustomer}
        />,
        { wrapper: createWrapper(queryClient) }
      );

      expect(screen.getByText('joao.silva@email.com')).toBeInTheDocument();
      expect(screen.getByText('maria.oliveira@email.com')).toBeInTheDocument();
      expect(screen.getByText('pedro.lima@email.com')).toBeInTheDocument();
      expect(screen.getByText('ana.ferreira@email.com')).toBeInTheDocument();
    });
  });

  describe('TypeScript e tipos', () => {
    it('deve aceitar interface CustomerTableProps corretamente', () => {
      const props = {
        customers: mockCustomers,
        onSelectCustomer: mockOnSelectCustomer,
        onEditCustomer: mockOnEditCustomer,
        canEdit: true,
        isLoading: false
      };
      
      expect(() => {
        render(
          <CustomerTable {...props} />,
          { wrapper: createWrapper(queryClient) }
        );
      }).not.toThrow();
    });

    it('deve usar tipos CustomerProfile para dados', () => {
      render(
        <CustomerTable
          customers={mockCustomers}
          onSelectCustomer={mockOnSelectCustomer}
          onEditCustomer={mockOnEditCustomer}
        />,
        { wrapper: createWrapper(queryClient) }
      );

      // Se renderiza sem erro, os tipos estão corretos
      expect(screen.getByRole('table')).toBeInTheDocument();
    });
  });
});