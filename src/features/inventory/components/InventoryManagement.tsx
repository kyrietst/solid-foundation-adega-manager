
/**
 * Componente principal de gerenciamento de inventário
 * v4.0: Refatorado para usar Sub-componentes (SRP) e Design System v2
 */

import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
// import { StandardPageHeader } from '@/shared/ui/composite/StandardPageHeader';
import { AddProductButton } from './ProductsHeader';
import { Button } from '@/shared/ui/primitives/button';
import { Loader2 } from 'lucide-react';
import { PaginationControls } from '@/shared/ui/composite/pagination-controls';
import { PremiumBackground } from '@/shared/ui/composite/PremiumBackground';
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
import { InventoryPagination } from './InventoryPagination';

// New Sub-components
import { InventoryFilters } from './InventoryFilters';
import { InventoryTabs, InventoryViewMode } from './InventoryTabs';

// Hooks
import { useDeletedProducts } from '../hooks/useDeletedProducts';
import { useAuth } from '@/app/providers/AuthContext';
import { useLowStockProducts } from '../hooks/useLowStockProducts';
import { useGlobalBarcodeScanner } from '@/shared/hooks/common/useGlobalBarcodeScanner';
import { useInventoryActions } from '../hooks/useInventoryActions';
import { useInventoryData } from '../hooks/useInventoryData';
import { useInventoryFilters } from '../hooks/useInventoryFilters';
import { cn } from '@/core/config/utils';

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
    totalPages,
    itemsPerPage
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

  const handleEditProduct = async (product: Product) => {
    const fresh = await fetchFreshProduct(product.id);
    if (fresh) { setSelectedProduct(fresh); setIsEditProductOpen(true); }
  };
  const handleAdjustStock = (product: Product) => { setSelectedProduct(product); setIsStockAdjustmentOpen(true); };
  const handleViewHistory = (product: Product) => { setSelectedProduct(product); setIsHistoryModalOpen(true); };
  const handleTransfer = (product: Product) => { setProductToTransfer(product); setIsTransferModalOpen(true); };

  return (
    <div className={cn("w-full h-[100dvh] flex flex-col relative z-10 overflow-hidden", className)}>
      <PremiumBackground />
      {/* Header Section */}
      <div className="flex-none px-8 py-6 pt-8 pb-6 z-10">
          <div className="flex flex-wrap justify-between items-end gap-4 mb-4">
             <div className="flex flex-col gap-1">
               <p className="text-zinc-500 text-sm font-medium tracking-widest uppercase">Módulo de Logística</p>
               <h2 className="text-white text-3xl md:text-4xl font-bold leading-tight tracking-tight">GESTÃO DE ESTOQUE</h2>
             </div>
             <div className="flex gap-3">
               <Button 
                variant="outline"
                className="flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-sm font-semibold hover:border-[#f9cb15] hover:text-[#f9cb15] transition-colors"
               >
                 <span className="material-symbols-outlined text-[20px]">cloud_download</span>
                 <span>Exportar</span>
               </Button>
               {viewMode === 'active' && (
                 <Button
                   onClick={() => setIsAddProductOpen(true)}
                   className="flex items-center justify-center gap-2 h-10 px-6 rounded-xl bg-white text-black text-sm font-bold shadow-lg hover:bg-zinc-200 transition-colors"
                 >
                   {/* Using standard Plus icon if available or just text, based on other examples */}
                   <span>Novo Produto</span>
                 </Button>
               )}
             </div>
          </div>

          <div className="flex flex-col gap-4 mt-6">
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
             )}
          </div>
      </div>

        {/* Scrollable Grid Content */}
        <div className="flex-1 overflow-y-auto px-6 md:px-10 pb-40 scroll-smooth">
          {viewMode === 'active' && (
             <>
               {isLoadingAllProducts ? (
                  <LoadingScreen text={`Carregando produtos da Loja ${selectedStore}...`} />
                ) : filteredAndMappedProducts.length === 0 ? (
                  <EmptySearchResults searchTerm="produtos" onClearSearch={() => setSearchQuery('')} />
                ) : (
                  <>
                    <InventoryGrid
                       products={filteredAndMappedProducts}
                       gridColumns={{ mobile: 1, tablet: 2, desktop: 3 }}
                       onViewDetails={handleViewDetails}
                       onEdit={handleEditProduct}
                       onAdjustStock={handleAdjustStock}
                       onTransfer={selectedStore === 1 ? handleTransfer : undefined}
                       glassEffect={false} // Card handles its own glass style now
                    />

                  </>
                )}
             </>
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
                   <div className="flex-1">
                     <InventoryGrid
                       products={lowStockQuery.products}
                       gridColumns={{ mobile: 1, tablet: 2, desktop: 3 }}
                       onViewDetails={handleViewDetails}
                       onEdit={handleEditProduct}
                       onAdjustStock={handleAdjustStock}
                       variant="warning"
                       glassEffect={false}
                     />
                   </div>
                   {lowStockQuery.hasMore && (
                     <div className="mt-4 flex justify-center">
                       <Button onClick={() => lowStockQuery.loadMore()} disabled={lowStockQuery.isLoadingMore} variant="outline" className="text-brand border-brand/30">
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

      {/* Floating Pagination Dock (Fixo no Rodapé) */}
      {viewMode === 'active' && totalPages > 1 && (
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#050505] via-[#050505]/95 to-transparent z-50 flex justify-center pb-8 pt-12 pointer-events-none">
            <div className="pointer-events-auto">
                <InventoryPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                />
            </div>
        </div>
      )}

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