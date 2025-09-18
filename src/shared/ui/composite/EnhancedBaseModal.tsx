/**
 * EnhancedBaseModal.tsx - Sistema avançado de modais com categorização visual
 *
 * @description
 * Modal aprimorado com sistema de tipos visuais, contraste WCAG AAA,
 * e componentes especializados para diferentes tipos de operação.
 *
 * @features
 * - Categorização visual por cores (view/edit/action/danger)
 * - Contraste WCAG AAA (7:1+ ratio)
 * - Headers especializados com ícones
 * - Sistema de ações contextual
 * - Navegação por teclado aprimorada
 * - Full screen reader support
 *
 * @author Adega Manager Team
 * @version 2.0.0
 */

import React from 'react';
import { BaseModal, BaseModalProps } from './BaseModal';
import { Button } from '@/shared/ui/primitives/button';
import { cn } from '@/core/config/utils';
import {
  Eye,
  Info,
  Package,
  Edit,
  Settings,
  Pencil,
  Plus,
  Minus,
  TrendingUp,
  AlertTriangle,
  Trash,
  X,
  Loader2
} from 'lucide-react';

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

export type ModalType = 'view' | 'edit' | 'action' | 'danger';

export interface ModalAction {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  variant?: 'primary' | 'secondary' | 'danger';
  loading?: boolean;
  disabled?: boolean;
  onClick: () => void;
}

export interface EnhancedBaseModalProps extends Omit<BaseModalProps, 'title' | 'showHeader'> {
  /** Tipo do modal que define cores e comportamento */
  modalType: ModalType;

  /** Título do modal */
  title: string;

  /** Subtítulo opcional */
  subtitle?: string;

  /** Ícone personalizado (sobrescreve o padrão do tipo) */
  customIcon?: React.ComponentType<{ className?: string }>;

  /** Ação primária do modal */
  primaryAction?: ModalAction;

  /** Ação secundária do modal */
  secondaryAction?: ModalAction;

  /** Ações adicionais */
  additionalActions?: ModalAction[];

  /** Se deve mostrar o botão de fechar padrão */
  showCloseButton?: boolean;

  /** Estado de loading geral do modal */
  loading?: boolean;

  /** Status do modal (success, error, warning) */
  status?: 'success' | 'error' | 'warning' | 'info';

  /** Se deve focar no primeiro elemento focável ao abrir */
  autoFocus?: boolean;
}

// ============================================================================
// CONFIGURAÇÕES VISUAIS POR TIPO
// ============================================================================

const modalTypeConfig: Record<ModalType, {
  colors: {
    primary: string;
    background: string;
    border: string;
    headerBg: string;
    accentText: string;
    ring: string;
    iconBg: string;
  };
  defaultIcon: React.ComponentType<{ className?: string }>;
  ariaLabel: string;
}> = {
  view: {
    colors: {
      primary: 'accent-blue', // #3b82f6
      background: 'bg-gray-950', // #030712 - WCAG AAA
      border: 'border-accent-blue/20',
      headerBg: 'bg-gradient-to-r from-accent-blue/10 to-accent-blue/5',
      accentText: 'text-accent-blue',
      ring: 'ring-accent-blue/50',
      iconBg: 'bg-accent-blue/10'
    },
    defaultIcon: Eye,
    ariaLabel: 'Modal de visualização'
  },
  edit: {
    colors: {
      primary: 'accent-gold-100', // #FFD700
      background: 'bg-gray-950',
      border: 'border-accent-gold-100/20',
      headerBg: 'bg-gradient-to-r from-accent-gold-100/10 to-accent-gold-100/5',
      accentText: 'text-accent-gold-100',
      ring: 'ring-accent-gold-100/50',
      iconBg: 'bg-accent-gold-100/10'
    },
    defaultIcon: Edit,
    ariaLabel: 'Modal de edição'
  },
  action: {
    colors: {
      primary: 'accent-green', // #10b981
      background: 'bg-gray-950',
      border: 'border-accent-green/20',
      headerBg: 'bg-gradient-to-r from-accent-green/10 to-accent-green/5',
      accentText: 'text-accent-green',
      ring: 'ring-accent-green/50',
      iconBg: 'bg-accent-green/10'
    },
    defaultIcon: Plus,
    ariaLabel: 'Modal de ação'
  },
  danger: {
    colors: {
      primary: 'accent-red', // #ef4444
      background: 'bg-gray-950',
      border: 'border-accent-red/20',
      headerBg: 'bg-gradient-to-r from-accent-red/10 to-accent-red/5',
      accentText: 'text-accent-red',
      ring: 'ring-accent-red/50',
      iconBg: 'bg-accent-red/10'
    },
    defaultIcon: AlertTriangle,
    ariaLabel: 'Modal de ação crítica'
  }
};

// ============================================================================
// COMPONENTE MODAL HEADER
// ============================================================================

interface ModalHeaderProps {
  modalType: ModalType;
  title: string;
  subtitle?: string;
  customIcon?: React.ComponentType<{ className?: string }>;
  status?: 'success' | 'error' | 'warning' | 'info';
  loading?: boolean;
}

const ModalHeader: React.FC<ModalHeaderProps> = ({
  modalType,
  title,
  subtitle,
  customIcon,
  status,
  loading
}) => {
  const config = modalTypeConfig[modalType];
  const IconComponent = customIcon || config.defaultIcon;

  return (
    <div className={cn(
      'px-6 py-4 border-b border-gray-800/50 relative overflow-hidden',
      config.colors.headerBg
    )}>
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent" />

      <div className="relative flex items-start gap-4">
        {/* Icon container with glow effect */}
        <div className={cn(
          'flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center',
          'border transition-all duration-200',
          config.colors.border,
          config.colors.iconBg,
          loading && 'animate-pulse'
        )}>
          {loading ? (
            <Loader2 className={cn('h-6 w-6 animate-spin', config.colors.accentText)} />
          ) : (
            <IconComponent className={cn('h-6 w-6', config.colors.accentText)} />
          )}
        </div>

        {/* Title and subtitle */}
        <div className="flex-1 min-w-0">
          <h2 className={cn(
            'text-xl font-semibold font-sf-pro-display leading-tight',
            'text-gray-50' // WCAG AAA contrast ratio: 19:1
          )}>
            {title}
          </h2>

          {subtitle && (
            <p className={cn(
              'mt-1 text-sm leading-relaxed',
              'text-gray-300' // WCAG AAA contrast ratio: 15:1
            )}>
              {subtitle}
            </p>
          )}

          {/* Status indicator */}
          {status && (
            <div className={cn(
              'mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium',
              {
                'bg-accent-green/10 text-accent-green border border-accent-green/20': status === 'success',
                'bg-accent-red/10 text-accent-red border border-accent-red/20': status === 'error',
                'bg-accent-orange/10 text-accent-orange border border-accent-orange/20': status === 'warning',
                'bg-accent-blue/10 text-accent-blue border border-accent-blue/20': status === 'info',
              }
            )}>
              {status === 'success' && '✓ '}
              {status === 'error' && '✕ '}
              {status === 'warning' && '⚠ '}
              {status === 'info' && 'ℹ '}
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// COMPONENTE MODAL ACTIONS
// ============================================================================

interface ModalActionsProps {
  modalType: ModalType;
  primaryAction?: ModalAction;
  secondaryAction?: ModalAction;
  additionalActions?: ModalAction[];
  onClose: () => void;
  showCloseButton: boolean;
}

const ModalActions: React.FC<ModalActionsProps> = ({
  modalType,
  primaryAction,
  secondaryAction,
  additionalActions = [],
  onClose,
  showCloseButton
}) => {
  const config = modalTypeConfig[modalType];

  // Não renderizar se não há ações
  if (!primaryAction && !secondaryAction && additionalActions.length === 0 && !showCloseButton) {
    return null;
  }

  return (
    <div className="px-6 py-4 border-t border-gray-800/50 bg-gray-950/50">
      <div className="flex items-center justify-between gap-3">
        {/* Ações adicionais (lado esquerdo) */}
        <div className="flex items-center gap-2">
          {additionalActions.map((action, index) => {
            const IconComponent = action.icon;
            return (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                onClick={action.onClick}
                disabled={action.disabled || action.loading}
                className={cn(
                  'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50',
                  action.disabled && 'opacity-50 cursor-not-allowed'
                )}
              >
                {action.loading ? (
                  <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                ) : IconComponent ? (
                  <IconComponent className="h-4 w-4 mr-1.5" />
                ) : null}
                {action.label}
              </Button>
            );
          })}
        </div>

        {/* Ações principais (lado direito) */}
        <div className="flex items-center gap-3">
          {/* Botão de fechar */}
          {showCloseButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-200 hover:bg-gray-800/50"
            >
              <X className="h-4 w-4 mr-1.5" />
              Fechar
            </Button>
          )}

          {/* Ação secundária */}
          {secondaryAction && (
            <Button
              variant="outline"
              size="sm"
              onClick={secondaryAction.onClick}
              disabled={secondaryAction.disabled || secondaryAction.loading}
              className={cn(
                'border-gray-600 text-gray-300 hover:bg-gray-800/50 hover:text-gray-100',
                secondaryAction.disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              {secondaryAction.loading ? (
                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
              ) : secondaryAction.icon ? (
                <secondaryAction.icon className="h-4 w-4 mr-1.5" />
              ) : null}
              {secondaryAction.label}
            </Button>
          )}

          {/* Ação primária */}
          {primaryAction && (
            <Button
              size="sm"
              onClick={primaryAction.onClick}
              disabled={primaryAction.disabled || primaryAction.loading}
              className={cn(
                'font-medium focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-950',
                config.colors.ring,
                {
                  // Primary button styling based on modal type
                  'bg-accent-blue hover:bg-accent-blue/90 text-white': modalType === 'view',
                  'bg-accent-gold-100 hover:bg-accent-gold-90 text-primary-black': modalType === 'edit',
                  'bg-accent-green hover:bg-accent-green/90 text-white': modalType === 'action',
                  'bg-accent-red hover:bg-accent-red/90 text-white': modalType === 'danger'
                },
                primaryAction.disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              {primaryAction.loading ? (
                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
              ) : primaryAction.icon ? (
                <primaryAction.icon className="h-4 w-4 mr-1.5" />
              ) : null}
              {primaryAction.label}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// COMPONENTES UTILITÁRIOS - MODAL SECTION
// ============================================================================

interface ModalSectionProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export const ModalSection: React.FC<ModalSectionProps> = ({
  title,
  subtitle,
  children,
  className,
  noPadding = false
}) => {
  return (
    <div className={cn('space-y-4', className)}>
      {(title || subtitle) && (
        <div className="space-y-1">
          {title && (
            <h3 className="text-lg font-medium font-sf-pro-display text-gray-50">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-sm text-gray-400 leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
      )}

      <div className={cn(!noPadding && 'space-y-4')}>
        {children}
      </div>
    </div>
  );
};

// ============================================================================
// COMPONENTE PRINCIPAL - ENHANCED BASE MODAL
// ============================================================================

export const EnhancedBaseModal: React.FC<EnhancedBaseModalProps> = ({
  modalType,
  title,
  subtitle,
  customIcon,
  primaryAction,
  secondaryAction,
  additionalActions = [],
  showCloseButton = true,
  loading = false,
  status,
  autoFocus = true,
  children,
  className,
  ...baseModalProps
}) => {
  const config = modalTypeConfig[modalType];

  return (
    <BaseModal
      {...baseModalProps}
      showHeader={false} // Usamos nosso header customizado
      className={cn(
        // Background com contraste WCAG AAA
        config.colors.background,
        'text-gray-50',
        // Border com cor do tipo
        config.colors.border,
        // Ring focus para acessibilidade
        'focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-950',
        config.colors.ring,
        className
      )}
      title="" // Título gerenciado pelo nosso header
    >
      {/* Header especializado */}
      <ModalHeader
        modalType={modalType}
        title={title}
        subtitle={subtitle}
        customIcon={customIcon}
        status={status}
        loading={loading}
      />

      {/* Conteúdo principal */}
      <div className={cn(
        'flex-1 px-6 py-6 overflow-y-auto',
        'scrollbar-thin scrollbar-track-gray-900 scrollbar-thumb-gray-700',
        'min-h-0', // Permite flex-shrink correto
        loading && 'opacity-60 pointer-events-none'
      )}>
        <div className="space-y-6">
          {children}
        </div>
      </div>

      {/* Actions footer */}
      <ModalActions
        modalType={modalType}
        primaryAction={primaryAction}
        secondaryAction={secondaryAction}
        additionalActions={additionalActions}
        onClose={baseModalProps.onClose}
        showCloseButton={showCloseButton}
      />
    </BaseModal>
  );
};

/**
 * Hook utilitário para facilitar o uso do EnhancedBaseModal
 */
export const useEnhancedModal = (modalType: ModalType, initialOpen = false) => {
  const [isOpen, setIsOpen] = React.useState(initialOpen);
  const [loading, setLoading] = React.useState(false);
  const [status, setStatus] = React.useState<'success' | 'error' | 'warning' | 'info'>();

  const openModal = React.useCallback(() => setIsOpen(true), []);
  const closeModal = React.useCallback(() => {
    setIsOpen(false);
    setLoading(false);
    setStatus(undefined);
  }, []);

  const toggleModal = React.useCallback(() => setIsOpen(prev => !prev), []);

  return {
    isOpen,
    loading,
    status,
    openModal,
    closeModal,
    toggleModal,
    setLoading,
    setStatus,
    modalProps: {
      isOpen,
      onClose: closeModal,
      modalType,
      loading,
      status
    }
  };
};

export default EnhancedBaseModal;