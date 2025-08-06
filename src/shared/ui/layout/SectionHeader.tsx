/**
 * SectionHeader - Componente base para headers de seções
 * Padroniza título, descrição e ações de seções
 */

import React from 'react';
import { cn } from '@/core/config/utils';
import { Separator } from '@/shared/ui/primitives/separator';

export interface SectionHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  variant?: 'default' | 'compact' | 'prominent';
  showSeparator?: boolean;
  children?: React.ReactNode;
}

const variantStyles = {
  default: {
    container: 'py-4',
    title: 'text-xl font-semibold',
    description: 'text-sm text-muted-foreground'
  },
  compact: {
    container: 'py-2',
    title: 'text-lg font-medium',
    description: 'text-xs text-muted-foreground'
  },
  prominent: {
    container: 'py-6',
    title: 'text-2xl font-bold',
    description: 'text-base text-muted-foreground'
  }
};

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  description,
  actions,
  icon,
  className,
  variant = 'default',
  showSeparator = true,
  children
}) => {
  const styles = variantStyles[variant];

  return (
    <div className={cn(className)}>
      <div className={cn(
        'flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4',
        styles.container
      )}>
        <div className="flex items-start gap-3 min-w-0 flex-1">
          {icon && (
            <div className="flex-shrink-0 mt-0.5">
              {icon}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h2 className={cn(styles.title, 'truncate')}>
              {title}
            </h2>
            {description && (
              <p className={cn(styles.description, 'mt-1')}>
                {description}
              </p>
            )}
            {children && (
              <div className="mt-3">
                {children}
              </div>
            )}
          </div>
        </div>
        
        {actions && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
      
      {showSeparator && (
        <Separator className="mt-2" />
      )}
    </div>
  );
};