# Developer Onboarding: Fiscal & API Context

> **Start Here.** This guide is the "Missing Manual" for developers working on the Adega Manager Fiscal Module.

**Criticidade:** EXTREMA. Este módulo lida com dinheiro e obrigações fiscais.

---

## 1. The Mindset: Zero Trust & Integridade

Ao trabalhar neste projeto, você deve internalizar 3 regras absolutas:

1.  **Zero Trust no Cliente:** Nunca confie no que vem do frontend. O preço do produto, o cálculo do imposto e o estoque devem ser validados ou recalculados no backend (Banco de Dados ou Edge Function).
2.  **Isolamento Fiscal (Safety Lock):** Vendas "Fiado", "Balcão sem Nota" ou "Internas" **NUNCA** devem tocar a API da SEFAZ. O sistema possui travas de segurança (no hook `useSalesMutations`) que impedem isso. Jamais remova essas travas.
3.  **Source of Truth:** O Banco de Dados é a verdade. Se o banco diz que o estoque é 10, é 10. Se o banco diz que a venda foi cancelada, ela foi. A UI é apenas um reflexo.

---

## 2. Mapa do Tesouro (Onde estão as coisas?)

Não reinvente a roda. Leia estes documentos antes de codar:

### 🏛️ Arquitetura & Código
-   **[`API_REFERENCE.md`](./API_REFERENCE.md)**: Visão geral de RPCs e funções.
-   **[`standards/02_RPC_REFERENCE.md`](./standards/02_RPC_REFERENCE.md)**: Detalhes das Stored Procedures (`process_sale`, etc). Use isso para entender os parâmetros.
-   **[`NUVEM_FISCAL_INTEGRATION.md`](./NUVEM_FISCAL_INTEGRATION.md)**: "Guia de Sobrevivência" da integração. Explica Payload JSON, Erros 539, e o fluxo de Cancelamento Híbrido.

### ⚙️ Ambientes e Chaves
-   **[`modules/06_FISCAL_ENVIRONMENT_SETUP.md`](./modules/06_FISCAL_ENVIRONMENT_SETUP.md)**: Como mudar de **Homologação** (Sandbox) para **Produção**. Explica a tabela `store_settings` e os `Secrets` da Edge Function.
-   **[`PRODUCTION_GO_LIVE_GUIDE.md`](./PRODUCTION_GO_LIVE_GUIDE.md)**: Checklist passo-a-passo para o dia do Go-Live.

### 🧠 Regras de Negócio Complexas
-   **[`SEFAZ_LOGIC_RULES.md`](./SEFAZ_LOGIC_RULES.md)**: Explica por que usamos `vOutro` em vez de `vFrete` em SP, e como funciona a distribuição ponderada de descontos.
-   **[`modules/07_FISCAL_QRCODE_STRATEGY.md`](./modules/07_FISCAL_QRCODE_STRATEGY.md)**: Explica a "Opção Nuclear" de parsing de XML para garantir que o QR Code sempre apareça.

---

## 3. Fluxo de Desenvolvimento Seguro

### A. Adicionando uma Feature Fiscal
1.  **Crie a RPC:** Se precisar mexer em dados, faça no PostgreSQL.
2.  **Crie o Hook:** Use `hooks/useFeature.ts` para chamar a RPC.
3.  **Teste em Homologação:** Certifique-se de que `store_settings.environment = 'homologation'`.

### B. Debugging de "Erro na Nota"
1.  Verifique o **Log da Edge Function** no Supabase Dashboard.
2.  Verifique a tabela **`invoice_logs`**. Ela guarda o JSON de request e response.
3.  Se for erro de chave/auth, consulte `06_FISCAL_ENVIRONMENT_SETUP.md`.

---

## 4. Padrões de Frontend Críticos (Não Quebre!)

### A. ReceiptModal & Impressão (Global Cache)
O modal de impressão fiscal usa um padrão de **Cache Global Singleton** (`printedFiscalIds` defined at module level) para controlar a auto-impressão.
*   **Por quê?** React remonta componentes frequentemente (invalidateQueries). UseRef local reseta e causa impressão dupla.
*   **Regra:** NUNCA mova a lógica de controle de impressão para dentro de `useState` ou `useRef` local do componente se for resetável. O ID impresso deve persistir pela sessão.

---

## 5. Glossário Rápido

*   **RPC**: Remote Procedure Call (Função do Postgres).
*   **Edge Function**: Código TypeScript rodando no Deno (Supabase Functions) que fala com o mundo externo (Nuvem Fiscal).
*   **Hybrid Flow**: O padrão onde salvamos o estado no banco *antes* ou *depois* da chamada fiscal, dependendo se é emissão ou cancelamento, para garantir consistência.
*   **Nuvem Fiscal**: Nosso gateway para a SEFAZ.

---

> _"Nunca quebre o Build, nunca pare a Produção."_
