/**
 * Hook centralizado para gerenciamento de permissões
 * Elimina prop drilling de permissões ao fornecer acesso direto nos componentes
 */

import { useMemo } from 'react';
import { useAuth } from '@/app/providers/AuthContext';

export interface UserPermissions {
  // Permissões gerais
  canViewDashboard: boolean;
  canAccessReports: boolean;
  
  // Permissões de produtos/inventário
  canViewProducts: boolean;
  canCreateProducts: boolean;
  canEditProducts: boolean;
  canDeleteProducts: boolean;
  canManageInventory: boolean;
  
  // Permissões de clientes/CRM
  canViewCustomers: boolean;
  canCreateCustomers: boolean;
  canEditCustomers: boolean;
  canDeleteCustomers: boolean;
  canViewCustomerInsights: boolean;
  
  // Permissões de vendas
  canViewSales: boolean;
  canCreateSales: boolean;
  canProcessSales: boolean;
  canViewSalesReports: boolean;
  
  // Permissões de usuários
  canViewUsers: boolean;
  canCreateUsers: boolean;
  canEditUsers: boolean;
  canDeleteUsers: boolean;
  
  // Permissões de delivery
  canViewDeliveries: boolean;
  canManageDeliveries: boolean;
  canViewOwnDeliveries: boolean;
  
  // Permissões de movimentações
  canViewMovements: boolean;
  canCreateMovements: boolean;
  
  // Permissões administrativas
  canAccessAdmin: boolean;
  canViewFinancialData: boolean;
  canManageSystem: boolean;
  
  // Permissões específicas de dados sensíveis
  canViewCostPrices: boolean;
  canViewProfitMargins: boolean;
  canAccessFullReports: boolean;
  canManageRoles: boolean;
}

export const usePermissions = (): UserPermissions => {
  const { userRole, hasPermission } = useAuth();

  return useMemo(() => {
    const isAdmin = userRole === 'admin';
    const isEmployee = userRole === 'employee';
    const isDelivery = userRole === 'delivery';

    return {
      // Permissões gerais
      canViewDashboard: hasPermission(['admin', 'employee']),
      canAccessReports: hasPermission(['admin', 'employee']),
      
      // Permissões de produtos/inventário
      canViewProducts: hasPermission(['admin', 'employee']),
      canCreateProducts: hasPermission(['admin', 'employee']), // Funcionários podem criar produtos
      canEditProducts: hasPermission(['admin', 'employee']), // Funcionários podem editar produtos  
      canDeleteProducts: isAdmin, // Apenas admin pode deletar
      canManageInventory: hasPermission(['admin', 'employee']),
      
      // Permissões de clientes/CRM
      canViewCustomers: hasPermission(['admin', 'employee']),
      canCreateCustomers: hasPermission(['admin', 'employee']),
      canEditCustomers: hasPermission(['admin', 'employee']),
      canDeleteCustomers: isAdmin,
      canViewCustomerInsights: hasPermission(['admin', 'employee']),
      
      // Permissões de vendas
      canViewSales: hasPermission(['admin', 'employee']),
      canCreateSales: hasPermission(['admin', 'employee']),
      canProcessSales: hasPermission(['admin', 'employee']),
      canViewSalesReports: hasPermission(['admin', 'employee']),
      
      // Permissões de usuários
      canViewUsers: isAdmin,
      canCreateUsers: isAdmin,
      canEditUsers: isAdmin,
      canDeleteUsers: isAdmin,
      
      // Permissões de delivery
      canViewDeliveries: hasPermission(['admin', 'employee', 'delivery']),
      canManageDeliveries: hasPermission(['admin', 'employee']),
      canViewOwnDeliveries: isDelivery,
      
      // Permissões de movimentações
      canViewMovements: hasPermission(['admin', 'employee']),
      canCreateMovements: hasPermission(['admin', 'employee']),
      
      // Permissões administrativas
      canAccessAdmin: isAdmin,
      canViewFinancialData: isAdmin,
      canManageSystem: isAdmin,
      
      // Permissões específicas de dados sensíveis
      canViewCostPrices: isAdmin, // Apenas admin vê preços de custo
      canViewProfitMargins: isAdmin, // Apenas admin vê margens de lucro
      canAccessFullReports: isAdmin, // Apenas admin acessa relatórios completos
      canManageRoles: isAdmin, // Apenas admin gerencia roles
    };
  }, [userRole, hasPermission]);
};

// Hook específico para componentes que precisam apenas de algumas permissões
export const useSpecificPermissions = <T extends keyof UserPermissions>(
  permissions: T[]
): Pick<UserPermissions, T> => {
  const allPermissions = usePermissions();
  
  return useMemo(() => {
    const specificPermissions = {} as Pick<UserPermissions, T>;
    permissions.forEach(permission => {
      specificPermissions[permission] = allPermissions[permission];
    });
    return specificPermissions;
  }, [allPermissions, permissions]);
};