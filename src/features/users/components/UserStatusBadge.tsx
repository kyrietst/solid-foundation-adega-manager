/**
 * Componente badge de status de usuário
 * Extraído do UserManagement.tsx para reutilização
 */

import React from 'react';
import { Badge } from '@/shared/ui/primitives/badge';
import { UserStatusBadgeProps } from './types';

export const UserStatusBadge: React.FC<UserStatusBadgeProps> = ({
  status,
  className = '',
}) => {
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'inactive':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusDisplay = (status: string): string => {
    switch (status) {
      case 'active':
        return 'Ativo';
      case 'inactive':
        return 'Inativo';
      case 'pending':
        return 'Pendente';
      default:
        return status;
    }
  };

  return (
    <Badge 
      className={`${getStatusColor(status)} ${className}`}
      variant="outline"
    >
      {getStatusDisplay(status)}
    </Badge>
  );
};