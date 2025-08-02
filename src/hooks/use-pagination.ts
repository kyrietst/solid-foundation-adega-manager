import { useState, useMemo, useCallback, useEffect } from 'react';

export interface PaginationOptions {
  initialPage?: number;
  initialItemsPerPage?: number;
  resetPageOnDataChange?: boolean;
}

export interface PaginationResult<T> {
  // Estado atual
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
  totalItems: number;
  
  // Dados paginados
  paginatedItems: T[];
  startIndex: number;
  endIndex: number;
  
  // Funções de controle
  setCurrentPage: (page: number) => void;
  setItemsPerPage: (items: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  goToFirstPage: () => void;
  goToLastPage: () => void;
}

/**
 * Hook reutilizável para paginação de dados
 * @param items - Array de itens para paginar
 * @param options - Opções de configuração da paginação
 */
export function usePagination<T>(
  items: T[] = [],
  options: PaginationOptions = {}
): PaginationResult<T> {
  const {
    initialPage = 1,
    initialItemsPerPage = 12,
    resetPageOnDataChange = true
  } = options;

  const [currentPage, setCurrentPageState] = useState(initialPage);
  const [itemsPerPage, setItemsPerPageState] = useState(initialItemsPerPage);

  // Calcular valores derivados
  const { paginatedItems, totalPages, totalItems, startIndex, endIndex } = useMemo(() => {
    const totalItems = items.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    const paginatedItems = items.slice(startIndex, endIndex);

    return {
      paginatedItems,
      totalPages,
      totalItems,
      startIndex,
      endIndex
    };
  }, [items, currentPage, itemsPerPage]);

  // Resetar página quando dados mudam (se habilitado)
  // Usando useEffect para side effect ao invés de useMemo
  useEffect(() => {
    if (resetPageOnDataChange && currentPage > totalPages && totalPages > 0) {
      setCurrentPageState(1);
    }
  }, [resetPageOnDataChange, currentPage, totalPages]);

  // Funções de controle
  const setCurrentPage = useCallback((page: number) => {
    const validPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPageState(validPage);
  }, [totalPages]);

  const setItemsPerPage = useCallback((items: number) => {
    setItemsPerPageState(items);
    setCurrentPageState(1); // Reset para primeira página
  }, []);

  const nextPage = useCallback(() => {
    setCurrentPageState(prev => Math.min(prev + 1, totalPages));
  }, [totalPages]);

  const prevPage = useCallback(() => {
    setCurrentPageState(prev => Math.max(prev - 1, 1));
  }, []);

  const goToFirstPage = useCallback(() => {
    setCurrentPage(1);
  }, [setCurrentPage]);

  const goToLastPage = useCallback(() => {
    setCurrentPage(totalPages);
  }, [setCurrentPage, totalPages]);

  return {
    // Estado atual
    currentPage,
    itemsPerPage,
    totalPages,
    totalItems,
    
    // Dados paginados
    paginatedItems,
    startIndex,
    endIndex,
    
    // Funções de controle
    setCurrentPage,
    setItemsPerPage,
    nextPage,
    prevPage,
    goToFirstPage,
    goToLastPage
  };
}