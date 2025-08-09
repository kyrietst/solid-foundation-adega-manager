/**
 * Página principal de Relatórios - História 1.5
 * Exibe o "Valor Total do Estoque por Categoria" com queries otimizadas
 */

import React from 'react';
import { Button } from '@/shared/ui/primitives/button';
import { RefreshCw, FileSpreadsheet, TrendingUp } from 'lucide-react';
import { useStockReports } from '../hooks/useStockReports';
import { StockReportSummaryCard } from './StockReportSummary';
import { StockReportTable } from './StockReportTable';

export const Reports: React.FC = () => {
  const { data, isLoading, isError, error, refetch } = useStockReports();

  if (isError) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Relatórios de Estoque</h1>
            <p className="text-adega-silver">Análise detalhada do valor do estoque por categoria</p>
          </div>
        </div>
        
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 text-center">
          <div className="text-red-400 mb-4">
            <TrendingUp className="h-12 w-12 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Erro ao Carregar Relatórios</h3>
            <p className="text-sm">{error?.message || 'Ocorreu um erro ao buscar os dados dos relatórios'}</p>
          </div>
          <Button 
            onClick={() => refetch()} 
            variant="outline"
            className="border-red-500/30 text-red-400 hover:bg-red-500/10"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Relatórios de Estoque</h1>
          <p className="text-adega-silver">Análise detalhada do valor do estoque por categoria - História 1.5</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => refetch()} 
            variant="outline"
            className="border-white/20 text-adega-platinum hover:bg-white/10"
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button 
            variant="outline"
            className="border-adega-gold/30 text-adega-gold hover:bg-adega-gold/10"
            disabled={!data}
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Sumário */}
      <StockReportSummaryCard 
        summary={data?.summary || {
          total_portfolio_value: 0,
          total_products: 0,
          total_units: 0,
          categories_count: 0,
          low_stock_alert_count: 0
        }}
        isLoading={isLoading}
      />

      {/* Tabela Detalhada */}
      <StockReportTable 
        categories={data?.categories || []}
        isLoading={isLoading}
      />

      {/* Rodapé com Informações Técnicas */}
      {data && !isLoading && (
        <div className="bg-adega-graphite/30 rounded-lg p-4 border border-white/10">
          <p className="text-sm text-adega-silver">
            📊 <strong>Dados atualizados:</strong> {new Date().toLocaleString('pt-BR')} | 
            <strong className="ml-2">Query otimizada:</strong> get_stock_report_by_category() | 
            <strong className="ml-2">Total de categorias:</strong> {data.categories.length}
          </p>
        </div>
      )}
    </div>
  );
};