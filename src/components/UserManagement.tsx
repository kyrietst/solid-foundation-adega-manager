
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Users, UserCheck, UserX } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

export const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'funcionario' as 'admin' | 'funcionario' | 'entregador'
  });
  const { toast } = useToast();
  const { hasPermission } = useAuth();

  useEffect(() => {
    if (hasPermission('admin')) {
      fetchUsers();
    }
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          name,
          email,
          created_at,
          user_roles (role)
        `);

      if (error) {
        console.error('Error fetching users:', error);
        return;
      }

      const formattedUsers = data?.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: (user.user_roles as any)?.[0]?.role || 'Sem role',
        created_at: user.created_at
      })) || [];

      setUsers(formattedUsers);
    } catch (error) {
      console.error('Error in fetchUsers:', error);
    }
  };

  const createUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: newUser.email,
        password: newUser.password,
        user_metadata: {
          name: newUser.name
        }
      });

      if (authError) {
        toast({
          title: "Erro ao criar usuário",
          description: authError.message,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Add role to the user
      if (authData.user) {
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: authData.user.id,
            role: newUser.role
          });

        if (roleError) {
          console.error('Error adding role:', roleError);
          toast({
            title: "Usuário criado mas erro ao atribuir role",
            description: "Entre em contato com o administrador",
            variant: "destructive",
          });
        }
      }

      toast({
        title: "Usuário criado!",
        description: `${newUser.name} foi criado com sucesso`,
      });

      setNewUser({ name: '', email: '', password: '', role: 'funcionario' });
      setIsDialogOpen(false);
      fetchUsers();

    } catch (error: any) {
      console.error('Error creating user:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao criar usuário",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  const getRoleDisplay = (role: string) => {
    const roleMap = {
      admin: 'Administrador',
      funcionario: 'Funcionário',
      entregador: 'Entregador'
    };
    return roleMap[role as keyof typeof roleMap] || role;
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-700';
      case 'funcionario': return 'bg-blue-100 text-blue-700';
      case 'entregador': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (!hasPermission('admin')) {
    return (
      <div className="text-center p-8">
        <UserX className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900">Acesso Negado</h3>
        <p className="text-gray-600">Apenas administradores podem gerenciar usuários.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resumo de Usuários */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Funcionários</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.role === 'funcionario').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entregadores</CardTitle>
            <UserCheck className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.role === 'entregador').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Usuários */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Gerenciar Usuários</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Criar Usuário
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Novo Usuário</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="user-name">Nome Completo</Label>
                  <Input
                    id="user-name"
                    value={newUser.name}
                    onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                    placeholder="Nome completo do usuário"
                  />
                </div>
                <div>
                  <Label htmlFor="user-email">Email</Label>
                  <Input
                    id="user-email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    placeholder="email@exemplo.com"
                  />
                </div>
                <div>
                  <Label htmlFor="user-password">Senha Inicial</Label>
                  <Input
                    id="user-password"
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    placeholder="Senha inicial (mínimo 6 caracteres)"
                  />
                </div>
                <div>
                  <Label htmlFor="user-role">Função</Label>
                  <Select 
                    value={newUser.role} 
                    onValueChange={(value: 'admin' | 'funcionario' | 'entregador') => setNewUser({...newUser, role: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a função" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="funcionario">Funcionário da Adega</SelectItem>
                      <SelectItem value="entregador">Entregador</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={createUser} className="w-full" disabled={isLoading}>
                  {isLoading ? 'Criando...' : 'Criar Usuário'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Nome</th>
                  <th className="text-left p-2">Email</th>
                  <th className="text-left p-2">Função</th>
                  <th className="text-left p-2">Criado em</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-medium">{user.name}</td>
                    <td className="p-2">{user.email}</td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${getRoleColor(user.role)}`}>
                        {getRoleDisplay(user.role)}
                      </span>
                    </td>
                    <td className="p-2">
                      {new Date(user.created_at).toLocaleDateString('pt-BR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
