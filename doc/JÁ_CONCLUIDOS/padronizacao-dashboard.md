# Padronização da Dashboard — Relatório de Alterações e Guia Técnico

Este documento descreve, de forma objetiva, as mudanças aplicadas na dashboard para padronizar layout, melhorar leitura e alinhar a UX com o restante do sistema. Ao final há um guia rápido de validação e pré‑requisitos.

## Objetivos
- Unificar a malha visual (grid) e os espaçamentos.
- Garantir hierarquia clara dos blocos e consistência entre alturas/larguras.
- Evitar duplicações (ex.: últimas atividades em mais de um card).
- Tornar os dados mais acionáveis (ex.: link “Ver todos” para auditoria de atividades).

## Layout final (ordem dos blocos)
1) KPIs principais dentro de um único container
   - Envolvidos por um `Card` para dar unidade visual.
   - Arquivo: `src/features/dashboard/components/DashboardPresentation.tsx` (função `KpiSection`).
2) Métricas Financeiras (sensíveis)
   - Renderizadas logo abaixo dos KPIs, com título oculto.
   - Arquivos: `DashboardPresentation.tsx` e `AdminPanel.tsx` (`showHeader={false}`).
3) Linha combinada: Tendência de Vendas (8 col) + Alertas (4 col)
   - Alturas alinhadas via `cardHeight` nos dois.
   - Arquivos: `SalesChartSection.tsx` e `AlertsPanel.tsx`.
4) Insights de Vendas lado a lado
   - “Top 5 Produtos (Mês Atual)” e “Mix por Categorias”, colunas 6/6, mesma altura.
   - Arquivo: `SalesInsightsTabs.tsx` (usa diretamente `TopProductsCard` e `CategoryMixDonut`).
5) Nota informativa (quando aplicável)
   - Mantida no final, largura total.

## Principais mudanças por arquivo
- `src/features/dashboard/components/DashboardPresentation.tsx`
  - `KpiSection` agora dentro de um `Card` único (container de KPIs).
  - `AdminPanel` abaixo dos KPIs e sem header (`showHeader={false}`).
  - Linha 8/4 restaurada: `SalesChartSection` (8) + `AlertsPanel` (4) com alturas sincronizadas.
  - Remoção do card “Atividades Recentes” isolado (a prévia vive em Alertas).
- `src/features/dashboard/components/AdminPanel.tsx`
  - Prop `showHeader` (default: `true`).
- `src/features/dashboard/components/SalesChartSection.tsx`
  - Props `contentHeight` e `cardHeight` para alinhamento vertical.
- `src/features/dashboard/components/AlertsPanel.tsx`
  - Props `previewActivities`, `cardHeight` e fallback para total de estoque.
  - Bloco “Total em estoque” no rodapé do card (valor via RPC ou fallback por produtos).
  - Rodapé com “Ver mais …” e “Ver todos” (`/activities`).
  - Remoção do scroll interno do conteúdo e ajuste responsivo.
- `src/features/dashboard/components/SalesInsightsTabs.tsx`
  - Substituição do modelo em abas por dois cards independentes (6/6) com mesma altura.
- `src/features/dashboard/components/CategoryMixDonut.tsx`
  - Prop `showTotal` (padrão `false`) para não duplicar total dentro do gráfico.
  - Alturas internas ajustadas para cards maiores.
- `src/features/dashboard/components/TopProductsCard.tsx`
  - Alturas internas ajustadas para cards maiores.
- `src/pages/Index.tsx`
  - Largura útil da dashboard ampliada: `max-w-[1400px]` e `2xl:max-w-[1600px]`.
  - Nova rota “Atividades do Sistema” (`/activities`) com lazy loading (somente admin).
- `src/shared/components/ActivityLogsPage.tsx` (novo)
  - Página de auditoria com filtros (busca, perfil, limite) e tabela com dados reais da tabela `activity_logs`.
- `src/features/dashboard/hooks/useSmartAlerts.ts`
  - Campo `inventoryTotalValue` no retorno (via RPC `get_inventory_total_value` + fallback por `products`).

## Experiência do usuário (comportamento)
- KPIs: bloco único no topo para leitura rápida.
- Métricas Financeiras: logo abaixo, sem título, foco no conteúdo.
- Alertas:
  - Lista resumida + indicadores críticos/atenção.
  - Prévia das 3 últimas atividades reais do sistema.
  - Bloco “Total em estoque” (quando disponível).
  - Atalho “Ver todos” (`/activities`) para auditoria completa.
- Insights: dois painéis com alturas e larguras iguais para facilitar comparação.

## Acessibilidade e responsividade
- Grid consistente: `grid-cols-12`, `gap-6`, alinhamento por colunas.
- Scroll interno removido em Alertas; card cresce conforme `cardHeight`.
- Ícones/cores com contraste adequado nos títulos e indicadores.

## Pré‑requisitos de backend
- RPC `get_inventory_total_value` no Supabase retornando `{ total_value: number }`.
  - Fallback quando a RPC não existir: soma de `price * stock_quantity` de `products`.
- Tabela `activity_logs` com colunas: `id, actor, role, action, entity, entity_id, details, created_at`.

## Como validar rapidamente
1. Abrir Dashboard: ver container único de KPIs e, abaixo, Métricas Financeiras sem cabeçalho.
2. Conferir linha 8/4: “Tendência de Vendas” (esq.) e “Alertas” (dir.) com alturas iguais.
3. Em Alertas: ver lista, “Total em estoque”, prévia de 3 atividades e link “Ver todos”.
4. Entrar em `/activities`: filtros e tabela carregando dados reais.
5. Em Insights: “Top 5 Produtos” e “Mix por Categorias” lado a lado, alturas iguais.

## Observações
- Nenhum erro de lint foi introduzido.
- Parâmetros de altura/quantidade podem ser ajustados rapidamente (`cardHeight`, `maxItems`).

