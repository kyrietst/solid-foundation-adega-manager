import React, { useState, useMemo } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Users, 
  UserPlus, 
  TrendingUp, 
  Target, 
  Activity, 
  BarChart3, 
  Search,
  Star,
  DollarSign,
  Receipt
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

// Componentes do CRM
import { CustomerStats } from '@/components/ui/customer-stats';
import { CustomerList } from '@/components/ui/customer-list';
import { CustomerDetail } from '@/components/ui/customer-detail';
import { CustomerSegments } from '@/components/ui/customer-segments';
import { CustomerActivity } from '@/components/ui/customer-activity';
import { CustomerTrends } from '@/components/ui/customer-trends';
import { CustomerOpportunities } from '@/components/ui/customer-opportunities';
import { CustomerForm } from '@/components/clients/CustomerForm';

// Hooks do CRM
import { 
  useCustomers, 
  useCustomerInsights, 
  useCustomerInteractions, 
  useCustomerPurchases,
  useSalesData,
  useAllCustomerInsights,
  CustomerProfile 
} from '@/hooks/use-crm';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Estilos do react-grid-layout
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);
const queryClient = new QueryClient();

const CustomersBentoGridContent = () => {
  const { userRole } = useAuth();
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerProfile | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Dados principais
  const { data: customers = [], isLoading: isLoadingCustomers } = useCustomers();
  const { data: insights, isLoading: isLoadingInsights } = useCustomerInsights(selectedCustomer?.id || '');
  const { data: interactions, isLoading: isLoadingInteractions } = useCustomerInteractions(selectedCustomer?.id || '');
  const { data: purchases, isLoading: isLoadingPurchases } = useCustomerPurchases(selectedCustomer?.id || '');
  const { data: allInteractions, isLoading: isLoadingAllInteractions } = useCustomerInteractions('');
  const { data: salesData, isLoading: isLoadingSalesData } = useSalesData();
  const { data: allInsights, isLoading: isLoadingAllInsights } = useAllCustomerInsights();

  // Handlers
  const handleSelectCustomer = (customer: CustomerProfile) => {
    setSelectedCustomer(customer);
  };

  const handleCreateSuccess = () => {
    setIsCreateDialogOpen(false);
  };

  // Filtrar clientes por busca
  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calcular estatísticas dos clientes
  const customerStats = useMemo(() => {
    if (!customers.length) return {
      totalCustomers: 0,
      vipCustomers: 0,
      totalRevenue: 0,
      averageTicket: 0
    };

    const vipCount = customers.filter(c => c.segment === 'VIP' || c.segment === 'Fiel - VIP').length;
    const totalRevenue = customers.reduce((sum, c) => sum + (c.lifetime_value || 0), 0);
    const averageTicket = totalRevenue > 0 ? totalRevenue / customers.length : 0;

    return {
      totalCustomers: customers.length,
      vipCustomers: vipCount,
      totalRevenue,
      averageTicket
    };
  }, [customers]);

  // Layout do Bento Grid - Corrigido e Simplificado
  const layouts = useMemo(() => ({
    lg: [
      // Linha superior - KPIs (4 cards pequenos)
      { i: 'total-customers', x: 0, y: 0, w: 3, h: 3, static: true },
      { i: 'vip-customers', x: 3, y: 0, w: 3, h: 3, static: true },
      { i: 'total-revenue', x: 6, y: 0, w: 3, h: 3, static: true },
      { i: 'average-ticket', x: 9, y: 0, w: 3, h: 3, static: true },
      
      // Segunda linha - Análises principais
      { i: 'customer-segments', x: 0, y: 3, w: 6, h: 8, static: true },
      { i: 'recent-activities', x: 6, y: 3, w: 6, h: 8, static: true },
      
      // Terceira linha - Lista de clientes (altura maior)
      { i: 'customer-list', x: 0, y: 11, w: 12, h: 10, static: true },
      
      // Quarta linha - Detalhes e Oportunidades
      { i: 'customer-details', x: 0, y: 21, w: 8, h: 8, static: true },
      { i: 'business-opportunities', x: 8, y: 21, w: 4, h: 8, static: true },
    ],
    md: [
      // Tablet - Layout empilhado
      { i: 'total-customers', x: 0, y: 0, w: 5, h: 3, static: true },
      { i: 'vip-customers', x: 5, y: 0, w: 5, h: 3, static: true },
      { i: 'total-revenue', x: 0, y: 3, w: 5, h: 3, static: true },
      { i: 'average-ticket', x: 5, y: 3, w: 5, h: 3, static: true },
      { i: 'customer-segments', x: 0, y: 6, w: 10, h: 8, static: true },
      { i: 'recent-activities', x: 0, y: 14, w: 10, h: 8, static: true },
      { i: 'customer-list', x: 0, y: 22, w: 10, h: 10, static: true },
      { i: 'customer-details', x: 0, y: 32, w: 10, h: 8, static: true },
      { i: 'business-opportunities', x: 0, y: 40, w: 10, h: 6, static: true },
    ],
    sm: [
      // Mobile - Layout vertical
      { i: 'total-customers', x: 0, y: 0, w: 6, h: 3, static: true },
      { i: 'vip-customers', x: 0, y: 3, w: 6, h: 3, static: true },
      { i: 'total-revenue', x: 0, y: 6, w: 6, h: 3, static: true },
      { i: 'average-ticket', x: 0, y: 9, w: 6, h: 3, static: true },
      { i: 'customer-segments', x: 0, y: 12, w: 6, h: 8, static: true },
      { i: 'recent-activities', x: 0, y: 20, w: 6, h: 8, static: true },
      { i: 'customer-list', x: 0, y: 28, w: 6, h: 12, static: true },
      { i: 'customer-details', x: 0, y: 40, w: 6, h: 8, static: true },
      { i: 'business-opportunities', x: 0, y: 48, w: 6, h: 6, static: true },
    ]
  }), []);

  // Componente de KPI Card
  const KPICard = ({ title, value, icon, color = "text-primary" }: {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color?: string;
  }) => (
    <Card className="bg-adega-charcoal/20 border-white/10 backdrop-blur-xl shadow-xl h-full">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
          </div>
          <div className={`${color}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Componente de Lista de Clientes com busca
  const CustomerListWithSearch = () => (
    <Card className="bg-adega-charcoal/20 border-white/10 backdrop-blur-xl shadow-xl h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Lista de Clientes
          </CardTitle>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <UserPlus className="h-4 w-4 mr-2" />
                Novo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Criar Novo Cliente</DialogTitle>
              </DialogHeader>
              <CustomerForm onSuccess={handleCreateSuccess} />
            </DialogContent>
          </Dialog>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar clientes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {isLoadingCustomers ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary/30 border-t-primary"></div>
          </div>
        ) : (
          <div className="h-full overflow-auto">
            <CustomerList 
              customers={filteredCustomers} 
              onSelectCustomer={handleSelectCustomer} 
            />
          </div>
        )}
      </CardContent>
    </Card>
  );

  // Componente de Detalhes do Cliente
  const CustomerDetailsCard = () => (
    <Card className="bg-adega-charcoal/20 border-white/10 backdrop-blur-xl shadow-xl h-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Activity className="h-5 w-5 mr-2" />
          Detalhes do Cliente
        </CardTitle>
      </CardHeader>
      <CardContent>
        {selectedCustomer ? (
          <div className="h-full overflow-y-auto">
            {isLoadingInsights || isLoadingInteractions || isLoadingPurchases ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary/30 border-t-primary"></div>
              </div>
            ) : (
              <CustomerDetail
                customer={selectedCustomer}
                insights={insights || []}
                interactions={interactions || []}
                purchases={purchases || []}
              />
            )}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Selecione um cliente da lista para ver os detalhes</p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (isLoadingCustomers) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/30 border-t-primary"></div>
      </div>
    );
  }

  return (
    <div className="h-full p-4">
      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        breakpoints={{ lg: 1200, md: 996, sm: 768 }}
        cols={{ lg: 12, md: 10, sm: 6 }}
        rowHeight={80}
        margin={[12, 12]}
        containerPadding={[16, 16]}
        isDraggable={false}
        isResizable={false}
        useCSSTransforms={true}
        compactType={null}
        preventCollision={true}
      >
        {/* KPIs */}
        <div key="total-customers">
          <KPICard
            title="Total de Clientes"
            value={customerStats.totalCustomers}
            icon={<Users className="h-6 w-6" />}
            color="text-blue-500"
          />
        </div>
        
        <div key="vip-customers">
          <KPICard
            title="Clientes VIP"
            value={customerStats.vipCustomers}
            icon={<Star className="h-6 w-6" />}
            color="text-purple-500"
          />
        </div>
        
        <div key="total-revenue">
          <KPICard
            title="Receita Total"
            value={`R$ ${customerStats.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            icon={<DollarSign className="h-6 w-6" />}
            color="text-green-500"
          />
        </div>
        
        <div key="average-ticket">
          <KPICard
            title="Ticket Médio"
            value={`R$ ${customerStats.averageTicket.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            icon={<Receipt className="h-6 w-6" />}
            color="text-orange-500"
          />
        </div>

        {/* Segmentação */}
        <div key="customer-segments">
          <Card className="bg-adega-charcoal/20 border-white/10 backdrop-blur-xl shadow-xl h-full">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Segmentação de Clientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!isLoadingCustomers && customers.length > 0 && (
                <CustomerSegments customers={customers} />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Atividades Recentes */}
        <div key="recent-activities">
          <Card className="bg-adega-charcoal/20 border-white/10 backdrop-blur-xl shadow-xl h-full">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Atividades Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!isLoadingAllInteractions && allInteractions && customers.length > 0 && (
                <CustomerActivity 
                  interactions={allInteractions} 
                  customers={customers}
                  limit={4}
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Lista de Clientes */}
        <div key="customer-list">
          <CustomerListWithSearch />
        </div>

        {/* Detalhes do Cliente */}
        <div key="customer-details">
          <CustomerDetailsCard />
        </div>

        {/* Oportunidades de Negócio */}
        <div key="business-opportunities">
          <Card className="bg-adega-charcoal/20 border-white/10 backdrop-blur-xl shadow-xl h-full">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2" />
                Oportunidades
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-full overflow-y-auto">
                {!isLoadingAllInsights && allInsights && customers.length > 0 && (
                  <CustomerOpportunities 
                    insights={allInsights} 
                    customers={customers} 
                    limit={5}
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </ResponsiveGridLayout>
    </div>
  );
};

export const CustomersBentoGrid = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <CustomersBentoGridContent />
    </QueryClientProvider>
  );
};