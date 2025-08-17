/**
 * Componente modal para criação de usuários
 * Extraído do UserManagement.tsx para separar responsabilidades
 */

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/shared/ui/primitives/dialog';
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-gray-900/95 border-white/20 backdrop-blur-xl shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white text-center mb-2">
            Criar Novo Usuário
          </DialogTitle>
          <DialogDescription className="text-gray-400 text-center mb-2">
            Preencha as informações abaixo para criar um novo usuário no sistema.
          </DialogDescription>
          <div className="w-16 h-1 bg-gradient-to-r from-[#FFD700] to-[#FFA500] mx-auto rounded-full"></div>
        </DialogHeader>
        
        <div className="mt-4">
          <UserForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
            initialData={formData}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};