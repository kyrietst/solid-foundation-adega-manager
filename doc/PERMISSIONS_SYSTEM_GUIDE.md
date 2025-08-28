# Sistema de Permissões - Adega Manager

## Visão Geral

Sistema completo de permissões baseado em roles (papéis) com proteção tanto no backend (RLS) quanto no frontend (componentes condicionais).

## 📋 Roles e Permissões

### 🔴 **ADMIN** - Acesso Total
- ✅ **Dashboard**: Acesso completo com dados financeiros
- ✅ **Vendas**: Criar, editar, visualizar, excluir
- ✅ **Estoque**: Controle total incluindo preços de custo
- ✅ **Clientes**: Gerenciamento completo + insights de CRM
- ✅ **Entregadores**: Gerenciar todas as entregas
- ✅ **Movimentações**: Visualizar e criar todas as movimentações
- ✅ **Usuários**: Criar, editar, excluir usuários
- ✅ **Relatórios**: Acesso a todos os relatórios financeiros
- ✅ **Dados Sensíveis**: Preços de custo, margens de lucro, dados financeiros

### 🟡 **EMPLOYEE** - Operações Limitadas
- ✅ **Dashboard**: Acesso sem dados financeiros sensíveis
- ✅ **Vendas**: Criar e processar vendas
- ✅ **Estoque**: Gerenciar produtos (sem ver preços de custo)
- ✅ **Clientes**: Criar, editar, visualizar clientes
- ✅ **Entregadores**: Gerenciar entregas
- ✅ **Movimentações**: Criar movimentações de estoque
- ❌ **Usuários**: Sem acesso ao gerenciamento de usuários
- ❌ **Relatórios**: Sem acesso a relatórios financeiros
- ❌ **Dados Sensíveis**: Não vê preços de custo ou margens

### 🔵 **DELIVERY** - Acesso Mínimo
- ❌ **Dashboard**: Sem acesso
- ❌ **Vendas**: Sem acesso às vendas gerais
- ❌ **Estoque**: Sem acesso
- ❌ **Clientes**: Sem acesso
- ✅ **Entregadores**: Apenas suas próprias entregas
- ❌ **Movimentações**: Sem acesso
- ❌ **Usuários**: Sem acesso
- ❌ **Relatórios**: Sem acesso
- ❌ **Dados Sensíveis**: Acesso negado a todos

## 🛡️ Implementação Técnica

### Frontend (React Components)

#### Hook usePermissions
```typescript
const {
  canViewProducts,
  canCreateProducts,
  canEditProducts,
  canDeleteProducts,
  canViewCostPrices,
  canViewProfitMargins,
  canViewFinancialData,
  canAccessAdmin
} = usePermissions();
```

#### Componente SensitiveData
```tsx
<SensitiveData type="cost">
  <Input id="cost_price" value={costPrice} />
</SensitiveData>

<SensitiveData type="profit">
  <div>Margem: {margin}%</div>
</SensitiveData>

<SensitiveData type="financial">
  <FinancialChart />
</SensitiveData>
```

### Backend (Row Level Security - RLS)

#### Políticas por Tabela

**Products**: 
- Admin: Acesso total
- Employee: Leitura/escrita (preços de custo ocultos no frontend)
- Delivery: Sem acesso

**Sales**:
- Admin: Todas as vendas
- Employee: Todas as vendas
- Delivery: Apenas entregas atribuídas

**Customers**:
- Admin: Acesso total
- Employee: Leitura/escrita
- Delivery: Sem acesso

**Users/Profiles**:
- Admin: Gerenciamento completo
- Employee: Apenas próprio perfil
- Delivery: Apenas próprio perfil

**Financial Data**:
- Admin: Acesso total
- Employee: Sem acesso
- Delivery: Sem acesso

## 🔐 Segurança por Camadas

### 1. Database Level (RLS)
```sql
-- Exemplo: Delivery vê apenas suas entregas
CREATE POLICY "delivery_own_sales_only" ON sales
FOR SELECT USING (
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'delivery'::user_role
    ) THEN (delivery_user_id = auth.uid())
    ELSE true
  END
);
```

### 2. Component Level
- `SensitiveData` component oculta dados baseado em permissões
- Conditional rendering baseado em `usePermissions`
- Fallbacks visuais para dados restritos

### 3. Navigation Level
```typescript
// Sidebar filtra links baseado no role
const filteredLinks = allLinks.filter(item => 
  item.roles.includes(userRole)
);
```

## 📊 Dados Protegidos

### 🔴 Altamente Sensíveis (Apenas Admin)
- Preços de custo (`cost_price`)
- Margens de lucro calculadas
- Dados financeiros consolidados
- Relatórios de contas a receber
- Gestão de usuários

### 🟡 Moderadamente Sensíveis (Admin + Employee)
- Preços de venda
- Dados de clientes
- Histórico de vendas
- Movimentações de estoque

### 🔵 Básicos (Todos os roles autenticados)
- Informações de produtos (sem custos)
- Próprio perfil
- Próprias entregas (delivery)

## 🧪 Como Testar

### 1. Login como Admin (`adm@adega.com`)
- Deve ver todos os dados
- Deve ter acesso a preços de custo
- Deve ver relatórios financeiros

### 2. Login como Employee (`funcionario@adega.com`)
- Deve ver produtos sem preços de custo
- Não deve ter acesso a relatórios financeiros
- Deve poder criar/editar produtos e clientes

### 3. Login como Delivery (`entregador@adega.com`)
- Deve ver apenas o menu "DELIVERY"
- Deve ver apenas suas próprias entregas
- Não deve ter acesso a outras seções

## 🔄 Fluxo de Validação

1. **Autenticação**: Usuário faz login
2. **Role Detection**: Sistema identifica o role do usuário
3. **Frontend Filtering**: Componentes são renderizados condicionalmente
4. **Backend Validation**: RLS valida cada query
5. **Data Masking**: Dados sensíveis são ocultados ou mascarados

## 📝 Logs e Auditoria

Todas as operações são registradas na tabela `audit_logs` com:
- Usuário que executou a ação
- Tipo de operação
- Dados alterados
- Timestamp
- IP do usuário

## 🚀 Próximos Passos

- [ ] Implementar timeout de sessão baseado em role
- [ ] Adicionar logs específicos de tentativas de acesso negado
- [ ] Criar dashboard de auditoria para administradores
- [ ] Implementar notificações de atividades suspeitas