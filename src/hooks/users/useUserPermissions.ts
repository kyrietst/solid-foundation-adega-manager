/**
 * Hook para controle de permissões de usuário
 * Extraído do UserManagement.tsx para separar responsabilidades
 */

import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UserPermissionsState, UserRole } from '@/components/users/types';

export const useUserPermissions = (): UserPermissionsState => {
  const { userRole, hasPermission } = useAuth();

  const permissions = useMemo(() => {
    const isAdmin = userRole === 'admin';
    const hasAdminAccess = hasPermission('admin');

    return {
      canCreateUsers: isAdmin,
      canEditUsers: isAdmin,
      canDeleteUsers: isAdmin,
      canViewUsers: hasAdminAccess, // Admin can always view users
      hasAdminAccess,
    };
  }, [userRole, hasPermission]);

  return permissions;
};

// Utility functions for role management
export const useRoleUtilities = () => {
  const getRoleDisplay = (role: UserRole): string => {
    const roleMap = {
      admin: 'Administrador',
      employee: 'Funcionário',
      delivery: 'Entregador'
    };
    return roleMap[role] || role;
  };

  const getRoleColor = (role: UserRole): string => {
    switch (role) {
      case 'admin': 
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'employee': 
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'delivery': 
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: 
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getRoleDescription = (role: UserRole): string => {
    switch (role) {
      case 'admin':
        return 'Acesso total ao sistema';
      case 'employee':
        return 'Vendas, estoque, clientes, relatórios (sem dados de faturamento sensíveis)';
      case 'delivery':
        return 'Apenas delivery e suas entregas';
      default:
        return 'Função não definida';
    }
  };

  const isSupremeAdmin = (email: string): boolean => {
    return email === 'adm@adm.com';
  };

  return {
    getRoleDisplay,
    getRoleColor,
    getRoleDescription,
    isSupremeAdmin,
  };
};