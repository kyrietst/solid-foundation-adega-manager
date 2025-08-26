/**
 * Componente principal de gerenciamento de fornecedores
 * Segue padrão visual v2.0.0 do sistema com header padronizado e animações
 */

import React, { useState } from 'react';
import { Plus, Building2, Search, Filter, Download, TrendingUp, Package } from 'lucide-react';
import { Button } from '@/shared/ui/primitives/button';
import { Input } from '@/shared/ui/primitives/input';
import { StatCard } from '@/shared/ui/composite/stat-card';
import { LoadingSpinner } from '@/shared/ui/composite/loading-spinner';
import { EmptyState } from '@/shared/ui/composite/empty-state';
import { PaginationControls } from '@/shared/ui/composite/pagination-controls';
import { FilterToggle } from '@/shared/ui/composite/filter-toggle';
import { usePagination } from '@/shared/hooks/common/use-pagination';
import { useDebounce } from '@/shared/hooks/common/use-debounce';
import { useAuth } from '@/app/providers/AuthContext';
import { cn } from '@/core/config/utils';
import { getSFProTextClasses, getGlassButtonClasses, getHoverTransformClasses } from '@/core/config/theme-utils';
import { BlurIn } from '@/components/ui/blur-in';
import { useSuppliers, useSuppliersStats } from '../hooks/useSuppliers';
import { SupplierCard } from './SupplierCard';
import { SupplierForm } from './SupplierForm';
import { SupplierFilters } from './SupplierFilters';
import type { SupplierFilters as ISupplierFilters } from '../types';

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
  } = usePagination(suppliers, {
    initialItemsPerPage: 12,
    resetOnItemsChange: true,
  });
  
  const handleClearFilters = () => {
    setSearchTerm('');
    setFilters({});
  };
  
  const hasActiveFilters = !!(debouncedSearch || Object.keys(filters).length > 0);
  
  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <LoadingSpinner size="lg" variant="gold" />
      </div>
    );
  }
  
  return (
    <>
      {/* Header padronizado */}
      <div className="flex-shrink-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        {/* Header sem container */}
        <div className="relative text-center sm:text-left">
          {/* Título animado */}
          <BlurIn
            word="FORNECEDORES"
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
          {userRole === 'admin' && (
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-gradient-to-r from-primary-yellow to-yellow-500 text-black hover:from-yellow-300 hover:to-yellow-400 font-semibold shadow-lg hover:shadow-yellow-400/30 transition-all duration-200 hover:scale-105"
            >
              <Plus className="h-4 w-4 mr-2" />
              NOVO FORNECEDOR
            </Button>
          )}
        </div>
      </div>

      {/* Container principal com glassmorphism - KPIs + Grid de Fornecedores */}
      <section 
        className="flex-1 min-h-0 bg-black/80 backdrop-blur-sm border border-white/10 rounded-xl shadow-lg hero-spotlight p-4 flex flex-col hover:shadow-2xl hover:shadow-purple-500/10 hover:border-purple-400/30 transition-all duration-300 space-y-6"
        onMouseMove={(e) => {
          const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * 100;
          const y = ((e.clientY - rect.top) / rect.height) * 100;
          (e.currentTarget as HTMLElement).style.setProperty("--x", `${x}%`);
          (e.currentTarget as HTMLElement).style.setProperty("--y", `${y}%`);
        }}
      >
        {/* Cards de estatísticas com cores padronizadas */}
        {stats && (
          <div className="flex-shrink-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total de Fornecedores"
              value={stats.total_suppliers.toString()}
              icon={Building2}
              variant="default"
              onClick={() => {}}
            />
            <StatCard
              title="Fornecedores Ativos"
              value={stats.active_suppliers.toString()}
              icon={Building2}
              variant="success"
              onClick={() => {}}
            />
            <StatCard
              title="Categorias de Produtos"
              value={stats.total_product_categories.toString()}
              icon={Package}
              variant="purple"
              onClick={() => {}}
            />
            <StatCard
              title="Taxa de Atividade"
              value={`${stats.total_suppliers > 0 ? Math.round((stats.active_suppliers / stats.total_suppliers) * 100) : 0}%`}
              icon={TrendingUp}
              variant="warning"
              onClick={() => {}}
            />
          </div>
        )}
        
        {/* Controles de busca e filtros com estilo padronizado */}
        <div className="flex-shrink-0 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar fornecedores..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-black/50 border-white/20 text-white placeholder:text-gray-400"
            />
          </div>
          
          <FilterToggle
            isOpen={isFiltersOpen}
            onToggle={() => setIsFiltersOpen(!isFiltersOpen)}
            hasActiveFilters={hasActiveFilters}
            onClear={handleClearFilters}
          />
        </div>
        
        {/* Panel de filtros */}
        {isFiltersOpen && (
          <SupplierFilters
            filters={filters}
            onFiltersChange={setFilters}
            className="bg-black/70 backdrop-blur-sm border border-white/10 rounded-lg p-4"
          />
        )}
        
        {/* Lista de fornecedores com glass cards */}
        <div className="flex-1 min-h-0 overflow-y-auto pt-2">
        {currentSuppliers.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[500px] py-16 px-8">
            <div className="max-w-md w-full text-center space-y-8">
              {/* Ícone principal */}
              <div className="mx-auto w-24 h-24 bg-gray-800/50 rounded-full flex items-center justify-center border-2 border-gray-600/30 backdrop-blur-sm">
                <Building2 className="h-12 w-12 text-gray-400" />
              </div>
              
              {/* Título */}
              <div className="space-y-3">
                <h3 className="text-2xl font-bold text-white">
                  {hasActiveFilters ? "Nenhum fornecedor encontrado" : "Nenhum fornecedor cadastrado"}
                </h3>
                <p className="text-gray-400 text-lg leading-relaxed">
                  {hasActiveFilters
                    ? "Tente ajustar os filtros de busca para encontrar o que procura"
                    : "Comece adicionando seu primeiro fornecedor para gerenciar sua rede de parceiros"}
                </p>
              </div>
              
              {/* Botão de ação */}
              {userRole === 'admin' && !hasActiveFilters && (
                <div className="pt-4">
                  <Button
                    onClick={() => setIsAddModalOpen(true)}
                    size="lg"
                    className="bg-gradient-to-r from-primary-yellow to-yellow-500 text-black hover:from-yellow-300 hover:to-yellow-400 font-semibold shadow-lg hover:shadow-yellow-400/30 transition-all duration-200 hover:scale-105 px-8 py-3"
                  >
                    <Plus className="h-5 w-5 mr-3" />
                    ADICIONAR PRIMEIRO FORNECEDOR
                  </Button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Grid de fornecedores com hover effects */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentSuppliers.map((supplier) => (
                <div key={supplier.id} className={getHoverTransformClasses('lift')}>
                  <SupplierCard
                    supplier={supplier}
                    className="bg-black/70 backdrop-blur-xl border border-purple-500/30 hover:border-purple-400/60 transition-all duration-300 shadow-xl hover:shadow-purple-500/20"
                  />
                </div>
              ))}
            </div>
            
            {/* Paginação com estilo glass */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <PaginationControls
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={goToPage}
                  itemsPerPage={itemsPerPage}
                  onItemsPerPageChange={setItemsPerPage}
                  itemsPerPageOptions={[6, 12, 24, 48]}
                  className="bg-black/70 backdrop-blur-xl border border-purple-500/30 rounded-lg p-4"
                />
              </div>
            )}
          </>
        )}
        </div>
      </section>
      
      {/* Modal de criação/edição com backdrop blur */}
      <SupplierForm
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        mode="create"
      />
    </>
  );
};

export default SuppliersManagement;