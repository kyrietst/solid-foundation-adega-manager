import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { Button } from '@/shared/ui/primitives/button';
import { LoadingScreen } from '@/shared/ui/composite/loading-spinner';
import { useCustomers } from '@/features/customers/hooks/use-crm';
import { SearchBar21st } from '@/shared/ui/thirdparty/search-bar-21st';
import { getGlassCardClasses } from '@/core/config/theme-utils';
import { BlurIn } from '@/components/ui/blur-in';
import CustomerDataTable from './CustomerDataTable';

const CustomersLite = () => {
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  
  // Usar hook básico de customers
  const { data: customers, isLoading, error } = useCustomers({ search });

  // Removemos a tabela antiga e manteremos apenas a nova tabela 21st.dev

  const activeCount = useMemo(() => {
    if (!customers) return 0;
    return customers.filter((c) => c.segment !== 'Inativo').length;
  }, [customers]);

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
    <div className="w-full h-full flex flex-col p-4">
      {/* Header */}
      <div className="flex-shrink-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        {/* Header sem container */}
        <div className="relative w-full text-center sm:text-left">
          {/* Título animado */}
          <BlurIn
            word="GESTÃO DE CLIENTES"
            duration={1.2}
            variant={{
              hidden: { filter: "blur(15px)", opacity: 0 },
              visible: { filter: "blur(0px)", opacity: 1 }
            }}
            className="text-xl lg:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FF2400] via-[#FFDA04] to-[#FF2400] drop-shadow-lg"
            style={{
              textShadow: '0 2px 4px rgba(0,0,0,0.3), 0 0 20px rgba(255, 218, 4, 0.2)'
            }}
          />
          
          {/* Sublinhado elegante */}
          <div className="w-full h-6 relative mt-2">
            <div className="absolute inset-x-0 top-0 bg-gradient-to-r from-transparent via-[#FF2400]/80 to-transparent h-[2px] w-full blur-sm" />
            <div className="absolute inset-x-0 top-0 bg-gradient-to-r from-transparent via-[#FF2400] to-transparent h-px w-full" />
            <div className="absolute inset-x-0 top-0 bg-gradient-to-r from-transparent via-[#FFDA04]/80 to-transparent h-[3px] w-3/4 blur-sm mx-auto" />
            <div className="absolute inset-x-0 top-0 bg-gradient-to-r from-transparent via-[#FFDA04] to-transparent h-px w-3/4 mx-auto" />
          </div>
        </div>
        
        {/* Botões de ação */}
        <div className="flex gap-2">
          <Button variant="outline" className="border-white/20 text-gray-200 bg-gray-800/60 hover:bg-gray-700/80" onClick={() => { /* TODO: export */ }}>
            Exportar
          </Button>
          <Button className="bg-yellow-400/20 border border-yellow-400/30 text-yellow-400 hover:bg-yellow-400/30" onClick={() => setLoading(true)}>
            NOVO CLIENTE
          </Button>
        </div>
      </div>

      {/* KPIs Resumo */}
      <div className="flex-shrink-0 grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <Card className="bg-black/60 border-white/10 backdrop-blur-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-400">Total de Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-white">{customers?.length || 0}</p>
          </CardContent>
        </Card>
        <Card className="bg-black/60 border-white/10 backdrop-blur-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-400">Clientes Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary-yellow">{activeCount}</p>
          </CardContent>
        </Card>
        <Card className="bg-black/60 border-white/10 backdrop-blur-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-400">Últimos 30 dias</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-accent-green">+{Math.floor(Math.random() * 10)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Clientes */}
      <section 
        className="flex-1 min-h-0 bg-black/80 backdrop-blur-sm border border-white/10 rounded-xl shadow-lg hero-spotlight p-4 flex flex-col hover:shadow-2xl hover:shadow-purple-500/10 hover:border-purple-400/30 transition-all duration-300 overflow-hidden"
        onMouseMove={(e) => {
          const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * 100;
          const y = ((e.clientY - rect.top) / rect.height) * 100;
          (e.currentTarget as HTMLElement).style.setProperty("--x", `${x}%`);
          (e.currentTarget as HTMLElement).style.setProperty("--y", `${y}%`);
        }}
      >
        <CardContent className="p-0 flex-1 min-h-0 overflow-hidden">
          <CustomerDataTable />
        </CardContent>
      </section>


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