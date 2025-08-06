/**
 * Ações do formulário de produto
 * Sub-componente especializado para botões de ação
 */

import React from 'react';
import { Button } from '@/shared/ui/primitives/button';
import { Card, CardContent } from '@/shared/ui/primitives/card';

interface ProductFormActionsProps {
  isLoading: boolean;
  isEdit: boolean;
  isValid: boolean;
  errors: string[];
  onCancel: () => void;
}

export const ProductFormActions: React.FC<ProductFormActionsProps> = ({
  isLoading,
  isEdit,
  isValid,
  errors,
  onCancel,
}) => {
  return (
    <>
      {/* Erros de Validação */}
      {!isValid && errors.length > 0 && (
        <Card className="border-red-500 bg-red-900/20">
          <CardContent className="pt-6">
            <div className="text-red-400 text-sm">
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
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button 
          type="submit" 
          disabled={isLoading || !isValid}
          className="min-w-[120px]"
        >
          {isLoading ? 'Salvando...' : (isEdit ? 'Atualizar' : 'Criar')} Produto
        </Button>
      </div>
    </>
  );
};