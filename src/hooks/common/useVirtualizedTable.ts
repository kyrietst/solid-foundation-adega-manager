/**
 * Hook genérico para virtualização de tabelas
 * Pode ser usado em qualquer tabela do sistema para otimizar performance
 */

import { useRef, useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

export interface VirtualizedTableConfig {
  /** Altura estimada de cada linha em pixels */
  estimateSize?: number;
  /** Altura do container da tabela */
  containerHeight?: number;
  /** Número de itens extras para renderizar fora da viewport */
  overscan?: number;
  /** Se deve usar altura dinâmica para itens variáveis */
  dynamicSizing?: boolean;
}

export interface VirtualizedTableReturn<T> {
  /** Ref para o container scrollável */
  parentRef: React.RefObject<HTMLDivElement>;
  /** Instância do virtualizador */
  virtualizer: ReturnType<typeof useVirtualizer>;
  /** Itens virtuais visíveis */
  virtualItems: ReturnType<typeof useVirtualizer>['getVirtualItems'];
  /** Altura total do container virtual */
  totalSize: number;
}

/**
 * Hook para virtualização de tabelas com performance otimizada
 * @param items Array de itens para virtualizar
 * @param config Configurações de virtualização
 */
export function useVirtualizedTable<T>(
  items: T[],
  config: VirtualizedTableConfig = {}
): VirtualizedTableReturn<T> {
  const {
    estimateSize = 60,
    containerHeight = 400,
    overscan = 5,
    dynamicSizing = false
  } = config;

  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
    overscan,
    // Habilitar dimensionamento dinâmico se solicitado
    ...(dynamicSizing && {
      measureElement: (element) => element?.getBoundingClientRect().height ?? estimateSize
    })
  });

  const virtualItems = useMemo(() => virtualizer.getVirtualItems(), [virtualizer]);
  const totalSize = virtualizer.getTotalSize();

  return {
    parentRef,
    virtualizer,
    virtualItems,
    totalSize
  };
}

/**
 * Hook especializado para tabelas de clientes
 */
export function useVirtualizedCustomerTable<T>(items: T[]) {
  return useVirtualizedTable(items, {
    estimateSize: 70, // Altura maior para cards de cliente
    containerHeight: 500,
    overscan: 3,
    dynamicSizing: true // Clientes podem ter informações variáveis
  });
}

/**
 * Hook especializado para tabelas de produtos
 */
export function useVirtualizedProductTable<T>(items: T[]) {
  return useVirtualizedTable(items, {
    estimateSize: 60, // Altura padrão para produtos
    containerHeight: 400,
    overscan: 5,
    dynamicSizing: false // Produtos têm altura mais consistente
  });
}

/**
 * Hook especializado para listas de movimentações
 */
export function useVirtualizedMovementTable<T>(items: T[]) {
  return useVirtualizedTable(items, {
    estimateSize: 50, // Altura menor para movimentações
    containerHeight: 350,
    overscan: 8, // Mais itens para scroll suave
    dynamicSizing: false
  });
}