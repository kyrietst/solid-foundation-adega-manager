/**
 * Componente IconButton padronizado para acessibilidade
 * Garante que todos os botões com ícones tenham aria-label apropriado
 */

import React from 'react';
import { Button, ButtonProps } from './button';
import { cn } from '@/core/config/utils';

interface IconButtonProps extends Omit<ButtonProps, 'aria-label'> {
  /** Descrição acessível obrigatória para o botão */
  'aria-label': string;
  /** Ícone do botão - deve ser um componente React */
  icon: React.ComponentType<{ className?: string }>;
  /** Classes CSS para o ícone */
  iconClassName?: string;
  /** Tamanho do ícone baseado no tamanho do botão */
  iconSize?: 'sm' | 'md' | 'lg';
}

const getIconSize = (size?: string, iconSize?: 'sm' | 'md' | 'lg') => {
  if (iconSize) {
    return {
      sm: 'h-3 w-3',
      md: 'h-4 w-4', 
      lg: 'h-5 w-5'
    }[iconSize];
  }

  // Auto-size baseado no tamanho do botão
  switch (size) {
    case 'sm':
      return 'h-3 w-3';
    case 'lg':
      return 'h-5 w-5';
    default:
      return 'h-4 w-4';
  }
};

export const IconButton: React.FC<IconButtonProps> = ({
  'aria-label': ariaLabel,
  icon: Icon,
  iconClassName,
  iconSize,
  size,
  className,
  children,
  ...props
}) => {
  const iconSizeClass = getIconSize(size, iconSize);

  return (
    <Button
      aria-label={ariaLabel}
      size={size}
      className={className}
      {...props}
    >
      <Icon 
        className={cn(iconSizeClass, iconClassName)} 
        aria-hidden="true" 
      />
      {children}
    </Button>
  );
};

/**
 * Variante específica para botões apenas com ícone
 */
export const IconOnlyButton: React.FC<IconButtonProps> = ({
  className,
  size = 'sm',
  ...props
}) => {
  return (
    <IconButton
      size={size}
      className={cn('h-8 w-8 p-0', className)}
      {...props}
    />
  );
};

export default IconButton;