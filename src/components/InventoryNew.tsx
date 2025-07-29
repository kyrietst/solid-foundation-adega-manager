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
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { ProductForm } from '@/components/inventory/ProductForm';
import { Product, ProductFormData, InventoryFilters, UnitType, TurnoverRate } from '@/types/inventory.types';

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
  
  // Estados de paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12); // 12 para grid, ajustável

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

  // Filtered products with pagination
  const { filteredProducts, paginatedProducts, totalPages, totalItems } = useMemo(() => {
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

    // Paginação
    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedProducts = filtered.slice(startIndex, startIndex + itemsPerPage);

    return {
      filteredProducts: filtered,
      paginatedProducts,
      totalPages,
      totalItems
    };
  }, [products, searchTerm, filters, currentPage, itemsPerPage]);

  // Reset to page 1 when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [searchTerm, filters]);

  // Helper functions
  const getUniqueCategories = () => {
    return [...new Set(products.map(p => p.category).filter(Boolean))].sort();
  };

  const getUniqueSuppliers = () => {
    return [...new Set(products.map(p => p.supplier).filter(Boolean))].sort();
  };

  // Pagination handlers
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(parseInt(value));
    setCurrentPage(1);
  };

  const handleViewModeChange = (mode: 'grid' | 'table') => {
    setViewMode(mode);
    // Adjust items per page based on view mode
    if (mode === 'grid') {
      setItemsPerPage(12);
    } else {
      setItemsPerPage(20);
    }
    setCurrentPage(1);
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

  // Pagination component
  const PaginationControls = () => {
    if (totalPages <= 1) return null;
    
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return (
      <div className="flex items-center justify-between pt-4 border-t">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <span>
            Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, totalItems)} de {totalItems} produtos
          </span>
          <div className="flex items-center space-x-2 ml-4">
            <span>Itens por página:</span>
            <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6">6</SelectItem>
                <SelectItem value="12">12</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex items-center space-x-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          {pages.map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              onClick={() => handlePageChange(page)}
              className="min-w-[40px]"
            >
              {page}
            </Button>
          ))}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/30 border-t-primary"></div>
      </div>
    );
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
        <Card className="bg-adega-charcoal/20 border-white/10 backdrop-blur-xl shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-adega-platinum">Total</CardTitle>
            <Package className="h-4 w-4 text-adega-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-adega-yellow">{calculations.totalProducts}</div>
            <p className="text-xs text-adega-silver">produtos</p>
          </CardContent>
        </Card>

        <Card className="bg-adega-charcoal/20 border-white/10 backdrop-blur-xl shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-adega-platinum">Valor Total</CardTitle>
            <DollarSign className="h-4 w-4 text-adega-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-adega-yellow">
              R$ {calculations.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-adega-silver">estoque</p>
          </CardContent>
        </Card>

        <Card className="bg-adega-charcoal/20 border-adega-amber/30 backdrop-blur-xl shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-adega-platinum">Baixo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-adega-amber" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-adega-amber">{calculations.lowStockProducts.length}</div>
            <p className="text-xs text-adega-silver">atenção</p>
          </CardContent>
        </Card>

        <Card className="bg-adega-charcoal/20 border-white/10 backdrop-blur-xl shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-adega-platinum">Giro Rápido</CardTitle>
            <TrendingUp className="h-4 w-4 text-adega-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-adega-yellow">{calculations.turnoverStats.fast}</div>
            <p className="text-xs text-adega-silver">produtos</p>
          </CardContent>
        </Card>

        <Card className="bg-adega-charcoal/20 border-red-500/30 backdrop-blur-xl shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-adega-platinum">Giro Lento</CardTitle>
            <BarChart3 className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-400">{calculations.turnoverStats.slow}</div>
            <p className="text-xs text-adega-silver">produtos</p>
          </CardContent>
        </Card>
      </div>

      {/* Controls and Search */}
      <Card className="bg-adega-charcoal/20 border-white/10 backdrop-blur-xl shadow-xl">
        <CardHeader>
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div className="flex items-center space-x-4">
              <CardTitle>Produtos em Estoque</CardTitle>
              <Badge variant="secondary">{totalItems} {totalItems !== products.length ? `de ${products.length}` : ''}</Badge>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar produtos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filtros
                <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </Button>

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
            <div className="flex items-center justify-center h-32">
              <div className="text-center">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <div className="text-muted-foreground">
                  {products.length === 0 ? 'Nenhum produto cadastrado' : 'Nenhum produto encontrado com os filtros aplicados'}
                </div>
              </div>
            </div>
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
                              R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
              <PaginationControls />
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
                            R$ {product.price.toFixed(2)}
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
              <PaginationControls />
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