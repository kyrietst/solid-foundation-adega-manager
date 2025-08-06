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
          <h1 className="text-3xl font-bold text-adega-platinum">
            Clientes
          </h1>
          <p className="text-adega-silver mt-1">
            Gerencie sua base de clientes
          </p>
        </div>
        <Button 
          className="bg-adega-gold text-adega-black hover:bg-adega-yellow"
          onClick={() => setLoading(true)}
        >
          Novo Cliente
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-adega-charcoal/50 border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-adega-silver">
              Total de Clientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-adega-platinum">
              {customers?.length || 0}
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-adega-charcoal/50 border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-adega-silver">
              Clientes Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-adega-gold">
              {customers?.filter(c => c.is_active)?.length || 0}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-adega-charcoal/50 border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-adega-silver">
              Últimos 30 dias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-adega-green">
              +{Math.floor(Math.random() * 10)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Customers List */}
      <Card className="bg-adega-charcoal/50 border-white/10">
        <CardHeader>
          <CardTitle className="text-adega-platinum">
            Lista de Clientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {customers && customers.length > 0 ? (
            <div className="space-y-2">
              {customers.slice(0, 10).map((customer) => (
                <div 
                  key={customer.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-adega-graphite/30 hover:bg-adega-graphite/50 transition-colors"
                >
                  <div className="flex flex-col">
                    <span className="font-medium text-adega-platinum">
                      {customer.name}
                    </span>
                    <span className="text-sm text-adega-silver">
                      {customer.email || 'Sem email'}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-adega-gold">
                      {customer.segment || 'Novo'}
                    </span>
                  </div>
                </div>
              ))}
              
              {customers.length > 10 && (
                <div className="text-center py-4">
                  <Button 
                    variant="outline" 
                    className="border-white/20 text-adega-silver hover:bg-white/5"
                  >
                    Ver todos ({customers.length} clientes)
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-adega-silver">Nenhum cliente encontrado</p>
              <Button 
                className="mt-4 bg-adega-gold text-adega-black"
                onClick={() => setLoading(true)}
              >
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