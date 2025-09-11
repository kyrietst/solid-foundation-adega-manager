/**
 * useProductSelection.ts - Hook para gerenciar a seleção de produtos (unidade vs pacote)
 * Centraliza a lógica de validação e processamento da seleção de produtos
 */

import { useState, useCallback, useMemo } from 'react';
import type { Product } from '@/types/inventory.types';
import type { ProductSelectionData } from '../components/ProductSelectionModal';

export interface UseProductSelectionResult {
  // Estado do modal
  isModalOpen: boolean;
  selectedProduct: Product | null;
  
  // Ações
  openProductSelection: (product: Product) => void;
  closeProductSelection: () => void;
  
  // Validações
  canSellAsPackage: (product: Product) => boolean;
  shouldShowSelection: (product: Product) => boolean;
  
  // Cálculos
  calculatePackageInfo: (product: Product) => {
    packageUnits: number;
    completePackages: number;
    remainingUnits: number;
    packagePrice: number;
    canSellPackages: boolean;
  };
}

export const useProductSelection = (): UseProductSelectionResult => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Abrir modal de seleção
  const openProductSelection = useCallback((product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  }, []);

  // Fechar modal
  const closeProductSelection = useCallback(() => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  }, []);

  // Verificar se produto pode ser vendido como pacote
  const canSellAsPackage = useCallback((product: Product): boolean => {
    if (!product.has_package_tracking) return false;
    if (!product.package_units || product.package_units <= 1) return false;
    
    const completePackages = Math.floor(product.stock_quantity / product.package_units);
    return completePackages > 0;
  }, []);

  // Verificar se deve mostrar modal de seleção
  const shouldShowSelection = useCallback((product: Product): boolean => {
    // Se não tem rastreamento de pacote, vai direto como unidade
    if (!product.has_package_tracking) return false;
    
    // Se não tem package_units configurado, vai direto como unidade
    if (!product.package_units || product.package_units <= 1) return false;
    
    // Se não tem estoque suficiente nem para unidade nem para pacote, não mostra
    if (product.stock_quantity <= 0) return false;
    
    // Se chegou até aqui, mostra o modal de seleção
    return true;
  }, []);

  // Calcular informações do pacote
  const calculatePackageInfo = useCallback((product: Product) => {
    const packageUnits = product.package_units || 1;
    const completePackages = Math.floor(product.stock_quantity / packageUnits);
    const remainingUnits = product.stock_quantity % packageUnits;
    const packagePrice = product.package_price || (product.price * packageUnits);
    const canSellPackages = completePackages > 0;
    
    return {
      packageUnits,
      completePackages,
      remainingUnits,
      packagePrice,
      canSellPackages
    };
  }, []);

  return {
    isModalOpen,
    selectedProduct,
    openProductSelection,
    closeProductSelection,
    canSellAsPackage,
    shouldShowSelection,
    calculatePackageInfo
  };
};

// Hook adicional para validação de seleção
export const useSelectionValidation = (product: Product | null) => {
  return useMemo(() => {
    if (!product) {
      return {
        isValidProduct: false,
        errors: ['Produto não encontrado']
      };
    }

    const errors: string[] = [];

    // Validações básicas
    if (product.stock_quantity <= 0) {
      errors.push('Produto sem estoque disponível');
    }

    if (!product.price || product.price <= 0) {
      errors.push('Produto sem preço configurado');
    }

    // Validações de pacote se necessário
    if (product.has_package_tracking) {
      if (!product.package_units || product.package_units <= 0) {
        errors.push('Unidades por pacote não configuradas');
      }

      if (!product.package_price || product.package_price <= 0) {
        // Se não tem preço de pacote, pode usar preço unitário * unidades
        const calculatedPackagePrice = product.price * (product.package_units || 1);
        if (calculatedPackagePrice <= 0) {
          errors.push('Preço de pacote não pode ser calculado');
        }
      }
    }

    return {
      isValidProduct: errors.length === 0,
      errors
    };
  }, [product]);
};

// Utilitário para converter seleção para formato do carrinho
export const convertSelectionToCartItem = (
  product: Product, 
  selection: ProductSelectionData
) => {
  const cartItem = {
    id: product.id,
    name: product.name,
    price: selection.price,
    maxQuantity: product.stock_quantity,
    type: selection.type,
    packageUnits: selection.packageUnits,
    quantity: selection.quantity
  };
  
  
  return cartItem;
};