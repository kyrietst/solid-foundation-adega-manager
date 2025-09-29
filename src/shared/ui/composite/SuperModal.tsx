/**
 * SuperModal.tsx - Modal unificado com formulários integrados
 *
 * @description
 * Modal definitivo que combina EnhancedBaseModal + useModalForm + validação
 * para eliminação completa de duplicação em modais com formulários.
 *
 * @features
 * - Formulários integrados com validação Zod
 * - Estados de loading, success, error automatizados
 * - Submit handling com rollback automático
 * - Dirty state detection
 * - Keyboard navigation otimizada
 * - Acessibilidade WCAG AAA
 *
 * @usage
 * ```tsx
 * <SuperModal
 *   modalType="edit"
 *   title="Editar Produto"
 *   isOpen={isOpen}
 *   onClose={onClose}
 *   formData={productData}
 *   onSubmit={handleSubmit}
 *   validationSchema={productSchema}
 * >
 *   <ProductFormFields />
 * </SuperModal>
 * ```
 *
 * @author Adega Manager Team
 * @version 2.0.0 - SSoT Implementation
 */

import React, { useCallback, useEffect, useState, useRef } from 'react';
import { EnhancedBaseModal, EnhancedBaseModalProps, ModalType } from './EnhancedBaseModal';
import { useModalForm, UseModalFormConfig } from '@/shared/hooks/common/useModalForm';
import { cn } from '@/core/config/utils';
import {
  Save,
  X,
  AlertCircle,
  CheckCircle2,
  Loader2,
  RotateCcw,
  Eye,
  EyeOff
} from 'lucide-react';

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

export interface FormFieldProps<T = any> {
  data: Partial<T>;
  updateField: <K extends keyof T>(field: K, value: T[K]) => void;
  updateMultipleFields: (updates: Partial<T>) => void;
  errors: Record<string, string>;
  hasFieldError: (field: keyof T) => boolean;
  getFieldError: (field: keyof T) => string | undefined;
  isSubmitting: boolean;
  hasChanges: boolean;
}

export interface SuperModalProps<T = any> extends Omit<EnhancedBaseModalProps, 'primaryAction' | 'secondaryAction' | 'loading' | 'status'> {
  /** Dados do formulário */
  formData?: Partial<T>;

  /** Função de submit */
  onSubmit?: (data: T) => Promise<void> | void;

  /** Configuração do formulário */
  formConfig?: Omit<UseModalFormConfig<T>, 'onSuccess' | 'onCancel'>;

  /** Schema de validação Zod */
  validationSchema?: any;

  /** Callback quando formulário é submetido com sucesso */
  onSuccess?: (data: T) => void;

  /** Callback quando formulário é cancelado */
  onCancel?: () => void;

  /** Texto do botão submit */
  submitButtonText?: string;

  /** Texto do botão cancel */
  cancelButtonText?: string;

  /** Se deve mostrar botão de reset */
  showResetButton?: boolean;

  /** Se deve confirmar antes de fechar com mudanças */
  confirmOnClose?: boolean;

  /** Se deve resetar formulário após sucesso */
  resetOnSuccess?: boolean;

  /** Se deve fechar modal após sucesso */
  closeOnSuccess?: boolean;

  /** Callback para renderizar campos do formulário */
  children?: React.ReactNode | ((props: FormFieldProps<T>) => React.ReactNode);

  /** Validação customizada adicional */
  customValidation?: (data: Partial<T>) => string | null;

  /** Se deve focar no primeiro campo ao abrir */
  autoFocusFirstField?: boolean;

  /** Debug mode - mostra dados do formulário */
  debug?: boolean;
}

// ============================================================================
// COMPONENTE DEBUG PANEL
// ============================================================================

interface DebugPanelProps<T> {
  formData: Partial<T>;
  validation: any;
  hasChanges: boolean;
  canSubmit: boolean;
  isSubmitting: boolean;
}

const DebugPanel = <T,>({
  formData,
  validation,
  hasChanges,
  canSubmit,
  isSubmitting
}: DebugPanelProps<T>) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="border-t border-gray-800 bg-gray-950/50">
      <button
        type="button"
        onClick={() => setIsVisible(!isVisible)}
        className="w-full px-4 py-2 text-xs text-gray-400 hover:text-gray-300 flex items-center gap-2"
      >
        {isVisible ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
        Debug Panel
      </button>

      {isVisible && (
        <div className="px-4 pb-4 space-y-2 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-gray-400 mb-1">Form State</div>
              <div className="space-y-1">
                <div>Has Changes: <span className={hasChanges ? 'text-green-400' : 'text-gray-500'}>{String(hasChanges)}</span></div>
                <div>Can Submit: <span className={canSubmit ? 'text-green-400' : 'text-red-400'}>{String(canSubmit)}</span></div>
                <div>Submitting: <span className={isSubmitting ? 'text-yellow-400' : 'text-gray-500'}>{String(isSubmitting)}</span></div>
                <div>Is Valid: <span className={validation.isValid ? 'text-green-400' : 'text-red-400'}>{String(validation.isValid)}</span></div>
              </div>
            </div>

            <div>
              <div className="text-gray-400 mb-1">Form Data</div>
              <pre className="text-xs text-gray-300 bg-gray-900 p-2 rounded max-h-32 overflow-auto">
                {JSON.stringify(formData, null, 2)}
              </pre>
            </div>
          </div>

          {Object.keys(validation.validationState.errors).length > 0 && (
            <div>
              <div className="text-red-400 mb-1">Validation Errors</div>
              <div className="text-xs text-red-300 bg-red-950/20 p-2 rounded">
                {Object.entries(validation.validationState.errors).map(([field, error]) => (
                  <div key={field}>{field}: {error as string}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// COMPONENTE PRINCIPAL - SUPER MODAL
// ============================================================================

export const SuperModal = <T extends Record<string, any>>({
  modalType,
  title,
  subtitle,
  isOpen,
  onClose,
  formData: initialFormData = {} as Partial<T>,
  onSubmit,
  formConfig = {},
  validationSchema,
  onSuccess,
  onCancel,
  submitButtonText = 'Salvar',
  cancelButtonText = 'Cancelar',
  showResetButton = false,
  confirmOnClose = true,
  resetOnSuccess = true,
  closeOnSuccess = true,
  children,
  customValidation,
  autoFocusFirstField = true,
  debug = false,
  ...enhancedModalProps
}: SuperModalProps<T>) => {
  // ============================================================================
  // REFS E ESTADO LOCAL
  // ============================================================================

  const formRef = useRef<HTMLDivElement>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // ============================================================================
  // FORM HOOK
  // ============================================================================

  const form = useModalForm<T>({
    ...formConfig,
    initialData: initialFormData,
    validationSchema,
    onSuccess: (data) => {
      setSubmitSuccess(true);
      setSubmitError(null);
      onSuccess?.(data);

      if (closeOnSuccess) {
        setTimeout(() => {
          onClose();
          setSubmitSuccess(false);
        }, 1000); // Mostra sucesso por 1 segundo
      }
    },
    onCancel: () => {
      onCancel?.();
      onClose();
    },
    resetOnSuccess,
    resetOnCancel: false
  });

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleSubmit = useCallback(async () => {
    setSubmitError(null);

    try {
      // Validação customizada adicional
      if (customValidation) {
        const customError = customValidation(form.formData);
        if (customError) {
          setSubmitError(customError);
          return;
        }
      }

      const success = await form.handleSubmit(onSubmit);
      if (!success && !form.validation.isValid) {
        setSubmitError('Por favor, corrija os erros no formulário');
      }
    } catch (error) {
      console.error('Erro no submit:', error);
      setSubmitError(error instanceof Error ? error.message : 'Erro inesperado no formulário');
    }
  }, [form, onSubmit, customValidation]);

  const handleClose = useCallback(() => {
    if (confirmOnClose && form.hasChanges && !form.isSubmitting) {
      const confirmed = window.confirm(
        'Você tem alterações não salvas. Deseja realmente fechar?'
      );
      if (!confirmed) return;
    }

    form.handleCancel();
  }, [form, confirmOnClose]);

  const handleReset = useCallback(() => {
    const confirmed = window.confirm(
      'Deseja resetar todos os campos para os valores originais?'
    );
    if (confirmed) {
      form.resetForm();
      setSubmitError(null);
      setSubmitSuccess(false);
    }
  }, [form]);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Atualizar dados do formulário quando props mudam
  useEffect(() => {
    if (isOpen && initialFormData) {
      form.openModal(initialFormData);
    }
  }, [isOpen, initialFormData]);

  // Auto focus no primeiro campo
  useEffect(() => {
    if (isOpen && autoFocusFirstField && formRef.current) {
      const firstInput = formRef.current.querySelector<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
        'input:not([type="hidden"]), textarea, select'
      );
      if (firstInput) {
        setTimeout(() => firstInput.focus(), 100);
      }
    }
  }, [isOpen, autoFocusFirstField]);

  // ============================================================================
  // DERIVED STATE
  // ============================================================================

  const modalStatus = submitSuccess ? 'success' : submitError ? 'error' : undefined;
  const isLoading = form.isSubmitting;

  // Props para passar para os campos do formulário
  const formFieldProps: FormFieldProps<T> = {
    data: form.formData,
    updateField: form.updateField,
    updateMultipleFields: form.updateMultipleFields,
    errors: form.validation.errors || {},
    hasFieldError: form.hasFieldError,
    getFieldError: form.getFieldError,
    isSubmitting: form.isSubmitting,
    hasChanges: form.hasChanges
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <EnhancedBaseModal
      {...enhancedModalProps}
      modalType={modalType}
      title={title}
      subtitle={subtitle}
      isOpen={isOpen}
      onClose={handleClose}
      loading={isLoading}
      status={modalStatus}

      // Ações principais
      primaryAction={{
        label: submitButtonText,
        icon: Save,
        loading: form.isSubmitting,
        disabled: !form.canSubmit,
        onClick: handleSubmit
      }}

      secondaryAction={{
        label: cancelButtonText,
        icon: X,
        disabled: form.isSubmitting,
        onClick: handleClose
      }}

      // Ações adicionais
      additionalActions={showResetButton ? [{
        label: 'Resetar',
        icon: RotateCcw,
        disabled: !form.hasChanges || form.isSubmitting,
        onClick: handleReset
      }] : []}
    >
      {/* Container do formulário */}
      <div ref={formRef} className="space-y-6">
        {/* Mensagem de erro global */}
        {submitError && (
          <div className="flex items-start gap-3 p-4 bg-red-950/20 border border-red-500/20 rounded-lg">
            <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-red-400 font-medium">Erro no formulário</div>
              <div className="text-red-300 text-sm mt-1">{submitError}</div>
            </div>
          </div>
        )}

        {/* Mensagem de sucesso global */}
        {submitSuccess && (
          <div className="flex items-start gap-3 p-4 bg-green-950/20 border border-green-500/20 rounded-lg">
            <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-green-400 font-medium">Sucesso!</div>
              <div className="text-green-300 text-sm mt-1">Formulário salvo com sucesso</div>
            </div>
          </div>
        )}

        {/* Campos do formulário */}
        {typeof children === 'function' ? children(formFieldProps) : children}
      </div>

      {/* Debug Panel */}
      {debug && (
        <DebugPanel
          formData={form.formData}
          validation={form.validation}
          hasChanges={form.hasChanges}
          canSubmit={form.canSubmit}
          isSubmitting={form.isSubmitting}
        />
      )}
    </EnhancedBaseModal>
  );
};

// ============================================================================
// HOOK UTILITÁRIO
// ============================================================================

export interface UseSuperModalConfig<T> {
  modalType: ModalType;
  initialData?: Partial<T>;
  onSubmit?: (data: T) => Promise<void> | void;
  onSuccess?: (data: T) => void;
  validationSchema?: any;
}

export const useSuperModal = <T extends Record<string, any>>(
  config: UseSuperModalConfig<T>
) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<T>>(config.initialData || {});

  const openModal = useCallback((data?: Partial<T>) => {
    if (data) {
      setFormData({ ...config.initialData, ...data });
    } else {
      setFormData(config.initialData || {});
    }
    setIsOpen(true);
  }, [config.initialData]);

  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  const modalProps = {
    ...config,
    isOpen,
    onClose: closeModal,
    formData
  };

  return {
    isOpen,
    openModal,
    closeModal,
    modalProps,
    updateFormData: setFormData
  };
};

export default SuperModal;