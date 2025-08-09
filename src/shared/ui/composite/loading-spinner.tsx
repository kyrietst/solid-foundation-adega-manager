import React from 'react';
import { cn, getLoadingSpinnerClasses } from '@/core/config/theme-utils';

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'default' | 'yellow' | 'white';
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
  default: 'border-gray-600/30 border-t-gray-400',
  yellow: 'border-primary-yellow/30 border-t-primary-yellow',
  white: 'border-white/30 border-t-white'
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'default',
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
        <p className="text-sm text-gray-400">{text}</p>
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
    <div className="flex items-center justify-center h-64 glass-subtle rounded-lg">
      <LoadingSpinner size={size} color="yellow" text={text} />
    </div>
  );
};