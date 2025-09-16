/**
 * CustomerTableColumns.tsx - Gerenciamento de visibilidade de colunas
 * Context7 Pattern: Presentation Component para controle de colunas
 * Estado isolado para melhor performance e reutilização
 */

import React from 'react';
import { Button } from '@/shared/ui/primitives/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/shared/ui/primitives/dropdown-menu';
import { Settings, Eye, EyeOff } from 'lucide-react';
import { TableColumn } from '../utils/table-types';

interface CustomerTableColumnsProps {
  availableColumns: TableColumn[];
  visibleColumns: TableColumn[];
  onVisibilityChange: (columns: TableColumn[]) => void;
}

export const CustomerTableColumns: React.FC<CustomerTableColumnsProps> = ({
  availableColumns,
  visibleColumns,
  onVisibilityChange,
}) => {
  const toggleColumn = (column: TableColumn) => {
    const isVisible = visibleColumns.some(col => col.key === column.key);

    if (isVisible) {
      // Remover coluna (manter pelo menos 3 colunas essenciais)
      if (visibleColumns.length > 3) {
        onVisibilityChange(visibleColumns.filter(col => col.key !== column.key));
      }
    } else {
      // Adicionar coluna
      onVisibilityChange([...visibleColumns, column]);
    }
  };

  const isColumnVisible = (column: TableColumn) => {
    return visibleColumns.some(col => col.key === column.key);
  };

  const getColumnIcon = (column: TableColumn) => {
    // Mapeamento de ícones por tipo de coluna
    const iconMap: Record<string, React.ReactNode> = {
      cliente: '👤',
      ultimaCompra: '📅',
      insightsCount: '🧠',
      status: '✅',
      cidade: '📍',
      diasParaAniversario: '🎂',
      profileCompleteness: '📊',
      diasSemContato: '💬',
      valorEmAberto: '💰',
    };

    return iconMap[column.key] || '📋';
  };

  const resetToDefault = () => {
    // Colunas essenciais que sempre devem estar visíveis
    const essentialColumns = availableColumns.filter(col =>
      ['cliente', 'ultimaCompra', 'insightsCount', 'status'].includes(col.key)
    );
    onVisibilityChange(essentialColumns);
  };

  const showAll = () => {
    onVisibilityChange([...availableColumns]);
  };

  const hideNonEssential = () => {
    const essentialColumns = availableColumns.filter(col =>
      ['cliente', 'ultimaCompra', 'status'].includes(col.key)
    );
    onVisibilityChange(essentialColumns);
  };

  return (
    <div className="flex items-center gap-2">
      {/* Contador de colunas */}
      <div className="text-sm text-gray-400">
        {visibleColumns.length} de {availableColumns.length} colunas
      </div>

      {/* Menu de configuração de colunas */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <Settings className="h-4 w-4 mr-2" />
            Colunas
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="bg-gray-800 border-gray-600 min-w-[280px]"
          align="end"
        >
          {/* Ações rápidas */}
          <div className="p-2 border-b border-gray-600">
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={showAll}
                className="h-7 px-2 text-xs text-green-400 hover:bg-green-900/30"
              >
                Mostrar todas
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={hideNonEssential}
                className="h-7 px-2 text-xs text-red-400 hover:bg-red-900/30"
              >
                Apenas essenciais
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={resetToDefault}
                className="h-7 px-2 text-xs text-blue-400 hover:bg-blue-900/30"
              >
                Padrão
              </Button>
            </div>
          </div>

          {/* Lista de colunas */}
          <div className="max-h-64 overflow-y-auto">
            {availableColumns.map((column) => {
              const isVisible = isColumnVisible(column);
              const isEssential = ['cliente', 'ultimaCompra', 'status'].includes(column.key);

              return (
                <DropdownMenuCheckboxItem
                  key={column.key}
                  checked={isVisible}
                  onCheckedChange={() => toggleColumn(column)}
                  disabled={isEssential && isVisible && visibleColumns.length <= 3}
                  className={`text-gray-300 hover:bg-gray-700 flex items-center gap-3 ${
                    isEssential ? 'bg-gray-700/30' : ''
                  }`}
                >
                  <span className="text-base">{getColumnIcon(column)}</span>
                  <div className="flex-1">
                    <div className="font-medium">{column.label}</div>
                    {column.description && (
                      <div className="text-xs text-gray-500">{column.description}</div>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {isEssential && (
                      <span className="text-xs text-blue-400 bg-blue-900/30 px-1 rounded">
                        essencial
                      </span>
                    )}
                    {isVisible ? (
                      <Eye className="h-3 w-3 text-green-400" />
                    ) : (
                      <EyeOff className="h-3 w-3 text-gray-500" />
                    )}
                  </div>
                </DropdownMenuCheckboxItem>
              );
            })}
          </div>

          {/* Informações adicionais */}
          <div className="p-2 border-t border-gray-600 text-xs text-gray-500">
            💡 Colunas essenciais não podem ser removidas quando há apenas 3 visíveis
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default CustomerTableColumns;