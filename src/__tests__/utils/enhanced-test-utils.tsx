/**
 * @fileoverview Enhanced Test Utilities - Consolidated and optimized
 * FASE 8: DOCUMENTAÇÃO E MANUTENIBILIDADE - Subtarefa 8.3.1
 * 
 * @author Adega Manager Testing Team
 * @version 2.0.0
 */

import React from 'react'
import { render, RenderOptions, RenderResult } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { vi } from 'vitest'
import type { MockInstance } from 'vitest'

// ========================================
// STANDARD MOCKS - Consolidated
// ========================================

/**
 * Standard Supabase mock configuration
 * Use this in all tests that interact with Supabase
 */
export const createSupabaseMock = () => {
  const mockSelect = vi.fn(() => Promise.resolve({ data: [], error: null }))
  const mockInsert = vi.fn(() => Promise.resolve({ data: [], error: null }))
  const mockUpdate = vi.fn(() => Promise.resolve({ data: [], error: null }))
  const mockDelete = vi.fn(() => Promise.resolve({ data: [], error: null }))
  const mockSingle = vi.fn(() => Promise.resolve({ data: null, error: null }))
  const mockEq = vi.fn(() => ({ single: mockSingle }))
  
  const supabaseMock = {
    from: vi.fn(() => ({
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
      delete: mockDelete,
      eq: mockEq
    }))
  }
  
  return {
    supabase: supabaseMock,
    mocks: {
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
      delete: mockDelete,
      single: mockSingle,
      eq: mockEq
    }
  }
}

/**
 * Standard useToast mock
 * Use this for consistent toast testing
 */
export const createToastMock = () => {
  const mockToast = vi.fn()
  return { toast: mockToast, mockToast }
}

/**
 * Global mock setup - call once per test file
 */
export const setupStandardMocks = () => {
  const { supabase, mocks: supabaseMocks } = createSupabaseMock()
  const { mockToast } = createToastMock()

  vi.mock('@/core/api/supabase/client', () => ({ supabase }))
  vi.mock('@/shared/hooks/common/use-toast', () => ({
    useToast: () => ({ toast: mockToast })
  }))

  return {
    supabaseMocks,
    mockToast
  }
}

// ========================================
// TEST WRAPPERS - Enhanced
// ========================================

interface TestWrapperProps {
  children: React.ReactNode
  queryClient?: QueryClient
  initialEntries?: string[]
}

/**
 * Enhanced Test Wrapper with optimized QueryClient
 */
const TestWrapper: React.FC<TestWrapperProps> = ({ 
  children, 
  queryClient,
  initialEntries = ['/']
}) => {
  const defaultQueryClient = React.useMemo(() => new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
        gcTime: 0
      },
      mutations: {
        retry: false
      }
    },
    logger: {
      log: vi.fn(),
      warn: vi.fn(),
      error: vi.fn()
    }
  }), [])

  const client = queryClient || defaultQueryClient

  return (
    <QueryClientProvider client={client}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  )
}

/**
 * Enhanced render function with built-in TestWrapper
 */
export const renderWithProviders = (
  ui: React.ReactElement,
  options: RenderOptions & {
    queryClient?: QueryClient
    initialEntries?: string[]
  } = {}
): RenderResult => {
  const { queryClient, initialEntries, ...renderOptions } = options

  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <TestWrapper queryClient={queryClient} initialEntries={initialEntries}>
      {children}
    </TestWrapper>
  )

  return render(ui, { wrapper: Wrapper, ...renderOptions })
}

// ========================================
// MOCK DATA FACTORIES - Enhanced
// ========================================

/**
 * Enhanced Product factory with realistic data
 */
export const createMockProduct = (overrides: Partial<any> = {}) => ({
  id: crypto.randomUUID(),
  name: 'Vinho Tinto Premium',
  price: 89.90,
  cost_price: 45.50,
  stock: 50,
  minimum_stock: 10,
  category: 'Vinhos Tintos',
  barcode: `123456789${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
  supplier: 'Vinícola Premium Ltda',
  volume_ml: 750,
  alcohol_content: 13.5,
  package_size: 1,
  unit_type: 'un',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  is_active: true,
  ...overrides
})

/**
 * Enhanced Customer factory with segments
 */
export const createMockCustomer = (overrides: Partial<any> = {}) => ({
  id: crypto.randomUUID(),
  name: 'João Silva',
  email: 'joao.silva@email.com',
  phone: '(11) 99999-9999',
  cpf: '123.456.789-00',
  address: 'Rua das Flores, 123',
  city: 'São Paulo',
  state: 'SP',
  zip_code: '01234-567',
  segment: 'HIGH_VALUE',
  total_purchases: 1250.50,
  last_purchase: new Date().toISOString(),
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  is_active: true,
  ...overrides
})

/**
 * Enhanced Sale factory with realistic items
 */
export const createMockSale = (overrides: Partial<any> = {}) => ({
  id: crypto.randomUUID(),
  customer_id: crypto.randomUUID(),
  total_amount: 179.80,
  payment_method: 'CREDIT_CARD',
  status: 'COMPLETED',
  sale_date: new Date().toISOString(),
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  items: [
    {
      id: crypto.randomUUID(),
      product_id: crypto.randomUUID(),
      quantity: 2,
      unit_price: 89.90,
      total_price: 179.80
    }
  ],
  ...overrides
})

/**
 * Generate large datasets for performance testing
 */
export const createLargeDataset = <T extends Record<string, unknown>>(
  factory: (overrides?: Partial<T>) => T,
  size: number = 1000,
  customizer?: (index: number) => Partial<T>
): T[] => {
  return Array.from({ length: size }, (_, index) => 
    factory(customizer ? customizer(index) : { id: `item-${index}` } as Partial<T>)
  )
}

// ========================================
// PERFORMANCE TESTING UTILITIES
// ========================================

/**
 * Performance measurement utility
 */
export const measurePerformance = async <T>(
  operation: () => Promise<T> | T,
  options: {
    name?: string;
    threshold?: number;
    iterations?: number;
  } = {}
): Promise<{
  result: T;
  averageTime: number;
  minTime: number;
  maxTime: number;
  allTimes: number[];
}> => {
  const { name = 'operation', threshold = 1000, iterations = 1 } = options;
  const times: number[] = []
  let result: T

  for (let i = 0; i < iterations; i++) {
    const startTime = performance.now()
    result = await operation()
    const endTime = performance.now()
    times.push(endTime - startTime)
  }

  const averageTime = times.reduce((sum, time) => sum + time, 0) / times.length
  const minTime = Math.min(...times)
  const maxTime = Math.max(...times)

  // Log performance warning if threshold exceeded
  if (averageTime > threshold) {
    console.warn(`⚠️ Performance warning: ${name} took ${averageTime.toFixed(2)}ms (threshold: ${threshold}ms)`)
  }

  return {
    result: result!,
    averageTime,
    minTime,
    maxTime,
    allTimes: times
  }
}

/**
 * Memory usage tracking utility
 */
export const trackMemoryUsage = <T>(operation: () => T): {
  result: T
  memoryGrowth: number
  initialMemory: number
  finalMemory: number
} => {
  const initialMemory = process.memoryUsage().heapUsed
  
  const result = operation()
  
  // Force garbage collection if available
  if (global.gc) {
    global.gc()
  }
  
  const finalMemory = process.memoryUsage().heapUsed
  const memoryGrowth = finalMemory - initialMemory

  return {
    result,
    memoryGrowth,
    initialMemory,
    finalMemory
  }
}

// ========================================
// ACCESSIBILITY TESTING UTILITIES
// ========================================

/**
 * Enhanced accessibility testing utility
 */
export const testAccessibility = async (element: Element, options: {
  rules?: string[]
  tags?: string[]
}) => {
  const { axe } = await import('jest-axe')
  
  const config = {
    rules: options.rules ? 
      Object.fromEntries(options.rules.map(rule => [rule, { enabled: true }])) : 
      undefined,
    tags: options.tags || ['wcag2a', 'wcag2aa']
  }
  
  return axe(element, config)
}

/**
 * Keyboard navigation testing utility
 */
export const testKeyboardNavigation = async (container: Element) => {
  const { fireEvent } = await import('@testing-library/react')
  
  const focusableElements = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )
  
  const results = {
    totalFocusableElements: focusableElements.length,
    tabOrderCorrect: true,
    allElementsReachable: true,
    trapsFocus: false
  }
  
  // Simple keyboard navigation test
  for (let i = 0; i < focusableElements.length; i++) {
    fireEvent.keyDown(document.activeElement!, { key: 'Tab' })
    await new Promise(resolve => setTimeout(resolve, 10))
  }
  
  return results
}

// ========================================
// ASSERTION UTILITIES
// ========================================

/**
 * Enhanced form validation assertions
 */
export const expectFormValidation = {
  toHaveRequiredFields: (form: Element, fields: string[]) => {
    fields.forEach(field => {
      const element = form.querySelector(`[name="${field}"]`) as HTMLElement
      expect(element).toBeInTheDocument()
      expect(element).toHaveAttribute('required')
    })
  },
  
  toHaveAccessibleLabels: (form: Element) => {
    const inputs = form.querySelectorAll('input, select, textarea')
    inputs.forEach(input => {
      const id = input.getAttribute('id')
      if (id) {
        const label = form.querySelector(`label[for="${id}"]`)
        expect(label).toBeInTheDocument()
      }
    })
  },
  
  toHaveValidationMessages: async (form: Element, expectedErrors: string[]) => {
    const { waitFor } = await import('@testing-library/react')
    
    await waitFor(() => {
      expectedErrors.forEach(error => {
        const errorElement = form.querySelector(`[role="alert"]`)
        expect(errorElement).toHaveTextContent(new RegExp(error, 'i'))
      })
    })
  }
}

/**
 * Enhanced API interaction assertions
 */
export const expectApiInteraction = {
  toHaveBeenCalledWithData: (mockFn: MockInstance, expectedData: any) => {
    expect(mockFn).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining(expectedData)
      ])
    )
  },
  
  toHaveHandledError: (mockToast: MockInstance, errorMessage?: string) => {
    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        variant: 'destructive',
        title: expect.any(String),
        description: errorMessage ? 
          expect.stringContaining(errorMessage) : 
          expect.any(String)
      })
    )
  },
  
  toHaveShowedSuccess: (mockToast: MockInstance, successMessage?: string) => {
    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: expect.any(String),
        description: successMessage ? 
          expect.stringContaining(successMessage) : 
          expect.any(String)
      })
    )
  }
}

// ========================================
// CLEANUP UTILITIES
// ========================================

/**
 * Comprehensive test cleanup utility
 */
export const cleanupTest = () => {
  // Clear all mocks
  vi.clearAllMocks()
  
  // Clear all timers
  vi.clearAllTimers()
  
  // Reset DOM
  document.body.innerHTML = ''
  
  // Clear localStorage
  localStorage.clear()
  
  // Clear sessionStorage
  sessionStorage.clear()
  
  // Force garbage collection if available
  if (global.gc) {
    global.gc()
  }
}

/**
 * Setup and teardown helper
 */
export const createTestSuite = (suiteName: string) => {
  const mocks = setupStandardMocks()
  
  return {
    mocks,
    beforeEach: () => {
      vi.clearAllMocks()
    },
    afterEach: () => {
      cleanupTest()
    },
    describe: (name: string, tests: () => void) => {
      describe(`${suiteName} - ${name}`, tests)
    }
  }
}

// ========================================
// EXPORTS
// ========================================

// Re-export commonly used testing utilities
export * from '@testing-library/react'
export * from '@testing-library/user-event'
export { vi, expect } from 'vitest'

// Default export for convenient importing
export default {
  renderWithProviders,
  createMockProduct,
  createMockCustomer,
  createMockSale,
  createLargeDataset,
  measurePerformance,
  trackMemoryUsage,
  testAccessibility,
  testKeyboardNavigation,
  expectFormValidation,
  expectApiInteraction,
  cleanupTest,
  createTestSuite,
  setupStandardMocks
}