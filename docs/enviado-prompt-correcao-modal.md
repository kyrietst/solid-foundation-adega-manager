Input de Tarefa para o Engenheiro de Frontend Sênior
Assunto: Ordem de Serviço para Correção Final de Conformidade SSoT no Modal de Edição

ID da Tarefa: FE-SSOT-MODAL-FIX-20250917-02

Contexto da Tarefa:
A análise de conformidade dos modais de inventário (FE-SSOT-MODAL-AUDIT-20250917-01) foi concluída com sucesso, revelando 95% de conformidade com a arquitetura SSoT. Foi identificada uma única e pequena inconsistência no EditProductModal.tsx que precisa ser corrigida para alcançarmos 100% de conformidade.

Objetivo Principal:
Refatorar o EditProductModal.tsx para garantir que o campo de estoque (stock_quantity) não seja editável ou enviado através do formulário de edição de produto, reforçando o princípio de que todos os ajustes de estoque devem passar exclusivamente pelo StockAdjustmentModal.

Plano de Ação Detalhado:

Analisar o Schema de Validação:

Localize o schema de validação (provavelmente Zod) associado ao formulário dentro do EditProductModal.tsx ou em um hook relacionado (ex: useProductForm).

Remover o Campo de Estoque do Schema:

Modifique o schema para remover completamente o campo stock_quantity da validação de edição. A lógica de negócio dita que este campo não é um dado "editável" do produto, mas sim um valor que é resultado de movimentações.

Garantir que o Campo Seja Apenas de Exibição (Read-Only):

No JSX do formulário, dentro do EditProductModal.tsx, verifique o campo que exibe o stock_quantity.

Garanta que ele seja um campo de texto não interativo ou que tenha a propriedade disabled ou readOnly. O ideal é que ele seja acompanhado por um botão que chame o StockAdjustmentModal, como o relatório sugere que já acontece.

Entregáveis Esperados:

Confirmação Textual: Uma mensagem confirmando que o schema de validação do EditProductModal foi atualizado e que o campo stock_quantity não é mais parte dos dados do formulário de edição.

Trecho de Código (Snippet): Forneça o trecho do novo schema de validação (Zod) que evidencia a remoção do campo stock_quantity.