/**
 * CategoryMixDonut.tsx - Componente refatorado (Container/Presentational)
 * Context7 Pattern: Aplicação completa do padrão Container/Presentational
 * Migração da versão monolítica para arquitetura separada
 *
 * REFATORAÇÃO APLICADA:
 * - 282 linhas → Container de ~20 linhas
 * - Duplo useQuery isolado em hook especializado
 * - Fallback strategy separada da apresentação
 * - Chart logic modularizada
 * - Formatação em utilities separadas
 * - Zero API calls no componente de apresentação
 *
 * COMPARAÇÃO:
 * ANTES: duplo useQuery + fallback + cálculos + chart + renderização (282 linhas)
 * DEPOIS: Container → Hook → Presentation (componentes especializados)
 *
 * @version 2.0.0 - Container/Presentational (Context7)
 */

import React from 'react';
import { CategoryMixDonutContainer } from './CategoryMixDonutContainer';

// Re-export dos tipos para compatibilidade
export type { CategoryMix } from '../hooks/useCategoryMixData';

export interface CategoryMixDonutProps {
  className?: string;
  period?: number; // days
  showTotal?: boolean; // exibir bloco Total dentro do card (default: false)
}

/**
 * CategoryMixDonut refatorado usando Container/Presentational pattern
 *
 * ARQUITETURA:
 * CategoryMixDonut (este arquivo)
 *   ↓
 * CategoryMixDonutContainer (gerencia estado e lógica)
 *   ↓ useCategoryMixData (hook especializado com fallback)
 *   ↓ formatters (utilities puras)
 *   ↓
 * CategoryMixDonutPresentation (apenas UI)
 */
export const CategoryMixDonut: React.FC<CategoryMixDonutProps> = (props) => {
  return <CategoryMixDonutContainer {...props} />;
};

// Export padrão para compatibilidade com imports existentes
export default CategoryMixDonut;

/**
 * BENEFÍCIOS DA REFATORAÇÃO:
 *
 * 1. 📦 SEPARAÇÃO DE RESPONSABILIDADES
 *    - Container: Duplo useQuery + fallback strategy
 *    - Presentation: Chart + legend + states
 *    - Hook: Sales data + stock fallback + cálculos
 *    - Utils: Formatação reutilizável
 *
 * 2. 🧪 TESTABILIDADE MELHORADA
 *    - Hook pode ser testado com mock data
 *    - Presentation pode ser testada com props estáticas
 *    - Fallback strategy testável independentemente
 *    - Chart logic isolada e testável
 *
 * 3. 🔄 REUTILIZAÇÃO
 *    - Hook pode ser usado em outros componentes
 *    - Presentation pode receber dados de outras fontes
 *    - Utils podem ser compartilhadas (formatCurrency, formatCompact)
 *    - Fallback strategy replicável
 *
 * 4. 🚀 PERFORMANCE
 *    - Componentes menores e focados
 *    - Memoização mais efetiva
 *    - Re-renders mais granulares
 *    - Query optimization isolada
 *
 * 5. 🔧 MANUTENIBILIDADE
 *    - Mudanças de API não afetam UI
 *    - Mudanças de UI não afetam lógica
 *    - Fallback strategy centralizadas
 *    - Chart customization isolada
 *    - Debugging mais simples
 */