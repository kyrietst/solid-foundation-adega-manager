/**
 * Card de controle de estoque do produto
 * Sub-componente especializado para dados de estoque
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { Input } from '@/shared/ui/primitives/input';
import { Label } from '@/shared/ui/primitives/label';
import { TrendingUp } from 'lucide-react';
import { ProductFormData } from '@/types/inventory.types';
import { cn } from '@/core/config/utils';
import { getGlassCardClasses } from '@/core/config/theme-utils';

interface ProductStockCardProps {
  formData: Partial<ProductFormData>;
  fieldErrors: Record<string, string>;
  onInputChange: (field: keyof ProductFormData, value: string | number) => void;
  variant?: 'default' | 'premium' | 'success' | 'warning' | 'error';
  glassEffect?: boolean;
}

export const ProductStockCard: React.FC<ProductStockCardProps> = ({
  formData,
  fieldErrors,
  onInputChange,
  variant = 'default',
  glassEffect = true,
}) => {
  const glassClasses = glassEffect ? getGlassCardClasses(variant) : '';

  return (
    <Card className={cn(glassClasses, 'shadow-xl')}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-100">
          <TrendingUp className="h-5 w-5 text-primary-yellow" />
          Controle de Estoque
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Estoque Atual */}
          <div>
            <Label htmlFor="stock_quantity" className="text-gray-200">Estoque Atual *</Label>
            <Input
              id="stock_quantity"
              type="number"
              value={formData.stock_quantity || ''}
              onChange={(e) => onInputChange('stock_quantity', Number(e.target.value))}
              min="0"
              required
              className={cn(
                'bg-gray-800/50 border-primary-yellow/30 text-gray-200 focus:border-primary-yellow',
                fieldErrors.stock_quantity && 'border-accent-red'
              )}
            />
            {fieldErrors.stock_quantity && (
              <p className="text-accent-red text-sm mt-1">{fieldErrors.stock_quantity}</p>
            )}
          </div>

          {/* Estoque Mínimo */}
          <div>
            <Label htmlFor="minimum_stock" className="text-gray-200">Estoque Mínimo *</Label>
            <Input
              id="minimum_stock"
              type="number"
              value={formData.minimum_stock || ''}
              onChange={(e) => onInputChange('minimum_stock', Number(e.target.value))}
              min="0"
              required
              className={cn(
                'bg-gray-800/50 border-primary-yellow/30 text-gray-200 focus:border-primary-yellow',
                fieldErrors.minimum_stock && 'border-accent-red'
              )}
            />
            {fieldErrors.minimum_stock && (
              <p className="text-accent-red text-sm mt-1">{fieldErrors.minimum_stock}</p>
            )}
          </div>

          {/* Fornecedor */}
          <div>
            <Label htmlFor="supplier" className="text-gray-200">Fornecedor</Label>
            <Input
              id="supplier"
              value={formData.supplier || ''}
              onChange={(e) => onInputChange('supplier', e.target.value)}
              placeholder="Nome do fornecedor"
              className="bg-gray-800/50 border-primary-yellow/30 text-gray-200 focus:border-primary-yellow placeholder:text-gray-400"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};