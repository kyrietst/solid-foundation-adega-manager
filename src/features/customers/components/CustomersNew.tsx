/**
 * Container principal para gestão de clientes (CRM)
 * Refatorado para usar componentes separados e hooks customizados
 * Reduzido de 536 para ~120 linhas seguindo SRP
 */

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { Button } from '@/shared/ui/primitives/button';
import { Badge } from '@/shared/ui/primitives/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/ui/primitives/dialog';
import { Grid3X3, List, UserPlus } from 'lucide-react';
import { useSpecificPermissions } from '@/shared/hooks/auth/usePermissions';
import { CustomerForm } from '@/features/customers/components/CustomerForm';
import { useCustomers, CustomerProfile } from '@/features/customers/hooks/use-crm';
import { usePagination } from '@/shared/hooks/common/use-pagination';
import { LoadingScreen } from '@/shared/ui/composite/loading-spinner';
import { PaginationControls } from '@/shared/ui/composite/pagination-controls';
import { PageHeader } from '@/shared/ui/composite/PageHeader';
import { useCustomerFilters } from '@/shared/hooks/common/useFilters';

// Componentes refatorados
import { CustomerStats } from './CustomerStats';
import { CustomerFilters } from './CustomerFilters';
import { CustomerGrid } from './CustomerGrid';
import { CustomerTable } from './CustomerTable';
import { CustomerDetailModal } from './CustomerDetailModal';

// Hooks customizados
import { useCustomerStats } from '@/features/customers/hooks/useCustomerStats';
import { useCustomerSegmentation } from '@/features/customers/hooks/useCustomerSegmentation';
import { useCustomerOperations } from '@/features/customers/hooks/useCustomerOperations';

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
    // TODO: Implement customer editing
  };

  const handleCreateSuccess = () => {
    setIsCreateDialogOpen(false);
  };

  // Permissões obtidas via hook usePermissions

  if (isLoadingCustomers) {
    return <LoadingScreen text="Carregando clientes..." />;
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* Standardized Header using PageHeader component */}
      <PageHeader
        title="GESTÃO DE CLIENTES"
        count={customers.length}
        countLabel="clientes"
      />

      {/* Estatísticas */}
      <div className="flex-shrink-0">
        <CustomerStats
          totalCustomers={statistics.totalCustomers}
          vipCustomers={statistics.vipCustomers}
          totalRevenue={statistics.totalRevenue}
          averageTicket={statistics.averageTicket}
          activeCustomers={statistics.activeCustomers}
        />
      </div>

      {/* Container com background glass morphism - ocupa altura restante */}
      <div className="flex-1 min-h-0 bg-black/80 backdrop-blur-sm border border-white/10 rounded-xl shadow-lg p-4 flex flex-col hover:shadow-2xl hover:shadow-purple-500/10 hover:border-purple-400/30 transition-all duration-300 mt-4">
        
        {/* Header com controles dentro do box */}
        <div className="flex-shrink-0 mb-4">
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div className="flex items-center space-x-4">
              <h2 className="text-lg font-semibold text-adega-platinum">Lista de Clientes</h2>
              <Badge variant="secondary" className="bg-gray-700/50 text-gray-100 border-gray-600/50">
                {pagination.totalItems} {pagination.totalItems !== customers.length ? `de ${customers.length}` : ''}
              </Badge>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* View Mode Toggle */}
              <div className="flex border border-gray-600/50 rounded-md">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => handleViewModeChange('grid')}
                  className="rounded-r-none bg-gray-800/60 border-gray-600 text-gray-100 hover:bg-gray-700/80"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'table' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => handleViewModeChange('table')}
                  className="rounded-l-none border-l bg-gray-800/60 border-gray-600 text-gray-100 hover:bg-gray-700/80"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>

              {/* Create Customer Button */}
              {canCreateCustomers && (
                <Button 
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="bg-yellow-400/20 border border-yellow-400/30 text-yellow-400 hover:bg-yellow-400/30"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Novo Cliente
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex-shrink-0 mb-4">
          <CustomerFilters
            searchTerm={filters.searchTerm}
            onSearchChange={setSearchTerm}
            segmentFilter={filters.segment || 'all'}
            onSegmentFilterChange={(segment) => updateFilter('segment', segment)}
            uniqueSegments={getUniqueValues('segment')}
            isOpen={showFilters}
            onToggle={() => setShowFilters(!showFilters)}
          />
        </div>

        {/* Visualizações - ocupa espaço restante */}
        <div className="flex-1 min-h-0">
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
        </div>

        {/* Paginação */}
        {pagination.totalPages > 1 && (
          <div className="flex-shrink-0 flex justify-center mt-4">
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
      </div>

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

export default CustomersNew;