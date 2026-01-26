/**
 * Container principal para gerenciamento de usuários e categorias
 * Refatorado para seguir o padrão visual "Premium ERP"
 */

import React, { useState, useRef } from 'react';
import { Button } from '@/shared/ui/primitives/button';
import { Plus, Users, FolderTree } from 'lucide-react';
import { cn } from '@/core/config/utils';
import { PremiumBackground } from '@/shared/ui/composite/PremiumBackground';

// Componentes refatorados
import { FirstAdminSetup } from './FirstAdminSetup';
import { UserList } from './UserList';
import { UserCreateDialog } from './UserCreateDialog';
import { CategoryManagement, CategoryManagementRef } from '@/features/admin/components/CategoryManagement';

// Hooks customizados
import { useFirstAdminSetup } from '@/features/users/hooks/useFirstAdminSetup';
import { useUserManagement } from '@/features/users/hooks/useUserManagement';
import { useUserCreation } from '@/features/users/hooks/useUserCreation';
import { useUserPermissions } from '@/features/users/hooks/useUserPermissions';

type ActiveTab = 'users' | 'categories';

const UserManagement = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('users');
  const categoryRef = useRef<CategoryManagementRef>(null);

  // Hooks customizados
  const { showFirstAdminSetup, isSettingUp } = useFirstAdminSetup();
  const { users, isLoading, refreshUsers } = useUserManagement();
  const { createFirstAdmin, isCreating } = useUserCreation();
  const { canCreateUsers, canViewUsers } = useUserPermissions();

  // Handlers
  const handleFirstAdminSetup = async () => {
    await createFirstAdmin();
    await refreshUsers();
  };

  const handleCreateUser = async () => {
    setIsCreateDialogOpen(false);
    await refreshUsers();
  };

  const handleRefreshUsers = async () => {
    await refreshUsers();
  };

  const handleAddCategory = () => {
    categoryRef.current?.openDialog();
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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center opacity-40">
          <Users className="h-16 w-16 text-zinc-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-zinc-300 mb-2">
            Acesso Negado
          </h2>
          <p className="text-zinc-500">
            Você não tem permissão para visualizar esta página.
          </p>
        </div>
      </div>
    );
  }

  return (
    <PremiumBackground>
      <div className="w-full h-full flex flex-col relative overflow-hidden">
        {/* Header - Refactored to match premium ERP pattern */}
        <header className="px-8 py-6 pt-8 pb-3">
            <div className="flex flex-wrap justify-between items-end gap-4 mb-4">
              <div className="flex flex-col gap-1.5">
                <p className="text-[#f9cb15] text-[10px] font-bold tracking-[0.2em] uppercase opacity-70">Painel Administrativo</p>
                <div className="flex items-center gap-3">
                      <Users className="w-8 h-8 text-[#f9cb15]" />
                      <h1 className="text-white text-3xl md:text-4xl font-bold leading-tight tracking-tight uppercase drop-shadow-sm font-display">
                        GERENCIAR USUÁRIOS
                      </h1>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                 {/* Tab Switcher - Premium Pattern */}
                 <div className="flex items-center gap-3 bg-white/[0.03] p-1 rounded-2xl border border-white/5">
                    <button
                      onClick={() => setActiveTab('users')}
                      className={cn(
                        "px-6 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2",
                        activeTab === 'users' ? "bg-[#f9cb15] text-black shadow-lg" : "text-zinc-500 hover:text-white"
                      )}
                    >
                      <Users className="h-3.5 w-3.5" />
                      USUÁRIOS
                    </button>
                    <button
                      onClick={() => setActiveTab('categories')}
                      className={cn(
                        "px-6 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2",
                        activeTab === 'categories' ? "bg-[#f9cb15] text-black shadow-lg" : "text-zinc-500 hover:text-white"
                      )}
                    >
                      <FolderTree className="h-3.5 w-3.5" />
                      CATEGORIAS
                    </button>
                 </div>

                 {/* Action Buttons */}
                 {canCreateUsers && activeTab === 'users' && (
                  <Button
                    onClick={() => setIsCreateDialogOpen(true)}
                    className="flex items-center justify-center gap-2 h-10 px-6 rounded-xl bg-white text-black text-sm font-bold shadow-lg hover:bg-zinc-200 transition-colors"
                  >
                    <Plus className="w-[18px] h-[18px]" />
                    <span>Novo Colaborador</span>
                  </Button>
                )}

                {activeTab === 'categories' && (
                  <Button
                    onClick={handleAddCategory}
                    className="flex items-center justify-center gap-2 h-10 px-6 rounded-xl bg-white text-black text-sm font-bold shadow-lg hover:bg-zinc-200 transition-colors"
                  >
                    <Plus className="w-[18px] h-[18px]" />
                    <span>Nova Categoria</span>
                  </Button>
                )}
              </div>
            </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 px-8 pb-8 overflow-hidden flex flex-col">
           {/* Container principal sem padding/bordas extras, delegando estilo para os componentes internos */}
           <div className="flex-1 min-h-0 bg-transparent flex flex-col overflow-hidden">
              {activeTab === 'users' ? (
                <UserList
                  users={users}
                  onRefresh={handleRefreshUsers}
                  canManageUsers={canCreateUsers}
                  isLoading={isLoading}
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                />
              ) : (
                <CategoryManagement ref={categoryRef} />
              )}
           </div>
        </div>

        {/* Dialogs */}
        <UserCreateDialog
          isOpen={isCreateDialogOpen}
          onClose={() => setIsCreateDialogOpen(false)}
          onUserCreated={handleCreateUser}
        />
      </div>
    </PremiumBackground>
  );
};

export { UserManagement };
export default UserManagement;