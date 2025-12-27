/**
 * Hook para gerenciar estado do formulário de produto
 * Centraliza lógica de estado do formulário
 */

import { useState, useEffect } from 'react';
import { ProductFormData, UnitType } from '@/core/types/inventory.types';

export const useProductForm = (initialData: Partial<ProductFormData> = {}) => {
  // TESTE: Valores padrão simples e estáticos
  const defaultFormData = {
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
    measurement_type: undefined,
    measurement_value: undefined,
    is_package: false,
    units_per_package: 1,
    // Novos campos hierárquicos - Sistema de Validade
    package_barcode: '',
    unit_barcode: '',
    package_units: 1,
    packaging_type: 'fardo',
    has_package_tracking: false,
    has_unit_tracking: false,

    // Campos Fiscais
    ncm: '',
    cest: '',
    cfop: '',
    origin: '',

    ...initialData // Merge simples
  } as unknown as Partial<ProductFormData>;

  const [formData, setFormData] = useState<Partial<ProductFormData>>(defaultFormData);

  const handleInputChange = (field: keyof ProductFormData, value: string | number | UnitType | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    // TESTE: Reset simples
    setFormData(defaultFormData);
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