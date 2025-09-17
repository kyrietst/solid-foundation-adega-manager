/**
 * ESLint Design System Governance Rules
 *
 * Custom ESLint configuration specifically for enforcing design system compliance
 * across the Adega Manager codebase. Prevents regression and ensures token usage.
 *
 * PHASE 4 - Design System Transformation
 * Created: 2025-09-16
 * Purpose: Establish governance to maintain 98%+ design token coverage
 */

import { ESLint } from 'eslint';

// =============================================================================
// DESIGN TOKEN DETECTION PATTERNS
// =============================================================================

/**
 * Regex patterns for detecting design system violations
 */
const DESIGN_VIOLATIONS = {
  // Hardcoded color patterns
  HEX_COLORS: /#[0-9a-fA-F]{3,8}/g,
  RGB_COLORS: /rgba?\([^)]+\)/g,
  HSL_COLORS: /hsla?\([^)]+\)/g,

  // Hardcoded dimensions
  PIXEL_VALUES: /(\d+)px(?!.*\/\*\s*allowed\s*\*\/)/g,
  VIEWPORT_VALUES: /(\d+)v[hw](?!.*\/\*\s*allowed\s*\*\/)/g,

  // Arbitrary Tailwind values that should use tokens
  ARBITRARY_COLORS: /\[#[0-9a-fA-F]{3,8}\]/g,
  ARBITRARY_SIZES: /\[\d+(?:px|rem|em|vh|vw)\]/g,

  // CSS-in-JS violations
  INLINE_STYLES: /style\s*=\s*\{\{[^}]*(?:color|background|width|height|margin|padding)[^}]*\}\}/g,
};

/**
 * Approved design token patterns that should be used instead
 */
const APPROVED_TOKENS = {
  // Color tokens
  SEMANTIC_COLORS: [
    'primary', 'secondary', 'accent', 'muted', 'destructive',
    'background', 'foreground', 'border', 'input', 'ring',
    'popover', 'card', 'sidebar'
  ],

  // Adega Wine Cellar palette
  ADEGA_COLORS: [
    'primary-black', 'primary-yellow', 'black-100', 'black-90', 'black-80',
    'yellow-100', 'yellow-90', 'yellow-80', 'accent-gold-100', 'accent-gold-90',
    'gray-950', 'gray-900', 'gray-800', 'gray-700', 'gray-600', 'gray-500',
    'accent-blue', 'accent-green', 'accent-red', 'accent-purple', 'accent-orange'
  ],

  // Chart colors
  CHART_COLORS: [
    'chart-1', 'chart-2', 'chart-3', 'chart-4', 'chart-5',
    'chart-6', 'chart-7', 'chart-8'
  ],

  // Dimension tokens
  COLUMN_WIDTHS: [
    'col-xs', 'col-sm', 'col-md', 'col-lg', 'col-xl',
    'col-2xl', 'col-3xl', 'col-4xl', 'col-max'
  ],

  MODAL_WIDTHS: [
    'modal-xs', 'modal-sm', 'modal-md', 'modal-lg', 'modal-xl',
    'modal-2xl', 'modal-3xl', 'modal-4xl', 'modal-1200', 'modal-full'
  ],

  VIEWPORT_HEIGHTS: [
    'content-xs', 'content-sm', 'content-md', 'content-lg', 'content-xl',
    'dialog-xs', 'dialog-sm', 'dialog-md', 'dialog-lg', 'dialog-xl'
  ]
};

/**
 * Exceptions - Files or patterns that are allowed to have hardcoded values
 */
const ALLOWED_EXCEPTIONS = {
  // Files that can contain hardcoded values (with justification)
  FILES: [
    'tailwind.config.ts',           // Config defines the tokens
    'global.css',                   // CSS variables definition
    'effects/fluid-blob.tsx',       // Legacy Aceternity UI component
    'effects/tropical-dusk-glow.tsx', // Performance-optimized effect
    'search-bar-21st.tsx',          // Third-party UI component
    'ErrorBoundary.tsx',            // System component with specific styling
    '__tests__/**/*',               // Test files
    '**/*.test.tsx',                // Test files
    '**/*.spec.tsx',                // Test files
  ],

  // Patterns that are acceptable (with /* allowed */ comment)
  PATTERNS: [
    'rgba(0, 0, 0, 0.5)',          // Semi-transparent black overlays
    'rgba(255, 255, 255, 0.1)',   // Semi-transparent white highlights
    'transparent',                  // Transparent values
    'currentColor',                 // Dynamic color inheritance
    'inherit',                      // Value inheritance
  ],

  // Component props that need hardcoded values
  PROP_EXCEPTIONS: [
    'data-testid',                  // Testing attributes
    'aria-*',                       // Accessibility attributes
    'stroke-dasharray',             // SVG specific
    'viewBox',                      // SVG viewBox
  ]
};

// =============================================================================
// ESLINT CUSTOM RULES
// =============================================================================

/**
 * Rule: no-hardcoded-colors
 * Prevents hardcoded color values in className and style attributes
 */
const noHardcodedColors = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow hardcoded color values, use design tokens instead',
      category: 'Design System',
      recommended: true,
    },
    fixable: 'code',
    schema: []
  },

  create(context) {
    const sourceCode = context.getSourceCode();

    return {
      JSXAttribute(node) {
        if (node.name.name !== 'className' && node.name.name !== 'style') {
          return;
        }

        const value = sourceCode.getText(node.value);

        // Check for hardcoded colors
        const hexMatches = value.match(DESIGN_VIOLATIONS.HEX_COLORS);
        const rgbMatches = value.match(DESIGN_VIOLATIONS.RGB_COLORS);
        const hslMatches = value.match(DESIGN_VIOLATIONS.HSL_COLORS);

        if (hexMatches || rgbMatches || hslMatches) {
          // Check if it's an allowed exception
          const hasAllowedComment = value.includes('/* allowed */');
          const isException = ALLOWED_EXCEPTIONS.PATTERNS.some(pattern =>
            value.includes(pattern)
          );

          if (!hasAllowedComment && !isException) {
            context.report({
              node,
              message: `Hardcoded color found: ${hexMatches || rgbMatches || hslMatches}. Use design tokens from tailwind.config.ts instead.`,
              fix(fixer) {
                // Provide auto-fix suggestions for common colors
                const suggestions = getColorTokenSuggestions(value);
                if (suggestions.length > 0) {
                  return fixer.replaceText(node.value, `"${suggestions[0]}"`);
                }
                return null;
              }
            });
          }
        }
      }
    };
  }
};

/**
 * Rule: no-arbitrary-values
 * Prevents arbitrary Tailwind values that should use design tokens
 */
const noArbitraryValues = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow arbitrary Tailwind values, use design tokens instead',
      category: 'Design System',
      recommended: true,
    },
    schema: []
  },

  create(context) {
    const sourceCode = context.getSourceCode();

    return {
      JSXAttribute(node) {
        if (node.name.name !== 'className') {
          return;
        }

        const value = sourceCode.getText(node.value);

        // Check for arbitrary values
        const arbitraryColors = value.match(DESIGN_VIOLATIONS.ARBITRARY_COLORS);
        const arbitrarySizes = value.match(DESIGN_VIOLATIONS.ARBITRARY_SIZES);

        if (arbitraryColors || arbitrarySizes) {
          const hasAllowedComment = value.includes('/* arbitrary-allowed */');

          if (!hasAllowedComment) {
            context.report({
              node,
              message: `Arbitrary Tailwind value found: ${arbitraryColors || arbitrarySizes}. Use design tokens instead or add /* arbitrary-allowed */ comment with justification.`,
            });
          }
        }
      }
    };
  }
};

/**
 * Rule: prefer-semantic-colors
 * Encourages use of semantic color names over specific colors
 */
const preferSemanticColors = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Prefer semantic color names (primary, secondary) over specific colors',
      category: 'Design System',
      recommended: true,
    },
    schema: []
  },

  create(context) {
    const sourceCode = context.getSourceCode();

    return {
      JSXAttribute(node) {
        if (node.name.name !== 'className') {
          return;
        }

        const value = sourceCode.getText(node.value);

        // Check for specific color usage that could be semantic
        const specificColorPattern = /(blue|green|red|yellow|purple|orange)-\d+/g;
        const specificColors = value.match(specificColorPattern);

        if (specificColors) {
          context.report({
            node,
            message: `Consider using semantic colors (primary, secondary, accent) instead of specific colors: ${specificColors.join(', ')}`,
          });
        }
      }
    };
  }
};

/**
 * Rule: require-size-tokens
 * Enforces use of standardized size tokens for common dimensions
 */
const requireSizeTokens = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Require size tokens for common dimensions (modals, tables, etc.)',
      category: 'Design System',
      recommended: true,
    },
    schema: []
  },

  create(context) {
    const sourceCode = context.getSourceCode();

    return {
      JSXAttribute(node) {
        if (node.name.name !== 'className') {
          return;
        }

        const value = sourceCode.getText(node.value);

        // Check for hardcoded widths that should use tokens
        if (value.includes('w-[') && !value.includes('/* size-allowed */')) {
          const arbitraryWidth = value.match(/w-\[[^\]]+\]/g);
          if (arbitraryWidth) {
            context.report({
              node,
              message: `Use standardized width tokens instead of arbitrary values: ${arbitraryWidth.join(', ')}. Consider col-*, modal-*, or content-* tokens.`,
            });
          }
        }

        // Check for hardcoded heights
        if (value.includes('h-[') && !value.includes('/* size-allowed */')) {
          const arbitraryHeight = value.match(/h-\[[^\]]+\]/g);
          if (arbitraryHeight) {
            context.report({
              node,
              message: `Use standardized height tokens instead of arbitrary values: ${arbitraryHeight.join(', ')}. Consider content-*, dialog-* tokens.`,
            });
          }
        }
      }
    };
  }
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Suggests appropriate design tokens for common hardcoded colors
 */
function getColorTokenSuggestions(value) {
  const suggestions = [];

  // Common color mappings
  const colorMappings = {
    '#FFD700': 'text-accent-gold-100 or bg-accent-gold-100',
    '#FFDA04': 'text-primary-yellow or bg-primary-yellow',
    '#000000': 'text-primary-black or bg-primary-black',
    '#3b82f6': 'text-accent-blue or bg-accent-blue',
    '#10b981': 'text-accent-green or bg-accent-green',
    '#ef4444': 'text-accent-red or bg-accent-red',
    '#8b5cf6': 'text-accent-purple or bg-accent-purple',
    '#f97316': 'text-accent-orange or bg-accent-orange',
  };

  for (const [color, suggestion] of Object.entries(colorMappings)) {
    if (value.includes(color)) {
      suggestions.push(suggestion);
    }
  }

  return suggestions;
}

/**
 * Checks if a file is in the exception list
 */
function isFileException(filename) {
  return ALLOWED_EXCEPTIONS.FILES.some(pattern => {
    if (pattern.includes('*')) {
      const regex = new RegExp(pattern.replace(/\*/g, '.*'));
      return regex.test(filename);
    }
    return filename.includes(pattern);
  });
}

// =============================================================================
// EXPORT CONFIGURATION
// =============================================================================

// Create the plugin object with proper structure
const adegaPlugin = {
  meta: {
    name: 'eslint-plugin-adega-design-system',
    version: '1.0.0',
  },
  rules: {
    'no-hardcoded-colors': noHardcodedColors,
    'no-arbitrary-values': noArbitraryValues,
    'prefer-semantic-colors': preferSemanticColors,
    'require-size-tokens': requireSizeTokens,
  }
};

export const designSystemConfig = {
  plugins: {
    'adega': adegaPlugin
  },
  rules: {
    // Warning level rules - Enforces governance but allows development flow
    'adega/no-hardcoded-colors': 'warn',
    'adega/require-size-tokens': 'warn',
    'adega/no-arbitrary-values': 'warn',
    'adega/prefer-semantic-colors': 'warn',
  }
};

export default designSystemConfig;