/**
 * Card específico para gestão de estoque
 * Foco em informações operacionais, não comerciais
 */

import React from 'react';
import { Button } from '@/shared/ui/primitives/button';
import { Badge } from '@/shared/ui/primitives/badge';
import { Eye, Edit, Package, MapPin, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/core/config/utils';
import { getHoverTransformClasses } from '@/core/config/theme-utils';
import { useMouseTracker } from '@/hooks/ui/useMouseTracker';
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

// Função para determinar análise de giro (simulada por enquanto)
const getTurnoverAnalysis = (productId: string) => {
  // Simulação baseada no ID - em produção virá do banco de dados
  const hash = productId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const remainder = hash % 3;
  
  if (remainder === 0) return { rate: 'Alto', icon: TrendingUp, color: 'text-green-400' };
  if (remainder === 1) return { rate: 'Médio', icon: Minus, color: 'text-yellow-400' };
  return { rate: 'Baixo', icon: TrendingDown, color: 'text-red-400' };
};

export const InventoryCard: React.FC<InventoryCardProps> = ({
  product,
  onViewDetails,
  onEdit,
  onAdjustStock,
  variant = 'default',
  glassEffect = true,
}) => {
  const stockStatus = getStockStatus(product.stock_quantity, product.minimum_stock || 10);
  const turnoverAnalysis = getTurnoverAnalysis(product.id);
  const TurnoverIcon = turnoverAnalysis.icon;
  const { handleMouseMove } = useMouseTracker();

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

        {/* Informações de estoque */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Package className="h-4 w-4 text-yellow-400" />
            <span className="text-gray-300">
              Estoque: <span className="font-semibold text-gray-100">{product.stock_quantity}</span> un
            </span>
            {product.minimum_stock && (
              <span className="text-gray-400">
                | Mín: {product.minimum_stock} un
              </span>
            )}
          </div>

          {/* Volume do produto */}
          <div className="flex items-center gap-2 text-sm">
            <Package className="h-4 w-4 text-purple-400" />
            <span className="text-gray-300">
              Volume: <span className="font-semibold text-gray-100">{product.volume || 'N/A'}</span>
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