# Roadmap de Evolução: Análise de Rentabilidade no Adega Manager

> **Autor:** Kyrie
> **Data:** 28 de setembro de 2025
> **Status:** Planejado  फ्यूचर
> **Contexto:** Este documento detalha os próximos passos para a integração estratégica da métrica de **Margem de Lucro** em outras áreas do sistema. A análise de rentabilidade já foi implementada no modal de edição de produtos para fornecer feedback imediato durante a precificação. As melhorias descritas aqui visam transformar essa métrica em uma ferramenta de análise de negócio mais ampla e estratégica.

---

## 1. Visão Geral

O objetivo é evoluir o Adega Manager de um sistema de controle operacional para uma plataforma de inteligência de negócio (Business Intelligence). A correta visualização da **Margem de Lucro** é um pilar central para essa evolução, permitindo que os gestores tomem decisões mais assertivas sobre precificação, compras e estratégias de venda.

As implementações futuras devem focar em três áreas principais, sempre condicionadas a um sistema robusto de permissões.

## 2. Locais Estratégicos para Exibição da Margem de Lucro

### 2.1. Módulo de Relatórios (`/reports`)

Atualmente, o foco é operacional. A evolução passa pela criação de uma nova seção de **"Relatórios Financeiros e de Rentabilidade"**.

* **Requisito:** Criar um relatório chamado **"Análise de Rentabilidade de Produtos"**.
* **Funcionalidades:**
    * Listar todos os produtos em uma tabela.
    * Exibir colunas-chave como: `Preço de Custo`, `Preço de Venda (Unidade)`, `Margem de Lucro (Unidade %)` , `Preço de Venda (Pacote)`, `Margem de Lucro (Pacote %)` e `Lucro Bruto Total (R$)` por produto.
    * **Filtros Avançados:** Permitir filtrar por `Categoria`, `Fornecedor` e `Período de Vendas`.
    * **Ordenação:** Permitir que o usuário ordene a tabela pelas colunas de margem de lucro (ascendente e descendente) para identificar rapidamente os produtos mais e menos lucrativos.
* **Objetivo Estratégico:** Fornecer uma visão macro que responda a perguntas como: "Quais são os 10 produtos que mais me dão lucro?" ou "A categoria de vinhos importados é mais rentável que a de cervejas artesanais?".

### 2.2. Dashboard Principal (`/dashboard`)

O Dashboard deve fornecer uma visão gerencial rápida e de alto nível da saúde do negócio.

* **Requisito 1:** Criar um novo Card de KPI chamado **"Margem de Lucro Média"**.
    * **Cálculo:** `(Soma do Lucro Bruto de todas as vendas / Soma da Receita Total) * 100` em um determinado período.
    * **Visualização:** Exibir o percentual com um indicador de tendência (subindo ou descendo) em comparação com o período anterior.
* **Requisito 2:** Criar um novo componente de Dashboard chamado **"Top 5 Produtos Mais Rentáveis"**.
    * **Lógica:** Exibir uma lista simples com o nome do produto e sua respectiva margem de lucro em %.
    * **Visualização:** Pode ser uma lista vertical ou um gráfico de barras horizontal simples.
* **Objetivo Estratégico:** Permitir que o gestor, ao acessar o sistema, tenha uma noção imediata da performance de rentabilidade do negócio sem precisar navegar para relatórios detalhados.

### 2.3. Tabela Principal de Inventário (`/inventory`)

Para agilizar a análise operacional, a informação de margem deve estar presente diretamente na tela de gerenciamento de produtos.

* **Requisito:** Adicionar duas novas colunas na tabela principal de produtos: **"Margem Un. (%)"** e **"Margem Pct. (%)"**.
* **Implementação Crucial:** A visibilidade dessas colunas (e da coluna de `Preço de Custo`) **deve ser restrita**. Apenas usuários com perfis de `Administrador` ou `Gerente` devem poder vê-las. Para outros perfis, como `Vendedor`, essas colunas devem estar completamente ocultas.
* **Objetivo Estratégico:** Facilitar a comparação rápida da rentabilidade entre produtos sem a necessidade de abrir o modal de edição de cada um, otimizando o tempo do gestor.

## 3. Pré-requisito Fundamental: Sistema de Permissões (RBAC)

Nenhuma das melhorias acima deve ser implementada sem um sistema de **Controle de Acesso Baseado em Perfil (Role-Based Access Control - RBAC)**.

* **Definição de Perfis:** Definir claramente os perfis de usuário no sistema (ex: `Administrador`, `Gerente`, `Vendedor`, `Estoquista`).
* **Lógica de Acesso:** Implementar uma lógica no frontend e, se necessário, com RLS (Row-Level Security) no Supabase, para garantir que:
    * Dados sensíveis como `preço de custo` e `margem de lucro` só sejam renderizados para os perfis autorizados.
    * O acesso a páginas inteiras, como os novos relatórios financeiros, seja bloqueado para usuários não autorizados.

Este documento servirá como um guia para o desenvolvimento futuro, garantindo que as funcionalidades de análise de rentabilidade sejam construídas de forma coesa, estratégica e segura.