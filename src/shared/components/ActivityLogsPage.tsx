import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
// Table primitives removed as we use raw HTML based on MovementsTable
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/primitives/table';
import { Badge } from '@/shared/ui/primitives/badge';
import { PageHeader } from '@/shared/ui/composite/PageHeader';
import { Button } from '@/shared/ui/primitives/button';
import { SearchBar21st } from '@/shared/ui/thirdparty/search-bar-21st';
import { LoadingSpinner } from '@/shared/ui/composite/loading-spinner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/shared/ui/primitives/dialog';
import { Clock, User, Shield, Activity, Database, FileText, ArrowUpDown, ArrowUp, ArrowDown, Eye, X, Copy, Check } from 'lucide-react';
// import { useQuery } from '@tanstack/react-query'; // Removed
// import { supabase } from '@/core/api/supabase/client'; // Removed
import { cn } from '@/core/config/utils';
import { useActivityLogs, ActivityLogRow } from '@/shared/hooks/audit/useActivityLogs'; // Imported


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

  // Estado para modal de detalhes
  const [selectedLog, setSelectedLog] = useState<ActivityLogRow | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleViewDetails = (log: ActivityLogRow) => {
    setSelectedLog(log);
    setIsDetailModalOpen(true);
  };

  const handleCopyJson = () => {
    if (selectedLog) {
      navigator.clipboard.writeText(JSON.stringify(selectedLog, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const { data, isLoading, error } = useActivityLogs({
    search,
    role,
    entity,
    limit,
    sortField,
    sortDirection
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

  // Mouse tracking for glow effect
  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    e.currentTarget.style.setProperty("--x", `${x}% `);
    e.currentTarget.style.setProperty("--y", `${y}% `);
  };

  return (
    <div className="w-full h-full flex flex-col p-4 min-h-0">
      <PageHeader
        title="LOGS DO SISTEMA"
        count={rows.length}
        countLabel="atividades"
      >
        <div className="flex items-center gap-2">
          {/* Adicionar exportação ou outros botões aqui se necessário */}
        </div>
      </PageHeader>

      {/* Container principal com altura controlada e scroll - GLOW EFFECT & GLASS */}
      <section
        className="flex-1 min-h-0 flex flex-col bg-black/80 backdrop-blur-sm border border-white/10 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 relative overflow-hidden group"
        onMouseMove={handleMouseMove}
      >
        {/* Glow effect removed */}

        {/* Filtros em uma barra superior dentro do card */}
        <div className="p-4 border-b border-white/10 flex flex-wrap gap-4 items-center justify-between relative z-10 bg-black/20">
          <div className="flex gap-2 flex-wrap items-center flex-1">
            <div className="w-64 md:w-80">
              <SearchBar21st
                placeholder="Buscar atividades..."
                value={search}
                onChange={(val) => setSearch(val)}
                debounceMs={150}
                disableResizeAnimation
                className="bg-black/50 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500/50 focus:ring-purple-500/20"
              />
            </div>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="px-3 py-2 border border-white/10 rounded-md bg-black/50 text-gray-200 text-sm focus:outline-none focus:border-purple-500/50 hover:bg-white/5 transition-colors"
              style={{ colorScheme: 'dark' }}
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
              className="px-3 py-2 border border-white/10 rounded-md bg-black/50 text-gray-200 text-sm focus:outline-none focus:border-purple-500/50 hover:bg-white/5 transition-colors"
              style={{ colorScheme: 'dark' }}
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
              className="px-3 py-2 border border-white/10 rounded-md bg-black/50 text-gray-200 text-sm focus:outline-none focus:border-purple-500/50 hover:bg-white/5 transition-colors"
              style={{ colorScheme: 'dark' }}
            >
              <option value={25}>25 linhas</option>
              <option value={50}>50 linhas</option>
              <option value={100}>100 linhas</option>
              <option value={200}>200 linhas</option>
            </select>
          </div>
        </div>

        {/* Container da Tabela com Scroll - Estilo MovementsTable */}
        <div className="relative z-10 flex-1 min-h-0 overflow-auto p-4">
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <LoadingSpinner text="Carregando logs..." />
            </div>
          ) : error ? (
            <div className="h-full flex flex-col items-center justify-center text-red-400 gap-2">
              <Activity className="w-10 h-10 opacity-50" />
              <p>Erro ao carregar dados</p>
              <span className="text-xs opacity-70">{error.message}</span>
            </div>
          ) : (
            <div className="w-full overflow-hidden rounded-lg border border-white/10 bg-black/40 backdrop-blur-md">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs uppercase bg-black/60 text-gray-400 border-b border-white/10 sticky top-0 z-10">
                    <tr>
                      <th
                        className="px-4 py-3 font-semibold cursor-pointer hover:text-primary-yellow transition-colors group"
                        onClick={() => handleSort('created_at')}
                      >
                        <div className="flex items-center gap-1">
                          DATA/HORA
                          {getSortIcon('created_at')}
                        </div>
                      </th>
                      <th
                        className="px-4 py-3 font-semibold cursor-pointer hover:text-primary-yellow transition-colors group"
                        onClick={() => handleSort('actor')}
                      >
                        <div className="flex items-center gap-1">
                          USUÁRIO
                          {getSortIcon('actor')}
                        </div>
                      </th>
                      <th
                        className="px-4 py-3 font-semibold cursor-pointer hover:text-primary-yellow transition-colors group"
                        onClick={() => handleSort('role')}
                      >
                        <div className="flex items-center gap-1">
                          PERFIL
                          {getSortIcon('role')}
                        </div>
                      </th>
                      <th
                        className="px-4 py-3 font-semibold cursor-pointer hover:text-primary-yellow transition-colors group"
                        onClick={() => handleSort('action')}
                      >
                        <div className="flex items-center gap-1">
                          AÇÃO
                          {getSortIcon('action')}
                        </div>
                      </th>
                      <th
                        className="px-4 py-3 font-semibold cursor-pointer hover:text-primary-yellow transition-colors group"
                        onClick={() => handleSort('entity')}
                      >
                        <div className="flex items-center gap-1">
                          ENTIDADE
                          {getSortIcon('entity')}
                        </div>
                      </th>
                      <th className="px-4 py-3 font-semibold text-gray-400">
                        DETALHES
                      </th>
                      <th className="px-4 py-3 font-semibold text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {rows.length ? (
                      rows.map((row) => (
                        <tr
                          key={row.id}
                          className="hover:bg-white/5 transition-colors duration-200 group"
                        >
                          <td className="px-4 py-3 font-mono text-xs whitespace-nowrap text-gray-400 group-hover:text-primary-yellow transition-colors">
                            {new Date(row.created_at).toLocaleString('pt-BR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                          <td className="px-4 py-3 text-gray-300">
                            <div className="flex items-center gap-3">
                              <div className="w-7 h-7 bg-white/5 rounded-full flex items-center justify-center border border-white/10 group-hover:border-white/20">
                                <span className="text-xs font-bold text-gray-300">
                                  {(row.actor || 'S').charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <span className="text-sm text-gray-300 font-medium group-hover:text-white transition-colors">
                                {row.actor || 'Sistema'}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <RoleBadge role={row.role} />
                          </td>
                          <td className="px-4 py-3">
                            <ActionBadge action={row.action} />
                          </td>
                          <td className="px-4 py-3">
                            <EntityBadge entity={row.entity} entityId={row.entity_id} />
                          </td>
                          <td className="px-4 py-3 text-gray-400 text-sm max-w-[300px]">
                            <div className="truncate group-hover:text-gray-200 transition-colors" title={row.details || ''}>
                              {row.details || '—'}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleViewDetails(row)}
                              className="h-8 w-8 hover:bg-primary-yellow/20 hover:text-primary-yellow transition-all rounded-full"
                              title="Ver detalhes completos"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="text-center py-12">
                          <div className="flex flex-col items-center gap-3">
                            <div className="p-4 bg-white/5 rounded-full">
                              <Activity className="w-8 h-8 text-gray-500" />
                            </div>
                            <p className="text-gray-400 font-medium">Nenhuma atividade encontrada</p>
                            {(search || role !== 'all' || entity !== 'all') && (
                              <p className="text-sm text-gray-500">
                                Tente limpar ou ajustar os filtros de busca
                              </p>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Modal de Detalhes do Log */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden bg-zinc-950/95 backdrop-blur-xl border-purple-500/20 shadow-2xl p-0 gap-0">
          <DialogHeader className="p-6 border-b border-white/10 bg-white/5">
            <DialogTitle className="flex items-center gap-3 text-xl font-bold text-white">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <FileText className="h-5 w-5 text-purple-400" />
              </div>
              Detalhes da Atividade
            </DialogTitle>
            <DialogDescription className="text-gray-400 ml-12">
              Auditoria completa da ação realizada no sistema
            </DialogDescription>
          </DialogHeader>

          {selectedLog && (
            <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(80vh-100px)]">
              {/* Informações resumidas */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-1">
                  <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Usuário</span>
                  <div className="flex items-center gap-2 pt-1">
                    <User className="w-4 h-4 text-gray-400" />
                    <p className="text-white font-medium">{selectedLog.actor || 'Sistema'}</p>
                  </div>
                </div>
                <div className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-1">
                  <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Perfil</span>
                  <div className="pt-1"><RoleBadge role={selectedLog.role} /></div>
                </div>
                <div className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-1">
                  <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Ação</span>
                  <div className="pt-1"><ActionBadge action={selectedLog.action} /></div>
                </div>
                <div className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-1">
                  <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Entidade</span>
                  <div className="pt-1"><EntityBadge entity={selectedLog.entity} entityId={selectedLog.entity_id} /></div>
                </div>
              </div>

              <div className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-1">
                <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Timestamp</span>
                <p className="text-white font-mono text-sm pt-1 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  {new Date(selectedLog.created_at).toLocaleString('pt-BR', {
                    weekday: 'long',
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  })}
                </p>
              </div>

              {/* JSON completo */}
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Payload JSON</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyJson}
                    className="h-7 text-xs text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3 w-3 mr-1.5" />
                        Copiado
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3 mr-1.5" />
                        Copiar Dados
                      </>
                    )}
                  </Button>
                </div>
                <div className="relative group">
                  <pre className="p-4 bg-zinc-950 rounded-xl border border-white/10 text-xs text-blue-300 overflow-auto max-h-[200px] font-mono shadow-inner custom-scrollbar">
                    {JSON.stringify(selectedLog, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

