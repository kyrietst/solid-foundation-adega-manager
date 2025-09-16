/**
 * Hook para gerenciar categorias de produtos
 * Centraliza lógica de categorias e suas operações
 * Agora integrado com categorias dinâmicas do banco de dados
 */

import { useMemo } from 'react';
import type { Product } from '@/types/inventory.types';
import { useCategories } from '@/shared/hooks/common/use-categories';

export const useProductCategories = (products: Product[]) => {
  // Buscar categorias do banco de dados
  const { data: dbCategories = [] } = useCategories();
  
  // Usar categorias do banco como fonte principal
  const categories = useMemo(() => {
    return dbCategories.map(cat => cat.name).sort();
  }, [dbCategories]);

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