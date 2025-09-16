/**
 * Hook coordenador para lógica de movimentações
 * Combina todos os hooks especializados em uma interface única
 */

import { useMemo } from 'react';
import { useMovements } from './useMovements';
import { useMovementSupportData } from './useMovementSupportData';
import { useMovementForm } from './useMovementForm';
import { useMovementMutation } from './useMovementMutation';

export const useMovementsLogic = () => {
  // Buscar dados
  const { movements, isLoadingMovements } = useMovements();
  const { 
    products, 
    customers, 
    salesList, 
    users, 
    isLoading: isLoadingSupportData 
  } = useMovementSupportData();

  // Formulário
  const { form, updateForm, resetForm, productsMap } = useMovementForm(products);

  // Mutação
  const { createMovement, isCreating } = useMovementMutation();

  // Maps para exibição
  const usersMap = useMemo(() => 
    users.reduce((acc, u) => {
      acc[u.id] = u.name;
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
  };

  return {
    // Dados
    movements,
    products,
    customers,
    salesList,
    users,
    productsMap,
    usersMap,
    typeInfo,

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