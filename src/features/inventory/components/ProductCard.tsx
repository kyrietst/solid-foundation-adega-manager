/**
 * Card individual do produto
 * Sub-componente especializado para exibição de produto individual
 * REFATORADO: Utiliza exclusivamente dados da tabela 'products' (SSoT)
 */

import React from 'react';
import { Button } from '@/shared/ui/primitives/button';
import { Badge } from '@/shared/ui/primitives/badge';
import { Plus, Package, Wine, AlertTriangle } from 'lucide-react';
import type { Product } from '@/types/inventory.types';
import { formatCurrency, cn } from '@/core/config/utils';
import { getGlassCardClasses, getHoverTransformClasses } from '@/core/config/theme-utils';
import { text, shadows } from "@/core/config/theme";
import { ProductImage } from '@/shared/ui/composite/optimized-image';
import { calculatePackageDisplay } from '@/shared/utils/stockCalculations';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onOpenSelection?: (product: Product) => void; // Nova prop para abrir modal de seleção
  variant?: 'default' | 'premium' | 'success' | 'warning' | 'error';
  glassEffect?: boolean;
}

export const ProductCard = React.memo<ProductCardProps>(({
  product,
  onAddToCart,
  onOpenSelection,
  variant = 'default',
  glassEffect = true,
}) => {
  const glassClasses = glassEffect ? getGlassCardClasses(variant) : '';

  // NOVO: Calcular estados usando exclusivamente dados da tabela 'products' (SSoT)
  const stockQuantity = product.stock_quantity || 0;
  const packageUnits = product.package_units || 0;
  const hasPackageTracking = product.has_package_tracking;

  // Usar função centralizada para cálculos de estoque
  const stockDisplay = calculatePackageDisplay(stockQuantity, packageUnits);

  // Determinar capacidades de venda baseadas nos dados do produto
  const canSellUnits = stockQuantity > 0;
  const canSellPackages = hasPackageTracking && stockDisplay.packages > 0;

  const isOutOfStock = stockQuantity === 0;

  // Determinar se tem múltiplas opções (unidades E pacotes disponíveis)
  const hasMultipleOptions = canSellUnits && canSellPackages;




  // Decidir como adicionar ao carrinho
  const handleAddClick = () => {
    // Se tem múltiplas opções de venda, abrir modal de seleção
    if (hasMultipleOptions && onOpenSelection) {
      onOpenSelection(product);
    } else {
      // Senão, adicionar direto como unidade (compatibilidade)
      onAddToCart(product);
    }
  };

  return (
    <div 
      className={cn(
        "group hero-spotlight rounded-2xl border border-white/20 bg-black/70 backdrop-blur-md text-card-foreground shadow-[0_8px_24px_rgba(0,0,0,0.6)] overflow-hidden transition-all duration-200",
        getHoverTransformClasses('lift'),
        "hover:shadow-2xl hover:shadow-purple-500/20 hover:border-purple-400/60",
        glassClasses
      )}
      onMouseMove={(e) => {
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        (e.currentTarget as HTMLElement).style.setProperty("--x", `${x}%`);
        (e.currentTarget as HTMLElement).style.setProperty("--y", `${y}%`);
      }}
    >
      {/* Imagem do produto */}
      <div className="aspect-square bg-gradient-to-br from-gray-800/50 to-gray-900/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
        <ProductImage
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          containerClassName="w-full h-full"
        />
        
        {/* Badges de estoque SSoT */}
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          {isOutOfStock ? (
            <Badge variant="destructive" className="bg-red-500/30 text-red-200 border-red-400/50 backdrop-blur-md shadow-lg">
              ⚠️ Esgotado
            </Badge>
          ) : (
            <>
              {/* Badge de estoque principal */}
              <Badge
                variant="outline"
                className={cn(
                  'backdrop-blur-md shadow-lg transition-all duration-300 group-hover:scale-105 text-xs',
                  stockQuantity <= 5
                    ? 'bg-orange-500/20 text-orange-200 border-orange-400/30'
                    : 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30'
                )}
              >
                {stockQuantity <= 5 ? `⚡ ${stockQuantity} total` : `✓ ${stockQuantity} total`}
              </Badge>

              {/* Badges de breakdown (quando há pacotes) */}
              {hasPackageTracking && stockDisplay.packages > 0 && (
                <div className="flex flex-col gap-1">
                  <Badge
                    variant="secondary"
                    className="bg-blue-500/20 text-blue-300 border-blue-500/30 backdrop-blur-md text-xs"
                  >
                    <Package className="h-2 w-2 mr-1" />
                    {stockDisplay.formatted}
                  </Badge>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Informações do produto - Seguindo padrão CardHeader/CardContent */}
      <div className="p-5 space-y-3">
        <div className="space-y-2">
          <h3 
            className="font-bold line-clamp-2 h-12 text-lg leading-tight text-gray-300"
            style={{ color: '#FF2400' }}
          >
            {product.name}
          </h3>
          
          {/* Preço com dados SSoT */}
          <div className="flex items-center justify-between">
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-primary-yellow">
                  {formatCurrency(product.price)}
                </span>

                {/* Badges de tipos de venda disponíveis */}
                <div className="flex gap-1">
                  {canSellUnits && (
                    <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30">
                      <Wine className="h-3 w-3 mr-1" />
                      Unidades
                    </Badge>
                  )}
                  {canSellPackages && (
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30">
                      <Package className="h-3 w-3 mr-1" />
                      Fardos
                    </Badge>
                  )}
                </div>
              </div>

              {/* Mostrar preço do pacote se disponível */}
              {canSellPackages && product.package_price && (
                <div className="text-sm text-gray-400 flex items-center gap-2">
                  <span>Fardo: {formatCurrency(product.package_price)}</span>
                  <span className="text-xs">({packageUnits} un cada)</span>
                </div>
              )}

              {product.category && (
                <span className="text-xs text-gray-400">
                  {product.category}
                </span>
              )}
            </div>
          </div>
        </div>
        
        {/* Botão com cores padronizadas do sistema */}
        <Button 
          size="sm" 
          onClick={handleAddClick}
          disabled={isOutOfStock}
          className={cn(
            'w-full h-10 font-semibold transition-all duration-200',
            getHoverTransformClasses('scale'),
            isOutOfStock 
              ? 'bg-gray-600/30 text-gray-400 border border-gray-500/40 cursor-not-allowed backdrop-blur-sm'
              : hasMultipleOptions
              ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-400 hover:to-emerald-400 border border-green-500/50 shadow-lg hover:shadow-green-400/30'
              : 'bg-gradient-to-r from-primary-yellow to-yellow-500 text-black hover:from-yellow-300 hover:to-yellow-400 border border-primary-yellow/50 shadow-lg hover:shadow-yellow-400/30'
          )}
          aria-label={
            isOutOfStock 
              ? `Produto ${product.name} indisponível` 
              : hasMultipleOptions 
              ? `Selecionar tipo de venda para ${product.name}`
              : `Adicionar ${product.name} ao carrinho`
          }
        >
          {isOutOfStock ? (
            <>
              <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
              ❌ Indisponível
            </>
          ) : hasMultipleOptions ? (
            <>
              <Package className="h-4 w-4 mr-2" aria-hidden="true" />
              📦 Selecionar
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
              🛒 Adicionar
            </>
          )}
        </Button>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison para otimizar re-renders
  return prevProps.product.id === nextProps.product.id &&
         prevProps.product.stock_quantity === nextProps.product.stock_quantity &&
         prevProps.product.price === nextProps.product.price &&
         prevProps.product.name === nextProps.product.name;
});