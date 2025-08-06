# Configuração Playwright E2E - Adega Manager

## Setup do Playwright

### 1. Instalação
```bash
npm install --save-dev @playwright/test
npx playwright install
```

### 2. Configuração playwright.config.ts
```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:8080',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    }
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:8080',
    reuseExistingServer: !process.env.CI,
  },
});
```

### 3. Scripts package.json
```json
{
  "scripts": {
    "e2e": "playwright test",
    "e2e:ui": "playwright test --ui",
    "e2e:debug": "playwright test --debug",
    "e2e:report": "playwright show-report"
  }
}
```

## Estrutura de Testes E2E

### Jornadas Críticas Identificadas

#### 1. Jornada Completa de Venda
**Prioridade: CRÍTICA**
- Login como admin → Dashboard → Vendas → Seleção cliente → Carrinho → Checkout → Confirmação

#### 2. Gestão de Estoque
**Prioridade: ALTA**
- Login → Inventário → Novo produto → Entrada estoque → Alertas

#### 3. CRM e Insights
**Prioridade: MÉDIA**
- Login → Clientes → Perfil cliente → Histórico → Insights

#### 4. Relatórios e Dashboard
**Prioridade: MÉDIA**
- Login → Dashboard → Métricas → Gráficos → Exportação

### Estrutura de Arquivos E2E
```
e2e/
├── fixtures/
│   ├── users.json
│   ├── products.json
│   └── customers.json
├── pages/
│   ├── LoginPage.ts
│   ├── DashboardPage.ts
│   ├── SalesPage.ts
│   ├── InventoryPage.ts
│   └── CustomersPage.ts
├── tests/
│   ├── auth/
│   │   ├── login.spec.ts
│   │   └── permissions.spec.ts
│   ├── sales/
│   │   ├── complete-sale.spec.ts
│   │   ├── cart-management.spec.ts
│   │   └── payment-methods.spec.ts
│   ├── inventory/
│   │   ├── product-management.spec.ts
│   │   ├── stock-alerts.spec.ts
│   │   └── movements.spec.ts
│   └── crm/
│       ├── customer-insights.spec.ts
│       └── segmentation.spec.ts
└── utils/
    ├── test-helpers.ts
    ├── db-setup.ts
    └── page-objects.ts
```

## Casos de Teste E2E Detalhados

### Implementação seria feita após aprovação da estrutura