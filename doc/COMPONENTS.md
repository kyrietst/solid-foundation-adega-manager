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
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-[100px]" />
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
        {trend !== undefined && (
          <p className={cn(
            "text-xs",
            trend > 0 ? "text-green-500" : "text-red-500"
          )}>
            {trend > 0 ? "+" : ""}{trend}% em relação ao período anterior
          </p>
        )}
      </CardContent>
    </Card>
  );
};
```

### Componentes CRM

#### Customers
```tsx
// Componente principal do CRM
const Customers: React.FC = () => {
  const [activeTab, setActiveTab] = useState('list');
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Gerenciamento de Clientes</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="list">Lista de Clientes</TabsTrigger>
          {selectedCustomer && (
            <TabsTrigger value="detail">Detalhes do Cliente</TabsTrigger>
          )}
          <TabsTrigger value="analytics">Análise de Clientes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list">
          <CustomerList onSelectCustomer={setSelectedCustomer} />
        </TabsContent>
        
        {selectedCustomer && (
          <TabsContent value="detail">
            <CustomerDetail customerId={selectedCustomer} />
          </TabsContent>
        )}
        
        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <CustomerStats />
            <CustomerSegments />
            <CustomerTrends />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
```

#### ProfileCompletenessIndicator
```tsx
// Componente que mostra o progresso de completude do perfil
interface ProfileCompletenessProps {
  customer?: CustomerProfile;
}

const ProfileCompletenessIndicator: React.FC<ProfileCompletenessProps> = ({ customer }) => {
  const { score, suggestions } = useProfileCompleteness(customer);
  
  return (
    <div className="border rounded-lg p-4 bg-white">
      <div className="flex items-center gap-4">
        <div className="relative h-16 w-16">
          <CircularProgress value={score} />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-medium">{score}%</span>
          </div>
        </div>
        
        <div className="flex-1">
          <h3 className="text-sm font-medium">Completude do Perfil</h3>
          
          {suggestions.length > 0 ? (
            <div className="mt-2">
              <p className="text-xs text-muted-foreground mb-1">Sugestões:</p>
              <ul className="text-xs space-y-1">
                {suggestions.map((suggestion, i) => (
                  <li key={i} className="flex items-center">
                    <PlusCircle className="h-3 w-3 mr-1 text-primary" />
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-xs text-green-600 mt-1">Perfil completo!</p>
          )}
        </div>
      </div>
    </div>
  );
};
```

#### CustomerDetail
```tsx
// Componente de detalhes do cliente com abas
interface CustomerDetailProps {
  customerId: string;
}

const CustomerDetail: React.FC<CustomerDetailProps> = ({ customerId }) => {
  const { data: customer, isLoading } = useCustomer(customerId);
  const [activeTab, setActiveTab] = useState('overview');
  
  if (isLoading) return <div>Carregando...</div>;
  if (!customer) return <div>Cliente não encontrado</div>;
  
  return (
    <div>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold">{customer.name}</h2>
          <p className="text-muted-foreground">{customer.email || 'Sem email'}</p>
        </div>
        
        <Badge variant={getSegmentVariant(customer.segment)}>
          {getSegmentLabel(customer.segment)}
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <ProfileCompletenessIndicator customer={customer} />
        <Card>
          {/* Outras informações de destaque */}
        </Card>
        <Card>
          {/* Outras informações de destaque */}
        </Card>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="purchases">Compras</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="interactions">Interações</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          {/* Informações gerais */}
        </TabsContent>
        
        <TabsContent value="purchases">
          {/* Histórico de compras */}
        </TabsContent>
        
        <TabsContent value="insights">
          {/* Insights do cliente */}
        </TabsContent>
        
        <TabsContent value="interactions">
          {/* Interações e histórico de comunicações */}
        </TabsContent>
      </Tabs>
    </div>
  );
};
```

#### CustomerStats
```tsx
// Componente para exibição de estatísticas de clientes
const CustomerStats: React.FC = () => {
  const { data, isLoading } = useCustomerStats();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Estatísticas de Clientes</CardTitle>
        <CardDescription>Visão geral dos indicadores</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total de Clientes</span>
                <span className="font-medium">{data?.totalCustomers || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Novos (30 dias)</span>
                <span className="font-medium">{data?.newCustomers30Days || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Taxa de Retenção</span>
                <span className="font-medium">{data?.retentionRate || 0}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Ticket Médio</span>
                <span className="font-medium">R$ {data?.averageTicket?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">LTV Médio</span>
                <span className="font-medium">R$ {data?.averageLtv?.toFixed(2) || '0.00'}</span>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
```

#### CustomerSegments
```tsx
// Componente para visualização da segmentação de clientes
const CustomerSegments: React.FC = () => {
  const { data, isLoading } = useCustomerSegments();
  
  const chartData = data?.segments.map(segment => ({
    name: getSegmentLabel(segment.name),
    value: segment.count,
  })) || [];
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Segmentação de Clientes</CardTitle>
        <CardDescription>Distribuição por segmento</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-[200px]">
            <Spinner />
          </div>
        ) : (
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} clientes`, 'Quantidade']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
```

#### CustomerActivity
```tsx
// Componente para exibição das atividades recentes
const CustomerActivity: React.FC = () => {
  const { data: activities, isLoading } = useRecentCustomerActivities();

  const getInteractionIcon = (type: string) => {
    switch (type) {
      case 'note':
        return <StickyNote className="h-4 w-4 text-blue-500" />;
      case 'call':
        return <PhoneCall className="h-4 w-4 text-green-500" />;
      case 'email':
        return <Mail className="h-4 w-4 text-amber-500" />;
      case 'complaint':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <MessageSquare className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Atividades Recentes</CardTitle>
        <CardDescription>Últimas interações com clientes</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {Array(5).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {activities?.length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                Nenhuma atividade recente
              </p>
            )}
            
            {activities?.map(activity => (
              <div key={activity.id} className="flex items-start gap-3">
                <div className="bg-muted rounded-full p-1.5 mt-0.5">
                  {getInteractionIcon(activity.type)}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{activity.customerName}</p>
                    <time className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(activity.createdAt), { locale: ptBR, addSuffix: true })}
                    </time>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {activity.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
```

#### CustomerTrends
```tsx
// Componente para exibição de tendências de clientes
const CustomerTrends: React.FC = () => {
  const { data, isLoading } = useCustomerTrends();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tendências de Vendas</CardTitle>
        <CardDescription>Últimos 6 meses</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-[200px]">
            <Spinner />
          </div>
        ) : (
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data?.monthlyTrends || []}
                margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return format(date, 'MMM', { locale: ptBR });
                  }}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Valor']}
                  labelFormatter={(label) => {
                    const date = new Date(label);
                    return format(date, 'MMMM yyyy', { locale: ptBR });
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="totalSales" 
                  name="Total de Vendas" 
                  stroke="#0088FE" 
                  activeDot={{ r: 8 }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="averageTicket" 
                  name="Ticket Médio" 
                  stroke="#00C49F" 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
```

#### CustomerOpportunities
```tsx
// Componente para exibição de oportunidades de negócio
const CustomerOpportunities: React.FC = () => {
  const { data, isLoading } = useCustomerOpportunities();
  
  const getOpportunityIcon = (type: string) => {
    switch (type) {
      case 'cross_sell':
        return <ShoppingBag className="h-4 w-4 text-green-500" />;
      case 'up_sell':
        return <ArrowUpRight className="h-4 w-4 text-blue-500" />;
      case 'reactivation':
        return <RefreshCcw className="h-4 w-4 text-amber-500" />;
      case 'retention_risk':
        return <AlertOctagon className="h-4 w-4 text-red-500" />;
      default:
        return <Lightbulb className="h-4 w-4 text-purple-500" />;
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Oportunidades</CardTitle>
        <CardDescription>Potenciais negócios identificados</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {Array(3).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {data?.opportunities.length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                Nenhuma oportunidade identificada
              </p>
            )}
            
            {data?.opportunities.map(opportunity => (
              <div key={opportunity.id} className="flex items-start gap-3">
                <div className="bg-muted rounded-full p-1.5 mt-0.5">
                  {getOpportunityIcon(opportunity.type)}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{opportunity.customerName}</p>
                    <Badge variant="outline">
                      {opportunity.confidence * 100}% confiança
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {opportunity.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full">
          <ListChecks className="h-4 w-4 mr-2" />
          Ver todas as oportunidades
        </Button>
      </CardFooter>
    </Card>
  );
};
```

## Guia de Desenvolvimento

### Criando Novos Componentes

1. **Identificar Necessidade**
   - Determine se um novo componente é necessário
   - Verifique se não existe um componente similar

2. **Criar Arquivos**
   - Crie o arquivo TSX no diretório apropriado
   - Adicione testes quando relevante

3. **Implementar Interface**
   - Defina Props com TypeScript
   - Documente as props com comentários

4. **Aplicar Estilo**
   - Use TailwindCSS
   - Mantenha consistência com o design system

5. **Testar**
   - Teste em diferentes resoluções
   - Verifique acessibilidade

### Modificando Componentes Existentes

1. **Entender o Código**
   - Leia documentação e código existente
   - Compreenda dependências e props

2. **Fazer Alterações**
   - Mantenha compatibilidade com código existente
   - Não quebre props ou comportamentos existentes

3. **Testar**
   - Teste cenários existentes
   - Teste novos comportamentos

4. **Documentar**
   - Atualize esta documentação
   - Documente novas props ou comportamentos

## Boas Práticas

1. **Componentização**
   - Mantenha componentes pequenos e focados
   - Separe lógica de apresentação

2. **Reutilização**
   - Crie componentes genéricos
   - Use composição ao invés de herança

3. **Performance**
   - Evite re-renders desnecessários
   - Use memo quando apropriado

4. **Acessibilidade**
   - Use ARIA quando necessário
   - Teste com keyboard navigation

5. **Manutenção**
   - Documente decisões complexas
   - Mantenha código legível

## Troubleshooting

### Problemas Comuns

1. **Componente não renderiza**
   - Verifique props obrigatórias
   - Confira condicionais que podem bloquear a renderização

2. **Estilos incorretos**
   - Confira classes TailwindCSS
   - Verifique conflitos de estilo

3. **Dados não carregam**
   - Verifique hooks de fetch
   - Confirme estado de loading

## Contato

Para questões sobre componentes, entre em contato com a equipe de desenvolvimento. 