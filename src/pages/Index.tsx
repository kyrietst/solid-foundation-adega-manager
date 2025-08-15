import { useEffect, lazy, Suspense } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { AppSidebar } from '@/app/layout/Sidebar';
import { useAuth } from '@/app/providers/AuthContext';
import { LoadingScreen } from '@/shared/ui/composite/loading-spinner';
import SalesPage from '@/features/sales/components/SalesPage';
import { WhitePageShell } from '@/shared/ui/layout/WhitePageShell';

// Lazy loading dos componentes principais para code splitting
const Dashboard = lazy(() => import('@/features/dashboard/components/Dashboard'));
const Inventory = lazy(() => import('@/features/inventory/components/InventoryManagement'));
const Customers = lazy(() => import('@/features/customers/components/CustomersLite'));
const CrmDashboard = lazy(() => 
  import('@/features/customers/components/CrmDashboard').then(m => ({ default: m.CrmDashboard }))
);
const AutomationCenter = lazy(() => 
  import('@/features/customers/components/AutomationCenter').then(m => ({ default: m.AutomationCenter }))
);
const CustomerProfile = lazy(() => 
  import('@/features/customers/components/CustomerProfile').then(m => ({ default: m.CustomerProfile }))
);
const Delivery = lazy(() => import('@/features/delivery/components/Delivery'));
const Movements = lazy(() => import('@/features/movements/components/Movements'));
const UserManagement = lazy(() => import('@/features/users/components/UserManagement'));
// História 1.5: Página de Relatórios (old)
const Reports = lazy(() =>
  import('@/features/reports/components/Reports').then((m) => ({ default: m.Reports }))
);
// Sprint 2: Advanced Reports System
const AdvancedReports = lazy(() =>
  import('@/features/reports/components/AdvancedReports').then((m) => ({ default: m.AdvancedReports }))
);
const ActivitiesPage = lazy(() => import('@/shared/components/ActivityLogsPage'));

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
    const AccessDenied = () => (
      <div className="p-4 text-red-400 bg-red-900/20 rounded-lg border border-red-500/30">
        Acesso negado
      </div>
    );

    // Se for entregador, só pode ver a aba delivery
    if (userRole === 'delivery') {
      if (activeTab !== 'delivery') {
        return (
          <div className="p-4 text-red-400 bg-red-900/20 rounded-lg border border-red-500/30">
            Acesso negado. Você só tem permissão para acessar a área de Delivery.
          </div>
        );
      }
      return (
        <Suspense fallback={<LoadingScreen text="Carregando delivery..." />}>
          <Delivery />
        </Suspense>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return hasPermission(['admin', 'employee']) ? (
          <Suspense fallback={<LoadingScreen text="Carregando dashboard..." />}>
            <Dashboard />
          </Suspense>
        ) : <AccessDenied />;
      case 'sales':
        return hasPermission(['admin', 'employee']) ? (
          <SalesPage />
        ) : <AccessDenied />;
      case 'inventory':
        return hasPermission(['admin', 'employee']) ? (
          <Suspense fallback={<LoadingScreen text="Carregando inventário..." />}>
            <Inventory 
              showAddButton={hasPermission('admin')} 
              showSearch={true} 
              showFilters={true} 
            />
          </Suspense>
        ) : <AccessDenied />;
      case 'customers':
        return hasPermission(['admin', 'employee']) ? (
          <Suspense fallback={<LoadingScreen text="Carregando clientes..." />}>
            <Customers />
          </Suspense>
        ) : <AccessDenied />;
      case 'crm':
        return hasPermission(['admin', 'employee']) ? (
          <Suspense fallback={<LoadingScreen text="Carregando CRM Dashboard..." />}>
            <CrmDashboard />
          </Suspense>
        ) : <AccessDenied />;
      case 'delivery':
        return hasPermission(['admin', 'employee', 'delivery']) ? (
          <Suspense fallback={<LoadingScreen text="Carregando delivery..." />}>
            <WhitePageShell>
              <Delivery />
            </WhitePageShell>
          </Suspense>
        ) : <AccessDenied />;
      case 'movements':
        return hasPermission(['admin']) ? (
          <Suspense fallback={<LoadingScreen text="Carregando movimentações..." />}>
            <Movements />
          </Suspense>
        ) : <AccessDenied />;
      case 'users':
        return hasPermission('admin') ? (
          <Suspense fallback={<LoadingScreen text="Carregando usuários..." />}>
            <WhitePageShell>
              <UserManagement />
            </WhitePageShell>
          </Suspense>
        ) : <AccessDenied />;
      case 'automations':
        return hasPermission(['admin']) ? (
          <Suspense fallback={<LoadingScreen text="Carregando automações..." />}>
            <WhitePageShell>
              <AutomationCenter />
            </WhitePageShell>
          </Suspense>
        ) : <AccessDenied />;
      case 'customer':
        // Handle /customer/:id route
        return hasPermission(['admin', 'employee']) ? (
          <Suspense fallback={<LoadingScreen text="Carregando perfil do cliente..." />}>
            <WhitePageShell>
              <CustomerProfile />
            </WhitePageShell>
          </Suspense>
        ) : <AccessDenied />;
      case 'reports':
        return hasPermission(['admin', 'employee']) ? (
          <Suspense fallback={<LoadingScreen text="Carregando relatórios..." />}>
            <WhitePageShell>
              <AdvancedReports />
            </WhitePageShell>
          </Suspense>
        ) : <AccessDenied />;
      case 'activities':
        return hasPermission(['admin']) ? (
          <Suspense fallback={<LoadingScreen text="Carregando atividades..." />}>
            <WhitePageShell>
              <ActivitiesPage />
            </WhitePageShell>
          </Suspense>
        ) : <AccessDenied />;
      default:
        return hasPermission(['admin', 'employee']) ? (
          <Suspense fallback={<LoadingScreen text="Carregando dashboard..." />}>
            <Dashboard />
          </Suspense>
        ) : <AccessDenied />;
    }
  };

  return (
    <div className="w-full h-screen flex flex-row relative">
      {/* Sidebar */}
      <AppSidebar />
      
      {/* Main content area */}  
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          <div className={activeTab === 'customers' ? 'p-2 lg:p-4 h-full' : 'p-4 lg:p-8 h-full'}>
            <div className={activeTab === 'dashboard' || activeTab === 'sales' || activeTab === 'inventory' || activeTab === 'customers' ? 'max-w-[1500px] 2xl:max-w-[1800px] mx-auto h-full' : 'max-w-7xl mx-auto h-full'}>
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