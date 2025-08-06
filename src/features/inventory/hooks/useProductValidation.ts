/**
 * Hook para validações de produto
 * Centraliza todas as regras de validação de produto
 */

import { ProductFormData } from '@/types/inventory.types';

export interface ProductValidationResult {
  isValid: boolean;
  errors: string[];
  fieldErrors: Record<string, string>;
}

export const useProductValidation = () => {
  const validateProduct = (formData: Partial<ProductFormData>): ProductValidationResult => {
    const errors: string[] = [];
    const fieldErrors: Record<string, string> = {};

    // Validações obrigatórias
    if (!formData.name?.trim()) {
      errors.push('Nome do produto é obrigatório');
      fieldErrors.name = 'Nome é obrigatório';
    }

    if (!formData.category?.trim()) {
      errors.push('Categoria é obrigatória');
      fieldErrors.category = 'Categoria é obrigatória';
    }

    if (!formData.price || formData.price <= 0) {
      errors.push('Preço de venda deve ser maior que zero');
      fieldErrors.price = 'Preço deve ser maior que zero';
    }

    if (formData.stock_quantity === undefined || formData.stock_quantity < 0) {
      errors.push('Estoque atual deve ser maior ou igual a zero');
      fieldErrors.stock_quantity = 'Estoque deve ser maior ou igual a zero';
    }

    if (formData.minimum_stock === undefined || formData.minimum_stock < 0) {
      errors.push('Estoque mínimo deve ser maior ou igual a zero');
      fieldErrors.minimum_stock = 'Estoque mínimo deve ser maior ou igual a zero';
    }

    // Validações condicionais
    if (formData.cost_price && formData.cost_price < 0) {
      errors.push('Preço de custo deve ser maior ou igual a zero');
      fieldErrors.cost_price = 'Preço de custo não pode ser negativo';
    }

    if (formData.margin_percent && formData.margin_percent < 0) {
      errors.push('Margem deve ser maior ou igual a zero');
      fieldErrors.margin_percent = 'Margem não pode ser negativa';
    }

    if (formData.package_size && formData.package_size <= 0) {
      errors.push('Unidades por pacote deve ser maior que zero');
      fieldErrors.package_size = 'Deve ser maior que zero';
    }

    if (formData.vintage && (formData.vintage < 1900 || formData.vintage > new Date().getFullYear())) {
      errors.push('Safra deve estar entre 1900 e o ano atual');
      fieldErrors.vintage = 'Safra inválida';
    }

    if (formData.alcohol_content && (formData.alcohol_content < 0 || formData.alcohol_content > 100)) {
      errors.push('Teor alcoólico deve estar entre 0 e 100%');
      fieldErrors.alcohol_content = 'Teor alcoólico inválido';
    }

    if (formData.volume_ml && formData.volume_ml <= 0) {
      errors.push('Volume deve ser maior que zero');
      fieldErrors.volume_ml = 'Volume deve ser maior que zero';
    }

    if (formData.barcode && formData.barcode.length > 0 && formData.barcode.length < 8) {
      errors.push('Código de barras deve ter pelo menos 8 dígitos');
      fieldErrors.barcode = 'Código muito curto';
    }

    // Validação de URL de imagem
    if (formData.image_url && formData.image_url.trim()) {
      try {
        new URL(formData.image_url);
      } catch {
        errors.push('URL da imagem inválida');
        fieldErrors.image_url = 'URL inválida';
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      fieldErrors
    };
  };

  const getFieldError = (fieldErrors: Record<string, string>, field: string): string | undefined => {
    return fieldErrors[field];
  };

  return {
    validateProduct,
    getFieldError
  };
};