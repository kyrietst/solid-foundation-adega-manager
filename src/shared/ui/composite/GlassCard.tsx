/**
 * @fileoverview GlassCard - Componente SSoT para Cards Premium Glassmorphism
 * Padroniza o visual glass morphism em todo o sistema
 *
 * @author Adega Manager Team
 * @version 1.0.0 - Design System Premium
 */

import React from 'react';
import { Card, CardContent } from '@/shared/ui/primitives/card';
import { cn } from '@/core/config/utils';

export interface GlassCardProps {
  /** Variante de cor do card */
  variant?: 'default' | 'green' | 'amber' | 'purple' | 'blue' | 'premium';
  /** Habilita efeitos de hover (shadow + scale) */
  hover?: boolean;
  /** Adiciona efeito de glow no hover */
  glow?: boolean;
  /** Adiciona círculos decorativos nos cantos */
  decorative?: boolean;
  /** Classes CSS adicionais */
  className?: string;
  /** Conteúdo do card */
  children: React.ReactNode;
  /** Se true, renderiza sem padding interno (use CardContent manualmente) */
  noPadding?: boolean;
}

const variants = {
  default: {
    gradient: 'from-black/40 via-gray-900/30 to-black/40',
    border: 'border-white/10 hover:border-white/20',
    glow: 'hover:shadow-white/10',
    glowBg: 'from-white/5',
    decorative: 'bg-white/5',
  },
  green: {
    gradient: 'from-green-900/40 via-green-800/30 to-emerald-900/40',
    border: 'border-green-500/40 hover:border-green-400/60',
    glow: 'hover:shadow-green-500/30',
    glowBg: 'from-green-500/10',
    decorative: 'bg-green-500/10',
  },
  amber: {
    gradient: 'from-amber-900/40 via-yellow-800/30 to-orange-900/40',
    border: 'border-amber-500/40 hover:border-amber-400/60',
    glow: 'hover:shadow-amber-500/30',
    glowBg: 'from-amber-500/10',
    decorative: 'bg-amber-500/10',
  },
  purple: {
    gradient: 'from-purple-900/40 via-blue-800/30 to-indigo-900/40',
    border: 'border-purple-500/40 hover:border-purple-400/60',
    glow: 'hover:shadow-purple-500/30',
    glowBg: 'from-purple-500/10',
    decorative: 'bg-purple-500/10',
  },
  blue: {
    gradient: 'from-blue-900/40 via-blue-800/30 to-cyan-900/40',
    border: 'border-blue-500/40 hover:border-blue-400/60',
    glow: 'hover:shadow-blue-500/30',
    glowBg: 'from-blue-500/10',
    decorative: 'bg-blue-500/10',
  },
  premium: {
    gradient: 'from-yellow-900/40 via-amber-800/30 to-orange-900/40',
    border: 'border-yellow-500/40 hover:border-yellow-400/60',
    glow: 'hover:shadow-yellow-500/30',
    glowBg: 'from-yellow-500/10',
    decorative: 'bg-yellow-500/10',
  },
};

export const GlassCard: React.FC<GlassCardProps> = ({
  variant = 'default',
  hover = true,
  glow = false,
  decorative = false,
  className,
  children,
  noPadding = false,
}) => {
  const colors = variants[variant];

  return (
    <Card
      className={cn(
        // Base styles
        'bg-gradient-to-br backdrop-blur-md border-2 shadow-xl transition-all duration-500',
        colors.gradient,
        colors.border,

        // Hover effects
        hover && 'hover:shadow-2xl',
        hover && colors.glow,

        // Glow preparation
        glow && 'relative overflow-hidden group',

        className
      )}
    >
      {/* Background glow effect (only if glow is true) */}
      {glow && (
        <div
          className={cn(
            'absolute inset-0 bg-gradient-to-br via-transparent to-transparent',
            'opacity-0 group-hover:opacity-100 transition-opacity duration-500',
            colors.glowBg
          )}
        />
      )}

      {/* Content area */}
      {noPadding ? (
        <div className="relative z-10">{children}</div>
      ) : (
        <CardContent className="relative z-10">{children}</CardContent>
      )}

      {/* Decorative corner accents */}
      {decorative && (
        <>
          <div
            className={cn(
              'absolute top-0 right-0 w-20 h-20 rounded-bl-full opacity-30',
              colors.decorative
            )}
          />
          <div
            className={cn(
              'absolute bottom-0 left-0 w-16 h-16 rounded-tr-full opacity-20',
              colors.decorative
            )}
          />
        </>
      )}
    </Card>
  );
};

export default GlassCard;
