import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { Button } from '@/shared/ui/primitives/button';
import { LoadingScreen } from '@/shared/ui/composite/loading-spinner';
import { useCustomers } from '@/features/customers/hooks/use-crm';
import { SearchBar21st } from '@/shared/ui/thirdparty/search-bar-21st';
import { getGlassCardClasses, getGlassButtonClasses, getHoverTransformClasses, getSFProTextClasses } from '@/core/config/theme-utils';
import { cn } from '@/core/config/utils';
import { BlurIn } from '@/components/ui/blur-in';
import { StatCard } from '@/shared/ui/composite/stat-card';
import { Users, TrendingUp, UserPlus, Download, BarChart3 } from 'lucide-react';
import CustomerDataTable from './CustomerDataTable';
import { NewCustomerModal } from './NewCustomerModal';
import DataQualityDashboard from './DataQualityDashboard';
import { useDataQualityMetrics } from '../hooks/useDataQuality';

const CustomersLite = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [isNewCustomerModalOpen, setIsNewCustomerModalOpen] = useState(false);
  const [showQualityDashboard, setShowQualityDashboard] = useState(false);
  
  // Usar hook básico de customers
  const { data: customers, isLoading, error } = useCustomers({ search });

  // Converter customers para formato compatível com sistema de qualidade
  const customersData = React.useMemo(() => {
    if (!customers) return [];
    return customers.map(customer => ({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      birthday: customer.birthday,
      first_purchase_date: customer.first_purchase_date,
      last_purchase_date: customer.last_purchase_date,
      purchase_frequency: customer.purchase_frequency,
      favorite_category: customer.favorite_category,
      favorite_product: customer.favorite_product,
      notes: customer.notes,
      contact_permission: customer.contact_permission,
      created_at: customer.created_at
    }));
  }, [customers]);

  // Métricas de qualidade
  const qualityMetrics = useDataQualityMetrics(customersData);

  // Removemos a tabela antiga e manteremos apenas a nova tabela 21st.dev

  const activeCount = useMemo(() => {
    if (!customers) return 0;
    return customers.filter((c) => c.segment !== 'Inativo').length;
  }, [customers]);

  // Calcular novos clientes nos últimos 30 dias usando dados reais
  const newClientsCount = useMemo(() => {
    if (!customers) return 0;
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    return customers.filter(customer => {
      if (!customer.created_at) return false;
      const createdDate = new Date(customer.created_at);
      return createdDate >= thirtyDaysAgo;
    }).length;
  }, [customers]);

  // Função para navegar para relatórios CRM - Total de Clientes
  const handleNavigateToCustomerReports = () => {
    // Navegar para a página de relatórios na aba CRM
    navigate('/reports?tab=crm#total-clientes-kpi');
    
    // Após um pequeno delay, fazer scroll para o elemento específico
    setTimeout(() => {
      const element = document.getElementById('total-clientes-kpi');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Adicionar um destaque temporário no elemento
        element.style.animation = 'pulse 2s ease-in-out';
      }
    }, 300);
  };

  // Função para navegar para relatórios CRM - Clientes Ativos
  const handleNavigateToActiveCustomersReports = () => {
    // Navegar para a página de relatórios na aba CRM
    navigate('/reports?tab=crm#clientes-ativos-kpi');
    
    // Após um pequeno delay, fazer scroll para o elemento específico
    setTimeout(() => {
      const element = document.getElementById('clientes-ativos-kpi');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Adicionar um destaque temporário no elemento
        element.style.animation = 'pulse 2s ease-in-out';
      }
    }, 300);
  };

  // Função para navegar para relatórios CRM - Novos Clientes (Últimos 30 dias)
  const handleNavigateToNewCustomersReports = () => {
    // Navegar para a página de relatórios na aba CRM
    navigate('/reports?tab=crm#novos-clientes-kpi');
    
    // Após um pequeno delay, fazer scroll para o elemento específico
    setTimeout(() => {
      const element = document.getElementById('novos-clientes-kpi');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Adicionar um destaque temporário no elemento
        element.style.animation = 'pulse 2s ease-in-out';
      }
    }, 300);
  };

  if (isLoading) {
    return <LoadingScreen text="Carregando clientes..." />;
  }

  if (error) {
    return (
      <div className="p-8">
        <Card className="bg-red-900/20 border-red-500/30">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-red-400 mb-2">
              Erro ao carregar clientes
            </h2>
            <p className="text-red-300">
              {error.message || 'Ocorreu um erro inesperado'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col p-4 overflow-x-hidden min-w-0">
      {/* Header */}
      <div className="flex-shrink-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        {/* Header sem container */}
        <div className="relative text-center sm:text-left">
          {/* Título animado */}
          <BlurIn
            word="GESTÃO DE CLIENTES"
            duration={1.2}
            variant={{
              hidden: { filter: "blur(15px)", opacity: 0 },
              visible: { filter: "blur(0px)", opacity: 1 }
            }}
            className={cn(
              getSFProTextClasses('h1', 'accent'),
              "text-transparent bg-clip-text bg-gradient-to-r from-[#FF2400] via-[#FFDA04] to-[#FF2400] drop-shadow-lg"
            )}
            style={{
              textShadow: '0 2px 4px rgba(0,0,0,0.3), 0 0 20px rgba(255, 218, 4, 0.2)'
            }}
          />
          
          {/* Sublinhado elegante */}
          <div className="w-full h-2 relative">
            <div className="absolute inset-x-0 top-0 bg-gradient-to-r from-transparent via-[#FF2400]/80 to-transparent h-[2px] w-full blur-sm" />
            <div className="absolute inset-x-0 top-0 bg-gradient-to-r from-transparent via-[#FF2400] to-transparent h-px w-full" />
            <div className="absolute inset-x-0 top-0 bg-gradient-to-r from-transparent via-[#FFDA04]/80 to-transparent h-[3px] w-3/4 blur-sm mx-auto" />
            <div className="absolute inset-x-0 top-0 bg-gradient-to-r from-transparent via-[#FFDA04] to-transparent h-px w-3/4 mx-auto" />
          </div>
        </div>
        
        {/* Botões de ação */}
        <div className="flex gap-2">
          <Button 
            className={`${getGlassButtonClasses('outline', 'md')} ${getHoverTransformClasses('lift')}`}
            onClick={() => { /* TODO: export */ }}
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button 
            className={`${getGlassButtonClasses('primary', 'md')} ${getHoverTransformClasses('scale')} shadow-lg hover:shadow-yellow-400/30 font-semibold`}
            onClick={() => setIsNewCustomerModalOpen(true)}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            NOVO CLIENTE
          </Button>
        </div>
      </div>

      {/* Container principal com glassmorphism - KPIs + Tabela */}
      <section 
        className="flex-1 min-h-0 bg-black/80 backdrop-blur-sm border border-white/10 rounded-xl shadow-lg hero-spotlight p-4 flex flex-col hover:shadow-2xl hover:shadow-purple-500/10 hover:border-purple-400/30 transition-all duration-300 overflow-visible space-y-6"
        onMouseMove={(e) => {
          const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * 100;
          const y = ((e.clientY - rect.top) / rect.height) * 100;
          (e.currentTarget as HTMLElement).style.setProperty("--x", `${x}%`);
          (e.currentTarget as HTMLElement).style.setProperty("--y", `${y}%`);
        }}
      >
        {/* KPIs Resumo - Padronizados com StatCard v2.0.0 */}
        <div className="flex-shrink-0 grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            layout="crm"
            variant="default"
            title="Total de Clientes"
            value={customers?.length || 0}
            description="📊 Base completa • Clique para ver relatórios"
            icon={Users}
            onClick={handleNavigateToCustomerReports}
            className="cursor-pointer transform hover:scale-105 transition-all duration-200 hover:shadow-xl hover:shadow-blue-500/20"
          />
          
          <StatCard
            layout="crm"
            variant="warning"
            title="Clientes Ativos"
            value={activeCount}
            description="⚡ Segmento ativo • Clique para ver relatórios"
            icon={TrendingUp}
            onClick={handleNavigateToActiveCustomersReports}
            className="cursor-pointer transform hover:scale-105 transition-all duration-200 hover:shadow-xl hover:shadow-purple-500/20"
          />
          
          <StatCard
            layout="crm"
            variant="success"
            title="Últimos 30 dias"
            value={`+${newClientsCount}`}
            description="🚀 Novos cadastros • Clique para ver relatórios"
            icon={UserPlus}
            onClick={handleNavigateToNewCustomersReports}
            className="cursor-pointer transform hover:scale-105 transition-all duration-200 hover:shadow-xl hover:shadow-green-500/20"
          />
          
          <StatCard
            layout="crm"
            variant={qualityMetrics.averageCompleteness >= 70 ? 'purple' : 'warning'}
            title="Qualidade de Dados"
            value={`${qualityMetrics.averageCompleteness}%`}
            description="📊 Completude média • Clique para ver detalhes"
            icon={BarChart3}
            onClick={() => setShowQualityDashboard(!showQualityDashboard)}
            className="cursor-pointer transform hover:scale-105 transition-all duration-200 hover:shadow-xl hover:shadow-purple-500/20"
          />
        </div>

        {/* Dashboard de Qualidade de Dados - Colapsável */}
        {showQualityDashboard && (
          <div className="flex-shrink-0 bg-black/30 backdrop-blur-sm border border-white/5 rounded-lg p-4">
            <DataQualityDashboard 
              customers={customersData}
              onViewDetails={() => {
                // TODO: Implementar navegação para detalhes
                console.log('Ver detalhes de qualidade');
              }}
              onFixIssues={(fieldKey) => {
                // TODO: Implementar ações de correção
                console.log(`Corrigir campo: ${fieldKey}`);
              }}
            />
          </div>
        )}

        {/* Tabela de Clientes */}
        <CardContent className="p-0 flex-1 min-h-0 overflow-visible relative w-full">
          <CustomerDataTable />
        </CardContent>
      </section>

      {/* Modal Novo Cliente */}
      <NewCustomerModal
        isOpen={isNewCustomerModalOpen}
        onClose={() => setIsNewCustomerModalOpen(false)}
      />

      {loading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-adega-charcoal p-6 rounded-lg border border-white/10">
            <p className="text-adega-platinum">Funcionalidade em desenvolvimento...</p>
            <Button 
              className="mt-4 w-full" 
              onClick={() => setLoading(false)}
            >
              Fechar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomersLite;