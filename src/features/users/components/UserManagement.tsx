/**
 * Container principal para gerenciamento de usuários
 * Refatorado para usar componentes separados e hooks customizados
 * Reduzido de 410 para ~100 linhas seguindo SRP
 */

import React, { useState } from 'react';
import { Button } from '@/shared/ui/primitives/button';
import { Plus, Users, FolderTree, Settings } from 'lucide-react';
import { BlurIn } from '@/components/ui/blur-in';
import { cn } from '@/core/config/utils';

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

export const UserManagement = () => {
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
    <div className="w-full h-full flex flex-col p-4">
      {/* Header padronizado */}
      <div className="flex-shrink-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        {/* Header com BlurIn animation */}
        <div className="relative text-center sm:text-left">
          {/* Título animado */}
          <BlurIn
            word="ADMINISTRAÇÃO DO SISTEMA"
            duration={1.2}
            variant={{
              hidden: { filter: "blur(15px)", opacity: 0 },
              visible: { filter: "blur(0px)", opacity: 1 }
            }}
            className="text-xl lg:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FF2400] via-[#FFDA04] to-[#FF2400] drop-shadow-lg"
            style={{
              textShadow: '0 2px 4px rgba(0,0,0,0.3), 0 0 20px rgba(255, 218, 4, 0.2)'
            }}
          />
          
          {/* Sublinhado elegante */}
          <div className="w-full h-2 relative">
            <div className="absolute inset-x-0 top-0 bg-gradient-to-r from-transparent via-[#FF2400]/80 to-transparent h-[2px] w-full blur-sm" />
            <div className="absolute inset-x-0 top-0 bg-gradient-to-r from-transparent via-[#FF2400] to-transparent h-px w-full" />
            <div className="absolute inset-x-0 top-0 bg-gradient-to-r from-transparent via-[#FFDA04]/80 to-transparent h-[3px] w-3/4 blur-sm mx-auto" />
            <div className="absolute inset-x-0 top-0 bg-gradient-to-r from-transparent via-[#FFDA04] to-transparent h-px w-3/4 mx-auto" />
          </div>

          {/* Abas de navegação */}
          <div className="flex items-center gap-1 mt-4 bg-black/40 backdrop-blur-sm rounded-lg p-1 border border-white/10">
            <button
              onClick={() => setActiveTab('users')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200",
                activeTab === 'users'
                  ? "bg-[#FFD700]/20 text-[#FFD700] border border-[#FFD700]/30"
                  : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
              )}
            >
              <Users className="h-4 w-4" />
              Usuários
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200",
                activeTab === 'categories'
                  ? "bg-[#FFD700]/20 text-[#FFD700] border border-[#FFD700]/30"
                  : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
              )}
            >
              <FolderTree className="h-4 w-4" />
              Categorias
            </button>
          </div>
        </div>
        
        {/* Controles */}
        {canCreateUsers && activeTab === 'users' && (
          <div className="flex items-center gap-4">
            <Button 
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-black/80 border-[#FFD700]/40 text-[#FFD700] hover:bg-[#FFD700]/20 hover:shadow-xl hover:shadow-[#FFD700]/30 hover:border-[#FFD700]/80 hover:scale-105 backdrop-blur-sm transition-all duration-300 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#FFD700]/5 via-[#FFD700]/10 to-[#FFD700]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <Plus className="h-4 w-4 mr-2 relative z-10 group-hover:rotate-90 transition-transform duration-300" />
              <span className="relative z-10 font-medium">Novo Usuário</span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 -translate-x-full group-hover:translate-x-full transform" />
            </Button>
          </div>
        )}
      </div>

      {/* Container principal com glassmorphism */}
      <section 
        className="bg-black/80 backdrop-blur-sm border border-white/10 rounded-xl shadow-lg p-4 hover:shadow-2xl hover:shadow-purple-500/10 hover:border-purple-400/30 transition-all duration-300 flex-1"
        onMouseMove={(e) => {
          const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * 100;
          const y = ((e.clientY - rect.top) / rect.height) * 100;
          (e.currentTarget as HTMLElement).style.setProperty("--x", `${x}%`);
          (e.currentTarget as HTMLElement).style.setProperty("--y", `${y}%`);
        }}
      >

        {/* Conteúdo baseado na aba ativa */}
        {activeTab === 'users' ? (
          <>
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
          </>
        ) : (
          /* Gerenciamento de categorias */
          <CategoryManagement />
        )}
      </section>
    </div>
  );
};

export default UserManagement;