/**
 * Hook para lógica de filtros de inventory
 * Extraído do InventoryNew.tsx para separar lógica de filtros
 */

import { useState, useMemo } from 'react';
import { Product, InventoryFilters } from '@/types/inventory.types';
import { InventoryFilterState } from '@/components/inventory/types';

export const useInventoryFilters = (products: Product[]): InventoryFilterState => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<InventoryFilters>({});

  // Filtered products
  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.barcode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.supplier?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Advanced filters
    if (filters.category) {
      filtered = filtered.filter(product => product.category === filters.category);
    }

    if (filters.unitType) {
      filtered = filtered.filter(product => product.unit_type === filters.unitType);
    }

    if (filters.turnoverRate) {
      filtered = filtered.filter(product => product.turnover_rate === filters.turnoverRate);
    }

    if (filters.stockStatus) {
      filtered = filtered.filter(product => {
        const ratio = product.stock_quantity / product.minimum_stock;
        switch (filters.stockStatus) {
          case 'low': return ratio <= 1;
          case 'adequate': return ratio > 1 && ratio <= 3;
          case 'high': return ratio > 3;
          default: return true;
        }
      });
    }

    if (filters.supplier) {
      filtered = filtered.filter(product => product.supplier === filters.supplier);
    }

    return filtered;
  }, [products, searchTerm, filters]);

  // Helper functions
  const categories = useMemo(() => {
    return [...new Set(products.map(p => p.category).filter(Boolean))].sort();
  }, [products]);

  const suppliers = useMemo(() => {
    return [...new Set(products.map(p => p.supplier).filter(Boolean))].sort();
  }, [products]);

  return {
    searchTerm,
    filters,
    setSearchTerm,
    setFilters,
    filteredProducts,
    categories,
    suppliers,
  };
};