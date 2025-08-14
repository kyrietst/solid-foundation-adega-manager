/**
 * Sistema de Themes Adega - Utilitários para padronização de estilos
 * 
 * Baseado na paleta de cores Black to Yellow elegant gold progression
 * Analisado a partir de 925+ registros em produção
 */

// ============================================================================
// PALETA DE CORES ADEGA WINE CELLAR - Sistema Completo v2.1
// ============================================================================

// Cores Primárias - Base do Sistema
export const primaryColors = {
  'primary-black': '#000000',     // Cor primária preta
  'primary-yellow': '#FFD700',    // Cor primária amarela (gold)
} as const;

// Escalas Estendidas
export const extendedScales = {
  // Escala Black (100-60)
  'black-100': '#000000',
  'black-90': '#1a1a1a',
  'black-80': '#333333',
  'black-70': '#4a4a4a',
  'black-60': '#666666',
  
  // Escala Yellow (100-60)
  'yellow-100': '#FFD700',
  'yellow-90': '#FFC107',
  'yellow-80': '#FFB300',
  'yellow-70': '#FF8F00',
  'yellow-60': '#FF6F00',
} as const;

// Neutrals Profissionais (Tailwind-based)
export const professionalNeutrals = {
  'gray-950': '#030712',
  'gray-900': '#111827',
  'gray-800': '#1f2937',
  'gray-700': '#374151',
  'gray-600': '#4b5563',
  'gray-500': '#6b7280',
  'gray-400': '#9ca3af',
  'gray-300': '#d1d5db',
  'gray-200': '#e5e7eb',
  'gray-100': '#f3f4f6',
  'gray-50': '#f9fafb',
} as const;

// Acentos Modernos
export const modernAccents = {
  'accent-blue': '#3b82f6',
  'accent-green': '#10b981',
  'accent-red': '#ef4444',
  'accent-purple': '#8b5cf6',
  'accent-orange': '#f97316',
} as const;

// Variáveis Glass (RGBA)
export const glassVariables = {
  'glass-black': 'rgba(0, 0, 0, 0.8)',
  'glass-yellow': 'rgba(255, 215, 0, 0.1)',
  'glass-overlay': 'rgba(17, 24, 39, 0.9)',
} as const;

// Consolidação da Paleta Completa
export const adegaColors = {
  ...primaryColors,
  ...extendedScales,
  ...professionalNeutrals,
  ...modernAccents,
  // Mantém compatibilidade com o sistema anterior
  black: '#000000',
  charcoal: '#1a1a1a',
  graphite: '#2d2d2d',
  slate: '#404040',
  steel: '#595959',
  pewter: '#737373',
  silver: '#8c8c8c',
  platinum: '#a6a6a6',
  champagne: '#bfbf8c',
  gold: '#d4af37',
  amber: '#ffbf00',
  yellow: '#ffd700'
} as const;

// ============================================================================
// VARIANTES DE OPACIDADE PADRONIZADAS
// ============================================================================

export const opacityVariants = {
  // Backgrounds
  subtle: '5',       // bg-adega-charcoal/5 - Alerts muito sutis
  light: '10',       // bg-adega-charcoal/10 - Backgrounds leves
  card: '20',        // bg-adega-charcoal/20 - Cards padrão
  hover: '30',       // bg-adega-charcoal/30 - Hover states
  strong: '50',      // bg-adega-charcoal/50 - Seleções
  input: '60',       // bg-adega-charcoal/60 - Inputs de formulário
  overlay: '80',     // bg-adega-charcoal/80 - Overlays
  modal: '95',       // bg-adega-charcoal/95 - Modals/dropdowns
  
  // Borders
  borderSubtle: '10', // border-white/10 - Bordas sutis padrão
  borderNormal: '20', // border-white/20 - Bordas normais
  borderStrong: '30', // border-adega-amber/30 - Bordas enfatizadas
  borderAlert: '50'   // border-adega-amber/50 - Bordas de alerta
} as const;

// ============================================================================
// COMBINAÇÕES DE CORES SEMÂNTICAS
// ============================================================================

export const semanticColors = {
  // Estados principais
  primary: {
    text: 'text-adega-platinum',
    accent: 'text-adega-gold',
    background: 'bg-adega-charcoal/20',
    border: 'border-white/10'
  },
  
  // Estados secundários
  secondary: {
    text: 'text-adega-silver',
    accent: 'text-adega-silver',
    background: 'bg-adega-charcoal/10',
    border: 'border-white/10'
  },
  
  // Estados de sucesso
  success: {
    text: 'text-green-400',
    background: 'bg-green-500',
    border: 'border-green-500/20'
  },
  
  // Estados de warning
  warning: {
    text: 'text-adega-amber',
    accent: 'text-adega-amber',
    background: 'bg-adega-amber/5',
    border: 'border-adega-amber/30',
    strong: 'bg-adega-amber'
  },
  
  // Estados de erro
  error: {
    text: 'text-red-400',
    background: 'bg-red-500',
    border: 'border-red-500/20'
  },
  
  // Estados VIP/Premium
  premium: {
    text: 'text-purple-400',
    background: 'bg-purple-100',
    textContrast: 'text-purple-700',
    border: 'border-purple-200'
  }
} as const;

// ============================================================================
// PADRÕES DE COMPONENTES GLASS MORPHISM v2.1
// ============================================================================

export const componentPatterns = {
  // Cards padrão com Glass Morphism
  glassCard: [
    'bg-gray-900/80',
    'border',
    'border-gray-700',
    'backdrop-blur-xl',
    'shadow-xl',
    'rounded-lg'
  ].join(' '),
  
  // Cards Premium com Glass
  glassPremium: [
    'bg-gradient-to-br',
    'from-black-100',
    'to-gray-900',
    'border',
    'border-primary-yellow/20',
    'backdrop-blur-xl',
    'shadow-2xl',
    'rounded-lg'
  ].join(' '),
  
  // Cards com hover interativo
  interactiveCard: [
    'bg-gray-900/80',
    'border',
    'border-gray-700',
    'backdrop-blur-xl',
    'shadow-xl',
    'hover:bg-gray-900/90',
    'hover:shadow-2xl',
    'hover:transform',
    'hover:-translate-y-1',
    'transition-all',
    'duration-200',
    'rounded-lg'
  ].join(' '),
  
  // Glass Yellow (Accent)
  glassYellow: [
    'bg-primary-yellow/5',
    'border',
    'border-primary-yellow/10',
    'backdrop-blur-xl',
    'shadow-xl',
    'rounded-lg'
  ].join(' '),
  
  // Cards de alerta
  alertCard: [
    'bg-gray-900/80',
    'border',
    'border-accent-orange/30',
    'backdrop-blur-xl',
    'shadow-xl',
    'rounded-lg'
  ].join(' '),
  
  // Inputs de formulário
  formInput: [
    'bg-gray-900/60',
    'border',
    'border-gray-700',
    'text-gray-100',
    'rounded-xl',
    'backdrop-blur-xl',
    'focus:border-primary-yellow',
    'focus:ring-2',
    'focus:ring-primary-yellow/20'
  ].join(' '),
  
  // Botões primários (Yellow)
  primaryButton: [
    'bg-primary-yellow',
    'text-black-100',
    'hover:bg-yellow-90',
    'hover:transform',
    'hover:-translate-y-1',
    'transition-all',
    'duration-200',
    'focus:ring-2',
    'focus:ring-primary-yellow/20'
  ].join(' '),
  
  // Botões outline
  outlineButton: [
    'border-2',
    'border-primary-yellow',
    'text-primary-yellow',
    'hover:bg-primary-yellow',
    'hover:text-black-100',
    'hover:transform',
    'hover:-translate-y-1',
    'transition-all',
    'duration-200'
  ].join(' '),
  
  // Botões ghost com glass
  ghostButton: [
    'bg-gray-900/50',
    'border',
    'border-gray-700/50',
    'backdrop-blur-sm',
    'text-gray-100',
    'hover:bg-gray-800/80',
    'hover:backdrop-blur-lg',
    'transition-all',
    'duration-200'
  ].join(' ')
} as const;

// ============================================================================
// HIERARQUIA DE TEXTO FLUIDLAMP OPTIMIZED (v2.1)
// ============================================================================

export const textHierarchy = {
  // Hierarquia principal (Otimizada para background dinâmico)
  h1: 'text-yellow-400 font-extrabold', // #FBBF24 - Títulos principais
  h2: 'text-amber-400 font-bold',       // #F59E0B - Subtítulos importantes  
  h3: 'text-emerald-400 font-semibold', // #10B981 - Texto informativo/valores
  h4: 'text-blue-400 font-medium',      // #3B82F6 - Links/interação
  h5: 'text-purple-400 font-normal',    // #8B5CF6 - Metadata/timestamps
  h6: 'text-gray-300 font-normal',      // #D1D5DB - Texto de apoio

  // Legacy (manter compatibilidade)
  primary: 'text-yellow-400',           // Títulos, texto principal (era platinum)
  secondary: 'text-amber-400',          // Labels, descrições (era silver)
  accent: 'text-yellow-500',            // Valores, preços, destaques (era gold)
  value: 'text-emerald-400',            // Métricas importantes (era yellow)
  warning: 'text-orange-400',           // Avisos, alertas (era amber)
  
  // Tamanhos com hierarquia (atualizado)
  heading: 'text-2xl font-extrabold text-yellow-400',
  subheading: 'text-lg font-bold text-amber-400', 
  body: 'text-sm font-medium text-emerald-400',
  caption: 'text-xs font-normal text-purple-400',
  
  // Estados especiais
  muted: 'text-gray-400',
  contrast: 'text-white'
} as const;

// ============================================================================
// TEXT SHADOWS PARA FLUIDLAMP (Novo)
// ============================================================================

export const textShadows = {
  // Sombras para legibilidade sobre background dinâmico
  strong: '[text-shadow:_0_2px_4px_rgba(0,0,0,0.8)]',    // H1
  medium: '[text-shadow:_0_1px_3px_rgba(0,0,0,0.6)]',    // H2
  light: '[text-shadow:_0_1px_2px_rgba(0,0,0,0.4)]',     // H3-H6
  subtle: '[text-shadow:_0_1px_1px_rgba(0,0,0,0.3)]',    // Texto geral
  
  // Utilitários combinados
  h1Shadow: 'text-yellow-400 font-extrabold [text-shadow:_0_2px_4px_rgba(0,0,0,0.8)]',
  h2Shadow: 'text-amber-400 font-bold [text-shadow:_0_1px_3px_rgba(0,0,0,0.6)]',
  h3Shadow: 'text-emerald-400 font-semibold [text-shadow:_0_1px_2px_rgba(0,0,0,0.4)]',
  h4Shadow: 'text-blue-400 font-medium [text-shadow:_0_1px_2px_rgba(0,0,0,0.4)]',
  h5Shadow: 'text-purple-400 font-normal [text-shadow:_0_1px_1px_rgba(0,0,0,0.3)]',
} as const;

// ============================================================================
// UTILITÁRIOS DE ÍCONES
// ============================================================================

export const iconStyles = {
  primary: 'text-adega-gold',         // Ícones principais
  secondary: 'text-adega-silver',     // Ícones secundários
  warning: 'text-adega-amber',        // Ícones de aviso
  success: 'text-green-400',          // Ícones de sucesso
  error: 'text-red-400',              // Ícones de erro
  premium: 'text-purple-400',         // Ícones VIP
  
  // Tamanhos padrão
  small: 'h-4 w-4',
  medium: 'h-5 w-5',
  large: 'h-6 w-6',
  xlarge: 'h-8 w-8'
} as const;

// ============================================================================
// FUNÇÕES UTILITÁRIAS
// ============================================================================

/**
 * Gera classes de cor com opacidade
 */
export function withOpacity(color: string, opacity: keyof typeof opacityVariants): string {
  return `${color}/${opacityVariants[opacity]}`;
}

/**
 * Combina classes de tema com classes customizadas
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Retorna o padrão de card baseado na variante
 */
export function getCardPattern(variant: 'default' | 'interactive' | 'alert'): string {
  switch (variant) {
    case 'interactive':
      return componentPatterns.interactiveCard;
    case 'alert':
      return componentPatterns.alertCard;
    default:
      return componentPatterns.glassCard;
  }
}

/**
 * Retorna as cores semânticas para um estado
 */
export function getSemanticColors(state: keyof typeof semanticColors) {
  return semanticColors[state];
}

/**
 * Gera classes de status baseado no valor numérico
 */
export function getStatusColors(value: number, thresholds: { warning: number; critical: number }) {
  if (value <= thresholds.critical) {
    return semanticColors.error;
  } else if (value <= thresholds.warning) {
    return semanticColors.warning;
  } else {
    return semanticColors.success;
  }
}

// ============================================================================
// CONSTANTES DE CONFIGURAÇÃO
// ============================================================================

export const themeConfig = {
  // Transições padrão
  transitions: {
    fast: 'transition-all duration-200',
    normal: 'transition-all duration-300',
    slow: 'transition-all duration-500'
  },
  
  // Sombras
  shadows: {
    card: 'shadow-xl',
    hover: 'shadow-2xl',
    inner: 'shadow-inner'
  },
  
  // Blur effects
  blur: {
    card: 'backdrop-blur-xl',
    modal: 'backdrop-blur-lg',
    overlay: 'backdrop-blur-sm'
  },
  
  // Bordas arredondadas
  rounded: {
    card: 'rounded-lg',
    input: 'rounded-xl',
    button: 'rounded-md'
  }
} as const;

// ============================================================================
// EXPORTAÇÕES PARA FÁCIL IMPORTAÇÃO
// ============================================================================

export {
  adegaColors as colors,
  semanticColors as semantic,
  componentPatterns as patterns,
  textHierarchy as text,
  textShadows as shadows,
  iconStyles as icons,
  themeConfig as config
};