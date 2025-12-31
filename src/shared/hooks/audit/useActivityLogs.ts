import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';
import { Database } from '@/core/types/database.types';

export interface ActivityLogRow {
    id: string;
    actor: string | null;
    role: string | null;
    action: string;
    entity: string | null;
    entity_id: string | null;
    details: string | null;
    created_at: string;
}

interface UseActivityLogsParams {
    search: string;
    role: string;
    entity: string;
    limit: number;
    sortField: 'created_at' | 'actor' | 'role' | 'action' | 'entity' | null;
    sortDirection: 'asc' | 'desc';
}

export function useActivityLogs(params: UseActivityLogsParams) {
    return useQuery({
        queryKey: ['activity-logs', params],
        queryFn: async (): Promise<ActivityLogRow[]> => {
            let query = supabase
                .from('activity_logs')
                .select('id, actor, role, action, entity, entity_id, details, created_at')
                .limit(params.limit);

            if (params.role !== 'all') query = query.eq('role', params.role as Database['public']['Enums']['user_role']);
            if (params.entity !== 'all') query = query.eq('entity', params.entity);
            if (params.search) {
                query = query.or(`details.ilike.%${params.search}%,action.ilike.%${params.search}%,actor.ilike.%${params.search}%`);
            }

            if (params.sortField) {
                query = query.order(params.sortField, { ascending: params.sortDirection === 'asc' });
            }

            const { data, error } = await query;
            if (error) throw error;
            return (data || []) as ActivityLogRow[];
        },
        staleTime: 60_000,
    });
}
