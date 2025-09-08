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
import type { Product } from '@/types/inventory.types';

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

  const { addItem } = useCart();
  const { searchByBarcode } = useBarcode();

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

  // Handler para adicionar produto ao carrinho (clique manual - sempre unidade)
  const handleAddToCart = (product: Product) => {
    console.log('[DEBUG] useProductsGridLogic - Adicionando produto via clique manual (unidade):', {
      id: product.id,
      name: product.name,
      price: product.price,
      maxQuantity: product.stock_quantity
    });
    
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      maxQuantity: product.stock_quantity,
      type: 'unit' // Clique manual sempre adiciona como unidade
    });
    onProductSelect?.(product);
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

    // Utilities
    getProductsByCategory,
    categoryExists,
    getMostPopularCategory,
    totalCategories,
  };
};