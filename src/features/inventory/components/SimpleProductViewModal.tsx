/**
 * Modal simplificado de visualização do produto
 * v3.6.5 - Padronizado com estilo neutro + emojis + hierarquia visual clara
 * Foco em informações essenciais com análise de giro preservada para marketing
 * 
 * Refatorado com componentização (Badge, Tips, TurnoverCard)
 */

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/shared/ui/primitives/dialog';
import { Button } from '@/shared/ui/primitives/button';
import { Badge } from '@/shared/ui/primitives/badge';
import {
  Package,
  Eye,
  Edit,
  History,
  DollarSign,
  Factory,
  Barcode,
  Calendar,
  Minus,
  TrendingUp,
  TrendingDown,
  Wine,
  X
} from 'lucide-react';
import { cn, formatCurrency } from '@/core/config/utils';
import { useFormatBrazilianDate } from '@/shared/hooks/common/use-brasil-timezone';
import { useProductAnalytics } from '@/features/inventory/hooks/useProductAnalytics';
import type { Product } from '@/core/types/inventory.types';

// Sub-components dedicated
import { ProductCompletenessBadge } from './product-view/ProductCompletenessBadge';
import { ProductOptimizationTips } from './product-view/ProductOptimizationTips';
import { ProductTurnoverCard } from './product-view/ProductTurnoverCard';

interface SimpleProductViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (product: Product) => void;
  onAdjustStock: (product: Product) => void;
  onViewHistory: (product: Product) => void;
}

// Função para determinar status do estoque
const getStockStatus = (currentStock: number, minStock: number = 10) => {
  if (currentStock === 0) return {
    status: 'out',
    label: '🔴 Sem Estoque',
    color: 'bg-red-500/20 text-red-400 border-red-400/30'
  };
  if (currentStock <= minStock) return {
    status: 'low',
    label: '⚠️ Estoque Baixo',
    color: 'bg-yellow-500/20 text-yellow-400 border-yellow-400/30'
  };
  return {
    status: 'available',
    label: '✅ Disponível',
    color: 'bg-green-500/20 text-green-400 border-green-400/30'
  };
};

export const SimpleProductViewModal: React.FC<SimpleProductViewModalProps> = ({
  product,
  isOpen,
  onClose,
  onEdit,
  onAdjustStock,
  onViewHistory,
}) => {
  const { formatDate } = useFormatBrazilianDate();
  const {
    analytics,
    loading: analyticsLoading,
    error: analyticsError,
    completeness
  } = useProductAnalytics(product?.id || null);

  const [showOptimization, setShowOptimization] = React.useState(false);

  // Helper to map analytics rate to UI props
  const getTurnoverAnalysis = (rate: string) => {
    switch (rate) {
      case 'alto':
        return {
          rate: 'ALTO GIRO',
          label: '🔥 ALTA DEMANDA',
          color: 'text-green-400',
          icon: TrendingUp,
          description: 'Produto com excelente saída. Mantenha estoque alto.'
        };
      case 'medio':
        return {
          rate: 'MÉDIO GIRO',
          label: '⚖️ DEMANDA REGULAR',
          color: 'text-blue-400',
          icon: Minus,
          description: 'Fluxo de vendas constante. Estoque regular.'
        };
      case 'baixo':
      default:
        return {
          rate: 'BAIXO GIRO',
          label: '🐢 BAIXA DEMANDA',
          color: 'text-orange-400',
          icon: TrendingDown,
          description: 'Vendas lentas. Considere promoções.'
        };
    }
  };

  const turnoverAnalysis = getTurnoverAnalysis(analytics?.turnoverRate || 'baixo');


  if (!product) return null;

  const stockStatus = getStockStatus(product.stock_quantity, product.minimum_stock);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={cn(
        "max-w-6xl max-h-[90vh] overflow-hidden p-0",
        "bg-gray-900/95 backdrop-blur-xl border border-gray-700/50",
        "shadow-[0_0_50px_rgba(0,0,0,0.5)]"
      )}>
        {/* Header */}
        <DialogHeader className="p-5 pb-0 border-b border-gray-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/30">
                <Eye className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-white tracking-wide">
                  VER PRODUTO
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-400 mt-0.5">
                  {product.name} • {product.category}
                </DialogDescription>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <ProductCompletenessBadge completeness={completeness} />
              <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-white/10 text-gray-400 hover:text-white">
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Scrollable Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)] p-5 space-y-5">

          {/* Optimization Tips */}
          <ProductOptimizationTips
            completeness={completeness}
            showOptimization={showOptimization}
            onToggle={() => setShowOptimization(!showOptimization)}
          />

          {/* Main Grid: 3 Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Column 1: Image + Quick Actions */}
            <div className="space-y-4">
              {/* Image Area */}
              <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-800/50 border border-gray-700/50 group">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-600">
                    <Package className="h-16 w-16 mb-2 opacity-20" />
                    <span className="text-sm">Sem imagem</span>
                  </div>
                )}

                {/* Stock Badge Overlay */}
                <div className="absolute top-3 right-3">
                  <Badge className={cn("px-2 py-1 shadow-lg backdrop-blur-sm", stockStatus.color)}>
                    {stockStatus.label}
                  </Badge>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 gap-2">
                <Button
                  onClick={() => onEdit(product)}
                  className="w-full bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 justify-start"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Editar Produto
                </Button>
                <Button
                  onClick={() => onAdjustStock(product)}
                  className="w-full bg-orange-600/20 hover:bg-orange-600/30 text-orange-400 border border-orange-500/30 justify-start"
                >
                  <Package className="mr-2 h-4 w-4" />
                  Ajustar Estoque
                </Button>
                <Button
                  onClick={() => onViewHistory(product)}
                  className="w-full bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 border border-purple-500/30 justify-start"
                >
                  <History className="mr-2 h-4 w-4" />
                  Ver Histórico
                </Button>
              </div>

              {/* Current Stock Detail */}
              <div className="bg-gray-800/40 p-4 rounded-lg border border-gray-700/50 flex justify-between items-center">
                <span className="text-gray-400 text-sm">Estoque Atual</span>
                <span className={cn("text-xl font-bold font-mono", stockStatus.color.split(' ')[1])}>
                  {product.stock_quantity} un
                </span>
              </div>
            </div>

            {/* Column 2: Complete Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <Factory className="h-4 w-4" /> Informações Detalhadas
              </h3>

              <div className="bg-gray-800/40 rounded-lg border border-gray-700/50 divide-y divide-gray-700/50">
                <div className="p-3 grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-gray-500 block">Categoria</span>
                    <span className="text-sm font-medium text-gray-200">{product.category}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block">Fornecedor</span>
                    <span className="text-sm font-medium text-gray-200">{product.supplier || '-- --'}</span>
                  </div>
                </div>

                <div className="p-3 grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-gray-500 block">Preço de Venda</span>
                    <span className="text-lg font-bold text-green-400">{formatCurrency(product.price)}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block">Custo Unitário</span>
                    <span className="text-sm font-medium text-gray-300">{formatCurrency(Number(product.cost_price || 0))}</span>
                  </div>
                </div>

                <div className="p-3 grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-gray-500 block">Código de Barras</span>
                    <div className="flex items-center gap-2">
                      <Barcode className="h-3 w-3 text-gray-500" />
                      <span className="text-sm font-mono text-gray-300">{product.barcode || 'N/A'}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block">Volume</span>
                    <div className="flex items-center gap-2">
                      <Wine className="h-3 w-3 text-gray-500" />
                      <span className="text-sm text-gray-300">{product.volume_ml ? `${product.volume_ml}ml` : 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div className="p-3">
                  <span className="text-xs text-gray-500 block mb-1">Última Atualização</span>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3 text-gray-500" />
                    <span className="text-sm text-gray-300">
                      {product.updated_at ? formatDate(product.updated_at) : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Recent Movement Snippet */}
              <div className="bg-gray-800/40 p-4 rounded-lg border border-gray-700/50">
                <h4 className="text-xs text-gray-500 uppercase mb-3 flex items-center justify-between">
                  <span>Última Movimentação</span>
                  <History className="h-3 w-3" />
                </h4>
                {analytics?.lastMovement ? (
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "p-2 rounded-lg",
                      analytics.lastMovement.type === 'SAIDA' ? "bg-red-500/10 text-red-400" : "bg-green-500/10 text-green-400"
                    )}>
                      {analytics.lastMovement.type === 'SAIDA' ? <Minus className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-200">
                        {analytics.lastMovement.type === 'SAIDA' ? 'Saída de Estoque' : 'Entrada de Estoque'}
                      </div>
                      <div className="text-xs text-gray-400">
                        {analytics.lastMovement.quantity} unidades • {analytics.lastMovement.date}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-gray-500 text-center py-2">
                    Nenhuma movimentação recente
                  </div>
                )}
              </div>
            </div>

            {/* Column 3: Stats & Optimization */}
            <div className="space-y-4">
              {/* Turnover Card Component */}
              <ProductTurnoverCard
                analytics={analytics || undefined}
                turnoverAnalysis={turnoverAnalysis}
              />

              {/* Margins Analysis */}
              <div className="bg-gray-800/40 p-4 rounded-lg border border-gray-700/50">
                <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-400" />
                  Margens
                </h3>

                <div className="space-y-3">
                  <div className="flex justify-between items-center p-2 bg-gray-900/40 rounded">
                    <span className="text-sm text-gray-400">Lucro Bruto</span>
                    <span className="text-sm font-bold text-green-400">
                      {formatCurrency(product.price - Number(product.cost_price || 0))}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-2 bg-gray-900/40 rounded">
                    <span className="text-sm text-gray-400">Margem %</span>
                    {product.cost_price && Number(product.cost_price) > 0 ? (
                      <div className="text-sm font-bold text-blue-400">
                        {(((product.price - Number(product.cost_price)) / Number(product.cost_price)) * 100).toFixed(0)}%
                      </div>
                    ) : (
                      <div className="text-gray-500 text-xs">--</div>
                    )}
                  </div>
                </div>

                {/* Preço Pacote se aplicável */}
                {product.has_package_tracking && (
                  <div className="border-t border-gray-700/50 pt-2 float-left w-full mt-2">
                    <p className="text-xs text-gray-400 mb-2">📦 Por Pacote ({product.package_units || 1} un.)</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-center p-2 bg-gray-700/30 rounded">
                        <div className="text-xs text-gray-400">Preço</div>
                        {product.package_price ? (
                          <div className="text-xs font-medium text-green-400">{formatCurrency(product.package_price)}</div>
                        ) : (
                          <div className="text-orange-400 text-xs">⚠️</div>
                        )}
                      </div>
                      <div className="text-center p-2 bg-gray-700/30 rounded">
                        <div className="text-xs text-gray-400">Economia</div>
                        {product.package_price && product.price && product.package_units ? (
                          <div className="text-xs font-medium text-green-400">
                            {(((product.price * product.package_units) - product.package_price) / (product.price * product.package_units) * 100).toFixed(0)}%
                          </div>
                        ) : (
                          <div className="text-gray-500 text-xs">--</div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SimpleProductViewModal;