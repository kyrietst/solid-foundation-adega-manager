/**
 * Types para o módulo de Relatórios - História 1.5
 */

export interface StockReportByCategory {
  category: string;
  total_products: number;
  total_units: number;
  total_value: number;
  avg_price: number;
  low_stock_products: number;
  percentage_of_total: number;
}

export interface StockReportSummary {
  total_portfolio_value: number;
  total_products: number;
  total_units: number;
  categories_count: number;
  low_stock_alert_count: number;
}

export interface StockReportData {
  summary: StockReportSummary;
  categories: StockReportByCategory[];
}

// Filtros para relatórios futuros
export interface ReportFilters {
  dateRange?: {
    start: Date;
    end: Date;
  };
  categories?: string[];
  lowStockOnly?: boolean;
}