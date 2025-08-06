/**
 * @fileoverview Modular Mock System - Centralized and reusable mocks
 * FASE 8: DOCUMENTAÇÃO E MANUTENIBILIDADE - Subtarefa 8.3.1
 * 
 * @author Adega Manager Testing Team
 * @version 2.0.0
 */

import { vi } from 'vitest'
import type { MockInstance } from 'vitest'

// ========================================
// SUPABASE MOCK MODULE
// ========================================

export interface SupabaseMockConfig {
  defaultSelectResponse?: { data: any[], error: any }
  defaultInsertResponse?: { data: any[], error: any }
  defaultUpdateResponse?: { data: any[], error: any }
  defaultDeleteResponse?: { data: any[], error: any }
  defaultSingleResponse?: { data: any, error: any }
}

export class SupabaseMock {
  public select: MockInstance
  public insert: MockInstance
  public update: MockInstance
  public delete: MockInstance
  public single: MockInstance
  public eq: MockInstance
  public from: MockInstance

  constructor(config: SupabaseMockConfig = {}) {
    const {
      defaultSelectResponse = { data: [], error: null },
      defaultInsertResponse = { data: [], error: null },
      defaultUpdateResponse = { data: [], error: null },
      defaultDeleteResponse = { data: [], error: null },
      defaultSingleResponse = { data: null, error: null }
    } = config

    this.select = vi.fn(() => Promise.resolve(defaultSelectResponse))
    this.insert = vi.fn(() => Promise.resolve(defaultInsertResponse))
    this.update = vi.fn(() => Promise.resolve(defaultUpdateResponse))
    this.delete = vi.fn(() => Promise.resolve(defaultDeleteResponse))
    this.single = vi.fn(() => Promise.resolve(defaultSingleResponse))
    this.eq = vi.fn(() => ({ single: this.single }))
    
    this.from = vi.fn(() => ({
      select: this.select,
      insert: this.insert,
      update: this.update,
      delete: this.delete,
      eq: this.eq
    }))
  }

  /**
   * Mock successful select response
   */
  mockSelectSuccess(data: any[]) {
    this.select.mockResolvedValueOnce({ data, error: null })
    return this
  }

  /**
   * Mock failed select response
   */
  mockSelectError(error: any) {
    this.select.mockResolvedValueOnce({ data: null, error })
    return this
  }

  /**
   * Mock successful insert response
   */
  mockInsertSuccess(data: any[]) {
    this.insert.mockResolvedValueOnce({ data, error: null })
    return this
  }

  /**
   * Mock failed insert response
   */
  mockInsertError(error: any) {
    this.insert.mockResolvedValueOnce({ data: null, error })
    return this
  }

  /**
   * Mock successful update response
   */
  mockUpdateSuccess(data: any[]) {
    this.update.mockResolvedValueOnce({ data, error: null })
    return this
  }

  /**
   * Mock failed update response
   */
  mockUpdateError(error: any) {
    this.update.mockResolvedValueOnce({ data: null, error })
    return this
  }

  /**
   * Mock successful delete response
   */
  mockDeleteSuccess() {
    this.delete.mockResolvedValueOnce({ data: [], error: null })
    return this
  }

  /**
   * Mock failed delete response
   */
  mockDeleteError(error: any) {
    this.delete.mockResolvedValueOnce({ data: null, error })
    return this
  }

  /**
   * Chain multiple responses for testing sequences
   */
  chainResponses(operations: Array<{
    operation: 'select' | 'insert' | 'update' | 'delete'
    success: boolean
    data?: any
    error?: any
  }>) {
    operations.forEach(({ operation, success, data, error }) => {
      if (success) {
        this[operation].mockResolvedValueOnce({ data: data || [], error: null })
      } else {
        this[operation].mockResolvedValueOnce({ data: null, error: error || new Error('Mock error') })
      }
    })
    return this
  }

  /**
   * Reset all mocks
   */
  reset() {
    vi.clearAllMocks()
    return this
  }

  /**
   * Get call history for debugging
   */
  getCallHistory() {
    return {
      select: this.select.mock.calls,
      insert: this.insert.mock.calls,
      update: this.update.mock.calls,
      delete: this.delete.mock.calls,
      from: this.from.mock.calls
    }
  }
}

// ========================================
// TOAST MOCK MODULE
// ========================================

export class ToastMock {
  public toast: MockInstance

  constructor() {
    this.toast = vi.fn()
  }

  /**
   * Expect success toast to have been called
   */
  expectSuccess(message?: string) {
    if (message) {
      expect(this.toast).toHaveBeenCalledWith(
        expect.objectContaining({
          description: expect.stringContaining(message)
        })
      )
    } else {
      expect(this.toast).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: expect.not.stringMatching('destructive')
        })
      )
    }
    return this
  }

  /**
   * Expect error toast to have been called
   */
  expectError(message?: string) {
    if (message) {
      expect(this.toast).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: 'destructive',
          description: expect.stringContaining(message)
        })
      )
    } else {
      expect(this.toast).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: 'destructive'
        })
      )
    }
    return this
  }

  /**
   * Expect toast to have been called N times
   */
  expectCallCount(count: number) {
    expect(this.toast).toHaveBeenCalledTimes(count)
    return this
  }

  /**
   * Expect toast not to have been called
   */
  expectNotCalled() {
    expect(this.toast).not.toHaveBeenCalled()
    return this
  }

  /**
   * Reset mock
   */
  reset() {
    this.toast.mockClear()
    return this
  }

  /**
   * Get all toast calls for debugging
   */
  getAllCalls() {
    return this.toast.mock.calls
  }
}

// ========================================
// ROUTER MOCK MODULE
// ========================================

export class RouterMock {
  public navigate: MockInstance
  public useLocation: MockInstance
  public useParams: MockInstance

  constructor(initialLocation = { pathname: '/', search: '', hash: '' }) {
    this.navigate = vi.fn()
    this.useLocation = vi.fn(() => initialLocation)
    this.useParams = vi.fn(() => ({}))
  }

  /**
   * Mock navigation call
   */
  mockNavigate(path: string, options?: any) {
    this.navigate.mockImplementation((to: string, opts?: any) => {
      if (to === path) {
        this.useLocation.mockReturnValue({ 
          pathname: path, 
          search: '', 
          hash: '' 
        })
      }
    })
    return this
  }

  /**
   * Mock URL parameters
   */
  mockParams(params: Record<string, string>) {
    this.useParams.mockReturnValue(params)
    return this
  }

  /**
   * Mock location
   */
  mockLocation(location: { pathname: string, search?: string, hash?: string }) {
    this.useLocation.mockReturnValue({
      search: '',
      hash: '',
      ...location
    })
    return this
  }

  /**
   * Expect navigation to have been called
   */
  expectNavigation(path: string, options?: any) {
    if (options) {
      expect(this.navigate).toHaveBeenCalledWith(path, options)
    } else {
      expect(this.navigate).toHaveBeenCalledWith(path)
    }
    return this
  }

  /**
   * Reset all mocks
   */
  reset() {
    this.navigate.mockClear()
    this.useLocation.mockClear()
    this.useParams.mockClear()
    return this
  }
}

// ========================================
// LOCAL STORAGE MOCK MODULE
// ========================================

export class LocalStorageMock {
  private store: Map<string, string>
  public getItem: MockInstance
  public setItem: MockInstance
  public removeItem: MockInstance
  public clear: MockInstance

  constructor(initialData: Record<string, string> = {}) {
    this.store = new Map(Object.entries(initialData))
    
    this.getItem = vi.fn((key: string) => this.store.get(key) || null)
    this.setItem = vi.fn((key: string, value: string) => {
      this.store.set(key, value)
    })
    this.removeItem = vi.fn((key: string) => {
      this.store.delete(key)
    })
    this.clear = vi.fn(() => {
      this.store.clear()
    })
  }

  /**
   * Set initial data
   */
  setInitialData(data: Record<string, string>) {
    this.store.clear()
    Object.entries(data).forEach(([key, value]) => {
      this.store.set(key, value)
    })
    return this
  }

  /**
   * Get current store data
   */
  getCurrentData() {
    return Object.fromEntries(this.store.entries())
  }

  /**
   * Mock getItem to throw error
   */
  mockGetItemError(key: string, error: Error) {
    this.getItem.mockImplementation((k: string) => {
      if (k === key) throw error
      return this.store.get(k) || null
    })
    return this
  }

  /**
   * Mock setItem to throw error
   */
  mockSetItemError(key: string, error: Error) {
    this.setItem.mockImplementation((k: string, value: string) => {
      if (k === key) throw error
      this.store.set(k, value)
    })
    return this
  }

  /**
   * Expect item to have been stored
   */
  expectStored(key: string, value?: string) {
    if (value) {
      expect(this.setItem).toHaveBeenCalledWith(key, value)
    } else {
      expect(this.setItem).toHaveBeenCalledWith(key, expect.any(String))
    }
    return this
  }

  /**
   * Expect item to have been removed
   */
  expectRemoved(key: string) {
    expect(this.removeItem).toHaveBeenCalledWith(key)
    return this
  }

  /**
   * Reset all mocks
   */
  reset() {
    this.getItem.mockClear()
    this.setItem.mockClear()
    this.removeItem.mockClear()
    this.clear.mockClear()
    return this
  }
}

// ========================================
// QUERY CLIENT MOCK MODULE
// ========================================

export class QueryClientMock {
  public invalidateQueries: MockInstance
  public setQueryData: MockInstance
  public getQueryData: MockInstance
  public refetchQueries: MockInstance

  constructor() {
    this.invalidateQueries = vi.fn()
    this.setQueryData = vi.fn()
    this.getQueryData = vi.fn()
    this.refetchQueries = vi.fn()
  }

  /**
   * Mock query data
   */
  mockQueryData(queryKey: string[], data: any) {
    this.getQueryData.mockImplementation((key: string[]) => {
      if (JSON.stringify(key) === JSON.stringify(queryKey)) {
        return data
      }
      return undefined
    })
    return this
  }

  /**
   * Expect queries to have been invalidated
   */
  expectInvalidation(queryKey?: string[]) {
    if (queryKey) {
      expect(this.invalidateQueries).toHaveBeenCalledWith(queryKey)
    } else {
      expect(this.invalidateQueries).toHaveBeenCalled()
    }
    return this
  }

  /**
   * Expect query data to have been set
   */
  expectDataSet(queryKey: string[], data: any) {
    expect(this.setQueryData).toHaveBeenCalledWith(queryKey, data)
    return this
  }

  /**
   * Reset all mocks
   */
  reset() {
    this.invalidateQueries.mockClear()
    this.setQueryData.mockClear()
    this.getQueryData.mockClear()
    this.refetchQueries.mockClear()
    return this
  }
}

// ========================================
// COMPREHENSIVE MOCK FACTORY
// ========================================

export class MockFactory {
  public supabase: SupabaseMock
  public toast: ToastMock
  public router: RouterMock
  public localStorage: LocalStorageMock
  public queryClient: QueryClientMock

  constructor(config: {
    supabase?: SupabaseMockConfig
    initialLocation?: { pathname: string, search?: string, hash?: string }
    initialStorage?: Record<string, string>
  } = {}) {
    this.supabase = new SupabaseMock(config.supabase)
    this.toast = new ToastMock()
    this.router = new RouterMock(config.initialLocation)
    this.localStorage = new LocalStorageMock(config.initialStorage)
    this.queryClient = new QueryClientMock()
  }

  /**
   * Setup all mocks in vi
   */
  setupMocks() {
    vi.mock('@/core/api/supabase/client', () => ({
      supabase: { from: this.supabase.from }
    }))
    
    vi.mock('@/shared/hooks/common/use-toast', () => ({
      useToast: () => ({ toast: this.toast.toast })
    }))
    
    vi.mock('react-router-dom', async () => {
      const actual = await vi.importActual('react-router-dom')
      return {
        ...actual,
        useNavigate: () => this.router.navigate,
        useLocation: this.router.useLocation,
        useParams: this.router.useParams
      }
    })
    
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: this.localStorage.getItem,
        setItem: this.localStorage.setItem,
        removeItem: this.localStorage.removeItem,
        clear: this.localStorage.clear
      },
      writable: true
    })

    return this
  }

  /**
   * Reset all mocks
   */
  resetAll() {
    this.supabase.reset()
    this.toast.reset()
    this.router.reset()
    this.localStorage.reset()
    this.queryClient.reset()
    return this
  }

  /**
   * Get debug information for all mocks
   */
  getDebugInfo() {
    return {
      supabase: this.supabase.getCallHistory(),
      toast: this.toast.getAllCalls(),
      localStorage: this.localStorage.getCurrentData(),
      router: {
        navigateCalls: this.router.navigate.mock.calls,
        currentLocation: this.router.useLocation(),
        currentParams: this.router.useParams()
      }
    }
  }
}

// ========================================
// CONVENIENCE EXPORTS
// ========================================

/**
 * Create a basic mock factory for most common use cases
 */
export const createBasicMocks = () => new MockFactory().setupMocks()

/**
 * Create a mock factory with custom configuration
 */
export const createCustomMocks = (config: Parameters<typeof MockFactory>[0]) => 
  new MockFactory(config).setupMocks()

/**
 * Global mock setup for test files
 */
export const setupGlobalMocks = () => {
  const factory = createBasicMocks()
  
  beforeEach(() => {
    factory.resetAll()
  })
  
  return factory
}

export default MockFactory