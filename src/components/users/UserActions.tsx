/**
 * Componente de ações para usuários
 * Extraído do UserManagement.tsx para reutilização
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserActionsProps } from './types';
import { useRoleUtilities } from '@/hooks/users/useUserPermissions';

export const UserActions: React.FC<UserActionsProps> = ({
  user,
  onEdit,
  onDelete,
  canEdit = false,
  canDelete = false,
}) => {
  const { isSupremeAdmin } = useRoleUtilities();
  const isSupreme = isSupremeAdmin(user.email);

  // Supreme admin cannot be deleted or edited (to prevent system lockout)
  const actualCanEdit = canEdit && !isSupreme;
  const actualCanDelete = canDelete && !isSupreme;

  if (!actualCanEdit && !actualCanDelete) {
    return null;
  }

  const handleEdit = () => {
    if (onEdit) {
      onEdit(user);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      // Confirm deletion
      if (confirm(`Tem certeza que deseja remover o usuário ${user.name}?`)) {
        onDelete(user.id);
      }
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Abrir menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-adega-charcoal border-white/10">
        {actualCanEdit && (
          <DropdownMenuItem 
            onClick={handleEdit}
            className="cursor-pointer hover:bg-white/10"
          >
            <Edit className="mr-2 h-4 w-4" />
            Editar usuário
          </DropdownMenuItem>
        )}
        {actualCanDelete && (
          <DropdownMenuItem 
            onClick={handleDelete}
            className="cursor-pointer hover:bg-red-500/10 text-red-400"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Remover usuário
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};