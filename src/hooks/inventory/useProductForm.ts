/**
 * Hook para gerenciar estado do formulário de produto
 * Centraliza lógica de estado do formulário
 */

import { useState } from 'react';
import { ProductFormData, UnitType } from '@/types/inventory.types';

export const useProductForm = (initialData: Partial<ProductFormData> = {}) => {
  const [formData, setFormData] = useState<Partial<ProductFormData>>({
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
    ...initialData
  });

  const handleInputChange = (field: keyof ProductFormData, value: string | number | UnitType) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
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
      ...initialData
    });
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