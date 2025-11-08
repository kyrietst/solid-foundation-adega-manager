/**
 * Hook coordenador para lógica do ProductsGrid
 * Combina todos os hooks especializados em uma interface única
 */

import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';
import { useCart } from '@/features/sales/hooks/use-cart';
import { useBarcode } from '@/features/inventory/hooks/use-barcode';
import { usePagination } from '@/shared/hooks/common/use-pagination';
import { useProductFilters } from './useProductFilters';
import { useProductCategories } from './useProductCategories';
import type { Product, StoreLocation } from '@/types/inventory.types';
import type { ProductSelectionData } from '@/features/sales/components/ProductSelectionModal';

export interface ProductsGridConfig {
  showSearch?: boolean;
  showFilters?: boolean;
  initialCategory?: string;
  storeFilter?: StoreLocation; // 🏪 Filtro de loja (v3.4.0)
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
    onProductSelect,
    gridColumns = { mobile: 1, tablet: 2, desktop: 3 },
    className
  } = config;

  const { addItem, addFromVariantSelection } = useCart();
  const { searchByBarcode } = useBarcode();
  const queryClient = useQueryClient();

  // Query para buscar produtos incluindo campos da Dupla Contagem e Multi-Store
  // v3.4.3 - FILTRO INTELIGENTE LOJA 2: Mostra apenas produtos transferidos
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products', 'available', storeFilter],
    queryFn: async (): Promise<Product[]> => {
      if (storeFilter === 'store2') {
        // LOJA 2: Mostrar APENAS produtos transferidos
        // v3.4.3 - Usa histórico de transferências para determinar visibilidade

        // Passo 1: Buscar IDs de produtos transferidos para store2
        const { data: transfers, error: transferError } = await supabase
          .from('store_transfers')
          .select('product_id')
          .eq('to_store', 2);

        if (transferError) {
          console.error('Error fetching transfers:', transferError);
          throw transferError;
        }

        // Passo 2: Extrair IDs únicos
        const productIds = [...new Set(transfers?.map(t => t.product_id) || [])];

        // Se não houver transferências, retornar array vazio
        if (productIds.length === 0) {
          return [];
        }

        // Passo 3: Buscar produtos transferidos
        const { data, error } = await supabase
          .from('products')
          .select('id, name, price, stock_quantity, image_url, barcode, unit_barcode, package_barcode, category, package_units, package_price, has_package_tracking, units_per_package, stock_packages, stock_units_loose, store1_stock_packages, store1_stock_units_loose, store2_stock_packages, store2_stock_units_loose, expiry_date, has_expiry_tracking')
          .is('deleted_at', null)
          .in('id', productIds)  // ← FILTRO: Apenas produtos transferidos
          .order('name', { ascending: true });

        if (error) {
          console.error('Error fetching products:', error);
          throw error;
        }

        return data;

      } else {
        // LOJA 1 ou SEM FILTRO: Mostrar TODOS os produtos (comportamento atual)
        let query = supabase
          .from('products')
          .select('id, name, price, stock_quantity, image_url, barcode, unit_barcode, package_barcode, category, package_units, package_price, has_package_tracking, units_per_package, stock_packages, stock_units_loose, store1_stock_packages, store1_stock_units_loose, store2_stock_packages, store2_stock_units_loose, expiry_date, has_expiry_tracking')
          .is('deleted_at', null);

        query = query.order('name', { ascending: true });

        const { data, error } = await query;

        if (error) {
          console.error('Error fetching products:', error);
          throw error;
        }

        return data;
      }
    },
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

      // ✅ CORREÇÃO v3.4.5: Usar campos MULTISTORE (store1_*) ao invés de legacy (fix: produtos novos não adicionavam via barcode)
      const stockUnitsLoose = product.store1_stock_units_loose || 0;
      const stockPackages = product.store1_stock_packages || 0;

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
          packageUnits: variantType === 'package' ? (product.units_per_package || 1) : undefined
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
    const stockUnitsLoose = product.store1_stock_units_loose || 0;
    const stockPackages = product.store1_stock_packages || 0;

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
        packageUnits: undefined
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
        packageUnits: product.units_per_package || 1 // Quantas unidades tem no pacote
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