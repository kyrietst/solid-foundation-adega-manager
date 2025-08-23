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
  
  // Calcular completude dos dados (sempre executar o hook, independente do product)
  const completeness = useMemo(() => {
    if (!product) return { percentage: 0, missing: [] };
    
    const fields = [
      { key: 'barcode', name: 'Código de Barras', critical: false, userInput: true },
      { key: 'supplier', name: 'Fornecedor', critical: false, userInput: true },
      { key: 'cost_price', name: 'Preço de Custo', critical: true, userInput: true },
      { key: 'volume_ml', name: 'Volume', critical: false, userInput: true }
      // margin_percent é calculado automaticamente, não conta para completude
    ];
    
    const total = fields.length;
    let filled = 0;
    const missing = [];
    
    fields.forEach(field => {
      const value = product[field.key];
      const hasValue = value && value !== 0 && String(value).trim() !== '';
      
      if (hasValue) {
        filled++;
      } else {
        missing.push(field);
      }
    });
    
    return {
      percentage: Math.round((filled / total) * 100),
      missing,
      critical: missing.some(f => f.critical)
    };
  }, [product]);

  // Early return após todos os hooks
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
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-bold text-adega-platinum">
                DETALHES DO PRODUTO
              </DialogTitle>
              <DialogDescription className="text-gray-400 mt-2">
                Visualização completa das informações do produto selecionado.
              </DialogDescription>
            </div>
            
            {/* Indicador de completude */}
            <div className="flex items-center gap-3">
              <div className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg border",
                completeness.critical 
                  ? "bg-red-500/20 border-red-400/40 animate-pulse" 
                  : completeness.percentage === 100 
                    ? "bg-green-500/20 border-green-400/40"
                    : "bg-yellow-500/20 border-yellow-400/40"
              )}>
                <div className={cn(
                  "text-sm font-semibold",
                  completeness.critical ? "text-red-400" : 
                  completeness.percentage === 100 ? "text-green-400" : "text-yellow-400"
                )}>
                  {completeness.percentage}% completo
                </div>
                {completeness.percentage === 100 ? (
                  <span className="text-green-400">✅</span>
                ) : completeness.critical ? (
                  <span className="text-red-400">⚠️</span>
                ) : (
                  <span className="text-yellow-400">📝</span>
                )}
              </div>
              
              {completeness.missing.length > 0 && (
                <div className="text-xs text-gray-400">
                  <span className="text-gray-300">{completeness.missing.length}</span> campo(s) pendente(s)
                </div>
              )}
            </div>
          </div>
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
                  {!product.barcode ? (
                    <div className="flex items-center gap-2 animate-pulse">
                      <p className="text-orange-400 font-medium">⚠️ Não informado</p>
                      <span className="text-xs text-orange-300 bg-orange-500/20 px-2 py-1 rounded-full border border-orange-400/30">
                        Pendente
                      </span>
                    </div>
                  ) : (
                    <p className="text-gray-100 font-medium">{product.barcode}</p>
                  )}
                </div>
                
                <div>
                  <label className="text-sm text-gray-400">Fornecedor</label>
                  {!product.supplier || String(product.supplier).trim() === '' ? (
                    <div className="flex items-center gap-2 animate-pulse">
                      <p className="text-orange-400 font-medium">⚠️ Não informado</p>
                      <span className="text-xs text-orange-300 bg-orange-500/20 px-2 py-1 rounded-full border border-orange-400/30">
                        Pendente
                      </span>
                    </div>
                  ) : (
                    <p className="text-gray-100 font-medium">{String(product.supplier).trim()}</p>
                  )}
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
                  {!product.cost_price || product.cost_price === 0 ? (
                    <div className="flex items-center gap-2 animate-pulse">
                      <p className="text-red-400 font-bold">⚠️ Não informado</p>
                      <span className="text-xs text-red-300 bg-red-500/20 px-2 py-1 rounded-full border border-red-400/30">
                        Crítico
                      </span>
                    </div>
                  ) : (
                    <p className="text-lg font-bold text-gray-100">
                      {formatCurrency(product.cost_price)}
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="text-sm text-gray-400">Preço de Venda</label>
                  <p className="text-lg font-bold text-green-400">
                    {formatCurrency(product.price)}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm text-gray-400">Margem</label>
                  {!product.margin_percent ? (
                    <div className="flex items-center gap-2">
                      <p className="text-blue-400 font-bold">🔄 Auto-calculado</p>
                      <span className="text-xs text-blue-300 bg-blue-500/20 px-2 py-1 rounded-full border border-blue-400/30">
                        Sistema
                      </span>
                    </div>
                  ) : (
                    <p className="text-lg font-bold text-yellow-400">
                      {String(product.margin_percent).trim()}%
                    </p>
                  )}
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
                  {!product.supplier || String(product.supplier).trim() === '' ? (
                    <div className="flex items-center gap-1 animate-pulse">
                      <p className="text-orange-400 font-medium">⚠️ Não informado</p>
                      <span className="text-xs text-orange-300 bg-orange-500/20 px-1 py-0.5 rounded border border-orange-400/30">
                        Pendente
                      </span>
                    </div>
                  ) : (
                    <p className="text-gray-100 font-medium">
                      {String(product.supplier).trim()}
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="text-sm text-gray-400">Volume</label>
                  {!product.volume_ml ? (
                    <div className="flex items-center gap-1 animate-pulse">
                      <p className="text-blue-400 font-medium">⚠️ Não informado</p>
                      <span className="text-xs text-blue-300 bg-blue-500/20 px-1 py-0.5 rounded border border-blue-400/30">
                        Importante
                      </span>
                    </div>
                  ) : (
                    <p className="text-gray-100">
                      {product.volume_ml} ml
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="text-sm text-gray-400">Preço de Custo</label>
                  {!product.cost_price || product.cost_price === 0 ? (
                    <div className="flex items-center gap-1 animate-pulse">
                      <p className="text-red-400 font-medium">⚠️ Não informado</p>
                      <span className="text-xs text-red-300 bg-red-500/20 px-1 py-0.5 rounded border border-red-400/30">
                        Crítico
                      </span>
                    </div>
                  ) : (
                    <p className="text-gray-100">
                      {formatCurrency(product.cost_price)}
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="text-sm text-gray-400">Margem de Lucro</label>
                  {!product.margin_percent ? (
                    <div className="flex items-center gap-1">
                      <p className="text-blue-400 font-medium">🔄 Auto-calculado</p>
                      <span className="text-xs text-blue-300 bg-blue-500/20 px-1 py-0.5 rounded border border-blue-400/30">
                        Sistema
                      </span>
                    </div>
                  ) : (
                    <p className="text-gray-100">
                      {String(product.margin_percent).trim()}%
                    </p>
                  )}
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