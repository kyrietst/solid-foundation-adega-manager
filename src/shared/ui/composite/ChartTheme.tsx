/**
 * ChartTheme - Sistema de cores centralizado para gráficos
 *
 * Padroniza as cores dos gráficos usando tokens HSL do design system
 * para manter consistência visual em toda a aplicação.
 */

/**
 * Paleta principal de cores para gráficos
 * Usa os tokens HSL definidos no tailwind.config.ts
 */
export const chartColors = {
  primary: 'hsl(var(--accent-blue))', // #3b82f6 - Azul principal
  success: 'hsl(var(--accent-green))', // #10b981 - Verde
  warning: 'hsl(var(--accent-orange))', // #f97316 - Laranja
  danger: 'hsl(var(--accent-red))', // #ef4444 - Vermelho
  info: 'hsl(var(--accent-purple))', // #8b5cf6 - Roxo
  secondary: 'hsl(var(--primary-yellow))', // #FFD700 - Amarelo principal

  // Cores complementares para diversidade visual
  cyan: '#06b6d4',
  amber: '#f59e0b',
  lime: '#84cc16',
  indigo: '#6366f1',
  pink: '#ec4899',
  teal: '#14b8a6',
} as const;

/**
 * Arrays de cores pré-definidos para diferentes tipos de gráficos
 */
export const chartTheme = {
  /**
   * Paleta padrão para gráficos gerais
   * Ordem otimizada para máximo contraste visual
   */
  default: [
    chartColors.primary,   // Azul
    chartColors.success,   // Verde
    chartColors.warning,   // Laranja
    chartColors.info,      // Roxo
    chartColors.danger,    // Vermelho
    chartColors.cyan,      // Ciano
    chartColors.amber,     // Âmbar
    chartColors.lime,      // Lima
  ],

  /**
   * Paleta para gráficos financeiros
   * Cores que transmitem confiança e profissionalismo
   */
  financial: [
    chartColors.success,   // Verde - Positivo/Receita
    chartColors.warning,   // Laranja - Atenção/Despesas
    chartColors.danger,    // Vermelho - Negativo/Perdas
    chartColors.primary,   // Azul - Neutro/Informativo
    chartColors.info,      // Roxo - Especial
  ],

  /**
   * Paleta para análise de vendas
   * Cores vibrantes para destacar performance
   */
  sales: [
    chartColors.amber,     // Âmbar - Bebida Mista
    chartColors.primary,   // Azul - Cerveja
    chartColors.success,   // Verde - Bebidas Quentes
    chartColors.info,      // Roxo - Refrigerante
    chartColors.warning,   // Laranja - Whisky
    chartColors.danger,    // Vermelho - Vinho
    chartColors.cyan,      // Ciano - Outras categorias
  ],

  /**
   * Paleta para CRM e segmentação
   * Cores que diferenciam tipos de clientes
   */
  crm: [
    chartColors.amber,     // Dourado - Clientes Premium
    chartColors.success,   // Verde - Clientes Ativos
    chartColors.primary,   // Azul - Clientes Regulares
    chartColors.info,      // Roxo - Novos Clientes
    chartColors.warning,   // Laranja - Clientes em Risco
    chartColors.danger,    // Vermelho - Clientes Inativos
  ],

  /**
   * Paleta para delivery e logística
   * Cores que representam status e zonas
   */
  delivery: [
    chartColors.primary,   // Azul - Em transporte
    chartColors.success,   // Verde - Entregue
    chartColors.warning,   // Laranja - Pendente
    chartColors.danger,    // Vermelho - Problema
    chartColors.info,      // Roxo - Agendado
    chartColors.cyan,      // Ciano - Zonas especiais
  ],

  /**
   * Paleta para despesas e orçamento
   * Cores que comunicam impacto financeiro
   */
  expenses: [
    chartColors.danger,    // Vermelho - Alto impacto
    chartColors.primary,   // Azul - Médio impacto
    chartColors.success,   // Verde - Baixo impacto
    chartColors.info,      // Roxo - Categorias especiais
    chartColors.warning,   // Laranja - Atenção
    chartColors.cyan,      // Ciano - Outros
  ],
} as const;

/**
 * Configurações de estilo para componentes Recharts
 * Padroniza aparência dos elementos gráficos
 */
export const chartStyles = {
  /** Configurações para grid e eixos */
  grid: {
    stroke: 'hsl(var(--border))',
    strokeDasharray: '3 3',
    strokeOpacity: 0.3,
  },

  /** Configurações para eixos */
  axis: {
    stroke: 'hsl(var(--muted-foreground))',
    fontSize: 12,
    fontFamily: 'SF Pro Display, ui-sans-serif, system-ui',
  },

  /** Configurações para tooltips */
  tooltip: {
    contentStyle: {
      backgroundColor: 'hsl(var(--popover))',
      border: '1px solid hsl(var(--border))',
      borderRadius: '8px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      color: 'hsl(var(--popover-foreground))',
      fontSize: '14px',
      fontFamily: 'SF Pro Display, ui-sans-serif, system-ui',
    },
    cursor: false,
  },

  /** Configurações para legendas */
  legend: {
    iconType: 'circle' as const,
    wrapperStyle: {
      fontSize: '14px',
      fontFamily: 'SF Pro Display, ui-sans-serif, system-ui',
      color: 'hsl(var(--muted-foreground))',
    },
  },
} as const;

/**
 * Utilitário para obter uma cor específica por índice
 * Garante que sempre haverá uma cor disponível (com wrap-around)
 */
export const getChartColor = (index: number, palette: keyof typeof chartTheme = 'default'): string => {
  const colors = chartTheme[palette];
  return colors[index % colors.length];
};

/**
 * Utilitário para obter múltiplas cores de uma paleta
 * Útil para gráficos que precisam de um número específico de cores
 */
export const getChartColors = (count: number, palette: keyof typeof chartTheme = 'default'): string[] => {
  const colors = chartTheme[palette];
  const result: string[] = [];

  for (let i = 0; i < count; i++) {
    result.push(colors[i % colors.length]);
  }

  return result;
};

/**
 * Type exports para TypeScript
 */
export type ChartPalette = keyof typeof chartTheme;
export type ChartColorKey = keyof typeof chartColors;