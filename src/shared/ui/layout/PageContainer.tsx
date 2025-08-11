/**
 * PageContainer - Componente base para containers de página
 * Padroniza layout, espaçamento e responsive behavior
 */

import React from 'react';
import { cn } from '@/core/config/utils';

export interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  spacing?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  background?: 'transparent' | 'card' | 'muted';
}

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md', 
  lg: 'max-w-4xl',
  xl: 'max-w-6xl',
  '2xl': 'max-w-7xl',
  full: 'max-w-full'
};

const paddingClasses = {
  none: '',
  sm: 'p-2',
  md: 'p-4',
  lg: 'p-6',
  xl: 'p-8'
};

const spacingClasses = {
  none: '',
  sm: 'space-y-2',
  md: 'space-y-4', 
  lg: 'space-y-6',
  xl: 'space-y-8'
};

const backgroundClasses = {
  transparent: '',
  card: 'bg-card border border-border rounded-lg shadow-sm',
  muted: 'bg-muted/50 rounded-lg'
};

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  className,
  title,
  subtitle,
  actions,
  maxWidth = 'full',
  padding = 'md',
  spacing = 'md',
  background = 'transparent'
}) => {
  return (
    <div
      className={cn(
        maxWidth === 'full'
          ? 'w-full'
          : 'w-full mx-auto container-xl container-viewport',
        maxWidthClasses[maxWidth],
        paddingClasses[padding],
        backgroundClasses[background],
        className
      )}
    >
      {/* Header Section */}
      {(title || subtitle || actions) && (
        <div className={cn(
          'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4',
          spacing !== 'none' && 'mb-6'
        )}>
          <div className="space-y-1">
            {title && (
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-muted-foreground">
                {subtitle}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-2">
              {actions}
            </div>
          )}
        </div>
      )}

      {/* Content Section */}
      <div className={cn(spacingClasses[spacing])}>
        {children}
      </div>
    </div>
  );
};