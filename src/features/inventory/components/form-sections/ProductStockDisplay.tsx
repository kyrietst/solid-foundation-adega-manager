/**
 * ProductStockDisplay.tsx - Visualização read-only do estoque atual
 * Context7 Pattern: Presentation Component para dados de estoque
 * Componente puro focado apenas em exibição
 */

import React from 'react';
import { VariantStockDisplay } from '@/features/inventory/components/VariantStockDisplay';
import { LoadingSpinner } from '@/shared/ui/composite/loading-spinner';
import { Package, TrendingUp, AlertTriangle, Info } from 'lucide-react';

interface ProductWithVariants {
  id: string;
  name: string;
  has_unit_tracking: boolean;
  has_package_tracking: boolean;
  units_per_package?: number;
  unit_stock?: number;
  package_stock?: number;
  variants?: Array<{
    id: string;
    variant_type: 'unit' | 'package';
    stock_quantity: number;
    barcode: string;
  }>;
}

interface ProductStockDisplayProps {
  product: ProductWithVariants | null;
  isLoading: boolean;
}

export const ProductStockDisplay: React.FC<ProductStockDisplayProps> = ({
  product,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Estoque Atual</h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Estoque Atual</h3>
        </div>
        <div className="bg-gray-800/30 rounded-lg p-6 border border-gray-600">
          <div className="flex items-center gap-2 text-gray-400">
            <Info className="h-4 w-4" />
            <span>Carregando informações do produto...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Package className="h-5 w-5 text-blue-400" />
        <h3 className="text-lg font-semibold text-white">Estoque Atual</h3>
      </div>

      {/* Informações de Estoque */}
      <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-600">
        <div className="space-y-4">
          {/* Estoque por Unidade */}
          {product.has_unit_tracking && (
            <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
              <div className="flex items-center gap-3">
                <Package className="h-4 w-4 text-green-400" />
                <div>
                  <h4 className="text-white font-medium">Estoque Unitário</h4>
                  <p className="text-gray-400 text-sm">Disponível para venda individual</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-green-400">
                  {product.unit_stock || 0}
                </span>
                <p className="text-gray-400 text-sm">unidades</p>
              </div>
            </div>
          )}

          {/* Estoque por Pacote */}
          {product.has_package_tracking && (
            <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-4 w-4 text-blue-400" />
                <div>
                  <h4 className="text-white font-medium">Estoque de Pacotes</h4>
                  <p className="text-gray-400 text-sm">
                    {product.units_per_package || 'N/A'} unidades por pacote
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-blue-400">
                  {product.package_stock || 0}
                </span>
                <p className="text-gray-400 text-sm">pacotes</p>
              </div>
            </div>
          )}

          {/* Alerta de Estoque Baixo */}
          {((product.unit_stock || 0) < 10 || (product.package_stock || 0) < 5) && (
            <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-yellow-400" />
              <div>
                <p className="text-yellow-400 font-medium">Estoque Baixo</p>
                <p className="text-gray-400 text-sm">
                  Consider restocking soon to avoid stockouts
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Componente de Variantes (se houver) */}
      {product.variants && product.variants.length > 0 && (
        <div className="border-t border-gray-600 pt-4">
          <h4 className="text-white font-medium mb-3">Detalhes das Variantes</h4>
          <VariantStockDisplay productId={product.id} />
        </div>
      )}

      {/* Informações Adicionais */}
      <div className="bg-gray-800/20 rounded-lg p-3 border border-gray-600/50">
        <div className="flex items-center gap-2 text-gray-400 text-sm">
          <Info className="h-3 w-3" />
          <span>
            Estas informações são atualizadas em tempo real com base nas vendas e movimentações
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProductStockDisplay;