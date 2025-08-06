/**
 * Tipos padronizados para event handlers
 * Garante consistência de nomenclatura em toda aplicação
 */

// Event handlers genéricos
export interface BaseEventHandlers<T = any> {
  onSelect?: (item: T) => void;
  onCreate?: (data?: Partial<T>) => void;
  onEdit?: (item: T) => void;
  onDelete?: (id: string) => void;
  onView?: (item: T) => void;
  onUpdate?: (item: T) => void;
  onCancel?: () => void;
  onSave?: (data: T) => void;
  onClose?: () => void;
  onOpen?: (data?: any) => void;
}

// Event handlers para listas/grids
export interface ListEventHandlers<T = any> extends BaseEventHandlers<T> {
  onSort?: (field: keyof T, direction: 'asc' | 'desc') => void;
  onFilter?: (filters: Record<string, any>) => void;
  onSearch?: (term: string) => void;
  onPageChange?: (page: number) => void;
  onItemsPerPageChange?: (count: number) => void;
}

// Event handlers para formulários
export interface FormEventHandlers<T = any> {
  onSubmit?: (data: T) => void;
  onCancel?: () => void;
  onReset?: () => void;
  onFieldChange?: (field: keyof T, value: any) => void;
  onValidate?: (data: T) => boolean | string[];
}

// Event handlers para modal/dialog
export interface DialogEventHandlers<T = any> {
  onOpen?: (data?: T) => void;
  onClose?: () => void;
  onConfirm?: (data?: T) => void;
  onCancel?: () => void;
}

// Event handlers específicos para entidades

// Products
export interface ProductEventHandlers extends BaseEventHandlers {
  onAddToCart?: (productId: string, quantity?: number) => void;
  onUpdateStock?: (productId: string, newStock: number) => void;
  onToggleActive?: (productId: string) => void;
  onDuplicate?: (productId: string) => void;
}

// Customers
export interface CustomerEventHandlers extends BaseEventHandlers {
  onSetPrimary?: (customerId: string) => void;
  onViewHistory?: (customerId: string) => void;
  onSendEmail?: (customerId: string) => void;
  onExport?: (customerIds: string[]) => void;
}

// Sales
export interface SaleEventHandlers extends BaseEventHandlers {
  onProcess?: (saleData: any) => void;
  onRefund?: (saleId: string) => void;
  onPrintReceipt?: (saleId: string) => void;
  onMarkPaid?: (saleId: string) => void;
  onUpdateStatus?: (saleId: string, status: string) => void;
}

// Cart
export interface CartEventHandlers {
  onAddItem?: (item: any) => void;
  onRemoveItem?: (itemId: string) => void;
  onUpdateQuantity?: (itemId: string, quantity: number) => void;
  onClearCart?: () => void;
  onCheckout?: () => void;
  onApplyDiscount?: (discount: number) => void;
  onSelectCustomer?: (customerId: string) => void;
}

// Navigation
export interface NavigationEventHandlers {
  onNavigate?: (path: string) => void;
  onGoBack?: () => void;
  onRefresh?: () => void;
  onMenuToggle?: () => void;
}

// File operations
export interface FileEventHandlers {
  onUpload?: (files: File[]) => void;
  onDownload?: (fileId: string) => void;
  onDelete?: (fileId: string) => void;
  onPreview?: (fileId: string) => void;
}

// Utility types for props
export type WithEventHandlers<T, H extends Record<string, any>> = T & H;

// Helper to extract handler props
export type ExtractHandlers<T> = {
  [K in keyof T as K extends `on${string}` ? K : never]: T[K];
};

// Component props pattern
export interface ComponentWithHandlers<T = any> {
  data?: T[];
  loading?: boolean;
  error?: string | null;
  handlers?: BaseEventHandlers<T>;
}