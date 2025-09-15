// Shared Hooks Common Export
export { useDebounce } from './use-debounce';
export { usePagination } from './use-pagination';
export { useFormWithToast } from './use-form-with-toast';
export { useEntity } from './use-entity';
export { useEntityAdvanced } from './use-entity-advanced';
export { useAsyncOperation } from './useAsyncOperation';
export { useConfirmation } from './useConfirmation';
export { useDialogState } from './useDialogState';
export { useErrorHandler } from './useErrorHandler';
export { useFilters } from './useFilters';
export { useFormProtection } from './useFormProtection';
export { useFormValidation } from './useFormValidation';
export { useModalForm } from './useModalForm';
export { useTableData } from './useTableData';
export { useTimeout } from './useTimeout';
export { useVirtualizedTable } from './useVirtualizedTable';
export { useNotifications } from './useNotifications';
export { 
  useFormatting,
  useCurrencyFormatter,
  useDateFormatter,
  type FormattingOptions
} from './useFormatting';
export { 
  useStandardForm, 
  useModalForm as useStandardModalForm, 
  useEntityForm,
  type UseStandardFormConfig,
  type UseStandardFormReturn
} from './useStandardForm';
export {
  useDataTable,
  type DataTableColumn,
  type UseDataTableConfig,
  type UseDataTableReturn
} from './useDataTable';

// Context7 Pattern: Enhanced Hooks (New DRY Refactoring)
export {
  useFilters,
  useAdvancedFilters,
  useProductFilters,
  useCustomerFilters,
  createProductFilterConfigs,
  createCustomerFilterConfigs,
  createSupplierFilterConfigs,
  type FilterConfig,
  type ActiveFilter,
  type FilterValue,
  type FilterState,
  type FilterFunctions,
  type FilterOptions,
  type UseFiltersConfig
} from './useFilters';

export {
  useSupabaseQuery,
  useSupabaseMutation,
  useSupabaseCRUD,
  useProductsQuery,
  useCustomersQuery,
  useSuppliersQuery,
  useSalesQuery,
  SupabaseQueryError,
  SupabaseMutationError,
  type QueryResult,
  type MutationResult,
  type SupabaseQueryConfig,
  type SupabaseMutationConfig
} from './useSupabaseQuery';
