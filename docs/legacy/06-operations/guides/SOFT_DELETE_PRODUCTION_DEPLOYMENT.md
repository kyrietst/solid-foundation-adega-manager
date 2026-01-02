# Guia de Deploy para Produção - Sistema de Soft Delete v3.2.0

**Data de Criação**: 17/10/2025
**Última Atualização**: 17/10/2025
**Status**: ✅ Validado em DEV
**Autor**: Claude + Luccas

---

## 🎯 Objetivo

Este guia fornece **instruções passo a passo** para deploy seguro do Sistema de Soft Delete em produção, incluindo todas as correções identificadas durante implementação em DEV.

---

## ⚠️ CRÍTICO - Leia Antes de Começar

### Problemas Encontrados no SQL Original

O arquivo `docs/sql/customer_soft_delete_system.sql` contém **erros** que causarão falhas em produção:

❌ **Erro 1**: Uso de coluna `changes` que não existe
✅ **Correção**: Usar `new_data` (coluna correta da tabela `audit_logs`)

❌ **Erro 2**: RLS policies antigas conflitantes
✅ **Correção**: Dropar policies antigas antes de criar novas

### Problemas Encontrados no Frontend

❌ **Erro 3**: `invalidateQueries` causa erro 406 em clientes deletados
✅ **Correção**: Usar `refetchType: 'none'` + `removeQueries` com predicate

❌ **Erro 4**: Import incorreto do `useToast`
✅ **Correção**: `@/shared/hooks/common/use-toast`

❌ **Erro 5**: Campo `customer?.cliente` não existe
✅ **Correção**: Usar `customer?.name`

❌ **Erro 6**: Validação fraca permite bypass
✅ **Correção**: Comparação exata sem normalização

---

## 📋 Pré-requisitos

Antes de iniciar o deploy, verifique:

- [ ] Acesso admin ao Supabase Production (projeto: `uujkzvbgnfzuzlztrzln`)
- [ ] Backup completo do banco de dados criado
- [ ] Código frontend testado e validado em DEV
- [ ] Todas as correções aplicadas (verificar com git diff)
- [ ] Janela de manutenção agendada (estimativa: 15 minutos)
- [ ] Plano de rollback preparado

---

## 🗄️ Parte 1: Deploy do Banco de Dados

### Passo 1.1: Criar Backup de Segurança

```bash
# Via Supabase CLI
supabase db dump -f backup_pre_soft_delete_$(date +%Y%m%d_%H%M%S).sql

# Ou via Dashboard
# Settings → Database → Backups → Create Backup
```

### Passo 1.2: Verificar Estrutura Atual

Execute no SQL Editor do Supabase Production:

```sql
-- Verificar se campos deleted_at/deleted_by JÁ existem
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'customers'
AND column_name IN ('deleted_at', 'deleted_by');

-- Verificar estrutura da tabela audit_logs
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'audit_logs'
AND column_name IN ('changes', 'new_data');

-- Verificar RLS policies existentes
SELECT policyname, cmd
FROM pg_policies
WHERE tablename = 'customers';
```

**Resultado Esperado:**
- `deleted_at` e `deleted_by` NÃO devem existir
- `audit_logs` deve ter `new_data` (NÃO `changes`)
- Deve haver policies antigas para employees/admin

### Passo 1.3: Executar SQL Corrigido

⚠️ **IMPORTANTE**: Use o SQL CORRIGIDO, não o original!

**Arquivo**: `docs/sql/customer_soft_delete_system_PRODUCTION.sql`

1. Acesse: https://supabase.com/dashboard/project/uujkzvbgnfzuzlztrzln/sql/new
2. Copie TODO o conteúdo do arquivo SQL corrigido
3. Cole no SQL Editor
4. Revise linha por linha (especialmente inserts no audit_logs)
5. Execute o script completo
6. Aguarde confirmação: "Success. No rows returned"

### Passo 1.4: Validar Deploy do Banco

```sql
-- 1. Verificar colunas criadas
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'customers'
AND column_name IN ('deleted_at', 'deleted_by');
-- Esperado: 2 linhas (deleted_at TIMESTAMPTZ NULL, deleted_by UUID NULL)

-- 2. Verificar índices criados
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'customers'
AND indexname IN ('idx_customers_active', 'idx_customers_deleted');
-- Esperado: 2 índices

-- 3. Verificar stored procedures
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_name IN (
  'soft_delete_customer',
  'restore_customer',
  'hard_delete_customer',
  'get_deleted_customers'
);
-- Esperado: 4 funções

-- 4. Verificar RLS policies
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'customers'
AND policyname IN (
  'Admin full access to customers',
  'Employee view active customers',
  'Employee update active customers',
  'Employee insert customers'
);
-- Esperado: 4 policies com filtro deleted_at

-- 5. Testar stored procedure
SELECT soft_delete_customer(
  '00000000-0000-0000-0000-000000000000'::UUID, -- ID fictício
  auth.uid()
);
-- Esperado: Erro "Cliente não encontrado" (comportamento correto)
```

---

## 💻 Parte 2: Deploy do Frontend

### Passo 2.1: Verificar Correções Aplicadas

Antes de fazer build, verifique se TODAS as correções estão no código:

```bash
# 1. Verificar import correto do useToast
grep -n "use-toast" src/features/customers/hooks/useCustomerDelete.ts
# Deve mostrar: @/shared/hooks/common/use-toast

# 2. Verificar uso de new_data (não changes)
grep -n "new_data" src/features/customers/hooks/useCustomerDelete.ts
# Deve ter ocorrências no INSERT do audit_logs

# 3. Verificar refetchType: 'none'
grep -n "refetchType: 'none'" src/features/customers/hooks/useCustomerDelete.ts
# Deve ter 2 ocorrências

# 4. Verificar customer?.name (não cliente)
grep -n "customer?.name" src/features/customers/components/CustomerProfile.tsx
# Deve mostrar linha com customerName prop

# 5. Verificar comparação exata
grep -n "confirmationText === customerName" src/features/customers/components/DeleteCustomerModal.tsx
# Deve ter comparação SEM normalização
```

### Passo 2.2: Build e Testes

```bash
# 1. Lint check
npm run lint
# Esperado: ✓ No warnings found

# 2. TypeScript check
npx tsc --noEmit
# Esperado: No errors

# 3. Build de produção
npm run build
# Esperado: Build completed successfully

# 4. Testar build localmente
npm run preview
# Acessar http://localhost:4173 e testar funcionalidade
```

### Passo 2.3: Deploy para Produção

```bash
# Seguir processo de deploy padrão do projeto
# (Exemplo: Vercel, Netlify, ou servidor próprio)

# Exemplo Vercel:
# vercel --prod

# Exemplo build manual:
# rsync -avz dist/ user@server:/var/www/adega-manager/
```

---

## 🧪 Parte 3: Testes Pós-Deploy

### Teste 1: Criar Cliente de Teste

```sql
-- Criar cliente temporário para testes
INSERT INTO customers (name, email, phone, created_at, updated_at)
VALUES (
  'TESTE Exclusão Sistema',
  'teste.exclusao@example.com',
  '(11) 99999-9999',
  NOW(),
  NOW()
)
RETURNING id, name, email;
-- Anotar o ID retornado
```

### Teste 2: Soft Delete via Interface

1. Acessar produção: https://seu-dominio.com
2. Ir para Clientes
3. Localizar "TESTE Exclusão Sistema"
4. Abrir perfil do cliente
5. Clicar no botão vermelho "Excluir"
6. **Verificar**:
   - [ ] Modal abre corretamente
   - [ ] Informações do cliente aparecem
   - [ ] Campo de confirmação solicita nome exato
7. Digitar: `TESTE Exclusão Sistema`
8. Clicar em "Excluir Cliente"
9. **Verificar**:
   - [ ] Toast verde de sucesso
   - [ ] Redirecionamento para /customers
   - [ ] Cliente NÃO aparece mais na lista
   - [ ] **Console do navegador: ZERO erros 406** 🎯

### Teste 3: Verificar Banco de Dados

```sql
-- Verificar se cliente foi marcado como deletado
SELECT id, name, deleted_at, deleted_by
FROM customers
WHERE name = 'TESTE Exclusão Sistema';
-- Esperado: deleted_at preenchido, deleted_by com UUID do usuário

-- Verificar auditoria
SELECT
  action,
  new_data->>'customer_name' as customer_name,
  new_data->>'sales_count' as sales_count,
  created_at
FROM audit_logs
WHERE record_id = 'ID_DO_CLIENTE_AQUI'::UUID
AND action = 'soft_delete';
-- Esperado: 1 registro com ação 'soft_delete'
```

### Teste 4: Verificar RLS (Permissões)

```sql
-- Login como employee e tentar buscar cliente deletado
SELECT * FROM customers
WHERE id = 'ID_DO_CLIENTE_AQUI'::UUID;
-- Esperado: 0 linhas (RLS bloqueou)

-- Login como admin e tentar listar deletados
SELECT * FROM get_deleted_customers();
-- Esperado: Lista incluindo o cliente de teste
```

### Teste 5: Restaurar Cliente (Opcional)

```sql
-- Restaurar cliente de teste
SELECT restore_customer(
  'ID_DO_CLIENTE_AQUI'::UUID,
  auth.uid()
);
-- Esperado: {"success": true, "customer_name": "TESTE Exclusão Sistema"}

-- Verificar se voltou para lista
SELECT id, name, deleted_at
FROM customers
WHERE name = 'TESTE Exclusão Sistema';
-- Esperado: deleted_at = NULL
```

### Teste 6: Limpeza

```sql
-- Remover cliente de teste
DELETE FROM customers
WHERE name = 'TESTE Exclusão Sistema';

-- Limpar auditoria de teste
DELETE FROM audit_logs
WHERE new_data->>'customer_name' = 'TESTE Exclusão Sistema';
```

---

## 🔄 Plano de Rollback

### Rollback de Emergência (< 30 minutos após deploy)

```sql
-- 1. Restaurar TODOS os clientes deletados
UPDATE customers
SET deleted_at = NULL, deleted_by = NULL
WHERE deleted_at IS NOT NULL;

-- 2. Remover políticas RLS
DROP POLICY IF EXISTS "Admin full access to customers" ON customers;
DROP POLICY IF EXISTS "Employee view active customers" ON customers;
DROP POLICY IF EXISTS "Employee update active customers" ON customers;
DROP POLICY IF EXISTS "Employee insert customers" ON customers;

-- 3. Recriar policies antigas (consultar backup)
CREATE POLICY "Employees can view customers" ON customers
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'employee')
  )
);

-- 4. Remover stored procedures
DROP FUNCTION IF EXISTS soft_delete_customer(UUID, UUID);
DROP FUNCTION IF EXISTS restore_customer(UUID, UUID);
DROP FUNCTION IF EXISTS hard_delete_customer(UUID, UUID, TEXT);
DROP FUNCTION IF EXISTS get_deleted_customers(UUID);

-- 5. Remover índices
DROP INDEX IF EXISTS idx_customers_active;
DROP INDEX IF EXISTS idx_customers_deleted;

-- 6. Remover colunas (ATENÇÃO: Perda de dados!)
ALTER TABLE customers
DROP COLUMN IF EXISTS deleted_at,
DROP COLUMN IF EXISTS deleted_by;
```

### Rollback do Frontend

```bash
# Reverter último commit
git revert HEAD

# Build e deploy da versão anterior
npm run build
# Deploy conforme processo padrão
```

---

## 📊 Checklist de Conclusão

Antes de considerar o deploy completo, marque todos os itens:

### Banco de Dados
- [ ] Backup de segurança criado
- [ ] SQL corrigido executado sem erros
- [ ] Colunas deleted_at e deleted_by criadas
- [ ] Índices idx_customers_active e idx_customers_deleted criados
- [ ] 4 stored procedures criadas e funcionando
- [ ] 4 RLS policies criadas com filtro deleted_at
- [ ] Teste de soft delete via SQL bem-sucedido

### Frontend
- [ ] Todas as 6 correções verificadas no código
- [ ] Lint passou sem warnings
- [ ] Build compilou sem erros
- [ ] Teste local da build bem-sucedido
- [ ] Deploy para produção concluído
- [ ] Cliente de teste excluído com sucesso
- [ ] ZERO erros 406 no console
- [ ] Toast de sucesso funcionando
- [ ] Redirecionamento após exclusão funcionando

### Validações
- [ ] RLS bloqueando clientes deletados para employees
- [ ] Auditoria registrando exclusões corretamente
- [ ] Restauração funcionando (teste opcional)
- [ ] Performance não degradou
- [ ] Cliente de teste removido do banco

---

## 🐛 Troubleshooting

Se encontrar problemas durante o deploy, consulte:

**Guia de Troubleshooting**: `docs/06-operations/troubleshooting/SOFT_DELETE_TROUBLESHOOTING.md`

### Problemas Comuns

**Erro: "column changes does not exist"**
→ Usar SQL corrigido com `new_data`

**Erro: 406 Not Acceptable no console**
→ Verificar correção do `refetchType: 'none'`

**Erro: "Cannot read property 'cliente' of undefined"**
→ Verificar correção `customer?.name`

**Validação sempre falha**
→ Verificar comparação exata sem normalização

---

## 📚 Referências

- **SQL Corrigido**: `docs/sql/customer_soft_delete_system_PRODUCTION.sql`
- **Troubleshooting**: `docs/06-operations/troubleshooting/SOFT_DELETE_TROUBLESHOOTING.md`
- **Changelog**: `docs/07-changelog/CUSTOMER_SOFT_DELETE_SYSTEM_v3.2.0.md`
- **Arquitetura SSoT**: `docs/02-architecture/SSOT_SYSTEM_ARCHITECTURE.md`

---

## 👥 Contatos

**Dúvidas ou Problemas?**
- Desenvolvedor: Luccas
- Assistente IA: Claude (Anthropic)
- Documentação: Este arquivo

---

## ✅ Status Final

Após completar todas as etapas:

```
Deploy Status: [ ] Em Progresso / [ ] Concluído / [ ] Rollback
Data do Deploy: ___/___/2025
Tempo Total: ___ minutos
Problemas Encontrados: _______________
Resolução: _______________
```

**Aprovação Final**: ___________________________
**Data**: ___/___/2025

---

**Última Atualização**: 17/10/2025
**Versão do Documento**: 1.0.0
