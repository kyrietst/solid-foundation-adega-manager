import { useState, useEffect } from 'react';
import { Label } from '@/shared/ui/primitives/label';
import { Input } from '@/shared/ui/primitives/input';
import { Wine } from 'lucide-react';
import { useAuth } from '@/app/providers/AuthContext';
import { Navigate } from 'react-router-dom';
import { cn } from '@/core/config/utils';
import { WavyBackground } from '@/shared/ui/layout/wavy-background';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, user, loading } = useAuth();

  useEffect(() => {
    
    // Check if we're coming from a logout
    const isLogout = window.location.search.includes('logout=true');
    if (isLogout) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  // If user exists and we're not in a logout process, redirect to home
  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      console.error('Login error:', error);
    }

    setIsLoading(false);
  };

  return (
    <WavyBackground 
      className="flex items-center justify-center"
      colors={["#000000", "#FFD700"]}
      waveWidth={50}
      backgroundFill="#000000"
      blur={10}
      speed="slow"
      waveOpacity={0.5}
    >
      {/* Login Form */}
      <div className="max-w-md w-full mx-auto rounded-2xl p-8 shadow-2xl bg-slate-900/90 backdrop-blur-xl border border-slate-700/50">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl">
                <Wine className="h-8 w-8 text-white" />
              </div>
              <div className="text-left">
                <h1 className="text-2xl font-bold text-white">Adega Manager</h1>
                <p className="text-sm text-gray-400">Fundação Sólida</p>
              </div>
            </div>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">
            Bem-vindo de volta
          </h2>
          <p className="text-sm text-gray-400">
            Entre com suas credenciais para acessar o sistema
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          <LabelInputContainer>
            <Label htmlFor="email" className="text-white">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu.email@exemplo.com"
              required
              className="bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-purple-500"
            />
          </LabelInputContainer>

          <LabelInputContainer>
            <Label htmlFor="password" className="text-white">Senha</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-purple-500"
            />
          </LabelInputContainer>

          <button
            type="submit"
            disabled={isLoading}
            className="group/btn relative block h-12 w-full rounded-lg bg-gradient-to-br from-purple-600 via-purple-700 to-blue-600 font-medium text-white shadow-lg transition-all duration-200 hover:shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Entrando...' : 'Entrar no Sistema'}
            <BottomGradient />
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500 leading-relaxed">
            Apenas usuários autorizados têm acesso ao sistema.<br />
            Entre em contato com o administrador para criar sua conta.
          </p>
        </div>
      </div>
    </WavyBackground>
  );
};

const BottomGradient = () => {
  return (
    <>
      <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
      <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
    </>
  );
};

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex w-full flex-col space-y-2", className)}>
      {children}
    </div>
  );
};

export default Auth;