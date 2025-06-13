import { useSales } from "@/hooks/use-sales";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { FileText, Download } from "lucide-react";

export function RecentSales() {
  const { data: sales, isLoading } = useSales({ limit: 10 });
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-9 w-32" />
        </div>
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Vendas Recentes</h2>
        <Button variant="outline" size="sm" disabled>
          <Download className="h-4 w-4 mr-2" />
          Exportar
        </Button>
      </div>
      
      {sales?.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-2 opacity-30" />
          <p>Nenhuma venda encontrada</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sales?.map((sale) => (
            <div key={sale.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">
                      {sale.customer?.name || "Cliente não identificado"}
                    </h3>
                    <span className="text-xs px-2 py-0.5 bg-muted rounded-full">
                      {sale.payment_method}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {sale.items.length} itens • {sale.items[0]?.product?.name}
                    {sale.items.length > 1 && ` +${sale.items.length - 1} mais`}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(new Date(sale.created_at), "PPpp", { locale: ptBR })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL"
                    }).format(sale.final_amount)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {sale.status === "completed" ? "Concluído" : "Pendente"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="flex justify-center pt-2">
        <Button variant="ghost" size="sm">
          Ver todas as vendas
        </Button>
      </div>
    </div>
  );
}
