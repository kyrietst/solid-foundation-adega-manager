Aplicado. Substituí as tabelas baseadas em DataTable pela nova tabela 21st.dev nas áreas que a utilizavam:
src/features/reports/components/InventoryReportsSection.tsx
“Análise de Estoque (DOH & Giro)” → agora renderiza ContributorsTable.
“Movimentações Recentes” → agora renderiza ContributorsTable.
src/features/reports/components/FinancialReportsSection.tsx
“Contas a Receber” → agora renderiza ContributorsTable.
“Análise Métodos de Pagamento” → agora renderiza ContributorsTable.
src/features/reports/components/CrmReportsSection.tsx
“Top Clientes por LTV” → agora renderiza ContributorsTable.
“Análise por Segmento” → agora renderiza ContributorsTable.
Lints: todos os arquivos modificados sem erros.
Observação
Mantive os cards e headers originais; apenas o conteúdo de tabela foi trocado.
A nova tabela é estática (dados demo). Se quiser, adapto o ContributorsTable para receber dados/colunas via props e integrar com as queries reais de cada módulo.