/**
 * TopProductsCardContainer.tsx - Container com lógica de negócio (REFATORADO)
 * Context7 Pattern: Container gerencia estado, lógica e dados
 * Separa completamente a lógica de negócio da apresentação visual
 *
 * REFATORAÇÃO APLICADA:
 * - Container/Presentational pattern
 * - Hook especializado para dados
 * - Estados computados derivados
 * - Props clean para apresentação
 * - Lógica de negócio isolada
 *
 * @version 2.0.0 - Container Component (Context7)
 */

import React from 'react';
import { useTopProductsData } from '../hooks/useTopProductsData';
import { TopProductsCardPresentation } from './TopProductsCardPresentation';

export interface TopProductsCardContainerProps {
  className?: string;
  period?: number; // days
  limit?: number;
  useCurrentMonth?: boolean; // Use current month instead of last N days
  cardHeight?: number; // altura fixa do card (para alinhar com outros cards)
}

/**
 * Container component que gerencia toda a lógica de negócio para Top Products
 * Delega a apresentação para TopProductsCardPresentation
 */
export const TopProductsCardContainer: React.FC<TopProductsCardContainerProps> = (props) => {
  // Hook especializado para dados e business logic
  const topProductsData = useTopProductsData({
    period: props.period,
    limit: props.limit,
    useCurrentMonth: props.useCurrentMonth,
  });

  // Passa todos os dados computados para o componente de apresentação
  return (
    <TopProductsCardPresentation
      {...topProductsData}
      {...props}
    />
  );
};

// Export do Container como padrão para uso externo
export default TopProductsCardContainer;