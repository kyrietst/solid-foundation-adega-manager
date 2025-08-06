import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';

// Mock contexts that might be needed
const mockToast = vi.fn();
vi.mock('@/shared/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

// Create a test query client with sensible defaults
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      gcTime: 0,
    },
    mutations: {
      retry: false,
    },
  },
  logger: {
    log: console.log,
    warn: console.warn,
    error: () => {}, // Silence errors in tests
  },
});

// All the providers wrapper
interface AllTheProvidersProps {
  children: React.ReactNode;
  queryClient?: QueryClient;
}

const AllTheProviders = ({ children, queryClient }: AllTheProvidersProps) => {
  const testQueryClient = queryClient || createTestQueryClient();

  return (
    <QueryClientProvider client={testQueryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

// Custom render function that includes providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient;
}

const customRender = (
  ui: ReactElement,
  options: CustomRenderOptions = {}
) => {
  const { queryClient, ...renderOptions } = options;

  return render(ui, {
    wrapper: (props) => <AllTheProviders {...props} queryClient={queryClient} />,
    ...renderOptions,
  });
};

// Utilities for common test scenarios
export const createMockUser = (overrides = {}) => ({
  id: 'test-user-id',
  email: 'test@adega.com',
  role: 'admin',
  name: 'Test User',
  created_at: '2024-01-01T00:00:00Z',
  ...overrides,
});

export const createMockProduct = (overrides = {}) => ({
  id: 'test-product-id',
  name: 'Test Product',
  price: 29.90,
  cost_price: 15.00,
  stock_quantity: 100,
  min_stock: 10,
  category: 'Test Category',
  barcode: '1234567890123',
  created_at: '2024-01-01T00:00:00Z',
  ...overrides,
});

export const createMockCustomer = (overrides = {}) => ({
  id: 'test-customer-id',
  name: 'Test Customer',
  email: 'customer@test.com',
  phone: '11999999999',
  segment: 'regular',
  created_at: '2024-01-01T00:00:00Z',
  ...overrides,
});

export const createMockSale = (overrides = {}) => ({
  id: 'test-sale-id',
  customer_id: 'test-customer-id',
  total: 89.70,
  payment_method_id: 'test-payment-id',
  status: 'completed',
  created_at: '2024-01-01T00:00:00Z',
  ...overrides,
});

// Wait utilities for async testing
export const waitForLoadingToFinish = () => {
  return new Promise((resolve) => setTimeout(resolve, 0));
};

// Mock localStorage utilities
export const mockLocalStorage = () => {
  const store: Record<string, string> = {};
  
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach(key => delete store[key]);
    }),
    store,
  };
};

// Form testing utilities
export const submitForm = async (form: HTMLFormElement) => {
  const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
  form.dispatchEvent(submitEvent);
};

// Export everything including our custom render
export * from '@testing-library/react';
export { customRender as render };
export { createTestQueryClient, mockToast };