/**
 * BaseModal.tsx - Componente modal reutilizável base
 * Elimina duplicação de Dialog/DialogContent/DialogHeader em 31+ modais
 * 
 * @author Adega Manager Team
 * @version 1.0.0
 */

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/primitives/dialog';
import { cn } from '@/core/config/utils';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | 'full';

export interface BaseModalProps {
  /** Estado de abertura do modal */
  isOpen: boolean;
  /** Função para fechar o modal */
  onClose: () => void;
  /** Título do modal */
  title: React.ReactNode;
  /** Descrição opcional do modal */
  description?: React.ReactNode;
  /** Conteúdo do modal */
  children: React.ReactNode;
  /** Tamanho do modal */
  size?: ModalSize;
  /** Largura máxima customizada (sobrescreve o tamanho padrão) */
  maxWidth?: string;
  /** Classes CSS adicionais */
  className?: string;
  /** Se deve mostrar o header (título/descrição) */
  showHeader?: boolean;
  /** Se deve permitir fechar clicando fora */
  closeOnOutsideClick?: boolean;
  /** Se deve mostrar o botão X de fechar */
  showCloseButton?: boolean;
}

const sizeClasses: Record<ModalSize, string> = {
  sm: '!max-w-sm',
  md: '!max-w-md',
  lg: '!max-w-lg',
  xl: '!max-w-xl',
  '2xl': '!max-w-2xl',
  '3xl': '!max-w-3xl',
  '4xl': '!max-w-4xl',
  '5xl': '!w-modal-1200 !max-w-modal-1200', // Inventory modals standard
  '6xl': '!w-modal-1400 !max-w-modal-1400', // Ultra wide modals
  full: '!max-w-full mx-4'
};

// Mapeamento de tamanhos para maxWidth do Radix UI
const sizeToMaxWidth: Record<ModalSize, string> = {
  sm: '384px',     // max-w-sm
  md: '448px',     // max-w-md
  lg: '512px',     // max-w-lg
  xl: '576px',     // max-w-xl
  '2xl': '672px',  // max-w-2xl
  '3xl': '768px',  // max-w-3xl
  '4xl': '896px',  // max-w-4xl
  '5xl': '1200px', // Inventory modals standard
  '6xl': '1400px', // Ultra wide modals
  full: '100vw'    // max-w-full
};

export const BaseModal: React.FC<BaseModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  maxWidth,
  className,
  showHeader = true,
  closeOnOutsideClick = true,
  showCloseButton = true
}) => {
  const handleOpenChange = (open: boolean) => {
    if (!open && closeOnOutsideClick) {
      onClose();
    }
  };

  // Determinar maxWidth: prop customizado ou baseado no tamanho
  const effectiveMaxWidth = maxWidth || sizeToMaxWidth[size];

  // Debug removido para produção

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent 
        className={cn(
          'w-full',
          // Manter classes Tailwind como fallback, mas Radix props têm prioridade
          sizeClasses[size],
          className
        )}
        style={{ 
          maxWidth: effectiveMaxWidth + ' !important',
          width: effectiveMaxWidth + ' !important'
        }}
      >
        {showHeader && (title || description) && (
          <DialogHeader className="text-center pb-4">
            {title && (
              <DialogTitle className="text-xl font-bold text-white flex items-center justify-center gap-2">
                {title}
              </DialogTitle>
            )}
            {description && (
              <DialogDescription className="text-gray-400 mt-2">
                {description}
              </DialogDescription>
            )}
          </DialogHeader>
        )}
        
        {children}
      </DialogContent>
    </Dialog>
  );
};

/**
 * Hook utilitário para facilitar o uso do BaseModal
 */
export const useBaseModal = (initialOpen = false) => {
  const [isOpen, setIsOpen] = React.useState(initialOpen);

  const openModal = React.useCallback(() => setIsOpen(true), []);
  const closeModal = React.useCallback(() => setIsOpen(false), []);
  const toggleModal = React.useCallback(() => setIsOpen(prev => !prev), []);

  return {
    isOpen,
    openModal,
    closeModal,
    toggleModal,
    modalProps: {
      isOpen,
      onClose: closeModal
    }
  };
};

export default BaseModal;