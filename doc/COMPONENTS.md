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
// Barra lateral de navegação com controle de permissões
const Sidebar: React.FC = () => {
  const { user, userRole, signOut } = useAuth();
  const navigate = useNavigate();

  // Filtra itens baseado nas permissões
  const allowedItems = menuItems.filter(item => 
    hasPermission(item.requiredRole)
  );

  return (
    <nav className="fixed left-0 top-0 h-screen w-64 bg-primary text-primary-foreground">
      {/* Conteúdo */}
    </nav>
  );
};
```

### Formulários

#### ProductForm
```tsx
// Formulário de produto com validação e upload de imagem
interface ProductFormProps {
  initialData?: Product;
  onSubmit: (data: ProductFormData) => Promise<void>;
}

const ProductForm: React.FC<ProductFormProps> = ({ initialData, onSubmit }) => {
  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: initialData
  });

  const handleImageUpload = async (file: File) => {
    try {
      const url = await uploadProductImage(file);
      form.setValue('imageUrl', url);
    } catch (error) {
      toast.error('Erro ao fazer upload da imagem');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Produto</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Outros campos */}
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
// Componente base para tabelas de dados com ordenação e filtros
interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  filters?: DataTableFilter[];
  defaultSort?: SortingState;
}

const DataTable = <T,>({ 
  columns, 
  data, 
  onRowClick,
  filters,
  defaultSort 
}: DataTableProps<T>) => {
  const [sorting, setSorting] = useState<SortingState>(defaultSort ?? []);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters
    }
  });

  return (
    <div className="rounded-md border">
      {filters && (
        <div className="p-4 border-b">
          <DataTableFilters filters={filters} table={table} />
        </div>
      )}
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map(headerGroup => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map(row => (
              <TableRow
                key={row.id}
                onClick={() => onRowClick?.(row.original)}
                className={cn(
                  "cursor-pointer",
                  onRowClick && "hover:bg-muted/50"
                )}
              >
                {row.getVisibleCells().map(cell => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center"
              >
                Nenhum resultado encontrado.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
```

### Cards e Dashboards

#### StatsCard
```tsx
// Card para exibição de estatísticas com animações
interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: number;
  loading?: boolean;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  loading
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-[100px]" />
        ) : (
          <div className="flex items-center">
            <Icon className="h-8 w-8 text-muted-foreground" />
            <div className="ml-4">
              <div className="text-2xl font-bold">
                {typeof value === 'number' 
                  ? new Intl.NumberFormat('pt-BR').format(value)
                  : value
                }
              </div>
              {trend !== undefined && (
                <div className={cn(
                  "text-sm",
                  trend > 0 ? "text-green-500" : "text-red-500"
                )}>
                  {trend > 0 ? "+" : ""}{trend}%
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
```

## Hooks Customizados

### useAuth
```tsx
// Hook para gerenciamento de autenticação e permissões
const useAuth = () => {
  const supabase = useSupabaseClient();
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  useEffect(() => {
    // Verifica sessão atual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserRole(session.user);
      }
    });

    // Monitora mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchUserRole(session.user);
        } else {
          setUserRole(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return {
    user,
    userRole,
    hasPermission: (requiredRole: UserRole | UserRole[]) => {
      if (!user || !userRole) return false;
      if (user.email === 'adm@adega.com') return true;
      return Array.isArray(requiredRole)
        ? requiredRole.includes(userRole)
        : userRole === requiredRole;
    },
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
// Hook para gerenciamento de produtos com cache
const useProducts = () => {
  const queryClient = useQueryClient();
  const supabase = useSupabaseClient();

  return {
    products: useQuery({
      queryKey: ['products'],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('name');
          
        if (error) throw error;
        return data;
      }
    }),
    addProduct: useMutation({
      mutationFn: async (data: ProductFormData) => {
        const { error } = await supabase
          .from('products')
          .insert(data);
          
        if (error) throw error;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['products'] });
        toast.success('Produto adicionado com sucesso');
      }
    }),
    updateProduct: useMutation({
      mutationFn: async ({ id, data }: UpdateProductParams) => {
        const { error } = await supabase
          .from('products')
          .update(data)
          .eq('id', id);
          
        if (error) throw error;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['products'] });
        toast.success('Produto atualizado com sucesso');
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

### 1. Performance

#### Memoização
```tsx
// Use memo para componentes pesados
const HeavyComponent = memo<HeavyComponentProps>(({ data }) => {
  // Renderização complexa
});

// Use useMemo para cálculos caros
const expensiveValue = useMemo(() => {
  return heavyCalculation(deps);
}, [deps]);

// Use useCallback para funções passadas como props
const handleClick = useCallback(() => {
  // Lógica do clique
}, [deps]);
```

#### Code Splitting
```tsx
// Lazy loading de componentes
const HeavyFeature = lazy(() => import('./HeavyFeature'));

// Suspense para loading
<Suspense fallback={<Loading />}>
  <HeavyFeature />
</Suspense>
```

### 2. Acessibilidade

#### Componentes Acessíveis
```tsx
// Use elementos semânticos
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        {...props}
        className={cn(
          "inline-flex items-center justify-center",
          props.className
        )}
      >
        {children}
      </button>
    );
  }
);

// Adicione labels e descrições
const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, description, error, ...props }, ref) => {
    const id = useId();
    
    return (
      <div>
        <label htmlFor={id}>{label}</label>
        <input
          ref={ref}
          id={id}
          aria-describedby={`${id}-description`}
          aria-invalid={!!error}
          {...props}
        />
        {description && (
          <p id={`${id}-description`}>{description}</p>
        )}
        {error && (
          <p role="alert" className="text-red-500">{error}</p>
        )}
      </div>
    );
  }
);
```

### 3. Testes

#### Componentes Testáveis
```tsx
// Adicione data-testid para elementos importantes
const ProductCard = ({ product }: ProductCardProps) => {
  return (
    <div data-testid={`product-${product.id}`}>
      {/* Conteúdo */}
    </div>
  );
};

// Teste o componente
describe('ProductCard', () => {
  it('should render product information', () => {
    render(<ProductCard product={mockProduct} />);
    
    expect(screen.getByText(mockProduct.name)).toBeInTheDocument();
    expect(screen.getByText(mockProduct.price)).toBeInTheDocument();
  });
});
```

### 4. Error Boundaries

```tsx
// Crie error boundaries para componentes críticos
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }

    return this.props.children;
  }
}
```

## Troubleshooting

### Problemas Comuns

1. **Re-renders Desnecessários**
   - Use React DevTools para profiling
   - Verifique memoização
   - Otimize prop drilling

2. **Memory Leaks**
   - Limpe efeitos corretamente
   - Cancele requisições pendentes
   - Unsubscribe de eventos

3. **Performance**
   - Lazy load componentes grandes
   - Otimize imagens
   - Use virtualização para listas longas

## Recomendações Finais

1. **Mantenha componentes pequenos e focados**
2. **Use TypeScript corretamente**
3. **Documente props e comportamentos**
4. **Implemente error boundaries**
5. **Teste componentes críticos**
6. **Otimize performance**
7. **Mantenha acessibilidade**
8. **Use PropTypes em desenvolvimento**
9. **Mantenha consistência no estilo**
10. **Documente decisões importantes**

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