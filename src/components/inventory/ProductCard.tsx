/**
 * Componente card individual de produto
 * Extraído do InventoryNew.tsx para reutilização
 */

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { ProductCardProps } from './types';

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onEdit,
  onDelete,
  canDelete,
}) => {
  const getTurnoverColor = (rate: string) => {
    switch (rate) {
      case 'fast': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'slow': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStockStatus = () => {
    const ratio = product.stock_quantity / product.minimum_stock;
    if (ratio <= 1) return { status: 'Baixo', color: 'bg-red-500/20 text-red-400 border-red-500/30' };
    if (ratio <= 3) return { status: 'Adequado', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' };
    return { status: 'Alto', color: 'bg-green-500/20 text-green-400 border-green-500/30' };
  };

  const stockStatus = getStockStatus();

  return (
    <Card className="bg-adega-charcoal/20 border-white/10 hover:bg-adega-charcoal/30 transition-colors">
      <CardContent className="p-4">
        {/* Header do Card */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-adega-platinum truncate" title={product.name}>
              {product.name}
            </h3>
            <p className="text-sm text-adega-platinum/60 truncate">
              {product.category}
            </p>
          </div>
          
          <div className="flex gap-1 ml-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(product)}
              className="h-8 w-8 p-0 hover:bg-adega-gold/20"
            >
              <Edit className="h-3 w-3" />
            </Button>
            {canDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(product.id)}
                className="h-8 w-8 p-0 hover:bg-red-500/20 text-red-400"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-3">
          <Badge className={getTurnoverColor(product.turnover_rate)}>
            {product.turnover_rate === 'fast' ? 'Giro Rápido' : 
             product.turnover_rate === 'medium' ? 'Giro Médio' : 'Giro Lento'}
          </Badge>
          <Badge className={stockStatus.color}>
            {stockStatus.status}
          </Badge>
        </div>

        {/* Informações Principais */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-adega-platinum/60">Preço:</span>
            <span className="font-semibold text-adega-gold">
              {formatCurrency(product.price)}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-adega-platinum/60">Estoque:</span>
            <span className="font-medium text-adega-platinum">
              {product.stock_quantity} {product.unit_type}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-adega-platinum/60">Mín:</span>
            <span className="text-sm text-adega-platinum/60">
              {product.minimum_stock} {product.unit_type}
            </span>
          </div>

          {product.barcode && (
            <div className="pt-2 border-t border-white/10">
              <span className="text-xs text-adega-platinum/40 font-mono">
                {product.barcode}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};