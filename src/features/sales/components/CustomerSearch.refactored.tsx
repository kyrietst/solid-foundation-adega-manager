/**
 * CustomerSearch.tsx - Componente refatorado (Container/Presentational)
 * Context7 Pattern: Aplicação completa do padrão Container/Presentational
 * Migração da versão monolítica para arquitetura separada
 *
 * REFATORAÇÃO APLICADA:
 * - 168 linhas → Container de ~20 linhas
 * - Search logic isolada em hook especializado
 * - Debounce strategy separada da apresentação
 * - Popover state management centralizado
 * - Real-time search otimizada
 * - Zero API calls no componente de apresentação
 *
 * COMPARAÇÃO:
 * ANTES: useCustomers + useState + useEffect + debounce + renderização (168 linhas)
 * DEPOIS: Container → Hook → Presentation (componentes especializados)
 *
 * @version 2.0.0 - Container/Presentational (Context7)
 */

import React from 'react';
import { CustomerProfile } from '@/features/customers/hooks/use-crm';
import { CustomerSearchContainer } from './CustomerSearchContainer';

export interface CustomerSearchProps {
  selectedCustomer: CustomerProfile | null;
  onSelect: (customer: CustomerProfile | null) => void;
  onAddNew?: () => void;
  variant?: 'default' | 'premium' | 'success' | 'warning' | 'error';
  glassEffect?: boolean;
  className?: string;
}

/**
 * CustomerSearch refatorado usando Container/Presentational pattern
 *
 * ARQUITETURA:
 * CustomerSearch (este arquivo)
 *   ↓
 * CustomerSearchContainer (gerencia estado e busca)
 *   ↓ useCustomerSearchData (hook especializado)
 *   ↓ useDebounce (debounce strategy)
 *   ↓ useCustomers (data fetching)
 *   ↓
 * CustomerSearchPresentation (apenas UI)
 */
export const CustomerSearch: React.FC<CustomerSearchProps> = (props) => {
  return <CustomerSearchContainer {...props} />;
};

// Export padrão para compatibilidade com imports existentes
export default CustomerSearch;

/**
 * BENEFÍCIOS DA REFATORAÇÃO:
 *
 * 1. 📦 SEPARAÇÃO DE RESPONSABILIDADES
 *    - Container: Search state + debounce + API calls
 *    - Presentation: Popover + Command + visual states
 *    - Hook: Customer fetching + real-time search
 *    - Utils: Debounce strategy isolada
 *
 * 2. 🧪 TESTABILIDADE MELHORADA
 *    - Hook pode ser testado com mock customers
 *    - Presentation pode ser testada com props estáticas
 *    - Search logic testável independentemente
 *    - Debounce strategy testável isoladamente
 *
 * 3. 🔄 REUTILIZAÇÃO
 *    - Hook pode ser usado em outros componentes de busca
 *    - Presentation pode receber dados de outras fontes
 *    - Search logic replicável para outros entities
 *    - Popover pattern reutilizável
 *
 * 4. 🚀 PERFORMANCE
 *    - Debounce otimizado e isolado
 *    - Re-renders mais granulares
 *    - Memoização mais efetiva
 *    - Query optimization centralizada
 *
 * 5. 🔧 MANUTENIBILIDADE
 *    - Mudanças de API não afetam UI
 *    - Mudanças de UI não afetam search logic
 *    - Debounce tuning centralizado
 *    - Search behavior isolado
 *    - Command pattern mantido na apresentação
 */