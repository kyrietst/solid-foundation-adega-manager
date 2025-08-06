import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import React from 'react';
import { usePermissions, useSpecificPermissions, UserPermissions } from '../usePermissions';

// Mock data for different user roles
const mockAdminUser = {
  id: 'admin-user-id',
  email: 'admin@test.com',
  created_at: '2024-01-01T00:00:00Z',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  role: 'authenticated'
};

const mockEmployeeUser = {
  id: 'employee-user-id', 
  email: 'employee@test.com',
  created_at: '2024-01-01T00:00:00Z',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  role: 'authenticated'
};

const mockDeliveryUser = {
  id: 'delivery-user-id',
  email: 'delivery@test.com', 
  created_at: '2024-01-01T00:00:00Z',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  role: 'authenticated'
};

// Mock AuthContext
const mockAuthContext = {
  user: null,
  userRole: null,
  loading: false,
  signIn: vi.fn(),
  signOut: vi.fn(),
  hasPermission: vi.fn()
};

// Mock AuthContext
vi.mock('@/app/providers/AuthContext', () => ({
  useAuth: () => mockAuthContext
}));

// Test wrapper 
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  return React.createElement('div', {}, children);
};

describe('usePermissions - Testes de Roles e Permissões', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset mock context
    mockAuthContext.user = null;
    mockAuthContext.userRole = null;
    mockAuthContext.loading = false;
    mockAuthContext.hasPermission = vi.fn();
  });

  describe('Permissões para role Admin', () => {
    beforeEach(() => {
      mockAuthContext.user = mockAdminUser;
      mockAuthContext.userRole = 'admin';
      mockAuthContext.hasPermission = vi.fn((roles) => {
        if (Array.isArray(roles)) {
          return roles.includes('admin');
        }
        return roles === 'admin';
      });
    });

    it('deve permitir acesso total para administrador', () => {
      const { result } = renderHook(() => usePermissions(), {
        wrapper: TestWrapper
      });

      const permissions = result.current;

      // Permissões gerais
      expect(permissions.canViewDashboard).toBe(true);
      expect(permissions.canAccessReports).toBe(true);

      // Permissões de produtos/inventário (total)
      expect(permissions.canViewProducts).toBe(true);
      expect(permissions.canCreateProducts).toBe(true);
      expect(permissions.canEditProducts).toBe(true);
      expect(permissions.canDeleteProducts).toBe(true);
      expect(permissions.canManageInventory).toBe(true);

      // Permissões de clientes/CRM 
      expect(permissions.canViewCustomers).toBe(true);
      expect(permissions.canCreateCustomers).toBe(true);
      expect(permissions.canEditCustomers).toBe(true);
      expect(permissions.canDeleteCustomers).toBe(true);
      expect(permissions.canViewCustomerInsights).toBe(true);

      // Permissões de vendas
      expect(permissions.canViewSales).toBe(true);
      expect(permissions.canCreateSales).toBe(true);
      expect(permissions.canProcessSales).toBe(true);
      expect(permissions.canViewSalesReports).toBe(true);

      // Permissões de usuários (exclusivo de admin)
      expect(permissions.canViewUsers).toBe(true);
      expect(permissions.canCreateUsers).toBe(true);
      expect(permissions.canEditUsers).toBe(true);
      expect(permissions.canDeleteUsers).toBe(true);

      // Permissões de delivery
      expect(permissions.canViewDeliveries).toBe(true);
      expect(permissions.canManageDeliveries).toBe(true);
      expect(permissions.canViewOwnDeliveries).toBe(false); // Não é delivery

      // Permissões de movimentações
      expect(permissions.canViewMovements).toBe(true);
      expect(permissions.canCreateMovements).toBe(true);

      // Permissões administrativas (exclusivo de admin)
      expect(permissions.canAccessAdmin).toBe(true);
      expect(permissions.canViewFinancialData).toBe(true);
      expect(permissions.canManageSystem).toBe(true);
    });

    it('deve ter acesso a dados financeiros como administrador', () => {
      const { result } = renderHook(() => usePermissions(), {
        wrapper: TestWrapper
      });

      const permissions = result.current;
      
      expect(permissions.canViewFinancialData).toBe(true);
      expect(permissions.canAccessAdmin).toBe(true);
      expect(permissions.canManageSystem).toBe(true);
    });
  });

  describe('Permissões para role Employee', () => {
    beforeEach(() => {
      mockAuthContext.user = mockEmployeeUser;
      mockAuthContext.userRole = 'employee';
      mockAuthContext.hasPermission = vi.fn((roles) => {
        if (Array.isArray(roles)) {
          return roles.includes('employee');
        }
        return roles === 'employee';
      });
    });

    it('deve ter permissões limitadas para funcionário', () => {
      const { result } = renderHook(() => usePermissions(), {
        wrapper: TestWrapper
      });

      const permissions = result.current;

      // Permissões gerais (permitidas)
      expect(permissions.canViewDashboard).toBe(true);
      expect(permissions.canAccessReports).toBe(true);

      // Permissões de produtos (limitadas - sem criar/editar/deletar)
      expect(permissions.canViewProducts).toBe(true);
      expect(permissions.canCreateProducts).toBe(false); // Apenas admin
      expect(permissions.canEditProducts).toBe(false); // Apenas admin
      expect(permissions.canDeleteProducts).toBe(false); // Apenas admin
      expect(permissions.canManageInventory).toBe(true);

      // Permissões de clientes (sem deletar)
      expect(permissions.canViewCustomers).toBe(true);
      expect(permissions.canCreateCustomers).toBe(true);
      expect(permissions.canEditCustomers).toBe(true);
      expect(permissions.canDeleteCustomers).toBe(false); // Apenas admin
      expect(permissions.canViewCustomerInsights).toBe(true);

      // Permissões de vendas (todas permitidas)
      expect(permissions.canViewSales).toBe(true);
      expect(permissions.canCreateSales).toBe(true);
      expect(permissions.canProcessSales).toBe(true);
      expect(permissions.canViewSalesReports).toBe(true);

      // Permissões de usuários (negadas)
      expect(permissions.canViewUsers).toBe(false);
      expect(permissions.canCreateUsers).toBe(false);
      expect(permissions.canEditUsers).toBe(false);
      expect(permissions.canDeleteUsers).toBe(false);

      // Permissões de delivery (gerenciar apenas)
      expect(permissions.canViewDeliveries).toBe(true);
      expect(permissions.canManageDeliveries).toBe(true);
      expect(permissions.canViewOwnDeliveries).toBe(false); // Não é delivery

      // Permissões de movimentações (permitidas)
      expect(permissions.canViewMovements).toBe(true);
      expect(permissions.canCreateMovements).toBe(true);

      // Permissões administrativas (negadas)
      expect(permissions.canAccessAdmin).toBe(false);
      expect(permissions.canViewFinancialData).toBe(false);
      expect(permissions.canManageSystem).toBe(false);
    });

    it('deve negar acesso a dados financeiros para funcionário', () => {
      const { result } = renderHook(() => usePermissions(), {
        wrapper: TestWrapper
      });

      const permissions = result.current;

      expect(permissions.canViewFinancialData).toBe(false);
      expect(permissions.canAccessAdmin).toBe(false);
      expect(permissions.canManageSystem).toBe(false);
    });
  });

  describe('Permissões para role Delivery', () => {
    beforeEach(() => {
      mockAuthContext.user = mockDeliveryUser;
      mockAuthContext.userRole = 'delivery';
      mockAuthContext.hasPermission = vi.fn((roles) => {
        if (Array.isArray(roles)) {
          return roles.includes('delivery');
        }
        return roles === 'delivery';
      });
    });

    it('deve ter permissões mínimas para entregador', () => {
      const { result } = renderHook(() => usePermissions(), {
        wrapper: TestWrapper
      });

      const permissions = result.current;

      // Permissões gerais (negadas)
      expect(permissions.canViewDashboard).toBe(false);
      expect(permissions.canAccessReports).toBe(false);

      // Permissões de produtos (negadas)
      expect(permissions.canViewProducts).toBe(false);
      expect(permissions.canCreateProducts).toBe(false);
      expect(permissions.canEditProducts).toBe(false);
      expect(permissions.canDeleteProducts).toBe(false);
      expect(permissions.canManageInventory).toBe(false);

      // Permissões de clientes (negadas)
      expect(permissions.canViewCustomers).toBe(false);
      expect(permissions.canCreateCustomers).toBe(false);
      expect(permissions.canEditCustomers).toBe(false);
      expect(permissions.canDeleteCustomers).toBe(false);
      expect(permissions.canViewCustomerInsights).toBe(false);

      // Permissões de vendas (negadas)
      expect(permissions.canViewSales).toBe(false);
      expect(permissions.canCreateSales).toBe(false);
      expect(permissions.canProcessSales).toBe(false);
      expect(permissions.canViewSalesReports).toBe(false);

      // Permissões de usuários (negadas)
      expect(permissions.canViewUsers).toBe(false);
      expect(permissions.canCreateUsers).toBe(false);
      expect(permissions.canEditUsers).toBe(false);
      expect(permissions.canDeleteUsers).toBe(false);

      // Permissões de delivery (apenas visualizar)
      expect(permissions.canViewDeliveries).toBe(true); // Único acesso permitido
      expect(permissions.canManageDeliveries).toBe(false);
      expect(permissions.canViewOwnDeliveries).toBe(true); // Específico para delivery

      // Permissões de movimentações (negadas)
      expect(permissions.canViewMovements).toBe(false);
      expect(permissions.canCreateMovements).toBe(false);

      // Permissões administrativas (negadas)
      expect(permissions.canAccessAdmin).toBe(false);
      expect(permissions.canViewFinancialData).toBe(false);
      expect(permissions.canManageSystem).toBe(false);
    });

    it('deve restringir acesso apenas às suas entregas', () => {
      const { result } = renderHook(() => usePermissions(), {
        wrapper: TestWrapper
      });

      const permissions = result.current;

      // Deve ver entregas mas apenas as próprias
      expect(permissions.canViewDeliveries).toBe(true);
      expect(permissions.canViewOwnDeliveries).toBe(true);
      expect(permissions.canManageDeliveries).toBe(false);

      // Não deve ter nenhuma outra permissão relacionada a vendas/clientes
      expect(permissions.canViewSales).toBe(false);
      expect(permissions.canViewCustomers).toBe(false);
      expect(permissions.canViewProducts).toBe(false);
    });
  });

  describe('Comportamento com usuário não autenticado', () => {
    beforeEach(() => {
      mockAuthContext.user = null;
      mockAuthContext.userRole = null;
      mockAuthContext.hasPermission = vi.fn(() => false);
    });

    it('deve negar todas as permissões para usuário não autenticado', () => {
      const { result } = renderHook(() => usePermissions(), {
        wrapper: TestWrapper
      });

      const permissions = result.current;

      // Verificar que todas as permissões são false
      Object.values(permissions).forEach(permission => {
        expect(permission).toBe(false);
      });
    });
  });

  describe('Comportamento com role undefined/null', () => {
    beforeEach(() => {
      mockAuthContext.user = mockEmployeeUser; // Usuário logado
      mockAuthContext.userRole = null; // Mas sem role definido
      mockAuthContext.hasPermission = vi.fn(() => false);
    });

    it('deve negar todas as permissões para usuário com role null', () => {
      const { result } = renderHook(() => usePermissions(), {
        wrapper: TestWrapper
      });

      const permissions = result.current;

      // Mesmo com usuário logado, sem role não tem permissões
      Object.values(permissions).forEach(permission => {
        expect(permission).toBe(false);
      });
    });
  });

  describe('Tentativas de escalação de privilégios', () => {
    it('deve manter restrições mesmo com role manipulado', () => {
      // Simular tentativa de manipulação de role
      mockAuthContext.user = mockDeliveryUser;
      mockAuthContext.userRole = 'delivery';
      
      // Mock hasPermission que SEMPRE retorna false para delivery
      mockAuthContext.hasPermission = vi.fn((roles) => {
        if (Array.isArray(roles)) {
          return roles.includes('delivery');
        }
        return roles === 'delivery';
      });

      const { result } = renderHook(() => usePermissions(), {
        wrapper: TestWrapper
      });

      const permissions = result.current;

      // Verificar que permissões administrativas continuam negadas
      expect(permissions.canCreateProducts).toBe(false);
      expect(permissions.canDeleteCustomers).toBe(false);
      expect(permissions.canViewUsers).toBe(false);
      expect(permissions.canAccessAdmin).toBe(false);
      expect(permissions.canViewFinancialData).toBe(false);
      expect(permissions.canManageSystem).toBe(false);
    });

    it('deve validar hierarquia de roles corretamente', () => {
      // Admin deve ter acesso a tudo que employee tem + mais
      mockAuthContext.user = mockAdminUser;
      mockAuthContext.userRole = 'admin';  
      mockAuthContext.hasPermission = vi.fn((roles) => {
        if (Array.isArray(roles)) {
          return roles.includes('admin');
        }
        return ['admin'].includes(roles);
      });

      const { result: adminResult } = renderHook(() => usePermissions(), {
        wrapper: TestWrapper
      });

      // Employee não deve ter acesso a permissões de admin
      mockAuthContext.user = mockEmployeeUser;
      mockAuthContext.userRole = 'employee';
      mockAuthContext.hasPermission = vi.fn((roles) => {
        if (Array.isArray(roles)) {
          return roles.includes('employee');
        }
        return roles === 'employee';
      });

      const { result: employeeResult } = renderHook(() => usePermissions(), {
        wrapper: TestWrapper
      });

      // Admin deve ter mais permissões que employee
      expect(adminResult.current.canCreateProducts).toBe(true);
      expect(employeeResult.current.canCreateProducts).toBe(false);
      
      expect(adminResult.current.canAccessAdmin).toBe(true);
      expect(employeeResult.current.canAccessAdmin).toBe(false);
      
      expect(adminResult.current.canViewFinancialData).toBe(true);
      expect(employeeResult.current.canViewFinancialData).toBe(false);
    });
  });
});

describe('useSpecificPermissions - Testes de Permissões Específicas', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset mock context  
    mockAuthContext.user = mockAdminUser;
    mockAuthContext.userRole = 'admin';
    mockAuthContext.hasPermission = vi.fn((roles) => {
      if (Array.isArray(roles)) {
        return roles.includes('admin');
      }
      return roles === 'admin';
    });
  });

  it('deve retornar apenas permissões solicitadas', () => {
    const specificPermissions = ['canViewProducts', 'canCreateSales', 'canAccessAdmin'] as const;
    
    const { result } = renderHook(() => 
      useSpecificPermissions(specificPermissions), {
        wrapper: TestWrapper
      }
    );

    const permissions = result.current;

    // Deve conter apenas as permissões solicitadas
    expect(Object.keys(permissions)).toHaveLength(3);
    expect(permissions.canViewProducts).toBe(true);
    expect(permissions.canCreateSales).toBe(true);  
    expect(permissions.canAccessAdmin).toBe(true);

    // TypeScript deve garantir que apenas essas propriedades existem
    expect('canViewCustomers' in permissions).toBe(false);
  });

  it('deve otimizar performance com memoização', () => {
    const specificPermissions = ['canViewDashboard', 'canViewSales'] as const;
    
    const { result: result1 } = renderHook(() => 
      useSpecificPermissions(specificPermissions), {
        wrapper: TestWrapper
      }
    );

    const { result: result2 } = renderHook(() => 
      useSpecificPermissions(specificPermissions), {
        wrapper: TestWrapper  
      }
    );

    // Deve retornar os mesmos valores
    expect(result1.current.canViewDashboard).toBe(result2.current.canViewDashboard);
    expect(result1.current.canViewSales).toBe(result2.current.canViewSales);
  });

  it('deve funcionar com diferentes roles', () => {
    // Teste com employee
    mockAuthContext.user = mockEmployeeUser;
    mockAuthContext.userRole = 'employee';
    mockAuthContext.hasPermission = vi.fn((roles) => {
      if (Array.isArray(roles)) {
        return roles.includes('employee');
      }
      return roles === 'employee';
    });

    const specificPermissions = ['canCreateProducts', 'canCreateSales'] as const;
    
    const { result } = renderHook(() => 
      useSpecificPermissions(specificPermissions), {
        wrapper: TestWrapper
      }
    );

    const permissions = result.current;

    // Employee pode criar vendas mas não produtos
    expect(permissions.canCreateProducts).toBe(false);
    expect(permissions.canCreateSales).toBe(true);
  });
});