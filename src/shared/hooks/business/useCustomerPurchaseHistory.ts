/**
 * useCustomerPurchaseHistory.ts - Hook para gestão de histórico de compras do cliente
 *
 * @description
 * Hook SSoT v3.0.0 que centraliza toda a lógica de histórico de compras,
 * filtros e cálculos relacionados. Elimina duplicação de código entre componentes.
 *
 * @features
 * - Filtros por período (30, 90, 180, 365 dias)
 * - Busca por nome de produto
 * - Cálculos de resumo (total gasto, itens, ticket médio)
 * - Formatação de dados para exibição
 * - Métricas de desempenho
 *
 * @author Adega Manager Team
 * @version 3.0.0 - Business Logic Centralization
 */

import { useMemo } from 'react';

// ============================================================================
// TYPES E INTERFACES
// ============================================================================

export interface PurchaseItem {
  product_name: string;
  quantity: number;
  unit_price: number;
}

export interface Purchase {
  id: string;
  date: string;
  total: number;
  items: PurchaseItem[];
}

export interface PurchaseFilters {
  searchTerm: string;
  periodFilter: 'all' | '30' | '90' | '180' | '365';
}

export interface PurchaseSummary {
  totalSpent: number;
  totalItems: number;
  averageTicket: number;
  purchaseCount: number;
}

export interface PurchaseHistoryOperations {
  // Dados filtrados
  filteredPurchases: Purchase[];

  // Resumo estatístico
  summary: PurchaseSummary;

  // Funções utilitárias
  formatPurchaseDate: (date: string) => string;
  formatPurchaseId: (id: string) => string;

  // Métricas
  hasData: boolean;
  isEmpty: boolean;
  isFiltered: boolean;
}

// ============================================================================
// HOOK PRINCIPAL
// ============================================================================

export const useCustomerPurchaseHistory = (
  purchases: Purchase[] = [],
  filters: PurchaseFilters
): PurchaseHistoryOperations => {

  // Extrair valores individuais do filters para evitar problemas de dependência
  const { searchTerm, periodFilter } = filters;

  // ============================================================================
  // FILTROS APLICADOS
  // ============================================================================

  const filteredPurchases = useMemo(() => {
    if (!purchases || purchases.length === 0) return [];

    let filtered = purchases;

    // Filtro por período
    if (periodFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();

      switch (periodFilter) {
        case '30':
          filterDate.setDate(now.getDate() - 30);
          break;
        case '90':
          filterDate.setDate(now.getDate() - 90);
          break;
        case '180':
          filterDate.setDate(now.getDate() - 180);
          break;
        case '365':
          filterDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      filtered = filtered.filter(purchase =>
        new Date(purchase.date) >= filterDate
      );
    }

    // Filtro por termo de busca (produtos)
    if (searchTerm) {
      filtered = filtered.filter(purchase =>
        purchase.items.some(item =>
          item.product_name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    return filtered;
  }, [purchases, searchTerm, periodFilter]);

  // ============================================================================
  // RESUMO ESTATÍSTICO
  // ============================================================================

  const summary = useMemo((): PurchaseSummary => {
    if (!filteredPurchases || filteredPurchases.length === 0) {
      return {
        totalSpent: 0,
        totalItems: 0,
        averageTicket: 0,
        purchaseCount: 0
      };
    }

    const totalSpent = filteredPurchases.reduce((sum, purchase) => sum + purchase.total, 0);
    const totalItems = filteredPurchases.reduce((sum, purchase) =>
      sum + purchase.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
    );
    const purchaseCount = filteredPurchases.length;
    const averageTicket = purchaseCount > 0 ? totalSpent / purchaseCount : 0;

    return {
      totalSpent: Math.round(totalSpent * 100) / 100,
      totalItems,
      averageTicket: Math.round(averageTicket * 100) / 100,
      purchaseCount
    };
  }, [filteredPurchases]);

  // ============================================================================
  // FUNÇÕES UTILITÁRIAS
  // ============================================================================

  const formatPurchaseDate = (date: string): string => {
    try {
      return new Date(date).toLocaleDateString('pt-BR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Data inválida';
    }
  };

  const formatPurchaseId = (id: string): string => {
    return `#${id.slice(-8)}`;
  };

  // ============================================================================
  // ESTADO DERIVADO
  // ============================================================================

  const hasData = purchases && purchases.length > 0;
  const isEmpty = !hasData || filteredPurchases.length === 0;
  const isFiltered = searchTerm !== '' || periodFilter !== 'all';

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    // Dados processados
    filteredPurchases,
    summary,

    // Funções utilitárias
    formatPurchaseDate,
    formatPurchaseId,

    // Estado derivado
    hasData,
    isEmpty,
    isFiltered
  };
};

export default useCustomerPurchaseHistory;