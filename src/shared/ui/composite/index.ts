// UI Composite Components Barrel Export
export { EmptyState, EmptyProducts, EmptyCustomers, EmptySearchResults } from './empty-state';
export { LoadingSpinner, LoadingScreen } from './loading-spinner';
export { SearchInput } from './search-input';
export { StatCard } from './stat-card';
export { FilterToggle } from './filter-toggle';
export { PaginationControls } from './pagination-controls';
export { Skeleton, ProductCardSkeleton, CustomerCardSkeleton, TableRowSkeleton, ProductGridSkeleton, CustomerListSkeleton, MetricCardSkeleton, ChartSkeleton } from './skeleton';
export { OptimizedImage, ProductImage, CustomerAvatar } from './optimized-image';
export { MaintenancePlaceholder } from './maintenance-placeholder';
export { GlowingEffect } from './glowing-effect';
export { SimpleGlow } from './simple-glow';
export { SensitiveData, useSensitiveValue } from './sensitive-data';
export { default as ProfileCompleteness } from './profile-completeness';
export { BaseModal, useBaseModal, type BaseModalProps, type ModalSize } from './BaseModal';
export {
  EnhancedBaseModal,
  ModalSection,
  useEnhancedModal,
  type EnhancedBaseModalProps,
  type ModalType,
  type ModalAction
} from './EnhancedBaseModal';
export { 
  FormatDisplay, 
  CurrencyDisplay,
  DateDisplay,
  DateTimeDisplay,
  PhoneDisplay,
  CpfDisplay,
  CnpjDisplay,
  PercentageDisplay,
  NumberDisplay,
  NumberCompactDisplay,
  type FormatDisplayProps,
  type FormatType
} from './FormatDisplay';
export { DataTable, type DataTableProps } from './DataTable';
// DEPRECATED: PageTitle has been replaced by PageHeader
// export { PageTitle, type PageTitleProps } from './PageTitle';

// Context7 Pattern: Enhanced Components (New DRY Refactoring)
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
} from './EntityCard';

export {
  ProductEntityCard,
  CustomerEntityCard,
  SupplierEntityCard
} from './entity-cards/index';

export {
  AdvancedFilterPanel,
  MemoizedAdvancedFilterPanel
} from './AdvancedFilterPanel';