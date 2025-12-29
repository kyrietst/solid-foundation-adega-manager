/**
 * @file use-sales.ts
 * @description Hook "Facade" para manter retrocompatibilidade.
 * A lógica foi dividida em hooks menores para respeitar SRP.
 */

export * from './useSalesQueries';
export * from './useSalesMutations';
export * from './usePaymentMethods';

// Re-exportar tipos para evitar quebra de imports antigos que buscavam tipos daqui
// (Embora o ideal seja importar de types.ts, mantemos por segurança)
export type {
  Sale,
  SaleItemInput,
  UpsertSaleInput,
  PaymentMethod,
  AllowedRole
} from '@/features/sales/types';
