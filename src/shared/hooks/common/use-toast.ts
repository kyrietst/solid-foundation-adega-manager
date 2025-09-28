import * as React from "react"

import type {
  ToastActionElement,
  ToastProps,
} from "@/shared/ui/primitives/toast"

const TOAST_LIMIT = 1

// Toast timing configuration based on context and type
const TOAST_TIMING = {
  // POS Environment - Faster for sales operations
  pos: {
    success: 2000,   // Quick confirmation (sale completed)
    error: 4000,     // Longer for errors (needs attention)
    warning: 3000,   // Medium for warnings (stock low)
    info: 2500,      // Medium-fast for info (product added)
    default: 2500,   // Default POS timing
  },
  // Standard Environment - Normal timing
  standard: {
    success: 3000,   // Standard success timing
    error: 5000,     // Longer for errors
    warning: 4000,   // Medium for warnings
    info: 3500,      // Medium for info
    default: 4000,   // Default standard timing
  }
} as const

const TOAST_DEBOUNCE_DELAY = 100 // Debounce para evitar toasts consecutivos

// Context detection - automatically determine if we're in POS environment
const getCurrentContext = (): 'pos' | 'standard' => {
  const pathname = window.location.pathname
  return pathname.includes('/sales') || pathname.includes('/pos') ? 'pos' : 'standard'
}

// Get appropriate delay based on context and variant
const getToastDelay = (variant?: string): number => {
  const context = getCurrentContext()
  const timing = TOAST_TIMING[context]

  switch (variant) {
    case 'destructive': return timing.error
    case 'success': return timing.success
    case 'warning': return timing.warning
    case 'info': return timing.info
    default: return timing.default
  }
}

type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

type ActionType = typeof actionTypes

type Action =
  | {
      type: ActionType["ADD_TOAST"]
      toast: ToasterToast
    }
  | {
      type: ActionType["UPDATE_TOAST"]
      toast: Partial<ToasterToast>
    }
  | {
      type: ActionType["DISMISS_TOAST"]
      toastId?: ToasterToast["id"]
    }
  | {
      type: ActionType["REMOVE_TOAST"]
      toastId?: ToasterToast["id"]
    }

interface State {
  toasts: ToasterToast[]
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()
const toastDebounceMap = new Map<string, number>() // Debounce para evitar toasts duplicados

const addToRemoveQueue = (toastId: string, variant?: string) => {
  if (toastTimeouts.has(toastId)) {
    return
  }

  const delay = getToastDelay(variant)

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId,
    })
  }, delay)

  toastTimeouts.set(toastId, timeout)
}

// Função para verificar se o toast é duplicado (debounce)
const isDuplicateToast = (title: string, description: string): boolean => {
  const toastKey = `${title}-${description}`;
  const now = Date.now();
  const lastToastTime = toastDebounceMap.get(toastKey) || 0;

  if (now - lastToastTime < TOAST_DEBOUNCE_DELAY) {
    return true; // É duplicado, ignorar
  }

  toastDebounceMap.set(toastKey, now);
  return false;
}

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    case "DISMISS_TOAST": {
      const { toastId } = action

      // ! Side effects ! - This could be extracted into a dismissToast() action,
      // but I'll keep it here for simplicity
      if (toastId) {
        const toast = state.toasts.find(t => t.id === toastId)
        addToRemoveQueue(toastId, toast?.variant)
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id, toast.variant)
        })
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      }
    }
    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
  }
}

const listeners: Array<(state: State) => void> = []

let memoryState: State = { toasts: [] }

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

type Toast = Omit<ToasterToast, "id">

function toast({ ...props }: Toast) {
  // Verificar se é um toast duplicado usando debounce
  const title = typeof props.title === 'string' ? props.title : '';
  const description = typeof props.description === 'string' ? props.description : '';

  if (isDuplicateToast(title, description)) {
    console.log('🚫 Toast duplicado ignorado:', { title, description });
    return {
      id: '',
      dismiss: () => {},
      update: () => {},
    };
  }

  const id = genId()

  const update = (props: ToasterToast) =>
    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...props, id },
    })
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id })

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss()
      },
    },
  })

  return {
    id: id,
    dismiss,
    update,
  }
}

function useToast() {
  const [state, setState] = React.useState<State>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [state])

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
  }
}

// Helper functions for common toast types with better UX
const toastHelpers = {
  success: (title: string, description?: string) =>
    toast({
      title,
      description,
      variant: "success",
    }),

  error: (title: string, description?: string) =>
    toast({
      title,
      description,
      variant: "destructive",
    }),

  warning: (title: string, description?: string) =>
    toast({
      title,
      description,
      variant: "warning",
    }),

  info: (title: string, description?: string) =>
    toast({
      title,
      description,
      variant: "info",
    }),

  // POS-specific helpers with optimized messaging
  pos: {
    saleCompleted: (amount: string) =>
      toast({
        title: "Venda finalizada",
        description: `Total: ${amount}`,
        variant: "success",
      }),

    productAdded: (productName: string, type?: string) =>
      toast({
        title: "Produto adicionado",
        description: type ? `${productName} (${type})` : productName,
        variant: "success",
      }),

    stockWarning: (productName: string, stock: number) =>
      toast({
        title: "Estoque baixo",
        description: `${productName}: ${stock} unidades restantes`,
        variant: "warning",
      }),

    barcodeScanned: (productName: string, barcodeType: string) =>
      toast({
        title: "Código escaneado",
        description: `${productName} - ${barcodeType}`,
        variant: "info",
      }),

    saleCancelled: (reason?: string) =>
      toast({
        title: "Venda cancelada",
        description: reason || "A venda foi cancelada com sucesso",
        variant: "warning",
      }),

    paymentError: (message: string) =>
      toast({
        title: "Erro no pagamento",
        description: message,
        variant: "destructive",
      }),
  },

  // Customer-specific helpers
  customer: {
    created: (name: string) =>
      toast({
        title: "Cliente cadastrado",
        description: `${name} foi adicionado com sucesso`,
        variant: "success",
      }),

    updated: (name: string) =>
      toast({
        title: "Cliente atualizado",
        description: `Dados de ${name} foram atualizados`,
        variant: "success",
      }),

    deleted: (name: string) =>
      toast({
        title: "Cliente removido",
        description: `${name} foi removido do sistema`,
        variant: "warning",
      }),
  },

  // Inventory-specific helpers
  inventory: {
    stockAdjusted: (productName: string, newStock: number) =>
      toast({
        title: "Estoque ajustado",
        description: `${productName}: ${newStock} unidades`,
        variant: "info",
      }),

    productCreated: (name: string) =>
      toast({
        title: "Produto criado",
        description: `${name} foi adicionado ao catálogo`,
        variant: "success",
      }),

    lowStock: (productName: string, stock: number) =>
      toast({
        title: "Estoque crítico",
        description: `${productName}: apenas ${stock} unidades`,
        variant: "warning",
      }),
  },
}

export { useToast, toast, toastHelpers }
