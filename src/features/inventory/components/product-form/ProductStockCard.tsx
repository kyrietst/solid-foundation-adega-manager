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

interface ProductStockCardProps {
  formData: Partial<ProductFormData>;
  fieldErrors: Record<string, string>;
  onInputChange: (field: keyof ProductFormData, value: string | number) => void;
}

export const ProductStockCard: React.FC<ProductStockCardProps> = ({
  formData,
  fieldErrors,
  onInputChange,
}) => {
  return (
    <Card className="bg-adega-charcoal/20 border-white/10 backdrop-blur-xl shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <TrendingUp className="h-5 w-5" />
          Controle de Estoque
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Estoque Atual */}
          <div>
            <Label htmlFor="stock_quantity" className="text-adega-platinum">Estoque Atual *</Label>
            <Input
              id="stock_quantity"
              type="number"
              value={formData.stock_quantity || ''}
              onChange={(e) => onInputChange('stock_quantity', Number(e.target.value))}
              min="0"
              required
              className={fieldErrors.stock_quantity ? 'border-red-500' : ''}
            />
            {fieldErrors.stock_quantity && (
              <p className="text-red-500 text-sm mt-1">{fieldErrors.stock_quantity}</p>
            )}
          </div>

          {/* Estoque Mínimo */}
          <div>
            <Label htmlFor="minimum_stock" className="text-adega-platinum">Estoque Mínimo *</Label>
            <Input
              id="minimum_stock"
              type="number"
              value={formData.minimum_stock || ''}
              onChange={(e) => onInputChange('minimum_stock', Number(e.target.value))}
              min="0"
              required
              className={fieldErrors.minimum_stock ? 'border-red-500' : ''}
            />
            {fieldErrors.minimum_stock && (
              <p className="text-red-500 text-sm mt-1">{fieldErrors.minimum_stock}</p>
            )}
          </div>

          {/* Fornecedor */}
          <div>
            <Label htmlFor="supplier" className="text-adega-platinum">Fornecedor</Label>
            <Input
              id="supplier"
              value={formData.supplier || ''}
              onChange={(e) => onInputChange('supplier', e.target.value)}
              placeholder="Nome do fornecedor"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};