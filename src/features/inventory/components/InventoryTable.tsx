/**
 * Componente de visualização em tabela dos produtos
 * Extraído do InventoryNew.tsx para separar responsabilidades
 */

import React from 'react';
import { Card, CardContent } from '@/shared/ui/primitives/card';
import { ProductRow } from './ProductRow';
import { EmptyProducts } from '@/shared/ui/composite/empty-state';
import { LoadingScreen } from '@/shared/ui/composite/loading-spinner';
import { InventoryTableProps } from '../types/types';
import { useVirtualizedProductTable } from '@/hooks/common/useVirtualizedTable';

export const InventoryTable: React.FC<InventoryTableProps> = ({
  products,
  onEditProduct,
  onDeleteProduct,
  canDeleteProduct,
  isLoading = false,
}) => {
  const { parentRef, virtualItems, totalSize } = useVirtualizedProductTable(products);

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
          {/* Header fixo da tabela */}
          <table className="w-full" role="table" aria-label="Lista de produtos do estoque">
            <caption className="sr-only">
              Tabela de produtos com {products.length} {products.length === 1 ? 'produto' : 'produtos'}. 
              Inclui informações sobre preço, estoque e giro. Use as setas para navegar.
            </caption>
            <thead className="sticky top-0 z-10">
              <tr className="border-b border-white/10 bg-adega-charcoal/30 backdrop-blur-sm">
                <th scope="col" className="text-left p-4 font-medium text-adega-platinum" aria-sort="none">
                  Produto
                </th>
                <th scope="col" className="text-left p-4 font-medium text-adega-platinum" aria-sort="none">
                  Preço
                </th>
                <th scope="col" className="text-left p-4 font-medium text-adega-platinum" aria-sort="none">
                  Estoque
                </th>
                <th scope="col" className="text-left p-4 font-medium text-adega-platinum" aria-sort="none">
                  Mínimo
                </th>
                <th scope="col" className="text-left p-4 font-medium text-adega-platinum" aria-sort="none">
                  Giro
                </th>
                <th scope="col" className="text-left p-4 font-medium text-adega-platinum" aria-sort="none">
                  Fornecedor
                </th>
                <th scope="col" className="text-left p-4 font-medium text-adega-platinum" aria-sort="none">
                  Código
                </th>
                <th scope="col" className="text-left p-4 font-medium text-adega-platinum">
                  Ações
                </th>
              </tr>
            </thead>
          </table>
          
          {/* Container virtualizado */}
          <div
            ref={parentRef}
            className="h-[400px] overflow-auto"
            style={{ contain: 'strict' }}
            role="region"
            aria-label="Lista de produtos virtualizados"
            aria-live="polite"
          >
            <div style={{ height: totalSize, position: 'relative' }}>
              <table className="w-full">
                <tbody>
                  {virtualItems.map((virtualItem) => {
                    const product = products[virtualItem.index];
                    return (
                      <tr
                        key={product.id}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: `${virtualItem.size}px`,
                          transform: `translateY(${virtualItem.start}px)`,
                        }}
                      >
                        <td colSpan={8} className="p-0">
                          <ProductRow
                            product={product}
                            onEdit={onEditProduct}
                            onDelete={onDeleteProduct}
                            canDelete={canDeleteProduct}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};