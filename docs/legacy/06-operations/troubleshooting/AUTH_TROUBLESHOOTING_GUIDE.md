# Guia de Troubleshooting - Autenticação (AuthContext)

**Última Atualização**: 08/11/2025 (v3.5.0)
**Arquivo Principal**: `src/app/providers/AuthContext.tsx`
**Ambiente**: Supabase Auth + Row Level Security (RLS) + Edge Functions

---

## 📋 Índice

1. [Problemas Comuns](#problemas-comuns)
2. [Reset de Senha Administrativo (Edge Function)](#reset-de-senha-administrativo-edge-function)
3. [Fluxo de Senha Temporária](#fluxo-de-senha-temporária)
4. [Diagnóstico Sistemático](#diagnóstico-sistemático)
5. [Correções Aplicadas (v3.2.1)](#correções-aplicadas-v321)
6. [Logs e Como Interpretá-los](#logs-e-como-interpretá-los)
7. [Ferramentas de Debug](#ferramentas-de-debug)
8. [FAQ](#faq)

---

## 🔍 Problemas Comuns

### 1. ⏰ Timeout na Busca do Perfil (6-10 segundos)

**Sintoma:**
```
⏰ AuthProvider - Timeout de 6s na busca do perfil, forçando fallback
⚠️ AuthProvider - Timeout ou erro na busca do perfil, usando fallback
```

**Causa Raiz:** Race condition - AuthContext tenta buscar perfil ENQUANTO Supabase Auth ainda está refreshing JWT token.

**Stack Trace Típico:**
```
Supabase Auth: _initialize
Supabase Auth: _recoverAndRefresh  ← JWT ainda não está pronto
AuthContext: fetchUserProfile       ← Tenta buscar com JWT incompleto
Result: Profile query timeout
```

**Solução (✅ Corrigida em v3.2.1):**
```typescript
// ✅ Aguardar refresh ANTES de buscar perfil
await supabase.auth.refreshSession();  // WAIT for JWT
const { data: { session } } = await supabase.auth.getSession();

if (session?.user) {
  await fetchUserProfile(session.user);
}
```

**Como Validar:**
- Login deve completar em < 2 segundos
- Sem logs de timeout em amarelo
- Perfil carregado imediatamente

---

### 2. ⚠️ Warning "Auth session missing!"

**Sintoma:**
```
⚠️ AuthProvider - Erro ao renovar sessão: Auth session missing!
```

**Quando Aparece:**
- Primeira visita ao site (sem sessão)
- Após logout completo
- Janela anônima

**Causa:** Sistema tentava renovar sessão ANTES de verificar se existe.

**Solução (✅ Corrigida em v3.2.1):**
```typescript
// ✅ VERIFICAR se existe sessão ANTES de renovar
const { data: { session: currentSession } } = await supabase.auth.getSession();

if (currentSession) {
  await supabase.auth.refreshSession();
} else {
  console.log('ℹ️ Nenhuma sessão ativa (primeira visita ou após logout)');
}
```

**Como Validar:**
- Abrir site em janela anônima
- Deve ver log informativo azul, não warning amarelo
- Redirecionamento suave para `/auth`

---

### 3. 🔄 Queries Redundantes de Perfil

**Sintoma:**
- Duas queries idênticas no Network tab do DevTools
- Performance lenta em troca de senha temporária

**Causa:** Hook `onTemporaryPasswordChanged` fazia query duplicada.

**Solução (✅ Corrigida em v3.2.1):**
```typescript
// ❌ ANTES: 2 queries
await fetchUserProfile(latestUser);
const { data: profileData } = await supabase
  .from('profiles')
  .select('is_temporary_password')
  .eq('id', currentUser)
  .single();

// ✅ DEPOIS: 1 query
await fetchUserProfile(latestUser);
// fetchUserProfile já buscou todos os campos necessários
```

---

### 4. 🔐 Erro PGRST301 - JWT Claims Error

**Sintoma:**
```
⚠️ AuthProvider - Erro de autenticação (PGRST301)
```

**Causa Raiz:** JWT token expirado ou inválido.

**Solução Automática (✅ Implementada em v3.2.1):**
```typescript
const isJWTError =
  profileError.code === 'PGRST301' ||
  profileError.message?.toLowerCase().includes('jwt') ||
  profileError.message?.toLowerCase().includes('token');

if (isJWTError && retryCount === 0) {
  console.warn('⏳ Erro de JWT detectado, aguardando 2s para retry...');
  await new Promise(resolve => setTimeout(resolve, 2000));
  return fetchProfileOperation(1);  // Retry uma vez
}
```

**Como Validar:**
- Sistema deve recuperar automaticamente
- Máximo 1 retry (não loops infinitos)
- Sucesso após 2 segundos de espera

---

### 5. 🚫 Usuário Bloqueado por RLS Policy Bugada

**Sintoma:**
- Usuário `funcionario@adega.com` não consegue acessar perfil
- Timeout constante
- Profile não carrega

**Causa Raiz (✅ Corrigida em v3.2.1):**
Policy tinha condição impossível:
```sql
-- ❌ BUGADO: funcionario@adega.com tem role 'employee', não 'delivery'
(email = 'funcionario@adega.com' AND role = 'delivery')
```

**Solução:**
Policy otimizada sem condições bugadas:
```sql
-- ✅ CORRETO: Apenas 2 condições válidas
CREATE POLICY profiles_select_optimized
ON public.profiles FOR SELECT
USING (
  auth.uid() = id
  OR
  (auth.jwt() ->> 'email') = 'adm@adega.com'
);
```

**Como Validar:**
- Login com `funcionario@adega.com` deve funcionar
- Perfil carregado em < 2s
- Sem timeouts

---

## 🔐 Reset de Senha Administrativo (Edge Function)

### Arquitetura Moderna (v3.5.0+)

**Componente:** Edge Function `admin-reset-password` + `UserList.tsx`
**Substituiu:** RPC obsoleta `admin_reset_user_password` (removida em 08/11/2025)

### Como Funciona

**1. Admin Reseta Senha (`UserList.tsx`)**
```typescript
// Gera senha temporária (8 caracteres)
const tempPassword = generateTemporaryPassword();

// Chama Edge Function
const response = await fetch(
  `${VITE_SUPABASE_URL}/functions/v1/admin-reset-password`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userId: userId,
      newPassword: tempPassword,
    }),
  }
);
```

**2. Edge Function Executa (Servidor)**
```typescript
// Valida que solicitante é admin
const { data: profile } = await supabaseClient
  .from('profiles')
  .select('role')
  .eq('id', user.id)
  .single();

if (profile.role !== 'admin') {
  return 403; // Forbidden
}

// Reseta senha usando SERVICE_ROLE key (seguro no servidor)
await supabaseAdmin.auth.admin.updateUserById(
  userId,
  { password: newPassword }
);

// ⚠️ CRÍTICO: Define flag de senha temporária
await supabaseAdmin
  .from('profiles')
  .update({ is_temporary_password: true })
  .eq('id', userId);
```

**3. Próximo Login do Usuário**
- `AuthContext` detecta `is_temporary_password: true`
- `TempPasswordHandler` exibe modal forçando troca
- Usuário não consegue fechar modal sem trocar senha

### Segurança

✅ **SERVICE_ROLE key nunca exposta** - Fica protegida no servidor Edge Function
✅ **Validação de admin** - Apenas usuários com `role = 'admin'` podem resetar
✅ **JWT token obrigatório** - Request precisa de autenticação
✅ **Rate limiting** - Supabase aplica limite automático
✅ **CORS configurado** - Apenas origens permitidas

### Problema Comum: Modal de Senha Temporária Não Aparece

**Sintoma:**
- Admin reseta senha com sucesso
- Usuário faz login com senha temporária
- Sistema NÃO exibe modal forçando troca de senha

**Causa Raiz (Bug P0 - Corrigido em v3.5.0):**
Edge Function estava resetando senha mas **NÃO estava definindo** `is_temporary_password = true`.

**Como Diagnosticar:**
```sql
-- Verificar flag no banco
SELECT id, email, is_temporary_password
FROM profiles
WHERE email = 'usuario@example.com';

-- Deve retornar: is_temporary_password = true
```

**Como Corrigir:**
Se flag não foi definida, pode ser definida manualmente:
```sql
UPDATE profiles
SET is_temporary_password = true
WHERE id = 'user-uuid-aqui';
```

**Validar Correção:**
1. Admin reseta senha via UserList
2. Verificar no banco: `is_temporary_password = true`
3. Usuário faz login
4. Modal deve aparecer IMEDIATAMENTE

### Logs Esperados (Edge Function)

**Sucesso:**
```
✅ Password reset successful for user: user@example.com
✅ Temporary password flag set successfully
```

**Erro de Permissão:**
```
❌ Error: Forbidden - admin role required
Status: 403
```

**Erro de Flag:**
```
⚠️ Password was reset but temporary flag could not be set
Error setting temporary password flag: {...}
```

---

## 🔄 Fluxo de Senha Temporária

### Componentes Envolvidos

1. **`admin-reset-password` (Edge Function)** - Define `is_temporary_password = true`
2. **`AuthContext.tsx`** - Lê flag e popula `hasTemporaryPassword`
3. **`TempPasswordHandler.tsx`** - Detecta flag e exibe modal
4. **`ChangeTemporaryPasswordModal.tsx`** - Modal de troca forçada

### Fluxo Completo

```
┌─────────────────────────────────────────────────────────────┐
│ FASE 1: ADMIN RESETA SENHA                                  │
├─────────────────────────────────────────────────────────────┤
│ 1. Admin abre UserList.tsx                                  │
│ 2. Clica "Resetar Senha" no usuário                         │
│ 3. Edge Function executa:                                   │
│    - auth.admin.updateUserById(userId, { password })        │
│    - UPDATE profiles SET is_temporary_password = true       │
│ 4. Modal exibe senha temporária para admin copiar          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ FASE 2: USUÁRIO FAZ LOGIN                                   │
├─────────────────────────────────────────────────────────────┤
│ 1. Usuário abre /auth                                       │
│ 2. Digita email + senha temporária                          │
│ 3. Supabase valida credenciais                              │
│ 4. Login bem-sucedido                                       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ FASE 3: AUTHCONTEXT DETECTA FLAG                            │
├─────────────────────────────────────────────────────────────┤
│ AuthContext.tsx (linha 247):                                │
│ const { data: profileData } = await supabase                │
│   .from('profiles')                                         │
│   .select('role, is_temporary_password, feature_flags')     │
│   .eq('id', user.id)                                        │
│   .single();                                                │
│                                                              │
│ setHasTemporaryPassword(                                    │
│   profileData.is_temporary_password || false                │
│ );                                                          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ FASE 4: MODAL APARECE AUTOMATICAMENTE                       │
├─────────────────────────────────────────────────────────────┤
│ TempPasswordHandler.tsx:                                    │
│ const { hasTemporaryPassword } = useAuth();                 │
│                                                              │
│ if (hasTemporaryPassword) {                                 │
│   return <ChangeTemporaryPasswordModal />                   │
│ }                                                           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ FASE 5: USUÁRIO TROCA SENHA                                 │
├─────────────────────────────────────────────────────────────┤
│ ChangeTemporaryPasswordModal.tsx:                           │
│ 1. Valida que senha atual = senha temporária               │
│ 2. Valida nova senha (mínimo 8 caracteres)                 │
│ 3. Chama change_password_unified()                         │
│ 4. Define is_temporary_password = false                    │
│ 5. AuthContext atualiza hasTemporaryPassword = false       │
│ 6. Modal desaparece                                        │
│ 7. Usuário acessa sistema normalmente                      │
└─────────────────────────────────────────────────────────────┘
```

### Estados da Flag `is_temporary_password`

| Estado | Descrição | Comportamento |
|--------|-----------|---------------|
| `true` | Senha é temporária | Modal BLOQUEIA acesso até troca |
| `false` | Senha é definitiva | Usuário acessa normalmente |
| `null` | Não definido (legacy) | Tratado como `false` |

### Problema Comum: Modal Não Fecha Após Troca

**Causa:** `is_temporary_password` não foi atualizado para `false`

**Solução:**
```typescript
// ChangeTemporaryPasswordModal.tsx deve chamar:
await supabase
  .from('profiles')
  .update({ is_temporary_password: false })
  .eq('id', user.id);

// E AuthContext deve atualizar:
setHasTemporaryPassword(false);
```

### Validação Manual

```sql
-- Verificar estado atual
SELECT email, is_temporary_password, updated_at
FROM profiles
WHERE email = 'usuario@example.com';

-- Forçar reset da flag (se necessário)
UPDATE profiles
SET is_temporary_password = false
WHERE email = 'usuario@example.com';
```

---

## 🔬 Diagnóstico Sistemático

### Passo 1: Verificar Logs do Console

**Logs Normais (✅ Sistema Saudável):**
```
🔐 AuthProvider - Inicializando provider
🔍 AuthProvider - Verificando sessão existente...
🔄 AuthProvider - Renovando sessão existente...
✅ AuthProvider - Sessão renovada com sucesso
📡 AuthProvider - Sessão obtida: {hasSession: true, email: "..."}
👤 AuthProvider - Usuário encontrado, buscando perfil...
✅ AuthProvider - Perfil carregado com sucesso
```

**Logs Problemáticos (❌ Investigar):**
```
⏰ AuthProvider - Timeout de 6s na busca do perfil     ← Race condition
⚠️ AuthProvider - Erro ao renovar sessão               ← Session check
💥 AuthProvider - Erro inesperado na busca do perfil   ← RLS ou JWT error
PGRST301                                                ← JWT expirado
```

### Passo 2: Verificar Network Tab (DevTools)

**O que verificar:**
1. **Requests a `/auth/v1/token?grant_type=refresh_token`**
   - Status: 200 OK
   - Response tem `access_token` e `refresh_token`

2. **Requests a `/rest/v1/profiles?id=eq.{uuid}&select=*`**
   - Status: 200 OK (não 401, 403, ou timeout)
   - Response tem dados do perfil

3. **Timing:**
   - Token refresh: < 500ms
   - Profile query: < 1s
   - Total login: < 2s

### Passo 3: Verificar Estado do Auth

**Console do Browser:**
```javascript
// Verificar sessão atual
const { data: { session } } = await window.supabase.auth.getSession();
console.log('Session:', session);

// Verificar user atual
const { data: { user } } = await window.supabase.auth.getUser();
console.log('User:', user);
```

**Expected Output:**
```javascript
Session: {
  access_token: "ey...",
  refresh_token: "...",
  user: { id: "...", email: "..." }
}

User: {
  id: "uuid",
  email: "user@example.com",
  user_metadata: { ... }
}
```

### Passo 4: Verificar RLS Policies

**Comando SQL (MCP Supabase):**
```sql
SELECT
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;
```

**Expected Output (v3.2.1):**
```
profiles_select_optimized   SELECT  (auth.uid() = id) OR (...)
profiles_admin_insert       INSERT  NULL
profiles_admin_update       UPDATE  (auth.jwt() ->> 'email') = 'adm@...'
profiles_admin_delete       DELETE  (auth.jwt() ->> 'email') = 'adm@...'
profiles_insert_own_only    INSERT  auth.uid() = id
profiles_update_own_only    UPDATE  auth.uid() = id
```

---

## 🛠️ Correções Aplicadas (v3.2.1)

### Correção 1: Race Condition Fix

**Arquivo:** `src/app/providers/AuthContext.tsx:296-393`

**Mudança:**
```typescript
// ANTES: Tentava buscar perfil imediatamente
const { data: { session } } = await supabase.auth.getSession();
if (session?.user) {
  await fetchUserProfile(session.user);  // ← Muito cedo!
}

// DEPOIS: Aguarda refresh primeiro
await supabase.auth.refreshSession();  // ← WAIT!
const { data: { session } } = await supabase.auth.getSession();
if (session?.user) {
  await fetchUserProfile(session.user);  // ← Agora sim
}
```

### Correção 2: Session Check Before Refresh

**Arquivo:** `src/app/providers/AuthContext.tsx:335-354`

**Mudança:**
```typescript
// ANTES: Renovava sem verificar
await supabase.auth.refreshSession();

// DEPOIS: Verifica antes
const { data: { session } } = await supabase.auth.getSession();
if (session) {
  await supabase.auth.refreshSession();
}
```

### Correção 3: Retry Logic for JWT Errors

**Arquivo:** `src/app/providers/AuthContext.tsx:153-273`

**Mudança:**
```typescript
// NOVO: Automatic retry em JWT errors
const isJWTError = profileError.code === 'PGRST301' || ...;

if (isJWTError && retryCount === 0) {
  await new Promise(resolve => setTimeout(resolve, 2000));
  return fetchProfileOperation(1);  // Retry
}
```

### Correção 4: RLS Policies Optimization

**Ambiente:** Supabase (DEV + PROD)

**Mudança:**
```sql
-- REMOVIDO: Double JWT decode
DROP POLICY profiles_admin_full_access;
DROP POLICY profiles_select_enhanced;

-- CRIADO: Optimized policies
CREATE POLICY profiles_select_optimized ...;
CREATE POLICY profiles_admin_insert ...;
CREATE POLICY profiles_admin_update ...;
CREATE POLICY profiles_admin_delete ...;
```

---

## 📊 Logs e Como Interpretá-los

### Logs de Sucesso (✅)

```
🔐 AuthProvider - Inicializando provider (render)
```
**Significado:** Provider montou, iniciando processo de autenticação

```
🔍 AuthProvider - Verificando sessão existente...
```
**Significado:** Verificando se há sessão antes de renovar (v3.2.1 fix)

```
🔄 AuthProvider - Renovando sessão existente para garantir JWT válido...
```
**Significado:** Sessão encontrada, renovando token

```
✅ AuthProvider - Sessão renovada com sucesso
```
**Significado:** JWT token renovado, pode prosseguir

```
📡 AuthProvider - Sessão obtida: {hasSession: true, email: "user@example.com"}
```
**Significado:** Sessão válida obtida com sucesso

```
👤 AuthProvider - Buscando perfil após SIGNED_IN
```
**Significado:** Evento de login detectado, buscando perfil

```
🔍 AuthProvider - Buscando perfil (tentativa 1)
```
**Significado:** Iniciando query para buscar dados do perfil

```
✅ AuthProvider - Perfil carregado com sucesso
```
**Significado:** Profile query completou, dados carregados

```
ℹ️ AuthProvider - Nenhuma sessão ativa (primeira visita ou após logout)
```
**Significado:** Comportamento esperado quando não há login

### Logs de Problema (⚠️/❌)

```
⏰ AuthProvider - Timeout de 6s na busca do perfil, forçando fallback
```
**Problema:** Race condition ou RLS policy muito lenta
**Investigar:** Timing de refresh, policies do Supabase

```
⚠️ AuthProvider - Erro ao renovar sessão: Auth session missing!
```
**Problema (v3.2.0 e anteriores):** Tentando renovar sessão inexistente
**Solução:** Corrigido em v3.2.1 com session check

```
💥 AuthProvider - Erro inesperado na busca do perfil: Error: PGRST301
```
**Problema:** JWT token expirado ou inválido
**Solução:** Sistema deve retry automaticamente (v3.2.1)

```
⏳ AuthProvider - Erro de JWT detectado, aguardando 2s para retry...
```
**Ação:** Sistema detectou JWT error e vai tentar novamente
**Esperar:** Deve resolver em 2 segundos

```
⚠️ AuthProvider - Forçando fallback após erro de profile
```
**Problema:** Query de profile falhou após retry
**Investigar:** RLS policies, network, database

---

## 🧰 Ferramentas de Debug

### 1. React DevTools

**Como usar:**
1. Instalar extensão React DevTools
2. Abrir DevTools → Components
3. Buscar `AuthProvider`
4. Ver estado atual:
   - `user`
   - `userRole`
   - `loading`
   - `hasTemporaryPassword`

### 2. Supabase Dashboard

**URL:** https://supabase.com/dashboard/project/{project-id}

**O que verificar:**
1. **Table Editor → profiles**
   - Dados do usuário estão corretos?
   - Campos `is_temporary_password`, `role`, `feature_flags` preenchidos?

2. **Auth → Users**
   - Usuário existe?
   - Email confirmado?
   - Metadata correto?

3. **Auth → Policies (RLS)**
   - 6 policies na tabela `profiles`?
   - Nenhuma policy bugada?

### 3. MCP Supabase Tools

**Verificar policies:**
```bash
# Via MCP tool mcp__supabase-smithery__execute_sql
SELECT * FROM pg_policies WHERE tablename = 'profiles';
```

**Testar query de profile:**
```sql
SELECT * FROM profiles WHERE id = 'user-uuid-here';
```

### 4. Chrome DevTools - Network Tab

**Filtrar por:**
- `auth/v1/token` - Renovação de token
- `rest/v1/profiles` - Query de profile

**O que analisar:**
- **Status codes:** 200 = OK, 401/403 = Auth error, timeout = Performance
- **Timing:** > 6s = Problem
- **Response:** Vazio = RLS blocking

---

## ❓ FAQ

### Q1: Por que o timeout é de 10 segundos?

**A:** Aumentado de 5s para 10s em v3.2.1 para dar tempo do JWT refresh completar em ambientes lentos. Com as correções de race condition, timeouts foram eliminados.

### Q2: O que acontece se o retry falhar?

**A:** Sistema usa fallback mode:
```typescript
setUser(currentUser);
setUserRole('employee');  // Role padrão
setHasTemporaryPassword(false);
setLoading(false);
```

Usuário consegue acessar o sistema com permissões limitadas.

### Q3: Como diferenciar primeira visita de erro real?

**Log de primeira visita (✅ OK):**
```
ℹ️ AuthProvider - Nenhuma sessão ativa (primeira visita ou após logout)
```

**Log de erro real (❌ Problem):**
```
💥 AuthProvider - Erro inesperado na busca do perfil: Error: ...
```

### Q4: Posso desabilitar os logs em produção?

**Não recomendado.** Os logs são essenciais para troubleshooting. Considere usar `console.debug()` para logs menos críticos se necessário.

### Q5: Como testar as correções de v3.2.1?

**Checklist:**
1. ✅ Login com `funcionario@adega.com` - < 2s, sem timeout
2. ✅ Primeira visita (janela anônima) - sem warning amarelo
3. ✅ Network tab - 1 query de profile (não 2)
4. ✅ Logs - apenas azul/verde, sem amarelo/vermelho

---

## 📚 Referências

- [AUTH_RLS_DASHBOARD_FIXES_v3.2.1.md](../../07-changelog/AUTH_RLS_DASHBOARD_FIXES_v3.2.1.md) - Changelog v3.2.1
- [COMPLETE_SYNC_ANALYSIS_2025-11-07.md](../../09-api/database-operations/COMPLETE_SYNC_ANALYSIS_2025-11-07.md) - Análise completa DEV/PROD
- [RLS_POLICIES_GUIDE.md](../../09-api/database-operations/RLS_POLICIES_GUIDE.md) - Guia de RLS policies
- [admin-reset-password Edge Function](../../../supabase/functions/admin-reset-password/index.ts) - Código fonte
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth) - Documentação oficial
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions) - Edge Functions docs

---

**Última Atualização:** 08/11/2025 (v3.5.0)
**Autor:** Claude Code + Luccas
**Status:** ✅ Validado em Produção
**Mudanças v3.5.0:**
- ✅ Adicionada documentação sobre Edge Function `admin-reset-password`
- ✅ Documentado fluxo completo de senha temporária
- ✅ Adicionado troubleshooting para bug P0 (modal não aparece)
- ✅ Incluídos diagramas de fluxo e validação manual
