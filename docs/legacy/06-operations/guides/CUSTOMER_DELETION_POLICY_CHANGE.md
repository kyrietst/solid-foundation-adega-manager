# Mudança na Política de Exclusão de Clientes

**Versão:** 1.0.0
**Data:** 19/10/2025
**Status:** ✅ IMPLEMENTADO
**Impacto:** Alto - Comportamento do sistema alterado

---

## 📋 Resumo Executivo

O sistema de exclusão de clientes foi alterado de **soft delete (padrão)** para **hard delete (padrão)** para evitar acúmulo desnecessário de dados no banco de dados. A exclusão agora remove permanentemente o cliente após confirmação explícita.

---

## 🎯 Problema Identificado

### Comportamento Anterior (Soft Delete Padrão)

```
Usuário clica "Excluir Cliente"
→ Sistema marca deleted_at (soft delete)
→ Registro permanece no banco
→ Admin vê clientes deletados
→ Employee não vê clientes deletados (RLS diferente)
→ Dados acumulando sem necessidade
```

**Problemas Detectados:**
- ✗ 4 clientes "deletados" ocupando espaço no banco DEV
- ✗ Inconsistência: Admin vê deletados, Employee não vê
- ✗ Confusão para usuário final (dona da Adega usando conta employee)
- ✗ Exclusão não parecia "efetiva" do ponto de vista do usuário

### Evidências

**Ambiente DEV:**
- Maria TESTE (deleted_at: 17/10/2025 01:07)
- João TESTE (deleted_at: 17/10/2025 01:00)
- Viviane TESTE (deleted_at: 17/10/2025 00:32)
- Fabíola TESTE (deleted_at: 16/10/2025 20:08)

**RLS Policies:**
```sql
-- Admin: Vê TODOS os clientes (incluindo deletados)
"Admin full access to customers" - SEM filtro deleted_at

-- Employee: Vê apenas clientes ativos
"Employee view active customers" - WHERE deleted_at IS NULL
```

---

## ✅ Solução Implementada

### Mudança de Comportamento Padrão

**Arquivo:** `src/features/customers/components/DeleteCustomerModal.tsx`

```typescript
// ANTES (Soft Delete Padrão)
mode = 'soft'

// DEPOIS (Hard Delete Padrão)
mode = 'hard'
```

### Novo Fluxo de Exclusão

```
Usuário clica "Excluir Cliente"
→ Modal exibe aviso crítico
→ Usuário deve digitar: "EXCLUIR PERMANENTEMENTE"
→ Sistema valida texto exato
→ Hard delete executado (remoção permanente do banco)
→ Vendas preservadas para fins fiscais (customer_id = NULL)
→ Audit log registra a operação
```

---

## 🔒 Garantias do Hard Delete

### Stored Procedure: `hard_delete_customer()`

**Recursos de Segurança:**

1. **Verificação de Permissão**
```sql
-- Apenas admin pode executar
SELECT role INTO v_user_role FROM profiles WHERE id = p_user_id;
IF v_user_role != 'admin' THEN
  RAISE EXCEPTION 'Apenas administradores podem realizar exclusão permanente';
END IF;
```

2. **Confirmação Obrigatória**
```sql
IF p_confirmation_text != 'EXCLUIR PERMANENTEMENTE' THEN
  RAISE EXCEPTION 'Texto de confirmação inválido';
END IF;
```

3. **Preservação de Vendas**
```sql
-- Vendas mantidas para fins fiscais
UPDATE sales SET customer_id = NULL WHERE customer_id = p_customer_id;
```

4. **Audit Trail**
```sql
INSERT INTO audit_logs (table_name, record_id, action, new_data, user_id)
VALUES ('customers', p_customer_id, 'hard_delete',
        jsonb_build_object('customer_name', v_customer_name), p_user_id);
```

---

## 🧹 Limpeza Realizada

### Ambiente DEV

```sql
-- Desvinculação de vendas
UPDATE sales SET customer_id = NULL
WHERE customer_id IN (SELECT id FROM customers WHERE deleted_at IS NOT NULL);

-- Exclusão permanente
DELETE FROM customers WHERE deleted_at IS NOT NULL;
```

**Resultado:**
- ✅ 4 clientes soft-deleted removidos
- ✅ 1 venda desvinculada e preservada
- ✅ 0 clientes restantes com deleted_at
- ✅ Banco limpo

---

## 🔄 Estrutura Preservada (Design Futuro)

### Métodos Mantidos no Hook

**Arquivo:** `src/features/customers/hooks/useCustomerDelete.ts`

```typescript
export const useCustomerDelete = () => {
  return {
    softDelete,    // ✅ Mantido para uso futuro
    hardDelete,    // ✅ Padrão atual
    restore,       // ✅ Mantido para restauração futura
  };
};
```

### Prop Mode Mantida

```typescript
export type DeleteMode = 'soft' | 'hard' | 'restore';

interface DeleteCustomerModalProps {
  mode?: DeleteMode; // ✅ Flexibilidade mantida
}
```

**Razão:** Preparado para ajustes futuros de permissões quando cliente retornar à conta admin.

---

## 📊 Comparação: Antes vs Depois

| Aspecto | Antes (Soft Delete) | Depois (Hard Delete) |
|---------|---------------------|----------------------|
| Confirmação | Digite nome do cliente | Digite "EXCLUIR PERMANENTEMENTE" |
| Registro no Banco | Marca deleted_at | Remove permanentemente |
| Visibilidade Admin | Vê deletados | Não vê (removido) |
| Visibilidade Employee | Não vê deletados | Não vê (removido) |
| Espaço no Banco | Acumula dados | Limpo |
| Reversibilidade | Sim (restore) | Não (irreversível) |
| Vendas | Preservadas | Preservadas (customer_id = NULL) |
| Audit Trail | Sim | Sim |

---

## ⚠️ Avisos Importantes

### Para Desenvolvedores

1. **Irreversibilidade**
   - Hard delete é PERMANENTE
   - Não há função de restauração após hard delete
   - Teste com cuidado em produção

2. **Vendas Preservadas**
   - Vendas nunca são deletadas
   - customer_id é setado para NULL
   - Dados fiscais mantidos intactos

3. **Audit Log**
   - Toda exclusão é registrada
   - Inclui: nome do cliente, contagem de vendas, timestamp

### Para Usuários

1. **Confirmação Rigorosa**
   - Digite exatamente: "EXCLUIR PERMANENTEMENTE"
   - Case-sensitive, sem espaços extras
   - Copiar/colar é recomendado

2. **Não Há Volta**
   - Cliente será removido permanentemente
   - Vendas serão desvinculadas mas preservadas
   - Considere bem antes de confirmar

---

## 🧪 Testes Recomendados

### Checklist de Validação

- [ ] Admin consegue excluir cliente com confirmação correta
- [ ] Employee consegue excluir cliente (se tiver permissão)
- [ ] Confirmação incorreta bloqueia exclusão
- [ ] Cliente desaparece da listagem após exclusão
- [ ] Vendas do cliente continuam visíveis (sem nome de cliente)
- [ ] Audit log registra a operação
- [ ] Métricas do sistema são atualizadas

### Script de Teste (DEV)

```sql
-- 1. Criar cliente teste
INSERT INTO customers (name, phone)
VALUES ('TESTE DELETE', '(11) 99999-9999');

-- 2. Criar venda para o cliente
-- (usar interface ou SQL)

-- 3. Executar hard delete via UI

-- 4. Verificar que cliente foi removido
SELECT * FROM customers WHERE name = 'TESTE DELETE';
-- Deve retornar 0 linhas

-- 5. Verificar que venda foi preservada
SELECT * FROM sales WHERE customer_id IS NULL;
-- Deve incluir a venda criada

-- 6. Verificar audit log
SELECT * FROM audit_logs
WHERE action = 'hard_delete'
ORDER BY created_at DESC
LIMIT 1;
```

---

## 📚 Referências

### Arquivos Relacionados

- `src/features/customers/hooks/useCustomerDelete.ts` - Hook de exclusão
- `src/features/customers/components/DeleteCustomerModal.tsx` - Modal de confirmação
- `supabase/migrations/*_hard_delete_customer.sql` - Stored procedure

### Documentação Relacionada

- `docs/07-changelog/CUSTOMER_SOFT_DELETE_SYSTEM_v3.2.0.md` - Sistema anterior
- `docs/IMPLEMENTACAO_VENDAS_HISTORICAS_RESUMO.md` - Contexto das mudanças

---

## 🔮 Planos Futuros

### Possíveis Ajustes

Quando cliente retornar à conta admin, pode-se:

1. **Restaurar Soft Delete para Admin**
   - Admin usa soft delete por padrão
   - Employee continua com hard delete
   - Implementar "Lixeira" para admin

2. **Toggle de Comportamento**
   - Configuração no perfil de admin
   - Escolher entre soft/hard delete
   - Persistir preferência no banco

3. **Permissões Granulares**
   - Admin pode restaurar
   - Employee não vê opção de restauração
   - Logs detalhados de quem fez o quê

---

## ✅ Checklist de Implementação

- [x] Mudar modo padrão de 'soft' para 'hard'
- [x] Limpar clientes soft-deleted do DEV
- [x] Validar stored procedure hard_delete_customer
- [x] Testar confirmação obrigatória
- [x] Verificar preservação de vendas
- [x] Confirmar audit logging
- [x] Documentar mudança
- [ ] Aplicar em produção
- [ ] Comunicar mudança aos usuários
- [ ] Monitorar primeiras exclusões

---

## 📞 Suporte

**Para Dúvidas:**
1. Consultar este documento
2. Revisar stored procedure `hard_delete_customer()`
3. Verificar audit logs
4. Contactar equipe de desenvolvimento

**Para Reverter (se necessário):**
```typescript
// Em DeleteCustomerModal.tsx linha 54
mode = 'soft' // Reverter para soft delete temporariamente
```

**IMPORTANTE:** Reversão deve ser temporária e bem documentada.
