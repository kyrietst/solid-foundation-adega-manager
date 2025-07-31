import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  DollarSign, 
  BarChart3, 
  Search,
  Filter,
  Grid3X3,
  List,
  Eye,
  ChevronDown
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { ProductForm } from '@/components/inventory/ProductForm';
import { Product, ProductFormData, InventoryFilters, UnitType, TurnoverRate } from '@/types/inventory.types';
import { formatCurrency } from '@/lib/utils';
import { StatCard } from '@/components/ui/stat-card';
import { LoadingScreen } from '@/components/ui/loading-spinner';
import { SearchInput } from '@/components/ui/search-input';
import { FilterToggle } from '@/components/ui/filter-toggle';
import { EmptyProducts } from '@/components/ui/empty-state';
import { usePagination } from '@/hooks/use-pagination';
import { PaginationControls } from '@/components/ui/pagination-controls';

export const InventoryNew = () => {
  const { userRole } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Estados principais
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<InventoryFilters>({});
  
  // Estados locais
  const [initialItemsPerPage] = useState(12); // 12 para grid, ajustável

  // Query para produtos
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products', 'inventory'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name', { ascending: true });
      if (error) throw error;
      return data as Product[];
    },
  });

  // Mutations
  const createProductMutation = useMutation({
    mutationFn: async (productData: ProductFormData) => {
      const { data, error } = await supabase
        .from('products')
        .insert({
          ...productData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsCreateDialogOpen(false);
      toast({
        title: "Produto criado!",
        description: `${data.name} foi adicionado ao estoque`,
      });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async (productData: ProductFormData & { id: string }) => {
      const { id, ...updateData } = productData;
      const { data, error } = await supabase
        .from('products')
        .update({
          ...updateData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsEditDialogOpen(false);
      setEditingProduct(null);
      toast({
        title: "Produto atualizado!",
        description: `${data.name} foi atualizado com sucesso`,
      });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: "Produto removido",
        description: "O produto foi removido do estoque",
      });
    },
  });

  // Calculations
  const calculations = useMemo(() => {
    const lowStockProducts = products.filter(p => p.stock_quantity <= p.minimum_stock);
    const totalValue = products.reduce((total, p) => total + (p.price * p.stock_quantity), 0);
    const turnoverStats = {
      fast: products.filter(p => p.turnover_rate === 'fast').length,
      medium: products.filter(p => p.turnover_rate === 'medium').length,
      slow: products.filter(p => p.turnover_rate === 'slow').length,
    };

    return {
      totalProducts: products.length,
      lowStockProducts,
      totalValue,
      turnoverStats,
    };
  }, [products]);

  // Filtered products (sem paginação)
  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.barcode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.supplier?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Advanced filters
    if (filters.category) {
      filtered = filtered.filter(product => product.category === filters.category);
    }

    if (filters.unitType) {
      filtered = filtered.filter(product => product.unit_type === filters.unitType);
    }

    if (filters.turnoverRate) {
      filtered = filtered.filter(product => product.turnover_rate === filters.turnoverRate);
    }

    if (filters.stockStatus) {
      filtered = filtered.filter(product => {
        const ratio = product.stock_quantity / product.minimum_stock;
        switch (filters.stockStatus) {
          case 'low': return ratio <= 1;
          case 'adequate': return ratio > 1 && ratio <= 3;
          case 'high': return ratio > 3;
          default: return true;
        }
      });
    }

    if (filters.supplier) {
      filtered = filtered.filter(product => product.supplier === filters.supplier);
    }

    return filtered;
  }, [products, searchTerm, filters]);

  // Hook de paginação reutilizável
  const {
    currentPage,
    itemsPerPage,
    totalPages,
    totalItems,
    paginatedItems: paginatedProducts,
    goToPage,
    nextPage,
    prevPage,
    setItemsPerPage,
    goToFirstPage,
    goToLastPage
  } = usePagination(filteredProducts, {
    initialItemsPerPage: initialItemsPerPage,
    resetOnItemsChange: true // Reset para página 1 quando filtros mudam
  });

  // Helper functions
  const getUniqueCategories = () => {
    return [...new Set(products.map(p => p.category).filter(Boolean))].sort();
  };

  const getUniqueSuppliers = () => {
    return [...new Set(products.map(p => p.supplier).filter(Boolean))].sort();
  };

  // View mode handler
  const handleViewModeChange = (mode: 'grid' | 'table') => {
    setViewMode(mode);
    // Adjust items per page based on view mode
    if (mode === 'grid') {
      setItemsPerPage(12);
    } else {
      setItemsPerPage(20);
    }
  };

  // Handlers
  const handleCreateProduct = (productData: ProductFormData) => {
    createProductMutation.mutate(productData);
  };

  const handleUpdateProduct = (productData: ProductFormData) => {
    if (!editingProduct) return;
    updateProductMutation.mutate({ ...productData, id: editingProduct.id });
  };

  const handleDeleteProduct = (id: string) => {
    if (userRole === 'employee') {
      toast({
        title: "Acesso negado",
        description: "Apenas administradores podem excluir produtos",
        variant: "destructive",
      });
      return;
    }
    if (confirm('Tem certeza que deseja remover este produto?')) {
      deleteProductMutation.mutate(id);
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsEditDialogOpen(true);
  };


  if (isLoading) {
    return <LoadingScreen text="Carregando produtos..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header with Alert Banner */}
      {calculations.lowStockProducts.length > 0 && (
        <Card className="border-adega-amber/30 bg-adega-amber/5 backdrop-blur-xl shadow-xl">
          <CardContent className="p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-adega-amber mr-3" />
              <div>
                <h4 className="font-semibold text-adega-amber">
                  {calculations.lowStockProducts.length} produtos com estoque baixo
                </h4>
                <p className="text-sm text-adega-amber/80">
                  Verifique os produtos que precisam de reposição
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total"
          value={calculations.totalProducts}
          description="produtos"
          icon={Package}
          variant="default"
        />
        
        <StatCard
          title="Valor Total"
          value={formatCurrency(calculations.totalValue)}
          description="estoque"
          icon={DollarSign}
          variant="default"
        />
        
        <StatCard
          title="Baixo"
          value={calculations.lowStockProducts.length}
          description="atenção"
          icon={AlertTriangle}
          variant="warning"
        />
        
        <StatCard
          title="Giro Rápido"
          value={calculations.turnoverStats.fast}
          description="produtos"
          icon={TrendingUp}
          variant="default"
        />
        
        <StatCard
          title="Giro Lento"
          value={calculations.turnoverStats.slow}
          description="produtos"
          icon={BarChart3}
          variant="error"
        />
      </div>

      {/* Controls and Search */}
      <Card className="bg-adega-charcoal/20 border-white/10 backdrop-blur-xl shadow-xl">
        <CardHeader>
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div className="flex items-center space-x-4">
              <CardTitle>Produtos em Estoque</CardTitle>
              <Badge variant="secondary">{filteredProducts.length} {filteredProducts.length !== products.length ? `de ${products.length}` : ''}</Badge>
            </div>
            
            <div className="flex items-center space-x-2">
              <SearchInput
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Buscar produtos..."
                className="w-64"
              />
              
              <FilterToggle
                isOpen={showFilters}
                onToggle={() => setShowFilters(!showFilters)}
                label="Filtros"
              />

              <div className="flex border rounded-md">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => handleViewModeChange('grid')}
                  className="rounded-r-none"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'table' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => handleViewModeChange('table')}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>

              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Produto
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Criar Novo Produto</DialogTitle>
                  </DialogHeader>
                  <ProductForm
                    onSubmit={handleCreateProduct}
                    onCancel={() => setIsCreateDialogOpen(false)}
                    isLoading={createProductMutation.isPending}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="pt-4 border-t space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <div>
                  <Select value={filters.category || 'all'} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value === 'all' ? undefined : value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      {getUniqueCategories().map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Select value={filters.unitType || 'all'} onValueChange={(value: UnitType | 'all') => setFilters(prev => ({ ...prev, unitType: value === 'all' ? undefined : value as UnitType }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tipo de venda" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="un">Unidade</SelectItem>
                      <SelectItem value="pct">Pacote</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Select value={filters.turnoverRate || 'all'} onValueChange={(value: TurnoverRate | 'all') => setFilters(prev => ({ ...prev, turnoverRate: value === 'all' ? undefined : value as TurnoverRate }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Giro" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="fast">Rápido</SelectItem>
                      <SelectItem value="medium">Médio</SelectItem>
                      <SelectItem value="slow">Lento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Select value={filters.stockStatus || 'all'} onValueChange={(value) => setFilters(prev => ({ ...prev, stockStatus: value === 'all' ? undefined : value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Status estoque" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="low">Baixo</SelectItem>
                      <SelectItem value="adequate">Adequado</SelectItem>
                      <SelectItem value="high">Alto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Select value={filters.supplier || 'all'} onValueChange={(value) => setFilters(prev => ({ ...prev, supplier: value === 'all' ? undefined : value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Fornecedor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {getUniqueSuppliers().map(supplier => (
                        <SelectItem key={supplier} value={supplier}>{supplier}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {Object.values(filters).some(v => v) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilters({})}
                >
                  Limpar Filtros
                </Button>
              )}
            </div>
          )}
        </CardHeader>

        <CardContent>
          {totalItems === 0 ? (
            <EmptyProducts 
              hasFilters={products.length > 0}
              onCreateNew={() => setIsCreateDialogOpen(true)}
            />
          ) : viewMode === 'grid' ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {paginatedProducts.map((product) => {
                const stockRatio = product.stock_quantity / product.minimum_stock;
                const isLowStock = product.stock_quantity <= product.minimum_stock;
                
                return (
                  <Card 
                    key={product.id} 
                    className={`bg-adega-charcoal/20 border-white/10 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-200 ${
                      isLowStock ? 'border-adega-amber/50 shadow-adega-amber/20' : ''
                    }`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base font-semibold truncate text-adega-platinum">
                            {product.name}
                          </CardTitle>
                          {product.barcode && (
                            <p className="text-xs text-adega-silver mt-1">
                              {product.barcode}
                            </p>
                          )}
                          <Badge variant="outline" className="mt-2 text-xs">
                            {product.category}
                          </Badge>
                        </div>
                        <div className="flex space-x-1 ml-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditProduct(product)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          {userRole === 'admin' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteProduct(product.id)}
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        {/* Stock Level */}
                        <div>
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-adega-silver">Estoque:</span>
                            <span className={`font-semibold ${isLowStock ? 'text-adega-amber' : 'text-adega-platinum'}`}>
                              {product.stock_quantity} {product.unit_type}
                            </span>
                          </div>
                          <div className="w-full bg-adega-steel/30 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all ${
                                stockRatio <= 0.5 ? 'bg-red-500' : 
                                stockRatio <= 1 ? 'bg-adega-amber' : 'bg-green-500'
                              }`}
                              style={{ width: `${Math.min(stockRatio, 1) * 100}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-xs text-adega-silver mt-1">
                            <span>Min: {product.minimum_stock}</span>
                            <span className={stockRatio <= 1 ? 'text-adega-amber' : ''}>
                              {stockRatio <= 1 ? 'Baixo' : stockRatio <= 2 ? 'Adequado' : 'Alto'}
                            </span>
                          </div>
                        </div>

                        {/* Price (Admin only) */}
                        {userRole === 'admin' && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-adega-silver">Preço:</span>
                            <span className="font-semibold text-adega-gold">
                              {formatCurrency(product.price)}
                            </span>
                          </div>
                        )}

                        {/* Turnover Rate */}
                        {product.turnover_rate && (
                          <div className="flex items-center justify-between">
                            <span className="text-adega-silver text-sm">Giro:</span>
                            <Badge 
                              variant={
                                product.turnover_rate === 'fast' ? 'default' :
                                product.turnover_rate === 'medium' ? 'secondary' : 'destructive'
                              }
                              className="text-xs"
                            >
                              {product.turnover_rate === 'fast' ? 'Rápido' :
                               product.turnover_rate === 'medium' ? 'Médio' : 'Lento'}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              </div>
              <PaginationControls 
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                onPageChange={goToPage}
                onItemsPerPageChange={(value) => setItemsPerPage(parseInt(value))}
                itemsPerPageOptions={[6, 12, 20, 50]}
                showItemsPerPage={true}
                showInfo={true}
                itemLabel="produtos"
              />
            </>
          ) : (
            /* Table View */
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="text-left p-3 font-medium">Nome do Produto</th>
                    <th className="text-left p-3 font-medium">Categoria</th>
                    <th className="text-left p-3 font-medium">Estoque</th>
                    <th className="text-left p-3 font-medium">Status</th>
                    {userRole === 'admin' && <th className="text-left p-3 font-medium">Preço</th>}
                    <th className="text-left p-3 font-medium">Giro</th>
                    <th className="text-left p-3 font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedProducts.map((product) => {
                    const stockRatio = product.stock_quantity / product.minimum_stock;
                    const isLowStock = product.stock_quantity <= product.minimum_stock;
                    
                    return (
                      <tr 
                        key={product.id} 
                        className={`border-b hover:bg-muted/30 transition-colors ${
                          isLowStock ? 'bg-adega-amber/5' : ''
                        }`}
                      >
                        <td className="p-3">
                          <div className="font-medium">{product.name}</div>
                          {product.barcode && (
                            <div className="text-xs text-muted-foreground">{product.barcode}</div>
                          )}
                        </td>
                        <td className="p-3">
                          <Badge variant="outline">{product.category}</Badge>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{product.stock_quantity} {product.unit_type}</span>
                            <div className="w-16 h-1.5 bg-muted rounded">
                              <div
                                className={`h-1.5 rounded transition-all ${
                                  stockRatio <= 0.5 ? 'bg-red-500' : 
                                  stockRatio <= 1 ? 'bg-adega-amber' : 'bg-green-500'
                                }`}
                                style={{ width: `${Math.min(stockRatio, 1) * 100}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge variant={
                            product.stock_quantity === 0 ? 'destructive' :
                            isLowStock ? 'destructive' :
                            stockRatio <= 2 ? 'secondary' : 'default'
                          }>
                            {product.stock_quantity === 0 ? 'Sem Estoque' :
                             isLowStock ? 'Estoque Baixo' :
                             stockRatio <= 2 ? 'Adequado' : 'Alto'}
                          </Badge>
                        </td>
                        {userRole === 'admin' && (
                          <td className="p-3 font-medium">
                            {formatCurrency(product.price)}
                          </td>
                        )}
                        <td className="p-3">
                          <Badge variant={
                            product.turnover_rate === 'fast' ? 'default' :
                            product.turnover_rate === 'medium' ? 'secondary' : 'outline'
                          }>
                            {product.turnover_rate === 'fast' ? 'Rápido' :
                             product.turnover_rate === 'medium' ? 'Médio' : 'Lento'}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <div className="flex space-x-1">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleEditProduct(product)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            {userRole === 'admin' && (
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => handleDeleteProduct(product.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <PaginationControls 
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                onPageChange={goToPage}
                onItemsPerPageChange={(value) => setItemsPerPage(parseInt(value))}
                itemsPerPageOptions={[6, 12, 20, 50]}
                showItemsPerPage={true}
                showInfo={true}
                itemLabel="produtos"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Produto</DialogTitle>
          </DialogHeader>
          {editingProduct && (
            <ProductForm
              initialData={editingProduct}
              onSubmit={handleUpdateProduct}
              onCancel={() => setIsEditDialogOpen(false)}
              isLoading={updateProductMutation.isPending}
              isEdit={true}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};