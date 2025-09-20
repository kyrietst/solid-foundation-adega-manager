/**
 * Card ULTRA SIMPLIFICADO para gestão de estoque
 * Apenas 2 números: Pacotes e Unidades Soltas
 * Zero complexidade, zero conversões
 */

import React from 'react';
import { Button } from '@/shared/ui/primitives/button';
import { Badge } from '@/shared/ui/primitives/badge';
import { Eye, Edit, Package, Box, AlertTriangle } from 'lucide-react';
import { cn } from '@/core/config/utils';
import { getHoverTransformClasses } from '@/core/config/theme-utils';
import { useGlassmorphismEffect } from '@/shared/hooks/ui/useGlassmorphismEffect';
import type { Product } from '@/types/inventory.types';

interface InventoryCardProps {
  product: Product;
  onViewDetails: (product: Product) => void;
  onEdit: (product: Product) => void;
  onAdjustStock?: (product: Product) => void;
  variant?: 'default' | 'premium' | 'success' | 'warning' | 'error';
  glassEffect?: boolean;
}

// Função ultra simples para status do estoque
const getSimpleStockStatus = (packages: number, units: number, minStock: number = 10) => {
  const total = packages + units;
  if (total === 0) return { status: 'out', label: 'Sem Estoque', color: 'bg-red-500/20 text-red-400 border-red-400/30' };
  if (total <= minStock) return { status: 'low', label: 'Estoque Baixo', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-400/30' };
  return { status: 'available', label: 'Disponível', color: 'bg-green-500/20 text-green-400 border-green-400/30' };
};

export const InventoryCard: React.FC<InventoryCardProps> = ({
  product,
  onViewDetails,
  onEdit,
  onAdjustStock,
  variant = 'default',
  glassEffect = true,
}) => {
  // SISTEMA ULTRA SIMPLIFICADO - apenas 2 números
  const stockPackages = product.stock_packages || 0;
  const stockUnitsLoose = product.stock_units_loose || 0;

  const stockStatus = getSimpleStockStatus(stockPackages, stockUnitsLoose, product.minimum_stock || 10);
  const { handleMouseMove } = useGlassmorphismEffect();

  // Classes para glass morphism
  const glassClasses = glassEffect ? 'bg-black/70 backdrop-blur-md border border-white/20 shadow-[0_8px_24px_rgba(0,0,0,0.6)]' : 'bg-gray-800 border border-gray-700';

  return (
    <div
      className={cn(
        "group hero-spotlight rounded-2xl text-card-foreground transition-all duration-300",
        getHoverTransformClasses('lift'),
        glassClasses,
        "overflow-hidden",
        "hover:shadow-2xl hover:shadow-purple-500/20 hover:border-purple-400/60"
      )}
      onMouseMove={handleMouseMove}
    >
      {/* Imagem do produto com status overlay */}
      <div className="relative h-32 bg-gray-700/50 flex items-center justify-center">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <Package className="h-12 w-12 text-gray-400" />
        )}

        {/* Badge de status no canto superior direito */}
        <div className="absolute top-2 right-2">
          <Badge className={cn("text-xs font-medium", stockStatus.color)}>
            {stockStatus.label}
          </Badge>
        </div>
      </div>

      {/* Informações do produto */}
      <div className="p-4 space-y-3">
        {/* Nome do produto */}
        <div>
          <h3 className="font-semibold text-gray-100 line-clamp-2 text-sm">
            {product.name}
          </h3>
          <p className="text-xs text-gray-400 truncate">
            {product.barcode || 'Sem código'}
          </p>
        </div>

        {/* ESTOQUE ULTRA SIMPLIFICADO - APENAS 2 NÚMEROS */}
        <div className="grid grid-cols-2 gap-2">
          {/* Pacotes */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-2">
            <div className="flex items-center gap-1">
              <Box className="h-3 w-3 text-blue-400" />
              <span className="text-xs text-blue-400">Pacotes</span>
            </div>
            <p className="text-lg font-bold text-blue-400">
              {stockPackages}
            </p>
          </div>

          {/* Unidades Soltas */}
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-2">
            <div className="flex items-center gap-1">
              <Package className="h-3 w-3 text-green-400" />
              <span className="text-xs text-green-400">Unidades</span>
            </div>
            <p className="text-lg font-bold text-green-400">
              {stockUnitsLoose}
            </p>
          </div>
        </div>

        {/* Alerta de estoque baixo */}
        {stockStatus.status === 'low' && (
          <div className="flex items-center gap-1 text-xs text-yellow-400">
            <AlertTriangle className="h-3 w-3" />
            <span>Estoque baixo (Mín: {product.minimum_stock || 10})</span>
          </div>
        )}

        {/* Ações operacionais simplificadas */}
        <div className="flex gap-1 pt-2">
          <Button
            onClick={() => onViewDetails(product)}
            size="sm"
            variant="outline"
            className="flex-1 bg-gray-800/60 border-gray-600 text-gray-100 hover:bg-gray-700/80 transition-all duration-200 text-xs"
          >
            <Eye className="h-3 w-3 mr-1" />
            Ver
          </Button>

          <Button
            onClick={() => onEdit(product)}
            size="sm"
            variant="outline"
            className="flex-1 bg-yellow-400/10 border-yellow-400/30 text-yellow-400 hover:bg-yellow-400/20 transition-all duration-200 text-xs"
          >
            <Edit className="h-3 w-3 mr-1" />
            Editar
          </Button>
        </div>

        {/* Botão de ajuste de estoque (se disponível) */}
        {onAdjustStock && (
          <Button
            onClick={() => onAdjustStock(product)}
            size="sm"
            variant="ghost"
            className="w-full text-gray-400 hover:text-gray-100 hover:bg-gray-800/60 transition-all duration-200 text-xs"
          >
            📦 Ajustar
          </Button>
        )}
      </div>
    </div>
  );
};

export default InventoryCard;