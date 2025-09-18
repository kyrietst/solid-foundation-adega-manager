# Prompt para Agente Supabase: Migração para Estoque de Dupla Contagem

Olá! Assuma sua persona de **Arquiteto de Banco de Dados Supabase Sênior**.

Estamos executando uma mudança estratégica na arquitetura de estoque do projeto Adega Manager para atender a um requisito de negócio crítico que está impedindo o deploy da aplicação.

/contexto

**Status:** Iniciando a Tarefa 1 do ÉPICO 1: Implementar Estoque de Dupla Contagem.
**Objetivo Imediato:** Executar a migração do schema da tabela `products` para suportar a contagem separada de pacotes e unidades soltas.
**Bloqueios:** Nenhum. Esta é a primeira ação de codificação do novo plano.

---

### Contexto do Negócio

A gestão de estoque atual, baseada em uma única contagem de unidades totais (`stock_quantity`), não reflete a realidade operacional da nossa cliente. Ela precisa gerenciar o estoque em duas "caixas" separadas:
1.  **Pacotes Fechados:** A quantidade de fardos/caixas que ela tem em estoque.
2.  **Unidades Soltas:** A quantidade de itens individuais que não estão em um pacote fechado.

O sistema precisa permitir que ela insira e visualize essas duas contagens de forma independente.

### Análise Técnica

**Estado Atual do Schema:**
A tabela `products` possui uma coluna `stock_quantity` (INTEGER) que representa a fonte única da verdade para o total de unidades de um produto. A exibição de "pacotes" é um cálculo derivado no frontend.

**Estado Desejado (A ser implementado):**
Precisamos modificar a tabela `products` para que a fonte da verdade seja a contagem separada de pacotes e unidades.

### Sua Tarefa

Sua missão é gerar os scripts SQL e a orientação necessários para executar essa migração de schema de forma segura e eficiente.

**Por favor, siga estes passos e forneça os seguintes resultados:**

**1. Script de Alteração do Schema (DDL):**
   * Gere o script SQL `ALTER TABLE` para adicionar duas novas colunas à tabela `products`:
     * `stock_packages` (INTEGER, NOT NULL, DEFAULT 0)
     * `stock_units_loose` (INTEGER, NOT NULL, DEFAULT 0)
   * Garanta que as colunas sejam criadas com valores padrão para não quebrar as inserções existentes.

**2. Estratégia para `stock_quantity`:**
   * Avalie a melhor abordagem para a coluna `stock_quantity` existente. A nossa hipótese é transformá-la em uma **coluna gerada** para manter a compatibilidade com partes do sistema que ainda não foram refatoradas e para garantir a consistência dos dados.
   * Forneça o script SQL para modificar a coluna `stock_quantity` para ser: `GENERATED ALWAYS AS (stock_packages * package_units + stock_units_loose) STORED`.
   * Se você tiver uma recomendação arquitetural melhor, por favor, justifique-a.

**3. Script de Migração de Dados (DML):**
   * Crie um script SQL de migração **(one-time script)** que irá popular as novas colunas `stock_packages` e `stock_units_loose` para todos os produtos já existentes.
   * A lógica de migração deve ser baseada nos valores atuais de `stock_quantity` e `package_units`.
   * **Lógica:**
     * `SET stock_packages = floor(stock_quantity / NULLIF(package_units, 0))` (usar `NULLIF` para evitar divisão por zero).
     * `SET stock_units_loose = mod(stock_quantity, NULLIF(package_units, 0))`
     * **Importante:** Para produtos onde `package_units` é `null`, `0` ou `1`, o `stock_packages` deve ser `0` e `stock_units_loose` deve ser igual ao `stock_quantity`.

### Entregáveis Esperados

Ao final, por favor, forneça uma única resposta contendo:

1.  O script SQL completo para o `ALTER TABLE`.
2.  O script SQL completo para a migração de dados.
3.  Uma breve explicação confirmando que a abordagem da coluna gerada é a ideal ou propondo uma alternativa justificada.
4.  Quaisquer riscos ou pontos de atenção que devemos considerar ao rodar estes scripts no nosso ambiente de desenvolvimento.

Com estes artefatos, teremos a fundação do nosso novo sistema de estoque pronta.