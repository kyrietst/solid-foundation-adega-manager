/**
 * Modal simplificado de visualização do produto
 * v3.6.5 - Padronizado com estilo neutro + emojis + hierarquia visual clara
 * Foco em informações essenciais com análise de giro preservada para marketing
 */

import React from 'react';
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
  DollarSign,
  Factory,
  AlertTriangle,
  Barcode,
  ShoppingCart,
  Calendar,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  XCircle,
  AlertCircle,
  X,
  Wine
} from 'lucide-react';
import { cn } from '@/core/config/utils';
import { formatCurrency } from '@/core/config/utils';
import { useFormatBrazilianDate } from '@/shared/hooks/common/use-brasil-timezone';
import { useProductAnalytics } from '@/features/inventory/hooks/useProductAnalytics';
import type { Product } from '@/core/types/inventory.types';

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

// Função para análise de giro (essencial para marketing)
const getTurnoverAnalysis = (turnoverRate: string, salesPerMonth: number) => {
  if (turnoverRate === 'alto') return {
    rate: 'Alto',
    icon: TrendingUp,
    color: 'text-green-400',
    bgColor: 'bg-green-500/10 border-green-400/30',
    description: '🚀 Alta rotatividade'
  };
  if (turnoverRate === 'medio') return {
    rate: 'Médio',
    icon: Minus,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/10 border-yellow-400/30',
    description: '📊 Rotatividade moderada'
  };
  return {
    rate: 'Baixo',
    icon: TrendingDown,
    color: 'text-red-400',
    bgColor: 'bg-red-500/10 border-red-400/30',
    description: '📉 Baixa rotatividade'
  };
};

// Lógica de completude do produto
interface FieldInfo {
  key: keyof Product;
  name: string;
  priority: 'critical' | 'important' | 'optional';
  weight: number;
  reason: string;
  icon: React.ComponentType<{ className?: string }>;
}

const getProductCompleteness = (product: Product) => {
  const fields: FieldInfo[] = [
    { key: 'cost_price', name: 'Preço de Custo', priority: 'critical', weight: 3, reason: 'Essencial para análise de margem', icon: DollarSign },
    { key: 'supplier', name: 'Fornecedor', priority: 'critical', weight: 3, reason: 'Fundamental para sourcing', icon: Factory },
    { key: 'volume_ml', name: 'Volume/Peso', priority: 'critical', weight: 3, reason: 'Necessário para logística', icon: Package },
    { key: 'minimum_stock', name: 'Estoque Mínimo', priority: 'important', weight: 2, reason: 'Evita rupturas', icon: AlertTriangle },
    { key: 'barcode', name: 'Código de Barras', priority: 'important', weight: 2, reason: 'Agiliza operações', icon: Barcode },
    { key: 'image_url', name: 'Imagem', priority: 'optional', weight: 1, reason: 'Melhora apresentação', icon: Eye }
  ];

  const analysis = fields.map(field => {
    const value = product[field.key];
    let isComplete = false;
    if (field.key === 'cost_price') isComplete = Number(value) > 0;
    else if (typeof value === 'string') isComplete = value.trim() !== '';
    else if (typeof value === 'number') isComplete = value > 0;
    else isComplete = value !== null && value !== undefined;
    return { ...field, isComplete, value };
  });

  const totalWeight = analysis.reduce((sum, f) => sum + f.weight, 0);
  const completedWeight = analysis.filter(f => f.isComplete).reduce((sum, f) => sum + f.weight, 0);
  const percentage = Math.round((completedWeight / totalWeight) * 100);
  const missing = analysis.filter(f => !f.isComplete);
  const completed = analysis.filter(f => f.isComplete);

  return {
    percentage,
    status: percentage >= 90 ? 'excellent' : percentage >= 70 ? 'good' : percentage >= 50 ? 'fair' : 'poor',
    missing,
    completed,
    criticalMissing: missing.filter(f => f.priority === 'critical'),
    importantMissing: missing.filter(f => f.priority === 'important'),
    totalFields: fields.length,
    completedFields: completed.length
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
  const [showOptimization, setShowOptimization] = React.useState(false);
  const { formatCompact } = useFormatBrazilianDate();

  const { analytics, isLoading: analyticsLoading, error: analyticsError } = useProductAnalytics(
    product?.id || null
  );

  const completeness = React.useMemo(() => {
    if (!product) return null;
    return getProductCompleteness(product);
  }, [product]);

  if (!isOpen || !product) return null;

  const stockStatus = getStockStatus(product.stock_quantity, product.minimum_stock);
  const turnoverAnalysis = analytics && !analyticsError
    ? getTurnoverAnalysis(analytics.turnoverRate, analytics.salesPerMonth)
    : getTurnoverAnalysis('baixo', 0);
  const TurnoverIcon = turnoverAnalysis.icon;

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
                  👁️ VER PRODUTO
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-400 mt-0.5">
                  📦 {product.name} • {product.category}
                </DialogDescription>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Badge de Completude */}
              {completeness && (
                <button
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs transition-all",
                    completeness.status === 'excellent' ? "bg-green-500/10 border-green-400/40 text-green-400" :
                      completeness.status === 'good' ? "bg-blue-500/10 border-blue-400/40 text-blue-400" :
                        completeness.status === 'fair' ? "bg-yellow-500/10 border-yellow-400/40 text-yellow-400" :
                          "bg-red-500/10 border-red-400/40 text-red-400 animate-pulse"
                  )}
                  onClick={() => setShowOptimization(!showOptimization)}
                  title={`${completeness.completedFields}/${completeness.totalFields} campos`}
                >
                  {completeness.status === 'excellent' ? <CheckCircle className="h-3 w-3" /> :
                    completeness.status === 'poor' ? <XCircle className="h-3 w-3" /> :
                      <AlertCircle className="h-3 w-3" />}
                  <span className="font-bold">{completeness.percentage}%</span>
                  {completeness.missing.length > 0 && (
                    showOptimization ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                  )}
                </button>
              )}

              {/* Badge de Estoque */}
              <Badge className={cn("text-xs font-medium", stockStatus.color)}>
                {stockStatus.label}
              </Badge>

              {/* Botão Fechar */}
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600/50 transition-colors"
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
            </div>
          </div>
        </DialogHeader>

        {/* Conteúdo scrollável */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)] p-5 space-y-5">

          {/* Seção de Otimização - Collapsible */}
          {showOptimization && completeness && completeness.missing.length > 0 && (
            <div className="bg-gradient-to-r from-orange-500/10 via-red-500/10 to-yellow-500/10 border border-orange-400/40 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-orange-200 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-400" />
                  ⚡ Oportunidades de Otimização ({completeness.missing.length})
                </h4>
                <Button
                  size="sm"
                  onClick={() => onEdit(product)}
                  className="bg-orange-500/20 border border-orange-400/40 text-orange-300 hover:bg-orange-500/30 text-xs h-7"
                  variant="outline"
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Completar
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {completeness.criticalMissing.length > 0 && (
                  <div className="bg-red-500/10 border border-red-400/30 rounded p-3">
                    <h5 className="text-xs font-semibold text-red-300 flex items-center gap-1 mb-2">
                      <XCircle className="h-3 w-3" /> Críticos
                    </h5>
                    {completeness.criticalMissing.map(f => (
                      <div key={String(f.key)} className="text-xs text-red-200">{f.name}</div>
                    ))}
                  </div>
                )}
                {completeness.importantMissing.length > 0 && (
                  <div className="bg-yellow-500/10 border border-yellow-400/30 rounded p-3">
                    <h5 className="text-xs font-semibold text-yellow-300 flex items-center gap-1 mb-2">
                      <AlertCircle className="h-3 w-3" /> Importantes
                    </h5>
                    {completeness.importantMissing.map(f => (
                      <div key={String(f.key)} className="text-xs text-yellow-200">{f.name}</div>
                    ))}
                  </div>
                )}
                {completeness.missing.filter(f => f.priority === 'optional').length > 0 && (
                  <div className="bg-blue-500/10 border border-blue-400/30 rounded p-3">
                    <h5 className="text-xs font-semibold text-blue-300 flex items-center gap-1 mb-2">
                      <CheckCircle className="h-3 w-3" /> Opcionais
                    </h5>
                    {completeness.missing.filter(f => f.priority === 'optional').map(f => (
                      <div key={String(f.key)} className="text-xs text-blue-200">{f.name}</div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Grid Principal: 3 Colunas */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* ========================================== */}
            {/* COLUNA 1 - Imagem + Ações Rápidas */}
            {/* ========================================== */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2 border-b border-gray-700 pb-2">
                <Package className="h-4 w-4 text-blue-400" />
                📷 Imagem e Ações
              </h3>

              {/* Imagem */}
              <div className="relative h-40 bg-gray-800/50 rounded-lg flex items-center justify-center overflow-hidden border border-gray-700/50">
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <Package className="h-16 w-16 text-gray-500" />
                )}
              </div>

              {/* Ações Rápidas */}
              <div className="space-y-2">
                <Button
                  onClick={() => onEdit(product)}
                  className="w-full bg-blue-500/10 border border-blue-400/30 text-blue-400 hover:bg-blue-500/20 h-9 text-sm"
                  variant="outline"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  ✏️ Editar Produto
                </Button>

                <Button
                  onClick={() => onAdjustStock(product)}
                  className="w-full bg-green-500/10 border border-green-400/30 text-green-400 hover:bg-green-500/20 h-8 text-xs"
                  variant="outline"
                >
                  <Package className="h-3 w-3 mr-2" />
                  📦 Ajustar Estoque
                </Button>

                <Button
                  onClick={() => onViewHistory(product)}
                  className="w-full bg-gray-600/20 border border-gray-500/30 text-gray-300 hover:bg-gray-600/30 h-8 text-xs"
                  variant="outline"
                >
                  <History className="h-3 w-3 mr-2" />
                  📜 Ver Histórico
                </Button>
              </div>

              {/* Estoque Atual */}
              <div className="p-3 rounded-lg bg-gray-800/30 border border-gray-700/50">
                <p className="text-xs text-gray-400 mb-2">📊 Estoque Atual</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-center p-2 bg-blue-500/10 rounded border border-blue-500/20">
                    <Package className="h-4 w-4 text-blue-400 mx-auto mb-1" />
                    <div className="text-lg font-bold text-blue-400">{product.stock_packages || 0}</div>
                    <div className="text-xs text-gray-400">pacotes</div>
                  </div>
                  <div className="text-center p-2 bg-green-500/10 rounded border border-green-500/20">
                    <Wine className="h-4 w-4 text-green-400 mx-auto mb-1" />
                    <div className="text-lg font-bold text-green-400">{product.stock_units_loose || 0}</div>
                    <div className="text-xs text-gray-400">unidades</div>
                  </div>
                </div>
                {product.minimum_stock && (
                  <p className="text-xs text-gray-500 text-center mt-2">Mín: {product.minimum_stock} un.</p>
                )}
              </div>
            </div>

            {/* ========================================== */}
            {/* COLUNA 2 - Informações Completas */}
            {/* ========================================== */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2 border-b border-gray-700 pb-2">
                <Package className="h-4 w-4 text-purple-400" />
                📋 Informações
              </h3>

              <div className="p-4 rounded-lg bg-gray-800/30 border border-gray-700/50 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-xs text-gray-400">📂 Categoria</span>
                    <p className="text-sm font-medium text-white">{product.category}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400">💰 Preço Venda</span>
                    <p className="text-lg font-bold text-green-400">{formatCurrency(product.price)}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400">🧴 Volume</span>
                    <p className="text-sm text-gray-300">{product.volume_ml ? `${product.volume_ml} ml` : <span className="text-red-400 italic">Não informado</span>}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400">💵 Custo</span>
                    {Number(product.cost_price) > 0 ? (
                      <p className="text-sm text-gray-300">{formatCurrency(product.cost_price)}</p>
                    ) : (
                      <p className="text-red-400 text-xs italic animate-pulse">⚠️ Em falta</p>
                    )}
                  </div>
                </div>

                <div className="border-t border-gray-700/50 pt-3">
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Factory className="h-3 w-3" /> 🚚 Fornecedor
                  </span>
                  {product.supplier && String(product.supplier).trim() ? (
                    <p className="text-sm text-gray-300 font-medium">{String(product.supplier).trim()}</p>
                  ) : (
                    <p className="text-red-400 text-sm italic">⚠️ Não informado</p>
                  )}
                </div>

                <div className="border-t border-gray-700/50 pt-3">
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> 📅 Movimentação Recente
                  </span>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div className="text-center p-2 bg-gray-700/30 rounded">
                      <div className="text-xs text-gray-400">Última Entrada</div>
                      <div className="text-xs text-gray-200">
                        {analyticsLoading ? '⏳...' : analyticsError ? '❌' : analytics?.lastEntry ? formatCompact(analytics.lastEntry) : 'N/A'}
                      </div>
                    </div>
                    <div className="text-center p-2 bg-gray-700/30 rounded">
                      <div className="text-xs text-gray-400">Última Saída</div>
                      <div className="text-xs text-gray-200">
                        {analyticsLoading ? '⏳...' : analyticsError ? '❌' : analytics?.lastExit ? formatCompact(analytics.lastExit) : 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Códigos de Barras */}
              <div className="p-3 rounded-lg bg-gray-800/30 border border-gray-700/50">
                <p className="text-xs text-gray-400 mb-2">🔖 Códigos de Barras</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Unidade:</span>
                    {product.barcode ? (
                      <code className="bg-gray-700/50 px-2 py-0.5 rounded text-gray-200">{product.barcode.slice(0, 12)}...</code>
                    ) : (
                      <span className="text-orange-400">⚠️ Sem código</span>
                    )}
                  </div>
                  {product.has_package_tracking && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">Pacote:</span>
                      {product.package_barcode ? (
                        <code className="bg-gray-700/50 px-2 py-0.5 rounded text-gray-200">{product.package_barcode.slice(0, 12)}...</code>
                      ) : (
                        <span className="text-orange-400">⚠️ Pendente</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ========================================== */}
            {/* COLUNA 3 - Análise de Giro + Margens */}
            {/* ========================================== */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2 border-b border-gray-700 pb-2">
                <TrendingUp className="h-4 w-4 text-green-400" />
                📈 Análise Comercial
              </h3>

              {/* Análise de Giro */}
              <div className={cn("p-4 rounded-lg border", turnoverAnalysis.bgColor)}>
                <div className="text-center mb-3">
                  <div className={cn("inline-flex items-center gap-2 px-4 py-2 rounded-lg border", turnoverAnalysis.bgColor)}>
                    <TurnoverIcon className={cn("h-5 w-5", turnoverAnalysis.color)} />
                    <span className={cn("text-lg font-bold", turnoverAnalysis.color)}>
                      Giro {turnoverAnalysis.rate}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">{turnoverAnalysis.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="text-center p-2 bg-gray-800/40 rounded">
                    <div className="text-xs text-gray-400">Vendas/Mês</div>
                    <div className="text-sm font-bold text-white">
                      {analyticsLoading ? '⏳' : analyticsError ? '❌' : analytics?.salesPerMonth || 0}
                    </div>
                  </div>
                  <div className="text-center p-2 bg-gray-800/40 rounded">
                    <div className="text-xs text-gray-400">Últimos 30d</div>
                    <div className="text-sm font-bold text-white">
                      {analyticsLoading ? '⏳' : analyticsError ? '❌' : analytics?.salesLast30Days || 0}
                    </div>
                  </div>
                </div>
              </div>

              {/* Preços e Margens */}
              <div className="p-4 rounded-lg bg-gray-800/30 border border-gray-700/50">
                <p className="text-xs text-gray-400 mb-3 flex items-center gap-1">
                  <DollarSign className="h-3 w-3" /> 💵 Preços e Margens
                </p>

                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="text-center p-2 bg-gray-700/30 rounded">
                    <div className="text-xs text-gray-400">Custo</div>
                    {Number(product.cost_price) > 0 ? (
                      <div className="text-xs font-medium text-white">{formatCurrency(product.cost_price)}</div>
                    ) : (
                      <div className="text-red-400 text-xs">⚠️</div>
                    )}
                  </div>
                  <div className="text-center p-2 bg-gray-700/30 rounded">
                    <div className="text-xs text-gray-400">Venda</div>
                    <div className="text-xs font-medium text-green-400">{formatCurrency(product.price)}</div>
                  </div>
                  <div className="text-center p-2 bg-gray-700/30 rounded">
                    <div className="text-xs text-gray-400">Margem</div>
                    {Number(product.cost_price) > 0 && Number(product.price) > 0 ? (
                      <div className="text-xs font-medium text-green-400">
                        {(((Number(product.price) - Number(product.cost_price)) / Number(product.cost_price)) * 100).toFixed(0)}%
                      </div>
                    ) : (
                      <div className="text-gray-500 text-xs">--</div>
                    )}
                  </div>
                </div>

                {/* Preço Pacote se aplicável */}
                {product.has_package_tracking && (
                  <div className="border-t border-gray-700/50 pt-2">
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