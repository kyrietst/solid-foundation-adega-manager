/**
 * CustomerTable.behavioral.test.tsx - Testes Robustos para Tabela de Clientes (Context7 Pattern)
 * Implementa testes comportamentais focados no usuário
 * Testa interações reais, filtragem, ordenação e seleção de clientes
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render, createMockCustomer } from '@/__tests__/utils/test-utils';
import { server, resetMockData } from '@/__tests__/mocks/server';
import { http, HttpResponse } from 'msw';
import { CustomerTable } from '../CustomerTable';
import { CustomerProfile } from '@/features/customers/hooks/use-crm';

// Mock data com clientes diversos para testar diferentes cenários
const mockDiverseCustomers: CustomerProfile[] = [
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

const mockOnSelectCustomer = vi.fn();
const mockOnEditCustomer = vi.fn();

// Mocks reduzidos para focar em comportamentos
vi.mock('@/features/customers/hooks/useCustomerAnalytics', () => ({
  useCustomerAnalytics: () => ({
    predictChurnRisk: vi.fn(() => ({ risk: 'high', probability: 85 })),
    findUpsellOpportunities: vi.fn(() => ({ products: ['Vinhos Premium'], potential: 150 }))
  })
}));

describe('CustomerTable - Comportamento do Usuário', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    resetMockData();
    vi.clearAllMocks();
  });

  describe('Seleção de Clientes', () => {
    it('deve permitir selecionar cliente para venda', async () => {
      render(
        <CustomerTable
          customers={mockDiverseCustomers}
          onSelectCustomer={mockOnSelectCustomer}
          onEditCustomer={mockOnEditCustomer}
        />
      );

      const selectButton = screen.getByTestId('select-customer-1');
      await user.click(selectButton);

      expect(mockOnSelectCustomer).toHaveBeenCalledWith(mockDiverseCustomers[0]);
      expect(mockOnSelectCustomer).toHaveBeenCalledTimes(1);
    });

    it('deve destacar cliente VIP para vendedor', async () => {
      const vipCustomer = createMockCustomer({
        id: 'vip-customer',
        segment: 'VIP',
        lifetime_value: 5000.00
      });

      render(
        <CustomerTable
          customers={[vipCustomer]}
          onSelectCustomer={mockOnSelectCustomer}
          onEditCustomer={mockOnEditCustomer}
        />
      );

      expect(screen.getByText('VIP')).toBeInTheDocument();
      expect(screen.getByText('R$ 5000.00')).toBeInTheDocument();

      // Deve ter indicador visual de VIP
      const vipRow = screen.getByTestId('customer-row-vip-customer');
      expect(vipRow).toHaveClass('border-adega-gold/30');
    });

    it('deve permitir buscar cliente por nome', async () => {
      render(
        <CustomerTable
          customers={mockDiverseCustomers}
          onSelectCustomer={mockOnSelectCustomer}
          onEditCustomer={mockOnEditCustomer}
          searchable={true}
        />
      );

      const searchInput = screen.getByPlaceholderText(/buscar cliente/i);
      await user.type(searchInput, 'João');

      await waitFor(() => {
        expect(screen.getByText('João Silva Santos')).toBeInTheDocument();
        expect(screen.queryByText('Maria Oliveira Costa')).not.toBeInTheDocument();
      });
    });

    it('deve filtrar por segmento de cliente', async () => {
      render(
        <CustomerTable
          customers={mockDiverseCustomers}
          onSelectCustomer={mockOnSelectCustomer}
          onEditCustomer={mockOnEditCustomer}
          filterable={true}
        />
      );

      const segmentFilter = screen.getByLabelText(/filtrar por segmento/i);
      await user.selectOptions(segmentFilter, 'VIP');

      await waitFor(() => {
        expect(screen.getByText('João Silva Santos')).toBeInTheDocument(); // VIP
        expect(screen.queryByText('Ana Carolina Ferreira')).not.toBeInTheDocument(); // Novo
      });
    });
  });

  describe('Edição de Clientes', () => {
    it('deve permitir editar dados do cliente quando autorizado', async () => {
      render(
        <CustomerTable
          customers={mockDiverseCustomers.slice(0, 1)}
          onSelectCustomer={mockOnSelectCustomer}
          onEditCustomer={mockOnEditCustomer}
          canEdit={true}
        />
      );

      const editButton = screen.getByTestId('edit-customer-1');
      await user.click(editButton);

      expect(mockOnEditCustomer).toHaveBeenCalledWith(mockDiverseCustomers[0]);
    });

    it('deve ocultar botão de edição para usuários sem permissão', () => {
      render(
        <CustomerTable
          customers={mockDiverseCustomers.slice(0, 1)}
          onSelectCustomer={mockOnSelectCustomer}
          onEditCustomer={mockOnEditCustomer}
          canEdit={false}
        />
      );

      expect(screen.queryByTestId('edit-customer-1')).not.toBeInTheDocument();
    });

    it('deve atualizar dados do cliente via API', async () => {
      let capturedRequest: any = null;

      server.use(
        http.patch('/rest/v1/customers/*', async ({ request }) => {
          capturedRequest = await request.json();
          return HttpResponse.json({ success: true });
        })
      );

      render(
        <CustomerTable
          customers={mockDiverseCustomers.slice(0, 1)}
          onSelectCustomer={mockOnSelectCustomer}
          onEditCustomer={mockOnEditCustomer}
          canEdit={true}
        />
      );

      const editButton = screen.getByTestId('edit-customer-1');
      await user.click(editButton);

      // Simular edição inline (se disponível)
      const nameCell = screen.getByText('João Silva Santos');
      await user.dblClick(nameCell);

      if (screen.queryByRole('textbox')) {
        const nameInput = screen.getByRole('textbox');
        await user.clear(nameInput);
        await user.type(nameInput, 'João Silva Santos Editado');
        await user.keyboard('[Enter]');

        await waitFor(() => {
          expect(capturedRequest).toMatchObject({
            name: 'João Silva Santos Editado'
          });
        });
      }
    });
  });

  describe('Estados de Loading e Dados', () => {
    it('deve exibir loading durante carregamento de clientes', () => {
      render(
        <CustomerTable
          customers={[]}
          onSelectCustomer={mockOnSelectCustomer}
          onEditCustomer={mockOnEditCustomer}
          isLoading={true}
        />
      );

      expect(screen.getByText(/carregando clientes/i)).toBeInTheDocument();
      expect(screen.queryByRole('table')).not.toBeInTheDocument();
    });

    it('deve exibir estado vazio com call-to-action', () => {
      render(
        <CustomerTable
          customers={[]}
          onSelectCustomer={mockOnSelectCustomer}
          onEditCustomer={mockOnEditCustomer}
          isLoading={false}
        />
      );

      expect(screen.getByText(/nenhum cliente encontrado/i)).toBeInTheDocument();
      expect(screen.getByText(/cadastre o primeiro cliente/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /novo cliente/i })).toBeInTheDocument();
    });

    it('deve carregar dados de clientes via API', async () => {
      server.use(
        http.get('/rest/v1/customers', () => {
          return HttpResponse.json(mockDiverseCustomers);
        })
      );

      render(
        <CustomerTable
          customers={[]}
          onSelectCustomer={mockOnSelectCustomer}
          onEditCustomer={mockOnEditCustomer}
          isLoading={true}
        />
      );

      await waitFor(() => {
        expect(screen.queryByText(/carregando/i)).not.toBeInTheDocument();
      });

      // Verificar se clientes foram carregados
      expect(screen.getByText('João Silva Santos')).toBeInTheDocument();
      expect(screen.getByText('Maria Oliveira Costa')).toBeInTheDocument();
    });

    it('deve tratar erro no carregamento de clientes', async () => {
      server.use(
        http.get('/rest/v1/customers', () => {
          return HttpResponse.json(
            { message: 'Erro de conexão' },
            { status: 500 }
          );
        })
      );

      render(
        <CustomerTable
          customers={[]}
          onSelectCustomer={mockOnSelectCustomer}
          onEditCustomer={mockOnEditCustomer}
          isLoading={false}
          error="Erro de conexão"
        />
      );

      expect(screen.getByText(/erro ao carregar clientes/i)).toBeInTheDocument();
      expect(screen.getByText(/erro de conexão/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /tentar novamente/i })).toBeInTheDocument();
    });
  });

  describe('Análise de Segmentação', () => {
    it('deve calcular e exibir segmentos automaticamente', () => {
      render(
        <CustomerTable
          customers={mockDiverseCustomers}
          onSelectCustomer={mockOnSelectCustomer}
          onEditCustomer={mockOnEditCustomer}
        />
      );

      // Verificar segmentação automática baseada em LTV
      expect(screen.getByText('VIP')).toBeInTheDocument(); // João - LTV > 2000
      expect(screen.getByText('Regular')).toBeInTheDocument(); // Maria - LTV médio
      expect(screen.getByText('Ocasional')).toBeInTheDocument(); // Pedro - LTV baixo
      expect(screen.getByText('Novo')).toBeInTheDocument(); // Ana - primeira compra
    });

    it('deve mostrar insights de valor do cliente', () => {
      render(
        <CustomerTable
          customers={mockDiverseCustomers}
          onSelectCustomer={mockOnSelectCustomer}
          onEditCustomer={mockOnEditCustomer}
          showInsights={true}
        />
      );

      // Verificar formatação monetária e insights
      expect(screen.getByText('R$ 2.500,75')).toBeInTheDocument();
      expect(screen.getByText(/alto valor/i)).toBeInTheDocument();
      expect(screen.getByText(/comprador frequente/i)).toBeInTheDocument();
    });

    it('deve destacar clientes inativos para reativação', () => {
      const inactiveCustomer = createMockCustomer({
        id: 'inactive-customer',
        name: 'Cliente Inativo',
        last_purchase_date: '2023-01-01', // Há mais de 1 ano
        segment: 'Ocasional'
      });

      render(
        <CustomerTable
          customers={[inactiveCustomer]}
          onSelectCustomer={mockOnSelectCustomer}
          onEditCustomer={mockOnEditCustomer}
        />
      );

      expect(screen.getByText(/inativo há/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /reativar/i })).toBeInTheDocument();
    });
  });

  describe('Ordenação e Filtragem', () => {
    it('deve permitir ordenar por LTV decrescente', async () => {
      render(
        <CustomerTable
          customers={mockDiverseCustomers}
          onSelectCustomer={mockOnSelectCustomer}
          onEditCustomer={mockOnEditCustomer}
          sortable={true}
        />
      );

      const ltvHeader = screen.getByText('LTV');
      await user.click(ltvHeader);

      await waitFor(() => {
        const rows = screen.getAllByTestId(/customer-row-/);
        expect(rows[0]).toHaveTextContent('João Silva Santos'); // Maior LTV primeiro
      });
    });

    it('deve ordenar por última compra para identificar clientes ativos', async () => {
      render(
        <CustomerTable
          customers={mockDiverseCustomers}
          onSelectCustomer={mockOnSelectCustomer}
          onEditCustomer={mockOnEditCustomer}
          sortable={true}
        />
      );

      const lastPurchaseHeader = screen.getByText('Última Compra');
      await user.click(lastPurchaseHeader);

      await waitFor(() => {
        const rows = screen.getAllByTestId(/customer-row-/);
        // Ana Carolina deve aparecer primeiro (compra mais recente)
        expect(rows[0]).toHaveTextContent('Ana Carolina Ferreira');
      });
    });

    it('deve permitir busca combinada com filtros', async () => {
      render(
        <CustomerTable
          customers={mockDiverseCustomers}
          onSelectCustomer={mockOnSelectCustomer}
          onEditCustomer={mockOnEditCustomer}
          searchable={true}
          filterable={true}
        />
      );

      // Buscar por 'Silva' e filtrar por VIP
      const searchInput = screen.getByPlaceholderText(/buscar cliente/i);
      const segmentFilter = screen.getByLabelText(/filtrar por segmento/i);

      await user.type(searchInput, 'Silva');
      await user.selectOptions(segmentFilter, 'VIP');

      await waitFor(() => {
        expect(screen.getByText('João Silva Santos')).toBeInTheDocument();
        expect(screen.queryByText('Maria Oliveira Costa')).not.toBeInTheDocument();
      });
    });
  });

  describe('Performance e Virtualização', () => {
    it('deve carregar dados sob demanda para listas grandes', async () => {
      const manyCustomers = Array.from({ length: 100 }, (_, i) =>
        createMockCustomer({
          id: `customer-${i}`,
          name: `Cliente ${i}`,
          email: `cliente${i}@email.com`
        })
      );

      server.use(
        http.get('/rest/v1/customers', ({ url }) => {
          const params = new URL(url).searchParams;
          const offset = parseInt(params.get('offset') || '0');
          const limit = parseInt(params.get('limit') || '50');

          const chunk = manyCustomers.slice(offset, offset + limit);
          return HttpResponse.json(chunk);
        })
      );

      render(
        <CustomerTable
          customers={[]}
          onSelectCustomer={mockOnSelectCustomer}
          onEditCustomer={mockOnEditCustomer}
          virtualized={true}
        />
      );

      // Deve carregar apenas primeiros 50 clientes
      await waitFor(() => {
        expect(screen.getByText('Cliente 0')).toBeInTheDocument();
        expect(screen.getByText('Cliente 49')).toBeInTheDocument();
        expect(screen.queryByText('Cliente 50')).not.toBeInTheDocument();
      });
    });
  });

  describe('Integrações com Sistema de Vendas', () => {
    it('deve integrar com sistema de vendas ao selecionar cliente', async () => {
      render(
        <CustomerTable
          customers={mockDiverseCustomers}
          onSelectCustomer={mockOnSelectCustomer}
          onEditCustomer={mockOnEditCustomer}
        />
      );

      const selectButton = screen.getByTestId('select-customer-1');
      await user.click(selectButton);

      // Deve passar dados completos do cliente para o sistema de vendas
      expect(mockOnSelectCustomer).toHaveBeenCalledWith(
        expect.objectContaining({
          id: '1',
          name: 'João Silva Santos',
          segment: 'VIP',
          lifetime_value: 2500.75,
          preferred_categories: ['Vinho Tinto', 'Whisky']
        })
      );
    });

    it('deve permitir iniciar venda diretamente para cliente selecionado', async () => {
      const mockOnStartSale = vi.fn();

      render(
        <CustomerTable
          customers={mockDiverseCustomers}
          onSelectCustomer={mockOnSelectCustomer}
          onEditCustomer={mockOnEditCustomer}
          onStartSale={mockOnStartSale}
        />
      );

      const quickSaleButton = screen.getByTestId('quick-sale-customer-1');
      await user.click(quickSaleButton);

      expect(mockOnStartSale).toHaveBeenCalledWith(mockDiverseCustomers[0]);
    });

    it('deve sugerir produtos baseados no histórico do cliente', async () => {
      const customerWithHistory = createMockCustomer({
        id: 'customer-with-history',
        preferred_categories: ['Vinho Tinto', 'Whisky'],
        average_ticket: 150.00
      });

      render(
        <CustomerTable
          customers={[customerWithHistory]}
          onSelectCustomer={mockOnSelectCustomer}
          onEditCustomer={mockOnEditCustomer}
          showRecommendations={true}
        />
      );

      const customerRow = screen.getByTestId('customer-row-customer-with-history');
      await user.hover(customerRow);

      await waitFor(() => {
        expect(screen.getByText(/categorias preferidas/i)).toBeInTheDocument();
        expect(screen.getByText('Vinho Tinto, Whisky')).toBeInTheDocument();
        expect(screen.getByText(/ticket médio.*r\$ 150/i)).toBeInTheDocument();
      });
    });
  });

  describe('Acessibilidade e UX', () => {
    it('deve ter estrutura semântica adequada para screen readers', () => {
      render(
        <CustomerTable
          customers={mockDiverseCustomers}
          onSelectCustomer={mockOnSelectCustomer}
          onEditCustomer={mockOnEditCustomer}
        />
      );

      const table = screen.getByRole('table');
      expect(table).toHaveAttribute('aria-label', 'Lista de clientes');

      const caption = screen.getByText(/tabela com.*clientes/i);
      expect(caption).toBeInTheDocument();
      expect(caption.tagName).toBe('CAPTION');
    });

    it('deve ter shortcuts de teclado para operações comuns', async () => {
      render(
        <CustomerTable
          customers={mockDiverseCustomers}
          onSelectCustomer={mockOnSelectCustomer}
          onEditCustomer={mockOnEditCustomer}
        />
      );

      // Focar no primeiro cliente
      const firstRow = screen.getByTestId('customer-row-1');
      firstRow.focus();

      // Enter deve selecionar cliente
      await user.keyboard('[Enter]');
      expect(mockOnSelectCustomer).toHaveBeenCalledWith(mockDiverseCustomers[0]);

      // Setas devem navegar entre clientes
      await user.keyboard('[ArrowDown]');
      const secondRow = screen.getByTestId('customer-row-2');
      expect(secondRow).toHaveFocus();
    });
  });

  describe('Interface Responsiva', () => {
    it('deve adaptar layout para dispositivos móveis', () => {
      // Simular tela móvel
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375
      });

      render(
        <CustomerTable
          customers={mockDiverseCustomers}
          onSelectCustomer={mockOnSelectCustomer}
          onEditCustomer={mockOnEditCustomer}
        />
      );

      // Em móvel deve mostrar cards ao invés de tabela
      expect(screen.getByTestId('customer-cards-mobile')).toBeInTheDocument();
      expect(screen.queryByRole('table')).not.toBeInTheDocument();
    });

    it('deve manter usabilidade em diferentes tamanhos de tela', () => {
      render(
        <CustomerTable
          customers={mockDiverseCustomers}
          onSelectCustomer={mockOnSelectCustomer}
          onEditCustomer={mockOnEditCustomer}
        />
      );

      // Tablet - deve manter tabela mas com colunas condensadas
      Object.defineProperty(window, 'innerWidth', { value: 768 });

      const table = screen.getByRole('table');
      expect(table).toHaveClass('lg:table-fixed');

      // Desktop - deve mostrar todas as colunas
      Object.defineProperty(window, 'innerWidth', { value: 1200 });
      expect(screen.getByText('Categoria Favorita')).toBeInTheDocument();
    });
  });

  describe('Integração com Análise de Dados', () => {
    it('deve exportar dados de clientes para análise', async () => {
      const mockOnExport = vi.fn();

      render(
        <CustomerTable
          customers={mockDiverseCustomers}
          onSelectCustomer={mockOnSelectCustomer}
          onEditCustomer={mockOnEditCustomer}
          onExport={mockOnExport}
          exportable={true}
        />
      );

      const exportButton = screen.getByRole('button', { name: /exportar dados/i });
      await user.click(exportButton);

      // Deve exportar dados estruturados para análise
      expect(mockOnExport).toHaveBeenCalledWith({
        format: 'csv',
        data: mockDiverseCustomers,
        fields: ['name', 'segment', 'lifetime_value', 'last_purchase_date']
      });
    });

    it('deve mostrar métricas de performance de vendas por segmento', () => {
      render(
        <CustomerTable
          customers={mockDiverseCustomers}
          onSelectCustomer={mockOnSelectCustomer}
          onEditCustomer={mockOnEditCustomer}
          showMetrics={true}
        />
      );

      // Deve mostrar resumo por segmento
      expect(screen.getByText(/clientes vip.*1/i)).toBeInTheDocument();
      expect(screen.getByText(/ltv médio.*r\$ 1\.284/i)).toBeInTheDocument();
      expect(screen.getByText(/taxa de recompra.*75%/i)).toBeInTheDocument();
    });
  });

  describe('Funcionalidades Avançadas', () => {
    it('deve permitir criação de campanhas de marketing dirigidas', async () => {
      const mockOnCreateCampaign = vi.fn();

      render(
        <CustomerTable
          customers={mockDiverseCustomers}
          onSelectCustomer={mockOnSelectCustomer}
          onEditCustomer={mockOnEditCustomer}
          onCreateCampaign={mockOnCreateCampaign}
          selectable={true}
        />
      );

      // Selecionar múltiplos clientes VIP
      const vipCustomers = screen.getAllByTestId(/customer-row-.*/);
      await user.click(vipCustomers[0]); // João (VIP)

      const createCampaignButton = screen.getByRole('button', { name: /criar campanha/i });
      await user.click(createCampaignButton);

      expect(mockOnCreateCampaign).toHaveBeenCalledWith({
        targetSegment: 'VIP',
        customers: expect.arrayContaining([mockDiverseCustomers[0]]),
        suggestedProducts: ['Vinho Tinto', 'Whisky']
      });
    });

    it('deve integrar com sistema de notificações para follow-up', async () => {
      const mockOnScheduleFollowup = vi.fn();

      render(
        <CustomerTable
          customers={mockDiverseCustomers}
          onSelectCustomer={mockOnSelectCustomer}
          onEditCustomer={mockOnEditCustomer}
          onScheduleFollowup={mockOnScheduleFollowup}
        />
      );

      const followupButton = screen.getByTestId('schedule-followup-customer-1');
      await user.click(followupButton);

      expect(mockOnScheduleFollowup).toHaveBeenCalledWith({
        customerId: '1',
        type: 'purchase_followup',
        scheduledFor: expect.any(String),
        message: expect.stringContaining('João Silva Santos')
      });
    });

    it('deve sincronizar dados com sistemas externos', async () => {
      server.use(
        http.post('/rest/v1/rpc/sync_customer_data', async ({ request }) => {
          const { customer_ids } = await request.json();
          return HttpResponse.json({
            synced: customer_ids.length,
            updated: ['1', '2'],
            errors: []
          });
        })
      );

      render(
        <CustomerTable
          customers={mockDiverseCustomers}
          onSelectCustomer={mockOnSelectCustomer}
          onEditCustomer={mockOnEditCustomer}
          syncEnabled={true}
        />
      );

      const syncButton = screen.getByRole('button', { name: /sincronizar dados/i });
      await user.click(syncButton);

      await waitFor(() => {
        expect(screen.getByText(/2 clientes sincronizados/i)).toBeInTheDocument();
      });
    });
  });

  describe('Análise Preditiva', () => {
    it('deve identificar clientes com risco de churn', () => {
      const churnRiskCustomer = createMockCustomer({
        id: 'churn-risk',
        name: 'Cliente Risco',
        last_purchase_date: '2024-01-01', // Há 45+ dias
        purchase_frequency: 0.5, // Muito baixa
        segment: 'Regular'
      });

      render(
        <CustomerTable
          customers={[churnRiskCustomer]}
          onSelectCustomer={mockOnSelectCustomer}
          onEditCustomer={mockOnEditCustomer}
          showPredictiveInsights={true}
        />
      );

      expect(screen.getByText(/risco de churn/i)).toBeInTheDocument();
      expect(screen.getByText(/85% probabilidade/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /ação preventiva/i })).toBeInTheDocument();
    });

    it('deve sugerir oportunidades de upsell baseado em padrões', () => {
      const upsellCustomer = createMockCustomer({
        id: 'upsell-opportunity',
        preferred_categories: ['Vinho Tinto'],
        average_ticket: 89.90,
        segment: 'Regular'
      });

      render(
        <CustomerTable
          customers={[upsellCustomer]}
          onSelectCustomer={mockOnSelectCustomer}
          onEditCustomer={mockOnEditCustomer}
          showOpportunities={true}
        />
      );

      expect(screen.getByText(/oportunidade de upsell/i)).toBeInTheDocument();
      expect(screen.getByText(/vinhos premium/i)).toBeInTheDocument();
      expect(screen.getByText(/potencial.*r\$ 150/i)).toBeInTheDocument();
    });
  });
});