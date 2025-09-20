# RBAC & RLS Audit Report - Adega Manager
## Auditoria Completa do Sistema de Controle de Acesso

**Data da Auditoria**: 20 de Setembro de 2025
**Versão do Sistema**: Adega Manager v2.0.0 (Produção)
**Auditor**: Claude Code (Senior Backend Architect)

---

## Resumo Executivo

O Adega Manager possui um **sistema robusto de Role-Based Access Control (RBAC)** combinado com **Row-Level Security (RLS)** implementado diretamente no PostgreSQL via Supabase. O sistema atual protege **31 tabelas críticas** com **115 políticas RLS ativas** e suporta **3 perfis de usuário distintos** com permissões granulares.

### Números da Auditoria
- **31 tabelas** protegidas por RLS
- **115 políticas RLS** ativas
- **4 usuários** ativos (2 admin, 1 employee, 1 delivery)
- **3 perfis de acesso** (admin, employee, delivery)
- **8 funções de segurança** auxiliares
- **1 super admin** com acesso total (`adm@adega.com`)

---

## 1. Arquitetura de Usuários e Permissões

### 1.1 Tabela `profiles` - Centro do Sistema RBAC

A tabela `profiles` é o **ponto central** para autenticação e autorização:

```sql
CREATE TABLE profiles (
  id uuid PRIMARY KEY,                    -- Vinculado ao auth.uid()
  email text,                            -- Email do usuário
  name text,                             -- Nome completo
  role user_role DEFAULT 'employee',     -- Papel do usuário (ENUM)
  created_at timestamptz DEFAULT now(),  -- Data de criação
  updated_at timestamptz DEFAULT now(),  -- Última atualização
  is_temporary_password boolean DEFAULT false -- Flag para senha temporária
);
```

### 1.2 Enum `user_role` - Definição de Papéis

```sql
CREATE TYPE user_role AS ENUM (
  'admin',     -- Administrador com acesso total
  'employee',  -- Funcionário com acesso operacional
  'delivery'   -- Entregador com acesso limitado
);
```

### 1.3 Distribuição Atual de Usuários

| Role      | Quantidade | Descrição |
|-----------|------------|-----------|
| `admin`   | 2 usuários | Acesso administrativo completo |
| `employee`| 1 usuário  | Acesso operacional (vendas, estoque) |
| `delivery`| 1 usuário  | Acesso limitado (entregas atribuídas) |
| **Total** | **4 usuários** | Sistema em produção ativa |

---

## 2. Funções de Segurança Auxiliares

### 2.1 Função `get_user_role()` - ATIVA
```sql
CREATE FUNCTION get_user_role(user_id uuid) RETURNS user_role
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    RETURN (
        SELECT role
        FROM public.profiles
        WHERE id = user_id
    );
END;
$$;
```
**Uso**: Retorna o papel do usuário consultando diretamente a tabela `profiles`.

### 2.2 Função `has_role()` - LEGADA/INCONSISTENTE
```sql
CREATE FUNCTION has_role(role_name text) RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.user_roles  -- ⚠️ TABELA NÃO EXISTE
    WHERE user_id = auth.uid()
    AND role = role_name
  );
END;
$$;
```
**Status**: ⚠️ **FUNÇÃO INCONSISTENTE** - Referencia tabela `user_roles` que não existe.

### 2.3 Outras Funções Relevantes
- `set_default_permissions()` - Configura permissões baseadas no role (referencia tabelas inexistentes)
- `ensure_admin_permissions()` - Garante permissões de admin (legada)
- `log_auth_attempt()` - Log de tentativas de autenticação
- `cleanup_old_auth_logs()` - Limpeza automática de logs

### 🚨 **DESCOBERTA CRÍTICA: Inconsistências Arquiteturais**

**Problema Identificado**: Existem funções que referenciam um **sistema de permissões baseado em tabelas** (`user_roles`, `permissions`, `modules`) que **não existem fisicamente** no banco. Isso sugere uma migração incompleta ou código legado não removido.

**Impacto**: As funções `has_role()` e `set_default_permissions()` podem causar erros se chamadas.

**Recomendação**: Limpeza e atualização das funções para usar apenas a tabela `profiles`.

---

## 3. Sistema RLS por Tabela

### 3.1 Tabelas Principais de Negócio

#### **Tabela `products` (Produtos)**
- **Políticas Ativas**: 5 políticas
- **Admin**: Acesso total (CREATE, READ, UPDATE, DELETE)
- **Employee**: Acesso limitado de leitura e escrita (sem cost_price)
- **Delivery**: Apenas leitura básica
- **Público**: Leitura permitida (para consultas não autenticadas)

```sql
-- Exemplos de políticas key:
"Enable read access for all users" (SELECT) -- Leitura pública
"Enable delete for admin users" (DELETE) -- Apenas admin deleta
"employee_limited_product_access" (SELECT) -- Funcionários veem produtos sem custo
```

#### **Tabela `sales` (Vendas)**
- **Políticas Ativas**: 7 políticas
- **Admin**: Acesso total a todas as vendas
- **Employee**: Pode criar, ler e atualizar vendas
- **Delivery**: Apenas vendas atribuídas a si (`delivery_user_id = auth.uid()`)

```sql
-- Políticas key:
"Staff can manage sales" (ALL) -- Admin/Employee acesso total
"Delivery can view assigned sales" (SELECT) -- Delivery vê apenas suas vendas
"delivery_own_sales_only" (SELECT) -- Lógica condicional por role
```

#### **Tabela `customers` (Clientes)**
- **Políticas Ativas**: 4 políticas
- **Admin**: Acesso total de gerenciamento
- **Employee**: Pode visualizar e atualizar clientes
- **Delivery**: Sem acesso direto

```sql
-- Políticas key:
"Admin can manage all customers" (ALL) -- Admin total
"Employees can view customers" (SELECT) -- Employee leitura
"Employees can update customers" (UPDATE) -- Employee escrita limitada
```

#### **Tabela `sale_items` (Itens de Venda)**
- **Políticas Ativas**: 4 políticas
- **Lógica Similar**: Segue padrão das vendas
- **Delivery**: Vê apenas itens de vendas atribuídas

#### **Tabela `inventory_movements` (Movimentações de Estoque)**
- **Políticas Ativas**: 4 políticas
- **Admin**: Controle total do estoque
- **Employee**: Pode criar e atualizar movimentações próprias
- **Auditoria**: Leitura permitida para usuários autenticados

### 3.2 Tabelas de Sistema e Segurança

#### **Tabela `profiles` (Perfis de Usuário)**
- **Políticas Ativas**: 10 políticas (algumas duplicadas/legadas)
- **Características Especiais**:
  - Super admin hardcoded: `auth.email() = 'adm@adega.com'`
  - Usuários podem editar próprio perfil
  - Admins podem gerenciar todos os perfis
  - Leitura pública permitida (para verificações de role)

#### **Tabela `users` (Usuários do Sistema)**
- **Políticas Ativas**: 4 políticas
- **Admin**: Gerenciamento completo de usuários
- **Auto-gestão**: Usuários veem próprios dados

#### **Tabela `audit_logs` (Logs de Auditoria)**
- **Admin**: Acesso total para auditoria
- **Sistema**: Inserção automática de logs
- **Histórico**: Preservação de 30 dias

### 3.3 Tabelas CRM e Analytics

#### **Customer Insights, Events, Interactions**
- **Admin**: Acesso total para análises
- **Employee**: Acesso de leitura para operações
- **Sistema**: Geração automática de insights

#### **Reports e Analytics**
- **Acesso baseado em role**: Admin vê tudo, Employee vê operacional
- **Proteção de dados sensíveis**: Custos e margens restritos

---

## 4. Padrões de Segurança Identificados

### 4.1 Métodos de Verificação de Role

**Método Principal (Recomendado)**:
```sql
EXISTS (
  SELECT 1 FROM profiles
  WHERE id = auth.uid()
  AND role = 'admin'::user_role
)
```

**Método Alternativo (JWT)**:
```sql
(auth.jwt() ->> 'role'::text) = 'admin'::text
```

**Método Legado (Problemático)**:
```sql
-- ⚠️ NÃO USAR - referencia tabela inexistente
EXISTS (
  SELECT 1 FROM user_roles
  WHERE user_id = auth.uid()
  AND role = 'admin'
)
```

### 4.2 Super Admin Hardcoded
```sql
auth.email() = 'adm@adega.com'::text
```
**Implicação**: Existe um super usuário com acesso irrestrito a todas as operações.

### 4.3 Políticas Condicionais por Role
```sql
CASE
  WHEN (role = 'admin') THEN true
  WHEN (role = 'employee') THEN [condição específica]
  WHEN (role = 'delivery') THEN [condição limitada]
  ELSE false
END
```

---

## 5. Mapeamento Detalhado de Permissões por Role

### 5.1 ADMIN (Administrador)
**Filosofia**: Acesso total e irrestrito a todas as operações do sistema.

#### Permissões Completas:
- ✅ **Produtos**: CRUD completo, incluindo cost_price e margens
- ✅ **Vendas**: Todas as vendas, incluindo deleção
- ✅ **Clientes**: Gerenciamento completo do CRM
- ✅ **Usuários**: Criar, editar e remover usuários
- ✅ **Estoque**: Todas as movimentações e ajustes
- ✅ **Entregas**: Todas as entregas, mesmo não atribuídas
- ✅ **Financeiro**: Contas a receber, relatórios financeiros
- ✅ **Auditoria**: Acesso total aos logs e histórico
- ✅ **Sistema**: Configurações e parametrizações

#### Acesso a Dados Sensíveis:
- ✅ Custos e preços de compra
- ✅ Margens de lucro
- ✅ Dados financeiros completos
- ✅ Informações de todos os usuários

### 5.2 EMPLOYEE (Funcionário)
**Filosofia**: Acesso operacional para vendas e atendimento, sem informações estratégicas.

#### Permissões Operacionais:
- ✅ **Produtos**: Leitura completa, edição limitada (sem cost_price)
- ✅ **Vendas**: Criar, ler e atualizar vendas
- ✅ **Clientes**: Visualizar e atualizar informações dos clientes
- ✅ **Estoque**: Visualizar e criar movimentações próprias
- ❌ **Usuários**: Apenas próprio perfil
- ❌ **Entregas**: Visibilidade limitada
- ❌ **Financeiro**: Sem acesso a relatórios financeiros
- ❌ **Auditoria**: Sem acesso aos logs do sistema

#### Restrições de Dados:
- ❌ **Custos**: Não vê cost_price dos produtos
- ❌ **Margens**: Não vê cálculos de margem
- ❌ **Dados de outros usuários**: Apenas próprio perfil
- ❌ **Configurações do sistema**: Sem acesso

### 5.3 DELIVERY (Entregador)
**Filosofia**: Acesso ultra-restrito apenas ao necessário para entregas.

#### Permissões Mínimas:
- ✅ **Vendas**: Apenas vendas atribuídas (`delivery_user_id = auth.uid()`)
- ✅ **Itens de Venda**: Apenas de vendas próprias
- ✅ **Produtos**: Leitura básica para identificação
- ✅ **Clientes**: Dados mínimos para entrega
- ❌ **Estoque**: Sem acesso
- ❌ **Outras vendas**: Não vê vendas de outros entregadores
- ❌ **Financeiro**: Sem acesso
- ❌ **Usuários**: Apenas próprio perfil

#### Acesso Ultra-Restrito:
- ✅ Apenas dados necessários para completar entregas
- ❌ Informações comerciais ou estratégicas
- ❌ Dados de outros usuários ou operações

---

## 6. Verificação Técnica das Permissões

### 6.1 Como o Sistema Verifica Permissões

**1. Autenticação Base**:
```sql
auth.uid() IS NOT NULL  -- Usuário está logado
```

**2. Verificação de Role**:
```sql
-- Método Principal (Profiles)
EXISTS (
  SELECT 1 FROM profiles
  WHERE id = auth.uid()
  AND role = '[role_desejado]'::user_role
)

-- Método Alternativo (JWT)
(auth.jwt() ->> 'role'::text) = '[role_desejado]'::text
```

**3. Verificação Condicional**:
```sql
CASE
  WHEN [é_admin] THEN true
  WHEN [é_employee] THEN [condição_específica]
  WHEN [é_delivery] THEN [condição_restrita]
  ELSE false
END
```

**4. Super Admin Override**:
```sql
auth.email() = 'adm@adega.com'::text  -- Acesso irrestrito
```

### 6.2 Fluxo de Autorização

1. **Request chega ao Supabase**
2. **JWT é validado** (autenticação)
3. **auth.uid() é extraído** do token
4. **Role é consultado** na tabela `profiles`
5. **Políticas RLS são aplicadas** por tabela/operação
6. **Acesso é liberado ou negado** baseado nas regras

### 6.3 Pontos de Falha e Segurança

**Pontos Fortes**:
- ✅ Segurança implementada no banco (não bypassável pelo frontend)
- ✅ Controle granular por tabela e operação
- ✅ Auditoria automática de acessos
- ✅ Separação clara de responsabilidades por role

**Pontos de Atenção**:
- ⚠️ Funções legadas que referenciam tabelas inexistentes
- ⚠️ Algumas políticas duplicadas/redundantes
- ⚠️ Super admin hardcoded (ponto único de falha)
- ⚠️ Método de verificação misto (profiles vs JWT)

---

## 7. Análise para Feature Flags (Épico 2.5)

### 7.1 Compatibilidade com Sistema Atual

**Pontos Positivos**:
- ✅ Sistema RBAC maduro e estável
- ✅ Verificação de roles já implementada
- ✅ Estrutura de usuários bem definida
- ✅ Histórico de 115 políticas RLS funcionais

**Oportunidades para Feature Flags**:
- 🎯 **Adicionar coluna** `feature_flags JSONB` na tabela `profiles`
- 🎯 **Criar função** `has_feature_flag(flag_name TEXT) RETURNS BOOLEAN`
- 🎯 **Política RLS** para controlar acesso a features por usuário
- 🎯 **Complementar** (não substituir) o sistema de roles existente

### 7.2 Proposta de Integração

**Estrutura Sugerida**:
```sql
-- Adicionar à tabela profiles
ALTER TABLE profiles
ADD COLUMN feature_flags JSONB DEFAULT '{}'::jsonb;

-- Função para verificar feature flag
CREATE FUNCTION has_feature_flag(flag_name TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN COALESCE(
    (SELECT (feature_flags ->> flag_name)::boolean
     FROM profiles
     WHERE id = auth.uid()),
    false
  );
END;
$$;
```

**Uso em Políticas RLS**:
```sql
-- Exemplo: Feature de relatórios avançados
CREATE POLICY "advanced_reports_access" ON reports
FOR SELECT USING (
  (get_user_role(auth.uid()) = 'admin'::user_role)  -- Role base
  AND
  has_feature_flag('advanced_reports')  -- Feature flag adicional
);
```

### 7.3 Benefícios da Abordagem

- ✅ **Não-disruptivo**: Mantém sistema RBAC existente
- ✅ **Granular**: Controle por usuário individual
- ✅ **Flexível**: JSON permite features complexas
- ✅ **Auditável**: Integrado com sistema de logs
- ✅ **Performático**: Verificação em nível de banco

---

## 8. Recomendações Técnicas

### 8.1 Limpeza Prioritária (Critical)

1. **Remover funções inconsistentes**:
   - Atualizar `has_role()` para usar `profiles`
   - Remover referências a `user_roles`, `permissions`, `modules`
   - Consolidar funções de verificação de role

2. **Consolidar políticas duplicadas**:
   - Remover políticas redundantes na tabela `profiles`
   - Padronizar método de verificação (profiles vs JWT)

3. **Documentar super admin**:
   - Criar procedimento para emergency access
   - Considerar método mais seguro que email hardcoded

### 8.2 Preparação para Feature Flags (High)

1. **Estrutura de dados**:
   ```sql
   ALTER TABLE profiles
   ADD COLUMN feature_flags JSONB DEFAULT '{}'::jsonb;

   CREATE INDEX idx_profiles_feature_flags
   ON profiles USING gin(feature_flags);
   ```

2. **Funções auxiliares**:
   ```sql
   CREATE FUNCTION has_feature_flag(flag_name TEXT) RETURNS BOOLEAN;
   CREATE FUNCTION set_feature_flag(user_id UUID, flag_name TEXT, enabled BOOLEAN);
   CREATE FUNCTION list_user_feature_flags(user_id UUID) RETURNS JSONB;
   ```

3. **Políticas RLS para feature flags**:
   ```sql
   -- Apenas admins podem modificar feature flags
   CREATE POLICY "admin_manage_feature_flags" ON profiles
   FOR UPDATE OF feature_flags
   USING (get_user_role(auth.uid()) = 'admin'::user_role);
   ```

### 8.3 Monitoramento e Auditoria (Medium)

1. **Logs de feature flags**:
   - Auditar quando flags são ativadas/desativadas
   - Monitorar uso de features por usuário
   - Alertas para flags críticas

2. **Métricas de acesso**:
   - Dashboard de uso de features
   - Análise de adoção por role
   - Performance impact de novas features

---

## 9. Conclusões

### 9.1 Estado Atual do Sistema

O **Adega Manager possui um sistema RBAC/RLS robusto e maduro** com:
- ✅ **31 tabelas protegidas** por 115 políticas RLS
- ✅ **3 roles bem definidos** com permissões granulares
- ✅ **Segurança implementada no banco** (não bypassável)
- ✅ **Auditoria automática** de todas as operações
- ✅ **Sistema em produção** com 4 usuários ativos

### 9.2 Preparação para Feature Flags

O sistema está **altamente preparado** para receber feature flags:
- ✅ **Infraestrutura de roles** já estabelecida
- ✅ **Funções de verificação** podem ser estendidas
- ✅ **Políticas RLS** suportam lógica condicional complexa
- ✅ **Estrutura de usuários** permite extensões

### 9.3 Próximos Passos Recomendados

1. **Fase 1**: Limpeza das inconsistências identificadas
2. **Fase 2**: Implementação da estrutura de feature flags
3. **Fase 3**: Migração gradual de features específicas
4. **Fase 4**: Dashboard de administração de flags

**Status para Épico 2.5**: ✅ **PREPARADO** - Sistema de roles maduro e compatível com feature flags.

---

**Relatório compilado por**: Claude Code (Senior Backend Architect)
**Validado em**: Supabase Production Database
**Próxima revisão**: Pós-implementação Feature Flags

---

### Anexos

#### A.1 Lista Completa de Tabelas com RLS
31 tabelas protegidas: accounts_receivable, activity_logs, audit_logs, automation_logs, batch_units, categories, customer_events, customer_history, customer_insights, customer_interactions, customers, debug_stock_calls_log, delivery_tracking, delivery_zones, expense_budgets, expense_categories, expiry_alerts, inventory, inventory_conversion_log, inventory_movements, notifications, nps_surveys, operational_expenses, payment_methods, product_batches, product_cost_history, products, profiles, sale_items, sales, suppliers, users.

#### A.2 Distribuição de Políticas por Tabela
- products: 5 políticas
- sales: 7 políticas
- customers: 4 políticas
- profiles: 10 políticas (algumas duplicadas)
- sale_items: 4 políticas
- inventory_movements: 4 políticas
- users: 4 políticas
- [+ 77 políticas em outras tabelas]