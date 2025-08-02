/**
 * Base Components - Componentes reutilizáveis para padrões comuns
 * Exportações centralizadas dos componentes base do sistema
 */

// Layout Components
export { PageContainer } from './PageContainer';
export type { PageContainerProps } from './PageContainer';

export { SectionHeader } from './SectionHeader';
export type { SectionHeaderProps } from './SectionHeader';

// Data Display Components
export { DataGrid } from './DataGrid';
export type { DataGridProps } from './DataGrid';

export { DataTable } from './DataTable';
export type { DataTableProps, TableColumn } from './DataTable';

// Loading Components
export { LoadingGrid } from './LoadingGrid';
export type { LoadingGridProps } from './LoadingGrid';

export { LoadingTable } from './LoadingTable';
export type { LoadingTableProps } from './LoadingTable';

// Form Components
export { FormDialog } from './FormDialog';
export type { FormDialogProps } from './FormDialog';

export { FilterPanel } from './FilterPanel';
export type { FilterPanelProps, FilterGroup, ActiveFilter } from './FilterPanel';