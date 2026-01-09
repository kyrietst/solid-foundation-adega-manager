import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useCart } from '@/features/sales/hooks/use-cart';
import { useBarcode } from '@/features/inventory/hooks/use-barcode';
import { useProductCategories } from './useProductCategories';
import { useProductList } from '@/features/inventory/hooks/useProductList';
import type { Product } from '@/core/types/inventory.types';
import type { Price } from '@/core/types/branded.types';
import type { VariantType } from '@/core/types/variants.types';
import type { ProductSelectionData } from '@/features/sales/components/ProductSelectionModal';
import { StockFilterType } from './useProductFilters';

export interface ProductsGridConfig {
  showSearch?: boolean;
  showFilters?: boolean;
  initialCategory?: string;
  storeFilter?: string; // 🏪 Filtro de loja (v3.4.0)
  stockFilter?: StockFilterType; // 📦 Filtro de estoque (low-stock)
  onProductSelect?: (product: Product) => void;
  gridColumns?: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  className?: string;

  // Controlled State Props
  controlledSearchTerm?: string;
  onControlledSearchChange?: (value: string) => void;
  controlledCategory?: string;
  onControlledCategoryChange?: (value: string) => void;
}

export const useProductsGridLogic = (config: ProductsGridConfig = {}) => {
  const {
    showSearch = true,
    showFilters = true,
    initialCategory = 'all',
    storeFilter,
    stockFilter = 'all',
    onProductSelect,
    gridColumns = { mobile: 1, tablet: 2, desktop: 3 },
    className,
    controlledSearchTerm,
    onControlledSearchChange,
    controlledCategory,
    onControlledCategoryChange
  } = config;

  const { addItem, addFromVariantSelection } = useCart();
  const { searchByBarcode } = useBarcode();
  const queryClient = useQueryClient();

  // 1. Estados de Filtro (Server-Side)
  // Se controlado, usa o valor da prop. Se não, usa estado local.
  const [localSearchTerm, setLocalSearchTerm] = useState('');
  const [localDebouncedSearch, setLocalDebouncedSearch] = useState('');
  const [localCategory, setLocalCategory] = useState(initialCategory);

  const isControlledSearch = controlledSearchTerm !== undefined;
  const isControlledCategory = controlledCategory !== undefined;

  const searchTerm = isControlledSearch ? controlledSearchTerm : localSearchTerm;
  const selectedCategory = isControlledCategory ? controlledCategory : localCategory;

  // Handler para mudança de busca
  const handleSearchChange = useCallback((value: string) => {
    if (isControlledSearch && onControlledSearchChange) {
      onControlledSearchChange(value);
    } else {
      setLocalSearchTerm(value);
    }
  }, [isControlledSearch, onControlledSearchChange]);

  // Handler para mudança de categoria
  const handleCategoryChange = useCallback((value: string) => {
    if (isControlledCategory && onControlledCategoryChange) {
      onControlledCategoryChange(value);
    } else {
      setLocalCategory(value);
    }
  }, [isControlledCategory, onControlledCategoryChange]);


  // UI States
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  // Debounce search term (Unified for both controlled and local)
  // Nota: Se for controlado, o Pai já deve estar cuidando do debounce SE ele quiser,
  // MAS para garantir que a query só dispare com delay, mantemos um debounce local do valor efetivo.
  const [effectiveDebouncedSearch, setEffectiveDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setEffectiveDebouncedSearch(searchTerm);
    }, 400); // 400ms debounce
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const hasActiveFilters = effectiveDebouncedSearch !== '' || selectedCategory !== 'all' || stockFilter !== 'all';
  const filterDescription = hasActiveFilters ?
    `${effectiveDebouncedSearch ? `Busca: "${effectiveDebouncedSearch}"` : ''} ${selectedCategory !== 'all' ? `Categoria: ${selectedCategory}` : ''}`.trim()
    : undefined;

  // 2. Data Fetching (Infinite Query)
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError
  } = useProductList({
    search: effectiveDebouncedSearch,
    category: selectedCategory,
    stockFilter,
    storeFilter,
    pageSize: 24, // Múltiplo de 2, 3 e 4 para grid
    enabled: true
  });

  // Flatten pages
  const products = useMemo(() => {
    return data?.pages.flatMap(page => page.products) || [];
  }, [data]);

  const totalProducts = data?.pages[0]?.count || 0;

  // 3. Categorias (Simplificado: usa produtos carregados ou deveria ser RPC)
  // Para performance máxima, idealmente seria um hook separado de categorias.
  // Vamos manter useProductCategories recebendo os produtos carregados por enquanto.
  const {
    categories,
    getProductsByCategory, // Nota: isso filtra LOCALMENTE nos dados carregados, cuidado.
    categoryCounts
  } = useProductCategories(products);

  // Estados do modal de seleção
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Ações de Filtro
  const clearFilters = useCallback(() => {
    handleSearchChange('');
    handleCategoryChange('all');
    // If local, we also clear debounced immediately to update UI? No, effect handles it.
  }, [handleSearchChange, handleCategoryChange]);

  // Handler para código de barras escaneado
  const handleBarcodeScanned = async (barcode: string) => {
    // Busca Server-Side via useBarcode (agora desacoplado)
    const result = await searchByBarcode(barcode);

    if (result && result.product) {
      const { product, type } = result;
      // ... (mantida lógica original de adicionar ao carrinho)
      const stockUnitsLoose = product.stock_units_loose || 0;
      const stockPackages = product.stock_packages || 0;

      if (stockUnitsLoose > 0 || stockPackages > 0) {
        const variantType = type === 'package' ? 'package' : 'unit';
        const variantId = type === 'package' ? `${product.id}-package` : `${product.id}-unit`;

        const itemToAdd = {
          id: product.id,
          variant_id: variantId,
          name: product.name,
          variant_type: variantType as VariantType,
          price: variantType === 'package' ? (product.package_price || product.price) : product.price,
          quantity: 1,
          maxQuantity: variantType === 'package' ? stockPackages : stockUnitsLoose,
          units_sold: variantType === 'package' ? (product.units_per_package || 1) : 1,
          packageUnits: variantType === 'package' ? (product.units_per_package || 1) : undefined,
          conversion_required: false
        };

        await addItem(itemToAdd);
        onProductSelect?.(product);
      }
    }
  };

  // Handler para adicionar produto ao carrinho
  const handleAddToCart = async (product: Product) => {
    const stockUnitsLoose = product.stock_units_loose || 0;
    const stockPackages = product.stock_packages || 0;

    if (stockUnitsLoose > 0 && stockPackages > 0) {
      openProductSelection(product);
    } else if (stockUnitsLoose > 0) {
      // Unidade
      await addItem({
        id: product.id,
        variant_id: `${product.id}-unit`,
        name: product.name,
        variant_type: 'unit' as VariantType,
        price: product.price,
        quantity: 1,
        maxQuantity: stockUnitsLoose,
        units_sold: 1,
        packageUnits: undefined,
        conversion_required: false
      });
      onProductSelect?.(product);
    } else if (stockPackages > 0) {
      // Pacote
      await addItem({
        id: product.id,
        variant_id: `${product.id}-package`,
        name: product.name,
        variant_type: 'package',
        price: product.package_price || product.price,
        quantity: 1,
        maxQuantity: stockPackages,
        units_sold: product.units_per_package || 1,
        packageUnits: product.units_per_package || 1,
        conversion_required: false
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

    await addFromVariantSelection({
      variant_id: selection.variant_id,
      variant_type: selection.variant_type as VariantType,
      quantity: selection.quantity,
      unit_price: selection.unit_price as unknown as Price,
      total_price: selection.total_price as unknown as Price,
      units_sold: selection.units_sold,
      conversion_required: false,
    }, {
      id: selectedProduct.id,
      name: selectedProduct.name
    });

    onProductSelect?.(selectedProduct);
    closeProductSelection();
  };

  // Dummy pagination props for compatibility (deprecated)
  const paginationProps = {
    currentPage: 1,
    itemsPerPage: products.length,
    totalPages: 1,
    totalItems: totalProducts,
    goToPage: () => { },
    setItemsPerPage: () => { }
  };

  return {
    // Dados Principais
    products,
    currentProducts: products, // Alias para compatibilidade
    categories,
    categoryCounts, // Pode estar incompleto se não carregar tudo

    // Infinite Scroll API
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,

    // Filtros
    searchTerm,
    selectedCategory,
    isFiltersOpen,
    hasActiveFilters,
    filterDescription,

    // Config
    showSearch,
    showFilters,
    gridColumns,
    className,

    // Paginação (Legado/Compatibilidade)
    ...paginationProps,
    filteredCount: totalProducts,
    totalProducts,

    // Modal
    isModalOpen,
    selectedProduct,

    // Actions
    setSearchTerm: handleSearchChange,
    setSelectedCategory: handleCategoryChange,
    setIsFiltersOpen,
    clearFilters,
    handleBarcodeScanned,
    handleAddToCart,

    // Modal Actions
    openProductSelection,
    closeProductSelection,
    handleProductSelectionConfirm,

    // Utils
    getMostPopularCategory: () => null, // Deprecated
    categoryExists: () => true,
  };
};