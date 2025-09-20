/**
 * ProductStockDisplay.tsx - Visualização ULTRA SIMPLIFICADA do estoque atual
 * Apenas 2 números: Pacotes e Unidades Soltas
 * Zero complexidade, zero conversões
 */

import React from 'react';
import { LoadingSpinner } from '@/shared/ui/composite/loading-spinner';
import { Package, Box, AlertTriangle, Info } from 'lucide-react';

interface SimpleProduct {
  id: string;
  name: string;
  stock_packages: number;
  stock_units_loose: number;
  minimum_stock?: number;
}

interface ProductStockDisplayProps {
  product: SimpleProduct | null;
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

  const totalEstoque = (product.stock_packages || 0) + (product.stock_units_loose || 0);
  const estoqueAbaixo = totalEstoque < (product.minimum_stock || 5);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Package className="h-5 w-5 text-blue-400" />
        <h3 className="text-lg font-semibold text-white">Estoque Atual</h3>
      </div>

      {/* Estoque Simplificado - Apenas 2 números */}
      <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-600">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Pacotes */}
          <div className="flex items-center justify-between p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <div className="flex items-center gap-3">
              <Box className="h-6 w-6 text-blue-400" />
              <div>
                <h4 className="text-white font-medium">Pacotes</h4>
                <p className="text-gray-400 text-sm">Pacotes fechados</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-3xl font-bold text-blue-400">
                {product.stock_packages || 0}
              </span>
              <p className="text-gray-400 text-sm">pacotes</p>
            </div>
          </div>

          {/* Unidades Soltas */}
          <div className="flex items-center justify-between p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <div className="flex items-center gap-3">
              <Package className="h-6 w-6 text-green-400" />
              <div>
                <h4 className="text-white font-medium">Unidades Soltas</h4>
                <p className="text-gray-400 text-sm">Unidades avulsas</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-3xl font-bold text-green-400">
                {product.stock_units_loose || 0}
              </span>
              <p className="text-gray-400 text-sm">unidades</p>
            </div>
          </div>

        </div>

        {/* Alerta de Estoque Baixo */}
        {estoqueAbaixo && (
          <div className="mt-4 flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <AlertTriangle className="h-4 w-4 text-yellow-400" />
            <div>
              <p className="text-yellow-400 font-medium">Estoque Baixo</p>
              <p className="text-gray-400 text-sm">
                Total em estoque: {totalEstoque} itens (Mínimo: {product.minimum_stock || 5})
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Informações do Sistema Simplificado */}
      <div className="bg-gray-800/20 rounded-lg p-3 border border-gray-600/50">
        <div className="flex items-center gap-2 text-gray-400 text-sm">
          <Info className="h-3 w-3" />
          <span>
            💡 Sistema Simplificado: Apenas 2 números - o que você tem na prateleira
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProductStockDisplay;