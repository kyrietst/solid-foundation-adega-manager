/**
 * Container do ProductsGrid - Coordena dados e lógica
 * Implementa padrão Container/Presentational
 */

import React from 'react';
import { Product } from '@/core/types/inventory.types';
import { useProductsGridLogic, ProductsGridConfig } from '@/shared/hooks/products/useProductsGridLogic';
import type { StockFilterType } from '@/shared/hooks/products/useProductFilters';
import { ProductsGridPresentation } from './ProductsGridPresentation';
import { ProductSelectionModal } from '@/features/sales/components/ProductSelectionModal';

export interface ProductsGridContainerProps extends ProductsGridConfig {
  showAddButton?: boolean;
  showHeader?: boolean;
  mode?: 'sales' | 'inventory';
  storeFilter?: string; // Legacy: mantido para compatibilidade (não usado)
  stockFilter?: StockFilterType; // 📦 Filtro de estoque (low-stock)
  onAddProduct?: () => void;
  onViewDetails?: (product: Product) => void;
  onEdit?: (product: Product) => void;
  onAdjustStock?: (product: Product) => void;
  onTransfer?: (product: Product) => void; // 🏪 v3.4.0 - Transferência entre lojas
  variant?: 'default' | 'premium' | 'success' | 'warning' | 'error';
  glassEffect?: boolean;
}

export const ProductsGridContainer: React.FC<ProductsGridContainerProps> = ({
  showAddButton,
  showHeader = true,
  mode = 'sales',
  storeFilter, // 🏪 Filtro de loja
  stockFilter, // 📦 Filtro de estoque
  onAddProduct,
  onViewDetails,
  onEdit,
  onAdjustStock,
  onTransfer, // 🏪 v3.4.0
  variant = 'default',
  glassEffect = true,
  ...config
}) => {
  // Lógica centralizada
  const {
    // Dados
    products,
    currentProducts,
    categories,

    // Estados
    isLoading,
    searchTerm,
    selectedCategory,
    isFiltersOpen,
    hasActiveFilters,
    filterDescription,

    // Estados do modal de seleção
    isModalOpen,
    selectedProduct,

    // Configuração
    showSearch,
    showFilters,
    gridColumns,
    className,

    // Paginação
    currentPage,
    itemsPerPage,
    totalPages,
    totalItems,
    filteredCount,
    totalProducts,

    // Ações
    setSearchTerm,
    setSelectedCategory,
    setIsFiltersOpen,
    clearFilters,
    goToPage,
    setItemsPerPage,
    handleBarcodeScanned,
    handleAddToCart,

    // Ações do modal de seleção
    openProductSelection,
    closeProductSelection,
    handleProductSelectionConfirm,
  } = useProductsGridLogic({ ...config, storeFilter, stockFilter });

  // Preparar props para apresentação
  const presentationProps = {
    // Dados processados
    products,
    currentProducts,
    categories,

    // Estados
    isLoading,
    searchTerm,
    selectedCategory,
    isFiltersOpen,
    hasActiveFilters,
    filterDescription,

    // Configuração
    showSearch,
    showFilters,
    showAddButton,
    showHeader,
    mode,
    gridColumns,
    className,
    variant,
    glassEffect,

    // Paginação
    currentPage,
    itemsPerPage,
    totalPages,
    totalItems,
    filteredCount,
    totalProducts,

    // Ações
    onSearchChange: setSearchTerm,
    onCategoryChange: setSelectedCategory,
    onFiltersToggle: setIsFiltersOpen,
    onClearFilters: clearFilters,
    onPageChange: goToPage,
    onItemsPerPageChange: (value: string) => setItemsPerPage(parseInt(value)),
    onBarcodeScanned: handleBarcodeScanned,
    onAddToCart: handleAddToCart,
    onOpenSelection: openProductSelection,
    onAddProduct,
    onViewDetails,
    onEdit,
    onAdjustStock,
    onTransfer, // 🏪 v3.4.0
    storeFilter, // 🏪 v3.4.0
  };

  return (
    <>
      <ProductsGridPresentation {...presentationProps} />

      {/* Modal de seleção de produto (unidade vs pacote) */}
      {selectedProduct && (
        <ProductSelectionModal
          isOpen={isModalOpen}
          onClose={closeProductSelection}
          onConfirm={handleProductSelectionConfirm}
          productId={selectedProduct.id}
        />
      )}
    </>
  );
};

export default ProductsGridContainer;