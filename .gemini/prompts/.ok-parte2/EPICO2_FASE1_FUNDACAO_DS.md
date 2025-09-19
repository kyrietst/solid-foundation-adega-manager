

---

### Prompt Detalhado para a Fase 1

(Salve este conteúdo em um arquivo, por exemplo, `EPICO2_FASE1_FUNDACAO_DS.md`)

**Agente a ser utilizado:** `frontend-ui-performance-engineer`

**Assunto:** **Missão de Fundação - Épico 2: Iniciar a Auditoria e Governança do Design System**

**Contexto:**
Iniciamos o **Épico 2**, focado na certificação do nosso Design System. Esta primeira fase é a mais crítica, pois ela estabelecerá a base e as regras para todo o trabalho de refatoração subsequente. O objetivo é auditar nossos fundamentos de design, documentar as regras e mapear o escopo do trabalho. A missão é de análise e criação de documentação, sem alterar componentes de UI ainda.

**Sua Missão está dividida em três tarefas principais e sequenciais:**

**Tarefa 1: Auditoria e Otimização dos Tokens de Design (`tailwind.config.ts`)**

1.  **Análise Crítica:** Abra o arquivo `tailwind.config.ts`. Realize uma auditoria completa em busca de:
    * **Inconsistências:** Cores, espaçamentos ou tipografia que não seguem a paleta "Adega Wine Cellar".
    * **Redundâncias:** Tokens duplicados ou com valores muito próximos que podem ser consolidados.
    * **Oportunidades de Melhoria:** Identifique se podemos criar novos tokens para valores que estão sendo repetidos "na mão" (hardcoded) em vários lugares do código.
2.  **Entrega:** Produza um relatório de auditoria em markdown (`docs/design-system/TOKEN-AUDIT-REPORT.md`) detalhando suas descobertas e as otimizações recomendadas. Se as mudanças forem seguras, aplique-as diretamente no arquivo `tailwind.config.ts`.

**Tarefa 2: Criação do Documento de Governança do Design System**

1.  **Criação do Artefato:** Crie um novo arquivo em `docs/design-system/governance.md`.
2.  **Conteúdo Mandatório:** Este documento será a "constituição" do nosso Design System. Ele deve definir claramente as seguintes regras, baseando-se nas melhores práticas e no `CLAUDE.md`:
    * **Princípios Fundamentais:** (Ex: "Consistência acima de tudo", "Acessibilidade não é opcional").
    * **Padrões de Nomenclatura:** Como nomear novos componentes e variações.
    * **Regras de Acessibilidade (WCAG 2.1 AA):** Uso obrigatório de atributos ARIA, contraste de cores e navegação por teclado.
    * **Diretrizes de Composição:** Quando criar um novo componente versus compor um existente a partir de primitivos.
    * **Uso de Layouts Padrão:** Detalhar como e quando utilizar os componentes de layout (`PageContainer`, `PageHeader`) para manter a consistência entre as telas.

**Tarefa 3: Geração do Relatório de Certificação de Componentes**

1.  **Execução do Script:** Utilize o script de análise existente em `scripts/design-system-analysis.js` para varrer o diretório `src/shared/ui` e gerar uma lista completa de todos os componentes primitivos e compostos.
2.  **Criação do Relatório:** Crie um novo arquivo, `docs/design-system/CERTIFICATION-REPORT.md`.
3.  **Estrutura do Relatório:** Formate a saída do script em uma tabela markdown com as seguintes colunas:
    * `Componente` (Nome do componente com link para o arquivo)
    * `Tipo` (Primitivo / Composto / Layout)
    * `Status da Certificação` (Preencha todos com o valor inicial: **"Pendente de Verificação"**)
    * `Observações` (Deixe em branco)

**Critério de Aceitação:**
Ao final desta missão, os três artefatos (`TOKEN-AUDIT-REPORT.md`, `governance.md` e `CERTIFICATION-REPORT.md`) devem existir dentro do diretório `docs/design-system/` e estar preenchidos conforme as especificações.

---

