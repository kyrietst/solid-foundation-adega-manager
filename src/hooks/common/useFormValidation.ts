/**
 * Hook genérico para validação de formulários
 * Pode ser usado em qualquer formulário do sistema
 */

import { useState, useCallback } from 'react';
import { z } from 'zod';

export interface ValidationResult<T = any> {
  isValid: boolean;
  errors: string[];
  fieldErrors: Record<keyof T, string>;
}

export interface UseFormValidationConfig<T> {
  schema?: z.ZodSchema<T>;
  customValidations?: Array<(data: T) => ValidationResult<T>>;
  validateOnChange?: boolean;
}

export const useFormValidation = <T extends Record<string, any>>(
  config: UseFormValidationConfig<T> = {}
) => {
  const { schema, customValidations = [], validateOnChange = false } = config;
  
  const [validationState, setValidationState] = useState<ValidationResult<T>>({
    isValid: true,
    errors: [],
    fieldErrors: {} as Record<keyof T, string>
  });

  const validateData = useCallback((data: T): ValidationResult<T> => {
    const errors: string[] = [];
    const fieldErrors: Record<keyof T, string> = {} as Record<keyof T, string>;

    // Validação com Zod Schema
    if (schema) {
      try {
        schema.parse(data);
      } catch (error) {
        if (error instanceof z.ZodError) {
          error.errors.forEach((err) => {
            const path = err.path.join('.') as keyof T;
            fieldErrors[path] = err.message;
            errors.push(`${path}: ${err.message}`);
          });
        }
      }
    }

    // Validações customizadas
    customValidations.forEach((validation) => {
      const result = validation(data);
      if (!result.isValid) {
        errors.push(...result.errors);
        Object.assign(fieldErrors, result.fieldErrors);
      }
    });

    const result: ValidationResult<T> = {
      isValid: errors.length === 0,
      errors,
      fieldErrors
    };

    if (validateOnChange) {
      setValidationState(result);
    }

    return result;
  }, [schema, customValidations, validateOnChange]);

  const validateField = useCallback((fieldName: keyof T, value: any, fullData: T): string | undefined => {
    if (!schema) return undefined;

    try {
      // Cria um objeto temporário com apenas o campo sendo validado
      const tempData = { ...fullData, [fieldName]: value };
      schema.parse(tempData);
      return undefined;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldError = error.errors.find(err => 
          err.path.length === 1 && err.path[0] === fieldName
        );
        return fieldError?.message;
      }
    }
    return undefined;
  }, [schema]);

  const getFieldError = useCallback((fieldName: keyof T): string | undefined => {
    return validationState.fieldErrors[fieldName];
  }, [validationState.fieldErrors]);

  const hasFieldError = useCallback((fieldName: keyof T): boolean => {
    return !!validationState.fieldErrors[fieldName];
  }, [validationState.fieldErrors]);

  const clearErrors = useCallback(() => {
    setValidationState({
      isValid: true,
      errors: [],
      fieldErrors: {} as Record<keyof T, string>
    });
  }, []);

  return {
    // Estado atual
    validationState,
    isValid: validationState.isValid,
    errors: validationState.errors,
    fieldErrors: validationState.fieldErrors,

    // Funções de validação
    validateData,
    validateField,
    getFieldError,
    hasFieldError,
    clearErrors,

    // Helpers
    hasErrors: validationState.errors.length > 0,
    errorCount: validationState.errors.length,
    firstError: validationState.errors[0],
  };
};