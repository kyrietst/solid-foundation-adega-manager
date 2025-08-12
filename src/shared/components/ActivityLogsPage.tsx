import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';

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

export default function ActivityLogsPage() {
  const [search, setSearch] = useState('');
  const [role, setRole] = useState<string | 'all'>('all');
  const [limit, setLimit] = useState(50);

  const { data, isLoading, error } = useQuery({
    queryKey: ['activity-logs', { search, role, limit }],
    queryFn: async (): Promise<ActivityLogRow[]> => {
      let query = supabase
        .from('activity_logs')
        .select('id, actor, role, action, entity, entity_id, details, created_at')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (role !== 'all') query = query.eq('role', role);
      if (search) query = query.ilike('details', `%${search}%`).ilike('action', `%${search}%`);

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as ActivityLogRow[];
    },
    staleTime: 60_000,
  });

  const rows = data || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Atividades do Sistema</h1>
        <p className="text-sm text-gray-400">Auditoria de ações de usuários (admins, vendedores, delivery).</p>
      </div>

      <Card className="border-white/10 bg-black/40 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-gray-200 text-base">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-6">
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por ação ou detalhes" className="w-full bg-black/40 border border-white/10 rounded-md px-3 py-2 text-sm text-gray-200" />
            </div>
            <div className="md:col-span-3">
              <select value={role} onChange={(e) => setRole(e.target.value as any)} className="w-full bg-black/40 border border-white/10 rounded-md px-3 py-2 text-sm text-gray-200">
                <option value="all">Todos os perfis</option>
                <option value="admin">Admin</option>
                <option value="employee">Vendedor</option>
                <option value="delivery">Delivery</option>
              </select>
            </div>
            <div className="md:col-span-3">
              <select value={limit} onChange={(e) => setLimit(Number(e.target.value))} className="w-full bg-black/40 border border-white/10 rounded-md px-3 py-2 text-sm text-gray-200">
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-white/10 bg-black/40 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-gray-200 text-base">Resultados</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="text-red-400 text-sm">Erro ao carregar logs</div>
          )}
          {isLoading ? (
            <div className="text-gray-400 text-sm">Carregando...</div>
          ) : rows.length === 0 ? (
            <div className="text-gray-400 text-sm">Nenhuma atividade encontrada.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="text-gray-400">
                  <tr>
                    <th className="text-left py-2 pr-4">Quando</th>
                    <th className="text-left py-2 pr-4">Usuário</th>
                    <th className="text-left py-2 pr-4">Perfil</th>
                    <th className="text-left py-2 pr-4">Ação</th>
                    <th className="text-left py-2 pr-4">Entidade</th>
                    <th className="text-left py-2 pr-4">Detalhes</th>
                  </tr>
                </thead>
                <tbody className="text-gray-200">
                  {rows.map((r) => (
                    <tr key={r.id} className="border-t border-white/5">
                      <td className="py-2 pr-4 whitespace-nowrap">{new Date(r.created_at).toLocaleString('pt-BR')}</td>
                      <td className="py-2 pr-4">{r.actor || '—'}</td>
                      <td className="py-2 pr-4">{r.role || '—'}</td>
                      <td className="py-2 pr-4">{r.action}</td>
                      <td className="py-2 pr-4">{r.entity}{r.entity_id ? ` #${r.entity_id}` : ''}</td>
                      <td className="py-2 pr-4 max-w-[420px] truncate" title={r.details || ''}>{r.details || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}



