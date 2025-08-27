/**
 * Hook para Scanner Contextual Inteligente
 * Identifica automaticamente tipo de código (fardo vs unidade vs produto)
 */

import { useCallback, useState } from 'react';
import { useBarcode } from './use-barcode';
import { useBarcodeHierarchy } from './useBarcodeHierarchy';
import { useEntityList } from '@/shared/hooks/common/use-entity';
import type { 
  Product, 
  BarcodeValidation,
  BarcodeHierarchyValidation 
} from '@/core/types/inventory.types';

export type ScanContext = 'product_registration' | 'batch_creation' | 'sales' | 'receiving' | 'inventory_check';
export type BarcodeType = 'product_main' | 'product_package' | 'batch_instance' | 'unknown';

export interface ContextualScanResult {
  isValid: boolean;
  barcodeType: BarcodeType;
  product?: Product;
  confidence: number; // 0-100
  suggestions: string[];
  actions: ContextualAction[];
  warnings?: string[];
  hierarchy?: {
    level: 'product' | 'package' | 'unit';
    parentCode?: string;
    childCodes?: string[];
  };
}

export interface ContextualAction {
  type: 'register_product' | 'create_batch' | 'sell_product' | 'update_stock' | 'view_details';
  label: string;
  priority: 'high' | 'medium' | 'low';
  enabled: boolean;
  data?: any;
}

export const useContextualScanner = (context: ScanContext) => {
  const [lastScanResult, setLastScanResult] = useState<ContextualScanResult | null>(null);
  const [scanHistory, setScanHistory] = useState<ContextualScanResult[]>([]);

  // Hooks de validação
  const { validateBarcode } = useBarcode();
  const { validateHierarchy } = useBarcodeHierarchy();

  // Query para produtos
  const { data: products = [] } = useEntityList({
    table: 'products',
    select: 'id, name, category, barcode, package_barcode, unit_barcode, has_package_tracking, has_unit_tracking, stock_quantity'
  });

  // Função principal de análise contextual
  const analyzeBarcode = useCallback((scannedCode: string): ContextualScanResult => {
    // Validação básica do código
    const basicValidation = validateBarcode(scannedCode);
    
    if (!basicValidation.isValid) {
      return {
        isValid: false,
        barcodeType: 'unknown',
        confidence: 0,
        suggestions: ['Verifique se o código foi escaneado corretamente'],
        actions: []
      };
    }

    // Buscar correspondências nos produtos
    const productMatches = {
      main: products.find(p => p.barcode === scannedCode),
      package: products.find(p => p.package_barcode === scannedCode)
    };

    let result: ContextualScanResult;

    // Determinar tipo e confiança baseado nas correspondências
    if (productMatches.main) {
      result = analyzeMainProductCode(productMatches.main, scannedCode, context);
    } else if (productMatches.package) {
      result = analyzePackageCode(productMatches.package, scannedCode, context);
    } else {
      result = analyzeUnknownCode(scannedCode, context);
    }

    // Adicionar ao histórico
    setScanHistory(prev => [result, ...prev.slice(0, 9)]); // Manter apenas últimos 10
    setLastScanResult(result);

    return result;
  }, [products, validateBarcode, context]);

  // Análise de código principal do produto
  const analyzeMainProductCode = (product: Product, code: string, context: ScanContext): ContextualScanResult => {
    const actions: ContextualAction[] = [];

    switch (context) {
      case 'sales':
        actions.push({
          type: 'sell_product',
          label: 'Adicionar ao Carrinho',
          priority: 'high',
          enabled: product.stock_quantity > 0,
          data: { product, quantity: 1 }
        });
        break;
      
      case 'batch_creation':
      case 'receiving':
        actions.push({
          type: 'create_batch',
          label: 'Criar Novo Lote',
          priority: 'high',
          enabled: true,
          data: { product }
        });
        break;
      
      case 'inventory_check':
        actions.push({
          type: 'view_details',
          label: 'Ver Detalhes do Produto',
          priority: 'medium',
          enabled: true,
          data: { product }
        });
        break;
    }

    return {
      isValid: true,
      barcodeType: 'product_main',
      product,
      confidence: 95,
      suggestions: [`Produto identificado: ${product.name}`],
      actions,
      hierarchy: {
        level: 'product',
        childCodes: [product.package_barcode].filter(Boolean) as string[]
      }
    };
  };

  // Análise de código de fardo/pacote
  const analyzePackageCode = (product: Product, code: string, context: ScanContext): ContextualScanResult => {
    const actions: ContextualAction[] = [];
    const suggestions = [`Código de fardo identificado para: ${product.name}`];

    if (product.has_package_tracking) {
      suggestions.push(`Produto configurado para rastreamento por fardo`);
      suggestions.push(`Unidades por fardo: ${product.package_units || 1}`);
    }

    switch (context) {
      case 'sales':
        actions.push({
          type: 'sell_product',
          label: `Vender Fardo (${product.package_units || 1} unidades)`,
          priority: 'high',
          enabled: product.stock_quantity >= (product.package_units || 1),
          data: { product, quantity: product.package_units || 1, type: 'package' }
        });
        break;
      
      case 'batch_creation':
        actions.push({
          type: 'create_batch',
          label: 'Criar Lote (Fardo)',
          priority: 'high',
          enabled: true,
          data: { product, scanType: 'package' }
        });
        break;
    }

    return {
      isValid: true,
      barcodeType: 'product_package',
      product,
      confidence: 90,
      suggestions,
      actions,
      hierarchy: {
        level: 'package',
        parentCode: product.barcode
      }
    };
  };


  // Análise de código desconhecido
  const analyzeUnknownCode = (code: string, context: ScanContext): ContextualScanResult => {
    const suggestions: string[] = [];
    const actions: ContextualAction[] = [];

    // Sugestões baseadas no contexto
    if (context === 'product_registration') {
      suggestions.push('Código não encontrado - pode ser um produto novo');
      actions.push({
        type: 'register_product',
        label: 'Cadastrar Novo Produto',
        priority: 'medium',
        enabled: true,
        data: { suggestedBarcode: code }
      });
    } else {
      suggestions.push('Código não encontrado no sistema');
      suggestions.push('Verifique se o produto está cadastrado');
    }

    // Análise de padrão para sugestões adicionais
    if (code.length === 13 && /^\d+$/.test(code)) {
      suggestions.push('Formato EAN-13 detectado');
    } else if (code.length === 8 && /^\d+$/.test(code)) {
      suggestions.push('Formato EAN-8 detectado');
    }

    return {
      isValid: false,
      barcodeType: 'unknown',
      confidence: 0,
      suggestions,
      actions,
      warnings: ['Produto não encontrado no sistema']
    };
  };

  // Função para scanner inteligente baseado no contexto
  const smartScan = useCallback(async (code: string) => {
    return analyzeBarcode(code);
  }, [analyzeBarcode]);

  // Função para obter sugestões de ação baseadas no contexto
  const getContextualSuggestions = useCallback((result: ContextualScanResult) => {
    const suggestions: string[] = [...result.suggestions];

    if (result.product && result.isValid) {
      switch (context) {
        case 'sales':
          if (result.product.stock_quantity === 0) {
            suggestions.push('⚠️ Produto sem estoque');
          } else if (result.product.stock_quantity <= result.product.minimum_stock) {
            suggestions.push('⚠️ Estoque baixo');
          }
          break;
        
        case 'batch_creation':
          if (!result.product.has_package_tracking && !result.product.has_unit_tracking) {
            suggestions.push('💡 Configure rastreamento hierárquico para melhor controle');
          }
          break;
      }
    }

    return suggestions;
  }, [context]);

  return {
    // Funções principais
    smartScan,
    analyzeBarcode,
    getContextualSuggestions,

    // Estado
    lastScanResult,
    scanHistory,

    // Utilitários
    clearHistory: () => {
      setScanHistory([]);
      setLastScanResult(null);
    },
    
    // Estatísticas da sessão
    getSessionStats: () => ({
      totalScans: scanHistory.length,
      successfulScans: scanHistory.filter(s => s.isValid).length,
      uniqueProducts: new Set(scanHistory.filter(s => s.product).map(s => s.product!.id)).size,
      averageConfidence: scanHistory.length > 0 
        ? scanHistory.reduce((sum, s) => sum + s.confidence, 0) / scanHistory.length 
        : 0
    })
  };
};