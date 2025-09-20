
-----

### Prompt para o Agente (Correção Final)

(Salve este conteúdo em um arquivo, por exemplo, `FINAL_FIX_SIDEBAR.md`)

**Agente a ser utilizado:** `frontend-ui-performance-engineer`

**Assunto: Missão de Correção Final e Urgente - Completar a Lógica de Desabilitação no `Sidebar`**

**Contexto:**
A implementação anterior do "Modo de Acesso Focado" foi **incompleta**. A evidência visual confirma que, para um usuário com a `role` `employee`, vários links que deveriam estar desabilitados continuam ativos. Sua tarefa é corrigir esta falha.

**Regra de Negócio (A ser seguida à risca):**

  * **Apenas** os links para "Vendas", "Estoque" e "Clientes" devem estar habilitados para `roles` que não sejam `admin`.
  * **TODOS OS OUTROS** links (`Dashboard`, `Relatórios`, `Fornecedores`, `Movimentações`, `Entregas`, `Despesas`, `Usuários`) devem estar visualmente desabilitados (cinza, com ícone de cadeado) se o usuário não for `admin`.

**Sua Missão:**

1.  **Localize o Componente:** Abra o arquivo `src/app/layout/Sidebar.tsx`.

2.  **Audite CADA LINK:** Revise a lista de todos os links do menu, um por um.

3.  **Aplique a Lógica Faltante:** Para cada link que não seja "Vendas", "Estoque" ou "Clientes", garanta que a `prop` `disabled={!isAdmin}` esteja presente e funcional.

    **Exemplo do que está faltando e precisa ser adicionado:**

    ```tsx
    const { isAdmin } = usePermissions();

    // ...

    // O link do Dashboard PRECISA ter a prop disabled
    <SidebarLink href="/dashboard" disabled={!isAdmin}>
      Dashboard
    </SidebarLink>

    // O link de Relatórios PRECISA ter a prop disabled
    <SidebarLink href="/reports" disabled={!isAdmin}>
      Relatórios
    </SidebarLink>

    // E assim por diante para Movimentações e Entregas...
    ```

**Critério de Aceitação:**

  - Quando um usuário com a `role` `employee` estiver logado, a imagem do `Sidebar` deve corresponder exatamente à regra de negócio: apenas "Vendas", "Estoque" e "Clientes" habilitados, e todo o resto desabilitado com o estilo visual correto.

-----
