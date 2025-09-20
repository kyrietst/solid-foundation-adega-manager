
---

### Prompt para Análise de Permissões

(Salve este conteúdo em um arquivo, por exemplo, `EPICO2.5_ANALISE_RBAC.md`)

**Agente a ser utilizado:** `supabase-database-architect`

**Assunto: Missão de Análise de Arquitetura - Mapear o Sistema de Roles e RLS Atuais**

**Contexto:**
Estamos nos preparando para implementar o **Épico 2.5 (Feature Flags)**, que introduzirá um controle de acesso a funcionalidades em nível de usuário. Antes de projetar esta nova camada, precisamos de um entendimento completo e detalhado do nosso sistema de Role-Based Access Control (RBAC) e Row-Level Security (RLS) existente, que já controla o que os usuários `admin`, `employee` e `delivery` podem fazer e ver.

**Sua Missão:**
Sua tarefa é realizar uma auditoria completa no nosso banco de dados Supabase e produzir um relatório que documente a arquitetura de permissões atual.

1.  **Análise da Tabela `profiles`:**
    * Inspecione a estrutura da tabela `profiles`. Ela é o nosso ponto central para os dados do usuário.
    * Documente as colunas relevantes para permissões, especialmente a coluna `role`. Verifique se o tipo de dado é um `enum` (`user_role`) e liste os valores possíveis (`admin`, `employee`, `delivery`).

2.  **Mapeamento das Políticas RLS:**
    * Faça uma varredura em todo o esquema para listar as tabelas mais críticas que possuem políticas de RLS ativas.
    * Para as tabelas principais (`sales`, `products`, `customers`), resuma as regras de acesso para cada um dos três papéis. Por exemplo:
        * **Tabela `products`:**
            * `admin`: Acesso total (leitura e escrita).
            * `employee`: Acesso de leitura, mas não pode ver o `cost_price`.
            * `delivery`: Acesso de apenas leitura.
        * **Tabela `sales`:**
            * `admin`: Acesso total.
            * `employee`: Pode criar e ler vendas, mas não pode deletar.
            * `delivery`: Só pode ler as vendas que lhe foram atribuídas.

3.  **Análise de Funções de Segurança:**
    * Verifique a existência de funções auxiliares de segurança, como `has_role()`, que são utilizadas dentro das políticas RLS para verificar as permissões do usuário. Documente como elas funcionam.

**Formato da Entrega:**
Crie um novo documento em `docs/diagnostics/RBAC_RLS_AUDIT_REPORT.md`. O relatório deve ser claro e organizado, respondendo às seguintes perguntas:
* Como o papel de um usuário é definido no nosso banco de dados?
* Quais são as principais permissões e restrições para um `admin`?
* Quais são as principais permissões e restrições para um `employee`?
* Quais são as principais permissões e restrições para um `delivery`?
* Como o sistema tecnicamente verifica essas permissões?

Este relatório será a nossa fonte da verdade para projetar o sistema de feature flags de forma que ele complemente, e não entre em conflito, com a segurança que já temos.