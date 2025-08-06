/**
 * Componente lista/tabela de usuários
 * Extraído do UserManagement.tsx para separar responsabilidades
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { Button } from '@/shared/ui/primitives/button';
import { Crown, Plus, RefreshCw } from 'lucide-react';
import { LoadingScreen } from '@/shared/ui/composite/loading-spinner';
import { UserListProps } from './types';
import { UserRoleBadge } from './UserRoleBadge';
import { UserActions } from './UserActions';
import { useRoleUtilities } from '@/features/users/hooks/useUserPermissions';

export const UserList: React.FC<UserListProps> = ({
  users,
  onRefresh,
  canManageUsers,
  isLoading = false,
}) => {
  const { isSupremeAdmin } = useRoleUtilities();

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (isLoading) {
    return <LoadingScreen text="Carregando usuários..." />;
  }

  return (
    <Card className="bg-adega-charcoal/20 border-white/10 backdrop-blur-xl shadow-xl">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold text-adega-platinum">
          Gerenciar Usuários
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            className="border-white/10 hover:bg-white/10"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {users.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-adega-platinum/60 mb-4">
              Nenhum usuário encontrado
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left p-4 font-medium text-adega-platinum">
                    Nome
                  </th>
                  <th className="text-left p-4 font-medium text-adega-platinum">
                    Email
                  </th>
                  <th className="text-left p-4 font-medium text-adega-platinum">
                    Função
                  </th>
                  <th className="text-left p-4 font-medium text-adega-platinum">
                    Criado em
                  </th>
                  {canManageUsers && (
                    <th className="text-left p-4 font-medium text-adega-platinum">
                      Ações
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr 
                    key={user.id} 
                    className="border-b border-white/10 hover:bg-adega-charcoal/20 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center">
                        <span className="font-medium text-adega-platinum">
                          {user.name}
                        </span>
                        {isSupremeAdmin(user.email) && (
                          <Crown className="h-4 w-4 text-adega-gold ml-2" title="Administrador Supremo" />
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-adega-platinum/80">
                      {user.email}
                    </td>
                    <td className="p-4">
                      <UserRoleBadge role={user.role} />
                    </td>
                    <td className="p-4 text-adega-platinum/80">
                      {formatDate(user.created_at)}
                    </td>
                    {canManageUsers && (
                      <td className="p-4">
                        <UserActions
                          user={user}
                          onEdit={(user) => console.log('Edit user:', user.id)}
                          onDelete={(userId) => console.log('Delete user:', userId)}
                          canEdit={canManageUsers}
                          canDelete={canManageUsers}
                        />
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};