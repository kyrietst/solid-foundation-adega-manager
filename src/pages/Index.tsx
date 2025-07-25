import React, { useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { Dashboard } from '@/components/Dashboard';
import { Sales } from '@/components/Sales';
import { Inventory } from '@/components/Inventory';
import { Customers } from '@/components/Customers';
import { Delivery } from '@/components/Delivery';
import { Movements } from '@/components/Movements';
import { UserManagement } from '@/components/UserManagement';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, userRole, loading, hasPermission } = useAuth();

  // Extrai o nome da aba da URL (ex: /sales -> 'sales')
  const activeTab = location.pathname.split('/')[1] || 'dashboard';

  // Redireciona entregadores para a aba delivery
  useEffect(() => {
    if (userRole === 'delivery' && activeTab !== 'delivery') {
      console.log('Delivery user detected, redirecting to delivery tab');
      navigate('/delivery', { replace: true });
    }
  }, [userRole, activeTab, navigate]);

  // Mostra loading enquanto carrega as permissões
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // Se não tem usuário ou role, não renderiza nada
  if (!user || !userRole) {
    console.log('No user or role found, redirecting to auth');
    return null;
  }

  const renderContent = () => {
    console.log('Rendering content for role:', userRole, 'tab:', activeTab);

    // Se for entregador, só pode ver a aba delivery
    if (userRole === 'delivery') {
      if (activeTab !== 'delivery') {
        console.log('Delivery user trying to access non-delivery tab');
        return <div className="p-4 text-red-600">Acesso negado. Você só tem permissão para acessar a área de Delivery.</div>;
      }
      return <Delivery />;
    }

    switch (activeTab) {
      case 'dashboard':
        return hasPermission(['admin', 'employee']) ? <Dashboard /> : <div className="p-4 text-red-600">Acesso negado</div>;
      case 'sales':
        return hasPermission(['admin', 'employee']) ? <Sales /> : <div className="p-4 text-red-600">Acesso negado</div>;
      case 'inventory':
        return hasPermission(['admin', 'employee']) ? <Inventory /> : <div className="p-4 text-red-600">Acesso negado</div>;
      case 'customers':
        return hasPermission(['admin', 'employee']) ? <Customers /> : <div className="p-4 text-red-600">Acesso negado</div>;
      case 'delivery':
        return hasPermission(['admin', 'employee', 'delivery']) ? <Delivery /> : <div className="p-4 text-red-600">Acesso negado</div>;
      case 'movements':
        return hasPermission(['admin']) ? <Movements /> : <div className="p-4 text-red-600">Acesso negado</div>;
      case 'users':
        return hasPermission('admin') ? <UserManagement /> : <div className="p-4 text-red-600">Acesso negado</div>;
      default:
        return hasPermission(['admin', 'employee']) ? <Dashboard /> : <div className="p-4 text-red-600">Acesso negado</div>;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 pl-64 overflow-x-hidden overflow-y-auto">
        <div className="container mx-auto px-6 py-8">
          {renderContent()}
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Index;
