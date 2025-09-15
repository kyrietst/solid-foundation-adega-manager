/**
 * CategoryMixDonutContainer.tsx - Container com lógica de negócio (REFATORADO)
 * Context7 Pattern: Container gerencia estado, lógica e dados
 * Separa completamente a lógica de negócio da apresentação visual
 *
 * REFATORAÇÃO APLICADA:
 * - Container/Presentational pattern
 * - Hook especializado com fallback strategy
 * - Estados computados derivados
 * - Props clean para apresentação
 * - Duplo useQuery isolado do componente
 *
 * @version 2.0.0 - Container Component (Context7)
 */

import React from 'react';
import { useCategoryMixData } from '../hooks/useCategoryMixData';
import { CategoryMixDonutPresentation } from './CategoryMixDonutPresentation';

export interface CategoryMixDonutContainerProps {
  className?: string;
  period?: number; // days
  showTotal?: boolean; // exibir bloco Total dentro do card (default: false)
}

/**
 * Container component que gerencia toda a lógica de negócio para Category Mix
 * Delega a apresentação para CategoryMixDonutPresentation
 */
export const CategoryMixDonutContainer: React.FC<CategoryMixDonutContainerProps> = (props) => {
  // Hook especializado para dados com fallback strategy
  const categoryMixData = useCategoryMixData({
    period: props.period,
  });

  // Passa todos os dados computados para o componente de apresentação
  return (
    <CategoryMixDonutPresentation
      {...categoryMixData}
      {...props}
    />
  );
};

// Export do Container como padrão para uso externo
export default CategoryMixDonutContainer;