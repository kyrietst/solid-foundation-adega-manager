/**
 * Modal de detalhes completos do produto para gestão de estoque
 * Layout balanceado e otimizado para melhor experiência do usuário
 */

import React, { useMemo } from 'react';
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
  Settings,
  X,
  Calendar,
  DollarSign,
  Factory,
  Globe,
  Barcode,
  ShoppingCart,
  Tags,
  Layers,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/core/config/utils';
import { formatCurrency } from '@/core/config/utils';
import { useFormatBrazilianDate } from '@/shared/hooks/common/use-brasil-timezone';
import { useProductAnalytics } from '@/features/inventory/hooks/useProductAnalytics';
import { useGlassmorphismEffect } from '@/shared/hooks/ui/useGlassmorphismEffect';
import { calculatePackageDisplay } from '@/shared/utils/stockCalculations';
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
  const { handleMouseMove } = useGlassmorphismEffect();
  
  // Buscar dados analíticos reais do produto
  const { analytics, isLoading: analyticsLoading } = useProductAnalytics(product?.id || null);
  
  // SSoT: Dados de estoque diretamente do produto
  const packageDisplay = product ? calculatePackageDisplay(product.stock_quantity, product.package_units) : null;
  
  // Calcular completude dos dados (sempre executar o hook, independente do product)
  const completeness = useMemo(() => {
    if (!product) return { percentage: 0, missing: [], filled: [], hasPackageData: false };
    
    // Campos obrigatórios/importantes para preenchimento do usuário
    const fields = [
      { key: 'barcode', name: 'Código de Barras (Unidade)', critical: false, userInput: true, section: 'barcode' },
      { key: 'supplier', name: 'Fornecedor', critical: false, userInput: true, section: 'basic' },
      { key: 'cost_price', name: 'Preço de Custo', critical: true, userInput: true, section: 'pricing' },
      { key: 'volume_ml', name: 'Volume (ml)', critical: false, userInput: true, section: 'basic' },
      { key: 'minimum_stock', name: 'Estoque Mínimo', critical: false, userInput: true, section: 'stock' }
    ];
    
    // Campos condicionais para pacote (se has_package_tracking = true)
    const packageFields = [
      { key: 'package_barcode', name: 'Código de Barras (Pacote)', critical: false, userInput: true, section: 'barcode' },
      { key: 'package_units', name: 'Unidades por Pacote', critical: false, userInput: true, section: 'package' },
      { key: 'package_price', name: 'Preço do Pacote', critical: false, userInput: true, section: 'pricing' }
    ];
    
    const allFields = [...fields];
    const hasPackageTracking = product.has_package_tracking;
    
    // Adicionar campos de pacote apenas se o tracking estiver ativo
    if (hasPackageTracking) {
      allFields.push(...packageFields);
    }
    
    const total = allFields.length;
    let filled = 0;
    const missing = [];
    const filledFields = [];
    
    allFields.forEach(field => {
      const value = product[field.key];
      const hasValue = value && value !== 0 && String(value).trim() !== '';
      
      if (hasValue) {
        filled++;
        filledFields.push(field);
      } else {
        missing.push(field);
      }
    });
    
    return {
      percentage: Math.round((filled / total) * 100),
      missing,
      filled: filledFields,
      critical: missing.some(f => f.critical),
      hasPackageData: hasPackageTracking,
      totalFields: total,
      filledCount: filled
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
    <EnhancedBaseModal
      isOpen={isOpen}
      onClose={onClose}
      modalType="view"
      title="Detalhes do Produto"
      subtitle={product.name}
      customIcon={Eye}
      size="5xl"
      className="max-h-[90vh]"
      showCloseButton={true}
    >
      <div className="flex flex-col h-full">
        {/* Header personalizado com completude */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 flex-shrink-0">
          <div>
            
          </div>

            {/* Indicador de completude detalhado */}
            <div className="flex items-center gap-4">
              <div className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg border",
                completeness.critical 
                  ? "bg-red-500/20 border-red-400/40 animate-pulse" 
                  : completeness.percentage === 100 
                    ? "bg-green-500/20 border-green-400/40"
                    : "bg-yellow-500/20 border-yellow-400/40"
              )}>
                <div className="flex flex-col items-center">
                  <div className={cn(
                    "text-lg font-bold",
                    completeness.critical ? "text-red-400" : 
                    completeness.percentage === 100 ? "text-green-400" : "text-yellow-400"
                  )}>
                    {completeness.percentage}%
                  </div>
                  <div className="text-xs text-gray-400">completo</div>
                </div>
                
                <div className="border-l border-gray-600 pl-3">
                  <div className="text-sm text-gray-300">
                    <span className="text-white font-medium">{completeness.filledCount}</span>/{completeness.totalFields}
                  </div>
                  <div className="text-xs text-gray-400">campos preenchidos</div>
                </div>
                
                {completeness.percentage === 100 ? (
                  <span className="text-green-400 text-lg">✅</span>
                ) : completeness.critical ? (
                  <span className="text-red-400 text-lg animate-bounce">⚠️</span>
                ) : (
                  <span className="text-yellow-400 text-lg">📝</span>
                )}
              </div>
              
              {completeness.missing.length > 0 && (
                <div className={cn(
                  "px-3 py-2 rounded-lg border text-xs",
                  completeness.critical 
                    ? "bg-red-500/10 border-red-400/30 text-red-300" 
                    : "bg-orange-500/10 border-orange-400/30 text-orange-300"
                )}>
                  <div className="font-medium">
                    {completeness.missing.length} campo{completeness.missing.length > 1 ? 's' : ''} pendente{completeness.missing.length > 1 ? 's' : ''}
                  </div>
                  {completeness.critical && (
                    <div className="text-red-400">Dados críticos em falta</div>
                  )}
                </div>
              )}
            </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 space-y-6">
          {/* Seção de Dados Pendentes - Visível apenas quando há dados em falta */}
          {completeness.missing.length > 0 && (
            <div className={cn(
              "rounded-xl p-6 border hero-spotlight hover:shadow-2xl hover:shadow-purple-500/10 hover:border-purple-400/30 transition-all duration-300",
              completeness.critical 
                ? "bg-red-500/10 border-red-400/30" 
                : "bg-orange-500/10 border-orange-400/30"
            )} onMouseMove={handleMouseMove}>
              <div className="flex items-center gap-3 mb-4">
                <div className={cn(
                  "p-2 rounded-lg",
                  completeness.critical ? "bg-red-500/20" : "bg-orange-500/20"
                )}>
                  <Settings className={cn(
                    "h-5 w-5",
                    completeness.critical ? "text-red-400" : "text-orange-400"
                  )} />
                </div>
                <div>
                  <h3 className={cn(
                    "text-lg font-semibold",
                    completeness.critical ? "text-red-300" : "text-orange-300"
                  )}>
                    {completeness.critical ? "📋 Dados Críticos Pendentes" : "📝 Dados Pendentes de Preenchimento"}
                  </h3>
                  <p className="text-sm text-gray-400">
                    Complete as informações abaixo para otimizar o controle do produto
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {completeness.missing.map((field, index) => (
                  <div 
                    key={field.key}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 hover:scale-105",
                      field.critical 
                        ? "bg-red-500/10 border-red-400/30 hover:border-red-400/50" 
                        : "bg-orange-500/10 border-orange-400/30 hover:border-orange-400/50"
                    )}
                  >
                    <div className={cn(
                      "flex-shrink-0 w-2 h-2 rounded-full",
                      field.critical ? "bg-red-400 animate-pulse" : "bg-orange-400"
                    )} />
                    <div className="flex-1 min-w-0">
                      <div className={cn(
                        "text-sm font-medium truncate",
                        field.critical ? "text-red-300" : "text-orange-300"
                      )}>
                        {field.name}
                      </div>
                      <div className="text-xs text-gray-500 capitalize">
                        {field.section === 'basic' && '📋 Informações Básicas'}
                        {field.section === 'barcode' && '🏷️ Códigos de Barras'}
                        {field.section === 'pricing' && '💰 Preços'}
                        {field.section === 'stock' && '📦 Controle de Estoque'}
                        {field.section === 'package' && '📦 Configuração de Pacote'}
                      </div>
                    </div>
                    {field.critical && (
                      <div className="text-red-400 text-xs font-medium animate-pulse">
                        CRÍTICO
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="mt-4 p-3 bg-gray-800/30 rounded-lg border border-gray-600/50">
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Globe className="h-4 w-4 text-blue-400" />
                  <span>
                    <span className="font-medium text-blue-400">Dica:</span> 
                    Use o botão "Editar" para preencher estes campos rapidamente
                  </span>
                </div>
              </div>
            </div>
          )}
          
          {/* Seção Superior: Imagem e Informações Principais */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Imagem do produto - 1 coluna */}
            <div className="lg:col-span-1">
              <div className="relative h-48 lg:h-64 bg-gray-700/50 rounded-xl flex items-center justify-center overflow-hidden">
                {product.image_url ? (
                  <img 
                    src={product.image_url} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Package className="h-32 w-32 text-gray-400" />
                )}
                
                {/* Badge de status */}
                <div className="absolute top-3 right-3">
                  <Badge className={cn("text-xs font-medium", stockStatus.color)}>
                    {stockStatus.label}
                  </Badge>
                </div>
              </div>
              
              {/* Ações rápidas */}
              <div className="flex gap-2 mt-4">
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

            {/* Informações Básicas e Estoque - 2 colunas */}
            <div className="lg:col-span-2">
              <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50 hero-spotlight hover:shadow-2xl hover:shadow-purple-500/10 hover:border-purple-400/30 transition-all duration-300 h-full" onMouseMove={handleMouseMove}>
                <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-5">
                  <Package className="h-5 w-5 text-blue-400" />
                  Informações Básicas
                </h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-400">Categoria</label>
                      <p className="text-white font-medium">{product.category}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm text-gray-400 flex items-center gap-2">
                        Volume
                        {!product.volume_ml && <span className="text-orange-400 animate-pulse">📝</span>}
                      </label>
                      {!product.volume_ml ? (
                        <div className="flex items-center gap-2">
                          <p className="text-orange-400 font-medium flex items-center gap-1">
                            <span className="animate-pulse">⚠️</span> Não informado
                          </p>
                          <span className="text-xs bg-orange-500/20 px-2 py-1 rounded border border-orange-400/30 text-orange-300">
                            PENDENTE
                          </span>
                        </div>
                      ) : (
                        <p className="text-white font-medium">{product.volume_ml} ml</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-400 flex items-center gap-2">
                      Fornecedor
                      {(!product.supplier || String(product.supplier).trim() === '') && (
                        <span className="text-orange-400 animate-pulse">📝</span>
                      )}
                    </label>
                    {!product.supplier || String(product.supplier).trim() === '' ? (
                      <div className="flex items-center gap-2">
                        <p className="text-orange-400 font-medium flex items-center gap-1">
                          <span className="animate-pulse">⚠️</span> Não informado
                        </p>
                        <span className="text-xs bg-orange-500/20 px-2 py-1 rounded border border-orange-400/30 text-orange-300">
                          PENDENTE
                        </span>
                      </div>
                    ) : (
                      <p className="text-white font-medium">{String(product.supplier).trim()}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Controle de Estoque - 2 colunas */}
            <div className="lg:col-span-2">
              <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50 hero-spotlight hover:shadow-2xl hover:shadow-purple-500/10 hover:border-purple-400/30 transition-all duration-300 h-full" onMouseMove={handleMouseMove}>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Package className="h-5 w-5 text-yellow-400" />
                    Controle de Estoque
                  </h3>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onAdjustStock(product)}
                      className="border-green-500/30 text-green-400 hover:bg-green-500/10"
                    >
                      <Settings className="h-4 w-4 mr-1" />
                      Ajustar Estoque
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {/* Display de estoque SSoT */}
                  <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-white flex items-center gap-2">
                        <Package className="h-4 w-4 text-primary-yellow" />
                        Estoque Atual
                      </h4>
                      <div className="text-2xl font-bold text-primary-yellow">
                        {product.stock_quantity} unidades
                      </div>
                    </div>

                    {/* Exibição de pacotes se configurado */}
                    {product.has_package_tracking && product.package_units && product.package_units > 1 && packageDisplay && (
                      <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-700/50">
                        <div className="text-center p-3 bg-blue-500/10 border border-blue-400/30 rounded-lg">
                          <div className="text-lg font-semibold text-blue-400">
                            {packageDisplay.packages}
                          </div>
                          <div className="text-xs text-gray-400">pacotes completos</div>
                          <div className="text-xs text-blue-300">
                            ({packageDisplay.packages * product.package_units} unidades)
                          </div>
                        </div>

                        <div className="text-center p-3 bg-green-500/10 border border-green-400/30 rounded-lg">
                          <div className="text-lg font-semibold text-green-400">
                            {packageDisplay.units}
                          </div>
                          <div className="text-xs text-gray-400">unidades soltas</div>
                          <div className="text-xs text-green-300">
                            {packageDisplay.units > 0 ? 'fora de pacotes' : 'sem sobra'}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Exibição simples se não há pacotes */}
                    {!product.has_package_tracking && (
                      <div className="text-center p-4 bg-gray-800/30 border border-gray-600/30 rounded-lg">
                        <div className="text-sm text-gray-400 mb-1">Controle simples por unidades</div>
                        <div className="text-lg font-semibold text-gray-300">
                          {product.stock_quantity} unidades disponíveis
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Estoque mínimo e analytics */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className={cn(
                      "rounded p-4 text-center border",
                      !product.minimum_stock
                        ? "bg-orange-500/10 border-orange-400/30"
                        : "bg-gray-800/40 border-gray-600/30"
                    )}>
                      <label className="text-xs text-gray-400 flex items-center justify-center gap-1">
                        Estoque Mínimo
                        {!product.minimum_stock && <span className="text-orange-400 animate-pulse">📝</span>}
                      </label>
                      {!product.minimum_stock ? (
                        <div className="space-y-1">
                          <p className="text-lg font-bold text-orange-400">10 (padrão)</p>
                          <span className="text-xs bg-orange-500/20 px-2 py-1 rounded border border-orange-400/30 text-orange-300">
                            USAR PERSONALIZADO
                          </span>
                        </div>
                      ) : (
                        <p className="text-2xl font-bold text-yellow-400">{product.minimum_stock}</p>
                      )}
                      <span className="text-xs text-gray-400">unidades</span>
                    </div>

                    <div className="space-y-3 text-sm">
                      <div>
                        <label className="text-gray-400 flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          Última Entrada
                        </label>
                        <p className="text-gray-100 text-xs">
                          {analyticsLoading ? 'Carregando...' : analytics?.lastEntry ? formatCompact(analytics.lastEntry) : 'Nenhuma'}
                        </p>
                      </div>

                      <div>
                        <label className="text-gray-400 flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          Última Saída
                        </label>
                        <p className="text-gray-100 text-xs">
                          {analyticsLoading ? 'Carregando...' : analytics?.lastExit ? formatCompact(analytics.lastExit) : 'Nenhuma'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Seção Média: Sistema de Códigos e Análise de Giro */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sistema de Códigos Hierárquicos */}
            <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50 hero-spotlight hover:shadow-2xl hover:shadow-purple-500/10 hover:border-purple-400/30 transition-all duration-300" onMouseMove={handleMouseMove}>
              <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-5">
                <Barcode className="h-5 w-5 text-yellow-400" />
                Sistema de Códigos de Barras
              </h3>
              
              <div className="space-y-4">
                {/* Venda por Unidade */}
                <div className="flex items-center justify-between rounded-lg border border-blue-400/30 p-4 bg-blue-400/5">
                  <div className="space-y-1">
                    <div className="text-base text-gray-300 font-medium flex items-center gap-2">
                      <ShoppingCart className="h-4 w-4 text-blue-400" />
                      Venda por Unidade
                    </div>
                    <div className="text-sm text-gray-500">
                      {product.has_unit_tracking !== false ? 'Habilitada' : 'Desabilitada'}
                    </div>
                  </div>
                  <div className="text-right">
                    {product.unit_barcode || product.barcode ? (
                      <div>
                        <div className="text-sm text-gray-400">Código</div>
                        <div className="font-mono text-white text-sm bg-gray-800/50 px-2 py-1 rounded">
                          {product.unit_barcode || product.barcode}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <div className="text-orange-400 text-sm flex items-center gap-1">
                          <span className="animate-pulse">⚠️</span> Sem código
                        </div>
                        <div className="text-xs bg-orange-500/20 px-2 py-1 rounded border border-orange-400/30 text-orange-300">
                          RECOMENDADO
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Venda por Pacote */}
                <div className="flex items-center justify-between rounded-lg border border-yellow-400/30 p-4 bg-yellow-400/5">
                  <div className="space-y-1">
                    <div className="text-base text-gray-300 font-medium flex items-center gap-2">
                      <Package className="h-4 w-4 text-yellow-400" />
                      Venda por Pacote/Fardo
                    </div>
                    <div className="text-sm text-gray-500">
                      {product.has_package_tracking ? 'Habilitada' : 'Desabilitada'}
                    </div>
                  </div>
                  <div className="text-right">
                    {product.has_package_tracking ? (
                      <div>
                        <div className="text-sm text-gray-400">Código do Pacote</div>
                        {product.package_barcode ? (
                          <div className="font-mono text-white text-sm bg-gray-800/50 px-2 py-1 rounded">
                            {product.package_barcode}
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <div className="text-orange-400 text-sm flex items-center gap-1">
                              <span className="animate-pulse">⚠️</span> Não informado
                            </div>
                            <div className="text-xs bg-orange-500/20 px-1 py-0.5 rounded border border-orange-400/30 text-orange-300">
                              PENDENTE
                            </div>
                          </div>
                        )}
                        <div className="text-xs text-gray-400 mt-1">
                          {product.package_units || 1} unidades/pacote
                        </div>
                      </div>
                    ) : (
                      <div className="text-gray-500 text-sm">Não configurada</div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Análise de giro */}
            <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50 hero-spotlight hover:shadow-2xl hover:shadow-purple-500/10 hover:border-purple-400/30 transition-all duration-300" onMouseMove={handleMouseMove}>
              <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-5">
                <TurnoverIcon className={cn("h-5 w-5", turnoverAnalysis.color)} />
                Análise de Giro
              </h3>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-gray-800/40 rounded p-4 text-center">
                  <label className="text-xs text-gray-400">Classificação</label>
                  <p className={cn("text-lg font-bold", turnoverAnalysis.color)}>
                    Giro {turnoverAnalysis.rate}
                  </p>
                  <span className="text-xs text-gray-400">{turnoverAnalysis.description}</span>
                </div>
                
                <div className="bg-gray-800/40 rounded p-4 text-center">
                  <label className="text-xs text-gray-400">Vendas/Mês</label>
                  <p className="text-lg font-bold text-gray-100">
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
          </div>
          
          {/* Seção Inferior: Preços */}
          <div className="space-y-6">
            {/* Dados comerciais */}
            <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50 hero-spotlight hover:shadow-2xl hover:shadow-purple-500/10 hover:border-purple-400/30 transition-all duration-300" onMouseMove={handleMouseMove}>
              <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-5">
                <DollarSign className="h-5 w-5 text-green-400" />
                Preços e Margem
              </h3>
              
              {/* Preços de Unidade */}
              <div className="space-y-5">
                <h4 className="text-base font-medium text-gray-200 flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4 text-blue-400" />
                  Preços por Unidade
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <label className="text-gray-300 flex items-center gap-2">
                      Preço de Custo (unidade)
                      {(!product.cost_price || product.cost_price === 0) && (
                        <span className="text-red-400 animate-bounce text-sm">⚠️ CRÍTICO</span>
                      )}
                    </label>
                    <div className={cn(
                      "h-11 rounded-md px-3 flex items-center mt-2 border",
                      !product.cost_price || product.cost_price === 0 
                        ? "bg-red-500/10 border-red-400/40 animate-pulse"
                        : "bg-gray-800/30 border-gray-600"
                    )}>
                      {!product.cost_price || product.cost_price === 0 ? (
                        <div className="flex items-center justify-between w-full">
                          <span className="text-red-400 font-medium flex items-center gap-2">
                            <span className="animate-pulse">⚠️</span> Não informado
                          </span>
                          <span className="text-xs bg-red-500/20 px-2 py-1 rounded border border-red-400/30 text-red-300 animate-pulse">
                            CRÍTICO
                          </span>
                        </div>
                      ) : (
                        <span className="text-white font-medium">{formatCurrency(product.cost_price)}</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-gray-300">Preço de Venda (unidade)</label>
                    <div className="h-11 bg-gray-800/30 border border-gray-600 rounded-md px-3 flex items-center mt-2">
                      <span className="text-green-400 font-medium">{formatCurrency(product.price)}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-gray-300">Margem Unitária</label>
                    <div className="h-11 bg-gray-800/30 border border-gray-600 rounded-md px-3 flex items-center mt-2">
                      {!product.margin_percent ? (
                        <span className="text-gray-500">🔄 Auto-calculada</span>
                      ) : (
                        <span className="text-green-400 font-medium">{String(product.margin_percent).trim()}%</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Preços de Pacote - Condicional */}
              {product.has_package_tracking && (
                <div className="space-y-5 border-t border-gray-700/50 pt-5">
                  <h4 className="text-base font-medium text-gray-200 flex items-center gap-2">
                    <Package className="h-4 w-4 text-yellow-400" />
                    Preços por Pacote/Fardo
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div>
                      <label className="text-gray-300 flex items-center gap-2">
                        Preço de Venda (pacote)
                        {!product.package_price && (
                          <span className="text-orange-400 animate-pulse text-sm">📝</span>
                        )}
                      </label>
                      <div className={cn(
                        "h-11 rounded-md px-3 flex items-center mt-2 border",
                        !product.package_price 
                          ? "bg-orange-500/10 border-orange-400/30"
                          : "bg-gray-800/30 border-gray-600"
                      )}>
                        {product.package_price ? (
                          <span className="text-green-400 font-medium">{formatCurrency(product.package_price)}</span>
                        ) : (
                          <div className="flex items-center justify-between w-full">
                            <span className="text-orange-400 font-medium flex items-center gap-1">
                              <span className="animate-pulse">⚠️</span> Não informado
                            </span>
                            <span className="text-xs bg-orange-500/20 px-2 py-1 rounded border border-orange-400/30 text-orange-300">
                              RECOMENDADO
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="text-gray-300">Margem do Pacote</label>
                      <div className="h-11 bg-gray-800/30 border border-gray-600 rounded-md px-3 flex items-center mt-2">
                        {product.package_margin ? (
                          <span className="text-green-400 font-medium">{String(product.package_margin).trim()}%</span>
                        ) : (
                          <span className="text-gray-500">🔄 Auto-calculada</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="text-gray-300">Economia do Cliente</label>
                      <div className="h-11 bg-gray-800/30 border border-green-600/50 rounded-md px-3 flex items-center mt-2">
                        {product.package_price && product.price && product.package_units ? (
                          <span className="text-green-400 font-medium">
                            {(() => {
                              const units = product.package_units || 1;
                              const individualTotal = product.price * units;
                              const savings = individualTotal - product.package_price;
                              const savingsPercent = (savings / individualTotal * 100).toFixed(1);
                              return `R$ ${savings.toFixed(2)} (${savingsPercent}%)`;
                            })()}
                          </span>
                        ) : (
                          <span className="text-gray-500">💰 Calculando...</span>
                        )}
                      </div>
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

export default ProductDetailsModal;