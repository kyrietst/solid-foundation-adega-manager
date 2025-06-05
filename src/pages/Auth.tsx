import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Wine } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, user, loading } = useAuth();

  useEffect(() => {
    console.log('Auth component mounted/updated', { user, loading });
    
    // Check if we're coming from a logout
    const isLogout = window.location.search.includes('logout=true');
    if (isLogout) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  if (loading) {
    console.log('Auth is loading...');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // If user exists and we're not in a logout process, redirect to home
  if (user) {
    console.log('User exists, redirecting to /', { user });
    return <Navigate to="/" replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login form submitted');
    setIsLoading(true);

    const { error } = await signIn(email, password);

    if (!error) {
      console.log('Login successful');
    } else {
      console.error('Login error:', error);
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex items-center space-x-3">
              <Wine className="h-10 w-10 text-purple-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Adega</h1>
                <p className="text-sm text-gray-600">Fundação Sólida</p>
              </div>
            </div>
          </div>
          <CardTitle className="text-2xl">Login do Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@exemplo.com"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Sua senha"
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            <p>Apenas usuários autorizados têm acesso ao sistema.</p>
            <p>Entre em contato com o administrador para criar sua conta.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
