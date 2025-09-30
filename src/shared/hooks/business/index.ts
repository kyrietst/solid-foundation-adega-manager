/**
 * Business Logic Hooks - Barrel Export
 *
 * @description
 * Centralização de todos os hooks de lógica de negócio seguindo o padrão SSoT.
 * Estes hooks eliminam duplicação de código e centralizam cálculos complexos
 * de negócio em funções reutilizáveis.
 *
 * @pattern Single Source of Truth (SSoT)
 * - useCustomerOperations: Centraliza toda lógica de CRM e análise de clientes
 * - useProductOperations: Centraliza análise de produtos e performance
 * - Futuros: useSalesOperations, useInventoryOperations, useDeliveryOperations
 *
 * @author Adega Manager Team
 * @version 3.0.0 - Business Logic Centralization
 */

// Customer Business Logic
export {
  useCustomerOperations,
  type CustomerData,
  type CustomerMetrics,
  type CustomerInsights,
  type CustomerValidation
} from './useCustomerOperations';

// Customer Purchase History
export {
  useCustomerPurchaseHistory,
  type Purchase,
  type PurchaseItem,
  type PurchaseFilters,
  type PurchaseSummary,
  type PurchaseHistoryOperations
} from './useCustomerPurchaseHistory';

// Customer Analytics & AI Insights
export {
  useCustomerAnalytics,
  type SalesChartData,
  type ProductChartData,
  type FrequencyChartData,
  type CustomerAIInsights,
  type CustomerAnalyticsOperations
} from './useCustomerAnalytics';

// Product Business Logic
export {
  useProductOperations,
  type ProductData,
  type ProductPerformance,
  type ProductInsights,
  type ProductValidation
} from './useProductOperations';

// Re-export existing inventory calculations for compatibility
export { useInventoryCalculations } from '@/features/inventory/hooks/useInventoryCalculations';

// Utility type for all business operations
export type BusinessOperations = {
  customer: ReturnType<typeof useCustomerOperations>;
  product: ReturnType<typeof useProductOperations>;
};

export default {
  useCustomerOperations,
  useProductOperations,
};