
---

### Prompt Detalhado para a Fase 2

(Salve este conteúdo em um arquivo, por exemplo, `EPICO2_FASE2_CERTIFICACAO_COMPONENTES.md`)

**Agente a ser utilizado:** `frontend-ui-performance-engineer`

**Assunto:** **Missão de Execução - Épico 2, Fase 2: Certificação Completa do Design System**

**Contexto Global:**
Você está executando a Fase 2 do Épico 2. A Fase 1 foi concluída com sucesso, resultando em três artefatos cruciais que agora são suas fontes de verdade:
1.  `docs/design-system/TOKEN-AUDIT-REPORT.md`: Nosso guia para corrigir a base de estilos.
2.  `docs/design-system/governance.md`: Nossa "constituição", contendo todas as regras que um componente deve seguir.
3.  `docs/design-system/CERTIFICATION-REPORT.md`: O seu mapa de trabalho, listando os 84 componentes que você deve certificar.

**Sua Missão Principal:**
Sua missão é transformar todos os 84 componentes listados como "Pendente de Verificação" no `CERTIFICATION-REPORT.md` para o status "Certificado". Você deve seguir as regras da nossa governança e a base de tokens auditada para garantir que, ao final desta missão, nosso Design System seja robusto, consistente e seguro.

**Plano de Execução Autônoma:**
Você deve analisar esta missão e criar seu próprio plano de subtarefas para completá-la. O plano a seguir é uma recomendação estratégica para garantir a segurança e a eficiência.

---

### **Fases de Execução Recomendadas**

#### **Sub-fase 2.1: Preparação do Terreno (Pré-voo)**

* **Tarefa 1: Aplicar Correções de Tokens.**
    * **Ação:** Implemente as 3 correções seguras identificadas no `TOKEN-AUDIT-REPORT.md` diretamente no arquivo `tailwind.config.ts`.
    * **Justificativa:** A base de estilos deve ser corrigida antes de qualquer componente ser validado contra ela.

#### **Sub-fase 2.2: Certificação dos Primitivos (Fundação da UI)**

* **Tarefa 2: Certificar o "Core Kit" de Primitivos.**
    * **Ação:** Comece certificando o lote dos 6 componentes mais críticos e fundamentais: `Button`, `Input`, `Card`, `Badge`, `Label`, `Separator`.
    * **Justificativa:** Estes componentes são os blocos de construção mais básicos; certificá-los primeiro garante uma base estável para os componentes mais complexos.

* **Tarefa 3: Certificar os Primitivos Restantes.**
    * **Ação:** Continue o processo de certificação para os 23 primitivos restantes, conforme listado no `CERTIFICATION-REPORT.md`.

#### **Sub-fase 2.3: Certificação dos Compostos e Layouts**

* **Tarefa 4: Certificar Componentes Compostos Chave.**
    * **Ação:** Certifique os componentes compostos mais importantes, como `PageHeader`, `StatCard`, `DataTable`, `SearchInput`, e `PaginationControls`. Verifique se eles utilizam corretamente os primitivos já certificados.
    * **Justificativa:** Validar estas "montagens" garante que o sistema funciona bem em conjunto.

* **Tarefa 5: Certificação Final.**
    * **Ação:** Prossiga com a certificação de todos os componentes restantes (Compostos, Layout, Efeitos) no `CERTIFICATION-REPORT.md`.

---

### **Processo de Certificação (Sua "Checklist" para Cada Componente)**

Para mover um componente de "Pendente de Verificação" para "Certificado", você deve garantir que ele passe em **TODOS** os seguintes critérios:

1.  **✅ Conformidade com a Governança:**
    * O componente adere a todas as regras estipuladas no `governance.md`?
    * **Acessibilidade:** É 100% compatível com WCAG 2.1 AA (navegável por teclado, atributos ARIA corretos, contraste adequado)?
    * **Nomenclatura:** O nome do arquivo e do componente segue nossos padrões?

2.  **✅ Uso de Tokens de Design:**
    * O componente está livre de valores *hardcoded* (cores, fontes, espaçamentos, sombras, etc.)?
    * Todos os estilos são derivados dos tokens definidos no nosso `tailwind.config.ts` otimizado?

3.  **✅ Composição Correta (para componentes compostos):**
    * O componente utiliza outros primitivos ou compostos que já foram certificados? (Ex: `PageHeader` deve usar um `Button` certificado).

4.  **✅ Validação de Código:**
    * O código passa no nosso lint (`npm run lint`) sem avisos?
    * As props do componente estão corretamente tipadas com TypeScript?

**Entrega Final:**

1.  **`CERTIFICATION-REPORT.md` Atualizado:** Ao final da missão, o `CERTIFICATION-REPORT.md` deve ter o status de todos os 84 componentes alterado para "**Certificado**".
2.  **Relatório de Conclusão da Fase 2:** Gere um novo relatório (`docs/design-system/PHASE-2-COMPLETION-REPORT.md`) resumindo o trabalho realizado, os desafios encontrados e confirmando que o Design System está agora 100% certificado.