/**
 * Shared Module Barrel Export
 * Context7 Pattern: Centralized exports for clean imports
 * Optimized for tree-shaking and development experience
 */

// UI Components - Organized by category
export * from './ui/primitives/index';
export * from './ui/composite/index';
export * from './ui/layout/index';

// Hooks - Common utilities
export * from './hooks/common/index';

// Templates - High-level patterns
export * from './templates/index';

// Re-export specific commonly used items for convenience
export {
  // Core UI Components
  Button,
  Input,
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from './ui/primitives/index';

export {
  // Enhanced Components (Context7 Pattern)
  LoadingSpinner,
  EmptyState,
  StatCard,
  EntityCard,
  ProductEntityCard,
  CustomerEntityCard,
  SupplierEntityCard,
  AdvancedFilterPanel
} from './ui/composite/index';

export {
  // Essential Hooks (Context7 Pattern)
  usePagination,
  useFilters,
  useAdvancedFilters,
  useSupabaseQuery,
  useSupabaseMutation,
  useSupabaseCRUD,
  useFormWithToast
} from './hooks/common/index';

// Context7 Pattern: Type-only exports for better IntelliSense
export type {
  // Entity Card Types
  EntityCardProps,
  EntityCardAction,
  EntityCardBadge,
  EntityCardField,
  EntityVariant,
  EntitySize,
  BaseEntityProps,

  // Filter Types
  FilterConfig,
  ActiveFilter,
  FilterValue,
  FilterState,
  FilterFunctions,

  // Supabase Query Types
  QueryResult,
  MutationResult,
  SupabaseQueryConfig,
  SupabaseMutationConfig
} from './hooks/common/index';