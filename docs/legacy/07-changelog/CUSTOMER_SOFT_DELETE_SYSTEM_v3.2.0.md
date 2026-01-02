# Changelog v3.2.0 - Sistema de Soft Delete para Clientes

**Data de Release**: 16/10/2025
**Tipo**: Minor (Nova Feature + Remoção de Coluna)
**Impacto**: Médio - Nova funcionalidade de exclusão + UI cleanup

---

## 🎯 Resumo Executivo

Versão focada em **exclusão segura de clientes** com sistema de soft delete enterprise-grade e **otimização da interface** da tabela de clientes.

**Principais Entregas:**
- ✅ Sistema completo de Soft Delete (exclusão lógica reversível)
- ✅ Modal de confirmação com informações de impacto
- ✅ Botão de exclusão integrado no CustomerProfile
- ✅ Remoção da coluna "Cidade" da tabela de clientes
- ✅ Auditoria completa de operações de exclusão
- ✅ 3 níveis de exclusão (Soft, Restore, Hard Delete)

---

## ✨ Novas Funcionalidades

### 1. **Sistema de Soft Delete**

Sistema enterprise de exclusão lógica que preserva dados históricos e permite restauração.

#### Componentes Criados:

**Hook: `useCustomerDelete`**
- Localização: `src/features/customers/hooks/useCustomerDelete.ts`
- Funcionalidades:
  - `softDelete()` - Exclusão lógica (padrão)
  - `restore()` - Restauração de cliente excluído
  - `hardDelete()` - Exclusão permanente (admin apenas)
  - `getCustomerInfo()` - Buscar informações antes de excluir

**Modal: `DeleteCustomerModal`**
- Localização: `src/features/customers/components/DeleteCustomerModal.tsx`
- Recursos:
  - 3 modos: soft | restore | hard
  - Confirmação com nome do cliente
  - Preview de informações de impacto (vendas, LTV, última compra)
  - Alertas contextuais baseados no modo
  - Loading states e validações

**Botão de Exclusão: `CustomerProfileHeader`**
- Localização: `src/features/customers/components/CustomerProfileHeader.tsx`
- Integração:
  - Novo handler `handleDelete()` no hook SSoT
  - Botão com tooltip e estilo de alerta
  - Evento customizado `openCustomerDeleteModal`
  - Responsivo (ícone apenas em mobile)

#### Schema do Banco de Dados:

**Novos campos na tabela `customers`:**
```sql
deleted_at    TIMESTAMPTZ DEFAULT NULL  -- Data da exclusão
deleted_by    UUID REFERENCES auth.users(id)  -- Usuário que excluiu
```

**Índices criados:**
```sql
idx_customers_active   -- Performance em queries de clientes ativos
idx_customers_deleted  -- Performance em listagem de excluídos
```

#### Stored Procedures:

**1. `soft_delete_customer(customer_id, user_id)`**
- Marca cliente como excluído
- Preserva histórico de vendas e insights
- Registra auditoria automática
- Retorna informações da operação

**2. `restore_customer(customer_id, user_id)`**
- Restaura cliente excluído
- Remove marcadores de exclusão
- Registra auditoria de restauração

**3. `hard_delete_customer(customer_id, user_id, confirmation_text)`**
- Exclusão permanente (ADMIN APENAS)
- Exige confirmação explícita
- Remove customer_insights, customer_interactions, customer_events
- Preserva vendas para fins fiscais
- Auditoria crítica obrigatória

**4. `get_deleted_customers(limit, offset)`**
- Lista clientes excluídos
- Informações completas + dias desde exclusão
- Paginação integrada

#### Políticas RLS:

**Policy: `customers_soft_delete_filter`**
- Tipo: SELECT
- Usuários: authenticated
- Regra: `deleted_at IS NULL`
- Propósito: Esconde clientes excluídos de queries normais

**Policy: `customers_admin_view_deleted`**
- Tipo: SELECT
- Usuários: admin
- Regra: `deleted_at IS NOT NULL AND role = 'admin'`
- Propósito: Permite admins visualizarem clientes excluídos

---

## 🗑️ Remoções

### Coluna "Cidade" Removida da Tabela de Clientes

A coluna "Cidade" foi removida da interface da tabela de clientes para simplificar a visualização.

**Arquivos Modificados:**
1. `src/features/customers/types/customer-table.types.ts`
   - Removido 'Cidade' de `TABLE_COLUMNS`

2. `src/features/customers/components/CustomerDataTable.tsx`
   - Removida coluna 'cidade' da configuração de colunas
   - Removido 'cidade' do type `SortField`

3. `src/features/customers/components/table-sections/CustomerTableColumns.tsx`
   - Removido ícone 📍 'cidade' do mapeamento

**Justificativa:**
- Campo raramente utilizado
- Informação de endereço completo ainda disponível no perfil detalhado
- Simplifica interface da tabela
- **Nota:** O campo continua existindo no banco de dados (`customers.address`)

---

## 🔧 Arquivos Criados

### Frontend

1. **src/features/customers/hooks/useCustomerDelete.ts** (230 linhas)
   - Hook completo para operações de exclusão
   - Integração com React Query para invalidação de cache
   - Toast notifications com mensagens contextuais
   - Type-safe com TypeScript

2. **src/features/customers/components/DeleteCustomerModal.tsx** (310 linhas)
   - Modal responsivo e acessível
   - 3 modos de operação (soft/restore/hard)
   - Preview de informações do cliente
   - Validações e confirmações
   - Loading states e error handling

### Backend (SQL)

3. **docs/sql/customer_soft_delete_system.sql** (470 linhas)
   - Script completo para executar no Supabase Dev
   - Schema changes com comentários
   - 4 stored procedures documentadas
   - 2 RLS policies
   - Testes comentados para validação

### Documentação

4. **docs/07-changelog/CUSTOMER_SOFT_DELETE_SYSTEM_v3.2.0.md** (Este arquivo)
   - Changelog completo
   - Instruções de deployment
   - Exemplos de uso

---

## 📝 Arquivos Modificados

### Funcionalidade de Exclusão

1. **src/features/customers/components/CustomerProfile.tsx**
   - Adicionado import `DeleteCustomerModal`
   - Adicionado estado `isDeleteModalOpen`
   - Adicionado event listener `openCustomerDeleteModal`
   - Adicionado handler `handleDeleteSuccess` com redirect
   - Renderizado modal de exclusão

2. **src/features/customers/components/CustomerProfileHeader.tsx**
   - Adicionado import `Trash2` icon
   - Adicionado botão "Excluir" com tooltip
   - Integração com `handleDelete` do hook

3. **src/shared/hooks/business/useCustomerProfileHeaderSSoT.ts**
   - Adicionado `handleDelete` na interface
   - Implementado `handleDelete` com CustomEvent
   - Exportado `handleDelete` no retorno do hook

### Remoção Coluna Cidade

4. **src/features/customers/types/customer-table.types.ts**
   - Linha 94: Removido 'Cidade' do array `TABLE_COLUMNS`

5. **src/features/customers/components/CustomerDataTable.tsx**
   - Linhas 773-782: Removida configuração da coluna 'cidade'
   - Linha 583: Removido 'cidade' do type `SortField`

6. **src/features/customers/components/table-sections/CustomerTableColumns.tsx**
   - Linha 54: Removido mapeamento de ícone 'cidade'

---

## 🚀 Deployment (INSTRUÇÕES IMPORTANTES)

### Passo 1: Executar SQL no Supabase Dev

**⚠️ ATENÇÃO: Execute este SQL ANTES de fazer deploy do frontend!**

1. Acesse: [Supabase Dashboard - SQL Editor](https://supabase.com/dashboard/project/goppneqeowgeehpqkcxe/sql/new)
2. Abra o arquivo: `docs/sql/customer_soft_delete_system.sql`
3. Copie TODO o conteúdo do arquivo
4. Cole no SQL Editor
5. Execute o script completo
6. Aguarde confirmação: "Schema atualizado com sucesso!"

**Validação:**
```sql
-- Verificar se campos foram criados
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'customers'
AND column_name IN ('deleted_at', 'deleted_by');

-- Verificar stored procedures
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name LIKE '%customer%';
```

### Passo 2: Build e Deploy do Frontend

```bash
# 1. Verificar lint
npm run lint

# 2. Build de produção
npm run build

# 3. Testar build local
npm run preview

# 4. Deploy para produção
# (Seguir processo de deploy padrão do projeto)
```

### Passo 3: Testes Pós-Deploy

**Testes obrigatórios:**

1. ✅ **Soft Delete**
   - Acessar perfil de um cliente de teste
   - Clicar em "Excluir"
   - Confirmar digitando o nome
   - Verificar que cliente sumiu da lista
   - Verificar que vendas foram preservadas

2. ✅ **Verificar Auditoria**
   ```sql
   SELECT * FROM audit_logs
   WHERE action = 'soft_delete'
   ORDER BY created_at DESC
   LIMIT 5;
   ```

3. ✅ **Restaurar Cliente (Admin)**
   ```sql
   -- Executar como admin
   SELECT restore_customer(
     'CUSTOMER_ID_AQUI'::UUID,
     auth.uid()
   );
   ```

4. ✅ **Verificar RLS**
   - Login como employee
   - Verificar que não vê clientes excluídos
   - Login como admin
   - Verificar que pode listar excluídos com função

---

## 🎨 Interface e UX

### Botão de Exclusão

**Localização:** CustomerProfileHeader (topo do perfil do cliente)
**Posição:** Última ação, após "Nova Venda"
**Estilo:**
- Border red-600/50
- Text red-400
- Hover: bg-red-900/20
- Icon: Trash2 (lucide-react)

**Responsividade:**
- Desktop: Ícone + texto "Excluir"
- Mobile: Apenas ícone

**Tooltip:**
- Texto: "Excluir cliente (reversível)"
- Cor: red-400/30 border
- z-index: 50000 (sempre visível)

### Modal de Confirmação

**Características:**
- Modal size: max-w-2xl
- Background: glassmorphism dark
- 3 seções principais:
  1. Header com ícone e título contextual
  2. Card de informações do cliente (vendas, LTV, última compra)
  3. Campo de confirmação com validação

**Validações:**
- Soft Delete: Digitar nome completo do cliente
- Hard Delete: Digitar "EXCLUIR PERMANENTEMENTE"
- Restore: Sem validação (confirmação simples)

**Estados:**
- Loading: Botão com spinner
- Success: Toast notification + redirect
- Error: Toast com mensagem de erro
- Disabled: Botão desabilitado se validação falhar

---

## 🔐 Segurança e Permissões

### Níveis de Acesso

**Soft Delete:**
- Permissão: authenticated
- Quem pode: Admin, Employee
- Reversível: Sim
- Auditoria: Sim

**Restore:**
- Permissão: authenticated
- Quem pode: Admin, Employee
- Auditoria: Sim

**Hard Delete:**
- Permissão: Admin apenas
- Quem pode: Apenas Admin
- Reversível: Não
- Auditoria: Crítica (registro permanente)

### Auditoria

Todos os eventos de exclusão são registrados em `audit_logs`:

```json
{
  "table_name": "customers",
  "record_id": "uuid",
  "action": "soft_delete|restore|hard_delete",
  "changes": {
    "customer_name": "string",
    "sales_count": number,
    "lifetime_value": number,
    "deleted_at": "timestamp",
    "deleted_by": "uuid"
  },
  "user_id": "uuid",
  "created_at": "timestamp"
}
```

---

## 📊 Impacto e Métricas

### Performance

**Antes:**
- Query de clientes: Sem filtro de deleted_at
- Índice: Apenas primary key

**Depois:**
- Query de clientes: WHERE deleted_at IS NULL (automático via RLS)
- Índice: `idx_customers_active` otimizado para clientes ativos
- Índice: `idx_customers_deleted` para listagem de excluídos

**Resultado Esperado:**
- 📈 Queries 15-20% mais rápidas (menos registros para varrer)
- 📉 Overhead de storage: < 1% (apenas timestamps e UUIDs)

### Dados Preservados

**O que é mantido após soft delete:**
- ✅ Registro completo do cliente (com marcador deleted_at)
- ✅ Histórico de vendas (intacto)
- ✅ Customer insights e interactions (intactos)
- ✅ Métricas de LTV e frequência (para reports)
- ✅ Auditoria completa de todas operações

**O que é removido após hard delete:**
- ❌ Registro do cliente (permanentemente)
- ❌ Customer insights
- ❌ Customer interactions
- ❌ Customer events
- ✅ Vendas PRESERVADAS (obrigação fiscal)

---

## 🧪 Casos de Uso

### Caso 1: Cliente Solicitou Exclusão (LGPD)

```typescript
// Soft delete mantém histórico para fins legais
await softDelete(customerId);

// Se cliente solicitar exclusão completa (direito ao esquecimento)
// Admin deve avaliar e executar hard delete manualmente
await hardDelete(customerId, 'EXCLUIR PERMANENTEMENTE');
```

### Caso 2: Cliente Duplicado

```typescript
// Marcar cliente duplicado como excluído
await softDelete(duplicateCustomerId);

// Se necessário, restaurar se foi erro
await restore(duplicateCustomerId);
```

### Caso 3: Cliente Inativo por Muito Tempo

```typescript
// Soft delete para limpeza, mas preserva histórico
await softDelete(inactiveCustomerId);

// Cliente volta após anos? Restaurar!
await restore(inactiveCustomerId);
```

---

## 🐛 Correções Pós-Implementação DEV (17/10/2025)

Durante a implementação em DEV, foram identificados **6 erros críticos** que precisaram ser corrigidos antes de aplicar em produção:

### Erro 1: Column "changes" does not exist
**Tipo**: Erro de SQL / Estrutura do banco
**Severidade**: 🔴 Crítica - Impede funcionamento

**Causa**: Stored procedures usavam `changes` mas a tabela `audit_logs` tem `new_data`

**Correção Aplicada**:
```sql
-- ❌ ERRADO (original)
INSERT INTO audit_logs (..., changes, ...) VALUES ...

-- ✅ CORRETO
INSERT INTO audit_logs (..., new_data, ...) VALUES ...
```

**Arquivos Afetados**:
- `docs/sql/customer_soft_delete_system.sql` (linhas 85, 161, 249)
- **✅ Criado SQL corrigido**: `docs/sql/customer_soft_delete_system_PRODUCTION.sql`

---

### Erro 2: Erro 406 após Exclusão
**Tipo**: Erro de Frontend / React Query
**Severidade**: 🟡 Alta - Causa lag e errors no console

**Causa**: `invalidateQueries` fazia refetch automático de clientes deletados, bloqueados por RLS

**Correção Aplicada**:
```typescript
// ❌ ERRADO - Causa refetch automático
await queryClient.invalidateQueries({ queryKey: ['customer', customerId] });

// ✅ CORRETO - Remove do cache e invalida sem refetch
queryClient.removeQueries({ queryKey: ['customer', customerId] });
await queryClient.invalidateQueries({
  queryKey: ['customer-table-data'],
  refetchType: 'none'  // Previne 406!
});
```

**Arquivos Afetados**:
- `src/features/customers/hooks/useCustomerDelete.ts` (linhas 65-92)

---

### Erro 3: Failed to resolve import use-toast
**Tipo**: Erro de Import / Path incorreto
**Severidade**: 🔴 Crítica - Build falha

**Causa**: Import usando caminho incorreto

**Correção Aplicada**:
```typescript
// ❌ ERRADO
import { useToast } from '@/shared/ui/primitives/use-toast';

// ✅ CORRETO
import { useToast } from '@/shared/hooks/common/use-toast';
```

**Arquivos Afetados**:
- `src/features/customers/hooks/useCustomerDelete.ts` (linha 13)

---

### Erro 4: Cannot read property 'cliente'
**Tipo**: Erro de Frontend / Campo incorreto
**Severidade**: 🔴 Crítica - Validação sempre falha

**Causa**: Componente usava `customer?.cliente` mas campo correto é `customer?.name`

**Correção Aplicada**:
```typescript
// ❌ ERRADO
customerName={customer?.cliente || ''}

// ✅ CORRETO
customerName={customer?.name || ''}
```

**Arquivos Afetados**:
- `src/features/customers/components/CustomerProfile.tsx` (linha 261)

---

### Erro 5: Validação sempre falha mesmo com nome correto
**Tipo**: Erro de Lógica / Segurança
**Severidade**: 🟡 Alta - UX ruim e segurança fraca

**Causa**: Validação com normalização removendo acentos (segurança fraca)

**Correção Aplicada**:
```typescript
// ❌ ERRADO - Normalização remove acentos
const normalize = (str) => str.trim().toLowerCase().normalize('NFD')...

// ✅ CORRETO - Comparação exata
const canConfirm = () => {
  return confirmationText === customerName;  // Exatamente igual!
};
```

**Arquivos Afetados**:
- `src/features/customers/components/DeleteCustomerModal.tsx` (linhas 114-123)

---

### Erro 6: Cliente excluído ainda aparece na tabela
**Tipo**: Erro de SQL / RLS Policies
**Severidade**: 🔴 Crítica - Sistema não funciona

**Causa**: RLS policies antigas não filtravam `deleted_at IS NULL`

**Correção Aplicada**:
```sql
-- ❌ ERRADO - Policy antiga sem filtro
CREATE POLICY "Employees can view customers"
ON customers FOR SELECT
USING (EXISTS (SELECT 1 FROM profiles WHERE ...));

-- ✅ CORRETO - Policy com filtro deleted_at
CREATE POLICY "Employee view active customers"
ON customers FOR SELECT
USING (
  deleted_at IS NULL  -- 🎯 Filtro crítico!
  AND EXISTS (SELECT 1 FROM profiles WHERE ...)
);
```

**Arquivos Afetados**:
- `docs/sql/customer_soft_delete_system_PRODUCTION.sql` (RLS policies section)

---

### 📚 Documentação das Correções

Toda essa experiência foi documentada em:

1. **Guia de Deploy**: `docs/06-operations/guides/SOFT_DELETE_PRODUCTION_DEPLOYMENT.md`
   - Passo a passo para produção
   - Checklist completo
   - Validações obrigatórias

2. **Guia de Troubleshooting**: `docs/06-operations/troubleshooting/SOFT_DELETE_TROUBLESHOOTING.md`
   - Análise detalhada de cada erro
   - Causa raiz e solução
   - Como debugar

3. **SQL Corrigido**: `docs/sql/customer_soft_delete_system_PRODUCTION.sql`
   - Versão pronta para produção
   - Todas correções aplicadas
   - Comentários explicativos

---

## 🔄 Rollback Plan

Se necessário reverter esta release:

### 1. Frontend Rollback
```bash
git revert HEAD
npm run build
# Deploy versão anterior
```

### 2. Database Rollback
```sql
-- Restaurar todos clientes excluídos
UPDATE customers
SET deleted_at = NULL, deleted_by = NULL
WHERE deleted_at IS NOT NULL;

-- Remover políticas RLS
DROP POLICY IF EXISTS customers_soft_delete_filter ON customers;
DROP POLICY IF EXISTS customers_admin_view_deleted ON customers;

-- Remover stored procedures
DROP FUNCTION IF EXISTS soft_delete_customer;
DROP FUNCTION IF EXISTS restore_customer;
DROP FUNCTION IF EXISTS hard_delete_customer;
DROP FUNCTION IF EXISTS get_deleted_customers;

-- Remover índices
DROP INDEX IF EXISTS idx_customers_active;
DROP INDEX IF EXISTS idx_customers_deleted;

-- Remover colunas (CUIDADO: dados serão perdidos)
ALTER TABLE customers
DROP COLUMN IF EXISTS deleted_at,
DROP COLUMN IF EXISTS deleted_by;
```

---

## 🎯 Próximos Passos (Futuras Melhorias)

Sugestões para versões futuras:

1. **Página de Clientes Excluídos (Admin)**
   - Lista completa de clientes excluídos
   - Filtros por data de exclusão, quem excluiu
   - Restauração em massa
   - Export para análise

2. **Automação de Hard Delete**
   - Cronjob para excluir permanentemente após X dias
   - Notificação antes da exclusão permanente
   - Backup automático antes de hard delete

3. **Analytics de Exclusões**
   - Dashboard com métricas de exclusões
   - Motivos de exclusão (adicionar campo)
   - Tendências e padrões

4. **Restauração Rápida**
   - Undo button temporário após exclusão
   - Histórico de operações recentes
   - Restaurar com um clique

5. **Exclusão em Lote**
   - Selecionar múltiplos clientes
   - Soft delete em lote
   - Progress bar para operações longas

---

## ✅ Checklist de Validação

Antes de considerar esta release como completa:

### Ambiente DEV
- [x] SQL corrigido executado no Supabase Dev
- [x] 6 correções aplicadas e validadas
- [x] Lint passou sem erros
- [x] Build compilou com sucesso
- [x] Testes manuais em Dev
  - [x] Soft delete funcionando
  - [x] Modal abrindo corretamente
  - [x] Confirmação validando nome (EXATAMENTE)
  - [x] Redirect após exclusão
  - [x] Auditoria registrada
  - [x] Cliente desaparece da tabela
  - [x] ZERO erros 406 no console

### Ambiente PROD (Aguardando)
- [ ] Backup de segurança criado
- [ ] SQL corrigido executado no Supabase Prod
- [ ] Stored procedures validadas
- [ ] RLS policies validadas
- [ ] Testes manuais em Prod
  - [ ] Funcionalidade testada com dados reais
  - [ ] RLS policies verificadas
  - [ ] Performance analisada
  - [ ] Cliente de teste excluído e removido

---

## 📚 Referências

- **Padrão SSoT v3.1.0**: `docs/02-architecture/SSOT_SYSTEM_ARCHITECTURE.md`
- **Customer Module**: `docs/03-modules/customers/`
- **RLS Policies**: `docs/09-api/RLS_POLICIES.md`
- **Audit System**: `docs/06-operations/guides/AUDIT_SYSTEM.md`

---

**Autor:** Claude + Luccas
**Reviewers:** Equipe Adega Manager
**Status:** ✅ **Validado em DEV - Pronto para Produção**

---

## 🚨 PRÓXIMOS PASSOS

**Deploy em Produção:**

1. ✅ **DEV**: Todas correções aplicadas e validadas
2. ⏳ **PROD**: Seguir guia de deploy
   - Arquivo: `docs/06-operations/guides/SOFT_DELETE_PRODUCTION_DEPLOYMENT.md`
   - SQL Corrigido: `docs/sql/customer_soft_delete_system_PRODUCTION.sql`
   - Troubleshooting: `docs/06-operations/troubleshooting/SOFT_DELETE_TROUBLESHOOTING.md`

**⚠️ IMPORTANTE**:
- NÃO use `customer_soft_delete_system.sql` (contém erros)
- USE `customer_soft_delete_system_PRODUCTION.sql` (versão corrigida)
