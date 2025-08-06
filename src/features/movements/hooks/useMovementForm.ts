/**
 * Hook para gerenciar estado do formulário de movimentação
 * Centraliza lógica de estado e validações do formulário
 */

import { useState, useEffect } from 'react';
import { Product } from './useMovements';

export interface MovementFormData {
  type: string;
  product_id: string | undefined;
  quantity: string;
  reason: string;
  customer_id: string | undefined;
  amount: string;
  due_date: string;
  sale_id: string | undefined;
}

export const useMovementForm = (products: Product[] = []) => {
  const [form, setForm] = useState<MovementFormData>({
    type: 'out',
    product_id: undefined,
    quantity: '',
    reason: '',
    customer_id: undefined,
    amount: '',
    due_date: '',
    sale_id: undefined
  });

  // Map de produtos para cálculos
  const productsMap = products.reduce((acc, p) => {
    acc[p.id] = { name: p.name, price: p.price };
    return acc;
  }, {} as Record<string, { name: string; price: number }>);

  // Atualiza valor automaticamente para fiado
  useEffect(() => {
    if (form.type === 'fiado' && form.product_id && form.quantity) {
      const prod = productsMap[form.product_id];
      if (prod) {
        const total = parseFloat(form.quantity) * prod.price;
        if (!isNaN(total)) {
          setForm(prev => ({ ...prev, amount: total.toFixed(2) }));
        }
      }
    }
  }, [form.type, form.product_id, form.quantity, productsMap]);

  const updateForm = (updates: Partial<MovementFormData>) => {
    setForm(prev => ({ ...prev, ...updates }));
  };

  const resetForm = () => {
    setForm({
      type: 'out',
      product_id: undefined,
      quantity: '',
      reason: '',
      customer_id: undefined,
      amount: '',
      due_date: '',
      sale_id: undefined
    });
  };

  return {
    form,
    updateForm,
    resetForm,
    productsMap
  };
};