/* eslint-disable react-hooks/exhaustive-deps */
/**
 * AdvancedFilterPanel - Enhanced Filter Panel with Context7 Patterns
 * Generic filter panel using useAdvancedFilters hook
 * Maintains compatibility with existing FilterPanel while adding advanced features
 */

import React, { useMemo } from 'react';
import { cn } from '@/core/config/utils';
import { Button } from '@/shared/ui/primitives/button';
import { Badge } from '@/shared/ui/primitives/badge';
import { Input } from '@/shared/ui/primitives/input';
import { Label } from '@/shared/ui/primitives/label';
import { Separator } from '@/shared/ui/primitives/separator';
import { Checkbox } from '@/shared/ui/primitives/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/primitives/select';
import { X, RotateCcw, Filter, ChevronDown } from 'lucide-react';
import {
  FilterConfig,
  FilterFunctions,
  FilterValue,
  useAdvancedFilters
} from '@/shared/hooks/common/useFilters';

// Context7 Pattern: Generic props interface
interface AdvancedFilterPanelProps<T> {
  data: T[];
  filterConfigs: FilterConfig[];
  onFilteredDataChange?: (filteredData: T[]) => void;

  // Layout options
  variant?: 'card' | 'inline' | 'sidebar' | 'collapsible';
  title?: string;

  // Persistence
  persistKey?: string;

  // Customization
  customFilterFn?: (item: T, filters: Record<string, FilterValue>) => boolean;

  // Styling
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  footerClassName?: string;

  // Labels
  clearAllLabel?: string;
  resetLabel?: string;
  showFiltersLabel?: string;
  hideFiltersLabel?: string;
}

// Context7 Pattern: Generic component
export const AdvancedFilterPanel = <T,>({
  data,
  filterConfigs,
  onFilteredDataChange,
  variant = 'card',
  title = 'Filtros',
  persistKey,
  customFilterFn,
  className,
  headerClassName,
  contentClassName,
  footerClassName,
  clearAllLabel = 'Limpar Todos',
  resetLabel = 'Restaurar Padrões',
  showFiltersLabel = 'Mostrar Filtros',
  hideFiltersLabel = 'Ocultar Filtros'
}: AdvancedFilterPanelProps<T>): React.ReactElement => {
  // Context7 Pattern: Use the advanced filters hook
  const filterFunctions: FilterFunctions<T> = useAdvancedFilters(data, filterConfigs, {
    persistKey,
    customFilterFn
  });

  const {
    setFilter,
    removeFilter,
    clearAll,
    resetToDefaults,
    hasActiveFilters,
    activeFilters,
    filteredData,
    filterCount,
    totalCount,
    filteredCount
  } = filterFunctions;

  // Context7 Pattern: Track collapsible state
  const [isExpanded, setIsExpanded] = React.useState(variant !== 'collapsible');

  // Context7 Pattern: Notify parent of filtered data changes
  React.useEffect(() => {
    if (onFilteredDataChange) {
      onFilteredDataChange(filteredData);
    }
  }, [filteredData, onFilteredDataChange]);

  // Context7 Pattern: Memoize container classes
  const containerClasses = useMemo(() => cn(
    'space-y-4',
    {
      'bg-card border border-border rounded-lg p-4 shadow-sm': variant === 'card',
      'bg-muted/50 rounded-lg p-4': variant === 'inline',
      'border-r border-border p-4 bg-background': variant === 'sidebar',
      'bg-card border border-border rounded-lg': variant === 'collapsible'
    },
    className
  ), [variant, className]);

  // Context7 Pattern: Render individual filter controls
  const renderFilterControl = useMemo(() => (config: FilterConfig) => {
    const value = filteredData.find(() => true); // Get current filter value

    switch (config.type) {
      case 'text':
        return (
          <div key={config.id} className="space-y-2">
            <Label htmlFor={config.id} className="text-sm font-medium">
              {config.label}
            </Label>
            <Input
              id={config.id}
              placeholder={config.placeholder}
              onChange={(e) => setFilter(config.id, e.target.value || undefined)}
              className="h-9"
            />
          </div>
        );

      case 'select':
        return (
          <div key={config.id} className="space-y-2">
            <Label className="text-sm font-medium">
              {config.label}
            </Label>
            <Select onValueChange={(value) => setFilter(config.id, value)}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder={config.placeholder || `Selecione ${config.label}`} />
              </SelectTrigger>
              <SelectContent>
                {config.options?.map((option) => (
                  <SelectItem key={String(option.value)} value={String(option.value)}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case 'boolean':
        return (
          <div key={config.id} className="flex items-center space-x-2">
            <Checkbox
              id={config.id}
              onCheckedChange={(checked) => setFilter(config.id, checked)}
            />
            <Label
              htmlFor={config.id}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {config.label}
            </Label>
          </div>
        );

      case 'number':
        return (
          <div key={config.id} className="space-y-2">
            <Label htmlFor={config.id} className="text-sm font-medium">
              {config.label}
            </Label>
            <Input
              id={config.id}
              type="number"
              placeholder={config.placeholder}
              onChange={(e) => setFilter(config.id, e.target.value ? Number(e.target.value) : undefined)}
              className="h-9"
            />
          </div>
        );

      default:
        return null;
    }
  }, [setFilter]);

  const toggleExpanded = () => {
    if (variant === 'collapsible') {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div className={containerClasses}>
      {/* Header - Always visible for collapsible variant */}
      {(variant === 'collapsible' || hasActiveFilters) && (
        <div className={cn('space-y-3', headerClassName)}>
          {variant === 'collapsible' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleExpanded}
              className="w-full justify-between p-3"
            >
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span className="font-medium">{title}</span>
                {filterCount > 0 && (
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                    {filterCount}
                  </Badge>
                )}
              </div>
              <ChevronDown
                className={cn(
                  'h-4 w-4 transition-transform duration-200',
                  isExpanded ? 'rotate-180' : 'rotate-0'
                )}
              />
            </Button>
          )}

          {hasActiveFilters && isExpanded && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  {filterCount} filtro{filterCount !== 1 ? 's' : ''} ativo{filterCount !== 1 ? 's' : ''}
                  {' '}({filteredCount} de {totalCount} itens)
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAll}
                  className="h-7 px-2 text-xs text-destructive hover:text-destructive"
                >
                  {clearAllLabel}
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {activeFilters.map((filter) => (
                  <Badge
                    key={filter.id}
                    variant="secondary"
                    className="px-2 py-1 text-xs flex items-center gap-1 bg-primary/10 border-primary/20 text-primary"
                  >
                    <span className="font-medium">{filter.label}:</span>
                    <span>{filter.displayValue}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-3 w-3 p-0 hover:bg-destructive/20 ml-1"
                      onClick={filter.onRemove}
                    >
                      <X className="h-2 w-2" />
                    </Button>
                  </Badge>
                ))}
              </div>

              <Separator />
            </>
          )}
        </div>
      )}

      {/* Filter Controls */}
      {isExpanded && (
        <>
          <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4', contentClassName)}>
            {filterConfigs.map(renderFilterControl)}
          </div>

          {/* Footer Actions */}
          <div className={cn('flex flex-col sm:flex-row gap-2', footerClassName)}>
            <Button
              variant="outline"
              size="sm"
              onClick={resetToDefaults}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-3 w-3" />
              {resetLabel}
            </Button>

            <div className="flex-1" />

            <div className="text-sm text-muted-foreground flex items-center gap-2">
              Exibindo {filteredCount} de {totalCount} itens
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Context7 Pattern: Memoized version for performance
export const MemoizedAdvancedFilterPanel = React.memo(AdvancedFilterPanel) as typeof AdvancedFilterPanel;

export default MemoizedAdvancedFilterPanel;