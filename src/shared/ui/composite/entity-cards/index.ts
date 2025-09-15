/**
 * Entity Cards Barrel Export
 * Centralized export for all specialized EntityCard components
 * Following Context7 patterns for clean imports
 */

// Base EntityCard and types
export {
  EntityCard,
  MemoizedEntityCard,
  type EntityCardProps,
  type EntityCardAction,
  type EntityCardBadge,
  type EntityCardField,
  type EntityVariant,
  type EntitySize,
  type BaseEntityProps
} from '../EntityCard';

// Specialized Entity Cards
export { ProductEntityCard } from './ProductEntityCard';
export { CustomerEntityCard } from './CustomerEntityCard';
export { SupplierEntityCard } from './SupplierEntityCard';

// Default exports for convenience
export { default as DefaultProductEntityCard } from './ProductEntityCard';
export { default as DefaultCustomerEntityCard } from './CustomerEntityCard';
export { default as DefaultSupplierEntityCard } from './SupplierEntityCard';