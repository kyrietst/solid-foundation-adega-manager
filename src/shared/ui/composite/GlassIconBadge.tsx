/**
 * @fileoverview GlassIconBadge - Componente SSoT para Ícones com Glow Premium
 * Padroniza ícones animados com blur e pulse em todo o sistema
 *
 * @author Adega Manager Team
 * @version 1.0.0 - Design System Premium
 */

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/core/config/utils';

export interface GlassIconBadgeProps {
  /** Ícone do Lucide React */
  icon: LucideIcon;
  /** Variante de cor */
  variant: 'green' | 'amber' | 'purple' | 'blue' | 'yellow' | 'orange' | 'gray';
  /** Tamanho do badge */
  size?: 'sm' | 'md' | 'lg';
  /** Habilita animação de pulse no glow */
  animated?: boolean;
  /** Classes CSS adicionais */
  className?: string;
}

const variantConfig = {
  green: {
    icon: 'text-green-400',
    iconBg: 'bg-green-500/20 border-green-400/50',
    glow: 'bg-green-500/30',
  },
  amber: {
    icon: 'text-amber-400',
    iconBg: 'bg-amber-500/20 border-amber-400/50',
    glow: 'bg-amber-500/30',
  },
  purple: {
    icon: 'text-purple-400',
    iconBg: 'bg-purple-500/20 border-purple-400/50',
    glow: 'bg-purple-500/30',
  },
  blue: {
    icon: 'text-blue-400',
    iconBg: 'bg-blue-500/20 border-blue-400/50',
    glow: 'bg-blue-500/30',
  },
  yellow: {
    icon: 'text-yellow-400',
    iconBg: 'bg-yellow-500/20 border-yellow-400/50',
    glow: 'bg-yellow-500/30',
  },
  orange: {
    icon: 'text-orange-400',
    iconBg: 'bg-orange-500/20 border-orange-400/50',
    glow: 'bg-orange-500/30',
  },
  gray: {
    icon: 'text-gray-400',
    iconBg: 'bg-gray-500/20 border-gray-400/50',
    glow: 'bg-gray-500/30',
  },
};

const sizeConfig = {
  sm: {
    container: 'p-2',
    icon: 'h-4 w-4',
    rounded: 'rounded-lg',
  },
  md: {
    container: 'p-3',
    icon: 'h-6 w-6',
    rounded: 'rounded-xl',
  },
  lg: {
    container: 'p-4',
    icon: 'h-8 w-8',
    rounded: 'rounded-2xl',
  },
};

export const GlassIconBadge: React.FC<GlassIconBadgeProps> = ({
  icon: Icon,
  variant,
  size = 'md',
  animated = false,
  className,
}) => {
  const colors = variantConfig[variant];
  const sizes = sizeConfig[size];

  return (
    <div className={cn('relative flex-shrink-0', className)}>
      {/* Glow background */}
      <div
        className={cn(
          'absolute inset-0 rounded-full blur-lg',
          colors.glow,
          animated && 'animate-pulse'
        )}
      />

      {/* Icon container */}
      <div
        className={cn(
          'relative border-2 group-hover:scale-110 transition-transform duration-300',
          sizes.container,
          sizes.rounded,
          colors.iconBg
        )}
      >
        <Icon
          className={cn(
            sizes.icon,
            colors.icon,
            'drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]'
          )}
        />
      </div>
    </div>
  );
};

export default GlassIconBadge;
