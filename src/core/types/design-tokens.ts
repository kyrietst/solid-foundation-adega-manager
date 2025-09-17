/**
 * Design Token TypeScript Definitions
 *
 * Provides strict typing for all design system tokens, enabling IntelliSense
 * and compile-time validation for design system usage.
 *
 * PHASE 4 - Design System Transformation
 * Created: 2025-09-16
 * Purpose: Type safety and enhanced developer experience
 */

// =============================================================================
// COLOR SYSTEM TYPES
// =============================================================================

/**
 * Primary brand colors
 */
export type PrimaryColors =
  | 'primary-black'
  | 'primary-yellow';

/**
 * Extended black scale (100-60)
 */
export type BlackScale =
  | 'black-100'
  | 'black-90'
  | 'black-80'
  | 'black-70'
  | 'black-60';

/**
 * Extended yellow scale (100-60)
 */
export type YellowScale =
  | 'yellow-100'
  | 'yellow-90'
  | 'yellow-80'
  | 'yellow-70'
  | 'yellow-60';

/**
 * Professional neutral colors (Tailwind compatible)
 */
export type GrayScale =
  | 'gray-950'
  | 'gray-900'
  | 'gray-800'
  | 'gray-700'
  | 'gray-600'
  | 'gray-500'
  | 'gray-400'
  | 'gray-300'
  | 'gray-200'
  | 'gray-100'
  | 'gray-50';

/**
 * Modern accent colors
 */
export type AccentColors =
  | 'accent-blue'
  | 'accent-green'
  | 'accent-red'
  | 'accent-purple'
  | 'accent-orange';

/**
 * Golden accent system - 100% standardized
 */
export type AccentGoldScale =
  | 'accent-gold-100'
  | 'accent-gold-90'
  | 'accent-gold-80'
  | 'accent-gold-70'
  | 'accent-gold-60'
  | 'accent-gold-50'
  | 'accent-gold-40'
  | 'accent-gold-30'
  | 'accent-gold-20'
  | 'accent-gold-10'
  | 'accent-gold-5';

/**
 * Chart color system
 */
export type ChartColors =
  | 'chart-1'
  | 'chart-2'
  | 'chart-3'
  | 'chart-4'
  | 'chart-5'
  | 'chart-6'
  | 'chart-7'
  | 'chart-8';

/**
 * Semantic color tokens
 */
export type SemanticColors =
  | 'background'
  | 'foreground'
  | 'primary'
  | 'primary-foreground'
  | 'secondary'
  | 'secondary-foreground'
  | 'muted'
  | 'muted-foreground'
  | 'accent'
  | 'accent-foreground'
  | 'destructive'
  | 'destructive-foreground'
  | 'border'
  | 'input'
  | 'ring'
  | 'popover'
  | 'popover-foreground'
  | 'card'
  | 'card-foreground';

/**
 * Sidebar color system
 */
export type SidebarColors =
  | 'sidebar'
  | 'sidebar-foreground'
  | 'sidebar-primary'
  | 'sidebar-primary-foreground'
  | 'sidebar-accent'
  | 'sidebar-accent-foreground'
  | 'sidebar-border'
  | 'sidebar-ring';

/**
 * All available color tokens
 */
export type ColorTokens =
  | PrimaryColors
  | BlackScale
  | YellowScale
  | GrayScale
  | AccentColors
  | AccentGoldScale
  | ChartColors
  | SemanticColors
  | SidebarColors;

// =============================================================================
// DIMENSION SYSTEM TYPES
// =============================================================================

/**
 * Table column width tokens
 */
export type ColumnWidths =
  | 'col-xs'    // 80px - Actions, icons
  | 'col-sm'    // 100px - Small data (IDs, counts)
  | 'col-md'    // 120px - Medium data (dates, numbers)
  | 'col-lg'    // 140px - Standard text fields
  | 'col-xl'    // 160px - Long text fields
  | 'col-2xl'   // 180px - Extended text
  | 'col-3xl'   // 200px - Wide content
  | 'col-4xl'   // 220px - Very wide content
  | 'col-max';  // 250px - Maximum standard width

/**
 * Modal width tokens
 */
export type ModalWidths =
  | 'modal-xs'     // 320px - Extra small modals
  | 'modal-sm'     // 384px - Small modals
  | 'modal-md'     // 448px - Medium modals
  | 'modal-lg'     // 512px - Large modals
  | 'modal-xl'     // 576px - Extra large modals
  | 'modal-2xl'    // 672px - 2x large modals
  | 'modal-3xl'    // 768px - 3x large modals
  | 'modal-4xl'    // 896px - 4x large modals
  | 'modal-1200'   // 1200px - Inventory modals (standardized)
  | 'modal-1400'   // 1400px - Ultra wide modals
  | 'modal-full';  // 100vw - Full width modals

/**
 * Content height tokens
 */
export type ContentHeights =
  | 'content-xs'    // 40vh - Compact content
  | 'content-sm'    // 50vh - Small content areas
  | 'content-md'    // 60vh - Standard content height
  | 'content-lg'    // 70vh - Large content areas
  | 'content-xl'    // 80vh - Extra large content
  | 'content-2xl'   // 90vh - Maximum content height
  | 'content-full'; // 100vh - Full viewport

/**
 * Dialog height tokens
 */
export type DialogHeights =
  | 'dialog-xs'   // 30vh - Small dialogs
  | 'dialog-sm'   // 40vh - Standard dialogs
  | 'dialog-md'   // 60vh - Medium dialogs
  | 'dialog-lg'   // 80vh - Large dialogs
  | 'dialog-xl';  // 90vh - Maximum dialog height

/**
 * All dimension tokens
 */
export type DimensionTokens =
  | ColumnWidths
  | ModalWidths
  | ContentHeights
  | DialogHeights;

// =============================================================================
// TYPOGRAPHY SYSTEM TYPES
// =============================================================================

/**
 * Font family tokens
 */
export type FontFamilies =
  | 'font-sf-pro'
  | 'font-sf-pro-display';

/**
 * Text shadow tokens
 */
export type TextShadows =
  | 'text-shadow-sm'
  | 'text-shadow'
  | 'text-shadow-md'
  | 'text-shadow-lg'
  | 'text-shadow-xl'
  | 'text-shadow-none'
  | 'text-shadow-subtle'
  | 'text-shadow-light'
  | 'text-shadow-medium'
  | 'text-shadow-strong'
  | 'text-shadow-glow-yellow'
  | 'text-shadow-glow-gold'
  | 'text-shadow-glow-blue'
  | 'text-shadow-glow-green'
  | 'text-shadow-glow-purple'
  | 'text-shadow-heading'
  | 'text-shadow-subheading'
  | 'text-shadow-body'
  | 'text-shadow-inset'
  | 'text-shadow-outline';

// =============================================================================
// Z-INDEX SYSTEM TYPES
// =============================================================================

/**
 * Z-index layer tokens
 */
export type ZIndexLayers =
  | 'z-base'         // 0
  | 'z-below'        // -1
  | 'z-above'        // 1
  | 'z-content'      // 10
  | 'z-elevated'     // 20
  | 'z-overlay'      // 30
  | 'z-nav'          // 40
  | 'z-header'       // 50
  | 'z-dropdown'     // 100
  | 'z-popup'        // 200
  | 'z-modal'        // 300
  | 'z-tooltip'      // 400
  | 'z-notification' // 500
  | 'z-loading'      // 600
  | 'z-skip-nav'     // 9999
  | 'z-tooltip-high' // 50000
  | 'z-max';         // 99999

// =============================================================================
// COMPONENT VARIANT TYPES
// =============================================================================

/**
 * StatCard variant types
 */
export type StatCardVariant =
  | 'default'
  | 'success'
  | 'warning'
  | 'error'
  | 'purple'
  | 'gold';

/**
 * Button variant types (extends Shadcn/ui)
 */
export type ButtonVariant =
  | 'default'
  | 'destructive'
  | 'outline'
  | 'secondary'
  | 'ghost'
  | 'link';

/**
 * Button size types
 */
export type ButtonSize =
  | 'default'
  | 'sm'
  | 'lg'
  | 'icon';

/**
 * Badge variant types
 */
export type BadgeVariant =
  | 'default'
  | 'secondary'
  | 'destructive'
  | 'outline'
  | 'success'
  | 'warning';

/**
 * Modal size types (BaseModal)
 */
export type ModalSize =
  | 'sm'
  | 'md'
  | 'lg'
  | 'xl'
  | '2xl'
  | '3xl'
  | '4xl'
  | 'full'
  | 'modal-1200'
  | 'modal-1400';

// =============================================================================
// CHART SYSTEM TYPES
// =============================================================================

/**
 * Chart theme palette types
 */
export type ChartPalette =
  | 'default'
  | 'financial'
  | 'sales'
  | 'crm'
  | 'delivery'
  | 'expenses';

/**
 * Chart color keys
 */
export type ChartColorKey =
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'secondary'
  | 'cyan'
  | 'amber'
  | 'lime'
  | 'indigo'
  | 'pink'
  | 'teal';

// =============================================================================
// UTILITY TYPES
// =============================================================================

/**
 * CSS class name with design token
 */
export type TokenizedClassName<T extends string> = `${string}${T}${string}`;

/**
 * Background color class names
 */
export type BackgroundColorClass = TokenizedClassName<`bg-${ColorTokens}`>;

/**
 * Text color class names
 */
export type TextColorClass = TokenizedClassName<`text-${ColorTokens}`>;

/**
 * Border color class names
 */
export type BorderColorClass = TokenizedClassName<`border-${ColorTokens}`>;

/**
 * Width class names with design tokens
 */
export type WidthClass = TokenizedClassName<`w-${ColumnWidths | ModalWidths}`>;

/**
 * Height class names with design tokens
 */
export type HeightClass = TokenizedClassName<`h-${ContentHeights | DialogHeights}`>;

/**
 * Design token validation utility
 */
export interface DesignTokenValidation {
  isValidColorToken: (token: string) => token is ColorTokens;
  isValidDimensionToken: (token: string) => token is DimensionTokens;
  isValidZIndexToken: (token: string) => token is ZIndexLayers;
}

// =============================================================================
// COMPONENT PROP TYPES
// =============================================================================

/**
 * Props that accept color tokens
 */
export interface ColorTokenProps {
  /**
   * Background color using design tokens
   * @example "bg-accent-gold-100" | "bg-primary-black"
   */
  backgroundColor?: BackgroundColorClass;

  /**
   * Text color using design tokens
   * @example "text-accent-gold-100" | "text-foreground"
   */
  textColor?: TextColorClass;

  /**
   * Border color using design tokens
   * @example "border-accent-gold-100" | "border-border"
   */
  borderColor?: BorderColorClass;
}

/**
 * Props that accept dimension tokens
 */
export interface DimensionTokenProps {
  /**
   * Width using design tokens
   * @example "w-modal-1200" | "w-col-lg"
   */
  width?: WidthClass;

  /**
   * Height using design tokens
   * @example "h-content-md" | "h-dialog-lg"
   */
  height?: HeightClass;

  /**
   * Maximum width for modals
   * @example "modal-1200" | "modal-lg"
   */
  maxWidth?: ModalWidths;
}

/**
 * Complete design system props
 */
export interface DesignSystemProps extends ColorTokenProps, DimensionTokenProps {
  /**
   * Z-index layer
   * @example "z-modal" | "z-tooltip"
   */
  layer?: ZIndexLayers;

  /**
   * Font family
   * @example "font-sf-pro-display"
   */
  fontFamily?: FontFamilies;

  /**
   * Text shadow effect
   * @example "text-shadow-glow-gold"
   */
  textShadow?: TextShadows;
}

// =============================================================================
// VALIDATION CONSTANTS
// =============================================================================

/**
 * All valid color tokens for runtime validation
 */
export const VALID_COLOR_TOKENS: readonly ColorTokens[] = [
  // Primary colors
  'primary-black', 'primary-yellow',

  // Black scale
  'black-100', 'black-90', 'black-80', 'black-70', 'black-60',

  // Yellow scale
  'yellow-100', 'yellow-90', 'yellow-80', 'yellow-70', 'yellow-60',

  // Gray scale
  'gray-950', 'gray-900', 'gray-800', 'gray-700', 'gray-600', 'gray-500',
  'gray-400', 'gray-300', 'gray-200', 'gray-100', 'gray-50',

  // Accent colors
  'accent-blue', 'accent-green', 'accent-red', 'accent-purple', 'accent-orange',

  // Golden accent scale
  'accent-gold-100', 'accent-gold-90', 'accent-gold-80', 'accent-gold-70',
  'accent-gold-60', 'accent-gold-50', 'accent-gold-40', 'accent-gold-30',
  'accent-gold-20', 'accent-gold-10', 'accent-gold-5',

  // Chart colors
  'chart-1', 'chart-2', 'chart-3', 'chart-4', 'chart-5', 'chart-6', 'chart-7', 'chart-8',

  // Semantic colors
  'background', 'foreground', 'primary', 'primary-foreground', 'secondary',
  'secondary-foreground', 'muted', 'muted-foreground', 'accent', 'accent-foreground',
  'destructive', 'destructive-foreground', 'border', 'input', 'ring',
  'popover', 'popover-foreground', 'card', 'card-foreground',

  // Sidebar colors
  'sidebar', 'sidebar-foreground', 'sidebar-primary', 'sidebar-primary-foreground',
  'sidebar-accent', 'sidebar-accent-foreground', 'sidebar-border', 'sidebar-ring'
] as const;

/**
 * All valid dimension tokens for runtime validation
 */
export const VALID_DIMENSION_TOKENS: readonly DimensionTokens[] = [
  // Column widths
  'col-xs', 'col-sm', 'col-md', 'col-lg', 'col-xl', 'col-2xl', 'col-3xl', 'col-4xl', 'col-max',

  // Modal widths
  'modal-xs', 'modal-sm', 'modal-md', 'modal-lg', 'modal-xl', 'modal-2xl',
  'modal-3xl', 'modal-4xl', 'modal-1200', 'modal-1400', 'modal-full',

  // Content heights
  'content-xs', 'content-sm', 'content-md', 'content-lg', 'content-xl', 'content-2xl', 'content-full',

  // Dialog heights
  'dialog-xs', 'dialog-sm', 'dialog-md', 'dialog-lg', 'dialog-xl'
] as const;

// =============================================================================
// RUNTIME VALIDATION UTILITIES
// =============================================================================

/**
 * Validates if a string is a valid color token
 */
export const isValidColorToken = (token: string): token is ColorTokens => {
  return VALID_COLOR_TOKENS.includes(token as ColorTokens);
};

/**
 * Validates if a string is a valid dimension token
 */
export const isValidDimensionToken = (token: string): token is DimensionTokens => {
  return VALID_DIMENSION_TOKENS.includes(token as DimensionTokens);
};

/**
 * Validates if a string is a valid z-index token
 */
export const isValidZIndexToken = (token: string): token is ZIndexLayers => {
  const validZIndexTokens: readonly ZIndexLayers[] = [
    'z-base', 'z-below', 'z-above', 'z-content', 'z-elevated', 'z-overlay',
    'z-nav', 'z-header', 'z-dropdown', 'z-popup', 'z-modal', 'z-tooltip',
    'z-notification', 'z-loading', 'z-skip-nav', 'z-tooltip-high', 'z-max'
  ] as const;

  return validZIndexTokens.includes(token as ZIndexLayers);
};

/**
 * Design token validation utilities
 */
export const designTokenValidation: DesignTokenValidation = {
  isValidColorToken,
  isValidDimensionToken,
  isValidZIndexToken,
};

// =============================================================================
// EXPORT ALL TYPES
// =============================================================================

export type {
  // Color system
  PrimaryColors,
  BlackScale,
  YellowScale,
  GrayScale,
  AccentColors,
  AccentGoldScale,
  ChartColors,
  SemanticColors,
  SidebarColors,
  ColorTokens,

  // Dimension system
  ColumnWidths,
  ModalWidths,
  ContentHeights,
  DialogHeights,
  DimensionTokens,

  // Typography
  FontFamilies,
  TextShadows,

  // Z-index
  ZIndexLayers,

  // Component variants
  StatCardVariant,
  ButtonVariant,
  ButtonSize,
  BadgeVariant,
  ModalSize,

  // Chart system
  ChartPalette,
  ChartColorKey,

  // Utility types
  TokenizedClassName,
  BackgroundColorClass,
  TextColorClass,
  BorderColorClass,
  WidthClass,
  HeightClass,

  // Component props
  ColorTokenProps,
  DimensionTokenProps,
  DesignSystemProps,
};

/**
 * Default export for convenience
 */
export default {
  // Validation utilities
  isValidColorToken,
  isValidDimensionToken,
  isValidZIndexToken,
  designTokenValidation,

  // Constants
  VALID_COLOR_TOKENS,
  VALID_DIMENSION_TOKENS,
};