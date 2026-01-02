# 🔥 Supabase Edge Functions - Adega Manager

**Última Atualização**: 08/11/2025 (v3.5.0)
**Ambiente**: Deno Runtime + Supabase Functions
**Arquitetura**: Serverless Functions com SERVICE_ROLE key segura

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Edge Functions Disponíveis](#edge-functions-disponíveis)
3. [Arquitetura e Segurança](#arquitetura-e-segurança)
4. [Como Chamar Edge Functions](#como-chamar-edge-functions)
5. [Desenvolvimento e Deploy](#desenvolvimento-e-deploy)
6. [Troubleshooting](#troubleshooting)

---

## 🎯 Visão Geral

### O que são Edge Functions?

Edge Functions são **funções serverless** executadas no runtime Deno (TypeScript) nos servidores do Supabase. Elas permitem:

✅ **Executar código seguro no servidor** - SERVICE_ROLE key nunca exposta ao browser
✅ **Lógica complexa protegida** - Validações de negócio no backend
✅ **Integração com APIs externas** - Chamadas a serviços third-party
✅ **Operações privilegiadas** - Usar `auth.admin.*` methods com segurança

### Por que Edge Functions vs RPC (Database Functions)?

| Aspecto | Edge Function | RPC (Database) |
|---------|---------------|----------------|
| **Linguagem** | TypeScript (Deno) | PL/pgSQL |
| **Acesso a APIs** | ✅ Sim (fetch, HTTP) | ❌ Limitado |
| **SERVICE_ROLE key** | ✅ Segura no servidor | ⚠️ Precisa de workarounds |
| **Auth Admin Methods** | ✅ Nativo (`auth.admin.*`) | ❌ Não disponível |
| **Deploy** | Via CLI ou dashboard | Via migrations |
| **Debugging** | ✅ Logs nativos do Deno | ⚠️ Logs PostgreSQL |
| **Performance** | ⚡ Serverless (cold start) | ⚡⚡ Database inline |

**Quando usar Edge Functions:**
- ✅ Reset de senha administrativo
- ✅ Criação de usuários (auth + profile em transação)
- ✅ Integração com APIs externas (pagamento, email, SMS)
- ✅ Operações que requerem SERVICE_ROLE key

**Quando usar RPC:**
- ✅ Queries complexas de dados (joins, aggregations)
- ✅ Operações transacionais em múltiplas tabelas
- ✅ Cálculos pesados de negócio (LTV, churn, etc.)

---

## 📚 Edge Functions Disponíveis

### 1. `admin-reset-password` ⭐ **PRODUÇÃO**

**Versão**: v2 (deploy: 08/11/2025)
**Status**: ✅ Ativo em DEV e PROD

#### Descrição
Permite que administradores resetem a senha de qualquer usuário usando o método nativo do Supabase `auth.admin.updateUserById()`.

#### Substitui
- ❌ RPC `admin_reset_user_password` (obsoleta, removida em 08/11/2025)

#### Como Funciona
```typescript
// 1. Valida que requisição vem de admin autenticado
const { data: profile } = await supabaseClient
  .from('profiles')
  .select('role')
  .eq('id', user.id)
  .single();

if (profile.role !== 'admin') {
  return 403; // Forbidden
}

// 2. Reseta senha usando SERVICE_ROLE key (servidor)
await supabaseAdmin.auth.admin.updateUserById(
  userId,
  { password: newPassword }
);

// 3. CRÍTICO: Define flag de senha temporária
await supabaseAdmin
  .from('profiles')
  .update({ is_temporary_password: true })
  .eq('id', userId);
```

#### Endpoint
```
POST /functions/v1/admin-reset-password
```

#### Request
```typescript
{
  userId: string;      // UUID do usuário alvo
  newPassword: string; // Senha temporária (mínimo 8 chars)
}
```

#### Response (Sucesso)
```typescript
{
  success: true,
  user: {
    id: string,
    email: string
  }
}
```

#### Response (Erro)
```typescript
{
  success: false,
  error: string // "Missing authorization header" | "Forbidden - admin role required" | etc.
}
```

#### Segurança
- ✅ **JWT obrigatório** - Header `Authorization: Bearer {token}`
- ✅ **Validação de role** - Apenas `role = 'admin'`
- ✅ **SERVICE_ROLE protegida** - Nunca exposta ao browser
- ✅ **Rate limiting** - Supabase aplica automaticamente
- ✅ **CORS configurado** - Apenas origens permitidas

#### Exemplo de Uso (Frontend)
```typescript
// UserList.tsx
const { data: { session } } = await supabase.auth.getSession();

const response = await fetch(
  `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-reset-password`,
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

const result = await response.json();

if (!result.success) {
  throw new Error(result.error);
}
```

#### Código Fonte
📂 `supabase/functions/admin-reset-password/index.ts`

#### Logs (Produção)
```bash
# Ver logs no Supabase Dashboard
# Project → Edge Functions → admin-reset-password → Logs

# Logs esperados (sucesso):
✅ Password reset successful for user: user@example.com
✅ Temporary password flag set successfully

# Logs de erro:
❌ Error: Forbidden - admin role required
⚠️ Password was reset but temporary flag could not be set
```

---

### 2. `create-user` (Planejada)

**Status**: 🔄 Em desenvolvimento

#### Descrição
Criação unificada de usuários com transação auth + profile.

#### Funcionalidades Planejadas
- Criar usuário no Supabase Auth
- Inserir profile na tabela `profiles`
- Enviar email de boas-vindas
- Definir senha temporária automaticamente

---

### 3. `delete-user` (Planejada)

**Status**: 🔄 Em desenvolvimento

#### Descrição
Soft delete de usuários com cascade em tabelas relacionadas.

---

## 🔒 Arquitetura e Segurança

### Variáveis de Ambiente

Edge Functions têm acesso automático a variáveis do projeto:

```typescript
Deno.env.get('SUPABASE_URL')             // URL do projeto
Deno.env.get('SUPABASE_ANON_KEY')        // Anon key (público)
Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') // Service role (PRIVADO)
```

### Dois Clientes Supabase

**Cliente Regular (ANON_KEY):**
```typescript
const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_ANON_KEY') ?? '',
  {
    global: {
      headers: { Authorization: authHeader }, // JWT do usuário
    },
  }
);

// Usado para: Validar permissões do usuário autenticado
```

**Cliente Admin (SERVICE_ROLE_KEY):**
```typescript
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Usado para: Operações privilegiadas (reset senha, criar user, etc.)
```

### CORS Headers

**Arquivo compartilhado**: `supabase/functions/_shared/cors.ts`

```typescript
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
```

**Tratamento de preflight requests:**
```typescript
if (req.method === 'OPTIONS') {
  return new Response('ok', { headers: corsHeaders });
}
```

### Validação de Permissões (Pattern)

**Pattern recomendado para todas as Edge Functions:**

```typescript
// 1. Validar Authorization header
const authHeader = req.headers.get('Authorization');
if (!authHeader) {
  return new Response(
    JSON.stringify({ success: false, error: 'Missing authorization header' }),
    { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// 2. Validar JWT e obter user
const supabaseClient = createClient(/* ANON_KEY + authHeader */);
const { data: { user }, error: userError } = await supabaseClient.auth.getUser();

if (userError || !user) {
  return new Response(
    JSON.stringify({ success: false, error: 'Unauthorized - invalid token' }),
    { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// 3. Validar role específica (ex: admin)
const { data: profile, error: profileError } = await supabaseClient
  .from('profiles')
  .select('role')
  .eq('id', user.id)
  .single();

if (profile.role !== 'admin') {
  return new Response(
    JSON.stringify({ success: false, error: 'Forbidden - admin role required' }),
    { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// 4. Executar operação privilegiada com supabaseAdmin
const supabaseAdmin = createClient(/* SERVICE_ROLE_KEY */);
// ... sua lógica aqui
```

---

## 🚀 Como Chamar Edge Functions

### 1. Via Fetch API (Recomendado)

```typescript
import { useAuth } from '@/app/providers/AuthContext';
import { supabase } from '@/core/config/supabase';

// Dentro de um componente React
const { data: { session } } = await supabase.auth.getSession();

const response = await fetch(
  `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/nome-da-funcao`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      /* seus parâmetros */
    }),
  }
);

const result = await response.json();

if (!response.ok) {
  throw new Error(result.error || 'Edge Function failed');
}

return result;
```

### 2. Via Supabase JS Client (Alternativa)

```typescript
import { supabase } from '@/core/config/supabase';

const { data, error } = await supabase.functions.invoke('nome-da-funcao', {
  body: {
    /* seus parâmetros */
  },
});

if (error) {
  throw error;
}

return data;
```

**⚠️ Nota:** O método `fetch` é preferido pois permite controle total sobre headers e error handling.

### 3. Tratamento de Erros

```typescript
try {
  const response = await fetch(/* ... */);
  const result = await response.json();

  // Verificar status HTTP
  if (!response.ok) {
    // Status 400, 401, 403, 500, etc.
    console.error('Edge Function error:', result.error);
    throw new Error(result.error || `HTTP ${response.status}`);
  }

  // Verificar sucesso na response
  if (!result.success) {
    throw new Error(result.error || 'Unknown error');
  }

  return result;

} catch (error) {
  console.error('Failed to call Edge Function:', error);
  throw error;
}
```

---

## 🛠️ Desenvolvimento e Deploy

### Estrutura de Pastas

```
supabase/
├── functions/
│   ├── _shared/
│   │   └── cors.ts          # CORS headers compartilhados
│   ├── admin-reset-password/
│   │   └── index.ts         # Edge Function ativa
│   ├── create-user/         # (planejada)
│   └── delete-user/         # (planejada)
```

### Criar Nova Edge Function

```bash
# Via Supabase CLI
supabase functions new nome-da-funcao

# Cria: supabase/functions/nome-da-funcao/index.ts
```

### Desenvolvimento Local

```bash
# Servir função localmente
supabase functions serve nome-da-funcao

# Com variáveis de ambiente
supabase functions serve nome-da-funcao --env-file .env.local

# Logs em tempo real
supabase functions logs nome-da-funcao
```

### Deploy para Supabase

**Deploy via CLI:**
```bash
# Deploy para projeto específico
supabase functions deploy nome-da-funcao --project-ref goppneqeowgeehpqkcxe

# Deploy de todas as funções
supabase functions deploy --project-ref goppneqeowgeehpqkcxe
```

**Deploy via Supabase Dashboard:**
1. Ir em **Edge Functions** no projeto
2. Clicar em **"New Function"**
3. Copiar código do arquivo `index.ts`
4. Salvar e deploy

### Verificar Deploy

```bash
# Listar funções deployadas
supabase functions list --project-ref goppneqeowgeehpqkcxe

# Ver logs de produção
supabase functions logs nome-da-funcao --project-ref goppneqeowgeehpqkcxe
```

### Versionamento

**Pattern de versionamento:**
- Deploy inicial: sem sufixo
- Bug fixes: incrementar no deploy comment
- Breaking changes: criar função nova (ex: `admin-reset-password-v2`)

**Rastrear versões via Git:**
```bash
# Commit antes de deploy
git add supabase/functions/nome-da-funcao/
git commit -m "feat(edge-functions): deploy nome-da-funcao v2"
git push

# Deploy para produção
supabase functions deploy nome-da-funcao --project-ref uujkzvbgnfzuzlztrzln
```

---

## 🔍 Troubleshooting

### Erro: "Missing authorization header"

**Causa**: Requisição não incluiu JWT token

**Solução**:
```typescript
const { data: { session } } = await supabase.auth.getSession();

// Adicionar header
headers: {
  'Authorization': `Bearer ${session.access_token}`,
}
```

### Erro: "Forbidden - admin role required"

**Causa**: Usuário autenticado não tem `role = 'admin'`

**Solução**:
```sql
-- Verificar role no banco
SELECT id, email, role FROM profiles WHERE id = 'user-uuid';

-- Promover a admin (se necessário)
UPDATE profiles SET role = 'admin' WHERE id = 'user-uuid';
```

### Erro: "Internal server error"

**Causa**: Erro não tratado na Edge Function

**Solução**:
1. Ver logs no dashboard: **Edge Functions → nome-da-funcao → Logs**
2. Buscar stack trace completo
3. Verificar variáveis de ambiente (`SUPABASE_URL`, `SERVICE_ROLE_KEY`)

### Edge Function não executa (timeout)

**Causa**: Cold start ou função travada

**Solução**:
```typescript
// Adicionar timeout na requisição
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s

const response = await fetch(url, {
  signal: controller.signal,
  /* ... */
});

clearTimeout(timeoutId);
```

### CORS error no browser

**Causa**: Headers CORS não configurados corretamente

**Solução**:
```typescript
// Sempre retornar CORS headers
import { corsHeaders } from '../_shared/cors.ts';

// Em OPTIONS (preflight)
if (req.method === 'OPTIONS') {
  return new Response('ok', { headers: corsHeaders });
}

// Em todas as responses
return new Response(
  JSON.stringify(data),
  { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
);
```

---

## 📚 Referências

- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions) - Documentação oficial
- [Deno Runtime Docs](https://deno.land/manual) - Runtime das Edge Functions
- [admin-reset-password source](../../supabase/functions/admin-reset-password/index.ts) - Código fonte
- [AUTH_TROUBLESHOOTING_GUIDE.md](../06-operations/troubleshooting/AUTH_TROUBLESHOOTING_GUIDE.md) - Troubleshooting auth
- [COMPLETE_SYNC_ANALYSIS_2025-11-07.md](./database-operations/COMPLETE_SYNC_ANALYSIS_2025-11-07.md) - Análise completa

---

**Última Atualização:** 08/11/2025 (v3.5.0)
**Autor:** Claude Code + Luccas
**Status:** ✅ Documentação Ativa
**Edge Functions em Produção:** 1 (admin-reset-password)
