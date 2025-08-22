/**
 * Lista de lotes com filtros e gestão FEFO
 * Interface principal para visualização e gerenciamento de lotes
 */

import React, { useState, useMemo } from 'react';
import { 
  Package, 
  Calendar, 
  AlertTriangle, 
  Clock, 
  TrendingUp, 
  Filter,
  Search,
  Plus,
  Eye,
  ShoppingCart
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { Input } from '@/shared/ui/primitives/input';
import { Label } from '@/shared/ui/primitives/label';
import { Button } from '@/shared/ui/primitives/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/primitives/select';
import { Badge } from '@/shared/ui/primitives/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/primitives/table';
import { Alert, AlertDescription } from '@/shared/ui/primitives/alert';
import { LoadingSpinner } from '@/shared/ui/composite/loading-spinner';
import { PaginationControls } from '@/shared/ui/composite/pagination-controls';
import { EmptyState } from '@/shared/ui/composite/empty-state';
import { usePagination } from '@/shared/hooks/common/use-pagination';
import { useBatches } from '@/features/inventory/hooks/useBatches';
import { CreateBatchModal } from './CreateBatchModal';
import type { ProductBatch, Product } from '@/core/types/inventory.types';
import { cn } from '@/core/config/utils';
import { getValueClasses, getStockStatusClasses } from '@/core/config/theme-utils';
import { formatCurrency } from '@/core/config/utils';
import { formatDistanceToNow, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface BatchListProps {
  product?: Product; // Se especificado, mostra apenas lotes deste produto
  showCreateButton?: boolean;
}

export const BatchList: React.FC<BatchListProps> = ({
  product,
  showCreateButton = true
}) => {
  // Estados locais
  const [filters, setFilters] = useState({
    status: '',
    expiring_soon: false,
    supplier: '',
    search: ''
  });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Query para buscar lotes
  const { 
    data: batches = [], 
    isLoading, 
    error 
  } = useBatches({
    product_id: product?.id,
    status: filters.status || undefined,
    expiring_soon: filters.expiring_soon || undefined,
    supplier: filters.supplier || undefined
  });

  // Filtrar por busca local
  const filteredBatches = useMemo(() => {
    if (!filters.search) return batches;
    
    const searchLower = filters.search.toLowerCase();
    return batches.filter(batch => 
      batch.batch_code.toLowerCase().includes(searchLower) ||
      batch.product_name?.toLowerCase().includes(searchLower) ||
      batch.supplier_name?.toLowerCase().includes(searchLower)
    );
  }, [batches, filters.search]);

  // Paginação
  const {
    currentPage,
    itemsPerPage,
    paginatedItems: paginatedBatches,
    totalPages,
    goToPage,
    setItemsPerPage
  } = usePagination(filteredBatches, { initialItemsPerPage: 10 });

  // Handler para mudança de filtros
  const handleFilterChange = (field: string, value: any) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  // Handler para abrir modal de criação
  const handleCreateBatch = (productData?: Product) => {
    setSelectedProduct(productData || product || null);
    setIsCreateModalOpen(true);
  };

  // Função para obter status visual do lote
  const getBatchStatusInfo = (batch: ProductBatch) => {
    if (batch.is_expired) {
      return {
        variant: 'destructive' as const,
        label: 'Vencido',
        className: 'bg-accent-red/20 text-accent-red border-accent-red/50'
      };
    }
    
    if (batch.is_expiring_soon) {
      return {
        variant: 'warning' as const,
        label: batch.days_until_expiry === 0 ? 'Vence Hoje' : `${batch.days_until_expiry}d`,
        className: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50'
      };
    }
    
    if (batch.status === 'sold_out') {
      return {
        variant: 'secondary' as const,
        label: 'Esgotado',
        className: 'bg-gray-500/20 text-gray-400 border-gray-500/50'
      };
    }
    
    return {
      variant: 'default' as const,
      label: 'Ativo',
      className: 'bg-accent-green/20 text-accent-green border-accent-green/50'
    };
  };

  // Classes de estilo
  const valueClasses = getValueClasses('sm', 'gold');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner size="lg" variant="gold" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="border-accent-red/50 bg-accent-red/10">
        <AlertTriangle className="h-4 w-4 text-accent-red" />
        <AlertDescription className="text-accent-red">
          Erro ao carregar lotes: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header com Filtros */}
      <Card className="bg-gray-800/50 border-primary-yellow/30">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-gray-100">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary-yellow" />
              Gestão de Lotes
              {product && (
                <Badge variant="outline" className="ml-2 text-primary-yellow border-primary-yellow/50">
                  {product.name}
                </Badge>
              )}
            </div>
            {showCreateButton && (
              <Button
                onClick={() => handleCreateBatch()}
                className="bg-primary-yellow text-gray-900 hover:bg-primary-yellow/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Lote
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Busca */}
            <div>
              <Label className="text-gray-200">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder="Código, produto, fornecedor..."
                  className="pl-10 bg-gray-800/50 border-primary-yellow/30 text-gray-200 focus:border-primary-yellow"
                />
              </div>
            </div>

            {/* Status */}
            <div>
              <Label className="text-gray-200">Status</Label>
              <Select 
                value={filters.status} 
                onValueChange={(value) => handleFilterChange('status', value)}
              >
                <SelectTrigger className="bg-gray-800/50 border-primary-yellow/30 text-gray-200">
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-primary-yellow/30">
                  <SelectItem value="" className="text-gray-200">Todos</SelectItem>
                  <SelectItem value="active" className="text-gray-200">Ativo</SelectItem>
                  <SelectItem value="expired" className="text-gray-200">Vencido</SelectItem>
                  <SelectItem value="sold_out" className="text-gray-200">Esgotado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Fornecedor */}
            <div>
              <Label className="text-gray-200">Fornecedor</Label>
              <Input
                value={filters.supplier}
                onChange={(e) => handleFilterChange('supplier', e.target.value)}
                placeholder="Nome do fornecedor"
                className="bg-gray-800/50 border-primary-yellow/30 text-gray-200 focus:border-primary-yellow"
              />
            </div>

            {/* Vencendo */}
            <div className="flex items-center space-x-2 pt-6">
              <input
                type="checkbox"
                id="expiring_soon"
                checked={filters.expiring_soon}
                onChange={(e) => handleFilterChange('expiring_soon', e.target.checked)}
                className="rounded border-primary-yellow/30 bg-gray-800/50 text-primary-yellow focus:ring-primary-yellow"
              />
              <Label htmlFor="expiring_soon" className="text-gray-200">
                Vencendo em 7 dias
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumo de Estatísticas */}
      {batches.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gray-800/30 border-primary-yellow/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-primary-yellow" />
                <span className="text-gray-400 text-sm">Total de Lotes</span>
              </div>
              <p className={cn(valueClasses, "text-xl font-bold mt-1")}>{batches.length}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800/30 border-accent-green/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-accent-green" />
                <span className="text-gray-400 text-sm">Lotes Ativos</span>
              </div>
              <p className="text-accent-green text-xl font-bold mt-1">
                {batches.filter(b => b.status === 'active').length}
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800/30 border-yellow-500/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-yellow-500" />
                <span className="text-gray-400 text-sm">Vencendo</span>
              </div>
              <p className="text-yellow-500 text-xl font-bold mt-1">
                {batches.filter(b => b.is_expiring_soon).length}
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800/30 border-accent-red/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-accent-red" />
                <span className="text-gray-400 text-sm">Vencidos</span>
              </div>
              <p className="text-accent-red text-xl font-bold mt-1">
                {batches.filter(b => b.is_expired).length}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabela de Lotes */}
      {filteredBatches.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] py-16 px-8">
          <div className="max-w-md w-full text-center space-y-8">
            {/* Ícone principal */}
            <div className="mx-auto w-24 h-24 bg-gray-800/50 rounded-full flex items-center justify-center border-2 border-gray-600/30 backdrop-blur-sm">
              <Package className="h-12 w-12 text-gray-400" />
            </div>
            
            {/* Título */}
            <div className="space-y-3">
              <h3 className="text-2xl font-bold text-white">Nenhum lote encontrado</h3>
              <p className="text-gray-400 text-lg leading-relaxed">
                {product 
                  ? "Este produto ainda não possui lotes cadastrados para controle de validade"
                  : "Nenhum lote corresponde aos filtros aplicados"}
              </p>
            </div>
            
            {/* Botão de ação */}
            {showCreateButton && (
              <div className="pt-4">
                <Button 
                  onClick={() => handleCreateBatch()}
                  size="lg"
                  className="bg-gradient-to-r from-primary-yellow to-yellow-500 text-black hover:from-yellow-300 hover:to-yellow-400 font-semibold shadow-lg hover:shadow-yellow-400/30 transition-all duration-200 hover:scale-105 px-8 py-3"
                >
                  <Plus className="h-5 w-5 mr-3" />
                  CRIAR PRIMEIRO LOTE
                </Button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <Card className="bg-gray-800/50 border-primary-yellow/30">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700">
                    <TableHead className="text-gray-300">Lote</TableHead>
                    {!product && <TableHead className="text-gray-300">Produto</TableHead>}
                    <TableHead className="text-gray-300">Validade</TableHead>
                    <TableHead className="text-gray-300">Status</TableHead>
                    <TableHead className="text-gray-300">Estoque</TableHead>
                    <TableHead className="text-gray-300">Fornecedor</TableHead>
                    <TableHead className="text-gray-300">Qualidade</TableHead>
                    <TableHead className="text-gray-300">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedBatches.map((batch) => {
                    const statusInfo = getBatchStatusInfo(batch);
                    
                    return (
                      <TableRow key={batch.id} className="border-gray-700 hover:bg-gray-800/30">
                        <TableCell>
                          <div>
                            <p className="text-gray-200 font-medium">{batch.batch_code}</p>
                            <p className="text-xs text-gray-400">
                              {format(new Date(batch.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                            </p>
                          </div>
                        </TableCell>
                        
                        {!product && (
                          <TableCell>
                            <div>
                              <p className="text-gray-200">{batch.product_name}</p>
                              <p className="text-xs text-gray-400">{batch.product_category}</p>
                            </div>
                          </TableCell>
                        )}
                        
                        <TableCell>
                          <div>
                            <p className="text-gray-200">
                              {format(new Date(batch.expiry_date), 'dd/MM/yyyy', { locale: ptBR })}
                            </p>
                            <p className={cn(
                              "text-xs",
                              batch.is_expired ? "text-accent-red" :
                              batch.is_expiring_soon ? "text-yellow-500" : "text-gray-400"
                            )}>
                              {batch.is_expired ? `Vencido há ${Math.abs(batch.days_until_expiry || 0)} dias` :
                               batch.days_until_expiry === 0 ? 'Vence hoje' :
                               `${batch.days_until_expiry} dias`}
                            </p>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <Badge className={statusInfo.className}>
                            {statusInfo.label}
                          </Badge>
                        </TableCell>
                        
                        <TableCell>
                          <div>
                            <p className={cn(valueClasses)}>
                              {batch.available_units}/{batch.total_units}
                            </p>
                            <p className="text-xs text-gray-400">
                              {batch.sales_percentage?.toFixed(0)}% vendido
                            </p>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <p className="text-gray-200">{batch.supplier_name || '-'}</p>
                        </TableCell>
                        
                        <TableCell>
                          <Badge variant={batch.quality_grade === 'A' ? 'default' : 'secondary'}>
                            {batch.quality_grade}
                          </Badge>
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-gray-600 text-gray-400 hover:bg-gray-800"
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                            {batch.status === 'active' && batch.available_units > 0 && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-primary-yellow/50 text-primary-yellow hover:bg-primary-yellow/10"
                              >
                                <ShoppingCart className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Paginação */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-gray-700">
                <PaginationControls
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={goToPage}
                  itemsPerPage={itemsPerPage}
                  onItemsPerPageChange={setItemsPerPage}
                  itemsPerPageOptions={[5, 10, 20, 50]}
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Modal de Criação */}
      {selectedProduct && (
        <CreateBatchModal
          isOpen={isCreateModalOpen}
          onClose={() => {
            setIsCreateModalOpen(false);
            setSelectedProduct(null);
          }}
          product={selectedProduct}
        />
      )}
    </div>
  );
};