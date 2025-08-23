/**
 * Modal de detalhes completos do produto para gestão de estoque
 * Foco em informações operacionais e técnicas
 */

import React, { useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/shared/ui/primitives/dialog';
import { Button } from '@/shared/ui/primitives/button';
import { Badge } from '@/shared/ui/primitives/badge';
import { 
  Package, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Eye,
  Edit,
  History,
  Settings,
  X,
  Calendar,
  DollarSign,
  Factory,
  Globe
} from 'lucide-react';
import { cn } from '@/core/config/utils';
import { formatCurrency } from '@/core/config/utils';
import { useFormatBrazilianDate } from '@/shared/hooks/common/use-brasil-timezone';
import { useProductAnalytics } from '@/features/inventory/hooks/useProductAnalytics';
import type { Product } from '@/types/inventory.types';

interface ProductDetailsModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAdjustStock: (product: Product) => void;
  onViewHistory: (product: Product) => void;
}

// Função para determinar status do estoque
const getStockStatus = (currentStock: number, minStock: number = 10) => {
  if (currentStock === 0) return { status: 'out', label: 'Sem Estoque', color: 'bg-red-500/20 text-red-400 border-red-400/30' };
  if (currentStock <= minStock) return { status: 'low', label: 'Estoque Baixo', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-400/30' };
  if (currentStock > minStock * 3) return { status: 'excess', label: 'Excesso', color: 'bg-blue-500/20 text-blue-400 border-blue-400/30' };
  return { status: 'available', label: 'Disponível', color: 'bg-green-500/20 text-green-400 border-green-400/30' };
};

// Função para análise de giro baseada em dados reais
const getTurnoverAnalysis = (turnoverRate: string, salesPerMonth: number) => {
  if (turnoverRate === 'alto') return { 
    rate: 'Alto', 
    icon: TrendingUp, 
    color: 'text-green-400',
    description: 'Produto com alta rotatividade',
    salesPerMonth: salesPerMonth
  };
  if (turnoverRate === 'medio') return { 
    rate: 'Médio', 
    icon: Minus, 
    color: 'text-yellow-400',
    description: 'Produto com rotatividade moderada',
    salesPerMonth: salesPerMonth
  };
  return { 
    rate: 'Baixo', 
    icon: TrendingDown, 
    color: 'text-red-400',
    description: 'Produto com baixa rotatividade',
    salesPerMonth: salesPerMonth
  };
};

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  product,
  isOpen,
  onClose,
  onAdjustStock,
  onViewHistory,
}) => {
  const { formatCompact, formatRelative } = useFormatBrazilianDate();
  
  // Buscar dados analíticos reais do produto
  const { analytics, isLoading: analyticsLoading } = useProductAnalytics(product?.id || null);
  

  if (!product) return null;

  const stockStatus = getStockStatus(product.stock_quantity, product.minimum_stock || 10);
  
  // Usar dados reais ou fallback para análise de giro
  const turnoverAnalysis = analytics 
    ? getTurnoverAnalysis(analytics.turnoverRate, analytics.salesPerMonth)
    : getTurnoverAnalysis('baixo', 0); // Fallback enquanto carrega
    
  const TurnoverIcon = turnoverAnalysis.icon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[85vh] bg-adega-charcoal/95 border-adega-gold/30 backdrop-blur-xl flex flex-col">
        <DialogHeader className="border-b border-white/10 pb-4 flex-shrink-0">
          <DialogTitle className="text-xl font-bold text-adega-platinum">
            DETALHES DO PRODUTO
          </DialogTitle>
          <DialogDescription className="text-gray-400 mt-2">
            Visualização completa das informações do produto selecionado.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mt-2 flex-1 overflow-hidden">
          {/* Coluna 1: Imagem e Status */}
          <div className="space-y-2">
            {/* Imagem do produto */}
            <div className="relative h-32 bg-gray-700/50 rounded-xl flex items-center justify-center overflow-hidden">
              {product.image_url ? (
                <img 
                  src={product.image_url} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Package className="h-24 w-24 text-gray-400" />
              )}
              
              {/* Badge de status */}
              <div className="absolute top-3 right-3">
                <Badge className={cn("text-xs font-medium", stockStatus.color)}>
                  {stockStatus.label}
                </Badge>
              </div>
            </div>

            {/* Ações rápidas */}
            <div className="flex gap-2">
              <Button
                onClick={() => onAdjustStock(product)}
                size="sm"
                className="flex-1 bg-blue-400/10 border border-blue-400/30 text-blue-400 hover:bg-blue-400/20"
                variant="outline"
              >
                <Package className="h-3 w-3 mr-1" />
                Ajustar
              </Button>
              
              <Button
                onClick={() => onViewHistory(product)}
                size="sm"
                className="flex-1 bg-gray-600/20 border border-gray-500/30 text-gray-300 hover:bg-gray-600/30"
                variant="outline"
              >
                <History className="h-3 w-3 mr-1" />
                Histórico
              </Button>
            </div>
          </div>

          {/* Coluna 2 e 3: Informações detalhadas */}
          <div className="lg:col-span-2 space-y-2 overflow-y-auto pr-2">
            {/* Informações básicas */}
            <div className="bg-black/30 rounded-lg p-2">
              <h3 className="text-sm font-semibold text-adega-platinum mb-1">
                Informações Básicas
              </h3>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <label className="text-sm text-gray-400">Nome</label>
                  <p className="text-gray-100 font-medium">{product.name}</p>
                </div>
                
                <div>
                  <label className="text-sm text-gray-400">Categoria</label>
                  <p className="text-gray-100 font-medium">{product.category}</p>
                </div>
                
                <div>
                  <label className="text-sm text-gray-400">Código de Barras</label>
                  <p className="text-gray-100 font-medium">{product.barcode || 'N/A'}</p>
                </div>
                
                <div>
                  <label className="text-sm text-gray-400">Fornecedor</label>
                  <p className="text-gray-100 font-medium">{product.supplier ? String(product.supplier).trim() : 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Informações de estoque */}
            <div className="bg-black/30 rounded-lg p-2">
              <h3 className="text-base font-semibold text-adega-platinum mb-2 flex items-center">
                <Package className="h-5 w-5 mr-2 text-yellow-400" />
                Controle de Estoque
              </h3>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-gray-800/40 rounded p-2">
                  <label className="text-xs text-gray-400">Estoque Atual</label>
                  <p className="text-lg font-bold text-gray-100">{product.stock_quantity}</p>
                  <span className="text-xs text-gray-400">unidades</span>
                </div>
                
                <div className="bg-gray-800/40 rounded p-2">
                  <label className="text-xs text-gray-400">Estoque Mínimo</label>
                  <p className="text-base font-bold text-yellow-400">{product.minimum_stock || 10}</p>
                  <span className="text-xs text-gray-400">unidades</span>
                </div>
                
              </div>
              
              <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <label className="text-sm text-gray-400 flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Última Entrada
                  </label>
                  <p className="text-gray-100">
                    {analyticsLoading ? (
                      'Carregando...'
                    ) : analytics?.lastEntry ? (
                      formatCompact(analytics.lastEntry)
                    ) : (
                      'Nenhuma entrada registrada'
                    )}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm text-gray-400 flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Última Saída
                  </label>
                  <p className="text-gray-100">
                    {analyticsLoading ? (
                      'Carregando...'
                    ) : analytics?.lastExit ? (
                      formatCompact(analytics.lastExit)
                    ) : (
                      'Nenhuma saída registrada'
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Análise de giro */}
            <div className="bg-black/30 rounded-lg p-2">
              <h3 className="text-base font-semibold text-adega-platinum mb-2 flex items-center">
                <TurnoverIcon className={cn("h-5 w-5 mr-2", turnoverAnalysis.color)} />
                Análise de Giro
              </h3>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-gray-800/40 rounded p-2">
                  <label className="text-xs text-gray-400">Classificação</label>
                  <p className={cn("text-base font-bold", turnoverAnalysis.color)}>
                    Giro {turnoverAnalysis.rate}
                  </p>
                  <span className="text-xs text-gray-400">{turnoverAnalysis.description}</span>
                </div>
                
                <div className="bg-gray-800/40 rounded p-2">
                  <label className="text-xs text-gray-400">Vendas/Mês</label>
                  <p className="text-base font-bold text-gray-100">
                    {analyticsLoading ? '...' : turnoverAnalysis.salesPerMonth}
                  </p>
                  <span className="text-xs text-gray-400">unidades</span>
                  {analytics && analytics.salesLast30Days > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      {analytics.salesLast30Days} últimos 30d
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Dados comerciais */}
            <div className="bg-black/30 rounded-lg p-2">
              <h3 className="text-base font-semibold text-adega-platinum mb-2 flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-green-400" />
                Dados Comerciais
              </h3>
              
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div>
                  <label className="text-sm text-gray-400">Preço de Custo</label>
                  <p className="text-lg font-bold text-gray-100">
                    {formatCurrency(product.cost_price || 0)}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm text-gray-400">Preço de Venda</label>
                  <p className="text-lg font-bold text-green-400">
                    {formatCurrency(product.price)}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm text-gray-400">Margem</label>
                  <p className="text-lg font-bold text-yellow-400">
                    {product.margin_percent ? `${String(product.margin_percent).trim()}%` : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Informações do fornecedor */}
            <div className="bg-black/30 rounded-lg p-2">
              <h3 className="text-base font-semibold text-adega-platinum mb-2 flex items-center">
                <Factory className="h-5 w-5 mr-2 text-blue-400" />
                Informações do Fornecedor
              </h3>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <label className="text-sm text-gray-400">Fornecedor</label>
                  <p className="text-gray-100 font-medium">
                    {product.supplier ? String(product.supplier).trim() : 'N/A'}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm text-gray-400">Volume</label>
                  <p className="text-gray-100">
                    {product.volume_ml ? `${product.volume_ml} ml` : 'N/A'}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm text-gray-400">Preço de Custo</label>
                  <p className="text-gray-100">
                    {product.cost_price ? formatCurrency(product.cost_price) : 'N/A'}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm text-gray-400">Margem de Lucro</label>
                  <p className="text-gray-100">
                    {product.margin_percent ? `${String(product.margin_percent).trim()}%` : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDetailsModal;