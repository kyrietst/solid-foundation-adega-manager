/**
 * Container principal para gestão de inventário
 * Refatorado para usar componentes separados e hooks customizados
 * Reduzido de 741 para ~150 linhas seguindo SRP
 */

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';
import { Card, CardContent } from '@/shared/ui/primitives/card';
import { AlertTriangle } from 'lucide-react';
import { useSpecificPermissions } from '@/shared/hooks/auth/usePermissions';
import { Product, ProductFormData, InventoryFilters } from '@/types/inventory.types';
import { LoadingScreen } from '@/shared/ui/composite/loading-spinner';
import { usePagination } from '@/hooks/use-pagination';

// Componentes refatorados
import { InventoryHeader } from './inventory/InventoryHeader';
import { InventoryFilters as InventoryFiltersComponent } from './inventory/InventoryFilters';
import { InventoryGrid } from './inventory/InventoryGrid';
import { InventoryTable } from './inventory/InventoryTable';
import { ProductDialog } from './inventory/ProductDialog';

// Hooks customizados
import { useInventoryCalculations } from '@/features/inventory/hooks/useInventoryCalculations';
import { useProductFilters } from '@/hooks/common/useFilters';
import { useInventoryView } from '@/features/inventory/hooks/useInventoryView';
import { useInventoryOperations } from '@/features/inventory/hooks/useInventoryOperations';
import { useEntityDialogs } from '@/hooks/common/useDialogState';

export const InventoryNew = () => {
  const { canCreateProducts, canDeleteProducts } = useSpecificPermissions([
    'canCreateProducts', 
    'canDeleteProducts'
  ]);
  
  // Gerenciamento de dialogs
  const { create: createDialog, edit: editDialog, editingItem: editingProduct, openCreate, openEdit } = useEntityDialogs<Product>();

  // Query para produtos
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products', 'inventory'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name', { ascending: true });
      if (error) throw error;
      return data as Product[];
    },
  });

  // Hooks customizados
  const calculations = useInventoryCalculations(products);
  const { 
    filters,
    showFilters,
    setShowFilters,
    updateFilter,
    setSearchTerm,
    filteredItems: filteredProducts,
    totalFiltered,
    getUniqueValues
  } = useProductFilters(products);
  
  const { 
    viewMode, 
    setViewMode, 
    itemsPerPage, 
    setItemsPerPage 
  } = useInventoryView();
  
  const {
    createProduct,
    updateProduct,
    deleteProduct,
    isCreating,
    isUpdating,
    isDeleting
  } = useInventoryOperations();

  // Paginação
  const {
    currentPage,
    totalPages,
    paginatedItems: paginatedProducts,
    goToPage,
  } = usePagination(filteredProducts, {
    initialItemsPerPage: itemsPerPage,
    resetOnItemsChange: true
  });

  // Estado de filtros agora gerenciado pelo hook useProductFilters

  // Handlers
  const handleCreateProduct = async (productData: ProductFormData) => {
    await createProduct(productData);
    createDialog.close();
  };

  const handleUpdateProduct = async (productData: ProductFormData) => {
    if (!editingProduct) return;
    await updateProduct({ ...productData, id: editingProduct.id });
    editDialog.close();
  };

  const handleDeleteProduct = (id: string) => {
    deleteProduct(id);
  };

  const handleViewModeChange = (mode: 'grid' | 'table') => {
    setViewMode(mode);
    // Ajustar itens por página baseado no modo de visualização
    if (mode === 'grid') {
      setItemsPerPage(12);
    } else {
      setItemsPerPage(20);
    }
  };

  // Permissões obtidas via hook usePermissions

  if (isLoading) {
    return <LoadingScreen text="Carregando produtos..." />;
  }

  return (
    <div className="space-y-6">
      {/* Alert Banner para Estoque Baixo */}
      {calculations.lowStockProducts.length > 0 && (
        <Card className="border-adega-amber/30 bg-adega-amber/5 backdrop-blur-xl shadow-xl">
          <CardContent className="p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-adega-amber mr-3" />
              <div>
                <h4 className="font-semibold text-adega-amber">
                  {calculations.lowStockProducts.length} produtos com estoque baixo
                </h4>
                <p className="text-sm text-adega-amber/80">
                  Verifique os produtos que precisam de reposição
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Header com estatísticas e controles */}
      <InventoryHeader
        totalProducts={calculations.totalProducts}
        lowStockCount={calculations.lowStockProducts.length}
        totalValue={calculations.totalValue}
        turnoverStats={calculations.turnoverStats}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        onCreateProduct={openCreate}
        canCreateProduct={canCreateProducts}
      />

      {/* Filtros */}
      <InventoryFiltersComponent
        searchTerm={filters.searchTerm}
        onSearchChange={setSearchTerm}
        filters={filters}
        onFiltersChange={updateFilter}
        categories={getUniqueValues('category')}
        suppliers={getUniqueValues('supplier')}
        isOpen={showFilters}
        onToggle={() => setShowFilters(!showFilters)}
      />

      {/* Visualizações */}
      {viewMode === 'grid' ? (
        <InventoryGrid
          products={paginatedProducts}
          onEditProduct={openEdit}
          onDeleteProduct={handleDeleteProduct}
          canDeleteProduct={canDeleteProducts}
          isLoading={isLoading}
        />
      ) : (
        <InventoryTable
          products={paginatedProducts}
          onEditProduct={openEdit}
          onDeleteProduct={handleDeleteProduct}
          canDeleteProduct={canDeleteProducts}
          isLoading={isLoading}
        />
      )}

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <div className="bg-adega-charcoal/20 border border-white/10 rounded-lg p-4">
            {/* TODO: Implementar controles de paginação usando PaginationControls */}
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-adega-platinum/60">
                Página {currentPage} de {totalPages}
              </span>
              <div className="flex gap-2">
                <button 
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-adega-charcoal border border-white/10 rounded text-sm disabled:opacity-50"
                >
                  Anterior
                </button>
                <button 
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 bg-adega-charcoal border border-white/10 rounded text-sm disabled:opacity-50"
                >
                  Próxima
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dialogs */}
      <ProductDialog
        isOpen={createDialog.isOpen}
        onClose={createDialog.close}
        product={null}
        onSave={handleCreateProduct}
        canDelete={false}
      />

      <ProductDialog
        isOpen={editDialog.isOpen}
        onClose={editDialog.close}
        product={editingProduct}
        onSave={handleUpdateProduct}
        onDelete={handleDeleteProduct}
        canDelete={canDeleteProducts}
      />
    </div>
  );
};