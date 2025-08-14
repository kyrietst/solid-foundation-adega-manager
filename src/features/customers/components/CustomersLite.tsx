import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { Button } from '@/shared/ui/primitives/button';
import { LoadingScreen } from '@/shared/ui/composite/loading-spinner';
import { useCustomers } from '@/features/customers/hooks/use-crm';
import { SearchBar21st } from '@/shared/ui/thirdparty/search-bar-21st';
import { getGlassCardClasses } from '@/core/config/theme-utils';
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
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">CLIENTES</h1>
            <p className="text-gray-400 mt-1">Gerencie sua base de clientes</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="border-white/20 text-gray-200" onClick={() => { /* TODO: export */ }}>
              Exportar
            </Button>
            <Button className="bg-primary-yellow text-black hover:bg-yellow-90" onClick={() => setLoading(true)}>
              NOVO CLIENTE
            </Button>
          </div>
        </div>
      </div>

      {/* KPIs Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

      {/* Card com efeito spotlight que segue o mouse (teste) */}
      <section
        className="hero-spotlight rounded-2xl p-6 md:p-8 border border-black/5 bg-white text-gray-900 shadow-[0_8px_28px_rgba(0,0,0,0.12)]"
        onMouseMove={(e) => {
          const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * 100;
          const y = ((e.clientY - rect.top) / rect.height) * 100;
          (e.currentTarget as HTMLElement).style.setProperty("--x", `${x}%`);
          (e.currentTarget as HTMLElement).style.setProperty("--y", `${y}%`);
        }}
      >
        <CardHeader className="p-0 mb-4">
          <CardTitle>Análise de Clientes - Dados Reais</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
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