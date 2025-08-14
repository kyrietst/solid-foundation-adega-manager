# Padronização da Dashboard — Relatório de Alterações e Guia Técnico

Este documento descreve, de forma objetiva, as mudanças aplicadas na dashboard para padronizar layout, melhorar leitura e alinhar a UX com o restante do sistema. **Atualizado em 14/08/2025** com as últimas alterações de header padronizado e scroll otimizado.

## Objetivos
- Unificar a malha visual (grid) e os espaçamentos.
- Garantir hierarquia clara dos blocos e consistência entre alturas/larguras.
- Evitar duplicações (ex.: últimas atividades em mais de um card).
- Tornar os dados mais acionáveis (ex.: link “Ver todos” para auditoria de atividades).

## ✨ Novas Alterações (14/08/2025)

### **Header Padronizado**
- **Novo componente**: `DashboardHeader.tsx` seguindo padrão da página de vendas
- **Título**: Alterado de "PAINEL EXECUTIVO" para "DASHBOARD"
- **Animação**: BlurIn com gradiente vermelho-amarelo e sublinhado multicamada
- **Layout**: Container de vidro removido, título alinhado à esquerda
- **Alinhamento**: Título alinhado com início dos cards KPI
- **Responsividade**: Centralizado em mobile, alinhado à esquerda em desktop

### **Otimização de Scroll**
- **Problema resolvido**: Dashboard cortada em zoom alto sem possibilidade de scroll
- **Solução**: Layout alterado de altura fixa (`h-full`) para altura mínima (`min-h-screen`)
- **Scroll natural**: Aplicado ao nível da página (melhor UX)
- **Performance**: Remoção de containers de scroll aninhados
- **Compatibilidade**: Funciona perfeitamente em qualquer resolução/zoom

### **Estrutura de Layout Atualizada**
```tsx
// Antes (altura fixa)
<div className="w-full h-full flex flex-col">
  <div className="flex-1 min-h-0 overflow-hidden">

// Depois (scroll natural)
<div className="w-full min-h-screen flex flex-col">
  <div className="flex-1 px-4 pb-4 lg:px-8 lg:pb-8">
```

### **Espaçamentos Padronizados**
- **Header**: Sem padding-top, alinhado com cards (`px-4 lg:px-8`)
- **Conteúdo**: Padding lateral e bottom mantidos (`px-4 pb-4 lg:px-8 lg:pb-8`)
- **Altura**: Expansão natural conforme conteúdo
- **Distâncias**: Padronizadas com página de vendas

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

## 📂 Arquivos Alterados (14/08/2025)

### **Novos Arquivos**
- `src/features/dashboard/components/DashboardHeader.tsx` (novo)
  - Header padronizado seguindo documentação `/doc/JÁ_CONCLUIDOS/padronizacao_header_sales.md`
  - Título "DASHBOARD" com animação BlurIn
  - Gradiente vermelho-amarelo + sublinhado multicamada
  - Alinhamento à esquerda com padding lateral (`px-4 lg:px-8`)

### **Arquivos Modificados**
- `src/features/dashboard/components/DashboardPresentation.tsx`
  - Substituição do PageContainer por estrutura flexível
  - Layout alterado de `h-full` para `min-h-screen`
  - Remoção de `overflow-hidden`, permitindo scroll natural
  - Integração do novo `DashboardHeader`
  - Padding-top removido do container de conteúdo

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
- **Header responsivo**: Centralizado em mobile, alinhado à esquerda em desktop.
- **Scroll natural**: Melhor compatibilidade com leitores de tela e navegação por teclado.
- **Zoom otimizado**: Funciona perfeitamente em qualquer nível de zoom (100% - 500%).

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

## ✅ Como validar rapidamente

### **Header Padronizado**
1. **Título**: Verificar se aparece "DASHBOARD" (não "PAINEL EXECUTIVO")
2. **Animação**: Confirmar efeito BlurIn (blur→clear) com gradiente vermelho-amarelo
3. **Alinhamento**: Título alinhado à esquerda, na mesma linha dos cards KPI
4. **Layout**: Sem caixa de vidro por trás do título
5. **Responsividade**: Testar em mobile (centralizado) e desktop (esquerda)

### **Scroll Otimizado**
1. **Zoom alto**: Aumentar zoom para 150%+ e verificar se aparece scroll vertical
2. **Conteúdo completo**: Confirmar que todos os gráficos/tabelas são acessíveis
3. **Performance**: Scroll deve ser suave, sem travamentos
4. **Layout**: Página deve expandir naturalmente conforme conteúdo

### **Layout Geral**
1. Abrir Dashboard: ver container único de KPIs e, abaixo, Métricas Financeiras sem cabeçalho.
2. Conferir linha 8/4: "Tendência de Vendas" (esq.) e "Alertas" (dir.) com alturas iguais.
3. Em Alertas: ver lista, "Total em estoque", prévia de 3 atividades e link "Ver todos".
4. Entrar em `/activities`: filtros e tabela carregando dados reais.
5. Em Insights: "Top 5 Produtos" e "Mix por Categorias" lado a lado, alturas iguais.

## Observações
- Nenhum erro de lint foi introduzido.
- Parâmetros de altura/quantidade podem ser ajustados rapidamente (`cardHeight`, `maxItems`).
- **Header padronizado** garante consistência visual com outras páginas do sistema.
- **Scroll natural** melhora significativamente a UX em diferentes dispositivos e zooms.

