/**
 * TopProductsCard.tsx - Componente refatorado (Container/Presentational)
 * Context7 Pattern: Aplicação completa do padrão Container/Presentational
 * Migração da versão monolítica para arquitetura separada
 *
 * REFATORAÇÃO APLICADA:
 * - 248 linhas → Container de ~20 linhas
 * - Lógica de negócio isolada em hook
 * - Formatação em utilities separadas
 * - Componente de apresentação puro
 * - Business logic testável isoladamente
 * - Zero API calls no componente de apresentação
 *
 * COMPARAÇÃO:
 * ANTES: useQuery + cálculos + formatação + renderização (248 linhas)
 * DEPOIS: Container → Hook → Presentation (componentes especializados)
 *
 * @version 2.0.0 - Container/Presentational (Context7)
 */

import React from 'react';
import { TopProductsCardContainer } from './TopProductsCardContainer';

// Re-export dos tipos para compatibilidade
export type { TopProduct } from '../hooks/useTopProductsData';

export interface TopProductsCardProps {
  className?: string;
  period?: number; // days
  limit?: number;
  useCurrentMonth?: boolean; // Use current month instead of last N days
  cardHeight?: number; // altura fixa do card (para alinhar com outros cards)
}

/**
 * TopProductsCard refatorado usando Container/Presentational pattern
 *
 * ARQUITETURA:
 * TopProductsCard (este arquivo)
 *   ↓
 * TopProductsCardContainer (gerencia estado e lógica)
 *   ↓ useTopProductsData (hook especializado)
 *   ↓ formatters (utilities puras)
 *   ↓
 * TopProductsCardPresentation (apenas UI)
 */
export const TopProductsCard: React.FC<TopProductsCardProps> = (props) => {
  return <TopProductsCardContainer {...props} />;
};

// Export padrão para compatibilidade com imports existentes
export default TopProductsCard;

/**
 * BENEFÍCIOS DA REFATORAÇÃO:
 *
 * 1. 📦 SEPARAÇÃO DE RESPONSABILIDADES
 *    - Container: Estado e lógica de negócio
 *    - Presentation: Apenas renderização visual
 *    - Hook: Data fetching e cálculos
 *    - Utils: Formatação reutilizável
 *
 * 2. 🧪 TESTABILIDADE MELHORADA
 *    - Hook pode ser testado isoladamente
 *    - Presentation pode ser testada com mock data
 *    - Utils são funções puras (fáceis de testar)
 *    - Container pode ser testado independentemente
 *
 * 3. 🔄 REUTILIZAÇÃO
 *    - Hook pode ser usado em outros componentes
 *    - Presentation pode receber dados de fontes diferentes
 *    - Utils podem ser compartilhadas entre componentes
 *
 * 4. 🚀 PERFORMANCE
 *    - Componentes menores e focados
 *    - Memoização mais efetiva
 *    - Re-renders mais granulares
 *
 * 5. 🔧 MANUTENIBILIDADE
 *    - Código mais legível e organizado
 *    - Mudanças de lógica não afetam UI
 *    - Mudanças de UI não afetam lógica
 *    - Debugging mais simples
 */