import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Users, UserCheck, UserX, Crown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'employee' | 'delivery';
  created_at: string;
  updated_at: string;
}

export const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showFirstAdminSetup, setShowFirstAdminSetup] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'employee' as 'admin' | 'employee' | 'delivery'
  });
  const { toast } = useToast();
  const { hasPermission } = useAuth();

  useEffect(() => {
    checkForExistingUsers();
  }, []);

  const checkForExistingUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);

      if (error) {
        console.error('Error checking users:', error);
        return;
      }

      if (!data || data.length === 0) {
        setShowFirstAdminSetup(true);
      } else {
        if (hasPermission('admin')) {
          fetchUsers();
        }
      }
    } catch (error) {
      console.error('Error in checkForExistingUsers:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching users:', error);
        return;
      }

      if (data) {
        setUsers(data as User[]);
      }
    } catch (error) {
      console.error('Error in fetchUsers:', error);
    }
  };

  const createFirstAdmin = async () => {
    setIsLoading(true);
    
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: 'adm@adm.com',
        password: 'adm123',
      });

      if (authError) {
        toast({
          title: "Erro ao criar administrador",
          description: authError.message,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            email: authData.user.email,
            name: 'Administrador Supremo',
            role: 'admin'
          });

        if (profileError) {
          console.error('Error creating admin profile:', profileError);
          toast({
            title: "Erro ao criar perfil do administrador",
            description: profileError.message,
            variant: "destructive",
          });
          return;
        }
      }

      toast({
        title: "Administrador criado!",
        description: "Conta de administrador supremo criada com sucesso. Email: adm@adm.com, Senha: adm123",
      });

      setShowFirstAdminSetup(false);
      fetchUsers();

    } catch (error: any) {
      console.error('Error creating first admin:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao criar administrador",
        variant: "destructive",
      });
    }

    setIsLoading(false);
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
      // Store current session before creating new user
      const currentSession = await supabase.auth.getSession();
      
      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newUser.email,
        password: newUser.password,
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

      if (authData.user) {
        let hasError = false;

        // 2. Insert into users table
        const { error: userError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            email: authData.user.email,
            name: newUser.name,
            role: newUser.role
          });

        if (userError) {
          console.error('Error creating user record:', userError);
          hasError = true;
        }

        // 3. Insert into profiles table
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            email: authData.user.email,
            name: newUser.name,
            role: newUser.role
          });

        if (profileError) {
          console.error('Error creating user profile:', profileError);
          hasError = true;
        }

        // 4. Restore admin session
        if (currentSession.data.session) {
          const { error: signInError } = await supabase.auth.setSession(currentSession.data.session);
          if (signInError) {
            console.error('Error restoring admin session:', signInError);
            // Force reload to ensure admin is logged in
            window.location.reload();
            return;
          }
        }

        // Only show success message if both operations succeeded
        if (!hasError) {
          toast({
            title: "Usuário criado!",
            description: `${newUser.name} foi criado com sucesso`,
          });

          setNewUser({ name: '', email: '', password: '', role: 'employee' });
          setIsDialogOpen(false);
          fetchUsers();
        }
      }
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
      employee: 'Funcionário',
      delivery: 'Entregador'
    };
    return roleMap[role as keyof typeof roleMap] || role;
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-700';
      case 'employee': return 'bg-blue-100 text-blue-700';
      case 'delivery': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (showFirstAdminSetup) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Crown className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <CardTitle className="text-2xl">Configuração Inicial</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              Nenhum usuário encontrado no sistema. Crie o primeiro administrador para começar.
            </p>
            <div className="bg-blue-50 p-4 rounded-lg text-sm">
              <p><strong>Email:</strong> adm@adm.com</p>
              <p><strong>Senha:</strong> adm123</p>
              <p className="text-xs text-gray-600 mt-2">
                (Recomendamos alterar a senha após o primeiro login)
              </p>
            </div>
            <Button 
              onClick={createFirstAdmin} 
              className="w-full" 
              disabled={isLoading}
              size="lg"
            >
              {isLoading ? 'Criando...' : 'Criar Administrador Supremo'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">Gerenciar Usuários</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Usuário
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Novo Usuário</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="user-name">Nome</Label>
                  <Input
                    id="user-name"
                    value={newUser.name}
                    onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                    placeholder="Nome completo"
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
                  <Label htmlFor="user-password">Senha</Label>
                  <Input
                    id="user-password"
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    placeholder="Senha segura"
                  />
                </div>
                <div>
                  <Label htmlFor="user-role">Função</Label>
                  <Select 
                    value={newUser.role} 
                    onValueChange={(value: 'admin' | 'employee' | 'delivery') => setNewUser({...newUser, role: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a função" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employee">Funcionário da Adega</SelectItem>
                      <SelectItem value="delivery">Entregador/Motoboy</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="bg-amber-50 p-3 rounded-lg text-sm">
                  <p className="font-medium text-amber-800">Níveis de Acesso:</p>
                  <ul className="text-amber-700 text-xs mt-1 space-y-1">
                    <li><strong>Administrador:</strong> Acesso total ao sistema</li>
                    <li><strong>Funcionário:</strong> Vendas, estoque, clientes, relatórios (sem dados de faturamento sensíveis)</li>
                    <li><strong>Entregador:</strong> Apenas delivery e suas entregas</li>
                  </ul>
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
                    <td className="p-2 font-medium">
                      {user.name}
                      {user.email === 'adm@adm.com' && (
                        <Crown className="h-4 w-4 text-yellow-500 inline ml-2" />
                      )}
                    </td>
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
