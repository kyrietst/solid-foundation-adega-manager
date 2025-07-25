
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, Package, AlertTriangle, TrendingUp, DollarSign, BarChart3, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { ProductForm } from '@/components/inventory/ProductForm';
import { Product, ProductFormData, InventoryFilters, UnitType, TurnoverRate } from '@/types/inventory.types';
import { useInventoryCalculations } from '@/hooks/useInventoryCalculations';

export const Inventory = () => {
  const { userRole } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Estados principais
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [filters, setFilters] = useState<InventoryFilters>({});
  const [showFilters, setShowFilters] = useState(false);

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

  // Mutations para CRUD
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
    onError: (error: Error) => {
      toast({
        title: "Erro ao criar produto",
        description: error.message,
        variant: "destructive",
      });
    }
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
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar produto",
        description: error.message,
        variant: "destructive",
      });
    }
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
    onError: (error: Error) => {
      toast({
        title: "Erro ao remover produto",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Funções auxiliares
  const handleCreateProduct = (productData: ProductFormData) => {
    createProductMutation.mutate(productData);
  };

  const handleUpdateProduct = (productData: ProductFormData) => {
    if (!editingProduct) return;
    
    // Verificações de permissão para funcionários
    if (userRole === 'employee') {
      if (editingProduct.price !== productData.price) {
        toast({
          title: "Acesso negado",
          description: "Funcionários não podem alterar preços",
          variant: "destructive",
        });
        return;
      }

      const quantityDiff = Math.abs(productData.stock_quantity - editingProduct.stock_quantity);
      if (quantityDiff > 50) {
        toast({
          title: "Limite excedido",
          description: "Funcionários podem ajustar no máximo 50 unidades por vez",
          variant: "destructive",
        });
        return;
      }
    }

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
    deleteProductMutation.mutate(id);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsEditDialogOpen(true);
  };

  // Funções de cálculo e filtragem
  const getLowStockProducts = () => {
    return products.filter(product => product.stock_quantity <= product.minimum_stock);
  };

  const getTotalValue = () => {
    return products.reduce((total, product) => total + (product.price * product.stock_quantity), 0);
  };

  const getFilteredProducts = () => {
    let filtered = products;

    if (filters.search) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(filters.search!.toLowerCase()) ||
        product.category.toLowerCase().includes(filters.search!.toLowerCase()) ||
        product.supplier?.toLowerCase().includes(filters.search!.toLowerCase())
      );
    }

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
  };

  const getUniqueCategories = () => {
    return [...new Set(products.map(p => p.category))].sort();
  };

  const getUniqueSuppliers = () => {
    return [...new Set(products.map(p => p.supplier).filter(Boolean))].sort();
  };

  const getTurnoverStats = () => {
    const fast = products.filter(p => p.turnover_rate === 'fast').length;
    const medium = products.filter(p => p.turnover_rate === 'medium').length;
    const slow = products.filter(p => p.turnover_rate === 'slow').length;
    return { fast, medium, slow };
  };

  const filteredProducts = getFilteredProducts();
  const lowStockProducts = getLowStockProducts();
  const turnoverStats = getTurnoverStats();

  return (
    <div className="space-y-6">
      {/* Alertas de Estoque Baixo */}
      {lowStockProducts.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center text-orange-700">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Alertas de Estoque ({lowStockProducts.length} produtos)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {lowStockProducts.slice(0, 6).map(product => {
                const ratio = Math.min(product.stock_quantity / product.minimum_stock, 1);
                return (
                  <div key={product.id} className="space-y-2 p-3 bg-white rounded border">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{product.name}</div>
                        <div className="text-xs text-muted-foreground">{product.category}</div>
                      </div>
                      <Badge variant={product.stock_quantity === 0 ? 'destructive' : 'secondary'} className="ml-2">
                        {product.stock_quantity}/{product.minimum_stock}
                      </Badge>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-orange-100">
                      <div 
                        className={`h-1.5 rounded-full ${product.stock_quantity === 0 ? 'bg-red-500' : 'bg-orange-400'}`} 
                        style={{ width: `${ratio * 100}%` }} 
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            {lowStockProducts.length > 6 && (
              <div className="mt-3 text-center">
                <Badge variant="outline">
                  +{lowStockProducts.length - 6} produtos com estoque baixo
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Cards de Resumo Expandidos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
            <p className="text-xs text-muted-foreground">
              {filteredProducts.length !== products.length && `${filteredProducts.length} filtrados`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {getTotalValue().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground">
              Estoque atual
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowStockProducts.length}</div>
            <p className="text-xs text-muted-foreground">
              Requer atenção
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Giro Rápido</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{turnoverStats.fast}</div>
            <p className="text-xs text-muted-foreground">
              Vendem rápido
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Giro Lento</CardTitle>
            <BarChart3 className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{turnoverStats.slow}</div>
            <p className="text-xs text-muted-foreground">
              Vendem devagar
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e Controles */}
      <Card>
        <CardHeader>
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div className="flex items-center space-x-2">
              <CardTitle>Produtos em Estoque</CardTitle>
              <Badge variant="secondary">{filteredProducts.length}</Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
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

          {/* Seção de Filtros */}
          {showFilters && (
            <div className="pt-4 border-t space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div>
                  <Input
                    placeholder="Buscar produtos..."
                    value={filters.search || ''}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  />
                </div>
                <div>
                  <Select value={filters.category || ''} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value || undefined }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todas</SelectItem>
                      {getUniqueCategories().map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Select value={filters.unitType || ''} onValueChange={(value: UnitType | '') => setFilters(prev => ({ ...prev, unitType: value || undefined }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tipo de venda" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos</SelectItem>
                      <SelectItem value="un">Unidade</SelectItem>
                      <SelectItem value="pct">Pacote</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Select value={filters.turnoverRate || ''} onValueChange={(value: TurnoverRate | '') => setFilters(prev => ({ ...prev, turnoverRate: value || undefined }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Giro" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos</SelectItem>
                      <SelectItem value="fast">Rápido</SelectItem>
                      <SelectItem value="medium">Médio</SelectItem>
                      <SelectItem value="slow">Lento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Select value={filters.stockStatus || ''} onValueChange={(value) => setFilters(prev => ({ ...prev, stockStatus: value || undefined }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Status estoque" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos</SelectItem>
                      <SelectItem value="low">Baixo</SelectItem>
                      <SelectItem value="adequate">Adequado</SelectItem>
                      <SelectItem value="high">Alto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Select value={filters.supplier || ''} onValueChange={(value) => setFilters(prev => ({ ...prev, supplier: value || undefined }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Fornecedor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos</SelectItem>
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
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-muted-foreground">Carregando produtos...</div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-center">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <div className="text-muted-foreground">
                  {products.length === 0 ? 'Nenhum produto cadastrado' : 'Nenhum produto encontrado com os filtros aplicados'}
                </div>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="text-left p-3 font-medium">Nome do Produto</th>
                    <th className="text-left p-3 font-medium">Volume</th>
                    <th className="text-left p-3 font-medium">Categoria</th>
                    <th className="text-left p-3 font-medium">Venda em</th>
                    <th className="text-left p-3 font-medium">Estoque Atual</th>
                    {userRole === 'admin' && (
                      <>
                        <th className="text-left p-3 font-medium">Fornecedor</th>
                        <th className="text-left p-3 font-medium">Preço de Custo</th>
                        <th className="text-left p-3 font-medium">Preço Venda (un.)</th>
                        <th className="text-left p-3 font-medium">Margem (un.)</th>
                        <th className="text-left p-3 font-medium">Preço Venda (pct)</th>
                        <th className="text-left p-3 font-medium">Margem (pct)</th>
                      </>
                    )}
                    {userRole !== 'admin' && (
                      <th className="text-left p-3 font-medium">Preço</th>
                    )}
                    <th className="text-left p-3 font-medium">Giro</th>
                    <th className="text-left p-3 font-medium">Status</th>
                    <th className="text-left p-3 font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => {
                    const stockRatio = product.stock_quantity / product.minimum_stock;
                    const packagePrice = product.package_price || (product.price * product.package_size);
                    
                    // Calcular margens manualmente para evitar hook dentro de callback
                    const unitProfitAmount = product.price - (product.cost_price || 0);
                    const unitMargin = product.cost_price ? (unitProfitAmount / product.cost_price) * 100 : 0;
                    const packageCostPrice = (product.cost_price || 0) * product.package_size;
                    const packageProfitAmount = packagePrice - packageCostPrice;
                    const packageMargin = packageCostPrice > 0 ? (packageProfitAmount / packageCostPrice) * 100 : 0;
                    
                    return (
                      <tr 
                        key={product.id} 
                        className={`border-b hover:bg-muted/30 transition-colors ${
                          product.stock_quantity <= product.minimum_stock ? 'bg-orange-50 hover:bg-orange-100' : ''
                        }`}
                      >
                        <td className="p-3">
                          <div className="font-medium">{product.name}</div>
                          {product.description && (
                            <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                              {product.description}
                            </div>
                          )}
                        </td>
                        <td className="p-3">
                          {product.volume_ml ? `${product.volume_ml}ml` : product.volume || '-'}
                        </td>
                        <td className="p-3">
                          <Badge variant="outline">{product.category}</Badge>
                        </td>
                        <td className="p-3">
                          <Badge variant={product.unit_type === 'un' ? 'default' : 'secondary'}>
                            {product.unit_type === 'un' ? 'Unidade' : `Pacote (${product.package_size})`}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{product.stock_quantity}</span>
                            <div className="flex-1 min-w-[60px]">
                              <div className="flex justify-between text-xs mb-1">
                                <span>Min: {product.minimum_stock}</span>
                              </div>
                              <div className="h-1.5 w-full rounded bg-muted">
                                <div
                                  className={`h-1.5 rounded transition-all ${
                                    stockRatio <= 0.5 ? 'bg-red-500' : 
                                    stockRatio <= 1 ? 'bg-orange-400' : 'bg-green-500'
                                  }`}
                                  style={{ width: `${Math.min(stockRatio, 1) * 100}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </td>
                        {userRole === 'admin' && (
                          <>
                            <td className="p-3">{product.supplier || '-'}</td>
                            <td className="p-3">
                              {product.cost_price ? `R$ ${product.cost_price.toFixed(2)}` : '-'}
                            </td>
                            <td className="p-3 font-medium">R$ {product.price.toFixed(2)}</td>
                            <td className="p-3">
                              <Badge variant={
                                unitMargin >= 30 ? 'default' :
                                unitMargin >= 15 ? 'secondary' : 'destructive'
                              }>
                                {unitMargin.toFixed(1)}%
                              </Badge>
                            </td>
                            <td className="p-3 font-medium">R$ {packagePrice.toFixed(2)}</td>
                            <td className="p-3">
                              <Badge variant={
                                packageMargin >= 30 ? 'default' :
                                packageMargin >= 15 ? 'secondary' : 'destructive'
                              }>
                                {packageMargin.toFixed(1)}%
                              </Badge>
                            </td>
                          </>
                        )}
                        {userRole !== 'admin' && (
                          <td className="p-3 font-medium">R$ {product.price.toFixed(2)}</td>
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
                          <Badge variant={
                            product.stock_quantity === 0 ? 'destructive' :
                            product.stock_quantity <= product.minimum_stock ? 'destructive' :
                            stockRatio <= 2 ? 'secondary' : 'default'
                          }>
                            {product.stock_quantity === 0 ? 'Sem Estoque' :
                             product.stock_quantity <= product.minimum_stock ? 'Estoque Baixo' :
                             stockRatio <= 2 ? 'Adequado' : 'Alto'}
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
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Edição */}
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
