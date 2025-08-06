/**
 * EXEMPLO DE TESTE E2E - Jornada Completa de Venda
 * Este arquivo demonstra como seriam implementados os testes E2E com Playwright
 * 
 * NOTA: Este é um exemplo estrutural. Para executar, seria necessário:
 * 1. Instalar Playwright: npm install --save-dev @playwright/test
 * 2. Configurar playwright.config.ts
 * 3. Executar: npx playwright test
 */

import { test, expect, Page } from '@playwright/test';

// Page Object Model - LoginPage
class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/auth');
  }

  async login(email: string, password: string) {
    await this.page.fill('[data-testid=email-input]', email);
    await this.page.fill('[data-testid=password-input]', password);
    await this.page.click('[data-testid=login-button]');
  }

  async waitForDashboard() {
    await this.page.waitForURL('/dashboard');
    await this.page.waitForSelector('[data-testid=dashboard-metrics]');
  }
}

// Page Object Model - SalesPage  
class SalesPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.click('[data-testid=nav-sales]');
    await this.page.waitForURL('/sales');
  }

  async searchProduct(productName: string) {
    await this.page.fill('[data-testid=product-search]', productName);
    await this.page.waitForSelector('[data-testid=product-results]');
  }

  async addProductToCart(productIndex: number = 0) {
    const products = this.page.locator('[data-testid=product-card]');
    await products.nth(productIndex).locator('[data-testid=add-to-cart]').click();
  }

  async selectCustomer(customerName: string) {
    await this.page.click('[data-testid=customer-search]');
    await this.page.fill('[data-testid=customer-input]', customerName);
    await this.page.waitForSelector('[data-testid=customer-results]');
    await this.page.click('[data-testid=customer-results] >> nth=0');
  }

  async proceedToCheckout() {
    await this.page.click('[data-testid=checkout-button]');
  }

  async selectPaymentMethod(method: 'pix' | 'cartao' | 'dinheiro') {
    await this.page.click(`[data-testid=payment-${method}]`);
  }

  async confirmSale() {
    await this.page.click('[data-testid=confirm-sale]');
    await this.page.waitForSelector('[data-testid=sale-success]');
  }

  async getSaleId(): Promise<string> {
    const saleIdElement = this.page.locator('[data-testid=sale-id]');
    return await saleIdElement.textContent() || '';
  }
}

// Page Object Model - InventoryPage
class InventoryPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.click('[data-testid=nav-inventory]');
    await this.page.waitForURL('/inventory');
  }

  async getProductStock(productName: string): Promise<number> {
    await this.page.fill('[data-testid=inventory-search]', productName);
    const stockElement = this.page.locator('[data-testid=product-stock]').first();
    const stockText = await stockElement.textContent();
    return parseInt(stockText?.match(/\d+/)?.[0] || '0');
  }
}

// Dados de teste
const testData = {
  admin: {
    email: 'admin@adega.com',
    password: 'admin123'
  },
  employee: {
    email: 'funcionario@adega.com', 
    password: 'func123'
  },
  products: {
    vinho: 'Vinho Tinto Premium',
    whisky: 'Whisky Single Malt',
    cerveja: 'Cerveja Artesanal IPA'
  },
  customers: {
    joao: 'João Silva',
    maria: 'Maria Santos',
    carlos: 'Carlos Oliveira'
  }
};

test.describe('E2E - Jornada Completa de Venda', () => {
  test.beforeEach(async ({ page }) => {
    // Setup inicial para cada teste
    await page.goto('/');
  });

  test('Admin deve processar venda completa com sucesso', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const salesPage = new SalesPage(page);
    const inventoryPage = new InventoryPage(page);

    // 1. Login como admin
    await loginPage.goto();
    await loginPage.login(testData.admin.email, testData.admin.password);
    await loginPage.waitForDashboard();

    // 2. Verificar estoque inicial (para comparar depois)
    await inventoryPage.goto();
    const initialStock = await inventoryPage.getProductStock(testData.products.vinho);
    expect(initialStock).toBeGreaterThan(0);

    // 3. Ir para vendas
    await salesPage.goto();

    // 4. Buscar e adicionar produto ao carrinho
    await salesPage.searchProduct(testData.products.vinho);
    await salesPage.addProductToCart(0);

    // Verificar que produto foi adicionado ao carrinho
    await expect(page.locator('[data-testid=cart-items]')).toContainText(testData.products.vinho);

    // 5. Selecionar cliente
    await salesPage.selectCustomer(testData.customers.joao);

    // Verificar que cliente foi selecionado
    await expect(page.locator('[data-testid=selected-customer]')).toContainText(testData.customers.joao);

    // 6. Prosseguir para checkout
    await salesPage.proceedToCheckout();

    // 7. Selecionar método de pagamento
    await salesPage.selectPaymentMethod('pix');

    // 8. Confirmar venda
    await salesPage.confirmSale();

    // 9. Verificar venda criada com sucesso
    const saleId = await salesPage.getSaleId();
    expect(saleId).toMatch(/^sale-\d+$/);

    // 10. Verificar que estoque foi atualizado
    await inventoryPage.goto();
    const finalStock = await inventoryPage.getProductStock(testData.products.vinho);
    expect(finalStock).toBeLessThan(initialStock);

    // 11. Verificar que a venda aparece no histórico
    await page.click('[data-testid=nav-sales-history]');
    await expect(page.locator('[data-testid=sales-history]')).toContainText(saleId);
  });

  test('Funcionário deve ter acesso limitado mas conseguir vender', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const salesPage = new SalesPage(page);

    // 1. Login como funcionário
    await loginPage.goto();
    await loginPage.login(testData.employee.email, testData.employee.password);
    await loginPage.waitForDashboard();

    // 2. Verificar que não tem acesso a preços de custo
    await expect(page.locator('[data-testid=cost-prices]')).not.toBeVisible();

    // 3. Verificar que consegue acessar vendas
    await salesPage.goto();
    await expect(page.locator('[data-testid=sales-interface]')).toBeVisible();

    // 4. Processar venda simples
    await salesPage.searchProduct(testData.products.cerveja);
    await salesPage.addProductToCart(0);
    await salesPage.selectCustomer(testData.customers.maria);
    await salesPage.proceedToCheckout();
    await salesPage.selectPaymentMethod('dinheiro');
    await salesPage.confirmSale();

    // 5. Verificar sucesso
    const saleId = await salesPage.getSaleId();
    expect(saleId).toMatch(/^sale-\d+$/);
  });

  test('Deve falhar graciosamente com estoque insuficiente', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const salesPage = new SalesPage(page);

    await loginPage.goto();
    await loginPage.login(testData.admin.email, testData.admin.password);
    await loginPage.waitForDashboard();

    await salesPage.goto();
    
    // Buscar produto com estoque baixo
    await salesPage.searchProduct('Produto Esgotado');
    
    // Verificar que botão de adicionar está desabilitado
    const addToCartBtn = page.locator('[data-testid=add-to-cart]').first();
    await expect(addToCartBtn).toBeDisabled();
    
    // Verificar mensagem de estoque insuficiente
    await expect(page.locator('[data-testid=stock-warning]')).toContainText('Estoque insuficiente');
  });

  test('Deve processar venda com múltiplos produtos', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const salesPage = new SalesPage(page);

    await loginPage.goto();
    await loginPage.login(testData.admin.email, testData.admin.password);
    await loginPage.waitForDashboard();

    await salesPage.goto();

    // Adicionar múltiplos produtos
    await salesPage.searchProduct(testData.products.vinho);
    await salesPage.addProductToCart(0);

    await salesPage.searchProduct(testData.products.whisky);
    await salesPage.addProductToCart(0);

    // Verificar carrinho com 2 produtos
    const cartItems = page.locator('[data-testid=cart-item]');
    await expect(cartItems).toHaveCount(2);

    // Verificar total calculado corretamente
    const cartTotal = page.locator('[data-testid=cart-total]');
    await expect(cartTotal).toBeVisible();

    await salesPage.selectCustomer(testData.customers.carlos);
    await salesPage.proceedToCheckout();
    await salesPage.selectPaymentMethod('cartao');
    await salesPage.confirmSale();

    const saleId = await salesPage.getSaleId();
    expect(saleId).toMatch(/^sale-\d+$/);
  });

  test('Deve validar dados obrigatórios no checkout', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const salesPage = new SalesPage(page);

    await loginPage.goto();
    await loginPage.login(testData.admin.email, testData.admin.password);
    await loginPage.waitForDashboard();

    await salesPage.goto();
    await salesPage.searchProduct(testData.products.vinho);
    await salesPage.addProductToCart(0);

    // Tentar fazer checkout sem selecionar cliente
    await salesPage.proceedToCheckout();
    
    // Verificar erro de validação
    await expect(page.locator('[data-testid=customer-required-error]')).toContainText('Cliente é obrigatório');

    // Selecionar cliente mas não selecionar método de pagamento
    await salesPage.selectCustomer(testData.customers.joao);
    await salesPage.proceedToCheckout();

    // Verificar erro de método de pagamento
    await expect(page.locator('[data-testid=payment-required-error]')).toContainText('Método de pagamento obrigatório');
  });
});

test.describe('E2E - Performance e Responsividade', () => {
  test('Interface deve ser responsiva em mobile', async ({ page }) => {
    // Simular dispositivo móvel
    await page.setViewportSize({ width: 375, height: 667 });

    const loginPage = new LoginPage(page);
    const salesPage = new SalesPage(page);

    await loginPage.goto();
    await loginPage.login(testData.admin.email, testData.admin.password);
    await loginPage.waitForDashboard();

    // Verificar que sidebar mobile funciona
    const mobileMenu = page.locator('[data-testid=mobile-menu]');
    await expect(mobileMenu).toBeVisible();

    await mobileMenu.click();
    await page.click('[data-testid=nav-sales]');

    // Verificar que interface de vendas é responsiva
    await expect(page.locator('[data-testid=sales-interface]')).toBeVisible();
    await expect(page.locator('[data-testid=product-grid]')).toHaveClass(/grid-cols-1/);
  });

  test('Aplicação deve carregar rapidamente', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    await page.waitForSelector('[data-testid=app-loaded]');
    
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000); // Menos de 3 segundos
  });
});

test.describe('E2E - Casos Limite e Erro', () => {
  test('Deve lidar com falha de rede graciosamente', async ({ page }) => {
    const loginPage = new LoginPage(page);
    
    await loginPage.goto();
    await loginPage.login(testData.admin.email, testData.admin.password);
    await loginPage.waitForDashboard();

    // Simular falha de rede
    await page.route('**/api/**', route => route.abort());

    // Tentar fazer operação que falha
    await page.click('[data-testid=nav-sales]');

    // Verificar mensagem de erro
    await expect(page.locator('[data-testid=network-error]')).toContainText('Erro de conexão');
    await expect(page.locator('[data-testid=retry-button]')).toBeVisible();
  });

  test('Deve manter estado durante refresh da página', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const salesPage = new SalesPage(page);

    await loginPage.goto();
    await loginPage.login(testData.admin.email, testData.admin.password);
    await loginPage.waitForDashboard();

    await salesPage.goto();
    await salesPage.searchProduct(testData.products.vinho);
    await salesPage.addProductToCart(0);

    // Verificar que produto está no carrinho
    await expect(page.locator('[data-testid=cart-items]')).toContainText(testData.products.vinho);

    // Refresh da página
    await page.reload();

    // Verificar que carrinho foi mantido (se implementado com localStorage)
    await expect(page.locator('[data-testid=cart-items]')).toContainText(testData.products.vinho);
  });
});