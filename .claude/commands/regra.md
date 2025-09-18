3. Comando: /regra
Propósito: Registrar uma nova regra de negócio. Este comando adiciona conteúdo ao arquivo de regras.

Template de Uso:

Markdown

/regra

**Regra:** [Descreva a regra de negócio. Ex: Produtos do tipo 'PACK' devem ter seu estoque de venda calculado em tempo real.]
**Escopo:** [Onde a regra se aplica? Ex: API de Vendas, Componente do Carrinho.]
**Lógica:** [Como a regra funciona? Ex: `estoque_venda = floor(estoque_unidade / tamanho_pacote)`.]
**Exemplo:** [Um caso prático. Ex: Se `estoque_unidade` de 'Corona 330ml' é 11 e o `tamanho_pacote` é 6, o estoque de 'Pack com 6' é 1.]