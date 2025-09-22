# Padronização de Tabelas e Cards — Adega Manager

Status: Em andamento (Fase 1 concluída + progresso em Relatórios, Movimentações, Delivery, Usuários e Dashboard)

Objetivo
- Unificar o comportamento visual e de uso das tabelas e cards, mantendo: Sidebar (e animações), Background FluidBlob, cards animados e o container branco de fundo. Referência visual: `CustomerDataTable`.

Fase 1 — concluída
- Estoque (`InventoryTable`)
  - Busca com `SearchBar21st` + contagem “N de M”.
  - Menu “Colunas” com alternância de visibilidade por coluna.
  - Ordenação nas colunas principais com ícones asc/desc.
  - Virtualização preservada e aplicada após filtros/ordenação (melhor performance).
  - Cabeçalho sticky; linhas ricas mantidas via `ProductRow` (badges de giro/estoque).

- Clientes (lista simples, `CustomerList`)
  - Contagem “N de M” e menu “Colunas”.
  - Ordenação nas colunas principais, mantendo o visual existente.

Fase 2 — em andamento
- Movimentações (`MovementsTable`)
  - Busca, contagem N/M, menu “Colunas”, ordenação e cabeçalho consistente.
- Relatórios (`StockReportTable`)
  - Busca por categoria, contagem N/M, menu “Colunas”, ordenação com ícones.
- Delivery (`Delivery`)
  - Busca, contagem N/M, menu “Colunas”, ordenação (Pedido, Cliente, Endereço, Entregador, Horário, Status), mantendo ações e chips de status.
- Usuários (`UserList`)
  - Busca, contagem N/M, menu “Colunas”, ordenação (Nome, Email, Função, Criado em), mantendo `UserRoleBadge` e `UserActions`.
- Dashboard (`DashboardPresentation`)
  - Uso de `PageContainer` + `SectionHeader` e harmonização do bento grid (gap/rows), melhorando margens e hierarquia visual.

Arquivos alterados (recentes)
- `src/features/inventory/components/InventoryTable.tsx`
- `src/features/customers/components/customer-list.tsx`
- `src/features/movements/components/MovementsTable.tsx`
- `src/features/reports/components/StockReportTable.tsx`
- `src/features/delivery/components/Delivery.tsx`
- `src/features/users/components/UserList.tsx`
- `src/features/dashboard/components/DashboardPresentation.tsx`

Mantido (não alterado)
- Sidebar e animação.
- Background FluidBlob.
- Cards com animações.
- Container branco de fundo.

Acessibilidade
- Botões de ordenação com rótulo e ícone; foco visível dos primitivos.
- Cabeçalho sticky com contraste AA.
- Listas virtualizadas (quando aplicável) com `aria-label` de região.

Critérios de aceite da padronização
- Tabelas com: busca, ordenação, seleção de colunas e estados vazio/loading consistentes.
- Manter visuais/animações existentes.
- Sem regressões de acessibilidade e sem warnings de lint.

Próximas fases sugeridas
- Aplicar o padrão nas demais listas/tabelas que surgirem (quando não estiver usando `CustomerDataTable`).
- Revisar relatórios restantes para adoção do cabeçalho/ordenar/colunas quando fizer sentido, sem mexer nos cards.

---
Última atualização: gerado automaticamente nesta execução.
