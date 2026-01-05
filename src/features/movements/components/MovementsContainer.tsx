/**
 * Container de Movimentações - Coordena dados e lógica
 * Implementa padrão Container/Presentational com PAGINAÇÃO
 * MODO AUDITORIA: Read-Only (Lógica de criação removida)
 */

import React from 'react';
import { useAuth } from '@/app/providers/AuthContext';
import { useMovementsLogic } from '@/features/movements/hooks/useMovementsLogic';
import { MovementsPresentation } from './MovementsPresentation';

export const MovementsContainer: React.FC = () => {
  const { userRole } = useAuth();

  // Lógica centralizada COM PAGINAÇÃO
  const {
    // Dados
    movements,
    products,
    customers,
    salesList,
    productsMap,
    usersMap,
    typeInfo,

    // Paginação
    page,
    pageSize,
    totalCount,
    totalPages,
    setPage,
    setPageSize,

    // Estados
    isLoading,

    // Filtros
    dateRange,
    setDateRange
  } = useMovementsLogic();

  // Preparar props para apresentação
  const presentationProps = {
    // Dados processados
    movements,
    products,
    customers,
    salesList,
    productsMap,
    usersMap,
    typeInfo,

    // Paginação
    page,
    pageSize,
    totalCount,
    totalPages,
    onPageChange: setPage,
    onPageSizeChange: setPageSize,

    // Filtros
    dateRange,
    setDateRange,

    // Estados
    isLoading,

    // Configuração
    userRole,
  };

  return <MovementsPresentation {...presentationProps} />;
};
