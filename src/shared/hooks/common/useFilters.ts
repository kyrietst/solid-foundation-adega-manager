/**
 * useFilters - Generic Filter Hook with Context7 Patterns
 * Enhanced version with TypeScript generics and Context7 best practices
 * Elimina duplicação de código em InventoryNew.tsx e CustomersNew.tsx
 */

import { useState, useMemo, useCallback } from 'react';

// Context7 Pattern: Enhanced filter configuration with discriminated unions
export interface FilterConfig<T = unknown> {
  id: string;
  label: string;
  type: 'text' | 'select' | 'multiselect' | 'date' | 'daterange' | 'boolean' | 'number' | 'numberrange';
  options?: Array<{ label: string; value: T }>;
  placeholder?: string;
  defaultValue?: T;
}

// Context7 Pattern: Active filter representation
export interface ActiveFilter<T = unknown> {
  id: string;
  label: string;
  value: T;
  displayValue: string;
  onRemove: () => void;
}

// Context7 Pattern: Flexible filter state
export type FilterValue = string | number | boolean | Date | [Date, Date] | [number, number] | string[] | null | undefined;

export interface FilterState {
  [key: string]: FilterValue;
}

// Legacy interface for backward compatibility
export interface FilterOptions {
  searchTerm: string;
  category?: string;
  status?: string;
  segment?: string;
  supplier?: string;
  [key: string]: string | number | boolean | Date | undefined;
}

export interface UseFiltersConfig<T> {
  initialFilters?: Partial<FilterOptions>;
  searchFields: (keyof T)[];
  filterFunctions?: {
    [K in keyof FilterOptions]?: (item: T, value: FilterOptions[K]) => boolean;
  };
  persistKey?: string; // Para localStorage
}

export const useFilters = <T extends Record<string, unknown>>(
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
  const updateFilter = (key: keyof FilterOptions, value: string | number | boolean | Date | undefined) => {
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
export const useProductFilters = (products: unknown[]) => {
  return useFilters(products, {
    searchFields: ['name', 'barcode', 'category', 'supplier'],
    filterFunctions: {
      category: (product, category) => category === 'all' || product.category === category,
      supplier: (product, supplier) => supplier === 'all' || product.supplier === supplier,
      status: (product, status) => {
        if (status === 'all') return true;
        if (status === 'low_stock') return product.stock > 0 && product.stock <= product.min_stock;
        if (status === 'out_of_stock') return product.stock === 0;
        return true;
      }
    },
    persistKey: 'products'
  });
};

// Hook específico para clientes
export const useCustomerFilters = (customers: unknown[]) => {
  return useFilters(customers, {
    searchFields: ['name', 'email', 'phone'],
    filterFunctions: {
      segment: (customer, segment) => segment === 'all' || customer.segment === segment
    },
    persistKey: 'customers'
  });
};

// ============================================================================
// Context7 Pattern: Enhanced Generic Filter Hook
// ============================================================================

// Context7 Pattern: Generic filter functions interface
export interface FilterFunctions<T = unknown> {
  setFilter: (id: string, value: FilterValue) => void;
  removeFilter: (id: string) => void;
  clearAll: () => void;
  resetToDefaults: () => void;
  hasActiveFilters: boolean;
  activeFilters: ActiveFilter[];
  filteredData: T[];
  filterCount: number;
  totalCount: number;
  filteredCount: number;
}

// Context7 Pattern: Enhanced generic hook with unknown extends for TSX compatibility
export function useAdvancedFilters<T extends unknown>(
  data: T[],
  configs: FilterConfig[],
  options: {
    persistKey?: string;
    customFilterFn?: (item: T, filters: FilterState) => boolean;
  } = {}
): FilterFunctions<T> {
  const { persistKey, customFilterFn } = options;

  // Context7 Pattern: Initialize state with default values
  const defaultFilters = useMemo<FilterState>(() => {
    return configs.reduce((acc, config) => {
      if (config.defaultValue !== undefined) {
        acc[config.id] = config.defaultValue;
      }
      return acc;
    }, {} as FilterState);
  }, [configs]);

  const [filters, setFilters] = useState<FilterState>(() => {
    // Try to load from localStorage if persistKey is provided
    if (persistKey) {
      try {
        const saved = localStorage.getItem(`advanced_filters_${persistKey}`);
        if (saved) {
          return { ...defaultFilters, ...JSON.parse(saved) };
        }
      } catch (error) {
        console.warn('Erro ao recuperar filtros avançados do localStorage:', error);
      }
    }
    return defaultFilters;
  });

  // Context7 Pattern: Memoized filter setter with useCallback
  const setFilter = useCallback((id: string, value: FilterValue) => {
    const newFilters = {
      ...filters,
      [id]: value
    };
    setFilters(newFilters);

    // Persist to localStorage if enabled
    if (persistKey) {
      try {
        localStorage.setItem(`advanced_filters_${persistKey}`, JSON.stringify(newFilters));
      } catch (error) {
        console.warn('Erro ao salvar filtros avançados no localStorage:', error);
      }
    }
  }, [filters, persistKey]);

  // Context7 Pattern: Remove individual filter
  const removeFilter = useCallback((id: string) => {
    const newFilters = { ...filters };
    delete newFilters[id];
    setFilters(newFilters);

    if (persistKey) {
      try {
        localStorage.setItem(`advanced_filters_${persistKey}`, JSON.stringify(newFilters));
      } catch (error) {
        console.warn('Erro ao salvar filtros avançados no localStorage:', error);
      }
    }
  }, [filters, persistKey]);

  // Context7 Pattern: Clear all filters
  const clearAll = useCallback(() => {
    setFilters({});
    if (persistKey) {
      try {
        localStorage.removeItem(`advanced_filters_${persistKey}`);
      } catch (error) {
        console.warn('Erro ao remover filtros avançados do localStorage:', error);
      }
    }
  }, [persistKey]);

  // Context7 Pattern: Reset to default values
  const resetToDefaults = useCallback(() => {
    setFilters(defaultFilters);
    if (persistKey) {
      try {
        if (Object.keys(defaultFilters).length === 0) {
          localStorage.removeItem(`advanced_filters_${persistKey}`);
        } else {
          localStorage.setItem(`advanced_filters_${persistKey}`, JSON.stringify(defaultFilters));
        }
      } catch (error) {
        console.warn('Erro ao resetar filtros avançados no localStorage:', error);
      }
    }
  }, [defaultFilters, persistKey]);

  // Context7 Pattern: Check if has active filters
  const hasActiveFilters = useMemo(() => {
    return Object.keys(filters).length > 0;
  }, [filters]);

  // Context7 Pattern: Generate active filters array
  const activeFilters = useMemo<ActiveFilter[]>(() => {
    return Object.entries(filters).map(([id, value]) => {
      const config = configs.find(c => c.id === id);
      if (!config) return null;

      // Generate display value based on filter type
      let displayValue: string;

      switch (config.type) {
        case 'select':
        case 'multiselect':
          if (Array.isArray(value)) {
            const labels = value.map(v =>
              config.options?.find(opt => opt.value === v)?.label || String(v)
            );
            displayValue = labels.join(', ');
          } else {
            displayValue = config.options?.find(opt => opt.value === value)?.label || String(value);
          }
          break;
        case 'date':
          displayValue = value instanceof Date ? value.toLocaleDateString('pt-BR') : String(value);
          break;
        case 'daterange':
          if (Array.isArray(value) && value.length === 2) {
            const [start, end] = value as [Date, Date];
            displayValue = `${start.toLocaleDateString('pt-BR')} - ${end.toLocaleDateString('pt-BR')}`;
          } else {
            displayValue = String(value);
          }
          break;
        case 'numberrange':
          if (Array.isArray(value) && value.length === 2) {
            const [min, max] = value as [number, number];
            displayValue = `${min} - ${max}`;
          } else {
            displayValue = String(value);
          }
          break;
        case 'boolean':
          displayValue = value ? 'Sim' : 'Não';
          break;
        default:
          displayValue = String(value);
      }

      return {
        id,
        label: config.label,
        value,
        displayValue,
        onRemove: () => removeFilter(id)
      };
    }).filter(Boolean) as ActiveFilter[];
  }, [filters, configs, removeFilter]);

  // Context7 Pattern: Default filter function with type safety
  const defaultFilterFn = useCallback((item: T, filterState: FilterState): boolean => {
    return Object.entries(filterState).every(([filterId, filterValue]) => {
      const config = configs.find(c => c.id === filterId);
      if (!config || filterValue === null || filterValue === undefined) return true;

      // Type-safe property access
      const itemValue = (item as Record<string, unknown>)[filterId];

      switch (config.type) {
        case 'text':
          return String(itemValue || '').toLowerCase().includes(String(filterValue).toLowerCase());

        case 'select':
          return itemValue === filterValue;

        case 'multiselect':
          if (Array.isArray(filterValue)) {
            return filterValue.includes(itemValue);
          }
          return itemValue === filterValue;

        case 'boolean':
          return Boolean(itemValue) === Boolean(filterValue);

        case 'number':
          return Number(itemValue) === Number(filterValue);

        case 'numberrange':
          if (Array.isArray(filterValue) && filterValue.length === 2) {
            const [min, max] = filterValue as [number, number];
            const value = Number(itemValue);
            return value >= min && value <= max;
          }
          return true;

        case 'date':
          const itemDate = new Date(itemValue);
          const filterDate = new Date(filterValue as Date);
          return itemDate.toDateString() === filterDate.toDateString();

        case 'daterange':
          if (Array.isArray(filterValue) && filterValue.length === 2) {
            const [start, end] = filterValue as [Date, Date];
            const itemDateValue = new Date(itemValue);
            return itemDateValue >= start && itemDateValue <= end;
          }
          return true;

        default:
          return true;
      }
    });
  }, [configs]);

  // Context7 Pattern: Apply filters with memoization
  const filteredData = useMemo(() => {
    if (!hasActiveFilters) return data;

    const filterFunction = customFilterFn || defaultFilterFn;
    return data.filter(item => filterFunction(item, filters));
  }, [data, filters, hasActiveFilters, customFilterFn, defaultFilterFn]);

  // Context7 Pattern: Return object with consistent interface
  return {
    setFilter,
    removeFilter,
    clearAll,
    resetToDefaults,
    hasActiveFilters,
    activeFilters,
    filteredData,
    filterCount: activeFilters.length,
    totalCount: data.length,
    filteredCount: filteredData.length
  } as const;
}

// Context7 Pattern: Specialized filter configurations for common use cases
export const createProductFilterConfigs = (): FilterConfig[] => [
  {
    id: 'name',
    label: 'Nome',
    type: 'text',
    placeholder: 'Buscar por nome...'
  },
  {
    id: 'category',
    label: 'Categoria',
    type: 'select',
    options: [
      { label: 'Vinhos Tintos', value: 'vinhos_tintos' },
      { label: 'Vinhos Brancos', value: 'vinhos_brancos' },
      { label: 'Espumantes', value: 'espumantes' },
      { label: 'Destilados', value: 'destilados' },
      { label: 'Cervejas', value: 'cervejas' }
    ]
  },
  {
    id: 'is_active',
    label: 'Status',
    type: 'boolean',
    defaultValue: true
  },
  {
    id: 'price',
    label: 'Preço',
    type: 'numberrange'
  },
  {
    id: 'stock_quantity',
    label: 'Estoque',
    type: 'number'
  }
];

export const createCustomerFilterConfigs = (): FilterConfig[] => [
  {
    id: 'name',
    label: 'Nome',
    type: 'text',
    placeholder: 'Buscar por nome...'
  },
  {
    id: 'email',
    label: 'Email',
    type: 'text',
    placeholder: 'Buscar por email...'
  },
  {
    id: 'segment',
    label: 'Segmento',
    type: 'select',
    options: [
      { label: 'Alto Valor', value: 'high_value' },
      { label: 'Regular', value: 'regular' },
      { label: 'Ocasional', value: 'occasional' },
      { label: 'Novo', value: 'new' }
    ]
  },
  {
    id: 'birthday',
    label: 'Aniversário',
    type: 'daterange'
  }
];

export const createSupplierFilterConfigs = (): FilterConfig[] => [
  {
    id: 'company_name',
    label: 'Empresa',
    type: 'text',
    placeholder: 'Buscar por empresa...'
  },
  {
    id: 'is_active',
    label: 'Status',
    type: 'boolean',
    defaultValue: true
  },
  {
    id: 'minimum_order_value',
    label: 'Pedido Mínimo',
    type: 'numberrange'
  }
];