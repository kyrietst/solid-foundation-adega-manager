/**
 * Utilitários de Theme - Versão otimizada com apenas funções utilizadas
 * Sistema baseado na análise de padrões existentes no Adega Manager
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Função de merge de classes otimizada
 * USADO EM: stat-card.tsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ============================================================================
// VALUE CLASSES (único sistema usado atualmente)
// ============================================================================

/**
 * Gerador de classes para valores numéricos/texto com variantes
 * USADO EM: stat-card.tsx
 */
export function getValueClasses(size: 'sm' | 'md' | 'lg' = 'md', variant: 'default' | 'success' | 'warning' | 'error' | 'purple' | 'gold' = 'default') {
  const sizeClasses = {
    sm: 'text-lg font-semibold',
    md: 'text-xl font-bold',
    lg: 'text-2xl font-bold'
  };
  
  const variantClasses = {
    default: 'text-gray-100',
    success: 'text-green-400',
    warning: 'text-adega-amber',
    error: 'text-red-400',
    purple: 'text-purple-400',
    gold: 'text-adega-gold'
  };
  
  return cn(sizeClasses[size], variantClasses[variant]);
}