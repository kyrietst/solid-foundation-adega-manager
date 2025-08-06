/**
 * Hook coordenador para lógica do ProductsGrid
 * Combina todos os hooks especializados em uma interface única
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';
import { useCart } from '@/features/sales/hooks/use-cart';
import { useBarcode } from '@/features/inventory/hooks/use-barcode';
import { usePagination } from '@/hooks/use-pagination';
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
        .select('id, name, price, stock_quantity, image_url, barcode, category')
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
    const product = await searchByBarcode(barcode);
    if (product && product.stock_quantity > 0) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        maxQuantity: product.stock_quantity
      });
      onProductSelect?.(product);
    }
  };

  // Handler para adicionar produto ao carrinho
  const handleAddToCart = (product: Product) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      maxQuantity: product.stock_quantity
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