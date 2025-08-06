/**
 * Interfaces TypeScript para componentes de inventory refatorados
 */

import { Product, ProductFormData, InventoryFilters } from '@/core/types/inventory.types';

// Interfaces para componentes principais
export interface InventoryHeaderProps {
  totalProducts: number;
  lowStockCount: number;
  totalValue: number;
  turnoverStats: {
    fast: number;
    medium: number;
    slow: number;
  };
  viewMode: 'grid' | 'table';
  onViewModeChange: (mode: 'grid' | 'table') => void;
  onCreateProduct: () => void;
  canCreateProduct: boolean;
}

export interface InventoryFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  filters: InventoryFilters;
  onFiltersChange: (filters: InventoryFilters) => void;
  categories: string[];
  suppliers: string[];
  isOpen: boolean;
  onToggle: () => void;
}

export interface InventoryGridProps {
  products: Product[];
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  canDeleteProduct: boolean;
  isLoading?: boolean;
}

export interface InventoryTableProps {
  products: Product[];
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  canDeleteProduct: boolean;
  isLoading?: boolean;
}

export interface ProductDialogProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onSave: (data: ProductFormData) => void;
  onDelete?: (id: string) => void;
  canDelete?: boolean;
}

export interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  canDelete: boolean;
}

export interface ProductRowProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  canDelete: boolean;
}

export interface InventoryStatsProps {
  totalProducts: number;
  lowStockCount: number;
  totalValue: number;
  turnoverStats: {
    fast: number;
    medium: number;
    slow: number;
  };
}

// Interfaces para hooks
export interface InventoryCalculations {
  totalProducts: number;
  lowStockProducts: Product[];
  totalValue: number;
  turnoverStats: {
    fast: number;
    medium: number;
    slow: number;
  };
}

export interface InventoryViewState {
  viewMode: 'grid' | 'table';
  itemsPerPage: number;
  setViewMode: (mode: 'grid' | 'table') => void;
  setItemsPerPage: (count: number) => void;
}

export interface InventoryFilterState {
  searchTerm: string;
  filters: InventoryFilters;
  setSearchTerm: (term: string) => void;
  setFilters: (filters: InventoryFilters) => void;
  filteredProducts: Product[];
  categories: string[];
  suppliers: string[];
}

export interface InventoryOperations {
  createProduct: (data: ProductFormData) => void;
  updateProduct: (data: ProductFormData & { id: string }) => void;
  deleteProduct: (id: string) => void;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
}