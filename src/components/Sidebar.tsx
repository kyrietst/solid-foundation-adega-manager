import React from 'react';
import { NotificationBell } from '@/components/NotificationBell';
import { 
  BarChart3, 
  ShoppingCart, 
  Package, 
  RefreshCcw,
  Users, 
  Truck, 
  Wine,
  Settings,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'react-router-dom';

export const Sidebar = () => {
  const { user, userRole, signOut } = useAuth();
  const location = useLocation();
  
  const hasPermission = (roles: string | string[]) => {
    if (!userRole) return false;
    if (typeof roles === 'string') {
      return roles === userRole;
    }
    return roles.includes(userRole);
  };
  const menuItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: BarChart3, 
      roles: ['admin', 'employee'],
      description: 'Visão geral do sistema'
    },
    { 
      id: 'sales', 
      label: 'Vendas', 
      icon: ShoppingCart, 
      roles: ['admin', 'employee'],
      description: 'Gerenciar vendas e pedidos'
    },
    { 
      id: 'inventory', 
      label: 'Estoque', 
      icon: Package, 
      roles: ['admin', 'employee'],
      description: 'Controle de produtos e estoque'
    },
    { 
      id: 'movements', 
      label: 'Movimentações', 
      icon: RefreshCcw, 
      roles: ['admin'],
      description: 'Histórico de movimentações de estoque'
    },
    { 
      id: 'customers', 
      label: 'Clientes', 
      icon: Users, 
      roles: ['admin', 'employee'],
      description: 'Gerenciar cadastro de clientes'
    },
    { 
      id: 'delivery', 
      label: 'Delivery', 
      icon: Truck, 
      roles: ['admin', 'employee', 'delivery'],
      description: 'Controle de entregas'
    },
    { 
      id: 'users', 
      label: 'Usuários', 
      icon: Settings, 
      roles: ['admin'],
      description: 'Gerenciar usuários do sistema'
    },
  ];

  // Filtra os itens do menu baseado no papel do usuário
  const allowedMenuItems = menuItems.filter(item => {
    // Se não há usuário ou role, não mostra nenhum item
    if (!user || !userRole) {
      console.log('No user or role found, hiding all items');
      return false;
    }
    
    // Admin principal tem acesso a tudo
    if (user.email === 'adm@adega.com') {
      return true;
    }

    // Se for entregador, só mostra a aba delivery
    if (userRole === 'delivery') {
      return item.id === 'delivery';
    }

    // Para outros usuários, verifica se o role está incluído nos roles permitidos do item
    return item.roles.includes(userRole);
  });

  const getRoleDisplay = (role: string) => {
    const roleMap = {
      admin: 'Administrador',
      employee: 'Funcionário',
      delivery: 'Entregador'
    };
    return roleMap[role as keyof typeof roleMap] || role;
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-20 flex h-full w-64 flex-col bg-white shadow-lg">
      {/* Header */}
      <div className="flex h-[60px] items-center px-4">
        <div className="p-4 font-bold text-xl flex items-center gap-2 justify-between">
          <div className="flex items-center gap-2">
            <Wine className="h-6 w-6 text-purple-600" />
            <div>
              <h2 className="text-base font-semibold text-gray-900">Adega</h2>
              <p className="text-xs text-gray-500">Fundação Sólida</p>
            </div>
          </div>
          <NotificationBell />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-2 py-2">
        {allowedMenuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.id}
              to={`/${item.id}`}
              className={cn(
                'flex items-center w-full gap-2 rounded-md px-2 py-2 text-sm transition-colors',
                location.pathname === `/${item.id}` 
                  ? 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800',
                !hasPermission(item.roles) && 'opacity-50 cursor-not-allowed',
              )}
              aria-disabled={!hasPermission(item.roles)}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-100 bg-white p-4">
        <div className="mb-2">
          <p className="text-sm font-medium text-gray-900">
            {user?.email === 'adm@adega.com' ? 'Administrador' : user?.email?.split('@')[0]}
          </p>
          <p className="text-xs text-gray-600">
            {user?.email === 'adm@adega.com' 
              ? 'Administrador Principal' 
              : userRole && getRoleDisplay(userRole)}
          </p>
          <p className="text-xs text-gray-500 truncate">{user?.email}</p>
        </div>
        <Button 
          onClick={async () => {
            console.log('Logout button clicked');
            try {
              await signOut();
            } catch (error) {
              console.error('Error during signOut:', error);
            }
          }}
          variant="outline" 
          className="w-full justify-start border-gray-200 text-gray-600 hover:text-gray-900"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sair</span>
        </Button>
      </div>
    </aside>
  );
}; 