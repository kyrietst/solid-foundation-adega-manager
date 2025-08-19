/**
 * Componente lista/tabela de usuários
 * Extraído do UserManagement.tsx para separar responsabilidades
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { Button } from '@/shared/ui/primitives/button';
import { Crown, Plus, RefreshCw, Users, FolderTree } from 'lucide-react';
import { cn } from '@/core/config/utils';
import { LoadingScreen } from '@/shared/ui/composite/loading-spinner';
import { UserListProps } from './types';
import { UserRoleBadge } from './UserRoleBadge';
import { UserActions } from './UserActions';
import { useRoleUtilities } from '@/features/users/hooks/useUserPermissions';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from '@/shared/ui/primitives/dropdown-menu';
import { SearchBar21st } from '@/shared/ui/thirdparty/search-bar-21st';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { useToast } from '@/shared/hooks/common/use-toast';

export const UserList: React.FC<UserListProps> = ({
  users,
  onRefresh,
  canManageUsers,
  isLoading = false,
  activeTab = 'users',
  onTabChange,
}) => {
  const { isSupremeAdmin } = useRoleUtilities();
  const { toast } = useToast();
  const ALL_COLUMNS = ['Nome', 'Email', 'Função', 'Criado em', 'Ações'] as const;
  const [visibleColumns, setVisibleColumns] = React.useState<string[]>([...ALL_COLUMNS]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [sortField, setSortField] = React.useState<'name' | 'email' | 'role' | 'created_at' | null>('created_at');
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('desc');
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const dataset = React.useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    let rows = term
      ? users.filter(u =>
          (u.name || '').toLowerCase().includes(term) ||
          (u.email || '').toLowerCase().includes(term) ||
          (u.role || '').toLowerCase().includes(term)
        )
      : users;
    if (sortField) {
      rows = [...rows].sort((a, b) => {
        const av: any = (a as any)[sortField!];
        const bv: any = (b as any)[sortField!];
        if (sortField === 'created_at') {
          const at = new Date(av).getTime();
          const bt = new Date(bv).getTime();
          return sortDirection === 'asc' ? at - bt : bt - at;
        }
        return sortDirection === 'asc'
          ? String(av).localeCompare(String(bv))
          : String(bv).localeCompare(String(av));
      });
    }
    return rows;
  }, [users, searchTerm, sortField, sortDirection]);

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDirection('desc'); }
  };
  const icon = (field: typeof sortField) => sortField !== field ? <ArrowUpDown className="w-4 h-4" /> : (sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />);

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
      toast({
        title: "Lista atualizada",
        description: "A lista de usuários foi atualizada com sucesso.",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Erro ao atualizar",
        description: "Ocorreu um erro ao atualizar a lista de usuários.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  if (isLoading) {
    return <LoadingScreen text="Carregando usuários..." />;
  }

  return (
    <Card 
      className="bg-gray-800/30 border-gray-700/40 backdrop-blur-sm shadow-lg hover:shadow-2xl hover:shadow-purple-500/10 hover:border-purple-400/30 transition-all duration-300 relative overflow-hidden group"
      onMouseMove={(e) => {
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        (e.currentTarget as HTMLElement).style.setProperty("--x", `${x}%`);
        (e.currentTarget as HTMLElement).style.setProperty("--y", `${y}%`);
      }}
    >
      {/* Purple glow effect */}
      <div 
        className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-500/20 via-transparent to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(600px circle at var(--x, 50%) var(--y, 50%), rgba(147, 51, 234, 0.15), transparent 40%)`
        }}
      />
      
      <CardHeader className="space-y-3 pb-2 relative z-10">
        <div className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl font-bold text-white">Lista de Usuários</CardTitle>
          <div className="flex items-center gap-3">
            {/* Abas de navegação na linha dos controles - tamanho reduzido */}
            <div className="flex items-center gap-1 bg-gray-900/95 backdrop-blur-sm rounded-lg p-1.5 border border-white/20 shadow-xl">
              <button
                onClick={() => onTabChange?.('users')}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-300 relative group",
                  activeTab === 'users'
                    ? "bg-gradient-to-r from-[#FFD700]/20 to-[#FFA500]/20 text-[#FFD700] border border-[#FFD700]/40 shadow-md shadow-[#FFD700]/20"
                    : "text-gray-300 hover:text-white hover:bg-white/10 hover:border-white/20 border border-transparent"
                )}
              >
                <Users className={cn("h-3 w-3 transition-all duration-300", 
                  activeTab === 'users' ? "text-[#FFD700]" : "text-gray-400 group-hover:text-white")} />
                <span className="relative z-10">Usuários</span>
                {activeTab === 'users' && (
                  <div className="absolute inset-0 rounded-md bg-gradient-to-r from-[#FFD700]/10 via-[#FFD700]/20 to-[#FFD700]/10 opacity-50 animate-pulse" />
                )}
              </button>
              <button
                onClick={() => onTabChange?.('categories')}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-300 relative group",
                  activeTab === 'categories'
                    ? "bg-gradient-to-r from-[#FFD700]/20 to-[#FFA500]/20 text-[#FFD700] border border-[#FFD700]/40 shadow-md shadow-[#FFD700]/20"
                    : "text-gray-300 hover:text-white hover:bg-white/10 hover:border-white/20 border border-transparent"
                )}
              >
                <FolderTree className={cn("h-3 w-3 transition-all duration-300", 
                  activeTab === 'categories' ? "text-[#FFD700]" : "text-gray-400 group-hover:text-white")} />
                <span className="relative z-10">Categorias</span>
                {activeTab === 'categories' && (
                  <div className="absolute inset-0 rounded-md bg-gradient-to-r from-[#FFD700]/10 via-[#FFD700]/20 to-[#FFD700]/10 opacity-50 animate-pulse" />
                )}
              </button>
            </div>

            {/* Botão Atualizar */}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              disabled={isRefreshing || isLoading}
              className="bg-black/80 border-[#FFD700]/40 text-[#FFD700] hover:bg-[#FFD700]/20 hover:shadow-lg hover:shadow-[#FFD700]/20 hover:border-[#FFD700]/80 hover:scale-105 backdrop-blur-sm transition-all duration-300 relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#FFD700]/5 via-[#FFD700]/10 to-[#FFD700]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <RefreshCw className={`h-4 w-4 mr-2 relative z-10 transition-transform duration-300 ${isRefreshing ? 'animate-spin' : 'group-hover:rotate-180'}`} />
              <span className="relative z-10">{isRefreshing ? 'Atualizando...' : 'Atualizar'}</span>
            </Button>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
          <div className="w-full sm:w-80">
            <SearchBar21st placeholder="Buscar usuários..." value={searchTerm} onChange={setSearchTerm} debounceMs={150} disableResizeAnimation={true} />
          </div>
          <div className="flex items-center gap-2 text-sm text-white/70">
            <span className="font-medium">{dataset.length} de {users.length} usuários</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="bg-black/80 border-white/30 text-white hover:bg-white/20 hover:border-white/50 hover:scale-105 backdrop-blur-sm transition-all duration-300 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 -translate-x-full group-hover:translate-x-full transform" />
                  <span className="relative z-10">Colunas</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-black/95 border-white/20 backdrop-blur-md shadow-2xl w-56">
                {ALL_COLUMNS.map(col => (
                  <DropdownMenuCheckboxItem
                    key={col}
                    checked={visibleColumns.includes(col)}
                    onCheckedChange={() => setVisibleColumns(prev => prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col])}
                    className="text-white hover:bg-white/10 transition-colors duration-200"
                  >
                    {col}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="relative z-10">
        {dataset.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-white/30 mx-auto mb-4" />
            <div className="text-white/60 mb-2 text-lg font-medium">
              Nenhum usuário encontrado
            </div>
            <div className="text-white/40 text-sm">
              {searchTerm ? 'Tente ajustar os filtros de busca' : 'Comece criando o primeiro usuário'}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-white/20">
                  {visibleColumns.includes('Nome') && (
                    <th className="text-left p-4 font-medium text-white">
                      <button 
                        className="inline-flex items-center gap-2 hover:text-[#FFD700] transition-colors duration-200 group" 
                        onClick={() => handleSort('name')}
                      >
                        <span>Nome</span>
                        <div className="group-hover:scale-110 transition-transform duration-200">
                          {icon('name')}
                        </div>
                      </button>
                    </th>
                  )}
                  {visibleColumns.includes('Email') && (
                    <th className="text-left p-4 font-medium text-white">
                      <button 
                        className="inline-flex items-center gap-2 hover:text-[#FFD700] transition-colors duration-200 group" 
                        onClick={() => handleSort('email')}
                      >
                        <span>Email</span>
                        <div className="group-hover:scale-110 transition-transform duration-200">
                          {icon('email')}
                        </div>
                      </button>
                    </th>
                  )}
                  {visibleColumns.includes('Função') && (
                    <th className="text-left p-4 font-medium text-white">
                      <button 
                        className="inline-flex items-center gap-2 hover:text-[#FFD700] transition-colors duration-200 group" 
                        onClick={() => handleSort('role')}
                      >
                        <span>Função</span>
                        <div className="group-hover:scale-110 transition-transform duration-200">
                          {icon('role')}
                        </div>
                      </button>
                    </th>
                  )}
                  {visibleColumns.includes('Criado em') && (
                    <th className="text-left p-4 font-medium text-white">
                      <button 
                        className="inline-flex items-center gap-2 hover:text-[#FFD700] transition-colors duration-200 group" 
                        onClick={() => handleSort('created_at')}
                      >
                        <span>Criado em</span>
                        <div className="group-hover:scale-110 transition-transform duration-200">
                          {icon('created_at')}
                        </div>
                      </button>
                    </th>
                  )}
                  {canManageUsers && visibleColumns.includes('Ações') && (
                    <th className="text-left p-4 font-medium text-white">Ações</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {dataset.map((user) => (
                  <tr 
                    key={user.id} 
                    className="border-b border-white/10 hover:bg-white/5 hover:shadow-md transition-all duration-300 group"
                  >
                    {visibleColumns.includes('Nome') && (
                      <td className="p-4">
                        <div className="flex items-center">
                          <span className="font-medium text-white group-hover:text-[#FFD700] transition-colors duration-200">{user.name}</span>
                          {isSupremeAdmin(user.email) && (
                            <Crown className="h-4 w-4 text-[#FFD700] ml-2 group-hover:animate-pulse" title="Administrador Supremo" />
                          )}
                        </div>
                      </td>
                    )}
                    {visibleColumns.includes('Email') && (
                      <td className="p-4 text-white/70 group-hover:text-white transition-colors duration-200">{user.email}</td>
                    )}
                    {visibleColumns.includes('Função') && (
                      <td className="p-4"><UserRoleBadge role={user.role} /></td>
                    )}
                    {visibleColumns.includes('Criado em') && (
                      <td className="p-4 text-white/70 group-hover:text-white transition-colors duration-200">{formatDate(user.created_at)}</td>
                    )}
                    {canManageUsers && visibleColumns.includes('Ações') && (
                      <td className="p-4">
                        <UserActions
                          user={user}
                          onEdit={(user) => console.log('Edit user:', user.id)}
                          onDelete={(userId) => console.log('Delete user:', userId)}
                          canEdit={canManageUsers}
                          canDelete={canManageUsers}
                        />
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};