

### Prompt Detalhado para a Missão de Implementação

(Salve este conteúdo em um arquivo, por exemplo, `EPICO2.5_MISSAO2_IMPLEMENTACAO_FEATURE_FLAGS.md`)

**Agentes a serem utilizados:** `supabase-database-architect` (Fase 1), `frontend-ui-performance-engineer` (Fase 2)

**Assunto: Missão de Implementação - Épico 2.5: Construir o Sistema de Feature Flags**

**Contexto:**
Com a conclusão bem-sucedida da auditoria e limpeza do nosso sistema de permissões, estamos prontos para a tarefa principal do Épico 2.5. O objetivo é criar um sistema de *feature flags* que nos permita controlar dinamicamente quais módulos (páginas) são visíveis para os usuários, diretamente do banco de dados, sem a necessidade de um novo deploy.

**Estratégia de Lançamento (Configuração Inicial):**
Para o lançamento inicial, queremos que o cliente tenha acesso apenas ao essencial e estável:

  * **Páginas Ativas:** Vendas, Estoque, Clientes (para suportar as Vendas).
  * **Páginas Inativas:** Dashboard, Fornecedores, Relatórios, Movimentações, etc.

A missão está dividida em duas fases que devem ser executadas em sequência.

-----

### **Fase 1: Arquitetura do Banco de Dados (Executar por: `supabase-database-architect`)**

Sua tarefa é modificar o banco de dados para suportar o armazenamento e a verificação de *feature flags*.

1.  **Alteração da Tabela `profiles`:**

      * Adicione uma nova coluna na tabela `public.profiles` chamada `feature_flags`.
      * O tipo da coluna deve ser `JSONB`.
      * Ela não deve permitir valores nulos e seu valor padrão deve ser um objeto JSON vazio (`'{}'::jsonb`).

2.  **Criação da Função de Verificação:**

      * Crie uma nova função de segurança em SQL chamada `public.has_feature_flag(p_flag_name TEXT)`.
      * A função deve retornar `BOOLEAN`.
      * **Lógica:** A função deve:
          * Obter o `feature_flags` do perfil do usuário atualmente logado (baseado em `auth.uid()`).
          * Verificar se dentro desse JSON existe uma chave com o nome `p_flag_name`.
          * Retornar `true` se a chave existir e seu valor for `true`. Em todos os outros casos (chave não existe, valor é `false`, `null`, ou qualquer outra coisa), deve retornar `false`.

3.  **Script de Atualização:**

      * Forneça um script SQL `UPDATE` para definir a configuração de flags inicial para todos os usuários existentes na tabela `profiles`. O JSON a ser inserido na coluna `feature_flags` deve ser:

    <!-- end list -->

    ```json
    {
      "dashboard_enabled": false,
      "sales_enabled": true,
      "inventory_enabled": true,
      "customers_enabled": true,
      "suppliers_enabled": false,
      "reports_enabled": false,
      "movements_enabled": false,
      "delivery_enabled": false,
      "expenses_enabled": false
    }
    ```

**Entrega da Fase 1:**

  * Um relatório de conclusão (`docs/feature-flags/DB_IMPLEMENTATION_REPORT.md`) contendo os scripts SQL para a migração da tabela, a criação da função `has_feature_flag`, e o script de atualização dos usuários existentes.

-----

### **Fase 2: Implementação no Frontend (Executar por: `frontend-ui-performance-engineer`)**

Com o backend pronto, sua tarefa é fazer a interface do usuário respeitar as *feature flags*.

1.  **Atualização do `AuthContext`:**

      * Modifique a lógica de busca de perfil de usuário no `AuthContext.tsx` para incluir a nova coluna `feature_flags` na consulta `SELECT`.
      * Armazene o objeto `feature_flags` no estado do contexto, tornando-o acessível em toda a aplicação.

2.  **Criação do Hook `useFeatureFlag`:**

      * Crie um novo hook customizado em `src/shared/hooks/auth/useFeatureFlag.ts`.
      * Este hook deve acessar o `AuthContext`, receber o nome de uma flag como argumento (ex: `"dashboard_enabled"`) e retornar um booleano (`true` ou `false`) indicando se a feature está ativa para o usuário logado.

3.  **Implementação no `Sidebar`:**

      * No componente `Sidebar.tsx`, utilize o novo hook `useFeatureFlag` para renderizar condicionalmente cada item do menu de navegação.
      * Por exemplo, o link para o Dashboard só deve ser renderizado se `useFeatureFlag('dashboard_enabled')` retornar `true`.

**Entrega da Fase 2:**

  * Um relatório de conclusão (`docs/feature-flags/FRONTEND_IMPLEMENTATION_REPORT.md`) detalhando as modificações nos arquivos (`AuthContext.tsx`, `useFeatureFlag.ts`, `Sidebar.tsx`) e confirmando que a UI agora reflete dinamicamente as permissões do banco de dados.

-----

### Comando para o Agente

(Para ser usado junto com o arquivo `.md` que você salvou. Execute primeiro para o `supabase-database-architect` e, após a conclusão, para o `frontend-ui-performance-engineer`)

**Comando para Fase 1 (Backend):**
`@agent-supabase-database-architect execute a Fase 1 da missão de implementação de Feature Flags, detalhada no arquivo prompt.md. O objetivo é preparar o banco de dados para o novo sistema de permissões.`

**Comando para Fase 2 (Frontend):**
`@agent-frontend-ui-performance-engineer execute a Fase 2 da missão de implementação de Feature Flags, detalhada no arquivo prompt.md. O objetivo é fazer a UI respeitar as flags definidas no banco de dados.`