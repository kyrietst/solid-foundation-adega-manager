/**
 * Card de informações básicas do produto
 * Sub-componente especializado para dados básicos
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { Input } from '@/shared/ui/primitives/input';
import { Label } from '@/shared/ui/primitives/label';
import { Textarea } from '@/shared/ui/primitives/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/primitives/select';
import { Package } from 'lucide-react';
import { BarcodeInput } from '@/features/inventory/components/BarcodeInput';
import { ProductFormData, UnitType } from '@/core/types/inventory.types';
import { DynamicMeasurementField } from './DynamicMeasurementField';
import { cn } from '@/core/config/utils';
import { getGlassCardClasses } from '@/core/config/theme-utils';

interface ProductBasicInfoCardProps {
  formData: Partial<ProductFormData>;
  categories: string[];
  fieldErrors: Record<string, string>;
  onInputChange: (field: keyof ProductFormData, value: string | number | UnitType) => void;
  onBarcodeScanned: (barcode: string) => void;
  variant?: 'default' | 'premium' | 'success' | 'warning' | 'error';
  glassEffect?: boolean;
}

export const ProductBasicInfoCard: React.FC<ProductBasicInfoCardProps> = ({
  formData,
  categories,
  fieldErrors,
  onInputChange,
  onBarcodeScanned,
  variant = 'default',
  glassEffect = true,
}) => {
  const glassClasses = glassEffect ? getGlassCardClasses(variant) : '';

  return (
    <Card className={cn(glassClasses, 'shadow-xl')}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-100">
          <Package className="h-5 w-5 text-primary-yellow" />
          Informações Básicas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Nome do Produto */}
          <div>
            <Label htmlFor="name" className="text-gray-200">Nome do Produto *</Label>
            <Input
              id="name"
              value={formData.name || ''}
              onChange={(e) => onInputChange('name', e.target.value)}
              placeholder="Ex: Vinho Tinto Cabernet Sauvignon"
              required
              className={cn(
                'bg-gray-800/50 border-primary-yellow/30 text-gray-200 focus:border-primary-yellow placeholder:text-gray-400',
                fieldErrors.name && 'border-accent-red'
              )}
            />
            {fieldErrors.name && (
              <p className="text-accent-red text-sm mt-1">{fieldErrors.name}</p>
            )}
          </div>

          {/* Categoria */}
          <div>
            <Label htmlFor="category" className="text-gray-200">Categoria *</Label>
            <Select 
              value={formData.category || ''} 
              onValueChange={(value) => onInputChange('category', value)}
            >
              <SelectTrigger className={cn(
                'bg-gray-800/50 border-primary-yellow/30 text-gray-200',
                fieldErrors.category && 'border-accent-red'
              )}>
                <SelectValue placeholder="Selecione uma categoria" className="text-gray-400" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-primary-yellow/30">
                {categories.map(category => (
                  <SelectItem key={category} value={category} className="text-gray-200 hover:bg-primary-yellow/10">
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldErrors.category && (
              <p className="text-accent-red text-sm mt-1">{fieldErrors.category}</p>
            )}
          </div>

          {/* Campo Dinâmico Volume/Unidade baseado na categoria */}
          <DynamicMeasurementField
            formData={formData}
            fieldErrors={fieldErrors}
            onInputChange={onInputChange}
            variant={variant}
            glassEffect={glassEffect}
          />

          {/* Código de Barras */}
          <div>
            <Label className="text-gray-200">Código de Barras</Label>
            <BarcodeInput
              onScan={onBarcodeScanned}
              placeholder="Escaneie ou digite o código de barras"
              autoFocus={false}
              variant={variant}
              glassEffect={glassEffect}
            />
            {formData.barcode && (
              <Input
                value={formData.barcode}
                onChange={(e) => onInputChange('barcode', e.target.value.replace(/\D/g, ''))}
                placeholder="Código de barras"
                maxLength={14}
                className={cn(
                  'mt-2 font-mono bg-gray-800/50 border-primary-yellow/30 text-gray-200 focus:border-primary-yellow placeholder:text-gray-400',
                  fieldErrors.barcode && 'border-accent-red'
                )}
              />
            )}
            {fieldErrors.barcode && (
              <p className="text-accent-red text-sm mt-1">{fieldErrors.barcode}</p>
            )}
          </div>

          {/* Tipo de Unidade */}
          <div>
            <Label htmlFor="unit_type" className="text-gray-200">Venda em</Label>
            <Select 
              value={formData.unit_type || 'un'} 
              onValueChange={(value: UnitType) => onInputChange('unit_type', value)}
            >
              <SelectTrigger className="bg-gray-800/50 border-primary-yellow/30 text-gray-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-primary-yellow/30">
                <SelectItem value="un" className="text-gray-200 hover:bg-primary-yellow/10">Unidade</SelectItem>
                <SelectItem value="pct" className="text-gray-200 hover:bg-primary-yellow/10">Pacote</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Descrição */}
        <div>
          <Label htmlFor="description" className="text-gray-200">Descrição</Label>
          <Textarea
            id="description"
            value={formData.description || ''}
            onChange={(e) => onInputChange('description', e.target.value)}
            placeholder="Descrição detalhada do produto..."
            rows={3}
            className="bg-gray-800/50 border-primary-yellow/30 text-gray-200 focus:border-primary-yellow placeholder:text-gray-400"
          />
        </div>
      </CardContent>
    </Card>
  );
};