/**
 * Card específico para gestão de estoque
 * Foco em informações operacionais, não comerciais
 * REFATORADO: Utiliza exclusivamente dados da tabela 'products' (SSoT)
 */

import React from 'react';
import { Button } from '@/shared/ui/primitives/button';
import { Badge } from '@/shared/ui/primitives/badge';
import { Eye, Edit, Package, MapPin, TrendingUp, TrendingDown, Minus, Loader2 } from 'lucide-react';
import { cn } from '@/core/config/utils';
import { getHoverTransformClasses } from '@/core/config/theme-utils';
import { useGlassmorphismEffect } from '@/shared/hooks/ui/useGlassmorphismEffect';
import { calculatePackageDisplay } from '@/shared/utils/stockCalculations';
import type { Product } from '@/types/inventory.types';

interface InventoryCardProps {
  product: Product;
  onViewDetails: (product: Product) => void;
  onEdit: (product: Product) => void;
  onAdjustStock?: (product: Product) => void;
  variant?: 'default' | 'premium' | 'success' | 'warning' | 'error';
  glassEffect?: boolean;
}

// Função para determinar status do estoque
const getStockStatus = (currentStock: number, minStock: number = 10) => {
  if (currentStock === 0) return { status: 'out', label: 'Sem Estoque', color: 'bg-red-500/20 text-red-400 border-red-400/30' };
  if (currentStock <= minStock) return { status: 'low', label: 'Estoque Baixo', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-400/30' };
  if (currentStock > minStock * 3) return { status: 'excess', label: 'Excesso', color: 'bg-blue-500/20 text-blue-400 border-blue-400/30' };
  return { status: 'available', label: 'Disponível', color: 'bg-green-500/20 text-green-400 border-green-400/30' };
};

// Função para determinar análise de giro baseada nos dados reais
const getTurnoverAnalysis = (turnoverRate: string) => {
  switch (turnoverRate) {
    case 'fast':
      return { rate: 'Rápido', icon: TrendingUp, color: 'text-green-400' };
    case 'slow':
      return { rate: 'Devagar', icon: TrendingDown, color: 'text-red-400' };
    case 'medium':
    default:
      return { rate: 'Médio', icon: Minus, color: 'text-yellow-400' };
  }
};

export const InventoryCard: React.FC<InventoryCardProps> = ({
  product,
  onViewDetails,
  onEdit,
  onAdjustStock,
  variant = 'default',
  glassEffect = true,
}) => {
  // NOVO: Usar dados SSoT diretamente da tabela 'products'
  const stockQuantity = product.stock_quantity || 0;
  const packageUnits = product.package_units || 0;
  const hasPackageTracking = product.has_package_tracking;

  // Calcular informações de estoque usando função centralizada
  const stockDisplay = calculatePackageDisplay(stockQuantity, packageUnits);

  const stockStatus = getStockStatus(stockQuantity, product.minimum_stock || 10);
  const turnoverAnalysis = getTurnoverAnalysis(product.turnover_rate || 'medium');
  const TurnoverIcon = turnoverAnalysis.icon;
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
      <div className="relative h-48 bg-gray-700/50 flex items-center justify-center">
        {product.image_url ? (
          <img 
            src={product.image_url} 
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <Package className="h-16 w-16 text-gray-400" />
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
        {/* Nome e categoria */}
        <div>
          <h3 className="font-semibold text-gray-100 line-clamp-1">
            {product.name}
          </h3>
          <p className="text-sm text-gray-400">
            Código: {product.barcode || 'N/A'} | {product.category}
          </p>
        </div>

        {/* Informações de estoque SSoT */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Package className="h-4 w-4 text-yellow-400" />
            <span className="text-gray-300">
              Estoque: <span className="font-semibold text-gray-100">{stockQuantity}</span> un
            </span>
            {product.minimum_stock && (
              <span className="text-gray-400">
                | Mín: {product.minimum_stock} un
              </span>
            )}
          </div>

          {/* Breakdown de pacotes se habilitado */}
          {hasPackageTracking && stockDisplay.packages > 0 && (
            <div className="flex items-center gap-2 text-sm ml-6">
              <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30">
                <Package className="h-3 w-3 mr-1" />
                {stockDisplay.formatted}
              </Badge>
            </div>
          )}

          {/* Volume do produto */}
          <div className="flex items-center gap-2 text-sm">
            <Package className="h-4 w-4 text-purple-400" />
            <span className="text-gray-300">
              Volume: <span className="font-semibold text-gray-100">{product.volume_ml ? `${product.volume_ml}ml` : 'N/A'}</span>
            </span>
          </div>

          {/* Análise de giro */}
          <div className="flex items-center gap-2 text-sm">
            <TurnoverIcon className={cn("h-4 w-4", turnoverAnalysis.color)} />
            <span className="text-gray-300">
              Giro: <span className={cn("font-semibold", turnoverAnalysis.color)}>{turnoverAnalysis.rate}</span>
            </span>
          </div>
        </div>

        {/* Ações operacionais */}
        <div className="flex gap-2 pt-2">
          <Button
            onClick={() => onViewDetails(product)}
            size="sm"
            variant="outline"
            className="flex-1 bg-gray-800/60 border-gray-600 text-gray-100 hover:bg-gray-700/80 transition-all duration-200"
          >
            <Eye className="h-4 w-4 mr-1" />
            Ver Detalhes
          </Button>
          
          <Button
            onClick={() => onEdit(product)}
            size="sm"
            variant="outline"
            className="flex-1 bg-yellow-400/10 border-yellow-400/30 text-yellow-400 hover:bg-yellow-400/20 transition-all duration-200"
          >
            <Edit className="h-4 w-4 mr-1" />
            Editar
          </Button>
        </div>

        {/* Botão de ajuste de estoque (se disponível) */}
        {onAdjustStock && (
          <Button
            onClick={() => onAdjustStock(product)}
            size="sm"
            variant="ghost"
            className="w-full text-gray-400 hover:text-gray-100 hover:bg-gray-800/60 transition-all duration-200"
          >
            📦 Ajustar Estoque
          </Button>
        )}
      </div>
    </div>
  );
};

export default InventoryCard;