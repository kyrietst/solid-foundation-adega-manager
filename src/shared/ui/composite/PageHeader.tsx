/**
 * PageHeader - Componente padronizado para cabeçalhos de página
 *
 * Centraliza o design de headers com glassmorphism e gradiente padronizado
 * usando tokens do design system para manter consistência visual.
 */

import React from 'react';
import { BlurIn } from '@/shared/ui/effects/blur-in';
import { cn } from '@/core/config/utils';

export interface PageHeaderProps {
  /** Título principal da página */
  title: string;
  /** Descrição ou subtítulo opcional */
  description?: string;
  /** Valor para o contador (ex: número de itens) */
  count?: number;
  /** Label para o contador (ex: "produtos", "fornecedores") */
  countLabel?: string;
  /** Classes CSS adicionais para customização */
  className?: string;
  /** Componentes filhos adicionais (ex: botões de ação) */
  children?: React.ReactNode;
  /** Duração da animação de entrada (padrão: 1.2s) */
  animationDuration?: number;
  /** Alinhamento do texto - responsivo por padrão (centro no mobile, esquerda no desktop) */
  alignment?: 'left' | 'center' | 'responsive';
}

/**
 * Componente de cabeçalho padronizado com:
 * - Gradiente usando tokens do design system (accent-red → primary-yellow → accent-red)
 * - Glassmorphism com backdrop-blur
 * - Animação de entrada BlurIn
 * - Sublinhado elegante com múltiplas camadas
 * - Suporte para conteúdo adicional (botões, etc.)
 */
export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  count,
  countLabel,
  className,
  children,
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

            {/* Header Container sem glassmorphism para teste */}
            <div className={cn("relative w-full p-4", getAlignment())}>


              <div className="relative">
                {/* Título animado com gradiente padronizado */}
                <BlurIn
                  word={title}
                  duration={animationDuration}
                  variant={{
                    hidden: { filter: "blur(15px)", opacity: 0 },
                    visible: { filter: "blur(0px)", opacity: 1 }
                  }}
                  className="font-sf-black text-3xl leading-tight text-transparent bg-clip-text bg-gradient-to-r from-[#FF2400] via-[#FFDA04] to-[#FF2400] drop-shadow-lg"
                />

                {/* Descrição opcional */}
                {description && (
                  <p className="mt-2 text-sm text-gray-300/80 max-w-2xl">
                    {description}
                  </p>
                )}

                {/* Sublinhado elegante usando tokens do design system */}
                <div className="w-full h-6 relative mt-2">
                  <div className="absolute inset-x-0 top-0 bg-gradient-to-r from-transparent via-[#FF2400]/80 to-transparent h-[2px] w-full blur-sm" />
                  <div className="absolute inset-x-0 top-0 bg-gradient-to-r from-transparent via-[#FF2400] to-transparent h-px w-full" />
                  <div className="absolute inset-x-0 top-0 bg-gradient-to-r from-transparent via-[#FFDA04]/80 to-transparent h-[3px] w-3/4 blur-sm mx-auto" />
                  <div className="absolute inset-x-0 top-0 bg-gradient-to-r from-transparent via-[#FFDA04] to-transparent h-px w-3/4 mx-auto" />
                </div>
              </div>
            </div>

            {/* Conteúdo adicional (botões, etc.) */}
            {children && (
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                {children}
              </div>
            )}

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