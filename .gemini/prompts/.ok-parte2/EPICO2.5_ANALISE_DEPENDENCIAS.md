
-----

### Prompt Detalhado para o Agente

(Salve este conteúdo em um arquivo, por exemplo, `EPICO2.5_ANALISE_DEPENDENCIAS.md`)

**Agente a ser utilizado:** `frontend-ui-performance-engineer`

**Assunto: Missão de Análise de Risco - Mapear Dependências para o Épico 2.5 (Feature Flags)**

**Contexto:**
Estamos prestes a iniciar o **Épico 2.5**, que implementará um sistema de *feature flags* para controlar a visibilidade das páginas da aplicação. O objetivo é liberar para o cliente uma versão inicial estável contendo apenas os módulos essenciais, enquanto continuamos a trabalhar nos outros.

**Páginas que Ficarão Visíveis (Ativas):**

1.  `Dashboard` (`/dashboard`)
2.  `Vendas (PDV)` (`/sales`)
3.  `Estoque` (`/inventory`)

**Páginas que Serão Ocultadas (Inativas Temporariamente):**

1.  `Clientes (CRM)` (`/customers`)
2.  `Fornecedores` (`/suppliers`)
3.  `Relatórios` (`/reports`)
4.  `Movimentações` (`/movements`)
5.  `Entregas` (`/delivery`)
6.  `Despesas` (`/expenses`)

**O Problema a ser Investigado:**
Precisamos garantir que as páginas **Ativas** não possuam dependências críticas de componentes, hooks ou fluxos de dados originários das páginas que serão **Inativas**. Uma quebra de dependência pode causar crashes ou bugs na versão em produção. Um exemplo claro é o componente de busca de clientes na página de Vendas.

**Sua Missão:**
Sua tarefa é realizar uma análise de dependência de código-fonte para identificar todos os pontos de acoplamento entre os módulos Ativos e Inativos e produzir um relatório de risco.

1.  **Análise do Módulo de Vendas (`/sales`):**

      * Começando pelo arquivo `src/features/sales/components/SalesPage.tsx`, rastreie todas as importações.
      * Identifique todos os componentes, hooks ou serviços que são importados de diretórios de funcionalidades que serão desativadas (ex: `src/features/customers/...`).
      * Para cada dependência encontrada, avalie o impacto. O componente de busca de clientes, por exemplo, é uma dependência essencial. A página de vendas quebrará se a página `/customers` estiver "desligada"? Ou o componente de busca é autônomo?

2.  **Análise do Módulo de Estoque (`/inventory`):**

      * Repita o processo, começando pelo arquivo `src/features/inventory/components/InventoryManagement.tsx`.
      * Verifique se existem dependências com os módulos de Fornecedores, Relatórios, etc.

3.  **Análise do Dashboard (`/dashboard`):**

      * Repita o processo para o arquivo `src/features/dashboard/components/Dashboard.tsx`. O Dashboard é um ponto crítico, pois ele provavelmente exibe dados de todos os outros módulos.
      * Liste todos os cards e gráficos do Dashboard que dependem de dados dos módulos que serão desativados.

**Formato da Entrega:**
Crie um novo documento em `docs/diagnostics/FEATURE_FLAGS_DEPENDENCY_REPORT.md`. O relatório deve conter:

```markdown
# Relatório de Análise de Dependências - Épico 2.5

## 1. Resumo do Risco
(Uma avaliação geral: Baixo, Médio, Alto)

## 2. Análise de Dependências por Módulo

### Módulo: Vendas (PDV)
- **Dependência 1:** Componente `CustomerSearch`
    - **Arquivo de Origem:** `src/features/sales/components/CustomerSearch.tsx`
    - **Depende de:** Módulo `/customers`
    - **Análise de Risco:** [Avalie se o componente funcionará de forma isolada ou se a página inteira de Clientes precisa estar acessível]
    - **Recomendação:** [Ex: Manter o componente de busca funcional, mesmo com a página de CRM desativada.]
- **(Liste outras dependências)**

### Módulo: Estoque
- **(Liste as dependências encontradas, se houver)**

### Módulo: Dashboard
- **Dependência 1:** Card "Clientes Recentes"
    - **Depende de:** Dados do módulo `/customers`
    - **Análise de Risco:** O card quebrará se o módulo CRM estiver inativo.
    - **Recomendação:** Ocultar este card através da mesma feature flag que oculta a página do CRM.
- **(Liste outras dependências)**

## 3. Conclusão e Plano de Mitigação
(Resuma os pontos críticos e sugira uma estratégia para garantir que a aplicação não quebre. Ex: "Os componentes X, Y e Z no Dashboard devem ser ocultados condicionalmente. A busca de cliente na Venda deve ser testada de forma isolada.")
```

Este relatório nos dará a clareza necessária para implementar as feature flags com total segurança.