import React, { useState, useMemo, useEffect } from 'react';
import { Product } from '@/core/types/inventory.types';

interface UseInventoryFiltersProps {
  products: Product[];
}

export function useInventoryFilters({ products }: UseInventoryFiltersProps) {
  const [selectedStore, setSelectedStore] = useState<1 | 2>(1);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showMissingCostsOnly, setShowMissingCostsOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 24;

  // Effects to reset pagination
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedStore, searchQuery, selectedCategory, showMissingCostsOnly]);

  const missingCostsCount = useMemo(() => {
    return products.filter(p => !p.cost_price || Number(p.cost_price) <= 0).length;
  }, [products]);

  const filteredProducts = useMemo(() => {
    // 1. Store Scope
    let result = selectedStore === 2
      ? products.filter(p => (p.store2_holding_packages || 0) > 0 || (p.store2_holding_units_loose || 0) > 0)
      : products;

    // 2. Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.barcode?.toLowerCase().includes(q) ||
        p.package_barcode?.toLowerCase().includes(q)
      );
    }

    // 3. Category
    if (selectedCategory && selectedCategory !== 'all') {
      result = result.filter(p => p.category === selectedCategory);
    }

    // 4. Missing Cost Audit
    if (showMissingCostsOnly) {
      result = result.filter(p => !p.cost_price || Number(p.cost_price) <= 0);
    }

    // 5. Display Mapping
    return result.map(p => ({
      ...p,
      stock_packages: selectedStore === 1 ? p.stock_packages || 0 : p.store2_holding_packages || 0,
      stock_units_loose: selectedStore === 1 ? p.stock_units_loose || 0 : p.store2_holding_units_loose || 0,
    }));
  }, [products, selectedStore, searchQuery, selectedCategory, showMissingCostsOnly]);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  return {
    // State
    selectedStore,
    setSelectedStore,
    selectedCategory,
    setSelectedCategory,
    showMissingCostsOnly,
    setShowMissingCostsOnly,
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,

    // Derived
    missingCostsCount,
    filteredProducts: paginatedProducts,
    totalItems: filteredProducts.length,
    totalPages
  };
}