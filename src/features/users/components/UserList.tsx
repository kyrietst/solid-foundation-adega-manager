/* eslint-disable jsx-a11y/label-has-associated-control */
/**
 * Componente lista/tabela de usuários
 * Refatorado para seguir o padrão visual de Gestão de Clientes (/customers)
 */

import React from 'react';
import { Button } from '@/shared/ui/primitives/button';
import { Crown, RefreshCw, Users, FolderTree, Plus, Copy, CheckCircle } from 'lucide-react';
import { cn } from '@/core/config/utils';
import { LoadingScreen } from '@/shared/ui/composite/loading-spinner';
import { UserListProps } from './types';
import { UserRoleBadge } from './UserRoleBadge';
import { UserActions } from './UserActions';
import { useRoleUtilities } from '@/features/users/hooks/useUserPermissions';
import { useUserDeletion } from '@/features/users/hooks/useUserDeletion';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from '@/shared/ui/primitives/dropdown-menu';
import { SearchBar21st } from '@/shared/ui/thirdparty/search-bar-21st';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { useToast } from '@/shared/hooks/common/use-toast';
import { supabase } from '@/core/api/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/primitives/dialog';

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
  const { deleteUser, isDeleting } = useUserDeletion();
  const ALL_COLUMNS = ['Nome', 'Email', 'Perfil de Acesso', 'Criado em', 'Ações'] as const;
  const [visibleColumns, setVisibleColumns] = React.useState<string[]>([...ALL_COLUMNS]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [sortField, setSortField] = React.useState<'name' | 'email' | 'role' | 'created_at' | null>('created_at');
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('desc');
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [resetPasswordModal, setResetPasswordModal] = React.useState<{
    isOpen: boolean;
    userId: string;
    userName: string;
    tempPassword: string;
  }>({
    isOpen: false,
    userId: '',
    userName: '',
    tempPassword: ''
  });
  const [passwordCopied, setPasswordCopied] = React.useState(false);

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
        const av = a[sortField!];
        const bv = b[sortField!];

        if (sortField === 'created_at') {
          const at = new Date(av as string).getTime();
          const bt = new Date(bv as string).getTime();
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

  const SortIcon = ({ field }: { field: typeof sortField }) => {
    if (sortField !== field) return <div className="w-4 h-4 opacity-20"><ArrowUpDown className="w-3 h-3" /></div>;
    return <div className="text-[#f9cb15]">{sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}</div>;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const handleDeleteUser = async (userId: string) => {
    await deleteUser(userId);
    await onRefresh();
  };

  const handleResetPassword = async (userId: string, userName: string) => {
    try {
      const { data, error } = await supabase.rpc('reset_user_password', {
        p_user_id: userId
      });

      if (error) throw error;

      // Type cast for RPC response
      const result = data as any;

      if (result?.temp_password) {
        setResetPasswordModal({
          isOpen: true,
          userId,
          userName,
          tempPassword: result.temp_password
        });
        setPasswordCopied(false);
      }
    } catch (error: any) {
      toast({
        title: 'Erro ao resetar senha',
        description: error.message || 'Ocorreu um erro ao resetar a senha',
        variant: 'destructive'
      });
    }
  };

  const handleCopyPassword = async () => {
    try {
      await navigator.clipboard.writeText(resetPasswordModal.tempPassword);
      setPasswordCopied(true);
      toast({
        title: 'Senha copiada!',
        description: 'A senha temporária foi copiada para a área de transferência',
      });
      setTimeout(() => setPasswordCopied(false), 3000);
    } catch (error) {
      toast({
        title: 'Erro ao copiar',
        description: 'Não foi possível copiar a senha',
        variant: 'destructive'
      });
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  if (isLoading) {
    return <LoadingScreen text="Carregando usuários..." />;
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Filters Bar - Aesthetic from Customers */}
      <div className="px-6 py-4 flex flex-wrap items-center justify-between gap-4 border-b border-white/5">
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <SearchBar21st
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Buscar usuários..."
            className="flex-1"
          />
        </div>

        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-zinc-900/50 border-zinc-700 text-zinc-300 hover:text-white transition-colors h-10 px-4"
              >
                Colunas
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-700">
              {ALL_COLUMNS.map((col) => (
                <DropdownMenuCheckboxItem
                  key={col}
                  checked={visibleColumns.includes(col)}
                  onCheckedChange={() => setVisibleColumns(prev => prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col])}
                  className="text-zinc-300"
                >
                  {col}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="bg-zinc-900/50 border-zinc-700 text-zinc-300 hover:text-white transition-colors h-10 px-4"
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Table Section - Clean Aesthetic from Gestão de Clientes */}
      <div className="flex-1 overflow-auto custom-scrollbar">
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl m-6 overflow-hidden shadow-2xl">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-white/[0.02] border-b border-white/5">
              <tr className="text-[10px] uppercase tracking-wider text-zinc-500">
                {visibleColumns.includes('Nome') && (
                  <th 
                    className="px-6 py-4 font-medium cursor-pointer hover:text-zinc-300 transition-colors"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center gap-2">Nome <SortIcon field="name" /></div>
                  </th>
                )}
                {visibleColumns.includes('Email') && (
                  <th 
                    className="px-6 py-4 font-medium cursor-pointer hover:text-zinc-300 transition-colors"
                    onClick={() => handleSort('email')}
                  >
                    <div className="flex items-center gap-2">Email <SortIcon field="email" /></div>
                  </th>
                )}
                {visibleColumns.includes('Perfil de Acesso') && (
                  <th className="px-6 py-4 font-medium text-center">Perfil</th>
                )}
                {visibleColumns.includes('Criado em') && (
                  <th 
                    className="px-6 py-4 font-medium text-center cursor-pointer hover:text-zinc-300 transition-colors"
                    onClick={() => handleSort('created_at')}
                  >
                    <div className="flex items-center justify-center gap-2">Criado em <SortIcon field="created_at" /></div>
                  </th>
                )}
                {visibleColumns.includes('Ações') && (
                  <th className="px-6 py-4 font-medium text-right">Ações</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.02]">
              {dataset.length === 0 ? (
                <tr>
                  <td colSpan={visibleColumns.length} className="py-20 text-center">
                    <div className="flex flex-col items-center justify-center opacity-30">
                      <Users className="h-12 w-12 mb-4" />
                      <p className="text-zinc-400 font-medium">Nenhum usuário encontrado</p>
                    </div>
                  </td>
                </tr>
              ) : (
                dataset.map((user) => (
                  <tr key={user.id} className="group hover:bg-white/[0.03] transition-colors border-b border-white/[0.01]">
                    {visibleColumns.includes('Nome') && (
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-zinc-800/50 border border-white/5 flex items-center justify-center text-zinc-400 font-bold text-lg group-hover:text-white transition-all">
                            {user.name?.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold text-zinc-200 group-hover:text-white transition-colors">{user.name}</span>
                            {isSupremeAdmin(user.email) && (
                              <div className="flex items-center gap-1">
                                <Crown className="h-3 w-3 text-[#f9cb15]" />
                                <span className="text-[10px] text-[#f9cb15] font-medium tracking-wide">SUPREME ADMIN</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    )}

                    {visibleColumns.includes('Email') && (
                      <td className="px-6 py-4">
                        <span className="text-sm text-zinc-400 group-hover:text-zinc-300 transition-colors">{user.email}</span>
                      </td>
                    )}

                    {visibleColumns.includes('Perfil de Acesso') && (
                      <td className="px-6 py-4 text-center">
                        <UserRoleBadge role={user.role} />
                      </td>
                    )}

                    {visibleColumns.includes('Criado em') && (
                      <td className="px-6 py-4 text-center">
                        <div className="flex flex-col items-center">
                          <span className="text-sm text-zinc-300 font-medium font-mono">
                            {formatDate(user.created_at)}
                          </span>
                        </div>
                      </td>
                    )}

                    {visibleColumns.includes('Ações') && (
                      <td className="px-6 py-4 text-right">
                        <UserActions
                          user={user}
                          onDelete={handleDeleteUser}
                          onResetPassword={(uid) => handleResetPassword(uid, user.name || '')}
                          canEdit={canManageUsers}
                          canDelete={canManageUsers}
                          canResetPassword={canManageUsers}
                        />
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reset Password Modal */}
      <Dialog 
        open={resetPasswordModal.isOpen} 
        onOpenChange={(open) => !open && setResetPasswordModal({ ...resetPasswordModal, isOpen: false })}
      >
        <DialogContent className="bg-zinc-900 border-zinc-700 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-white">Senha Resetada</DialogTitle>
            <DialogDescription className="text-zinc-400">
              A senha de <span className="text-white font-medium">{resetPasswordModal.userName}</span> foi alterada.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="bg-black/40 p-4 rounded-xl border border-white/5">
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Senha Temporária</p>
              <div className="flex items-center justify-between">
                <code className="text-lg font-mono text-[#f9cb15] font-bold tracking-wider">
                  {resetPasswordModal.tempPassword}
                </code>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCopyPassword}
                  className="h-9 w-9 text-zinc-400 hover:text-white hover:bg-white/5"
                >
                  {passwordCopied ? <CheckCircle className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed">
              O usuário deverá usar esta senha para o próximo login, onde será solicitada a criação de uma nova senha definitiva.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};