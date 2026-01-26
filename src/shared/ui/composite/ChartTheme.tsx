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
  primary: 'hsl(var(--brand))', // #FFD700 - Amarelo (Brand Principal)
  success: 'hsl(var(--accent-green))', // #10b981 - Verde
  warning: 'hsl(var(--accent-orange))', // #f97316 - Laranja
  danger: 'hsl(var(--accent-red))', // #ef4444 - Vermelho
  info: 'hsl(var(--accent-purple))', // #8b5cf6 - Roxo (Premium)
  secondary: '#06b6d4', // Ciano (Secundário)
  cyan: '#06b6d4', // Alias for dashboards

  // Cores complementares para diversidade visual
  blue: '#3b82f6', // Mantido apenas para fallback se necessário, mas evitado nas paletas principais
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
   * Prioridade: Visual Hierarchy (Amarelo -> Roxo -> Cores de Estado)
   */
  default: [
    chartColors.primary,   // Amarelo (Brand)
    chartColors.info,      // Roxo
    chartColors.secondary, // Ciano
    chartColors.success,   // Verde
    chartColors.warning,   // Laranja
    chartColors.danger,    // Vermelho
    chartColors.pink,
    chartColors.lime,
  ],

  /**
   * Paleta para gráficos financeiros
   * Cores que transmitem confiança e profissionalismo
   */
  financial: [
    chartColors.success,   // Verde - Positivo/Receita
    chartColors.danger,    // Vermelho - Negativo/Perdas
    chartColors.warning,   // Laranja - Atenção/Despesas
    chartColors.primary,   // Amarelo - Neutro/Informativo (Brand)
    chartColors.info,      // Roxo - Especial
  ],

  /**
   * Paleta para análise de vendas
   * Cores vibrantes para destacar performance
   */
  sales: [
    chartColors.primary,   // Amarelo - Destaque (ex: Cerveja/Top)
    chartColors.info,      // Roxo
    chartColors.secondary, // Ciano
    chartColors.success,   // Verde
    chartColors.warning,   // Laranja
    chartColors.danger,    // Vermelho
    chartColors.pink,      // Outras
  ],

  /**
   * Paleta para CRM e segmentação
   * Cores que diferenciam tipos de clientes
   */
  crm: [
    chartColors.primary,   // Amarelo - Clientes Premium
    chartColors.success,   // Verde - Clientes Ativos
    chartColors.info,      // Roxo - Clientes Regulares
    chartColors.secondary, // Ciano - Novos Clientes
    chartColors.warning,   // Laranja - Clientes em Risco
    chartColors.danger,    // Vermelho - Clientes Inativos
  ],

  /**
   * Paleta para delivery e logística
   * Cores que representam status e zonas
   */
  delivery: [
    chartColors.primary,   // Amarelo - Em transporte (Destaque)
    chartColors.success,   // Verde - Entregue
    chartColors.warning,   // Laranja - Pendente
    chartColors.danger,    // Vermelho - Problema
    chartColors.info,      // Roxo - Agendado
    chartColors.secondary, // Ciano - Zonas especiais
  ],

  /**
   * Paleta para despesas e orçamento
   * Cores que comunicam impacto financeiro
   */
  expenses: [
    chartColors.danger,    // Vermelho - Alto impacto
    chartColors.warning,   // Laranja - Médio impacto
    chartColors.success,   // Verde - Baixo impacto
    chartColors.primary,   // Amarelo - Destaque
    chartColors.info,      // Roxo - Categorias especiais
    chartColors.secondary, // Ciano - Outros
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