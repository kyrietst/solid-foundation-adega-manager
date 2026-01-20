import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { Badge } from '@/shared/ui/primitives/badge';
import { Button } from '@/shared/ui/primitives/button';
import { SearchBar21st } from '@/shared/ui/thirdparty/search-bar-21st';
import { LoadingSpinner } from '@/shared/ui/composite/loading-spinner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/shared/ui/primitives/dialog';
import { Clock, User, Shield, Activity, Database, FileText, ArrowUpDown, ArrowUp, ArrowDown, Eye, X, Copy, Check, Download, Filter } from 'lucide-react';
import { cn } from '@/core/config/utils';
import { useActivityLogs, ActivityLogRow } from '@/shared/hooks/audit/useActivityLogs';
import { PremiumBackground } from '@/shared/ui/composite/PremiumBackground';

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

  return (
    <>
      {/* Background Fixed Layer */}
      <PremiumBackground className="fixed inset-0 z-0 pointer-events-none" />

      {/* Main Content Layer */}
      <div className="relative z-10 flex flex-col h-screen overflow-hidden bg-transparent">
        
        {/* Tactical Stitch Header */}
        <header className="flex-none px-8 py-6 pt-8 pb-6 z-10 w-full">
          <div className="flex flex-wrap justify-between items-end gap-4 mb-6">
             <div className="flex flex-col gap-1">
               <p className="text-zinc-500 text-sm font-medium tracking-widest uppercase">Segurança e Auditoria</p>
               <h2 className="text-white text-3xl md:text-4xl font-bold leading-tight tracking-tight">LOGS DO SISTEMA</h2>
             </div>
             <div className="flex gap-3">
               <Button 
                variant="outline"
                className="flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-zinc-900/50 backdrop-blur-md border border-zinc-700 text-white text-sm font-semibold hover:border-primary hover:text-primary transition-colors"
               >
                <Download className="w-[18px] h-[18px]" />
                <span className="hidden sm:inline">Exportar Logs</span>
               </Button>
               
               <div className="px-4 py-2 bg-zinc-900/50 backdrop-blur-md border border-zinc-700 rounded-xl text-xs font-mono text-zinc-400 flex items-center gap-2">
                 <Shield className="w-3 h-3 text-emerald-500" />
                 Auditoria Ativa
               </div>
             </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto px-8 pb-8 custom-scrollbar flex flex-col gap-6">
            
            {/* Filters Bar - Tactical Glass Style */}
            <div className="shrink-0 p-4 border border-white/10 rounded-xl bg-black/40 backdrop-blur-xl flex flex-wrap gap-4 items-center justify-between">
              <div className="flex gap-3 flex-wrap items-center flex-1">
                <div className="w-full md:w-80">
                  <SearchBar21st
                    placeholder="Buscar por usuário, ação ou detalhes..."
                    value={search}
                    onChange={(val) => setSearch(val)}
                    debounceMs={300}
                    disableResizeAnimation
                    className="bg-black/50 border-white/10 text-white placeholder:text-zinc-600 focus:border-primary/50 focus:ring-primary/20 h-10 rounded-lg"
                  />
                </div>
                
                <div className="h-8 w-px bg-white/10 mx-2 hidden md:block" />
                
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-zinc-500" />
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="h-10 px-3 border border-white/10 rounded-lg bg-black/50 text-zinc-300 text-sm focus:outline-none focus:border-primary/50 hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      <option value="all">Todos os perfis</option>
                      <option value="admin">Admin</option>
                      <option value="employee">Vendedor</option>
                      <option value="delivery">Delivery</option>
                      <option value="system">Sistema</option>
                    </select>
                </div>

                <div className="flex items-center gap-2">
                    <select
                      value={entity}
                      onChange={(e) => setEntity(e.target.value)}
                      className="h-10 px-3 border border-white/10 rounded-lg bg-black/50 text-zinc-300 text-sm focus:outline-none focus:border-primary/50 hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      <option value="all">Todas as entidades</option>
                      {uniqueEntities.slice(1).map((ent) => (
                        <option key={ent} value={ent}>
                          {ent}
                        </option>
                      ))}
                    </select>
                </div>

                <div className="ml-auto">
                    <select
                      value={limit}
                      onChange={(e) => setLimit(Number(e.target.value))}
                      className="h-10 px-3 border border-white/10 rounded-lg bg-black/50 text-zinc-400 text-xs focus:outline-none focus:border-primary/50 hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      <option value={25}>25 reg.</option>
                      <option value={50}>50 reg.</option>
                      <option value={100}>100 reg.</option>
                      <option value={200}>200 reg.</option>
                    </select>
                </div>
              </div>
            </div>

            {/* Table Container - Tactical Glass Style */}
            <div className="flex-1 min-h-[400px] relative flex flex-col">
              {isLoading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm rounded-xl border border-white/5">
                  <LoadingSpinner text="Carregando logs de atividade..." />
                </div>
              ) : error ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-rose-400 gap-2 bg-rose-950/10 rounded-xl border border-rose-900/30">
                  <Activity className="w-10 h-10 opacity-50" />
                  <p className="font-medium">Falha na conexão com log server</p>
                  <span className="text-xs opacity-70 bg-rose-950/30 px-3 py-1 rounded-full">{error.message}</span>
                </div>
              ) : (
                <div className="w-full flex-1 overflow-hidden rounded-xl border border-white/10 bg-black/40 backdrop-blur-xl shadow-xl flex flex-col">
                  <div className="flex-1 overflow-auto custom-scrollbar">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs uppercase bg-black/80 text-zinc-500 font-bold border-b border-white/10 sticky top-0 z-10 backdrop-blur-md">
                        <tr>
                          <th className="px-6 py-4 cursor-pointer hover:text-primary transition-colors group select-none" onClick={() => handleSort('created_at')}>
                            <div className="flex items-center gap-2">
                              DATA/HORA {getSortIcon('created_at')}
                            </div>
                          </th>
                          <th className="px-6 py-4 cursor-pointer hover:text-primary transition-colors group select-none" onClick={() => handleSort('actor')}>
                            <div className="flex items-center gap-2">
                              USUÁRIO {getSortIcon('actor')}
                            </div>
                          </th>
                          <th className="px-6 py-4 cursor-pointer hover:text-primary transition-colors group select-none" onClick={() => handleSort('role')}>
                            <div className="flex items-center gap-2">
                              PERFIL {getSortIcon('role')}
                            </div>
                          </th>
                          <th className="px-6 py-4 cursor-pointer hover:text-primary transition-colors group select-none" onClick={() => handleSort('action')}>
                            <div className="flex items-center gap-2">
                              AÇÃO {getSortIcon('action')}
                            </div>
                          </th>
                          <th className="px-6 py-4 cursor-pointer hover:text-primary transition-colors group select-none" onClick={() => handleSort('entity')}>
                            <div className="flex items-center gap-2">
                              ALVO {getSortIcon('entity')}
                            </div>
                          </th>
                          <th className="px-6 py-4 text-zinc-500">
                            RESUMO
                          </th>
                          <th className="px-6 py-4 text-center"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {rows.length ? (
                          rows.map((row) => (
                            <tr
                              key={row.id}
                              className="hover:bg-white/5 transition-colors duration-200 group"
                            >
                              <td className="px-6 py-4 font-mono text-xs whitespace-nowrap text-zinc-400 group-hover:text-primary transition-colors">
                                {new Date(row.created_at).toLocaleString('pt-BR', {
                                  day: '2-digit', month: '2-digit', year: '2-digit',
                                  hour: '2-digit', minute: '2-digit'
                                })}
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center border border-white/5 shadow-inner">
                                    <span className="text-xs font-bold text-zinc-300">
                                      {(row.actor || 'S').charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                  <div className="flex flex-col">
                                     <span className="text-sm text-zinc-200 font-medium">{row.actor || 'Sistema'}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <RoleBadge role={row.role} />
                              </td>
                              <td className="px-6 py-4">
                                <ActionBadge action={row.action} />
                              </td>
                              <td className="px-6 py-4">
                                <EntityBadge entity={row.entity} entityId={row.entity_id} />
                              </td>
                              <td className="px-6 py-4 text-zinc-400 text-sm max-w-[300px]">
                                <div className="truncate group-hover:text-zinc-300 transition-colors" title={row.details || ''}>
                                  {row.details || '—'}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleViewDetails(row)}
                                  className="h-8 w-8 hover:bg-primary/20 hover:text-primary transition-all rounded-full opacity-0 group-hover:opacity-100"
                                  title="Ver Auditoria"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={7} className="text-center py-20">
                              <div className="flex flex-col items-center gap-4 opacity-50">
                                <Activity className="w-12 h-12 text-zinc-600" />
                                <div className="text-center">
                                    <p className="text-zinc-400 font-medium text-lg">Nenhum registro encontrado</p>
                                    <p className="text-zinc-600 text-sm">Ajuste os filtros para ver mais resultados</p>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  {/* Footer Stats / Info */}
                  <div className="px-6 py-3 border-t border-white/5 bg-black/40 flex justify-between items-center text-xs text-zinc-500">
                     <span>Mostrando {rows.length} registros (limite: {limit})</span>
                     <div className="flex items-center gap-2">
                       <Clock className="w-3 h-3" />
                       Atualizado em tempo real
                     </div>
                  </div>
                </div>
              )}
            </div>
        </main>
      </div>

      {/* Modal de Detalhes do Log - Premium Style */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden bg-zinc-950 border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.8)] p-0 gap-0">
          <DialogHeader className="p-8 border-b border-white/5 bg-zinc-900/50 backdrop-blur-xl sticky top-0 md:rounded-t-xl">
            <DialogTitle className="flex items-center gap-4 text-2xl font-bold text-white">
              <div className="p-3 bg-primary/10 rounded-xl border border-primary/20 shadow-[0_0_15px_rgba(244,202,37,0.1)]">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              Detalhes da Atividade
            </DialogTitle>
            <DialogDescription className="text-zinc-500 ml-[calc(3rem+1rem)] text-base">
              Rastreamento completo do evento #{selectedLog?.id.slice(0,8)}
            </DialogDescription>
          </DialogHeader>

          {selectedLog && (
            <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar flex-1 bg-black/40">
              
              {/* Contexto Principal */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-zinc-900/50 rounded-xl border border-white/5 space-y-2 group hover:border-white/10 transition-colors">
                  <div className="flex items-center gap-2 text-zinc-500 mb-1">
                      <User className="h-4 w-4" />
                      <span className="text-xs uppercase tracking-wider font-bold">Agente</span>
                  </div>
                  <div className="flex items-center justify-between">
                     <p className="text-white font-medium text-lg">{selectedLog.actor || 'Sistema'}</p>
                     <RoleBadge role={selectedLog.role} />
                  </div>
                </div>

                <div className="p-4 bg-zinc-900/50 rounded-xl border border-white/5 space-y-2 group hover:border-white/10 transition-colors">
                  <div className="flex items-center gap-2 text-zinc-500 mb-1">
                      <Activity className="h-4 w-4" />
                      <span className="text-xs uppercase tracking-wider font-bold">Ação</span>
                  </div>
                  <div className="flex items-center justify-between">
                     <p className="text-white font-medium text-lg capitalize">{selectedLog.action}</p>
                     <ActionBadge action={selectedLog.action} />
                  </div>
                </div>

                <div className="col-span-2 p-4 bg-zinc-900/50 rounded-xl border border-white/5 space-y-2 group hover:border-white/10 transition-colors">
                  <div className="flex items-center gap-2 text-zinc-500 mb-1">
                      <Clock className="h-4 w-4" />
                      <span className="text-xs uppercase tracking-wider font-bold">Timestamp</span>
                  </div>
                  <p className="text-zinc-300 font-mono text-sm pt-1">
                    {new Date(selectedLog.created_at).toLocaleString('pt-BR', {
                      weekday: 'long',
                      day: '2-digit', month: 'long', year: 'numeric',
                      hour: '2-digit', minute: '2-digit', second: '2-digit',
                      timeZoneName: 'short'
                    })}
                  </p>
                </div>
              </div>

              {/* Payload Técnico */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                     <Database className="h-3 w-3" /> Payload JSON
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyJson}
                    className="h-8 text-xs text-primary hover:text-primary/80 hover:bg-primary/10 rounded-lg gap-2"
                  >
                    {copied ? (
                      <> <Check className="h-3 w-3" /> Copiado </>
                    ) : (
                      <> <Copy className="h-3 w-3" /> Copiar </>
                    )}
                  </Button>
                </div>
                
                <div className="relative group rounded-xl overflow-hidden border border-white/10 bg-black shadow-inner">
                   <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 to-transparent opacity-50" />
                   <pre className="p-6 text-xs text-blue-300 overflow-auto max-h-[300px] font-mono custom-scrollbar leading-relaxed">
                     {JSON.stringify(selectedLog, null, 2)}
                   </pre>
                </div>
              </div>

            </div>
          )}
          
          <div className="p-6 border-t border-white/5 bg-zinc-900/80 backdrop-blur-xl flex justify-end">
              <Button onClick={() => setIsDetailModalOpen(false)} className="bg-white text-black hover:bg-zinc-200 font-bold rounded-lg px-8">
                  Fechar
              </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

