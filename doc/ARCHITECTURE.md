# Arquitetura do Sistema - Adega Manager

## Visão Geral

O Adega Manager é uma aplicação web moderna e completa para gerenciamento de adegas, oferecendo funcionalidades empresariais como controle de estoque inteligente, sistema POS, CRM avançado, delivery tracking e relatórios analíticos. A aplicação foi construída com tecnologias modernas e arquitetura enterprise-grade.

## Stack Tecnológica

### Frontend
- **React 18**: Framework principal com hooks modernos
- **TypeScript**: Linguagem principal com tipagem estática rigorosa
- **Vite**: Build tool ultra-rápido (dev server porta 8080)
- **TailwindCSS**: Framework CSS utilitário para design system
- **Aceternity UI**: Biblioteca principal de componentes premium com animações avançadas
- **Shadcn/ui**: Biblioteca complementar baseada em Radix UI (componentes base)
- **Framer Motion**: Biblioteca de animações (integrada via Aceternity UI)
- **React Router DOM**: Roteamento SPA com lazy loading
- **React Query (TanStack)**: Gerenciamento de estado servidor com cache inteligente
- **React Hook Form**: Formulários performáticos com validação
- **Zod**: Validação de schemas type-safe
- **Recharts**: Biblioteca para gráficos e dashboards
- **Lucide React**: Ícones consistentes
- **Date-fns**: Manipulação de datas
- **Zustand**: State management adicional quando necessário

### Backend & Infraestrutura
- **Supabase**: Plataforma BaaS completa
  - PostgreSQL 15+ com extensões avançadas
  - Autenticação JWT integrada
  - Row Level Security (RLS) enterprise
  - Real-time subscriptions
  - Storage para arquivos
  - Edge Functions serverless
  - Backup automático

### Banco de Dados - Estado Atual

#### **16 Tabelas Principais** (925+ registros totais)

**Core Business:**
- `products` (125 registros) - Catálogo completo com barcode, análise de giro
- `customers` (91 registros) - CRM com segmentação automática  
- `sales` (52 registros) - Vendas com delivery tracking
- `sale_items` - Itens de venda com validações rigorosas
- `inventory_movements` - Movimentações: in/out/fiado/devolucao

**CRM Avançado:**
- `customer_insights` (6 registros) - IA insights automáticos
- `customer_interactions` (4 registros) - Timeline de interações
- `customer_events` (63 registros) - Eventos automatizados
- `customer_history` (3 registros) - Histórico completo

**Sistema:**
- `users` (3 registros) - Multi-role: admin/employee/delivery
- `profiles` (3 registros) - Perfis estendidos com enum user_role
- `audit_logs` (920 registros) - Auditoria completa com IP tracking
- `accounts_receivable` (6 registros) - Contas a receber
- `payment_methods` (6 registros) - Métodos configuráveis
- `automation_logs` - Logs de automação N8N

#### **48 Stored Procedures Especializadas**

**Business Logic:**
```sql
process_sale(customer_id, items, payment_method) -- Venda completa
delete_sale_with_items(sale_id) -- Exclusão com integridade  
adjust_product_stock(product_id, quantity, reason) -- Ajuste estoque
recalc_customer_insights(customer_id) -- Recálculo insights
```

**Analytics & Reports:**
```sql
get_sales_trends(start_date, end_date, period) -- Tendências
get_top_products(start_date, end_date, limit) -- Top produtos
get_customer_metrics() -- Métricas CRM
get_financial_metrics() -- Indicadores financeiros
get_inventory_metrics() -- Análise estoque
```

**Auth & Security:**
```sql
create_admin_user(email, password, name) -- Criação admin
has_role(user_id, role) -- Verificação permissão
is_admin() -- Check admin context
handle_new_user() -- Trigger automático
```

## Estrutura do Projeto (v2.0.0 - Refatorado)

```
src/
├── components/          # Componentes React organizados por feature
│   ├── ui/             # Sistema completo de componentes reutilizáveis
│   │   ├── pagination-controls.tsx     # Controles de paginação padronizados
│   │   ├── stat-card.tsx              # Cartões estatísticos (6 variantes)
│   │   ├── loading-spinner.tsx        # Spinners de loading variados
│   │   ├── search-input.tsx           # Input de busca com debounce
│   │   ├── filter-toggle.tsx          # Toggle de filtros animado
│   │   ├── empty-state.tsx            # Estados vazios reutilizáveis
│   │   ├── theme-showcase.tsx         # Demonstração do sistema de themes
│   │   └── [shadcn+aceternity]        # Componentes base das bibliotecas
│   ├── examples/       # Componentes de demonstração
│   │   └── EntityHookDemo.tsx         # Demo dos hooks genéricos
│   ├── inventory/      # Gestão estoque (ProductForm, TurnoverAnalysis, BarcodeInput)
│   ├── sales/          # POS (Cart, ProductsGrid, CustomerSearch, SalesPage)
│   ├── clients/        # CRM (CustomerForm, interactions)
│   └── [modules]/      # Dashboard, Delivery, Movements, etc.
├── contexts/           # Providers globais (Auth, Notifications)
├── hooks/              # 18+ hooks customizados reutilizáveis
│   ├── use-pagination.ts              # Hook de paginação genérico
│   ├── use-form-with-toast.ts         # Hook de formulário com toast
│   ├── use-entity.ts                  # Hooks genéricos para Supabase
│   ├── use-entity-examples.ts         # Exemplos de migração
│   ├── use-cart.ts                    # Carrinho de compras
│   ├── use-crm.ts                     # CRM operations
│   ├── use-sales.ts                   # Vendas e relatórios
│   ├── use-product.ts                 # Gestão produtos
│   └── use-barcode.ts                 # Scanner código barras
├── integrations/       
│   └── supabase/       # Cliente e tipos auto-gerados
├── lib/                # Utilitários core expandidos
│   ├── utils.ts                       # Utilitários base (formatCurrency, etc.)
│   ├── theme.ts                       # Sistema de cores Adega Wine Cellar
│   └── theme-utils.ts                 # 30+ utility functions para themes
├── pages/              # Rotas principais (Auth, Index, NotFound)
└── types/              # Definições TypeScript específicas
```

## Segurança Enterprise

### Row Level Security (RLS) - 57 Políticas Ativas

**Controle Granular por Role:**
```sql
-- Admin: Acesso total
"Admin can manage all customers" ON customers FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
)

-- Employee: Operações limitadas  
"Employees can update customers" ON customers FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'employee')
)

-- Delivery: Apenas suas entregas
"Delivery can view assigned sales" ON sales FOR SELECT USING (
  auth.jwt() ->> 'role' = 'delivery' AND delivery_user_id = auth.uid()
)
```

**Políticas por Tabela:**
- `profiles`: 11 políticas (mais complexa)
- `sales`: 6 políticas com controle delivery
- `products`: 4 políticas com admin-only delete
- `customers`: 4 políticas escalonadas
- `sale_items`: 4 políticas incluindo delivery access

### Auditoria Completa

**Tracking Automático:**
- IP address, user agent por ação
- 920+ logs já registrados
- Triggers automáticos em operações críticas
- Rate limiting integrado

### Níveis de Acesso Detalhados

#### **Admin** (Super usuário)
- Gestão completa de usuários e permissões
- Acesso total a relatórios financeiros
- Configuração do sistema
- Exclusão de registros sensíveis
- Visualização de preços de custo e margens

#### **Employee** (Funcionário)
- Vendas e atendimento
- Gestão básica de produtos (sem preços de custo)
- CRM e interações com clientes
- Relatórios operacionais
- Movimentações de estoque

#### **Delivery** (Entregador)
- Apenas entregas designadas
- Atualização de status de entrega
- Visualização de itens para entrega
- Acesso read-only a dados de clientes

## Funcionalidades Avançadas

### Sistema de Estoque Inteligente

**Análise de Giro Automática:**
- Fast/Medium/Slow baseado em vendas 30/60/90 dias
- Triggers automáticos na última venda
- Alertas de reposição inteligentes
- Suporte completo a códigos de barras

**Campos Completos:**
- Volume em ML, categoria, fornecedor
- Preços unitário/pacote com margens automáticas
- Estoque mínimo com alertas visuais
- 12 campos completos implementados

### CRM Enterprise

**Segmentação Automática:**
- High Value, Regular, Occasional, New baseado em LTV
- Insights de IA com confidence score
- Timeline completa de interações
- Análise de frequência e preferências

**Automação Inteligente:**
- Triggers automáticos para eventos
- Atualização de insights em tempo real
- Detecção de padrões de compra
- Integration-ready para N8N

### Sistema POS Completo

**Fluxo de Venda:**
1. Busca de produtos com filtros avançados
2. Carrinho com cálculos automáticos
3. Seleção de cliente (busca inteligente)
4. Múltiplos métodos de pagamento
5. Processamento com validação de estoque
6. Geração automática de movimentações

## Performance e Otimização

### Frontend Otimizado

**Estratégias Implementadas:**
- React Query com cache inteligente
- Lazy loading de rotas
- Memoização com React.memo/useMemo
- Paginação server-side
- Debounce em buscas

**Bundle Otimizado:**
- Tree shaking automático
- Code splitting por rota
- Assets optimization
- CSS purging

### Backend Performático

**Database Optimization:**
- Índices compostos em queries frequentes
- Stored procedures para operações complexas
- Views materializadas para relatórios
- Connection pooling automático

**Extensões Habilitadas:**
- `pg_stat_statements` - Query monitoring
- `pgcrypto` - Criptografia
- `pg_cron` - Jobs agendados
- `uuid-ossp` - UUID generation

## Real-time e Integrações

### Supabase Real-time

**Subscriptions Ativas:**
```tsx
// Notificações em tempo real
const channel = supabase
  .channel('notifications')
  .on('postgres_changes', { 
    event: 'INSERT', 
    schema: 'public', 
    table: 'customer_events' 
  }, handleNewEvent)
  .subscribe();
```

**Casos de Uso:**
- Notificações de estoque baixo
- Atualizações de vendas em tempo real
- Sincronização multi-usuário
- Alerts de sistema

### Sistema de Notificações

**NotificationBell Component:**
- Contador em tempo real
- Popover com histórico
- Categorização por tipo
- Auto-dismiss configurável

## Desenvolvimento e Deploy

### Comandos Essenciais

```bash
# Desenvolvimento
npm run dev          # Server desenvolvimento (porta 8080)
npm run build        # Build TypeScript + Vite
npm run lint         # ESLint com TypeScript
npm run preview      # Preview build local

# Backup/Restore
npm run backup       # Backup automático Supabase
npm run restore      # Restore do backup
npm run backup:full  # Backup completo com config
```

### Environment Setup

**Variáveis Críticas:**
```env
VITE_SUPABASE_URL=https://uujkzvbgnfzuzlztrzln.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Migrations e Versionamento

**113 Migrations Aplicadas** (Jun-Nov 2024):
- Sistema maduro com evolução contínua
- Últimas migrations: customer retention analytics
- Backup automático antes de cada migration
- Rollback procedures disponíveis

## Troubleshooting Enterprise

### Security Advisors (Atenção Necessária)

**⚠️ CRITICAL:**
- 3 Views com SECURITY DEFINER (nível ERROR) - [remediation link](https://supabase.com/docs/guides/database/database-linter?lint=0010_security_definer_view)

**⚠️ WARNINGS:**
- 45+ Functions sem search_path set - melhorar segurança
- Password protection desabilitada - ativar HIBP

### Performance Monitoring

**Métricas Coletadas:**
- Query performance via pg_stat_statements
- Real-time connection monitoring
- Error tracking com contexto completo
- Resource usage patterns

### Debugging Avançado

```tsx
// React Query DevTools
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Supabase Debug Mode
const supabase = createClient(url, key, {
  auth: { debug: process.env.NODE_ENV === 'development' }
});
```

## Sistema de Componentes Reutilizáveis (v2.0.0)

### Componentes UI Padronizados

**PaginationControls** - Sistema completo de paginação
```tsx
<PaginationControls 
  currentPage={currentPage}
  totalPages={totalPages}
  onPageChange={goToPage}
  itemsPerPageOptions={[6, 12, 20, 50]}
/>
```

**StatCard** - Cartões estatísticos com 6 variantes
```tsx
<StatCard
  title="Total de Vendas"
  value={formatCurrency(totalSales)}
  icon={DollarSign}
  variant="success"
/>
```

**LoadingSpinner** - Spinners variados
```tsx
<LoadingSpinner size="lg" color="gold" />
<LoadingScreen text="Carregando produtos..." />
```

**SearchInput** - Busca avançada com debounce
```tsx
<SearchInput
  value={searchTerm}
  onChange={setSearchTerm}
  placeholder="Buscar produtos..."
/>
```

**EmptyState** - Estados vazios reutilizáveis
```tsx
<EmptyProducts />
<EmptyCustomers />
<EmptySearchResults searchTerm="filtros aplicados" />
```

### Hooks Genéricos para Supabase

**usePagination** - Paginação reutilizável
```tsx
const {
  currentPage,
  itemsPerPage,
  totalPages,
  paginatedItems,
  goToPage,
  setItemsPerPage
} = usePagination(items, { initialItemsPerPage: 12 });
```

**useEntity** - Queries genéricas
```tsx
const { data: product } = useEntity({
  table: 'products',
  id: productId
});

const { data: customers } = useEntityList({
  table: 'customers',
  filters: { segment: 'VIP' },
  search: { columns: ['name', 'email'], term: searchTerm }
});
```

**useFormWithToast** - Formulários padronizados
```tsx
const { form, onSubmit, isSubmitting } = useFormWithToast({
  schema: productSchema,
  onSuccess: (data) => console.log('Created:', data),
  successMessage: 'Produto criado com sucesso!'
});
```

### Sistema de Themes Adega Wine Cellar

**Paleta Completa** - 12 cores black-to-gold
```tsx
// Cores principais
className="text-adega-gold bg-adega-charcoal"
className="border-adega-graphite text-adega-platinum"

// Utility functions
const statusClasses = getStockStatusClasses(currentStock, minimumStock);
const valueClasses = getValueClasses('lg', 'gold');
```

## Roadmap & Melhorias

### v2.0.0 - Refatoração Completa (CONCLUÍDA)
- ✅ Sistema de paginação reutilizável implementado
- ✅ 16 componentes reutilizáveis criados
- ✅ 1.800+ linhas de código duplicado eliminadas
- ✅ Sistema de themes Adega Wine Cellar completo
- ✅ Hooks genéricos para Supabase implementados

### Próximas Implementações

**Q1 2025:**
- Mobile app React Native
- PWA com offline support
- Sistema de testes automatizados (Vitest + RTL)

**Q2 2025:**
- AI analytics avançado
- Integração ERP externa
- Multi-tenant architecture

**Q3 2025:**
- Machine learning recommendations
- Advanced forecasting
- International expansion

### Recomendações para Desenvolvedores

**Onboarding:**
1. Ler completo esta documentação
2. Configurar ambiente local seguindo CLAUDE.md
3. Explorar banco via Supabase dashboard
4. Executar npm run dev e testar fluxos

**Best Practices:**
- Sempre usar TypeScript strict
- Implementar RLS antes de criar tabelas
- Validar com Zod em formulários
- Usar React Query para server state
- Escrever testes para business logic

**Code Review Checklist:**
- [ ] RLS policies implementadas
- [ ] TypeScript sem any/unknown
- [ ] Validação de entrada
- [ ] Error handling apropriado
- [ ] Performance considerations
- [ ] Security review

## Considerações Finais

O Adega Manager é uma aplicação **enterprise-ready** com:
- Arquitetura escalável e moderna
- Segurança robusta multi-camada  
- Performance otimizada
- Funcionalidades avançadas de negócio
- Infraestrutura cloud-native
- Documentação completa

**Status Atual: PRODUÇÃO** - Sistema totalmente funcional com 925+ registros reais e operações diárias.