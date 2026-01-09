import { useState } from 'react';
import { useAuth } from '@/app/providers/AuthContext';
import { Wine, User, Lock, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
import { Navigate } from 'react-router-dom';

export default function Auth() {
  const { signIn, user, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLoginError('');

    try {
      const { error } = await signIn(email, password);
      if (error) {
        setLoginError('Credenciais inválidas. Verifique e tente novamente.');
      }
    } catch (err) {
      setLoginError('Erro de conexão. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-screen bg-[#09090b] flex items-center justify-center">
        <Loader2 className="h-10 w-10 text-[#ffd11a] animate-spin" />
      </div>
    );
  }

  if (user) return <Navigate to="/" replace />;

  return (
    <div className="bg-[#09090b] font-sans h-screen w-screen overflow-hidden relative selection:bg-[#ffd11a] selection:text-black">
      {/* Layer 1: Abstract Living Background Image */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div 
          className="w-full h-full bg-cover bg-center animate-float opacity-30 mix-blend-screen"
          style={{ 
            backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBI54TbnQYT5uOZOeR_17Zd7KbsAahWSE6iY1Y3rwad3IV7_4VEP3s-7Rtxv2bkOadcLGiO-FHVdr0XfJx5nba22PhGOlmjCJ8Z2Bh_fbT0B6PwoLS5bCAHpv8TJ3Ro0DPtjNmlHPOU1Tca8D9X9XzF8C_k-QA2sn85NKdU_ce10TQbcwXmRoLF_lMPlyRcHLTy04JUbAcBL3fj4UIUTe8VDVXole8bUUS_c9nnrRJLws3EDgOBAk2XtGoxXnrMLsLULztliLPWRw')",
            transformOrigin: 'center center'
          }}
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/90" />
      </div>

      {/* Layer 2: Breathing Radial Gradient Pulse */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none z-0">
        <div className="w-full h-full rounded-full bg-[#ffd11a] blur-[140px] animate-breathe mix-blend-color-dodge opacity-20" />
      </div>

      {/* Layer 3: Champagne Bubbles */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute bottom-0 left-[10%] w-2 h-2 rounded-full bg-[#ffd11a]/40 animate-rise" style={{ animationDuration: '15s', animationDelay: '-2s' }} />
        <div className="absolute bottom-0 left-[20%] w-3 h-3 rounded-full bg-[#ffd11a]/30 animate-rise" style={{ animationDuration: '12s', animationDelay: '-8s' }} />
        <div className="absolute bottom-0 left-[35%] w-1.5 h-1.5 rounded-full bg-[#ffd11a]/50 animate-rise" style={{ animationDuration: '18s', animationDelay: '-5s' }} />
        <div className="absolute bottom-0 left-[50%] w-2.5 h-2.5 rounded-full bg-[#ffd11a]/40 animate-rise" style={{ animationDuration: '14s', animationDelay: '-11s' }} />
        <div className="absolute bottom-0 left-[65%] w-4 h-4 rounded-full bg-[#ffd11a]/20 animate-rise" style={{ animationDuration: '20s', animationDelay: '-15s' }} />
        <div className="absolute bottom-0 left-[80%] w-2 h-2 rounded-full bg-[#ffd11a]/40 animate-rise" style={{ animationDuration: '16s', animationDelay: '-3s' }} />
        <div className="absolute bottom-0 left-[90%] w-3 h-3 rounded-full bg-[#ffd11a]/30 animate-rise" style={{ animationDuration: '13s', animationDelay: '-9s' }} />
      </div>

      {/* Layer 4: Foreground Content */}
      <div className="relative z-10 flex h-full w-full flex-col items-center justify-center p-4">
        {/* Login Card */}
        <div 
          className="w-full max-w-[440px] rounded-2xl p-8 sm:p-12 flex flex-col gap-8 transition-all duration-500 hover:shadow-[0_25px_60px_-12px_rgba(255,209,26,0.15)]"
          style={{
            background: 'rgba(15, 15, 15, 0.65)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
          }}
        >
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#ffd11a]/10 mb-2 border border-[#ffd11a]/20 shadow-[0_0_15px_rgba(255,209,26,0.1)]">
              <Wine className="text-[#ffd11a] w-6 h-6" />
            </div>
            <h1 className="text-4xl font-black tracking-tight text-white leading-tight">
              Adega <span className="bg-gradient-to-br from-[#ffd11a] via-[#bf9b30] to-[#bf9b30] bg-clip-text text-transparent">Anita's</span>
            </h1>
            <p className="text-[#cec18d] text-sm font-medium tracking-[0.2em] uppercase opacity-80">
              Enterprise Resource Planning
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full">
            {/* Email Input */}
            <div className="space-y-2 group">
              <label className="text-white text-sm font-semibold ml-1 tracking-wide" htmlFor="email">E-mail / Usuário</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="text-[#cec18d]/50 w-5 h-5 group-focus-within:text-[#ffd11a] transition-colors duration-300" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="sommelier@adegaanitas.com"
                  className="w-full bg-[#09090b]/60 border border-[#444030] text-white placeholder-[#cec18d]/30 text-base rounded-lg h-14 pl-11 pr-4 focus:outline-none focus:border-[#ffd11a] focus:ring-1 focus:ring-[#ffd11a] transition-all duration-300"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2 group">
              <div className="flex justify-between items-center ml-1">
                <label className="text-white text-sm font-semibold tracking-wide" htmlFor="password">Senha</label>
                <a href="#" className="text-xs text-[#ffd11a]/80 hover:text-[#ffd11a] transition-colors font-medium">Recuperar Acesso?</a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="text-[#cec18d]/50 w-5 h-5 group-focus-within:text-[#ffd11a] transition-colors duration-300" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#09090b]/60 border border-[#444030] text-white placeholder-[#cec18d]/30 text-base rounded-lg h-14 pl-11 pr-12 focus:outline-none focus:border-[#ffd11a] focus:ring-1 focus:ring-[#ffd11a] transition-all duration-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#cec18d]/50 hover:text-white transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {loginError && (
              <div className="text-red-400 text-sm text-center bg-red-900/10 p-2 rounded border border-red-500/20">
                {loginError}
              </div>
            )}

            {/* Action Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="relative w-full h-12 mt-4 rounded-lg text-[#24200f] font-bold text-base tracking-wide shadow-[0_0_20px_rgba(255,209,26,0.3)] hover:shadow-[0_0_35px_rgba(255,209,26,0.5)] transition-shadow duration-300 flex items-center justify-center gap-2 group/btn cursor-pointer overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed"
              style={{
                backgroundSize: '200% auto',
                backgroundImage: 'linear-gradient(110deg, #ffd11a 0%, #ffeaa7 45%, #ffd11a 55%, #ffd11a 100%)',
                animation: 'shimmer 4s linear infinite'
              }}
            >
              {isSubmitting ? (
                 <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>Entrar</span>
                  <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover/btn:translate-x-1" />
                </>
              )}
            </button>
          </form>

          {/* Footer Section */}
          <div className="text-center pt-2">
            <p className="text-[10px] text-white/30 font-light tracking-[0.2em] uppercase">
              v4.0.0 ERP
            </p>
          </div>
        </div>


      </div>
    </div>
  );
}