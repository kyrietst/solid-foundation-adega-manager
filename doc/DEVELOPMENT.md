# Guia de Desenvolvimento - Adega Manager

## Visão Geral

Este documento consolida todas as informações necessárias para desenvolver e contribuir com o **Adega Manager**, um sistema enterprise de gestão de adegas em produção ativa com 925+ registros reais.

**⚠️ IMPORTANTE**: Este é um sistema em **PRODUÇÃO ATIVA** com dados reais. Toda modificação deve seguir as práticas de segurança e backup listadas neste documento.

---

## 1. Configuração do Ambiente

### Requisitos Mínimos

- **Node.js**: 18+ (recomendado LTS 20+)
- **npm**: 9+ (incluído com Node.js)
- **Git**: Para controle de versão
- **Editor**: VS Code (recomendado) com extensões:
  - TypeScript and JavaScript Language Features
  - ES7+ React/Redux/React-Native snippets
  - Tailwind CSS IntelliSense
  - Auto Rename Tag

### Instalação e Setup

```bash
# 1. Clone o repositório
git clone <YOUR_GIT_URL>
cd solid-foundation-adega-manager

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com suas credenciais Supabase

# 4. Inicie o servidor de desenvolvimento
npm run dev
```

### Variáveis de Ambiente Obrigatórias

```env
# Supabase Configuration (CRÍTICO)
VITE_SUPABASE_URL=https://uujkzvbgnfzuzlztrzln.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-aqui

# Development (Opcional)
NODE_ENV=development
```

---

## 2. Comandos de Desenvolvimento

### Comandos Essenciais

```bash
# Desenvolvimento
npm run dev          # Servidor desenvolvimento (porta 8080)
npm run build        # Build para produção
npm run lint         # ESLint (OBRIGATÓRIO antes de commits)
npm run preview      # Preview do build local

# Backup e Restauração (CRÍTICO)
npm run backup       # Backup automático Supabase
npm run restore      # Restore do backup
npm run backup:full  # Backup completo com configurações
npm run setup:env    # Configurar variáveis de ambiente
```

### Workflow de Desenvolvimento

1. **Sempre fazer backup antes de mudanças críticas**
2. **Rodar lint antes de cada commit**
3. **Testar em ambiente local primeiro**
4. **Verificar RLS policies para novas features**

---

## 3. Arquitetura do Projeto

### Stack Tecnológica Atual

**Frontend:**
- React 18 + TypeScript (strict mode desabilitado)
- Vite (build ultra-rápido)
- Tailwind CSS + Aceternity UI + Shadcn/ui (componentes premium)
- React Query (cache inteligente)
- React Hook Form + Zod (validação)
- React Router DOM (roteamento)

**Backend:**
- Supabase PostgreSQL (16 tabelas, 925+ registros)
- 48 stored procedures para business logic
- 57 políticas RLS ativas
- Real-time subscriptions
- Automated backup system

### Estrutura de Diretórios

```
src/
├── components/          # Componentes React por feature
│   ├── ui/             # Componentes Aceternity UI + Shadcn/ui customizados
│   ├── inventory/      # Gestão estoque (ProductForm, TurnoverAnalysis, BarcodeInput)
│   ├── sales/          # POS (Cart, ProductsGrid, CustomerSearch, SalesPage)
│   ├── clients/        # CRM (CustomerForm, interactions, timeline)
│   └── [modules]/      # Dashboard, Delivery, Movements, UserManagement
├── contexts/           # Providers globais (Auth, Notifications)
├── hooks/              # 15+ hooks customizados
│   ├── use-cart.ts     # Carrinho de compras
│   ├── use-crm.ts      # CRM operations
│   ├── use-sales.ts    # Sales processing
│   ├── use-product.ts  # Product management
│   └── use-barcode.ts  # Barcode integration
├── integrations/       
│   └── supabase/       # Cliente e tipos auto-gerados
├── lib/                # Core utilities (utils.ts, validations)
├── pages/              # Rotas principais (Auth, Index, NotFound)
└── types/              # Definições TypeScript
```

---

## 4. Padrões de Código

### TypeScript Guidelines

```typescript
// ✅ BOM - Interfaces claras
interface ProductFormProps {
  product?: Product;
  onSubmit: (data: ProductFormData) => void;
  isLoading?: boolean;
}

// ✅ BOM - Hooks customizados tipados
const useProduct = (id: string) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    }
  });
};

// ❌ EVITAR - any types
const handleSubmit = (data: any) => { /* ... */ }
```

### Component Patterns

```tsx
// ✅ BOM - Componente funcional com memo
const ProductCard = React.memo<ProductCardProps>(({ 
  product, 
  onEdit, 
  onDelete 
}) => {
  const { user } = useAuth();
  const canEdit = user?.role === 'admin' || user?.role === 'employee';
  
  return (
    <Card className="p-4">
      <h3 className="font-semibold">{product.name}</h3>
      {canEdit && (
        <div className="mt-2 space-x-2">
          <Button onClick={() => onEdit(product.id)}>Editar</Button>
          {user?.role === 'admin' && (
            <Button variant="destructive" onClick={() => onDelete(product.id)}>
              Excluir
            </Button>
          )}
        </div>
      )}
    </Card>
  );
});
```

### Database Operations

```typescript
// ✅ BOM - Operação com RLS e error handling
const useCreateSale = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (saleData: CreateSaleData) => {
      const { data, error } = await supabase
        .rpc('process_sale', {
          customer_id: saleData.customerId,
          items: saleData.items,
          payment_method: saleData.paymentMethod
        });
      
      if (error) {
        console.error('Sale creation error:', error);
        throw new Error(`Erro ao processar venda: ${error.message}`);
      }
      
      return data;
    },
    onSuccess: () => {
      // Invalidar caches relacionados
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    }
  });
};
```

---

## 5. Segurança e RLS

### Diretrizes Críticas

**⚠️ OBRIGATÓRIO para toda nova funcionalidade:**

1. **RLS Policies primeiro** - Implementar antes da UI
2. **Validação multi-camada** - Frontend + Backend + Database
3. **Role-based access** - Verificar permissões em componentes
4. **Audit logging** - Operações sensíveis devem ser logadas
5. **Input sanitization** - Usar Zod para validação

### Exemplo de Implementação Segura

```sql
-- 1. Criar política RLS ANTES da feature
CREATE POLICY "Employees can manage inventory" ON products
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'employee')
  )
);
```

```tsx
// 2. Verificar permissões no componente
const InventoryManagement = () => {
  const { user } = useAuth();
  
  // Verificação de acesso
  if (!user || !['admin', 'employee'].includes(user.role)) {
    return <div>Acesso negado</div>;
  }
  
  // 3. Validação com Zod
  const productSchema = z.object({
    name: z.string().min(1, 'Nome obrigatório'),
    price: z.number().positive('Preço deve ser positivo'),
    stock_quantity: z.number().min(0, 'Estoque não pode ser negativo')
  });
  
  // Resto do componente...
};
```

---

## 6. Testing Guidelines

### Manual Testing (Atual)

**⚠️ Não há test runner configurado** - Todo teste é manual.

**Checklist de Teste para Novas Features:**

```bash
# 1. Teste básico de funcionamento
npm run dev
# Navegar e testar a feature

# 2. Teste com diferentes roles
# - Login como admin
# - Login como employee  
# - Login como delivery
# Verificar se permissões estão corretas

# 3. Teste de edge cases
# - Dados inválidos
# - Conexão perdida
# - Operações simultâneas

# 4. Teste de performance
# - Lista com muitos itens
# - Operações em lote
# - Real-time updates
```

### Future Testing Strategy

```typescript
// Planejado para Q1 2025
// Vitest + React Testing Library
describe('ProductForm', () => {
  it('should validate required fields', () => {
    // Test implementation
  });
  
  it('should submit data correctly', () => {
    // Test implementation
  });
});
```

---

## 7. Database Development

### Schema Changes Process

```bash
# 1. SEMPRE fazer backup primeiro
npm run backup

# 2. Fazer mudanças no Supabase Dashboard
# - SQL Editor para mudanças de schema
# - Verificar se RLS policies ainda funcionam

# 3. Regenerar tipos TypeScript
supabase gen types typescript --local > src/integrations/supabase/types.ts

# 4. Atualizar componentes afetados
# - Verificar breaking changes
# - Ajustar interfaces TypeScript

# 5. Testar thoroughly
# - Todas as operações CRUD
# - Permissões por role
# - Real-time updates
```

### RLS Policy Development

```sql
-- Template para nova política
CREATE POLICY "policy_name" ON table_name
FOR operation USING (
  -- Condição de segurança
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'required_role'
  )
);

-- Exemplo real: Delivery apenas suas entregas
CREATE POLICY "Delivery can view assigned deliveries" ON sales
FOR SELECT USING (
  (auth.jwt() ->> 'role') = 'delivery' 
  AND delivery_user_id = auth.uid()
);
```

---

## 8. Performance Guidelines

### Frontend Optimization

```tsx
// ✅ BOM - Memoização adequada
const ProductList = React.memo(() => {
  const { data: products } = useProducts();
  
  const filteredProducts = useMemo(() => 
    products?.filter(p => p.stock_quantity > 0) || [],
    [products]
  );
  
  const handleProductClick = useCallback((id: string) => {
    // Handler implementation
  }, []);
  
  return (
    <div>
      {filteredProducts.map(product => (
        <ProductCard 
          key={product.id}
          product={product}
          onClick={handleProductClick}
        />
      ))}
    </div>
  );
});
```

### Database Optimization

```sql
-- ✅ BOM - Usar stored procedures para operações complexas
SELECT * FROM process_sale($1, $2, $3); -- Ao invés de múltiplas queries

-- ✅ BOM - Índices para queries frequentes
CREATE INDEX IF NOT EXISTS idx_products_category_stock 
ON products(category, stock_quantity) 
WHERE stock_quantity > 0;
```

---

## 9. Debugging e Troubleshooting

### Common Issues

**🔴 Build Failures:**
```bash
# Limpar cache e reinstalar
rm -rf node_modules .vite dist
npm install
npm run dev
```

**🔴 Database Connection:**
```bash
# Verificar env vars
npm run setup:env
echo $VITE_SUPABASE_URL  # Deve retornar a URL
```

**🔴 RLS Policy Errors:**
```sql
-- No Supabase SQL Editor
SELECT * FROM profiles WHERE id = auth.uid();
-- Verificar se usuário tem role correto
```

**🔴 TypeScript Errors:**
```bash
# Regenerar tipos do Supabase
supabase gen types typescript > src/integrations/supabase/types.ts
```

### Debugging Tools

```tsx
// React Query DevTools (development)
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

function App() {
  return (
    <>
      <MyApp />
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </>
  );
}
```

---

## 10. Contribution Guidelines

### Git Workflow

```bash
# 1. Criar branch para feature
git checkout -b feature/nome-da-feature

# 2. Fazer mudanças
# ... desenvolvimento ...

# 3. SEMPRE fazer backup antes de commits importantes
npm run backup

# 4. Lint obrigatório
npm run lint

# 5. Commit com mensagem descritiva
git add .
git commit -m "feat: adiciona funcionalidade X com RLS policies"

# 6. Push e PR
git push origin feature/nome-da-feature
```

### Code Review Checklist

**Para o Autor:**
- [ ] `npm run lint` passou sem erros
- [ ] Backup feito antes de mudanças críticas
- [ ] RLS policies implementadas para novas tabelas
- [ ] TypeScript sem `any` ou `unknown` desnecessários
- [ ] Validação de entrada com Zod
- [ ] Tested manually em diferentes roles
- [ ] Performance considerations aplicadas

**Para o Reviewer:**
- [ ] Segurança: RLS policies adequadas
- [ ] Performance: sem N+1 queries, memoização adequada
- [ ] UX: responsivo, estados de loading/error
- [ ] Code quality: seguindo padrões estabelecidos
- [ ] Documentation: código auto-documentado

### Pull Request Template

```markdown
## Descrição
Breve descrição da mudança.

## Tipo de Mudança
- [ ] Bug fix
- [ ] Nova feature
- [ ] Breaking change
- [ ] Melhoria de performance
- [ ] Refatoração

## Testing
- [ ] Testado manualmente em dev
- [ ] Testado com role admin
- [ ] Testado com role employee
- [ ] Testado com role delivery (se aplicável)

## Segurança
- [ ] RLS policies adicionadas/atualizadas
- [ ] Validação de entrada implementada
- [ ] Não expõe dados sensíveis

## Database Changes
- [ ] Backup feito antes das mudanças
- [ ] Tipos TypeScript regenerados
- [ ] Migrations documentadas
```

---

## 11. Production Considerations

### Pre-Deploy Checklist

```bash
# 1. Backup da produção
npm run backup:full

# 2. Build e teste local
npm run build
npm run preview

# 3. Verificar logs do Supabase
# - Acessar dashboard
# - Verificar errors/warnings
# - Confirmar performance metrics

# 4. Deploy gradual se possível
# - Feature flags
# - Rollback plan
```

### Monitoring

**Métricas a Acompanhar:**
- Query performance (pg_stat_statements)
- Error rates (Supabase logs)
- User activity (audit_logs table)
- Real-time connection health
- Storage usage

**Alertas Configurados:**
- Estoque baixo (automated)
- Erros de RLS policy
- Performance degradation
- Backup failures

---

## 12. Future Roadmap

### Q1 2025 - Planned Improvements

**Performance:**
- Implementar lazy loading para listas grandes
- Otimizar bundle size
- PWA com offline support

**Testing:**
- Setup Vitest + React Testing Library
- Unit tests para business logic
- E2E tests para fluxos críticos

**Features:**
- Mobile app React Native
- Advanced analytics
- Multi-tenant support

### Technical Debt

**Current Issues from Supabase Advisors:**
1. 3 Views com SECURITY DEFINER (ERROR level)
2. 45+ Functions sem search_path (WARNING level)
3. Password protection desabilitada (WARNING level)

**Refactoring Priorities:**
- DRY improvements (ongoing)
- Component optimization
- Database query optimization
- Security policy review

---

## 📞 Support e Recursos

### Documentação Relacionada
- `/doc/ARCHITECTURE.md` - Arquitetura detalhada
- `/doc/OPERATIONS.md` - Manuais operacionais
- `/CLAUDE.md` - Instruções para AI assistants
- `/README.md` - Overview do projeto

### Links Úteis
- **Supabase Dashboard**: https://uujkzvbgnfzuzlztrzln.supabase.co
- **Lovable Project**: https://lovable.dev/projects/6c6aa749-d816-4d71-8687-a8f6e93f05f4
- **React Query Docs**: https://tanstack.com/query/latest
- **Aceternity UI Docs**: https://ui.aceternity.com
- **Shadcn/ui Docs**: https://ui.shadcn.com

### Emergency Contacts
Para problemas críticos de produção:
1. Verificar logs no Supabase Dashboard
2. Executar `npm run backup` se necessário
3. Consultar `audit_logs` table para investigação
4. Reverter para último backup estável se crítico

---

**Lembre-se**: Este é um sistema **PRODUÇÃO ATIVA** com dados reais. Sempre priorize data integrity, security, e user experience em todas as modificações.