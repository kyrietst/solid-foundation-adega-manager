/**
 * formatters.ts - Utilitários de formatação para Dashboard (REFATORADO)
 * Context7 Pattern: Funções puras de formatação isoladas da apresentação
 * Remove formatação inline dos componentes para melhor reutilização e teste
 *
 * REFATORAÇÃO APLICADA:
 * - Formatação isolada em funções puras
 * - Reutilização entre componentes de dashboard
 * - Testabilidade melhorada
 * - Consistência de formatação
 *
 * @version 2.0.0 - Formatação separada (Context7)
 */

/**
 * Formatar valores monetários para Real Brasileiro
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

/**
 * Formatar quantidades com sufixo K para milhares
 */
export const formatQuantity = (qty: number): string => {
  if (qty >= 1000) {
    return (qty / 1000).toFixed(1) + 'K';
  }
  return qty.toString();
};

/**
 * Formatar números compactos (K, M, B)
 */
export const formatCompact = (value: number): string => {
  if (value >= 1_000_000_000) {
    return (value / 1_000_000_000).toFixed(1) + 'B';
  }
  if (value >= 1_000_000) {
    return (value / 1_000_000).toFixed(1) + 'M';
  }
  if (value >= 1_000) {
    return (value / 1_000).toFixed(1) + 'K';
  }
  return value.toString();
};

/**
 * Formatar percentuais
 */
export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

/**
 * Formatar períodos de tempo para display
 */
export const formatPeriodLabel = (useCurrentMonth: boolean, period: number): string => {
  return useCurrentMonth ? '(Mês Atual)' : `(${period}d)`;
};

/**
 * Truncar nomes longos mantendo legibilidade
 */
export const truncateText = (text: string, maxLength: number = 20): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};