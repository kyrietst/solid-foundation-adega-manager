/**
 * Container de Movimentações - Coordena dados e lógica
 * Implementa padrão Container/Presentational com PAGINAÇÃO
 */

import React, { useState } from 'react';
import { useAuth } from '@/app/providers/AuthContext';
import { useMovementsLogic } from '@/features/movements/hooks/useMovementsLogic';
import { MovementsPresentation } from './MovementsPresentation';

export const MovementsContainer: React.FC = () => {
  const { userRole } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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
    isCreating,

    // Formulário
    form,
    updateForm,

    // Ações
    handleSubmit,
    handleSuccess,
  } = useMovementsLogic();

  // Handler para sucesso do formulário
  const handleFormSuccess = () => {
    handleSuccess();
    setIsDialogOpen(false);
  };

  // Handler para submit do formulário
  const handleFormSubmit = () => {
    handleSubmit();
    handleFormSuccess();
  };

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

    // Estados
    isLoading,
    isCreating,
    isDialogOpen,

    // Formulário
    formData: form,

    // Configuração
    userRole,
    canCreateMovement: userRole === 'admin',

    // Handlers
    onDialogOpenChange: setIsDialogOpen,
    onFormDataChange: updateForm,
    onFormSubmit: handleFormSubmit,
  };

  return <MovementsPresentation {...presentationProps} />;
};
