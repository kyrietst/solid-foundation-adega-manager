/**
 * Componente badge de role de usuário
 * Extraído do UserManagement.tsx para reutilização
 */

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { UserRoleBadgeProps } from './types';
import { useRoleUtilities } from '@/hooks/users/useUserPermissions';

export const UserRoleBadge: React.FC<UserRoleBadgeProps> = ({
  role,
  className = '',
}) => {
  const { getRoleDisplay, getRoleColor } = useRoleUtilities();

  return (
    <Badge 
      className={`${getRoleColor(role)} ${className}`}
      variant="outline"
    >
      {getRoleDisplay(role)}
    </Badge>
  );
};