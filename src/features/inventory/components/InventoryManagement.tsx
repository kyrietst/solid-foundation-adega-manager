
/**
 * Componente principal de gerenciamento de inventário
 * v4.0: Refatorado para usar Sub-componentes (SRP)
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';
import { useGlassmorphismEffect } from '@/shared/hooks/ui/useGlassmorphismEffect';
import { PageHeader } from '@/shared/ui/composite/PageHeader';
import { AddProductButton } from './ProductsHeader';
import { Button } from '@/shared/ui/primitives/button';
import { Loader2 } from 'lucide-react';
import { PaginationControls } from '@/shared/ui/composite/pagination-controls';
import { useCategories } from '@/shared/hooks/common/use-categories';

// Modais
import { NewProductModal } from './NewProductModal';
import { SimpleProductViewModal } from './SimpleProductViewModal';
import { SimpleEditProductModal } from './SimpleEditProductModal';
import { StockAdjustmentModal } from './StockAdjustmentModal';
import { StockHistoryModal } from './StockHistoryModal';
import { TransferToHoldingModal } from './TransferToHoldingModal';

// Components
import { DeletedProductsGrid } from './DeletedProductsGrid';
import { InventoryGrid } from './InventoryGrid';
import { LoadingScreen } from '@/shared/ui/composite/loading-spinner';
import { EmptySearchResults } from '@/shared/ui/composite/empty-state';
import { InventoryCountSheet } from './InventoryCountSheet';

// New Sub-components
import { InventoryFilters } from './InventoryFilters';
import { InventoryTabs, InventoryViewMode } from './InventoryTabs';

// Hooks
import { useDeletedProducts } from '../hooks/useDeletedProducts';
import { useAuth } from '@/app/providers/AuthContext';
import { useLowStockProducts } from '../hooks/useLowStockProducts';
import { useGlobalBarcodeScanner } from '@/shared/hooks/common/useGlobalBarcodeScanner';
import { useInventoryActions, SimpleEditProductFormData } from '../hooks/useInventoryActions';
import { useInventoryData } from '../hooks/useInventoryData';
import { useInventoryFilters } from '../hooks/useInventoryFilters';

import type { Product } from '@/core/types/inventory.types';

interface InventoryManagementProps {
  className?: string;
  // Props legado mantidas para compatibilidade, mas podem ser removidas se não usadas
  showAddButton?: boolean;
  showSearch?: boolean;
  showFilters?: boolean;
  onProductSelect?: (product: Product) => void;
}

const InventoryManagement: React.FC<InventoryManagementProps> = ({ className }) => {
  // State: URL & View Mode
  const [searchParams] = useSearchParams();
  const urlTab = searchParams.get('tab');
  const [viewMode, setViewMode] = useState<InventoryViewMode>(
    urlTab === 'alerts' ? 'alerts' : urlTab === 'count-sheet' ? 'count-sheet' : 'active'
  );

  // State: Modals
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isEditProductOpen, setIsEditProductOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isStockAdjustmentOpen, setIsStockAdjustmentOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [productToTransfer, setProductToTransfer] = useState<Product | null>(null);

  // Hooks & Context
  const queryClient = useQueryClient();
  const { handleMouseMove } = useGlassmorphismEffect();
  const { userRole, loading } = useAuth();
  const { data: categories = [] } = useCategories();
  const isAdmin = !loading && userRole === 'admin';

  // Data Fetching
  const { data: deletedProducts = [], isLoading: isLoadingDeleted } = useDeletedProducts();
  const lowStockQuery = useLowStockProducts();

  // New Data Hook
  const { data: allProducts = [], isLoading: isLoadingAllProducts } = useInventoryData(viewMode === 'active');

  // New Filters Hook
  const {
    selectedStore, setSelectedStore,
    selectedCategory, setSelectedCategory,
    showMissingCostsOnly, setShowMissingCostsOnly,
    searchQuery, setSearchQuery,
    currentPage, setCurrentPage,
    missingCostsCount,
    filteredProducts: filteredAndMappedProducts,
    totalItems,
    totalPages
  } = useInventoryFilters({ products: allProducts });

  // Actions Hook
  const {
    editProductMutation,
    handleRestoreProduct,
    restoringProductId,
    fetchFreshProduct
  } = useInventoryActions({
    onSuccess: () => setIsEditProductOpen(false)
  });

  // Scanner
  useGlobalBarcodeScanner({
    onScan: (code) => {
      setSearchQuery(code);
      setCurrentPage(1);
    },
    enabled: viewMode === 'active',
  });

  // Handlers
  const handleViewDetails = async (product: Product) => {
    const fresh = await fetchFreshProduct(product.id);
    if (fresh) { setSelectedProduct(fresh); setIsDetailsModalOpen(true); }
  };
  const handleSuccess = (productName: string, updatedData?: Partial<Product>) => {
    // ... (updates state)
    // Ensure updatedData matches expected shape if needed, or is partial
    console.log('Product updated:', productName, updatedData);
  };

  const handleEditProduct = async (product: Product) => {
    const fresh = await fetchFreshProduct(product.id);
    if (fresh) { setSelectedProduct(fresh); setIsEditProductOpen(true); }
  };
  const handleAdjustStock = (product: Product) => { setSelectedProduct(product); setIsStockAdjustmentOpen(true); };
  const handleViewHistory = (product: Product) => { setSelectedProduct(product); setIsHistoryModalOpen(true); };
  const handleTransfer = (product: Product) => { setProductToTransfer(product); setIsTransferModalOpen(true); };

  return (
    <div className={`w-full h-full flex flex-col ${className || ''}`}>
      <PageHeader title="GESTÃO DE ESTOQUE" count={allProducts?.length || 0} countLabel="produtos">
        {viewMode === 'active' && <AddProductButton onAddProduct={() => setIsAddProductOpen(true)} />}
      </PageHeader>

      <div
        className="flex-1 min-h-0 bg-black/80 backdrop-blur-sm border border-white/10 rounded-xl shadow-lg hero-spotlight p-4 flex flex-col transition-all duration-300"
        onMouseMove={handleMouseMove}
      >
        {isAdmin && (
          <InventoryTabs
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            activeCount={allProducts?.length || 0}
            deletedCount={deletedProducts.length}
            lowStockCount={lowStockQuery.totalLoaded}
          />
        )}

        {viewMode === 'active' && (
          <div className="flex-1 min-h-0 flex flex-col">
            <InventoryFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedStore={selectedStore}
              onStoreChange={setSelectedStore}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              showMissingCostsOnly={showMissingCostsOnly}
              onToggleMissingCosts={() => setShowMissingCostsOnly(!showMissingCostsOnly)}
              categories={categories as any[]}
              missingCostsCount={missingCostsCount}
            />

            {isLoadingAllProducts ? (
              <LoadingScreen text={`Carregando produtos da Loja ${selectedStore}...`} />
            ) : filteredAndMappedProducts.length === 0 ? (
              <EmptySearchResults searchTerm="produtos" onClearSearch={() => setSearchQuery('')} />
            ) : (
              <>
                <div className="flex-1 overflow-y-auto">
                  <InventoryGrid
                    products={filteredAndMappedProducts}
                    gridColumns={{ mobile: 1, tablet: 2, desktop: 3 }}
                    onViewDetails={handleViewDetails}
                    onEdit={handleEditProduct}
                    onAdjustStock={handleAdjustStock}
                    onTransfer={selectedStore === 1 ? handleTransfer : undefined}
                    variant="default"
                    glassEffect={true}
                  />
                </div>
                {totalPages > 1 && (
                  <div className="mt-4 flex justify-center">
                    <PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                  </div>
                )}
                <div className="mt-2 text-center text-sm text-white/50">
                  Mostrando {filteredAndMappedProducts.length} de {filteredAndMappedProducts.length} produtos
                </div>
              </>
            )}
          </div>
        )}

        {viewMode === 'deleted' && (
          <DeletedProductsGrid
            products={deletedProducts}
            isLoading={isLoadingDeleted}
            onRestore={handleRestoreProduct}
            restoringProductId={restoringProductId}
          />
        )}

        {viewMode === 'alerts' && (
          <div className="flex-1 min-h-0 flex flex-col">
            {lowStockQuery.isLoading ? (
              <LoadingScreen text="Carregando alertas..." />
            ) : lowStockQuery.products.length === 0 ? (
              <EmptySearchResults searchTerm="alertas" onClearSearch={() => setViewMode('active')} />
            ) : (
              <>
                <div className="flex-1 overflow-y-auto">
                  <InventoryGrid
                    products={lowStockQuery.products}
                    gridColumns={{ mobile: 1, tablet: 2, desktop: 3 }}
                    onViewDetails={handleViewDetails}
                    onEdit={handleEditProduct}
                    onAdjustStock={handleAdjustStock}
                    variant="warning"
                    glassEffect={true}
                  />
                </div>
                {lowStockQuery.hasMore && (
                  <div className="mt-4 flex justify-center">
                    <Button onClick={() => lowStockQuery.loadMore()} disabled={lowStockQuery.isLoadingMore} variant="outline" className="text-amber-300 border-amber-500/30">
                      {lowStockQuery.isLoadingMore ? <Loader2 className="animate-spin mr-2" /> : 'Carregar Mais'}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {viewMode === 'count-sheet' && <InventoryCountSheet />}
      </div>

      {/* Modals */}
      <NewProductModal isOpen={isAddProductOpen} onClose={() => setIsAddProductOpen(false)} onSuccess={() => queryClient.invalidateQueries({ queryKey: ['products'] })} />
      
      <SimpleProductViewModal 
        product={isDetailsModalOpen ? selectedProduct : null} 
        isOpen={isDetailsModalOpen} 
        onClose={() => { setIsDetailsModalOpen(false); setSelectedProduct(null); }} 
        onEdit={handleEditProduct} 
        onAdjustStock={handleAdjustStock} 
        onViewHistory={handleViewHistory} 
      />
      
      <StockAdjustmentModal 
        productId={isStockAdjustmentOpen ? (selectedProduct?.id || '') : ''} 
        isOpen={isStockAdjustmentOpen} 
        onClose={() => { setIsStockAdjustmentOpen(false); setSelectedProduct(null); }} 
        onSuccess={() => { queryClient.invalidateQueries({ queryKey: ['products'] }); setIsStockAdjustmentOpen(false); }} 
      />
      
      <SimpleEditProductModal 
        isOpen={isEditProductOpen} 
        onClose={() => { setIsEditProductOpen(false); setSelectedProduct(null); }} 
        product={isEditProductOpen ? (selectedProduct as any) : null} 
        onSubmit={(data) => { if (selectedProduct) editProductMutation.mutate({ productData: data as any, selectedProduct }); }} 
        isLoading={editProductMutation.isPending} 
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['products'] })} 
      />
      
      <StockHistoryModal 
        product={isHistoryModalOpen ? selectedProduct : null} 
        isOpen={isHistoryModalOpen} 
        onClose={() => setIsHistoryModalOpen(false)} 
      />
      
      <TransferToHoldingModal 
        product={isTransferModalOpen ? productToTransfer : null} 
        isOpen={isTransferModalOpen} 
        onClose={() => { setIsTransferModalOpen(false); setProductToTransfer(null); }} 
        onSuccess={() => { queryClient.invalidateQueries({ queryKey: ['products'] }); queryClient.invalidateQueries({ queryKey: ['products', 'for-store-toggle'] }); }} 
      />
    </div>
  );
};

export default InventoryManagement;