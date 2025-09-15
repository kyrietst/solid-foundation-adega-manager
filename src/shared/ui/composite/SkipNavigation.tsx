/**
 * SkipNavigation.tsx - Skip Links para Navegação Acessível (Context7 Pattern)
 * Componente para melhorar acessibilidade com navegação por teclado
 * Implementa WCAG 2.2 guidelines para bypass de blocos de conteúdo
 */

import React from 'react';
import { cn } from '@/core/config/utils';

interface SkipNavigationProps {
  className?: string;
}

/**
 * Componente SkipNavigation
 * Permite que usuários de leitores de tela e navegação por teclado
 * pulem diretamente para o conteúdo principal
 */
export const SkipNavigation: React.FC<SkipNavigationProps> = ({
  className
}) => {
  return (
    <div className={cn("fixed top-0 left-0 z-[9999]", className)}>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-md shadow-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
      >
        Pular para o conteúdo principal
      </a>
      <a
        href="#navigation"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-48 bg-blue-600 text-white px-4 py-2 rounded-md shadow-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
      >
        Ir para navegação
      </a>
      <a
        href="#search"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-80 bg-blue-600 text-white px-4 py-2 rounded-md shadow-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
      >
        Ir para pesquisa
      </a>
    </div>
  );
};

export default SkipNavigation;