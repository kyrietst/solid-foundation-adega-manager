/**
 * Hook para gerenciamento de estado de dialogs
 * Padroniza o padrão repetido de isOpen/setIsOpen em toda aplicação
 */

import { useState, useCallback } from 'react';

export interface DialogConfig {
  onOpen?: () => void;
  onClose?: () => void;
  initialData?: any;
}

export interface DialogState {
  isOpen: boolean;
  data: any;
  open: (data?: any) => void;
  close: () => void;
  toggle: () => void;
}

export const useDialogState = (config?: DialogConfig): DialogState => {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState(config?.initialData || null);

  const open = useCallback((newData?: any) => {
    setData(newData || null);
    setIsOpen(true);
    config?.onOpen?.();
  }, [config?.onOpen]);

  const close = useCallback(() => {
    setIsOpen(false);
    setData(null);
    config?.onClose?.();
  }, [config?.onClose]);

  const toggle = useCallback(() => {
    if (isOpen) {
      close();
    } else {
      open();
    }
  }, [isOpen, open, close]);

  return {
    isOpen,
    data,
    open,
    close,
    toggle,
  };
};

// Hook para múltiplos dialogs (padrão comum: create, edit, delete, view)
export interface MultiDialogsState {
  create: DialogState;
  edit: DialogState;
  delete: DialogState;
  view: DialogState;
  closeAll: () => void;
}

export const useMultiDialogState = (): MultiDialogsState => {
  const create = useDialogState();
  const edit = useDialogState();
  const deleteDialog = useDialogState();
  const view = useDialogState();

  const closeAll = useCallback(() => {
    create.close();
    edit.close();
    deleteDialog.close();
    view.close();
  }, [create, edit, deleteDialog, view]);

  return {
    create,
    edit,
    delete: deleteDialog,
    view,
    closeAll,
  };
};

// Hook específico para pattern comum: create + edit
export const useEntityDialogs = <T = any>() => {
  const [editingItem, setEditingItem] = useState<T | null>(null);
  
  const create = useDialogState({
    onClose: () => setEditingItem(null)
  });
  
  const edit = useDialogState({
    onOpen: () => {
      // editingItem deve ser setado antes de chamar edit.open()
    },
    onClose: () => setEditingItem(null)
  });

  const openCreate = useCallback(() => {
    setEditingItem(null);
    create.open();
  }, [create]);

  const openEdit = useCallback((item: T) => {
    setEditingItem(item);
    edit.open(item);
  }, [edit]);

  return {
    // Estados
    create,
    edit,
    editingItem,
    
    // Ações
    openCreate,
    openEdit,
    closeAll: () => {
      create.close();
      edit.close();
      setEditingItem(null);
    }
  };
};