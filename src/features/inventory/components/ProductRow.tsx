/**
 * Componente linha da tabela de produto
 * Extraído do InventoryNew.tsx para reutilização
 */

import React from 'react';
import { Button } from '@/shared/ui/primitives/button';
import { Badge } from '@/shared/ui/primitives/badge';
import { Edit, Trash2, TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { formatCurrency } from '@/core/config/utils';
import { ProductRowProps } from './types';

export const ProductRow: React.FC<ProductRowProps> = ({
  product,
  onEdit,
  onDelete,
  canDelete,
}) => {
  const getTurnoverInfo = (rate: string) => {
    switch (rate) {
      case 'fast': 
        return {
          color: 'bg-green-500/20 text-green-400 border-green-500/30',
          icon: TrendingUp,
          pattern: 'font-bold border-2',
          label: 'Giro rápido'
        };
      case 'medium': 
        return {
          color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
          icon: Minus,
          pattern: 'font-medium',
          label: 'Giro médio'
        };
      case 'slow': 
        return {
          color: 'bg-red-500/20 text-red-400 border-red-500/30',
          icon: TrendingDown,
          pattern: 'font-normal border-dashed',
          label: 'Giro lento'
        };
      default: 
        return {
          color: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
          icon: Minus,
          pattern: 'font-light opacity-75',
          label: 'Giro indefinido'
        };
    }
  };

  // ✅ SSoT: Divisão segura - minimum_stock agora vem do banco
  const getStockInfo = () => {
    const minStock = product.minimum_stock || 1; // Proteção contra divisão por zero
    const currentStock = product.stock_quantity || 0;
    const ratio = currentStock / minStock;

    // Estoque crítico: atual <= mínimo
    if (currentStock <= minStock) {
      return {
        status: 'Baixo',
        color: 'bg-red-500/20 text-red-400 border-red-500/30',
        icon: XCircle,
        pattern: 'font-bold border-2 animate-pulse',
        label: 'Estoque crítico - requer reposição urgente'
      };
    }
    // Estoque adequado: até 3x o mínimo
    if (ratio <= 3) {
      return {
        status: 'Adequado',
        color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
        icon: AlertTriangle,
        pattern: 'font-medium border-dashed',
        label: 'Estoque adequado - monitorar'
      };
    }
    // Estoque alto: > 3x o mínimo
    return {
      status: 'Alto',
      color: 'bg-green-500/20 text-green-400 border-green-500/30',
      icon: CheckCircle,
      pattern: 'font-semibold',
      label: 'Estoque alto - nível bom'
    };
  };

  const stockInfo = getStockInfo();
  const turnoverInfo = getTurnoverInfo(product.turnover_rate);

  return (
    <tr className="border-b border-white/10 hover:bg-adega-charcoal/20 transition-colors">
      {/* Nome e Categoria */}
      <td className="p-4">
        <div>
          <div className="font-medium text-adega-platinum">{product.name}</div>
          <div className="text-sm text-adega-platinum/60">{product.category}</div>
        </div>
      </td>

      {/* Preço */}
      <td className="p-4">
        <span className="font-semibold text-adega-gold">
          {formatCurrency(product.price)}
        </span>
      </td>

      {/* Estoque */}
      <td className="p-4">
        <div className="flex items-center gap-2">
          <span className="text-adega-platinum">
            {product.stock_quantity} {product.unit_type}
          </span>
          <Badge 
            className={`${stockInfo.color} ${stockInfo.pattern}`} 
            variant="outline"
            aria-label={stockInfo.label}
          >
            <stockInfo.icon className="h-3 w-3 mr-1" aria-hidden="true" />
            {stockInfo.status}
          </Badge>
        </div>
      </td>

      {/* Estoque Mínimo */}
      <td className="p-4">
        <span className="text-adega-platinum/60">
          {product.minimum_stock} {product.unit_type}
        </span>
      </td>

      {/* Taxa de Giro */}
      <td className="p-4">
        <Badge 
          className={`${turnoverInfo.color} ${turnoverInfo.pattern}`} 
          variant="outline"
          aria-label={turnoverInfo.label}
        >
          <turnoverInfo.icon className="h-3 w-3 mr-1" aria-hidden="true" />
          {product.turnover_rate === 'fast' ? 'Rápido' : 
           product.turnover_rate === 'medium' ? 'Médio' : 'Lento'}
        </Badge>
      </td>

      {/* Fornecedor */}
      <td className="p-4">
        <span className="text-adega-platinum/60">
          {product.supplier || '-'}
        </span>
      </td>

      {/* Código de Barras */}
      <td className="p-4">
        <span className="text-xs text-adega-platinum/40 font-mono">
          {product.barcode || '-'}
        </span>
      </td>

      {/* Ações */}
      <td className="p-4">
        <div className="flex gap-1">
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
      </td>
    </tr>
  );
};