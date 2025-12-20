/**
 * Hook coordenador para lógica de movimentações
 * Combina todos os hooks especializados em uma interface única
 * Inclui suporte a PAGINAÇÃO para performance
 */

import { useState, useMemo } from 'react';
import { DateRange } from "react-day-picker";
import { useMovements } from './useMovements';
import { useMovementSupportData } from './useMovementSupportData';
import { useMovementForm } from './useMovementForm';
import { useMovementMutation } from './useMovementMutation';

export const useMovementsLogic = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  // Buscar dados COM PAGINAÇÃO e FILTRO
  const {
    movements,
    isLoadingMovements,
    // Paginação
    page,
    pageSize,
    totalCount,
    totalPages,
    setPage,
    setPageSize,
    refetchMovements
  } = useMovements({
    initialPageSize: 50,
    dateRange // Passar range para a query
  });

  const {
    products,
    customers,
    sales,
    users,
    isLoadingSupportData
  } = useMovementSupportData();

  // Formulário
  const { form, updateForm, resetForm, productsMap } = useMovementForm(products);

  // Mutação
  const { createMovement, isCreating } = useMovementMutation();

  // Maps para exibição
  const usersMap = useMemo(() =>
    users.reduce((acc, u) => {
      acc[u.id] = u.full_name || u.email || 'Desconhecido';
      return acc;
    }, {} as Record<string, string>),
    [users]
  );

  // Configuração de tipos de movimentação
  const typeInfo: Record<string, { label: string; color: string }> = {
    in: { label: 'Entrada', color: 'bg-green-100 text-green-700' },
    out: { label: 'Saída', color: 'bg-red-100 text-red-700' },
    fiado: { label: 'Fiado', color: 'bg-yellow-100 text-yellow-700' },
    devolucao: { label: 'Devolução', color: 'bg-blue-100 text-blue-700' },
  };

  // Handlers
  const handleSubmit = () => {
    createMovement(form);
  };

  const handleSuccess = () => {
    resetForm();
    refetchMovements(); // Refresh após criação
  };

  return {
    // Dados
    movements,
    products,
    customers,
    salesList: sales,
    users,
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

    // Filtros
    dateRange,
    setDateRange: (range: DateRange | undefined) => {
      setDateRange(range);
      setPage(1); // Resetar para página 1 ao filtrar
    },

    // Estados
    isLoadingMovements,
    isLoadingSupportData,
    isCreating,
    isLoading: isLoadingMovements || isLoadingSupportData,

    // Formulário
    form,
    updateForm,
    resetForm,

    // Ações
    handleSubmit,
    handleSuccess,
  };
};
