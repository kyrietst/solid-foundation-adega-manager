/**
 * Container do ProductsGrid - Coordena dados e lógica
 * Implementa padrão Container/Presentational
 */

import React from 'react';
import type { Product } from '@/types/inventory.types';
import { useProductsGridLogic, ProductsGridConfig } from '@/hooks/products/useProductsGridLogic';
import { ProductsGridPresentation } from './ProductsGridPresentation';

export interface ProductsGridContainerProps extends ProductsGridConfig {
  showAddButton?: boolean;
  onAddProduct?: () => void;
  variant?: 'default' | 'premium' | 'success' | 'warning' | 'error';
  glassEffect?: boolean;
}

export const ProductsGridContainer: React.FC<ProductsGridContainerProps> = ({ 
  showAddButton, 
  onAddProduct,
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
    onAddProduct,
  };

  return <ProductsGridPresentation {...presentationProps} />;
};

export default ProductsGridContainer;