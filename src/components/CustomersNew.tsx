/**
 * Container principal para gestão de clientes (CRM)
 * Refatorado para usar componentes separados e hooks customizados
 * Reduzido de 536 para ~120 linhas seguindo SRP
 */

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Grid3X3, List, UserPlus } from 'lucide-react';
import { useSpecificPermissions } from '@/hooks/usePermissions';
import { CustomerForm } from '@/components/clients/CustomerForm';
import { useCustomers, CustomerProfile } from '@/hooks/use-crm';
import { usePagination } from '@/hooks/use-pagination';
import { LoadingScreen } from '@/components/ui/loading-spinner';
import { PaginationControls } from '@/components/ui/pagination-controls';
import { useCustomerFilters } from '@/hooks/common/useFilters';

// Componentes refatorados
import { CustomerStats } from './customers/CustomerStats';
import { CustomerFilters } from './customers/CustomerFilters';
import { CustomerGrid } from './customers/CustomerGrid';
import { CustomerTable } from './customers/CustomerTable';
import { CustomerDetailModal } from './customers/CustomerDetailModal';

// Hooks customizados
import { useCustomerStats } from '@/hooks/customers/useCustomerStats';
import { useCustomerSegmentation } from '@/hooks/customers/useCustomerSegmentation';
import { useCustomerOperations } from '@/hooks/customers/useCustomerOperations';

export const CustomersNew = () => {
  const { canCreateCustomers, canDeleteCustomers, canEditCustomers } = useSpecificPermissions([
    'canCreateCustomers', 
    'canDeleteCustomers', 
    'canEditCustomers'
  ]);

  // Estados locais apenas para dialogs
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerProfile | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Dados principais
  const { data: customers = [], isLoading: isLoadingCustomers } = useCustomers();

  // Hook de filtros
  const {
    filters,
    showFilters,
    setShowFilters,
    updateFilter,
    setSearchTerm,
    filteredItems: filteredCustomers,
    getUniqueValues
  } = useCustomerFilters(customers);

  // Hooks customizados
  const statistics = useCustomerStats(customers);
  const { segments: uniqueSegments } = useCustomerSegmentation(customers);
  const { createCustomer } = useCustomerOperations();

  // Filtros agora gerenciados pelo hook useCustomerFilters

  // Paginação
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

  const handleEditCustomer = (customer: CustomerProfile) => {
    // TODO: Implementar edição de cliente
    console.log('Edit customer:', customer.id);
  };

  const handleCreateSuccess = () => {
    setIsCreateDialogOpen(false);
  };

  // Permissões obtidas via hook usePermissions

  if (isLoadingCustomers) {
    return <LoadingScreen text="Carregando clientes..." />;
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      <CustomerStats
        totalCustomers={statistics.totalCustomers}
        vipCustomers={statistics.vipCustomers}
        totalRevenue={statistics.totalRevenue}
        averageTicket={statistics.averageTicket}
        activeCustomers={statistics.activeCustomers}
      />

      {/* Header com controles */}
      <Card className="bg-adega-charcoal/20 border-white/10 backdrop-blur-xl shadow-xl">
        <CardHeader>
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div className="flex items-center space-x-4">
              <CardTitle>Lista de Clientes</CardTitle>
              <Badge variant="secondary">
                {pagination.totalItems} {pagination.totalItems !== customers.length ? `de ${customers.length}` : ''}
              </Badge>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* View Mode Toggle */}
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
                  className="rounded-l-none border-l"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>

              {/* Create Customer Button */}
              {canCreateCustomers && (
                <Button 
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="bg-adega-gold hover:bg-adega-gold/80 text-black"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Novo Cliente
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Filtros */}
      <CustomerFilters
        searchTerm={filters.searchTerm}
        onSearchChange={setSearchTerm}
        segmentFilter={filters.segment || 'all'}
        onSegmentFilterChange={(segment) => updateFilter('segment', segment)}
        uniqueSegments={getUniqueValues('segment')}
        isOpen={showFilters}
        onToggle={() => setShowFilters(!showFilters)}
      />

      {/* Visualizações */}
      {viewMode === 'grid' ? (
        <CustomerGrid
          customers={pagination.paginatedItems}
          onSelectCustomer={handleSelectCustomer}
          onEditCustomer={handleEditCustomer}
          canEdit={canEditCustomers}
          isLoading={isLoadingCustomers}
        />
      ) : (
        <CustomerTable
          customers={pagination.paginatedItems}
          onSelectCustomer={handleSelectCustomer}
          onEditCustomer={handleEditCustomer}
          canEdit={canEditCustomers}
          isLoading={isLoadingCustomers}
        />
      )}

      {/* Paginação */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center">
          <PaginationControls
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={pagination.goToPage}
            itemsPerPageOptions={[6, 12, 20, 50]}
            itemsPerPage={pagination.itemsPerPage}
            onItemsPerPageChange={pagination.setItemsPerPage}
          />
        </div>
      )}

      {/* Dialogs */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-adega-charcoal border-white/10">
          <DialogHeader>
            <DialogTitle className="text-adega-platinum">Novo Cliente</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <CustomerForm onSuccess={handleCreateSuccess} />
          </div>
        </DialogContent>
      </Dialog>

      <CustomerDetailModal
        isOpen={isDetailDialogOpen}
        onClose={() => {
          setIsDetailDialogOpen(false);
          setSelectedCustomer(null);
        }}
        customer={selectedCustomer}
        onEdit={handleEditCustomer}
        canEdit={canEditCustomers}
      />
    </div>
  );
};