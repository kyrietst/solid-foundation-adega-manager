/**
 * Componente lista/tabela de usuários
 * Extraído do UserManagement.tsx para separar responsabilidades
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { Button } from '@/shared/ui/primitives/button';
import { Crown, Plus, RefreshCw } from 'lucide-react';
import { LoadingScreen } from '@/shared/ui/composite/loading-spinner';
import { UserListProps } from './types';
import { UserRoleBadge } from './UserRoleBadge';
import { UserActions } from './UserActions';
import { useRoleUtilities } from '@/features/users/hooks/useUserPermissions';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from '@/shared/ui/primitives/dropdown-menu';
import { SearchBar21st } from '@/shared/ui/thirdparty/search-bar-21st';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

export const UserList: React.FC<UserListProps> = ({
  users,
  onRefresh,
  canManageUsers,
  isLoading = false,
}) => {
  const { isSupremeAdmin } = useRoleUtilities();
  const ALL_COLUMNS = ['Nome', 'Email', 'Função', 'Criado em', 'Ações'] as const;
  const [visibleColumns, setVisibleColumns] = React.useState<string[]>([...ALL_COLUMNS]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [sortField, setSortField] = React.useState<'name' | 'email' | 'role' | 'created_at' | null>('created_at');
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('desc');

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

  if (isLoading) {
    return <LoadingScreen text="Carregando usuários..." />;
  }

  return (
    <Card className="bg-adega-charcoal/20 border-white/10 backdrop-blur-xl shadow-xl">
      <CardHeader className="space-y-3 pb-2">
        <div className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl font-bold text-adega-platinum">Gerenciar Usuários</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onRefresh} className="border-white/10 hover:bg-white/10">
              <RefreshCw className="h-4 w-4 mr-2" /> Atualizar
            </Button>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
          <div className="w-full sm:w-80">
            <SearchBar21st placeholder="Buscar usuários..." value={searchTerm} onChange={setSearchTerm} debounceMs={150} />
          </div>
          <div className="flex items-center gap-2 text-sm text-adega-platinum/70">
            <span>{dataset.length} de {users.length} usuários</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">Colunas</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                {ALL_COLUMNS.map(col => (
                  <DropdownMenuCheckboxItem
                    key={col}
                    checked={visibleColumns.includes(col)}
                    onCheckedChange={() => setVisibleColumns(prev => prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col])}
                  >
                    {col}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {dataset.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-adega-platinum/60 mb-4">
              Nenhum usuário encontrado
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-white/10">
                  {visibleColumns.includes('Nome') && (
                    <th className="text-left p-4 font-medium text-adega-platinum">
                      <button className="inline-flex items-center gap-2" onClick={() => handleSort('name')}>Nome {icon('name')}</button>
                    </th>
                  )}
                  {visibleColumns.includes('Email') && (
                    <th className="text-left p-4 font-medium text-adega-platinum">
                      <button className="inline-flex items-center gap-2" onClick={() => handleSort('email')}>Email {icon('email')}</button>
                    </th>
                  )}
                  {visibleColumns.includes('Função') && (
                    <th className="text-left p-4 font-medium text-adega-platinum">
                      <button className="inline-flex items-center gap-2" onClick={() => handleSort('role')}>Função {icon('role')}</button>
                    </th>
                  )}
                  {visibleColumns.includes('Criado em') && (
                    <th className="text-left p-4 font-medium text-adega-platinum">
                      <button className="inline-flex items-center gap-2" onClick={() => handleSort('created_at')}>Criado em {icon('created_at')}</button>
                    </th>
                  )}
                  {canManageUsers && visibleColumns.includes('Ações') && (
                    <th className="text-left p-4 font-medium text-adega-platinum">Ações</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {dataset.map((user) => (
                  <tr 
                    key={user.id} 
                    className="border-b border-white/10 hover:bg-adega-charcoal/20 transition-colors"
                  >
                    {visibleColumns.includes('Nome') && (
                      <td className="p-4">
                        <div className="flex items-center">
                          <span className="font-medium text-adega-platinum">{user.name}</span>
                          {isSupremeAdmin(user.email) && (
                            <Crown className="h-4 w-4 text-adega-gold ml-2" title="Administrador Supremo" />
                          )}
                        </div>
                      </td>
                    )}
                    {visibleColumns.includes('Email') && (
                      <td className="p-4 text-adega-platinum/80">{user.email}</td>
                    )}
                    {visibleColumns.includes('Função') && (
                      <td className="p-4"><UserRoleBadge role={user.role} /></td>
                    )}
                    {visibleColumns.includes('Criado em') && (
                      <td className="p-4 text-adega-platinum/80">{formatDate(user.created_at)}</td>
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