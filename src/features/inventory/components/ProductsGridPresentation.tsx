/**
 * Apresentação pura do ProductsGrid
 * Componente sem lógica de negócio, apenas renderização
 */

import React from 'react';
import type { Product } from '@/types/inventory.types';
import { LoadingScreen } from '@/shared/ui/composite/loading-spinner';
import { EmptySearchResults } from '@/shared/ui/composite/empty-state';
import { PaginationControls } from '@/shared/ui/composite/pagination-controls';
import { BarcodeInput } from '@/features/inventory/components/BarcodeInput';
import { ProductsHeader } from './ProductsHeader';
import { ProductFilters } from './ProductFilters';
import { ProductGrid } from './ProductGrid';

export interface ProductsGridPresentationProps {
  // Dados processados
  products: Product[];
  currentProducts: Product[];
  categories: string[];

  // Estados
  isLoading: boolean;
  searchTerm: string;
  selectedCategory: string;
  isFiltersOpen: boolean;
  hasActiveFilters: boolean;
  filterDescription?: string;

  // Configuração
  showSearch: boolean;
  showFilters: boolean;
  gridColumns: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  className?: string;

  // Paginação
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
  totalItems: number;
  filteredCount: number;
  totalProducts: number;

  // Ações
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onFiltersToggle: (open: boolean) => void;
  onClearFilters: () => void;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (value: string) => void;
  onBarcodeScanned: (barcode: string) => void;
  onAddToCart: (product: Product) => void;
}

export const ProductsGridPresentation: React.FC<ProductsGridPresentationProps> = ({
  products,
  currentProducts,
  categories,
  isLoading,
  searchTerm,
  selectedCategory,
  isFiltersOpen,
  hasActiveFilters,
  filterDescription,
  showSearch,
  showFilters,
  gridColumns,
  className,
  currentPage,
  itemsPerPage,
  totalPages,
  totalItems,
  filteredCount,
  totalProducts,
  onSearchChange,
  onCategoryChange,
  onFiltersToggle,
  onClearFilters,
  onPageChange,
  onItemsPerPageChange,
  onBarcodeScanned,
  onAddToCart,
}) => {
  if (isLoading) {
    return <LoadingScreen text="Carregando produtos..." />;
  }

  return (
    <div className={`space-y-4 ${className || ''}`}>
      {/* Header com busca e filtros */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <ProductsHeader
            filteredCount={filteredCount}
            totalProducts={totalProducts}
            hasActiveFilters={hasActiveFilters}
          />
          
          <ProductFilters
            searchTerm={searchTerm}
            selectedCategory={selectedCategory}
            isFiltersOpen={isFiltersOpen}
            categories={categories}
            showSearch={showSearch}
            showFilters={showFilters}
            onSearchChange={onSearchChange}
            onCategoryChange={onCategoryChange}
            onFiltersToggle={onFiltersToggle}
          />
        </div>
        
        {/* Componente de código de barras */}
        <div className="max-w-md">
          <BarcodeInput
            onScan={onBarcodeScanned}
            placeholder="Escaneie o código para adicionar ao carrinho"
            autoFocus={false}
          />
        </div>
      </div>
      
      {/* Grid de produtos paginado */}
      {currentProducts.length === 0 ? (
        <EmptySearchResults
          searchTerm={filterDescription}
          onClearSearch={onClearFilters}
        />
      ) : (
        <>
          <ProductGrid
            products={currentProducts}
            gridColumns={gridColumns}
            onAddToCart={onAddToCart}
          />
          
          {/* Paginação */}
          <PaginationControls 
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={onPageChange}
            onItemsPerPageChange={onItemsPerPageChange}
            itemsPerPageOptions={[6, 12, 20, 30]}
            showItemsPerPage={true}
            showInfo={true}
            itemLabel="produtos"
          />
        </>
      )}
    </div>
  );
};