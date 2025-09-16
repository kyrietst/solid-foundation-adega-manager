/**
 * ProductEntityCard - Specialized EntityCard for Products
 * Uses Context7 patterns for type-safe product-specific functionality
 * Maintains compatibility with existing ProductCard usage patterns
 */

import React, { useMemo } from 'react';
import { Package, Wine, AlertTriangle, Plus } from 'lucide-react';
import { EntityCard, EntityCardProps, BaseEntityProps } from '../EntityCard';
import { formatCurrency } from '@/core/config/utils';
import { Badge } from '@/shared/ui/primitives/badge';
import type { Product } from '@/types/inventory.types';

// Context7 Pattern: Extend base entity for type safety
interface ProductEntity extends BaseEntityProps {
  price: number;
  stock_quantity: number;
  category?: string;
  image_url?: string;
  is_active?: boolean;
}

interface ProductEntityCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onOpenSelection?: (product: Product) => void;
  variant?: EntityCardProps<ProductEntity>['variant'];
  size?: EntityCardProps<ProductEntity>['size'];
  glassEffect?: boolean;
  className?: string;
}

export const ProductEntityCard: React.FC<ProductEntityCardProps> = ({
  product,
  onAddToCart,
  onOpenSelection,
  variant = 'default',
  size = 'md',
  glassEffect = true,
  className,
}) => {
  // Context7 Pattern: Memoize computed values for performance
  const productEntity = useMemo<ProductEntity>(() => ({
    id: product.id,
    name: product.name,
    price: product.price,
    stock_quantity: product.stock_quantity || 0,
    category: product.category,
    image_url: product.image_url,
    is_active: product.is_active,
    className,
  }), [product, className]);

  const isOutOfStock = useMemo(() =>
    productEntity.stock_quantity === 0,
    [productEntity.stock_quantity]
  );

  const hasMultipleOptions = useMemo(() =>
    !!onOpenSelection && productEntity.stock_quantity > 0,
    [onOpenSelection, productEntity.stock_quantity]
  );

  // Context7 Pattern: Memoize badge configuration
  const badges = useMemo(() => [
    {
      label: isOutOfStock
        ? '⚠️ Esgotado'
        : productEntity.stock_quantity <= 5
        ? `⚡ ${productEntity.stock_quantity} restam`
        : `✓ ${productEntity.stock_quantity} un`,
      variant: isOutOfStock
        ? 'destructive' as const
        : productEntity.stock_quantity <= 5
        ? 'outline' as const
        : 'outline' as const,
      className: isOutOfStock
        ? 'bg-red-500/30 text-red-200 border-red-400/50'
        : productEntity.stock_quantity <= 5
        ? 'bg-orange-500/30 text-orange-200 border-orange-400/50'
        : 'bg-emerald-500/30 text-emerald-200 border-emerald-400/50',
    }
  ], [isOutOfStock, productEntity.stock_quantity]);

  // Context7 Pattern: Memoize field configuration
  const fields = useMemo(() => [
    {
      label: 'Preço',
      value: (
        <span className="font-bold text-primary-yellow text-lg">
          {formatCurrency(productEntity.price)}
        </span>
      ),
      className: 'font-semibold',
    },
    ...(productEntity.category ? [{
      label: 'Categoria',
      value: productEntity.category,
      className: 'text-gray-300',
    }] : []),
  ], [productEntity.price, productEntity.category]);

  // Context7 Pattern: Memoize primary action configuration
  const primaryAction = useMemo(() => ({
    icon: isOutOfStock ? AlertTriangle : hasMultipleOptions ? Package : Plus,
    label: isOutOfStock
      ? '❌ Indisponível'
      : hasMultipleOptions
      ? '📦 Selecionar'
      : '🛒 Adicionar',
    onClick: () => {
      if (!isOutOfStock) {
        if (hasMultipleOptions && onOpenSelection) {
          onOpenSelection(product);
        } else {
          onAddToCart(product);
        }
      }
    },
    disabled: isOutOfStock,
    variant: isOutOfStock
      ? 'outline' as const
      : hasMultipleOptions
      ? 'default' as const
      : 'default' as const,
    className: isOutOfStock
      ? 'bg-gray-600/30 text-gray-400 border border-gray-500/40 cursor-not-allowed backdrop-blur-sm'
      : hasMultipleOptions
      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-400 hover:to-emerald-400 border border-green-500/50 shadow-lg hover:shadow-green-400/30'
      : 'bg-gradient-to-r from-primary-yellow to-yellow-500 text-black hover:from-yellow-300 hover:to-yellow-400 border border-primary-yellow/50 shadow-lg hover:shadow-yellow-400/30',
  }), [isOutOfStock, hasMultipleOptions, onOpenSelection, onAddToCart, product]);

  // Context7 Pattern: Custom memo comparison for product-specific optimization
  const customMemoComparison = useMemo(() => (
    (prevProps: EntityCardProps<ProductEntity>, nextProps: EntityCardProps<ProductEntity>) => {
      return prevProps.entity.id === nextProps.entity.id &&
             prevProps.entity.stock_quantity === nextProps.entity.stock_quantity &&
             prevProps.entity.price === nextProps.entity.price &&
             prevProps.entity.name === nextProps.entity.name;
    }
  ), []);

  return (
    <EntityCard
      entity={productEntity}
      variant={variant}
      size={size}
      glassEffect={glassEffect}
      imageUrl={productEntity.image_url}
      imageAlt={productEntity.name}
      subtitle={
        <div className="flex items-center gap-2">
          {productEntity.stock_quantity > 0 && (
            <div className="flex gap-1">
              <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30 text-xs">
                <Wine className="h-3 w-3 mr-1" />
                Disponível
              </Badge>
            </div>
          )}
        </div>
      }
      badges={badges}
      fields={fields}
      primaryAction={primaryAction}
      headerIcon={Package}
      customMemoComparison={customMemoComparison}
    />
  );
};

export default ProductEntityCard;