
import React from 'react';
import { 
  BarChart3, 
  ShoppingCart, 
  Package, 
  Users, 
  Truck, 
  FileText,
  Wine,
  Settings,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar = ({ activeTab, setActiveTab }: SidebarProps) => {
  const { profile, userRole, signOut, hasPermission } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, roles: ['admin', 'funcionario', 'entregador'] },
    { id: 'sales', label: 'Vendas', icon: ShoppingCart, roles: ['admin', 'funcionario'] },
    { id: 'inventory', label: 'Estoque', icon: Package, roles: ['admin', 'funcionario'] },
    { id: 'customers', label: 'Clientes', icon: Users, roles: ['admin', 'funcionario'] },
    { id: 'delivery', label: 'Delivery', icon: Truck, roles: ['admin', 'funcionario', 'entregador'] },
    { id: 'reports', label: 'Relatórios', icon: FileText, roles: ['admin', 'funcionario'] },
    { id: 'users', label: 'Usuários', icon: Settings, roles: ['admin'] },
  ];

  const allowedMenuItems = menuItems.filter(item => 
    userRole && item.roles.includes(userRole)
  );

  const getRoleDisplay = (role: string) => {
    const roleMap = {
      admin: 'Administrador',
      funcionario: 'Funcionário',
      entregador: 'Entregador'
    };
    return roleMap[role as keyof typeof roleMap] || role;
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="w-64 bg-white shadow-lg flex flex-col">
      <div className="p-6 border-b">
        <div className="flex items-center space-x-3">
          <Wine className="h-8 w-8 text-purple-600" />
          <div>
            <h2 className="font-bold text-gray-900">Adega</h2>
            <p className="text-sm text-gray-600">Fundação Sólida</p>
          </div>
        </div>
      </div>
      
      <nav className="p-4 flex-1">
        <ul className="space-y-2">
          {allowedMenuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    "w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-colors",
                    activeTab === item.id
                      ? "bg-purple-100 text-purple-700 font-medium"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User info and logout */}
      <div className="p-4 border-t">
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-900">{profile?.name}</p>
          <p className="text-xs text-gray-600">{userRole && getRoleDisplay(userRole)}</p>
          <p className="text-xs text-gray-500">{profile?.email}</p>
        </div>
        <Button 
          onClick={handleSignOut}
          variant="outline" 
          className="w-full"
          size="sm"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sair
        </Button>
      </div>
    </div>
  );
};
