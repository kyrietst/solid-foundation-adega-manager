/* eslint-disable jsx-a11y/label-has-associated-control, react-refresh/only-export-components */
/**
 * useSupabaseQuery Usage Examples
 * Demonstrates Context7 patterns for Supabase integration with TanStack Query
 * Shows best practices for type-safe database operations
 */

import React from 'react';
import { Button } from '@/shared/ui/primitives/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { LoadingSpinner } from '@/shared/ui/composite/LoadingSpinner';
import { EmptyState } from '@/shared/ui/composite/EmptyState';
import {
  useSupabaseQuery,
  useSupabaseMutation,
  useSupabaseCRUD,
  useProductsQuery,
  SupabaseQueryError
} from './useSupabaseQuery';
import { supabase } from '@/core/api/supabase/client';

// Example 1: Basic useSupabaseQuery usage
const BasicQueryExample = () => {
  const { data, isLoading, isError, error } = useSupabaseQuery({
    queryKey: ['products', 'active'],
    queryFn: () => supabase.from('products').select('*').eq('is_active', true)
  });

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <div>Erro: {error?.message}</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {data.map((product: any) => (
        <Card key={product.id}>
          <CardHeader>
            <CardTitle>{product.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Preço: R$ {product.price}</p>
            <p>Estoque: {product.stock_quantity}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// Example 2: Advanced query with select transformation
const ProductAnalyticsExample = () => {
  const { data, isLoading, error } = useSupabaseQuery({
    queryKey: ['products', 'analytics'],
    queryFn: () => supabase
      .from('products')
      .select('name, price, stock_quantity, category')
      .gt('stock_quantity', 0),
    select: (products) => ({
      totalProducts: products.length,
      averagePrice: products.reduce((sum, p) => sum + p.price, 0) / products.length,
      categories: [...new Set(products.map(p => p.category))],
      lowStockCount: products.filter(p => p.stock_quantity < 10).length
    }),
    staleTime: 10 * 60 * 1000 // 10 minutes
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div>Erro: {error.message}</div>;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold">Total Produtos</h3>
          <p className="text-2xl">{data?.totalProducts}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold">Preço Médio</h3>
          <p className="text-2xl">R$ {data?.averagePrice?.toFixed(2)}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold">Categorias</h3>
          <p className="text-2xl">{data?.categories?.length}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold">Estoque Baixo</h3>
          <p className="text-2xl">{data?.lowStockCount}</p>
        </CardContent>
      </Card>
    </div>
  );
};

// Example 3: Mutation with optimistic updates
const ProductCreateExample = () => {
  const [newProductName, setNewProductName] = React.useState('');

  const createProduct = useSupabaseMutation({
    mutationFn: (productData: any) =>
      supabase.from('products').insert([productData]).select().single(),
    onSuccess: (data) => {
      console.log('Produto criado:', data);
      setNewProductName('');
    },
    onError: (error) => {
      console.error('Erro ao criar produto:', error);
    },
    invalidateQueries: [
      ['products', 'active'],
      ['products', 'analytics']
    ]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProductName.trim()) {
      createProduct.mutate({
        name: newProductName,
        price: 0,
        stock_quantity: 0,
        is_active: true,
        category: 'outros'
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Criar Novo Produto</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={newProductName}
            onChange={(e) => setNewProductName(e.target.value)}
            placeholder="Nome do produto"
            className="w-full p-2 border rounded"
            disabled={createProduct.isLoading}
          />
          <Button
            type="submit"
            disabled={createProduct.isLoading || !newProductName.trim()}
          >
            {createProduct.isLoading ? 'Criando...' : 'Criar Produto'}
          </Button>
          {createProduct.error && (
            <p className="text-red-500 text-sm">
              Erro: {createProduct.error.message}
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

// Example 4: Using the CRUD hook
const ProductCRUDExample = () => {
  const productsQuery = useProductsQuery();
  const { data: products, isLoading } = productsQuery.useList({ is_active: true });
  const createProduct = productsQuery.useCreate();
  const deleteProduct = productsQuery.useDelete(''); // ID will be passed when called

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja deletar este produto?')) {
      deleteProduct.mutate();
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Produtos Ativos</h2>
        <Button onClick={() => {
          createProduct.mutate({
            name: `Produto ${Date.now()}`,
            price: 10,
            stock_quantity: 1,
            is_active: true,
            category: 'teste'
          });
        }}>
          Adicionar Produto Teste
        </Button>
      </div>

      {products.length === 0 ? (
        <EmptyState
          title="Nenhum produto encontrado"
          description="Adicione produtos para começar"
        />
      ) : (
        <div className="grid gap-4">
          {products.map((product: any) => (
            <Card key={product.id}>
              <CardContent className="p-4 flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">{product.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    R$ {product.price} • Estoque: {product.stock_quantity}
                  </p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(product.id)}
                >
                  Deletar
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

// Example 5: Error handling with result patterns
const ErrorHandlingExample = () => {
  const { result, refetch } = useSupabaseQuery({
    queryKey: ['products', 'with-error'],
    queryFn: () => supabase.from('non_existent_table').select('*'),
    retry: false
  });

  // Context7 Pattern: Using discriminated unions for type-safe error handling
  if (result.success) {
    return (
      <div>
        <h3>Dados carregados com sucesso!</h3>
        <pre>{JSON.stringify(result.data, null, 2)}</pre>
      </div>
    );
  }

  if (result.error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-red-600">Erro na Consulta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p><strong>Mensagem:</strong> {result.error.message}</p>
            {result.error.code && <p><strong>Código:</strong> {result.error.code}</p>}
            {result.error.details && <p><strong>Detalhes:</strong> {result.error.details}</p>}
            {result.error.hint && <p><strong>Dica:</strong> {result.error.hint}</p>}
          </div>
          <Button onClick={() => refetch()}>
            Tentar Novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  return <LoadingSpinner />;
};

// Example 6: Complex filtering with custom logic
const ProductFilteringExample = () => {
  const [categoryFilter, setCategoryFilter] = React.useState<string>('all');
  const [priceRange, setPriceRange] = React.useState<[number, number]>([0, 1000]);

  const { data, isLoading } = useSupabaseQuery({
    queryKey: ['products', 'filtered', categoryFilter, priceRange],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .gte('price', priceRange[0])
        .lte('price', priceRange[1]);

      if (categoryFilter !== 'all') {
        query = query.eq('category', categoryFilter);
      }

      return query;
    },
    enabled: categoryFilter !== '' && priceRange[0] <= priceRange[1]
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Categoria</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="all">Todas</option>
                <option value="vinhos_tintos">Vinhos Tintos</option>
                <option value="vinhos_brancos">Vinhos Brancos</option>
                <option value="espumantes">Espumantes</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Faixa de Preço: R$ {priceRange[0]} - R$ {priceRange[1]}
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={priceRange[0]}
                  onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                  className="w-full p-2 border rounded"
                  placeholder="Min"
                />
                <input
                  type="number"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                  className="w-full p-2 border rounded"
                  placeholder="Max"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="text-sm text-muted-foreground">
        Encontrados: {data.length} produtos
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map((product: any) => (
          <Card key={product.id}>
            <CardHeader>
              <CardTitle>{product.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>R$ {product.price}</p>
              <p className="text-sm text-muted-foreground">{product.category}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Context7 Pattern: Usage patterns documentation
export const SUPABASE_QUERY_PATTERNS = {
  // Basic query usage
  basicQuery: `
    const { data, isLoading, error } = useSupabaseQuery({
      queryKey: ['table', 'filter'],
      queryFn: () => supabase.from('table').select('*')
    });
  `,

  // Mutation with invalidation
  mutation: `
    const create = useSupabaseMutation({
      mutationFn: (data) => supabase.from('table').insert([data]).select().single(),
      invalidateQueries: [['table', 'list']],
      onSuccess: (data) => console.log('Created:', data)
    });
  `,

  // CRUD operations
  crud: `
    const crud = useSupabaseCRUD('products');
    const { data } = crud.useList({ is_active: true });
    const create = crud.useCreate();
    const update = crud.useUpdate(id);
  `,

  // Error handling with result patterns
  errorHandling: `
    const { result } = useSupabaseQuery(config);

    if (result.success) {
      return <div>{result.data}</div>;
    }

    if (result.error) {
      return <ErrorComponent error={result.error} />;
    }
  `
};

export {
  BasicQueryExample,
  ProductAnalyticsExample,
  ProductCreateExample,
  ProductCRUDExample,
  ErrorHandlingExample,
  ProductFilteringExample
};