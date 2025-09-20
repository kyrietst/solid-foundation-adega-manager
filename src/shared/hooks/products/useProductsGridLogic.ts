/**
 * Hook coordenador para lógica do ProductsGrid
 * Combina todos os hooks especializados em uma interface única
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';
import { useCart } from '@/features/sales/hooks/use-cart';
import { useBarcode } from '@/features/inventory/hooks/use-barcode';
import { usePagination } from '@/shared/hooks/common/use-pagination';
import { useProductFilters } from './useProductFilters';
import { useProductCategories } from './useProductCategories';
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

  // Query para buscar produtos incluindo campos da Dupla Contagem
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products', 'available'],
    queryFn: async (): Promise<Product[]> => {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price, stock_quantity, image_url, barcode, category, package_units, package_price, has_package_tracking, units_per_package, stock_packages, stock_units_loose')
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching products:', error);
        throw error;
      }

      return data;
    },
  });

  // Estados do modal de seleção de produto
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

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
    initialItemsPerPage: 20,
    resetOnItemsChange: true
  });

  // Handler para código de barras escaneado
  const handleBarcodeScanned = async (barcode: string) => {
    console.log('[DEBUG] useProductsGridLogic - handleBarcodeScanned iniciado para:', barcode);

    const result = await searchByBarcode(barcode);
    console.log('[DEBUG] useProductsGridLogic - resultado searchByBarcode:', result);

    if (result && result.product) {
      const { product, type } = result;

      // Verificar disponibilidade usando campos da Dupla Contagem
      const stockUnitsLoose = product.stock_units_loose || 0;
      const stockPackages = product.stock_packages || 0;

      console.log('[DEBUG] useProductsGridLogic - produto encontrado:', {
        productId: product.id,
        productName: product.name,
        stockUnitsLoose,
        stockPackages,
        barcodeType: type
      });

      if (stockUnitsLoose > 0 || stockPackages > 0) {
        // Determinar variant_id e outros campos necessários
        const variantType = type === 'package' ? 'package' : 'unit';
        const variantId = type === 'package'
          ? `${product.id}-package`
          : `${product.id}-unit`;

        const itemToAdd = {
          id: product.id,
          variant_id: variantId,
          name: product.name,
          variant_type: variantType,
          price: product.price,
          quantity: 1,
          maxQuantity: variantType === 'package' ? stockPackages : stockUnitsLoose,
          units_sold: variantType === 'package' ? (product.package_units || 1) : 1,
          packageUnits: variantType === 'package' ? (product.package_units || 1) : undefined,
          conversion_required: false, // Para barcode scanning, não há conversão inicialmente
          packages_converted: 0
        };

        console.log('[DEBUG] useProductsGridLogic - chamando addItem com:', itemToAdd);

        await addItem(itemToAdd);
        onProductSelect?.(product);

        console.log('[DEBUG] useProductsGridLogic - addItem executado com sucesso');
      } else {
        console.log('[DEBUG] useProductsGridLogic - produto sem estoque disponível');
      }
    } else {
      console.log('[DEBUG] useProductsGridLogic - nenhum produto encontrado para o código:', barcode);
    }
  };

  // Handler para adicionar produto ao carrinho
  const handleAddToCart = async (product: Product) => {
    // Verificar disponibilidade usando campos da Dupla Contagem
    const stockUnitsLoose = product.stock_units_loose || 0;

    if (stockUnitsLoose > 0) {
      await addItem({
        id: product.id,
        variant_id: `${product.id}-unit`, // CORREÇÃO: Campo obrigatório para o sistema de variantes
        name: product.name,
        variant_type: 'unit', // Adição direta sempre como unidade
        price: product.price,
        quantity: 1,
        maxQuantity: stockUnitsLoose,
        units_sold: 1, // CORREÇÃO: Campo obrigatório para o sistema de variantes
        packageUnits: undefined, // Não é pacote
        conversion_required: false, // CORREÇÃO: Campo obrigatório para o sistema de variantes
        packages_converted: 0 // CORREÇÃO: Campo obrigatório para o sistema de variantes
      });
      onProductSelect?.(product);
    }
  };

  // Funções de controle do modal de seleção
  const openProductSelection = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const closeProductSelection = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const handleProductSelectionConfirm = async (selection: ProductSelectionData) => {
    if (!selectedProduct) return;

    // Usar a função específica para seleção de variantes
    await addFromVariantSelection(selection, {
      id: selectedProduct.id,
      name: selectedProduct.name
    });

    onProductSelect?.(selectedProduct);
    closeProductSelection();
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

    // Estados do modal de seleção
    isModalOpen,
    selectedProduct,

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