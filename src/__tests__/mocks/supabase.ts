import { vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';
import { testDB } from './supabase-test-db';

// Create Supabase mock that uses the test database
export const createMockSupabaseClient = (): Partial<SupabaseClient<Database>> => {
  return {
    from: (table: string) => testDB.from(table),
    auth: testDB.auth,
    rpc: (functionName: string, params?: any) => testDB.rpc(functionName, params),
  };
};

// Global mock instance
export const mockSupabase = createMockSupabaseClient();

// Mock the Supabase client module
vi.mock('@/core/api/supabase/client', () => ({
  supabase: mockSupabase,
}));