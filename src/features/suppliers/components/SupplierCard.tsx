/**
 * Componente de card para exibir informações de um fornecedor
 */

import React, { useState } from 'react';
import { 
  Building2, 
  Phone, 
  Mail, 
  MessageCircle, 
  Clock, 
  CreditCard, 
  DollarSign,
  Package,
  Edit,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/shared/ui/primitives/card';
import { Button } from '@/shared/ui/primitives/button';
import { Badge } from '@/shared/ui/primitives/badge';
import { SwitchAnimated } from '@/shared/ui/primitives/switch-animated';
import { useAuth } from '@/app/providers/AuthContext';
import { useToggleSupplierStatus, useDeleteSupplier } from '../hooks/useSuppliers';
import { SupplierForm } from './SupplierForm';
import { cn } from '@/core/config/utils';
import { formatCurrency } from '@/core/config/utils';
import type { Supplier } from '../types';

interface SupplierCardProps {
  supplier: Supplier;
  className?: string;
}

export const SupplierCard: React.FC<SupplierCardProps> = ({ supplier, className }) => {
  const { userRole } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const toggleStatus = useToggleSupplierStatus();
  const deleteSupplier = useDeleteSupplier();
  
  const handleToggleStatus = () => {
    toggleStatus.mutate({
      id: supplier.id,
      isActive: !supplier.is_active,
    });
  };
  
  const handleDelete = () => {
    if (showDeleteConfirm) {
      deleteSupplier.mutate(supplier.id);
      setShowDeleteConfirm(false);
    } else {
      setShowDeleteConfirm(true);
      // Reset após 3 segundos
      setTimeout(() => setShowDeleteConfirm(false), 3000);
    }
  };
  
  const getContactInfo = () => {
    const contacts = [];
    if (supplier.contact_info?.phone) {
      contacts.push({ type: 'phone', value: supplier.contact_info.phone, icon: Phone });
    }
    if (supplier.contact_info?.whatsapp) {
      contacts.push({ type: 'whatsapp', value: supplier.contact_info.whatsapp, icon: MessageCircle });
    }
    if (supplier.contact_info?.email) {
      contacts.push({ type: 'email', value: supplier.contact_info.email, icon: Mail });
    }
    return contacts;
  };
  
  const contacts = getContactInfo();
  
  return (
    <>
      <Card className={cn(
        "group relative overflow-hidden transition-all duration-300",
        "hover:shadow-lg hover:shadow-yellow-500/10",
        "bg-black/40 backdrop-blur-xl border border-white/5",
        "h-[360px] flex flex-col",
        !supplier.is_active && "opacity-60",
        className
      )}>
        <CardHeader className="pb-3 pt-5 px-5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="p-2.5 rounded-xl bg-zinc-900/50 border border-white/10 flex-shrink-0 backdrop-blur-sm group-hover:border-[#f9cb15]/50 group-hover:bg-[#f9cb15]/10 transition-colors">
                <Building2 className="h-5 w-5 text-zinc-400 group-hover:text-[#f9cb15] transition-colors" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-white text-lg truncate tracking-tight">
                  {supplier.company_name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  {supplier.is_active ? (
                    <Badge variant="outline" className="text-emerald-500 border-emerald-500/30 bg-emerald-500/10 backdrop-blur-sm h-5 px-2 text-[10px] uppercase tracking-wider font-semibold">
                      Ativo
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-zinc-500 border-zinc-500/30 bg-zinc-500/10 backdrop-blur-sm h-5 px-2 text-[10px] uppercase tracking-wider font-semibold">
                      Inativo
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            {/* Ações (visível apenas para admin) */}
            {userRole === 'admin' && (
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditModalOpen(true)}
                  className="h-8 w-8 p-0 hover:bg-white/10 hover:text-white rounded-lg transition-colors"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                
                <SwitchAnimated
                  checked={supplier.is_active}
                  onCheckedChange={handleToggleStatus}
                  disabled={toggleStatus.isPending}
                  size="sm"
                  variant="yellow"
                />
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col space-y-4 px-5 pb-5 overflow-hidden">
          {/* Divider */}
          <div className="h-px w-full bg-white/5" />

          {/* Seção 1: Contato compacto */}
          {contacts.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="text-xs text-zinc-500 flex items-center gap-1.5 font-medium uppercase tracking-wider">
                {contacts[0].icon && React.createElement(contacts[0].icon, { className: "h-3.5 w-3.5" })}
                Contato
              </div>
              <span className="text-sm text-zinc-300 truncate flex-1 font-medium">{contacts[0].value}</span>
            </div>
          )}
          
          {/* Seção 2: Produtos (linha única) */}
          {supplier.products_supplied && supplier.products_supplied.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-medium uppercase tracking-wider">
                <Package className="h-3.5 w-3.5" />
                Mix de Produtos
              </div>
              <div className="flex flex-wrap gap-1.5">
                {supplier.products_supplied.slice(0, 3).map((product, index) => (
                  <Badge key={index} variant="secondary" className="text-[11px] bg-zinc-900/80 border-white/5 text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors py-0.5 h-6">
                    {product}
                  </Badge>
                ))}
                {supplier.products_supplied.length > 3 && (
                  <Badge variant="secondary" className="text-[11px] bg-zinc-900/80 border-white/5 text-zinc-400 py-0.5 h-6">
                    +{supplier.products_supplied.length - 3}
                  </Badge>
                )}
              </div>
            </div>
          )}
          
          {/* Seção 3: Informações comerciais em grid compacto */}
          <div className="grid grid-cols-2 gap-4 py-2">
            {/* Prazo de entrega */}
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-medium uppercase tracking-wider">
                <Clock className="h-3.5 w-3.5" />
                Prazo
              </div>
              <p className="text-sm text-zinc-300 font-medium truncate">
                {supplier.delivery_time || 'N/A'}
              </p>
            </div>
            
            {/* Valor mínimo */}
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-medium uppercase tracking-wider">
                <DollarSign className="h-3.5 w-3.5" />
                Pedido Mín
              </div>
              <p className="text-sm text-zinc-300 font-medium truncate">
                {formatCurrency(supplier.minimum_order_value)}
              </p>
            </div>
          </div>
          
          {/* Spacer flexível */}
          <div className="flex-1"></div>
          
          {/* Rodapé com observações ou ações */}
          <div className="flex items-center justify-between pt-3 border-t border-white/5 min-h-[40px]">
             {/* Observações resumidas */}
            {supplier.notes ? (
                <div className="flex items-center gap-2 max-w-[70%]">
                   <div className="w-1.5 h-1.5 rounded-full bg-[#f9cb15]" />
                   <p className="text-xs text-zinc-500 truncate" title={supplier.notes}>
                     {supplier.notes}
                   </p>
                </div>
            ) : <div />}

            {/* Ação de Remover (Admin) */}
            {userRole === 'admin' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className={cn(
                  "h-7 px-2 text-xs ml-auto transition-colors",
                  showDeleteConfirm 
                    ? "text-red-400 hover:text-red-300 hover:bg-red-500/10 bg-red-500/5" 
                    : "text-zinc-600 hover:text-zinc-400 hover:bg-white/5 opacity-0 group-hover:opacity-100"
                )}
              >
                <Trash2 className="h-3.5 w-3.5 mr-1" />
                {showDeleteConfirm ? 'Confirmar' : 'Remover'}
              </Button>
            )}
          </div>

        </CardContent>
      </Card>
      
      {/* Modal de edição */}
      <SupplierForm
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        mode="edit"
        supplier={supplier}
      />
    </>
  );
};