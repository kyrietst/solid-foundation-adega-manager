/**
 * Card de informações adicionais do produto
 * Sub-componente especializado para dados extras
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { Input } from '@/shared/ui/primitives/input';
import { Label } from '@/shared/ui/primitives/label';
import { ProductFormData } from '@/types/inventory.types';
import { cn } from '@/core/config/utils';
import { getGlassCardClasses } from '@/core/config/theme-utils';

interface ProductAdditionalInfoCardProps {
  formData: Partial<ProductFormData>;
  fieldErrors: Record<string, string>;
  onInputChange: (field: keyof ProductFormData, value: string | number) => void;
  variant?: 'default' | 'premium' | 'success' | 'warning' | 'error';
  glassEffect?: boolean;
}

export const ProductAdditionalInfoCard: React.FC<ProductAdditionalInfoCardProps> = ({
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
        <CardTitle className="text-gray-100">Informações Adicionais</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Produtor */}
          <div>
            <Label htmlFor="producer" className="text-gray-200">Produtor</Label>
            <Input
              id="producer"
              value={formData.producer || ''}
              onChange={(e) => onInputChange('producer', e.target.value)}
              placeholder="Nome do produtor"
              className="bg-gray-800/50 border-primary-yellow/30 text-gray-200 focus:border-primary-yellow placeholder:text-gray-400"
            />
          </div>

          {/* País */}
          <div>
            <Label htmlFor="country" className="text-gray-200">País</Label>
            <Input
              id="country"
              value={formData.country || ''}
              onChange={(e) => onInputChange('country', e.target.value)}
              placeholder="Brasil"
              className="bg-gray-800/50 border-primary-yellow/30 text-gray-200 focus:border-primary-yellow placeholder:text-gray-400"
            />
          </div>

          {/* Região */}
          <div>
            <Label htmlFor="region" className="text-gray-200">Região</Label>
            <Input
              id="region"
              value={formData.region || ''}
              onChange={(e) => onInputChange('region', e.target.value)}
              placeholder="Vale dos Vinhedos"
              className="bg-gray-800/50 border-primary-yellow/30 text-gray-200 focus:border-primary-yellow placeholder:text-gray-400"
            />
          </div>

          {/* Safra */}
          <div>
            <Label htmlFor="vintage" className="text-gray-200">Safra</Label>
            <Input
              id="vintage"
              type="number"
              value={formData.vintage || ''}
              onChange={(e) => onInputChange('vintage', Number(e.target.value))}
              placeholder="2023"
              min="1900"
              max={new Date().getFullYear()}
              className={cn(
                'bg-gray-800/50 border-primary-yellow/30 text-gray-200 focus:border-primary-yellow placeholder:text-gray-400',
                fieldErrors.vintage && 'border-accent-red'
              )}
            />
            {fieldErrors.vintage && (
              <p className="text-accent-red text-sm mt-1">{fieldErrors.vintage}</p>
            )}
          </div>

          {/* Teor Alcoólico */}
          <div>
            <Label htmlFor="alcohol_content" className="text-gray-200">Teor Alcoólico (%)</Label>
            <Input
              id="alcohol_content"
              type="number"
              step="0.1"
              value={formData.alcohol_content || ''}
              onChange={(e) => onInputChange('alcohol_content', Number(e.target.value))}
              placeholder="13.5"
              min="0"
              max="100"
              className={cn(
                'bg-gray-800/50 border-primary-yellow/30 text-gray-200 focus:border-primary-yellow placeholder:text-gray-400',
                fieldErrors.alcohol_content && 'border-accent-red'
              )}
            />
            {fieldErrors.alcohol_content && (
              <p className="text-accent-red text-sm mt-1">{fieldErrors.alcohol_content}</p>
            )}
          </div>

          {/* URL da Imagem */}
          <div>
            <Label htmlFor="image_url" className="text-gray-200">URL da Imagem</Label>
            <Input
              id="image_url"
              value={formData.image_url || ''}
              onChange={(e) => onInputChange('image_url', e.target.value)}
              placeholder="https://exemplo.com/imagem.jpg"
              className={cn(
                'bg-gray-800/50 border-primary-yellow/30 text-gray-200 focus:border-primary-yellow placeholder:text-gray-400',
                fieldErrors.image_url && 'border-accent-red'
              )}
            />
            {fieldErrors.image_url && (
              <p className="text-accent-red text-sm mt-1">{fieldErrors.image_url}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};