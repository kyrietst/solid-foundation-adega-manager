/**
 * InventoryCountSheet.tsx - Planilha simplificada para contagem de inventário físico
 * ✅ Otimizado para impressão e contagem rápida
 */

import React from 'react';
import { useProducts } from '@/features/inventory/hooks/useProducts';
import { Button } from '@/shared/ui/primitives/button';
import { Loader2, ClipboardList, Printer } from 'lucide-react';
import { cn } from '@/core/config/utils';

export const InventoryCountSheet: React.FC = () => {
  // Buscar todos os produtos ativos
  const { data: products, isLoading } = useProducts();

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-yellow-400 mr-3" />
        <span className="text-gray-300">Carregando produtos...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Cabeçalho - Oculto na impressão */}
      <div className="print:hidden flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ClipboardList className="h-6 w-6 text-yellow-400" />
          <div>
            <h2 className="text-xl font-semibold text-gray-100">Planilha de Inventário</h2>
            <p className="text-sm text-gray-400">{products?.length || 0} produtos cadastrados</p>
          </div>
        </div>
        <Button onClick={handlePrint} variant="outline" className="gap-2">
          <Printer className="h-4 w-4" />
          Imprimir
        </Button>
      </div>

      {/* Tabela de Contagem */}
      <div className="bg-white dark:bg-gray-900 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
        <table className="w-full">
          <thead className="bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">
                #
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">
                Produto
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">
                Categoria
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-200">
                Pacotes no Sistema
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-200">
                Unidades no Sistema
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-yellow-600 dark:text-yellow-400 print:border-2 print:border-yellow-500">
                Pacotes Contados
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-yellow-600 dark:text-yellow-400 print:border-2 print:border-yellow-500">
                Unidades Contadas
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {products?.map((product, index) => (
              <tr
                key={product.id}
                className={cn(
                  "hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors",
                  index % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-50/50 dark:bg-gray-800/30"
                )}
              >
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                  {index + 1}
                </td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                  {product.name}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                  {product.category}
                </td>
                <td className="px-4 py-3 text-center text-sm font-semibold text-blue-600 dark:text-blue-400">
                  {product.stock_packages || 0}
                </td>
                <td className="px-4 py-3 text-center text-sm font-semibold text-green-600 dark:text-green-400">
                  {product.stock_units_loose || 0}
                </td>
                <td className="px-4 py-3 text-center print:border-2 print:border-gray-300">
                  <span className="inline-block w-16 h-8 border-b-2 border-gray-400 print:border-gray-600"></span>
                </td>
                <td className="px-4 py-3 text-center print:border-2 print:border-gray-300">
                  <span className="inline-block w-16 h-8 border-b-2 border-gray-400 print:border-gray-600"></span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Rodapé de Assinatura - Aparece apenas na impressão */}
      <div className="hidden print:block mt-12 space-y-8">
        <div className="border-t-2 border-gray-300 pt-4 grid grid-cols-2 gap-8">
          <div>
            <p className="text-sm text-gray-600 mb-2">Responsável pela Contagem:</p>
            <div className="border-b-2 border-gray-400 pb-1"></div>
            <p className="text-xs text-gray-500 mt-1">Nome e Assinatura</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-2">Data do Inventário:</p>
            <div className="border-b-2 border-gray-400 pb-1"></div>
            <p className="text-xs text-gray-500 mt-1">Data</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryCountSheet;
