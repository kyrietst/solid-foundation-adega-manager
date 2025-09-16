/**
 * VirtualizedList.tsx - Lista virtualizada para performance (IMPLEMENTADO)
 * Context7 Pattern: Renderização eficiente de listas grandes
 * Implementa react-window para renderizar apenas items visíveis
 *
 * IMPLEMENTAÇÃO BASEADA NA ANÁLISE:
 * - Virtualização automática para listas 100+ items
 * - Suporte a infinite scroll
 * - Loading states otimizados
 * - Row height dinâmico
 * - Performance monitoring integrado
 *
 * @version 1.0.0 - Virtualized List Implementation (Context7)
 */

import React, { useCallback, useMemo, forwardRef } from 'react';
import { FixedSizeList as List, VariableSizeList } from 'react-window';
import { cn } from '@/core/config/utils';
import { LoadingSpinner } from '@/shared/ui/composite/LoadingSpinner';

interface VirtualizedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number, style: React.CSSProperties) => React.ReactNode;
  keyExtractor: (item: T, index: number) => string;
  height: number;
  itemSize?: number | ((index: number) => number);
  className?: string;
  onLoadMore?: () => void;
  hasNextPage?: boolean;
  isLoading?: boolean;
  LoadingComponent?: React.ComponentType;
  EmptyComponent?: React.ComponentType;
  enablePerformanceMonitoring?: boolean;
  overscan?: number;
}

// ✅ Context7 Pattern: Componente Row memoizado para performance
const Row = React.memo<{
  index: number;
  style: React.CSSProperties;
  data: {
    items: any[];
    renderItem: (item: any, index: number, style: React.CSSProperties) => React.ReactNode;
    keyExtractor: (item: any, index: number) => string;
    onLoadMore?: () => void;
    hasNextPage?: boolean;
    isLoading?: boolean;
    LoadingComponent?: React.ComponentType;
  };
}>(({ index, style, data }) => {
  const { items, renderItem, keyExtractor, onLoadMore, hasNextPage, isLoading, LoadingComponent } = data;

  // Trigger load more when approaching end
  if (index >= items.length - 5 && hasNextPage && onLoadMore && !isLoading) {
    onLoadMore();
  }

  // Show loading item at the end
  if (index >= items.length) {
    if (hasNextPage && LoadingComponent) {
      return (
        <div style={style}>
          <LoadingComponent />
        </div>
      );
    }
    return null;
  }

  const item = items[index];
  if (!item) return null;

  return (
    <div style={style} key={keyExtractor(item, index)}>
      {renderItem(item, index, style)}
    </div>
  );
});

Row.displayName = 'VirtualizedListRow';

/**
 * Lista virtualizada de tamanho fixo - para items com altura uniforme
 */
export const VirtualizedList = <T,>({
  items,
  renderItem,
  keyExtractor,
  height,
  itemSize = 60,
  className,
  onLoadMore,
  hasNextPage = false,
  isLoading = false,
  LoadingComponent = LoadingSpinner,
  EmptyComponent,
  enablePerformanceMonitoring = false,
  overscan = 5
}: VirtualizedListProps<T>) => {
  // ✅ Context7 Pattern: Memoizar data para evitar re-criação
  const listData = useMemo(() => ({
    items,
    renderItem,
    keyExtractor,
    onLoadMore,
    hasNextPage,
    isLoading,
    LoadingComponent
  }), [items, renderItem, keyExtractor, onLoadMore, hasNextPage, isLoading, LoadingComponent]);

  // Calcular número total de items (incluindo loading)
  const itemCount = items.length + (hasNextPage ? 1 : 0);

  // ✅ Context7 Pattern: Performance monitoring se habilitado
  const handleItemsRendered = useCallback(({ visibleStartIndex, visibleStopIndex }: any) => {
    if (enablePerformanceMonitoring) {
      console.log(`📊 [VirtualizedList] Rendered items: ${visibleStartIndex} - ${visibleStopIndex} of ${items.length}`);
    }
  }, [items.length, enablePerformanceMonitoring]);

  // Empty state
  if (items.length === 0 && !isLoading) {
    return EmptyComponent ? <EmptyComponent /> : (
      <div className="flex items-center justify-center h-32 text-gray-500">
        Nenhum item encontrado
      </div>
    );
  }

  return (
    <div className={cn("virtualized-list", className)}>
      <List
        height={height}
        itemCount={itemCount}
        itemSize={typeof itemSize === 'number' ? itemSize : 60}
        itemData={listData}
        onItemsRendered={handleItemsRendered}
        overscanCount={overscan}
      >
        {Row}
      </List>
    </div>
  );
};

/**
 * Lista virtualizada de tamanho variável - para items com altura dinâmica
 */
export const VariableSizeVirtualizedList = <T,>({
  items,
  renderItem,
  keyExtractor,
  height,
  itemSize,
  className,
  onLoadMore,
  hasNextPage = false,
  isLoading = false,
  LoadingComponent = LoadingSpinner,
  EmptyComponent,
  enablePerformanceMonitoring = false,
  overscan = 5
}: VirtualizedListProps<T>) => {
  const listData = useMemo(() => ({
    items,
    renderItem,
    keyExtractor,
    onLoadMore,
    hasNextPage,
    isLoading,
    LoadingComponent
  }), [items, renderItem, keyExtractor, onLoadMore, hasNextPage, isLoading, LoadingComponent]);

  const itemCount = items.length + (hasNextPage ? 1 : 0);

  const getItemSize = useCallback((index: number) => {
    if (typeof itemSize === 'function') {
      return itemSize(index);
    }
    return typeof itemSize === 'number' ? itemSize : 60;
  }, [itemSize]);

  const handleItemsRendered = useCallback(({ visibleStartIndex, visibleStopIndex }: any) => {
    if (enablePerformanceMonitoring) {
      console.log(`📊 [VariableVirtualizedList] Rendered items: ${visibleStartIndex} - ${visibleStopIndex} of ${items.length}`);
    }
  }, [items.length, enablePerformanceMonitoring]);

  if (items.length === 0 && !isLoading) {
    return EmptyComponent ? <EmptyComponent /> : (
      <div className="flex items-center justify-center h-32 text-gray-500">
        Nenhum item encontrado
      </div>
    );
  }

  return (
    <div className={cn("variable-virtualized-list", className)}>
      <VariableSizeList
        height={height}
        itemCount={itemCount}
        itemSize={getItemSize}
        itemData={listData}
        onItemsRendered={handleItemsRendered}
        overscanCount={overscan}
      >
        {Row}
      </VariableSizeList>
    </div>
  );
};

/**
 * Hook para calcular tamanho ótimo de item baseado no conteúdo
 */
export const useOptimalItemSize = (items: any[], baseHeight: number = 60) => {
  return useMemo(() => {
    if (!items || items.length === 0) return baseHeight;

    // Calcular altura baseada no conteúdo
    // Para demonstração, usamos uma lógica simples
    const sampleItem = items[0];
    if (!sampleItem) return baseHeight;

    // Calcular baseado em número de linhas de texto estimadas
    const estimatedLines = Object.values(sampleItem).reduce((lines, value) => {
      if (typeof value === 'string' && value.length > 50) {
        return lines + Math.ceil(value.length / 50);
      }
      return lines + 1;
    }, 0);

    return Math.max(baseHeight, estimatedLines * 20 + 20); // 20px por linha + padding
  }, [items, baseHeight]);
};

/**
 * Componente wrapper para facilitar migração de listas existentes
 */
export const OptimizedTable = <T,>({
  data,
  renderRow,
  keyExtractor,
  height = 400,
  rowHeight = 60,
  className,
  enableVirtualization = true,
  virtualizationThreshold = 50,
  ...props
}: {
  data: T[];
  renderRow: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T, index: number) => string;
  height?: number;
  rowHeight?: number;
  className?: string;
  enableVirtualization?: boolean;
  virtualizationThreshold?: number;
} & Omit<VirtualizedListProps<T>, 'items' | 'renderItem' | 'keyExtractor' | 'height' | 'itemSize'>) => {

  const shouldVirtualize = enableVirtualization && data.length > virtualizationThreshold;

  const renderItem = useCallback((item: T, index: number, style: React.CSSProperties) => {
    return (
      <div style={style}>
        {renderRow(item, index)}
      </div>
    );
  }, [renderRow]);

  if (!shouldVirtualize) {
    // Renderização normal para listas pequenas
    return (
      <div className={className}>
        {data.map((item, index) => (
          <div key={keyExtractor(item, index)}>
            {renderRow(item, index)}
          </div>
        ))}
      </div>
    );
  }

  return (
    <VirtualizedList
      items={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      height={height}
      itemSize={rowHeight}
      className={className}
      enablePerformanceMonitoring={process.env.NODE_ENV === 'development'}
      {...props}
    />
  );
};

export default VirtualizedList;