import { useCallback } from 'react';
import { saveAs } from 'file-saver';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

type ExportFormat = 'pdf' | 'csv' | 'excel';

interface ExportOptions {
  title: string;
  data: any[];
  columns: {
    key: string;
    label: string;
    format?: (value: any) => string;
    width?: number;
  }[];
  filters?: Record<string, any>;
  dateRange?: { from?: Date; to?: Date };
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const formatDate = (date?: Date) => {
  if (!date) return '';
  return format(date, 'dd/MM/yyyy', { locale: ptBR });
};

export const useReportExport = () => {
  const exportToPDF = useCallback(async (options: ExportOptions) => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
    });
    
    // Adicionar cabeçalho
    doc.setFontSize(18);
    doc.text(options.title, 14, 20);
    
    // Adicionar informações do filtro
    doc.setFontSize(10);
    let yPosition = 30;
    
    // Adicionar intervalo de datas
    if (options.dateRange?.from || options.dateRange?.to) {
      const dateText = `Período: ${formatDate(options.dateRange.from)} - ${formatDate(options.dateRange.to)}`;
      doc.text(dateText, 14, yPosition);
      yPosition += 5;
    }
    
    // Adicionar outros filtros
    if (options.filters) {
      Object.entries(options.filters).forEach(([key, value]) => {
        if (value) {
          doc.text(`${key}: ${value}`, 14, yPosition);
          yPosition += 5;
        }
      });
    }
    
    // Adicionar data de geração
    doc.text(`Gerado em: ${formatDate(new Date())}`, 14, yPosition + 5);
    
    // Preparar dados para a tabela
    const headers = options.columns.map(col => col.label);
    const rows = options.data.map(item => 
      options.columns.map(col => {
        const value = item[col.key];
        return col.format ? col.format(value) : String(value || '');
      })
    );
    
    // Adicionar tabela
    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: yPosition + 15,
      margin: { top: 20 },
      styles: { 
        fontSize: 8,
        cellPadding: 2,
        lineColor: [0, 0, 0],
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: [41, 121, 255],
        textColor: 255,
        fontStyle: 'bold',
      },
      columnStyles: options.columns.reduce((acc, col, index) => ({
        ...acc,
        [index]: { cellWidth: col.width || 'auto' },
      }), {}),
    });
    
    // Adicionar rodapé
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(
        `Página ${i} de ${pageCount}`,
        doc.internal.pageSize.width - 30,
        doc.internal.pageSize.height - 10
      );
    }
    
    // Salvar o documento
    doc.save(`${options.title.toLowerCase().replace(/\s+/g, '-')}-${format(new Date(), 'yyyyMMdd')}.pdf`);
  }, []);
  
  const exportToCSV = useCallback((options: ExportOptions) => {
    // Preparar os dados
    const headers = options.columns.map(col => col.label);
    const rows = options.data.map(item => 
      options.columns.map(col => {
        const value = item[col.key];
        return col.format ? col.format(value) : String(value || '');
      })
    );
    
    // Converter para CSV
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += headers.join(';') + '\r\n';
    
    rows.forEach(row => {
      csvContent += row.join(';') + '\r\n';
    });
    
    // Criar link de download
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download', 
      `${options.title.toLowerCase().replace(/\s+/g, '-')}-${format(new Date(), 'yyyyMMdd')}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);
  
  const exportToExcel = useCallback((options: ExportOptions) => {
    // Preparar os dados
    const headers = options.columns.map(col => col.label);
    const rows = options.data.map(item => {
      const row: Record<string, any> = {};
      options.columns.forEach(col => {
        const value = item[col.key];
        row[col.label] = col.format ? col.format(value) : value;
      });
      return row;
    });
    
    // Criar planilha
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Relatório');
    
    // Ajustar largura das colunas
    const colWidths = options.columns.map(col => ({
      wch: col.width ? col.width / 5 : 20, // Ajuste aproximado
    }));
    worksheet['!cols'] = colWidths;
    
    // Gerar arquivo
    XLSX.writeFile(
      workbook, 
      `${options.title.toLowerCase().replace(/\s+/g, '-')}-${format(new Date(), 'yyyyMMdd')}.xlsx`
    );
  }, []);
  
  const exportReport = useCallback((format: ExportFormat, options: ExportOptions) => {
    switch (format) {
      case 'pdf':
        return exportToPDF(options);
      case 'csv':
        return exportToCSV(options);
      case 'excel':
        return exportToExcel(options);
      default:
        throw new Error(`Formato de exportação não suportado: ${format}`);
    }
  }, [exportToPDF, exportToCSV, exportToExcel]);
  
  return {
    exportReport,
    exportToPDF,
    exportToCSV,
    exportToExcel,
  };
};
