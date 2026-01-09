/**
 * Utilitários de Theme v2.1 - Sistema Completo Glass Morphism
 * Sistema baseado na análise de padrões existentes + Glass Morphism Enhancement
 * 30+ utility functions for comprehensive glass morphism theming
 *
 * PHASE 4 ENHANCEMENT - Design Token Integration
 * Enhanced with TypeScript design token validation and type safety
 * 
 * // DEPRECATED: Do not use in new components. Scheduled for removal in v2.1.
 * // Use Semantic Tokens (bg-surface, text-brand) instead.
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type {
  ColorTokens,
  DimensionTokens,
  StatCardVariant,
  ButtonVariant,
  ButtonSize,
  ModalSize,
  DesignSystemProps
} from '@/core/types/design-tokens';
import { isValidColorToken, isValidDimensionToken } from '@/core/types/design-tokens';

/**
 * Função de merge de classes otimizada
 * USADO EM: stat-card.tsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ============================================================================
// ENHANCED VALUE CLASSES - Updated for v2.1
// ============================================================================

/**
 * Gerador de classes para valores numéricos/texto com variantes
 * USADO EM: stat-card.tsx
 * ENHANCED: Now uses typed StatCardVariant for better type safety
 */
export function getValueClasses(size: 'sm' | 'md' | 'lg' = 'md', variant: StatCardVariant = 'default') {
  const sizeClasses = {
    sm: 'text-lg font-semibold',
    md: 'text-xl font-bold',
    lg: 'text-2xl font-bold'
  };
  
  const variantClasses = {
    default: 'text-gray-100',
    success: 'text-accent-green',
    warning: 'text-accent-orange',
    error: 'text-accent-red',
    purple: 'text-accent-purple',
    gold: 'text-accent-gold-100'
  };
  
  return cn(sizeClasses[size], variantClasses[variant]);
}

// ============================================================================
// GLASS MORPHISM UTILITIES v2.1
// ============================================================================

/**
 * Glass Card Variants with different intensities
 */
export function getGlassCardClasses(variant: 'default' | 'premium' | 'subtle' | 'strong' | 'yellow' | 'success' | 'warning' | 'error' | 'card' = 'default') {
  const variants = {
    default: 'bg-black/60 backdrop-blur-sm border border-white/10 rounded-lg',
    card: 'bg-black/60 backdrop-blur-sm border border-white/10 rounded-lg',
    premium: 'bg-black/40 backdrop-blur-sm border border-yellow-400/30 rounded-lg shadow-lg',
    subtle: 'bg-black/20 backdrop-blur-sm border border-gray-700/50 rounded-lg',
    strong: 'bg-black/80 backdrop-blur-sm border border-gray-600 rounded-lg',
    yellow: 'bg-yellow-400/10 backdrop-blur-sm border border-yellow-400/30 rounded-lg',
    success: 'bg-green-500/10 backdrop-blur-sm border border-green-400/30 rounded-lg',
    warning: 'bg-yellow-500/10 backdrop-blur-sm border border-yellow-400/30 rounded-lg',
    error: 'bg-red-500/10 backdrop-blur-sm border border-red-400/30 rounded-lg'
  };
  
  return variants[variant];
}

/**
 * Button Variants with Glass Effects
 */
export function getGlassButtonClasses(variant: 'primary' | 'outline' | 'ghost' | 'secondary' = 'primary', size: 'sm' | 'md' | 'lg' = 'md') {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };
  
  const variantClasses = {
    primary: 'bg-primary-yellow text-black-100 hover:bg-yellow-90 hover:transform hover:-translate-y-1 transition-all duration-200 focus:ring-2 focus:ring-primary-yellow/20',
    outline: 'border-2 border-primary-yellow text-primary-yellow hover:bg-primary-yellow hover:text-black-100 hover:transform hover:-translate-y-1 transition-all duration-200',
    ghost: 'bg-gray-900/50 border border-gray-700/50 backdrop-blur-sm text-gray-100 hover:bg-gray-800/80 hover:backdrop-blur-lg transition-all duration-200',
    secondary: 'bg-gray-800/80 border border-gray-600 backdrop-blur-xl text-gray-100 hover:bg-gray-700/80 transition-all duration-200'
  };
  
  return cn(sizeClasses[size], variantClasses[variant], 'rounded-md font-medium');
}

/**
 * Input Variants with Glass Styling
 */
export function getGlassInputClasses(variant: 'default' | 'search' | 'form' = 'default') {
  const variants = {
    default: 'bg-gray-900/60 border border-gray-700 text-gray-100 rounded-xl backdrop-blur-xl focus:border-primary-yellow focus:ring-2 focus:ring-primary-yellow/20',
    search: 'bg-gray-900/80 border border-gray-600 text-gray-100 rounded-lg backdrop-blur-xl focus:border-primary-yellow focus:ring-1 focus:ring-primary-yellow/10 placeholder:text-gray-400',
    form: 'bg-gray-900/70 border border-gray-700 text-gray-100 rounded-lg backdrop-blur-lg focus:border-primary-yellow focus:ring-2 focus:ring-primary-yellow/20 focus:bg-gray-900/80'
  };
  
  return variants[variant];
}

/**
 * Status-based Classes for Components
 */
export function getStatusClasses(status: 'success' | 'warning' | 'error' | 'info' | 'default' = 'default') {
  const statusClasses = {
    success: {
      background: 'bg-accent-green/10 border-accent-green/30',
      text: 'text-accent-green',
      icon: 'text-accent-green'
    },
    warning: {
      background: 'bg-primary-yellow/10 border-primary-yellow/30',
      text: 'text-primary-yellow',
      icon: 'text-primary-yellow'
    },
    error: {
      background: 'bg-accent-red/10 border-accent-red/30',
      text: 'text-accent-red',
      icon: 'text-accent-red'
    },
    info: {
      background: 'bg-accent-blue/10 border-accent-blue/30',
      text: 'text-accent-blue',
      icon: 'text-accent-blue'
    },
    default: {
      background: 'bg-gray-900/80 border-gray-700',
      text: 'text-gray-100',
      icon: 'text-gray-400'
    }
  };
  
  return statusClasses[status];
}

/**
 * Stock Level Status Classes
 */
export function getStockStatusClasses(currentStock: number, minStock: number) {
  const ratio = currentStock / minStock;
  
  if (ratio <= 0.2) {
    return getStatusClasses('error');
  } else if (ratio <= 0.5) {
    return getStatusClasses('warning');
  } else {
    return getStatusClasses('success');
  }
}

/**
 * Text Hierarchy Classes
 */
export function getTextClasses(hierarchy: 'heading' | 'subheading' | 'body' | 'caption' | 'accent' | 'value' = 'body') {
  const hierarchyClasses = {
    heading: 'text-2xl font-bold text-gray-100',
    subheading: 'text-lg font-semibold text-gray-100',
    body: 'text-sm text-gray-300',
    caption: 'text-xs text-gray-400',
    accent: 'text-primary-yellow font-medium',
    value: 'text-primary-yellow font-bold'
  };
  
  return hierarchyClasses[hierarchy];
}

/**
 * Icon Classes with Sizes and Variants
 */
export function getIconClasses(size: 'sm' | 'md' | 'lg' | 'xl' = 'md', variant: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error' = 'secondary') {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
    xl: 'h-8 w-8'
  };
  
  const variantClasses = {
    primary: 'text-primary-yellow',
    secondary: 'text-gray-400',
    accent: 'text-primary-yellow',
    success: 'text-accent-green',
    warning: 'text-primary-yellow',
    error: 'text-accent-red'
  };
  
  return cn(sizeClasses[size], variantClasses[variant]);
}

/**
 * Modal and Dialog Classes
 */
export function getModalClasses(size: 'sm' | 'md' | 'lg' | 'xl' = 'md') {
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl'
  };
  
  return cn(
    'glass-card p-6 rounded-lg shadow-2xl',
    sizeClasses[size],
    'mx-auto'
  );
}

/**
 * Loading Spinner Classes with Color Variants
 */
export function getLoadingSpinnerClasses(size: 'sm' | 'md' | 'lg' = 'md', color: 'default' | 'yellow' | 'white' = 'default') {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };
  
  const colorClasses = {
    default: 'text-gray-400',
    yellow: 'text-primary-yellow',
    white: 'text-white'
  };
  
  return cn(
    'animate-spin',
    sizeClasses[size],
    colorClasses[color]
  );
}

/**
 * Badge Classes with Glass Effects
 */
export function getBadgeClasses(variant: 'default' | 'success' | 'warning' | 'error' | 'premium' = 'default', size: 'sm' | 'md' = 'sm') {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm'
  };
  
  const variantClasses = {
    default: 'bg-gray-800/80 text-gray-100 border border-gray-700',
    success: 'bg-accent-green/20 text-accent-green border border-accent-green/30',
    warning: 'bg-primary-yellow/20 text-primary-yellow border border-primary-yellow/30',
    error: 'bg-accent-red/20 text-accent-red border border-accent-red/30',
    premium: 'bg-accent-purple/20 text-accent-purple border border-accent-purple/30'
  };
  
  return cn(
    'inline-flex items-center font-medium rounded-full backdrop-blur-sm',
    sizeClasses[size],
    variantClasses[variant]
  );
}

/**
 * Pagination Controls Classes
 */
export function getPaginationClasses() {
  return {
    container: 'flex items-center justify-between glass-card p-4 rounded-lg',
    button: 'px-3 py-1.5 text-sm bg-gray-800/60 border border-gray-700 rounded-md backdrop-blur-sm hover:bg-gray-700/80 transition-all duration-200',
    activeButton: 'px-3 py-1.5 text-sm bg-primary-yellow text-black-100 rounded-md font-medium',
    disabledButton: 'px-3 py-1.5 text-sm bg-gray-900/40 border border-gray-800 text-gray-500 rounded-md cursor-not-allowed'
  };
}

/**
 * Table Classes with Glass Effects
 */
export function getTableClasses() {
  return {
    container: 'glass-card rounded-lg overflow-hidden',
    header: 'bg-gray-800/60 backdrop-blur-lg',
    headerCell: 'px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider',
    row: 'bg-gray-900/40 border-b border-gray-700/50 hover:bg-gray-800/60 transition-colors duration-200',
    cell: 'px-6 py-4 whitespace-nowrap text-sm text-gray-100'
  };
}

/**
 * Empty State Classes
 */
export function getEmptyStateClasses() {
  return {
    container: 'glass-card p-8 text-center rounded-lg',
    icon: 'h-12 w-12 text-gray-500 mx-auto mb-4',
    title: 'text-lg font-medium text-gray-100 mb-2',
    description: 'text-sm text-gray-400 mb-6',
    action: getGlassButtonClasses('outline', 'sm')
  };
}

/**
 * Search Input Classes
 */
export function getSearchInputClasses() {
  return {
    container: 'relative',
    input: cn(getGlassInputClasses('search'), 'pl-10 pr-4 py-2'),
    icon: 'absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400',
    clearButton: 'absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 hover:text-gray-100 cursor-pointer'
  };
}

/**
 * Filter Toggle Classes
 */
export function getFilterToggleClasses(isActive: boolean = false) {
  const baseClasses = 'glass-card p-4 rounded-lg transition-all duration-200 cursor-pointer';
  const activeClasses = isActive ? 'border-primary-yellow/50 bg-primary-yellow/5' : 'border-gray-700';
  
  return cn(baseClasses, activeClasses);
}

/**
 * Sidebar Classes with Glass Effects
 */
export function getSidebarClasses() {
  return {
    container: 'glass-card h-full w-64 border-r border-gray-700 backdrop-blur-xl',
    header: 'p-6 border-b border-gray-700/50',
    nav: 'p-4',
    navItem: 'flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200',
    navItemActive: 'bg-primary-yellow/10 text-primary-yellow border border-primary-yellow/20',
    navItemInactive: 'text-gray-300 hover:bg-gray-800/60 hover:text-gray-100'
  };
}

/**
 * Utility: Combine Glass Effects with Custom Classes
 */
export function withGlassEffect(customClasses: string, glassType: 'card' | 'yellow' | 'premium' | 'subtle' = 'card') {
  const glassClasses = getGlassCardClasses(glassType);
  return cn(glassClasses, customClasses);
}

/**
 * Utility: Get Focus Ring Classes
 */
export function getFocusRingClasses(color: 'yellow' | 'blue' | 'red' | 'green' = 'yellow') {
  const colorClasses = {
    yellow: 'focus:ring-2 focus:ring-primary-yellow/20 focus:border-primary-yellow',
    blue: 'focus:ring-2 focus:ring-accent-blue/20 focus:border-accent-blue',
    red: 'focus:ring-2 focus:ring-accent-red/20 focus:border-accent-red',
    green: 'focus:ring-2 focus:ring-accent-green/20 focus:border-accent-green'
  };
  
  return colorClasses[color];
}

/**
 * Utility: Get Hover Transform Classes
 */
export function getHoverTransformClasses(type: 'lift' | 'scale' | 'glow' = 'lift') {
  const transformClasses = {
    lift: 'hover:transform hover:-translate-y-1 transition-all duration-200',
    scale: 'hover:scale-105 transition-transform duration-200',
    glow: 'hover:shadow-2xl hover:shadow-primary-yellow/10 transition-shadow duration-200'
  };
  
  return transformClasses[type];
}

// ============================================================================
// SF PRO DISPLAY TYPOGRAPHY SYSTEM
// ============================================================================

/**
 * SF Pro Display Typography Hierarchy
 * Baseado nas 9 variantes disponíveis na pasta assets/fonts
 */
export function getSFProTextClasses(
  hierarchy: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'caption' | 'small' | 'value' | 'label' | 'action' | 'status' = 'body',
  variant?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error' | 'purple' | 'neutral'
) {
  const hierarchyClasses = {
    h1: 'font-sf-black text-3xl leading-tight',                                // Títulos principais - SF Pro Black (30px fixo)
    h2: 'font-sf-bold text-xl lg:text-2xl xl:text-3xl leading-tight',          // Subtítulos importantes - SF Pro Bold  
    h3: 'font-sf-semibold text-lg lg:text-xl xl:text-2xl leading-normal',      // Títulos de seção - SF Pro SemiBold
    h4: 'font-sf-medium text-base lg:text-lg xl:text-xl leading-normal',       // Labels importantes - SF Pro Medium
    body: 'font-sf-regular text-sm lg:text-base leading-normal',               // Texto padrão - SF Pro Regular
    caption: 'font-sf-medium text-xs lg:text-sm leading-normal',               // Metadados - SF Pro Medium
    small: 'font-sf-regular text-xs leading-normal',                           // Informações auxiliares - SF Pro Regular
    value: 'font-sf-bold text-xl lg:text-2xl xl:text-3xl leading-tight',       // Valores numéricos - SF Pro Bold
    label: 'font-sf-medium text-sm lg:text-base leading-normal',               // Labels de interface - SF Pro Medium
    action: 'font-sf-semibold text-sm lg:text-base leading-normal',            // Texto de ação - SF Pro SemiBold
    status: 'font-sf-medium text-xs lg:text-sm leading-normal uppercase tracking-wide' // Status/badges - SF Pro Medium
  };

  const variantClasses = {
    primary: 'text-primary-yellow',
    secondary: 'text-gray-300', 
    accent: 'text-primary-yellow',
    success: 'text-accent-green',
    warning: 'text-primary-yellow',
    error: 'text-accent-red',
    purple: 'text-accent-purple',
    neutral: 'text-gray-100'
  };

  const baseClass = hierarchyClasses[hierarchy];
  const colorClass = variant ? variantClasses[variant] : 'text-gray-100';
  
  return cn(baseClass, colorClass);
}

/**
 * SF Pro Display Weight Classes
 * Mapeamento direto das variantes disponíveis
 */
export function getSFProWeightClasses(weight: 'thin' | 'ultralight' | 'light' | 'regular' | 'medium' | 'semibold' | 'bold' | 'heavy' | 'black' = 'regular') {
  const weightClasses = {
    thin: 'font-sf-thin',           // 100 - Ultra leve (decorativo)
    ultralight: 'font-sf-ultralight', // 200 - Muito leve (decorativo)
    light: 'font-sf-light',        // 300 - Leve (texto auxiliar)
    regular: 'font-sf-regular',    // 400 - Normal (texto padrão)
    medium: 'font-sf-medium',      // 500 - Médio (labels, captions)
    semibold: 'font-sf-semibold',  // 600 - Semi-negrito (ações, títulos menores)
    bold: 'font-sf-bold',          // 700 - Negrito (valores, títulos importantes)
    heavy: 'font-sf-heavy',        // 800 - Pesado (títulos grandes)
    black: 'font-sf-black'         // 900 - Ultra pesado (títulos principais)
  };
  
  return weightClasses[weight];
}

/**
 * Typography para KPIs e Métricas
 * Otimizado para valores numéricos com SF Pro Display
 */
export function getKPITextClasses(element: 'title' | 'value' | 'delta' | 'subtitle' = 'value') {
  const kpiClasses = {
    title: 'font-sf-medium text-sm text-gray-400 leading-normal',                    // Labels dos KPIs
    value: 'font-sf-bold text-2xl text-white leading-tight font-feature-settings-["tnum"]', // Valores principais
    delta: 'font-sf-medium text-xs leading-normal',                                 // Variações percentuais
    subtitle: 'font-sf-regular text-xs text-gray-400 leading-normal'               // Informações adicionais
  };
  
  return kpiClasses[element];
}

/**
 * Typography para Headers de Páginas
 * Hierarquia específica para headers principais
 */
export function getHeaderTextClasses(level: 'main' | 'section' | 'subsection' = 'main') {
  const headerClasses = {
    main: 'font-sf-black text-3xl leading-tight',                              // DASHBOARD, RELATÓRIOS (30px fixo)
    section: 'font-sf-bold text-xl lg:text-2xl leading-tight',                 // Canais de Venda, seções
    subsection: 'font-sf-semibold text-lg lg:text-xl leading-normal'           // Subseções
  };
  
  return headerClasses[level];
}

/**
 * Typography para Estados e Status
 * Maiúscula/minúscula baseado no contexto
 */
export function getStatusTextClasses(type: 'badge' | 'alert' | 'notification' | 'label' = 'badge', casing: 'upper' | 'title' | 'sentence' = 'upper') {
  const typeClasses = {
    badge: 'font-sf-medium text-xs leading-normal',
    alert: 'font-sf-semibold text-sm leading-normal', 
    notification: 'font-sf-medium text-sm leading-normal',
    label: 'font-sf-medium text-sm leading-normal'
  };

  const casingClasses = {
    upper: 'uppercase tracking-wide',
    title: 'capitalize',
    sentence: 'normal-case'
  };
  
  return cn(typeClasses[type], casingClasses[casing]);
}

// ============================================================================
// PHASE 4 DESIGN TOKEN UTILITIES - Type-Safe Functions
// ============================================================================

/**
 * Type-safe color token utility with validation
 * Provides compile-time and runtime validation for color tokens
 */
export function createColorClass(prefix: 'bg' | 'text' | 'border', token: ColorTokens): string {
  if (!isValidColorToken(token)) {
    console.warn(`Invalid color token: ${token}`);
    return `${prefix}-gray-500`; // Fallback to neutral color
  }
  return `${prefix}-${token}`;
}

/**
 * Type-safe dimension utility with validation
 * Provides compile-time and runtime validation for dimension tokens
 */
export function createDimensionClass(prefix: 'w' | 'h' | 'max-w' | 'max-h' | 'min-w' | 'min-h', token: DimensionTokens): string {
  if (!isValidDimensionToken(token)) {
    console.warn(`Invalid dimension token: ${token}`);
    return `${prefix}-auto`; // Fallback to auto
  }
  return `${prefix}-${token}`;
}

/**
 * Enhanced button utility with full type safety
 * Integrates with design tokens and proper TypeScript types
 */
export function createButtonClasses(
  variant: ButtonVariant = 'default',
  size: ButtonSize = 'default',
  customColors?: {
    background?: ColorTokens;
    text?: ColorTokens;
    border?: ColorTokens;
  }
): string {
  const sizeClasses = {
    default: 'h-10 px-4 py-2',
    sm: 'h-9 rounded-md px-3',
    lg: 'h-11 rounded-md px-8',
    icon: 'h-10 w-10'
  };

  let variantClasses = '';

  if (customColors) {
    // Use custom design tokens
    const bgClass = customColors.background ? createColorClass('bg', customColors.background) : '';
    const textClass = customColors.text ? createColorClass('text', customColors.text) : '';
    const borderClass = customColors.border ? createColorClass('border', customColors.border) : '';
    variantClasses = cn(bgClass, textClass, borderClass);
  } else {
    // Use standard variants with design tokens
    const standardVariants = {
      default: 'bg-primary text-primary-foreground hover:bg-primary/90',
      destructive: 'bg-accent-red text-white hover:bg-accent-red/90',
      outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
      ghost: 'hover:bg-accent hover:text-accent-foreground',
      link: 'text-primary underline-offset-4 hover:underline'
    };
    variantClasses = standardVariants[variant];
  }

  return cn(
    'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
    sizeClasses[size],
    variantClasses
  );
}

/**
 * Enhanced modal utility with design token integration
 * Provides type-safe modal sizing with standardized tokens
 */
export function createModalClasses(
  size: ModalSize = 'lg',
  customMaxWidth?: DimensionTokens
): string {
  let sizeClass = '';

  if (customMaxWidth) {
    sizeClass = createDimensionClass('max-w', customMaxWidth);
  } else {
    const sizeClasses = {
      sm: 'max-w-modal-sm',
      md: 'max-w-modal-md',
      lg: 'max-w-modal-lg',
      xl: 'max-w-modal-xl',
      '2xl': 'max-w-modal-2xl',
      '3xl': 'max-w-modal-3xl',
      '4xl': 'max-w-modal-4xl',
      full: 'max-w-modal-full',
      'modal-1200': 'max-w-modal-1200',
      'modal-1400': 'max-w-modal-1400'
    };
    sizeClass = sizeClasses[size];
  }

  return cn(
    'relative grid w-full gap-4 border bg-background p-6 shadow-lg duration-200',
    'data-[state=open]:animate-in data-[state=closed]:animate-out',
    'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
    'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
    'data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]',
    'data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
    'sm:rounded-lg',
    sizeClass
  );
}

/**
 * Type-safe StatCard utility with design token variants
 * Enhanced version with full design token integration
 */
export function createStatCardClasses(
  variant: StatCardVariant = 'default',
  customSize?: 'compact' | 'default' | 'expanded'
): { container: string; title: string; value: string; description: string } {
  const sizeClasses = {
    compact: 'p-4',
    default: 'p-6',
    expanded: 'p-8'
  };

  const variantClasses = {
    default: {
      container: 'bg-card border-border',
      title: 'text-muted-foreground',
      value: 'text-foreground',
      description: 'text-muted-foreground'
    },
    success: {
      container: 'bg-card border-accent-green/20',
      title: 'text-muted-foreground',
      value: 'text-accent-green',
      description: 'text-muted-foreground'
    },
    warning: {
      container: 'bg-card border-accent-orange/20',
      title: 'text-muted-foreground',
      value: 'text-accent-orange',
      description: 'text-muted-foreground'
    },
    error: {
      container: 'bg-card border-accent-red/20',
      title: 'text-muted-foreground',
      value: 'text-accent-red',
      description: 'text-muted-foreground'
    },
    purple: {
      container: 'bg-card border-accent-purple/20',
      title: 'text-muted-foreground',
      value: 'text-accent-purple',
      description: 'text-muted-foreground'
    },
    gold: {
      container: 'bg-card border-accent-gold-100/20',
      title: 'text-muted-foreground',
      value: 'text-accent-gold-100',
      description: 'text-muted-foreground'
    }
  };

  const size = customSize || 'default';
  const classes = variantClasses[variant];

  return {
    container: cn(
      'rounded-lg border shadow-sm transition-colors',
      sizeClasses[size],
      classes.container
    ),
    title: cn('text-sm font-medium tracking-tight', classes.title),
    value: cn('text-2xl font-bold tracking-tight', classes.value),
    description: cn('text-xs', classes.description)
  };
}

/**
 * Design system props utility
 * Converts DesignSystemProps to CSS classes
 */
export function convertDesignSystemProps(props: DesignSystemProps): string {
  const classes: string[] = [];

  if (props.backgroundColor) {
    classes.push(props.backgroundColor);
  }
  if (props.textColor) {
    classes.push(props.textColor);
  }
  if (props.borderColor) {
    classes.push(props.borderColor);
  }
  if (props.width) {
    classes.push(props.width);
  }
  if (props.height) {
    classes.push(props.height);
  }
  if (props.layer) {
    classes.push(props.layer);
  }
  if (props.fontFamily) {
    classes.push(props.fontFamily);
  }
  if (props.textShadow) {
    classes.push(props.textShadow);
  }

  return cn(...classes);
}

/**
 * Enhanced theme validation utility
 * Validates design token usage at runtime with helpful error messages
 */
export function validateDesignTokenUsage(className: string): {
  isValid: boolean;
  warnings: string[];
  suggestions: string[];
} {
  const warnings: string[] = [];
  const suggestions: string[] = [];

  // Check for hardcoded colors
  const hexColorPattern = /#[0-9a-fA-F]{3,8}/g;
  const rgbPattern = /rgba?\([^)]+\)/g;
  const hslPattern = /hsla?\([^)]+\)/g;

  if (hexColorPattern.test(className)) {
    warnings.push('Hardcoded hex colors found');
    suggestions.push('Use design tokens like text-accent-gold-100 or bg-primary-black');
  }

  if (rgbPattern.test(className) || hslPattern.test(className)) {
    warnings.push('Hardcoded RGB/HSL colors found');
    suggestions.push('Use design tokens or CSS custom properties');
  }

  // Check for arbitrary values that could use tokens
  const arbitraryWidthPattern = /w-\[[^\]]+\]/g;
  const arbitraryHeightPattern = /h-\[[^\]]+\]/g;

  if (arbitraryWidthPattern.test(className)) {
    warnings.push('Arbitrary width values found');
    suggestions.push('Consider using standardized width tokens like w-modal-lg or w-col-xl');
  }

  if (arbitraryHeightPattern.test(className)) {
    warnings.push('Arbitrary height values found');
    suggestions.push('Consider using standardized height tokens like h-content-md or h-dialog-lg');
  }

  return {
    isValid: warnings.length === 0,
    warnings,
    suggestions
  };
}