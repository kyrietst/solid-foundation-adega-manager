/**
 * useFormReducer - Hook avançado para formulários complexos com useReducer
 * Context7 Pattern: useState → useReducer para formulários com múltiplos estados
 * Complementa useFormWithToast para casos mais complexos
 *
 * REFATORAÇÃO APLICADA:
 * - useReducer para formulários com lógica complexa
 * - Validação multi-step integrada
 * - Estados derivados computados
 * - Performance otimizada
 * - Undo/Redo funcionalidade
 *
 * @version 2.0.0 - Hook avançado com useReducer (Context7)
 */

import { useReducer, useCallback, useMemo } from 'react';
import { z } from 'zod';

// Estado do formulário
interface FormState<T> {
  data: T;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
  step: number;
  history: T[];
  historyIndex: number;
}

// Actions do reducer
type FormAction<T> =
  | { type: 'SET_FIELD'; payload: { field: keyof T; value: any } }
  | { type: 'SET_MULTIPLE_FIELDS'; payload: Partial<T> }
  | { type: 'SET_ERRORS'; payload: Record<string, string> }
  | { type: 'TOUCH_FIELD'; payload: keyof T }
  | { type: 'TOUCH_MULTIPLE_FIELDS'; payload: (keyof T)[] }
  | { type: 'SET_SUBMITTING'; payload: boolean }
  | { type: 'SET_VALID'; payload: boolean }
  | { type: 'SET_STEP'; payload: number }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'RESET_FORM'; payload?: T }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'SAVE_TO_HISTORY' };

// Opções do hook
interface UseFormReducerOptions<T> {
  initialData: T;
  schema?: z.ZodSchema<T>;
  enableHistory?: boolean;
  maxHistorySize?: number;
  maxSteps?: number;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

// Reducer function
function formReducer<T>(state: FormState<T>, action: FormAction<T>): FormState<T> {
  switch (action.type) {
    case 'SET_FIELD': {
      const newData = {
        ...state.data,
        [action.payload.field]: action.payload.value,
      };
      return {
        ...state,
        data: newData,
        isDirty: true,
        errors: {
          ...state.errors,
          [action.payload.field as string]: '', // Limpar erro do campo
        },
      };
    }

    case 'SET_MULTIPLE_FIELDS':
      return {
        ...state,
        data: { ...state.data, ...action.payload },
        isDirty: true,
      };

    case 'SET_ERRORS':
      return {
        ...state,
        errors: action.payload,
        isValid: Object.keys(action.payload).length === 0,
      };

    case 'TOUCH_FIELD':
      return {
        ...state,
        touched: {
          ...state.touched,
          [action.payload as string]: true,
        },
      };

    case 'TOUCH_MULTIPLE_FIELDS': {
      const newTouched = { ...state.touched };
      action.payload.forEach(field => {
        newTouched[field as string] = true;
      });
      return {
        ...state,
        touched: newTouched,
      };
    }

    case 'SET_SUBMITTING':
      return {
        ...state,
        isSubmitting: action.payload,
      };

    case 'SET_VALID':
      return {
        ...state,
        isValid: action.payload,
      };

    case 'SET_STEP':
      return {
        ...state,
        step: Math.max(0, action.payload),
      };

    case 'NEXT_STEP':
      return {
        ...state,
        step: state.step + 1,
      };

    case 'PREV_STEP':
      return {
        ...state,
        step: Math.max(0, state.step - 1),
      };

    case 'SAVE_TO_HISTORY': {
      const newHistory = [
        ...state.history.slice(0, state.historyIndex + 1),
        { ...state.data },
      ];
      return {
        ...state,
        history: newHistory.slice(-10), // Limitar histórico
        historyIndex: Math.min(newHistory.length - 1, 9),
      };
    }

    case 'UNDO':
      if (state.historyIndex > 0) {
        const prevIndex = state.historyIndex - 1;
        return {
          ...state,
          data: { ...state.history[prevIndex] },
          historyIndex: prevIndex,
          isDirty: true,
        };
      }
      return state;

    case 'REDO':
      if (state.historyIndex < state.history.length - 1) {
        const nextIndex = state.historyIndex + 1;
        return {
          ...state,
          data: { ...state.history[nextIndex] },
          historyIndex: nextIndex,
          isDirty: true,
        };
      }
      return state;

    case 'RESET_FORM': {
      const resetData = action.payload || state.history[0] || state.data;
      return {
        ...state,
        data: resetData,
        errors: {},
        touched: {},
        isSubmitting: false,
        isValid: true,
        isDirty: false,
        step: 0,
      };
    }

    default:
      return state;
  }
}

export const useFormReducer = <T extends Record<string, any>>(
  options: UseFormReducerOptions<T>
) => {
  const {
    initialData,
    schema,
    enableHistory = false,
    maxHistorySize = 10,
    maxSteps = 1,
    validateOnChange = false,
    validateOnBlur = true,
  } = options;

  // Estado inicial
  const initialState: FormState<T> = {
    data: initialData,
    errors: {},
    touched: {},
    isSubmitting: false,
    isValid: true,
    isDirty: false,
    step: 0,
    history: enableHistory ? [initialData] : [],
    historyIndex: 0,
  };

  const [state, dispatch] = useReducer(formReducer<T>, initialState);

  // Validação com Zod
  const validateData = useCallback((data: T): Record<string, string> => {
    if (!schema) return {};

    try {
      schema.parse(data);
      return {};
    } catch (error) {
      if (error instanceof z.ZodError) {
        const zodErrors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path) {
            zodErrors[err.path[0]] = err.message;
          }
        });
        return zodErrors;
      }
      return {};
    }
  }, [schema]);

  // Actions memoizadas
  const actions = {
    setField: useCallback((field: keyof T, value: any) => {
      dispatch({ type: 'SET_FIELD', payload: { field, value } });

      if (validateOnChange) {
        const newData = { ...state.data, [field]: value };
        const errors = validateData(newData);
        dispatch({ type: 'SET_ERRORS', payload: errors });
      }
    }, [state.data, validateOnChange, validateData]),

    setMultipleFields: useCallback((fields: Partial<T>) => {
      dispatch({ type: 'SET_MULTIPLE_FIELDS', payload: fields });

      if (validateOnChange) {
        const newData = { ...state.data, ...fields };
        const errors = validateData(newData);
        dispatch({ type: 'SET_ERRORS', payload: errors });
      }
    }, [state.data, validateOnChange, validateData]),

    touchField: useCallback((field: keyof T) => {
      dispatch({ type: 'TOUCH_FIELD', payload: field });

      if (validateOnBlur) {
        const errors = validateData(state.data);
        dispatch({ type: 'SET_ERRORS', payload: errors });
      }
    }, [state.data, validateOnBlur, validateData]),

    touchMultipleFields: useCallback((fields: (keyof T)[]) => {
      dispatch({ type: 'TOUCH_MULTIPLE_FIELDS', payload: fields });

      if (validateOnBlur) {
        const errors = validateData(state.data);
        dispatch({ type: 'SET_ERRORS', payload: errors });
      }
    }, [state.data, validateOnBlur, validateData]),

    validateForm: useCallback(() => {
      const errors = validateData(state.data);
      dispatch({ type: 'SET_ERRORS', payload: errors });
      return Object.keys(errors).length === 0;
    }, [state.data, validateData]),

    setSubmitting: useCallback((isSubmitting: boolean) => {
      dispatch({ type: 'SET_SUBMITTING', payload: isSubmitting });
    }, []),

    nextStep: useCallback(() => {
      if (state.step < maxSteps - 1) {
        dispatch({ type: 'NEXT_STEP' });
      }
    }, [state.step, maxSteps]),

    prevStep: useCallback(() => {
      dispatch({ type: 'PREV_STEP' });
    }, []),

    setStep: useCallback((step: number) => {
      dispatch({ type: 'SET_STEP', payload: step });
    }, []),

    saveToHistory: useCallback(() => {
      if (enableHistory) {
        dispatch({ type: 'SAVE_TO_HISTORY' });
      }
    }, [enableHistory]),

    undo: useCallback(() => {
      if (enableHistory) {
        dispatch({ type: 'UNDO' });
      }
    }, [enableHistory]),

    redo: useCallback(() => {
      if (enableHistory) {
        dispatch({ type: 'REDO' });
      }
    }, [enableHistory]),

    reset: useCallback((newData?: T) => {
      dispatch({ type: 'RESET_FORM', payload: newData });
    }, []),
  };

  // Computed values
  const computed = useMemo(() => ({
    hasErrors: Object.keys(state.errors).length > 0,
    touchedFields: Object.keys(state.touched).filter(key => state.touched[key]),
    touchedFieldsCount: Object.keys(state.touched).filter(key => state.touched[key]).length,
    isFirstStep: state.step === 0,
    isLastStep: state.step === maxSteps - 1,
    canUndo: enableHistory && state.historyIndex > 0,
    canRedo: enableHistory && state.historyIndex < state.history.length - 1,
    currentStepProgress: maxSteps > 1 ? ((state.step + 1) / maxSteps) * 100 : 100,
  }), [state, maxSteps, enableHistory]);

  // Helpers
  const getFieldError = useCallback((field: keyof T) => state.errors[field as string], [state.errors]);
  const isFieldTouched = useCallback((field: keyof T) => state.touched[field as string], [state.touched]);
  const shouldShowError = useCallback((field: keyof T) => {
    return isFieldTouched(field) && getFieldError(field);
  }, [isFieldTouched, getFieldError]);

  return {
    state,
    actions,
    computed,
    helpers: {
      getFieldError,
      isFieldTouched,
      shouldShowError,
      validateData,
    },
    dispatch, // Para casos avançados
  };
};

export default useFormReducer;