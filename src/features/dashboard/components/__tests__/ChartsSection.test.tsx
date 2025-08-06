import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { ChartsSection } from '../ChartsSection';
import { SalesDataPoint } from '../../hooks/useDashboardData';

// Mock data - dados de vendas realistas
const mockSalesData: SalesDataPoint[] = [
  {
    month: 'Janeiro',
    vendas: 25,
    formatted: 'Jan 2024: 25 vendas'
  },
  {
    month: 'Fevereiro',
    vendas: 32,
    formatted: 'Fev 2024: 32 vendas'
  },
  {
    month: 'Março',
    vendas: 18,
    formatted: 'Mar 2024: 18 vendas'
  },
  {
    month: 'Abril',
    vendas: 41,
    formatted: 'Abr 2024: 41 vendas'
  },
  {
    month: 'Maio',
    vendas: 35,
    formatted: 'Mai 2024: 35 vendas'
  },
  {
    month: 'Junho',
    vendas: 28,
    formatted: 'Jun 2024: 28 vendas'
  }
];

const mockEmptyData: SalesDataPoint[] = [];

// Mock components básicos
vi.mock('@/shared/ui/primitives/card', () => ({
  Card: ({ children, className }: any) => React.createElement('div', { className, 'data-testid': 'chart-card' }, children),
  CardHeader: ({ children }: any) => React.createElement('div', { 'data-testid': 'card-header' }, children),
  CardTitle: ({ children, className }: any) => React.createElement('h3', { className, 'data-testid': 'card-title' }, children),
  CardContent: ({ children, className }: any) => React.createElement('div', { className, 'data-testid': 'card-content' }, children)
}));

vi.mock('@/shared/ui/composite/loading-spinner', () => ({
  LoadingSpinner: ({ size }: any) => 
    React.createElement('div', { 
      'data-testid': 'loading-spinner',
      'data-size': size 
    }, 'Carregando gráficos...')
}));

// Mock Recharts components
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children, width, height }: any) => 
    React.createElement('div', { 
      'data-testid': 'responsive-container',
      'data-width': width,
      'data-height': height,
      style: { width, height: height + 'px' }
    }, children),
  
  BarChart: ({ data, children, ...props }: any) => 
    React.createElement('div', { 
      'data-testid': 'bar-chart',
      'data-chart-type': 'bar',
      'data-points': data?.length || 0,
      ...props
    }, [
      React.createElement('div', { key: 'data-summary' }, `Bar Chart: ${data?.length || 0} data points`),
      children
    ]),
  
  LineChart: ({ data, children, ...props }: any) => 
    React.createElement('div', { 
      'data-testid': 'line-chart',
      'data-chart-type': 'line',
      'data-points': data?.length || 0,
      ...props
    }, [
      React.createElement('div', { key: 'data-summary' }, `Line Chart: ${data?.length || 0} data points`),
      children
    ]),
  
  CartesianGrid: (props: any) => 
    React.createElement('div', { 
      'data-testid': 'cartesian-grid',
      'data-stroke': props.stroke,
      'data-stroke-dash': props.strokeDasharray
    }),
  
  XAxis: (props: any) => 
    React.createElement('div', { 
      'data-testid': 'x-axis',
      'data-key': props.dataKey,
      'data-stroke': props.stroke
    }),
  
  YAxis: (props: any) => 
    React.createElement('div', { 
      'data-testid': 'y-axis',
      'data-stroke': props.stroke
    }),
  
  Tooltip: (props: any) => 
    React.createElement('div', { 
      'data-testid': 'tooltip',
      'data-has-formatter': !!props.formatter,
      'data-has-label-formatter': !!props.labelFormatter
    }),
  
  Bar: (props: any) => 
    React.createElement('div', { 
      'data-testid': 'bar',
      'data-key': props.dataKey,
      'data-fill': props.fill
    }),
  
  Line: (props: any) => 
    React.createElement('div', { 
      'data-testid': 'line',
      'data-key': props.dataKey,
      'data-stroke': props.stroke,
      'data-type': props.type,
      'data-stroke-width': props.strokeWidth
    })
}));

// Test wrapper
const createWrapper = (queryClient: QueryClient) => {
  return ({ children }: { children: React.ReactNode }) => {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
};

describe('ChartsSection - Componente de Gráficos do Dashboard', () => {
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
    it('deve renderizar sem erros', () => {
      expect(() => {
        render(
          <ChartsSection salesData={mockSalesData} />,
          { wrapper: createWrapper(queryClient) }
        );
      }).not.toThrow();
    });

    it('deve renderizar dois cards de gráficos', () => {
      render(
        <ChartsSection salesData={mockSalesData} />,
        { wrapper: createWrapper(queryClient) }
      );

      const chartCards = screen.getAllByTestId('chart-card');
      expect(chartCards).toHaveLength(2);
    });

    it('deve ter títulos corretos para os gráficos', () => {
      render(
        <ChartsSection salesData={mockSalesData} />,
        { wrapper: createWrapper(queryClient) }
      );

      expect(screen.getByText('Vendas por Mês')).toBeInTheDocument();
      expect(screen.getByText('Tendência de Vendas')).toBeInTheDocument();
    });

    it('deve ter estrutura semântica adequada', () => {
      render(
        <ChartsSection salesData={mockSalesData} />,
        { wrapper: createWrapper(queryClient) }
      );

      const section = screen.getByRole('region');
      expect(section).toBeInTheDocument();
      expect(section).toHaveAttribute('aria-label', 'Gráficos de vendas');
    });

    it('deve ter layout em grid responsivo', () => {
      render(
        <ChartsSection salesData={mockSalesData} />,
        { wrapper: createWrapper(queryClient) }
      );

      const section = screen.getByRole('region');
      expect(section).toHaveClass(
        'grid',
        'grid-cols-1',
        'lg:grid-cols-2',
        'gap-6',
        'mt-8'
      );
    });
  });

  describe('Estados de loading', () => {
    it('deve exibir loading quando isLoading=true', () => {
      render(
        <ChartsSection 
          salesData={[]} 
          isLoading={true} 
        />,
        { wrapper: createWrapper(queryClient) }
      );

      const loadingSpinners = screen.getAllByTestId('loading-spinner');
      expect(loadingSpinners).toHaveLength(2);
      
      loadingSpinners.forEach(spinner => {
        expect(spinner).toHaveTextContent('Carregando gráficos...');
        expect(spinner).toHaveAttribute('data-size', 'lg');
      });
    });

    it('deve manter estrutura de cards durante loading', () => {
      render(
        <ChartsSection 
          salesData={[]} 
          isLoading={true} 
        />,
        { wrapper: createWrapper(queryClient) }
      );

      const chartCards = screen.getAllByTestId('chart-card');
      expect(chartCards).toHaveLength(2);

      // Títulos devem estar presentes
      expect(screen.getByText('Vendas por Mês')).toBeInTheDocument();
      expect(screen.getByText('Tendência de Vendas')).toBeInTheDocument();
    });

    it('não deve exibir gráficos durante loading', () => {
      render(
        <ChartsSection 
          salesData={mockSalesData} 
          isLoading={true} 
        />,
        { wrapper: createWrapper(queryClient) }
      );

      expect(screen.queryByTestId('bar-chart')).not.toBeInTheDocument();
      expect(screen.queryByTestId('line-chart')).not.toBeInTheDocument();
    });

    it('deve exibir gráficos quando não está carregando', () => {
      render(
        <ChartsSection 
          salesData={mockSalesData} 
          isLoading={false} 
        />,
        { wrapper: createWrapper(queryClient) }
      );

      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });
  });

  describe('Renderização de gráficos', () => {
    it('deve renderizar gráfico de barras com dados corretos', () => {
      render(
        <ChartsSection salesData={mockSalesData} />,
        { wrapper: createWrapper(queryClient) }
      );

      const barChart = screen.getByTestId('bar-chart');
      expect(barChart).toBeInTheDocument();
      expect(barChart).toHaveAttribute('data-points', '6');
      expect(barChart).toHaveTextContent('Bar Chart: 6 data points');
    });

    it('deve renderizar gráfico de linha com dados corretos', () => {
      render(
        <ChartsSection salesData={mockSalesData} />,
        { wrapper: createWrapper(queryClient) }
      );

      const lineChart = screen.getByTestId('line-chart');
      expect(lineChart).toBeInTheDocument();
      expect(lineChart).toHaveAttribute('data-points', '6');
      expect(lineChart).toHaveTextContent('Line Chart: 6 data points');
    });

    it('deve configurar ResponsiveContainer corretamente', () => {
      render(
        <ChartsSection salesData={mockSalesData} />,
        { wrapper: createWrapper(queryClient) }
      );

      const containers = screen.getAllByTestId('responsive-container');
      expect(containers).toHaveLength(2);
      
      containers.forEach(container => {
        expect(container).toHaveAttribute('data-width', '100%');
        expect(container).toHaveAttribute('data-height', '300');
      });
    });

    it('deve configurar eixos dos gráficos', () => {
      render(
        <ChartsSection salesData={mockSalesData} />,
        { wrapper: createWrapper(queryClient) }
      );

      // Cada gráfico deve ter um eixo X e Y
      const xAxes = screen.getAllByTestId('x-axis');
      const yAxes = screen.getAllByTestId('y-axis');
      
      expect(xAxes).toHaveLength(2);
      expect(yAxes).toHaveLength(2);

      xAxes.forEach(axis => {
        expect(axis).toHaveAttribute('data-key', 'month');
        expect(axis).toHaveAttribute('data-stroke', '#9CA3AF');
      });

      yAxes.forEach(axis => {
        expect(axis).toHaveAttribute('data-stroke', '#9CA3AF');
      });
    });

    it('deve configurar CartesianGrid', () => {
      render(
        <ChartsSection salesData={mockSalesData} />,
        { wrapper: createWrapper(queryClient) }
      );

      const grids = screen.getAllByTestId('cartesian-grid');
      expect(grids).toHaveLength(2);
      
      grids.forEach(grid => {
        expect(grid).toHaveAttribute('data-stroke', '#374151');
        expect(grid).toHaveAttribute('data-stroke-dash', '3 3');
      });
    });

    it('deve configurar tooltips com formatação', () => {
      render(
        <ChartsSection salesData={mockSalesData} />,
        { wrapper: createWrapper(queryClient) }
      );

      const tooltips = screen.getAllByTestId('tooltip');
      expect(tooltips).toHaveLength(2);
      
      tooltips.forEach(tooltip => {
        expect(tooltip).toHaveAttribute('data-has-formatter', 'true');
        expect(tooltip).toHaveAttribute('data-has-label-formatter', 'true');
      });
    });
  });

  describe('Estilos e customização dos gráficos', () => {
    it('deve configurar barra com gradiente roxo', () => {
      render(
        <ChartsSection salesData={mockSalesData} />,
        { wrapper: createWrapper(queryClient) }
      );

      const bar = screen.getByTestId('bar');
      expect(bar).toHaveAttribute('data-key', 'vendas');
      expect(bar).toHaveAttribute('data-fill', 'url(#purpleGradient)');
    });

    it('deve configurar linha com estilo verde', () => {
      render(
        <ChartsSection salesData={mockSalesData} />,
        { wrapper: createWrapper(queryClient) }
      );

      const line = screen.getByTestId('line');
      expect(line).toHaveAttribute('data-key', 'vendas');
      expect(line).toHaveAttribute('data-stroke', '#10B981');
      expect(line).toHaveAttribute('data-type', 'monotone');
      expect(line).toHaveAttribute('data-stroke-width', '4');
    });

    it('deve aplicar classes de tema Adega nos cards', () => {
      render(
        <ChartsSection salesData={mockSalesData} />,
        { wrapper: createWrapper(queryClient) }
      );

      const chartCards = screen.getAllByTestId('chart-card');
      chartCards.forEach(card => {
        expect(card).toHaveClass(
          'bg-adega-charcoal/20',
          'border-white/10',
          'backdrop-blur-xl',
          'shadow-xl'
        );
      });
    });

    it('deve aplicar cor amarela nos títulos', () => {
      render(
        <ChartsSection salesData={mockSalesData} />,
        { wrapper: createWrapper(queryClient) }
      );

      const titles = screen.getAllByTestId('card-title');
      titles.forEach(title => {
        expect(title).toHaveClass('text-adega-yellow');
      });
    });
  });

  describe('Dados alternativos para acessibilidade', () => {
    it('deve ter descrições ARIA para gráficos', () => {
      render(
        <ChartsSection salesData={mockSalesData} />,
        { wrapper: createWrapper(queryClient) }
      );

      // Gráfico de barras
      const barChartImg = screen.getByLabelText(/gráfico de barras mostrando vendas por mês/i);
      expect(barChartImg).toBeInTheDocument();
      expect(barChartImg).toHaveAttribute('role', 'img');
      expect(barChartImg).toHaveAttribute('aria-label', 'Gráfico de barras mostrando vendas por mês. Total de 6 meses com dados.');

      // Gráfico de linha
      const lineChartImg = screen.getByLabelText(/gráfico de linha mostrando tendência/i);
      expect(lineChartImg).toBeInTheDocument();
      expect(lineChartImg).toHaveAttribute('role', 'img');
      expect(lineChartImg).toHaveAttribute('aria-label', 'Gráfico de linha mostrando tendência de vendas ao longo de 6 meses.');
    });

    it('deve fornecer dados tabulares ocultos para screen readers', () => {
      render(
        <ChartsSection salesData={mockSalesData} />,
        { wrapper: createWrapper(queryClient) }
      );

      // Dados tabulares do gráfico de barras
      expect(screen.getByText('Dados tabulares das vendas por mês:')).toBeInTheDocument();
      expect(screen.getByText('Janeiro: 25 vendas')).toBeInTheDocument();
      expect(screen.getByText('Fevereiro: 32 vendas')).toBeInTheDocument();
      expect(screen.getByText('Março: 18 vendas')).toBeInTheDocument();

      // Dados tabulares do gráfico de linha
      expect(screen.getByText('Dados tabulares da tendência de vendas:')).toBeInTheDocument();
      expect(screen.getByText('Abril: 41 vendas')).toBeInTheDocument();
      expect(screen.getByText('Maio: 35 vendas')).toBeInTheDocument();
      expect(screen.getByText('Junho: 28 vendas')).toBeInTheDocument();
    });

    it('deve ter elementos sr-only com estrutura correta', () => {
      render(
        <ChartsSection salesData={mockSalesData} />,
        { wrapper: createWrapper(queryClient) }
      );

      const srOnlyElements = document.querySelectorAll('.sr-only');
      expect(srOnlyElements).toHaveLength(2);

      srOnlyElements.forEach(element => {
        expect(element.querySelector('h4')).toBeInTheDocument();
        expect(element.querySelector('ul')).toBeInTheDocument();
        expect(element.querySelectorAll('li')).toHaveLength(6); // 6 meses de dados
      });
    });

    it('deve adaptar descrições baseadas na quantidade de dados', () => {
      // Teste com menos dados
      const limitedData = mockSalesData.slice(0, 3);
      
      render(
        <ChartsSection salesData={limitedData} />,
        { wrapper: createWrapper(queryClient) }
      );

      expect(screen.getByLabelText('Gráfico de barras mostrando vendas por mês. Total de 3 meses com dados.')).toBeInTheDocument();
      expect(screen.getByLabelText('Gráfico de linha mostrando tendência de vendas ao longo de 3 meses.')).toBeInTheDocument();
    });
  });

  describe('Responsividade em mobile', () => {
    it('deve ter layout empilhado em telas pequenas', () => {
      render(
        <ChartsSection salesData={mockSalesData} />,
        { wrapper: createWrapper(queryClient) }
      );

      const section = screen.getByRole('region');
      expect(section).toHaveClass('grid-cols-1');
    });

    it('deve ter layout lado a lado em telas grandes', () => {
      render(
        <ChartsSection salesData={mockSalesData} />,
        { wrapper: createWrapper(queryClient) }
      );

      const section = screen.getByRole('region');
      expect(section).toHaveClass('lg:grid-cols-2');
    });

    it('deve ter altura fixa para gráficos', () => {
      render(
        <ChartsSection salesData={mockSalesData} />,
        { wrapper: createWrapper(queryClient) }
      );

      const containers = screen.getAllByTestId('responsive-container');
      containers.forEach(container => {
        expect(container.style.height).toBe('300px');
      });
    });

    it('deve ser responsive em largura', () => {
      render(
        <ChartsSection salesData={mockSalesData} />,
        { wrapper: createWrapper(queryClient) }
      );

      const containers = screen.getAllByTestId('responsive-container');
      containers.forEach(container => {
        expect(container.style.width).toBe('100%');
      });
    });
  });

  describe('Estados de erro de dados', () => {
    it('deve lidar com dados vazios graciosamente', () => {
      render(
        <ChartsSection salesData={mockEmptyData} />,
        { wrapper: createWrapper(queryClient) }
      );

      // Deve renderizar estrutura, mas com 0 pontos de dados
      const barChart = screen.getByTestId('bar-chart');
      const lineChart = screen.getByTestId('line-chart');
      
      expect(barChart).toHaveAttribute('data-points', '0');
      expect(lineChart).toHaveAttribute('data-points', '0');
    });

    it('deve adaptar descrições ARIA para dados vazios', () => {
      render(
        <ChartsSection salesData={mockEmptyData} />,
        { wrapper: createWrapper(queryClient) }
      );

      expect(screen.getByLabelText('Gráfico de barras mostrando vendas por mês. Total de 0 meses com dados.')).toBeInTheDocument();
      expect(screen.getByLabelText('Gráfico de linha mostrando tendência de vendas ao longo de 0 meses.')).toBeInTheDocument();
    });

    it('deve renderizar listas vazias para screen readers quando não há dados', () => {
      render(
        <ChartsSection salesData={mockEmptyData} />,
        { wrapper: createWrapper(queryClient) }
      );

      const srOnlyElements = document.querySelectorAll('.sr-only ul');
      srOnlyElements.forEach(list => {
        expect(list.children).toHaveLength(0);
      });
    });

    it('deve manter tooltips funcionais mesmo sem dados', () => {
      render(
        <ChartsSection salesData={mockEmptyData} />,
        { wrapper: createWrapper(queryClient) }
      );

      const tooltips = screen.getAllByTestId('tooltip');
      expect(tooltips).toHaveLength(2);
      
      tooltips.forEach(tooltip => {
        expect(tooltip).toHaveAttribute('data-has-formatter', 'true');
        expect(tooltip).toHaveAttribute('data-has-label-formatter', 'true');
      });
    });
  });

  describe('Performance e otimização', () => {
    it('deve usar ResponsiveContainer para otimização', () => {
      render(
        <ChartsSection salesData={mockSalesData} />,
        { wrapper: createWrapper(queryClient) }
      );

      const containers = screen.getAllByTestId('responsive-container');
      expect(containers).toHaveLength(2);
    });

    it('deve ter altura fixa para evitar reflows', () => {
      // Teste com loading para verificar altura fixa
      render(
        <ChartsSection salesData={mockSalesData} isLoading={true} />,
        { wrapper: createWrapper(queryClient) }
      );

      const loadingContents = screen.getAllByTestId('card-content');
      loadingContents.forEach(content => {
        expect(content).toHaveClass('flex', 'items-center', 'justify-center', 'h-[300px]');
      });
    });
  });

  describe('TypeScript e tipos', () => {
    it('deve aceitar interface ChartsSectionProps corretamente', () => {
      const props = {
        salesData: mockSalesData,
        isLoading: false
      };

      expect(() => {
        render(
          <ChartsSection {...props} />,
          { wrapper: createWrapper(queryClient) }
        );
      }).not.toThrow();
    });

    it('deve usar tipos SalesDataPoint para dados', () => {
      render(
        <ChartsSection salesData={mockSalesData} />,
        { wrapper: createWrapper(queryClient) }
      );

      // Se renderiza sem erro, os tipos estão corretos
      expect(screen.getByRole('region')).toBeInTheDocument();
    });

    it('deve ter isLoading opcional com padrão false', () => {
      render(
        <ChartsSection salesData={mockSalesData} />,
        { wrapper: createWrapper(queryClient) }
      );

      // Não deve mostrar loading quando isLoading não especificado
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });
  });

  describe('Temas e cores específicas', () => {
    it('deve usar gradiente roxo para barras', () => {
      render(
        <ChartsSection salesData={mockSalesData} />,
        { wrapper: createWrapper(queryClient) }
      );

      const barChart = screen.getByTestId('bar-chart');
      expect(barChart).toBeInTheDocument();
      // Gradiente definido no SVG defs, testado via data-fill
      const bar = screen.getByTestId('bar');
      expect(bar).toHaveAttribute('data-fill', 'url(#purpleGradient)');
    });

    it('deve usar verde para linha de tendência', () => {
      render(
        <ChartsSection salesData={mockSalesData} />,
        { wrapper: createWrapper(queryClient) }
      );

      const line = screen.getByTestId('line');
      expect(line).toHaveAttribute('data-stroke', '#10B981');
    });

    it('deve usar cores consistentes da paleta do sistema', () => {
      render(
        <ChartsSection salesData={mockSalesData} />,
        { wrapper: createWrapper(queryClient) }
      );

      // Verificar cores dos eixos (cinza)
      const axes = screen.getAllByTestId(/axis/);
      axes.forEach(axis => {
        expect(axis).toHaveAttribute('data-stroke', '#9CA3AF');
      });

      // Verificar cor do grid (cinza mais escuro)
      const grids = screen.getAllByTestId('cartesian-grid');
      grids.forEach(grid => {
        expect(grid).toHaveAttribute('data-stroke', '#374151');
      });
    });
  });
});