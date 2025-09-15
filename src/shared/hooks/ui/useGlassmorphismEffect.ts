/**
 * useGlassmorphismEffect - Custom Hook for Glassmorphism Mouse Tracking
 * Elimina duplicação de código identificada na análise (5x repetições)
 * Segue padrões Context7 e Bulletproof React para reutilização
 */

import { useCallback, useRef } from 'react';

interface GlassmorphismOptions {
  /** Se deve aplicar o efeito */
  enabled?: boolean;
  /** Propriedades CSS customizadas para sobrescrever */
  customProperties?: {
    x?: string;
    y?: string;
  };
}

interface GlassmorphismReturn {
  /** Handler para aplicar ao onMouseMove */
  handleMouseMove: (e: React.MouseEvent<HTMLElement>) => void;
  /** Ref para anexar ao elemento (alternativa ao onMouseMove) */
  ref: React.RefObject<HTMLElement>;
}

/**
 * Hook para criar efeito glassmorphism com tracking do mouse
 * Elimina as 5x duplicações identificadas na análise de componentes
 *
 * @param options Configurações do efeito
 * @returns Handlers e ref para aplicar o efeito
 */
export const useGlassmorphismEffect = (
  options: GlassmorphismOptions = {}
): GlassmorphismReturn => {
  const {
    enabled = true,
    customProperties = { x: '--x', y: '--y' }
  } = options;

  const elementRef = useRef<HTMLElement>(null);

  // Context7 Pattern: useCallback para otimização de performance
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    if (!enabled) return;

    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();

    // Cálculo das coordenadas relativas (mesmo código das 5x duplicações)
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    // Aplicar propriedades CSS customizadas
    target.style.setProperty(customProperties.x || '--x', `${x}%`);
    target.style.setProperty(customProperties.y || '--y', `${y}%`);
  }, [enabled, customProperties.x, customProperties.y]);

  // Context7 Pattern: Ref callback para uso alternativo
  const ref = useCallback((element: HTMLElement | null) => {
    if (elementRef.current) {
      elementRef.current.removeEventListener('mousemove', handleMouseMove as EventListener);
    }

    elementRef.current = element;

    if (element && enabled) {
      element.addEventListener('mousemove', handleMouseMove as EventListener);
    }
  }, [handleMouseMove, enabled]);

  return {
    handleMouseMove,
    ref: elementRef
  };
};

/**
 * Hook simplificado para uso comum do glassmorphism
 * Versão mais simples para casos de uso padrão
 */
export const useGlassmorphism = () => {
  return useGlassmorphismEffect({ enabled: true });
};

/**
 * Componente wrapper reutilizável para glassmorphism
 * Context7 Pattern: Compound component pattern
 */
interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Se deve aplicar o efeito glassmorphism */
  enableGlass?: boolean;
  /** Classes CSS adicionais */
  className?: string;
  /** Conteúdo do card */
  children: React.ReactNode;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  enableGlass = true,
  className = '',
  children,
  ...props
}) => {
  const { handleMouseMove } = useGlassmorphismEffect({ enabled: enableGlass });

  return (
    <div
      className={`glassmorphism-card ${className}`}
      onMouseMove={handleMouseMove}
      {...props}
    >
      {children}
    </div>
  );
};

export default useGlassmorphismEffect;