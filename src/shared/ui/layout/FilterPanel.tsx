/**
 * FilterPanel - Componente base para painéis de filtros
 * Painel genérico e reutilizável para filtros de dados
 */

import React from 'react';
import { cn } from '@/core/config/utils';
import { Button } from '@/shared/ui/primitives/button';
import { Badge } from '@/shared/ui/primitives/badge';
import { Separator } from '@/shared/ui/primitives/separator';
import { X, RotateCcw } from 'lucide-react';

export interface FilterGroup {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export interface ActiveFilter {
  id: string;
  label: string;
  value: string;
  onRemove: () => void;
}

export interface FilterPanelProps {
  children?: React.ReactNode;
  groups?: FilterGroup[];
  activeFilters?: ActiveFilter[];
  onClearAll?: () => void;
  onApply?: () => void;
  onReset?: () => void;
  
  // Layout
  variant?: 'card' | 'inline' | 'sidebar';
  collapsible?: boolean;
  defaultExpanded?: boolean;
  
  // Actions
  showApplyButton?: boolean;
  showResetButton?: boolean;
  showClearAllButton?: boolean;
  applyLabel?: string;
  resetLabel?: string;
  clearAllLabel?: string;
  
  // Styling
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  footerClassName?: string;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  children,
  groups = [],
  activeFilters = [],
  onClearAll,
  onApply,
  onReset,
  variant = 'card',
  collapsible = false,
  defaultExpanded = true,
  showApplyButton = false,
  showResetButton = true,
  showClearAllButton = true,
  applyLabel = 'Aplicar Filtros',
  resetLabel = 'Limpar',
  clearAllLabel = 'Limpar Todos',
  className,
  headerClassName,
  contentClassName,
  footerClassName
}) => {
  const [isExpanded, setIsExpanded] = React.useState(defaultExpanded);
  
  const hasActiveFilters = activeFilters.length > 0;
  const hasActions = showApplyButton || showResetButton || showClearAllButton;

  const containerClasses = cn(
    // Base styles
    'space-y-4',
    
    // Variant styles
    {
      'bg-card border border-border rounded-lg p-4 shadow-sm': variant === 'card',
      'bg-muted/50 rounded-lg p-4': variant === 'inline',
      'border-r border-border p-4 bg-background': variant === 'sidebar'
    },
    
    className
  );

  const toggleExpanded = () => {
    if (collapsible) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div className={containerClasses}>
      {/* Header com filtros ativos */}
      {hasActiveFilters && (
        <div className={cn('space-y-3', headerClassName)}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Filtros Ativos ({activeFilters.length})
            </span>
            {showClearAllButton && onClearAll && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearAll}
                className="h-7 px-2 text-xs"
              >
                {clearAllLabel}
              </Button>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2">
            {activeFilters.map((filter) => (
              <Badge
                key={filter.id}
                variant="secondary"
                className="px-2 py-1 text-xs flex items-center gap-1"
              >
                <span className="font-medium">{filter.label}:</span>
                <span>{filter.value}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-3 w-3 p-0 hover:bg-destructive/20"
                  onClick={filter.onRemove}
                >
                  <X className="h-2 w-2" />
                </Button>
              </Badge>
            ))}
          </div>
          
          <Separator />
        </div>
      )}

      {/* Conteúdo dos filtros */}
      {(isExpanded || !collapsible) && (
        <div className={cn('space-y-4', contentClassName)}>
          {/* Children diretos */}
          {children}
          
          {/* Grupos de filtros */}
          {groups.map((group, index) => (
            <div key={index} className={cn('space-y-2', group.className)}>
              <h4 className="text-sm font-medium text-foreground">
                {group.title}
              </h4>
              <div className="pl-2">
                {group.children}
              </div>
              {index < groups.length - 1 && <Separator />}
            </div>
          ))}
        </div>
      )}

      {/* Footer com ações */}
      {hasActions && (isExpanded || !collapsible) && (
        <>
          <Separator />
          <div className={cn(
            'flex flex-col sm:flex-row gap-2 pt-2',
            footerClassName
          )}>
            {showResetButton && onReset && (
              <Button
                variant="outline"
                size="sm"
                onClick={onReset}
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-3 w-3" />
                {resetLabel}
              </Button>
            )}
            
            {showApplyButton && onApply && (
              <Button
                size="sm"
                onClick={onApply}
                className="flex-1 sm:flex-initial"
              >
                {applyLabel}
              </Button>
            )}
          </div>
        </>
      )}

      {/* Toggle button para versão collapsible */}
      {collapsible && (
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleExpanded}
          className="w-full justify-center"
        >
          {isExpanded ? 'Ocultar Filtros' : 'Mostrar Filtros'}
        </Button>
      )}
    </div>
  );
};