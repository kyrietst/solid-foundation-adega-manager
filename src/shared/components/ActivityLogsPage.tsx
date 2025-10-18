import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/primitives/table';
import { Badge } from '@/shared/ui/primitives/badge';
import { Button } from '@/shared/ui/primitives/button';
import { SearchBar21st } from '@/shared/ui/thirdparty/search-bar-21st';
import { LoadingSpinner } from '@/shared/ui/composite/loading-spinner';
import { Clock, User, Shield, Activity, Database, FileText, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';
import { cn } from '@/core/config/utils';

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

// Badge para perfil do usuário
const RoleBadge = ({ role }: { role: string | null }) => {
  if (!role) return <span className="text-gray-200">—</span>;

  const roleColors = {
    admin: "bg-accent-red/20 text-accent-red border-accent-red/30",
    employee: "bg-accent-blue/20 text-accent-blue border-accent-blue/30",
    delivery: "bg-accent-green/20 text-accent-green border-accent-green/30",
    system: "bg-accent-purple/20 text-accent-purple border-accent-purple/30"
  };

  const roleName = {
    admin: "Admin",
    employee: "Vendedor",
    delivery: "Delivery",
    system: "Sistema"
  };

  const colorClass = roleColors[role as keyof typeof roleColors] || "bg-gray-500/20 text-gray-200 border-gray-500/30";
  const displayName = roleName[role as keyof typeof roleName] || role;

  return (
    <Badge className={cn("text-xs", colorClass)}>
      {displayName}
    </Badge>
  );
};

// Badge para tipo de ação
const ActionBadge = ({ action }: { action: string }) => {
  const actionColors = {
    login: "bg-accent-green/20 text-accent-green border-accent-green/30",
    create: "bg-accent-blue/20 text-accent-blue border-accent-blue/30",
    update: "bg-accent-gold-100/20 text-accent-gold-100 border-accent-gold-100/30",
    delete: "bg-accent-red/20 text-accent-red border-accent-red/30",
    system: "bg-accent-purple/20 text-accent-purple border-accent-purple/30"
  };

  let colorClass = "bg-gray-500/20 text-gray-200 border-gray-500/30";
  if (action.includes('login')) colorClass = actionColors.login;
  else if (action.includes('create')) colorClass = actionColors.create;
  else if (action.includes('update')) colorClass = actionColors.update;
  else if (action.includes('delete')) colorClass = actionColors.delete;
  else if (action.includes('system')) colorClass = actionColors.system;

  return (
    <Badge className={cn("text-xs font-mono", colorClass)}>
      {action}
    </Badge>
  );
};

// Badge para entidade
const EntityBadge = ({ entity, entityId }: { entity: string | null; entityId: string | null }) => {
  if (!entity) return <span className="text-gray-200">—</span>;

  const entityColors = {
    sales: "bg-accent-green/10 text-accent-green border-accent-green/30",
    products: "bg-accent-blue/10 text-accent-blue border-accent-blue/30",
    customers: "bg-accent-purple/10 text-accent-purple border-accent-purple/30",
    auth: "bg-accent-orange/10 text-accent-orange border-accent-orange/30",
    system: "bg-gray-500/10 text-gray-200 border-gray-500/30"
  };

  const colorClass = entityColors[entity as keyof typeof entityColors] || "bg-gray-500/10 text-gray-200 border-gray-500/30";

  return (
    <div className="flex items-center gap-1">
      <Badge variant="outline" className={cn("text-xs", colorClass)}>
        {entity}
      </Badge>
      {entityId && <span className="text-xs text-gray-300 font-mono">#{entityId.slice(-8)}</span>}
    </div>
  );
};

type SortField = 'created_at' | 'actor' | 'role' | 'action' | 'entity' | null;
type SortDirection = 'asc' | 'desc';

export default function ActivityLogsPage() {
  const [search, setSearch] = useState('');
  const [role, setRole] = useState<string | 'all'>('all');
  const [entity, setEntity] = useState<string | 'all'>('all');
  const [limit, setLimit] = useState(50);
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const { data, isLoading, error } = useQuery({
    queryKey: ['activity-logs', { search, role, entity, limit, sortField, sortDirection }],
    queryFn: async (): Promise<ActivityLogRow[]> => {
      let query = supabase
        .from('activity_logs')
        .select('id, actor, role, action, entity, entity_id, details, created_at')
        .limit(limit);

      if (role !== 'all') query = query.eq('role', role);
      if (entity !== 'all') query = query.eq('entity', entity);
      if (search) {
        query = query.or(`details.ilike.%${search}%,action.ilike.%${search}%,actor.ilike.%${search}%`);
      }
      
      if (sortField) {
        query = query.order(sortField, { ascending: sortDirection === 'asc' });
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as ActivityLogRow[];
    },
    staleTime: 60_000,
  });

  const rows = data || [];
  
  const uniqueEntities = ['all', ...new Set(rows.map(r => r.entity).filter(Boolean))];

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="w-4 h-4" />;
    return sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />;
  };

  if (isLoading) {
    return (
      <div className="container my-6 space-y-4 p-4 border border-border rounded-lg bg-background shadow-sm">
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner size="lg" text="Carregando atividades..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container my-6 space-y-4 p-4 border border-border rounded-lg bg-background shadow-sm">
        <div className="flex items-center justify-center py-8">
          <div className="text-center text-accent-red">
            <Activity className="w-8 h-8 mx-auto mb-2" />
            <p>Erro ao carregar atividades</p>
            <p className="text-sm text-gray-200 mt-1">{error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container my-6 space-y-4 p-4 border border-border rounded-lg bg-background shadow-sm">
      <div>
        <h1 className="text-2xl font-semibold text-white flex items-center gap-2">
          <Activity className="w-6 h-6" />
          Atividades do Sistema
        </h1>
        <p className="text-sm text-gray-200">Auditoria completa de ações de usuários e sistema.</p>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-2 flex-wrap items-center">
          <div className="w-64 md:w-80">
            <SearchBar21st
              placeholder="Buscar atividades..."
              value={search}
              onChange={(val) => setSearch(val)}
              debounceMs={150}
              disableResizeAnimation
              showOnFocus
            />
          </div>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="px-3 py-2 border border-border rounded-md bg-background text-sm"
          >
            <option value="all">Todos os perfis</option>
            <option value="admin">Admin</option>
            <option value="employee">Vendedor</option>
            <option value="delivery">Delivery</option>
            <option value="system">Sistema</option>
          </select>
          <select
            value={entity}
            onChange={(e) => setEntity(e.target.value)}
            className="px-3 py-2 border border-border rounded-md bg-background text-sm"
          >
            <option value="all">Todas as entidades</option>
            {uniqueEntities.slice(1).map((ent) => (
              <option key={ent} value={ent}>
                {ent}
              </option>
            ))}
          </select>
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="px-3 py-2 border border-border rounded-md bg-background text-sm"
          >
            <option value={25}>25 registros</option>
            <option value={50}>50 registros</option>
            <option value={100}>100 registros</option>
            <option value={200}>200 registros</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-200">
            {rows.length} atividade{rows.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Tabela */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[160px]">
                <Button
                  variant="ghost"
                  onClick={() => handleSort('created_at')}
                  className="flex items-center gap-2 p-0 hover:bg-transparent text-gray-200 hover:text-white"
                >
                  <Clock className="w-4 h-4" />
                  Quando
                  {getSortIcon('created_at')}
                </Button>
              </TableHead>
              <TableHead className="w-[180px]">
                <Button
                  variant="ghost"
                  onClick={() => handleSort('actor')}
                  className="flex items-center gap-2 p-0 hover:bg-transparent text-gray-200 hover:text-white"
                >
                  <User className="w-4 h-4" />
                  Usuário
                  {getSortIcon('actor')}
                </Button>
              </TableHead>
              <TableHead className="w-[120px]">
                <Button
                  variant="ghost"
                  onClick={() => handleSort('role')}
                  className="flex items-center gap-2 p-0 hover:bg-transparent text-gray-200 hover:text-white"
                >
                  <Shield className="w-4 h-4" />
                  Perfil
                  {getSortIcon('role')}
                </Button>
              </TableHead>
              <TableHead className="w-[140px]">
                <Button
                  variant="ghost"
                  onClick={() => handleSort('action')}
                  className="flex items-center gap-2 p-0 hover:bg-transparent text-gray-200 hover:text-white"
                >
                  <Activity className="w-4 h-4" />
                  Ação
                  {getSortIcon('action')}
                </Button>
              </TableHead>
              <TableHead className="w-[140px]">
                <Button
                  variant="ghost"
                  onClick={() => handleSort('entity')}
                  className="flex items-center gap-2 p-0 hover:bg-transparent text-gray-200 hover:text-white"
                >
                  <Database className="w-4 h-4" />
                  Entidade
                  {getSortIcon('entity')}
                </Button>
              </TableHead>
              <TableHead>
                <div className="flex items-center gap-2 text-gray-200">
                  <FileText className="w-4 h-4" />
                  Detalhes
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length ? (
              rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-mono text-xs whitespace-nowrap text-gray-200">
                    {new Date(row.created_at).toLocaleString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-xs font-semibold text-primary">
                          {(row.actor || 'S').charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="text-sm text-white">{row.actor || 'Sistema'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <RoleBadge role={row.role} />
                  </TableCell>
                  <TableCell>
                    <ActionBadge action={row.action} />
                  </TableCell>
                  <TableCell>
                    <EntityBadge entity={row.entity} entityId={row.entity_id} />
                  </TableCell>
                  <TableCell className="max-w-[300px] text-gray-200">
                    <div className="truncate" title={row.details || ''}>
                      {row.details || '—'}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2">
                    <Activity className="w-8 h-8 text-gray-200" />
                    <p className="text-gray-200">Nenhuma atividade encontrada.</p>
                    {(search || role !== 'all' || entity !== 'all') && (
                      <p className="text-sm text-gray-300">
                        Tente ajustar os filtros de busca.
                      </p>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}



