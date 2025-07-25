# Arquitetura do Sistema - Adega Manager

## Visão Geral

O Adega Manager é uma aplicação web moderna desenvolvida para gerenciamento completo de adegas, oferecendo funcionalidades como controle de estoque, vendas, clientes (CRM), delivery e relatórios. A aplicação foi construída utilizando tecnologias modernas e seguindo as melhores práticas de desenvolvimento.

## Stack Tecnológica

### Frontend
- **React 18**: Framework principal para construção da interface
- **TypeScript**: Linguagem principal, oferecendo tipagem estática
- **Vite**: Build tool e dev server (porta 8080)
- **TailwindCSS**: Framework CSS para estilização
- **Shadcn/ui**: Biblioteca de componentes baseada em Radix UI
- **React Router Dom**: Gerenciamento de rotas
- **React Query**: Gerenciamento de estado e cache de dados
- **React Hook Form**: Gerenciamento de formulários
- **Zod**: Validação de schemas
- **Recharts**: Biblioteca para criação de gráficos

### Backend
- **Supabase**: Plataforma de backend como serviço (BaaS)
  - Banco de dados PostgreSQL
  - Autenticação e autorização
  - Armazenamento de arquivos
  - Funções serverless (Edge Functions)
  - Real-time subscriptions
  - Row Level Security (RLS)

## Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── ui/             # Componentes Shadcn/ui e customizações
│   ├── reports/        # Componentes específicos de relatórios
│   ├── sales/          # Componentes de vendas
│   └── clients/        # Componentes de gestão de clientes
├── contexts/           # Contextos React (Auth, Notifications)
├── hooks/              # Hooks customizados
│   └── reports/        # Hooks específicos de relatórios
├── integrations/       # Integrações com serviços externos
│   └── supabase/       # Cliente Supabase e tipos
├── lib/                # Utilitários e configurações
├── pages/              # Páginas da aplicação
└── types/              # Definições de tipos TypeScript
```

## Banco de Dados

### Estrutura Geral

O banco de dados PostgreSQL no Supabase é composto por **28 tabelas principais** organizadas em módulos funcionais:

#### Autenticação e Usuários
- **`users`** - Espelho de auth.users para lógica de negócio
- **`profiles`** - Perfis estendidos de usuários
- **`user_roles`** - Gerenciamento de papéis (admin, employee, delivery)

#### Produtos e Estoque
- **`products`** - Catálogo de produtos com campos específicos para vinhos
- **`categories`** - Categorias de produtos
- **`suppliers`** - Fornecedores
- **`inventory_movements`** - Histórico de movimentações de estoque

#### CRM (Customer Relationship Management)
- **`customers`** - Perfis completos de clientes
- **`customer_insights`** - Insights automáticos baseados em IA
- **`customer_interactions`** - Registro de interações
- **`customer_history`** - Histórico de eventos

#### Vendas
- **`sales`** - Transações de vendas
- **`sale_items`** - Itens de cada venda
- **`payment_methods`** - Métodos de pagamento disponíveis

#### Sistema
- **`audit_logs`** - Logs de auditoria
- **`automation_logs`** - Logs de automação
- **`settings`** - Configurações do sistema

### Principais Relacionamentos

1. **Users → Sales**: One-to-many (usuários criam vendas)
2. **Customers → Sales**: One-to-many (clientes têm múltiplas vendas)
3. **Sales → Sale Items**: One-to-many (vendas contêm múltiplos itens)
4. **Products → Sale Items**: One-to-many (produtos são vendidos múltiplas vezes)
5. **Products → Inventory Movements**: One-to-many (produtos têm movimentações)
6. **Customers → Customer Interactions**: One-to-many (clientes têm interações)

### Funções RPC (Remote Procedure Calls)

O sistema utiliza funções SQL armazenadas para operações complexas:

```sql
-- Exemplos de funções principais
get_current_user_role() -- Retorna papel do usuário atual
has_role(_user_id, _role) -- Verifica se usuário tem papel específico
recalc_customer_insights(p_customer_id) -- Recalcula insights do cliente
delete_sale_with_items(p_sale_id) -- Deleta venda com itens
get_sales_trends(start_date, end_date, period) -- Análise de tendências
get_top_products(start_date, end_date, limit_count) -- Produtos mais vendidos
```

## Segurança

### Row Level Security (RLS)

Implementado em todas as tabelas sensíveis:

```sql
-- Exemplo: Vendedores veem apenas suas vendas
CREATE POLICY "Sellers can view their sales" ON sales
FOR SELECT USING (
  auth.role() IN ('admin', 'employee', 'seller')
  AND seller_id = auth.uid()
);

-- Exemplo: Controle de produtos
CREATE POLICY "Employees can manage products" ON products
FOR ALL USING (
  auth.role() IN ('admin', 'employee', 'seller')
);
```

### Níveis de Acesso

#### Admin
- Acesso total ao sistema
- Gerenciar usuários
- Configurar sistema
- Visualizar todos os relatórios

#### Employee (Funcionário)
- Operações do dia a dia
- Realizar vendas
- Gerenciar produtos e estoque
- Relatórios básicos

#### Delivery (Entregador)
- Apenas funcionalidades de entrega
- Visualizar entregas designadas
- Atualizar status de entregas

### Validações e Sanitização

- Validação em múltiplas camadas (frontend, backend, banco)
- Sanitização de entradas do usuário
- Uso de prepared statements
- Criptografia de dados sensíveis

## Componentes Principais

### Layout e Navegação

#### MainLayout
```tsx
interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="pl-64 p-8">
        {children}
      </main>
    </div>
  );
};
```

#### Sidebar
- Navegação principal com controle de permissões
- Filtragem de itens baseada no papel do usuário
- Indicadores visuais de notificações

### Formulários

#### Padrão de Formulário
- React Hook Form + Zod para validação
- Componentes Shadcn/ui reutilizáveis
- Tratamento de erros padronizado

```tsx
const form = useForm<FormData>({
  resolver: zodResolver(schema),
  defaultValues: initialData
});
```

### Tabelas de Dados

#### DataTable
Componente genérico para exibição de dados:
- Ordenação
- Filtros
- Paginação
- Seleção de linhas
- Exportação

### Gráficos e Visualizações

#### Bibliotecas Utilizadas
- **Recharts**: Gráficos de linha, área, barras e pizza
- **Shadcn/ui Charts**: Componentes estilizados
- **Lucide React**: Ícones

#### Padrões de Implementação
- Responsividade
- Tooltips informativos
- Cores consistentes com o design system
- Estados de carregamento

## Gerenciamento de Estado

### Estratégias Utilizadas

1. **React Query** para estado do servidor
   - Cache inteligente
   - Sincronização automática
   - Estados de loading, error, success

2. **Context API** para estado global
   - Autenticação
   - Notificações
   - Configurações

3. **useState** para estado local
   - UI específica de componentes
   - Formulários simples

### Padrões de Hook

```tsx
// Hook personalizado para dados do servidor
const useCustomers = () => {
  return useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('*');
      if (error) throw error;
      return data;
    }
  });
};

// Hook para mutações
const useCreateCustomer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (customer: CreateCustomerInput) => {
      const { data, error } = await supabase
        .from('customers')
        .insert(customer);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    }
  });
};
```

## Real-time e Notificações

### Supabase Real-time

```tsx
useEffect(() => {
  const channel = supabase
    .channel('notifications')
    .on('postgres_changes', { 
      event: 'INSERT', 
      schema: 'public', 
      table: 'notifications' 
    }, (payload) => {
      setNotifications(prev => [...prev, payload.new]);
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, []);
```

### Sistema de Notificações

#### NotificationBell
- Ícone na navbar com contador
- Popover com notificações recentes
- Real-time via Supabase subscriptions

#### Tipos de Notificação
- Estoque baixo
- Vendas importantes
- Entregas pendentes
- Alertas do sistema

## Performance e Otimização

### Estratégias Frontend

1. **Lazy Loading**
   - Carregamento de rotas sob demanda
   - Componentes pesados carregados dinamicamente

2. **Memoização**
   - React.memo para componentes
   - useMemo para cálculos pesados
   - useCallback para funções

3. **Otimização de Queries**
   - Seleção apenas de campos necessários
   - Paginação para listas longas
   - Cache inteligente com React Query

### Estratégias Backend

1. **Indexação**
   - Índices em colunas frequentemente consultadas
   - Índices compostos para queries complexas

2. **Funções SQL**
   - Processamento no banco de dados
   - Redução de round-trips

3. **RLS Otimizado**
   - Políticas eficientes
   - Uso de funções seguras

## Monitoramento e Logs

### Sistema de Auditoria

```sql
-- Trigger para log de auditoria
CREATE TRIGGER audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON sales
FOR EACH ROW
EXECUTE FUNCTION log_audit_event();
```

### Métricas Coletadas

- Tempo de resposta de queries
- Uso de recursos
- Erros e exceções
- Ações de usuários

## Testes

### Estratégias de Teste

1. **Testes Unitários**
   - Hooks customizados
   - Funções utilitárias
   - Componentes isolados

2. **Testes de Integração**
   - Fluxos completos
   - Integração com Supabase
   - APIs

3. **Testes E2E**
   - Cypress para fluxos críticos
   - Cenários de usuário real

### Ferramentas

- **Vitest**: Testes unitários
- **React Testing Library**: Testes de componentes
- **Cypress**: Testes end-to-end
- **Mock Service Worker**: Mocking de APIs

## Desenvolvimento Local

### Configuração do Ambiente

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build
```

### Variáveis de Ambiente

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon
SUPABASE_SERVICE_KEY=sua-chave-service
```

## Deployment

### Build e Deploy

```bash
# Build otimizado
npm run build

# Preview do build
npm run preview

# Lint do código
npm run lint
```

### Ambientes

- **Development**: Desenvolvimento local
- **Staging**: Testes de homologação
- **Production**: Ambiente de produção

## Troubleshooting

### Problemas Comuns

1. **Erro de CORS**
   - Verificar configurações do Supabase
   - Confirmar origens permitidas

2. **Problemas de Performance**
   - Usar React DevTools para profiling
   - Verificar re-renders desnecessários
   - Otimizar queries do banco

3. **Erros de Autenticação**
   - Verificar tokens JWT
   - Confirmar políticas RLS
   - Validar permissões

### Debugging

```tsx
// Debug de queries React Query
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

function App() {
  return (
    <>
      <MyApp />
      <ReactQueryDevtools initialIsOpen={false} />
    </>
  );
}
```

## Próximos Passos

### Melhorias Planejadas

1. **Performance**
   - Implementar SSR
   - Otimizar bundle size
   - Melhorar estratégia de cache

2. **Funcionalidades**
   - App mobile
   - Integração com sistemas externos
   - Análise preditiva

3. **Infraestrutura**
   - CI/CD automatizado
   - Monitoramento avançado
   - Backup automático

### Roadmap Técnico

- **Q1 2025**: Otimizações de performance
- **Q2 2025**: Funcionalidades mobile
- **Q3 2025**: Integrações externas
- **Q4 2025**: IA e análise preditiva