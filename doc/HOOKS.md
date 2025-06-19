# Documentação dos Hooks do Sistema

## Índice
- [Hooks do CRM](#hooks-do-crm)
- [Hooks de Vendas](#hooks-de-vendas)
- [Boas Práticas](#boas-práticas)
- [Tipos Compartilhados](#tipos-compartilhados)

## Hooks do CRM

## Visão Geral

Este documento descreve os hooks disponíveis para gerenciamento de clientes e suas respectivas funcionalidades. Todos os hooks utilizam o React Query para gerenciamento de estado e cache.

> **Nota de 18/06/2025**: Foi realizada uma **refatoração completa** dos hooks `use-crm.ts` e `use-sales.ts`, eliminando código duplicado, padronizando o tratamento de erros e simplificando a API de _upsert_. Esta documentação já reflete a nova estrutura.

## Hooks Disponíveis

### `useCustomers()`

**Propósito**: Buscar todos os clientes cadastrados.

**Retorno**:
- `data`: Array de `CustomerProfile[]`
- `isLoading`: Estado de carregamento
- `error`: Erro, se houver

**Exemplo de Uso**:
```typescript
const { data: customers, isLoading, error } = useCustomers();

if (isLoading) return <div>Carregando clientes...</div>;
if (error) return <div>Erro ao carregar clientes</div>;

return (
  <ul>
    {customers?.map(customer => (
      <li key={customer.id}>{customer.name}</li>
    ))}
  </ul>
);
```

### `useCustomer(customerId: string)`

**Propósito**: Buscar um cliente específico pelo ID.

**Parâmetros**:
- `customerId`: ID do cliente

**Retorno**:
- `data`: Objeto `CustomerProfile`
- `isLoading`: Estado de carregamento
- `error`: Erro, se houver

**Exemplo de Uso**:
```typescript
const { data: customer } = useCustomer('123e4567-e89b-12d3-a456-426614174000');
```

### `useCustomerInsights(customerId: string)`

**Propósito**: Buscar insights de um cliente específico.

**Exemplo de Uso**:
```typescript
const { data: insights } = useCustomerInsights('123e4567-e89b-12d3-a456-426614174000');
```

### `useCustomerInteractions(customerId: string)`

**Propósito**: Buscar histórico de interações de um cliente.

**Exemplo de Uso**:
```typescript
const { data: interactions } = useCustomerInteractions('123e4567-e89b-12d3-a456-426614174000');
```

### `useCustomerPurchases(customerId: string)`

**Propósito**: Buscar histórico de compras de um cliente.

**Exemplo de Uso**:
```typescript
const { data: purchases } = useCustomerPurchases('123e4567-e89b-12d3-a456-426614174000');
```

### `useUpsertCustomer()`

**Propósito**: Criar ou atualizar um cliente.

**Retorno**:
- `mutate`: Função para enviar os dados
- `isPending`: Estado de carregamento
- `error`: Erro, se houver

**Exemplo de Uso**:
```typescript
const { mutate: upsertCustomer, isPending } = useUpsertCustomer();

// Criar novo cliente
const handleSubmit = (data) => {
  upsertCustomer(data, {
    onSuccess: () => {
      toast.success('Cliente salvo com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao salvar cliente');
    }
  });
};
```

### `useAddCustomerInteraction()`

**Propósito**: Registrar uma nova interação com o cliente.

**Exemplo de Uso**:
```typescript
const { mutate: addInteraction } = useAddCustomerInteraction();

const handleAddNote = (customerId: string, note: string) => {
  addInteraction({
    customer_id: customerId,
    interaction_type: 'note',
    description: note
  });
};
```

### `useCustomerStats()`

**Propósito**: Obter estatísticas gerais dos clientes.

**Retorno**:
- `data`: Objeto com estatísticas
  - `totalCustomers`: Número total de clientes
  - `vipCount`: Número de clientes VIP
  - `averageLifetimeValue`: Valor médio gasto por cliente
  - `segmentDistribution`: Distribuição por segmento

**Exemplo de Uso**:
```typescript
const { data: stats } = useCustomerStats();

// Exibindo estatísticas
return (
  <div>
    <p>Total de clientes: {stats?.totalCustomers}</p>
    <p>Clientes VIP: {stats?.vipCount}</p>
    <p>Ticket médio: {stats?.averageLifetimeValue.toLocaleString('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    })}</p>
  </div>
);
```

## Hooks de Vendas

### `useSales(params?: { status?: string, startDate?: Date, endDate?: Date })`

**Propósito**: Buscar vendas com filtros opcionais.

**Parâmetros**:
- `status`: Filtra por status da venda (opcional)
- `startDate` e `endDate`: Filtra por intervalo de datas (opcional)

**Retorno**:
- `data`: Array de `Sale[]`
- `isLoading`: Estado de carregamento
- `error`: Erro, se houver

**Exemplo de Uso**:
```typescript
const { data: sales, isLoading } = useSales({ 
  status: 'completed',
  startDate: new Date('2025-01-01'),
  endDate: new Date('2025-12-31')
});
```

### `useSale(saleId: string)`

**Propósito**: Buscar detalhes de uma venda específica.

**Exemplo de Uso**:
```typescript
const { data: sale } = useSale('123e4567-e89b-12d3-a456-426614174000');
```

### `useUpsertSale()`

> **Alteração 18/06/2025 22:38** – A lógica de ajuste de estoque agora é totalmente gerenciada por *triggers* no banco de dados. A chamada `supabase.rpc('decrement_product_stock')` foi **removida** para evitar dedução dupla. Sempre que um item é inserido em `sale_items`, um trigger (`log_sale_item_movement`) cria um registro em `inventory_movements` que, por sua vez, aciona `adjust_product_stock`, reduzindo o `products.stock_quantity`. Nenhuma ação adicional é necessária no front-end.


**Propósito**: Criar ou atualizar uma venda.

**Retorno**:
- `mutate`: Função para enviar os dados da venda
- `isPending`: Estado de carregamento
- `error`: Erro, se houver

**Exemplo de Uso**:
```typescript
const { mutate: processSale, isPending } = useUpsertSale();

const handleCheckout = (saleData) => {
  processSale(saleData, {
    onSuccess: () => {
      toast.success('Venda finalizada com sucesso!');
      resetCart();
    },
    onError: (error) => {
      toast.error(`Erro ao processar venda: ${error.message}`);
    }
  });
};
```

### `usePaymentMethods()`

**Propósito**: Buscar métodos de pagamento disponíveis.

**Exemplo de Uso**:
```typescript
const { data: paymentMethods } = usePaymentMethods();

// Exemplo de uso em um select
<select>
  {paymentMethods?.map(method => (
    <option key={method.id} value={method.id}>
      {method.name}
    </option>
  ))}
</select>
```

### `useCustomerSales(customerId: string)`

**Propósito**: Buscar histórico de vendas de um cliente específico.

**Exemplo de Uso**:
```typescript
const { data: customerSales } = useCustomerSales('123e4567-e89b-12d3-a456-426614174000');
```

### `useSalesStats()`

**Propósito**: Obter estatísticas de vendas.

**Retorno**:
- `data`: Objeto com estatísticas
  - `totalSales`: Número total de vendas
  - `totalRevenue`: Receita total
  - `averageTicket`: Ticket médio
  - `salesByPaymentMethod`: Vendas por método de pagamento
  - `salesTrend`: Tendência de vendas ao longo do tempo

**Exemplo de Uso**:
```typescript
const { data: stats } = useSalesStats();
```

## Boas Práticas

1. **Tratamento de Erros**:
   - Sempre trate os estados de `isLoading` e `error`
   - Use o componente de feedback apropriado para erros

2. **Otimizações**:
   - Utilize `keepPreviousData` para uma melhor experiência de paginação
   - Use `staleTime` para controlar o cache dos dados

3. **Atualizações Otimistas**:
   - Para melhor experiência do usuário, implemente atualizações otimistas usando `onMutate` e `onError`

4. **Dependent Queries**:
   - Use `enabled` para queries que dependem de outros dados

```typescript
// Exemplo de query dependente
const { data: customer } = useCustomer(customerId);
const { data: purchases } = useCustomerPurchases(customerId, {
  enabled: !!customerId // Só executa se customerId existir
});
```

## Tipos Compartilhados

### Tipos do CRM
```typescript
import type { 
  CustomerProfile, 
  CustomerInsight,
  CustomerInteraction,
  CustomerPurchase 
} from '@/hooks/use-crm';
```

### Tipos de Vendas
```typescript
import type {
  Sale,
  SaleItem,
  PaymentMethod,
  UpsertSaleInput,
  SalesStats
} from '@/hooks/use-sales';
```

## Atualizações

- **2025-06-18 22:38**: Removido ajuste manual de estoque no `useUpsertSale`; agora o ajuste é realizado exclusivamente por triggers.


- **2025-06-18**: Refatoração completa dos hooks `use-crm.ts` e `use-sales.ts`, correção de lógica de _upsert_ e melhorias de performance
- **2025-06-20**: Adicionada documentação dos hooks do módulo de Vendas
- **2025-06-13**: Documentação inicial dos hooks do CRM
