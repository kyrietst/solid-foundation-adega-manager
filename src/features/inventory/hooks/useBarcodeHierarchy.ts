/**
 * Hook para validação e gestão de códigos de barras hierárquicos
 * Suporte ao sistema de duplo código: Fardo/Pacote + Unidade Individual
 */

import { useCallback } from 'react';
import { useBarcode } from './use-barcode';
import type { 
  BarcodeHierarchyValidation, 
  BarcodeFormat,
  PackagingType 
} from '@/core/types/inventory.types';

export const useBarcodeHierarchy = () => {
  const { validateBarcode } = useBarcode();

  /**
   * Valida a consistência entre códigos de fardo e unidade
   */
  const validateHierarchy = useCallback((
    packageBarcode?: string, 
    unitBarcode?: string,
    packageUnits?: number
  ): BarcodeHierarchyValidation => {
    // Caso: Nenhum código definido
    if (!packageBarcode && !unitBarcode) {
      return { 
        isValid: true, 
        message: "Nenhum código de barras definido. Você pode adicionar códigos posteriormente." 
      };
    }

    // Caso: Apenas um código definido
    if (!packageBarcode || !unitBarcode) {
      const singleCode = packageBarcode || unitBarcode;
      const singleType = packageBarcode ? 'fardo' : 'unidade';
      const singleValidation = validateBarcode(singleCode!);
      
      return {
        isValid: singleValidation.isValid,
        message: singleValidation.isValid 
          ? `Código de ${singleType} validado com sucesso` 
          : `Código de ${singleType} inválido: ${singleValidation.error}`,
        [packageBarcode ? 'packageFormat' : 'unitFormat']: singleValidation.format,
        suggestion: singleValidation.isValid 
          ? `Considere adicionar também o código de ${packageBarcode ? 'unidade' : 'fardo'} para rastreamento completo`
          : undefined
      };
    }

    // Caso: Ambos códigos definidos - validação completa
    const warnings: string[] = [];

    // 1. Validar se são diferentes
    if (packageBarcode === unitBarcode) {
      return { 
        isValid: false, 
        message: "Códigos de fardo e unidade devem ser diferentes",
        suggestion: "Cada nível hierárquico deve ter seu código único"
      };
    }

    // 2. Validar formatos individuais
    const packageValidation = validateBarcode(packageBarcode);
    const unitValidation = validateBarcode(unitBarcode);

    if (!packageValidation.isValid) {
      return { 
        isValid: false, 
        message: `Código do fardo inválido: ${packageValidation.error}`,
        unitFormat: unitValidation.format
      };
    }

    if (!unitValidation.isValid) {
      return { 
        isValid: false, 
        message: `Código da unidade inválido: ${unitValidation.error}`,
        packageFormat: packageValidation.format
      };
    }

    // 3. Validações de consistência avançadas
    
    // Verificar se formatos fazem sentido hierárquico
    if (packageValidation.format === unitValidation.format) {
      warnings.push("Ambos códigos têm o mesmo formato. Certifique-se de que são realmente diferentes.");
    }

    // Verificar padrões comuns brasileiros
    if (packageValidation.format === 'EAN-13' && unitValidation.format === 'EAN-13') {
      const packagePrefix = packageBarcode.substring(0, 7);
      const unitPrefix = unitBarcode.substring(0, 7);
      
      if (packagePrefix === unitPrefix) {
        warnings.push("Códigos parecem ser da mesma família/lote. Isso é normal se são do mesmo fornecedor.");
      }
    }

    // Validar package_units se fornecido
    if (packageUnits && packageUnits > 100) {
      warnings.push(`${packageUnits} unidades por fardo é um número alto. Verifique se está correto.`);
    }

    return {
      isValid: true,
      message: "Códigos hierárquicos validados com sucesso",
      packageFormat: packageValidation.format,
      unitFormat: unitValidation.format,
      warnings: warnings.length > 0 ? warnings : undefined,
      suggestion: warnings.length === 0 
        ? "Configuração ideal! Você terá rastreabilidade completa do fardo à unidade."
        : undefined
    };
  }, [validateBarcode]);

  /**
   * Sugere código de unidade baseado no código do fardo
   */
  const suggestUnitBarcode = useCallback((packageBarcode: string): string | null => {
    if (!packageBarcode || packageBarcode.length < 8) return null;

    const validation = validateBarcode(packageBarcode);
    if (!validation.isValid) return null;

    // Estratégias de sugestão baseadas no formato
    switch (validation.format) {
      case 'EAN-13':
        // Para EAN-13, sugerir mudança no último dígito antes do check digit
        if (packageBarcode.length === 13) {
          const base = packageBarcode.substring(0, 11);
          const lastDigit = parseInt(packageBarcode[11]);
          const newLastDigit = (lastDigit + 1) % 10;
          const suggestion = base + newLastDigit;
          
          // Recalcular check digit
          let sum = 0;
          for (let i = 0; i < 12; i++) {
            sum += parseInt(suggestion[i]) * (i % 2 === 0 ? 1 : 3);
          }
          const checkDigit = (10 - (sum % 10)) % 10;
          
          return suggestion + checkDigit;
        }
        break;
        
      case 'EAN-8':
        // Para EAN-8, similar estratégia
        if (packageBarcode.length === 8) {
          const base = packageBarcode.substring(0, 6);
          const lastDigit = parseInt(packageBarcode[6]);
          const newLastDigit = (lastDigit + 1) % 10;
          const suggestion = base + newLastDigit;
          
          // Recalcular check digit para EAN-8
          let sum = 0;
          for (let i = 0; i < 7; i++) {
            sum += parseInt(suggestion[i]) * (i % 2 === 0 ? 3 : 1);
          }
          const checkDigit = (10 - (sum % 10)) % 10;
          
          return suggestion + checkDigit;
        }
        break;
        
      default:
        // Para outros formatos, simplesmente incrementar último dígito
        const lastChar = packageBarcode[packageBarcode.length - 1];
        if (/\d/.test(lastChar)) {
          const lastDigit = parseInt(lastChar);
          const newDigit = (lastDigit + 1) % 10;
          return packageBarcode.substring(0, packageBarcode.length - 1) + newDigit;
        }
        break;
    }

    return null;
  }, [validateBarcode]);

  /**
   * Sugere tipo de embalagem baseado no código e categoria
   */
  const suggestPackagingType = useCallback((
    category?: string,
    packageUnits?: number
  ): PackagingType => {
    // Sugestões baseadas na categoria
    const categoryMapping: Record<string, PackagingType> = {
      'Cerveja': 'fardo',
      'Refrigerante': 'fardo', 
      'Destilados': 'caixa',
      'Gin': 'caixa',
      'Licor': 'caixa',
      'Espumante': 'display',
      'Outros': 'pacote'
    };

    if (category && categoryMapping[category]) {
      return categoryMapping[category];
    }

    // Sugestões baseadas na quantidade
    if (packageUnits) {
      if (packageUnits >= 24) return 'fardo';
      if (packageUnits >= 12) return 'caixa';
      if (packageUnits >= 6) return 'pacote';
      if (packageUnits >= 2) return 'display';
    }

    return 'fardo'; // Default
  }, []);

  /**
   * Calcula estatísticas da hierarquia
   */
  const calculateHierarchyStats = useCallback((
    stockQuantity: number,
    packageUnits?: number
  ) => {
    if (!packageUnits || packageUnits <= 1) {
      return {
        total_units_in_stock: stockQuantity,
        packages_in_stock: stockQuantity,
        partial_package_units: 0,
        is_partial_package: false
      };
    }

    const packages_in_stock = Math.floor(stockQuantity / packageUnits);
    const partial_package_units = stockQuantity % packageUnits;
    
    return {
      total_units_in_stock: stockQuantity,
      packages_in_stock,
      partial_package_units,
      is_partial_package: partial_package_units > 0,
      complete_packages: packages_in_stock,
      incomplete_packages: partial_package_units > 0 ? 1 : 0
    };
  }, []);

  return {
    validateHierarchy,
    suggestUnitBarcode,
    suggestPackagingType,
    calculateHierarchyStats
  };
};

export default useBarcodeHierarchy;