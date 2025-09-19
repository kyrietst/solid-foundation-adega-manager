
---

### Prompt para Agente Frontend: Correção de Bug Visual no Preview do `StockAdjustmentModal`

Olá! Assuma sua persona de **Engenheiro de Frontend Sênior**, especialista em depuração de estado em React.

Encontramos um bug visual no componente `StockAdjustmentModal.tsx`. A lógica de cálculo e a comunicação com o backend estão funcionando perfeitamente, mas a seção "Preview de Mudança" está exibindo um valor inicial de estoque incorreto.

**Contexto do Bug:**

* **Ação:** O usuário ajusta um produto com estoque inicial de **43 pacotes** para um novo valor de **20 pacotes**.
* **Comportamento Esperado no Preview:** `Atualização de pacotes: 43 -> 20 (-23)`
* **Comportamento Atual (Bug):** `Atualização de pacotes: 40 -> 20 (-23)`
* **Diagnóstico:** O valor "de" (o estado inicial) no preview está incorreto. A causa provável é que a UI do preview está lendo de um estado (`useState`) ou prop (`props`) que não está sincronizado com os dados mais recentes buscados pelo React Query.

**Sua Tarefa:**

Sua missão é depurar e corrigir este bug visual no `StockAdjustmentModal.tsx`.

**Por favor, siga estes passos:**

1.  **Análise do Componente:**
    * Abra o arquivo `src/features/inventory/components/StockAdjustmentModal.tsx`.
    * Localize a seção do JSX que renderiza o "Preview de Mudança".
    * Inspecione a origem dos dados que populam este texto. Rastreie a variável que contém o valor inicial incorreto (40).

2.  **Implementação da Correção:**
    * Refatore a lógica para garantir que a UI do preview sempre use o valor inicial de `stock_packages` vindo diretamente do objeto `product` que é retornado pela query do React Query.
    * Certifique-se de que não há estados intermediários ou props defasadas causando a inconsistência. A fonte da verdade para o estoque inicial deve ser uma só.

### Entregáveis Esperados

Forneça uma única resposta contendo:

1.  **Análise da Causa Raiz:** Uma breve explicação de qual variável ou fluxo de dados estava causando o bug visual.
2.  **Código Completo e Corrigido:** O código-fonte final e completo do arquivo `src/features/inventory/components/StockAdjustmentModal.tsx` com a correção aplicada, pronto para ser copiado e colado.