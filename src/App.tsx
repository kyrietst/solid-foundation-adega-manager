import { Toaster } from "@/shared/ui/primitives/toaster";
import { Toaster as Sonner } from "@/shared/components/sonner";
import { TooltipProvider } from "@/shared/ui/primitives/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { AuthProvider } from "@/app/providers/AuthContext";
import { ErrorBoundary } from "@/shared/components/ErrorBoundary";
import { RouteErrorBoundary } from "@/shared/components/RouteErrorBoundary";
import { AuthErrorBoundary } from "@/shared/components/AuthErrorBoundary";
import { LavaLamp } from "@/components/ui/fluid-blob";
import { TempPasswordHandler } from "@/shared/components/TempPasswordHandler";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

// Lazy load AdvancedReports component
const AdvancedReports = lazy(() =>
  import('@/features/reports/components/AdvancedReports').then((m) => ({ default: m.AdvancedReports }))
);

const queryClient = new QueryClient();

// Componente de workaround para garantir que o Tailwind inclua todas as classes de cor dinâmicas.
const TailwindColorClasses = () => (
  <div className="hidden">
    <span className="bg-pink-100 text-pink-800"></span>
    <span className="bg-green-100 text-green-800"></span>
    <span className="bg-blue-100 text-blue-800"></span>
    <span className="bg-yellow-100 text-yellow-800"></span>
    <span className="bg-purple-100 text-purple-800"></span>
    <span className="bg-orange-100 text-orange-800"></span>
    <span className="bg-red-100 text-red-800"></span>
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
        <TooltipProvider>
          <BrowserRouter>
            <AuthErrorBoundary>
              <AuthProvider>
                <div className="min-h-screen w-full relative overflow-x-hidden min-w-0">
                  {/* Background fluid blob */}
                  <div className="fixed inset-0 z-0">
                    <LavaLamp />
                  </div>
                  <Toaster />
                  <Sonner />
                  <TailwindColorClasses />
                  <TempPasswordHandler />
                  <div className="relative z-10">
                    <Routes>
                      <Route 
                        path="/auth" 
                        element={
                          <RouteErrorBoundary routeName="Autenticação">
                            <Auth />
                          </RouteErrorBoundary>
                        } 
                      />
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
                            <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-black"><div className="text-yellow-400">Carregando relatórios...</div></div>}>
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
                            <div />
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
    </QueryClientProvider>
  </ErrorBoundary>
  );
};

export default App;
