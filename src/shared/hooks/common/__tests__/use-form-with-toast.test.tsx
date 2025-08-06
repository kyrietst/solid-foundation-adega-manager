import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useFormWithToast } from '../use-form-with-toast';
import { z } from 'zod';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createTestQueryClient } from '@/__tests__/utils/test-utils';
import React from 'react';

// Test schema
const testSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
});

type TestFormData = z.infer<typeof testSchema>;

// Wrapper for React Query
const createWrapper = (queryClient: QueryClient) => {
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useFormWithToast', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize form with default values', () => {
    const { result } = renderHook(
      () => useFormWithToast({
        schema: testSchema,
        defaultValues: { name: '', email: '' }
      }),
      { wrapper: createWrapper(createTestQueryClient()) }
    );

    expect(result.current.getValues()).toEqual({ name: '', email: '' });
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.handleSubmit).toBeDefined();
    expect(result.current.handleSubmitWithCallback).toBeDefined();
  });

  it('should have proper form methods available', () => {
    const { result } = renderHook(
      () => useFormWithToast({
        schema: testSchema,
        defaultValues: { name: 'Test User', email: 'test@example.com' }
      }),
      { wrapper: createWrapper(createTestQueryClient()) }
    );

    // Verify form methods are available
    expect(typeof result.current.setValue).toBe('function');
    expect(typeof result.current.getValues).toBe('function');
    expect(typeof result.current.trigger).toBe('function');
    expect(typeof result.current.handleSubmit).toBe('function');
    expect(typeof result.current.handleSubmitWithCallback).toBe('function');
  });
});