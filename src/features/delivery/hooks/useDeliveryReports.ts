/**
 * @fileoverview Hook para exportação de relatórios de delivery
 * Permite exportar dados em diversos formatos (CSV, Excel, PDF)
 * 
 * @author Adega Manager Team
 * @version 1.0.0
 */

import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';
import { useToast } from '@/shared/hooks/common/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export type ReportType = 'delivery_summary' | 'delivery_performance' | 'zone_analysis' | 'delivery_timeline';
export type ExportFormat = 'csv' | 'excel' | 'pdf';

interface ExportParams {
  reportType: ReportType;
  format: ExportFormat;
  period: '7d' | '30d' | '90d';
  filters?: {
    zoneId?: string;
    deliveryPersonId?: string;
    status?: string;
  };
}

interface ReportData {
  fileName: string;
  data: any[];
  headers: string[];
}

/**
 * Hook para exportação de relatórios de delivery
 */
export const useDeliveryReportExport = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: ExportParams): Promise<ReportData> => {
      console.log('📊 Gerando relatório:', params);

      const days = params.period === '7d' ? 7 : params.period === '30d' ? 30 : 90;
      let data: any[] = [];
      let headers: string[] = [];
      let fileName = '';

      // Buscar dados baseado no tipo de relatório
      switch (params.reportType) {
        case 'delivery_summary':
          const { data: summaryData, error: summaryError } = await supabase.rpc('get_delivery_summary_report', {
            p_days: days,
            p_zone_id: params.filters?.zoneId || null,
            p_status: params.filters?.status || null
          });

          if (summaryError) throw summaryError;

          data = summaryData || [];
          headers = [
            'ID Venda', 'Cliente', 'Endereço', 'Zona', 'Status', 
            'Valor Total', 'Taxa Entrega', 'Entregador', 'Data Criação', 
            'Tempo Estimado', 'Tempo Real', 'Pontual'
          ];
          fileName = `delivery_summary_${params.period}`;
          break;

        case 'delivery_performance':
          const { data: performanceData, error: performanceError } = await supabase.rpc('get_delivery_person_performance', {
            p_days: days
          });

          if (performanceError) throw performanceError;

          data = performanceData || [];
          headers = [
            'ID Entregador', 'Nome', 'Total Entregas', 'Tempo Médio (min)', 
            'Taxa Pontualidade (%)', 'Avaliação', 'Receita Total', 'Eficiência'
          ];
          fileName = `delivery_performance_${params.period}`;
          break;

        case 'zone_analysis':
          const { data: zoneData, error: zoneError } = await supabase.rpc('get_zone_performance', {
            p_days: days
          });

          if (zoneError) throw zoneError;

          data = zoneData || [];
          headers = [
            'Nome Zona', 'Total Pedidos', 'Receita', 'Tempo Médio (min)', 'Taxa Pontualidade (%)'
          ];
          fileName = `zone_analysis_${params.period}`;
          break;

        case 'delivery_timeline':
          const { data: timelineData, error: timelineError } = await supabase.rpc('get_delivery_daily_trends', {
            p_days: days
          });

          if (timelineError) throw timelineError;

          data = timelineData || [];
          headers = [
            'Data', 'Total Pedidos', 'Receita', 'Tempo Médio (min)', 'Pedidos Pontuais', 'Pedidos Atrasados'
          ];
          fileName = `delivery_timeline_${params.period}`;
          break;

        default:
          throw new Error('Tipo de relatório não suportado');
      }

      // Adicionar timestamp ao nome do arquivo
      const timestamp = format(new Date(), 'yyyyMMdd_HHmmss');
      fileName = `${fileName}_${timestamp}`;

      console.log(`✅ Relatório gerado: ${data.length} registros`);
      return { fileName, data, headers };
    },
    onSuccess: (result) => {
      // Converter dados para o formato solicitado e fazer download
      downloadReport(result, params.format);
      
      toast({
        title: 'Relatório exportado com sucesso!',
        description: `${result.data.length} registros exportados em formato ${params.format.toUpperCase()}`,
      });
    },
    onError: (error) => {
      console.error('❌ Erro ao exportar relatório:', error);
      toast({
        title: 'Erro na exportação',
        description: 'Não foi possível gerar o relatório. Tente novamente.',
        variant: 'destructive',
      });
    },
  });
};

/**
 * Função para fazer download do relatório no formato especificado
 */
const downloadReport = (reportData: ReportData, format: ExportFormat) => {
  const { fileName, data, headers } = reportData;

  switch (format) {
    case 'csv':
      downloadCSV(data, headers, fileName);
      break;
    case 'excel':
      downloadExcel(data, headers, fileName);
      break;
    case 'pdf':
      downloadPDF(data, headers, fileName);
      break;
    default:
      console.error('Formato não suportado:', format);
  }
};

/**
 * Download CSV
 */
const downloadCSV = (data: any[], headers: string[], fileName: string) => {
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const key = getFieldKey(header);
        const value = row[key] || '';
        // Escapar vírgulas e aspas
        return typeof value === 'string' && (value.includes(',') || value.includes('"')) 
          ? `"${value.replace(/"/g, '""')}"` 
          : value;
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${fileName}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
};

/**
 * Download Excel (usando CSV com extensão .xlsx para simplicidade)
 */
const downloadExcel = (data: any[], headers: string[], fileName: string) => {
  // Para uma implementação completa, seria necessário usar uma biblioteca como xlsx
  // Por agora, usamos CSV com extensão Excel
  downloadCSV(data, headers, fileName);
};

/**
 * Download PDF (implementação básica)
 */
const downloadPDF = (data: any[], headers: string[], fileName: string) => {
  // Para implementação completa, seria necessário usar jsPDF ou similar
  // Por agora, alertamos sobre a funcionalidade em desenvolvimento
  alert('Exportação em PDF em desenvolvimento. Use CSV ou Excel por enquanto.');
};

/**
 * Mapear nome do header para chave do objeto
 */
const getFieldKey = (header: string): string => {
  const fieldMap: Record<string, string> = {
    'ID Venda': 'sale_id',
    'Cliente': 'customer_name',
    'Endereço': 'delivery_address',
    'Zona': 'zone_name',
    'Status': 'delivery_status',
    'Valor Total': 'final_amount',
    'Taxa Entrega': 'delivery_fee',
    'Entregador': 'delivery_person_name',
    'Data Criação': 'created_at',
    'Tempo Estimado': 'estimated_delivery_time',
    'Tempo Real': 'actual_delivery_time',
    'Pontual': 'on_time',
    'ID Entregador': 'id',
    'Nome': 'name',
    'Total Entregas': 'total_deliveries',
    'Tempo Médio (min)': 'avg_delivery_time',
    'Taxa Pontualidade (%)': 'on_time_rate',
    'Avaliação': 'customer_rating',
    'Receita Total': 'total_revenue',
    'Eficiência': 'efficiency',
    'Nome Zona': 'zone_name',
    'Total Pedidos': 'order_count',
    'Receita': 'revenue',
    'Data': 'trend_date',
    'Pedidos Pontuais': 'on_time_orders',
    'Pedidos Atrasados': 'late_orders'
  };

  return fieldMap[header] || header.toLowerCase().replace(/\s+/g, '_');
};

/**
 * Hook para verificar permissões de exportação
 */
export const useReportPermissions = () => {
  return {
    canExport: true, // Implementar verificação de role se necessário
    maxRecords: 10000, // Limite de registros por exportação
    availableFormats: ['csv', 'excel'] as ExportFormat[], // PDF em desenvolvimento
  };
};