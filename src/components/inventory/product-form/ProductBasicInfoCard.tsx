/**
 * Card de informações básicas do produto
 * Sub-componente especializado para dados básicos
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Package } from 'lucide-react';
import { BarcodeInput } from '@/components/inventory/BarcodeInput';
import { ProductFormData, UnitType } from '@/types/inventory.types';

interface ProductBasicInfoCardProps {
  formData: Partial<ProductFormData>;
  categories: string[];
  fieldErrors: Record<string, string>;
  onInputChange: (field: keyof ProductFormData, value: string | number | UnitType) => void;
  onBarcodeScanned: (barcode: string) => void;
}

export const ProductBasicInfoCard: React.FC<ProductBasicInfoCardProps> = ({
  formData,
  categories,
  fieldErrors,
  onInputChange,
  onBarcodeScanned,
}) => {
  return (
    <Card className="bg-adega-charcoal/20 border-white/10 backdrop-blur-xl shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Package className="h-5 w-5" />
          Informações Básicas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Nome do Produto */}
          <div>
            <Label htmlFor="name" className="text-adega-platinum">Nome do Produto *</Label>
            <Input
              id="name"
              value={formData.name || ''}
              onChange={(e) => onInputChange('name', e.target.value)}
              placeholder="Ex: Vinho Tinto Cabernet Sauvignon"
              required
              className={fieldErrors.name ? 'border-red-500' : ''}
            />
            {fieldErrors.name && (
              <p className="text-red-500 text-sm mt-1">{fieldErrors.name}</p>
            )}
          </div>

          {/* Categoria */}
          <div>
            <Label htmlFor="category" className="text-adega-platinum">Categoria *</Label>
            <Select 
              value={formData.category || ''} 
              onValueChange={(value) => onInputChange('category', value)}
            >
              <SelectTrigger className={fieldErrors.category ? 'border-red-500' : ''}>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldErrors.category && (
              <p className="text-red-500 text-sm mt-1">{fieldErrors.category}</p>
            )}
          </div>

          {/* Volume */}
          <div>
            <Label htmlFor="volume_ml" className="text-adega-platinum">Volume (ml)</Label>
            <Input
              id="volume_ml"
              type="number"
              value={formData.volume_ml || ''}
              onChange={(e) => onInputChange('volume_ml', Number(e.target.value))}
              placeholder="750"
              className={fieldErrors.volume_ml ? 'border-red-500' : ''}
            />
            {fieldErrors.volume_ml && (
              <p className="text-red-500 text-sm mt-1">{fieldErrors.volume_ml}</p>
            )}
          </div>

          {/* Código de Barras */}
          <div>
            <Label className="text-adega-platinum">Código de Barras</Label>
            <BarcodeInput
              onScan={onBarcodeScanned}
              placeholder="Escaneie ou digite o código de barras"
              autoFocus={false}
            />
            {formData.barcode && (
              <Input
                value={formData.barcode}
                onChange={(e) => onInputChange('barcode', e.target.value.replace(/\D/g, ''))}
                placeholder="Código de barras"
                maxLength={14}
                className={`mt-2 font-mono ${fieldErrors.barcode ? 'border-red-500' : ''}`}
              />
            )}
            {fieldErrors.barcode && (
              <p className="text-red-500 text-sm mt-1">{fieldErrors.barcode}</p>
            )}
          </div>

          {/* Tipo de Unidade */}
          <div>
            <Label htmlFor="unit_type" className="text-adega-platinum">Venda em</Label>
            <Select 
              value={formData.unit_type || 'un'} 
              onValueChange={(value: UnitType) => onInputChange('unit_type', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="un">Unidade</SelectItem>
                <SelectItem value="pct">Pacote</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Descrição */}
        <div>
          <Label htmlFor="description" className="text-adega-platinum">Descrição</Label>
          <Textarea
            id="description"
            value={formData.description || ''}
            onChange={(e) => onInputChange('description', e.target.value)}
            placeholder="Descrição detalhada do produto..."
            rows={3}
          />
        </div>
      </CardContent>
    </Card>
  );
};