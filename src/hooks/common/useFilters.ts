/**
 * Hook genérico reutilizável para gerenciamento de filtros
 * Elimina duplicação de código em InventoryNew.tsx e CustomersNew.tsx
 */

import { useState, useMemo } from 'react';

export interface FilterOptions {
  searchTerm: string;
  category?: string;
  status?: string;
  segment?: string;
  supplier?: string;
  [key: string]: any;
}

export interface UseFiltersConfig<T> {
  initialFilters?: Partial<FilterOptions>;
  searchFields: (keyof T)[];
  filterFunctions?: {
    [K in keyof FilterOptions]?: (item: T, value: FilterOptions[K]) => boolean;
  };
  persistKey?: string; // Para localStorage
}

export const useFilters = <T extends Record<string, any>>(
  items: T[],
  config: UseFiltersConfig<T>
) => {
  const {
    initialFilters = {},
    searchFields,
    filterFunctions = {},
    persistKey
  } = config;

  // Estado dos filtros
  const [filters, setFilters] = useState<FilterOptions>(() => {
    const defaultFilters = {
      searchTerm: '',
      ...initialFilters
    };

    // Recuperar do localStorage se habilitado
    if (persistKey) {
      try {
        const saved = localStorage.getItem(`filters_${persistKey}`);
        if (saved) {
          return { ...defaultFilters, ...JSON.parse(saved) };
        }
      } catch (error) {
        console.warn('Erro ao recuperar filtros do localStorage:', error);
      }
    }

    return defaultFilters;
  });

  const [showFilters, setShowFilters] = useState(false);

  // Função para atualizar filtros
  const updateFilter = (key: keyof FilterOptions, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    // Persistir no localStorage se habilitado
    if (persistKey) {
      try {
        localStorage.setItem(`filters_${persistKey}`, JSON.stringify(newFilters));
      } catch (error) {
        console.warn('Erro ao salvar filtros no localStorage:', error);
      }
    }
  };

  // Função para resetar filtros
  const resetFilters = () => {
    const defaultFilters = {
      searchTerm: '',
      ...initialFilters
    };
    setFilters(defaultFilters);

    if (persistKey) {
      try {
        localStorage.removeItem(`filters_${persistKey}`);
      } catch (error) {
        console.warn('Erro ao remover filtros do localStorage:', error);
      }
    }
  };

  // Aplicar filtros aos itens
  const filteredItems = useMemo(() => {
    let result = [...items];

    // Filtro de busca por texto
    if (filters.searchTerm && filters.searchTerm.trim()) {
      const searchLower = filters.searchTerm.toLowerCase().trim();
      result = result.filter(item =>
        searchFields.some(field => {
          const value = item[field];
          return value && String(value).toLowerCase().includes(searchLower);
        })
      );
    }

    // Aplicar filtros customizados
    Object.entries(filters).forEach(([key, value]) => {
      if (key === 'searchTerm' || !value) return;
      
      const filterFunction = filterFunctions[key as keyof FilterOptions];
      if (filterFunction) {
        result = result.filter(item => filterFunction(item, value));
      } else {
        // Filtro padrão por igualdade exata
        if (value !== 'all' && value !== '') {
          result = result.filter(item => item[key] === value);
        }
      }
    });

    return result;
  }, [items, filters, searchFields, filterFunctions]);

  // Extrair valores únicos para options de select
  const getUniqueValues = (field: keyof T): string[] => {
    const values = items
      .map(item => item[field])
      .filter(value => value != null && value !== '');
    return [...new Set(values as string[])].sort();
  };

  return {
    // Estado dos filtros
    filters,
    showFilters,
    setShowFilters,
    
    // Funções de manipulação
    updateFilter,
    resetFilters,
    setSearchTerm: (term: string) => updateFilter('searchTerm', term),
    
    // Dados filtrados
    filteredItems,
    
    // Utilitários
    getUniqueValues,
    hasActiveFilters: Object.entries(filters).some(([key, value]) => 
      key !== 'searchTerm' && value && value !== 'all' && value !== ''
    ),
    totalFiltered: filteredItems.length,
    totalOriginal: items.length
  };
};

// Hook específico para produtos
export const useProductFilters = (products: any[]) => {
  return useFilters(products, {
    searchFields: ['name', 'barcode', 'category', 'supplier'],
    filterFunctions: {
      category: (product, category) => category === 'all' || product.category === category,
      supplier: (product, supplier) => supplier === 'all' || product.supplier === supplier,
      status: (product, status) => {
        if (status === 'all') return true;
        if (status === 'low_stock') return product.stock <= product.min_stock;
        if (status === 'out_of_stock') return product.stock === 0;
        return true;
      }
    },
    persistKey: 'products'
  });
};

// Hook específico para clientes
export const useCustomerFilters = (customers: any[]) => {
  return useFilters(customers, {
    searchFields: ['name', 'email', 'phone'],
    filterFunctions: {
      segment: (customer, segment) => segment === 'all' || customer.segment === segment
    },
    persistKey: 'customers'
  });
};