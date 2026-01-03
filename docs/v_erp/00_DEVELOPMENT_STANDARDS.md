# 00. Padrões de Desenvolvimento (Development Standards)

> [!IMPORTANT]
> Este documento define as **Regras de Engajamento** para qualquer alteração no
> código do AdegaManager. A violação destas regras resultará em dívida técnica e
> bugs de regressão. **Siga-as rigorosamente.**

## 1. Integridade do Banco de Dados (Database Integrity)

### A. Paridade Dev/Prod (Strict Parity)

- **Regra:** O schema de Desenvolvimento (`adega-dev`) deve ser **IDÊNTICO** ao
  de Produção (`adega`).
- **Proibido:** Criar colunas ou funções em Dev e esquecer de replicar em Prod
  (ou vice-versa).
- **Proibido:** Testar em Dev, ver funcionar, e assumir que funcionará em Prod
  sem verificar as diferenças de schema.
- **Ferramenta:** Use `mcp_supabase-**_execute_sql` para verificar schemas
  (`information_schema.columns`) antes de qualquer alteração crítica.

### B. Migrações (Migrations)

- **Nunca edite SQL manualmente via Dashboard.** Use sempre arquivos de migração
  (`supabase/migrations/YYYYMMDDHHMMSS_name.sql`).
- **Refactor vs Create:** Se uma função RPC está quebrada, **CONSERTE-A**. Não
  crie uma função "v2" ou com outro nome (`create_inventory_movement_new`)
  deixando a velha quebrada para trás. Isso cria lixo ("Code Debris") e
  confusão.

---

## 2. Server-Side Logic (RPCs)

### A. Single Source of Truth

- Lógica crítica (Movimentação de Estoque, Processamento de Venda, Caixa) reside
  no **Banco de Dados (RPCs)**, não no Frontend.
- **Exemplo:** Nunca faça `UPDATE products SET stock = stock - 1` no Frontend.
  Chame `create_inventory_movement` ou `process_sale`.

### B. Assinaturas de Funções

- Ao alterar a assinatura de uma função (ex: mudar tipo de parâmetro), **EXCLUA
  A ANTIGA** (`DROP FUNCTION`).
- O Postgres permite sobrecarga (mesmo nome, tipos diferentes). Isso causa bugs
  silenciosos onde o código legado chama a versão velha e quebrada.
- **Comando Seguro:** `DROP FUNCTION IF EXISTS nome_da_funcao(args_antigos);`
  antes de `CREATE OR REPLACE`.

### C. Colunas de Tempo

- **USE:** `created_at` (Timestamp with Time Zone, Default `NOW()`).
- **NÃO USE:** `date` (Nome genérico, conflitante com palavras reservadas e
  legado neste projeto).

---

## 3. Frontend & UI

### A. Zero Lixo UI

- Se um campo não é usado (ex: `unit_type`), **REMOVA-O** do componente. Não
  deixe comentado ou oculto "por precaução".
- Mantenha a interface limpa e focada na UX.

### B. Tipagem (Strict TypeScript)

- Não use `any`. Defina interfaces ou use os tipos gerados do Supabase
  (`Database['public']['Tables']...`).

---

## 4. Estrátégia de Correção (Fix Strategy)

1. **Diagnóstico:** Identifique DE ONDE vem o erro (Frontend, RPC, Trigger,
   RLS).
2. **Verificação Cruzada:** O erro ocorre em Dev? Em Prod? Por que? (Checar
   Schema).
3. **Correção Raiz:** Corrija a causa (ex: RPC quebrada), não o sintoma (ex:
   try/catch no frontend).
4. **Limpeza:** Após corrigir, remova qualquer código provisório ou legado que
   sobrou.
