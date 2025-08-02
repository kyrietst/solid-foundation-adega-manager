/**
 * Hook para controle de visualização (grid/table) e paginação
 * Extraído do InventoryNew.tsx para separar lógica de view
 */

import { useState, useCallback } from 'react';
import { InventoryViewState } from '@/components/inventory/types';

export const useInventoryView = (): InventoryViewState => {
  const [viewMode, setViewModeState] = useState<'grid' | 'table'>('grid');
  const [itemsPerPage, setItemsPerPageState] = useState(12); // 12 para grid por padrão

  const setViewMode = useCallback((mode: 'grid' | 'table') => {
    setViewModeState(mode);
    // Ajustar items per page baseado no modo de visualização
    if (mode === 'grid') {
      setItemsPerPageState(12);
    } else {
      setItemsPerPageState(20);
    }
  }, []);

  const setItemsPerPage = useCallback((count: number) => {
    setItemsPerPageState(count);
  }, []);

  return {
    viewMode,
    itemsPerPage,
    setViewMode,
    setItemsPerPage,
  };
};