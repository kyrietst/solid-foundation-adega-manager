import React from 'react';
import { Button } from '@/shared/ui/primitives/button';
import { Badge } from '@/shared/ui/primitives/badge';
import { Filter, ChevronDown } from 'lucide-react';
import { cn } from '@/core/config/utils';

export interface FilterToggleProps {
  isOpen: boolean;
  onToggle: () => void;
  label?: string;
  activeCount?: number;
  disabled?: boolean;
  variant?: 'outline' | 'ghost' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showChevron?: boolean;
  showFilterIcon?: boolean;
}

export const FilterToggle: React.FC<FilterToggleProps> = ({
  isOpen,
  onToggle,
  label = 'Filtros',
  activeCount,
  disabled = false,
  variant = 'outline',
  size = 'sm',
  className,
  showChevron = true,
  showFilterIcon = true
}) => {
  return (
    <div className="flex items-center space-x-2">
      <Button
        variant={variant}
        size={size}
        onClick={onToggle}
        disabled={disabled}
        className={cn(
          'flex items-center space-x-2',
          isOpen && 'bg-muted',
          className
        )}
      >
        {showFilterIcon && <Filter className="h-4 w-4" />}
        <span>{label}</span>
        {showChevron && (
          <ChevronDown 
            className={cn(
              'h-4 w-4 transition-transform duration-200',
              isOpen ? 'rotate-180' : 'rotate-0'
            )} 
          />
        )}
      </Button>
      
      {activeCount !== undefined && activeCount > 0 && (
        <Badge 
          variant="secondary" 
          className="bg-primary/10 text-primary border-primary/20"
        >
          {activeCount}
        </Badge>
      )}
    </div>
  );
};

// Componente wrapper para filtros com collapsible
export interface FilterSectionProps {
  isOpen: boolean;
  onToggle: () => void;
  label?: string;
  activeCount?: number;
  children: React.ReactNode;
  className?: string;
}

export const FilterSection: React.FC<FilterSectionProps> = ({
  isOpen,
  onToggle,
  label,
  activeCount,
  children,
  className
}) => {
  return (
    <div className={cn('space-y-4', className)}>
      <FilterToggle
        isOpen={isOpen}
        onToggle={onToggle}
        label={label}
        activeCount={activeCount}
      />
      
      {isOpen && (
        <div className="space-y-3 p-4 border rounded-lg bg-card">
          {children}
        </div>
      )}
    </div>
  );
};