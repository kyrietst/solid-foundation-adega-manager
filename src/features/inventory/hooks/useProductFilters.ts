/**
 * Hook para lógica de filtros de produtos
 * Centraliza lógica de filtros e busca de produtos
 */

import { useState, useMemo } from 'react';
import type { Product } from '@/core/types/inventory.types';

export const useProductFilters = (products: Product[], initialCategory = 'all') => {
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
  const filteredProducts = useMemo(() => {
    let result = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    // Filtro "Sem Custo" - para auditoria
    if (showMissingCostsOnly) {
      result = result.filter(p => !p.cost_price || Number(p.cost_price) <= 0);
    }

    return result;
  }, [products, searchTerm, selectedCategory, showMissingCostsOnly]);

  // Limpar filtros
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setShowMissingCostsOnly(false);
  };

  // Estado dos filtros ativos
  const hasActiveFilters = searchTerm !== '' || selectedCategory !== 'all' || showMissingCostsOnly;

  // Estado do filtro para empty state
  const filterDescription = searchTerm || (selectedCategory !== 'all' ? 'filtros aplicados' : undefined) || (showMissingCostsOnly ? 'produtos sem custo' : undefined);

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