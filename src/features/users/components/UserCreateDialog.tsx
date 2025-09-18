/**
 * Componente modal para criação de usuários
 * Extraído do UserManagement.tsx para separar responsabilidades
 */

import React, { useState } from 'react';
import { BaseModal } from '@/shared/ui/composite/BaseModal';
import { UserCreateDialogProps, NewUserData } from './types';
import { UserForm } from './UserForm';
import { useUserCreation } from '@/features/users/hooks/useUserCreation';

export const UserCreateDialog: React.FC<UserCreateDialogProps> = ({
  isOpen,
  onClose,
  onUserCreated,
  isSubmitting,
}) => {
  const [formData, setFormData] = useState<NewUserData>({
    name: '',
    email: '',
    password: '',
    role: 'employee'
  });

  const { createUser } = useUserCreation();

  const handleSubmit = async (userData: NewUserData) => {
    try {
      await createUser(userData);
      // Reset form data after successful creation
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'employee'
      });
      onUserCreated();
    } catch (error) {
      // Error handling is done in the hook
      console.error('Error creating user:', error);
    }
  };

  const handleCancel = () => {
    // Reset form data on cancel
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'employee'
    });
    onClose();
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
      <div className="text-accent-gold-100 or bg-accent-gold-100"></div>

      <UserForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
        initialData={formData}
      />
    </BaseModal>
  );
};