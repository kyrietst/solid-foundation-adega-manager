

-----

### **Plano de Ação Final (Versão Ultra-Simplificada)**

A missão agora é de uma única fase, focada 100% no frontend. A sua conta `admin` servirá como a conta de "desenvolvedor" para testes.


**Nossa Próxima Missão (Para o Agente):**
Atualizar o `Sidebar` para que ele desabilite visualmente os links para as `roles` que não sejam `admin`.

-----

### Prompt Atualizado para o Agente

**Agente a ser utilizado:** `frontend-ui-performance-engineer`

**Assunto: Missão Final de UI - Implementar "Modo de Acesso Focado" no Sidebar para Não-Admins**

**Contexto:**
Simplificamos nossa estratégia de controle de acesso. A `role` `admin` existente terá acesso a tudo. Para todas as outras `roles` (`employee`, `delivery`), queremos que os módulos em desenvolvimento fiquem visíveis, porém desabilitados.

**Sua Missão:**

1.  **Localize o Componente:** Abra o arquivo `src/app/layout/Sidebar.tsx`.

2.  **Implemente a Lógica de Desabilitação:**

      * Utilize o hook `usePermissions` ou o hookie correto para verificar se o usuário logado **não** é um `admin`.
      * Para os links dos módulos que queremos restringir (`Dashboard`, `Relatórios`, `Fornecedores`, `Movimentações`, `Entregas`, `Despesas`), passe uma `prop` `disabled` para o componente de link se o usuário não for `admin`.

    **Exemplo da Lógica:**

    ```tsx
    const { isAdmin } = usePermissions();

    // ... dentro do JSX para o link de Relatórios
    <SidebarLink href="/reports" disabled={!isAdmin}>
      Relatórios
    </SidebarLink>
    ```

3.  **Atualize o Estilo Visual:**

      * Modifique o componente de link da sidebar para que, ao receber a `prop` `disabled={true}`, ele aplique os seguintes estilos:
          * Cor do texto e do ícone em tom de cinza (`text-gray-500`).
          * `pointer-events-none` para desativar o clique.
      * Adicione um ícone de cadeado (`<IconLock />`) ao lado do texto do link quando ele estiver desabilitado.

**Critério de Aceitação:**

  * Um usuário com a `role` `employee` ou `delivery` deve ver todos os links, mas apenas os permitidos para sua função (ex: `Vendas`, `Estoque`, `Clientes` para `employee`) devem estar clicáveis. Os outros devem estar cinzas e com um ícone de cadeado.
  * Um usuário com a `role` `admin` deve ver todos os links habilitados e sem o ícone de cadeado.