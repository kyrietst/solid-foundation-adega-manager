
import React, { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Dashboard } from '@/components/Dashboard';
import { Sales } from '@/components/Sales';
import { Inventory } from '@/components/Inventory';
import { Customers } from '@/components/Customers';
import { Delivery } from '@/components/Delivery';
import { Reports } from '@/components/Reports';
import { UserManagement } from '@/components/UserManagement';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { hasPermission } = useAuth();

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'sales':
        return hasPermission(['admin', 'funcionario']) ? <Sales /> : <div>Acesso negado</div>;
      case 'inventory':
        return hasPermission(['admin', 'funcionario']) ? <Inventory /> : <div>Acesso negado</div>;
      case 'customers':
        return hasPermission(['admin', 'funcionario']) ? <Customers /> : <div>Acesso negado</div>;
      case 'delivery':
        return <Delivery />;
      case 'reports':
        return hasPermission(['admin', 'funcionario']) ? <Reports /> : <div>Acesso negado</div>;
      case 'users':
        return hasPermission('admin') ? <UserManagement /> : <div>Acesso negado</div>;
      default:
        return <Dashboard />;
    }
  };

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="flex-1 p-6">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Adega Fundação Sólida</h1>
            <p className="text-gray-600 mt-2">Sistema de Gestão Completo</p>
          </header>
          {renderContent()}
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default Index;
