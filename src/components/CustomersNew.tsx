import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
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
  
  // Estados de paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

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

  // Filtros e paginação
  const { filteredCustomers, paginatedCustomers, totalPages, totalItems } = useMemo(() => {
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

    // Paginação
    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedCustomers = filtered.slice(startIndex, startIndex + itemsPerPage);

    return {
      filteredCustomers: filtered,
      paginatedCustomers,
      totalPages,
      totalItems
    };
  }, [customers, searchTerm, segmentFilter, currentPage, itemsPerPage]);

  // Reset página quando filtros mudam
  useMemo(() => {
    setCurrentPage(1);
  }, [searchTerm, segmentFilter]);

  // Handlers
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(parseInt(value));
    setCurrentPage(1);
  };

  const handleViewModeChange = (mode: 'grid' | 'table') => {
    setViewMode(mode);
    if (mode === 'grid') {
      setItemsPerPage(12);
    } else {
      setItemsPerPage(20);
    }
    setCurrentPage(1);
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

  // Componente de paginação
  const PaginationControls = () => {
    if (totalPages <= 1) return null;
    
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return (
      <div className="flex items-center justify-between pt-4 border-t">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <span>
            Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, totalItems)} de {totalItems} clientes
          </span>
          <div className="flex items-center space-x-2 ml-4">
            <span>Itens por página:</span>
            <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6">6</SelectItem>
                <SelectItem value="12">12</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex items-center space-x-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          {pages.map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              onClick={() => handlePageChange(page)}
              className="min-w-[40px]"
            >
              {page}
            </Button>
          ))}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  if (isLoadingCustomers) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/30 border-t-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-adega-charcoal/20 border-white/10 backdrop-blur-xl shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-adega-platinum">Total</CardTitle>
            <Users className="h-4 w-4 text-adega-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-adega-yellow">{statistics.totalCustomers}</div>
            <p className="text-xs text-adega-silver">clientes</p>
          </CardContent>
        </Card>

        <Card className="bg-adega-charcoal/20 border-white/10 backdrop-blur-xl shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-adega-platinum">VIP</CardTitle>
            <Star className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-400">{statistics.vipCustomers}</div>
            <p className="text-xs text-adega-silver">premium</p>
          </CardContent>
        </Card>

        <Card className="bg-adega-charcoal/20 border-white/10 backdrop-blur-xl shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-adega-platinum">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-adega-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-adega-yellow">
              R$ {statistics.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-adega-silver">lifetime</p>
          </CardContent>
        </Card>

        <Card className="bg-adega-charcoal/20 border-white/10 backdrop-blur-xl shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-adega-platinum">Ticket Médio</CardTitle>
            <Receipt className="h-4 w-4 text-adega-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-adega-yellow">
              R$ {statistics.averageTicket.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-adega-silver">por cliente</p>
          </CardContent>
        </Card>

        <Card className="bg-adega-charcoal/20 border-green-500/30 backdrop-blur-xl shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-adega-platinum">Ativos</CardTitle>
            <Activity className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">{statistics.activeCustomers}</div>
            <p className="text-xs text-adega-silver">30 dias</p>
          </CardContent>
        </Card>
      </div>

      {/* Controls and Search */}
      <Card className="bg-adega-charcoal/20 border-white/10 backdrop-blur-xl shadow-xl">
        <CardHeader>
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div className="flex items-center space-x-4">
              <CardTitle>Lista de Clientes</CardTitle>
              <Badge variant="secondary">{totalItems} {totalItems !== customers.length ? `de ${customers.length}` : ''}</Badge>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar clientes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filtros
                <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </Button>

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
          {totalItems === 0 ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-center">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <div className="text-muted-foreground">
                  {customers.length === 0 ? 'Nenhum cliente cadastrado' : 'Nenhum cliente encontrado com os filtros aplicados'}
                </div>
              </div>
            </div>
          ) : viewMode === 'grid' ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {paginatedCustomers.map((customer) => (
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
                              R$ {customer.lifetime_value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
              <PaginationControls />
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
                    {paginatedCustomers.map((customer) => (
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
                              R$ {customer.lifetime_value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
              <PaginationControls />
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
                          R$ {selectedCustomer.lifetime_value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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