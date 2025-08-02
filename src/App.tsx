import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { BackgroundWrapper } from "@/components/ui/background-wrapper";
import { ErrorBoundary } from "@/components/error/ErrorBoundary";
import { RouteErrorBoundary } from "@/components/error/RouteErrorBoundary";
import { AuthErrorBoundary } from "@/components/error/AuthErrorBoundary";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

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

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <AuthErrorBoundary>
            <AuthProvider>
              <BackgroundWrapper>
                <Toaster />
                <Sonner />
                <TailwindColorClasses />
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
                  </Route>
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BackgroundWrapper>
            </AuthProvider>
          </AuthErrorBoundary>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
