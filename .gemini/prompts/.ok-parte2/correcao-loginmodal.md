
---

### Prompt para o Agente

(Salve este conteúdo em um arquivo, por exemplo, `FIX_LOGIN_MODAL_CSS.md`)

**Agente a ser utilizado:** `frontend-ui-performance-engineer`

**Assunto: Missão de Correção Crítica de UI - Formulário de Login está Invisível**

**Contexto:**
Após as recentes atualizações, o formulário de login na página de autenticação (`Auth.tsx`) tornou-se invisível. A análise do DOM confirma que o componente e seus elementos HTML estão sendo renderizados, mas as regras de CSS estão impedindo sua visualização.

**Sua Missão:**
1.  **Localize o Componente:** Abra e analise o arquivo `src/pages/Auth.tsx`.

2.  **Depuração de CSS:**
    * Investigue as classes do Tailwind CSS aplicadas ao `Card` principal que envolve o formulário e aos elementos internos (`CardHeader`, `CardContent`, `Label`, `Input`, `Button`).
    * Identifique a(s) regra(s) que está(ão) causando a invisibilidade. Suspeitos comuns são:
        * Cor do texto igual à cor de fundo do card (ex: `text-black` em um `bg-black`).
        * Classes de transparência (`opacity-0`) ou cor de fundo transparente (`bg-transparent`) sendo aplicadas indevidamente.
        * Um `z-index` incorreto, colocando o formulário atrás de outro elemento.

3.  **Implemente a Correção:**
    * Ajuste as classes do Tailwind no `Auth.tsx` para garantir que o card tenha um fundo visível (ex: `bg-card`) e que o texto e os inputs tenham cores contrastantes (ex: `text-card-foreground`).
    * Garanta que o formulário seja claramente legível sobre a imagem de fundo da página.

**Critério de Aceitação:**
- O formulário de login, com seus campos de email, senha e botão, deve ser claramente visível e utilizável na página de autenticação.

---
