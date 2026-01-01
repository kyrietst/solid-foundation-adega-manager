import React from 'react';
import { Badge } from '@/shared/ui/primitives/badge';
import { CheckCircle, AlertTriangle, XCircle, Clock } from 'lucide-react';

interface FiscalStatusBadgeProps {
  status: string | null | undefined;
}

export const FiscalStatusBadge: React.FC<FiscalStatusBadgeProps> = ({ status }) => {
  if (!status) return null;

  switch (status.toLowerCase()) {
    case 'authorized':
      return (
        <Badge className="bg-green-500/20 text-green-400 border-green-500/30 flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          Autorizada
        </Badge>
      );
    case 'rejected':
      return (
        <Badge className="bg-red-500/20 text-red-400 border-red-500/30 flex items-center gap-1">
          <XCircle className="h-3 w-3" />
          Rejeitada
        </Badge>
      );
    case 'pending':
    case 'processing':
      return (
        <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Processando
        </Badge>
      );
    case 'cancelled':
      return (
        <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30 flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          Cancelada
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="text-gray-400 border-gray-600">
          {status}
        </Badge>
      );
  }
};
