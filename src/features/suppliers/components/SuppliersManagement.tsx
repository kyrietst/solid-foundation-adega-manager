/**
 * Componente principal de gerenciamento de fornecedores
 * Segue padrão visual "Stock Page" (InventoryManagement)
 * Refatorado para usar PremiumBackground, Layout Transparente e Paginação Flutuante
 */

import React, { useState } from 'react';
import { Plus, Search, Filter, Download, Loader2, Building2 } from 'lucide-react';
import { Button } from '@/shared/ui/primitives/button';
import { Input } from '@/shared/ui/primitives/input';
import { Badge } from '@/shared/ui/primitives/badge';
import { LoadingSpinner } from '@/shared/ui/composite/loading-spinner';
import { PaginationControls } from '@/shared/ui/composite/pagination-controls';
import { FilterToggle } from '@/shared/ui/composite/filter-toggle';
import { usePagination } from '@/shared/hooks/common/use-pagination';
import { useDebounce } from '@/shared/hooks/common/use-debounce';
import { useAuth } from '@/app/providers/AuthContext';
import { cn } from '@/core/config/utils';
import { getHoverTransformClasses } from '@/core/config/theme-utils';
import { useSuppliers, useSuppliersStats } from '../hooks/useSuppliers';
import { SupplierCard } from './SupplierCard';
import { SupplierForm } from './SupplierForm';
import { SupplierFilters } from './SupplierFilters';
import type { SupplierFilters as ISupplierFilters } from '../types';
import { PremiumBackground } from '@/shared/ui/composite/PremiumBackground';
import { SupplierStats } from './SupplierStats';

interface SuppliersManagementProps {
  className?: string;
}

export const SuppliersManagement: React.FC<SuppliersManagementProps> = ({ className }) => {
  const { userRole } = useAuth();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<ISupplierFilters>({});
  
  // Debounce na busca para performance
  const debouncedSearch = useDebounce(searchTerm, 300);
  
  // Combinar busca com filtros
  const combinedFilters: ISupplierFilters = {
    ...filters,
    search: debouncedSearch || undefined,
  };
  
  // Queries
  const { data: suppliers = [], isLoading } = useSuppliers(combinedFilters);
  const { data: stats } = useSuppliersStats();
  
  // Paginação
  const {
    currentPage,
    itemsPerPage,
    totalPages,
    paginatedItems: currentSuppliers,
    goToPage,
    setItemsPerPage,
    totalItems
  } = usePagination(suppliers, {
    initialItemsPerPage: 12,
    resetPageOnDataChange: true,
  });
  
  const handleClearFilters = () => {
    setSearchTerm('');
    setFilters({});
  };
  
  const activeFiltersCount = (searchTerm ? 1 : 0) + Object.keys(filters).length;
  const hasActiveFilters = activeFiltersCount > 0;
  
  if (isLoading) {
    return (
       <div className="w-full h-screen flex flex-col items-center justify-center space-y-4">
         <PremiumBackground />
         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-adega-gold z-10"></div>
         <p className="text-adega-platinum/60 text-sm animate-pulse z-10">Carregando fornecedores...</p>
       </div>
    );
  }
  
  return (
    <div className={cn("w-full h-[100dvh] flex flex-col relative z-10 overflow-hidden", className)}>
      <PremiumBackground />
      
      {/* Header Section */}
      <header className="flex-none px-8 py-6 pt-8 pb-6 z-10">
          <div className="flex flex-wrap justify-between items-end gap-4 mb-8">
             <div className="flex flex-col gap-1">
               <p className="text-zinc-500 text-sm font-medium tracking-widest uppercase">Módulo de Compras</p>
               <h2 className="text-white text-3xl md:text-4xl font-bold leading-tight tracking-tight">GESTÃO DE FORNECEDORES</h2>
             </div>
             <div className="flex gap-3">
               <Button 
                variant="outline"
                className="flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-sm font-semibold hover:border-[#f9cb15] hover:text-[#f9cb15] transition-colors"
               >
                 <Download className="w-[18px] h-[18px]" />
                 <span>Exportar</span>
               </Button>
               {userRole === 'admin' && (
                 <Button
                   onClick={() => setIsAddModalOpen(true)}
                   className="flex items-center justify-center gap-2 h-10 px-6 rounded-xl bg-white text-black text-sm font-bold shadow-lg hover:bg-zinc-200 transition-colors"
                 >
                   <Plus className="w-[18px] h-[18px]" />
                   <span>Novo Fornecedor</span>
                 </Button>
               )}
             </div>
          </div>



          {/* KPI Stats Strip */}
          {stats && (
            <div className="shrink-0 mb-8">
              <SupplierStats stats={stats} />
            </div>
          )}

          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row gap-4 items-center bg-black/40 p-1 rounded-xl border border-white/5 backdrop-blur-sm">
             <div className="flex-1 relative w-full">
               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
               <Input
                 placeholder="Buscar fornecedores por nome, CNPJ ou contato..."
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="pl-10 h-10 bg-transparent border-none text-white placeholder:text-gray-500 focus-visible:ring-0 focus-visible:ring-offset-0"
               />
             </div>
             <FilterToggle
                isOpen={isFiltersOpen}
                onToggle={() => setIsFiltersOpen(!isFiltersOpen)}
                activeCount={activeFiltersCount}
                className="mr-1"
             />
          </div>

             {/* Panel de filtros expandido */}
            {isFiltersOpen && (
              <div className="mt-4 animate-in slide-in-from-top-2">
                <SupplierFilters
                  filters={filters}
                  onFiltersChange={setFilters}
                  className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-xl p-6 shadow-2xl"
                />
              </div>
            )}
      </header>

      {/* Main Content (Scrollable) */}
      <main className="flex-1 overflow-y-auto px-6 md:px-10 pb-40 scroll-smooth custom-scrollbar">
          {currentSuppliers.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-[400px] py-16 px-8">
                  <div className="bg-white/5 p-6 rounded-full mb-6 border border-white/5">
                    <Building2 className="h-12 w-12 text-zinc-500" />
                  </div>
                  <h3 className="text-xl font-bold text-zinc-300 mb-2">
                    {hasActiveFilters ? "Nenhum fornecedor encontrado" : "Nenhum fornecedor cadastrado"}
                  </h3>
                  <p className="text-zinc-500 text-center max-w-md">
                     {hasActiveFilters 
                        ? "Tente ajustar os termos de busca ou filtros." 
                        : "Adicione fornecedores para começar a gerenciar suas compras."}
                  </p>
                  {userRole === 'admin' && !hasActiveFilters && (
                    <Button
                      onClick={() => setIsAddModalOpen(true)}
                      className="mt-6 bg-white text-black hover:bg-zinc-200 font-bold"
                    >
                      Criar Fornecedor
                    </Button>
                  )}
              </div>
          ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentSuppliers.map((supplier) => (
                  <div key={supplier.id} className={getHoverTransformClasses('lift')}>
                    <SupplierCard
                      supplier={supplier}
                      className="bg-adega-charcoal/40 backdrop-blur-md border border-white/5 hover:border-adega-gold/30 transition-all duration-300 shadow-lg hover:shadow-2xl h-full"
                    />
                  </div>
                ))}
             </div>
          )}
      </main>

        {totalPages > 1 && (
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#050505] via-[#050505]/95 to-transparent z-50 flex justify-center pb-8 pt-12 pointer-events-none">
            {/* O container interno agora é transparente porque os estilos estão dentro do componente PaginationControls */}
            <div className="pointer-events-auto">
                <PaginationControls
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  itemsPerPage={itemsPerPage}
                  onPageChange={goToPage}
                  onItemsPerPageChange={setItemsPerPage}
                  itemsPerPageOptions={[12, 24, 48]}
                  showItemsPerPage={false} // Minimalist dock style
                  showItemsCount={true}
                  itemLabel="fornecedor"
                  itemsLabel="fornecedores"
                  variant="premium" // Ativa o modo flutuante split
                  glassEffect={false} 
                />
            </div>
        </div>
      )}

      {/* Modal de criação/edição */}
      <SupplierForm
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        mode="create"
      />
    </div>
  );
};

export default SuppliersManagement;