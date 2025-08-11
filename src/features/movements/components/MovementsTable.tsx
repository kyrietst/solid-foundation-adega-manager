/**
 * Tabela de movimentações
 * Sub-componente especializado para exibição de dados
 */

import React, { useMemo, useState } from 'react';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from '@/shared/ui/primitives/dropdown-menu';
import { Button } from '@/shared/ui/primitives/button';
import { SearchBar21st } from '@/shared/ui/thirdparty/search-bar-21st';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { InventoryMovement } from '@/types/inventory.types';
import { Customer } from '@/features/movements/hooks/useMovements';

interface MovementsTableProps {
  movements: InventoryMovement[];
  productsMap: Record<string, { name: string; price: number }>;
  usersMap: Record<string, string>;
  typeInfo: Record<string, { label: string; color: string }>;
  customers: Customer[];
}

type SortField = 'date' | 'type' | 'product' | 'quantity' | 'reason' | 'customer' | 'user' | null;
type SortDirection = 'asc' | 'desc';

const ALL_COLUMNS = ['Data', 'Tipo', 'Produto', 'Quantidade', 'Motivo', 'Cliente', 'Responsável'] as const;

export const MovementsTable: React.FC<MovementsTableProps> = ({
  movements,
  productsMap,
  usersMap,
  typeInfo,
  customers,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleColumns, setVisibleColumns] = useState<string[]>([...ALL_COLUMNS]);
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const dataset = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    let rows = term
      ? movements.filter(m => {
          const productName = productsMap[m.product_id]?.name?.toLowerCase?.() || '';
          const userName = usersMap[m.user_id]?.toLowerCase?.() || '';
          const customerName = customers.find(c => c.id === m.customer_id)?.name?.toLowerCase?.() || '';
          return (
            productName.includes(term) ||
            userName.includes(term) ||
            customerName.includes(term) ||
            (m.reason || '').toLowerCase().includes(term)
          );
        })
      : movements;

    if (sortField) {
      rows = [...rows].sort((a, b) => {
        const toStr = (v: any) => (v == null ? '' : String(v).toLowerCase());
        let av: any;
        let bv: any;
        switch (sortField) {
          case 'date':
            av = new Date(a.date).getTime();
            bv = new Date(b.date).getTime();
            break;
          case 'type':
            av = toStr(typeInfo[a.type]?.label || a.type);
            bv = toStr(typeInfo[b.type]?.label || b.type);
            break;
          case 'product':
            av = toStr(productsMap[a.product_id]?.name || a.product_id);
            bv = toStr(productsMap[b.product_id]?.name || b.product_id);
            break;
          case 'quantity':
            av = a.quantity; bv = b.quantity; break;
          case 'reason':
            av = toStr(a.reason);
            bv = toStr(b.reason);
            break;
          case 'customer':
            av = toStr(customers.find(c => c.id === a.customer_id)?.name);
            bv = toStr(customers.find(c => c.id === b.customer_id)?.name);
            break;
          case 'user':
            av = toStr(usersMap[a.user_id]);
            bv = toStr(usersMap[b.user_id]);
            break;
          default:
            av = 0; bv = 0;
        }
        if (typeof av === 'number' && typeof bv === 'number') {
          return sortDirection === 'asc' ? av - bv : bv - av;
        }
        return sortDirection === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
      });
    }
    return rows;
  }, [movements, searchTerm, sortField, sortDirection, productsMap, usersMap, typeInfo, customers]);

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDirection('asc'); }
  };

  const icon = (field: SortField) => sortField !== field ? <ArrowUpDown className="w-4 h-4" /> : (sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />);

  if (dataset.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-adega-silver">Nenhuma movimentação encontrada</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="w-full sm:w-80">
          <SearchBar21st placeholder="Buscar movimentações..." value={searchTerm} onChange={setSearchTerm} debounceMs={150} />
        </div>
        <div className="flex items-center gap-2 text-sm text-adega-platinum/70">
          <span>{dataset.length} de {movements.length} registros</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">Colunas</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              {ALL_COLUMNS.map(col => (
                <DropdownMenuCheckboxItem
                  key={col}
                  checked={visibleColumns.includes(col)}
                  onCheckedChange={() => setVisibleColumns(prev => prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col])}
                >
                  {col}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-white/10">
            {visibleColumns.includes('Data') && (
              <th className="text-left p-2 text-adega-platinum">
                <button className="inline-flex items-center gap-2" onClick={() => handleSort('date')}>Data {icon('date')}</button>
              </th>
            )}
            {visibleColumns.includes('Tipo') && (
              <th className="text-left p-2 text-adega-platinum">
                <button className="inline-flex items-center gap-2" onClick={() => handleSort('type')}>Tipo {icon('type')}</button>
              </th>
            )}
            {visibleColumns.includes('Produto') && (
              <th className="text-left p-2 text-adega-platinum">
                <button className="inline-flex items-center gap-2" onClick={() => handleSort('product')}>Produto {icon('product')}</button>
              </th>
            )}
            {visibleColumns.includes('Quantidade') && (
              <th className="text-left p-2 text-adega-platinum">
                <button className="inline-flex items-center gap-2" onClick={() => handleSort('quantity')}>Quantidade {icon('quantity')}</button>
              </th>
            )}
            {visibleColumns.includes('Motivo') && (
              <th className="text-left p-2 text-adega-platinum">
                <button className="inline-flex items-center gap-2" onClick={() => handleSort('reason')}>Motivo {icon('reason')}</button>
              </th>
            )}
            {visibleColumns.includes('Cliente') && (
              <th className="text-left p-2 text-adega-platinum">
                <button className="inline-flex items-center gap-2" onClick={() => handleSort('customer')}>Cliente {icon('customer')}</button>
              </th>
            )}
            {visibleColumns.includes('Responsável') && (
              <th className="text-left p-2 text-adega-platinum">
                <button className="inline-flex items-center gap-2" onClick={() => handleSort('user')}>Responsável {icon('user')}</button>
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {dataset.map((movement: InventoryMovement) => (
            <tr 
              key={movement.id} 
              className="border-b border-white/5 hover:bg-adega-charcoal/30 transition-colors"
            >
              {visibleColumns.includes('Data') && (
                <td className="p-2 text-adega-silver">{new Date(movement.date).toLocaleString('pt-BR')}</td>
              )}
              {visibleColumns.includes('Tipo') && (
                <td className="p-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeInfo[movement.type]?.color || 'bg-gray-100 text-gray-700'}`}>
                    {typeInfo[movement.type]?.label || movement.type}
                  </span>
                </td>
              )}
              {visibleColumns.includes('Produto') && (
                <td className="p-2 text-white">{productsMap[movement.product_id]?.name ?? movement.product_id}</td>
              )}
              {visibleColumns.includes('Quantidade') && (
                <td className="p-2 text-white font-medium">{movement.quantity}</td>
              )}
              {visibleColumns.includes('Motivo') && (
                <td className="p-2 text-adega-silver">{movement.reason ?? '-'}</td>
              )}
              {visibleColumns.includes('Cliente') && (
                <td className="p-2 text-adega-silver">{customers.find(c => c.id === movement.customer_id)?.name ?? '-'}</td>
              )}
              {visibleColumns.includes('Responsável') && (
                <td className="p-2 text-adega-silver">{usersMap[movement.user_id] ?? movement.user_id}</td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
};