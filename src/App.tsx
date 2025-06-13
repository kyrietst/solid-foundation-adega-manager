import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
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
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <Toaster />
                    <Sonner />
          <TailwindColorClasses />
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<Index />}>
              <Route index element={<div />} />
              <Route path="dashboard" element={<div />} />
              <Route path="sales" element={<div />} />
              <Route path="inventory" element={<div />} />
              <Route path="customers" element={<div />} />
              <Route path="delivery" element={<div />} />
              <Route path="reports" element={<div />} />
              <Route path="users" element={<div />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
