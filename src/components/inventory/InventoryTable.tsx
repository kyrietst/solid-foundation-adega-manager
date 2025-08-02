/**
 * Componente de visualização em tabela dos produtos
 * Extraído do InventoryNew.tsx para separar responsabilidades
 */

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ProductRow } from './ProductRow';
import { EmptyProducts } from '@/components/ui/empty-state';
import { LoadingScreen } from '@/components/ui/loading-spinner';
import { InventoryTableProps } from './types';

export const InventoryTable: React.FC<InventoryTableProps> = ({
  products,
  onEditProduct,
  onDeleteProduct,
  canDeleteProduct,
  isLoading = false,
}) => {
  if (isLoading) {
    return <LoadingScreen text="Carregando produtos..." />;
  }

  if (products.length === 0) {
    return <EmptyProducts />;
  }

  return (
    <Card className="bg-adega-charcoal/20 border-white/10">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 bg-adega-charcoal/30">
                <th className="text-left p-4 font-medium text-adega-platinum">
                  Produto
                </th>
                <th className="text-left p-4 font-medium text-adega-platinum">
                  Preço
                </th>
                <th className="text-left p-4 font-medium text-adega-platinum">
                  Estoque
                </th>
                <th className="text-left p-4 font-medium text-adega-platinum">
                  Mínimo
                </th>
                <th className="text-left p-4 font-medium text-adega-platinum">
                  Giro
                </th>
                <th className="text-left p-4 font-medium text-adega-platinum">
                  Fornecedor
                </th>
                <th className="text-left p-4 font-medium text-adega-platinum">
                  Código
                </th>
                <th className="text-left p-4 font-medium text-adega-platinum">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <ProductRow
                  key={product.id}
                  product={product}
                  onEdit={onEditProduct}
                  onDelete={onDeleteProduct}
                  canDelete={canDeleteProduct}
                />
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};