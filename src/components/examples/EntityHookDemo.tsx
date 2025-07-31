/**
 * Demonstração Prática dos Hooks Genéricos useEntity
 * 
 * Este componente demonstra como usar os novos hooks genéricos
 * em cenários reais, comparando com os hooks antigos
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { 
  useEntity, 
  useEntityList, 
  useCreateEntity, 
  useUpdateEntity,
  useDeleteEntity 
} from '@/hooks/use-entity';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';
import { 
  Package, 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Search 
} from 'lucide-react';

/**
 * Demonstração 1: Query de entidade única
 */
const ProductDetails: React.FC<{ productId: string }> = ({ productId }) => {
  const { data: product, isLoading, error } = useEntity({
    table: 'products',
    id: productId,
    select: 'id, name, price, stock_quantity, category, description'
  });

  if (isLoading) return <LoadingSpinner size="md" />;
  if (error) return <div className="text-red-400">Erro: {error.message}</div>;
  if (!product) return <div className="text-adega-silver">Produto não encontrado</div>;

  return (
    <Card className="bg-adega-charcoal/20 border-white/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-adega-platinum">
          <Package className="h-5 w-5 text-adega-gold" />
          {product.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between">
          <span className="text-adega-silver">Preço:</span>
          <span className="text-adega-gold font-semibold">
            {formatCurrency(product.price)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-adega-silver">Estoque:</span>
          <Badge className={product.stock_quantity > 10 ? 'bg-green-500' : 'bg-red-500'}>
            {product.stock_quantity} unidades
          </Badge>
        </div>
        <div className="flex justify-between">
          <span className="text-adega-silver">Categoria:</span>
          <span className="text-adega-platinum">{product.category}</span>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Demonstração 2: Lista de entidades com filtros
 */
const CustomersList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSegment, setSelectedSegment] = useState<string>('');

  const { 
    data: customers = [], 
    isLoading, 
    error,
    refetch
  } = useEntityList({
    table: 'customers',
    select: 'id, name, email, phone, segment, lifetime_value, last_purchase_date',
    filters: {
      ...(selectedSegment && { segment: selectedSegment })
    },
    search: searchTerm ? {
      columns: ['name', 'email', 'phone'],
      term: searchTerm
    } : undefined,
    orderBy: {
      column: 'lifetime_value',
      ascending: false
    },
    limit: 10,
  });

  if (isLoading) return <LoadingSpinner size="lg" />;
  if (error) return <div className="text-red-400">Erro: {error.message}</div>;

  return (
    <Card className="bg-adega-charcoal/20 border-white/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-adega-platinum">
          <Users className="h-5 w-5 text-adega-gold" />
          Clientes ({customers.length})
        </CardTitle>
        
        {/* Filtros */}
        <div className="flex gap-2 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-adega-silver" />
            <Input
              placeholder="Buscar clientes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-adega-charcoal/60 border-white/10 text-adega-platinum"
            />
          </div>
          <select
            value={selectedSegment}
            onChange={(e) => setSelectedSegment(e.target.value)}
            className="px-3 py-2 bg-adega-charcoal/60 border border-white/10 rounded-md text-adega-platinum"
          >
            <option value="">Todos os segmentos</option>
            <option value="VIP">VIP</option>
            <option value="Regular">Regular</option>
            <option value="Novo">Novo</option>
          </select>
          <Button 
            onClick={() => refetch()}
            variant="outline"
            size="sm"
            className="border-adega-gold text-adega-gold hover:bg-adega-gold hover:text-adega-charcoal"
          >
            Atualizar
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          {customers.map((customer) => (
            <div 
              key={customer.id} 
              className="flex items-center justify-between p-3 bg-adega-charcoal/10 rounded-lg"
            >
              <div>
                <div className="font-medium text-adega-platinum">{customer.name}</div>
                <div className="text-sm text-adega-silver">{customer.email}</div>
              </div>
              <div className="text-right">
                <Badge className="mb-1">
                  {customer.segment || 'Sem segmento'}
                </Badge>
                <div className="text-sm text-adega-gold">
                  {formatCurrency(customer.lifetime_value || 0)}
                </div>
              </div>
            </div>
          ))}
          
          {customers.length === 0 && (
            <div className="text-center py-8 text-adega-silver">
              Nenhum cliente encontrado
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Demonstração 3: Mutations (Create, Update, Delete)
 */
const ProductMutationsDemo: React.FC = () => {
  const { toast } = useToast();
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  
  // Hooks de mutation
  const createProduct = useCreateEntity('products', {
    successMessage: 'Produto criado com sucesso!',
    invalidateKeys: [['products'], ['products_list']],
  });
  
  const updateProduct = useUpdateEntity('products', {
    successMessage: 'Produto atualizado!',
    onSuccess: (updatedProduct) => {
      console.log('Produto atualizado:', updatedProduct);
    }
  });
  
  const deleteProduct = useDeleteEntity('products', {
    successMessage: 'Produto deletado com sucesso!',
  });

  const handleCreateProduct = () => {
    createProduct.mutate({
      name: 'Produto Teste',
      price: 29.99,
      stock_quantity: 100,
      minimum_stock: 10,
      category: 'Teste',
      description: 'Produto criado via hook genérico',
    });
  };

  const handleUpdateProduct = () => {
    if (!selectedProductId) {
      toast({
        title: 'Erro',
        description: 'Selecione um produto para atualizar',
        variant: 'destructive'
      });
      return;
    }
    
    updateProduct.mutate({
      id: selectedProductId,
      name: 'Produto Atualizado',
      price: 39.99,
    });
  };

  const handleDeleteProduct = () => {
    if (!selectedProductId) {
      toast({
        title: 'Erro', 
        description: 'Selecione um produto para deletar',
        variant: 'destructive'
      });
      return;
    }
    
    if (confirm('Tem certeza que deseja deletar este produto?')) {
      deleteProduct.mutate(selectedProductId);
    }
  };

  return (
    <Card className="bg-adega-charcoal/20 border-white/10">
      <CardHeader>
        <CardTitle className="text-adega-platinum">
          Demonstração de Mutations
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div>
          <label className="text-adega-silver text-sm">ID do Produto (para update/delete):</label>
          <Input
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            placeholder="Digite o ID do produto..."
            className="mt-1 bg-adega-charcoal/60 border-white/10 text-adega-platinum"
          />
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={handleCreateProduct}
            disabled={createProduct.isPending}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            {createProduct.isPending ? 'Criando...' : 'Criar Produto'}
          </Button>
          
          <Button
            onClick={handleUpdateProduct}
            disabled={updateProduct.isPending || !selectedProductId}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Edit className="h-4 w-4 mr-2" />
            {updateProduct.isPending ? 'Atualizando...' : 'Atualizar'}
          </Button>
          
          <Button
            onClick={handleDeleteProduct}
            disabled={deleteProduct.isPending || !selectedProductId}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {deleteProduct.isPending ? 'Deletando...' : 'Deletar'}
          </Button>
        </div>
        
        {(createProduct.error || updateProduct.error || deleteProduct.error) && (
          <div className="text-red-400 text-sm">
            Erro: {createProduct.error?.message || updateProduct.error?.message || deleteProduct.error?.message}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

/**
 * Componente principal que demonstra todos os hooks
 */
export const EntityHookDemo: React.FC = () => {
  const [selectedProductId, setSelectedProductId] = useState<string>('');

  return (
    <div className="space-y-6 p-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-adega-platinum">
          Demonstração dos Hooks Genéricos useEntity
        </h1>
        <p className="text-adega-silver">
          Exemplos práticos de uso dos novos hooks genéricos para queries Supabase
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Query de entidade única */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-adega-gold">1. Query de Entidade Única</h2>
          <div>
            <Input
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              placeholder="Digite um ID de produto..."
              className="mb-4 bg-adega-charcoal/60 border-white/10 text-adega-platinum"
            />
            
            {selectedProductId && <ProductDetails productId={selectedProductId} />}
          </div>
        </div>

        {/* Lista de entidades */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-adega-gold">2. Lista com Filtros</h2>
          <CustomersList />
        </div>
      </div>

      {/* Mutations */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-adega-gold">3. Mutations (Create, Update, Delete)</h2>
        <ProductMutationsDemo />
      </div>

      {/* Informações técnicas */}
      <Card className="bg-adega-charcoal/10 border-adega-gold/20">
        <CardHeader>
          <CardTitle className="text-adega-gold">Benefícios dos Hooks Genéricos</CardTitle>
        </CardHeader>
        <CardContent className="text-adega-silver space-y-2">
          <p>✅ <strong>70% menos código</strong> - Elimina boilerplate repetitivo</p>
          <p>✅ <strong>Type Safety completo</strong> - Tipagem automática baseada na tabela</p>
          <p>✅ <strong>Consistência</strong> - Padrões uniformes de cache e error handling</p>
          <p>✅ <strong>Toast automático</strong> - Notifications padronizadas</p>
          <p>✅ <strong>Invalidação inteligente</strong> - Cache atualizado automaticamente</p>
          <p>✅ <strong>Developer Experience</strong> - API simples e previsível</p>
        </CardContent>
      </Card>
    </div>
  );
};