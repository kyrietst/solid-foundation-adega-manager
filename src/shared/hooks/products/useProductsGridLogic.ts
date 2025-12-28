import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useStockData } from '@/shared/hooks/business/useStockData';
import { useCart } from '@/features/sales/hooks/use-cart';
import { useBarcode } from '@/features/inventory/hooks/use-barcode';
import { usePagination } from '@/shared/hooks/common/use-pagination';
import { useProductFilters, StockFilterType } from './useProductFilters';
import { useProductCategories } from './useProductCategories';
import type { Product } from '@/types/inventory.types';
import type { ProductSelectionData } from '@/features/sales/components/ProductSelectionModal';

export interface ProductsGridConfig {
  showSearch?: boolean;
  showFilters?: boolean;
  initialCategory?: string;
  storeFilter?: string; // Legacy: não usado // 🏪 Filtro de loja (v3.4.0)
  stockFilter?: StockFilterType; // 📦 Filtro de estoque (low-stock)
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
    storeFilter, // 🏪 Filtro de loja
    stockFilter = 'all', // 📦 Filtro de estoque
    onProductSelect,
    gridColumns = { mobile: 1, tablet: 2, desktop: 3 },
    className
  } = config;

  const { addItem, addFromVariantSelection } = useCart();
  const { searchByBarcode } = useBarcode();
  const queryClient = useQueryClient();

  // Consulta SSoT Centralizada
  const { products: allProducts = [], isLoading } = useStockData();

  // Filtragem local inteligente
  // Isso substitui as RPC calls e queries específicas, mantendo SSoT
  const products = allProducts.filter(product => {
    // 1. Filtro de Loja
    if (storeFilter === 'store2') {
      // Lógica simplificada: Se tem estoque na loja 2 ou foi transferido
      // Como store2_holding_packages é um dado do produto, podemos usar diretamete
      const hasStore2Stock = (product.store2_holding_packages || 0) > 0 || (product.store2_holding_units_loose || 0) > 0;
      if (!hasStore2Stock) return false;
    }

    // 2. Filtro de Estoque Baixo (Low Stock)
    if (stockFilter === 'low-stock') {
      return product.stockStatus === 'low_stock' || product.stockStatus === 'out_of_stock';
    }

    // 3. Excluir deletados (já tratado pelo useStockData/supabase se implementado soft delete lá, mas garantindo)
    // O useStockData pega 'select * from products', se houver deleted_at, precisa filtrar?
    // A query original de productsSSoT não filtrava deleted_at, mas useProductsGridLogic filtrava 'is(deleted_at, null)'.
    // Vou assumir que o SSoT deve retornar produtos ativos.
    // Se o produto tiver deleted_at, filtrar.
    // O DB Product raw tem deleted_at? Sim.
    if ((product as any).deleted_at) return false;

    return true;
  });

  // 🏪 v3.4.2 - Invalidar cache quando storeFilter muda (forçar atualização dos cards)
  useEffect(() => {
    if (storeFilter) {
      queryClient.invalidateQueries({ queryKey: ['products', 'available'] });
      queryClient.invalidateQueries({ queryKey: ['products', 'store'] });
      queryClient.invalidateQueries({ queryKey: ['product-ssot'] });
    }
  }, [storeFilter, queryClient]);

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
  } = useProductFilters(products, initialCategory, stockFilter);

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
    paginatedItems: currentProducts,
    currentPage,
    itemsPerPage,
    totalPages,
    totalItems,
    setCurrentPage,
    goToPage,
    setItemsPerPage
  } = usePagination(filteredProducts, {
    initialItemsPerPage: 20
  });

  // Handler para código de barras escaneado
  const handleBarcodeScanned = async (barcode: string) => {
    console.log('[DEBUG] useProductsGridLogic - handleBarcodeScanned iniciado para:', barcode);

    const result = await searchByBarcode(barcode);
    console.log('[DEBUG] useProductsGridLogic - resultado searchByBarcode:', result);

    if (result && result.product) {
      const { product, type } = result;

      // ✅ CORREÇÃO v3.4.5: Usar campos MULTISTORE (store1_*) ao invés de legacy (fix: produtos novos não adicionavam via barcode)
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
          price: variantType === 'package' ? (product.package_price || product.price) : product.price,
          quantity: 1,
          maxQuantity: variantType === 'package' ? stockPackages : stockUnitsLoose,
          units_sold: variantType === 'package' ? (product.units_per_package || 1) : 1,
          packageUnits: variantType === 'package' ? (product.units_per_package || 1) : undefined,
          conversion_required: false
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

  // Handler para adicionar produto ao carrinho - CORRIGIDO PARA ULTRA-SIMPLIFICAÇÃO
  const handleAddToCart = async (product: Product) => {
    // ✅ CORREÇÃO v3.4.2: Usar campos MULTISTORE (store1_*) ao invés de legacy
    const stockUnitsLoose = product.stock_units_loose || 0;
    const stockPackages = product.stock_packages || 0;

    // ✅ LÓGICA ULTRA-SIMPLES:
    // 1. Se tem unidades soltas E pacotes: abrir modal para escolher
    // 2. Se tem APENAS unidades: adicionar unidade automaticamente
    // 3. Se tem APENAS pacotes: adicionar pacote automaticamente
    // 4. Se não tem nada: não fazer nada

    if (stockUnitsLoose > 0 && stockPackages > 0) {
      // ✅ TEM AMBOS: Abrir modal para escolher
      openProductSelection(product);
    } else if (stockUnitsLoose > 0) {
      // ✅ SÓ TEM UNIDADES: Adicionar unidade automaticamente
      await addItem({
        id: product.id,
        variant_id: `${product.id}-unit`,
        name: product.name,
        variant_type: 'unit',
        price: product.price,
        quantity: 1,
        maxQuantity: stockUnitsLoose,
        units_sold: 1,
        packageUnits: undefined,
        conversion_required: false
      });
      onProductSelect?.(product);
    } else if (stockPackages > 0) {
      // ✅ SÓ TEM PACOTES: Adicionar pacote automaticamente
      await addItem({
        id: product.id,
        variant_id: `${product.id}-package`,
        name: product.name,
        variant_type: 'package',
        price: product.package_price || product.price,
        quantity: 1,
        maxQuantity: stockPackages,
        units_sold: product.units_per_package || 1, // Quantas unidades são vendidas com 1 pacote
        packageUnits: product.units_per_package || 1, // Quantas unidades tem no pacote
        conversion_required: false
      });
      onProductSelect?.(product);
    }
    // ✅ Se não tem nem unidades nem pacotes: não fazer nada
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
    await addFromVariantSelection({ ...selection, conversion_required: false } as any, {
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