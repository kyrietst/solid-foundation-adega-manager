import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { MetricsGrid } from '../MetricsGrid';
import { MetricCard } from '../hooks/useDashboardMetrics';
import { DollarSign, Users, Package, TrendingUp, Star, Truck, Percent, TrendingDown } from 'lucide-react';

// Mock data - métricas realistas
const mockPublicMetrics: MetricCard[] = [
  {
    title: 'Total de Clientes',
    value: '125',
    icon: Users,
    description: '125 clientes ativos',
    variant: 'success'
  },
  {
    title: 'Clientes VIP',
    value: '18',
    icon: Star,
    description: '18 clientes premium',
    variant: 'success'
  },
  {
    title: 'Produtos em Estoque',
    value: '342',
    icon: Package,
    description: '342 produtos disponíveis',
    variant: 'success'
  },
  {
    title: 'Entregas Pendentes',
    value: '7',
    icon: Truck,
    description: '7 entregas aguardando',
    variant: 'warning'
  }
];

const mockSensitiveMetrics: MetricCard[] = [
  {
    title: 'Faturamento Total',
    value: 'R$ 45.320,75',
    icon: DollarSign,
    description: 'R$ 45.320,75 este mês',
    variant: 'success'
  },
  {
    title: 'Lucro Líquido',
    value: 'R$ 15.890,25',
    icon: TrendingUp,
    description: 'R$ 15.890,25 de lucro',
    variant: 'success'
  },
  {
    title: 'Margem de Lucro',
    value: '35.1%',
    icon: Percent,
    description: '35.1% de margem',
    variant: 'success'
  },
  {
    title: 'Custos Operacionais',
    value: 'R$ 29.430,50',
    icon: TrendingDown,
    description: 'R$ 29.430,50 em custos',
    variant: 'default'
  }
];

const mockCriticalMetrics: MetricCard[] = [
  {
    title: 'Produtos em Estoque',
    value: '2',
    icon: Package,
    description: '2 produtos disponíveis',
    variant: 'error'
  },
  {
    title: 'Entregas Pendentes',
    value: '15',
    icon: Truck,
    description: '15 entregas aguardando',
    variant: 'error'
  },
  {
    title: 'Margem de Lucro',
    value: '8.5%',
    icon: Percent,
    description: '8.5% de margem',
    variant: 'error'
  }
];

// Mock components básicos
vi.mock('@/shared/ui/primitives/card', () => ({
  Card: ({ children, className, role, ...props }: any) => 
    React.createElement('div', { 
      className, 
      role: role || 'article',
      'data-testid': 'metric-card',
      ...props
    }, children),
  CardHeader: ({ children, className }: any) => 
    React.createElement('div', { className, 'data-testid': 'card-header' }, children),
  CardTitle: ({ children, className, id }: any) => 
    React.createElement('h4', { className, id, 'data-testid': 'card-title' }, children),
  CardContent: ({ children, className }: any) => 
    React.createElement('div', { className, 'data-testid': 'card-content' }, children)
}));

vi.mock('@/shared/ui/composite/loading-spinner', () => ({
  LoadingSpinner: ({ size }: any) => 
    React.createElement('div', { 
      'data-testid': 'loading-spinner',
      'data-size': size 
    }, 'Carregando métricas...')
}));

// Mock icons do lucide-react
vi.mock('lucide-react', () => ({
  DollarSign: (props: any) => React.createElement('svg', { ...props, 'data-testid': 'dollar-icon' }, 'DollarSign'),
  Users: (props: any) => React.createElement('svg', { ...props, 'data-testid': 'users-icon' }, 'Users'),
  Package: (props: any) => React.createElement('svg', { ...props, 'data-testid': 'package-icon' }, 'Package'),
  TrendingUp: (props: any) => React.createElement('svg', { ...props, 'data-testid': 'trending-up-icon' }, 'TrendingUp'),
  Star: (props: any) => React.createElement('svg', { ...props, 'data-testid': 'star-icon' }, 'Star'),
  Truck: (props: any) => React.createElement('svg', { ...props, 'data-testid': 'truck-icon' }, 'Truck'),
  Percent: (props: any) => React.createElement('svg', { ...props, 'data-testid': 'percent-icon' }, 'Percent'),
  TrendingDown: (props: any) => React.createElement('svg', { ...props, 'data-testid': 'trending-down-icon' }, 'TrendingDown')
}));

// Test wrapper
const createWrapper = (queryClient: QueryClient) => {
  return ({ children }: { children: React.ReactNode }) => {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
};

describe('MetricsGrid - Componente de Dashboard', () => {
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
          <MetricsGrid metrics={mockPublicMetrics} />,
          { wrapper: createWrapper(queryClient) }
        );
      }).not.toThrow();
    });

    it('deve renderizar título quando fornecido', () => {
      render(
        <MetricsGrid 
          metrics={mockPublicMetrics} 
          title="Métricas Gerais" 
        />,
        { wrapper: createWrapper(queryClient) }
      );

      const title = screen.getByText('Métricas Gerais');
      expect(title).toBeInTheDocument();
      expect(title.tagName).toBe('H3');
      expect(title).toHaveAttribute('id', 'metrics-title');
    });

    it('não deve renderizar título quando não fornecido', () => {
      render(
        <MetricsGrid metrics={mockPublicMetrics} />,
        { wrapper: createWrapper(queryClient) }
      );

      // Não deve ter o título H3 principal
      expect(screen.queryByRole('heading', { level: 3 })).not.toBeInTheDocument();
      // Mas deve ter os títulos H4 dos cards (que são headings também)
      expect(screen.getAllByRole('heading', { level: 4 })).toHaveLength(4);
    });

    it('deve renderizar todas as métricas fornecidas', () => {
      render(
        <MetricsGrid metrics={mockPublicMetrics} />,
        { wrapper: createWrapper(queryClient) }
      );

      expect(screen.getAllByTestId('metric-card')).toHaveLength(4);
      expect(screen.getByText('Total de Clientes')).toBeInTheDocument();
      expect(screen.getByText('Clientes VIP')).toBeInTheDocument();
      expect(screen.getByText('Produtos em Estoque')).toBeInTheDocument();
      expect(screen.getByText('Entregas Pendentes')).toBeInTheDocument();
    });
  });

  describe('Estados de loading', () => {
    it('deve exibir loading quando isLoading=true', () => {
      render(
        <MetricsGrid 
          metrics={[]} 
          isLoading={true} 
        />,
        { wrapper: createWrapper(queryClient) }
      );

      const loadingSpinner = screen.getByTestId('loading-spinner');
      expect(loadingSpinner).toBeInTheDocument();
      expect(loadingSpinner).toHaveTextContent('Carregando métricas...');
      expect(loadingSpinner).toHaveAttribute('data-size', 'lg');

      // Métricas não devem estar presentes durante loading
      expect(screen.queryByTestId('metric-card')).not.toBeInTheDocument();
    });

    it('não deve exibir loading quando isLoading=false', () => {
      render(
        <MetricsGrid 
          metrics={mockPublicMetrics} 
          isLoading={false} 
        />,
        { wrapper: createWrapper(queryClient) }
      );

      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      expect(screen.getAllByTestId('metric-card')).toHaveLength(4);
    });

    it('deve exibir grid vazio quando não há métricas e não está carregando', () => {
      render(
        <MetricsGrid 
          metrics={[]} 
          isLoading={false} 
        />,
        { wrapper: createWrapper(queryClient) }
      );

      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      expect(screen.queryByTestId('metric-card')).not.toBeInTheDocument();
      
      // Grid container deve estar presente mas vazio
      const grid = screen.getByRole('group', { name: /métricas do dashboard/i });
      expect(grid).toBeInTheDocument();
    });
  });

  describe('Exibição de métricas corretas', () => {
    it('deve exibir valores formatados corretamente', () => {
      render(
        <MetricsGrid metrics={mockSensitiveMetrics} />,
        { wrapper: createWrapper(queryClient) }
      );

      // Verificar formatação monetária
      expect(screen.getByText('R$ 45.320,75')).toBeInTheDocument();
      expect(screen.getByText('R$ 15.890,25')).toBeInTheDocument();
      expect(screen.getByText('R$ 29.430,50')).toBeInTheDocument();

      // Verificar formatação de porcentagem
      expect(screen.getByText('35.1%')).toBeInTheDocument();
    });

    it('deve exibir ícones apropriados para cada métrica', () => {
      render(
        <MetricsGrid metrics={mockPublicMetrics} />,
        { wrapper: createWrapper(queryClient) }
      );

      expect(screen.getByTestId('users-icon')).toBeInTheDocument();
      expect(screen.getByTestId('star-icon')).toBeInTheDocument();
      expect(screen.getByTestId('package-icon')).toBeInTheDocument();
      expect(screen.getByTestId('truck-icon')).toBeInTheDocument();
    });

    it('deve exibir descrições detalhadas', () => {
      render(
        <MetricsGrid metrics={mockPublicMetrics} />,
        { wrapper: createWrapper(queryClient) }
      );

      expect(screen.getByText('125 clientes ativos')).toBeInTheDocument();
      expect(screen.getByText('18 clientes premium')).toBeInTheDocument();
      expect(screen.getByText('342 produtos disponíveis')).toBeInTheDocument();
      expect(screen.getByText('7 entregas aguardando')).toBeInTheDocument();
    });

    it('deve aplicar cores baseadas nas variantes', () => {
      render(
        <MetricsGrid metrics={mockCriticalMetrics} />,
        { wrapper: createWrapper(queryClient) }
      );

      const cards = screen.getAllByTestId('metric-card');
      
      // Verificar se as classes de borda estão sendo aplicadas
      expect(cards[0]).toHaveClass('border-red-400/20'); // error variant
      expect(cards[1]).toHaveClass('border-red-400/20'); // error variant
      expect(cards[2]).toHaveClass('border-red-400/20'); // error variant
    });
  });

  describe('Formatação monetária', () => {
    it('deve formatar valores monetários brasileiros', () => {
      render(
        <MetricsGrid metrics={mockSensitiveMetrics} />,
        { wrapper: createWrapper(queryClient) }
      );

      // Verificar padrão monetário brasileiro (R$ X.XXX,XX)
      expect(screen.getByText('R$ 45.320,75')).toBeInTheDocument();
      expect(screen.getByText('R$ 15.890,25')).toBeInTheDocument();
      expect(screen.getByText('R$ 29.430,50')).toBeInTheDocument();
    });

    it('deve manter precisão decimal', () => {
      const precisenessMetrics: MetricCard[] = [
        {
          title: 'Valor Preciso',
          value: 'R$ 1.234,56',
          icon: DollarSign,
          description: 'Valor com precisão decimal',
          variant: 'default'
        }
      ];

      render(
        <MetricsGrid metrics={precisenessMetrics} />,
        { wrapper: createWrapper(queryClient) }
      );

      expect(screen.getByText('R$ 1.234,56')).toBeInTheDocument();
    });

    it('deve formatar porcentagens corretamente', () => {
      const percentageMetrics: MetricCard[] = [
        {
          title: 'Taxa de Conversão',
          value: '15.7%',
          icon: Percent,
          description: 'Taxa de conversão',
          variant: 'success'
        }
      ];

      render(
        <MetricsGrid metrics={percentageMetrics} />,
        { wrapper: createWrapper(queryClient) }
      );

      expect(screen.getByText('15.7%')).toBeInTheDocument();
    });
  });

  describe('Variantes de cores e status', () => {
    it('deve aplicar variante success corretamente', () => {
      const successMetrics: MetricCard[] = [
        {
          title: 'Métrica Positiva',
          value: '100',
          icon: TrendingUp,
          description: 'Tudo bem',
          variant: 'success'
        }
      ];

      render(
        <MetricsGrid metrics={successMetrics} />,
        { wrapper: createWrapper(queryClient) }
      );

      const card = screen.getByTestId('metric-card');
      expect(card).toHaveClass('border-green-400/20');
      
      const icon = screen.getByTestId('trending-up-icon');
      expect(icon).toHaveClass('text-green-400');
    });

    it('deve aplicar variante warning corretamente', () => {
      const warningMetrics: MetricCard[] = [
        {
          title: 'Métrica de Atenção',
          value: '50',
          icon: Package,
          description: 'Requer atenção',
          variant: 'warning'
        }
      ];

      render(
        <MetricsGrid metrics={warningMetrics} />,
        { wrapper: createWrapper(queryClient) }
      );

      const card = screen.getByTestId('metric-card');
      expect(card).toHaveClass('border-yellow-400/20');
      
      const icon = screen.getByTestId('package-icon');
      expect(icon).toHaveClass('text-yellow-400');
    });

    it('deve aplicar variante error corretamente', () => {
      const errorMetrics: MetricCard[] = [
        {
          title: 'Métrica Crítica',
          value: '0',
          icon: TrendingDown,
          description: 'Situação crítica',
          variant: 'error'
        }
      ];

      render(
        <MetricsGrid metrics={errorMetrics} />,
        { wrapper: createWrapper(queryClient) }
      );

      const card = screen.getByTestId('metric-card');
      expect(card).toHaveClass('border-red-400/20');
      
      const icon = screen.getByTestId('trending-down-icon');
      expect(icon).toHaveClass('text-red-400');
    });

    it('deve usar variante default quando não especificada', () => {
      const defaultMetrics: MetricCard[] = [
        {
          title: 'Métrica Padrão',
          value: '25',
          icon: DollarSign,
          description: 'Valor padrão'
          // variant não especificada
        }
      ];

      render(
        <MetricsGrid metrics={defaultMetrics} />,
        { wrapper: createWrapper(queryClient) }
      );

      const card = screen.getByTestId('metric-card');
      expect(card).toHaveClass('border-white/10');
      
      const icon = screen.getByTestId('dollar-icon');
      expect(icon).toHaveClass('text-adega-gold');
    });
  });

  describe('Acessibilidade', () => {
    it('deve ter estrutura semântica adequada', () => {
      render(
        <MetricsGrid 
          metrics={mockPublicMetrics} 
          title="Dashboard Metrics" 
        />,
        { wrapper: createWrapper(queryClient) }
      );

      // Deve ter região semântica
      const section = screen.getByRole('region');
      expect(section).toBeInTheDocument();
      expect(section).toHaveAttribute('aria-labelledby', 'metrics-title');

      // Deve ter grupo de métricas
      const group = screen.getByRole('group', { name: /métricas do dashboard/i });
      expect(group).toBeInTheDocument();

      // Cada métrica deve ser um artigo
      const articles = screen.getAllByRole('article');
      expect(articles).toHaveLength(4);
    });

    it('deve ter labels apropriados para screen readers', () => {
      render(
        <MetricsGrid metrics={mockPublicMetrics.slice(0, 1)} />,
        { wrapper: createWrapper(queryClient) }
      );

      const card = screen.getByRole('article');
      expect(card).toHaveAttribute('aria-labelledby', 'metric-title-0');
      expect(card).toHaveAttribute('aria-describedby', 'metric-desc-0');

      const title = screen.getByTestId('card-title');
      expect(title).toHaveAttribute('id', 'metric-title-0');

      const description = screen.getByText('125 clientes ativos');
      expect(description).toHaveAttribute('id', 'metric-desc-0');
    });

    it('deve ter ícones marcados como decorativos', () => {
      render(
        <MetricsGrid metrics={mockPublicMetrics.slice(0, 1)} />,
        { wrapper: createWrapper(queryClient) }
      );

      const icon = screen.getByTestId('users-icon');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });

    it('deve ter valores com aria-label descritivo', () => {
      render(
        <MetricsGrid metrics={mockPublicMetrics.slice(0, 1)} />,
        { wrapper: createWrapper(queryClient) }
      );

      const value = screen.getByText('125');
      expect(value).toHaveAttribute('aria-label', 'Valor: 125');
    });

    it('deve associar corretamente título e descrição para cada métrica', () => {
      render(
        <MetricsGrid metrics={mockPublicMetrics} />,
        { wrapper: createWrapper(queryClient) }
      );

      // Verificar todas as associações
      for (let i = 0; i < mockPublicMetrics.length; i++) {
        const card = screen.getAllByRole('article')[i];
        expect(card).toHaveAttribute('aria-labelledby', `metric-title-${i}`);
        expect(card).toHaveAttribute('aria-describedby', `metric-desc-${i}`);
      }
    });
  });

  describe('Grid responsivo', () => {
    it('deve ter classes responsivas para diferentes tamanhos', () => {
      render(
        <MetricsGrid metrics={mockPublicMetrics} />,
        { wrapper: createWrapper(queryClient) }
      );

      const grid = screen.getByRole('group');
      expect(grid).toHaveClass(
        'grid',
        'grid-cols-1',
        'md:grid-cols-2', 
        'lg:grid-cols-4',
        'gap-4'
      );
    });

    it('deve manter espaçamento adequado', () => {
      render(
        <MetricsGrid 
          metrics={mockPublicMetrics} 
          title="Métricas" 
        />,
        { wrapper: createWrapper(queryClient) }
      );

      const section = screen.getByRole('region');
      expect(section).toHaveClass('space-y-4');
    });
  });

  describe('Temas e estilos Adega', () => {
    it('deve aplicar tema escuro Adega corretamente', () => {
      render(
        <MetricsGrid metrics={mockPublicMetrics} />,
        { wrapper: createWrapper(queryClient) }
      );

      const cards = screen.getAllByTestId('metric-card');
      cards.forEach(card => {
        expect(card).toHaveClass(
          'bg-adega-charcoal/20',
          'backdrop-blur-xl',
          'shadow-xl',
          'hover:bg-adega-charcoal/30',
          'transition-all',
          'duration-300'
        );
      });
    });

    it('deve usar cores consistentes da paleta Adega', () => {
      render(
        <MetricsGrid 
          metrics={mockPublicMetrics} 
          title="Métricas Teste" 
        />,
        { wrapper: createWrapper(queryClient) }
      );

      // Título deve usar cor branca
      const title = screen.getByText('Métricas Teste');
      expect(title).toHaveClass('text-white');

      // Títulos de métricas devem usar adega-platinum
      const metricTitles = screen.getAllByTestId('card-title');
      metricTitles.forEach(title => {
        expect(title).toHaveClass('text-adega-platinum');
      });

      // Valores devem usar texto branco (somente os valores principais, não as descrições)
      const values = screen.getAllByLabelText(/^Valor:/);
      values.forEach(value => {
        expect(value).toHaveClass('text-white');
      });
    });
  });

  describe('Estados especiais', () => {
    it('deve lidar com métricas com valores zero', () => {
      const zeroMetrics: MetricCard[] = [
        {
          title: 'Valor Zero',
          value: '0',
          icon: Package,
          description: '0 itens',
          variant: 'error'
        }
      ];

      render(
        <MetricsGrid metrics={zeroMetrics} />,
        { wrapper: createWrapper(queryClient) }
      );

      expect(screen.getByText('0')).toBeInTheDocument();
      expect(screen.getByText('0 itens')).toBeInTheDocument();
    });

    it('deve lidar com valores muito grandes', () => {
      const largeMetrics: MetricCard[] = [
        {
          title: 'Valor Grande',
          value: 'R$ 1.234.567,89',
          icon: DollarSign,
          description: 'Valor muito alto',
          variant: 'success'
        }
      ];

      render(
        <MetricsGrid metrics={largeMetrics} />,
        { wrapper: createWrapper(queryClient) }
      );

      expect(screen.getByText('R$ 1.234.567,89')).toBeInTheDocument();
    });

    it('deve lidar com descrições longas', () => {
      const longDescMetrics: MetricCard[] = [
        {
          title: 'Métrica Complexa',
          value: '42',
          icon: Star,
          description: 'Esta é uma descrição muito longa que pode quebrar o layout se não for tratada adequadamente',
          variant: 'default'
        }
      ];

      render(
        <MetricsGrid metrics={longDescMetrics} />,
        { wrapper: createWrapper(queryClient) }
      );

      expect(screen.getByText(/esta é uma descrição muito longa/i)).toBeInTheDocument();
    });
  });

  describe('TypeScript e tipos', () => {
    it('deve aceitar interface MetricsGridProps corretamente', () => {
      const props = {
        metrics: mockPublicMetrics,
        isLoading: false,
        title: 'Test Title'
      };

      expect(() => {
        render(
          <MetricsGrid {...props} />,
          { wrapper: createWrapper(queryClient) }
        );
      }).not.toThrow();
    });

    it('deve usar interface MetricCard corretamente', () => {
      render(
        <MetricsGrid metrics={mockSensitiveMetrics} />,
        { wrapper: createWrapper(queryClient) }
      );

      // Se renderiza sem erro, os tipos estão corretos
      expect(screen.getAllByTestId('metric-card')).toHaveLength(4);
    });
  });
});