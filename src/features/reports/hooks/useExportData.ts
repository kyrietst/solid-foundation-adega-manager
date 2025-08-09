/**
 * CSV Export Hook - Sprint 2
 * Utility for exporting report data to CSV format
 */

import { useCallback } from 'react';

interface ExportOptions {
  filename: string;
  data: any[];
  columns?: { key: string; title: string }[];
}

export const useExportData = () => {
  const exportToCSV = useCallback(({ filename, data, columns }: ExportOptions) => {
    if (!data || data.length === 0) {
      console.warn('No data to export');
      return;
    }

    let csvContent = '';
    
    // If columns are provided, use them. Otherwise, use all keys from the first object
    const cols = columns || Object.keys(data[0]).map(key => ({ key, title: key }));
    
    // Add headers
    const headers = cols.map(col => col.title).join(',');
    csvContent += headers + '\n';
    
    // Add data rows
    data.forEach(row => {
      const values = cols.map(col => {
        const value = row[col.key];
        
        // Handle different data types
        if (value === null || value === undefined) {
          return '';
        }
        
        // Convert numbers to string with proper formatting
        if (typeof value === 'number') {
          return value.toString();
        }
        
        // Handle dates
        if (value instanceof Date) {
          return value.toLocaleDateString('pt-BR');
        }
        
        // Handle strings - escape quotes and wrap in quotes if contains comma
        const stringValue = value.toString();
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        
        return stringValue;
      }).join(',');
      
      csvContent += values + '\n';
    });

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, []);

  const exportSalesData = useCallback((data: any[]) => {
    exportToCSV({
      filename: 'relatorio_vendas',
      data,
      columns: [
        { key: 'date', title: 'Data' },
        { key: 'customer_name', title: 'Cliente' },
        { key: 'total_amount', title: 'Valor Total' },
        { key: 'payment_method', title: 'Método Pagamento' },
        { key: 'status', title: 'Status' },
        { key: 'items_count', title: 'Itens' },
      ]
    });
  }, [exportToCSV]);

  const exportProductsData = useCallback((data: any[]) => {
    exportToCSV({
      filename: 'relatorio_produtos',
      data,
      columns: [
        { key: 'name', title: 'Produto' },
        { key: 'category', title: 'Categoria' },
        { key: 'qty', title: 'Quantidade Vendida' },
        { key: 'revenue', title: 'Receita' },
        { key: 'avg_price', title: 'Preço Médio' },
      ]
    });
  }, [exportToCSV]);

  const exportCategoriesData = useCallback((data: any[]) => {
    exportToCSV({
      filename: 'relatorio_categorias',
      data,
      columns: [
        { key: 'category', title: 'Categoria' },
        { key: 'revenue', title: 'Receita' },
        { key: 'products_count', title: 'Produtos' },
        { key: 'percentage', title: 'Participação %' },
      ]
    });
  }, [exportToCSV]);

  const exportInventoryData = useCallback((data: any[]) => {
    exportToCSV({
      filename: 'relatorio_estoque',
      data,
      columns: [
        { key: 'name', title: 'Produto' },
        { key: 'category', title: 'Categoria' },
        { key: 'stock', title: 'Estoque Atual' },
        { key: 'avg_daily_sales', title: 'Vendas/Dia' },
        { key: 'doh', title: 'DOH (dias)' },
        { key: 'turnover', title: 'Taxa Giro' },
        { key: 'status', title: 'Status' },
      ]
    });
  }, [exportToCSV]);

  const exportMovementsData = useCallback((data: any[]) => {
    exportToCSV({
      filename: 'relatorio_movimentos',
      data,
      columns: [
        { key: 'date', title: 'Data' },
        { key: 'type', title: 'Tipo' },
        { key: 'product_name', title: 'Produto' },
        { key: 'quantity', title: 'Quantidade' },
        { key: 'reason', title: 'Motivo' },
        { key: 'user_name', title: 'Usuário' },
      ]
    });
  }, [exportToCSV]);

  const exportCustomersData = useCallback ((data: any[]) => {
    exportToCSV({
      filename: 'relatorio_clientes',
      data,
      columns: [
        { key: 'customer_name', title: 'Cliente' },
        { key: 'total_spent', title: 'LTV Total' },
        { key: 'orders_count', title: 'Pedidos' },
        { key: 'avg_order_value', title: 'Ticket Médio' },
        { key: 'last_purchase_date', title: 'Última Compra' },
        { key: 'segment', title: 'Segmento' },
      ]
    });
  }, [exportToCSV]);

  const exportSegmentsData = useCallback((data: any[]) => {
    exportToCSV({
      filename: 'relatorio_segmentos',
      data,
      columns: [
        { key: 'segment', title: 'Segmento' },
        { key: 'count', title: 'Clientes' },
        { key: 'avg_ltv', title: 'LTV Médio' },
        { key: 'retention_rate', title: 'Taxa Retenção %' },
        { key: 'total_revenue', title: 'Receita Total' },
      ]
    });
  }, [exportToCSV]);

  const exportFinancialData = useCallback((data: any[]) => {
    exportToCSV({
      filename: 'relatorio_financeiro',
      data,
      columns: [
        { key: 'customer_name', title: 'Cliente' },
        { key: 'amount', title: 'Valor' },
        { key: 'due_date', title: 'Vencimento' },
        { key: 'days_overdue', title: 'Dias Atraso' },
        { key: 'payment_method', title: 'Método Pagamento' },
        { key: 'status', title: 'Status' },
      ]
    });
  }, [exportToCSV]);

  const exportPaymentMethodsData = useCallback((data: any[]) => {
    exportToCSV({
      filename: 'relatorio_metodos_pagamento',
      data,
      columns: [
        { key: 'method', title: 'Método' },
        { key: 'count', title: 'Quantidade' },
        { key: 'total_amount', title: 'Valor Total' },
        { key: 'avg_amount', title: 'Ticket Médio' },
        { key: 'percentage', title: 'Participação %' },
      ]
    });
  }, [exportToCSV]);

  return {
    exportToCSV,
    exportSalesData,
    exportProductsData,
    exportCategoriesData,
    exportInventoryData,
    exportMovementsData,
    exportCustomersData,
    exportSegmentsData,
    exportFinancialData,
    exportPaymentMethodsData,
  };
};