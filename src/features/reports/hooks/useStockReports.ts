/**
 * Hook para dados de relatórios de estoque - História 1.5
 * Utiliza a função otimizada get_stock_report_by_category()
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';
import { StockReportByCategory, StockReportData, StockReportSummary } from '../types';

export const useStockReports = () => {
  const {
    data: reportsData,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['stock-reports-by-category'],
    queryFn: async (): Promise<StockReportData> => {
      // Usar a função otimizada criada no Supabase
      const { data, error } = await supabase.rpc('get_stock_report_by_category');

      if (error) {
        console.error('Erro ao buscar relatórios de estoque:', error);
        throw new Error(`Erro no relatório de estoque: ${error.message}`);
      }

      const categories: StockReportByCategory[] = data || [];
      
      // Calcular sumário baseado nos dados das categorias
      const summary: StockReportSummary = {
        total_portfolio_value: categories.reduce((sum, cat) => sum + Number(cat.total_value), 0),
        total_products: categories.reduce((sum, cat) => sum + cat.total_products, 0),
        total_units: categories.reduce((sum, cat) => sum + cat.total_units, 0),
        categories_count: categories.length,
        low_stock_alert_count: categories.reduce((sum, cat) => sum + cat.low_stock_products, 0)
      };

      return {
        summary,
        categories
      };
    },
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  return {
    data: reportsData,
    isLoading,
    isError,
    error,
    refetch
  };
};

export default useStockReports;