import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { Button } from '@/shared/ui/primitives/button';
import { LoadingScreen } from '@/shared/ui/composite/loading-spinner';
import { useCustomers } from '@/features/customers/hooks/use-crm';

const CustomersLite = () => {
  const [loading, setLoading] = useState(false);
  
  // Usar hook básico de customers
  const { data: customers, isLoading, error } = useCustomers();

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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Clientes</h1>
          <p className="text-gray-400 mt-1">Gerencie sua base de clientes</p>
        </div>
        <Button className="bg-primary-yellow text-black hover:bg-yellow-90" onClick={() => setLoading(true)}>
          Novo Cliente
        </Button>
      </div>

      {/* Topbar de filtros */}
      <Card className="border-white/10 bg-black/40 backdrop-blur-xl">
        <CardContent className="p-4 flex flex-wrap gap-2 items-center">
          <button className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-200 text-sm hover:bg-white/10">Todos</button>
          <button className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-200 text-sm hover:bg-white/10">Ativos</button>
          <button className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-200 text-sm hover:bg-white/10">VIP</button>
          <div className="ml-auto" />
          <input className="h-9 w-60 rounded-full bg-white/5 border border-white/10 px-3 text-sm text-gray-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-yellow/30" placeholder="Buscar clientes..." />
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-white/10 bg-black/40 backdrop-blur-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-400">Total de Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-white">{customers?.length || 0}</p>
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-black/40 backdrop-blur-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-400">Clientes Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary-yellow">{customers?.filter(c => c.is_active)?.length || 0}</p>
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-black/40 backdrop-blur-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-400">Últimos 30 dias</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-accent-green">+{Math.floor(Math.random() * 10)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de clientes */}
      <Card className="border-white/10 bg-black/40 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-white">Lista de Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          {customers && customers.length > 0 ? (
            <div className="space-y-2">
              {customers.slice(0, 10).map((customer) => (
                <div
                  key={customer.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <div className="flex flex-col">
                    <span className="font-medium text-white">{customer.name}</span>
                    <span className="text-sm text-gray-400">{customer.email || 'Sem email'}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-primary-yellow">{customer.segment || 'Novo'}</span>
                  </div>
                </div>
              ))}
              {customers.length > 10 && (
                <div className="text-center py-4">
                  <Button variant="outline" className="border-white/20 text-gray-300 hover:bg-white/5">
                    Ver todos ({customers.length} clientes)
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400">Nenhum cliente encontrado</p>
              <Button className="mt-4 bg-primary-yellow text-black" onClick={() => setLoading(true)}>
                Adicionar Primeiro Cliente
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

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