import React from 'react';
import { useNotification } from '@/contexts/NotificationContext';
import { Bell } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export const NotificationBell: React.FC = () => {
  const { lowStockCount, lowStockItems } = useNotification();
  const [open, setOpen] = React.useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <button className="relative p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
              <Bell className="w-5 h-5" />
              {lowStockCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full px-1">
                  {lowStockCount}
                </span>
              )}
            </button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent>Produtos com estoque baixo</TooltipContent>
      </Tooltip>

      <DialogContent className="max-w-lg">
        {lowStockCount === 0 ? (
          <div className="py-6 text-center text-sm text-gray-600 dark:text-gray-400">
            Todos os produtos estão acima do estoque mínimo. \o/
          </div>
        ) : (
          <div className="space-y-4">
            <DialogHeader>
              <DialogTitle>Produtos com Estoque Baixo</DialogTitle>
            </DialogHeader>

            <div className="max-h-80 overflow-y-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-600 dark:text-gray-400">
                    <th className="py-2">Produto</th>
                    <th className="py-2 text-right">Qtd</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockItems?.map((p) => {
                    const minimum = p.minimum_stock ?? 5;
                    const ratio = minimum === 0 ? 1 : p.stock_quantity / minimum;
                    const barColor = p.stock_quantity === 0 ? 'bg-red-600' : 'bg-orange-400';
                    return (
                      <tr key={p.id} className="border-b last:border-0 dark:border-gray-700">
                        <td className="py-2 pr-3 w-full">
                          <div className="flex justify-between">
                            <span>{p.name}</span>
                            <span className="font-medium">{p.stock_quantity} / {minimum}</span>
                          </div>
                          <div className="h-1 w-full rounded bg-gray-200 dark:bg-gray-700 mt-1">
                            <div
                              className={`h-1 rounded ${barColor}`}
                              style={{ width: `${Math.min(ratio, 1) * 100}%` }}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};