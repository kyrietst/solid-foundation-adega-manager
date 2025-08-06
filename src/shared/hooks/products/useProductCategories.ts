/**
 * Hook para gerenciar categorias de produtos
 * Centraliza lógica de categorias e suas operações
 */

import { useMemo } from 'react';
import type { Product } from '@/types/inventory.types';

export const useProductCategories = (products: Product[]) => {
  // Extrair categorias únicas dos produtos
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(products.map(p => p.category).filter(Boolean))];
    return uniqueCategories.sort();
  }, [products]);

  // Contar produtos por categoria
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    
    products.forEach(product => {
      if (product.category) {
        counts[product.category] = (counts[product.category] || 0) + 1;
      }
    });

    return counts;
  }, [products]);

  // Obter produtos de uma categoria específica
  const getProductsByCategory = (category: string): Product[] => {
    if (category === 'all') return products;
    return products.filter(product => product.category === category);
  };

  // Verificar se uma categoria existe
  const categoryExists = (category: string): boolean => {
    return category === 'all' || categories.includes(category);
  };

  // Obter categoria mais popular (com mais produtos)
  const getMostPopularCategory = (): string | null => {
    if (categories.length === 0) return null;
    
    return categories.reduce((popular, current) => {
      return categoryCounts[current] > (categoryCounts[popular] || 0) ? current : popular;
    });
  };

  return {
    categories,
    categoryCounts,
    getProductsByCategory,
    categoryExists,
    getMostPopularCategory,
    totalCategories: categories.length,
  };
};