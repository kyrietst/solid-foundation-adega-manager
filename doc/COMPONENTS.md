# Documentação de Componentes

## Visão Geral

O Adega Manager utiliza uma arquitetura baseada em componentes React com TypeScript, seguindo os princípios de componentização, reusabilidade e separação de responsabilidades.

## Estrutura de Diretórios

```
src/
├── components/
│   ├── ui/           # Componentes base do shadcn/ui
│   ├── layout/       # Componentes de layout
│   ├── forms/        # Componentes de formulário
│   ├── data/         # Componentes de exibição de dados
│   └── shared/       # Componentes compartilhados
├── pages/            # Páginas da aplicação
└── contexts/         # Contextos React
```

## Componentes Principais

### Layout

#### MainLayout
```tsx
// Componente base para o layout principal da aplicação
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
```tsx
// Barra lateral de navegação
const Sidebar: React.FC = () => {
  return (
    <nav className="fixed left-0 top-0 h-screen w-64 bg-primary text-primary-foreground">
      <div className="p-4">
        <Logo />
        <NavigationMenu />
        <UserInfo />
      </div>
    </nav>
  );
};
```

### Formulários

#### ProductForm
```tsx
// Formulário de produto com validação
interface ProductFormProps {
  initialData?: Product;
  onSubmit: (data: ProductFormData) => Promise<void>;
}

const ProductForm: React.FC<ProductFormProps> = ({ initialData, onSubmit }) => {
  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: initialData
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* Campos do formulário */}
      </form>
    </Form>
  );
};
```

#### SaleForm
```tsx
// Formulário de venda com cálculos automáticos
interface SaleFormProps {
  onSubmit: (data: SaleFormData) => Promise<void>;
}

const SaleForm: React.FC<SaleFormProps> = ({ onSubmit }) => {
  const form = useForm<SaleFormData>({
    resolver: zodResolver(saleSchema)
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* Campos do formulário */}
      </form>
    </Form>
  );
};
```

### Tabelas de Dados

#### DataTable
```tsx
// Componente base para tabelas de dados
interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
}

const DataTable = <T,>({ columns, data, onRowClick }: DataTableProps<T>) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {/* Cabeçalho */}
        </TableHeader>
        <TableBody>
          {/* Linhas */}
        </TableBody>
      </Table>
    </div>
  );
};
```

### Cards e Dashboards

#### StatsCard
```tsx
// Card para exibição de estatísticas
interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: number;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon: Icon, trend }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center">
          <Icon className="h-8 w-8 text-muted-foreground" />
          <div className="ml-4">
            <div className="text-2xl font-bold">{value}</div>
            {trend && (
              <div className={cn(
                "text-sm",
                trend > 0 ? "text-green-500" : "text-red-500"
              )}>
                {trend > 0 ? "+" : ""}{trend}%
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
```

## Hooks Customizados

### useAuth
```tsx
// Hook para gerenciamento de autenticação
const useAuth = () => {
  const supabase = useSupabaseClient();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Lógica de autenticação
  }, []);

  return {
    user,
    signIn: async (email: string, password: string) => {
      // Lógica de login
    },
    signOut: async () => {
      // Lógica de logout
    }
  };
};
```

### useProducts
```tsx
// Hook para gerenciamento de produtos
const useProducts = () => {
  const queryClient = useQueryClient();
  const supabase = useSupabaseClient();

  return {
    products: useQuery({
      queryKey: ['products'],
      queryFn: async () => {
        // Buscar produtos
      }
    }),
    addProduct: useMutation({
      mutationFn: async (data: ProductFormData) => {
        // Adicionar produto
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['products'] });
      }
    })
  };
};
```

## Contextos

### ThemeContext
```tsx
// Contexto para gerenciamento de tema
const ThemeContext = createContext<{
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}>({
  theme: 'light',
  setTheme: () => {}
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
```

## Boas Práticas

### 1. Componentização
- Mantenha componentes pequenos e focados
- Use composição ao invés de herança
- Extraia lógica complexa para hooks
- Documente props com TypeScript

### 2. Performance
- Use memo para componentes pesados
- Implemente virtualização para listas longas
- Otimize re-renders com useMemo e useCallback
- Lazy load componentes quando apropriado

### 3. Acessibilidade
- Use elementos semânticos
- Implemente navegação por teclado
- Forneça textos alternativos
- Mantenha contraste adequado

### 4. Testes
- Escreva testes unitários
- Teste interações do usuário
- Verifique casos de erro
- Mantenha cobertura adequada

### 5. Estilização
- Use Tailwind de forma consistente
- Mantenha temas configuráveis
- Implemente dark mode
- Garanta responsividade

## Exemplos de Uso

### 1. Tabela de Produtos
```tsx
// pages/products/index.tsx
const ProductsPage: React.FC = () => {
  const { products } = useProducts();

  return (
    <MainLayout>
      <div className="space-y-4">
        <div className="flex justify-between">
          <h1 className="text-2xl font-bold">Produtos</h1>
          <Button asChild>
            <Link to="/products/new">Novo Produto</Link>
          </Button>
        </div>
        
        <DataTable
          columns={productColumns}
          data={products.data ?? []}
          onRowClick={(product) => navigate(`/products/${product.id}`)}
        />
      </div>
    </MainLayout>
  );
};
```

### 2. Dashboard
```tsx
// pages/dashboard/index.tsx
const DashboardPage: React.FC = () => {
  const { stats } = useStats();

  return (
    <MainLayout>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Vendas Hoje"
          value={stats.todaySales}
          icon={DollarSign}
          trend={stats.salesTrend}
        />
        {/* Mais cards */}
      </div>
      
      <div className="mt-8">
        <SalesChart data={stats.salesData} />
      </div>
    </MainLayout>
  );
};
```

## Troubleshooting

### Problemas Comuns

1. **Re-renders Excessivos**
   - Use React DevTools para profiling
   - Verifique memoização
   - Otimize dependências de effects

2. **Memory Leaks**
   - Limpe effects corretamente
   - Cancele requisições pendentes
   - Remova event listeners

3. **Performance**
   - Implemente code splitting
   - Use lazy loading
   - Otimize imagens

## Contribuindo

1. **Novos Componentes**
   - Siga o padrão de nomenclatura
   - Documente props e comportamentos
   - Adicione testes
   - Mantenha acessibilidade

2. **Modificações**
   - Mantenha compatibilidade
   - Atualize documentação
   - Teste casos de uso
   - Considere impacto em outros componentes 