/**
 * Versão debug do UserManagement para identificar dependência problemática
 */

import React, { useState } from 'react';
import { Button } from '@/shared/ui/primitives/button';
import { Plus, Users, FolderTree, Settings } from 'lucide-react';

// Adicionando hooks gradualmente para encontrar o problemático
import { useFirstAdminSetup } from '@/features/users/hooks/useFirstAdminSetup';
import { useUserManagement } from '@/features/users/hooks/useUserManagement';
import { useUserCreation } from '@/features/users/hooks/useUserCreation';
import { useUserPermissions } from '@/features/users/hooks/useUserPermissions';

// Testando componentes filhos progressivamente
import { BlurIn } from '@/components/ui/blur-in';
import { FirstAdminSetup } from './FirstAdminSetup';
import { UserList } from './UserList';
import { UserCreateDialog } from './UserCreateDialog';
import { CategoryManagement } from '@/features/admin/components/CategoryManagement';
const UserManagement = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'users' | 'categories'>('users');
  
  // Testando hooks progressivamente
  const { showFirstAdminSetup, isSettingUp } = useFirstAdminSetup();
  const { users, isLoading, refreshUsers } = useUserManagement();
  const { createUser, createFirstAdmin, isCreating } = useUserCreation();
  const { canCreateUsers, canViewUsers } = useUserPermissions();

  return (
    <div className="w-full h-full flex flex-col p-4">
      <div className="flex-shrink-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="relative text-center sm:text-left">
          <BlurIn
            word="ADMINISTRAÇÃO DO SISTEMA"
            duration={1.2}
            className="text-2xl font-bold text-white"
          />
        </div>
        
        <div className="flex items-center gap-4">
          <Button 
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-black/80 border-[#FFD700]/40 text-[#FFD700]"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Usuário
          </Button>
        </div>
      </div>

      <section className="bg-black/80 backdrop-blur-sm border border-white/10 rounded-xl shadow-lg p-4 flex-1">
        <div className="text-center text-white">
          <p>Versão debug carregada com sucesso!</p>
          <p className="text-gray-400 mt-2">
            Se você está vendo isso, os imports básicos estão funcionando.
          </p>
          <p className="text-gray-400 mt-2">
            useFirstAdminSetup: {showFirstAdminSetup ? 'Precisa setup' : 'OK'} | Carregando: {isSettingUp ? 'Sim' : 'Não'}
          </p>
          <p className="text-gray-400 mt-2">
            useUserManagement: {users?.length || 0} usuários | Carregando: {isLoading ? 'Sim' : 'Não'}
          </p>
          <p className="text-gray-400 mt-2">
            useUserCreation: Criando: {isCreating ? 'Sim' : 'Não'}
          </p>
          <p className="text-gray-400 mt-2">
            useUserPermissions: Criar: {canCreateUsers ? 'Sim' : 'Não'} | Ver: {canViewUsers ? 'Sim' : 'Não'}
          </p>
          <p className="text-gray-400 mt-2">
            🎉 Todos os hooks funcionando! Problema está nos componentes filhos.
          </p>
        </div>
      </section>
    </div>
  );
};

export { UserManagement };
export default UserManagement;