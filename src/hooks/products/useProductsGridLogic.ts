/**
 * Hook coordenador para lógica do ProductsGrid
 * Combina todos os hooks especializados em uma interface única
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';
import { useCart } from '@/features/sales/hooks/use-cart';
import { useBarcode } from '@/features/inventory/hooks/use-barcode';
import { usePagination } from '@/shared/hooks/common/use-pagination';
import { useProductFilters } from './useProductFilters';
import { useProductCategories } from './useProductCategories';
import { useProductSelection, convertSelectionToCartItem } from '@/features/sales/hooks/useProductSelection';
import type { Product } from '@/types/inventory.types';
import type { ProductSelectionData } from '@/features/sales/components/ProductSelectionModal';

export interface ProductsGridConfig {
  showSearch?: boolean;
  showFilters?: boolean;
  initialCategory?: string;
  onProductSelect?: (product: Product) => void;
  gridColumns?: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  className?: string;
}

export const useProductsGridLogic = (config: ProductsGridConfig = {}) => {
  const {
    showSearch = true,
    showFilters = true,
    initialCategory = 'all',
    onProductSelect,
    gridColumns = { mobile: 1, tablet: 2, desktop: 3 },
    className
  } = config;

  const { addItem, addFromVariantSelection } = useCart();
  const { searchByBarcode } = useBarcode();
  
  // Hook de seleção de produtos (unidade vs pacote)
  const {
    isModalOpen,
    selectedProduct,
    openProductSelection,
    closeProductSelection,
    shouldShowSelection
  } = useProductSelection();

  // Query para buscar produtos
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products', 'available'],
    queryFn: async (): Promise<Product[]> => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name', { ascending: true });
        
      if (error) {
        console.error('Error fetching products:', error);
        throw error;
      }
      
      return data;
    },
  });

  // Lógica de filtros
  const {
    searchTerm,
    selectedCategory,
    isFiltersOpen,
    categories,
    filteredProducts,
    hasActiveFilters,
    filterDescription,
    setSearchTerm,
    setSelectedCategory,
    setIsFiltersOpen,
    clearFilters,
    totalProducts,
    filteredCount,
  } = useProductFilters(products, initialCategory);

  // Lógica de categorias
  const {
    categoryCounts,
    getProductsByCategory,
    categoryExists,
    getMostPopularCategory,
    totalCategories,
  } = useProductCategories(products);

  // Paginação
  const {
    currentPage,
    itemsPerPage,
    totalPages,
    totalItems,
    paginatedItems: currentProducts,
    goToPage,
    setItemsPerPage
  } = usePagination(filteredProducts, {
    initialItemsPerPage: 12,
    resetOnItemsChange: true
  });

  // Handler para código de barras escaneado
  const handleBarcodeScanned = async (barcode: string) => {
    console.log('[DEBUG] useProductsGridLogic - handleBarcodeScanned iniciado para:', barcode);
    
    const result = await searchByBarcode(barcode);
    
    console.log('[DEBUG] useProductsGridLogic - Resultado searchByBarcode:', {
      hasResult: !!result,
      productId: result?.product?.id,
      productName: result?.product?.name,
      stockQuantity: result?.product?.stock_quantity,
      price: result?.product?.price,
      type: result?.type
    });
    
    if (result) {
      // Verificações de validação melhoradas
      const product = result.product;
      const hasValidStock = product.stock_quantity > 0;
      const hasValidPrice = product.price && product.price > 0;
      
      console.log('[DEBUG] useProductsGridLogic - Validações:', {
        hasValidStock,
        hasValidPrice,
        stockQuantity: product.stock_quantity,
        price: product.price
      });
      
      if (hasValidStock && hasValidPrice) {
        // Determinar tipo, preço e quantidade baseado no resultado da busca
        const isPackageType = result.type === 'package';
        const itemPrice = isPackageType && product.package_price 
          ? product.package_price 
          : product.price;
        const packageUnits = product.package_units || 1;
        
        console.log('[DEBUG] useProductsGridLogic - Adicionando produto ao carrinho:', {
          id: product.id,
          name: product.name,
          type: result.type,
          price: itemPrice,
          packageUnits: packageUnits,
          maxQuantity: product.stock_quantity
        });
        
        addItem({
          id: product.id,
          name: product.name,
          price: itemPrice,
          maxQuantity: product.stock_quantity,
          type: result.type,
          packageUnits: isPackageType ? packageUnits : undefined
        });
        
        onProductSelect?.(product);
        console.log('[DEBUG] useProductsGridLogic - Produto adicionado com sucesso ao carrinho');
      } else {
        console.warn('[DEBUG] useProductsGridLogic - Produto não adicionado ao carrinho - validação falhou:', {
          hasValidStock,
          hasValidPrice,
          stockQuantity: product.stock_quantity,
          price: product.price
        });
      }
    } else {
      console.log('[DEBUG] useProductsGridLogic - Nenhum resultado retornado pelo searchByBarcode');
    }
  };

  // Handler para adicionar produto ao carrinho (clique manual)
  const handleAddToCart = (product: Product) => {
    console.log('[DEBUG] useProductsGridLogic - handleAddToCart iniciado para:', {
      id: product.id,
      name: product.name,
      hasPackageTracking: product.has_package_tracking,
      packageUnits: product.package_units
    });
    
    // Se o produto requer seleção (tem rastreamento de pacote), abrir modal
    if (shouldShowSelection(product)) {
      console.log('[DEBUG] useProductsGridLogic - Abrindo modal de seleção para produto:', product.name);
      openProductSelection(product);
    } else {
      // Senão, adicionar direto como unidade
      console.log('[DEBUG] useProductsGridLogic - Adicionando produto direto como unidade:', product.name);
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        maxQuantity: product.stock_quantity,
        type: 'unit'
      });
      onProductSelect?.(product);
    }
  };

  // Handler para confirmação da seleção no modal
  const handleProductSelectionConfirm = (selection: ProductSelectionData) => {
    if (!selectedProduct) {
      console.warn('[DEBUG] useProductsGridLogic - Nenhum produto selecionado para confirmação');
      return;
    }

    console.log('[DEBUG] useProductsGridLogic - Confirmando seleção:', {
      productName: selectedProduct.name,
      variant_type: selection.variant_type,
      quantity: selection.quantity,
      unit_price: selection.unit_price,
      total_price: selection.total_price,
      units_sold: selection.units_sold,
      conversion_required: selection.conversion_required
    });

    // Usar o novo método addFromVariantSelection
    addFromVariantSelection(selection, {
      id: selectedProduct.id,
      name: selectedProduct.name
    });
    
    // Chamar callback se fornecido
    onProductSelect?.(selectedProduct);
    
    console.log('[DEBUG] useProductsGridLogic - Produto adicionado com sucesso via sistema de variantes');
  };

  return {
    // Dados
    products,
    currentProducts,
    categories,
    categoryCounts,

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

    // Utilities
    getProductsByCategory,
    categoryExists,
    getMostPopularCategory,
    totalCategories,
  };
};