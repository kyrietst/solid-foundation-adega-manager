/**
 * Container do ProductsGrid - Coordena dados e lógica
 * Implementa padrão Container/Presentational
 */

import React from 'react';
import type { Product } from '@/types/inventory.types';
import { useProductsGridLogic, ProductsGridConfig } from '@/shared/hooks/products/useProductsGridLogic';
import { ProductsGridPresentation } from './ProductsGridPresentation';
import { ProductSelectionModal } from '@/features/sales/components/ProductSelectionModal';

export interface ProductsGridContainerProps extends ProductsGridConfig {
  showAddButton?: boolean;
  showHeader?: boolean;
  mode?: 'sales' | 'inventory';
  onAddProduct?: () => void;
  onViewDetails?: (product: Product) => void;
  onEdit?: (product: Product) => void;
  onAdjustStock?: (product: Product) => void;
  variant?: 'default' | 'premium' | 'success' | 'warning' | 'error';
  glassEffect?: boolean;
}

export const ProductsGridContainer: React.FC<ProductsGridContainerProps> = ({
  showAddButton,
  showHeader = true,
  mode = 'sales',
  onAddProduct,
  onViewDetails,
  onEdit,
  onAdjustStock,
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
  } = useProductsGridLogic(config);

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