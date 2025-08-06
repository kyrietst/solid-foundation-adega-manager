/**
 * Card de informações adicionais do produto
 * Sub-componente especializado para dados extras
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { Input } from '@/shared/ui/primitives/input';
import { Label } from '@/shared/ui/primitives/label';
import { ProductFormData } from '@/types/inventory.types';

interface ProductAdditionalInfoCardProps {
  formData: Partial<ProductFormData>;
  fieldErrors: Record<string, string>;
  onInputChange: (field: keyof ProductFormData, value: string | number) => void;
}

export const ProductAdditionalInfoCard: React.FC<ProductAdditionalInfoCardProps> = ({
  formData,
  fieldErrors,
  onInputChange,
}) => {
  return (
    <Card className="bg-adega-charcoal/20 border-white/10 backdrop-blur-xl shadow-xl">
      <CardHeader>
        <CardTitle className="text-white">Informações Adicionais</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Produtor */}
          <div>
            <Label htmlFor="producer" className="text-adega-platinum">Produtor</Label>
            <Input
              id="producer"
              value={formData.producer || ''}
              onChange={(e) => onInputChange('producer', e.target.value)}
              placeholder="Nome do produtor"
            />
          </div>

          {/* País */}
          <div>
            <Label htmlFor="country" className="text-adega-platinum">País</Label>
            <Input
              id="country"
              value={formData.country || ''}
              onChange={(e) => onInputChange('country', e.target.value)}
              placeholder="Brasil"
            />
          </div>

          {/* Região */}
          <div>
            <Label htmlFor="region" className="text-adega-platinum">Região</Label>
            <Input
              id="region"
              value={formData.region || ''}
              onChange={(e) => onInputChange('region', e.target.value)}
              placeholder="Vale dos Vinhedos"
            />
          </div>

          {/* Safra */}
          <div>
            <Label htmlFor="vintage" className="text-adega-platinum">Safra</Label>
            <Input
              id="vintage"
              type="number"
              value={formData.vintage || ''}
              onChange={(e) => onInputChange('vintage', Number(e.target.value))}
              placeholder="2023"
              min="1900"
              max={new Date().getFullYear()}
              className={fieldErrors.vintage ? 'border-red-500' : ''}
            />
            {fieldErrors.vintage && (
              <p className="text-red-500 text-sm mt-1">{fieldErrors.vintage}</p>
            )}
          </div>

          {/* Teor Alcoólico */}
          <div>
            <Label htmlFor="alcohol_content" className="text-adega-platinum">Teor Alcoólico (%)</Label>
            <Input
              id="alcohol_content"
              type="number"
              step="0.1"
              value={formData.alcohol_content || ''}
              onChange={(e) => onInputChange('alcohol_content', Number(e.target.value))}
              placeholder="13.5"
              min="0"
              max="100"
              className={fieldErrors.alcohol_content ? 'border-red-500' : ''}
            />
            {fieldErrors.alcohol_content && (
              <p className="text-red-500 text-sm mt-1">{fieldErrors.alcohol_content}</p>
            )}
          </div>

          {/* URL da Imagem */}
          <div>
            <Label htmlFor="image_url" className="text-adega-platinum">URL da Imagem</Label>
            <Input
              id="image_url"
              value={formData.image_url || ''}
              onChange={(e) => onInputChange('image_url', e.target.value)}
              placeholder="https://exemplo.com/imagem.jpg"
              className={fieldErrors.image_url ? 'border-red-500' : ''}
            />
            {fieldErrors.image_url && (
              <p className="text-red-500 text-sm mt-1">{fieldErrors.image_url}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};