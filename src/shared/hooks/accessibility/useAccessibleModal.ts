/**
 * useAccessibleModal.ts - Hook para Modais Acessíveis (Context7 Pattern)
 * Implementa focus management, keyboard navigation e ARIA states
 * Compatível com WCAG 2.2 guidelines para modais
 */

import { useEffect, useRef, useCallback } from 'react';

interface UseAccessibleModalOptions {
  isOpen: boolean;
  onClose?: () => void;
  focusOnMount?: boolean;
  restoreFocusOnClose?: boolean;
  closeOnEscape?: boolean;
  preventScroll?: boolean;
}

interface UseAccessibleModalReturn {
  modalRef: React.RefObject<HTMLDivElement>;
  titleId: string;
  descriptionId: string;
}

/**
 * Hook para implementar acessibilidade completa em modais
 * Features:
 * - Focus trap (navegação por Tab contida no modal)
 * - Escape para fechar
 * - Restauração de foco
 * - Prevenção de scroll do body
 * - ARIA attributes automáticos
 */
export const useAccessibleModal = ({
  isOpen,
  onClose,
  focusOnMount = true,
  restoreFocusOnClose = true,
  closeOnEscape = true,
  preventScroll = true,
}: UseAccessibleModalOptions): UseAccessibleModalReturn => {
  const modalRef = useRef<HTMLDivElement>(null);
  const lastFocusedElement = useRef<HTMLElement | null>(null);

  // IDs únicos para ARIA
  const titleId = `modal-title-${Date.now()}`;
  const descriptionId = `modal-description-${Date.now()}`;

  // Função para obter elementos focáveis
  const getFocusableElements = useCallback((container: HTMLElement): HTMLElement[] => {
    const focusableSelectors = [
      'button:not([disabled])',
      '[href]:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"]):not([disabled])',
      '[contenteditable="true"]'
    ].join(', ');

    return Array.from(container.querySelectorAll<HTMLElement>(focusableSelectors))
      .filter(element => {
        // Verificar se o elemento está visível
        const style = window.getComputedStyle(element);
        return style.display !== 'none' &&
               style.visibility !== 'hidden' &&
               element.offsetParent !== null;
      });
  }, []);

  // Focus trap implementation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!modalRef.current) return;

    // Fechar modal com Escape
    if (e.key === 'Escape' && closeOnEscape && onClose) {
      onClose();
      return;
    }

    // Focus trap com Tab
    if (e.key === 'Tab') {
      const focusableElements = getFocusableElements(modalRef.current);

      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement as HTMLElement;

      if (e.shiftKey) {
        // Shift + Tab (navegação reversa)
        if (activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        // Tab (navegação normal)
        if (activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    }
  }, [closeOnEscape, onClose, getFocusableElements]);

  // Efeito principal de setup do modal
  useEffect(() => {
    if (isOpen) {
      // Salvar elemento atualmente focado
      if (restoreFocusOnClose) {
        lastFocusedElement.current = document.activeElement as HTMLElement;
      }

      // Prevenir scroll do body
      if (preventScroll) {
        document.body.style.overflow = 'hidden';
      }

      // Focar primeiro elemento focável
      if (focusOnMount && modalRef.current) {
        const focusableElements = getFocusableElements(modalRef.current);
        if (focusableElements.length > 0) {
          focusableElements[0].focus();
        } else {
          // Se não há elementos focáveis, focar o próprio modal
          modalRef.current.focus();
        }
      }

      // Adicionar event listener para keyboard
      document.addEventListener('keydown', handleKeyDown);

      // Cleanup function
      return () => {
        document.removeEventListener('keydown', handleKeyDown);

        // Restaurar scroll do body
        if (preventScroll) {
          document.body.style.overflow = '';
        }

        // Restaurar foco
        if (restoreFocusOnClose && lastFocusedElement.current) {
          // Pequeno delay para garantir que o modal foi removido do DOM
          setTimeout(() => {
            lastFocusedElement.current?.focus();
          }, 0);
        }
      };
    }
  }, [
    isOpen,
    focusOnMount,
    restoreFocusOnClose,
    preventScroll,
    handleKeyDown,
    getFocusableElements
  ]);

  return {
    modalRef,
    titleId,
    descriptionId,
  };
};

export default useAccessibleModal;