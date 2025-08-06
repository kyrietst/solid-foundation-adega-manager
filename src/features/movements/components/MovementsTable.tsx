/**
 * Tabela de movimentações
 * Sub-componente especializado para exibição de dados
 */

import React from 'react';
import { InventoryMovement } from '@/types/inventory.types';
import { Customer } from '@/features/movements/hooks/useMovements';

interface MovementsTableProps {
  movements: InventoryMovement[];
  productsMap: Record<string, { name: string; price: number }>;
  usersMap: Record<string, string>;
  typeInfo: Record<string, { label: string; color: string }>;
  customers: Customer[];
}

export const MovementsTable: React.FC<MovementsTableProps> = ({
  movements,
  productsMap,
  usersMap,
  typeInfo,
  customers,
}) => {
  if (movements.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-adega-silver">Nenhuma movimentação encontrada</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-white/10">
            <th className="text-left p-2 text-adega-platinum">Data</th>
            <th className="text-left p-2 text-adega-platinum">Tipo</th>
            <th className="text-left p-2 text-adega-platinum">Produto</th>
            <th className="text-left p-2 text-adega-platinum">Quantidade</th>
            <th className="text-left p-2 text-adega-platinum">Motivo</th>
            <th className="text-left p-2 text-adega-platinum">Cliente</th>
            <th className="text-left p-2 text-adega-platinum">Responsável</th>
          </tr>
        </thead>
        <tbody>
          {movements.map((movement: InventoryMovement) => (
            <tr 
              key={movement.id} 
              className="border-b border-white/5 hover:bg-adega-charcoal/30 transition-colors"
            >
              <td className="p-2 text-adega-silver">
                {new Date(movement.date).toLocaleString('pt-BR')}
              </td>
              <td className="p-2">
                <span 
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    typeInfo[movement.type]?.color || 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {typeInfo[movement.type]?.label || movement.type}
                </span>
              </td>
              <td className="p-2 text-white">
                {productsMap[movement.product_id]?.name ?? movement.product_id}
              </td>
              <td className="p-2 text-white font-medium">
                {movement.quantity}
              </td>
              <td className="p-2 text-adega-silver">
                {movement.reason ?? '-'}
              </td>
              <td className="p-2 text-adega-silver">
                {customers.find(c => c.id === movement.customer_id)?.name ?? '-'}
              </td>
              <td className="p-2 text-adega-silver">
                {usersMap[movement.user_id] ?? movement.user_id}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};