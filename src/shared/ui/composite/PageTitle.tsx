/**
 * @deprecated PageTitle - Este componente foi substituído por PageHeader
 *
 * DEPRECADO: Use PageHeader ao invés deste componente.
 * PageHeader oferece a mesma funcionalidade com design system padronizado,
 * incluindo glassmorphism e tokens de design consistentes.
 *
 * Este componente será removido em uma versão futura.
 *
 * Migração: PageTitle -> PageHeader
 * - Mantenha as mesmas props (title, count, countLabel)
 * - Remove a prop subtitle para design mais limpo
 * - PageHeader inclui glassmorphism automático
 */

import React from 'react';
import { BlurIn } from '@/shared/ui/effects/blur-in';
import { cn } from '@/core/config/utils';
import { getSFProTextClasses } from '@/core/config/theme-utils';

/** @deprecated Use PageHeader instead */
export interface PageTitleProps {
  /** Título principal da página */
  title: string;
  /** Subtítulo ou descrição opcional */
  subtitle?: string;
  /** Valor para o contador (ex: número de itens) */
  count?: number;
  /** Label para o contador (ex: "produtos", "fornecedores") */
  countLabel?: string;
  /** Classes CSS adicionais para customização */
  className?: string;
  /** Duração da animação de entrada (padrão: 1.2s) */
  animationDuration?: number;
  /** Alinhamento do texto - responsivo por padrão (centro no mobile, esquerda no desktop) */
  alignment?: 'left' | 'center' | 'responsive';
}

/**
 * @deprecated Use PageHeader instead
 *
 * Componente de título padronizado com:
 * - Gradiente red → yellow
 * - Animação BlurIn suave
 * - Sistema de sublinhado de 4 camadas com efeito blur
 * - Counter badge opcional com estilo consistente
 * - Alinhamento responsivo com opções flexíveis
 */
export const PageTitle: React.FC<PageTitleProps> = ({
  title,
  subtitle,
  count,
  countLabel,
  className,
  animationDuration = 1.2,
  alignment = 'responsive',
}) => {
  const getAlignment = () => {
    switch (alignment) {
      case 'left':
        return 'text-left';
      case 'center':
        return 'text-center';
      case 'responsive':
        return 'text-center sm:text-left';
      default:
        return 'text-center';
    }
  };

  return (
    <div className={cn("flex-shrink-0 pb-4", className)}>
      <div className="flex items-center justify-between gap-4">
        <div className="w-full sm:w-auto flex-shrink-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">

            {/* Header Content */}
            <div className={cn("w-full", getAlignment())}>
              {/* Título animado */}
              <BlurIn
                word={title}
                duration={animationDuration}
                variant={{
                  hidden: { filter: "blur(15px)", opacity: 0 },
                  visible: { filter: "blur(0px)", opacity: 1 }
                }}
                className={cn(
                  getSFProTextClasses('h1', 'accent'),
                  "text-transparent bg-clip-text bg-gradient-to-r from-gradient-fire-from to-gradient-fire-via drop-shadow-lg"
                )}
                style={{
                  textShadow: '0 2px 4px rgba(0,0,0,0.3), 0 0 20px rgba(255, 218, 4, 0.2)'
                }}
              />

              {/* Subtítulo opcional */}
              {subtitle && (
                <p className="mt-2 text-sm text-gray-300/80 max-w-2xl">
                  {subtitle}
                </p>
              )}

              {/* Sistema de sublinhado de 4 camadas usando tokens */}
              <div className="w-full h-2 relative mt-2">
                {/* Red blur layer (deco-line height, full width) */}
                <div className="absolute inset-x-0 top-0 bg-gradient-to-r from-transparent via-gradient-fire-from/80 to-transparent h-deco-line w-full blur-sm" />

                {/* Red solid layer (deco-thin height, full width) */}
                <div className="absolute inset-x-0 top-0 bg-gradient-to-r from-transparent via-gradient-fire-from to-transparent h-deco-thin w-full" />

                {/* Yellow blur layer (deco-border height, 3/4 width) */}
                <div className="absolute inset-x-0 top-0 bg-gradient-to-r from-transparent via-gradient-fire-via/80 to-transparent h-deco-border w-3/4 blur-sm mx-auto" />

                {/* Yellow solid layer (deco-thin height, 3/4 width) */}
                <div className="absolute inset-x-0 top-0 bg-gradient-to-r from-transparent via-gradient-fire-via to-transparent h-deco-thin w-3/4 mx-auto" />
              </div>
            </div>

            {/* Contador opcional */}
            {count !== undefined && countLabel && (
              <div className="bg-black/50 backdrop-blur-sm border border-yellow-400/30 rounded-full px-4 py-2 shadow-lg">
                <span className="text-sm font-bold text-gray-100">{count}</span>
                <span className="text-xs ml-1 opacity-75 text-gray-300">{countLabel}</span>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default PageTitle;