import React from 'react';
import { cn } from '@/core/config/utils';

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'white' | 'gold';
  className?: string;
  text?: string;
}

const sizeStyles = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-3', 
  lg: 'h-12 w-12 border-4',
  xl: 'h-16 w-16 border-4'
};

const colorStyles = {
  primary: 'border-primary/30 border-t-primary',
  secondary: 'border-secondary/30 border-t-secondary',
  white: 'border-white/30 border-t-white',
  gold: 'border-adega-gold/30 border-t-adega-gold'
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'primary',
  className,
  text
}) => {
  const spinnerClasses = cn(
    'animate-spin rounded-full',
    sizeStyles[size],
    colorStyles[color],
    className
  );

  if (text) {
    return (
      <div className="flex flex-col items-center justify-center space-y-2">
        <div className={spinnerClasses} />
        <p className="text-sm text-muted-foreground">{text}</p>
      </div>
    );
  }

  return <div className={spinnerClasses} />;
};

// Componente de loading para tela inteira
export const LoadingScreen: React.FC<{
  text?: string;
  size?: LoadingSpinnerProps['size'];
}> = ({ text = 'Carregando...', size = 'lg' }) => {
  return (
    <div className="flex items-center justify-center h-64">
      <LoadingSpinner size={size} color="primary" text={text} />
    </div>
  );
};