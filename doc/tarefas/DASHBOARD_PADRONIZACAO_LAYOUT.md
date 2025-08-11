# Padronização do Layout da Dashboard — Análise, Plano e Checklist

Contexto
- A dashboard atual não segue o padrão visual/espacial das demais abas: falta de margens consistentes, cards “encavalados”, hierarquia pouco clara e leitura difícil.
- Objetivo: alinhar a dashboard ao padrão do sistema (PageContainer + SectionHeader, grid harmonizado, cards legíveis), mantendo Sidebar, FluidBlob, cards animados e container branco de fundo.

Diagnóstico (UI/UX)
- Margens e respiros: insuficientes no topo e entre os blocos principais.
- Hierarquia: ausência de cabeçalho de página com título/descrição, prejudicando orientação.
- Grid: distribuição dos tiles do bento irregular; col/row-spans criam blocos que “brigam” visualmente.
- Consistência: variações de padding/border/blur entre cards.
- Leitura: títulos pouco destacados; tipografia/cores de rótulos heterogêneas.
- Acessibilidade: landmarks e headings não padronizados; algumas áreas sem aria-labels.

Padrões a aplicar
- Container/Heading: `PageContainer` com `padding=lg`, `spacing=lg`, `maxWidth=2xl` + `SectionHeader` (título + descrição).
- Grid base: `MagicBento` com `gap-6` e `auto-rows` ≈ `auto-rows-[180px]` para reduzir “encavalamento”.
- Itens do bento: spans equilibrados (KPIs 2 rows; gráficos/listas 2–3 rows) com respiros uniformes.
- Cards: manter glass/backdrop; unificar borda/sombra; títulos com contraste estável.
- A11y: headings consistentes; `role=region`/`aria-label` em gráficos/listas; foco visível nos controles.

Arquivos previstos
- `src/features/dashboard/components/DashboardPresentation.tsx` — container, header e distribuição do bento grid.
- (Verificação) `KpiCards.tsx`, `RecentActivities.tsx`, `SalesChartSection.tsx`, `AdminPanel.tsx` — alinhar tipografia/padding se necessário.

Checklist de Tarefas
1) Estrutura de página
- [x] Envolver conteúdo com `PageContainer` (`padding=lg`, `spacing=lg`, `maxWidth=2xl`).
- [x] Adicionar `SectionHeader` com título “Dashboard” e descrição curta.
2) Grid e layout
- [x] Aumentar `gap` do bento (`gap-6`) e `auto-rows` (~`180px`).
- [x] Reequilibrar spans: KPIs (row-span-2), Gráfico principal (row-span-3/4), Listas (row-span-2/3).
- [x] Conferir responsividade (1 / 4 / 6 colunas) sem sobreposição.
3) Consistência de cards
- [x] Unificar classes de borda/sombra/blur dos cards do dashboard.
- [x] Garantir títulos com hierarquia e cor consistentes.
4) Acessibilidade
- [x] Landmarks e `aria-label`/`role` nos gráficos/listas.
- [x] Foco visível e ordem de tabulação adequada nos controles.
5) QA
- [x] Testar breakpoints (sm/md/lg/2xl).
- [x] Verificar contraste AA (texto/ícones sobre glass).
- [x] Smoke test de performance (animações/scroll).

Critérios de Aceite
- Margens e espaços equivalentes às demais páginas.
- Grid sem sobreposição; leitura clara dos blocos (KPIs, gráficos, recentes, finanças, alertas, top produtos, mix).
- Sem regressões de acessibilidade; tooltips/gráficos com rotulagem.
- Visual dos cards mantido (glass/anim) com bordas/sombras consistentes.

Resultados de QA
- Responsividade: layout estável em sm/md/lg/2xl; sem colunas “quebrando” ou tiles sobrepostos.
- Contraste: títulos/ícones atendem AA sobre fundos glass; tooltips adotam fundo escuro com borda âmbar.
- Performance: interação/scroll sem jank; animações suaves.

Relatório — Status Atual
- Alterações aplicadas:
  - `DashboardPresentation.tsx` com `PageContainer` + `SectionHeader`.
  - Bento grid com `gap-6` e `auto-rows-[180px]`; spans reequilibrados por seção.
  - Títulos/paddings e landmarks (`role`/`aria-label`) revisados em gráficos/listas.
- Itens não alterados: Sidebar, FluidBlob, cards animados, container branco — mantidos.
- Estágio: Concluído (dashboard padronizada conforme critérios de aceite).

---
Última atualização: gerado automaticamente nesta execução.
