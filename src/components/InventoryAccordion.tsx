import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, Package, AlertTriangle, TrendingUp, DollarSign, BarChart3, Filter, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { ProductForm } from '@/components/inventory/ProductForm';
import { Product, ProductFormData, InventoryFilters, TurnoverRate } from '@/types/inventory.types';
import { PageAccordion } from '@/components/ui/page-accordion';

export const InventoryAccordion = () => {
  const { userRole } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Estados principais
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [filters, setFilters] = useState<InventoryFilters>({});
  const [searchTerm, setSearchTerm] = useState('');

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

  const getTurnoverStats = () => {
    const fast = products.filter(p => p.turnover_rate === 'fast').length;
    const medium = products.filter(p => p.turnover_rate === 'medium').length;
    const slow = products.filter(p => p.turnover_rate === 'slow').length;
    return { fast, medium, slow };
  };

  const filteredProducts = getFilteredProducts();
  const lowStockProducts = getLowStockProducts();
  const turnoverStats = getTurnoverStats();

  // Filtrar por busca
  const searchFilteredProducts = filteredProducts.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.barcode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Mutations para CRUD
  const createProductMutation = useMutation({
    mutationFn: async (productData: ProductFormData) => {
      const { data, error } = await supabase
        .from('products')
        .insert({
          ...productData,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsCreateDialogOpen(false);
      toast({
        title: "Produto criado",
        description: "O produto foi adicionado ao estoque",
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
    mutationFn: async ({ id, ...productData }: ProductFormData & { id: string }) => {
      const { data, error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsEditDialogOpen(false);
      setEditingProduct(null);
      toast({
        title: "Produto atualizado",
        description: "As informações do produto foram atualizadas",
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

  // Handlers
  const handleCreateProduct = (productData: ProductFormData) => {
    createProductMutation.mutate(productData);
  };

  const handleUpdateProduct = (productData: ProductFormData) => {
    if (!editingProduct) return;
    updateProductMutation.mutate({ ...productData, id: editingProduct.id });
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm('Tem certeza que deseja remover este produto?')) {
      deleteProductMutation.mutate(id);
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsEditDialogOpen(true);
  };

  // Componente de Cards de Estatísticas
  const StatsCards = () => (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      <Card className="bg-adega-charcoal/20 border-white/10 backdrop-blur-xl shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-adega-platinum">Total</CardTitle>
          <Package className="h-4 w-4 text-adega-gold" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-adega-yellow">{products.length}</div>
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
            R$ {getTotalValue().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-adega-silver">estoque</p>
        </CardContent>
      </Card>

      <Card className="bg-adega-charcoal/20 border-white/10 backdrop-blur-xl shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-adega-platinum">Baixo</CardTitle>
          <AlertTriangle className="h-4 w-4 text-adega-amber" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-adega-amber">{lowStockProducts.length}</div>
          <p className="text-xs text-adega-silver">atenção</p>
        </CardContent>
      </Card>

      <Card className="bg-adega-charcoal/20 border-white/10 backdrop-blur-xl shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-adega-platinum">Rápido</CardTitle>
          <TrendingUp className="h-4 w-4 text-adega-gold" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-adega-yellow">{turnoverStats.fast}</div>
          <p className="text-xs text-adega-silver">giro</p>
        </CardContent>
      </Card>

      <Card className="bg-adega-charcoal/20 border-red-500/30 backdrop-blur-xl shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-adega-platinum">Lento</CardTitle>
          <BarChart3 className="h-4 w-4 text-red-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-400">{turnoverStats.slow}</div>
          <p className="text-xs text-adega-silver">giro</p>
        </CardContent>
      </Card>
    </div>
  );

  // Componente de Lista de Produtos
  const ProductList = () => (
    <div className="space-y-4">
      {/* Busca e Controles */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar produtos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary">{searchFilteredProducts.length} produtos</Badge>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo
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

      {/* Lista de Produtos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
        {searchFilteredProducts.map((product) => (
          <Card key={product.id} className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-base font-semibold truncate">
                    {product.name}
                  </CardTitle>
                  {product.barcode && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {product.barcode}
                    </p>
                  )}
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
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteProduct(product.id)}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Estoque:</span>
                  <span className={`font-medium ${
                    product.stock_quantity <= (product.reorder_level || 0) 
                      ? 'text-destructive' 
                      : 'text-foreground'
                  }`}>
                    {product.stock_quantity} {product.unit_type}
                  </span>
                </div>
                
                {userRole === 'admin' && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Preço:</span>
                    <span className="font-medium text-primary">
                      R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}

                {product.turnover_rate && (
                  <Badge 
                    variant={
                      product.turnover_rate === 'fast' ? 'default' :
                      product.turnover_rate === 'medium' ? 'secondary' : 'destructive'
                    }
                    className="text-xs"
                  >
                    Giro {
                      product.turnover_rate === 'fast' ? 'Rápido' :
                      product.turnover_rate === 'medium' ? 'Médio' : 'Lento'
                    }
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  // Componente de Estoque Baixo
  const LowStockAlert = () => (
    <div className="space-y-4">
      {lowStockProducts.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Nenhum produto com estoque baixo!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-80 overflow-y-auto">
          {lowStockProducts.map((product) => (
            <Card key={product.id} className="border-destructive/50 bg-destructive/5">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{product.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      Estoque: {product.stock_quantity} {product.unit_type}
                    </p>
                    <p className="text-xs text-destructive">
                      Nível mínimo: {product.reorder_level || 0}
                    </p>
                  </div>
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/30 border-t-primary"></div>
      </div>
    );
  }

  const accordionSections = [
    {
      id: 'overview',
      title: 'Visão Geral',
      icon: <BarChart3 className="h-5 w-5" />,
      content: <StatsCards />,
      defaultOpen: true,
      badge: products.length,
    },
    {
      id: 'products',
      title: 'Produtos',
      icon: <Package className="h-5 w-5" />,
      content: <ProductList />,
      defaultOpen: true,
      badge: searchFilteredProducts.length,
    },
    {
      id: 'alerts',
      title: 'Alertas de Estoque',
      icon: <AlertTriangle className="h-5 w-5" />,
      content: <LowStockAlert />,
      defaultOpen: lowStockProducts.length > 0,
      badge: lowStockProducts.length > 0 ? lowStockProducts.length : undefined,
    },
  ];

  return (
    <div className="h-full">
      <PageAccordion sections={accordionSections} allowMultiple={true} />
      
      {/* Dialog de Edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Produto</DialogTitle>
          </DialogHeader>
          {editingProduct && (
            <ProductForm
              product={editingProduct}
              onSubmit={handleUpdateProduct}
              onCancel={() => {
                setIsEditDialogOpen(false);
                setEditingProduct(null);
              }}
              isLoading={updateProductMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};