/**
 * Sistema de Themes Adega - Utilitários para padronização de estilos
 * 
 * Baseado na paleta de cores Black to Yellow elegant gold progression
 * Analisado a partir de 925+ registros em produção
 */

// ============================================================================
// PALETA DE CORES ADEGA WINE CELLAR
// ============================================================================

export const adegaColors = {
  // Gradação Escura (Backgrounds e estrutura)
  black: '#000000',           // Preto total
  charcoal: '#1a1a1a',      // Carvão escuro - Background principal
  graphite: '#2d2d2d',      // Grafite - Hover states
  slate: '#404040',          // Ardósia
  steel: '#595959',          // Aço
  
  // Gradação Clara (Textos e detalhes)
  pewter: '#737373',         // Estanho
  silver: '#8c8c8c',        // Prata - Texto secundário
  platinum: '#a6a6a6',      // Platina - Texto principal
  
  // Gradação Dourada (Acentos e destaques)
  champagne: '#bfbf8c',     // Champagne
  gold: '#d4af37',          // Ouro clássico - Accent principal
  amber: '#ffbf00',         // Âmbar - Warnings/alertas
  yellow: '#ffd700'         // Amarelo dourado - Valores importantes
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
// PADRÕES DE COMPONENTES
// ============================================================================

export const componentPatterns = {
  // Cards padrão
  glassCard: [
    'bg-adega-charcoal/20',
    'border-white/10',
    'backdrop-blur-xl',
    'shadow-xl'
  ].join(' '),
  
  // Cards com hover
  interactiveCard: [
    'bg-adega-charcoal/20',
    'border-white/10',
    'backdrop-blur-xl',
    'shadow-xl',
    'hover:bg-adega-charcoal/30',
    'hover:shadow-2xl',
    'transition-all',
    'duration-200'
  ].join(' '),
  
  // Cards de alerta
  alertCard: [
    'border-adega-amber/30',
    'bg-adega-amber/5',
    'backdrop-blur-xl',
    'shadow-xl'
  ].join(' '),
  
  // Inputs de formulário
  formInput: [
    'bg-adega-charcoal/60',
    'border-white/10',
    'text-adega-platinum',
    'rounded-xl',
    'backdrop-blur-xl'
  ].join(' '),
  
  // Botões primários
  primaryButton: [
    'bg-adega-gold',
    'text-adega-charcoal',
    'hover:bg-adega-amber',
    'transition-colors',
    'duration-200'
  ].join(' '),
  
  // Botões secundários
  secondaryButton: [
    'border-adega-gold',
    'text-adega-gold',
    'hover:bg-adega-gold',
    'hover:text-adega-charcoal',
    'transition-all',
    'duration-200'
  ].join(' ')
} as const;

// ============================================================================
// UTILITÁRIOS DE HIERARQUIA DE TEXTO
// ============================================================================

export const textHierarchy = {
  // Hierarquia principal
  primary: 'text-adega-platinum',     // Títulos, texto principal
  secondary: 'text-adega-silver',     // Labels, descrições
  accent: 'text-adega-gold',          // Valores, preços, destaques
  value: 'text-adega-yellow',         // Métricas importantes
  warning: 'text-adega-amber',        // Avisos, alertas
  
  // Tamanhos com hierarquia
  heading: 'text-2xl font-bold text-adega-platinum',
  subheading: 'text-lg font-semibold text-adega-platinum',
  body: 'text-sm text-adega-silver',
  caption: 'text-xs text-adega-silver',
  
  // Estados especiais
  muted: 'text-muted-foreground',
  contrast: 'text-foreground'
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
  iconStyles as icons,
  themeConfig as config
};