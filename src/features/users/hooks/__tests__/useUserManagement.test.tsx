import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useUserManagement } from '../useUserManagement';
import { createTestQueryClient } from '@/__tests__/utils/test-utils';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { testDB } from '@/__tests__/mocks/supabase-test-db';
import React from 'react';

// Wrapper for React Query
const createWrapper = (queryClient: QueryClient) => {
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useUserManagement', () => {
  beforeEach(() => {
    testDB.reset();
  });

  it('should fetch users successfully', async () => {
    const { result } = renderHook(
      () => useUserManagement(),
      { wrapper: createWrapper(createTestQueryClient()) }
    );

    // Initially loading
    expect(result.current.isLoading).toBe(true);
    expect(result.current.users).toEqual([]);

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Should have users (real production data)
    expect(result.current.users.length).toBeGreaterThan(0);
    
    // Check that first user has required properties
    const firstUser = result.current.users[0];
    expect(firstUser).toHaveProperty('id');
    expect(firstUser).toHaveProperty('email');
    expect(firstUser).toHaveProperty('role');
    expect(firstUser).toHaveProperty('name');
    
    expect(result.current.error).toBeNull();
  });

  it('should handle refresh users', async () => {
    const { result } = renderHook(
      () => useUserManagement(),
      { wrapper: createWrapper(createTestQueryClient()) }
    );

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Should have refresh function
    expect(typeof result.current.refreshUsers).toBe('function');
    
    // Should be able to call refresh without errors
    await expect(result.current.refreshUsers()).resolves.not.toThrow();
  });

  it('should return user management state interface', async () => {
    const { result } = renderHook(
      () => useUserManagement(),
      { wrapper: createWrapper(createTestQueryClient()) }
    );

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Verify the interface matches UserManagementState
    expect(result.current).toHaveProperty('users');
    expect(result.current).toHaveProperty('isLoading');
    expect(result.current).toHaveProperty('error');
    expect(result.current).toHaveProperty('refreshUsers');

    expect(Array.isArray(result.current.users)).toBe(true);
    expect(typeof result.current.isLoading).toBe('boolean');
    expect(typeof result.current.refreshUsers).toBe('function');
  });

  it('should handle different user roles correctly', async () => {
    const { result } = renderHook(
      () => useUserManagement(),
      { wrapper: createWrapper(createTestQueryClient()) }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const users = result.current.users;
    
    // Should have users with roles (check production data structure)
    expect(users.length).toBeGreaterThan(0);
    
    // Check that users have valid roles
    users.forEach(user => {
      expect(user.role).toMatch(/^(admin|employee|delivery)$/);
      expect(typeof user.email).toBe('string');
      expect(user.email.length).toBeGreaterThan(0);
    });
    
    // Should have at least one admin user
    const adminUser = users.find(u => u.role === 'admin');
    expect(adminUser).toBeDefined();
    expect(adminUser?.email).toContain('@');
  });
});