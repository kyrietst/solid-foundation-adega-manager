# 🧹 Plano de Sincronização: Legacy Cleanup (DEV → PROD)

**Documento:** Plano Executivo de Sincronização
**Versão:** 1.0.0
**Data:** 2025-11-02
**Status:** ⏳ Pendente de Aprovação
**Autor:** Sistema de Análise Comparativa de Bancos de Dados

---

## 📋 Sumário Executivo

Este documento detalha o plano de execução para sincronizar **2 migrations de limpeza de código legacy** do ambiente DEV para PROD. As migrations removem 15 funções obsoletas e 2 tabelas órfãs, melhorando a manutenibilidade do banco de dados e elevando a cobertura RLS para 100%.

### Impacto Resumido

| Métrica | Impacto | Risco |
|---------|---------|-------|
| **Functions removidas** | 15 funções obsoletas | 🟢 Muito Baixo |
| **Tabelas removidas** | 2 tabelas órfãs (0 dados) | 🟢 Muito Baixo |
| **Cobertura RLS** | 94.3% → 100% | 🟢 Melhoria |
| **Downtime necessário** | 0 minutos | 🟢 Zero |
| **Rollback necessário** | Improvável | 🟢 Baixo |

---

## 🎯 Objetivos

### Objetivos Principais
1. ✅ Remover 15 stored procedures obsoletas de PROD
2. ✅ Remover 2 tabelas órfãs sem dados
3. ✅ Elevar cobertura RLS de 94.3% para 100%
4. ✅ Reduzir complexidade do banco (-9.9% de functions)
5. ✅ Sincronizar completamente DEV e PROD

### Objetivos de Segurança
- 🔒 Zero breaking changes para aplicação frontend
- 🔒 Zero perda de dados
- 🔒 Reversibilidade completa (se necessário)
- 🔒 Validação em cada etapa

---

## 📦 Escopo das Migrations

### Migration 1: `20251025120000_cleanup_duplicate_functions.sql`

**Funções a Serem Removidas (15 total):**

#### Grupo A: Admin Creation Functions (6)
```sql
DROP FUNCTION IF EXISTS public.create_admin_simple CASCADE;
DROP FUNCTION IF EXISTS public.create_admin_final CASCADE;
DROP FUNCTION IF EXISTS public.create_admin_step1 CASCADE;
DROP FUNCTION IF EXISTS public.create_admin_step2 CASCADE;
DROP FUNCTION IF EXISTS public.create_admin_step3 CASCADE;
DROP FUNCTION IF EXISTS public.create_admin_complete CASCADE;
```

**Razão:** Versões de teste/debug da criação de admin. Sistema agora usa apenas Supabase Auth nativo.

#### Grupo B: Password Change Functions (3)
```sql
DROP FUNCTION IF EXISTS public.change_password_direct CASCADE;
DROP FUNCTION IF EXISTS public.change_password_safe CASCADE;
DROP FUNCTION IF EXISTS public.change_password_final CASCADE;
```

**Razão:** Substituídas por endpoints nativos do Supabase Auth.

#### Grupo C: User Handling Functions (6)
```sql
DROP FUNCTION IF EXISTS public.handle_new_user CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user_v2 CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user_complete CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user_simple CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user_test CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user_final CASCADE;
```

**Razão:** Versões iterativas de handlers. Sistema usa apenas a versão atual integrada aos triggers.

---

### Migration 2: `20251029221031_remove_orphan_tables_and_functions.sql`

**Objetos a Serem Removidos:**

#### Tabela 1: `csv_delivery_data`
```sql
DROP TABLE IF EXISTS public.csv_delivery_data CASCADE;
```

**Detalhes:**
- **Propósito Original:** Import temporário de dados CSV de entregas
- **Status Atual:** Órfã - nunca integrada ao sistema principal
- **Registros:** 0
- **RLS Policies:** 0 (não tinha políticas)
- **Dependências:** Nenhuma

#### Tabela 2: `product_variants_backup`
```sql
DROP TABLE IF EXISTS public.product_variants_backup CASCADE;
```

**Detalhes:**
- **Propósito Original:** Backup manual de product_variants
- **Status Atual:** Backup nunca usado
- **Registros:** 0
- **Criação:** Set/2025
- **Dependências:** Nenhuma

#### Função: `cleanup_old_auth_logs()`
```sql
DROP FUNCTION IF EXISTS public.cleanup_old_auth_logs CASCADE;
```

**Detalhes:**
- **Propósito Original:** Job automático de limpeza de logs antigos
- **Status Atual:** Sistema não usa mais esta estratégia
- **Substituída por:** Supabase native logging com retenção automática

**Impacto RLS:**
- **Antes:** 33/35 tabelas com RLS = 94.3%
- **Depois:** 33/33 tabelas com RLS = 100% ✅

---

## 🔍 Pré-requisitos e Validações

### Pré-requisitos Obrigatórios

#### 1. Backup Completo de PROD
```bash
# Via Supabase CLI
supabase db dump -f backup_pre_cleanup_$(date +%Y%m%d_%H%M%S).sql

# Ou via Supabase Dashboard
# Settings → Database → Backups → Create Backup
```

**Validação:**
- [ ] Backup criado com sucesso
- [ ] Arquivo backup > 0 bytes
- [ ] Backup armazenado em local seguro

#### 2. Verificar Uso de Functions em Código Frontend
```bash
# Buscar referências no código React
cd /mnt/d/1. LUCCAS/aplicativos ai/adega/solid-foundation-adega-manager

# Grupo A: Admin functions
grep -r "create_admin_simple\|create_admin_final\|create_admin_step" src/

# Grupo B: Password functions
grep -r "change_password_direct\|change_password_safe\|change_password_final" src/

# Grupo C: User handling functions
grep -r "handle_new_user" src/
```

**Validação Esperada:**
- [ ] ✅ Zero matches encontrados para Grupo A
- [ ] ✅ Zero matches encontrados para Grupo B
- [ ] ✅ Zero matches encontrados para Grupo C

#### 3. Verificar Logs de Uso em PROD (Últimos 30 dias)
```sql
-- Query para verificar invocações via logs do Supabase
-- Execute no SQL Editor do Dashboard PROD

-- Esta query deve retornar 0 linhas
SELECT DISTINCT function_name, COUNT(*) as invocations
FROM edge_logs
WHERE function_name IN (
  'create_admin_simple',
  'create_admin_final',
  'change_password_direct',
  'handle_new_user',
  'handle_new_user_v2'
  -- ... adicionar todas as 15 functions
)
AND created_at > NOW() - INTERVAL '30 days'
GROUP BY function_name;
```

**Validação Esperada:**
- [ ] ✅ Query retorna 0 linhas (nenhuma invocação recente)

#### 4. Validar Tabelas Órfãs Sem Dados
```sql
-- Execute no SQL Editor do Dashboard PROD

-- Verificar csv_delivery_data
SELECT COUNT(*) as total_records FROM public.csv_delivery_data;
-- Esperado: 0

-- Verificar product_variants_backup
SELECT COUNT(*) as total_records FROM public.product_variants_backup;
-- Esperado: 0
```

**Validação Esperada:**
- [ ] ✅ `csv_delivery_data`: 0 registros
- [ ] ✅ `product_variants_backup`: 0 registros

---

## 📝 Plano de Execução Detalhado

### Fase 1: Preparação (15 minutos)

#### Passo 1.1: Notificar Time e Usuários
**Tempo:** 5 min
**Ação:**
```markdown
# Template de Comunicação

**Assunto:** Manutenção Programada - Limpeza de Banco de Dados

Prezados usuários,

Realizaremos uma manutenção de limpeza no banco de dados PROD:
- **Data:** [DATA]
- **Horário:** [HORÁRIO] (horário de baixo tráfego recomendado)
- **Duração estimada:** 10 minutos
- **Impacto:** ZERO - Aplicação continuará funcionando normalmente
- **Objetivo:** Remover código obsoleto e melhorar performance

Nenhuma ação é necessária de sua parte.

Atenciosamente,
Equipe Técnica Adega Manager
```

#### Passo 1.2: Criar Backup Completo
**Tempo:** 5 min
**Comando:**
```bash
# Via Supabase Dashboard
# 1. Acessar: https://supabase.com/dashboard/project/uujkzvbgnfzuzlztrzln
# 2. Settings → Database → Backups
# 3. Clicar em "Create Backup"
# 4. Aguardar confirmação
```

**Validação:**
- [ ] Backup criado com status "Completed"
- [ ] Timestamp registrado: ___________

#### Passo 1.3: Executar Verificações Pré-Aplicação
**Tempo:** 5 min
**Script de Validação:**
```sql
-- Executar no SQL Editor PROD
-- Colar todo este bloco de uma vez

-- 1. Contar functions que serão removidas
SELECT COUNT(*) as total_functions_to_remove
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname IN (
  'create_admin_simple', 'create_admin_final', 'create_admin_step1',
  'create_admin_step2', 'create_admin_step3', 'create_admin_complete',
  'change_password_direct', 'change_password_safe', 'change_password_final',
  'handle_new_user', 'handle_new_user_v2', 'handle_new_user_complete',
  'handle_new_user_simple', 'handle_new_user_test', 'handle_new_user_final'
);
-- Esperado: 15

-- 2. Verificar tabelas órfãs existem
SELECT table_name,
       (SELECT COUNT(*) FROM csv_delivery_data) as csv_count,
       (SELECT COUNT(*) FROM product_variants_backup) as backup_count
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('csv_delivery_data', 'product_variants_backup');
-- Esperado: 2 linhas, ambas com count = 0

-- 3. Verificar cobertura RLS atual
SELECT
  COUNT(DISTINCT tablename) as tables_with_rls,
  (SELECT COUNT(*) FROM information_schema.tables
   WHERE table_schema = 'public' AND table_type = 'BASE TABLE') as total_tables,
  ROUND(
    COUNT(DISTINCT tablename)::numeric /
    (SELECT COUNT(*) FROM information_schema.tables
     WHERE table_schema = 'public' AND table_type = 'BASE TABLE')::numeric * 100,
    1
  ) as rls_coverage_percent
FROM pg_policies
WHERE schemaname = 'public';
-- Esperado: ~94.3%
```

**Checklist de Validação:**
- [ ] 15 functions identificadas para remoção
- [ ] 2 tabelas órfãs com 0 registros cada
- [ ] Cobertura RLS atual = 94.3%

---

### Fase 2: Aplicação Migration 1 - Functions (10 minutos)

#### Passo 2.1: Ler e Revisar Migration 1
**Tempo:** 2 min
**Ação:**
```bash
# Ler arquivo de migration
cat supabase/migrations/20251025120000_cleanup_duplicate_functions.sql

# Revisar cada DROP FUNCTION statement
```

**Checklist:**
- [ ] Todos os DROP FUNCTION têm `IF EXISTS`
- [ ] Todos os DROP FUNCTION têm `CASCADE`
- [ ] Total de DROP statements = 15

#### Passo 2.2: Aplicar Migration 1 via Supabase Dashboard
**Tempo:** 5 min
**Procedimento:**
```markdown
1. Acessar: https://supabase.com/dashboard/project/uujkzvbgnfzuzlztrzln
2. Ir para: SQL Editor
3. Clicar em: "+ New Query"
4. Copiar conteúdo completo de: supabase/migrations/20251025120000_cleanup_duplicate_functions.sql
5. Colar no editor
6. Revisar visualmente
7. Clicar em: "Run"
8. Aguardar confirmação: "Success. No rows returned"
```

**Registro de Execução:**
- [ ] Migration aplicada com sucesso
- [ ] Timestamp de execução: ___________
- [ ] Screenshot salvo (opcional)

#### Passo 2.3: Validar Migration 1
**Tempo:** 3 min
**Script de Validação:**
```sql
-- Executar no SQL Editor PROD

-- Verificar se as 15 functions foram removidas
SELECT COUNT(*) as functions_remaining
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname IN (
  'create_admin_simple', 'create_admin_final', 'create_admin_step1',
  'create_admin_step2', 'create_admin_step3', 'create_admin_complete',
  'change_password_direct', 'change_password_safe', 'change_password_final',
  'handle_new_user', 'handle_new_user_v2', 'handle_new_user_complete',
  'handle_new_user_simple', 'handle_new_user_test', 'handle_new_user_final'
);
-- Esperado: 0

-- Contar total de functions em PROD agora
SELECT COUNT(*) as total_functions_prod
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public';
-- Esperado: 145 (era 161 antes)
```

**Validação:**
- [ ] ✅ 0 functions obsoletas restantes
- [ ] ✅ Total de functions = 145 (redução de 16)

---

### Fase 3: Aplicação Migration 2 - Tables (10 minutos)

#### Passo 3.1: Ler e Revisar Migration 2
**Tempo:** 2 min
**Ação:**
```bash
# Ler arquivo de migration
cat supabase/migrations/20251029221031_remove_orphan_tables_and_functions.sql

# Revisar cada DROP TABLE e DROP FUNCTION statement
```

**Checklist:**
- [ ] Todos os DROP TABLE têm `IF EXISTS`
- [ ] Todos os DROP TABLE têm `CASCADE`
- [ ] DROP FUNCTION tem `IF EXISTS CASCADE`

#### Passo 3.2: Aplicar Migration 2 via Supabase Dashboard
**Tempo:** 5 min
**Procedimento:**
```markdown
1. Ainda no SQL Editor PROD
2. Clicar em: "+ New Query"
3. Copiar conteúdo completo de: supabase/migrations/20251029221031_remove_orphan_tables_and_functions.sql
4. Colar no editor
5. Revisar visualmente
6. Clicar em: "Run"
7. Aguardar confirmação: "Success. No rows returned"
```

**Registro de Execução:**
- [ ] Migration aplicada com sucesso
- [ ] Timestamp de execução: ___________
- [ ] Screenshot salvo (opcional)

#### Passo 3.3: Validar Migration 2
**Tempo:** 3 min
**Script de Validação:**
```sql
-- Executar no SQL Editor PROD

-- 1. Verificar se tabelas foram removidas
SELECT COUNT(*) as orphan_tables_remaining
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('csv_delivery_data', 'product_variants_backup');
-- Esperado: 0

-- 2. Verificar se função foi removida
SELECT COUNT(*) as orphan_functions_remaining
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname = 'cleanup_old_auth_logs';
-- Esperado: 0

-- 3. Verificar NOVA cobertura RLS
SELECT
  COUNT(DISTINCT tablename) as tables_with_rls,
  (SELECT COUNT(*) FROM information_schema.tables
   WHERE table_schema = 'public' AND table_type = 'BASE TABLE') as total_tables,
  ROUND(
    COUNT(DISTINCT tablename)::numeric /
    (SELECT COUNT(*) FROM information_schema.tables
     WHERE table_schema = 'public' AND table_type = 'BASE TABLE')::numeric * 100,
    1
  ) as rls_coverage_percent
FROM pg_policies
WHERE schemaname = 'public';
-- Esperado: 100.0% ✅
```

**Validação:**
- [ ] ✅ 0 tabelas órfãs restantes
- [ ] ✅ 0 funções obsoletas restantes
- [ ] ✅ Cobertura RLS = 100%

---

### Fase 4: Validação Final e Testes (15 minutos)

#### Passo 4.1: Testes de Funcionalidade Crítica
**Tempo:** 10 min
**Procedimento de Teste:**

```markdown
### Teste 1: Autenticação
1. Acessar aplicação frontend (Vercel)
2. Fazer logout se necessário
3. Fazer login com credenciais válidas
4. ✅ Login bem-sucedido sem erros no console

### Teste 2: Vendas (Função Crítica)
1. Ir para módulo de Vendas
2. Adicionar produto ao carrinho
3. Finalizar venda
4. ✅ Venda criada com sucesso
5. ✅ Estoque baixado corretamente
6. ✅ Inventory_movement criado

### Teste 3: Gestão de Produtos
1. Ir para módulo de Inventory
2. Criar novo produto
3. ✅ Produto criado sem erros
4. Editar produto
5. ✅ Edição salva com sucesso
6. Deletar produto (soft delete)
7. ✅ Produto marcado como deleted_at

### Teste 4: Gestão de Clientes
1. Ir para módulo de Customers
2. Criar novo cliente
3. ✅ Cliente criado sem erros
4. Editar cliente
5. ✅ Edição salva com sucesso

### Teste 5: Relatórios
1. Acessar Dashboard
2. Visualizar widgets de métricas
3. ✅ Todos os widgets carregam sem erro
4. Acessar Relatórios
5. ✅ Gráficos e tabelas funcionam normalmente
```

**Checklist de Validação:**
- [ ] ✅ Login/Autenticação funcionando
- [ ] ✅ Vendas criando corretamente
- [ ] ✅ Estoque baixando em vendas
- [ ] ✅ CRUD de produtos funcionando
- [ ] ✅ CRUD de clientes funcionando
- [ ] ✅ Dashboard e relatórios carregando

#### Passo 4.2: Monitorar Logs de Erro
**Tempo:** 5 min
**Procedimento:**
```markdown
1. Acessar: Supabase Dashboard → Logs → Error Logs
2. Filtrar: Últimos 15 minutos
3. Verificar: Não há erros relacionados a functions removidas
4. Verificar: Não há erros relacionados a tabelas removidas
```

**Validação:**
- [ ] ✅ Zero erros relacionados a migrations aplicadas
- [ ] ✅ Logs normais de operações do sistema

---

## 🔄 Plano de Rollback (Se Necessário)

### Cenário: Migration 1 Causou Problema

**Probabilidade:** 🟢 Muito Baixa (< 1%)

**Script de Rollback:**
```sql
-- ROLLBACK MIGRATION 1: Recriar functions removidas
-- ⚠️ EXECUTAR SOMENTE SE NECESSÁRIO

-- Este script está disponível em:
-- supabase/migrations/rollback/20251025120000_rollback_cleanup_functions.sql

-- Exemplo de recriação (não executar por padrão):
/*
CREATE OR REPLACE FUNCTION public.create_admin_simple(...)
RETURNS ...
LANGUAGE plpgsql
AS $$
BEGIN
  -- Código original preservado no backup
END;
$$;
*/

-- ⚠️ Consultar backup completo para código exato se necessário
```

**Procedimento de Rollback:**
1. Restaurar backup completo criado na Fase 1
2. Documentar erro que causou necessidade de rollback
3. Investigar root cause
4. Reavaliar aplicação de migration

---

### Cenário: Migration 2 Causou Problema

**Probabilidade:** 🟢 Extremamente Baixa (< 0.1%)

**Razão:** Tabelas tinham 0 dados e nenhuma dependência.

**Script de Rollback:**
```sql
-- ROLLBACK MIGRATION 2: Recriar tabelas removidas
-- ⚠️ EXECUTAR SOMENTE SE ABSOLUTAMENTE NECESSÁRIO

-- Recriar csv_delivery_data
CREATE TABLE IF NOT EXISTS public.csv_delivery_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  -- Estrutura completa disponível no backup
);

-- Recriar product_variants_backup
CREATE TABLE IF NOT EXISTS public.product_variants_backup (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Estrutura completa disponível no backup
);

-- Recriar função
CREATE OR REPLACE FUNCTION public.cleanup_old_auth_logs()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Código disponível no backup
END;
$$;
```

**Procedimento de Rollback:**
1. Consultar backup para estrutura exata das tabelas
2. Recriar estruturas (dados eram 0, então não há perda)
3. Documentar problema
4. Reavaliar necessidade de remoção

---

## 📊 Métricas de Sucesso

### KPIs Pós-Aplicação

| Métrica | Antes | Depois | Status |
|---------|-------|--------|--------|
| **Total de Functions** | 161 | 145 | [ ] Validar |
| **Functions Obsoletas** | 16 | 0 | [ ] Validar |
| **Tabelas no Schema Public** | 35 | 33 | [ ] Validar |
| **Tabelas com RLS** | 33 | 33 | [ ] Validar |
| **Cobertura RLS (%)** | 94.3% | 100% | [ ] Validar |
| **Downtime Observado** | - | 0 min | [ ] Validar |
| **Erros Introduzidos** | - | 0 | [ ] Validar |

### Critérios de Sucesso

✅ **Sucesso Completo** se:
- Todas as 15 functions removidas
- Ambas as tabelas órfãs removidas
- Função `cleanup_old_auth_logs` removida
- Cobertura RLS = 100%
- Zero erros em logs
- Todos os testes funcionais passando
- Zero downtime observado

⚠️ **Sucesso Parcial** se:
- Migrations aplicadas mas 1-2 erros menores observados
- Necessário ajuste pós-aplicação

❌ **Falha** se:
- Breaking changes críticos
- Necessário rollback completo
- Perda de dados (não esperado)

---

## 📅 Cronograma Recomendado

### Opção 1: Janela de Manutenção Padrão
**Horário:** 02:00 - 03:00 (horário de menor tráfego)
**Dia:** Terça ou Quarta-feira (evitar segunda e sexta)
**Duração total:** 50 minutos (15 prep + 20 exec + 15 validação)

### Opção 2: Horário Comercial com Monitoramento
**Horário:** 14:00 - 15:00 (se equipe preferir)
**Vantagem:** Equipe disponível para suporte imediato
**Desvantagem:** Maior impacto se algo der errado (improvável)

### Comunicação Timeline

```
D-7  │ Comunicar time técnico sobre manutenção planejada
D-3  │ Comunicar usuários finais (e-mail/notificação)
D-1  │ Revisar checklist e preparar ambiente
D-0  │ Executar plano (Fases 1-4)
D+1  │ Monitoramento pós-aplicação
D+7  │ Relatório final de sucesso
```

---

## ✅ Checklist Final Pré-Execução

### Preparação
- [ ] Backup completo de PROD criado
- [ ] Arquivo de migration 1 revisado
- [ ] Arquivo de migration 2 revisado
- [ ] Verificações pré-aplicação executadas
- [ ] Time técnico notificado
- [ ] Usuários notificados (se aplicável)

### Validações Técnicas
- [ ] 15 functions identificadas em PROD
- [ ] 2 tabelas órfãs confirmadas vazias
- [ ] Código frontend não usa functions obsoletas
- [ ] Logs não mostram uso recente das functions

### Ambiente
- [ ] Acesso ao Supabase Dashboard PROD confirmado
- [ ] SQL Editor aberto e testado
- [ ] Conexão estável à internet
- [ ] Plano de rollback disponível

### Pós-Aplicação
- [ ] Migration 1 aplicada com sucesso
- [ ] Migration 2 aplicada com sucesso
- [ ] Validações SQL executadas
- [ ] Testes funcionais executados
- [ ] Logs monitorados (zero erros)
- [ ] Métricas de sucesso confirmadas
- [ ] Comunicado de sucesso enviado

---

## 📞 Contatos e Suporte

### Responsáveis Técnicos
- **DBA/Backend:** [Nome]
- **Frontend Lead:** [Nome]
- **DevOps:** [Nome]

### Escalação em Caso de Problemas
1. **Primeiro Contato:** DBA/Backend Lead
2. **Backup:** DevOps Lead
3. **Último Recurso:** CTO/Arquiteto Principal

### Canais de Comunicação
- **Slack:** #ops-database
- **E-mail:** ops@adegamanager.com
- **Telefone Emergência:** [Número]

---

## 📝 Registro de Execução

**Este template deve ser preenchido durante a execução:**

```markdown
## Execução Real - [DATA]

**Executado por:** ___________
**Data/Hora Início:** ___________
**Data/Hora Fim:** ___________
**Duração Total:** ___________ minutos

### Fase 1: Preparação
- Backup criado: [ ] Sim | Timestamp: ___________
- Verificações OK: [ ] Sim

### Fase 2: Migration 1
- Aplicada: [ ] Sim | Timestamp: ___________
- Validações: [ ] OK
- Erros: [ ] Nenhum / [ ] Descrição: ___________

### Fase 3: Migration 2
- Aplicada: [ ] Sim | Timestamp: ___________
- Validações: [ ] OK
- Erros: [ ] Nenhum / [ ] Descrição: ___________

### Fase 4: Validação Final
- Testes funcionais: [ ] OK
- Logs monitorados: [ ] OK
- Cobertura RLS: ___________% (esperado: 100%)

### Resultado Final
- [ ] ✅ Sucesso Completo
- [ ] ⚠️ Sucesso Parcial (descrever ajustes)
- [ ] ❌ Falha (rollback executado)

### Observações Adicionais
___________________________________________
___________________________________________
___________________________________________
```

---

## 🎓 Lições Aprendidas (Pós-Execução)

**Preencher após execução bem-sucedida:**

### O Que Funcionou Bem
-
-
-

### O Que Pode Melhorar
-
-
-

### Recomendações Futuras
-
-
-

---

## 📚 Referências

- **Análise Comparativa Completa:** `docs/09-api/database-operations/DATABASE_COMPARATIVE_ANALYSIS_PROD_vs_DEV.md`
- **Legacy Cleanup - Fase 2:** `docs/07-changelog/LEGACY_CLEANUP_PHASE2_COMPLETION.md`
- **Migration 1:** `supabase/migrations/20251025120000_cleanup_duplicate_functions.sql`
- **Migration 2:** `supabase/migrations/20251029221031_remove_orphan_tables_and_functions.sql`

---

**Documento Finalizado - Pronto para Aprovação e Execução**

**Próximos Passos:**
1. Revisar este plano com time técnico
2. Agendar data/hora de execução
3. Comunicar stakeholders
4. Executar seguindo este guia passo a passo
5. Preencher seção de Registro de Execução
6. Documentar lições aprendidas

---

*Gerado automaticamente pelo Sistema de Análise Comparativa de Bancos de Dados - Adega Manager v3.0.0*
