# Troubleshooting - Sistema de Soft Delete v3.2.0

**Data de Criação**: 17/10/2025
**Última Atualização**: 17/10/2025
**Status**: Baseado em erros reais encontrados em DEV
**Autor**: Claude + Luccas

---

## 🎯 Objetivo

Este guia documenta **todos os erros** encontrados durante a implementação do Sistema de Soft Delete no ambiente DEV, suas causas raízes e soluções aplicadas.

Use este documento para:
- 🔍 Diagnosticar problemas em produção
- 🛠️ Aplicar correções rápidas
- 📚 Entender o comportamento correto do sistema
- ⚡ Evitar erros já conhecidos

---

## 📋 Índice de Erros

1. [Erro 400: Column "changes" does not exist](#erro-400-column-changes-does-not-exist)
2. [Erro 406: Not Acceptable após Exclusão](#erro-406-not-acceptable-após-exclusão)
3. [Erro: Failed to resolve import use-toast](#erro-failed-to-resolve-import-use-toast)
4. [Erro: Cannot read property 'cliente'](#erro-cannot-read-property-cliente)
5. [Validação sempre falha mesmo com nome correto](#validação-sempre-falha-mesmo-com-nome-correto)
6. [Cliente excluído ainda aparece na tabela](#cliente-excluído-ainda-aparece-na-tabela)

---

## 🐛 Erro 1: Column "changes" does not exist

### Sintomas

```
ERROR: 42703: column "changes" of relation "audit_logs" does not exist
LINE 7:   changes,
          ^
```

**Console do navegador:**
```
POST https://xxx.supabase.co/rest/v1/rpc/soft_delete_customer 400 (Bad Request)
Erro ao excluir cliente: column "changes" of relation "audit_logs" does not exist
```

### Causa Raiz

A stored procedure `soft_delete_customer` estava tentando inserir dados na coluna `changes` da tabela `audit_logs`, mas esta coluna **não existe**.

**Estrutura real da tabela `audit_logs`:**
```sql
-- ❌ Coluna que NÃO existe:
changes jsonb

-- ✅ Coluna que EXISTE:
new_data jsonb
```

### Localização do Problema

**Arquivo**: `docs/sql/customer_soft_delete_system.sql`

**Linhas com erro:**
- Linha 85: `soft_delete_customer` usa `changes`
- Linha 161: `restore_customer` usa `changes`
- Linha 249: `hard_delete_customer` usa `changes`

### Solução

Substituir TODAS as ocorrências de `changes` por `new_data`:

```sql
-- ❌ ERRADO (original)
INSERT INTO audit_logs (
  table_name,
  record_id,
  action,
  changes,  -- ❌ Não existe!
  user_id,
  created_at
) VALUES (
  'customers',
  p_customer_id,
  'soft_delete',
  jsonb_build_object(...),
  p_user_id,
  NOW()
);

-- ✅ CORRETO
INSERT INTO audit_logs (
  table_name,
  record_id,
  action,
  new_data,  -- ✅ Coluna correta!
  user_id,
  created_at
) VALUES (
  'customers',
  p_customer_id,
  'soft_delete',
  jsonb_build_object(...),
  p_user_id,
  NOW()
);
```

### Validação

```sql
-- Verificar estrutura da tabela audit_logs
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'audit_logs'
AND column_name IN ('changes', 'new_data');

-- Resultado esperado:
-- column_name | data_type
-- new_data    | jsonb
```

### Prevenção

✅ Sempre verificar estrutura da tabela antes de escrever stored procedures
✅ Usar SQL corrigido: `docs/sql/customer_soft_delete_system_PRODUCTION.sql`

---

## 🐛 Erro 2: 406 Not Acceptable após Exclusão

### Sintomas

**Console do navegador (múltiplas linhas):**
```
GET https://xxx.supabase.co/rest/v1/customers?select=*&id=eq.CUSTOMER_ID 406 (Not Acceptable)
useCustomerDelete.ts:68
```

**Comportamento:**
- Exclusão aparenta funcionar (toast de sucesso)
- Cliente é marcado como deletado no banco
- Mas console mostra erro 406 repetidas vezes
- Pode causar lag na interface

### Causa Raiz

Após a exclusão, o React Query tentava fazer **refetch automático** de queries relacionadas ao cliente deletado.

Como as RLS policies bloqueiam acesso a clientes com `deleted_at IS NOT NULL`, o Supabase retorna **406 Not Acceptable**.

**Fluxo do problema:**
1. Cliente é excluído (soft delete)
2. `invalidateQueries` marca queries como stale
3. React Query faz **refetch automático**
4. RLS bloqueia acesso ao cliente deletado
5. Supabase retorna 406

### Localização do Problema

**Arquivo**: `src/features/customers/hooks/useCustomerDelete.ts`

**Código problemático (linha 65-70):**
```typescript
// ❌ ERRADO - Causa refetch automático
await queryClient.invalidateQueries({ queryKey: ['customer-table-data'] });
await queryClient.invalidateQueries({ queryKey: ['customers'] });
await queryClient.invalidateQueries({ queryKey: ['customer', customerId] });
```

### Solução

**Parte 1**: Remover queries do cache sem refetch

```typescript
// ✅ CORRETO - Remove do cache sem refetch
queryClient.removeQueries({ queryKey: ['customer', customerId] });
queryClient.removeQueries({
  predicate: (query) => {
    const key = query.queryKey;
    return Array.isArray(key) && (
      key.includes(customerId) ||
      (key[0] === 'customers' && key.length > 1)
    );
  }
});
```

**Parte 2**: Invalidar com `refetchType: 'none'`

```typescript
// ✅ Marca como stale SEM fazer refetch automático
await queryClient.invalidateQueries({
  queryKey: ['customer-table-data'],
  refetchType: 'none'  // 🎯 Esta linha previne o erro 406!
});

await queryClient.invalidateQueries({
  queryKey: ['customers'],
  refetchType: 'none'
});
```

**Parte 3**: Refetch manual apenas da tabela principal

```typescript
// ✅ Refetch manual APENAS da query que sabemos que funciona
await queryClient.refetchQueries({
  queryKey: ['customer-table-data'],
  type: 'active'
});
```

### Código Completo Corrigido

```typescript
// Soft delete - Versão corrigida
const softDelete = async (customerId: string) => {
  // ... código de exclusão ...

  // ✅ Remover TODAS as queries relacionadas
  queryClient.removeQueries({ queryKey: ['customer', customerId] });
  queryClient.removeQueries({
    predicate: (query) => {
      const key = query.queryKey;
      return Array.isArray(key) && (
        key.includes(customerId) ||
        (key[0] === 'customers' && key.length > 1)
      );
    }
  });

  // ✅ Invalidar SEM refetch automático
  await queryClient.invalidateQueries({
    queryKey: ['customer-table-data'],
    refetchType: 'none'
  });
  await queryClient.invalidateQueries({
    queryKey: ['customers'],
    refetchType: 'none'
  });

  // ✅ Refetch manual apenas da tabela principal
  await queryClient.refetchQueries({
    queryKey: ['customer-table-data'],
    type: 'active'
  });

  // ... resto do código ...
};
```

### Validação

1. Excluir um cliente
2. Abrir DevTools (F12) → Console
3. Verificar que **NÃO há** erros 406
4. Verificar que cliente sumiu da tabela

### Prevenção

✅ Sempre usar `refetchType: 'none'` ao invalidar queries de dados deletados
✅ Remover queries específicas do cache antes de invalidar listas

---

## 🐛 Erro 3: Failed to resolve import use-toast

### Sintomas

```
[plugin:vite:import-analysis] Failed to resolve import "@/shared/ui/primitives/use-toast"
from "src/features/customers/hooks/useCustomerDelete.ts"
```

**Comportamento:**
- Build falha
- Vite dev server não inicia
- Erro de módulo não encontrado

### Causa Raiz

Import usando caminho incorreto. O hook `useToast` está localizado em `@/shared/hooks/common/use-toast`, não em `@/shared/ui/primitives/use-toast`.

### Localização do Problema

**Arquivo**: `src/features/customers/hooks/useCustomerDelete.ts`
**Linha**: 13

```typescript
// ❌ ERRADO - Caminho incorreto
import { useToast } from '@/shared/ui/primitives/use-toast';

// ✅ CORRETO - Caminho correto
import { useToast } from '@/shared/hooks/common/use-toast';
```

### Solução

Atualizar o import na linha 13:

```typescript
// useCustomerDelete.ts
import { useToast } from '@/shared/hooks/common/use-toast';  // ✅
```

### Validação

```bash
# Verificar se o arquivo existe no caminho correto
ls -la src/shared/hooks/common/use-toast.ts

# Verificar se o import está correto
grep -n "use-toast" src/features/customers/hooks/useCustomerDelete.ts

# Deve mostrar:
# 13:import { useToast } from '@/shared/hooks/common/use-toast';
```

### Prevenção

✅ Usar autocomplete do IDE para imports
✅ Verificar estrutura de pastas antes de fazer imports manuais

---

## 🐛 Erro 4: Cannot read property 'cliente'

### Sintomas

```
TypeError: Cannot read properties of undefined (reading 'cliente')
```

**Comportamento:**
- Modal de exclusão abre
- Campo de confirmação está vazio
- Validação sempre falha mesmo digitando nome correto

### Causa Raiz

O componente `CustomerProfile` estava passando `customer?.cliente` como prop `customerName`, mas a interface `CustomerProfile` do hook `use-crm` **não tem** campo `cliente`.

**Campo correto**: `customer?.name`

### Localização do Problema

**Arquivo**: `src/features/customers/components/CustomerProfile.tsx`
**Linha**: 261

```typescript
// ❌ ERRADO - Campo não existe
<DeleteCustomerModal
  isOpen={isDeleteModalOpen}
  onClose={() => setIsDeleteModalOpen(false)}
  customerId={id || null}
  customerName={customer?.cliente || ''}  // ❌ Não existe!
  mode="soft"
  onSuccess={handleDeleteSuccess}
/>

// ✅ CORRETO - Campo correto
<DeleteCustomerModal
  isOpen={isDeleteModalOpen}
  onClose={() => setIsDeleteModalOpen(false)}
  customerId={id || null}
  customerName={customer?.name || ''}  // ✅ Campo correto!
  mode="soft"
  onSuccess={handleDeleteSuccess}
/>
```

### Solução

Atualizar linha 261:

```typescript
customerName={customer?.name || ''}  // ✅
```

### Validação

```typescript
// Verificar tipo do customer no hook use-crm
// Interface esperada:
interface CustomerProfile {
  id: string;
  name: string;  // ✅ Este é o campo correto
  email: string | null;
  phone: string | null;
  // ... outros campos
}
```

```bash
# Verificar se a correção foi aplicada
grep -n "customerName={customer" src/features/customers/components/CustomerProfile.tsx

# Deve mostrar:
# 261:  customerName={customer?.name || ''}
```

### Prevenção

✅ Usar TypeScript types para validar propriedades
✅ Habilitar strict mode no TypeScript
✅ Usar auto complete do IDE

---

## 🐛 Erro 5: Validação sempre falha mesmo com nome correto

### Sintomas

**Comportamento:**
- Usuário digita nome EXATAMENTE como mostrado
- Mensagem "Texto de confirmação incorreto" não desaparece
- Botão "Excluir Cliente" permanece desabilitado
- Mesmo copiando e colando o nome, validação falha

**Exemplo:**
```
Nome do cliente: "Fabíola TESTE"
Usuário digita: "Fabíola TESTE"
Resultado: ❌ Validação falha (incorreto!)
```

### Causa Raiz

**Problema 1**: Campo `customerName` vazio (ver Erro 4)
**Problema 2**: Validação usando **normalização** que remove acentos

```typescript
// ❌ ERRADO - Normalização remove acentos
const normalize = (str: string) => {
  return str
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');  // Remove acentos!
};

// Resultado:
// "Fabíola TESTE" → "fabiola teste"
// "Fabíola TESTE" → "fabiola teste"
// Strings diferentes viram iguais (problema para segurança!)
```

### Localização do Problema

**Arquivo**: `src/features/customers/components/DeleteCustomerModal.tsx`
**Linha**: 114-123

### Solução

Usar **comparação exata** sem normalização:

```typescript
// ✅ CORRETO - Comparação exata
const canConfirm = () => {
  if (mode === 'hard') {
    return confirmationText === 'EXCLUIR PERMANENTEMENTE';
  }
  if (mode === 'soft') {
    // Comparação exata: deve ser idêntico (com acentos, maiúsculas, espaços)
    return confirmationText === customerName;
  }
  return true; // restore não precisa confirmação
};
```

**UI aprimorada para facilitar digitação:**

```typescript
{/* Caixa destacada mostrando o nome exato */}
{mode === 'soft' && (
  <div className="bg-gray-700/50 border-2 border-yellow-500/50 rounded-lg p-3">
    <p className="text-xs text-gray-400 mb-1">Nome a ser digitado:</p>
    <p className="text-lg font-bold text-white font-mono select-all">
      {config.confirmText}
    </p>
    <p className="text-xs text-yellow-400 mt-1">
      ⚠️ Copie ou digite exatamente como mostrado acima
    </p>
  </div>
)}
```

### Validação

```typescript
// Testar validação
const testCases = [
  { input: 'Fabíola TESTE', expected: 'Fabíola TESTE', shouldPass: true },
  { input: 'fabiola teste', expected: 'Fabíola TESTE', shouldPass: false },
  { input: 'Fabiola TESTE', expected: 'Fabíola TESTE', shouldPass: false },
  { input: 'Fabíola TESTE ', expected: 'Fabíola TESTE', shouldPass: false },
];

testCases.forEach(({ input, expected, shouldPass }) => {
  const result = input === expected;
  console.assert(result === shouldPass, `Test failed for "${input}"`);
});
```

### Prevenção

✅ Sempre usar comparação exata para validações de segurança
✅ Fornecer UI clara mostrando texto esperado
✅ Permitir copiar/colar do texto de referência

---

## 🐛 Erro 6: Cliente excluído ainda aparece na tabela

### Sintomas

**Comportamento:**
- Exclusão bem-sucedida (toast verde)
- Cliente marcado como `deleted_at IS NOT NULL` no banco
- Mas cliente **ainda aparece** na tabela de clientes
- Mesmo após recarregar a página (F5)

### Causa Raiz

RLS policies antigas **não filtram** clientes com `deleted_at IS NOT NULL`.

**Policies antigas problemáticas:**
```sql
-- ❌ ERRADO - Não filtra deleted_at
CREATE POLICY "Employees can view customers" ON customers
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'employee')
  )
);
-- Esta policy permite ver TODOS os clientes, inclusive deletados!
```

### Localização do Problema

Banco de dados - RLS policies na tabela `customers`

### Solução

**Passo 1**: Dropar policies antigas

```sql
DROP POLICY IF EXISTS "Employees can view customers" ON customers;
DROP POLICY IF EXISTS "Staff can manage customers" ON customers;
DROP POLICY IF EXISTS "Admin can manage all customers" ON customers;
DROP POLICY IF EXISTS "Employees can update customers" ON customers;
```

**Passo 2**: Criar policies com filtro `deleted_at IS NULL`

```sql
-- ✅ CORRETO - Filtra clientes deletados
CREATE POLICY "Employee view active customers"
ON customers FOR SELECT TO authenticated
USING (
  deleted_at IS NULL  -- 🎯 Filtro crítico!
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('employee', 'admin')
  )
);

CREATE POLICY "Employee update active customers"
ON customers FOR UPDATE TO authenticated
USING (
  deleted_at IS NULL  -- 🎯 Filtro crítico!
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('employee', 'admin')
  )
);

-- Admin tem acesso total (incluindo deletados)
CREATE POLICY "Admin full access to customers"
ON customers FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);
```

### Validação

```sql
-- Verificar policies ativas
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'customers'
ORDER BY policyname;

-- Verificar se deleted_at IS NULL está presente
SELECT policyname
FROM pg_policies
WHERE tablename = 'customers'
AND qual LIKE '%deleted_at IS NULL%';
-- Esperado: Policies de SELECT e UPDATE para employees
```

### Prevenção

✅ Sempre incluir filtro `deleted_at IS NULL` em policies de SELECT/UPDATE
✅ Testar policies após criação com usuário employee
✅ Verificar que clientes deletados não aparecem em queries normais

---

## 📊 Resumo de Todas as Correções

| # | Erro | Arquivo | Linha | Correção |
|---|------|---------|-------|----------|
| 1 | column "changes" does not exist | SQL | 85, 161, 249 | `changes` → `new_data` |
| 2 | Erro 406 após exclusão | useCustomerDelete.ts | 65-70 | `refetchType: 'none'` + `removeQueries` |
| 3 | Failed to resolve import | useCustomerDelete.ts | 13 | `@/shared/hooks/common/use-toast` |
| 4 | Cannot read 'cliente' | CustomerProfile.tsx | 261 | `customer?.cliente` → `customer?.name` |
| 5 | Validação sempre falha | DeleteCustomerModal.tsx | 114-123 | Remover normalização |
| 6 | Cliente ainda aparece | SQL/RLS | Policies | Adicionar `deleted_at IS NULL` |

---

## 🔍 Debugging Tips

### Verificar Estado do Sistema

```sql
-- Verificar clientes deletados
SELECT id, name, deleted_at, deleted_by
FROM customers
WHERE deleted_at IS NOT NULL;

-- Verificar auditoria
SELECT
  action,
  new_data->>'customer_name' as customer,
  created_at
FROM audit_logs
WHERE action IN ('soft_delete', 'restore', 'hard_delete')
ORDER BY created_at DESC
LIMIT 10;

-- Verificar RLS policies
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'customers';

-- Verificar stored procedures
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_name LIKE '%customer%';
```

### Debugging no Frontend

```javascript
// Adicionar logs temporários
console.log('Customer data:', customer);
console.log('Customer name field:', customer?.name);
console.log('Confirmation text:', confirmationText);
console.log('Can confirm:', canConfirm());

// Verificar queries no React Query DevTools
// Instalar: npm install @tanstack/react-query-devtools
// Importar e usar: <ReactQueryDevtools />
```

---

## 📚 Referências

- **Deploy Guide**: `docs/06-operations/guides/SOFT_DELETE_PRODUCTION_DEPLOYMENT.md`
- **SQL Corrigido**: `docs/sql/customer_soft_delete_system_PRODUCTION.sql`
- **Changelog**: `docs/07-changelog/CUSTOMER_SOFT_DELETE_SYSTEM_v3.2.0.md`

---

## ✅ Checklist de Validação

Use esta checklist para confirmar que todas as correções foram aplicadas:

- [ ] SQL usa `new_data` ao invés de `changes`
- [ ] Hook usa `refetchType: 'none'` nas invalidações
- [ ] Import do `useToast` está correto
- [ ] `customerName` usa `customer?.name`
- [ ] Validação usa comparação exata (sem normalização)
- [ ] RLS policies filtram `deleted_at IS NULL`
- [ ] Cliente de teste excluído desaparece da tabela
- [ ] Console sem erros 406

---

**Última Atualização**: 17/10/2025
**Versão do Documento**: 1.0.0
