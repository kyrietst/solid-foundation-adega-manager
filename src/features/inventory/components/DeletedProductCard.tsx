/**
 * DeletedProductCard - Card para produtos deletados (soft delete)
 * Exibe informações do produto deletado com opção de restauração (admin)
 */

import React from 'react';
import { Button } from '@/shared/ui/primitives/button';
import { Badge } from '@/shared/ui/primitives/badge';
import {
  Package,
  Box,
  AlertTriangle,
  RotateCcw,
  Calendar,
  User,
  Barcode as BarcodeIcon
} from 'lucide-react';
import { cn } from '@/core/config/utils';
import { formatCurrency } from '@/core/config/utils';
import { useFormatBrazilianDate } from '@/shared/hooks/common/use-brasil-timezone';
import type { DeletedProduct } from '../hooks/useDeletedProducts';

interface DeletedProductCardProps {
  product: DeletedProduct;
  onRestore: (product: DeletedProduct) => void;
  isRestoring?: boolean;
}

export const DeletedProductCard: React.FC<DeletedProductCardProps> = ({
  product,
  onRestore,
  isRestoring = false,
}) => {
  const { formatDate } = useFormatBrazilianDate();

  const deletedDate = product.deleted_at ? formatDate(product.deleted_at) : 'Data desconhecida';

  return (
    <div className={cn(
      "group rounded-2xl text-card-foreground transition-all duration-300",
      "bg-black/70 backdrop-blur-md border border-red-500/30 shadow-[0_8px_24px_rgba(0,0,0,0.6)]",
      "overflow-hidden",
      "hover:shadow-2xl hover:shadow-red-500/20 hover:border-red-400/60"
    )}>
      {/* Header com Badge DELETADO */}
      <div className="relative h-32 bg-gradient-to-br from-red-900/30 to-gray-900/50 flex items-center justify-center">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover opacity-40 grayscale"
          />
        ) : (
          <Package className="h-12 w-12 text-red-400/40" />
        )}

        {/* Badge DELETADO */}
        <div className="absolute top-2 right-2">
          <Badge className="bg-red-600 text-white font-bold border-red-400 shadow-lg">
            🗑️ DELETADO
          </Badge>
        </div>
      </div>

      {/* Informações do produto */}
      <div className="p-4 space-y-3">
        {/* Nome e Categoria */}
        <div>
          <h3 className="font-semibold text-gray-100 line-clamp-2 text-sm">
            {product.name}
          </h3>
          <p className="text-xs text-gray-400 mt-1">{product.category}</p>
        </div>

        {/* Código de Barras */}
        {product.barcode && (
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <BarcodeIcon className="h-3 w-3" />
            <span>{product.barcode}</span>
          </div>
        )}

        {/* Preço */}
        <div className="text-lg font-bold text-green-400">
          {formatCurrency(product.price)}
        </div>

        {/* Estoque no momento da exclusão */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-2">
            <div className="flex items-center gap-1 mb-1">
              <Box className="h-3 w-3 text-blue-400" />
              <span className="text-xs text-blue-400">Pacotes</span>
            </div>
            <p className="text-base font-bold text-blue-400">
              {product.stock_packages || 0}
            </p>
          </div>

          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-2">
            <div className="flex items-center gap-1 mb-1">
              <Package className="h-3 w-3 text-green-400" />
              <span className="text-xs text-green-400">Unidades</span>
            </div>
            <p className="text-base font-bold text-green-400">
              {product.stock_units_loose || 0}
            </p>
          </div>
        </div>

        {/* Info da exclusão */}
        <div className="pt-3 border-t border-gray-700/50 space-y-2">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Calendar className="h-3 w-3" />
            <span>Deletado em: {deletedDate}</span>
          </div>

          {product.deleted_by && (
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <User className="h-3 w-3" />
              <span>Por: {product.deleted_by.substring(0, 8)}...</span>
            </div>
          )}
        </div>

        {/* Botão Restaurar */}
        <div className="pt-2">
          <Button
            onClick={() => onRestore(product)}
            disabled={isRestoring}
            size="sm"
            className="w-full bg-green-600 hover:bg-green-700 text-white transition-all duration-200"
          >
            {isRestoring ? (
              <>
                <AlertTriangle className="h-3 w-3 mr-1 animate-spin" />
                Restaurando...
              </>
            ) : (
              <>
                <RotateCcw className="h-3 w-3 mr-1" />
                Restaurar Produto
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DeletedProductCard;
