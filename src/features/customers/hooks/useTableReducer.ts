/**
 * useTableReducer - Hook consolidado para gerenciamento de estado de tabela
 * Context7 Pattern: useState → useReducer migration para lógica complexa
 * Elimina 8 useState identificados na análise (CustomerDataTable.tsx)
 *
 * REFATORAÇÃO APLICADA:
 * - useReducer para estados interdependentes
 * - Actions tipadas para consistência
 * - Estado centralizado e imutável
 * - Performance otimizada com dispatch
 * - Lógica de transições centralizadas
 *
 * @version 2.0.0 - Migrado de useState para useReducer (Context7)
 */

import { useReducer, useCallback } from 'react';
import {
  TableColumn,
  SortField,
  SortDirection,
  FilterConfig,
  TABLE_COLUMNS,
} from '../components/utils/table-types';

// Estado consolidado da tabela
interface TableState {
  visibleColumns: TableColumn[];
  sortField: SortField | null;
  sortDirection: SortDirection;
  filters: FilterConfig;
}

// Actions tipadas para o reducer
type TableAction =
  | { type: 'SET_VISIBLE_COLUMNS'; payload: TableColumn[] }
  | { type: 'TOGGLE_COLUMN'; payload: string }
  | { type: 'SET_SORT'; payload: { field: SortField; direction: SortDirection } }
  | { type: 'TOGGLE_SORT'; payload: SortField }
  | { type: 'UPDATE_FILTER'; payload: { key: keyof FilterConfig; value: string } }
  | { type: 'CLEAR_FILTERS' }
  | { type: 'RESET_TABLE' };

// Estado inicial
const initialState: TableState = {
  visibleColumns: [...TABLE_COLUMNS],
  sortField: 'ultimaCompra',
  sortDirection: 'desc',
  filters: {
    searchTerm: "",
    segmentFilter: "",
    statusFilter: "",
    lastPurchaseFilter: "",
    birthdayFilter: "",
  },
};

// Reducer para gerenciar transições de estado complexas
function tableReducer(state: TableState, action: TableAction): TableState {
  switch (action.type) {
    case 'SET_VISIBLE_COLUMNS':
      return {
        ...state,
        visibleColumns: action.payload,
      };

    case 'TOGGLE_COLUMN': {
      const columnKey = action.payload;
      const isVisible = state.visibleColumns.some(col => col.key === columnKey);

      if (isVisible) {
        // Remover coluna (manter pelo menos uma visível)
        if (state.visibleColumns.length <= 1) return state;
        return {
          ...state,
          visibleColumns: state.visibleColumns.filter(col => col.key !== columnKey),
        };
      } else {
        // Adicionar coluna
        const columnToAdd = TABLE_COLUMNS.find(col => col.key === columnKey);
        if (!columnToAdd) return state;
        return {
          ...state,
          visibleColumns: [...state.visibleColumns, columnToAdd],
        };
      }
    }

    case 'SET_SORT':
      return {
        ...state,
        sortField: action.payload.field,
        sortDirection: action.payload.direction,
      };

    case 'TOGGLE_SORT': {
      const field = action.payload;
      if (state.sortField === field) {
        // Alternar direção se mesmo campo
        return {
          ...state,
          sortDirection: state.sortDirection === 'asc' ? 'desc' : 'asc',
        };
      } else {
        // Novo campo, começar com asc
        return {
          ...state,
          sortField: field,
          sortDirection: 'asc',
        };
      }
    }

    case 'UPDATE_FILTER':
      return {
        ...state,
        filters: {
          ...state.filters,
          [action.payload.key]: action.payload.value,
        },
      };

    case 'CLEAR_FILTERS':
      return {
        ...state,
        filters: {
          searchTerm: "",
          segmentFilter: "",
          statusFilter: "",
          lastPurchaseFilter: "",
          birthdayFilter: "",
        },
      };

    case 'RESET_TABLE':
      return initialState;

    default:
      return state;
  }
}

// Hook personalizado que encapsula o reducer
export const useTableReducer = (customInitialState?: Partial<TableState>) => {
  const [state, dispatch] = useReducer(
    tableReducer,
    customInitialState ? { ...initialState, ...customInitialState } : initialState
  );

  // Actions memoizadas para performance
  const actions = {
    // Gerenciamento de colunas
    setVisibleColumns: useCallback((columns: TableColumn[]) => {
      dispatch({ type: 'SET_VISIBLE_COLUMNS', payload: columns });
    }, []),

    toggleColumn: useCallback((columnKey: string) => {
      dispatch({ type: 'TOGGLE_COLUMN', payload: columnKey });
    }, []),

    // Gerenciamento de ordenação
    setSort: useCallback((field: SortField, direction: SortDirection) => {
      dispatch({ type: 'SET_SORT', payload: { field, direction } });
    }, []),

    toggleSort: useCallback((field: SortField) => {
      dispatch({ type: 'TOGGLE_SORT', payload: field });
    }, []),

    // Gerenciamento de filtros
    updateFilter: useCallback((key: keyof FilterConfig, value: string) => {
      dispatch({ type: 'UPDATE_FILTER', payload: { key, value } });
    }, []),

    // Ações específicas de filtros (conveniência)
    setSearchTerm: useCallback((value: string) => {
      dispatch({ type: 'UPDATE_FILTER', payload: { key: 'searchTerm', value } });
    }, []),

    setSegmentFilter: useCallback((value: string) => {
      dispatch({ type: 'UPDATE_FILTER', payload: { key: 'segmentFilter', value } });
    }, []),

    setStatusFilter: useCallback((value: string) => {
      dispatch({ type: 'UPDATE_FILTER', payload: { key: 'statusFilter', value } });
    }, []),

    setLastPurchaseFilter: useCallback((value: string) => {
      dispatch({ type: 'UPDATE_FILTER', payload: { key: 'lastPurchaseFilter', value } });
    }, []),

    setBirthdayFilter: useCallback((value: string) => {
      dispatch({ type: 'UPDATE_FILTER', payload: { key: 'birthdayFilter', value } });
    }, []),

    // Ações de limpeza
    clearFilters: useCallback(() => {
      dispatch({ type: 'CLEAR_FILTERS' });
    }, []),

    resetTable: useCallback(() => {
      dispatch({ type: 'RESET_TABLE' });
    }, []),
  };

  // Computed values
  const computed = {
    hasActiveFilters: Object.values(state.filters).some(Boolean),
    activeFiltersCount: Object.values(state.filters).filter(Boolean).length,
    isDefaultSort: state.sortField === 'ultimaCompra' && state.sortDirection === 'desc',
    visibleColumnsCount: state.visibleColumns.length,
  };

  return {
    state,
    actions,
    computed,
    dispatch, // Para casos avançados
  };
};

export default useTableReducer;