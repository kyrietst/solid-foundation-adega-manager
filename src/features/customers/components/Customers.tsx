import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/ui/primitives/button';
import { LoadingScreen } from '@/shared/ui/composite/loading-spinner';
import { useCustomers } from '@/features/customers/hooks/use-crm';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { PremiumBackground } from '@/shared/ui/composite/PremiumBackground';
import { Download, Plus } from 'lucide-react';
import CustomerDataTable from './CustomerDataTable';
import { NewCustomerModal } from './NewCustomerModal';
import { CustomerStats } from './CustomerStats';
import { CustomerFilters } from './CustomerFilters';
import { StandardPageHeader } from '@/shared/ui/composite/StandardPageHeader';

const CustomersLite = () => {
  const navigate = useNavigate();
  // State for Modal
  const [isNewCustomerModalOpen, setIsNewCustomerModalOpen] = useState(false);
  const [loading, setLoading] = useState(false); // Restore loading state for actions
  
  // State for Filters
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500); // 500ms delay

  const [segmentFilter, setSegmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('');
  const [lastPurchaseFilter, setLastPurchaseFilter] = useState('');
  const [birthdayFilter, setBirthdayFilter] = useState('');
  
  // Use debouncedSearch for fetching data to prevent lag
  const { data: customers = [], isLoading, error } = useCustomers({ search: debouncedSearch });

  const uniqueSegments = useMemo(() => {
    if (!customers) return [];
    return Array.from(new Set(customers.map(c => c.segment).filter(Boolean))) as string[];
  }, [customers]);

  const activeCount = useMemo(() => {
    if (!customers) return 0;
    // Assuming 'status' or 'segment' field exists and logic matches existing
    // 'status' does not exist on CustomerProfile, using 'segment' as proxy for now or if we add status later 
    return customers.filter((c) => c.segment !== 'Inativo').length;
  }, [customers]);

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

  const vipCount = useMemo(() => {
    if (!customers) return 0;
    return customers.filter(c => c.segment === 'VIP').length;
  }, [customers]);

  const retentionRate = useMemo(() => {
    if (!customers || customers.length === 0) return 0;
    return (activeCount / customers.length) * 100;
  }, [customers, activeCount]);


  // Placeholder calculations for revenue since strict types might miss it in this hook
  // In a real refactor we'd ensure useCustomers returns this or use a specific hook
  const totalRevenue = 0; 
  const averageTicket = 0;

  // We are NOT blocking the UI with full page loading screen for search updates
  // Only show full loading screen on initial mount if really needed, but usually Skeleton is better
  // Keeping existing logic: if initial loading, show LoadingScreen. 
  // Ideally this should be a skeletal loading state inside the table.
  if (isLoading && !debouncedSearch && customers.length === 0) {
     return <LoadingScreen text="Carregando clientes..." />;
  }

  if (error) {
    return (
      <div className="p-8 flex items-center justify-center h-screen bg-black text-red-500">
        Erro ao carregar clientes: {error.message}
      </div>
    );
  }

  return (
    <>
      {/* Background Fixed Layer */}
      <PremiumBackground className="fixed inset-0 z-0 pointer-events-none" />

      {/* Main Content Layer */}
      <div className="relative z-10 flex flex-col h-screen overflow-hidden bg-transparent">
        
        {/* Header Section */}
        {/* Header Section */}
        <header className="flex-none px-8 py-6 pt-8 pb-6 z-10 w-full">
          <div className="flex flex-wrap justify-between items-end gap-4 mb-6">
             <div className="flex flex-col gap-1">
               <p className="text-zinc-500 text-sm font-medium tracking-widest uppercase">Módulo de Gestão</p>
               <h2 className="text-white text-3xl md:text-4xl font-bold leading-tight tracking-tight">GESTÃO DE CLIENTES</h2>
             </div>
             <div className="flex gap-3">
               <Button 
                variant="outline"
                className="flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-sm font-semibold hover:border-[#f9cb15] hover:text-[#f9cb15] transition-colors"
                onClick={() => { /* TODO: Implement export */ }}
               >
                <Download className="w-[18px] h-[18px]" />
                <span className="hidden sm:inline">Exportar</span>
               </Button>
               
               <Button 
                onClick={() => setIsNewCustomerModalOpen(true)}
                className="flex items-center justify-center gap-2 h-10 px-6 rounded-xl bg-white text-black text-sm font-bold shadow-lg hover:bg-zinc-200 transition-colors"
               >
                <Plus className="w-[18px] h-[18px]" />
                <span className="hidden sm:inline">Novo Cliente</span>
               </Button>
             </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto px-8 pb-8 custom-scrollbar flex flex-col gap-8">
            {/* KPI/Stats Grid */}
            <div className="shrink-0">
                <CustomerStats 
                    totalCustomers={customers?.length || 0}
                    vipCustomers={vipCount}
                    totalRevenue={totalRevenue}
                    averageTicket={averageTicket}
                    activeCustomers={activeCount}
                    newCustomersCount={newClientsCount}
                    retentionRate={retentionRate}
                />
            </div>

            {/* Filters */}
            <CustomerFilters 
                searchTerm={search}
                onSearchChange={setSearch}
                segmentFilter={segmentFilter}
                onSegmentFilterChange={setSegmentFilter}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
                lastPurchaseFilter={lastPurchaseFilter}
                onLastPurchaseFilterChange={setLastPurchaseFilter}
                birthdayFilter={birthdayFilter}
                onBirthdayFilterChange={setBirthdayFilter}
                uniqueSegments={uniqueSegments}
                isOpen={true}
            />
            
            {/* Table */}
            <div className="flex-1 min-h-[500px]">
                 <CustomerDataTable 
                    // If we are searching (debouncing), we might want to show a spinner inside the table
                    // But for now, we pass the data we have. 
                    // To show "live" search feeling, we could pass isLoading to the table if it supported it.
                    searchTerm={search} // Pass the raw search term for highlighting if supported, or just for consistency
                    segmentFilter={segmentFilter}
                    statusFilter={statusFilter}
                    lastPurchaseFilter={lastPurchaseFilter}
                    birthdayFilter={birthdayFilter}
                 />
            </div>
        </main>
      </div>

      {/* Modal & Overlays */}
      <NewCustomerModal
        isOpen={isNewCustomerModalOpen}
        onClose={() => setIsNewCustomerModalOpen(false)}
      />

      {loading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <LoadingScreen text="Processando..." />
        </div>
      )}
    </>
  );
};

export default CustomersLite;