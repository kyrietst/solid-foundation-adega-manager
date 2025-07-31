/**
 * Utilitários de Theme - Helper functions para combinações comuns de classes CSS
 * Sistema baseado na análise de padrões existentes no Adega Manager
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { componentPatterns, semanticColors, textHierarchy, iconStyles, themeConfig } from './theme';

/**
 * Função de merge de classes otimizada (substituindo a do utils.ts quando necessário)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ============================================================================
// BUILDERS DE COMPONENTES
// ============================================================================

/**
 * Builder para cards com variantes padronizadas
 */
export const cardVariants = {
  default: cn(componentPatterns.glassCard),
  interactive: cn(componentPatterns.interactiveCard),
  alert: cn(componentPatterns.alertCard),
  
  // Variantes específicas para StatCard
  success: cn(
    componentPatterns.glassCard,
    'border-green-500/20'
  ),
  warning: cn(
    componentPatterns.glassCard,
    'border-adega-amber/30'
  ),
  error: cn(
    componentPatterns.glassCard,
    'border-red-500/20'
  ),
  premium: cn(
    componentPatterns.glassCard,
    'border-purple-400/20'
  )
} as const;

/**
 * Builder para botões com estados
 */
export const buttonVariants = {
  primary: cn(componentPatterns.primaryButton),
  secondary: cn(componentPatterns.secondaryButton),
  ghost: cn(
    'text-adega-silver',
    'hover:text-adega-gold',
    'hover:bg-adega-charcoal/20',
    themeConfig.transitions.fast
  ),
  outline: cn(
    'border',
    'border-white/10',
    'text-adega-platinum',
    'hover:bg-adega-charcoal/20',
    themeConfig.transitions.fast
  )
} as const;

/**
 * Builder para inputs com estados
 */
export const inputVariants = {
  default: cn(componentPatterns.formInput),
  error: cn(
    componentPatterns.formInput,
    'border-red-500/50',
    'focus:border-red-500'
  ),
  success: cn(
    componentPatterns.formInput,
    'border-green-500/50',
    'focus:border-green-500'
  )
} as const;

// ============================================================================
// HELPERS DE TEXTO E TIPOGRAFIA
// ============================================================================

/**
 * Gera classes de texto baseado no tipo e importância
 */
export function getTextClasses(
  variant: keyof typeof textHierarchy,
  customClasses?: string
): string {
  return cn(textHierarchy[variant], customClasses);
}

/**
 * Gera classes de valor monetário com formatação especial
 */
export function getValueClasses(
  size: 'sm' | 'md' | 'lg' | 'xl' = 'md',
  color: 'gold' | 'yellow' | 'amber' = 'gold'
): string {
  const sizeClasses = {
    sm: 'text-sm font-medium',
    md: 'text-lg font-semibold', 
    lg: 'text-xl font-bold',
    xl: 'text-2xl font-bold'
  };
  
  const colorClasses = {
    gold: 'text-adega-gold',
    yellow: 'text-adega-yellow',
    amber: 'text-adega-amber'
  };
  
  return cn(sizeClasses[size], colorClasses[color]);
}

/**
 * Gera classes para métricas e estatísticas
 */
export function getMetricClasses(
  value: number,
  thresholds?: { warning?: number; critical?: number }
): string {
  if (!thresholds) {
    return getValueClasses('lg', 'yellow');
  }
  
  if (thresholds.critical && value <= thresholds.critical) {
    return cn('text-xl font-bold text-red-400');
  } else if (thresholds.warning && value <= thresholds.warning) {
    return cn('text-xl font-bold text-adega-amber');
  } else {
    return cn('text-xl font-bold text-green-400');
  }
}

// ============================================================================
// HELPERS DE ÍCONES
// ============================================================================

/**
 * Gera classes de ícone baseado no contexto
 */
export function getIconClasses(
  variant: keyof typeof iconStyles,
  size: keyof typeof iconStyles = 'medium',
  customClasses?: string
): string {
  return cn(
    iconStyles[size as keyof typeof iconStyles],
    iconStyles[variant],
    customClasses
  );
}

/**
 * Gera classes de ícone de status baseado em valor
 */
export function getStatusIconClasses(
  status: 'success' | 'warning' | 'error' | 'info',
  size: keyof typeof iconStyles = 'medium'
): string {
  const statusColors = {
    success: iconStyles.success,
    warning: iconStyles.warning,
    error: iconStyles.error,
    info: iconStyles.primary
  };
  
  return cn(iconStyles[size], statusColors[status]);
}

// ============================================================================
// HELPERS DE LAYOUT
// ============================================================================

/**
 * Gera classes para grids responsivos padrão
 */
export const gridLayouts = {
  cards: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4',
  stats: 'grid grid-cols-2 lg:grid-cols-5 gap-4',
  products: 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4',
  table: 'grid grid-cols-1 gap-1'
} as const;

/**
 * Gera classes para flex layouts comuns
 */
export const flexLayouts = {
  center: 'flex items-center justify-center',
  between: 'flex items-center justify-between',
  start: 'flex items-center justify-start',
  end: 'flex items-center justify-end',
  column: 'flex flex-col',
  columnCenter: 'flex flex-col items-center justify-center'
} as const;

// ============================================================================
// HELPERS DE ESTADOS
// ============================================================================

/**
 * Gera classes baseado no status de estoque
 */
export function getStockStatusClasses(
  currentStock: number,
  minimumStock: number
): {
  text: string;
  background: string;
  border: string;
  badge: string;
} {
  const ratio = currentStock / minimumStock;
  
  if (ratio <= 0.5) {
    return {
      text: 'text-red-400',
      background: 'bg-red-500',
      border: 'border-red-500/30',
      badge: 'bg-red-100 text-red-700 border-red-200'
    };
  } else if (ratio <= 1) {
    return {
      text: 'text-adega-amber',
      background: 'bg-adega-amber',
      border: 'border-adega-amber/30',
      badge: 'bg-amber-100 text-amber-700 border-amber-200'
    };
  } else {
    return {
      text: 'text-green-400',
      background: 'bg-green-500',
      border: 'border-green-500/30',
      badge: 'bg-green-100 text-green-700 border-green-200'
    };
  }
}

/**
 * Gera classes para segmentos de clientes
 */
export function getCustomerSegmentClasses(segment: string): string {
  const segmentMap: Record<string, string> = {
    'VIP': 'bg-purple-100 text-purple-700 border-purple-200',
    'Fiel - VIP': 'bg-purple-100 text-purple-700 border-purple-200',
    'Regular': 'bg-blue-100 text-blue-700 border-blue-200',
    'Ocasional': 'bg-gray-100 text-gray-700 border-gray-200',
    'Novo': 'bg-green-100 text-green-700 border-green-200'
  };
  
  return segmentMap[segment] || 'bg-gray-100 text-gray-700 border-gray-200';
}

/**
 * Gera classes para indicadores de giro de produtos
 */
export function getTurnoverClasses(turnover: 'fast' | 'medium' | 'slow'): {
  text: string;
  badge: string;
  icon: string;
} {
  const turnoverMap = {
    fast: {
      text: 'text-green-400',
      badge: 'bg-green-100 text-green-700 border-green-200',
      icon: 'text-green-400'
    },
    medium: {
      text: 'text-adega-yellow',
      badge: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      icon: 'text-adega-yellow'
    },
    slow: {
      text: 'text-red-400',
      badge: 'bg-red-100 text-red-700 border-red-200',
      icon: 'text-red-400'
    }
  };
  
  return turnoverMap[turnover];
}

// ============================================================================
// HELPERS DE ANIMAÇÃO E TRANSIÇÃO
// ============================================================================

/**
 * Classes de transição pré-configuradas
 */
export const transitionClasses = {
  fast: themeConfig.transitions.fast,
  normal: themeConfig.transitions.normal,
  slow: themeConfig.transitions.slow,
  
  // Animações específicas
  fadeIn: 'animate-in fade-in duration-200',
  fadeOut: 'animate-out fade-out duration-200',
  slideIn: 'animate-in slide-in-from-bottom-4 duration-300',
  slideOut: 'animate-out slide-out-to-bottom-4 duration-300',
  
  // Hover effects
  hoverScale: 'hover:scale-105 transition-transform duration-200',
  hoverGlow: 'hover:shadow-2xl hover:shadow-adega-gold/20 transition-all duration-300'
} as const;

// ============================================================================
// HELPER PARA VALIDAÇÃO DE FORMS
// ============================================================================

/**
 * Gera classes para estados de validação de formulário
 */
export function getValidationClasses(
  isValid?: boolean,
  hasError?: boolean,
  customClasses?: string
): string {
  let baseClasses = inputVariants.default;
  
  if (hasError) {
    baseClasses = inputVariants.error;
  } else if (isValid === true) {
    baseClasses = inputVariants.success;
  }
  
  return cn(baseClasses, customClasses);
}

// ============================================================================
// EXPORTAÇÕES PRINCIPAIS
// ============================================================================

// Já exportados acima como const, não precisam ser re-exportados