import { useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { Dashboard } from '@/components/Dashboard';
import { Sales } from '@/components/Sales';
import { Inventory } from '@/components/Inventory';
import { Customers } from '@/components/Customers';
import { Delivery } from '@/components/Delivery';
import { Movements } from '@/components/Movements';
import { UserManagement } from '@/components/UserManagement';
import { AppSidebar } from '@/components/Sidebar';
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
      navigate('/delivery', { replace: true });
    }
  }, [userRole, activeTab, navigate]);

  // Mostra loading enquanto carrega as permissões
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-yellow-500/30 border-t-yellow-400"></div>
          <div className="text-yellow-400 font-medium text-lg">Carregando...</div>
        </div>
      </div>
    );
  }

  // Se não tem usuário ou role, não renderiza nada
  if (!user || !userRole) {
    return null;
  }

  const renderContent = () => {
    // Se for entregador, só pode ver a aba delivery
    if (userRole === 'delivery') {
      if (activeTab !== 'delivery') {
        return <div className="p-4 text-red-400 bg-red-900/20 rounded-lg border border-red-500/30">Acesso negado. Você só tem permissão para acessar a área de Delivery.</div>;
      }
      return <Delivery />;
    }

    switch (activeTab) {
      case 'dashboard':
        return hasPermission(['admin', 'employee']) ? <Dashboard /> : <div className="p-4 text-red-400 bg-red-900/20 rounded-lg border border-red-500/30">Acesso negado</div>;
      case 'sales':
        return hasPermission(['admin', 'employee']) ? <Sales /> : <div className="p-4 text-red-400 bg-red-900/20 rounded-lg border border-red-500/30">Acesso negado</div>;
      case 'inventory':
        return hasPermission(['admin', 'employee']) ? <Inventory /> : <div className="p-4 text-red-400 bg-red-900/20 rounded-lg border border-red-500/30">Acesso negado</div>;
      case 'customers':
        return hasPermission(['admin', 'employee']) ? <Customers /> : <div className="p-4 text-red-400 bg-red-900/20 rounded-lg border border-red-500/30">Acesso negado</div>;
      case 'delivery':
        return hasPermission(['admin', 'employee', 'delivery']) ? <Delivery /> : <div className="p-4 text-red-400 bg-red-900/20 rounded-lg border border-red-500/30">Acesso negado</div>;
      case 'movements':
        return hasPermission(['admin']) ? <Movements /> : <div className="p-4 text-red-400 bg-red-900/20 rounded-lg border border-red-500/30">Acesso negado</div>;
      case 'users':
        return hasPermission('admin') ? <UserManagement /> : <div className="p-4 text-red-400 bg-red-900/20 rounded-lg border border-red-500/30">Acesso negado</div>;
      default:
        return hasPermission(['admin', 'employee']) ? <Dashboard /> : <div className="p-4 text-red-400 bg-red-900/20 rounded-lg border border-red-500/30">Acesso negado</div>;
    }
  };

  return (
    <div className="w-full h-screen flex flex-row relative">
        {/* Sidebar */}
        <AppSidebar />
        
        {/* Main content area */}  
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto">
            <div className="p-4 lg:p-8 h-full">
              <div className="max-w-7xl mx-auto h-full">
                {renderContent()}
                <Outlet />
              </div>
            </div>
          </main>
        </div>
      </div>
  );
};

export default Index;