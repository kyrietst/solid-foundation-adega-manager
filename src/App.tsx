// v3.4.3 - PGRST116 infinite loop fix (force rebuild)
import { Toaster } from "@/shared/ui/primitives/toaster";
import { TooltipProvider } from "@/shared/ui/primitives/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { AuthProvider } from "@/app/providers/AuthContext";
import { ErrorBoundary } from "@/shared/components/ErrorBoundary";
import { RouteErrorBoundary } from "@/shared/components/RouteErrorBoundary";
import { AuthErrorBoundary } from "@/shared/components/AuthErrorBoundary";
import { QueryErrorBoundary } from "@/shared/ui/layout/QueryErrorBoundary";
import { TropicalDuskGlow } from "@/shared/ui/effects/tropical-dusk-glow";
import { TempPasswordHandler } from "@/shared/components/TempPasswordHandler";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import ChromeDiagnostics from "./pages/ChromeDiagnostics";

// Lazy load AdvancedReports component
const AdvancedReports = lazy(() =>
  import('@/features/reports/components/AdvancedReports').then((m) => ({ default: m.AdvancedReports }))
);

// Lazy load Design System page
const DesignSystemPage = lazy(() =>
  import('./pages/DesignSystemPage').then((m) => ({ default: m.default }))
);

// Lazy load Activities page (Histórico & Logs)
const ActivitiesPage = lazy(() =>
  import('./pages/ActivitiesPage').then((m) => ({ default: m.ActivitiesPage }))
);

// Optimized QueryClient configuration (Context7 best practices)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Context7: Better default settings for stability and performance
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
      retry: (failureCount, error) => {
        // Context7: Smart retry logic
        if (failureCount < 3) {
          const errorMsg = error?.message?.toLowerCase() || '';
          const errorCode = error?.code;
          // Don't retry on auth errors, not found errors, or PGRST116 (deleted/missing products)
          if (
            errorCode === 'PGRST116' ||
            errorMsg.includes('unauthorized') ||
            errorMsg.includes('not found') ||
            errorMsg.includes('forbidden') ||
            errorMsg.includes('contains 0 rows')
          ) {
            return false;
          }
          return true;
        }
        return false;
      },
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      // Context7: Better default settings for mutations
      retry: (failureCount, error) => {
        if (failureCount < 2) {
          const errorMsg = error?.message?.toLowerCase() || '';
          // Don't retry on validation errors or duplicates
          if (errorMsg.includes('duplicate') || errorMsg.includes('unique constraint') || errorMsg.includes('validation')) {
            return false;
          }
          return true;
        }
        return false;
      },
    },
  },
});

// Componente de workaround para garantir que o Tailwind inclua todas as classes de cor dinâmicas.
const TailwindColorClasses = () => (
  <div className="hidden">
    <span className="bg-pink-100 text-pink-800"></span>
    <span className="bg-accent-green/10 text-accent-green"></span>
    <span className="bg-accent-blue/10 text-accent-blue"></span>
    <span className="bg-accent-gold-100/10 text-accent-gold-100"></span>
    <span className="bg-accent-purple/10 text-accent-purple"></span>
    <span className="bg-accent-orange/10 text-accent-orange"></span>
    <span className="bg-accent-red/10 text-accent-red"></span>
    <span className="bg-sky-100 text-sky-800"></span>
    <span className="bg-teal-100 text-teal-800"></span>
    <span className="bg-gray-100 text-gray-800"></span>
  </div>
);

const App = () => {
  console.log('🚀 App.tsx - Iniciando aplicação');
  
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <QueryErrorBoundary>
          <TooltipProvider>
            <BrowserRouter>
              <AuthErrorBoundary>
                <AuthProvider>
                  <div className="min-h-screen w-full relative overflow-x-hidden min-w-0">
                    {/* Background tropical dusk glow - Performance optimized */}
                    <div className="fixed inset-0 z-0">
                      <TropicalDuskGlow />
                    </div>
                    <Toaster />
                    <TailwindColorClasses />
                    <TempPasswordHandler />
                    <div className="relative z-10">
                    <Routes>
                      {/* Rotas independentes PRIMEIRO para evitar conflitos */}
                      <Route 
                        path="/auth" 
                        element={
                          <RouteErrorBoundary routeName="Autenticação">
                            <Auth />
                          </RouteErrorBoundary>
                        } 
                      />
                      <Route 
                        path="/chrome-diagnostics" 
                        element={
                          <RouteErrorBoundary routeName="Diagnósticos Chrome">
                            <ChromeDiagnostics />
                          </RouteErrorBoundary>
                        } 
                      />
                      <Route 
                        path="/designsystem" 
                        element={
                          <RouteErrorBoundary routeName="Design System">
                            <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-black"><div className="text-accent-gold-100">Carregando Design System...</div></div>}>
                              <DesignSystemPage />
                            </Suspense>
                          </RouteErrorBoundary>
                        } 
                      />
                      
                      {/* Rota principal com nested routes */}
                      <Route 
                        path="/" 
                        element={
                          <RouteErrorBoundary routeName="Aplicação Principal">
                            <Index />
                          </RouteErrorBoundary>
                        }
                      >
                      <Route index element={<div />} />
                      <Route 
                        path="dashboard" 
                        element={
                          <RouteErrorBoundary routeName="Dashboard">
                            <div />
                          </RouteErrorBoundary>
                        } 
                      />
                      <Route 
                        path="sales" 
                        element={
                          <RouteErrorBoundary routeName="Vendas">
                            <div />
                          </RouteErrorBoundary>
                        } 
                      />
                      <Route 
                        path="inventory" 
                        element={
                          <RouteErrorBoundary routeName="Estoque">
                            <div />
                          </RouteErrorBoundary>
                        } 
                      />
                      <Route 
                        path="suppliers" 
                        element={
                          <RouteErrorBoundary routeName="Fornecedores">
                            <div />
                          </RouteErrorBoundary>
                        } 
                      />
                      <Route 
                        path="customers" 
                        element={
                          <RouteErrorBoundary routeName="Clientes">
                            <div />
                          </RouteErrorBoundary>
                        } 
                      />
                      <Route 
                        path="delivery" 
                        element={
                          <RouteErrorBoundary routeName="Entregas">
                            <div />
                          </RouteErrorBoundary>
                        } 
                      />
                      <Route 
                        path="movements" 
                        element={
                          <RouteErrorBoundary routeName="Movimentos">
                            <div />
                          </RouteErrorBoundary>
                        } 
                      />
                      <Route 
                        path="users" 
                        element={
                          <RouteErrorBoundary routeName="Usuários">
                            <div />
                          </RouteErrorBoundary>
                        } 
                      />
                      <Route 
                        path="reports" 
                        element={
                          <RouteErrorBoundary routeName="Relatórios">
                            <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-black"><div className="text-accent-gold-100">Carregando relatórios...</div></div>}>
                              <AdvancedReports />
                            </Suspense>
                          </RouteErrorBoundary>
                        } 
                      />
                      <Route 
                        path="crm" 
                        element={
                          <RouteErrorBoundary routeName="CRM Dashboard">
                            <div />
                          </RouteErrorBoundary>
                        } 
                      />
                      <Route 
                        path="automations" 
                        element={
                          <RouteErrorBoundary routeName="Automações">
                            <div />
                          </RouteErrorBoundary>
                        } 
                      />
                      <Route 
                        path="customer/:id" 
                        element={
                          <RouteErrorBoundary routeName="Perfil do Cliente">
                            <div />
                          </RouteErrorBoundary>
                        } 
                      />
                      <Route
                        path="activities"
                        element={
                          <RouteErrorBoundary routeName="Atividades">
                            <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-black"><div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500/30 border-t-blue-400"></div></div>}>
                              <ActivitiesPage />
                            </Suspense>
                          </RouteErrorBoundary>
                        }
                      />
                      <Route 
                        path="expenses" 
                        element={
                          <RouteErrorBoundary routeName="Gestão de Despesas">
                            <div />
                          </RouteErrorBoundary>
                        } 
                      />
                    </Route>
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                  </div>
                </div>
              </AuthProvider>
            </AuthErrorBoundary>
          </BrowserRouter>
        </TooltipProvider>
      </QueryErrorBoundary>
    </QueryClientProvider>
  </ErrorBoundary>
  );
};

export default App;
