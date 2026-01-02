# Protocolo de Reset de Arquitetura (Hard Reset)

**Data:** 26/12/2025
**Evento:** Sincronização Radical (Hard Reset) de Produção
**Autor:** Luccas (Agente Antigravity)

---

## 🛑 O Que Aconteceu?
Realizamos uma **Sincronização Radical** do ambiente de desenvolvimento (`adega-dev`) com a produção (`adega-prod`).

O histórico de migrações (`supabase/migrations`) estava inconsistente e conflitante com o estado real da produção. Decidimos ignorar o histórico antigo e estabelecer um novo ponto de partida limpo e idêntico à produção.

## 🏛️ Nova Fonte da Verdade
A partir de hoje, a fonte da verdade para o schema do banco de dados **NÃO É MAIS** a pasta de migrações antiga, e sim:

👉 **`supabase/clean_production_schema.sql`**

Este arquivo contém o snapshot exato e higienizado da produção em 26/12/2025.

## 🛠️ Procedimento de Setup (Novo Dev)
Se você for levantar este projeto do zero em uma nova máquina, **NÃO rode** `supabase db reset` padrão imediatamente, pois ele tentará rodar migrações antigas potenciais.

**Procedimento Correto:**

1.  Inicie o Supabase: `npx supabase start`
2.  **Ignore** as migrações antigas ou falhas iniciais.
3.  Resete o banco aplicando o Snapshot Mestre:
    ```bash
    # Se estiver rodando localmente com Postgres nativo/Docker
    psql -h localhost -d postgres -f supabase/clean_production_schema.sql
    
    # OU via Supabase CLI (se configurado para dev remoto)
    # npx supabase db reset --linked (Cuidado: isso pode tentar aplicar migrações)
    ```

**Para o ambiente `adega-dev` (Cloud), já aplicamos este snapshot.**

## 🧹 Arquivos Ignorados
Para evitar confusão, adicionamos ao `.gitignore`:
*   Todos os `.sql` soltos na raiz (dumps, diffs, backups).
*   Scripts temporários de limpeza (`scripts/generate_cleanup_script.py`, etc).
*   Apenas `supabase/clean_production_schema.sql` e novas migrações em `supabase/migrations/*.sql` são permitidas.

---
*Este documento serve como marco zero para a nova fase de estabilidade do projeto.*
