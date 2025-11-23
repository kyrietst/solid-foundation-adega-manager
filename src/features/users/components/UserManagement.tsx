/**
 * Container principal para gerenciamento de usuários
 * Refatorado para usar componentes separados e hooks customizados
 * Reduzido de 410 para ~100 linhas seguindo SRP
 */

import React, { useState } from 'react';
import { Button } from '@/shared/ui/primitives/button';
import { Badge } from '@/shared/ui/primitives/badge';
import { Plus, Users, FolderTree, Settings } from 'lucide-react';
import { PageHeader } from '@/shared/ui/composite/PageHeader';
import { cn } from '@/core/config/utils';
import { getSFProTextClasses } from '@/core/config/theme-utils';

// Componentes refatorados
import { FirstAdminSetup } from './FirstAdminSetup';
import { UserList } from './UserList';
import { UserCreateDialog } from './UserCreateDialog';
import { CategoryManagement } from '@/features/admin/components/CategoryManagement';

// Hooks customizados
import { useFirstAdminSetup } from '@/features/users/hooks/useFirstAdminSetup';
import { useUserManagement } from '@/features/users/hooks/useUserManagement';
import { useUserCreation } from '@/features/users/hooks/useUserCreation';
import { useUserPermissions } from '@/features/users/hooks/useUserPermissions';

type ActiveTab = 'users' | 'categories';

const UserManagement = () => {
  // Estados locais para dialogs e abas
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('users');

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
      <div className="flex items-center justify-center min-h-content-md">
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
    <div className="w-full h-full flex flex-col">
      {/* Header - altura fixa */}
      <PageHeader
        title="ADMINISTRAÇÃO DO SISTEMA"
        count={users.length}
        countLabel="usuários"
      />

      {/* Container principal com glassmorphism - ocupa altura restante */}
      <div className="flex-1 min-h-0 bg-black/80 backdrop-blur-sm border border-white/10 rounded-xl shadow-lg p-4 flex flex-col hover:shadow-2xl hover:shadow-purple-500/10 hover:border-purple-400/30 transition-all duration-300">

        {/* Header com controles dentro do box */}
        <div className="flex-shrink-0 mb-4">
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div className="flex items-center space-x-4">
              <h2 className="text-lg font-semibold text-adega-platinum">Gerenciar Usuários</h2>
              <Badge variant="secondary" className="bg-gray-700/50 text-gray-100 border-gray-600/50">
                {users.length} usuários
              </Badge>
            </div>

            <div className="flex items-center space-x-2">
              {/* Botão Novo Usuário */}
              {canCreateUsers && activeTab === 'users' && (
                <Button
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="bg-gradient-to-r from-primary-yellow to-yellow-500 text-black hover:from-yellow-300 hover:to-yellow-400 font-semibold shadow-lg hover:shadow-yellow-400/30 transition-all duration-200 hover:scale-105"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  NOVO USUÁRIO
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Conteúdo baseado na aba ativa */}
        {activeTab === 'users' ? (
          <>
            {/* Lista de usuários */}
            <UserList
              users={users}
              onRefresh={handleRefreshUsers}
              canManageUsers={canCreateUsers}
              isLoading={isLoading}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />

            {/* Dialog de criação de usuário */}
            <UserCreateDialog
              isOpen={isCreateDialogOpen}
              onClose={() => setIsCreateDialogOpen(false)}
              onUserCreated={handleCreateUser}
              isSubmitting={isCreating}
            />
          </>
        ) : (
          /* Gerenciamento de categorias */
          <div className="flex-1 overflow-auto">
            <CategoryManagement />
          </div>
        )}
      </div>
    </div>
  );
};

export { UserManagement };
export default UserManagement;