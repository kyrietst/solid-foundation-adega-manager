/**
 * Tabela detalhada do relatório de estoque por categoria - História 1.5
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/primitives/table';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from '@/shared/ui/primitives/dropdown-menu';
import { Button } from '@/shared/ui/primitives/button';
import { SearchBar21st } from '@/shared/ui/thirdparty/search-bar-21st';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Badge } from '@/shared/ui/primitives/badge';
import { Progress } from '@/shared/ui/primitives/progress';
import { BarChart3, AlertTriangle } from 'lucide-react';
import { StockReportByCategory } from '../types';
import { formatCurrency } from '@/core/config/utils';

interface StockReportTableProps {
  categories: StockReportByCategory[];
  isLoading?: boolean;
}

export const StockReportTable: React.FC<StockReportTableProps> = ({
  categories,
  isLoading = false
}) => {
  const ALL_COLUMNS = ['Categoria', 'Produtos', 'Unidades', 'Valor Total', 'Preço Médio', '% do Total', 'Status'] as const;
  const [searchTerm, setSearchTerm] = React.useState('');
  const [visibleColumns, setVisibleColumns] = React.useState<string[]>([...ALL_COLUMNS]);
  const [sortField, setSortField] = React.useState<keyof StockReportByCategory | 'percentage_of_total' | null>('total_value');
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('desc');

  const dataset = React.useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    let rows = term
      ? categories.filter(c =>
          c.category.toLowerCase().includes(term)
        )
      : categories;
    if (sortField) {
      rows = [...rows].sort((a, b) => {
        const av: any = (a as any)[sortField!];
        const bv: any = (b as any)[sortField!];
        if (typeof av === 'number' && typeof bv === 'number') {
          return sortDirection === 'asc' ? av - bv : bv - av;
        }
        return sortDirection === 'asc'
          ? String(av).localeCompare(String(bv))
          : String(bv).localeCompare(String(av));
      });
    }
    return rows;
  }, [categories, searchTerm, sortField, sortDirection]);

  const handleSort = (field: keyof StockReportByCategory | 'percentage_of_total') => {
    if (sortField === field) setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDirection('desc'); }
  };

  const icon = (field: keyof StockReportByCategory | 'percentage_of_total') => sortField !== field ? <ArrowUpDown className="w-4 h-4" /> : (sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />);
  if (isLoading) {
    return (
      <Card className="bg-adega-charcoal/20 border-white/10 backdrop-blur-xl shadow-xl">
        <CardHeader>
          <div className="animate-pulse">
            <div className="h-6 bg-gray-300 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-2/3"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

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
      <CardContent>
        <div className="space-y-4 p-2">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="w-full sm:w-80">
              <SearchBar21st placeholder="Buscar categoria..." value={searchTerm} onChange={setSearchTerm} debounceMs={150} disableResizeAnimation={true} />
            </div>
            <div className="flex items-center gap-2 text-sm text-adega-platinum/70">
              <span>{dataset.length} de {categories.length} categorias</span>
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
        </div>

        <Table>
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-white/5">
              {visibleColumns.includes('Categoria') && (
                <TableHead className="text-adega-platinum">
                  <button className="inline-flex items-center gap-2" onClick={() => handleSort('category')}>Categoria {icon('category')}</button>
                </TableHead>
              )}
              {visibleColumns.includes('Produtos') && (
                <TableHead className="text-adega-platinum">
                  <button className="inline-flex items-center gap-2" onClick={() => handleSort('total_products')}>Produtos {icon('total_products')}</button>
                </TableHead>
              )}
              {visibleColumns.includes('Unidades') && (
                <TableHead className="text-adega-platinum">
                  <button className="inline-flex items-center gap-2" onClick={() => handleSort('total_units')}>Unidades {icon('total_units')}</button>
                </TableHead>
              )}
              {visibleColumns.includes('Valor Total') && (
                <TableHead className="text-adega-platinum">
                  <button className="inline-flex items-center gap-2" onClick={() => handleSort('total_value')}>Valor Total {icon('total_value')}</button>
                </TableHead>
              )}
              {visibleColumns.includes('Preço Médio') && (
                <TableHead className="text-adega-platinum">
                  <button className="inline-flex items-center gap-2" onClick={() => handleSort('avg_price')}>Preço Médio {icon('avg_price')}</button>
                </TableHead>
              )}
              {visibleColumns.includes('% do Total') && (
                <TableHead className="text-adega-platinum">
                  <button className="inline-flex items-center gap-2" onClick={() => handleSort('percentage_of_total')}>% do Total {icon('percentage_of_total')}</button>
                </TableHead>
              )}
              {visibleColumns.includes('Status') && (
                <TableHead className="text-adega-platinum">Status</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {dataset.map((category) => (
              <TableRow 
                key={category.category}
                className="border-white/10 hover:bg-white/5"
              >
                {visibleColumns.includes('Categoria') && (
                  <TableCell className="font-medium text-white">{category.category}</TableCell>
                )}
                {visibleColumns.includes('Produtos') && (
                  <TableCell className="text-adega-silver">{category.total_products.toLocaleString()}</TableCell>
                )}
                {visibleColumns.includes('Unidades') && (
                  <TableCell className="text-adega-silver">{category.total_units.toLocaleString()}</TableCell>
                )}
                {visibleColumns.includes('Valor Total') && (
                  <TableCell className="text-white font-semibold">{formatCurrency(category.total_value)}</TableCell>
                )}
                {visibleColumns.includes('Preço Médio') && (
                  <TableCell className="text-adega-silver">{formatCurrency(category.avg_price)}</TableCell>
                )}
                {visibleColumns.includes('% do Total') && (
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Progress value={category.percentage_of_total} className="w-12 h-2" />
                      <span className="text-xs text-adega-gold font-medium">{category.percentage_of_total}%</span>
                    </div>
                  </TableCell>
                )}
                {visibleColumns.includes('Status') && (
                  <TableCell>
                    {category.low_stock_products > 0 ? (
                      <Badge variant="destructive" className="gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        {category.low_stock_products} baixo
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-green-400">OK</Badge>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {dataset.length === 0 && (
          <div className="text-center py-8 text-adega-silver">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum dado de estoque encontrado</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};