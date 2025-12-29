/**
 * Hook para lógica de filtros de produtos
 * Centraliza lógica de filtros e busca de produtos
 */

import { useState, useMemo } from 'react';
import type { Product } from '@/core/types/inventory.types';

export type StockFilterType = 'all' | 'low-stock';

export const useProductFilters = (
  products: Product[],
  initialCategory = 'all',
  stockFilter: StockFilterType = 'all'
) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [showMissingCostsOnly, setShowMissingCostsOnly] = useState(false);

  // Buscar categorias únicas
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(products.map(p => p.category).filter(Boolean))];
    return uniqueCategories.sort();
  }, [products]);

  // Contar produtos sem custo (para badge)
  const missingCostsCount = useMemo(() => {
    return products.filter(p => !p.cost_price || Number(p.cost_price) <= 0).length;
  }, [products]);

  // Filtrar produtos
  // v3.5.4 - SSoT: Quando stockFilter='low-stock', os dados JÁ vêm filtrados da RPC
  // Não aplicar filtro duplicado no cliente (evita divergência de lógica)
  const filteredProducts = useMemo(() => {
    let result = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;

      // ✅ SSoT v3.5.4: Quando stockFilter='low-stock', os dados já vêm filtrados
      // da RPC get_low_stock_products (que usa herança de categoria).
      // NÃO aplicar filtro adicional - apenas search e category.
      // Isso garante consistência com o Dashboard.

      return matchesSearch && matchesCategory;
    });

    // Filtro "Sem Custo" - para auditoria (Adicionado na unificação v2)
    if (showMissingCostsOnly) {
      result = result.filter(p => !p.cost_price || Number(p.cost_price) <= 0);
    }

    return result;
  }, [products, searchTerm, selectedCategory, showMissingCostsOnly]); // Removed 'stockFilter' dependency implicit logic relies on initial data or user handling

  // Limpar filtros
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setShowMissingCostsOnly(false);
  };

  // Estado dos filtros ativos
  const hasActiveFilters = searchTerm !== '' || selectedCategory !== 'all' || stockFilter === 'low-stock' || showMissingCostsOnly;

  // Estado do filtro para empty state
  const filterDescription = stockFilter === 'low-stock'
    ? 'estoque baixo'
    : searchTerm || (selectedCategory !== 'all' ? 'filtros aplicados' : undefined) || (showMissingCostsOnly ? 'produtos sem custo' : undefined);

  return {
    // Estados
    searchTerm,
    selectedCategory,
    isFiltersOpen,
    categories,
    filteredProducts,
    hasActiveFilters,
    filterDescription,
    showMissingCostsOnly,
    missingCostsCount,

    // Ações
    setSearchTerm,
    setSelectedCategory,
    setIsFiltersOpen,
    clearFilters,
    setShowMissingCostsOnly,

    // Métricas
    totalProducts: products.length,
    filteredCount: filteredProducts.length,
  };
};