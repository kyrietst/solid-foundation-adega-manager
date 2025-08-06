/**
 * Componente de imagem otimizada com lazy loading, states e fallbacks
 * Melhora performance significativamente com muitas imagens
 */

import React, { useState, useCallback } from 'react';
import { cn } from '@/core/config/utils';

export type ImageState = 'loading' | 'loaded' | 'error';

export interface OptimizedImageProps {
  /** URL da imagem */
  src?: string | null;
  /** Texto alternativo */
  alt: string;
  /** Classes CSS adicionais */
  className?: string;
  /** Componente ou elemento de fallback quando não há imagem ou erro */
  fallback?: React.ReactNode;
  /** Componente de loading personalizado */
  loadingComponent?: React.ReactNode;
  /** Se deve usar lazy loading (padrão: true) */
  lazy?: boolean;
  /** Callback quando imagem carrega com sucesso */
  onLoad?: () => void;
  /** Callback quando há erro no carregamento */
  onError?: () => void;
  /** Callback quando estado muda */
  onStateChange?: (state: ImageState) => void;
  /** Classes para o container */
  containerClassName?: string;
  /** Style inline para a imagem */
  style?: React.CSSProperties;
}

/**
 * Componente de imagem otimizada com loading states e lazy loading
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className,
  fallback,
  loadingComponent,
  lazy = true,
  onLoad,
  onError,
  onStateChange,
  containerClassName,
  style,
}) => {
  const [imageState, setImageState] = useState<ImageState>('loading');

  const handleLoad = useCallback(() => {
    setImageState('loaded');
    onLoad?.();
    onStateChange?.('loaded');
  }, [onLoad, onStateChange]);

  const handleError = useCallback(() => {
    setImageState('error');
    onError?.();
    onStateChange?.('error');
  }, [onError, onStateChange]);

  // Se não há src, mostrar fallback imediatamente
  if (!src) {
    return (
      <div className={cn('flex items-center justify-center', containerClassName)}>
        {fallback || <DefaultFallback />}
      </div>
    );
  }

  return (
    <div className={cn('relative overflow-hidden', containerClassName)}>
      {/* Loading state */}
      {imageState === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center">
          {loadingComponent || <DefaultLoading />}
        </div>
      )}

      {/* Imagem principal */}
      <img
        src={src}
        alt={alt}
        className={cn(
          'transition-opacity duration-300',
          imageState === 'loaded' ? 'opacity-100' : 'opacity-0',
          className
        )}
        loading={lazy ? 'lazy' : 'eager'}
        onLoad={handleLoad}
        onError={handleError}
        style={style}
        decoding="async"
      />

      {/* Error state */}
      {imageState === 'error' && (
        <div className="absolute inset-0 flex items-center justify-center">
          {fallback || <DefaultFallback />}
        </div>
      )}
    </div>
  );
};

/**
 * Loading padrão com skeleton animado
 */
const DefaultLoading: React.FC = () => (
  <div className="animate-pulse bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 bg-[length:200%_100%] animate-shimmer w-full h-full rounded" />
);

/**
 * Fallback padrão para imagens quebradas ou ausentes
 */
const DefaultFallback: React.FC = () => (
  <div className="flex flex-col items-center justify-center text-gray-400 p-4">
    <svg
      className="w-8 h-8 mb-2"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
    <span className="text-xs">Sem imagem</span>
  </div>
);

/**
 * Hook para controlar estado de imagem externamente
 */
export const useImageState = () => {
  const [state, setState] = useState<ImageState>('loading');

  const handleStateChange = useCallback((newState: ImageState) => {
    setState(newState);
  }, []);

  return {
    state,
    handleStateChange,
    isLoading: state === 'loading',
    isLoaded: state === 'loaded',
    hasError: state === 'error'
  };
};

/**
 * Versões pré-configuradas para diferentes casos de uso
 */

/**
 * Imagem otimizada para cards de produto
 */
export const ProductImage: React.FC<Omit<OptimizedImageProps, 'fallback'>> = (props) => (
  <OptimizedImage
    {...props}
    containerClassName={cn('aspect-square bg-gray-100', props.containerClassName)}
    fallback={
      <div className="flex flex-col items-center justify-center text-gray-500">
        <svg className="w-12 h-12 mb-2" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
        </svg>
        <span className="text-xs">Produto</span>
      </div>
    }
  />
);

/**
 * Avatar otimizado para clientes
 */
export const CustomerAvatar: React.FC<Omit<OptimizedImageProps, 'fallback'>> = (props) => (
  <OptimizedImage
    {...props}
    containerClassName={cn('w-10 h-10 rounded-full bg-gray-100', props.containerClassName)}
    fallback={
      <div className="w-full h-full rounded-full bg-gradient-to-br from-adega-gold to-adega-amber flex items-center justify-center">
        <span className="text-white font-semibold text-sm">
          {props.alt?.charAt(0).toUpperCase() || '?'}
        </span>
      </div>
    }
  />
);