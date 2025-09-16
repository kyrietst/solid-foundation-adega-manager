import { useState, useEffect } from 'react';
import { Label } from '@/shared/ui/primitives/label';
import { Input } from '@/shared/ui/primitives/input';
import { useAuth } from '@/app/providers/AuthContext';
import { Navigate } from 'react-router-dom';
import { cn } from '@/core/config/utils';
import { TropicalDuskGlow } from '@/shared/ui/effects/tropical-dusk-glow';

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
    <div className="min-h-screen w-full bg-black relative flex items-center justify-center">
      {/* Tropical Dusk Glow Background - Performance optimized */}
      <TropicalDuskGlow />
      {/* Login Form */}
      <div className="max-w-md w-full mx-auto rounded-2xl p-8 shadow-2xl bg-slate-900/95 border border-slate-700/50">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img 
              src="/logo-adega-anitas.png" 
              alt="Logo Adega Anita's" 
              className="h-24 w-30 object-contain"
            />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white">Sistema Adega Anita's</h1>
            <p className="text-sm text-gray-400">Gestão Completa</p>
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
            <Label htmlFor="email" className="text-amber-300 font-semibold tracking-wide">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu.email@exemplo.com"
              required
              className="bg-gradient-to-br from-gray-900/80 to-gray-800/70 border-2 border-gray-600/50 text-white placeholder:text-gray-400 focus:border-amber-400/80 focus:ring-2 focus:ring-amber-400/30 focus:bg-gray-800/90 rounded-lg transition-all duration-300 hover:border-amber-500/40 shadow-lg shadow-orange-500/30"
            />
          </LabelInputContainer>

          <LabelInputContainer>
            <Label htmlFor="password" className="text-amber-300 font-semibold tracking-wide">Senha</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="bg-gradient-to-br from-gray-900/80 to-gray-800/70 border-2 border-gray-600/50 text-white placeholder:text-gray-400 focus:border-amber-400/80 focus:ring-2 focus:ring-amber-400/30 focus:bg-gray-800/90 rounded-lg transition-all duration-300 hover:border-amber-500/40 shadow-lg shadow-orange-500/30"
            />
          </LabelInputContainer>

          <button
            type="submit"
            disabled={isLoading}
            className="group/btn relative block h-12 w-full rounded-lg bg-gradient-to-br from-amber-500 via-amber-600 to-yellow-600 font-semibold text-black shadow-xl transition-all duration-300 hover:shadow-amber-500/40 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Entrando...' : 'Entrar no Sistema'}
            <BottomGradient />
          </button>
        </form>

        {/* Forgot Password */}
        <div className="text-center mt-4">
          <p className="text-sm text-gray-400 mb-1">Esqueceu sua senha?</p>
          <p className="text-amber-300 text-sm">
            Procure o administrador para resetar
          </p>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500 leading-relaxed">
            Apenas usuários autorizados têm acesso ao sistema.<br />
            Entre em contato com o administrador para criar sua conta.
          </p>
        </div>
      </div>
    </div>
  );
};

const BottomGradient = () => {
  return (
    <>
      <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
      <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
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