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
import { ProductsHeader, AddProductButton } from './ProductsHeader';
import { ProductFilters } from './ProductFilters';
import { ProductGrid } from './ProductGrid';
import { InventoryGrid } from './InventoryGrid';
import { SearchBar21st } from '@/shared/ui/thirdparty/search-bar-21st';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/primitives/select';

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
  showAddButton?: boolean;
  showHeader?: boolean;
  mode?: 'sales' | 'inventory'; // Novo: determina se é para vendas ou estoque
  gridColumns: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  className?: string;
  variant?: 'default' | 'premium' | 'success' | 'warning' | 'error';
  glassEffect?: boolean;

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
  onBarcodeScanned: (barcode: string) => void | Promise<void>;
  onAddToCart: (product: Product) => void;
  onOpenSelection?: (product: Product) => void;
  onAddProduct?: () => void;
  onViewDetails?: (product: Product) => void;
  onEdit?: (product: Product) => void;
  onAdjustStock?: (product: Product) => void;
  onTransfer?: (product: Product) => void; // 🏪 v3.4.0 - Transferência entre lojas
  storeFilter?: string; // Legacy: não usado // 🏪 v3.4.0 - Qual loja está sendo exibida
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
  showAddButton,
  showHeader = true,
  mode = 'sales', // Padrão é modo vendas
  gridColumns,
  className,
  variant = 'default',
  glassEffect = true,
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
  onOpenSelection,
  onAddProduct,
  onViewDetails,
  onEdit,
  onAdjustStock,
  onTransfer, // 🏪 v3.4.0
  storeFilter, // 🏪 v3.4.0
}) => {
  if (isLoading) {
    return <LoadingScreen text="Carregando produtos..." />;
  }

  return (
    <div className={`flex flex-col h-full space-y-4 ${className || ''}`}>
      {/* Header com busca e filtros */}
      <div className="space-y-4">
        {showHeader && (
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <ProductsHeader
              filteredCount={filteredCount}
              totalProducts={totalProducts}
              hasActiveFilters={hasActiveFilters}
            />

            {/* SearchBar animada alinhada à direita */}
            {showSearch && (
              <div className="sm:w-64">
                <SearchBar21st
                  value={searchTerm}
                  onChange={onSearchChange}
                  placeholder="Buscar produtos..."
                  debounceMs={150}
                  disableResizeAnimation={true}
                />
              </div>
            )}
          </div>
        )}

        {!showHeader && showSearch && (
          <div className="flex justify-end">
            <div className="sm:w-64">
              <SearchBar21st
                value={searchTerm}
                onChange={onSearchChange}
                placeholder="Buscar produtos..."
                debounceMs={150}
                disableResizeAnimation={true}
              />
            </div>
          </div>
        )}

        {/* Código de barras, filtro de categoria e botão adicionar na mesma linha */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="max-w-md">
            <BarcodeInput
              onScan={onBarcodeScanned}
              placeholder="Escaneie o código para adicionar ao carrinho"
              autoFocus={false} // 🚫 v3.6.7 - Desativado para evitar roubo de foco do SearchBar
            />
          </div>

          {/* Filtro de categoria e botão adicionar alinhados à direita */}
          <div className="flex items-center gap-4">
            {showFilters && (
              <div className="sm:w-64">
                <Select value={selectedCategory} onValueChange={onCategoryChange}>
                  <SelectTrigger className="w-full h-12 bg-adega-charcoal/60 border-adega-gold/30 text-adega-platinum rounded-xl backdrop-blur-xl">
                    <SelectValue placeholder="Todas as categorias" />
                  </SelectTrigger>
                  <SelectContent className="bg-adega-charcoal/95 border-adega-gold/30 backdrop-blur-xl">
                    <SelectItem value="all" className="text-adega-platinum hover:bg-adega-graphite/50">
                      Todas as categorias
                    </SelectItem>
                    {categories.map(category => (
                      <SelectItem
                        key={category}
                        value={category}
                        className="text-adega-platinum hover:bg-adega-graphite/50"
                      >
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Botão adicionar produto */}
            <AddProductButton onAddProduct={showAddButton ? onAddProduct : undefined} />
          </div>
        </div>
      </div>

      {/* Grid de produtos paginado */}
      <div className="flex-1 flex flex-col min-h-0">
        {currentProducts.length === 0 ? (
          <EmptySearchResults
            searchTerm={filterDescription}
            onClearSearch={onClearFilters}
          />
        ) : (
          <>
            <div className="flex-1 min-h-0">
              {mode === 'inventory' ? (
                <InventoryGrid
                  products={currentProducts}
                  gridColumns={gridColumns}
                  onViewDetails={onViewDetails!}
                  onEdit={onEdit!}
                  onAdjustStock={onAdjustStock}
                  onTransfer={onTransfer}
                  storeFilter={storeFilter}
                  variant={variant}
                  glassEffect={glassEffect}
                />
              ) : (
                <ProductGrid
                  products={currentProducts}
                  gridColumns={gridColumns}
                  onAddToCart={onAddToCart}
                  onOpenSelection={onOpenSelection}
                  variant={variant}
                  glassEffect={glassEffect}
                />
              )}
            </div>

            {/* Paginação */}
            <div className="mt-4 flex-shrink-0">
              <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                onPageChange={onPageChange}
                onItemsPerPageChange={onItemsPerPageChange}
                itemsPerPageOptions={[12, 20, 30, 50]}
                showItemsPerPage={true}
                showInfo={true}
                itemLabel="produtos"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};