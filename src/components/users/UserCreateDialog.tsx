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
} from '@/components/ui/dialog';
import { UserCreateDialogProps, NewUserData } from './types';
import { UserForm } from './UserForm';
import { useUserCreation } from '@/hooks/users/useUserCreation';

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
      <DialogContent className="max-w-md bg-adega-charcoal border-white/10">
        <DialogHeader>
          <DialogTitle className="text-adega-platinum">
            Criar Novo Usuário
          </DialogTitle>
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