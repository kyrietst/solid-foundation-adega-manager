/**
 * UserCreateDialog.tsx - Modal para criação de usuários (REFATORADO)
 * Context7 Pattern: Form State Consolidation aplicado
 * Elimina duplicação de estado encontrada na análise
 *
 * REFATORAÇÃO APLICADA:
 * - Hook useFormWithToast centralizado
 * - Eliminação de useState local para formData
 * - Toast integrado automaticamente
 * - Reset automático após sucesso
 * - Error handling padronizado
 *
 * @version 2.0.0 - Refatorado com Context7
 */

import React from 'react';
import { z } from 'zod';
import { BaseModal } from '@/shared/ui/composite/BaseModal';
import { UserCreateDialogProps, NewUserData } from './types';
import { UserForm } from './UserForm';
import { useUserCreation } from '@/features/users/hooks/useUserCreation';
import { useFormWithToast } from '@/shared/hooks/common/useFormWithToast';

// Schema de validação para usuários
const userSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  role: z.enum(['admin', 'employee', 'delivery'], {
    errorMap: () => ({ message: 'Papel inválido' })
  })
});

export const UserCreateDialog: React.FC<UserCreateDialogProps> = ({
  isOpen,
  onClose,
  onUserCreated,
}) => {
  const { createUser } = useUserCreation();

  // Dados iniciais do formulário
  const initialFormData: NewUserData = {
    name: '',
    email: '',
    password: '',
    role: 'employee'
  };

  // Hook centralizado de formulário com toast
  const {
    data: formData,
    isSubmitting,
    updateField,
    updateFields,
    handleSubmit,
    reset,
  } = useFormWithToast(initialFormData, {
    schema: userSchema,
    onSubmit: async (userData) => {
      await createUser(userData);
    },
    onSuccess: () => {
      onUserCreated();
      onClose();
    },
    successMessage: 'Usuário criado com sucesso!',
    errorMessage: 'Erro ao criar usuário',
    resetOnSuccess: true,
  });

  const handleCancel = () => {
    reset(); // Usar reset do hook centralizado
    onClose();
  };

  // Wrapper para submit que será passado para UserForm
  const handleFormSubmit = async (userData: NewUserData) => {
    // Atualizar dados e trigger submit
    updateFields(userData);
    await handleSubmit();
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleCancel}
      title="Criar Novo Usuário"
      description="Preencha as informações abaixo para criar um novo usuário no sistema."
      size="md"
      className="shadow-2xl"
    >
      <div className="w-16 h-1 bg-gradient-to-r from-[#FFD700] to-[#FFA500] mx-auto rounded-full mb-4"></div>

      <UserForm
        onSubmit={handleFormSubmit}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
        initialData={formData}
      />
    </BaseModal>
  );
};