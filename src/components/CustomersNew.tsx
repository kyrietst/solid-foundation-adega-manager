import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PaginationControls } from '@/components/ui/pagination-controls';
import { 
  Users, 
  UserPlus, 
  Search,
  Star,
  DollarSign,
  Receipt,
  Phone,
  Mail,
  MapPin,
  Calendar,
  TrendingUp,
  Activity,
  Target,
  Grid3X3,
  List,
  Filter,
  ChevronDown,
  Eye,
  Edit
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { CustomerForm } from '@/components/clients/CustomerForm';
import { 
  useCustomers, 
  useCustomerInsights, 
  useCustomerInteractions, 
  useCustomerPurchases,
  CustomerProfile 
} from '@/hooks/use-crm';
import { usePagination } from '@/hooks/use-pagination';
import { formatCurrency } from '@/lib/utils';
import { StatCard } from '@/components/ui/stat-card';
import { LoadingScreen } from '@/components/ui/loading-spinner';
import { SearchInput } from '@/components/ui/search-input';
import { FilterToggle } from '@/components/ui/filter-toggle';
import { EmptyCustomers } from '@/components/ui/empty-state';

export const CustomersNew = () => {
  const { userRole } = useAuth();

  // Estados principais
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerProfile | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [segmentFilter, setSegmentFilter] = useState('all');

  // Dados
  const { data: customers = [], isLoading: isLoadingCustomers } = useCustomers();
  const { data: selectedCustomerInsights, isLoading: isLoadingInsights } = useCustomerInsights(selectedCustomer?.id || '');
  const { data: selectedCustomerInteractions, isLoading: isLoadingInteractions } = useCustomerInteractions(selectedCustomer?.id || '');
  const { data: selectedCustomerPurchases, isLoading: isLoadingPurchases } = useCustomerPurchases(selectedCustomer?.id || '');

  // Cálculos de estatísticas
  const statistics = useMemo(() => {
    if (!customers.length) return {
      totalCustomers: 0,
      vipCustomers: 0,
      totalRevenue: 0,
      averageTicket: 0,
      activeCustomers: 0
    };

    const vipCount = customers.filter(c => c.segment === 'VIP' || c.segment === 'Fiel - VIP').length;
    const totalRevenue = customers.reduce((sum, c) => sum + (c.lifetime_value || 0), 0);
    const averageTicket = totalRevenue > 0 ? totalRevenue / customers.length : 0;
    const activeCustomers = customers.filter(c => {
      const lastPurchase = c.last_purchase_date ? new Date(c.last_purchase_date) : null;
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return lastPurchase && lastPurchase > thirtyDaysAgo;
    }).length;

    return {
      totalCustomers: customers.length,
      vipCustomers: vipCount,
      totalRevenue,
      averageTicket,
      activeCustomers
    };
  }, [customers]);

  // Filtros
  const filteredCustomers = useMemo(() => {
    let filtered = customers;

    // Filtro de busca
    if (searchTerm) {
      filtered = filtered.filter(customer =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro de segmento
    if (segmentFilter !== 'all') {
      filtered = filtered.filter(customer => customer.segment === segmentFilter);
    }

    return filtered;
  }, [customers, searchTerm, segmentFilter]);

  // Paginação usando hook reutilizável
  const initialItemsPerPage = viewMode === 'grid' ? 12 : 20;
  const pagination = usePagination(filteredCustomers, {
    initialItemsPerPage,
    resetPageOnDataChange: true
  });

  // Handlers
  const handleViewModeChange = (mode: 'grid' | 'table') => {
    setViewMode(mode);
    const newItemsPerPage = mode === 'grid' ? 12 : 20;
    pagination.setItemsPerPage(newItemsPerPage);
  };

  const handleSelectCustomer = (customer: CustomerProfile) => {
    setSelectedCustomer(customer);
    setIsDetailDialogOpen(true);
  };

  const handleCreateSuccess = () => {
    setIsCreateDialogOpen(false);
  };

  // Segmentos únicos para filtro
  const uniqueSegments = useMemo(() => {
    return [...new Set(customers.map(c => c.segment).filter(Boolean))];
  }, [customers]);

  // Função para obter cor do segmento
  const getSegmentColor = (segment: string) => {
    switch (segment) {
      case 'VIP':
      case 'Fiel - VIP':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Regular':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Ocasional':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'Novo':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };


  if (isLoadingCustomers) {
    return <LoadingScreen text="Carregando clientes..." />;
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total"
          value={statistics.totalCustomers}
          description="clientes"
          icon={Users}
          variant="default"
        />
        
        <StatCard
          title="VIP"
          value={statistics.vipCustomers}
          description="premium"
          icon={Star}
          variant="purple"
        />
        
        <StatCard
          title="Receita Total"
          value={formatCurrency(statistics.totalRevenue)}
          description="lifetime"
          icon={DollarSign}
          variant="default"
        />
        
        <StatCard
          title="Ticket Médio"
          value={formatCurrency(statistics.averageTicket)}
          description="por cliente"
          icon={Receipt}
          variant="default"
        />
        
        <StatCard
          title="Ativos"
          value={statistics.activeCustomers}
          description="30 dias"
          icon={Activity}
          variant="success"
        />
      </div>

      {/* Controls and Search */}
      <Card className="bg-adega-charcoal/20 border-white/10 backdrop-blur-xl shadow-xl">
        <CardHeader>
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div className="flex items-center space-x-4">
              <CardTitle>Lista de Clientes</CardTitle>
              <Badge variant="secondary">{pagination.totalItems} {pagination.totalItems !== customers.length ? `de ${customers.length}` : ''}</Badge>
            </div>
            
            <div className="flex items-center space-x-2">
              <SearchInput
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Buscar clientes..."
                className="w-64"
              />
              
              <FilterToggle
                isOpen={showFilters}
                onToggle={() => setShowFilters(!showFilters)}
                label="Filtros"
              />

              <div className="flex border rounded-md">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => handleViewModeChange('grid')}
                  className="rounded-r-none"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'table' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => handleViewModeChange('table')}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>

              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Novo Cliente
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
          </div>

          {/* Filtros */}
          {showFilters && (
            <div className="pt-4 border-t space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Select value={segmentFilter} onValueChange={setSegmentFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Segmento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os Segmentos</SelectItem>
                      {uniqueSegments.map(segment => (
                        <SelectItem key={segment} value={segment}>{segment}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {segmentFilter !== 'all' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSegmentFilter('all')}
                >
                  Limpar Filtros
                </Button>
              )}
            </div>
          )}
        </CardHeader>

        <CardContent>
          {pagination.totalItems === 0 ? (
            <EmptyCustomers 
              hasFilters={customers.length > 0}
              onCreateNew={() => setIsCreateDialogOpen(true)}
            />
          ) : viewMode === 'grid' ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {pagination.paginatedItems.map((customer) => (
                  <Card 
                    key={customer.id} 
                    className="bg-adega-charcoal/20 border-white/10 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-200 cursor-pointer"
                    onClick={() => handleSelectCustomer(customer)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base font-semibold truncate text-adega-platinum">
                            {customer.name}
                          </CardTitle>
                          {customer.segment && (
                            <Badge className={`mt-2 text-xs ${getSegmentColor(customer.segment)}`}>
                              {customer.segment}
                            </Badge>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectCustomer(customer);
                          }}
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        {customer.email && (
                          <div className="flex items-center text-sm text-adega-silver">
                            <Mail className="h-3 w-3 mr-2" />
                            <span className="truncate">{customer.email}</span>
                          </div>
                        )}
                        
                        {customer.phone && (
                          <div className="flex items-center text-sm text-adega-silver">
                            <Phone className="h-3 w-3 mr-2" />
                            <span>{customer.phone}</span>
                          </div>
                        )}

                        {customer.lifetime_value && (
                          <div className="flex items-center justify-between text-sm pt-2 border-t border-white/10">
                            <span className="text-adega-silver">LTV:</span>
                            <span className="font-semibold text-adega-gold">
                              {formatCurrency(customer.lifetime_value)}
                            </span>
                          </div>
                        )}

                        {customer.last_purchase_date && (
                          <div className="flex items-center text-xs text-adega-silver">
                            <Calendar className="h-3 w-3 mr-2" />
                            <span>Última compra: {new Date(customer.last_purchase_date).toLocaleDateString('pt-BR')}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <PaginationControls
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                totalItems={pagination.totalItems}
                itemsPerPage={pagination.itemsPerPage}
                onPageChange={pagination.setCurrentPage}
                onItemsPerPageChange={pagination.setItemsPerPage}
                itemLabel="cliente"
                itemsLabel="clientes"
              />
            </>
          ) : (
            /* Table View */
            <>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="text-left p-3 font-medium">Nome</th>
                      <th className="text-left p-3 font-medium">Segmento</th>
                      <th className="text-left p-3 font-medium">Contato</th>
                      <th className="text-left p-3 font-medium">LTV</th>
                      <th className="text-left p-3 font-medium">Última Compra</th>
                      <th className="text-left p-3 font-medium">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagination.paginatedItems.map((customer) => (
                      <tr 
                        key={customer.id} 
                        className="border-b hover:bg-muted/30 transition-colors"
                      >
                        <td className="p-3">
                          <div className="font-medium text-adega-platinum">{customer.name}</div>
                        </td>
                        <td className="p-3">
                          {customer.segment && (
                            <Badge className={`text-xs ${getSegmentColor(customer.segment)}`}>
                              {customer.segment}
                            </Badge>
                          )}
                        </td>
                        <td className="p-3">
                          <div className="space-y-1">
                            {customer.email && (
                              <div className="text-sm text-adega-silver">{customer.email}</div>
                            )}
                            {customer.phone && (
                              <div className="text-sm text-adega-silver">{customer.phone}</div>
                            )}
                          </div>
                        </td>
                        <td className="p-3">
                          {customer.lifetime_value && (
                            <span className="font-semibold text-adega-gold">
                              {formatCurrency(customer.lifetime_value)}
                            </span>
                          )}
                        </td>
                        <td className="p-3">
                          {customer.last_purchase_date && (
                            <span className="text-sm text-adega-silver">
                              {new Date(customer.last_purchase_date).toLocaleDateString('pt-BR')}
                            </span>
                          )}
                        </td>
                        <td className="p-3">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleSelectCustomer(customer)}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <PaginationControls
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                totalItems={pagination.totalItems}
                itemsPerPage={pagination.itemsPerPage}
                onPageChange={pagination.setCurrentPage}
                onItemsPerPageChange={pagination.setItemsPerPage}
                itemLabel="cliente"
                itemsLabel="clientes"
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* Customer Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Cliente</DialogTitle>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-6">
              {/* Basic Info */}
              <Card className="bg-adega-charcoal/20 border-white/10 backdrop-blur-xl shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{selectedCustomer.name}</span>
                    {selectedCustomer.segment && (
                      <Badge className={`${getSegmentColor(selectedCustomer.segment)}`}>
                        {selectedCustomer.segment}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedCustomer.email && (
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-adega-silver" />
                        <span>{selectedCustomer.email}</span>
                      </div>
                    )}
                    {selectedCustomer.phone && (
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-adega-silver" />
                        <span>{selectedCustomer.phone}</span>
                      </div>
                    )}
                    {selectedCustomer.address && (
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-adega-silver" />
                        <span>{selectedCustomer.address}</span>
                      </div>
                    )}
                    {selectedCustomer.lifetime_value && (
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-2 text-adega-gold" />
                        <span className="font-semibold text-adega-gold">
                          {formatCurrency(selectedCustomer.lifetime_value)}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Loading states for additional data */}
              {(isLoadingInsights || isLoadingInteractions || isLoadingPurchases) && (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary/30 border-t-primary"></div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};