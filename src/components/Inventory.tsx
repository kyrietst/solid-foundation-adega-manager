
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, Package, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const Inventory = () => {
  const { userRole } = useAuth();
  // Lista de produtos vinda do Supabase
  const queryClient = useQueryClient();
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products', 'inventory'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name', { ascending: true });
      if (error) throw error;
      return data as any[];
    },
  });

  // Estado local para o formulário

  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    stock: '',
    category: '',
    minStock: ''
  });

  const [editingProduct, setEditingProduct] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const categories = ['Vinhos', 'Espumantes', 'Cervejas', 'Destilados', 'Licores'];

  const addProduct = async () => {
    if (!newProduct.name || !newProduct.price || !newProduct.stock || !newProduct.category) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    const product = {
      id: Date.now(),
      name: newProduct.name,
      price: parseFloat(newProduct.price),
      stock: parseInt(newProduct.stock),
      category: newProduct.category,
      minStock: parseInt(newProduct.minStock) || 5
    };

    await supabase.from('products').insert({
      name: newProduct.name,
      price: parseFloat(newProduct.price),
      stock_quantity: parseInt(newProduct.stock),
      category: newProduct.category,
      // definindo estoque minimo
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      description: null,
    });
    queryClient.invalidateQueries({ queryKey: ['products'] });
    setNewProduct({ name: '', price: '', stock: '', category: '', minStock: '' });
    setIsDialogOpen(false);

    toast({
      title: "Produto adicionado!",
      description: `${product.name} foi adicionado ao estoque`,
    });
  };

  const updateProduct = async () => {
    if (!editingProduct.name || !editingProduct.price || !editingProduct.stock || !editingProduct.category) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    // Verifica se o funcionário está tentando alterar o preço
    if (userRole === 'employee') {
      const originalProduct = products.find(p => p.id === editingProduct.id);
      if (originalProduct && originalProduct.price !== parseFloat(editingProduct.price)) {
        toast({
          title: "Acesso negado",
          description: "Funcionários não podem alterar preços",
          variant: "destructive",
        });
        return;
      }

      // Verifica o limite de ajuste de quantidade
      const quantityDiff = Math.abs(parseInt(editingProduct.stock) - (originalProduct?.stock_quantity ?? 0));
      if (quantityDiff > 50) {
        toast({
          title: "Limite excedido",
          description: "Funcionários podem ajustar no máximo 50 unidades por vez",
          variant: "destructive",
        });
        return;
      }
    }

    await supabase.from('products').update({
      name: editingProduct.name,
      price: parseFloat(editingProduct.price),
      stock_quantity: parseInt(editingProduct.stock),
      category: editingProduct.category,
      updated_at: new Date().toISOString(),
    }).eq('id', editingProduct.id);
    queryClient.invalidateQueries({ queryKey: ['products'] });
    setEditingProduct(null);

    toast({
      title: "Produto atualizado!",
      description: "As informações foram salvas com sucesso",
    });
  };

  const deleteProduct = async (id: string) => {
    if (userRole === 'employee') {
      toast({
        title: "Acesso negado",
        description: "Apenas administradores podem excluir produtos",
        variant: "destructive",
      });
      return;
    }

    // tentativa de exclusão
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      toast({ title: 'Erro ao excluir', description: error.message, variant: 'destructive' });
      return;
    }
    queryClient.invalidateQueries({ queryKey: ['products'] });
    toast({
      title: "Produto removido",
      description: "O produto foi removido do estoque",
    });
  };

  const getLowStockProducts = () => {
    return products.filter((product: any) => product.stock_quantity <= (product.minStock || 5));
  };

  const getTotalValue = () => {
    return products.reduce((total: number, product: any) => total + (product.price * product.stock_quantity), 0);
  };

  return (
    <div className="space-y-6">
      {/* Alertas de Estoque Baixo */}
      {getLowStockProducts().length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center text-orange-700">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Alertas de Estoque
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {getLowStockProducts().map(product => (
                <div key={product.id} className="flex justify-between items-center p-2 bg-white rounded border">
                  <span className="font-medium">{product.name}</span>
                  <span className="text-orange-600">Apenas {product.stock_quantity} unidades</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resumo do Estoque */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total do Estoque</CardTitle>
            <Package className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {getTotalValue().toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produtos com Estoque Baixo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getLowStockProducts().length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Produtos */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Produtos em Estoque</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Produto
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Novo Produto</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome do Produto</Label>
                  <Input
                    id="name"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                    placeholder="Nome do produto"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Preço</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="stock">Quantidade</Label>
                    <Input
                      id="stock"
                      type="number"
                      value={newProduct.stock}
                      onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Categoria</Label>
                    <Select value={newProduct.category} onValueChange={(value) => setNewProduct({...newProduct, category: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="minStock">Estoque Mínimo</Label>
                    <Input
                      id="minStock"
                      type="number"
                      value={newProduct.minStock}
                      onChange={(e) => setNewProduct({...newProduct, minStock: e.target.value})}
                      placeholder="5"
                    />
                  </div>
                </div>
                <Button onClick={addProduct} className="w-full">
                  Adicionar Produto
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Produto</th>
                  <th className="text-left p-2">Categoria</th>
                  <th className="text-left p-2">Preço</th>
                  <th className="text-left p-2">Estoque</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Ações</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product: any) => (
                  <tr key={product.id} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-medium">{product.name}</td>
                    <td className="p-2">{product.category}</td>
                    <td className="p-2">R$ {product.price.toFixed(2)}</td>
                    <td className="p-2">{product.stock_quantity} unidades</td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        product.stock_quantity <= (product.minStock || 5) 
                          ? 'bg-red-100 text-red-700' 
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {product.stock_quantity <= (product.minStock || 5) ? 'Estoque Baixo' : 'Normal'}
                      </span>
                    </td>
                    <td className="p-2">
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setEditingProduct(product)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => deleteProduct(product.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Edição */}
      {editingProduct && (
        <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Produto</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Nome do Produto</Label>
                <Input
                  id="edit-name"
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-price">Preço</Label>
                  <Input
                    id="edit-price"
                    type="number"
                    step="0.01"
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({...editingProduct, price: e.target.value})}
                    disabled={userRole === 'employee'}
                  />
                  {userRole === 'employee' && (
                    <p className="text-xs text-orange-600 mt-1">
                      Apenas administradores podem alterar preços
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="edit-stock">Quantidade</Label>
                  <Input
                    id="edit-stock"
                    type="number"
                    value={editingProduct.stock}
                    onChange={(e) => setEditingProduct({...editingProduct, stock: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-category">Categoria</Label>
                <Select value={editingProduct.category} onValueChange={(value) => setEditingProduct({...editingProduct, category: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={updateProduct} className="w-full">
                Salvar Alterações
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
