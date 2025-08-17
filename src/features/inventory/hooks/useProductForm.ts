/**
 * Hook para gerenciar estado do formulário de produto
 * Centraliza lógica de estado do formulário
 */

import { useState, useEffect } from 'react';
import { ProductFormData, UnitType } from '@/types/inventory.types';

export const useProductForm = (initialData: Partial<ProductFormData> = {}) => {
  // Criar valores padrão sem sobrescrever dados válidos do initialData
  const defaultValues = {
    name: '',
    description: '',
    category: '',
    price: 0,
    cost_price: 0,
    margin_percent: 0,
    stock_quantity: 0,
    minimum_stock: 5,
    supplier: '',
    producer: '',
    country: '',
    region: '',
    vintage: undefined,
    alcohol_content: undefined,
    volume_ml: undefined,
    image_url: '',
    unit_type: 'un' as UnitType,
    package_size: 1,
    package_price: undefined,
    package_margin: undefined,
    barcode: '',
    // Novos campos da História 1.1 e 1.3
    measurement_type: undefined,
    measurement_value: undefined,
    is_package: false,
    units_per_package: 1,
  };

  // Merge inteligente: só usar defaults quando initialData não tem o campo ou é null/undefined
  const mergeWithDefaults = (defaults: any, initial: any) => {
    const result = { ...defaults };
    Object.keys(initial).forEach(key => {
      if (initial[key] !== null && initial[key] !== undefined && initial[key] !== '') {
        result[key] = initial[key];
      }
    });
    return result;
  };

  const initialFormData = mergeWithDefaults(defaultValues, initialData);
  
  // Debug: remover logs em produção
  
  const [formData, setFormData] = useState<Partial<ProductFormData>>(initialFormData);

  // Atualizar form quando initialData muda (importante para modal de edição)
  useEffect(() => {
    const newFormData = mergeWithDefaults(defaultValues, initialData);
    // Debug: atualizando formData quando initialData muda
    setFormData(newFormData);
  }, [initialData]);

  const handleInputChange = (field: keyof ProductFormData, value: string | number | UnitType | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    // Para edição, resetar para dados iniciais; para criação, resetar para vazio
    setFormData(mergeWithDefaults(defaultValues, initialData));
  };

  const updateFormData = (updates: Partial<ProductFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  return {
    formData,
    handleInputChange,
    resetForm,
    updateFormData,
    setFormData
  };
};