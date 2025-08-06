/**
 * Hook para lógica de filtros de produtos
 * Centraliza lógica de filtros e busca de produtos
 */

import { useState, useMemo } from 'react';
import type { Product } from '@/types/inventory.types';

export const useProductFilters = (products: Product[], initialCategory = 'all') => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  // Buscar categorias únicas
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(products.map(p => p.category).filter(Boolean))];
    return uniqueCategories.sort();
  }, [products]);

  // Filtrar produtos
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  // Limpar filtros
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
  };

  // Estado dos filtros ativos
  const hasActiveFilters = searchTerm !== '' || selectedCategory !== 'all';

  // Estado do filtro para empty state
  const filterDescription = searchTerm || (selectedCategory !== 'all' ? 'filtros aplicados' : undefined);

  return {
    // Estados
    searchTerm,
    selectedCategory,
    isFiltersOpen,
    categories,
    filteredProducts,
    hasActiveFilters,
    filterDescription,

    // Ações
    setSearchTerm,
    setSelectedCategory,
    setIsFiltersOpen,
    clearFilters,

    // Métricas
    totalProducts: products.length,
    filteredCount: filteredProducts.length,
  };
};