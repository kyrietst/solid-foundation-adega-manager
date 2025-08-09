/**
 * Ações do formulário de produto
 * Sub-componente especializado para botões de ação
 */

import React from 'react';
import { Button } from '@/shared/ui/primitives/button';
import { Card, CardContent } from '@/shared/ui/primitives/card';
import { cn } from '@/core/config/utils';
import { getGlassCardClasses } from '@/core/config/theme-utils';

interface ProductFormActionsProps {
  isLoading: boolean;
  isEdit: boolean;
  isValid: boolean;
  errors: string[];
  onCancel: () => void;
  variant?: 'default' | 'premium' | 'success' | 'warning' | 'error';
  glassEffect?: boolean;
}

export const ProductFormActions: React.FC<ProductFormActionsProps> = ({
  isLoading,
  isEdit,
  isValid,
  errors,
  onCancel,
  variant = 'default',
  glassEffect = true,
}) => {
  return (
    <>
      {/* Erros de Validação */}
      {!isValid && errors.length > 0 && (
        <Card className="border-accent-red glass-subtle">
          <CardContent className="pt-6">
            <div className="text-accent-red text-sm">
              <strong>Corrija os seguintes erros:</strong>
              <ul className="list-disc list-inside mt-2">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Botões de Ação */}
      <div className="flex justify-end gap-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          className="border-primary-yellow/30 text-gray-200 hover:bg-primary-yellow/10 hover:border-primary-yellow"
        >
          Cancelar
        </Button>
        <Button 
          type="submit" 
          disabled={isLoading || !isValid}
          className="min-w-[120px] bg-primary-yellow text-black hover:bg-primary-yellow/90 font-semibold"
        >
          {isLoading ? 'Salvando...' : (isEdit ? 'Atualizar' : 'Criar')} Produto
        </Button>
      </div>
    </>
  );
};