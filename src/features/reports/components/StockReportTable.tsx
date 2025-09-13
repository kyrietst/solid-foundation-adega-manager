/**
 * Tabela detalhada do relatório de estoque por categoria - História 1.5
 * Migrada para usar o novo sistema DataTable unificado - Fase 2.1 DRY refactoring
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { Badge } from '@/shared/ui/primitives/badge';
import { Progress } from '@/shared/ui/primitives/progress';
import { BarChart3, AlertTriangle } from 'lucide-react';
import { DataTable, DataTableColumn } from '@/shared/ui/composite';
import { CurrencyDisplay } from '@/shared/ui/composite';
import { StockReportByCategory } from '../types';

interface StockReportTableProps {
  categories: StockReportByCategory[];
  isLoading?: boolean;
}

export const StockReportTable: React.FC<StockReportTableProps> = ({
  categories,
  isLoading = false
}) => {
  // Definir colunas usando o novo sistema
  const columns: DataTableColumn<StockReportByCategory>[] = [
    {
      id: 'category',
      label: 'Categoria',
      accessor: 'category',
      sortable: true,
      searchable: true,
      align: 'left',
    },
    {
      id: 'total_products',
      label: 'Produtos',
      accessor: 'total_products',
      sortable: true,
      render: (value) => value.toLocaleString('pt-BR'),
      align: 'center',
    },
    {
      id: 'total_units',
      label: 'Unidades', 
      accessor: 'total_units',
      sortable: true,
      render: (value) => value.toLocaleString('pt-BR'),
      align: 'center',
    },
    {
      id: 'total_value',
      label: 'Valor Total',
      accessor: 'total_value',
      sortable: true,
      render: (value) => <CurrencyDisplay value={value} className="text-white font-semibold" />,
      align: 'right',
    },
    {
      id: 'avg_price',
      label: 'Preço Médio',
      accessor: 'avg_price',
      sortable: true,
      render: (value) => <CurrencyDisplay value={value} />,
      align: 'right',
    },
    {
      id: 'percentage_of_total',
      label: '% do Total',
      accessor: 'percentage_of_total',
      sortable: true,
      render: (value) => (
        <div className="flex items-center space-x-2">
          <Progress value={value} className="w-12 h-2" />
          <span className="text-xs text-adega-gold font-medium">{value}%</span>
        </div>
      ),
      align: 'center',
    },
    {
      id: 'status',
      label: 'Status',
      accessor: (item) => item.low_stock_products,
      sortable: false,
      render: (value, item) => (
        item.low_stock_products > 0 ? (
          <Badge variant="destructive" className="gap-1">
            <AlertTriangle className="h-3 w-3" />
            {item.low_stock_products} baixo
          </Badge>
        ) : (
          <Badge variant="secondary" className="text-green-400">OK</Badge>
        )
      ),
      align: 'center',
    },
  ];

  return (
    <Card className="bg-adega-charcoal/20 border-white/10 backdrop-blur-xl shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <BarChart3 className="h-5 w-5" />
          Valor do Estoque por Categoria
        </CardTitle>
        <CardDescription className="text-adega-silver">
          Análise detalhada do valor do estoque distribuído por categoria de produtos
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <DataTable
          data={categories}
          columns={columns}
          loading={isLoading}
          searchPlaceholder="Buscar categoria..."
          searchFields={['category']}
          defaultSortField="total_value"
          defaultSortDirection="desc"
          empty={{
            title: 'Nenhum dado de estoque encontrado',
            description: 'Não há categorias para exibir',
            icon: BarChart3,
          }}
          caption={`Tabela de estoque por categoria com ${categories.length} categorias. Use as setas para navegar e ordenar.`}
        />
      </CardContent>
    </Card>
  );
};