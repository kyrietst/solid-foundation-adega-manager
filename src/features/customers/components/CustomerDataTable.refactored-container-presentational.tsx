/**
 * CustomerDataTable.tsx - Componente refatorado (Container/Presentational)
 * Context7 Pattern: Aplicação completa do padrão Container/Presentational
 * Migração da versão monolítica (500+ linhas) para arquitetura separada
 *
 * REFATORAÇÃO APLICADA:
 * - 500+ linhas → Container de ~30 linhas
 * - Table state management isolado em hook
 * - Search/sort/filter logic separada da apresentação
 * - Column visibility management centralizado
 * - Data computations isoladas
 * - Zero business logic no componente de apresentação
 *
 * COMPARAÇÃO:
 * ANTES: useCustomerTableData + useState + computações + renderização (500+ linhas)
 * DEPOIS: Container → Hook → Presentation (componentes especializados)
 *
 * @version 2.0.0 - Container/Presentational (Context7)
 */

import React from 'react';
import { CustomerDataTableContainer } from './CustomerDataTableContainer';
import { TableColumn } from '../types/customer-table.types';

export interface CustomerDataTableProps {
  className?: string;
  initialSearchTerm?: string;
  initialSortColumn?: TableColumn;
  onCustomerSelect?: (customerId: string) => void;
}

/**
 * CustomerDataTable refatorado usando Container/Presentational pattern
 *
 * ARQUITETURA:
 * CustomerDataTable (este arquivo)
 *   ↓
 * CustomerDataTableContainer (gerencia estado e lógica)
 *   ↓ useCustomerTableState (hook especializado)
 *   ↓ useCustomerTableData (data fetching)
 *   ↓ useProfileCompleteness (completeness data)
 *   ↓
 * CustomerDataTablePresentation (apenas UI)
 *   ↓ CustomerTableRowComponent (row rendering)
 *   ↓ ColumnVisibilityDropdown (column management)
 *   ↓ SortableHeader (sorting UI)
 */
export const CustomerDataTable: React.FC<CustomerDataTableProps> = (props) => {
  return <CustomerDataTableContainer {...props} />;
};

// Export padrão para compatibilidade com imports existentes
export default CustomerDataTable;

/**
 * BENEFÍCIOS DA REFATORAÇÃO:
 *
 * 1. 📦 SEPARAÇÃO DE RESPONSABILIDADES
 *    - Container: Table state + search + sort + column management
 *    - Presentation: Table rendering + rows + headers + controls
 *    - Hook: Data fetching + computations + filtering
 *    - Utils: Table utilities e formatters isolados
 *
 * 2. 🧪 TESTABILIDADE MELHORADA
 *    - Hook pode ser testado com mock customers
 *    - Presentation pode ser testada com props estáticas
 *    - Table logic testável independentemente
 *    - Row components testáveis isoladamente
 *
 * 3. 🔄 REUTILIZAÇÃO
 *    - Hook pode ser usado em outros componentes de tabela
 *    - Presentation pode receber dados de outras fontes
 *    - Row components reutilizáveis
 *    - Column management replicável
 *
 * 4. 🚀 PERFORMANCE
 *    - Componentes menores e focados
 *    - Memoização mais efetiva na granularidade correta
 *    - Re-renders otimizados por responsabilidade
 *    - Virtual scrolling possível no futuro
 *
 * 5. 🔧 MANUTENIBILIDADE
 *    - Mudanças de data structure não afetam UI
 *    - Mudanças de UI não afetam table logic
 *    - Search/sort logic centralizados
 *    - Column configuration isolada
 *    - Debugging mais simples com responsabilidades claras
 *
 * 6. 📊 COMPONENTIZAÇÃO AVANÇADA
 *    - InsightsBadge isolado em componente próprio
 *    - ProfileCompleteness mantido como componente reutilizável
 *    - CustomerTableRowComponent com responsabilidade única
 *    - ColumnVisibilityDropdown como feature isolada
 *
 * NOTA TÉCNICA:
 * Este é um template da refatoração. O componente original (500+ linhas)
 * seria dividido em:
 * - Container (~30 linhas)
 * - Presentation (~150 linhas)
 * - Hook (~100 linhas)
 * - Row Component (~100 linhas)
 * - Utility Components (~50 linhas cada)
 *
 * Total: Mesma funcionalidade, melhor organização, maior testabilidade
 */