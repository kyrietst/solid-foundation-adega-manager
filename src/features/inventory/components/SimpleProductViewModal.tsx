/**
 * Modal simplificado de visualização do produto
 * Foco em informações essenciais com análise de giro preservada para marketing
 */

import React from 'react';
import { EnhancedBaseModal } from '@/shared/ui/composite';
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
  AlertCircle
} from 'lucide-react';
import { cn } from '@/core/config/utils';
import { formatCurrency } from '@/core/config/utils';
import { useFormatBrazilianDate } from '@/shared/hooks/common/use-brasil-timezone';
import { useProductAnalytics } from '@/features/inventory/hooks/useProductAnalytics';
import type { Product } from '@/types/inventory.types';

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
    label: 'Sem Estoque',
    color: 'bg-red-500/20 text-red-400 border-red-400/30'
  };
  if (currentStock <= minStock) return {
    status: 'low',
    label: 'Estoque Baixo',
    color: 'bg-yellow-500/20 text-yellow-400 border-yellow-400/30'
  };
  return {
    status: 'available',
    label: 'Disponível',
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
    description: 'Alta rotatividade'
  };
  if (turnoverRate === 'medio') return {
    rate: 'Médio',
    icon: Minus,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/10 border-yellow-400/30',
    description: 'Rotatividade moderada'
  };
  return {
    rate: 'Baixo',
    icon: TrendingDown,
    color: 'text-red-400',
    bgColor: 'bg-red-500/10 border-red-400/30',
    description: 'Baixa rotatividade'
  };
};

// Lógica inteligente de completude baseada em prioridade comercial
interface FieldInfo {
  key: keyof Product;
  name: string;
  priority: 'critical' | 'important' | 'optional';
  weight: number;
  reason: string;
  icon: React.ComponentType<{ className?: string }>;
}

const getProductCompleteness = (product: Product) => {
  // Campos classificados por prioridade comercial
  const fields: FieldInfo[] = [
    // 🔴 CRÍTICOS (Marketing/Vendas) - Peso 3
    {
      key: 'cost_price',
      name: 'Preço de Custo',
      priority: 'critical',
      weight: 3,
      reason: 'Essencial para análise de margem e rentabilidade',
      icon: DollarSign
    },
    {
      key: 'supplier',
      name: 'Fornecedor',
      priority: 'critical',
      weight: 3,
      reason: 'Fundamental para negociação e sourcing estratégico',
      icon: Factory
    },
    {
      key: 'volume_ml',
      name: 'Volume/Peso',
      priority: 'critical',
      weight: 3,
      reason: 'Necessário para logística e precificação por unidade',
      icon: Package
    },

    // 🟡 IMPORTANTES (Operacional) - Peso 2
    {
      key: 'minimum_stock',
      name: 'Estoque Mínimo',
      priority: 'important',
      weight: 2,
      reason: 'Evita rupturas e melhora planejamento',
      icon: AlertTriangle
    },
    {
      key: 'barcode',
      name: 'Código de Barras',
      priority: 'important',
      weight: 2,
      reason: 'Agiliza operações e reduz erros',
      icon: Barcode
    },

    // 🟢 OPCIONAIS (Complementares) - Peso 1
    {
      key: 'image_url',
      name: 'Imagem',
      priority: 'optional',
      weight: 1,
      reason: 'Melhora apresentação e vendas',
      icon: Eye
    }
  ];

  // Verificar quais campos estão preenchidos
  const analysis = fields.map(field => {
    const value = product[field.key];
    let isComplete = false;

    if (field.key === 'cost_price') {
      isComplete = Number(value) > 0;
    } else if (typeof value === 'string') {
      isComplete = value.trim() !== '';
    } else if (typeof value === 'number') {
      isComplete = value > 0;
    } else {
      isComplete = value !== null && value !== undefined;
    }

    return {
      ...field,
      isComplete,
      value
    };
  });

  // Calcular completude ponderada
  const totalWeight = analysis.reduce((sum, field) => sum + field.weight, 0);
  const completedWeight = analysis
    .filter(field => field.isComplete)
    .reduce((sum, field) => sum + field.weight, 0);

  const percentage = Math.round((completedWeight / totalWeight) * 100);

  // Separar campos por status
  const missing = analysis.filter(field => !field.isComplete);
  const completed = analysis.filter(field => field.isComplete);

  // Classificar criticidade geral
  const criticalMissing = missing.filter(field => field.priority === 'critical');
  const importantMissing = missing.filter(field => field.priority === 'important');

  return {
    percentage,
    status: percentage >= 90 ? 'excellent' : percentage >= 70 ? 'good' : percentage >= 50 ? 'fair' : 'poor',
    missing,
    completed,
    criticalMissing,
    importantMissing,
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

  // Buscar dados analíticos reais do produto apenas quando há produto válido
  const { analytics, isLoading: analyticsLoading, error: analyticsError } = useProductAnalytics(
    product?.id || null
  );

  // Calcular completude inteligente do produto
  const completeness = React.useMemo(() => {
    if (!product) return null;
    return getProductCompleteness(product);
  }, [product]);

  // GUARDA DE RENDERIZAÇÃO ROBUSTA: Modal deve estar aberto E produto deve existir
  if (!isOpen || !product) {
    return null;
  }

  // ✅ SSoT: minimum_stock agora vem do banco
  const stockStatus = getStockStatus(product.stock_quantity, product.minimum_stock);

  // Usar dados reais ou fallback para análise de giro (ESSENCIAL PARA MARKETING)
  const turnoverAnalysis = analytics && !analyticsError
    ? getTurnoverAnalysis(analytics.turnoverRate, analytics.salesPerMonth)
    : getTurnoverAnalysis('baixo', 0);

  const TurnoverIcon = turnoverAnalysis.icon;

  return (
    <EnhancedBaseModal
      isOpen={isOpen}
      onClose={onClose}
      modalType="view"
      title="Visualizar Produto"
      subtitle={product.name}
      customIcon={Eye}
      size="5xl"
      className="max-h-[90vh]"
      showCloseButton={true}
    >
      <div className="max-h-[75vh] overflow-y-auto pr-2 scrollbar-dark space-y-6">
        {/* Header com Status */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Package className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">{product.name}</h3>
              <p className="text-sm text-gray-400">{product.category}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Badge de Completude Inteligente */}
            {completeness && (
              <button
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 cursor-pointer hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-950",
                  completeness.status === 'excellent' ? "bg-green-500/10 border-green-400/40 text-green-400 focus:ring-green-400/20" :
                  completeness.status === 'good' ? "bg-blue-500/10 border-blue-400/40 text-blue-400 focus:ring-blue-400/20" :
                  completeness.status === 'fair' ? "bg-yellow-500/10 border-yellow-400/40 text-yellow-400 focus:ring-yellow-400/20" :
                  "bg-red-500/10 border-red-400/40 text-red-400 animate-pulse focus:ring-red-400/20"
                )}
                onClick={() => setShowOptimization(!showOptimization)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setShowOptimization(!showOptimization);
                  }
                }}
                title={`${completeness.completedFields}/${completeness.totalFields} campos preenchidos. Clique para ${showOptimization ? 'ocultar' : 'ver'} detalhes.`}
                aria-label={`Completude do produto: ${completeness.percentage}%. ${showOptimization ? 'Ocultar' : 'Ver'} detalhes de otimização`}
              >
                {completeness.status === 'excellent' ? <CheckCircle className="h-4 w-4" /> :
                 completeness.status === 'poor' ? <XCircle className="h-4 w-4" /> :
                 <AlertCircle className="h-4 w-4" />}
                <div className="text-center">
                  <div className="text-sm font-bold">{completeness.percentage}%</div>
                  <div className="text-xs opacity-80">completo</div>
                </div>
                {completeness.missing.length > 0 && (
                  showOptimization ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                )}
              </button>
            )}

            {/* Badge de Estoque */}
            <Badge className={cn("text-sm font-medium", stockStatus.color)}>
              {stockStatus.label}
            </Badge>
          </div>
        </div>

        {/* Seção de Otimização de Dados - Collapsible */}
        {showOptimization && completeness && completeness.missing.length > 0 && (
          <div className="bg-gradient-to-r from-orange-500/10 via-red-500/10 to-yellow-500/10 border border-orange-400/40 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-semibold text-orange-200 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-400" />
                Oportunidades de Otimização ({completeness.missing.length} campos)
              </h4>
              <Badge className="bg-orange-500/20 text-orange-300 border-orange-400/30">
                {completeness.percentage}% completo
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Campos Críticos */}
              {completeness.criticalMissing.length > 0 && (
                <div className="bg-red-500/10 border border-red-400/30 rounded-lg p-4">
                  <h5 className="text-sm font-semibold text-red-300 flex items-center gap-2 mb-3">
                    <XCircle className="h-3 w-3" />
                    Críticos ({completeness.criticalMissing.length})
                  </h5>
                  <div className="space-y-2">
                    {completeness.criticalMissing.map((field) => {
                      const Icon = field.icon;
                      return (
                        <div key={field.key} className="text-xs">
                          <div className="flex items-center gap-2 text-red-200 font-medium">
                            <Icon className="h-3 w-3 text-red-400" />
                            {field.name}
                          </div>
                          <p className="text-red-300/80 mt-1">{field.reason}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Campos Importantes */}
              {completeness.importantMissing.length > 0 && (
                <div className="bg-yellow-500/10 border border-yellow-400/30 rounded-lg p-4">
                  <h5 className="text-sm font-semibold text-yellow-300 flex items-center gap-2 mb-3">
                    <AlertCircle className="h-3 w-3" />
                    Importantes ({completeness.importantMissing.length})
                  </h5>
                  <div className="space-y-2">
                    {completeness.importantMissing.map((field) => {
                      const Icon = field.icon;
                      return (
                        <div key={field.key} className="text-xs">
                          <div className="flex items-center gap-2 text-yellow-200 font-medium">
                            <Icon className="h-3 w-3 text-yellow-400" />
                            {field.name}
                          </div>
                          <p className="text-yellow-300/80 mt-1">{field.reason}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Campos Opcionais */}
              {completeness.missing.filter(f => f.priority === 'optional').length > 0 && (
                <div className="bg-blue-500/10 border border-blue-400/30 rounded-lg p-4">
                  <h5 className="text-sm font-semibold text-blue-300 flex items-center gap-2 mb-3">
                    <CheckCircle className="h-3 w-3" />
                    Opcionais ({completeness.missing.filter(f => f.priority === 'optional').length})
                  </h5>
                  <div className="space-y-2">
                    {completeness.missing.filter(f => f.priority === 'optional').map((field) => {
                      const Icon = field.icon;
                      return (
                        <div key={field.key} className="text-xs">
                          <div className="flex items-center gap-2 text-blue-200 font-medium">
                            <Icon className="h-3 w-3 text-blue-400" />
                            {field.name}
                          </div>
                          <p className="text-blue-300/80 mt-1">{field.reason}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Ações de Melhoria */}
            <div className="flex items-center justify-between border-t border-orange-400/20 pt-4">
              <div className="text-xs text-orange-200/80">
                📈 <strong>Impacto no negócio:</strong> Dados completos melhoram decisões de compra, negociação com fornecedores e análise de rentabilidade.
              </div>
              <Button
                size="sm"
                onClick={() => onEdit(product)}
                className="bg-orange-500/20 border border-orange-400/40 text-orange-300 hover:bg-orange-500/30 text-xs px-3 py-1"
                variant="outline"
              >
                <Edit className="h-3 w-3 mr-1" />
                Completar Dados
              </Button>
            </div>
          </div>
        )}

        {/* Corpo Principal: 3 Colunas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Coluna 1: Imagem + Ações */}
          <div className="space-y-4">
            <div className="relative h-48 bg-gray-700/50 rounded-xl flex items-center justify-center overflow-hidden">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Package className="h-20 w-20 text-gray-400" />
              )}
            </div>

            {/* Ações Rápidas */}
            <div className="grid grid-cols-1 gap-2">
              <Button
                onClick={() => onEdit(product)}
                className="bg-blue-500/10 border border-blue-400/30 text-blue-400 hover:bg-blue-500/20"
                variant="outline"
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar Produto
              </Button>

              <Button
                onClick={() => onAdjustStock(product)}
                size="sm"
                className="bg-green-500/10 border border-green-400/30 text-green-400 hover:bg-green-500/20"
                variant="outline"
              >
                <Package className="h-3 w-3 mr-2" />
                Ajustar Estoque
              </Button>

              <Button
                onClick={() => onViewHistory(product)}
                size="sm"
                className="bg-gray-600/20 border border-gray-500/30 text-gray-300 hover:bg-gray-600/30"
                variant="outline"
              >
                <History className="h-3 w-3 mr-2" />
                Ver Histórico
              </Button>
            </div>
          </div>

          {/* Coluna 2: Informações Completas */}
          <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50 space-y-4">
            <h4 className="text-base font-semibold text-white flex items-center gap-2">
              <Package className="h-4 w-4 text-blue-400" />
              Informações Completas
            </h4>

            <div className="space-y-4">
              {/* Grid de Informações Básicas */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-gray-400">Categoria</span>
                  <p className="text-sm font-medium text-white">{product.category}</p>
                </div>

                <div>
                  <span className="text-xs text-gray-400">Preço de Venda</span>
                  <p className="text-lg font-bold text-green-400">{formatCurrency(product.price)}</p>
                </div>

                <div>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    Estoque Atual
                    {(!product.minimum_stock || product.minimum_stock <= 0) && completeness?.importantMissing.some(f => f.key === 'minimum_stock') && (
                      <span className="text-yellow-400 animate-pulse" title="Campo importante para evitar rupturas">⚠️</span>
                    )}
                  </span>
                  <p className="text-sm font-semibold text-white">{product.stock_quantity} unidades</p>
                  {product.minimum_stock ? (
                    <p className="text-xs text-gray-500">Mínimo: {product.minimum_stock}</p>
                  ) : (
                    <p className="text-yellow-400 text-xs italic">Mínimo não definido</p>
                  )}
                </div>

                <div>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    Volume/Peso
                    {!product.volume_ml && completeness?.criticalMissing.some(f => f.key === 'volume_ml') && (
                      <span className="text-red-400 animate-pulse" title="Campo crítico para logística e precificação">⚠️</span>
                    )}
                  </span>
                  {product.volume_ml ? (
                    <p className="text-sm text-gray-300">{product.volume_ml} ml</p>
                  ) : (
                    <p className="text-red-400 text-sm italic">Não informado</p>
                  )}
                </div>
              </div>

              {/* Fornecedor (sempre mostrar) */}
              <div className="border-t border-gray-700/50 pt-3">
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Factory className="h-3 w-3" />
                  Fornecedor
                  {(!product.supplier || String(product.supplier).trim() === '') && completeness?.criticalMissing.some(f => f.key === 'supplier') && (
                    <span className="text-red-400 animate-pulse" title="Campo crítico para negociação e sourcing">⚠️</span>
                  )}
                </span>
                {product.supplier && String(product.supplier).trim() ? (
                  <p className="text-sm text-gray-300 font-medium">{String(product.supplier).trim()}</p>
                ) : (
                  <p className="text-red-400 text-sm italic">Não informado</p>
                )}
              </div>

              {/* Última Entrada e Saída */}
              <div className="border-t border-gray-700/50 pt-3">
                <h5 className="text-sm font-medium text-gray-200 flex items-center gap-2 mb-2">
                  <Calendar className="h-3 w-3 text-yellow-400" />
                  Movimentação Recente
                </h5>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-800/40 rounded p-2 text-center">
                    <span className="text-xs text-gray-400">Última Entrada</span>
                    <p className="text-xs text-gray-100">
                      {analyticsLoading ? '⏳ Carregando...' :
                       analyticsError ? '❌ Erro' :
                       analytics?.lastEntry ? formatCompact(analytics.lastEntry) : 'N/A'}
                    </p>
                  </div>
                  <div className="bg-gray-800/40 rounded p-2 text-center">
                    <span className="text-xs text-gray-400">Última Saída</span>
                    <p className="text-xs text-gray-100">
                      {analyticsLoading ? '⏳ Carregando...' :
                       analyticsError ? '❌ Erro' :
                       analytics?.lastExit ? formatCompact(analytics.lastExit) : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Coluna 3: Análise de Giro (ESSENCIAL PARA MARKETING) */}
          <div className={cn(
            "rounded-xl p-6 border transition-all duration-300",
            turnoverAnalysis.bgColor
          )}>
            <h4 className="text-base font-semibold text-white flex items-center gap-2 mb-4">
              <TurnoverIcon className={cn("h-4 w-4", turnoverAnalysis.color)} />
              Análise de Giro
            </h4>

            <div className="space-y-4">
              {/* Classificação Principal */}
              <div className="text-center">
                <div className={cn(
                  "inline-flex items-center gap-2 px-4 py-2 rounded-lg border",
                  turnoverAnalysis.bgColor
                )}>
                  <TurnoverIcon className={cn("h-5 w-5", turnoverAnalysis.color)} />
                  <span className={cn("text-lg font-bold", turnoverAnalysis.color)}>
                    Giro {turnoverAnalysis.rate}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-2">{turnoverAnalysis.description}</p>
              </div>

              {/* Métricas de Vendas */}
              <div className="space-y-3">
                <div className="bg-gray-800/40 rounded-lg p-3 text-center">
                  <span className="text-xs text-gray-400">Vendas por Mês</span>
                  <p className="text-lg font-bold text-white">
                    {analyticsLoading ? '⏳ Carregando...' :
                     analyticsError ? '❌ Erro' :
                     analytics?.salesPerMonth || 0}
                  </p>
                  <span className="text-xs text-gray-400">unidades</span>
                </div>

                {analytics && !analyticsError && analytics.salesLast30Days > 0 && (
                  <div className="bg-gray-800/40 rounded-lg p-3 text-center">
                    <span className="text-xs text-gray-400">Últimos 30 dias</span>
                    <p className="text-sm font-semibold text-gray-300">
                      {analytics.salesLast30Days} vendidas
                    </p>
                  </div>
                )}

                {analytics && !analyticsError && analytics.lastExit && (
                  <div className="bg-gray-800/40 rounded-lg p-3 text-center">
                    <span className="text-xs text-gray-400">Última Venda</span>
                    <p className="text-xs text-gray-300">
                      {formatCompact(analytics.lastExit)}
                    </p>
                  </div>
                )}

                {analyticsError && (
                  <div className="bg-red-500/10 border border-red-400/30 rounded-lg p-3 text-center">
                    <p className="text-xs text-red-400">
                      Erro ao carregar dados de giro
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Seções Finais: Layout Horizontal para Economia de Espaço Vertical */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

          {/* Coluna 1: Códigos de Barras */}
          <div className="bg-gray-800/30 rounded-xl p-5 border border-gray-700/50">
            <h4 className="text-base font-semibold text-white flex items-center gap-2 mb-4">
              <Barcode className="h-4 w-4 text-yellow-400" />
              Sistema de Códigos
            </h4>

            <div className="space-y-3">
              {/* Venda por Unidade */}
              <div className="flex items-center justify-between rounded-lg border border-blue-400/30 p-3 bg-blue-400/5">
                <div className="space-y-1">
                  <div className="text-sm text-gray-300 font-medium flex items-center gap-2">
                    <ShoppingCart className="h-3 w-3 text-blue-400" />
                    Venda por Unidade
                  </div>
                  <div className="text-xs text-gray-500">
                    {product.has_unit_tracking !== false ? 'Habilitada' : 'Desabilitada'}
                  </div>
                </div>
                <div className="text-right">
                  {product.unit_barcode || product.barcode ? (
                    <div>
                      <div className="text-xs text-gray-400">Código</div>
                      <div className="font-mono text-white text-xs bg-gray-800/50 px-2 py-1 rounded">
                        {(product.unit_barcode || product.barcode)?.slice(0, 10)}...
                      </div>
                    </div>
                  ) : (
                    <div className="text-orange-400 text-xs flex items-center gap-1">
                      <span className="animate-pulse" title="Campo importante para agilizar operações">⚠️</span> Sem código
                    </div>
                  )}
                </div>
              </div>

              {/* Venda por Pacote */}
              <div className="flex items-center justify-between rounded-lg border border-yellow-400/30 p-3 bg-yellow-400/5">
                <div className="space-y-1">
                  <div className="text-sm text-gray-300 font-medium flex items-center gap-2">
                    <Package className="h-3 w-3 text-yellow-400" />
                    Venda por Pacote
                  </div>
                  <div className="text-xs text-gray-500">
                    {product.has_package_tracking ? 'Habilitada' : 'Desabilitada'}
                  </div>
                </div>
                <div className="text-right">
                  {product.has_package_tracking ? (
                    <div>
                      <div className="text-xs text-gray-400">Código</div>
                      {product.package_barcode ? (
                        <div className="font-mono text-white text-xs bg-gray-800/50 px-2 py-1 rounded">
                          {product.package_barcode.slice(0, 10)}...
                        </div>
                      ) : (
                        <div className="text-orange-400 text-xs flex items-center gap-1">
                          <span className="animate-pulse">⚠️</span> Pendente
                        </div>
                      )}
                      <div className="text-xs text-gray-400 mt-1">
                        {product.package_units || 1} un./pacote
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-500 text-xs">Não configurada</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Coluna 2: Preços e Margens */}
          <div className="bg-gray-800/30 rounded-xl p-5 border border-gray-700/50">
            <h4 className="text-base font-semibold text-white flex items-center gap-2 mb-4">
              <DollarSign className="h-4 w-4 text-green-400" />
              Preços e Margens
            </h4>

            <div className="space-y-4">
              {/* Preços de Unidade - Compacto */}
              <div>
                <h5 className="text-sm font-medium text-gray-200 flex items-center gap-2 mb-2">
                  <ShoppingCart className="h-3 w-3 text-blue-400" />
                  Por Unidade
                </h5>

                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center p-2 bg-gray-800/40 rounded">
                    <div className="text-xs text-gray-400 flex items-center justify-center gap-1">
                      Custo
                      {(() => {
                        const costPrice = Number(product.cost_price) || 0;
                        return costPrice <= 0 && completeness?.criticalMissing.some(f => f.key === 'cost_price') && (
                          <span className="text-red-400 animate-pulse" title="Campo crítico para análise de margem e rentabilidade">⚠️</span>
                        );
                      })()}
                    </div>
                    {(() => {
                      const costPrice = Number(product.cost_price) || 0;
                      return costPrice <= 0 ? (
                        <div className="text-red-400 text-xs font-bold animate-pulse">EM FALTA</div>
                      ) : (
                        <div className="text-white text-xs font-medium">{formatCurrency(costPrice)}</div>
                      );
                    })()}
                  </div>
                  <div className="text-center p-2 bg-gray-800/40 rounded">
                    <div className="text-xs text-gray-400">Venda</div>
                    <div className="text-green-400 text-xs font-medium">{formatCurrency(product.price)}</div>
                  </div>
                  <div className="text-center p-2 bg-gray-800/40 rounded">
                    <div className="text-xs text-gray-400">Margem</div>
                    {(() => {
                      const costPrice = Number(product.cost_price) || 0;
                      const salePrice = Number(product.price) || 0;
                      return costPrice > 0 && salePrice > 0 ? (
                        <div className="text-green-400 text-xs font-medium">
                          {(((salePrice - costPrice) / costPrice) * 100).toFixed(1)}%
                        </div>
                      ) : (
                        <div className="text-gray-500 text-xs">--</div>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* Preços de Pacote - Condicional e Compacto */}
              {product.has_package_tracking && (
                <div className="border-t border-gray-700/50 pt-3">
                  <h5 className="text-sm font-medium text-gray-200 flex items-center gap-2 mb-2">
                    <Package className="h-3 w-3 text-yellow-400" />
                    Por Pacote
                  </h5>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center p-2 bg-gray-800/40 rounded">
                      <div className="text-xs text-gray-400">Preço</div>
                      {product.package_price ? (
                        <div className="text-green-400 text-xs font-medium">{formatCurrency(product.package_price)}</div>
                      ) : (
                        <div className="text-orange-400 text-xs animate-pulse">⚠️ Falta</div>
                      )}
                    </div>
                    <div className="text-center p-2 bg-gray-800/40 rounded">
                      <div className="text-xs text-gray-400">Margem</div>
                      {product.cost_price && product.package_price && product.package_units ? (
                        <div className="text-green-400 text-xs font-medium">
                          {(((product.package_price - (product.cost_price * product.package_units)) / (product.cost_price * product.package_units)) * 100).toFixed(1)}%
                        </div>
                      ) : (
                        <div className="text-gray-500 text-xs">--</div>
                      )}
                    </div>
                    <div className="text-center p-2 bg-gray-800/40 rounded">
                      <div className="text-xs text-gray-400">Economia</div>
                      {product.package_price && product.price && product.package_units ? (
                        <div className="text-green-400 text-xs font-medium">
                          {(() => {
                            const units = product.package_units || 1;
                            const individualTotal = product.price * units;
                            const savings = individualTotal - product.package_price;
                            const savingsPercent = (savings / individualTotal * 100).toFixed(1);
                            return `${savingsPercent}%`;
                          })()}
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
    </EnhancedBaseModal>
  );
};

export default SimpleProductViewModal;