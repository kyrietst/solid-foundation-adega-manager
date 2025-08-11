# Project Tree — Full (Todos os módulos)

Estrutura completa do projeto em formato de árvore, com comentários por item. Útil para onboarding e navegação rápida.

```
solid-foundation-adega-manager/
├── backup-estrutura-original.tar.gz        # Backup da estrutura original
├── backup.cjs                              # Script de backup
├── BREADCRUMB-TASK-3-RESULTS.md            # Registros de tarefas
├── bun.lockb                               # Lockfile (Bun)
├── CLAUDE.md                               # Notas auxiliares
├── components.json                         # Config de componentes
├── coverage/                               # Relatórios de cobertura
│   ├── index.html                          # Dashboard de cobertura
│   └── ...                                 # Artefatos de cobertura
├── dist/                                   # Artefatos de build (produção)
│   ├── index.html
│   └── assets/                             # Bundles JS/CSS e assets
├── doc/                                    # Documentação
│   ├── ANALYTICS_DASHBOARD_E_RELATORIOS.md # Plano analítico
│   ├── BLUR-USAGE.md                       # Guia de blur/efeitos
│   ├── DEVELOPMENT_GUIDE.md                # Guia de desenvolvimento
│   ├── SYSTEM_OPERATIONS.md                # Operações do sistema
│   ├── prod/
│   │   └── produtos.json                   # Dataset de produtos exemplo
│   ├── tarefas/                            # Sprints e DB
│   │   ├── ok-DB_CHANGES_ANALYTICS.md      # Mudanças de DB aplicadas
│   │   ├── ok-SPRINT_1_1.md                # Relatório Sprint 1.1
│   │   ├── ok-SPRINT_2.md                  # Relatório Sprint 2
│   │   └── ok-SPRINT_3.md                  # Relatório Sprint 3
│   └── PROJECT_TREE_FULL.md                # ESTE arquivo
├── eslint.config.js                        # Config ESLint
├── full-backup.cjs                         # Script de backup full
├── index.html                              # HTML base dev
├── jsrepo.json                             # Metadados do repositório
├── package-lock.json
├── package.json
├── postcss.config.js                       # Config PostCSS
├── postcss.config.js.backup
├── public/
│   ├── favicon.ico
│   ├── placeholder.svg
│   └── robots.txt
├── README.md                               # Informações do projeto
├── restore-backup.cjs                      # Script restore
├── schedule-backup.bat                     # Agendamento (Windows)
├── schedule-backup.sh                      # Agendamento (Unix)
├── scripts/
│   └── test-maintenance.js                 # Manutenção/verificações
├── setup-env.cjs                           # Setup de ambiente
├── src/                                    # Código-fonte
│   ├── __tests__/                          # Testes e utilidades
│   │   ├── accessibility/
│   │   │   └── components.accessibility.test.tsx
│   │   ├── e2e-examples/
│   │   │   └── complete-sale.e2e.example.ts
│   │   ├── fixtures/
│   │   │   └── index.ts
│   │   ├── integration/
│   │   │   ├── inventory-flows.integration.test.ts
│   │   │   ├── sales-flow.integration.test.ts
│   │   │   └── sales-workflow.integration.test.ts
│   │   ├── mocks/
│   │   │   ├── supabase-test-db.ts
│   │   │   └── supabase.ts
│   │   ├── performance/
│   │   │   └── components.performance.test.tsx
│   │   ├── setup/
│   │   ├── setup.ts
│   │   └── utils/
│   │       ├── enhanced-test-utils.tsx
│   │       ├── mock-modules.ts
│   │       ├── test-cleanup.ts
│   │       ├── test-monitoring.ts
│   │       └── test-utils.tsx
│   ├── app/                                # Shell do app
│   │   ├── index.ts
│   │   ├── layout/
│   │   │   ├── index.ts
│   │   │   └── Sidebar.tsx
│   │   ├── providers/
│   │   │   ├── AuthContext.tsx
│   │   │   ├── NotificationContext.tsx
│   │   │   └── index.ts
│   │   └── router/
│   │       └── index.ts
│   ├── App.css
│   ├── App.tsx
│   ├── components/                         # Legacy principais
│   │   ├── Inventory.tsx
│   │   ├── InventoryNew.tsx
│   │   ├── Sales.tsx
│   │   └── ui/
│   │       ├── fluid-blob.tsx
│   │       └── sidebar.tsx
│   ├── core/                               # Infra (API/Config/Tipos)
│   │   ├── api/
│   │   │   ├── index.ts
│   │   │   └── supabase/
│   │   │       ├── client.ts
│   │   │       └── types.ts
│   │   ├── config/
│   │   │   ├── __tests__/utils.test.ts
│   │   │   ├── critical-data-cache.ts
│   │   │   ├── error-messages.ts
│   │   │   ├── error-tracking.ts
│   │   │   ├── index.ts
│   │   │   ├── routes-config.ts
│   │   │   ├── theme-utils.ts
│   │   │   ├── theme.ts
│   │   │   ├── timeout-config.ts
│   │   │   └── utils.ts
│   │   ├── index.ts
│   │   └── types/
│   │       ├── branded.types.ts
│   │       ├── database.types.ts
│   │       ├── enums.types.ts
│   │       ├── function.types.ts
│   │       ├── generic.types.ts
│   │       ├── handlers.types.ts
│   │       ├── index.ts
│   │       ├── inventory.types.ts
│   │       ├── sales.types.ts
│   │       └── supabase.ts
│   ├── features/                           # Domínios
│   │   ├── customers/
│   │   │   ├── components/
│   │   │   │   ├── __tests__/CustomerForm.test.tsx
│   │   │   │   ├── __tests__/CustomerTable.test.tsx
│   │   │   │   ├── customer-activity.tsx
│   │   │   │   ├── customer-activity.tsx.bak
│   │   │   │   ├── customer-detail.tsx
│   │   │   │   ├── customer-detail.tsx.bak
│   │   │   │   ├── customer-list.tsx
│   │   │   │   ├── customer-list.tsx.bak
│   │   │   │   ├── customer-opportunities.tsx
│   │   │   │   ├── customer-segments.tsx
│   │   │   │   ├── customer-segments.tsx.bak
│   │   │   │   ├── customer-stats.tsx
│   │   │   │   ├── customer-trends.tsx
│   │   │   │   ├── CustomerCard.tsx
│   │   │   │   ├── CustomerCard.tsx.bak
│   │   │   │   ├── CustomerDetailModal.tsx
│   │   │   │   ├── CustomerDetailModal.tsx.bak
│   │   │   │   ├── CustomerFilters.tsx
│   │   │   │   ├── CustomerForm.tsx
│   │   │   │   ├── CustomerGrid.tsx
│   │   │   │   ├── CustomerInsights.tsx
│   │   │   │   ├── CustomerRow.tsx
│   │   │   │   ├── CustomerRow.tsx.bak
│   │   │   │   ├── Customers.tsx
│   │   │   │   ├── CustomerSegmentBadge.tsx
│   │   │   │   ├── CustomersLite.tsx
│   │   │   │   ├── CustomersNew.tsx
│   │   │   │   ├── CustomersSimple.tsx
│   │   │   │   ├── CustomerStats.tsx
│   │   │   │   ├── CustomerStats.tsx.bak
│   │   │   │   ├── CustomerTable.tsx
│   │   │   │   ├── index.ts
│   │   │   │   ├── profile-completeness.tsx
│   │   │   │   └── types.ts
│   │   │   ├── hooks/
│   │   │   │   ├── index.ts
│   │   │   │   ├── use-crm.ts
│   │   │   │   ├── useCustomerInsights.ts
│   │   │   │   ├── useCustomerOperations.ts
│   │   │   │   ├── useCustomerSegmentation.ts
│   │   │   │   ├── useCustomerStats.ts
│   │   │   │   └── useProfileCompletenessCalculator.ts
│   │   │   ├── index.ts
│   │   │   └── types/
│   │   │       ├── index.ts
│   │   │       └── types.ts
│   │   ├── dashboard/
│   │   │   ├── components/
│   │   │   │   ├── __tests__/ChartsSection.test.tsx
│   │   │   │   ├── __tests__/MetricsGrid.test.tsx
│   │   │   │   ├── AdminPanel.tsx
│   │   │   │   ├── AlertsPanel.tsx
│   │   │   │   ├── BannerPlaceholder.tsx
│   │   │   │   ├── CategoryMixDonut.placeholder.tsx
│   │   │   │   ├── CategoryMixDonut.tsx
│   │   │   │   ├── ChartsSection.tsx
│   │   │   │   ├── Dashboard.tsx
│   │   │   │   ├── DashboardContainer.tsx
│   │   │   │   ├── DashboardPresentation.tsx
│   │   │   │   ├── index.ts
│   │   │   │   ├── KpiCards.tsx
│   │   │   │   ├── MetricsGrid.tsx
│   │   │   │   ├── PlaceholderBadge.tsx
│   │   │   │   ├── RecentActivities.tsx
│   │   │   │   ├── SalesChartSection.tsx
│   │   │   │   ├── TopProductsCard.placeholder.tsx
│   │   │   │   └── TopProductsCard.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── index.ts
│   │   │   │   ├── useDashboardData.ts
│   │   │   │   ├── useDashboardErrorHandling.ts
│   │   │   │   ├── useDashboardKpis.ts
│   │   │   │   ├── useDashboardMetrics.ts
│   │   │   │   └── useSmartAlerts.ts
│   │   │   └── index.ts
│   │   ├── delivery/
│   │   │   ├── components/Delivery.tsx
│   │   │   ├── components/index.ts
│   │   │   ├── hooks/index.ts
│   │   │   ├── index.ts
│   │   │   └── types/index.ts
│   │   ├── inventory/
│   │   │   ├── components/
│   │   │   │   ├── __tests__/InventoryTable.test.tsx
│   │   │   │   ├── __tests__/ProductForm.simple.test.tsx
│   │   │   │   ├── __tests__/ProductForm.test.tsx
│   │   │   │   ├── BarcodeInput.tsx
│   │   │   │   ├── BarcodeInput.tsx.bak
│   │   │   │   ├── index.ts
│   │   │   │   ├── InventoryFilters.tsx
│   │   │   │   ├── InventoryGrid.tsx
│   │   │   │   ├── InventoryHeader.tsx
│   │   │   │   ├── InventoryManagement.tsx
│   │   │   │   ├── InventoryStats.tsx
│   │   │   │   ├── InventoryStats.tsx.bak
│   │   │   │   ├── InventoryTable.tsx
│   │   │   │   ├── product-form/DynamicMeasurementField.tsx
│   │   │   │   ├── product-form/PackageToggleField.tsx
│   │   │   │   ├── product-form/ProductAdditionalInfoCard.tsx
│   │   │   │   ├── product-form/ProductBasicInfoCard.tsx
│   │   │   │   ├── product-form/ProductFormActions.tsx
│   │   │   │   ├── product-form/ProductFormContainer.tsx
│   │   │   │   ├── product-form/ProductFormPresentation.tsx
│   │   │   │   ├── product-form/ProductPricingCard.tsx
│   │   │   │   ├── product-form/ProductStockCard.tsx
│   │   │   │   └── product-form/README.md
│   │   │   │   ├── ProductCard.tsx
│   │   │   │   ├── ProductCard.tsx.bak
│   │   │   │   ├── ProductDialog.tsx
│   │   │   │   ├── ProductFilters.tsx
│   │   │   │   ├── ProductForm.tsx
│   │   │   │   ├── ProductGrid.tsx
│   │   │   │   ├── ProductRow.tsx
│   │   │   │   ├── ProductRow.tsx.bak
│   │   │   │   ├── ProductsGridContainer.tsx
│   │   │   │   ├── ProductsGridPresentation.tsx
│   │   │   │   ├── ProductsHeader.tsx
│   │   │   │   └── TurnoverAnalysis.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── __tests__/useInventoryCalculations.test.ts
│   │   │   │   ├── index.ts
│   │   │   │   ├── use-barcode.ts
│   │   │   │   ├── use-product.ts
│   │   │   │   ├── useInventoryCalculations.ts
│   │   │   │   ├── useInventoryErrorHandler.ts
│   │   │   │   ├── useInventoryFilters.ts
│   │   │   │   ├── useInventoryOperations.ts
│   │   │   │   ├── useInventoryView.ts
│   │   │   │   ├── useLowStock.ts
│   │   │   │   ├── useProductCalculations.ts
│   │   │   │   ├── useProductForm.ts
│   │   │   │   ├── useProductFormLogic.ts
│   │   │   │   └── useProductValidation.ts
│   │   │   ├── index.ts
│   │   │   ├── types/
│   │   │   │   ├── index.ts
│   │   │   │   └── types.ts
│   │   │   └── utils/categoryUtils.ts
│   │   ├── movements/
│   │   │   ├── components/
│   │   │   │   ├── index.ts
│   │   │   │   ├── MovementDialog.tsx
│   │   │   │   ├── Movements.tsx
│   │   │   │   ├── MovementsContainer.tsx
│   │   │   │   ├── MovementsPresentation.tsx
│   │   │   │   └── MovementsTable.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── index.ts
│   │   │   │   ├── useMovementForm.ts
│   │   │   │   ├── useMovementMutation.ts
│   │   │   │   ├── useMovements.ts
│   │   │   │   ├── useMovementsLogic.ts
│   │   │   │   └── useMovementValidation.ts
│   │   │   └── types/index.ts
│   │   ├── reports/
│   │   │   ├── components/
│   │   │   │   ├── AdvancedReports.tsx
│   │   │   │   ├── CrmReportsSection.tsx
│   │   │   │   ├── FinancialReportsSection.tsx
│   │   │   │   ├── index.ts
│   │   │   │   ├── InventoryReportsSection.tsx
│   │   │   │   ├── Reports.tsx
│   │   │   │   ├── SalesReportsSection.tsx
│   │   │   │   ├── StockReportSummary.tsx
│   │   │   │   └── StockReportTable.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── index.ts
│   │   │   │   ├── useExportData.ts
│   │   │   │   └── useStockReports.ts
│   │   │   └── types/index.ts
│   │   ├── sales/
│   │   │   ├── components/
│   │   │   │   ├── Cart.tsx
│   │   │   │   ├── CustomerSearch.tsx
│   │   │   │   ├── FullCart.tsx
│   │   │   │   ├── FullCart.tsx.bak
│   │   │   │   ├── index.ts
│   │   │   │   ├── ProductsGrid.tsx
│   │   │   │   ├── RecentSales.tsx
│   │   │   │   ├── SalesPage.tsx
│   │   │   │   ├── SimpleCart.tsx
│   │   │   │   └── SimpleCart.tsx.bak
│   │   │   ├── hooks/
│   │   │   │   ├── __tests__/use-cart.performance.test.ts
│   │   │   │   ├── __tests__/use-cart.test.ts
│   │   │   │   ├── __tests__/use-sales.test.ts
│   │   │   │   ├── __tests__/useCheckout.test.ts
│   │   │   │   ├── index.ts
│   │   │   │   ├── use-cart.ts
│   │   │   │   ├── use-sales.ts
│   │   │   │   ├── useCartPresentation.ts
│   │   │   │   ├── useCartValidation.ts
│   │   │   │   ├── useCheckout.ts
│   │   │   │   └── useSalesErrorRecovery.ts
│   │   │   └── types/index.ts
│   │   └── users/
│   │       ├── components/
│   │       │   ├── analysis.md
│   │       │   ├── FirstAdminSetup.tsx
│   │       │   ├── index.ts
│   │       │   ├── types.ts
│   │       │   ├── UserActions.tsx
│   │       │   ├── UserCreateDialog.tsx
│   │       │   ├── UserForm.tsx
│   │       │   ├── UserList.tsx
│   │       │   ├── UserManagement.tsx
│   │       │   ├── UserRoleBadge.tsx
│   │       │   └── UserStatusBadge.tsx
│   │       ├── hooks/
│   │       │   ├── __tests__/useUserManagement.test.ts
│   │       │   ├── __tests__/useUserManagement.test.tsx
│   │       │   ├── index.ts
│   │       │   ├── useFirstAdminSetup.ts
│   │       │   ├── useUserCreation.ts
│   │       │   ├── useUserManagement.ts
│   │       │   └── useUserPermissions.ts
│   │       └── types/index.ts
│   ├── hooks/                              # Hooks globais
│   │   ├── audit/useAuditErrorHandler.ts
│   │   ├── common/
│   │   │   ├── index.ts
│   │   │   ├── use-debounce.ts
│   │   │   ├── use-entity-advanced.ts
│   │   │   ├── use-entity.ts
│   │   │   ├── use-form-with-toast.ts
│   │   │   ├── use-pagination.ts
│   │   │   ├── use-toast.ts
│   │   │   ├── useAsyncOperation.ts
│   │   │   ├── useConfirmation.ts
│   │   │   ├── useDialogState.ts
│   │   │   ├── useErrorHandler.ts
│   │   │   ├── useFilters.ts
│   │   │   ├── useFormProtection.ts
│   │   │   ├── useFormValidation.ts
│   │   │   ├── useModalForm.ts
│   │   │   ├── useNotifications.ts
│   │   │   ├── useTableData.ts
│   │   │   ├── useTimeout.ts
│   │   │   └── useVirtualizedTable.ts
│   │   ├── index.ts
│   │   ├── products/
│   │   │   ├── useProductCategories.ts
│   │   │   ├── useProductFilters.ts
│   │   │   └── useProductsGridLogic.ts
│   │   ├── README.md
│   │   ├── use-mobile.tsx
│   │   └── useNetworkStatus.ts
│   ├── index.css
│   ├── index.css.backup
│   ├── lib/                               # Configs auxiliares
│   │   └── axe-config.ts
│   ├── main.tsx
│   ├── pages/
│   │   ├── Auth.tsx
│   │   ├── Index.tsx
│   │   └── NotFound.tsx
│   ├── shared/                             # UI/Shared libs
│   │   ├── components/
│   │   │   ├── alert-dialog.tsx
│   │   │   ├── AuthErrorBoundary.tsx
│   │   │   ├── DashboardErrorState.tsx
│   │   │   ├── error-message.tsx
│   │   │   ├── error-message.tsx.bak
│   │   │   ├── ErrorBoundary.tsx
│   │   │   ├── ErrorDashboard.tsx
│   │   │   ├── ErrorFallback.tsx
│   │   │   ├── form-loading.tsx
│   │   │   ├── form-loading.tsx.bak
│   │   │   ├── index.ts
│   │   │   ├── InventoryErrorStates.tsx
│   │   │   ├── network-status.tsx
│   │   │   ├── network-status.tsx.bak
│   │   │   ├── NetworkTestUtility.tsx
│   │   │   ├── RouteErrorBoundary.tsx
│   │   │   ├── SalesErrorBoundary.tsx
│   │   │   ├── sonner.tsx
│   │   │   └── use-toast.ts
│   │   ├── hooks/
│   │   │   ├── audit/
│   │   │   │   ├── __tests__/useAuditErrorHandler.test.ts
│   │   │   │   └── useAuditErrorHandler.ts
│   │   │   ├── auth/
│   │   │   │   ├── __tests__/usePermissions.test.ts
│   │   │   │   ├── index.ts
│   │   │   │   ├── useAuthErrorHandler.ts
│   │   │   │   └── usePermissions.ts
│   │   │   ├── common/
│   │   │   │   ├── __tests__/use-form-with-toast.test.tsx
│   │   │   │   ├── __tests__/use-pagination.test.ts
│   │   │   │   ├── __tests__/useErrorHandler.test.ts
│   │   │   │   ├── index.ts
│   │   │   │   ├── use-debounce.ts
│   │   │   │   ├── use-entity-advanced.ts
│   │   │   │   ├── use-entity.ts
│   │   │   │   ├── use-form-with-toast.ts
│   │   │   │   ├── use-pagination.ts
│   │   │   │   ├── use-toast.ts
│   │   │   │   ├── useAsyncOperation.ts
│   │   │   │   ├── useConfirmation.ts
│   │   │   │   ├── useDialogState.ts
│   │   │   │   ├── useErrorHandler.ts
│   │   │   │   ├── useFilters.ts
│   │   │   │   ├── useFormProtection.ts
│   │   │   │   ├── useFormValidation.ts
│   │   │   │   ├── useModalForm.ts
│   │   │   │   ├── useTableData.ts
│   │   │   │   ├── useTimeout.ts
│   │   │   │   └── useVirtualizedTable.ts
│   │   │   ├── index.ts
│   │   │   ├── products/
│   │   │   │   ├── useProductCategories.ts
│   │   │   │   ├── useProductFilters.ts
│   │   │   │   └── useProductsGridLogic.ts
│   │   │   ├── README.md
│   │   │   ├── use-mobile.tsx
│   │   │   ├── use-toast.ts
│   │   │   └── useNetworkStatus.ts
│   │   ├── index.ts
│   │   ├── templates/
│   │   │   ├── ContainerTemplate.tsx
│   │   │   ├── index.ts
│   │   │   └── PresentationTemplate.tsx
│   │   ├── ui/
│   │   │   ├── composite/
│   │   │   │   ├── empty-state.tsx
│   │   │   │   ├── empty-state.tsx.bak
│   │   │   │   ├── filter-toggle.tsx
│   │   │   │   ├── filter-toggle.tsx.bak
│   │   │   │   ├── index.ts
│   │   │   │   ├── index.ts.bak
│   │   │   │   ├── loading-spinner.tsx
│   │   │   │   ├── loading-spinner.tsx.bak
│   │   │   │   ├── optimized-image.tsx
│   │   │   │   ├── optimized-image.tsx.bak
│   │   │   │   ├── pagination-controls.tsx
│   │   │   │   ├── pagination-controls.tsx.bak
│   │   │   │   ├── search-input.tsx
│   │   │   │   ├── search-input.tsx.bak
│   │   │   │   ├── skeleton.tsx
│   │   │   │   ├── skeleton.tsx.bak
│   │   │   │   ├── stat-card.tsx
│   │   │   │   └── stat-card.tsx.bak
│   │   │   ├── effects/
│   │   │   ├── index.ts
│   │   │   ├── index.ts.bak
│   │   │   ├── layout/
│   │   │   │   ├── background-wrapper.tsx.bak
│   │   │   │   ├── BentoGrid.tsx
│   │   │   │   ├── Breadcrumb.tsx
│   │   │   │   ├── DataGrid.tsx
│   │   │   │   ├── DataGrid.tsx.bak
│   │   │   │   ├── DataTable.tsx
│   │   │   │   ├── DataTable.tsx.bak
│   │   │   │   ├── FilterPanel.tsx
│   │   │   │   ├── FilterPanel.tsx.bak
│   │   │   │   ├── FormDialog.tsx
│   │   │   │   ├── FormDialog.tsx.bak
│   │   │   │   ├── index.ts
│   │   │   │   ├── index.ts.bak
│   │   │   │   ├── LoadingGrid.tsx
│   │   │   │   ├── LoadingGrid.tsx.bak
│   │   │   │   ├── LoadingTable.tsx
│   │   │   │   ├── LoadingTable.tsx.bak
│   │   │   │   ├── MagicBento.tsx
│   │   │   │   ├── page-accordion.tsx
│   │   │   │   ├── page-accordion.tsx.bak
│   │   │   │   ├── PageContainer.tsx
│   │   │   │   ├── PageContainer.tsx.bak
│   │   │   │   ├── SectionHeader.tsx
│   │   │   │   ├── SectionHeader.tsx.bak
│   │   │   │   ├── wavy-background.tsx
│   │   │   │   └── wavy-background.tsx.bak
│   │   │   └── primitives/
│   │   │       ├── accordion.tsx
│   │   │       ├── accordion.tsx.bak
│   │   │       ├── alert.tsx
│   │   │       ├── alert.tsx.bak
│   │   │       ├── avatar.tsx
│   │   │       ├── avatar.tsx.bak
│   │   │       ├── badge.tsx
│   │   │       ├── badge.tsx.bak
│   │   │       ├── button.tsx
│   │   │       ├── button.tsx.bak
│   │   │       ├── calendar.tsx
│   │   │       ├── calendar.tsx.bak
│   │   │       ├── card.tsx
│   │   │       ├── card.tsx.bak
│   │   │       ├── chart.tsx
│   │   │       ├── chart.tsx.bak
│   │   │       ├── checkbox.tsx
│   │   │       ├── checkbox.tsx.bak
│   │   │       ├── collapsible.tsx
│   │   │       ├── collapsible.tsx.bak
│   │   │       ├── command.tsx
│   │   │       ├── command.tsx.bak
│   │   │       ├── dialog.tsx
│   │   │       ├── dialog.tsx.bak
│   │   │       ├── dropdown-menu.tsx
│   │   │       ├── dropdown-menu.tsx.bak
│   │   │       ├── form.tsx
│   │   │       ├── form.tsx.bak
│   │   │       ├── icon-button.tsx
│   │   │       ├── index.ts
│   │   │       ├── index.ts.bak
│   │   │       ├── input.tsx
│   │   │       ├── input.tsx.bak
│   │   │       ├── label.tsx
│   │   │       ├── label.tsx.bak
│   │   │       ├── pagination.tsx
│   │   │       ├── pagination.tsx.bak
│   │   │       ├── popover.tsx
│   │   │       ├── popover.tsx.bak
│   │   │       ├── progress.tsx
│   │   │       ├── progress.tsx.bak
│   │   │       ├── radio-group.tsx
│   │   │       ├── radio-group.tsx.bak
│   │   │       ├── scroll-area.tsx
│   │   │       ├── scroll-area.tsx.bak
│   │   │       ├── select.tsx
│   │   │       ├── select.tsx.bak
│   │   │       ├── separator.tsx
│   │   │       ├── separator.tsx.bak
│   │   │       ├── sheet.tsx
│   │   │       ├── sheet.tsx.bak
│   │   │       ├── switch.tsx
│   │   │       ├── switch.tsx.bak
│   │   │       ├── table.tsx
│   │   │       ├── table.tsx.bak
│   │   │       ├── tabs.tsx
│   │   │       ├── tabs.tsx.bak
│   │   │       ├── textarea.tsx
│   │   │       ├── textarea.tsx.bak
│   │   │       ├── toast.tsx
│   │   │       ├── toast.tsx.bak
│   │   │       ├── toaster.tsx
│   │   │       ├── toaster.tsx.bak
│   │   │       ├── tooltip.tsx
│   │   │       └── tooltip.tsx.bak
│   │   └── utils/index.ts
│   └── vite-env.d.ts
├── supabase/
│   └── config.toml                       # Config Supabase
├── tailwind.config.ts                    # TailwindCSS
├── tailwind.config.ts.backup
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts                        # Build Vite
└── vitest.config.ts                      # Testes (Vitest)
```
