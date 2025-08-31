import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/shared/ui/primitives/button";
import { HomeIcon, AlertCircle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "🚫 404 Error: Rota não encontrada:",
      location.pathname + location.search
    );
  }, [location.pathname, location.search]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="text-center space-y-6 p-8">
        <div className="flex justify-center">
          <AlertCircle className="h-20 w-20 text-yellow-400" />
        </div>
        <div>
          <h1 className="text-4xl font-bold mb-4 text-white">404</h1>
          <p className="text-xl text-adega-silver mb-2">Página não encontrada</p>
          <p className="text-sm text-adega-silver/60">
            Rota: {location.pathname + location.search}
          </p>
        </div>
        <Button 
          onClick={() => window.location.href = '/'}
          className="inline-flex items-center space-x-2"
        >
          <HomeIcon className="h-4 w-4" />
          <span>Voltar ao Dashboard</span>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
