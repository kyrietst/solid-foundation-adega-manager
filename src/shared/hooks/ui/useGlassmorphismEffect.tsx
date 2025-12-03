/* eslint-disable react-refresh/only-export-components */
/**
 * useGlassmorphismEffect - Custom Hook for Glassmorphism Mouse Tracking
 * PERFORMANCE OPTIMIZED: Throttled + low-end device detection
 * Elimina duplicação de código identificada na análise (5x repetições)
 */

import { useCallback, useRef, useMemo } from 'react';
import { throttle, isLowEndDevice } from '@/core/utils/performance';

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
 * PERFORMANCE OPTIMIZED: Throttled (16ms) + low-end device detection
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

  // PERFORMANCE: Desabilitar em dispositivos low-end
  const isEnabled = enabled && !isLowEndDevice();

  const elementRef = useRef<HTMLElement>(null);

  // Raw handler (before throttling)
  const handleMouseMoveRaw = useCallback((e: React.MouseEvent<HTMLElement>) => {
    if (!isEnabled) return;

    // USE A REF EM VEZ DE e.currentTarget para maior segurança
    const target = elementRef.current || (e.currentTarget as HTMLElement);

    // GUARDA DE SEGURANÇA: Se o alvo sumiu, pare.
    if (!target) return;

    const rect = target.getBoundingClientRect();

    // Cálculo das coordenadas relativas
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    // Aplicar propriedades CSS customizadas
    target.style.setProperty(customProperties.x || '--x', `${x}%`);
    target.style.setProperty(customProperties.y || '--y', `${y}%`);
  }, [isEnabled, customProperties.x, customProperties.y]);

  // PERFORMANCE: Throttle para 16ms (60 FPS máximo)
  // Reduz de 60+ calls/sec para max 16 calls/sec
  const handleMouseMove = useMemo(
    () => throttle(handleMouseMoveRaw, 16),
    [handleMouseMoveRaw]
  );

  // Context7 Pattern: Ref callback para uso alternativo
  const ref = useCallback((element: HTMLElement | null) => {
    if (elementRef.current) {
      elementRef.current.removeEventListener('mousemove', handleMouseMove as unknown as EventListener);
    }

    elementRef.current = element;

    if (element && isEnabled) {
      element.addEventListener('mousemove', handleMouseMove as unknown as EventListener);
    }
  }, [handleMouseMove, isEnabled]);

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