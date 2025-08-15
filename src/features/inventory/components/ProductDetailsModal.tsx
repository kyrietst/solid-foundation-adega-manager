/**
 * Modal de detalhes completos do produto para gestão de estoque
 * Foco em informações operacionais e técnicas
 */

import React, { useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/ui/primitives/dialog';
import { Button } from '@/shared/ui/primitives/button';
import { Badge } from '@/shared/ui/primitives/badge';
import { 
  Package, 
  MapPin, 
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
import type { Product } from '@/types/inventory.types';

interface ProductDetailsModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (product: Product) => void;
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

// Função para análise de giro (simulada)
const getTurnoverAnalysis = (productId: string) => {
  const hash = productId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const remainder = hash % 3;
  
  if (remainder === 0) return { 
    rate: 'Alto', 
    icon: TrendingUp, 
    color: 'text-green-400',
    description: 'Produto com alta rotatividade',
    salesPerMonth: 45
  };
  if (remainder === 1) return { 
    rate: 'Médio', 
    icon: Minus, 
    color: 'text-yellow-400',
    description: 'Produto com rotatividade moderada',
    salesPerMonth: 22
  };
  return { 
    rate: 'Baixo', 
    icon: TrendingDown, 
    color: 'text-red-400',
    description: 'Produto com baixa rotatividade',
    salesPerMonth: 8
  };
};

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  product,
  isOpen,
  onClose,
  onEdit,
  onAdjustStock,
  onViewHistory,
}) => {
  if (!product) return null;

  const stockStatus = getStockStatus(product.stock_quantity, product.minimum_stock || 10);
  const turnoverAnalysis = getTurnoverAnalysis(product.id);
  const TurnoverIcon = turnoverAnalysis.icon;

  // Simular localização física (estável por produto)
  const location = useMemo(() => {
    // Usar ID do produto para seed consistente
    const seed = product.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const aisle = (seed % 5) + 1;
    const shelf = (Math.floor(seed / 5) % 10) + 1;
    return `A${aisle}-B${shelf}`;
  }, [product.id]);
  
  // Simular datas (estáveis por produto)
  const { lastEntry, lastExit } = useMemo(() => {
    // Usar ID do produto para seed consistente
    const seed = product.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const entryDaysAgo = (seed % 30) + 1; // 1-30 dias atrás
    const exitDaysAgo = (seed % 7) + 1;   // 1-7 dias atrás
    
    return {
      lastEntry: new Date(Date.now() - entryDaysAgo * 24 * 60 * 60 * 1000),
      lastExit: new Date(Date.now() - exitDaysAgo * 24 * 60 * 60 * 1000)
    };
  }, [product.id]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-adega-charcoal/95 border-adega-gold/30 backdrop-blur-xl">
        <DialogHeader className="border-b border-white/10 pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold text-adega-platinum">
              DETALHES DO PRODUTO
            </DialogTitle>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-gray-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
          {/* Coluna 1: Imagem e Status */}
          <div className="space-y-4">
            {/* Imagem do produto */}
            <div className="relative aspect-square bg-gray-700/50 rounded-xl flex items-center justify-center overflow-hidden">
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
            <div className="space-y-2">
              <Button
                onClick={() => onEdit(product)}
                className="w-full bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 hover:bg-yellow-400/20"
                variant="outline"
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar Produto
              </Button>
              
              <Button
                onClick={() => onAdjustStock(product)}
                className="w-full bg-blue-400/10 border border-blue-400/30 text-blue-400 hover:bg-blue-400/20"
                variant="outline"
              >
                <Package className="h-4 w-4 mr-2" />
                Ajustar Estoque
              </Button>
              
              <Button
                onClick={() => onViewHistory(product)}
                className="w-full bg-gray-600/20 border border-gray-500/30 text-gray-300 hover:bg-gray-600/30"
                variant="outline"
              >
                <History className="h-4 w-4 mr-2" />
                Ver Histórico
              </Button>
            </div>
          </div>

          {/* Coluna 2 e 3: Informações detalhadas */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informações básicas */}
            <div className="bg-black/30 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-adega-platinum mb-3">
                Informações Básicas
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <p className="text-gray-100 font-medium">{product.supplier || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Informações de estoque */}
            <div className="bg-black/30 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-adega-platinum mb-3 flex items-center">
                <Package className="h-5 w-5 mr-2 text-yellow-400" />
                Controle de Estoque
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-800/40 rounded-lg p-3">
                  <label className="text-sm text-gray-400">Estoque Atual</label>
                  <p className="text-2xl font-bold text-gray-100">{product.stock_quantity}</p>
                  <span className="text-sm text-gray-400">unidades</span>
                </div>
                
                <div className="bg-gray-800/40 rounded-lg p-3">
                  <label className="text-sm text-gray-400">Estoque Mínimo</label>
                  <p className="text-xl font-bold text-yellow-400">{product.minimum_stock || 10}</p>
                  <span className="text-sm text-gray-400">unidades</span>
                </div>
                
                <div className="bg-gray-800/40 rounded-lg p-3">
                  <label className="text-sm text-gray-400">Localização</label>
                  <p className="text-xl font-bold text-blue-400 flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {location}
                  </p>
                </div>
              </div>
              
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Última Entrada
                  </label>
                  <p className="text-gray-100">{lastEntry.toLocaleDateString('pt-BR')}</p>
                </div>
                
                <div>
                  <label className="text-sm text-gray-400 flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Última Saída
                  </label>
                  <p className="text-gray-100">{lastExit.toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
            </div>

            {/* Análise de giro */}
            <div className="bg-black/30 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-adega-platinum mb-3 flex items-center">
                <TurnoverIcon className={cn("h-5 w-5 mr-2", turnoverAnalysis.color)} />
                Análise de Giro
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-800/40 rounded-lg p-3">
                  <label className="text-sm text-gray-400">Classificação</label>
                  <p className={cn("text-xl font-bold", turnoverAnalysis.color)}>
                    Giro {turnoverAnalysis.rate}
                  </p>
                  <span className="text-sm text-gray-400">{turnoverAnalysis.description}</span>
                </div>
                
                <div className="bg-gray-800/40 rounded-lg p-3">
                  <label className="text-sm text-gray-400">Vendas/Mês</label>
                  <p className="text-xl font-bold text-gray-100">{turnoverAnalysis.salesPerMonth}</p>
                  <span className="text-sm text-gray-400">unidades</span>
                </div>
              </div>
            </div>

            {/* Dados comerciais */}
            <div className="bg-black/30 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-adega-platinum mb-3 flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-green-400" />
                Dados Comerciais
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    {product.margin_percent ? `${product.margin_percent}%` : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Dados técnicos */}
            <div className="bg-black/30 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-adega-platinum mb-3 flex items-center">
                <Factory className="h-5 w-5 mr-2 text-blue-400" />
                Dados Técnicos
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400">Volume</label>
                  <p className="text-gray-100">{product.volume || 'N/A'}</p>
                </div>
                
                <div>
                  <label className="text-sm text-gray-400">Teor Alcoólico</label>
                  <p className="text-gray-100">{product.alcohol_content ? `${product.alcohol_content}%` : 'N/A'}</p>
                </div>
                
                <div>
                  <label className="text-sm text-gray-400">País de Origem</label>
                  <p className="text-gray-100 flex items-center">
                    <Globe className="h-4 w-4 mr-1" />
                    {product.country || 'N/A'}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm text-gray-400">Região</label>
                  <p className="text-gray-100">{product.region || 'N/A'}</p>
                </div>
                
                {product.vintage && (
                  <div>
                    <label className="text-sm text-gray-400">Safra</label>
                    <p className="text-gray-100">{product.vintage}</p>
                  </div>
                )}
                
                <div>
                  <label className="text-sm text-gray-400">Produtor</label>
                  <p className="text-gray-100">{product.producer || 'N/A'}</p>
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