/**
 * Container principal para gerenciamento de usuários
 * Refatorado para usar componentes separados e hooks customizados
 * Reduzido de 410 para ~100 linhas seguindo SRP
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

// Componentes refatorados
import { FirstAdminSetup } from './users/FirstAdminSetup';
import { UserList } from './users/UserList';
import { UserCreateDialog } from './users/UserCreateDialog';

// Hooks customizados
import { useFirstAdminSetup } from '@/hooks/users/useFirstAdminSetup';
import { useUserManagement } from '@/hooks/users/useUserManagement';
import { useUserCreation } from '@/hooks/users/useUserCreation';
import { useUserPermissions } from '@/hooks/users/useUserPermissions';

export const UserManagement = () => {
  // Estados locais apenas para dialogs
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Hooks customizados
  const { showFirstAdminSetup, isSettingUp } = useFirstAdminSetup();
  const { users, isLoading, refreshUsers } = useUserManagement();
  const { createUser, createFirstAdmin, isCreating } = useUserCreation();
  const { canCreateUsers, canViewUsers } = useUserPermissions();

  // Handlers
  const handleFirstAdminSetup = async () => {
    await createFirstAdmin();
    // Refresh users list after creating first admin
    await refreshUsers();
  };

  const handleCreateUser = async () => {
    // The actual user creation logic is handled by UserCreateDialog + UserForm
    // This just closes the dialog and refreshes the list
    setIsCreateDialogOpen(false);
    await refreshUsers();
  };

  const handleRefreshUsers = async () => {
    await refreshUsers();
  };

  // Show first admin setup if no users exist
  if (showFirstAdminSetup) {
    return (
      <FirstAdminSetup
        onSetupComplete={handleFirstAdminSetup}
        isLoading={isCreating || isSettingUp}
      />
    );
  }

  // Show access denied if user doesn't have permission
  if (!canViewUsers) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-adega-platinum mb-4">
            Acesso Negado
          </h2>
          <p className="text-adega-platinum/60">
            Você não tem permissão para visualizar esta página.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com botão de criar usuário */}
      {canCreateUsers && (
        <div className="flex justify-end">
          <Button 
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-adega-gold hover:bg-adega-gold/80 text-black"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Usuário
          </Button>
        </div>
      )}

      {/* Lista de usuários */}
      <UserList
        users={users}
        onRefresh={handleRefreshUsers}
        canManageUsers={canCreateUsers}
        isLoading={isLoading}
      />

      {/* Dialog de criação de usuário */}
      <UserCreateDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onUserCreated={handleCreateUser}
        isSubmitting={isCreating}
      />
    </div>
  );
};